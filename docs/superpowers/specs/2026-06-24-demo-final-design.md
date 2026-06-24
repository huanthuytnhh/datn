# DeepGuard — Spec demo cuối (final demo) — Design

> Brainstormed 2026-06-24. Hướng: **A — Trim & harden tại chỗ** (giữ dashboard Next.js + FastAPI + serving + ekyc_demo, cắt nhiễu + sửa đúng chuẩn). Tham chiếu: `docs/DEMO-SCOPE-FINAL.md`, `CONVENTIONS.md`.

## Goal

Đưa luồng eKYC end-to-end của DeepGuard lên mức **production-correct cho bảo vệ**: register → sysadmin duyệt tenant → admin mời/tạo dev → login → tạo API key → tích hợp Streamlit → demo **deepfake + liveness + cascade (liveness prefilter)**, với CRUD và chức năng liên quan hoạt động đúng RBAC/validate/error, và UI song ngữ EN/VIE.

## Global Constraints

- File code **≤ 250 dòng** (tách nếu vượt).
- DB **chỉ** qua package `deepguard_db` — KHÔNG raw SQL.
- Pydantic Create/Read/Update; theo `CONVENTIONS.md` (auth/RBAC, TanStack Query + Zustand).
- Commit **chỉ khi được yêu cầu**; **KHÔNG** `Co-Authored-By` trailer.
- Branch: `dev-thanhln-22062026`.
- Min password = **8 ký tự** (chỉ độ dài), áp dụng register/accept-invite/change-password.
- i18n mặc định **vi**; không để chuỗi cứng ở trang in-scope.
- no-vibe-code: mỗi thay đổi giải thích nguyên nhân gốc → sửa gì (file:dòng) → vì sao.

## Scope

### IN — phải chạy đúng chuẩn
- **Auth**: register, sysadmin duyệt/từ chối tenant, login, force-change password.
- **User**: CRUD trong tenant + Invitation (mời) + tạo trực tiếp.
- **API key**: CRUD (tạo hiện key 1 lần, list, sửa, revoke).
- **Detection**: deepfake ảnh, liveness, **cascade** (liveness prefilter → deepfake).
- **Observability**: History (list) + Detail.
- **Settings (tối giản)**: profile + đổi mật khẩu + **nút ngôn ngữ**.
- **Tenant Approvals**: 1 màn sysadmin tối giản (list pending + duyệt/từ chối).
- **Models**: chỉ xem ngưỡng (không sửa).
- **i18n EN/VIE**: dashboard + Streamlit.

### OUT — ẩn khỏi nav (code giữ trong repo, KHÔNG xoá)
billing, webhooks, notifications, dashboard-analytics, audit-logs, team permission-matrix, sysadmin console (trừ Tenant Approvals), `/v1/ekyc/verify` (full + face-match), active-liveness challenge.
Cơ chế ẩn: lọc `frontend/src/components/deepguard/sidebar.tsx` + `frontend/src/lib/rbac.ts` (`PAGE_ACCESS`).

## Roles & RBAC

Thứ bậc: `sysadmin > admin > developer > compliance > viewer`.

| Action | sysadmin | admin | developer | compliance | viewer |
|---|:-:|:-:|:-:|:-:|:-:|
| Duyệt/từ chối tenant | ✓ | — | — | — | — |
| Mời/tạo/sửa/xoá/reset-pw user | — | ✓¹ | — | — | — |
| Đổi MK / profile / ngôn ngữ (của mình) | ✓ | ✓ | ✓ | ✓ | ✓ |
| API key CRUD | — | ✓ | ✓ | — | — |
| Detection qua Playground (JWT) | — | ✓ | ✓ | — | — |
| Xem History + Detail | ✓ | ✓ | ✓ | ✓ | ✓ |
| Thêm note (Detail) | — | ✓ | — | ✓ | — |
| Xem Models | ✓ | ✓ | ✓ | ✓ | ✓ |

¹ SoD: admin không quản user role compliance/sysadmin.
**Detection qua API key** = trục auth riêng: key hợp lệ + tenant ACTIVE + còn quota (không theo role).

## State machines

