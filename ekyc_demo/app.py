"""DeepGuard eKYC — Streamlit demo (Light · Modern UI)
Chạy: streamlit run app.py"""
import os, base64, tempfile, requests, streamlit as st, cv2
from datetime import datetime
from dotenv import load_dotenv

# ════════════════════════════════════════════════════════════════════════════
# I18N — bounded keys only (sidebar, mode names, run button, result headers)
# ════════════════════════════════════════════════════════════════════════════
T: dict[str, dict[str, str]] = {
    # sidebar section labels
    "sidebar.config":           {"vi": "⚙️ Cấu hình",             "en": "⚙️ Config"},
    "sidebar.mode":             {"vi": "🎯 Chế độ",                "en": "🎯 Mode"},
    # mode names (used as radio options)
    "mode.liveness":            {"vi": "🧬 Liveness",              "en": "🧬 Liveness"},
    "mode.deepfake":            {"vi": "🔍 Deepfake",              "en": "🔍 Deepfake"},
    "mode.ekyc":                {"vi": "🏛️ eKYC Cascade",         "en": "🏛️ eKYC Cascade"},
    # run button
    "btn.run":                  {"vi": "▶  Chạy kiểm tra",         "en": "▶  Run check"},
    # result section headers
    "result.header":            {"vi": "Kết quả",                  "en": "Results"},
    "result.liveness":          {"vi": "Kết quả Liveness",         "en": "Liveness Result"},
    "result.deepfake":          {"vi": "Kết quả Deepfake",         "en": "Deepfake Result"},
    "result.step1":             {"vi": "**Bước 1 · Liveness**",    "en": "**Step 1 · Liveness**"},
    "result.step2":             {"vi": "**Bước 2 · Deepfake**",    "en": "**Step 2 · Deepfake**"},
    # language toggle label
    "lang.toggle":              {"vi": "🌐 Ngôn ngữ",              "en": "🌐 Language"},
}

def tr(key: str) -> str:
    """Translate key using current session locale. Falls back to key."""
    loc = st.session_state.get("locale", "vi")
    return T.get(key, {}).get(loc, key)

load_dotenv(override=True)
DEFAULT_API_URL = os.getenv("DEEPGUARD_API_URL", "http://localhost:8000")
ENV_API_KEY     = os.getenv("DEEPGUARD_API_KEY", "")
IMAGE_TYPES     = ["jpg", "jpeg", "png", "webp", "bmp"]
VIDEO_TYPES     = ["mp4", "mov", "avi", "webm", "mkv"]

st.set_page_config(
    page_title="DeepGuard eKYC",
    page_icon="🛡️",
    layout="wide",
    initial_sidebar_state="expanded",
)

# Initialise locale default (must run before any tr() call)
st.session_state.setdefault("locale", "vi")

# ════════════════════════════════════════════════════════════════════════════
# DESIGN TOKENS
# ════════════════════════════════════════════════════════════════════════════
# Palette: slate base + indigo accent + semantic colors
PRIMARY    = "#4f46e5"   # indigo-600
PRIMARY_D  = "#4338ca"
ACCENT     = "#0ea5e9"   # sky-500
INK        = "#0f172a"   # slate-900
MUTED      = "#64748b"   # slate-500
LINE       = "#e2e8f0"   # slate-200
SURFACE    = "#ffffff"
SURFACE_2  = "#f8fafc"   # slate-50
SURFACE_3  = "#f1f5f9"   # slate-100

SEM = {  # semantic
    "success": "#059669", "success_bg": "#ecfdf5", "success_bd": "#a7f3d0",
    "warn":    "#d97706", "warn_bg":    "#fffbeb", "warn_bd":    "#fde68a",
    "danger":  "#dc2626", "danger_bg":  "#fef2f2", "danger_bd":  "#fecaca",
    "info":    "#2563eb", "info_bg":    "#eff6ff", "info_bd":    "#bfdbfe",
}

