# DeepGuard — Luồng sử dụng theo từng vai trò (Role Flows) & Kịch bản demo

> Tài liệu mô tả **luồng sử dụng chi tiết (click-by-click)** cho từng nhóm người dùng của DeepGuard,
> kèm **runbook demo bảo vệ**. Dùng để: trình diễn RBAC khi bảo vệ đồ án, làm rõ sản phẩm trong báo cáo,
> và làm checklist kiểm thử thủ công. Đối chiếu quyền backend trong `API_SPEC.md`, ma trận test trong `MANUAL_TEST_PLAN.md`.

---

## 0. Tổng quan

### 0.1 Kiến trúc luồng request
```
Người dùng → Frontend (Next.js :3000, SPA 1-route)
           → src/lib/api.ts  req()  (Authorization: Bearer <JWT|API-key>)
           → FastAPI backend :8000  (router → service → crud)
           → PostgreSQL :5432
           → (suy luận ML) httpx POST → SFDCT microservice :8501 (EfficientNet-B4 + block-DCT + Grad-CAM)
```

### 0.2 Hai lớp xác thực (KHÔNG trộn lẫn)
| Lớp | Cơ chế | Ai dùng | Phạm vi |
|-----|--------|---------|---------|
| **Dashboard / quản trị** | **JWT Bearer** (`get_current_user`, `require_role`, `require_sysadmin`) | Người dùng đăng nhập web | `/auth`, `/users`, `/tenant(s)`, `/detections`, `/analytics`, `/audit-logs`, `/playground/*` … |
| **Tích hợp ngoài (eKYC)** | **API-key** (`Authorization: Bearer sk-dg-…`, `get_api_key_auth`) | Backend của khách | `/v1/detect/*`, `/v1/liveness/*`, `/v1/results/*`, `/v1/jobs/*` |

> **Playground trong dashboard** dùng **JWT** (`/playground/detect/*`) → đăng nhập là test được ngay,
> KHÔNG cần API-key. API-key chỉ cần khi minh hoạ **tích hợp thật từ backend khách**.

### 0.3 Năm vai trò → bốn archetype người dùng
| Vai trò (`UserRole`) | Cấp | Archetype (theo yêu cầu) |
|----------------------|-----|--------------------------|
| — (chưa đăng nhập)   | —   | **Người không có tài khoản** |
| `sysadmin`           | 4   | **System admin** (vận hành nền tảng, xuyên tổ chức) |
| `admin`              | 3   | **Tenant admin** (quản trị 1 tổ chức) |
| `developer`          | 1   | **User của tenant** — tích hợp API |
| `compliance`         | 2   | **User của tenant** — rà soát/tuân thủ |
| `viewer`             | 0   | **User của tenant** — chỉ đọc |

### 0.4 Tài khoản demo (seed `backend/scripts/seed.py`, mật khẩu `Password123!`, tenant "VietBank Demo")
| Vai trò | Email |
|---------|-------|
| sysadmin | `sysadmin@deepguard.vn` |
| admin | `admin@vietbank.vn` |
| developer | `dev@vietbank.vn` |
| compliance | `compliance@vietbank.vn` |
| viewer | `viewer@vietbank.vn` |

### 0.5 Chạy app
```bash
cd backend  && ./start.sh                 # API :8000 · Swagger /docs
cd frontend && bun dev                     # Web :3000
cd backend  && python3 scripts/seed.py     # nạp 5 tài khoản demo (idempotent)
```

### 0.6 Onboarding — Teaching Tips & Tours (mô hình Business Central)
Áp theo Microsoft Dynamics 365 Business Central (*onboarding-teaching-tips-tours*):
- **Modal chào mừng (lần đầu đăng nhập)**: hỏi *"Bạn có muốn đi một vòng quanh app không?"* —
  **Có** → bật chế độ **đi một vòng tự động**: mỗi khi vào **một trang lần đầu**, tour của trang đó **tự chạy**;
  **Để sau** → không tự bật (vẫn mở thủ công bằng tiêu đề trang / nút "?"). Lưu theo `user.id`.
