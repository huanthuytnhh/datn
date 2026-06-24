# Hiểu Source DeepGuard — Sổ tay cho intern (để KHÔNG vibe-code)

> Mục tiêu: đọc xong tài liệu này bạn **giải thích được toàn hệ thống trước hội đồng** mà không cần mở từng file. Mỗi phần có "📂 mở file nào" để tra cứu nhanh. Code do AI sinh, nhưng kiến trúc dưới đây là **sự thật đã kiểm chứng từ source**.

---

## 0. Bức tranh tổng thể (đọc phần này trước)

DeepGuard là hệ **phát hiện deepfake + liveness cho eKYC ngân hàng**. Có **3 khối code** + **2 microservice model** + **DB** + **S3**:

```
                 ┌─────────────────────────────────────────────────────┐
   Trình duyệt → │ FRONTEND (Next.js :3000)  ── dashboard quản trị      │
   (nhân viên     │   login JWT, xem history, cấp API key, thử playground │
    ngân hàng)    └───────────────┬─────────────────────────────────────┘
                                  │ HTTP (JWT Bearer)
                                  ▼
   App của dev   ┌─────────────────────────────────────────────────────┐
   tenant   ───→ │ BACKEND (FastAPI :8000)  ── "tổng đài" điều phối     │
   (ekyc_demo)   │   auth 2 lớp, ghi DB audit, gọi model, quota         │
   API-key Bearer└───┬───────────────────────┬─────────────────┬───────┘
                     │ httpx                  │ httpx           │ SQL (qua deepguard_db)
                     ▼                        ▼                 ▼
            ┌──────────────────┐    ┌──────────────────┐   ┌──────────┐
            │ serving :8501    │    │ serving :8502    │   │ Postgres │
            │ SFDCT deepfake   │    │ Liveness model   │   │  + MinIO │
            │ (model THẬT,torch)│    │ (model THẬT)     │   │  (S3)    │
            └──────────────────┘    └──────────────────┘   └──────────┘
```

**Ý tưởng cốt lõi phải thuộc:**
- **Backend KHÔNG chạy model.** Nó chỉ là *tổng đài*: nhận request → gọi microservice model (:8501/:8502) qua HTTP → ghi kết quả vào DB → trả về. Model nặng (torch) chạy riêng ở `serving/`.
- **Hai "khách" của backend khác nhau:**
  - **Frontend dashboard** (nhân viên ngân hàng đã đăng nhập) → dùng **JWT**.
  - **App tích hợp ngoài** (ekyc_demo — dev của tenant) → dùng **API key**.
  - → Đây là lý do có **auth 2 lớp**, và là gốc của task ta đang sửa (liveness trong dashboard không nên đòi API key).
- **Deepfake ≠ Liveness:**
  - *Deepfake*: "ảnh/video này có bị AI tạo/ghép không?" (model SFDCT, miền tần số DCT).
  - *Liveness*: "có phải người thật ngồi trước camera không?" (chống ảnh in, phát lại màn hình, mặt nạ).

---

## 1. BACKEND (`backend/`) — tổng đài điều phối

**Vai trò:** API gateway + lớp audit. Nhận HTTP → xác thực → gọi model microservice → ghi Postgres → trả JSON. Không suy luận model tại đây.

📂 `backend/app/`
| Thư mục | Trách nhiệm |
|---|---|
| `routers/` | Mỗi file = 1 nhóm API (detect, liveness, auth, api_keys, detections, analytics, playground…) |
| `services/` | Logic gọi model: `ml_inference.py` (facade `run_inference`), `ml_video.py`, `liveness.py`, `storage.py` (S3), `metrics.py` (CloudWatch) |
| `core/` | `security.py` (JWT, hash mật khẩu), `exceptions.py` (wrap HTTPException) |
| `schemas/` | Pydantic request/response (DetectionResponse, LivenessResponse…) |
| `config.py` | Settings từ `.env` (DATABASE_URL, SECRET_KEY, SFDCT_INFER_URL, MOCK_ML…) |
| `dependencies.py` | **Trái tim auth 2 lớp** (xem §1.2) |

