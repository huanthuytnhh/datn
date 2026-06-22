### 2.2.7 API specifications

This section specifies the public-facing and dashboard endpoints that constitute the DeepGuard service contract. The DeepGuard backend is a FastAPI application exposing thirty-five endpoints in total; the specification below details the ten endpoints that carry the core eKYC workflow — deepfake detection, liveness verification, and the authentication/provisioning operations that precede them. Every request travels the one-directional flow defined in the architecture (Next.js frontend or external client → FastAPI :8000 → service → repository → PostgreSQL :5432), and detection requests additionally fan out over `httpx` to the SFDCT microservice (EfficientNet-B4 + block-DCT + Grad-CAM) at port 8501. All payloads are JSON; errors follow the FastAPI default envelope `{"detail": "<message>"}` with an appropriate HTTP status code.

**Authentication schemes.** DeepGuard enforces two non-interchangeable authentication layers, plus a small set of public endpoints. Table 2.20 summarises the three schemes.

[[BẢNG 2.20: Ba lược đồ xác thực của DeepGuard]]

| Scheme | Header | Token form | Consumers | Tenant scoping |
|--------|--------|------------|-----------|----------------|
| Public | — | — | Auth register/login, accept-invite, `/health` | None |
| JWT Bearer | `Authorization: Bearer <jwt>` | Signed JWT (HS256, python-jose) | Dashboard / admin users | `current_user.tenant_id` |
| API-Key Bearer | `Authorization: Bearer sk-dg-…` | Opaque key `sk-dg-…` | External eKYC integrators | `api_key.tenant_id` |

The JWT layer governs the dashboard (`/auth`, `/users`, `/tenant(s)`, `/detections`, `/analytics`, `/audit-logs`, `/playground/*`) and is further constrained by role-based access control over five roles (`viewer`, `developer`, `compliance`, `admin`, `sysadmin`). The API-key layer governs the integration surface (`/v1/detect/*`, `/v1/liveness/*`, `/v1/results/*`, `/v1/jobs/*`) that a customer's backend invokes during live authentication. The two layers are never mixed on a single endpoint.

**Common conventions.** Detection results carry a discriminative verdict derived from the SFDCT score `prob_fake` and the calibrated decision threshold τ: `FAKE` when `prob_fake ≥ τ + 0.10`, `REAL` when `prob_fake ≤ τ − 0.10`, and `UNCERTAIN` within the band τ ± 0.10. Liveness verdicts follow the analogous rule against the liveness score (`LIVE` ≥ 0.58, `SPOOF` ≤ 0.42, `UNCERTAIN` in the band τ ± 0.08). Each `POST /v1/detect/*` call consumes one unit of the tenant's `monthly_quota`; exceeding the quota yields HTTP 402, while exceeding the per-key `rate_limit_rpm` (default 60 requests/min) yields HTTP 429 with a `Retry-After` header.

Table 2.21 gives the at-a-glance index of the ten endpoints specified in detail in the remainder of this section.

[[BẢNG 2.21: Bảng tổng hợp mười endpoint cốt lõi của DeepGuard]]

| # | Method | Path | Auth | Purpose |
|---|--------|------|------|---------|
| 1 | POST | `/v1/detect/image` | API-Key | Detect deepfake on a single image |
| 2 | POST | `/v1/detect/video` | API-Key | Detect deepfake on a video (sampled frames, async) |
| 3 | GET | `/v1/results/{request_id}` | API-Key | Retrieve a previously computed detection result |
| 4 | GET | `/v1/jobs/{job_id}` | API-Key | Poll the status of an asynchronous video job |
| 5 | POST | `/v1/detect/liveness` | API-Key | Passive liveness check on a single image |
| 6 | POST | `/auth/login` | Public | Authenticate a user, return a JWT |
| 7 | POST | `/auth/register` | Public | Create a new tenant + admin user (SUSPENDED, pending approval) |
| 8 | POST | `/auth/accept-invite` | Public | Activate an invited account from an invitation token |
| 9 | POST | `/api-keys` | JWT (developer/admin) | Mint a new API key (plain value shown once) |
| 10 | POST | `/tenants` | JWT (sysadmin) | Provision a new tenant (ACTIVE) + admin account |

The flow of a typical integration request — the path most exercised in production — is shown in Figure 2.7.

