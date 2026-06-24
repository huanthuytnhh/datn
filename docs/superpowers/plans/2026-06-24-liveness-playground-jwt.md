# Liveness Playground (JWT) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Cho phép thử Liveness ngay trong dashboard bằng JWT (không cần tạo API key), đối xứng với deepfake playground; có lưu lịch sử badge `playground`.

**Architecture:** Thêm endpoint JWT `POST /playground/detect/liveness` (role admin/developer) song song với `POST /v1/detect/liveness` (API key, giữ nguyên). Dùng lại helper `_save_liveness` (thêm tham số `source` + bỏ qua cộng quota khi không có key). `LivenessCheck.api_key_id` thành nullable + thêm cột `source`. Frontend bỏ rào apiKey và gọi endpoint JWT; History hiện badge `playground` cho lượt thử.

**Tech Stack:** FastAPI + SQLAlchemy async (Postgres), Pydantic v2, Next.js 16 + TypeScript (bun), pytest (pure-logic style).

## Global Constraints

- Branch feature từ `dev` theo `dev-{tên}-{feature}`; **KHÔNG** thêm trailer `Co-Authored-By` (CLAUDE.md).
- File ≤ 250 dòng; DB chỉ truy cập qua `deepguard_db` (CONVENTIONS.md).
- Auth dashboard = JWT Bearer; auth tích hợp ngoài = API key Bearer. KHÔNG đổi hành vi `/v1/detect/liveness`.
- Repo **không có** harness test HTTP/DB → test tự động dùng kiểu pure-logic (mirror rule, như `tests/test_cascade_logic.py`); hành vi endpoint verify bằng **curl smoke** (như AUDIT-REPORT).
- Đăng nhập smoke: `dev@vietbank.vn` / `Password123!`. Backend `http://localhost:8000`. Container DB: `deepguard-db`.

---

## File Structure

- `deepguard_db/app/db/models.py` — `LivenessCheck`: `api_key_id` nullable + cột `source` (Task 1).
- `backend/app/routers/_liveness_helpers.py` — `_save_liveness` thêm `source` + guard quota (Task 2).
- `backend/app/routers/playground.py` — endpoint mới `/playground/detect/liveness` (Task 2).
- `backend/tests/test_playground_liveness.py` — doc test rule quota (Task 2, tạo mới).
- `backend/app/schemas/liveness.py` — `LivenessListItem` thêm `source` (Task 3).
- `backend/app/routers/liveness.py` — `list_liveness_checks` trả `source` (Task 3).
- `frontend/src/lib/api.ts` — `playgroundDetectLiveness()` + `LivenessListItem.source` (Task 4).
- `frontend/src/components/deepguard/liveness-page.tsx` — bỏ apiKey + gate, đổi call (Task 4).
- `frontend/src/components/deepguard/history-page.tsx` — map `source: it.source` (Task 4).

---

## Task 1: Schema — `LivenessCheck.api_key_id` nullable + cột `source`

**Files:**
- Modify: `deepguard_db/app/db/models.py:462` (+ thêm 1 dòng cột `source`)

**Interfaces:**
- Produces: `LivenessCheck.api_key_id` (nullable), `LivenessCheck.source: str` (default `"api"`) — Task 2/3 dựa vào.

- [ ] **Step 1: Sửa model — api_key_id nullable + thêm cột source**

Tại `deepguard_db/app/db/models.py`, dòng 462 hiện là:
```python
    api_key_id:         Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("api_keys.id"), nullable=False)
```
Đổi thành (mirror `Detection`, models.py:291-292):
```python
    api_key_id:         Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("api_keys.id"), nullable=True)
    source:             Mapped[str]      = mapped_column(String(20), nullable=False, default="api")  # 'api' | 'playground'
```
(`Optional`, `String` đã được import sẵn trong file — kiểm tra đầu file nếu nghi ngờ.)

- [ ] **Step 2: Verify model nạp được + cột đúng (không cần DB)**

Run:
```bash
cd backend && .venv310/bin/python -c "from deepguard_db.app.db.models import LivenessCheck as L; c=L.__table__.columns; print('api_key_id nullable=', c['api_key_id'].nullable); print('has source=', 'source' in c)"
```
Expected:
```
api_key_id nullable= True
has source= True
```

- [ ] **Step 3: Áp schema vào Postgres local đang chạy (ALTER — giữ data)**

Run:
```bash
docker exec -i deepguard-db psql -U postgres -d deepguard -c "ALTER TABLE liveness_checks ALTER COLUMN api_key_id DROP NOT NULL; ALTER TABLE liveness_checks ADD COLUMN IF NOT EXISTS source VARCHAR(20) NOT NULL DEFAULT 'api';"
```
Expected: in `ALTER TABLE` (2 lần), không lỗi.

- [ ] **Step 4: Commit**