### 1.1 Luồng 1 request "detect ảnh" (thuộc lòng được thì rất mạnh khi bảo vệ)
`POST /v1/detect/image` (file + Bearer API-key)
1. `dependencies.get_api_key_auth()` — băm key, kiểm tra tenant active + còn quota.
2. `routers/detect.py:detect_image()` — validate ảnh thật bằng `Image.open().verify()` (chặn file rác giả đuôi).
3. `services/ml_inference.py:run_inference()` → `_sfdct_inference()` → `httpx.post(SFDCT_INFER_URL + "/predict")` sang **:8501**.
4. Nhận `prob_fake` + heatmap → tính `risk_score`/`risk_band` → `crud.create_detection()` ghi Postgres.
5. (tùy bật) upload heatmap/ảnh lên **S3/MinIO**, bắn metric **CloudWatch**, `+1 quota`.
6. Trả `DetectionResponse`.

📂 `backend/app/routers/detect.py:41`, `services/ml_inference.py` (`run_inference`, `_sfdct_inference`), `deepguard_db/.../crud.py:create_detection`.

### 1.2 Auth 2 lớp (câu thầy CỰC hay hỏi)
Cả hai đều gửi header `Authorization: Bearer <…>`, nhưng:
| | JWT (dashboard) | API key (tích hợp ngoài) |
|---|---|---|
| Ai dùng | Nhân viên ngân hàng đã login | App của dev tenant (ekyc_demo) |
| Cấp ở | `POST /auth/login` → token HS256 hết hạn ~60′ | Tạo ở trang API Keys, dạng `sk-dg-…`, băm SHA-256 lưu DB |
| Kiểm ở | `get_current_user()` → ra `User` (có role) | `get_api_key_auth()` → ra `ApiKey` (có quota/tenant) |
| Phân quyền | **RBAC 5 role**: sysadmin, admin, developer, compliance, viewer | Không role — ranh giới là **quota + tenant** |

📂 `backend/app/dependencies.py` (`get_current_user`, `get_api_key_auth`, `require_role`), `core/security.py`.

> 🔑 **Liên hệ task đang làm:** trang Liveness trong dashboard đang gọi endpoint `/v1/...` (API-key) → bắt nhân viên tạo key một cách vô lý. Ta thêm `/playground/detect/liveness` (JWT) cho đúng tầng.

### 1.3 Tầng DB — vì sao tách `deepguard_db/`
Backend **không tự viết SQL**; mọi truy cập DB đi qua package `deepguard_db` (`models.py` + `crud.py`). Lý do bảo vệ được: (1) nhiều nơi dùng chung (backend, job, webhook); (2) tập trung schema/migration; (3) dễ test (mock hàm crud).
Bảng chính: **Tenant** (gốc multi-tenant) → **User**, **ApiKey**, **Detection**, **LivenessCheck**, **Job**, **Webhook**, **AuditLog**.
- **Multi-tenant isolation:** mọi bảng có `tenant_id`; code luôn dùng `user.tenant_id` (không nhận tenant từ client) → tenant A không xem được dữ liệu tenant B.
- **Soft delete:** User/ApiKey xóa mềm (`deleted_at`) để giữ vết audit (Detection vẫn trỏ tới key cũ).

📂 `deepguard_db/app/db/models.py`, `crud.py`, `database.py`.

### 1.4 `serving/` — nơi model THẬT chạy
- `infer_server.py` (:8501): nạp model deepfake **sfdct/b4/hff**, `POST /predict` trả `prob_fake` + Grad-CAM.
- `liveness_server.py` (:8502): nạp model liveness, trả `liveness_score` ∈ [0,1].
- Backend trỏ tới qua `SFDCT_INFER_URL`, `LIVENESS_INFER_URL` trong `.env`.
- **Mock vs Real:** nếu các URL trống / `MOCK_ML=true` → backend trả kết quả giả *xác định theo hash ảnh* (để smoke test không cần GPU). Có URL/model → kết quả thật. Đây là lý do từng gặp "Heatmap không khả dụng" = đang chạy mock.