```mermaid
sequenceDiagram
    participant C as Customer backend
    participant API as FastAPI :8000
    participant DB as PostgreSQL :5432
    participant SF as SFDCT :8501
    C->>API: POST /v1/detect/image (Bearer sk-dg-…, image file)
    API->>API: Validate API key, check quota & rate limit
    API->>SF: httpx POST /predict (MTCNN-cropped face)
    SF-->>API: {prob_fake, label, gradcam_b64}
    API->>DB: persist detection (tenant-scoped)
    API-->>C: 200 {request_id, risk_score, risk_band, verdict, gradcam_b64}
```

*Figure 2.7: Sequence of a synchronous `/v1/detect/image` call — API-key validation and quota/rate-limit enforcement at the boundary, inference delegated to the SFDCT microservice, the detection persisted tenant-scoped, and the scored verdict returned to the caller.*

The following sub-sections specify each endpoint individually. Each specification states the method, path, authentication scheme, the request (path/query parameters and body), a concrete request example, the HTTP 200 response with a JSON example, and the relevant error codes.

#### 1) POST /v1/detect/image

[[BẢNG 2.22: Đặc tả endpoint POST /v1/detect/image]]

| Field | Specification |
|-------|---------------|
| Method | `POST` |
| Path | `/v1/detect/image` |
| Auth | API-Key (`Authorization: Bearer sk-dg-…`) |
| Request — body | `multipart/form-data` with field `file` = a single face image (JPEG/PNG). Optional field `callback_url` to receive a webhook on completion. |
| Response 200 | JSON object with `request_id`, `risk_score` ∈ [0,1], `risk_band`, `verdict` ∈ {`FAKE`,`REAL`,`UNCERTAIN`}, and `gradcam_b64` (base64 PNG overlay). |
| Error codes | `400` malformed/empty image; `401` missing/invalid API key; `402` monthly quota exhausted; `429` per-key rate limit exceeded. |

Example request:

```bash
curl -X POST https://api.deepguard.vn/v1/detect/image \
  -H "Authorization: Bearer sk-dg-7f3a9c2e1b8d4f60" \
  -F "file=@kyc_selfie.jpg"
```

Example 200 response:

```json
{
  "request_id": "det_01HZX9P3M4QK8YV2A6",
  "risk_score": 0.087,
  "risk_band": "low",
  "verdict": "REAL",
  "prob_fake": 0.087,
  "gradcam_b64": "iVBORw0KGgoAAAANSUhEUgAA...",
  "model": "SFDCT-EfficientNet-B4",
  "latency_ms": 142
}
```

#### 2) POST /v1/detect/video

[[BẢNG 2.23: Đặc tả endpoint POST /v1/detect/video]]

| Field | Specification |
|-------|---------------|
| Method | `POST` |
| Path | `/v1/detect/video` |
| Auth | API-Key (`Authorization: Bearer sk-dg-…`) |
| Request — body | `multipart/form-data` with field `file` = a video file. The server samples frames, crops faces with MTCNN, and aggregates per-frame scores asynchronously. |
| Response 200 | JSON acknowledging the asynchronous job: `job_id`, `status` = `queued`, and a `result_url` to poll. The final verdict is retrieved via `GET /v1/jobs/{job_id}` and `GET /v1/results/{request_id}`. |
| Error codes | `400` unsupported/corrupt video; `401` invalid API key; `402` quota exhausted; `429` rate limit exceeded. |

Example request:

```bash
curl -X POST https://api.deepguard.vn/v1/detect/video \
  -H "Authorization: Bearer sk-dg-7f3a9c2e1b8d4f60" \
  -F "file=@kyc_liveness_clip.mp4"
```

Example 200 response:

```json
{
  "job_id": "job_01HZXA1F7N5R2QW9",
  "request_id": "det_01HZXA1F7N5R2QW9",
  "status": "queued",
  "result_url": "/v1/jobs/job_01HZXA1F7N5R2QW9"
}
```

#### 3) GET /v1/results/{request_id}

[[BẢNG 2.24: Đặc tả endpoint GET /v1/results/{request_id}]]

| Field | Specification |
|-------|---------------|
| Method | `GET` |
| Path | `/v1/results/{request_id}` |
| Auth | API-Key (`Authorization: Bearer sk-dg-…`) |
| Request — path param | `request_id` — the identifier returned by a previous `/v1/detect/*` call. |
| Response 200 | The full detection record: `request_id`, `risk_score`, `risk_band`, `verdict`, `gradcam_b64`, and timestamps. Scoped to the calling key's tenant. |
| Error codes | `401` invalid API key; `403` the result belongs to another tenant; `404` unknown `request_id`. |

Example request:

```bash
curl https://api.deepguard.vn/v1/results/det_01HZX9P3M4QK8YV2A6 \
  -H "Authorization: Bearer sk-dg-7f3a9c2e1b8d4f60"
```