st.markdown(f"""
<style>
/* ─── base ─────────────────────────────────────────────────────────────── */
:root {{
  --primary: {PRIMARY};
  --primary-d: {PRIMARY_D};
  --ink: {INK};
  --muted: {MUTED};
  --line: {LINE};
}}
html, body, [class*="css"] {{
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  color: {INK};
}}
.stApp {{
  background:
    radial-gradient(1200px 600px at 90% -10%, #eef2ff 0%, transparent 60%),
    radial-gradient(900px 500px at -10% 10%, #f0f9ff 0%, transparent 55%),
    {SURFACE_2};
}}

/* hide chrome */
#MainMenu, footer {{ visibility: hidden; }}

/* ─── typography ───────────────────────────────────────────────────────── */
h1, h2, h3 {{ color: {INK}!important; letter-spacing: -0.02em; }}
.stMarkdown p {{ color: #334155; }}

/* ─── sidebar ──────────────────────────────────────────────────────────── */
[data-testid="stSidebar"] {{
  background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)!important;
  border-right: 1px solid {LINE}!important;
}}
[data-testid="stSidebar"] > div {{ padding-top: 8px; }}
[data-testid="stSidebar"] .stSelectbox label,
[data-testid="stSidebar"] .stRadio label,
[data-testid="stSidebar"] .stSlider label,
[data-testid="stSidebar"] .stCheckbox label,
[data-testid="stSidebar"] .stTextInput label {{
  color: {MUTED}!important;
  font-size: 11px!important;
  font-weight: 600!important;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 4px;
}}
[data-testid="stSidebar"] input,
[data-testid="stSidebar"] [data-baseweb="select"] > div {{
  background: {SURFACE}!important;
  border: 1px solid {LINE}!important;
  border-radius: 8px!important;
  color: {INK}!important;
  box-shadow: 0 1px 2px rgba(15,23,42,0.04)!important;
}}
[data-testid="stSidebar"] input:focus {{
  border-color: {PRIMARY}!important;
  box-shadow: 0 0 0 3px rgba(79,70,229,0.12)!important;
}}
[data-testid="stSidebar"] hr {{ border-color: {LINE}!important; margin: 14px 0; }}

/* radio as segmented pills */
[data-testid="stSidebar"] [role="radiogroup"] {{ gap: 6px; }}
[data-testid="stSidebar"] [role="radiogroup"] [role="radio"] {{
  background: {SURFACE}; border: 1px solid {LINE}; border-radius: 8px;
  padding: 8px 12px; transition: all .15s;
}}
[data-testid="stSidebar"] [role="radiogroup"] [role="radio"][aria-checked="true"] {{
  background: {PRIMARY}; border-color: {PRIMARY}; color: white;
  box-shadow: 0 4px 12px rgba(79,70,229,0.25);
}}
[data-testid="stSidebar"] [role="radiogroup"] [role="radio"][aria-checked="true"] span {{
  color: white!important;
}}

/* ─── buttons ──────────────────────────────────────────────────────────── */
.stButton > button {{
  border-radius: 10px!important;
  font-weight: 600!important;
  transition: all .15s ease!important;
}}
.stButton > button[kind="primary"] {{
  background: linear-gradient(135deg, {PRIMARY} 0%, {ACCENT} 100%)!important;
  color: white!important; border: none!important;
  font-size: 15px!important; padding: 12px 0!important;
  box-shadow: 0 8px 20px -4px rgba(79,70,229,0.4)!important;
}}
.stButton > button[kind="primary"]:hover {{
  transform: translateY(-1px)!important;
  box-shadow: 0 12px 24px -6px rgba(79,70,229,0.5)!important;
  filter: brightness(1.05)!important;
}}
.stButton > button[kind="primary"]:disabled {{
  opacity: 0.5; cursor: not-allowed; transform: none!important;
  box-shadow: none!important;
}}
.stButton > button[kind="secondary"] {{
  background: {SURFACE}!important;
  border: 1px solid {LINE}!important;
  color: #475569!important;
}}
.stButton > button[kind="secondary"]:hover {{
  border-color: {PRIMARY}!important; color: {PRIMARY}!important;
  background: #eef2ff!important;
}}

/* ─── uploader ─────────────────────────────────────────────────────────── */
[data-testid="stFileUploadDropzone"] {{
  background: {SURFACE}!important;
  border: 2px dashed {LINE}!important;
  border-radius: 14px!important;
  padding: 10px!important;
  transition: all .2s!important;
}}
[data-testid="stFileUploadDropzone"]:hover {{
  border-color: {PRIMARY}!important;
  background: #f5f3ff!important;
}}

/* ─── expander ─────────────────────────────────────────────────────────── */
[data-testid="stExpander"] {{
  border: 1px solid {LINE}!important;
  border-radius: 12px!important;
  background: {SURFACE}!important;
  box-shadow: 0 1px 3px rgba(15,23,42,0.05)!important;
  overflow: hidden;
}}
[data-testid="stExpander"] > div:first-child {{
  background: {SURFACE_2}!important;
  font-weight: 600!important;
  font-size: 13px!important;
}}

/* ─── table ────────────────────────────────────────────────────────────── */
[data-testid="stTable"] {{
  border-radius: 10px; overflow: hidden; border: 1px solid {LINE};
}}
[data-testid="stTable"] thead tr th {{
  background: {SURFACE_3}!important;
  color: {MUTED}!important;
  font-size: 11px!important; font-weight: 700!important;
  text-transform: uppercase; letter-spacing: 0.06em;
  border: none!important; padding: 10px 14px!important;
}}
[data-testid="stTable"] tbody tr td {{
  font-size: 13px!important; padding: 10px 14px!important;
  border-top: 1px solid {LINE}!important;
}}
[data-testid="stTable"] tbody tr:hover td {{ background: {SURFACE_2}!important; }}

/* ─── code block ───────────────────────────────────────────────────────── */
[data-testid="stCodeBlock"] {{
  border-radius: 10px!important; border: 1px solid {LINE}!important;
}}
[data-testid="stCodeBlock"] pre {{
  background: #0f172a!important; border-radius: 10px!important;
  font-size: 12px!important;
}}

/* ─── metric ───────────────────────────────────────────────────────────── */
[data-testid="stMetric"] {{
  background: {SURFACE}; border: 1px solid {LINE};
  border-radius: 12px; padding: 14px 16px;
  box-shadow: 0 1px 3px rgba(15,23,42,0.05);
}}
[data-testid="stMetricLabel"] {{ font-size: 11px!; color: {MUTED}!important;
  text-transform: uppercase; letter-spacing: 0.06em; font-weight: 600; }}
[data-testid="stMetricValue"] {{ color: {INK}!important; font-weight: 700!important; }}

/* ─── spinner ──────────────────────────────────────────────────────────── */
.stSpinner > div {{ border-color: {PRIMARY}!important; }}

/* ─── scrollbar ────────────────────────────────────────────────────────── */
::-webkit-scrollbar {{ width: 8px; height: 8px; }}
::-webkit-scrollbar-track {{ background: transparent; }}
::-webkit-scrollbar-thumb {{ background: #cbd5e1; border-radius: 4px; }}
::-webkit-scrollbar-thumb:hover {{ background: {MUTED}; }}

/* ─── shimmer skeleton ─────────────────────────────────────────────────── */
@keyframes shimmer {{
  0% {{ background-position: -468px 0; }}
  100% {{ background-position: 468px 0; }}
}}
.skeleton {{
  background: linear-gradient(90deg, {SURFACE_3} 0%, #e2e8f0 50%, {SURFACE_3} 100%);
  background-size: 800px 100%;
  animation: shimmer 1.4s infinite linear;
  border-radius: 8px;
}}
</style>
""", unsafe_allow_html=True)

