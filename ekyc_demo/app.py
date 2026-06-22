"""
DeepGuard eKYC — Streamlit demo cho DEV đang tích hợp API.

Mô phỏng màn của một dev xây giao diện eKYC: nhập API key, chọn 1 trong 3 mode
(Liveness / Deepfake / eKYC), upload ẢNH hoặc VIDEO → gọi API thật và xem response.

Key: ưu tiên ô nhập trên sidebar; nếu trống → lấy DEEPGUARD_API_KEY trong .env.

Video:
- Liveness: model là ảnh tĩnh → demo trích N khung (cv2) rồi gọi /v1/detect/liveness từng
  khung và GỘP majority-vote (mô tả rõ là gộp phía client).
- Deepfake: gọi thẳng /v1/detect/video sẵn có ở backend.

Chạy:  streamlit run app.py
"""
import os
import base64
import tempfile
import requests
import streamlit as st
import cv2
from datetime import datetime
from dotenv import load_dotenv

load_dotenv(override=True)   # nạp lại .env mỗi lần chạy → "Ghi nhớ key" có hiệu lực ngay sau reload

DEFAULT_API_URL = os.getenv("DEEPGUARD_API_URL", "http://localhost:8000")
ENV_API_KEY = os.getenv("DEEPGUARD_API_KEY", "")

IMAGE_TYPES = ["jpg", "jpeg", "png", "webp", "bmp"]
VIDEO_TYPES = ["mp4", "mov", "avi", "webm", "mkv"]

VERDICT_COLOR = {
    "LIVE": "#2e7d32", "REAL": "#2e7d32", "PASS": "#2e7d32",
    "SPOOF": "#ba1a1a", "FAKE": "#ba1a1a", "FAIL": "#ba1a1a",
    "UNCERTAIN": "#ed6c02", "REVIEW": "#ed6c02",
}

st.set_page_config(page_title="DeepGuard eKYC — Dev Demo", page_icon="🛡️", layout="wide")

# ───────────────────────────── Sidebar: cấu hình ─────────────────────────────
st.sidebar.title("🛡️ DeepGuard eKYC")
st.sidebar.caption("Demo tích hợp API cho dev")

# Chọn môi trường API: Local vs Deploy (deploy qua nginx → bắt buộc prefix /api)
ENV_PRESETS = {
    "Local — localhost:8000": "http://localhost:8000",
    "Deploy — deepguard.ddns.net": "https://deepguard.ddns.net/api",
    "Custom…": None,
}
_preset_idx = next((i for i, v in enumerate(ENV_PRESETS.values()) if v == DEFAULT_API_URL), 0)
_env_label = st.sidebar.selectbox("Môi trường API", list(ENV_PRESETS.keys()), index=_preset_idx)
if ENV_PRESETS[_env_label] is None:
    api_url = st.sidebar.text_input("API base URL (custom)", value=DEFAULT_API_URL).rstrip("/")
else:
    api_url = ENV_PRESETS[_env_label].rstrip("/")
st.sidebar.caption("⚠️ Deploy dùng prefix `/api`; API key phải tạo TRÊN deploy (DB riêng — key local không dùng được).")

input_key = st.sidebar.text_input("API Key", type="password",
                                  placeholder="dán key ở đây (ưu tiên)")

# Resolve key: ô nhập trước, .env sau
api_key = input_key.strip() or ENV_API_KEY
key_source = "ô nhập" if input_key.strip() else (".env" if ENV_API_KEY else None)
if api_key:
    st.sidebar.success(f"Key …{api_key[-6:]} · nguồn: **{key_source}**")
else:
    st.sidebar.error("Chưa có API key. Nhập ô trên hoặc đặt DEEPGUARD_API_KEY trong .env")

# Ghi nhớ key vào .env (đã gitignore) → reload không phải nhập lại. Streamlit không có localStorage.
if input_key.strip():
    if st.sidebar.button("💾 Ghi nhớ key vào .env"):
        _env_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env")
        _lines = []
        if os.path.exists(_env_path):
            with open(_env_path) as _f:
                _lines = [ln for ln in _f.read().splitlines() if not ln.startswith("DEEPGUARD_API_KEY=")]
        _lines.append(f"DEEPGUARD_API_KEY={input_key.strip()}")
        with open(_env_path, "w") as _f:
            _f.write("\n".join(_lines) + "\n")
        st.sidebar.success("Đã lưu vào .env — lần sau reload tự nạp, khỏi nhập lại.")