- **Đặt callout thông minh**: callout trỏ sang **phải** target; nếu target **sát mép phải** (vd nút *Tạo key mới*,
  *Tạo tenant*, *Xuất CSV*) thì **tự lật sang trái**, mũi tên (beak) đổi cạnh tương ứng — không tràn màn hình.

Hai tầng:
- **Page teaching tip** (góc dưới-trái, KHÔNG chặn thao tác): khi vào mỗi trang, hiện callout trả lời
  *"trang này là gì / làm được gì"* + nút **"Xem hướng dẫn"** mời chạy tour. Nội dung theo TỪNG trang
  (`PAGE_TIPS` trong `frontend/src/lib/onboarding.ts`), hỗ trợ rich-text (**bold**/*italic*/`code`).
- **Tour = control teaching tips** (1–4 bước): callout có **mũi tên (beak)** trỏ vào **button/section
  TRONG TỪNG TRANG**, spotlight nhẹ, step **"i/N"** + Quay lại / Tiếp / Đã hiểu.
  - Mỗi trang có tour riêng trỏ vào control của chính nó (`PAGE_TOURS`, qua `data-tour="<page>-…"`): vd
    Playground (tải media → ảnh mẫu → Phân tích → mã tích hợp), Tenants (Tạo tenant → KPI → lọc),
    Team (thêm/mời → vai trò), API Keys (tạo khoá → usage), History/Audit (lọc → xuất CSV).
  - **Dashboard** dùng tour **định hướng theo vai trò** (`ROLE_TOURS`) trỏ vào các mục sidebar mà vai trò
    đó được dùng (target tự cuộn vào tầm nhìn nếu khuất).
- **Tự bật lần đầu mỗi user** (page tip); **mở lại** bằng **bấm tiêu đề trang** (gạch chấm + icon ℹ️, đúng
  hành vi BC) hoặc nút **"?"** trên TopHeader.
- Trạng thái "đã xem" lưu theo `user.id` (`localStorage: dg-onboarding`).
- Engine: `components/deepguard/onboarding-tour.tsx`; store: `store/onboarding.ts` (phase `tip`/`tour`/`closed`).

---

## 1. Archetype 1 — Người KHÔNG có tài khoản (anonymous)

**Vào được gì:** Landing (marketing), Pricing, Docs, `/health`. **KHÔNG** xem được dữ liệu tenant.

### 1A. Tự đăng ký tổ chức (self-service, có kiểm soát)
| Bước | Thao tác | Hệ thống làm | Kết quả UI |
|------|----------|--------------|------------|
| 1 | Mở `/` | Render Landing | Trang giới thiệu + nút "Đăng nhập" / "Dùng thử miễn phí" |
| 2 | Bấm **"Dùng thử miễn phí"** / nút gói ở Pricing | `navigate('register')` | Trang **Đăng ký** |
| 3 | Nhập Tên tổ chức, Họ tên, Email, Mật khẩu → **Tạo tổ chức** | `POST /auth/register` → tạo tenant **SUSPENDED** + user `admin` | Màn **"Đã gửi đăng ký — chờ phê duyệt"** |
| 4 | Thử đăng nhập ngay | `POST /auth/login` bị chặn (tenant chưa active) | Lỗi "Tổ chức đã bị tạm ngưng. Liên hệ quản trị nền tảng." |
| 5 | (Chờ) sysadmin kích hoạt tổ chức | `PATCH /tenants/{id}` status=active | Sau đó đăng nhập được → vào Admin dashboard |

> Thiết kế **chờ duyệt** là cố ý (onboarding B2B có kiểm soát) — tránh tự cấp quyền admin không kiểm soát.

### 1B. Được mời vào tổ chức (invite)
| Bước | Thao tác | Hệ thống làm | Kết quả UI |
|------|----------|--------------|------------|
| 1 | Mở link mời `/?invite=<token>` | FE phát hiện `?invite=` → `navigate('accept-invite')`; `GET /auth/accept-invite?token=` | Hiện email + vai trò + tên tổ chức được mời |
| 2 | Đặt Họ tên + Mật khẩu → **Tham gia & Đăng nhập** | `POST /auth/accept-invite` → tạo user theo vai trò đã mời, tiêu thụ token | Auto-login → vào dashboard đúng vai trò |
| — | Token hết hạn / đã dùng / sai | trả `valid:false` + lý do | Màn "Lời mời không hợp lệ" + nút về đăng nhập |