# ════════════════════════════════════════════════════════════════════════════
# HTML PRIMITIVES
# ════════════════════════════════════════════════════════════════════════════
def card(body: str, title: str = "", accent: str = None):
    """Card container with optional title bar and left accent stripe."""
    accent_html = (
        f"<div style='position:absolute;left:0;top:0;bottom:0;width:3px;"
        f"background:{accent};border-radius:14px 0 0 14px'></div>"
        if accent else ""
    )
    hdr = (
        f"<div style='display:flex;align-items:center;gap:8px;margin-bottom:14px'>"
        f"<span style='color:{accent or PRIMARY};font-size:11px;font-weight:700;"
        f"text-transform:uppercase;letter-spacing:0.1em'>{title}</span>"
        f"<div style='flex:1;height:1px;background:{LINE}'></div></div>"
        if title else ""
    )
    st.markdown(
        f"<div style='position:relative;background:{SURFACE};border:1px solid {LINE};"
        f"border-radius:14px;padding:22px 24px;margin:10px 0;"
        f"box-shadow:0 1px 3px rgba(15,23,42,0.06),0 1px 2px rgba(15,23,42,0.04)'>"
        f"{accent_html}{hdr}{body}</div>",
        unsafe_allow_html=True,
    )

# Verdict visual mapping
_VMAP = {
    "LIVE":      ("success", "✅"),
    "REAL":      ("success", "✅"),
    "PASS":      ("success", "✅"),
    "SPOOF":     ("danger",  "🛑"),
    "FAKE":      ("danger",  "🛑"),
    "FAIL":      ("danger",  "🛑"),
    "UNCERTAIN": ("warn",    "⚠️"),
    "REVIEW":    ("warn",    "⚠️"),
}

def vbadge(label: str, sub: str = "", size: str = "lg"):
    """Large verdict badge with icon + sub-text."""
    v = str(label).upper()
    sem, icon = _VMAP.get(v, ("info", "❔"))
    col = SEM[f"{sem}"]; bg = SEM[f"{sem}_bg"]; bd = SEM[f"{sem}_bd"]
    sizes = {
        "lg": ("2.4rem", "2rem", "16px 28px", "2.2rem"),
        "md": ("1.8rem", "1.4rem", "12px 20px", "1.6rem"),
    }
    ico_fs, txt_fs, pad, sub_fs = sizes.get(size, sizes["lg"])
    sub_html = (
        f"<div style='color:{col};opacity:.75;font-size:13px;font-weight:500;"
        f"margin-top:4px;max-width:520px;line-height:1.4'>{sub}</div>"
        if sub else ""
    )
    return (
        f"<div style='display:inline-flex;align-items:center;gap:16px;padding:{pad};"
        f"background:{bg};border:1.5px solid {bd};border-radius:14px;margin:6px 0;"
        f"box-shadow:0 4px 12px -2px {col}22'>"
        f"<span style='font-size:{ico_fs};line-height:1'>{icon}</span>"
        f"<div><div style='color:{col};font-size:{txt_fs};font-weight:800;"
        f"line-height:1.1;letter-spacing:-0.01em'>{label}</div>{sub_html}</div></div>"
    )

def score_bar(label: str, val: float, invert: bool = False, max_label: str = ""):
    """Animated score bar with semantic colors."""
    pct = round(max(0, min(1, val)) * 100, 1)
    danger = val > 0.5 if not invert else val < 0.5
    mid = val > 0.3 if not invert else val < 0.7
    if danger:
        fill, txt = "#ef4444", SEM["danger"]
    elif mid:
        fill, txt = "#f59e0b", SEM["warn"]
    else:
        fill, txt = "#10b981", SEM["success"]
    side = f"<span style='color:{MUTED};font-size:11px;font-weight:500'>{max_label}</span>" if max_label else ""
    return (
        f"<div style='margin:14px 0'>"
        f"<div style='display:flex;justify-content:space-between;align-items:center;margin-bottom:6px'>"
        f"<span style='color:#334155;font-size:13px;font-weight:600'>{label}</span>"
        f"<span style='display:flex;align-items:center;gap:8px'>"
        f"{side}"
        f"<span style='color:{txt};font-size:14px;font-weight:800;font-variant-numeric:tabular-nums'>{pct}%</span>"
        f"</span></div>"
        f"<div style='background:{SURFACE_3};border-radius:8px;height:10px;overflow:hidden;"
        f"box-shadow:inset 0 1px 2px rgba(15,23,42,0.06)'>"
        f"<div style='width:{pct}%;height:100%;background:linear-gradient(90deg,{fill},{fill}cc);"
        f"border-radius:8px;transition:width .6s cubic-bezier(.22,1,.36,1);"
        f"box-shadow:0 0 8px {fill}55'></div></div></div>"
    )

def pills(**kw):
    """Stat pills row."""
    items = "".join(
        f"<div style='flex:1;min-width:100px;background:{SURFACE_2};border:1px solid {LINE};"
        f"border-radius:10px;padding:12px 14px;transition:all .15s'>"
        f"<div style='color:{MUTED};font-size:10px;font-weight:700;text-transform:uppercase;"
        f"letter-spacing:0.08em'>{k}</div>"
        f"<div style='color:{INK};font-size:1.1rem;font-weight:700;margin-top:4px;"
        f"font-variant-numeric:tabular-nums'>{v}</div></div>"
        for k, v in kw.items()
    )
    return f"<div style='display:flex;gap:10px;flex-wrap:wrap;margin:14px 0'>{items}</div>"