Example 200 response:

```json
{
  "request_id": "det_01HZX9P3M4QK8YV2A6",
  "risk_score": 0.087,
  "risk_band": "low",
  "verdict": "REAL",
  "created_at": "2026-06-08T09:14:22Z"
}
```

#### 4) GET /v1/jobs/{job_id}

[[BẢNG 2.25: Đặc tả endpoint GET /v1/jobs/{job_id}]]

| Field | Specification |
|-------|---------------|
| Method | `GET` |
| Path | `/v1/jobs/{job_id}` |
| Auth | API-Key (`Authorization: Bearer sk-dg-…`) |
| Request — path param | `job_id` — the identifier returned by `POST /v1/detect/video`. |
| Response 200 | Job status object: `job_id`, `status` ∈ {`queued`,`processing`,`done`,`failed`}, `progress` ∈ [0,1], and, once `done`, the aggregated `verdict` and `request_id`. |
| Error codes | `401` invalid API key; `403` job belongs to another tenant; `404` unknown `job_id`. |

Example 200 response (completed job):

```json
{
  "job_id": "job_01HZXA1F7N5R2QW9",
  "status": "done",
  "progress": 1.0,
  "request_id": "det_01HZXA1F7N5R2QW9",
  "verdict": "FAKE",
  "risk_score": 0.913,
  "risk_band": "high",
  "frames_analyzed": 32
}
```

#### 5) POST /v1/detect/liveness

[[BẢNG 2.26: Đặc tả endpoint POST /v1/detect/liveness]]

| Field | Specification |
|-------|---------------|
| Method | `POST` |
| Path | `/v1/detect/liveness` |
| Auth | API-Key (`Authorization: Bearer sk-dg-…`) |
| Request — body | `multipart/form-data` with field `file` = a single face image for passive (no-challenge) liveness scoring. |
| Response 200 | JSON with `check_id`, `score` ∈ [0,1], `verdict` ∈ {`LIVE`,`SPOOF`,`UNCERTAIN`}, and, when a spoof is detected, `spoof_type` ∈ {`print`,`screen`,`mask_3d`,`deepfake`,`unknown`}. |
| Error codes | `400` no face detected / malformed image; `401` invalid API key; `402` quota exhausted; `429` rate limit exceeded. |

Example request:

```bash
curl -X POST https://api.deepguard.vn/v1/detect/liveness \
  -H "Authorization: Bearer sk-dg-7f3a9c2e1b8d4f60" \
  -F "file=@kyc_face.jpg"
```

Example 200 response (spoof detected):

```json
{
  "check_id": "liv_01HZXB4G2P8T6KM3",
  "score": 0.31,
  "verdict": "SPOOF",
  "spoof_type": "screen"
}
```

#### 6) POST /auth/login

[[BẢNG 2.27: Đặc tả endpoint POST /auth/login]]

| Field | Specification |
|-------|---------------|
| Method | `POST` |
| Path | `/auth/login` |
| Auth | Public |
| Request — body | `application/json` with `email` and `password`. |
| Response 200 | JSON with `access_token` (JWT), `token_type` = `bearer`, and the authenticated `user` (id, name, role, tenant_id). |
| Error codes | `400` malformed body; `401` invalid credentials; `403` tenant is SUSPENDED (organisation not yet approved). |

Example request:

```json
{
  "email": "dev@vietbank.vn",
  "password": "Password123!"
}
```

