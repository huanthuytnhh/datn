# DeepGuard — Manual Test Plan (QA checklist)

> Bộ test thủ công đầy đủ cho hệ thống DeepGuard (deepfake/liveness detection, multi-tenant).
> Đánh dấu `[ ]` → `[x]` (Pass) / `[F]` (Fail). Mỗi case ghi rõ **role**, **bước**, **kết quả mong đợi**.

---

## 0. Chuẩn bị môi trường

- [ ] Backend chạy: `cd backend && ./start.sh` → `http://localhost:8000` (PostgreSQL :5432, `/health` trả 200).
- [ ] Frontend chạy: `cd frontend && bun dev` → `http://localhost:3000`.
- [ ] Seed dữ liệu: `cd backend && python3 scripts/seed.py` (tenants, users, detections, models).
- [ ] Swagger để test API: `http://localhost:8000/docs`.

### Tài khoản test (mật khẩu `Password123!`, tenant **VietBank Demo**)
| Role | Email |
|---|---|
| sysadmin | `sysadmin@deepguard.vn` |
| admin (tenant) | `admin@vietbank.vn` |
| developer | `dev@vietbank.vn` |
| compliance | `compliance@vietbank.vn` |
| viewer | `viewer@vietbank.vn` |

(Tenant khác — bulk seed, mật khẩu `DeepGuard@2024`: vietcombank/techcombank/vpbank/momo/fptbank.)

---

## 1. Ma trận quyền truy cập (sidebar nav theo role)

Đăng nhập từng role → kiểm tra **đúng các mục nav hiển thị** (mục ngoài quyền phải ẩn). ✅ = thấy, — = ẩn.

| Trang | sysadmin | admin | developer | compliance | viewer |
|---|:--:|:--:|:--:|:--:|:--:|
| Dashboard | ✅ | ✅ | ✅ | ✅ | ✅ |
| API Playground | — | ✅ | ✅ | — | — |
| Liveness Check | — | ✅ | ✅ | — | — |
| Analytics | ✅ | ✅ | ✅ | ✅ | ✅ |
| API Keys | — | ✅ | ✅ | — | — |
| Webhooks | — | ✅ | ✅ | — | — |
| API Docs | ✅ | ✅ | ✅ | ✅ | ✅ |
| Models & Thresholds | ✅ | ✅ | ✅ | ✅ | — |
| Lịch sử / Detail | ✅ | ✅ | ✅ | ✅ | ✅ |
| Audit Logs | ✅ | ✅ | — | ✅ | — |
| Status & Compliance | ✅ | ✅ | ✅ | ✅ | ✅ |
| Quản lý Tenants | ✅ | — | — | — | — |
| Team & Roles | ✅ | ✅ | — | — | — |
| Billing & Usage | — | ✅ | — | — | — |
| Settings | ✅ | ✅ | — | — | — |
| Account / Notifications | ✅ | ✅ | ✅ | ✅ | ✅ |

- [ ] sysadmin: nav khớp cột sysadmin.
- [ ] admin: nav khớp cột admin.
- [ ] developer: nav khớp.
- [ ] compliance: nav khớp.
- [ ] viewer: nav khớp.
- [ ] **Route guard**: đăng nhập viewer, không có nav "API Keys" → (nếu ép điều hướng) hiện thẻ "Không có quyền truy cập" + nút Về Dashboard.
- [ ] User card sidebar hiển thị đúng role label + tenant.

---

## 2. Xác thực & phiên (Auth)

| ID | Role | Bước | Kết quả mong đợi |
|---|---|---|---|
| A1 | — | Login email/pass đúng | Vào Dashboard theo role |
| A2 | — | Login sai mật khẩu | Báo lỗi "Invalid email or password", không vào |
| A3 | — | Logout (sidebar) | Về trang Login, token xóa |
| A4 | — | Đăng ký mới (`/auth/register` qua Swagger): tenant_name/email/pass≥8 | 201 `pending_activation`, **KHÔNG** trả token |
| A5 | — | Login ngay tài khoản vừa đăng ký | **401** (tenant SUSPENDED chờ duyệt) |
| A6 | sysadmin | Vào Tenants → tenant mới → Suspend→Active | A5 login lại → **200** |
| A7 | — | Register mật khẩu < 8 ký tự | **422** validation |