def info_box(msg: str, kind: str = "info"):
    _k = {"err": "danger", "ok": "success"}.get(kind, kind)
    bg = SEM[f"{_k}_bg"]; tc = SEM[_k]; bc = SEM[f"{_k}_bd"]
    icons = {"info": "ℹ️", "warn": "⚠️", "err": "⛔", "danger": "⛔", "ok": "✨", "success": "✅"}
    return (
        f"<div style='display:flex;gap:10px;align-items:flex-start;background:{bg};"
        f"border:1px solid {bc};border-radius:10px;padding:12px 16px;color:{tc};"
        f"font-size:13px;line-height:1.6;margin:8px 0'>"
        f"<span style='font-size:16px;line-height:1.4'>{icons.get(kind, 'ℹ️')}</span>"
        f"<div style='flex:1'>{msg}</div></div>"
    )

def _r(html: str):
    """Render một HTML primitive string (dùng cho các hàm trả về string)."""
    st.markdown(html, unsafe_allow_html=True)

def step_indicator(steps, current_idx):
    """Horizontal step indicator for eKYC cascade."""
    out = "<div style='display:flex;align-items:center;gap:6px;margin:12px 0 18px;flex-wrap:wrap'>"
    for i, (label, state) in enumerate(steps):
        # state: done / active / pending / skipped
        cfg = {
            "done":    (SEM["success"], SEM["success_bg"], "✓"),
            "active":  (PRIMARY, "#eef2ff", "•"),
            "pending": (MUTED, SURFACE_3, str(i + 1)),
            "skipped": (SEM["warn"], SEM["warn_bg"], "⤳"),
        }[state]
        col, bg, sym = cfg
        out += (
            f"<div style='display:flex;align-items:center;gap:8px'>"
            f"<div style='width:24px;height:24px;border-radius:50%;background:{bg};"
            f"color:{col};border:1.5px solid {col};display:flex;align-items:center;"
            f"justify-content:center;font-size:12px;font-weight:700'>{sym}</div>"
            f"<span style='color:{col};font-size:12px;font-weight:600'>{label}</span>"
            f"</div>"
        )
        if i < len(steps) - 1:
            out += f"<div style='flex:1;min-width:20px;height:1.5px;background:{LINE};margin:0 4px'></div>"
    out += "</div>"
    return out

def empty_state(icon: str, title: str, desc: str):
    st.markdown(
        f"<div style='text-align:center;padding:50px 20px'>"
        f"<div style='font-size:3.5rem;opacity:.5;margin-bottom:12px'>{icon}</div>"
        f"<div style='color:{INK};font-size:1.1rem;font-weight:700;margin-bottom:6px'>{title}</div>"
        f"<div style='color:{MUTED};font-size:13px;max-width:380px;margin:0 auto;line-height:1.5'>{desc}</div>"
        f"</div>",
        unsafe_allow_html=True,
    )

def show_b64(data_url: str, caption: str):
    if not data_url:
        return
    try:
        b = data_url.split(",", 1)[1] if "," in data_url else data_url
        st.image(base64.b64decode(b), caption=caption, use_container_width=True)
    except Exception:
        pass

