# DeepGuard — Danh sách chốt use case cho bảo vệ (Demo Scope)

> Chốt ngày 2026-06-24. Mục tiêu: thu hẹp bề mặt demo về **đúng lõi luận văn**
> (deepfake + liveness + DCT cho eKYC), bỏ phần SaaS sprawl gây rủi ro/bug.
> Nguồn: audit FE/BE đầy đủ + đối chiếu `mvp_endpoints_priority.xlsx` (scope gốc của tác giả).

## Bối cảnh

MVP gốc scope gọn (6 màn MUST: detect/image, /health, /docs, login, detections list+detail).
Hệ thống đã phình thành **B2B SaaS đa-tenant**: 22 trang FE, ~59 endpoint BE
(billing, webhooks, team, sysadmin console, notifications). Phần lớn **không thuộc luận văn**
và là nơi chứa gần hết audit backlog (T3/T5/T6/T8).

---

## 🟢 TIER 1 — LÕI LUẬN VĂN (phải hoàn hảo)

| Use case | FE | BE | Lý do |
|---|---|---|---|
| Deepfake ảnh + Grad-CAM + **phổ DCT** | `playground` | `POST /v1/detect/image` | Đóng góp luận văn; heatmap+DCT chứng minh trực quan giả thuyết artifact tần số |
| Liveness / anti-spoof (+ webcam) | `liveness` | `POST /v1/detect/liveness` | Trụ thứ 2; SPOOF detection đang rất tốt |
| eKYC cascade (liveness→deepfake→face-match) | (trong playground/liveness) | `POST /v1/ekyc/verify` | Flagship tích hợp, đúng bài toán eKYC ngân hàng |
| Models & Thresholds (xem) | `models` | `GET /models` | Threshold = calibration theo Thông tư 17 |

## 🔵 TIER 2 — HỖ TRỢ ĐÁNG TIN (giữ, thật, rủi ro thấp)

| Use case | FE | BE |
|---|---|---|
| Login + đổi mật khẩu | `login` | `/auth/login`, `/auth/change-password` |
| API key tạo/list (chứng minh tích hợp ngoài — Streamlit `ekyc_demo`) | `apikeys` | `/api-keys` |
| Lịch sử + chi tiết detection (audit trail compliance) | `history`, `detail` | `/detections*`, `/liveness*` |
| API Docs (Swagger) | `docs` | `/docs` |
| Status/health | `status` | `/health` |

## 🟡 TIER 3 — TÙY CHỌN (thật nhưng phụ; giữ nếu kịp, đừng polish)

| Use case | Ghi chú |
|---|---|
| Analytics overview | Honest, thật. Phụ |
| Audit logs | Góc compliance. Thật |
| Deepfake video (async job) | ⚠️ MVP ghi SKIP — async+sampling chậm, dễ hỏng khi demo live. Chỉ giữ nếu ổn định |
| Active liveness (challenge nhiều frame) | `/v1/ekyc/verify` không gọi — trùng passive. Bỏ qua được |

## 🔴 TIER 4 — KHUYẾN NGHỊ CẮT KHỎI DEMO (code thật nhưng SaaS plumbing, gánh bug)

| Use case | Lý do | Audit liên quan |
|---|---|---|
| Billing | DỮ LIỆU GIẢ (Visa 4242, invoice bịa) | T6·F8 |
| Webhooks | Lưu nhưng không bao giờ bắn (MVP: phase 2) | — |
| Team / member mgmt | Quản lý thành viên đa-tenant | T5 robustness |
| Tenants / sysadmin console | Cross-tenant SaaS | — |
| Notifications center | Không thuộc luận văn | — |
| Dashboard (1.678 dòng role-adaptive) | Shell SaaS, gánh bug nặng | T6·F11 |
| Register + accept-invite (onboarding B2B) | Demo 1 tenant chỉ cần login seed sẵn | — |
| Landing/marketing | Cắt khỏi luồng demo (giữ làm entry tùy thích) | — |

---

## ✅ Đã thực thi (2026-06-24) — cleanup tối thiểu, an toàn

Lựa chọn: **giữ nguyên nav**, chỉ xóa dead code + dữ liệu giả. Chưa ẩn Tier 4, chưa fix audit.

1. **Xóa** `frontend/src/app/api/route.ts` — stub `{"message":"Hello, world!"}` thừa (cả thư mục `api/`).
2. **Gỡ** `POST /models/check-update` (stub trả cứng "up_to_date"):
   - BE: `backend/app/routers/models.py` (endpoint `check_update`)
   - FE: `frontend/src/lib/api.ts` (`modelsCheckUpdate`), `models-page.tsx` (import, state `checking`, hàm `checkUpdate`, nút "Kiểm tra cập nhật", doc comment)
3. **Disclaim** billing giả: banner "Dữ liệu mẫu" ở đầu `billing-page.tsx` — minh bạch rằng hoá đơn/
   phương thức thanh toán là prototype, chỉ gói+quota là thật.

## ⏳ Hoãn (chờ quyết định sau)

- **Ẩn nav Tier 4** (lọc sidebar/RBAC) hoặc xóa hẳn file — chưa làm.
- **Audit backlog** còn đáng sửa (vì nằm trong surface giữ): T3·B3/B4 (500→400 ảnh rác),
  T5·F4 (models null guard), T5·F7 (camera leak liveness), T8 (E3 blink/B5 attack confidence),
  F12 (key={index} history), và **chốt model-version** (`.env` vs serving vs DB — demo phải khớp báo cáo).