- **Tenant**: `(register) → PENDING ──approve──→ ACTIVE` / `──reject──→ REJECTED`. SUSPENDED ngoài scope.
- **Invitation**: `(admin mời) → PENDING ──accept(đặt MK)──→ ACCEPTED→User` / `──quá hạn token──→ EXPIRED`. TTL 7 ngày, single-use.
- **User**: tạo trực tiếp → `must_change_password=true` → cổng force-change. Qua invite → tự đặt MK, không force-change.

## Golden-path flow

| # | Actor | Hành động | Endpoint | Auth | Kết quả |
|---|---|---|---|---|---|
| 1 | Khách | Register tenant | `POST /auth/register` | public | Tenant PENDING + admin đầu |
| 2 | sysadmin | Duyệt tenant | `PATCH /tenants/{id}` (Approvals) | sysadmin | PENDING→ACTIVE |
| 3 | admin | Login | `POST /auth/login` | public | JWT (chặn nếu chưa ACTIVE) |
| 4 | admin | Mời dev | `POST /users/invite` | admin | Invitation + invite_url |
| 5 | dev | Accept + đặt MK | `POST /auth/accept-invite` | token | User ACCEPTED, auto-login |
| 6 | dev | Tạo API key | `POST /api-keys` | developer | Key thô (1 lần) |
| 7 | dev | Dán key vào Streamlit | — | — | App ngoài cầm key |
| 8 | Streamlit | Detection | `/v1/detect/{image,liveness}`, `/v1/detect/cascade` | API key | Verdict + heatmap, lưu Detection |
| 9 | admin/dev | Xem lại | `GET /detections`, `/detections/{id}` | JWT | History + Detail |

## Account provisioning (2 đường)

- **MỜI**: admin nhập email + role → Invitation token → UI hiện **invite link tuyệt đối** (FE ghép `window.location.origin` vào `invite_url`) + nút Copy → dev mở tab ẩn danh → `GET /auth/accept-invite?token=` (xác nhận) → nhập tên + MK → `POST /auth/accept-invite` → auto-login. Gate: token ≤7 ngày, single-use, tenant ACTIVE, email chưa có.
- **TẠO trực tiếp**: admin `POST /users` → temp password (hiện 1 lần) + `must_change_password=true` → login đầu buộc đổi.

## Correctness contract

### Validate (chặn trước khi chạm DB)
- email đúng định dạng + chưa trùng trong tenant.
- password ≥ 8 ký tự.
- role thuộc enum + qua SoD.
- file detection: đúng MIME (jpg/png/webp; mp4/mov cho video) + size ≤ **5MB ảnh / 50MB video**.
- token invite: tồn tại + chưa hết hạn + chưa dùng.
- query filter History (verdict/date): thuộc tập cho phép.

### Error mapping
| Tình huống | Hiện tại | Phải thành |
|---|---|---|
| Verdict filter lạ ở `/detections` (T3·B3) | 500 | **400** |
| Ảnh rác gửi detection/liveness (T3·B4) | 500 | **400** |
| Sai role | tuỳ | **403** |
| Resource không có | tuỳ | **404** |
| Email/key trùng | — | **409** |
| Chưa đăng nhập / key sai | — | **401** |
| Hết quota | — | **429** |
| Token invite hỏng/hết hạn | — | **400** + lý do |

## Cascade endpoint — `POST /v1/detect/cascade`

Auth: API key. Input: 1 ảnh khuôn mặt (multipart), `threshold?` optional.
Logic (mirror đúng client hiện tại trong `ekyc_demo/app.py`, chuyển gộp từ client sang backend, DRY — tái dùng code path `/detect/liveness` + `/detect/image`):

```
liveness(ảnh) ─ SPOOF     → final=FAIL    (deepfake=null)
              ─ UNCERTAIN → final=REVIEW  (deepfake=null)
              ─ LIVE      → deepfake(ảnh) → decision_hint: pass→PASS · review→REVIEW · reject→FAIL
```