- [ ] A1 [ ] A2 [ ] A3 [ ] A4 [ ] A5 [ ] A6 [ ] A7

### Buộc đổi mật khẩu lần đầu (must_change_password)
- [ ] B1: admin tạo nhân viên mới (Team → Thêm nhân viên, đặt mật khẩu tạm).
- [ ] B2: Logout, login bằng nhân viên mới → hiện màn **"Đổi mật khẩu bắt buộc"**, không vào được app.
- [ ] B3: Thử gọi API thường bằng token đó (Swagger) → **403** (must_change).
- [ ] B4: Đổi mật khẩu thành công → vào app bình thường; login lại bằng mật khẩu mới OK.

### Tenant suspended
- [ ] B5: sysadmin suspend 1 tenant (vd MoMo) → user MoMo đang đăng nhập, request kế tiếp **403**; login mới **401**. Reactivate → bình thường.

---

## 3. Test theo trang (Functional)

### 3.1 Dashboard (5 biến thể theo role)
- [ ] developer: KPI + sparkline, biểu đồ request (RangeToggle 1/7/30 ngày refetch), recent detections, top API keys, CTA Playground.
- [ ] admin: usage vs quota (từ tenant), fake-rate, top keys, quick links Billing/Settings.
- [ ] compliance: hàng đợi FAKE cần review (click → Detail), donut verdict, teaser audit.
- [ ] sysadmin: KPI platform (tổng tenant/active/users/requests), bảng tenants, link sang Tenants/Status.
- [ ] viewer: KPI + chart + recent (READ-ONLY, không nút hành động).
- [ ] Trạng thái: loading skeleton, empty (DB rỗng), error banner khi backend tắt.

### 3.2 Playground (admin/developer)
- [ ] Cần API key: nếu chưa có → báo "Chưa có API Key". Tạo key ở API Keys trước.
- [ ] Upload ảnh → Analyze → hiện verdict + confidence + score breakdown + gauge + heatmap.
- [ ] Slider threshold đổi → kết quả phản ánh.
- [ ] Sample preset (real/fake) → chạy được.
- [ ] Upload video → frame analysis grid.
- [ ] Tab Output: Phân tích / Response JSON (copy được).

### 3.3 Liveness (admin/developer)
- [ ] Passive: upload ảnh → verdict LIVE/SPOOF + spoof_type.
- [ ] Active: lấy challenge → quay webcam → kết quả.

### 3.4 History / Detail
- [ ] History: filter verdict (chip), khoảng thời gian, search; phân trang; CSV export; đổi table↔cards.
- [ ] Click 1 dòng → mở Detail.
- [ ] Detail: ảnh + heatmap + scan-line; view-mode overlay/split/original; gauge confidence; score bars; metadata.
- [ ] **Note editor chỉ hiện với admin/compliance**; developer/viewer thấy dòng "Chỉ admin/compliance được thêm ghi chú".
- [ ] admin/compliance thêm note → lưu OK, hiện trong danh sách.

### 3.5 API Keys (admin/developer)
- [ ] Tạo key → modal reveal **plain key 1 lần** (copy). Refresh list.
- [ ] KPI pills + filter status + table↔cards + quota bar + sparkline.
- [ ] Revoke key → biến mất / trạng thái revoked.

### 3.6 Webhooks (admin/developer)
- [ ] Tạo webhook (url + events) → vào list.
- [ ] Toggle pause/active; edit url; delete.
- [ ] Nút "Test delivery" hiển thị **"SẮP CÓ"** (disabled) — đúng (chưa có backend).

### 3.7 Analytics
- [ ] KPI thật (total/fake/real/uncertain, avg+p95 latency), donut verdict, RangeToggle 7d/30d refetch.
- [ ] Per-API-key & Geo: hiện **empty state "chưa hỗ trợ/sắp có"** (không bịa số).

