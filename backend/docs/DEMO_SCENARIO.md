# DeepGuard — Kịch bản demo bảo vệ (multi-tenant + predict 2 model + S3 + CloudWatch)

> Kịch bản click-by-click để demo trước hội đồng. Mỗi dòng = 1 bước, cột **Trạng thái** = đã verify chạy thật
> (ngày 2026-06-18, qua API end-to-end). Mật khẩu mẫu trong demo chỉ dùng cho môi trường dev.

## 0. Khởi động hệ thống (trước khi demo)

| # | Thành phần | Lệnh | Cổng |
|---|---|---|---|
| 0.1 | PostgreSQL | `docker start deepguard-db` | 5432 |
| 0.2 | Serving deepfake (SFDCT) | `uvicorn serving.infer_server:app --port 8501` | 8501 |
| 0.3 | Serving liveness (B4) | `uvicorn serving.liveness_server:app --port 8502` | 8502 |
| 0.4 | Backend API | `cd backend && ./start.sh` (đọc `.env`: `MOCK_ML=false`, trỏ :8501/:8502) | 8000 |
| 0.5 | Frontend dashboard | `cd frontend && bun dev` | 3000 |
| 0.6 | (tùy chọn) S3+CloudWatch | LocalStack `:4566` hoặc AWS thật + env `S3_BUCKET`/`CW_METRIC_NAMESPACE`/`AWS_ENDPOINT_URL` | 4566 |
| 0.7 | Client tenant (glm_deepfake) | đặt `DEEPGUARD_API_KEY` vào `glm_deepfake/.env` → `bun dev` (đổi cổng, tránh đụng 3000) | — |

Healthcheck: `:8501/health` và `:8502/health` trả `model_version` (deepfake `naive-sfdct-cdfv2-0.7572`, liveness `b4-liveness-auc0.9829`).

## 1. Kịch bản chính (theo đúng luồng nghiệp vụ)

**Tạo tenant — 2 HƯỚNG (chọn 1 khi demo):**

| Hướng | Actor | Thao tác | Kết quả | ✓ |
|---|---|---|---|---|
| **A. Sysadmin tạo sẵn** | Sysadmin | Quản lý Tenants → **Tạo tenant** (tên, gói, quota, email admin) | Tenant **ACTIVE ngay** + admin + **mật khẩu tạm `123456`** (đổi lần đầu) | ✅ 201 |
| **B. Tenant tự đăng ký + chờ duyệt** | Khách (anonymous) | Landing → "Dùng thử" → **Đăng ký tổ chức** | Tenant **SUSPENDED** (chờ duyệt), login bị chặn | ✅ 201 pending |
| **B (duyệt)** | Sysadmin | Tenants → tenant pending → **Duyệt** (activate) | Tenant active → admin đăng nhập được | ✅ 200 |

**Sau khi có tenant → tạo dev → glm_deepfake dùng key → xem history có tag:**

| # | Actor | Thao tác | Kết quả mong đợi | ✓ |
|---|---|---|---|---|
| 1 | **Admin tenant** | Đăng nhập (mật khẩu tạm `123456`) → **buộc đổi mật khẩu** | Vào Dashboard tổ chức | ✅ 200/204 |
| 2 | **Admin tenant** | Team & Roles → **Thêm developer** | Dev tạo trong tenant, buộc đổi mật khẩu lần đầu | ✅ 201 |
| 3 | **Developer** | Đăng nhập → đổi mật khẩu → **API Keys → Tạo key** | Key `sk-dg-…` **hiện 1 lần** | ✅ 201 |
| 4 | **glm_deepfake** | Dán key vào `glm_deepfake/.env`. **Trước khi có key**: trang Deepfake chạy DEMO MODE (không predict thật). | Badge "DEMO MODE" | ✅ |
| 5 | **glm_deepfake** | Mở trang Deepfake → **chọn 1 trong 3 ảnh mẫu** (Mặt thật / Deepfake A / Deepfake B) hoặc upload → Phân tích | Có key → gọi `/v1/detect/image` Bearer → **verdict + prob_fake**, badge "MODEL THẬT" | ✅ 200 |
| 5b | **glm_deepfake** | Upload **video** | Tách **8 frame rải đều toàn clip** → serving từng frame → verdict tổng hợp (vài giây) | ✅ 200 |
| 6 | **Developer** | Dashboard → **History** | Bản ghi vừa chạy hiện, kèm **TAG `Deepfake` / `Liveness`** (gộp cả 2 loại, lọc theo loại) | ✅ 200 |
| 7 | **Developer** | Bấm 1 dòng → **Detail** | Đúng loại: deepfake → Grad-CAM/điểm; liveness → score/spoof_type/mode; **PII che** với developer | ✅ 200 |
| 8 | **Compliance** | Mở cùng Detail | **PII đầy đủ** + thêm **ghi chú điều tra** | ✅ (RBAC) |