mode = st.sidebar.radio("Mode", ["Liveness", "Deepfake", "eKYC (cascade)"], index=2)
model_choice = st.sidebar.selectbox(
    "Model deepfake", ["sfdct", "b4", "hff"],
    format_func=lambda m: {"sfdct": "SFDCT · B4+block-DCT (0.7572)",
                           "b4": "B4 · spatial baseline (0.7497)",
                           "hff": "SFDCT-HFF · R3 (0.7695)"}[m],
    help="Áp dụng cho deepfake ẢNH; video dùng model mặc định của server.")
n_frames = st.sidebar.slider("Số khung lấy từ video (liveness)", 3, 12, 6)
use_threshold = st.sidebar.checkbox("Tự đặt threshold (override server)", value=False)
threshold = st.sidebar.slider("Threshold", 0.0, 1.0, 0.35, 0.01,
                              disabled=not use_threshold,
                              help="Liveness: P(live) < threshold ⇒ SPOOF. Deepfake: ngưỡng phân loại FAKE.")

st.sidebar.divider()
st.sidebar.caption("Crop mặt (MTCNN) chạy ở **backend** — client chỉ gửi ảnh/khung thô.")

# ───────────────────────────── API helpers ─────────────────────────────
def _headers():
    return {"Authorization": f"Bearer {api_key}"}

def _params():
    return {"threshold": threshold} if use_threshold else {}

def call_liveness(img_bytes, filename, mime):
    r = requests.post(f"{api_url}/v1/detect/liveness", headers=_headers(),
                      files={"file": (filename, img_bytes, mime)},
                      params={**_params(), "debug": "true"}, timeout=60)
    r.raise_for_status()
    return r.json()

def call_deepfake(img_bytes, filename, mime):
    r = requests.post(f"{api_url}/v1/detect/image", headers=_headers(),
                      files={"file": (filename, img_bytes, mime)},
                      params={**_params(), "model": model_choice}, timeout=120)
    r.raise_for_status()
    return r.json()

def call_deepfake_video(video_bytes, filename, mime):
    r = requests.post(f"{api_url}/v1/detect/video", headers=_headers(),
                      files={"file": (filename, video_bytes, mime)}, timeout=300)
    r.raise_for_status()
    return r.json()

def call_result(request_id):
    # GET /v1/results/{id} — tra lại 1 kết quả deepfake theo request_id (auth API key)
    r = requests.get(f"{api_url}/v1/results/{request_id}", headers=_headers(), timeout=30)
    r.raise_for_status()
    return r.json()

