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

| # | Actor | Thao tác | Kết quả mong đợi | Trạng thái |
|---|---|---|---|---|
| 1 | **Sysadmin** | Đăng nhập `sysadmin@deepguard.vn` | Vào Dashboard nền tảng | ✅ 200 |
| 2 | **Sysadmin** | Quản lý Tenants → **Tạo tenant** (vd "Acme Bank", gói pro, quota 10000, email admin) | Tenant **ACTIVE ngay** + tài khoản admin; **mật khẩu tạm hiện 1 lần** (copy gửi admin) | ✅ 201 |
| 3 | **Admin tenant** | Đăng nhập bằng mật khẩu tạm | Bị buộc **đổi mật khẩu lần đầu** (must_change), chưa vào được app | ✅ 200 |
| 4 | **Admin tenant** | Đổi mật khẩu | Đổi xong → vào Dashboard tổ chức | ✅ 204 |
| 5 | **Admin tenant** | Team & Roles → **Thêm nhân viên** (role `developer`, mật khẩu tạm) | Dev được tạo trong tenant, buộc đổi mật khẩu lần đầu | ✅ 201 |
| 6 | **Developer** | Đăng nhập (mật khẩu tạm) → đổi mật khẩu | Vào Dashboard developer | ✅ 200/204 |
| 7 | **Developer** | API Keys → **Tạo key** | Key `sk-dg-…` **hiện 1 lần** (copy) | ✅ 201 |
| 8 | **Developer (glm_deepfake)** | Dán key vào `glm_deepfake/.env`, mở trang Deepfake → upload ảnh | Client gọi `POST /v1/detect/image` (`Authorization: Bearer sk-dg-…`) → trả **verdict + prob_fake + Grad-CAM** | ✅ 200 |
| 8b | **Developer (glm_deepfake)** | Upload video | Backend tách **8 frame rải đều toàn clip** → gọi serving từng frame → verdict tổng hợp (vài giây, không treo) | ✅ 200 |
| 9 | **Developer** | Quay lại Dashboard → **Lịch sử (History)** | Bản ghi vừa chạy hiện trong danh sách (badge nguồn `api`) | ✅ 200 (total≥1) |
| 10 | **Developer** | Bấm 1 dòng → **Detail** | Hiện ảnh + **Grad-CAM** + gauge + điểm + metadata của phán quyết đó; **PII bị che** (ip/user-agent = null) đúng quyền developer | ✅ 200 |
| 11 | **Compliance** | Đăng nhập → mở cùng Detail | **PII hiển thị đầy đủ** + thêm được **ghi chú điều tra** | ✅ (RBAC verified) |

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