---

## 2. FRONTEND (`frontend/`) — dashboard quản trị

**Vai trò:** giao diện cho nhân viên/tenant: xem KPI, lịch sử, cấp API key, thử nhanh model (playground/liveness). Người dùng chỉ thấy *verdict* + *risk_band* + *heatmap*, không thấy model.

📂 `frontend/src/`
| Nhóm | Trách nhiệm |
|---|---|
| `app/` | Next.js App Router (SSR + layout) |
| `components/deepguard/*` | Từng trang dashboard (mỗi trang 1 file) |
| `components/ui/*` | Component tái dùng (shadcn): button, dialog, table… |
| `lib/api.ts` | **Tầng gọi backend** (hàm `req<T>()`) |
| `lib/rbac.ts` | Phân quyền hiển thị theo role |
| `store/auth.ts` | Zustand: token, user, tenant, apiKey |

### 2.1 `lib/api.ts` — phân biệt JWT vs API-key (rất quan trọng)
Hàm `req<T>(path, init, bearer?)`:
- Không truyền `bearer` → tự lấy **JWT** từ `localStorage['dg_token']` → dùng cho `/auth`, `/playground/*`, `/detections`, `/liveness` (list)…
- Truyền `bearer = apiKey` → gắn API key → dùng cho `/v1/detect/*` (mô phỏng tích hợp ngoài).
- Gặp **401** → tự xoá token + phát sự kiện `dg:session-expired` (đăng xuất).

📂 `frontend/src/lib/api.ts:1-31` (`req`, `getToken`), khối "Playground (JWT)" ở dòng ~301.

### 2.2 Các trang chính
| Trang | Chức năng | Gọi model? |
|---|---|---|
| `playground-page.tsx` | Thử deepfake nhanh (ảnh/video, sample preset, heatmap) | ✅ `playgroundDetectImage/Video` (JWT) |
| `liveness-page.tsx` | Thử liveness (upload/webcam) | ✅ hiện dùng `detectLivenessPassive` (**API-key — đang sửa**) |
| `dashboard-page.tsx` | KPI tổng quan, theo role | ❌ |
| `history-page.tsx` | Lịch sử deepfake + liveness gộp, có badge `playground` | ❌ (chỉ list) |
| `apikeys-page.tsx` | Tạo/thu hồi API key, xem quota | ❌ |
| `detail-page.tsx`, `audit-page.tsx`, `team-page.tsx`, `models-page.tsx`, `tenants-page.tsx`, `billing-page.tsx` | Chi tiết / audit / nhân sự / ngưỡng model / tenant / quota | ❌ |

### 2.3 Khái niệm dễ nhầm (để trả lời thầy gọn)
- **verdict** = nhãn cứng (REAL/FAKE/UNCERTAIN). **risk_band** = tín hiệu rủi ro mềm (low/medium/high) để *gợi ý* quyết định eKYC, không phải quyết định cuối.
- **heatmap (Grad-CAM)** = vùng ảnh model "chú ý" → để auditor *hiểu vì sao*, không phải điểm số.
- **RBAC ở FE chỉ là mỹ phẩm** (ẩn/hiện nút). **Backend mới là chốt chặn thật** — gõ thẳng URL không qua được vì backend kiểm token + role.
- **Token để localStorage là điểm yếu** (XSS đọc được) → đã ghi nhận là giới hạn "đồ án, không hardening production".

---

## 3. EKYC-DEMO (`ekyc_demo/`) + pipeline liveness

**Vai trò (khác hẳn frontend):** đây là **app của KHÁCH HÀNG** — mô phỏng một dev tenant *tích hợp API DeepGuard vào app của họ*. Là **Streamlit**, nhập **API key**, gọi các endpoint `/v1/detect/*` từ ngoài. Nó chứng minh "tích hợp dễ thế nào", không phải trang quản trị.

📂 `ekyc_demo/app.py` (UI + gọi API), `requirements.txt`, `.streamlit/config.toml` (ghim cổng riêng để khỏi đụng :8501).