# ───────────────────────────── Video frame extraction ─────────────────────────────
def extract_frames(video_bytes, n):
    """Trích n khung đều nhau từ video → list jpeg bytes (cv2, BGR→JPEG đúng màu)."""
    suffix = ".mp4"
    with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tf:
        tf.write(video_bytes)
        path = tf.name
    frames = []
    try:
        cap = cv2.VideoCapture(path)
        total = int(cap.get(cv2.CAP_PROP_FRAME_COUNT)) or 0
        idxs = set(list(range(0, total, max(1, total // n)))[:n]) if total > 0 else None
        i, picked = 0, 0
        while picked < n:
            ret, frame = cap.read()
            if not ret:
                break
            if idxs is None or i in idxs:
                ok, buf = cv2.imencode(".jpg", frame, [cv2.IMWRITE_JPEG_QUALITY, 90])
                if ok:
                    frames.append(buf.tobytes())
                    picked += 1
            i += 1
        cap.release()
    finally:
        os.unlink(path)
    return frames

def call_liveness_video(video_bytes, n):
    """Gộp liveness trên N khung (majority-vote). Trả (aggregate_dict, per_frame_list)."""
    frames = extract_frames(video_bytes, n)
    if not frames:
        raise RuntimeError("Không trích được khung hình từ video (codec không hỗ trợ?)")
    per_frame = [call_liveness(fb, f"frame_{i}.jpg", "image/jpeg") for i, fb in enumerate(frames)]
    scores = [r.get("liveness_score", 0.0) for r in per_frame]
    confs = [r.get("confidence", 0.0) for r in per_frame]
    n_spoof = sum(1 for r in per_frame if r.get("verdict") == "SPOOF")
    n_live = sum(1 for r in per_frame if r.get("verdict") == "LIVE")
    agg_verdict = "SPOOF" if n_spoof > n_live else ("LIVE" if n_live > n_spoof else "UNCERTAIN")
    spoof_types = [r.get("spoof_type") for r in per_frame if r.get("spoof_type")]
    agg = {
        "verdict": agg_verdict,
        "liveness_score": sum(scores) / len(scores),
        "confidence": sum(confs) / len(confs),
        "spoof_type": max(set(spoof_types), key=spoof_types.count) if (spoof_types and agg_verdict != "LIVE") else None,
        "threshold_used": per_frame[0].get("threshold_used"),
        "mode": f"video · gộp {len(per_frame)} khung (client)",
        "frame_count": len(per_frame),
        "processing_time_ms": sum(r.get("processing_time_ms", 0) for r in per_frame),
        "model_version": per_frame[0].get("model_version"),
    }
    return agg, per_frame

# ───────────────────────────── Render helpers ─────────────────────────────
def show_b64(data_url, caption):
    if not data_url:
        st.caption(f"({caption}: không có)")
        return
    try:
        b64 = data_url.split(",", 1)[1] if "," in data_url else data_url
        st.image(base64.b64decode(b64), caption=caption, use_container_width=True)
    except Exception as e:  # noqa: BLE001
        st.caption(f"(không hiển thị được {caption}: {e})")

def verdict_badge(label):
    color = VERDICT_COLOR.get(str(label).upper(), "#64748b")
    st.markdown(f"<span style='font-size:2.2rem;font-weight:800;color:{color}'>{label}</span>",
                unsafe_allow_html=True)

def _explain_deepfake(res):
    pf = res.get("prob_fake") or 0.0
    thr = res.get("threshold_used") or 0.35
    rs = res.get("risk_score") or 0.0
    th = res.get("thresholds") or {"low": 0.3, "high": 0.7}
    with st.expander("🔍 Vì sao ra verdict / decision này?", expanded=True):
        st.markdown(
            f"**Verdict (FAKE/REAL)** — so `prob_fake` với `threshold_used` (vùng lưỡng lự ±0.10):\n"
            f"- prob_fake = **{pf:.4f}** · threshold = **{thr:.2f}**\n"
            f"- REAL nếu ≤ **{thr - 0.10:.2f}** · FAKE nếu ≥ **{thr + 0.10:.2f}** · ở giữa → UNCERTAIN\n"
            f"- ⇒ **{res.get('verdict')}**\n\n"
            f"**Decision hint** — so `risk_score` với band rủi ro:\n"
            f"- risk_score = **{rs:.4f}** · band: low < **{th.get('low')}** / high ≥ **{th.get('high')}**\n"
            f"- ⇒ band **{res.get('risk_band')}** → **{str(res.get('decision_hint')).upper()}**"
        )

def _explain_liveness(res):
    sc = res.get("liveness_score") or 0.0
    thr = res.get("threshold_used") or 0.0
    with st.expander("🔍 Vì sao ra verdict này?", expanded=True):
        md = (
            f"- P(live) = **{sc:.4f}** · threshold = **{thr:.3f}**\n"
            f"- LIVE nếu P(live) ≥ threshold · SPOOF nếu < threshold (margin = 0)\n"
            f"- ⇒ **{res.get('verdict')}**"
        )
        if res.get("spoof_type"):
            md += f"\n- spoof_type (heuristic): **{res['spoof_type']}**"
        st.markdown(md)
        aa = res.get("attack_analysis")
        if aa:
            sca = aa.get("scores", {})
            st.markdown(
                f"**Print vs Screen** (heuristic): print=**{sca.get('print')}** · "
                f"screen=**{sca.get('screen')}** → **{aa.get('attack_type')}** "
                f"(conf {aa.get('confidence')}; unknown nếu điểm cao nhất < 0.25)"
            )
            ev = aa.get("evidence", {})
            if ev:
                st.caption("Bằng chứng: " + " · ".join(f"{k}={v}" for k, v in ev.items()))

def render_liveness(res, per_frame=None):
    verdict_badge(res.get("verdict", "—"))
    c1, c2, c3 = st.columns(3)
    c1.metric("Liveness score", f"{res.get('liveness_score', 0) * 100:.1f}%")
    c2.metric("Confidence", f"{res.get('confidence', 0):.1f}%")
    c3.metric("Latency", f"{res.get('processing_time_ms', 0)} ms")
    if res.get("spoof_type"):
        st.error(f"Spoof type (heuristic): **{res['spoof_type']}**")
    st.caption(f"model: {res.get('model_version')} · threshold: {res.get('threshold_used')} · mode: {res.get('mode')}")
    _explain_liveness(res)
    if per_frame:
        with st.expander(f"Điểm từng khung ({len(per_frame)})"):
            st.table([{"#": i, "verdict": r.get("verdict"),
                       "liveness_score": round(r.get("liveness_score", 0), 4)}
                      for i, r in enumerate(per_frame)])

def render_deepfake(res):
    verdict_badge(res.get("verdict", "—"))
    c1, c2, c3 = st.columns(3)
    c1.metric("Risk score", f"{res.get('risk_score', 0) * 100:.1f}%", help="P(deepfake) đã calibrate")
    c2.metric("Decision hint", str(res.get("decision_hint", "—")).upper())
    c3.metric("Latency", f"{res.get('processing_time_ms', 0)} ms")
    st.caption(f"risk_band: {res.get('risk_band')} · prob_fake: {res.get('prob_fake')} · model: {res.get('model_version')}")
    _explain_deepfake(res)
    g1, g2 = st.columns(2)
    with g1:
        show_b64(res.get("heatmap"), "Grad-CAM (vùng nghi)")
    with g2:
        show_b64(res.get("frequency"), "Phổ DCT")

def render_deepfake_video(res):
    verdict_badge(res.get("verdict", "—"))
    c1, c2, c3 = st.columns(3)
    c1.metric("Prob fake (gộp)", f"{res.get('prob_fake', 0) * 100:.1f}%")
    c2.metric("Frames fake", f"{res.get('frames_fake', 0)}/{res.get('frames_analyzed', 0)}")
    c3.metric("Latency", f"{res.get('processing_time_ms', 0)} ms")
    st.caption(f"confidence: {res.get('confidence')} · model: {res.get('model_version')}")

def render_deepfake_any(res):
    (render_deepfake_video if "frames_analyzed" in res else render_deepfake)(res)

def deepfake_decision(res):
    """PASS/REVIEW/FAIL từ kết quả deepfake (ảnh dùng decision_hint, video dùng verdict)."""
    if "decision_hint" in res:
        return {"pass": "PASS", "review": "REVIEW", "reject": "FAIL"}.get(res.get("decision_hint"), "REVIEW")
    return {"REAL": "PASS", "FAKE": "FAIL", "UNCERTAIN": "REVIEW"}.get(res.get("verdict"), "REVIEW")

# Lịch sử phiên (client-side — API key không có endpoint list detections)
st.session_state.setdefault("history", [])

def _hist(mode, ident, verdict, score):
    st.session_state["history"].append({
        "time": datetime.now().strftime("%H:%M:%S"),
        "mode": mode,
        "verdict": verdict or "—",
        "score": f"{score:.3f}" if isinstance(score, (int, float)) else "—",
        "id": str(ident) if ident is not None else "—",
    })

# ───────────────────────────── Main ─────────────────────────────
st.title("DeepGuard eKYC — Dev Integration Demo")
st.caption(f"Mode: **{mode}** · endpoint: `{api_url}`")

left, right = st.columns([5, 7])

with left:
    st.subheader("Đầu vào")
    up = st.file_uploader("Ảnh hoặc video khuôn mặt", type=IMAGE_TYPES + VIDEO_TYPES)
    media_is_video = False
    if up:
        ext = (up.name.rsplit(".", 1)[-1] or "").lower()
        media_is_video = (up.type or "").startswith("video") or ext in VIDEO_TYPES
        if media_is_video:
            st.video(up)
            st.caption(f"Video · liveness sẽ gộp {n_frames} khung; deepfake gọi /detect/video.")
        else:
            st.image(up, caption=up.name, use_container_width=True)
    run = st.button("▶ Chạy kiểm tra", type="primary",
                    disabled=not (api_key and up), use_container_width=True)
    if not api_key:
        st.caption("⚠️ Cần API key để chạy.")

with right:
    st.subheader("Kết quả")
    if run:
        data = up.getvalue()
        mime = up.type or ("video/mp4" if media_is_video else "image/jpeg")
        try:
            with st.spinner("Đang gọi API…"):
                if mode == "Liveness":
                    if media_is_video:
                        agg, pf = call_liveness_video(data, n_frames)
                        render_liveness(agg, per_frame=pf)
                        _hist("Liveness·video", "—", agg.get("verdict"), agg.get("liveness_score"))
                        with st.expander("Response JSON (gộp + từng khung)"):
                            st.json({"aggregate": agg, "frames": pf})
                    else:
                        res = call_liveness(data, up.name, mime)
                        render_liveness(res)
                        _hist("Liveness", res.get("check_id"), res.get("verdict"), res.get("liveness_score"))
                        with st.expander("Response JSON"):
                            st.json(res)

                elif mode == "Deepfake":
                    res = call_deepfake_video(data, up.name, mime) if media_is_video \
                        else call_deepfake(data, up.name, mime)
                    render_deepfake_any(res)
                    _hist("Deepfake", res.get("request_id") or res.get("job_id"),
                          res.get("verdict"), res.get("risk_score", res.get("prob_fake")))
                    with st.expander("Response JSON"):
                        st.json(res)

                else:  # eKYC cascade: liveness trước, LIVE mới chạy deepfake
                    if media_is_video:
                        live_res, pf = call_liveness_video(data, n_frames)
                    else:
                        live_res, pf = call_liveness(data, up.name, mime), None
                    stopped = live_res.get("verdict") == "SPOOF"
                    if stopped:
                        df_res = None
                    elif media_is_video:
                        df_res = call_deepfake_video(data, up.name, mime)
                    else:
                        df_res = call_deepfake(data, up.name, mime)

                    # Quyết định eKYC
                    if stopped:
                        final, reason = "FAIL", "Presentation attack (liveness = SPOOF) — chặn ngay, không chạy deepfake."
                    elif df_res is None:
                        final, reason = "REVIEW", "Liveness không phải LIVE rõ ràng — cần người duyệt."
                    else:
                        final = deepfake_decision(df_res)
                        reason = f"Liveness {live_res.get('verdict')} → Deepfake → {final}."

                    st.subheader("Kết quả eKYC")
                    verdict_badge(final)
                    st.info(reason)
                    _hist("eKYC", (df_res or {}).get("request_id") or live_res.get("check_id"),
                          final, (df_res or {}).get("risk_score"))
                    st.markdown("##### Bước 1 · Liveness (bộ lọc chạy trước)")
                    render_liveness(live_res, per_frame=pf)
                    st.markdown("##### Bước 2 · Deepfake")
                    if stopped:
                        st.warning("Bỏ qua — đã bị chặn ở bước liveness.")
                    elif df_res is not None:
                        render_deepfake_any(df_res)
                    with st.expander("Response JSON (liveness + deepfake)"):
                        st.json({"liveness": live_res, "deepfake": df_res})

        except requests.HTTPError as e:
            st.error(f"API lỗi {e.response.status_code}: {e.response.text[:300]}")
        except requests.RequestException as e:
            st.error(f"Không gọi được API ({api_url}). Stack đã chạy chưa? Chi tiết: {e}")
        except Exception as e:  # noqa: BLE001
            st.error(f"Lỗi: {e}")
    else:
        st.caption("Nhập key, chọn mode, upload ảnh/video rồi bấm **Chạy kiểm tra**.")

st.divider()
hist_col, lookup_col = st.columns([7, 5])
with hist_col:
    st.subheader("Lịch sử phiên này")
    st.caption("Client tự lưu các lần chạy trong phiên (API key không có endpoint list).")
    if st.session_state["history"]:
        st.table(list(reversed(st.session_state["history"])))
        if st.button("Xóa lịch sử phiên"):
            st.session_state["history"] = []
            st.rerun()
    else:
        st.caption("— Chưa có lần chạy nào.")
with lookup_col:
    st.subheader("Tra cứu theo request_id")
    st.caption("GET /v1/results/{id} — chỉ áp dụng cho deepfake (request_id).")
    rid = st.text_input("request_id", key="lookup_rid")
    if st.button("Tra cứu", disabled=not (api_key and rid.strip())):
        try:
            res = call_result(rid.strip())
            render_deepfake_any(res)
            with st.expander("Response JSON"):
                st.json(res)
        except requests.HTTPError as e:
            st.error(f"Lỗi {e.response.status_code}: {e.response.text[:200]}")
        except requests.RequestException as e:
            st.error(f"Không gọi được API: {e}")

with st.expander("cURL tương đương (ảnh)"):
    ep = {"Liveness": "/v1/detect/liveness", "Deepfake": "/v1/detect/image",
          "eKYC (cascade)": "/v1/detect/liveness  → /v1/detect/image"}[mode]
    st.code(
        f"curl -X POST '{api_url}{ep.split()[0]}' \\\n"
        f"  -H 'Authorization: Bearer <API_KEY>' \\\n"
        f"  -F 'file=@face.jpg'",
        language="bash",
    )