# ════════════════════════════════════════════════════════════════════════════
# SIDEBAR
# ════════════════════════════════════════════════════════════════════════════
with st.sidebar:
    # Brand block
    st.markdown(
        f"<div style='display:flex;align-items:center;gap:12px;padding:4px 0 16px'>"
        f"<div style='width:40px;height:40px;border-radius:11px;"
        f"background:linear-gradient(135deg,{PRIMARY},{ACCENT});"
        f"display:flex;align-items:center;justify-content:center;font-size:1.4rem;"
        f"box-shadow:0 6px 16px -4px {PRIMARY}66'>🛡️</div>"
        f"<div><div style='font-weight:800;font-size:1.05rem;color:{INK}'>DeepGuard</div>"
        f"<div style='color:{MUTED};font-size:11px;letter-spacing:0.04em'>eKYC · Dev Demo</div></div>"
        f"</div>",
        unsafe_allow_html=True,
    )
    st.divider()

    # ── Language toggle ──
    _lang_options = ["VI", "EN"]
    _lang_idx = 0 if st.session_state.get("locale", "vi") == "vi" else 1
    _lang_sel = st.radio(
        tr("lang.toggle"),
        _lang_options,
        index=_lang_idx,
        horizontal=True,
    )
    st.session_state["locale"] = "vi" if _lang_sel == "VI" else "en"

    st.divider()

    st.markdown(
        f"<div style='color:{MUTED};font-size:11px;font-weight:700;text-transform:uppercase;"
        f"letter-spacing:0.08em;margin-bottom:8px'>{tr('sidebar.config')}</div>",
        unsafe_allow_html=True,
    )
    ENV_PRESETS = {
        "Local — localhost:8000": "http://localhost:8000",
        "Deploy — deepguard.ddns.net": "https://deepguard.ddns.net/api",
        "Custom…": None,
    }
    _label = st.selectbox("Môi trường", list(ENV_PRESETS.keys()))
    api_url = (
        st.text_input("Base URL", DEFAULT_API_URL).rstrip("/")
        if ENV_PRESETS[_label] is None
        else ENV_PRESETS[_label].rstrip("/")
    )
    input_key = st.text_input("API Key", type="password", placeholder="Bearer token…")
    api_key = input_key.strip() or ENV_API_KEY

    if api_key:
        st.markdown(
            f"<div style='display:flex;align-items:center;gap:6px;padding:8px 10px;"
            f"background:{SEM['success_bg']};border:1px solid {SEM['success_bd']};"
            f"border-radius:8px;font-size:12px;color:{SEM['success']}'>"
            f"<span>🔑</span><span style='font-weight:600'>…{api_key[-6:]}</span></div>",
            unsafe_allow_html=True,
        )
        if input_key.strip():
            if st.button("💾 Ghi nhớ vào .env", use_container_width=True):
                p = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env")
                ls = [
                    l for l in (open(p).read().splitlines() if os.path.exists(p) else [])
                    if not l.startswith("DEEPGUARD_API_KEY=")
                ]
                open(p, "w").write("\n".join(ls + [f"DEEPGUARD_API_KEY={input_key.strip()}"]) + "\n")
                st.success("Đã lưu vào .env")
    else:
        st.markdown(
            f"<div style='display:flex;align-items:center;gap:6px;padding:8px 10px;"
            f"background:{SEM['warn_bg']};border:1px solid {SEM['warn_bd']};"
            f"border-radius:8px;font-size:12px;color:{SEM['warn']}'>"
            f"<span>⚠️</span><span>Chưa có API key</span></div>",
            unsafe_allow_html=True,
        )

    st.divider()
    st.markdown(
        f"<div style='color:{MUTED};font-size:11px;font-weight:700;text-transform:uppercase;"
        f"letter-spacing:0.08em;margin-bottom:8px'>{tr('sidebar.mode')}</div>",
        unsafe_allow_html=True,
    )
    _mode_options = [tr("mode.liveness"), tr("mode.deepfake"), tr("mode.ekyc")]
    _mode_sel = st.radio("Mode", _mode_options, index=2, label_visibility="collapsed")
    # stable mode key independent of locale display string
    _mode_idx = _mode_options.index(_mode_sel) if _mode_sel in _mode_options else 2
    _MODE_KEYS = ["Liveness", "Deepfake", "eKYC"]
    mode = _mode_sel           # keep original for display uses
    mode_key = _MODE_KEYS[_mode_idx]   # stable English key for logic

    model_choice = st.selectbox(
        "Model deepfake",
        ["sfdct", "b4", "hff"],
        format_func=lambda m: {
            "sfdct": "SFDCT · B4+DCT (0.7572)",
            "b4": "B4 · Spatial (0.7497)",
            "hff": "HFF · R3 (0.7695)",
        }[m],
    )
    n_frames = st.slider("Khung video (liveness)", 3, 12, 6)
    use_thr = st.checkbox("Override threshold")
    threshold = st.slider("Threshold", 0.0, 1.0, 0.35, 0.01, disabled=not use_thr)

    st.divider()
    st.caption("🔬 Face crop MTCNN chạy tại backend")

mode_clean = mode_key   # stable display name for header

# ════════════════════════════════════════════════════════════════════════════
# API LAYER
# ════════════════════════════════════════════════════════════════════════════
H = lambda: {"Authorization": f"Bearer {api_key}"}
P = lambda: ({"threshold": threshold} if use_thr else {})

def call_live(b, n, m):
    r = requests.post(
        f"{api_url}/v1/detect/liveness", headers=H(),
        files={"file": (n, b, m)}, params={**P(), "debug": "true"}, timeout=60,
    )
    r.raise_for_status()
    return r.json()

def call_df(b, n, m):
    r = requests.post(
        f"{api_url}/v1/detect/image", headers=H(),
        files={"file": (n, b, m)}, params={**P(), "model": model_choice}, timeout=120,
    )
    r.raise_for_status()
    return r.json()

def call_dfv(b, n, m):
    r = requests.post(
        f"{api_url}/v1/detect/video", headers=H(),
        files={"file": (n, b, m)}, timeout=300,
    )
    r.raise_for_status()
    return r.json()

def call_cascade(b, n, m):
    # Backend gộp liveness->deepfake trong 1 endpoint; trả payload lồng full.
    r = requests.post(
        f"{api_url}/v1/detect/cascade", headers=H(),
        files={"file": (n, b, m)}, params=P(), timeout=180,
    )
    r.raise_for_status()
    return r.json()

def call_get(rid):
    r = requests.get(f"{api_url}/v1/results/{rid}", headers=H(), timeout=30)
    r.raise_for_status()
    return r.json()