### 3.8 Audit Logs (admin/compliance/sysadmin)
- [ ] List event thật, filter action/resource/time, phân trang, expand metadata, CSV.
- [ ] developer/viewer: không có nav Audit.

### 3.9 Models & Thresholds
- [ ] Mọi role (trừ viewer) xem được list model (version/AUC/threshold/active/traffic).
- [ ] **Chỉ sysadmin** chỉnh được slider threshold / toggle active / traffic; lưu OK.
- [ ] admin/developer/compliance: controls **disabled** + ghi chú read-only.
- [ ] sysadmin: "Kiểm tra cập nhật" → message.

### 3.10 Team & Roles (admin/sysadmin)
- [ ] Tiêu đề hiện **tên tổ chức** (vd "· VietBank Demo"); list = chỉ user trong tenant này.
- [ ] **Thêm nhân viên**: email/tên/vai trò (dropdown KHÔNG có sysadmin với admin)/mật khẩu (+ "Tạo ngẫu nhiên") → tạo, login được, buộc đổi mật khẩu.
- [ ] Đổi vai trò member (dropdown), tạm ngưng/kích hoạt, gỡ.
- [ ] **Hierarchy**: admin với hàng `compliance`/`sysadmin` → badge tĩnh, KHÓA sửa/xóa.
- [ ] Không tự đổi role / tự xóa chính mình (hàng "BẠN" khóa).
- [ ] **Reset mật khẩu** member → hiện mật khẩu tạm 1 lần (copy); member đó login buộc đổi.

### 3.11 Quản lý Tenants (sysadmin)
- [ ] List tất cả tenant + KPI (tổng/active/usage/users).
- [ ] Suspend/Activate tenant; đổi plan; chỉnh quota.
- [ ] Expand tenant → **NGƯỜI DÙNG** (list thật) + **API KEYS** (list thật) + traffic "sắp có".
- [ ] Trong drill-down: **đổi vai trò / bật-tắt** member của tenant khác → lưu OK; KHÔNG gán được `sysadmin`; hàng của chính mình khóa.

### 3.12 Account (mọi role)
- [ ] Hiển thị user thật (tên/email/role/tenant).
- [ ] Sửa name/phone/timezone → Lưu → sidebar/header cập nhật tên.
- [ ] Đổi mật khẩu: sai mật khẩu hiện tại → báo lỗi; đúng → 204, đăng nhập lại bằng mk mới.
- [ ] 2FA / connected accounts / xóa tài khoản: "Sắp có" (disabled).

### 3.13 Settings (admin/sysadmin)
- [ ] Mục **Tổ chức**: load tên/billing email thật (tenantGet); Lưu (tenantUpdate) OK; non-admin → read-only/403 message.
- [ ] Mục **Bảo mật / Thông báo**: ghi chú "Lưu cục bộ — backend sắp có" (không persist thật).

### 3.14 Trang còn mock (xác nhận gắn nhãn đúng, KHÔNG báo bug)
- [ ] **Billing**: hiển thị gói/quota từ tenant; plans/invoices là mock.
- [ ] **Status**: services/uptime/incidents là static.
- [ ] **Notifications**: hiện **rỗng** (chưa có nguồn tạo notification).
- [ ] **Docs**: 3 phần (Bắt đầu / Theo vai trò / API Reference) hiển thị đủ; role guide sinh từ rbac.

---

## 4. Test phân quyền (Negative — qua Swagger/curl, mỗi role 1 token)

> Lấy token: `POST /auth/login`. Gọi endpoint với token sai-quyền → mong đợi **403**.

| ID | Endpoint | Role gọi | Mong đợi |
|---|---|---|---|
| N1 | `PATCH /models/{id}` | admin | 403 (chỉ sysadmin) |
| N2 | `PATCH /models/{id}` | sysadmin | 200 |
| N3 | `POST /detections/{id}/notes` | developer | 403 (chỉ admin/compliance) |
| N4 | `GET /audit-logs` | developer | 403 |
| N5 | `GET /api-keys` | compliance / viewer | 403 |
| N6 | `GET /tenants` (platform) | admin/developer/compliance/viewer | 403 (chỉ sysadmin) |
| N7 | `GET /platform/overview` | non-sysadmin | 403 |
| N8 | `PATCH /tenants/{id}/users/{uid}` | admin | 403 |
| N9 | `GET /users` | developer/viewer | 403 (chỉ admin/sysadmin) |
| N10 | `PATCH /tenant` | developer | 403 |

