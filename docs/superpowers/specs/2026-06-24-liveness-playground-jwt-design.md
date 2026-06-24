# Liveness Playground (JWT) — bỏ rào "phải tạo API key" để thử trong dashboard

> Ngày: 2026-06-24 · Branch: `dev-thanhln-22062026` · Tác giả: Thanh (DeepGuard)

## 1. Vấn đề

Trong dashboard (người dùng đã đăng nhập bằng JWT), hai trang "thử nhanh" lại xác thực
khác nhau — một bất đối xứng có thật trong code:

| Trang (đã login dashboard) | Endpoint gọi | Cần API key? |
|---|---|---|
| Deepfake **API Playground** | `POST /playground/detect/image` (JWT) | ❌ Không — đúng |
| **Liveness Check** | `POST /v1/detect/liveness` (API key) | ✅ Có — **vô lý** |

Bằng chứng: [`liveness-page.tsx:106`](../../../frontend/src/components/deepguard/liveness-page.tsx)
chặn `if (!apiKey) { setError('Chưa có API Key. Vào API Keys → tạo key'); return; }`, rồi
[`:116`](../../../frontend/src/components/deepguard/liveness-page.tsx) gọi
`detectLivenessPassive(target, apiKey, threshold)`.

Trong khi deepfake đã có sẵn router JWT riêng
([`backend/app/routers/playground.py`](../../../backend/app/routers/playground.py)) đúng cho
mục đích "thử sau khi login", không cần API key.

**Phân định đúng:** API key dùng cho **dev tích hợp predict vào app ngoài** (máy khác, không có
session JWT). Còn giao diện dashboard chỉ để **thử** → đã có JWT thì không cần key.

## 2. Quyết định

Thêm endpoint **`POST /playground/detect/liveness`** (JWT, role admin/developer) đối xứng hoàn
toàn với deepfake playground; cho trang Liveness gọi nó và **bỏ rào API key**. Endpoint
API-key `POST /v1/detect/liveness` **giữ nguyên** cho tích hợp ngoài.

Kết quả thử ở dashboard **có lưu** vào lịch sử Liveness với badge `playground`
(`api_key_id = NULL`) — đối xứng với deepfake playground (đã chốt với người dùng).

## 3. Thay đổi cụ thể (file:dòng)

### Schema — `deepguard_db/app/db/models.py` (class `LivenessCheck`, ~dòng 452-496)
- `api_key_id`: `nullable=False` → **`nullable=True`** (giống `Detection.api_key_id`, models.py:291).
- Thêm cột **`source: Mapped[str] = mapped_column(String(20), nullable=False, default="api")`**
  (`'api' | 'playground'`) — giống `Detection.source` (models.py:292).

### Backend — `backend/app/routers/playground.py`
- Thêm `POST /playground/detect/liveness`:
  - `Depends(_playground_user)` (role admin/developer, JWT — đã có sẵn trong file).
  - Nhận `file: UploadFile`, `threshold: float | None` (Query).
  - Validate content-type ∈ `ALLOWED_IMAGE_TYPES` + size ≤ 10 MB + `Image.open(BytesIO).verify()`
    (chặn file rác — như router gốc liveness.py:75).
  - Gọi `run_liveness_check(image_bytes, threshold=threshold)`.
  - Lưu qua `_save_liveness(..., api_key_id=None, source="playground", ...)`.
  - Trả `LivenessResponse` qua `_to_response(row)`.

### Backend — `backend/app/routers/_liveness_helpers.py` (`_save_liveness`, dòng 16)
- Thêm tham số **`source: str = "api"`**, gán vào `LivenessCheck(source=source, ...)`.
- **Bỏ qua** `UPDATE api_keys.quota_used` khi `api_key_id is None` (chỉ chạy `increment_tenant_usage`).
  `/v1/detect/liveness` truyền `source="api"` (mặc định) → hành vi cũ không đổi.

### Backend — badge trong lịch sử
- `LivenessListItem` (`backend/app/schemas/liveness.py`) + list endpoint
  (`liveness.py:140` `list_liveness_checks`) trả thêm field **`source`** (mirror deepfake history).