def extract_frames(data, n, fname):
    import pathlib
    sfx = pathlib.Path(fname).suffix or ".mp4"
    with tempfile.NamedTemporaryFile(suffix=sfx, delete=False) as tf:
        tf.write(data)
        path = tf.name
    frames = []
    try:
        cap = cv2.VideoCapture(path)
        total = int(cap.get(cv2.CAP_PROP_FRAME_COUNT)) or 0
        idxs = set(list(range(0, total, max(1, total // n)))[:n]) if total else None
        i = picked = 0
        while picked < n:
            ret, frm = cap.read()
            if not ret:
                break
            if idxs is None or i in idxs:
                ok, buf = cv2.imencode(".jpg", frm, [cv2.IMWRITE_JPEG_QUALITY, 90])
                if ok:
                    frames.append(buf.tobytes())
                    picked += 1
            i += 1
        cap.release()
    finally:
        os.unlink(path)
    return frames

def live_video(data, n, fname):
    frames = extract_frames(data, n, fname)
    if not frames:
        raise RuntimeError("Không trích được khung")
    pf = [call_live(fb, f"frame_{i}.jpg", "image/jpeg") for i, fb in enumerate(frames)]
    sc = [r.get("liveness_score", 0) for r in pf]
    co = [r.get("confidence", 0) for r in pf]
    ns = sum(1 for r in pf if r.get("verdict") == "SPOOF")
    nl = sum(1 for r in pf if r.get("verdict") == "LIVE")
    v = "SPOOF" if ns > nl else ("LIVE" if nl > ns else "UNCERTAIN")
    sts = [r.get("spoof_type") for r in pf if r.get("spoof_type")]
    return {
        "verdict": v,
        "liveness_score": sum(sc) / len(sc),
        "confidence": sum(co) / len(co),
        "spoof_type": (max(set(sts), key=sts.count) if sts and v != "LIVE" else None),
        "threshold_used": pf[0].get("threshold_used"),
        "mode": f"video · {len(pf)} khung (client)",
        "frame_count": len(pf),
        "processing_time_ms": sum(r.get("processing_time_ms", 0) for r in pf),
        "model_version": pf[0].get("model_version"),
    }, pf

# ════════════════════════════════════════════════════════════════════════════
# RENDER FUNCTIONS
# ════════════════════════════════════════════════════════════════════════════
def render_live(res, pf=None):
    sc = res.get("liveness_score", 0)
    thr = res.get("threshold_used", 0)
    v = res.get("verdict", "—")
    sem = _VMAP.get(str(v).upper(), ("info", "❔"))[0]
    card(
        body=(
            vbadge(v, sub=res.get("mode", ""))
            + score_bar("P(live) — cao = thật", sc, invert=False)
            + pills(
                **{
                    "P(live)": f"{sc*100:.1f}%",
                    "Confidence": f"{res.get('confidence',0):.1f}%",
                    "Latency": f"{res.get('processing_time_ms',0)} ms",
                    "Threshold": str(thr),
                }
            )
            + info_box(
                f"P(live) = <b>{sc:.4f}</b> {'≥' if sc >= thr else '<'} threshold = <b>{thr:.3f}</b> → <b>{v}</b>"
                f"<br><span style='opacity:.7;font-size:12px'>model: {res.get('model_version','—')}</span>",
                kind="ok" if sem == "success" else "err" if sem == "danger" else "warn",
            )
            + (info_box(f"Spoof type phát hiện: <b>{res['spoof_type']}</b>", kind="warn") if res.get("spoof_type") else "")
            + (
                info_box(
                    f"🔬 Print={aa.get('scores',{}).get('print')} · Screen={aa.get('scores',{}).get('screen')} → <b>{aa.get('attack_type')}</b>",
                    kind="warn",
                )
                if (aa := res.get("attack_analysis"))
                else ""
            )
        ),
        title=tr("result.liveness"),
        accent=SEM[sem],
    )
    if pf:
        with st.expander(f"📋 Điểm từng khung ({len(pf)})"):
            st.table([
                {"#": i, "verdict": r.get("verdict"), "P(live)": round(r.get("liveness_score", 0), 4)}
                for i, r in enumerate(pf)
            ])
    with st.expander("🔧 JSON đầy đủ"):
        st.json(res)

def render_df(res):
    pf = res.get("prob_fake", 0)
    thr = res.get("threshold_used", 0.35)
    rs = res.get("risk_score", 0)
    v = res.get("verdict", "—")
    sem = _VMAP.get(str(v).upper(), ("info", "❔"))[0]
    card(
        body=(
            vbadge(v)
            + score_bar("Prob fake — thấp = thật", pf, invert=False)
            + pills(
                **{
                    "Risk": f"{rs*100:.1f}%",
                    "Verdict": v,
                    "Decision": str(res.get("decision_hint", "—")).upper(),
                    "Latency": f"{res.get('processing_time_ms',0)} ms",
                }
            )
            + info_box(
                f"prob_fake=<b>{pf:.4f}</b> · threshold=<b>{thr:.2f}</b><br>"
                f"risk_band=<b>{res.get('risk_band','—')}</b> → <b>{str(res.get('decision_hint','')).upper()}</b>"
                f"<br><span style='opacity:.7;font-size:12px'>model: {res.get('model_version','—')}</span>",
                kind="ok" if sem == "success" else "err" if sem == "danger" else "warn",
            )
        ),
        title=tr("result.deepfake"),
        accent=SEM[sem],
    )
    if res.get("heatmap") or res.get("frequency"):
        c1, c2 = st.columns(2)
        with c1:
            show_b64(res.get("heatmap"), "Grad-CAM")
        with c2:
            show_b64(res.get("frequency"), "Phổ DCT")
    with st.expander("🔧 JSON đầy đủ"):
        st.json(res)

def render_dfv(res):
    v = res.get("verdict", "—")
    sem = _VMAP.get(str(v).upper(), ("info", "❔"))[0]
    card(
        body=(
            vbadge(v)
            + score_bar("Prob fake (gộp)", res.get("prob_fake", 0))
            + pills(
                **{
                    "Frames fake": f"{res.get('frames_fake',0)}/{res.get('frames_analyzed',0)}",
                    "Confidence": str(res.get("confidence", "—")),
                    "Latency": f"{res.get('processing_time_ms',0)} ms",
                }
            )
        ),
        title="Deepfake · Video",
        accent=SEM[sem],
    )
    with st.expander("🔧 JSON đầy đủ"):
        st.json(res)

def render_any(res):
    (render_dfv if "frames_analyzed" in res else render_df)(res)

def df_decision(res):
    if "decision_hint" in res:
        return {"pass": "PASS", "review": "REVIEW", "reject": "FAIL"}.get(res.get("decision_hint"), "REVIEW")
    return {"REAL": "PASS", "FAKE": "FAIL", "UNCERTAIN": "REVIEW"}.get(res.get("verdict"), "REVIEW")

# ════════════════════════════════════════════════════════════════════════════
# HEADER
# ════════════════════════════════════════════════════════════════════════════
st.markdown(
    f"<div style='background:linear-gradient(135deg,#0f172a 0%,#1e3a8a 60%,#1e40af 100%);"
    f"border-radius:18px;padding:30px 36px;margin-bottom:24px;"
    f"display:flex;align-items:center;gap:22px;position:relative;overflow:hidden;"
    f"box-shadow:0 10px 30px -8px rgba(30,58,138,0.4)'>"
    f"<div style='position:absolute;top:-30px;right:-30px;width:200px;height:200px;"
    f"background:radial-gradient(circle,{ACCENT}33,transparent 70%);border-radius:50%'></div>"
    f"<div style='position:absolute;bottom:-50px;left:30%;width:300px;height:300px;"
    f"background:radial-gradient(circle,{PRIMARY}22,transparent 70%);border-radius:50%'></div>"
    f"<div style='font-size:3rem;filter:drop-shadow(0 0 20px #3b82f6aa);position:relative;z-index:1'>🛡️</div>"
    f"<div style='position:relative;z-index:1'>"
    f"<div style='color:#f8fafc;font-size:1.85rem;font-weight:800;letter-spacing:-0.025em'>DeepGuard eKYC</div>"
    f"<div style='color:#94a3b8;font-size:0.875rem;margin-top:4px;display:flex;align-items:center;gap:10px;flex-wrap:wrap'>"
    f"<span>Dev Integration Demo</span>"
    f"<span style='opacity:.4'>·</span>"
    f"<span>Mode: <b style='color:#60a5fa'>{mode_clean}</b></span>"
    f"<span style='opacity:.4'>·</span>"
    f"<code style='background:rgba(30,41,59,0.7);padding:3px 10px;border-radius:5px;"
    f"color:#7dd3fc;font-size:12px'>{api_url}</code>"
    f"</div></div></div>",
    unsafe_allow_html=True,
)

# ════════════════════════════════════════════════════════════════════════════
# MAIN LAYOUT
# ════════════════════════════════════════════════════════════════════════════
st.session_state.setdefault("history", [])

def _hist(m, rid, v, s):
    st.session_state["history"].append({
        "time": datetime.now().strftime("%H:%M:%S"),
        "mode": m,
        "verdict": v or "—",
        "score": f"{s:.3f}" if isinstance(s, (int, float)) else "—",
        "id": str(rid) if rid else "—",
    })

left, right = st.columns([5, 7], gap="large")

# ─── LEFT: INPUT ─────────────────────────────────────────────────────────────
with left:
    st.markdown(
        f"<div style='display:flex;align-items:center;gap:8px;margin-bottom:12px'>"
        f"<div style='color:{PRIMARY};font-weight:700;font-size:14px'>01 · MEDIA INPUT</div>"
        f"<div style='flex:1;height:1px;background:{LINE}'></div></div>",
        unsafe_allow_html=True,
    )
    up = st.file_uploader("Ảnh hoặc video", type=IMAGE_TYPES + VIDEO_TYPES, label_visibility="collapsed")
    is_video = False
    if up:
        ext = (up.name.rsplit(".", 1)[-1] or "").lower()
        is_video = (up.type or "").startswith("video") or ext in VIDEO_TYPES
        if is_video:
            st.video(up)
            st.caption(f"🎬 Video · {n_frames} khung sẽ được trích · Deepfake → /detect/video")
        else:
            st.image(up, use_container_width=True)
    else:
        st.markdown(
            f"<div style='border:2px dashed {LINE};border-radius:14px;padding:40px 20px;"
            f"text-align:center;background:{SURFACE}'>"
            f"<div style='font-size:2.5rem;opacity:.4'>📁</div>"
            f"<div style='color:{MUTED};font-size:13px;margin-top:8px'>"
            f"Kéo thả hoặc bấm để upload<br><span style='font-size:11px'>"
            f"JPG · PNG · WEBP · MP4 · MOV …</span></div></div>",
            unsafe_allow_html=True,
        )

    run = st.button(tr("btn.run"), type="primary", disabled=not (api_key and up), use_container_width=True)
    if not api_key:
        _r(info_box("Cần API key để chạy.", kind="warn"))
    elif not up:
        _r(info_box("Upload ảnh/video để bắt đầu.", kind="info"))

# ─── RIGHT: RESULTS ─────────────────────────────────────────────────────────
with right:
    st.markdown(
        f"<div style='display:flex;align-items:center;gap:8px;margin-bottom:12px'>"
        f"<div style='color:{PRIMARY};font-weight:700;font-size:14px'>02 · {tr('result.header').upper()}</div>"
        f"<div style='flex:1;height:1px;background:{LINE}'></div></div>",
        unsafe_allow_html=True,
    )

    if run:
        data = up.getvalue()
        mime = up.type or ("video/mp4" if is_video else "image/jpeg")
        try:
            with st.spinner("Đang phân tích…"):
                if mode_key == "Liveness":
                    if is_video:
                        res, pf = live_video(data, n_frames, up.name)
                        render_live(res, pf)
                        _hist("Live·video", "—", res.get("verdict"), res.get("liveness_score"))
                    else:
                        res = call_live(data, up.name, mime)
                        render_live(res)
                        _hist("Liveness", res.get("check_id"), res.get("verdict"), res.get("liveness_score"))

                elif mode_key == "Deepfake":
                    res = call_dfv(data, up.name, mime) if is_video else call_df(data, up.name, mime)
                    render_any(res)
                    _hist("Deepfake", res.get("request_id") or res.get("job_id"),
                          res.get("verdict"), res.get("risk_score", res.get("prob_fake")))

                else:  # eKYC cascade
                    _step_ph = st.empty()
                    _step_ph.markdown(step_indicator(
                        [("Liveness", "active"), ("Deepfake", "pending"), ("Decision", "pending")], 0,
                    ), unsafe_allow_html=True)
                    if is_video:
                        # Video: gộp phía client (backend cascade chỉ nhận ảnh tĩnh)
                        lr, pf = live_video(data, n_frames, up.name)
                        vlive = lr.get("verdict")
                        stopped = vlive == "SPOOF"; unc = vlive == "UNCERTAIN"
                        dr = None if (stopped or unc) else call_dfv(data, up.name, mime)
                        final = "FAIL" if stopped else "REVIEW" if unc else df_decision(dr)
                        reason = (
                            "Presentation attack phát hiện — cascade dừng tại bước liveness."
                            if stopped else
                            "Liveness UNCERTAIN — chuyển người duyệt (spec 2.1)."
                            if unc else
                            f"Liveness {vlive} ✓ → Deepfake → {final}."
                        )
                    else:
                        # Ảnh: gọi 1 endpoint backend /v1/detect/cascade (logic gộp ở server)
                        res = call_cascade(data, up.name, mime)
                        lr, pf, dr = res["liveness"], None, res.get("deepfake")
                        vlive = lr.get("verdict")
                        stopped = vlive == "SPOOF"; unc = vlive == "UNCERTAIN"
                        final, reason = res["final_decision"], res["reason"]
                    _step_ph.markdown(step_indicator(
                        [
                            ("Liveness", "done" if not unc else "active"),
                            ("Deepfake", "skipped" if (stopped or unc) else "done"),
                            ("Decision", "done"),
                        ], 2,
                    ), unsafe_allow_html=True)
                    _r(vbadge(f"eKYC: {final}", sub=reason))
                    st.divider()
                    st.markdown(tr("result.step1"))
                    render_live(lr, pf)
                    st.divider()
                    st.markdown(tr("result.step2"))
                    if stopped or unc:
                        _r(info_box("⏭️ Bỏ qua — đã chặn ở bước liveness.", kind="warn"))
                    elif dr:
                        render_any(dr)
                    _hist("eKYC", (dr or {}).get("request_id") or lr.get("check_id"),
                          final, (dr or {}).get("risk_score"))
        except requests.HTTPError as e:
            _r(info_box(f"API {e.response.status_code}: {e.response.text[:300]}", kind="err"))
        except requests.RequestException as e:
            _r(info_box(f"Không gọi được API (<code>{api_url}</code>)<br>{e}", kind="err"))
        except Exception as e:
            _r(info_box(f"Lỗi: {e}", kind="err"))
    else:
        empty_state(
            "🛰️",
            "Sẵn sàng phân tích",
            "Nhập API key → upload ảnh/video → bấm <b>Chạy kiểm tra</b>. "
            "Kết quả liveness & deepfake sẽ hiển thị tại đây.",
        )

# ════════════════════════════════════════════════════════════════════════════
# FOOTER: HISTORY + LOOKUP
# ════════════════════════════════════════════════════════════════════════════
st.markdown(
    f"<div style='height:1px;background:{LINE};margin:30px 0 20px'></div>",
    unsafe_allow_html=True,
)
hc, lc = st.columns([7, 5], gap="large")

with hc:
    st.markdown(
        f"<div style='display:flex;align-items:center;gap:8px;margin-bottom:10px'>"
        f"<span style='color:{MUTED};font-size:11px;font-weight:700;text-transform:uppercase;"
        f"letter-spacing:0.1em'>📜 Lịch sử phiên</span>"
        f"<div style='flex:1;height:1px;background:{LINE}'></div></div>",
        unsafe_allow_html=True,
    )
    if st.session_state["history"]:
        st.table(list(reversed(st.session_state["history"])))
        if st.button("🗑️ Xóa lịch sử", use_container_width=False):
            st.session_state["history"] = []
            st.rerun()
    else:
        st.caption("— Chưa có lần chạy nào.")

with lc:
    st.markdown(
        f"<div style='display:flex;align-items:center;gap:8px;margin-bottom:10px'>"
        f"<span style='color:{MUTED};font-size:11px;font-weight:700;text-transform:uppercase;"
        f"letter-spacing:0.1em'>🔎 Tra cứu</span>"
        f"<div style='flex:1;height:1px;background:{LINE}'></div></div>",
        unsafe_allow_html=True,
    )
    st.caption("`GET /v1/results/{id}` — Deepfake image")
    rid = st.text_input("request_id", key="rid", placeholder="Nhập ID…")
    if st.button("🔍 Tra cứu", disabled=not (api_key and rid.strip()), use_container_width=True):
        try:
            render_any(call_get(rid.strip()))
        except requests.HTTPError as e:
            _r(info_box(f"{e.response.status_code}: {e.response.text[:200]}", kind="err"))
        except Exception as e:
            _r(info_box(str(e), kind="err"))

# ─── cURL ────────────────────────────────────────────────────────────────────
ep = {
    "Liveness": "/v1/detect/liveness",
    "Deepfake": "/v1/detect/image",
    "eKYC":     "/v1/detect/cascade",
}[mode_key]
with st.expander("💻 cURL tương đương"):
    st.code(
        f"curl -X POST '{api_url}{ep.split()[0]}' \\\n"
        f"  -H 'Authorization: Bearer <KEY>' \\\n"
        f"  -F 'file=@face.jpg'",
        language="bash",
    )