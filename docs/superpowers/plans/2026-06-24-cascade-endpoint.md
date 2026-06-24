# Cascade Endpoint Implementation Plan (P1)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Thêm `POST /v1/detect/cascade` chạy liveness prefilter → deepfake ở backend, trả payload lồng full (LivenessResponse + DetectionResponse) để Streamlit dùng lại UI không sửa.

**Architecture:** Tách 2 builder DRY (`build_detection_response`, tái dùng `run_liveness_check`+`_save_liveness`+`_to_response`), 1 hàm quyết định thuần `cascade_decision()`, rồi compose trong endpoint cascade. Persist Detection với `source='cascade'`. Streamlit gọi 1 endpoint thay vì tự gộp.

**Tech Stack:** FastAPI, SQLAlchemy async, Pydantic v2, pytest (pure-function style), Streamlit.

## Global Constraints

- File code **≤ 250 dòng** (tách nếu vượt).
- DB **chỉ** qua `deepguard_db` — KHÔNG raw SQL.
- Commit **chỉ khi được yêu cầu**; **KHÔNG** `Co-Authored-By` trailer.
- Branch: `dev-thanhln-22062026`.
- Test repo theo **pure-function doc-test** (không spin app/DB) — mirror rule, như `test_cascade_logic.py`.
- no-vibe-code: mỗi thay đổi giải thích nguyên nhân gốc → sửa gì (file:dòng) → vì sao.

## File Structure

| File | Trách nhiệm |
|---|---|
| `backend/app/services/cascade.py` (Create) | `cascade_decision()` thuần — map (liveness, decision_hint) → (final, reason) |
| `backend/tests/test_cascade_decision.py` (Create) | Test thuần cho `cascade_decision` |
| `backend/app/schemas/cascade.py` (Create) | `CascadeResponse` lồng LivenessResponse + DetectionResponse |
| `backend/app/routers/_detect_helpers.py` (Create) | `build_detection_response()` rút từ `detect_image` (DRY) |
| `backend/app/routers/detect.py` (Modify) | `detect_image` dùng helper; thêm endpoint `detect_cascade` |
| `ekyc_demo/app.py` (Modify) | `call_cascade()` + nhánh cascade gọi 1 endpoint |

**Signatures có sẵn (tái dùng, không viết lại):**
- `run_liveness_check(image_bytes, threshold=None) -> LivenessResult` — `app/services/liveness.py:254`
- `run_inference(image_bytes, include_heatmap=True, threshold=None, model=None) -> InferenceResult` — `app/services/ml_inference.py:173`
- `_save_liveness(db, *, tenant_id, api_key_id, result, mode, request, source="api") -> row` + `_to_response(row, attack_analysis=None) -> LivenessResponse` — `app/routers/_liveness_helpers.py`
- `crud.create_detection(db, *, tenant_id, api_key_id, verdict, confidence, prob_fake, prob_cnn, spatial_score, frequency_score, threshold_used, image_hash, image_width, image_height, image_thumb, processing_time_ms, model_version, user_agent, ip_address, source="api")` — `deepguard_db/.../crud.py:175`
- `to_risk_score(prob_fake)`, `risk_band(risk)`, `decision_hint(band) -> "pass"|"review"|"reject"`, `thresholds_dict()` — `app/services/risk.py`
- `frequency_viz(image_bytes)`, `_encode_image_thumb(image_bytes)` — `app/services/ml_model.py`
- `get_api_key_auth` — `app/dependencies.py`; `bad_request` — `app/core/exceptions.py`

---

### Task 1: Pure cascade decision function

**Files:**
- Create: `backend/app/services/cascade.py`
- Test: `backend/tests/test_cascade_decision.py`

**Interfaces:**
- Produces: `cascade_decision(liveness_verdict: str, deepfake_decision_hint: str | None = None) -> tuple[str, str]` returning `(final_decision, reason)` where `final_decision ∈ {"PASS","REVIEW","FAIL"}`.

- [ ] **Step 1: Write the failing test**