- [ ] N1..N10 đúng kỳ vọng.

### Hierarchy / SoD (Team)
- [ ] H-1: admin `PATCH /users/{compliance_id}` (đổi role/name) → **403**.
- [ ] H-2: admin `DELETE /users/{compliance_id}` → **403**.
- [ ] H-3: admin `POST /users/{compliance_id}/reset-password` → **403**.
- [ ] H-4: admin tạo user role=`compliance` hoặc `sysadmin` → **403**.
- [ ] H-5: admin tạo/đổi role=`sysadmin` → **403**.
- [ ] H-6: sysadmin quản compliance → **200**.
- [ ] H-7: admin quản developer/viewer/admin → **200**.

### Cô lập đa tenant (IDOR)
- [ ] I-1: admin VietBank lấy `request_id` của tenant khác → `GET /detections/{id}` → **404** (không lộ).
- [ ] I-2: admin gọi `GET /api-keys/{id}` của tenant khác → **404**.
- [ ] I-3: `PATCH /tenants/{id}/users/{uid}` tenant A với uid thuộc tenant B → **404**.

### PII masking
- [ ] P-1: developer `GET /detections/{id}` → `image_thumb`, `ip_address`, `user_agent` = **null**.
- [ ] P-2: admin/compliance cùng request → các field trên **có giá trị**.

### must_change & tenant status (API)
- [ ] S-1: token user must_change gọi `/analytics/overview` → 403; `/auth/me` → 200.
- [ ] S-2: token user thuộc tenant suspended → mọi request 403.

---

## 5. Trạng thái UI (mọi trang có gọi API)
- [ ] Loading: hiện skeleton/spinner khi tải.
- [ ] Empty: thông báo rỗng thân thiện (không vỡ).
- [ ] Error: tắt backend → banner lỗi + (nếu có) nút Thử lại; app không crash.

---

## 6. Smoke test nhanh (~10 phút, happy path)
1. [ ] Login admin → Dashboard hiển thị.
2. [ ] Tạo API key → copy.
3. [ ] Playground: detect 1 ảnh → có verdict.
4. [ ] History → mở Detail → thêm note.
5. [ ] Team: thêm nhân viên → login nhân viên → buộc đổi mật khẩu.
6. [ ] Login sysadmin → Tenants → suspend rồi activate 1 tenant; drill-down xem users.
7. [ ] Login viewer → xác nhận không có nút hành động, nav rút gọn.

---

## 7. KNOWN ISSUES / hành vi đã biết (KHÔNG tính là bug khi test)
- ⚠️ **`POST /v1/ekyc/verify` chưa validate API key** (lỗ hổng đã ghi nhận, chờ vá).
- ⚠️ **sysadmin có thể suspend chính tenant của mình → tự khóa** (chờ vá).
- `SECRET_KEY` còn default dev (chỉ là vấn đề khi deploy prod).
- **Notifications luôn rỗng** (chưa có nguồn tạo) + chưa seed.
- **Invite link `/auth/accept-invite` 404** (UI dùng "tạo trực tiếp" thay thế).
- **Rate limit `rate_limit_rpm` chưa enforce.**
- Billing / Status / Settings(Bảo mật, Thông báo) là **mock/local** (đã gắn nhãn).
- Video detect chạy **đồng bộ** (không poll job).
- `/jobs/{id}`, `/v1/results/{id}`, liveness JWT list: có backend nhưng UI chưa gọi.

---

## 8. Ghi chú kết quả
| Mục | Pass | Fail | Ghi chú |
|---|---|---|---|
| 1. Nav matrix | | | |
| 2. Auth | | | |
| 3. Functional | | | |
| 4. Authorization (negative) | | | |
| 5. UI states | | | |
| 6. Smoke | | | |