---

## 2. Archetype 2 — System admin (`sysadmin`) — `sysadmin@deepguard.vn`

**Định vị:** vận hành nền tảng, **xuyên mọi tổ chức**. Đăng nhập → `SysadminDashboard`.

| Bước | Thao tác | API | Kết quả |
|------|----------|-----|---------|
| 1 | Đăng nhập | `POST /auth/login` → `/auth/me` | Vào **Dashboard nền tảng**; **product tour sysadmin** tự bật |
| 2 | Xem dashboard | `GET /platform/overview`, `GET /tenants` | KPI gộp: tổng tenant/user/request, tỉ lệ fake, độ trễ + bảng tenant |
| 3 | Vào **Quản lý Tenants** (menu) | `GET /tenants` | Danh sách mọi tổ chức + lọc theo gói |
| 4 | **Tạo tenant mới** → wizard 3 bước → "Tạo tenant" | `POST /tenants` | Tenant **ACTIVE ngay** + tài khoản admin; **mật khẩu tạm hiện 1 lần** (copy gửi admin) |
| 5 | Kích hoạt/Tạm ngưng / đổi gói / quota | `PATCH /tenants/{id}` | Trạng thái tổ chức đổi tức thì (vd duyệt tổ chức tự đăng ký ở §1A) |
| 6 | Mở rộng 1 tenant | `GET /tenants/{id}/users`, `/api-keys` | Thấy người dùng + API-key của tổ chức đó; đổi vai trò thành viên (`PATCH /tenants/{id}/users/{uid}`) |
| 7 | Vào **Models & Thresholds** | `GET /models`, `PATCH /models/{id}` | Chỉ sysadmin chỉnh ngưỡng/phiên bản model (ảnh hưởng mọi tenant) |

**KHÔNG làm được:** gán vai trò `sysadmin` cho thành viên tenant; tự sửa chính mình qua console tenant; tạo API-key hộ tenant (chỉ xem).

---

## 3. Archetype 3 — Tenant admin (`admin`) — `admin@vietbank.vn`

**Định vị:** quản trị **một** tổ chức. Đăng nhập → `AdminDashboard`. Mọi thao tác giới hạn trong `tenant_id` của mình.

| Bước | Thao tác | API | Kết quả |
|------|----------|-----|---------|
| 1 | Đăng nhập | `/auth/login` → `/auth/me` | Dashboard tổ chức; **tour admin** tự bật |
| 2 | Xem KPI | `GET /analytics/overview`, `GET /tenant` | Quota %, request, tỉ lệ fake, độ trễ của tổ chức |
| 3 | **Team & Roles** → **Thêm nhân viên** | `POST /users` | Tạo user (gán viewer/developer/admin) |
| 4 | **Mời thành viên** (invite) | `POST /users/invite` | Trả link mời `/?invite=<token>` (xem §1B) |
| 5 | Đổi vai trò / bật-tắt / xoá / reset mật khẩu | `PATCH/DELETE /users/{id}`, `POST /users/{id}/reset-password` | Reset → **mật khẩu tạm 1 lần** + buộc đổi lần đầu |
| 6 | **API Keys** | `GET/POST/DELETE /api-keys` | Tạo khoá `sk-dg-…` (plain hiện 1 lần) cho tích hợp ngoài |
| 7 | **Webhooks / Billing / Settings** | `/webhooks`, dashboard, `PATCH /tenant` | Cấu hình callback, xem gói/usage, cấu hình tổ chức |
| 8 | **Audit Logs** | `GET /audit-logs` | Nhật ký hành vi của tổ chức |
| 9 | Có thể dùng **Playground / Liveness / Detections** như developer | `/playground/*`, `/detections` | Test + tra cứu |