```python
# backend/tests/test_cascade_decision.py
"""Doc test — quyết định cascade eKYC (liveness prefilter -> deepfake).
Mirror rule trong app/services/cascade.py:cascade_decision. Không spin app/DB."""
import pytest
from app.services.cascade import cascade_decision


def test_spoof_blocks_with_fail():
    final, reason = cascade_decision("SPOOF")
    assert final == "FAIL"
    assert "prefilter" in reason.lower()


def test_uncertain_review():
    final, _ = cascade_decision("UNCERTAIN")
    assert final == "REVIEW"


def test_live_maps_decision_hint():
    assert cascade_decision("LIVE", "pass")[0] == "PASS"
    assert cascade_decision("LIVE", "review")[0] == "REVIEW"
    assert cascade_decision("LIVE", "reject")[0] == "FAIL"


def test_live_unknown_hint_defaults_review():
    assert cascade_decision("LIVE", None)[0] == "REVIEW"
    assert cascade_decision("LIVE", "weird")[0] == "REVIEW"


def test_invalid_verdict_raises():
    with pytest.raises(ValueError):
        cascade_decision("BOGUS")
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd backend && .venv310/bin/python -m pytest tests/test_cascade_decision.py -v`
Expected: FAIL — `ModuleNotFoundError: No module named 'app.services.cascade'`

- [ ] **Step 3: Write minimal implementation**

```python
# backend/app/services/cascade.py
"""cascade.py — quyết định eKYC cascade (liveness prefilter -> deepfake).

Thuần rule, không I/O. Endpoint /v1/detect/cascade dùng hàm này để gộp.
Khớp logic client cũ (ekyc_demo df_decision + nhánh stopped/uncertain)."""

_HINT_TO_FINAL = {"pass": "PASS", "review": "REVIEW", "reject": "FAIL"}


def cascade_decision(liveness_verdict: str, deepfake_decision_hint: str | None = None) -> tuple[str, str]:
    """Trả (final_decision, reason).

    liveness SPOOF     -> FAIL   (chặn, không chạy deepfake)
    liveness UNCERTAIN -> REVIEW (đẩy xét tay)
    liveness LIVE      -> map decision_hint: pass->PASS, review->REVIEW, reject->FAIL (mặc định REVIEW)
    """
    v = (liveness_verdict or "").upper()
    if v == "SPOOF":
        return "FAIL", "Liveness SPOOF — chặn tại prefilter (không chạy deepfake)."
    if v == "UNCERTAIN":
        return "REVIEW", "Liveness UNCERTAIN — chuyển người duyệt."
    if v == "LIVE":
        final = _HINT_TO_FINAL.get((deepfake_decision_hint or "").lower(), "REVIEW")
        return final, f"Liveness LIVE → Deepfake ({deepfake_decision_hint}) → {final}."
    raise ValueError(f"liveness verdict không hợp lệ: {liveness_verdict!r}")
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd backend && .venv310/bin/python -m pytest tests/test_cascade_decision.py -v`
Expected: PASS (5 passed)

- [ ] **Step 5: Commit**

```bash
git add backend/app/services/cascade.py backend/tests/test_cascade_decision.py
git commit -m "feat(cascade): pure cascade_decision rule (liveness prefilter -> deepfake)"
```

---

### Task 2: CascadeResponse schema

**Files:**
- Create: `backend/app/schemas/cascade.py`

**Interfaces:**
- Consumes: `LivenessResponse` (`app/schemas/liveness.py:8`), `DetectionResponse` (`app/schemas/detect.py:7`).
- Produces: `CascadeResponse(request_id: str, liveness: LivenessResponse, deepfake: Optional[DetectionResponse], final_decision: str, reason: str, processing_time_ms: int)`.

- [ ] **Step 1: Write the schema**

```python
# backend/app/schemas/cascade.py
"""cascade.py — schema phản hồi /v1/detect/cascade.

Lồng FULL payload y hệt endpoint lẻ để client (Streamlit) tái dùng render."""
from typing import Optional
from pydantic import BaseModel

from app.schemas.liveness import LivenessResponse
from app.schemas.detect import DetectionResponse


class CascadeResponse(BaseModel):
    request_id: str
    liveness: LivenessResponse
    deepfake: Optional[DetectionResponse] = None   # null khi liveness chặn (SPOOF/UNCERTAIN)
    final_decision: str                            # PASS | REVIEW | FAIL
    reason: str
    processing_time_ms: int
```

- [ ] **Step 2: Verify it imports**

Run: `cd backend && .venv310/bin/python -c "from app.schemas.cascade import CascadeResponse; print('ok')"`
Expected: `ok`

- [ ] **Step 3: Commit**

```bash
git add backend/app/schemas/cascade.py
git commit -m "feat(cascade): CascadeResponse schema (nested liveness+deepfake)"
```