Example 200 response:

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "id": "usr_3f1a",
    "name": "Dev VietBank",
    "role": "developer",
    "tenant_id": "tnt_vietbank"
  }
}
```

When the tenant is still SUSPENDED — the state of a self-service registration awaiting `sysadmin` approval — login is rejected with HTTP 403 and the message "Tổ chức đã bị tạm ngưng. Liên hệ quản trị nền tảng."

#### 7) POST /auth/register

[[BẢNG 2.28: Đặc tả endpoint POST /auth/register]]

| Field | Specification |
|-------|---------------|
| Method | `POST` |
| Path | `/auth/register` |
| Auth | Public |
| Request — body | `application/json` with `tenant_name`, `full_name`, `email`, `password`. |
| Response 200 | JSON acknowledging a pending registration: a new tenant is created in state SUSPENDED together with an `admin` user; status `pending`. The account becomes usable only after a `sysadmin` activates the tenant. |
| Error codes | `400` validation error (weak password / missing field); `409` email or tenant already exists. |

Example request:

```json
{
  "tenant_name": "ACB Digital",
  "full_name": "Nguyen Van A",
  "email": "admin@acb.vn",
  "password": "Password123!"
}
```

Example 200 response:

```json
{
  "status": "pending",
  "message": "Đã gửi đăng ký — chờ phê duyệt",
  "tenant": { "id": "tnt_acb", "name": "ACB Digital", "status": "SUSPENDED" }
}
```

This deliberate "pending approval" design implements controlled B2B onboarding: self-service registration never grants an immediately usable admin account.

#### 8) POST /auth/accept-invite

[[BẢNG 2.29: Đặc tả endpoint POST /auth/accept-invite]]

| Field | Specification |
|-------|---------------|
| Method | `POST` |
| Path | `/auth/accept-invite` |
| Auth | Public (the invitation token itself is the credential) |
| Request — body | `application/json` with `token` (the invitation token from `/?invite=<token>`), `full_name`, `password`. The token carries the pre-assigned role and target tenant. |
| Response 200 | JSON creating the user with the invited role, consuming the token, and returning an `access_token` for auto-login (id, name, role, tenant_id). |
| Error codes | `400` token expired / already used / invalid (returns `valid:false` + reason); `401` token signature invalid. |

Example request:

```json
{
  "token": "inv_8a2f0c91d7e3",
  "full_name": "Tran Thi B",
  "password": "Password123!"
}
```

Example 200 response:

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "id": "usr_9c4d",
    "name": "Tran Thi B",
    "role": "viewer",
    "tenant_id": "tnt_vietbank"
  }
}
```

The corresponding pre-fill check uses `GET /auth/accept-invite?token=…`, which returns the invited email, role, and tenant name (or `valid:false` + reason) so the frontend can show the invitation context before the user sets a password.

#### 9) POST /api-keys

[[BẢNG 2.30: Đặc tả endpoint POST /api-keys]]

| Field | Specification |
|-------|---------------|
| Method | `POST` |
| Path | `/api-keys` |
| Auth | JWT Bearer (roles `developer` and `admin`) |
| Request — body | `application/json` with `name` (label) and optional `monthly_quota`, `rate_limit_rpm`. The key is created scoped to `current_user.tenant_id`. |
| Response 200 | JSON with the key record (id, name, prefix, quota, rate limit) and the plain `key` value `sk-dg-…` — returned exactly once and never recoverable afterwards. |
| Error codes | `400` validation error; `401` missing/invalid JWT; `403` role lacks key-management permission (e.g. `viewer`, `compliance`). |

Example request:

```json
{
  "name": "VietBank production eKYC",
  "rate_limit_rpm": 120
}
```

Example 200 response:

```json
{
  "id": "key_2b7e",
  "name": "VietBank production eKYC",
  "key": "sk-dg-7f3a9c2e1b8d4f60a1c5",
  "prefix": "sk-dg-7f3a",
  "rate_limit_rpm": 120,
  "monthly_quota": 100000,
  "status": "active"
}
```

The plain `key` is shown only in this response; subsequent `GET /api-keys/{key_id}` calls return the record without the plain value.

#### 10) POST /tenants

[[BẢNG 2.31: Đặc tả endpoint POST /tenants]]

| Field | Specification |
|-------|---------------|
| Method | `POST` |
| Path | `/tenants` |
| Auth | JWT Bearer (role `sysadmin` only) |
| Request — body | `application/json` with `tenant_name`, `admin_email`, `admin_full_name`, and optional `plan`, `monthly_quota`. |
| Response 200 | JSON creating a tenant in state ACTIVE together with an `admin` account; includes a one-time `temporary_password` (shown once, copied to the admin) to bootstrap login. |
| Error codes | `400` validation error; `401` missing/invalid JWT; `403` caller is not `sysadmin`; `409` tenant or admin email already exists. |

Example request:

```json
{
  "tenant_name": "Techcombank eKYC",
  "admin_email": "admin@tcb.vn",
  "admin_full_name": "Le Van C",
  "plan": "enterprise"
}
```

Example 200 response:

```json
{
  "tenant": { "id": "tnt_tcb", "name": "Techcombank eKYC", "status": "ACTIVE", "plan": "enterprise" },
  "admin": { "id": "usr_tcb_admin", "email": "admin@tcb.vn", "role": "admin" },
  "temporary_password": "Tcb-9fK2-Qz7r"
}
```

Unlike self-service registration (`/auth/register`, which yields a SUSPENDED tenant), a tenant provisioned by a `sysadmin` is ACTIVE immediately, and the temporary password is surfaced exactly once for the platform operator to hand off to the new organisation's administrator. This same endpoint is the mechanism by which a `sysadmin` can also *approve* a pending self-service registration by activating the previously SUSPENDED tenant.
