# DeepGuard API Specification — 35 Endpoints

Version: `1.0.0-mvp` · Generated: thesis spec

## Auth Scheme

Three auth modes:

| Scheme | Header | Used by |
|--------|--------|---------|
| **Public** | — | Auth register/login, health |
| **JWT Bearer** | `Authorization: Bearer <jwt>` | Dashboard endpoints (tenant-scoped via `current_user.tenant_id`) |
| **API Key Bearer** | `Authorization: Bearer sk-dg-...` | Public detect endpoints (tenant-scoped via `api_key.tenant_id`) |

All responses are JSON. Errors use FastAPI default `{"detail": "message"}` format with appropriate HTTP status.

---

## 1. Authentication (5 endpoints)

| # | Method | Path | Auth | Purpose |
|---|--------|------|------|---------|
| 1 | POST | `/auth/register` | Public | Tạo tenant mới + admin user, trả JWT |
| 2 | POST | `/auth/login` | Public | Đăng nhập → JWT |
| 3 | GET  | `/auth/me` | JWT | Trả về user + tenant hiện tại |
| 4 | POST | `/auth/logout` | JWT | Ghi audit log đăng xuất (stateless JWT, client xóa token) |
| 5 | POST | `/auth/refresh` | JWT | Cấp lại access token mới |

## 2. Users & Tenant (6 endpoints)

| # | Method | Path | Auth | Purpose |
|---|--------|------|------|---------|
| 6 | GET    | `/users` | JWT | List users trong tenant |
| 7 | POST   | `/users/invite` | JWT (admin) | Mời user mới qua email |
| 8 | PATCH  | `/users/{user_id}` | JWT (admin) | Đổi role, name, is_active |
| 9 | DELETE | `/users/{user_id}` | JWT (admin) | Soft-delete user |
| 10 | GET   | `/tenant` | JWT | Lấy info tenant hiện tại |
| 11 | PATCH | `/tenant` | JWT (admin) | Update tên, billing email, metadata |

## 3. API Keys (5 endpoints)

| # | Method | Path | Auth | Purpose |
|---|--------|------|------|---------|
| 12 | GET    | `/api-keys` | JWT | List api keys của tenant |
| 13 | POST   | `/api-keys` | JWT | Tạo key mới (trả plain key duy nhất 1 lần) |
| 14 | GET    | `/api-keys/{key_id}` | JWT | Chi tiết 1 key (no plain) |
| 15 | PATCH  | `/api-keys/{key_id}` | JWT | Đổi name / quota / rate limit / status |
| 16 | DELETE | `/api-keys/{key_id}` | JWT | Revoke key |

## 4. Detection — Public API (4 endpoints)

| # | Method | Path | Auth | Purpose |
|---|--------|------|------|---------|
| 17 | POST | `/v1/detect/image` | API Key | Phát hiện deepfake từ 1 ảnh |
| 18 | POST | `/v1/detect/video` | API Key | Phát hiện deepfake video (sample frames) |
| 19 | GET  | `/v1/results/{request_id}` | API Key | Lấy lại result đã detect trước đó |
| 20 | GET  | `/v1/jobs/{job_id}` | API Key | Poll trạng thái job async (video) |

## 5. Liveness — Public API (3 endpoints)

| # | Method | Path | Auth | Purpose |
|---|--------|------|------|---------|
| 21 | POST | `/v1/detect/liveness` | API Key | Passive liveness — 1 ảnh |
| 22 | GET  | `/v1/liveness/challenge` | API Key | Lấy challenge ngẫu nhiên (blink/turn/smile/nod) |
| 23 | POST | `/v1/detect/liveness/active` | API Key | Active liveness — nhiều frame + challenge |

## 6. Detections — Dashboard (3 endpoints)

| # | Method | Path | Auth | Purpose |
|---|--------|------|------|---------|
| 24 | GET  | `/detections` | JWT | List detections với filter (verdict, time, api_key) |
| 25 | GET  | `/detections/{request_id}` | JWT | Chi tiết detection với thumb + metadata + audit notes |
| 26 | POST | `/detections/{request_id}/notes` | JWT | Thêm audit note cho compliance review |

## 7. Liveness Dashboard (2 endpoints)

| # | Method | Path | Auth | Purpose |
|---|--------|------|------|---------|
| 27 | GET | `/liveness` | JWT | List liveness checks |
| 28 | GET | `/liveness/{check_id}` | JWT | Detail 1 liveness check |

## 8. Webhooks (4 endpoints)

| # | Method | Path | Auth | Purpose |
|---|--------|------|------|---------|
| 29 | GET    | `/webhooks` | JWT | List webhooks |
| 30 | POST   | `/webhooks` | JWT | Tạo webhook (URL + events) |
| 31 | PUT    | `/webhooks/{webhook_id}` | JWT | Update URL / events / status |
| 32 | DELETE | `/webhooks/{webhook_id}` | JWT | Xóa webhook |

## 9. Analytics & Audit (3 endpoints)

| # | Method | Path | Auth | Purpose |
|---|--------|------|------|---------|
| 33 | GET | `/analytics/overview` | JWT | Tổng quan metrics (total, fake_rate, latency p50/p95) |
| 34 | GET | `/analytics/usage` | JWT | Quota usage hiện tại của tenant |
| 35 | GET | `/audit-logs` | JWT | Audit trail (filter action, resource, time) |

---

## Common Response Envelopes

### Pagination
```json
{
  "items": [...],
  "total": 127,
  "page": 1,
  "limit": 20
}
```

### Error
```json
{ "detail": "Human-readable message" }
```

### Detection Verdict Enum
- `FAKE` — Deepfake với prob_fake ≥ threshold + 0.10
- `REAL` — Người thật với prob_fake ≤ threshold − 0.10
- `UNCERTAIN` — Vùng giữa threshold ± 0.10

### Liveness Verdict Enum
- `LIVE` — Người thật ngồi trước camera (score ≥ 0.58)
- `SPOOF` — Phát hiện attack (score ≤ 0.42)
- `UNCERTAIN` — Vùng giữa threshold ± 0.08

### Spoof Type Enum
- `print` — Ảnh in trên giấy
- `screen` — Phát lại qua màn hình (moire pattern)
- `mask_3d` — Mặt nạ silicone/giấy
- `deepfake` — Video deepfake
- `unknown` — Không phân loại được

---

## Rate Limiting

- **Public API** (API key auth): Per-key `rate_limit_rpm` (default 60 req/min)
- **Dashboard** (JWT): 300 req/min per user
- HTTP 429 + header `Retry-After` khi vượt quota

## Quota

Mỗi tenant có `monthly_quota`. Mỗi `POST /v1/detect/*` consume 1 unit.

- HTTP 402 khi `current_usage >= monthly_quota`
- Quota reset đầu mỗi tháng (cron job — chưa implement)