---

### Task 3: Factor detection-response builder (DRY)

**Files:**
- Create: `backend/app/routers/_detect_helpers.py`
- Modify: `backend/app/routers/detect.py` (detect_image dùng helper)

**Interfaces:**
- Produces: `async build_detection_response(db, image_bytes: bytes, *, api_key, request, threshold, model, source="api") -> DetectionResponse` — chạy inference + risk + freq + persist + dựng DetectionResponse. Tăng quota api_key + tenant.

- [ ] **Step 1: Create the helper (rút nguyên khối logic hiện có trong `detect_image`)**

```python
# backend/app/routers/_detect_helpers.py
"""_detect_helpers.py — builder dùng chung cho /detect/image và /detect/cascade (DRY)."""
import asyncio
from sqlalchemy import update
from sqlalchemy.ext.asyncio import AsyncSession

from deepguard_db.app.db import crud
from deepguard_db.app.db.models import ApiKey as ApiKeyModel, DetectionVerdict
from app.services.ml_inference import run_inference
from app.services.ml_model import frequency_viz, _encode_image_thumb
from app.services.risk import to_risk_score, risk_band, decision_hint, thresholds_dict
from app.services import storage, metrics
from app.schemas.detect import DetectionResponse


async def build_detection_response(
    db: AsyncSession, image_bytes: bytes, *, api_key, request, threshold, model, source="api",
) -> DetectionResponse:
    """Chạy deepfake inference, lưu Detection (source), trả DetectionResponse + cộng quota."""
    result = await run_inference(image_bytes, threshold=threshold, model=model)
    risk = to_risk_score(result.prob_fake)
    band = risk_band(risk)
    freq = frequency_viz(image_bytes)

    detection = await crud.create_detection(
        db, tenant_id=api_key.tenant_id, api_key_id=api_key.id,
        verdict=DetectionVerdict(result.verdict), confidence=result.confidence,
        prob_fake=result.prob_fake, prob_cnn=result.prob_cnn,
        spatial_score=result.spatial_score, frequency_score=result.frequency_score,
        threshold_used=result.threshold_used, image_hash=result.image_hash,
        image_width=result.image_width, image_height=result.image_height,
        image_thumb=result.image_thumb or _encode_image_thumb(image_bytes),
        processing_time_ms=result.processing_time_ms, model_version=result.model_version,
        user_agent=request.headers.get("user-agent"),
        ip_address=request.client.host if request.client else None,
        source=source,
    )
    if storage.enabled() and result.heatmap:
        detection.heatmap_url = await asyncio.to_thread(
            storage.upload_heatmap, api_key.tenant_id, detection.request_id, result.heatmap)
    if metrics.enabled():
        await asyncio.to_thread(metrics.emit_detection, result.verdict, result.prob_fake,
                                result.processing_time_ms, "api")
    await db.execute(update(ApiKeyModel).where(ApiKeyModel.id == api_key.id)
                     .values(quota_used=ApiKeyModel.quota_used + 1))
    await crud.increment_tenant_usage(db, api_key.tenant_id)
    await db.commit()

    return DetectionResponse(
        request_id=detection.request_id,
        risk_score=risk, risk_band=band, decision_hint=decision_hint(band),
        thresholds=thresholds_dict(), heatmap=result.heatmap, frequency=freq,
        verdict=detection.verdict.value, confidence=detection.confidence,
        prob_fake=detection.prob_fake, threshold_used=detection.threshold_used,
        face_detected=result.face_detected, processing_time_ms=detection.processing_time_ms,
        model_version=detection.model_version, created_at=detection.created_at,
    )
```

> Lưu ý implementer: mở `backend/app/routers/detect.py:46-130` đối chiếu — copy **đúng** các field DetectionResponse hiện trả (gồm cả field ở phần bị cắt dòng 130+: `model_version`, `created_at`). Nếu detect_image trả thêm field nào, thêm vào đây cho khớp.

- [ ] **Step 2: Refactor `detect_image` để gọi helper**

Trong `backend/app/routers/detect.py`, thay toàn bộ thân sau `_assert_valid_image(image_bytes)` bằng:

```python
    return await build_detection_response(
        db, image_bytes, api_key=api_key, request=request,
        threshold=threshold, model=model, source="api",
    )
```
Thêm import đầu file: `from app.routers._detect_helpers import build_detection_response`.
Lưu media S3 (`storage.upload_media`) chuyển vào helper nếu muốn giữ; nếu không dùng S3 (S3_BUCKET trống) thì no-op — an toàn bỏ qua trong demo.