### Frontend — `frontend/src/lib/api.ts`
- Thêm `playgroundDetectLiveness(file: File, threshold?: number)` →
  `POST /playground/detect/liveness` (JWT, **không** truyền apiKey) — đặt cạnh block
  `// ── Playground (JWT, dashboard) ──` (api.ts:301).
- `LivenessListItem` thêm `source?: string`.

### Frontend — `frontend/src/components/deepguard/liveness-page.tsx`
- **Bỏ** `const apiKey = useAuthStore((s) => s.apiKey);` (dòng 28).
- **Bỏ** gate `if (!apiKey) {...}` (dòng 106).
- Đổi `detectLivenessPassive(target, apiKey, threshold)` → `playgroundDetectLiveness(target, threshold)`
  (dòng 116).
- Quét và xoá mọi text hướng dẫn "Vào API Keys → tạo key" còn sót trên trang.
- (Nếu trang Liveness có cột/bảng lịch sử) hiện badge `playground` như History deepfake.

## 4. Error handling
- File không phải ảnh hợp lệ → **400** (`bad_request`, PIL verify).
- Role không thuộc admin/developer → **403** (`require_role`).
- Không phát hiện mặt → verdict **UNCERTAIN** từ model (không đổi).

## 5. Schema / migration
- **Local (WSL/dev):** recreate bảng `liveness_checks` (cách dev đang dùng) — không cần Alembic.
- **AWS (đang chạy dữ liệu thật):** KHÔNG recreate. Chạy:
  ```sql
  ALTER TABLE liveness_checks ALTER COLUMN api_key_id DROP NOT NULL;
  ALTER TABLE liveness_checks ADD COLUMN IF NOT EXISTS source VARCHAR(20) NOT NULL DEFAULT 'api';
  ```
  Ghi vào runbook deploy.

## 6. Test & verify
- **pytest (backend):**
  - `POST /playground/detect/liveness` (JWT, KHÔNG có API key) → **200** + `source == "playground"`.
  - `POST /v1/detect/liveness` thiếu key → vẫn **401** (không hồi quy).
  - File rác → 400; role viewer → 403.
- **Smoke thủ công:** tenant **chưa tạo key nào** → mở trang Liveness → upload/chụp →
  ra LIVE/SPOOF được, không còn thông báo "Chưa có API Key".

## 7. Rủi ro / giới hạn
- AWS có dữ liệu thật → phải `ALTER TABLE`, tuyệt đối không recreate (mất lịch sử).
- Active liveness (multi-frame challenge) vẫn chỉ qua API key — trang Liveness hiện chỉ dùng
  passive (1 ảnh), nên không trong phạm vi lần này. Nếu sau muốn thử active trong dashboard sẽ
  thêm `/playground/detect/liveness/active` tương tự.

## 8. Ngoài phạm vi (YAGNI)
- Không đụng `/v1/detect/liveness` (giữ nguyên cho tích hợp ngoài).
- Không thêm quota/billing cho lượt thử playground (chỉ `increment_tenant_usage` như deepfake).

## 9. Ghi chú audit — lỗi cùng kiểu ("dashboard bắt API key")
Đã rà toàn bộ `frontend/src/components/deepguard/*` + `lib/api.ts`:
- **Chỉ `liveness-page` là trang "thử" trong dashboard còn bắt API key** (= bug này). Deepfake
  playground đã dùng JWT đúng. eKYC/Streamlit dùng API key là **đúng** (app ngoài, không có JWT).
- **Mã chết cùng họ** trong `lib/api.ts` (di chứng lần migrate deepfake sang playground JWT) —
  không gọi ở đâu trong FE: `detectImage` (:278), `detectVideo` (:295), `detectGetResult` (:285),
  `livenessGetChallenge` (:188), `detectLivenessActive` (:191); sau fix này `detectLivenessPassive`
  (:181) cũng thành mã chết. **Quyết định: ĐỂ NGUYÊN** (không gây lỗi runtime; dọn sau nếu cần) —
  giữ phạm vi spec tối thiểu, an toàn.