### 3.1 Cascade eKYC (spec 2.1 — phải thuộc)
```
Upload → [1] Liveness  ──SPOOF→ FAIL (dừng, bỏ qua deepfake)
                       ──UNCERTAIN→ REVIEW (dừng)
                       ──LIVE→ [2] Deepfake ──FAKE→ FAIL
                                            ──REAL→ PASS
```
**Vì sao cascade dừng sớm:** chặn ảnh in/phát-lại ngay từ liveness → tiết kiệm tính toán + đúng bảo mật (không phí công soi deepfake một bức ảnh in).

📂 `ekyc_demo/app.py` (cascade ~dòng 353-391; gọi `/v1/detect/liveness` header `Authorization: Bearer <key>`, field `file`).

### 3.2 `deepguard_liveness/ekyc_pipeline.py` — endpoint `/v1/ekyc/verify` (3 lớp trong 1 call)
Mount vào backend, nhận `id_card` (CCCD) + `selfie_video`, chạy:
1. **Liveness** `check_video()` — fail thì **return FAIL ngay** (cascade).
2. **Deepfake** — trích 3 frame, gọi `run_inference` (reuse của backend), ngưỡng `0.6197`.
3. **Face match** — ArcFace so CCCD ↔ selfie, cosine `≥ 0.45`.
`overall_pass = liveness ∧ deepfake ∧ face_match`.

📂 `deepguard_liveness/ekyc_pipeline.py:104` (`ekyc_verify`), `liveness.py`, `face_matching.py`.

### 3.3 Thuật toán liveness & face match (mức intern)
- **Liveness** (`liveness.py`): MediaPipe FaceMesh → **EAR** (Eye Aspect Ratio) phát hiện chớp mắt + **head yaw** (quay đầu) → `is_live = chớp ≥1 lần AND quay đầu ≥10°`. Quá ít frame có mặt → fail.
- **Face match** (`face_matching.py`): InsightFace ArcFace, lấy embedding CCCD vs nhiều frame video, **trung bình cosine ≥ 0.45** (dùng *mean* cho ổn định, không dùng *max*).

### 3.4 Giới hạn phải tự nêu trước (thầy sẽ hỏi)
- **Chống replay yếu:** yaw/blink là heuristic — video phát lại có sẵn chớp mắt vẫn lọt. Hướng nâng cấp: **active challenge** ("chớp 2 lần", "quay trái"), thêm tín hiệu tần số.
- **Ngưỡng phụ thuộc dữ liệu:** `0.6197` (deepfake, FPR≤5%) và `0.45` (face) calibrate trên FF++/Celeb-DF → chạy data người Việt/codec khác **phải hiệu chỉnh lại**.

---

## 4. Hai script `up.sh` / `down.sh` (để tự chạy lại)

📂 `up.sh` — bật **6 service / 7 cổng** theo thứ tự, mỗi bước có health-check (timeout, không treo):
1. `set -u` + `cd` về thư mục script + `export LANG=C.UTF-8` (tránh lỗi ký tự `✓`) + set biến S3/MinIO.
2. `[1/6]` Postgres `:5432` (docker `deepguard-db`), chờ `pg_isready`.
3. `[2/6]` MinIO `:9000/:9001` (docker `deepguard-minio`), chờ `/health/live`.
4. `[3/6]` serving deepfake `:8501` — `svc()` dùng `setsid` chạy nền, ghi log `/tmp/serving_deepfake.log`.
5. `[4/6]` serving liveness `:8502`.
6. `[5/6]` backend `:8000`.
7. `[6/6]` frontend `:3000`.
8. In URL + tài khoản `dev@vietbank.vn / Password123!` + cách xem log.

Hai "hàm khéo" trong up.sh:
- `wait_up <url> <tên>`: thử `curl` tối đa 90s, lên thì `✓`, không thì báo `✗ … CHƯA lên — xem log`.
- `svc <port> "<lệnh>" <logfile>`: `fuser -k <port>` (giết tiến trình cũ) rồi `setsid bash -c "<lệnh> >>log 2>&1" </dev/null &` (chạy nền, tách khỏi terminal).