- [ ] **Step 3: Verify import + detect/image vẫn chạy (manual, stack up)**

```bash
cd backend && .venv310/bin/python -c "from app.routers._detect_helpers import build_detection_response; import app.routers.detect; print('import ok')"
# Stack đang chạy (./up.sh): gọi thật
curl -s -X POST "http://localhost:8000/v1/detect/image" -H "Authorization: Bearer <API_KEY>" -F "file=@frontend/public/samples/real_01.jpg" | python3 -c "import sys,json;d=json.load(sys.stdin);print('verdict',d['verdict'],'risk',d['risk_score'])"
```
Expected: `import ok` và JSON có `verdict` + `risk_score` như trước refactor.

- [ ] **Step 4: Commit**

```bash
git add backend/app/routers/_detect_helpers.py backend/app/routers/detect.py
git commit -m "refactor(detect): tách build_detection_response dùng chung (DRY cho cascade)"
```

---

### Task 4: Implement `POST /v1/detect/cascade`

**Files:**
- Modify: `backend/app/routers/detect.py` (thêm endpoint)

**Interfaces:**
- Consumes: `cascade_decision` (Task 1), `CascadeResponse` (Task 2), `build_detection_response` (Task 3), `run_liveness_check`+`_save_liveness`+`_to_response` (có sẵn).

- [ ] **Step 1: Thêm endpoint cascade**

```python
# backend/app/routers/detect.py — thêm imports
from app.services.cascade import cascade_decision
from app.services.liveness import run_liveness_check
from app.routers._liveness_helpers import _save_liveness, _to_response
from app.schemas.cascade import CascadeResponse
import time


@router.post("/detect/cascade", response_model=CascadeResponse)
async def detect_cascade(
    request: Request,
    file: UploadFile = File(...),
    threshold: float = Query(default=None, ge=0.0, le=1.0),
    api_key: ApiKey = Depends(get_api_key_auth),
    db: AsyncSession = Depends(get_db),
):
    """Cascade: liveness prefilter -> (nếu LIVE) deepfake. Logic gộp ở backend."""
    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise bad_request(f"Unsupported file type: {file.content_type}")
    image_bytes = await file.read()
    if len(image_bytes) > MAX_IMAGE_SIZE:
        raise bad_request("File size exceeds 10 MB limit")
    _assert_valid_image(image_bytes)

    t0 = time.perf_counter()
    # 1) Liveness prefilter
    live_result = await run_liveness_check(image_bytes, threshold=threshold)
    live_row = await _save_liveness(db, tenant_id=api_key.tenant_id, api_key_id=api_key.id,
                                    result=live_result, mode="passive", request=request, source="cascade")
    live_resp = _to_response(live_row, attack_analysis=live_result.attack_analysis)

    # 2) Deepfake chỉ khi LIVE
    deepfake_resp = None
    hint = None
    if live_resp.verdict == "LIVE":
        deepfake_resp = await build_detection_response(
            db, image_bytes, api_key=api_key, request=request,
            threshold=None, model=None, source="cascade")
        hint = deepfake_resp.decision_hint

    final, reason = cascade_decision(live_resp.verdict, hint)
    rid = deepfake_resp.request_id if deepfake_resp else str(live_row.check_id)
    return CascadeResponse(
        request_id=rid, liveness=live_resp, deepfake=deepfake_resp,
        final_decision=final, reason=reason,
        processing_time_ms=int((time.perf_counter() - t0) * 1000),
    )
```

> Implementer kiểm: `_save_liveness` có nhận `source=` không (mirror playground dùng `source="playground"`). Nếu chưa, thêm tham số `source="api"` vào `_save_liveness` + truyền xuống `crud` (đã có cột `source` trên LivenessCheck — `models.py:463`). `live_row.check_id` là field id của LivenessCheck (đối chiếu `_to_response`).

- [ ] **Step 2: Verify cascade chạy 3 nhánh (manual, stack up)**

