# P5 — FE robustness + hide OUT nav + invite URL (Plan)

**Goal:** Vá robustness FE in-scope + ẩn trang OUT khỏi nav + invite link tuyệt đối.
**Branch:** `p5-fe-robustness` → merge `dev-thanhln-24062026`.

## Changes
| Item | File | Fix |
|------|------|-----|
| F4 null guard | `models-page.tsx` | 9 chỗ đọc `threshold`/`traffic_percent` → `?? 0` (1 model null không crash trang) |
| F5 alive flag | `detail-page.tsx`, `settings-page.tsx` | `let alive=true` + `if(alive)` + cleanup → chống race set-state sau unmount |
| F6 note error | `detail-page.tsx` | *đã đúng sẵn* (handleSaveNote catch → setError) — không sửa |
| F7 camera leak | `liveness-page.tsx` | *đã đúng sẵn* (`stopCamera` stop tracks + unmount cleanup) — không sửa |
| Invite URL | `team-page.tsx` | nút "Mời qua link" + modal: hiện `${window.location.origin}${invite_url}` (tuyệt đối) + CopyButton |
| Hide OUT nav | `rbac.ts` | `PAGE_ACCESS=[]` cho **billing, webhooks, notifications, analytics, audit** → `canAccess` false → sidebar ẩn + chặn |

## Quyết định nav-hiding (minh bạch)
- **Giữ `dashboard`** làm landing: spec xếp dashboard-analytics OUT, nhưng `defaultPageFor` trỏ dashboard cho mọi role; ẩn nó cần repoint landing + landing cho sysadmin (rủi ro). Đã ẩn trang `analytics` riêng; dashboard giữ làm trang chính.
- **Giữ `tenants`** (sysadmin): chứa duyệt/từ chối tenant (luồng vàng cần). "Tenant Approvals" tách riêng = build mới → defer.

## Verify
- `node_modules/.bin/tsc --noEmit`: **0 lỗi** toàn frontend.
- Sidebar sau đổi: ẩn billing/webhooks/notifications/analytics/audit; giữ playground/liveness/history/detail/models/team/apikeys/settings/account/docs/status/dashboard/tenants.

## Commit
`fix(fe): null-guard + alive-flags + absolute invite link + hide OUT-of-demo nav`. No co-author.