```bash
git add deepguard_db/app/db/models.py
git commit -m "feat(db): LivenessCheck.api_key_id nullable + cột source cho playground"
```

---

## Task 2: Backend — `_save_liveness` source/quota + endpoint `/playground/detect/liveness`

**Files:**
- Modify: `backend/app/routers/_liveness_helpers.py:16-57` (`_save_liveness`)
- Modify: `backend/app/routers/playground.py` (thêm imports + endpoint)
- Test: `backend/tests/test_playground_liveness.py` (tạo mới)

**Interfaces:**
- Consumes: `LivenessCheck.source` (Task 1); `run_liveness_check(image_bytes, threshold=...) -> LivenessResult` (`app/services/liveness.py`); `_to_response(row) -> LivenessResponse`; `_playground_user` (đã có trong playground.py).
- Produces: `POST /playground/detect/liveness` (JWT) → `LivenessResponse`; `_save_liveness(..., source: str = "api")`.

- [ ] **Step 1: Viết doc test rule quota (test trước)**

Tạo `backend/tests/test_playground_liveness.py`:
```python
"""Doc test — quy tắc cộng quota khi lưu liveness theo nguồn auth.

Playground (JWT, dashboard) lưu LivenessCheck với api_key_id=None -> KHÔNG cộng
quota của api_keys (không có key để cộng). API-key (/v1) -> CÓ cộng quota.
Mirror rule trong _save_liveness; không gọi DB (đúng style repo).
"""
import uuid
from typing import Optional


def should_charge_apikey_quota(api_key_id: Optional[uuid.UUID]) -> bool:
    """True nếu cần UPDATE api_keys.quota_used (chỉ khi có api_key_id)."""
    return api_key_id is not None


def test_playground_jwt_skips_quota():
    assert should_charge_apikey_quota(None) is False


def test_apikey_charges_quota():
    assert should_charge_apikey_quota(uuid.uuid4()) is True
```

- [ ] **Step 2: Chạy test — phải PASS (rule thuần)**

Run: `cd backend && .venv310/bin/python -m pytest tests/test_playground_liveness.py -q`
Expected: `2 passed`.

- [ ] **Step 3: Sửa `_save_liveness` — thêm `source` + guard quota**

Trong `backend/app/routers/_liveness_helpers.py`, đổi chữ ký hàm (dòng 16-24) thành:
```python
async def _save_liveness(
    db: AsyncSession,
    *,
    tenant_id: uuid.UUID,
    api_key_id: uuid.UUID | None,
    result: LivenessResult,
    mode: str,
    request: Request,
    source: str = "api",
) -> LivenessCheck:
```
Trong `LivenessCheck(...)` (dòng 25), thêm `source=source,` ngay sau `api_key_id=api_key_id,`:
```python
    row = LivenessCheck(
        tenant_id=tenant_id,
        api_key_id=api_key_id,
        source=source,
        verdict=LivenessVerdict(result.verdict),
```
Thay khối cộng quota (dòng 49-53) thành (chỉ cộng khi có key):
```python
    # Same quota accounting as detection — chỉ khi có API key (playground JWT: api_key_id=None -> bỏ qua)
    if api_key_id is not None:
        await db.execute(
            update(ApiKeyModel).where(ApiKeyModel.id == api_key_id)
            .values(quota_used=ApiKeyModel.quota_used + 1)
        )
    await crud.increment_tenant_usage(db, tenant_id)
```

- [ ] **Step 4: Thêm imports vào `playground.py`**

Trong `backend/app/routers/playground.py`, sau khối import hiện có (quanh dòng 24), thêm:
```python
import io
from PIL import Image
from app.services.liveness import run_liveness_check
from app.routers._liveness_helpers import _save_liveness, _to_response
from app.schemas.liveness import LivenessResponse
```

- [ ] **Step 5: Thêm endpoint `/playground/detect/liveness`**

Cuối `backend/app/routers/playground.py`, thêm:
```python
@router.post("/detect/liveness", response_model=LivenessResponse)
async def playground_detect_liveness(
    request: Request,
    file: UploadFile = File(...),
    threshold: float = Query(default=None, ge=0.0, le=1.0,
        description="Ngưỡng LIVE/SPOOF override (0-1). Bỏ trống => LIVENESS_THRESHOLD ở config."),
    current_user: User = Depends(_playground_user),
    db: AsyncSession = Depends(get_db),
):
    """Passive liveness bằng JWT cho Playground (KHÔNG cần API key). Lưu source='playground'."""
    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise bad_request(f"Unsupported file type: {file.content_type}")
    image_bytes = await file.read()
    if len(image_bytes) > MAX_IMAGE_SIZE:
        raise bad_request("File size exceeds 10 MB limit")
    try:
        Image.open(io.BytesIO(image_bytes)).verify()
    except Exception:
        raise bad_request("File không phải ảnh hợp lệ (không giải mã được).")

    result = await run_liveness_check(image_bytes, threshold=threshold)
    row = await _save_liveness(
        db, tenant_id=current_user.tenant_id, api_key_id=None,
        result=result, mode="passive", request=request, source="playground",
    )
    return _to_response(row)
```
Thêm `Request` vào dòng import fastapi đầu file (đang là `from fastapi import APIRouter, Depends, UploadFile, File, Query`):
```python
from fastapi import APIRouter, Depends, UploadFile, File, Query, Request
```