```bash
# Ảnh mặt thật -> kỳ vọng liveness LIVE -> chạy deepfake -> final PASS/REVIEW/FAIL theo risk
curl -s -X POST "http://localhost:8000/v1/detect/cascade" -H "Authorization: Bearer <API_KEY>" -F "file=@frontend/public/samples/real_01.jpg" | python3 -c "import sys,json;d=json.load(sys.stdin);print('live',d['liveness']['verdict'],'final',d['final_decision'],'deepfake',bool(d['deepfake']))"
```
Expected: in ra `live LIVE final <PASS|REVIEW|FAIL> deepfake True`; với ảnh spoof → `final FAIL deepfake False`.

- [ ] **Step 3: Commit**

```bash
git add backend/app/routers/detect.py backend/app/routers/_liveness_helpers.py
git commit -m "feat(cascade): POST /v1/detect/cascade (liveness prefilter -> deepfake)"
```

---

### Task 5: Wire Streamlit cascade mode to 1 endpoint

**Files:**
- Modify: `ekyc_demo/app.py` (thêm `call_cascade`, đổi nhánh cascade)

**Interfaces:**
- Consumes: `/v1/detect/cascade` (Task 4). Tái dùng `render_live`, `render_df` (không sửa).

- [ ] **Step 1: Thêm hàm gọi cascade**

```python
# ekyc_demo/app.py — cạnh call_df/call_live
def call_cascade(b, n, m):
    r = requests.post(f"{api_url}/v1/detect/cascade", headers=H(),
                      files={"file": (n, b, m)}, params=P(), timeout=180)
    r.raise_for_status()
    return r.json()
```

- [ ] **Step 2: Đổi nhánh eKYC cascade (ảnh) sang 1 lời gọi**

Thay khối eKYC cascade (ảnh) bằng:
```python
res = call_cascade(data, up.name, mime)
final = res["final_decision"]; reason = res["reason"]
_r(vbadge(f"eKYC: {final}", sub=reason))
st.divider(); st.markdown("**Bước 1 · Liveness**"); render_live(res["liveness"])
st.divider(); st.markdown("**Bước 2 · Deepfake**")
if res.get("deepfake"): render_df(res["deepfake"])
else: _r(info_box("⏭️ Bỏ qua — đã chặn ở bước liveness.", kind="warn"))
_hist("eKYC", res.get("request_id"), final, (res.get("deepfake") or {}).get("risk_score"))
```
(Video cascade giữ client-side cũ — backend cascade chỉ cho ảnh.)

- [ ] **Step 3: Verify trên Streamlit (manual)**

Run: mở `http://localhost:8503`, chọn eKYC Cascade, upload ảnh thật → thấy badge final + Liveness + Deepfake render đúng (UI không đổi). Upload ảnh spoof → Deepfake bị skip.

- [ ] **Step 4: Commit**

```bash
git add ekyc_demo/app.py
git commit -m "feat(ekyc_demo): cascade mode gọi /v1/detect/cascade (1 call, UI giữ nguyên)"
```

---

## Self-Review

**1. Spec coverage:**
- Cascade logic backend (SPOOF→FAIL, UNCERTAIN→REVIEW, LIVE→deepfake) → Task 1 ✓
- Payload lồng full LivenessResponse + DetectionResponse → Task 2 ✓
- DRY tái dùng code path → Task 3 (build_detection_response) + Task 4 (run_liveness_check) ✓
- Lưu source='cascade' vào history → Task 3/4 (source param) ✓
- Streamlit giữ UI, đổi 2 call → 1 call → Task 5 ✓
- Lỗi ảnh rác → 400: Task 4 dùng `_assert_valid_image` + ALLOWED types ✓
- *Ngoài P1:* model-version unify → chuyển sang P2 (backend correctness) — KHÔNG thuộc cascade mechanics.

**2. Placeholder scan:** `<API_KEY>` trong lệnh curl là giá trị runtime (key thật do dev tạo ở dashboard), không phải placeholder code. Mọi code block đầy đủ.

**3. Type consistency:** `cascade_decision` trả `(final, reason)` dùng đồng nhất Task 1/4. `build_detection_response` trả `DetectionResponse` khớp `CascadeResponse.deepfake`. `_to_response` trả `LivenessResponse` khớp `CascadeResponse.liveness`. `decision_hint` values `pass/review/reject` khớp `_HINT_TO_FINAL`.

## Lưu ý handoff
- Stack phải chạy (`./up.sh`) cho Task 3-5 (serving :8501/:8502 + backend :8000).
- Cần 1 API key thật: tạo ở dashboard (admin/developer) hoặc seed.
- Model-version unify + error mapping T3 + RBAC hardening → **P2** (plan riêng).