Response — **lồng FULL payload y hệt endpoint lẻ** để Streamlit dùng lại `render_live`/`render_df` không sửa UI:
```json
{
  "request_id": "...",
  "liveness": { "...y hệt /v1/detect/liveness..." },
  "deepfake": { "...y hệt /v1/detect/image..." } | null,
  "final_decision": "PASS|REVIEW|FAIL",
  "reason": "...",
  "processing_time_ms": 0
}
```
Lưu vào detection history (`source='cascade'`). Lỗi: ảnh rác/không thấy mặt → 400; hết quota → 429.

## Attack-type (print/screen) — engineering-correct

Heuristic ở `serving/attack_classifier.py` (`classify_attack_type`), serving gọi khi spoof.
Yêu cầu:
1. **Chấm print & screen độc lập** từ evidence (moiré/texture/color/specular) — không còn `if/elif/else` 1 nhánh → label **và** confidence đều có nghĩa (fix T8·B5: confidence hiện luôn ≈1.0).
2. **Luôn chạy classifier thật** khi spoof: bỏ nhánh `rng.choice` trong `_mock_liveness` (mock random); xử lý import-error để không rơi về "unknown" âm thầm.
3. **Validate trên tập print/screen THẬT** của user → ca demo phân đúng loại.
4. **Surface** attack_type + confidence + evidence ở dashboard liveness page + Streamlit.

## i18n EN/VIE

- **Dashboard**: `frontend/src/lib/i18n.ts` (từ điển en/vi + `t(key)`), `frontend/src/store/locale.ts` (Zustand, persist `dg-locale`, mặc định vi). Toggle ở Settings + top-header. Rút mọi chuỗi trang in-scope thành key. KHÔNG dùng next-intl routing (app là client SPA).
- **Streamlit** (`ekyc_demo/app.py`): dict en/vi + `st.session_state["locale"]`, toggle ở sidebar.

## Model-version label

Thống nhất **1 nhãn canonical** ở 3 nơi: `.env MODEL_VERSION`, serving `version`, DB `model_versions`. Mặc định `sfdct-v1` (+ mô tả "B4+block-DCT, cdfv2 AUC 0.7572"); chuỗi cuối xác nhận lúc implement. Demo phải khớp báo cáo.

## Fixes folded in (audit in-scope)

- T3·B3/B4 (500→400), T5·F4 (models null guard), F5 (race cờ `alive` webcam), F6 (lỗi note Detail), F7 (rò camera khi rời liveness).
- invite_url tuyệt đối + surface link copy.
- ẩn trang OUT khỏi nav.
- (F10 billing_email moot — billing OUT.)

## Components & files (chính)

- Backend: `backend/app/routers/{auth,users,users_invites,api_keys,detect,liveness,detections,models,platform}.py`, `backend/app/services/liveness.py`, `backend/app/core/exceptions.py`.
- Serving: `serving/attack_classifier.py`, `serving/liveness_server.py`, `serving/infer_server.py`.
- Frontend: `frontend/src/components/deepguard/*-page.tsx`, `sidebar.tsx`, `frontend/src/lib/{api,rbac,i18n}.ts`, `frontend/src/store/locale.ts`.
- Streamlit: `ekyc_demo/app.py`.

## Testing strategy

- **pytest backend**: RBAC (mỗi action × role sai → 403), validate (input xấu → 400), error mapping (verdict lạ/ảnh rác → 400, trùng → 409, token hỏng → 400), golden-path happy (register→approve→invite→accept→key→detect→cascade).
- **Attack-type**: unit test trên mẫu print/screen thật → phân đúng + confidence < 1.0 khi mơ hồ.
- **Manual E2E**: chạy đúng kịch bản sân khấu 1 lần trước bảo vệ.
- **i18n smoke**: bật en/vi, không còn chuỗi cứng ở trang in-scope.

## Demo choreography

Seed: 1 sysadmin + 1 tenant PENDING (đã register trước). Live: duyệt → admin login → mời dev → dev accept + đặt MK → tạo API key → dán Streamlit → chạy 3 chế độ. Register show nhanh 1 lần.

## Non-goals

Billing thật, webhook delivery, notifications, cross-tenant analytics, face-match (CCCD↔selfie), active-liveness challenge, model registry/check-update, SUSPENDED tenant flow, rate-limit thật/concurrency hardening.