## 2. Bằng chứng lên S3 + giám sát CloudWatch

| # | Hạng mục | Cơ chế | Trạng thái |
|---|---|---|---|
| S3-1 | Lưu **heatmap Grad-CAM** | mỗi detect → `s3://<bucket>/tenants/<tenant_id>/detections/<request_id>_heatmap.jpg` | ✅ verify live (LocalStack) |
| S3-2 | Lưu **media gốc** (ảnh/video input) phục vụ audit eKYC | `…/<request_id>_input.png` | ✅ verify live (LocalStack) |
| S3-3 | Đọc bằng chứng | DB chỉ giữ S3 **key**; đọc sinh **presigned URL** hết hạn 1h (bucket giữ block-public) | ✅ code path |
| CW-1 | **Request log** JSON 1 dòng/request → `backend/app.log` (status ≥500 ghi mức ERROR) | `push_to_cloudwatch.py` tail → CloudWatch Logs; metric filter `"ERROR"` → alarm | ✅ app.log có log thật |
| CW-2 | **Custom metrics** mỗi detect (Detections / ProbFake / ProcessingLatency / InferenceErrors) | `put_metric_data` (namespace `DeepGuard`) | ✅ chạy trên AWS thật; LocalStack community không mock được CloudWatch (đã xác nhận là giới hạn LocalStack, code xử lý graceful không chặn detect) |

> Lưu ý trung thực: S3 đã demo **trực tiếp** bằng LocalStack (2 object/lượt). CloudWatch **metrics** cần AWS thật
> để xem số liệu (LocalStack community 3.0 lỗi `PutMetricData` — bug phía mock, không phải code); phần
> **CloudWatch Logs** chứng minh được qua `app.log` (nguồn đẩy lên). Khi deploy có `CW_METRIC_NAMESPACE` + creds
> AWS thì cả metrics lẫn logs đều hoạt động.

## 3. Điểm nhấn kỹ thuật khi thuyết minh

- **Predict thật 2 model**: deepfake (block-DCT SFDCT, AUC 0.7572) + liveness (B4, AUC 0.9829), chạy CUDA ~0.5–0.6s/ảnh, KHÔNG còn mock.
- **Phân tách 2 lớp auth**: dashboard dùng **JWT**; tích hợp ngoài (glm_deepfake) dùng **API key** scope theo tenant + quota. Key sai → 401, tenant tạm ngưng → 403, vượt quota → 429.
- **Cô lập đa tenant + RBAC 5 role**: kiểm 12 endpoint × 5 role không lỗ 5xx; PII che theo vai trò; chặn sysadmin tự khóa tenant.
- **Lịch sử bền vững**: phán quyết ghi PostgreSQL (hiện ở History) + bằng chứng ảnh/heatmap trên S3 (audit eKYC).

## 4. Số liệu xác nhận (lần chạy 2026-06-18)

- 13/13 bước API trả 2xx; deepfake verdict FAKE prob 0.9564, liveness verdict LIVE score 0.1639 trên 1 frame mẫu.
- S3 bucket `deepguard-evidence`: 2 object/lượt detect (heatmap + input).
- `app.log`: 417 dòng REQUEST JSON (có `status_code`, `process_time_ms`).