**SoD (tách quyền):** admin **KHÔNG** quản lý user `compliance`/`sysadmin`; không tự hạ quyền/tự xoá.
**KHÔNG làm được:** xuyên tổ chức, tạo tenant, sửa model thresholds.

---

## 4. Archetype 4 — User của tenant (tách 3 vai trò)

### 4a. Developer — `dev@vietbank.vn` → `DeveloperDashboard`
**Định vị:** tích hợp API.

| Bước | Thao tác | API | Kết quả |
|------|----------|-----|---------|
| 1 | Đăng nhập | `/auth/me` | Dashboard tích hợp; **tour developer** tự bật |
| 2 | **(A) Test nhanh** — vào **API Playground** → upload ảnh → **Phân tích** | `POST /playground/detect/image` (**JWT**) | Hiện **risk_score + band + decision_hint**, **Grad-CAM**, **phổ tần số 2D-DCT** — KHÔNG cần API key |
| 3 | Test video | `POST /playground/detect/video` | Verdict tổng hợp + lưới frame |
| 4 | **(B) Tích hợp ngoài** — **API Keys** → tạo khoá | `POST /api-keys` | Plain key hiện 1 lần |
| 5 | Gọi từ backend khách | `curl POST /v1/detect/image` (Bearer = key) → `GET /v1/results/{id}` | JSON risk-score; mã mẫu Python/cURL/JS ở tab dưới |
| 6 | **API Docs / Analytics / Models(read)** | `/analytics`, `/models` | Tham chiếu + số liệu |

**PII bị che** (ảnh/IP/user-agent) khi xem chi tiết detection. **KHÔNG:** team, billing, audit, tenant-config.

### 4b. Compliance — `compliance@vietbank.vn` → `ComplianceDashboard`
**Định vị:** rà soát & lưu vết tuân thủ (TT17/ND13).

| Bước | Thao tác | API | Kết quả |
|------|----------|-----|---------|
| 1 | Đăng nhập | `/auth/me` | Dashboard rà soát; **tour compliance** tự bật |
| 2 | Xem **hàng đợi FAKE** | `GET /detections?verdict=FAKE` | Danh sách nghi deepfake cần xem xét |
| 3 | **Lịch sử phát hiện** → mở 1 chi tiết | `GET /detections`, `GET /detections/{id}` | **PII hiển thị đầy đủ** (ảnh, IP, user-agent) |
| 4 | **Thêm ghi chú điều tra** | `POST /detections/{id}/notes` | Note gắn vào hồ sơ (chỉ admin/compliance được thêm) |
| 5 | **Audit Logs / Status & Compliance / Models(read)** | `/audit-logs`, `/status`, `/models` | Tra cứu + xuất; mốc tuân thủ |

**KHÔNG:** api-keys, webhooks, playground, team, billing. Chỉ-đọc ngoài thao tác audit-note.

### 4c. Viewer — `viewer@vietbank.vn` → `ViewerDashboard`
**Định vị:** chỉ đọc.

| Bước | Thao tác | API | Kết quả |
|------|----------|-----|---------|
| 1 | Đăng nhập | `/auth/me` | Dashboard chỉ-đọc (không nút hành động); **tour viewer** tự bật |
| 2 | Xem **Lịch sử** → mở chi tiết | `GET /detections`, `/detections/{id}` | **PII bị che** (giống developer) |
| 3 | Xem **Phân tích / Docs** | `/analytics` | Biểu đồ lưu lượng/tỉ lệ fake/độ trễ |

**KHÔNG:** sửa bất cứ gì; không playground/keys/team/audit/models.

---

## 5. Các flow ĐÃ SỬA trong đợt review này
1. **Accept-invite hoạt động** — thêm `GET/POST /auth/accept-invite` (trước đây link mời 404). Link đổi sang `/?invite=<token>` khớp SPA.
2. **Trang Register** — FE có trang đăng ký gọi `POST /auth/register` (trước chỉ có ở backend, FE thiếu UI); sửa type `authRegister` trả "pending".
3. **Tạo tenant** — thêm `POST /tenants` (sysadmin); wizard tạo tenant chạy thật + hiện mật khẩu tạm (trước là stub "chưa khả dụng").
4. **Điều hướng theo phiên** — reload khi đã đăng nhập giữ trong app (về dashboard); chưa đăng nhập vào trang workspace bị đẩy về login (trước rớt về landing / hiện "không có quyền").
5. **Playground không cần API key** — thêm `/playground/detect/*` (JWT); login là test ngay (trước mỗi phiên mới phải tạo lại key).
6. **Onboarding + product tour theo role** — tự bật lần đầu mỗi user, mở lại bằng nút "?".

