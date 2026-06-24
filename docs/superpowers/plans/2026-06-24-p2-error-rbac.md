# P2 — Error mapping + validate hardening (Plan)

**Goal:** Đóng các lỗ 500-do-input + thiếu validate trong surface in-scope (theo spec "đúng chuẩn").
**Branch:** `p2-error-rbac` → merge `dev-thanhln-24062026`.

## Gaps (xác minh từ code, 2026-06-24)
| ID | File:line | Hiện tại | Fix |
|----|-----------|----------|-----|
| B3 | `backend/app/routers/detections.py:39` | `DetectionVerdict(verdict)` với verdict lạ → ValueError → **500** | try/except → `bad_request` (400) |
| B4 | `serving/liveness_server.py` `/predict` | ảnh rác/rỗng → Exception → **500** (client dịch 503 "service down") | validate decode đầu hàm → **400** |
| PW | `backend/app/schemas/auth.py:67` | `ChangePasswordRequest.new_password` thiếu `min_length` | `Field(..., min_length=8, max_length=128)` (khớp register/accept-invite/create-user) |

*B7 (sysadmin protection) đã xong ở T1 (46619b8). RBAC in-scope đã enforce (require_role/_require_admin/SoD) — không lỗ rõ thêm.*

## Tasks
- **T1 (B3):** detections.py — import `bad_request`; bọc `DetectionVerdict(verdict)` try/except ValueError → 400.
- **T2 (B4):** liveness_server.py — sau `image_bytes = await file.read()`, `Image.open(BytesIO).verify()` try/except → 400 trước khi vào inference.
- **T3 (PW):** auth.py — `new_password: str = Field(..., min_length=8, max_length=128)`.

## Verify (stack restart backend + serving liveness)
- B3: `GET /detections?verdict=BOGUS` (JWT) → **400** (was 500).
- B4: POST `:8502/predict` ảnh rác → **400** (was 500).
- PW: `POST /auth/change-password` new_password="short" (JWT) → **422** (Pydantic).
- Regress: `GET /detections` (no verdict) → 200; `:8502/predict` ảnh thật → 200.
- `pytest` xanh.

## Commit
1 commit: `fix(api): error mapping detections/liveness 500→400 + password min-8`. No co-author.