- [ ] **Step 6: Verify cú pháp**

Run: `cd backend && .venv310/bin/python -c "import app.routers.playground, app.routers._liveness_helpers; print('ok')"`
Expected: `ok` (không traceback).

- [ ] **Step 7: Smoke endpoint bằng curl (cần stack chạy — `./up.sh`)**

Run (lấy JWT rồi gọi playground liveness, KHÔNG gửi API key):
```bash
TOKEN=$(curl -s -X POST http://localhost:8000/auth/login -H 'Content-Type: application/json' \
  -d '{"email":"dev@vietbank.vn","password":"Password123!"}' | python3 -c "import sys,json;print(json.load(sys.stdin)['access_token'])")
curl -s -X POST "http://localhost:8000/playground/detect/liveness" \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@ekyc_demo/samples/real_01.jpg" | python3 -m json.tool
```
Expected: HTTP body JSON có `"verdict"` (LIVE/SPOOF/UNCERTAIN) + `"mode": "passive"`; **không** lỗi 401/403. (Đổi đường dẫn ảnh nếu sample khác.)

- [ ] **Step 8: Verify không hồi quy — `/v1/detect/liveness` vẫn chặn khi thiếu key**

Run:
```bash
curl -s -o /dev/null -w "%{http_code}\n" -X POST "http://localhost:8000/v1/detect/liveness" -F "file=@ekyc_demo/samples/real_01.jpg"
```
Expected: `401` (hoặc 403) — endpoint API-key vẫn yêu cầu key.

- [ ] **Step 9: Commit**

```bash
git add backend/app/routers/_liveness_helpers.py backend/app/routers/playground.py backend/tests/test_playground_liveness.py
git commit -m "feat(api): /playground/detect/liveness (JWT) — thử liveness không cần API key"
```

---

## Task 3: Backend — lộ `source` ra `LivenessListItem` + list endpoint

**Files:**
- Modify: `backend/app/schemas/liveness.py:45-56` (`LivenessListItem`)
- Modify: `backend/app/routers/liveness.py:164-167` (đảm bảo trả `source`)

**Interfaces:**
- Consumes: `LivenessCheck.source` (Task 1).
- Produces: `LivenessListItem.source: str` trong response của `GET /liveness`.

- [ ] **Step 1: Thêm field `source` vào `LivenessListItem`**

Trong `backend/app/schemas/liveness.py`, trong class `LivenessListItem` (sau `model_version` dòng 53), thêm:
```python
    source: str = "api"               # 'api' | 'playground'
```
(`LivenessListItem` đã có `model_config = {"from_attributes": True}` → tự đọc `row.source`.)

- [ ] **Step 2: Verify list endpoint vẫn `model_validate` đúng**

`liveness.py:165` dùng `LivenessListItem.model_validate(r)` — `r` là `LivenessCheck` đã có `.source`, nên tự map. Không cần sửa code endpoint. Verify import:
Run: `cd backend && .venv310/bin/python -c "import app.routers.liveness; from app.schemas.liveness import LivenessListItem; print('source' in LivenessListItem.model_fields)"`
Expected: `True`

- [ ] **Step 3: Smoke — list trả `source`**

Run (dùng `$TOKEN` từ Task 2 Step 7, hoặc login lại):
```bash
curl -s "http://localhost:8000/liveness?page=1&limit=5" -H "Authorization: Bearer $TOKEN" | python3 -c "import sys,json; d=json.load(sys.stdin); print([i.get('source') for i in d['items']])"
```
Expected: list các giá trị `'api'`/`'playground'` (ít nhất phần tử vừa tạo ở Task 2 là `'playground'`).

- [ ] **Step 4: Commit**

```bash
git add backend/app/schemas/liveness.py
git commit -m "feat(api): trả source trong LivenessListItem (badge playground ở History)"
```

---

## Task 4: Frontend — bỏ rào apiKey + dùng playground + badge History

**Files:**
- Modify: `frontend/src/lib/api.ts` (thêm `playgroundDetectLiveness`, `LivenessListItem.source`)
- Modify: `frontend/src/components/deepguard/liveness-page.tsx:6,28,106,116`
- Modify: `frontend/src/components/deepguard/history-page.tsx:205`