## 6. Hạn chế đã biết (CHƯA sửa — ngoài phạm vi đợt này)
- **Guard chỉ ở client-side** (Zustand) — chưa có middleware bảo vệ route phía server. Token trong `localStorage`.
- **`rate_limit_rpm`** lưu trong DB nhưng **chưa enforce** (không có middleware throttle).
- **JWT không thu hồi khi logout** (stateless, hết hạn mặc định 60′) — logout chỉ ghi audit.
- **`/docs`, `/redoc` public** — phơi schema API (tiện demo, nên gate khi production).
- Playground **đếm quota** tenant nhưng **không ghi** vào bảng `detections` (tránh ràng buộc `api_key_id`).

---

## 7. Runbook DEMO bảo vệ (thứ tự đăng nhập liền mạch)
1. **Anonymous**: mở `/` → Landing → "Dùng thử" → Register → màn "chờ duyệt".
2. **Sysadmin** (`sysadmin@deepguard.vn`): xem tour → Tenants → **duyệt** tổ chức vừa đăng ký (activate) → **tạo tenant mới** (khoe mật khẩu tạm) → Models.
3. **Invite**: ở **Admin** (`admin@vietbank.vn`) → Team → **Mời** 1 email → copy link → mở `/?invite=…` (tab ẩn danh) → đặt mật khẩu → vào app.
4. **Developer** (`dev@vietbank.vn`): Playground → upload ảnh → **risk-score + heatmap + phổ tần số** (không cần key) → tạo key → `curl /v1/detect/image`.
5. **Compliance** (`compliance@vietbank.vn`): hàng đợi FAKE → mở chi tiết (PII hiện) → thêm audit-note → Audit Logs.
6. **Viewer** (`viewer@vietbank.vn`): chỉ-đọc; mở chi tiết → PII bị che (đối chiếu với compliance).
7. Bất cứ lúc nào: bấm **"?"** để chạy lại product tour của vai trò đang đăng nhập.

---

## 8. Phụ lục — Ma trận route → vai trò (JWT)
| Nhóm endpoint | viewer | developer | compliance | admin | sysadmin |
|---------------|:------:|:---------:|:----------:|:-----:|:--------:|
| `/auth/me`, đổi mật khẩu, notifications | ✓ | ✓ | ✓ | ✓ | ✓ |
| `/analytics/*`, `/detections` (GET), `/liveness` (GET) | ✓ | ✓ | ✓ | ✓ | ✓ |
| `/detections/{id}` PII | che | che | **hiện** | **hiện** | **hiện** |
| `/detections/{id}/notes` (POST) | — | — | ✓ | ✓ | — |
| `/playground/detect/*` (JWT) | — | ✓ | — | ✓ | — |
| `/api-keys/*`, `/webhooks/*` | — | ✓ | — | ✓ | — |
| `/audit-logs` | — | — | ✓ | ✓ | ✓ |
| `/models` (GET) | ✓ | ✓ | ✓ | ✓ | ✓ |
| `/models/{id}` (PATCH), `check-update` | — | — | — | — | ✓ |
| `/users/*`, `/tenant` (GET/PATCH) | — | — | — | ✓ | ✓ |
| `/tenants` (GET/**POST**/PATCH), `/tenants/{id}/*`, `/platform/overview` | — | — | — | — | ✓ |
| `/v1/detect/*`, `/v1/liveness/*` | **API-key** (mọi tenant hợp lệ) | | | | |

> Nguồn enforcement: backend `app/dependencies.py` (`require_role`/`require_sysadmin`) + FE `src/lib/rbac.ts` (`PAGE_ACCESS`).