📂 `down.sh` — tắt tất cả: `fuser -k 8000/8501/8502/3000` + `docker stop deepguard-db deepguard-minio` + in trạng thái 7 cổng để chắc chắn đã tắt. Data Postgres/MinIO **giữ nguyên**.

**Dùng:** `cd ~/deepguard/app && ./up.sh` (đợi ~60-90s) … `./down.sh`. Xem log khi chạy: `tail -f /tmp/backend.log /tmp/serving_*.log /tmp/frontend.log`.

---

## 5. "Thầy hỏi — Trả lời" (ôn nhanh trước buổi bảo vệ)

1. **Backend có chạy AI không?** Không — backend là tổng đài; model chạy ở 2 microservice `serving/` (:8501 deepfake, :8502 liveness), gọi qua HTTP. Tách để model nặng không chiếm cổng chính, update model không cần restart backend, nhiều client dùng chung.
2. **Vì sao 2 lớp auth?** JWT cho người dùng dashboard (có danh tính + role); API key cho app ngoài (không có phiên đăng nhập, cần quota/định danh app). Một tenant có thể dùng cả hai.
3. **Deepfake khác Liveness chỗ nào?** Deepfake = ảnh có bị AI tạo/ghép (miền tần số DCT). Liveness = có phải người thật trước camera (chống in/replay/mặt nạ). Khác model, khác use-case.
4. **Cascade eKYC là gì, vì sao?** Liveness trước: SPOOF→FAIL, UNCERTAIN→REVIEW, LIVE→mới chạy deepfake. Dừng sớm để chặn tấn công trình bày + tiết kiệm tính toán.
5. **Mock vs real?** Không cấu hình URL model/`MOCK_ML=true` → kết quả giả xác định theo hash (smoke test không GPU). Có model → thật. "Heatmap không khả dụng" = đang mock.
6. **Threshold ở đâu ra?** `prob_fake` là xác suất liên tục; ngân hàng đặt ngưỡng theo khẩu vị rủi ro (Thông tư 17/2024, FPR≤5%). Deepfake mặc định calibrate ~0.62, face match ~0.45 — phụ thuộc dataset, phải hiệu chỉnh lại khi đổi dữ liệu.
7. **Multi-tenant an toàn sao?** Mọi bảng có `tenant_id`; code luôn dùng `user.tenant_id`, không nhận tenant từ client → cách ly dữ liệu giữa các ngân hàng.
8. **Điểm yếu đã biết (tự nêu để ghi điểm trung thực):** token ở localStorage (XSS); chống replay liveness yếu (cần challenge); ngưỡng phụ thuộc dữ liệu. Đều là giới hạn "đồ án, chưa hardening production".

---

## 6. "Muốn sửa X thì mở file nào" (tra cứu)
| Muốn | Mở |
|---|---|
| Thêm/sửa endpoint detect | `backend/app/routers/detect.py` + `services/ml_inference.py` |
| Sửa luồng gọi model deepfake | `serving/infer_server.py` |
| Sửa liveness model phục vụ | `serving/liveness_server.py` + `backend/app/services/liveness.py` |
| Sửa auth/role | `backend/app/dependencies.py`, `core/security.py` |
| Thêm bảng/đổi schema | `deepguard_db/app/db/models.py` (+ `crud.py`) |
| Sửa cách FE gọi API | `frontend/src/lib/api.ts` |
| Sửa 1 trang dashboard | `frontend/src/components/deepguard/<tên>-page.tsx` |
| Sửa app demo tích hợp | `ekyc_demo/app.py` |
| Sửa pipeline eKYC 3 lớp | `deepguard_liveness/ekyc_pipeline.py`, `liveness.py`, `face_matching.py` |
| Bật/tắt toàn hệ | `up.sh` / `down.sh` |

---
*Tài liệu này là bản đồ để học, không thay cho đọc code. Khi cần con số/chi tiết chính xác (ngưỡng, dòng), mở đúng file ở cột "📂".*