**Interfaces:**
- Consumes: `POST /playground/detect/liveness` (Task 2); `LivenessListItem.source` (Task 3).
- Produces: `playgroundDetectLiveness(file: File, threshold?: number) => Promise<LivenessResponse>`.

- [ ] **Step 1: Thêm `playgroundDetectLiveness` + `source` vào `api.ts`**

Trong `frontend/src/lib/api.ts`, ngay sau `playgroundDetectVideo` (dòng 315), thêm:
```typescript
export const playgroundDetectLiveness = (file: File, threshold?: number) => {
  const form = new FormData();
  form.append("file", file);
  const q = threshold != null ? `?threshold=${threshold}` : "";
  return req<LivenessResponse>(`/playground/detect/liveness${q}`, { method: "POST", body: form });
};
```
Trong `interface LivenessListItem` (dòng 204), thêm field:
```typescript
  source?: string;                  // 'api' | 'playground'
```

- [ ] **Step 2: `liveness-page.tsx` — bỏ apiKey, đổi sang playground**

Trong `frontend/src/components/deepguard/liveness-page.tsx`:
- Dòng 6: đổi import `detectLivenessPassive,` → `playgroundDetectLiveness,`.
- Dòng 28: **xoá** `const apiKey = useAuthStore((s) => s.apiKey);` (nếu `useAuthStore` không còn dùng chỗ khác trong file thì xoá luôn import dòng 4 — kiểm tra trước khi xoá).
- Dòng 106: **xoá** dòng gate `if (!apiKey) { setError('Chưa có API Key. Vào API Keys → tạo key'); return; }`.
- Dòng 116: đổi `const res = await detectLivenessPassive(target, apiKey, threshold);` → `const res = await playgroundDetectLiveness(target, threshold);`.

- [ ] **Step 3: Quét text "API Key" còn sót trên trang liveness**

Run: `cd frontend && grep -n -i "api key" src/components/deepguard/liveness-page.tsx`
Expected: không còn dòng nào hướng dẫn "tạo key" để chạy. Nếu còn câu chữ kiểu "Chưa có API Key… tạo key", xoá/sửa cho khớp (giờ không cần key).

- [ ] **Step 4: `history-page.tsx` — map source thật để hiện badge playground**

Trong `frontend/src/components/deepguard/history-page.tsx`, dòng 205, đổi:
```typescript
          source: 'liveness',
```
thành:
```typescript
          source: it.source,
```
(Badge type vẫn do `kind: 'liveness'` ở dòng 206 quyết định; `source` giờ mang `'api'`/`'playground'` để khớp check `r.source === 'playground'` ở dòng 492/537.)

- [ ] **Step 5: Verify typecheck/build**

Run: `cd frontend && bunx tsc --noEmit`
Expected: không lỗi type liên quan các file vừa sửa. (Nếu repo dùng `next lint`/`bun run build` thì chạy thay thế.)

- [ ] **Step 6: Smoke thủ công (stack đang chạy)**

1. Đăng nhập `dev@vietbank.vn`. Đảm bảo tenant **chưa có/không cần** API key.
2. Vào **Liveness Check** → upload 1 ảnh mặt → bấm CHECK.
   - Kỳ vọng: ra kết quả LIVE/SPOOF, **không** còn thông báo "Chưa có API Key".
3. Vào **History** → tìm dòng liveness vừa tạo → thấy badge **Playground**.

- [ ] **Step 7: Commit**

```bash
git add frontend/src/lib/api.ts frontend/src/components/deepguard/liveness-page.tsx frontend/src/components/deepguard/history-page.tsx
git commit -m "feat(fe): Liveness thử bằng JWT (bỏ rào API key) + badge playground ở History"
```

---

## Self-Review (đã rà với spec)

- **Spec coverage:** §3 schema → Task 1; router playground + `_save_liveness` → Task 2; list badge → Task 3; `api.ts`/`liveness-page` → Task 4; §5 migration → Task 1 Step 3 (local ALTER) + AWS ALTER ghi ở spec/runbook; §6 test → Task 2 (doc test + curl smoke) + Task 2 Step 8 (chống hồi quy 401); §9 dead code → ngoài phạm vi (không task — đúng quyết định).
- **Placeholder scan:** không có TODO/TBD; mọi step có lệnh/đoạn code thật.
- **Type consistency:** `_save_liveness(..., source: str="api")` khớp lời gọi ở Task 2 (`source="playground"`) và `/v1` (mặc định `"api"`); `LivenessListItem.source` (BE Task 3) khớp `it.source` (FE Task 4); `playgroundDetectLiveness(file, threshold?)` khớp lời gọi `playgroundDetectLiveness(target, threshold)`.
- **Lưu ý AWS:** trước redeploy phải chạy 2 câu `ALTER TABLE liveness_checks ...` (spec §5) — không recreate vì có dữ liệu thật.
