# CHAPTER 2: SYSTEM ANALYSIS AND DESIGN

Chapter 1 clarified the theories and technologies that underpin DeepGuard: the web stack (JavaScript, Next.js, FastAPI, HTTP API, DNS), the AI building blocks (EfficientNet-B4, the discrete cosine transform and frequency analysis, attention and fusion), the deepfake and liveness domains, the eKYC legal context, and the AWS services that host the platform. Chapter 2 moves from *why* to *how*. We first analyse what the system must be able to do (functional requirements) and how well it must do it (non-functional requirements); we then design the overall system — its actors, use cases, layered architecture, activity and sequence flows, and API contract; and finally — as the two central, parallel parts of the chapter — we present in depth the **two detection methods** that the platform composes into an eKYC cascade: the primary **deepfake-detection method (SFDCT)** and the secondary **liveness-detection method** (trained and measured, §3.1.8).

Throughout, the guiding spirit is the one inherited from Chapter 1: every design decision originates from a concrete need, is explained first by intuition and then by formula, is anchored to a figure or table, and is always tied to the ultimate goal of **cross-dataset generalisation** measured by frame-level AUC on Celeb-DF-v2. Deepfake detection is the deep, primary contribution of this thesis; liveness detection is a secondary module whose architecture is designed here by reusing the SFDCT components and whose measured results are reported in §3.1.8.

---

## 2.1 Requirement analysis

Before designing any component, we must answer two questions: what must the system *be able to do* (functional requirements), and *how good* must it be (non-functional requirements)? The banking eKYC context imposes stricter constraints than an ordinary image-classification problem — a wrong decision may let a fraudster bypass biometric authentication — so the system must be not only accurate but also *explainable* and *threshold-calibratable* in accordance with regulation.

### 2.1.1 Functional requirements

The functional requirements describe the capabilities the system must provide. Following the four-group shape, they fall into four families: **deepfake detection**, **liveness detection**, **UI & upload**, and **monitoring & alert**.

**(a) Deepfake detection.** The core capability. The system loads a face image or a frame extracted from an eKYC video, normalises it to a 256×256 tensor, runs the SFDCT model to obtain a fake probability, returns a probability plus a REAL/FAKE/UNCERTAIN verdict, generates a Grad-CAM explanation, and exposes a calibrated decision threshold τ. For video, it samples frames, runs per-frame inference, and aggregates an overall verdict.

*Table 2.1: Functional requirements — deepfake detection.*

| ID | Function | Input | Output | Significance |
|----|----------|-------|--------|--------------|
| FR1 | Load face image/frame | Still image or frame from an eKYC video | Normalised 256×256 image tensor | Entry point of the pipeline |
| FR2 | Detect deepfake (image) | Pre-processed face crop | REAL/FAKE discriminative logit/embedding | Core capability |
| FR3 | Return probability + verdict | Model logit | `prob_fake` ∈ [0,1] + REAL/FAKE/UNCERTAIN | Result consumed by the business layer |
| FR4 | Detect deepfake (video) | Sampled frames | Aggregated verdict + per-frame grid | Supports liveness-clip eKYC |
| FR5 | Generate Grad-CAM | Image + trained model | Heatmap overlay of suspicious regions | Explainability for human reviewers |
| FR6 | Calibrate eKYC threshold | Score distribution on validation | Threshold τ satisfying FPR ≤ 5% (ISO/IEC 30107-3) | Concrete operating point for eKYC |

**(b) Liveness detection (secondary, measured).** Determine whether the subject is a live person rather than a print, a screen replay, a 3D mask or a deepfake. Supports passive (single-image) and active (multi-frame challenge–response) modes, returns a LIVE/SPOOF/UNCERTAIN verdict and, when SPOOF, a spoof-type classification. This module is designed in Section 2.4 and measured in §3.1.8; its metrics are APCER/BPCER/ACER.

*Table 2.2: Functional requirements — liveness detection.*

| ID | Function | Input | Output | Significance |
|----|----------|-------|--------|--------------|
| FR7 | Passive liveness check | Single face image | `score` ∈ [0,1] + LIVE/SPOOF/UNCERTAIN | Pre-filter before deepfake stage |
| FR8 | Active liveness (challenge) | Challenge token + captured frame(s) | LIVE/SPOOF verdict | Defends against replayed captures |
| FR9 | Classify spoof type | A SPOOF capture | `spoof_type` ∈ {print, screen, mask_3d, deepfake, unknown} | Traceability for compliance |

**(c) UI & upload.** The DeepGuard dashboard (Next.js) lets a tenant user upload an image or video in the Playground, view the risk score, band and decision hint, inspect the Grad-CAM overlay and frequency spectrum, browse a detection history/timeline, manage API keys, invite team members, and review the FAKE queue. External integrators upload through the API-key-authenticated `/v1/*` endpoints.

*Table 2.3: Functional requirements — UI & upload.*

| ID | Function | Actor | Significance |
|----|----------|-------|--------------|
| FR10 | Upload image/video (Playground) | Developer, Admin (JWT) | Human-in-the-loop testing |
| FR11 | Render result (risk score + band + heatmap + spectrum) | Dashboard roles | Decision support |
| FR12 | History & analytics | Viewer and above | Audit and traceability |
| FR13 | API-key upload (`/v1/*`) | External eKYC client | Production integration |

**(d) Monitoring & alert.** The platform must log inference traffic, latency and errors, surface health endpoints, and raise alerts to the operating team. Alerts are delivered to **Google Chat** (Section 2.2.3-E). This family corresponds directly to the operational non-functional requirements below.

*Table 2.4: Functional requirements — monitoring & alert.*

| ID | Function | Source | Significance |
|----|----------|--------|--------------|
| FR14 | Health check | `/health` (backend + microservice) | Liveness/readiness probing |
| FR15 | Structured logging | CloudWatch Logs | Observability |
| FR16 | Alerting | Google Chat webhook | On-call notification |

These functions form a closed chain: FR1–FR4 perform classification, FR5 explains the decision, FR6 sets the operating threshold, FR7–FR9 add the liveness pre-filter, FR10–FR13 expose the capability to humans and machines, and FR14–FR16 keep the running system observable. Notably, FR5 (Grad-CAM) and FR6 (threshold calibration) are often overlooked in purely academic studies but are *mandatory* prerequisites for banking deployment: reviewers need to know "where the model looks", and the compliance team needs a threshold with a quantitative basis.

*Takeaway:* the system is not a single classifier but a four-family service — detect, prove live, present, and observe.

### 2.1.2 Non-functional requirements

The non-functional requirements specify the *quality* of the system. We adopt the seven quality attributes below.

*Table 2.5: Non-functional requirements and measurement criteria.*

| ID | Attribute | Measurement criterion | Target |
|----|-----------|-----------------------|--------|
| NFR1 | **Performance** | Frame-level AUC on CDFv2 (trained on FF++); inference latency per frame | AUC higher than the B4 baseline (0.7497); CPU-only serving latency ≈ 0.3–1 s/image (measured on the deployed stack, §3.2) |
| NFR2 | **Scalability** | Throughput under concurrent `/v1/*` load; stateless backend behind a load balancer | Horizontal scaling of FastAPI + microservice replicas |
| NFR3 | **Availability & Reliability** | Health checks, graceful degradation when the microservice is down | `/health` probes; deterministic re-runs (fixed seed) |
| NFR4 | **Maintainability** | File ≤ 250 lines, one-directional flow, deepguard_db-only DB access (CONVENTIONS.md) | Replaceable model behind the `/predict` contract |
| NFR5 | **Usability** | Explainability available to reviewers (Grad-CAM + t-SNE + frequency viz) | Reviewers can understand every verdict |
| NFR6 | **Portability** | Containerised services, CUDA/CPU fallback, config-driven thresholds | Runs locally and on AWS unchanged |
| NFR7 | **Monitoring & Logging** | Structured logs, metrics, alerts to Google Chat | Operators notified of anomalies |

The key point to emphasise is that **NFR1 (cross-dataset performance) is given the highest priority**. In practice, an attacker uses new deepfake tools the model *has never seen during training*. A model that achieves a very high in-dataset AUC but collapses on an unfamiliar manipulation is useless for eKYC. Therefore the entire method design in Section 2.3 takes "improving cross-dataset AUC without sacrificing stability" as its guiding principle — and the operating point (NFR1's latency-and-threshold facet) is treated honestly: as we will see in Chapter 3, at the eKYC threshold the model catches only a minority of fakes, which is precisely why liveness (Section 2.4) is composed in front of it.

*Takeaway:* of the seven attributes, cross-dataset performance leads; the rest exist to make that performance deployable and observable.

---

## 2.2 System design

### 2.2.1 Use-case diagram

Beyond the SFDCT model that performs the core inference, DeepGuard is delivered as a multi-tenant web platform. This section formalises *who* may invoke each capability and under what conditions. The platform request flow is one-directional: the **Next.js** front-end (port 3000) calls the **FastAPI** back-end (port 8000) through `src/lib/api.ts`; the back-end resolves data exclusively through the `deepguard_db` layer against **PostgreSQL** (port 5432), and forwards any inference request over `httpx` to the **SFDCT** microservice (port 8501, EfficientNet-B4 + block-DCT + Grad-CAM). The platform exposes two strictly separated authentication layers: a **JWT Bearer** layer for the human dashboard (`get_current_user`, `require_role`, `require_sysadmin`) and an **API-key Bearer** layer (`Authorization: Bearer sk-dg-…`, `get_api_key_auth`) for external eKYC integration on the `/v1/*` namespace.

#### Actors

Six actor archetypes interact with DeepGuard. Five are authenticated dashboard roles (`UserRole`), arranged in a privilege hierarchy from level 0 (read-only) to level 4 (platform-wide); the sixth is the unauthenticated visitor. A tenant administrator and the system administrator operate the dashboard via JWT, whereas the customer's own back-end integrates with the public detection endpoints via an API key.

*Table 2.6: Actors of the DeepGuard platform.*

| Actor | Description |
|-------|-------------|
| **Anonymous** | An unauthenticated visitor. May browse the public landing, pricing and documentation pages, self-register a new organisation (`POST /auth/register`), or accept a team invitation (`GET/POST /auth/accept-invite`). Holds no JWT and sees no tenant data. |
| **Viewer** (`viewer`, level 0) | A read-only member of a tenant. May view detection history, liveness checks and analytics; PII (image, IP, user-agent) is masked. Cannot modify any resource. |
| **Developer** (`developer`, level 1) | A tenant member responsible for API integration. May run the JWT-authenticated Playground (`/playground/detect/*`), create and revoke API keys, and configure webhooks. PII is masked in detection detail. |
| **Compliance** (`compliance`, level 2) | A tenant member responsible for review and regulatory traceability (TT17/ND13). May view the FAKE queue with **full PII**, open detection detail and attach audit notes (`POST /detections/{id}/notes`). Read-only otherwise. |
| **Admin** (`admin`, level 3) | The administrator of a single tenant. Manages team members and roles, invites members, manages API keys and webhooks, reads audit logs, and configures the tenant — all scoped to the administrator's own `tenant_id`. Cannot cross organisations, create tenants, or edit model thresholds. |
| **Sysadmin** (`sysadmin`, level 4) | The platform operator, acting **across all tenants**. Creates and approves/activates tenants (`POST/PATCH /tenants`), inspects any tenant's users and keys, and is the only actor allowed to edit model versions and thresholds. Cannot assign the `sysadmin` role to a tenant member. |

#### Overview

Figure 2.1 presents the use-case diagram. The unauthenticated **Anonymous** actor and the five authenticated dashboard roles inherit privileges upward (each higher role subsumes the use cases of the roles below it). The external eKYC client, although technically driven by the same back-end that hosts a developer's API key, is drawn separately to highlight the API-key authentication boundary on the `/v1/*` endpoints.

```mermaid
flowchart LR
    Anon([Anonymous])
    Viewer([Viewer])
    Dev([Developer])
    Comp([Compliance])
    Admin([Admin])
    Sys([Sysadmin])
    Client([External eKYC client])

    subgraph DeepGuard[DeepGuard platform]
        UC1((UC-01 Detect image))
        UC2((UC-02 Detect video))
        UC3((UC-03 Liveness check))
        UC4((UC-04 Register organisation))
        UC5((UC-05 Approve / activate tenant))
        UC6((UC-06 Manage API keys))
        UC7((UC-07 Invite & manage team))
        UC8((UC-08 Review detection & add note))
        UCv((View history & analytics))
    end

    Anon --> UC4
    Viewer --> UCv
    Dev --> UCv
    Dev --> UC1
    Dev --> UC2
    Dev --> UC3
    Dev --> UC6
    Comp --> UCv
    Comp --> UC8
    Admin --> UC6
    Admin --> UC7
    Admin --> UC1
    Admin --> UC2
    Sys --> UC5
    Sys --> UC7
    Client --> UC1
    Client --> UC2
    Client --> UC3
```

*Figure 2.1: DeepGuard use-case diagram — six actors over the eight core use cases. Dashboard actors authenticate with JWT; the external eKYC client authenticates with an API key on the `/v1/*` namespace.*

Separating the dashboard actors from the external client accurately reflects two operating phases: the *offline* phase (the engineer trains, evaluates and calibrates the threshold) and the *online* phase (the customer is authenticated in real time). Both phases share the same SFDCT model but differ in their data flow, as the activity and sequence diagrams below make explicit.

*Takeaway:* eight core use cases, six actors, and one hard authentication boundary between the human dashboard (JWT) and the machine integration surface (API key).

### 2.2.2 Use-case specification

The eight core use cases are specified below following the standard template (name, identifier, actors, description, trigger, pre-/post-conditions, basic flow, alternative flow, exception flow). Each specification reflects the actual endpoints and role matrix of the implemented system.

*Table 2.7: Use-case specification — UC-01 Detect deepfake (image).*

| Field | Content |
|-------|---------|
| **Use Case Name** | Detect deepfake (image) |
| **Use Case ID** | UC-01 |
| **Actor(s)** | Developer, Admin (Playground, JWT); External eKYC client (`/v1`, API key) |
| **Description** | Submit a single image for deepfake analysis. The back-end crops the face with MTCNN and forwards it to the SFDCT microservice, which returns a fake probability, a REAL/FAKE/UNCERTAIN verdict, a Grad-CAM heatmap and the 2D-DCT frequency spectrum. |
| **Trigger** | The actor uploads an image in the Playground and presses *Analyse*, or the client `POST`s an image to `/v1/detect/image`. |
| **Pre-condition** | Dashboard path: a valid JWT for a `developer`/`admin` in an active tenant. API path: a valid `sk-dg-…` key; the tenant's `current_usage < monthly_quota`. |
| **Post-condition(s)** | A detection result is produced and returned as JSON; quota is consumed by one unit on the `/v1` path; the result is retrievable via `GET /v1/results/{request_id}`. |
| **Basic Flow** | 1. The actor submits the image. 2. The back-end authenticates (JWT or API key) and checks quota. 3. MTCNN detects and crops the face. 4. The back-end forwards the crop to SFDCT over `httpx`. 5. SFDCT returns `prob_fake`, label and `gradcam_b64`. 6. The back-end derives the verdict (FAKE if `prob_fake ≥ τ + 0.10`, REAL if `≤ τ − 0.10`, otherwise UNCERTAIN). 7. The result, heatmap and frequency spectrum are returned and displayed. |
| **Alternative Flow** | A1. If the actor uses the Playground (JWT), quota is counted but the result is **not** persisted to the `detections` table. A2. The score lands in the ±0.10 band → the verdict is returned as UNCERTAIN. |
| **Exception Flow** | E1. No face detected → an error message is returned. E2. Invalid/missing token → 401. E3. `current_usage ≥ monthly_quota` → 402. E4. SFDCT microservice unreachable → 5xx with a `{"detail": …}` envelope. |

*Table 2.8: Use-case specification — UC-02 Detect deepfake (video).*

| Field | Content |
|-------|---------|
| **Use Case Name** | Detect deepfake (video) |
| **Use Case ID** | UC-02 |
| **Actor(s)** | Developer, Admin (Playground, JWT); External eKYC client (`/v1`, API key) |
| **Description** | Submit a video for deepfake analysis. The back-end samples frames, runs per-frame SFDCT inference and aggregates an overall verdict; long videos are processed as an asynchronous job that the client polls. |
| **Trigger** | The actor uploads a video in the Playground, or the client `POST`s to `/v1/detect/video`. |
| **Pre-condition** | A valid JWT (`developer`/`admin`) or a valid API key; quota available on the `/v1` path. |
| **Post-condition(s)** | An aggregated verdict and a per-frame grid are returned; for async processing a `job_id` is issued and pollable via `GET /v1/jobs/{job_id}`. |
| **Basic Flow** | 1. The actor submits the video. 2. The back-end authenticates and checks quota. 3. Representative frames are sampled. 4. Each frame is face-cropped and sent to SFDCT. 5. Per-frame scores are aggregated into a single verdict. 6. The aggregated verdict plus the frame grid are returned. |
| **Alternative Flow** | A1. Large video → the request returns a `job_id`; the client polls `GET /v1/jobs/{job_id}` until the job completes, then fetches the result. A2. Playground (JWT) path counts quota but does not persist to `detections`. |
| **Exception Flow** | E1. No face in any sampled frame → error. E2. 401 on invalid token. E3. 402 when quota exceeded. E4. Job failure surfaced as a failed status on `GET /v1/jobs/{job_id}`. |

*Table 2.9: Use-case specification — UC-03 Liveness check.*

| Field | Content |
|-------|---------|
| **Use Case Name** | Liveness check (anti-spoofing) |
| **Use Case ID** | UC-03 |
| **Actor(s)** | Developer (Playground, JWT); External eKYC client (`/v1`, API key) |
| **Description** | Determine whether the subject is a live person rather than a print, screen replay, 3D mask or deepfake. Supports passive (single image) and active (multi-frame challenge–response) modes. |
| **Trigger** | The client `POST`s an image to `/v1/detect/liveness` (passive), or requests `GET /v1/liveness/challenge` then `POST /v1/detect/liveness/active` (active). |
| **Pre-condition** | A valid API key (or JWT for the Playground); for active mode, a previously issued challenge token. |
| **Post-condition(s)** | A liveness verdict is returned: LIVE (score ≥ 0.58), SPOOF (≤ 0.42) or UNCERTAIN (±0.08 band), with a spoof-type classification when SPOOF. |
| **Basic Flow** | 1. (Active) The client requests a random challenge (blink/turn/smile/nod). 2. The client captures the required frame(s). 3. The client submits the image(s) (and challenge for active mode). 4. The back-end runs the liveness model. 5. The verdict and, if applicable, spoof type (`print`/`screen`/`mask_3d`/`deepfake`/`unknown`) are returned. |
| **Alternative Flow** | A1. Passive mode skips steps 1–2 and submits a single image directly to `/v1/detect/liveness`. A2. Score in the ±0.08 band → UNCERTAIN is returned, prompting a re-capture. |
| **Exception Flow** | E1. No face / poor quality frame → error. E2. 401 on invalid key. E3. Expired/incorrect challenge token (active mode) → rejected. |

*Table 2.10: Use-case specification — UC-04 Register organisation (anonymous).*

| Field | Content |
|-------|---------|
| **Use Case Name** | Register organisation (self-service) |
| **Use Case ID** | UC-04 |
| **Actor(s)** | Anonymous |
| **Description** | A visitor self-registers a new organisation. The back-end creates a tenant in the **SUSPENDED** state together with an `admin` user; the organisation cannot be used until a sysadmin activates it (UC-05). |
| **Trigger** | The visitor presses *Try for free* / a pricing-plan button on the landing page and submits the registration form. |
| **Pre-condition** | The visitor is not authenticated; the submitted email is not already registered. |
| **Post-condition(s)** | A SUSPENDED tenant and its admin user exist; a "registration submitted — awaiting approval" screen is shown. The account cannot yet log in. |
| **Basic Flow** | 1. The visitor opens `/` and navigates to *Register*. 2. The visitor enters organisation name, full name, email and password. 3. The visitor submits → `POST /auth/register`. 4. The back-end creates a SUSPENDED tenant + admin user. 5. The "awaiting approval" screen is displayed. |
| **Alternative Flow** | A1. The visitor instead opens an invitation link `/?invite=<token>` and joins an existing tenant via `POST /auth/accept-invite`, bypassing the approval wait. |
| **Exception Flow** | E1. The visitor attempts `POST /auth/login` immediately → blocked because the tenant is not active; the message "Organisation is suspended. Contact the platform administrator." is shown. E2. Duplicate email or invalid input → validation error. |

*Table 2.11: Use-case specification — UC-05 Approve / activate tenant (sysadmin).*

| Field | Content |
|-------|---------|
| **Use Case Name** | Approve / activate tenant |
| **Use Case ID** | UC-05 |
| **Actor(s)** | Sysadmin |
| **Description** | The platform operator reviews tenants and activates a self-registered (SUSPENDED) organisation, or creates a new tenant directly. Direct creation activates the tenant immediately and reveals a one-time temporary admin password. |
| **Trigger** | The sysadmin opens *Tenant management* and activates a pending tenant, or runs the *Create tenant* wizard. |
| **Pre-condition** | A valid JWT with the `sysadmin` role. |
| **Post-condition(s)** | The target tenant's status becomes **active**; its admin user can now log in. For direct creation, a temporary password is displayed exactly once. |
| **Basic Flow** | 1. The sysadmin logs in → `SysadminDashboard`. 2. The sysadmin opens *Tenant management* (`GET /tenants`). 3. The sysadmin selects the pending tenant. 4. The sysadmin activates it → `PATCH /tenants/{id}` with `status=active`. 5. The tenant status updates instantly and the admin may now log in. |
| **Alternative Flow** | A1. *Create tenant* — the 3-step wizard calls `POST /tenants`; the tenant is **ACTIVE immediately** and an admin account plus a one-time temporary password are shown. A2. The sysadmin may suspend, change plan or adjust quota via `PATCH /tenants/{id}`. |
| **Exception Flow** | E1. A non-sysadmin attempts the operation → `require_sysadmin` rejects with 403. E2. Invalid tenant id → 404. |

*Table 2.12: Use-case specification — UC-06 Manage API keys (developer / admin).*

| Field | Content |
|-------|---------|
| **Use Case Name** | Manage API keys |
| **Use Case ID** | UC-06 |
| **Actor(s)** | Developer, Admin |
| **Description** | Create, inspect, update and revoke the `sk-dg-…` API keys used by the tenant's external eKYC integration. The plain key value is shown exactly once at creation time. |
| **Trigger** | The actor opens the *API Keys* page and creates, edits or revokes a key. |
| **Pre-condition** | A valid JWT with the `developer` or `admin` role in an active tenant. |
| **Post-condition(s)** | The key set of the tenant is changed; a newly created key's plain value is revealed once and never again; revoked keys can no longer authenticate `/v1/*` requests. |
| **Basic Flow** | 1. The actor opens *API Keys* → `GET /api-keys`. 2. The actor presses *Create key* → `POST /api-keys`. 3. The back-end returns the plain key, shown once for copying. 4. The actor may later inspect (`GET /api-keys/{key_id}`) or update name/quota/rate-limit/status (`PATCH /api-keys/{key_id}`). |
| **Alternative Flow** | A1. The actor revokes a key → `DELETE /api-keys/{key_id}`; subsequent `/v1/*` calls with that key fail authentication. |
| **Exception Flow** | E1. A `viewer`/`compliance`/`sysadmin` attempts the operation → `require_role` rejects with 403. E2. Invalid key id → 404. |

*Table 2.13: Use-case specification — UC-07 Invite & manage team (admin).*

| Field | Content |
|-------|---------|
| **Use Case Name** | Invite & manage team |
| **Use Case ID** | UC-07 |
| **Actor(s)** | Admin (Sysadmin may also manage users) |
| **Description** | The tenant administrator builds the team: invites new members by email, creates users with a role, changes roles, enables/disables, soft-deletes and resets passwords — all scoped to the administrator's own tenant. |
| **Trigger** | The admin opens *Team & Roles* and invites or edits a member. |
| **Pre-condition** | A valid JWT with the `admin` role (or `sysadmin`). |
| **Post-condition(s)** | The tenant's user set is updated; an invitation produces a link `/?invite=<token>`; a reset issues a one-time temporary password and forces a first-login change. |
| **Basic Flow** | 1. The admin opens *Team & Roles* → `GET /users`. 2. The admin invites a member → `POST /users/invite`, receiving an invite link. 3. The invitee opens `/?invite=<token>`, sets name and password → `POST /auth/accept-invite`, and is auto-logged-in with the invited role. 4. The admin may change role/name/active state → `PATCH /users/{user_id}`, or soft-delete → `DELETE /users/{user_id}`. |
| **Alternative Flow** | A1. The admin creates a member directly via `POST /users` (viewer/developer/admin) instead of inviting. A2. The admin resets a member's password → `POST /users/{id}/reset-password`, surfacing a one-time temporary password. |
| **Exception Flow** | E1. The admin attempts to manage a `compliance`/`sysadmin` user, or to self-demote/self-delete → blocked by separation-of-duties. E2. Expired/used/invalid invite token → `accept-invite` returns `valid:false` with a reason. E3. Non-admin actor → 403. |

*Table 2.14: Use-case specification — UC-08 Review detection & add audit note (compliance).*

| Field | Content |
|-------|---------|
| **Use Case Name** | Review detection & add audit note |
| **Use Case ID** | UC-08 |
| **Actor(s)** | Compliance (Admin may also add notes) |
| **Description** | The compliance officer reviews the queue of suspected deepfakes, opens a detection with **full PII** (image, IP, user-agent) and attaches an investigation note for regulatory traceability under TT17/ND13. |
| **Trigger** | The compliance officer opens the FAKE queue and selects a detection to review. |
| **Pre-condition** | A valid JWT with the `compliance` (or `admin`) role; the detection belongs to the actor's tenant. |
| **Post-condition(s)** | An audit note is attached to the detection record and persisted; the action is captured in the audit trail. |
| **Basic Flow** | 1. The officer logs in → `ComplianceDashboard`. 2. The officer opens the FAKE queue → `GET /detections?verdict=FAKE`. 3. The officer opens one record → `GET /detections/{request_id}` (PII shown in full for this role). 4. The officer writes an investigation note → `POST /detections/{request_id}/notes`. 5. The note is attached to the case file. |
| **Alternative Flow** | A1. The officer cross-references the audit trail via `GET /audit-logs` and exports findings. |
| **Exception Flow** | E1. A `viewer`/`developer` opens the same detection → PII is **masked** and the notes endpoint is forbidden (403). E2. Invalid `request_id` → 404. |

*Takeaway:* the eight specifications bind every use case to a concrete endpoint, a role check and an explicit error path — the contract the rest of the chapter implements.

### 2.2.3 System architecture

The system architecture is organised into five labelled blocks, each carrying a clear responsibility. This decomposition achieves separation of concerns: each block can be replaced or upgraded without breaking the rest, satisfying the maintainability and portability attributes (NFR4, NFR6).

![Figure 2.2 — Overall SFDCT-serving architecture](figures/fig_2_2_architecture.png)
*Figure 2.2: Overall architecture of the detection pipeline — Pre-processing (face detect/align/crop 256×256) → SFDCT (spatial EfficientNet-B4 branch + frequency block-DCT branch, fused by zero-initialised gated cross-attention) → Post-processing & thresholding (sigmoid → prob_fake → compare with τ) → Grad-CAM explanation. This figure shows the inference core (block C) that the platform blocks A, B, D and E wrap.*

**A. Frontend (Next.js, :3000).** The dashboard and Playground. Renders the upload UI, the risk score / band / decision hint, the Grad-CAM overlay and the 2D-DCT spectrum, the history/timeline, and the management screens. It calls the backend exclusively through `src/lib/api.ts` and never contacts the microservice or the database directly. State is managed with TanStack Query (server cache) plus a small Zustand store; the client-side role guard is a UX convenience, not the security boundary.

**B. Backend API (FastAPI, :8000).** The single source of business logic. It enforces the two authentication layers (JWT for dashboard, API key for `/v1/*`), checks tenant quota and per-key rate limit, performs the **mandatory MTCNN face crop**, resolves all data through the `deepguard_db` repository against PostgreSQL (:5432), forwards the cropped face to the AI microservice over `httpx`, maps `prob_fake` into a risk band (Section 2.3), persists tenant-scoped detection records, and returns one JSON payload.

**C. AI Inference microservice (SFDCT, :8501).** A separate `uvicorn serving.infer_server:app` process exposing `/health` and `/predict`. Given a cropped face tensor it runs the EfficientNet-B4 + block-DCT forward pass on CUDA, loads `ckpt_best.pth` (model_version `naive-sfdct-cdfv2-0.7572`), and returns `{prob_fake, label, gradcam_b64}` (plus the 2D-DCT spectrum). It is treated as a **black box** behind the `/predict` contract, so the model tier is fully replaceable; it never touches PostgreSQL and never serves a filesystem path (Grad-CAM is returned inline as base64).

**D. Monitoring.** Health probes (`/health` on both B and C), structured logging to **CloudWatch Logs**, and latency/error metrics. This block realises FR14–FR15 and NFR7, giving operators visibility into traffic and failures.

**E. Alerting (Google Chat).** A webhook integration that raises alerts to a Google Chat space when monitoring detects an anomaly (microservice unreachable, error-rate spike, quota exhaustion). This realises FR16 and closes the operability loop: a degraded model tier (E4 in UC-01's exception flow) becomes a notification rather than a silent failure.

*Table 2.15: The five architecture blocks and their responsibilities.*

| Block | Component | Input → Output | Role |
|-------|-----------|----------------|------|
| **A. Frontend** | Next.js dashboard + Playground (:3000) | User action → API calls | UI & upload; render result |
| **B. Backend API** | FastAPI + deepguard_db (:8000) | Request → JSON verdict | Auth, quota, MTCNN crop, band mapping, persistence |
| **C. AI Inference** | SFDCT microservice (:8501) | Cropped tensor → `{prob_fake, label, gradcam_b64}` | Spatial+frequency inference + Grad-CAM |
| **D. Monitoring** | CloudWatch Logs + health probes | Logs/metrics → dashboards | Observability |
| **E. Alerting** | Google Chat webhook | Anomaly → message | On-call notification |

The five blocks map directly back to the requirements: A realises FR10–FR12; B realises FR1, FR3, FR6 and the auth/quota controls; C realises FR2, FR4, FR5 (and FR7–FR9 once the measured liveness model is wired behind the same contract); D realises FR14–FR15; E realises FR16. This one-to-one mapping between requirements and blocks demonstrates "minimal yet sufficient design" — no block is redundant, and no requirement is left out.

*Takeaway:* five blocks, one-directional flow, a replaceable model behind a single `/predict` contract, and a closed observe-and-alert loop.

### 2.2.4 Activity diagrams

Whereas the use-case diagram and the architecture describe *what* the system does and *how its blocks are wired*, an activity diagram describes the *order in which work is carried out* — the control flow, the decision branches, and the points at which the flow may terminate early. For DeepGuard this is essential, because a single business action (for example, "analyse one image") triggers a chain that crosses three runtime tiers — the Next.js frontend, the FastAPI backend, and the SFDCT microservice — and because the eKYC pipeline composes two detectors (liveness then deepfake) in a cascade whose ordering carries strong security implications. This section presents the two most representative activities; their inter-tier message ordering is refined into sequence diagrams in Section 2.2.5.

**(a) Deepfake image detection.** The first activity covers the dashboard *Playground* path, in which an authenticated tenant user (a `developer` or `admin`, per the route matrix in Section 2.2.2) uploads a single image and receives a risk verdict together with explanations. The activity is interesting because of its two early-exit branches — when no face is detected and when the tenant's monthly quota is exhausted — and because of the band-mapping decision (`FAKE` / `REAL` / `UNCERTAIN`) governed by the `prob_fake` threshold ± 0.10 convention defined in the API specification.

```mermaid
flowchart TD
    A([Start]) --> B[User selects image in Playground]
    B --> C[Frontend POST /playground/detect/image<br/>Authorization: Bearer JWT]
    C --> D{JWT valid &<br/>role in developer/admin?}
    D -- No --> E[Return 401/403] --> Z([End])
    D -- Yes --> F{Tenant quota<br/>available?}
    F -- No --> G[Return 402 Payment Required] --> Z
    F -- Yes --> H[MTCNN face detection on upload]
    H --> I{Face found?}
    I -- No --> J[Return error: no face detected] --> Z
    I -- Yes --> K[Crop & normalise to 256x256]
    K --> L[httpx POST SFDCT :8501 /predict]
    L --> M[SFDCT: EfficientNet-B4 + block-DCT<br/>forward pass -> prob_fake]
    M --> N[SFDCT: Grad-CAM + 2D-DCT spectrum]
    N --> O{Map prob_fake to band}
    O -- ">= tau + 0.10" --> P[verdict = FAKE]
    O -- "<= tau - 0.10" --> Q[verdict = REAL]
    O -- "within tau +/- 0.10" --> R[verdict = UNCERTAIN]
    P --> S[Increment tenant usage counter]
    Q --> S
    R --> S
    S --> T[Render risk_score + band + decision_hint<br/>+ Grad-CAM overlay + frequency spectrum]
    T --> Z
```

*Figure 2.3: Activity diagram — deepfake image detection through the dashboard Playground (`POST /playground/detect/image`, JWT-authenticated). Two guard branches (RBAC and quota) and the mandatory MTCNN face-crop precede the SFDCT forward pass; the resulting `prob_fake` is mapped to a `FAKE`/`REAL`/`UNCERTAIN` band before the risk score, Grad-CAM heatmap, and 2D-DCT spectrum are returned.*

The diagram makes explicit two architectural invariants from `CONVENTIONS.md`: face cropping with **MTCNN is mandatory before any inference** (the flow can never reach the SFDCT call without a valid crop), and the SFDCT microservice is treated as a **black box reached only via `httpx POST /predict`**. Note also that the Playground path *counts* the tenant's quota but deliberately does **not** persist a row in the `detections` table — a known design decision documented in the role flows — which is why no "write detection record" node appears after the band mapping.

**(b) eKYC cascade — liveness then deepfake.** The second activity models the integration path used by an external customer backend through the API-key-authenticated `/v1/` endpoints. Here the order is security-critical: a presentation attack (a printed photo or a replayed screen) must be rejected by **passive liveness** *before* any deepfake analysis is performed, so that compute is never spent on a frame that is not even a live capture. The cascade therefore short-circuits on a `SPOOF` verdict and only proceeds to `/v1/detect/image` when liveness returns `LIVE`. This cascade is the integration-level reason the liveness module (Section 2.4) exists: it is a cheap pre-filter that compensates for the deepfake model's low recall at the eKYC operating point (Section 2.3).

```mermaid
flowchart TD
    A([Start: customer backend has a face frame]) --> B[POST /v1/detect/liveness<br/>Authorization: Bearer sk-dg-...]
    B --> C{API key valid &<br/>tenant active?}
    C -- No --> D[Return 401/403] --> Z([End])
    C -- Yes --> E{Quota available?}
    E -- No --> F[Return 402] --> Z
    E -- Yes --> G[Passive liveness scoring]
    G --> H{Liveness band}
    H -- "score <= 0.42" --> I[verdict = SPOOF<br/>spoof_type: print/screen/mask_3d] --> Z
    H -- "within tau +/- 0.08" --> J[verdict = UNCERTAIN -> request retry] --> Z
    H -- "score >= 0.58" --> K[verdict = LIVE]
    K --> L[POST /v1/detect/image<br/>same API key]
    L --> M[MTCNN crop -> SFDCT /predict -> prob_fake]
    M --> N{Deepfake band}
    N -- "FAKE" --> O[Reject eKYC: deepfake suspected] --> Z
    N -- "UNCERTAIN" --> P[Escalate to manual review] --> Z
    N -- "REAL" --> Q[Approve eKYC: live & genuine face] --> Z
```

*Figure 2.4: Activity diagram — eKYC cascade combining passive liveness (`POST /v1/detect/liveness`) and deepfake detection (`POST /v1/detect/image`) over API-key authentication. The cascade rejects presentation attacks early (`SPOOF`/`UNCERTAIN`) and only forwards a `LIVE` capture to the SFDCT deepfake stage; the final eKYC outcome combines both verdicts.*

This ordering reflects the threat model directly: liveness defends against print/screen/3-D-mask attacks (the `spoof_type` enum), while the deepfake stage defends against synthetic faces that may nonetheless pass a liveness check. The two stages share the same API key and both consume tenant quota, so the cascade is also the natural place where the per-key `rate_limit_rpm` (60 req/min by default) and the `monthly_quota` are exercised twice per verification attempt.

*Takeaway:* the deepfake activity guards by RBAC, quota and a mandatory crop; the cascade activity guards by ordering — liveness first, deepfake second.

### 2.2.5 Sequence diagrams

A sequence diagram complements the activity diagrams by fixing the *temporal ordering of messages between participants* — which component calls which, in which direction, and what each returns. The participants are drawn from the four-tier architecture of `TECH_STACK.md`: the **Next.js frontend (:3000)**, the **FastAPI backend (:8000)**, the **PostgreSQL database (:5432)**, and the **SFDCT microservice (:8501)**.

**(a) Deepfake detection (frontend → backend → SFDCT).** This sequence refines activity (a) into concrete inter-tier messages. It is the canonical request path of the whole product and the only place where the backend talks to the model: the FastAPI layer performs the **MTCNN crop**, forwards the normalised crop to the SFDCT microservice via `httpx`, receives `prob_fake` together with the base64 Grad-CAM, maps the score into a band, and returns a single JSON payload to the browser.

```mermaid
sequenceDiagram
    actor U as User (developer/admin)
    participant FE as Frontend (Next.js :3000)
    participant BE as Backend (FastAPI :8000)
    participant ML as SFDCT (:8501)
    U->>FE: Upload image, click "Analyse"
    FE->>BE: POST /playground/detect/image (Bearer JWT, multipart)
    BE->>BE: require_role(developer/admin) + quota check
    BE->>BE: MTCNN face detect + crop 256x256
    BE->>ML: httpx POST /predict (cropped tensor)
    ML->>ML: EfficientNet-B4 + block-DCT forward
    ML->>ML: compute Grad-CAM + 2D-DCT spectrum
    ML-->>BE: { prob_fake, label, gradcam_b64, spectrum_b64 }
    BE->>BE: map prob_fake -> FAKE/REAL/UNCERTAIN band
    BE-->>FE: 200 { risk_score, band, decision_hint, gradcam_b64, spectrum_b64 }
    FE-->>U: Render risk score, heatmap overlay, frequency spectrum
```

*Figure 2.5: Sequence diagram — single-image deepfake detection. The FastAPI backend performs the mandatory MTCNN crop, calls the black-box SFDCT microservice (`POST /predict`) over `httpx`, and assembles the risk score, decision hint, Grad-CAM, and 2D-DCT spectrum into one JSON response. Grad-CAM is returned inline as base64, never as a file path.*

The sequence highlights the one-directional, no-shortcut request flow mandated by the conventions: the frontend never contacts SFDCT directly, and SFDCT never touches PostgreSQL. The model tier is therefore fully replaceable behind the `/predict` contract `{prob_fake, label, gradcam_b64}`, and the inline-base64 Grad-CAM rule means no temporary files or filesystem paths are ever exposed.

**(b) Liveness detection (cascade sequence over `/v1`).** The second sequence fixes the message ordering of the eKYC cascade (activity (b)). The customer backend first calls passive liveness; only a `LIVE` verdict forwards the same frame to the deepfake stage; the backend persists both tenant-scoped records and returns the combined outcome. This is the sequence view of why liveness is composed *in front of* deepfake.

```mermaid
sequenceDiagram
    participant C as Customer backend
    participant API as FastAPI :8000
    participant DB as PostgreSQL :5432
    participant SF as SFDCT :8501
    C->>API: POST /v1/detect/liveness (Bearer sk-dg-…, image)
    API->>API: Validate API key, check quota & rate limit
    API->>SF: httpx POST /predict (liveness head, MTCNN crop)
    SF-->>API: { score, verdict, spoof_type }
    alt score <= 0.42 (SPOOF) or in ±0.08 band
        API->>DB: persist liveness check (tenant-scoped)
        API-->>C: 200 { verdict: SPOOF/UNCERTAIN, spoof_type }
    else score >= 0.58 (LIVE)
        API->>DB: persist liveness check (LIVE)
        C->>API: POST /v1/detect/image (same key, same frame)
        API->>SF: httpx POST /predict (deepfake head, MTCNN crop)
        SF-->>API: { prob_fake, label, gradcam_b64 }
        API->>API: map prob_fake -> FAKE/REAL/UNCERTAIN band
        API->>DB: persist detection (tenant-scoped)
        API-->>C: 200 { eKYC outcome, risk_band, gradcam_b64 }
    end
```

*Figure 2.6: Sequence diagram — liveness-then-deepfake eKYC cascade over API-key authentication. Passive liveness is evaluated first; a `SPOOF`/`UNCERTAIN` verdict short-circuits the cascade, while a `LIVE` verdict forwards the frame to the SFDCT deepfake stage. Both checks consume quota and are persisted tenant-scoped. (Liveness scoring is the measured module of Section 2.4; see §3.1.8.)*

The diagram surfaces two properties of the design. First, **tenant scoping is implicit**: because the API key carries `tenant_id`, the backend never trusts a client-supplied tenant identifier, preventing cross-tenant data access. Second, the cascade is **fail-closed for spoofs**: a presentation attack never reaches — and never spends compute on — the deepfake model.

*Takeaway:* the two sequences fix the temporal contract — one inference round trip for deepfake, and a fail-closed two-stage round trip for the full eKYC cascade.

### 2.2.6 API specifications

This section specifies the public-facing and dashboard endpoints that constitute the DeepGuard service contract. The DeepGuard backend is a FastAPI application exposing thirty-five endpoints in total; the specification below details the core eKYC workflow — **deepfake-detection API** and **liveness-detection API** — together with the authentication/provisioning operations that precede them. Every request travels the one-directional flow defined in the architecture (Next.js frontend or external client → FastAPI :8000 → service → repository → PostgreSQL :5432), and detection requests additionally fan out over `httpx` to the SFDCT microservice (EfficientNet-B4 + block-DCT + Grad-CAM) at port 8501. All payloads are JSON; errors follow the FastAPI default envelope `{"detail": "<message>"}` with an appropriate HTTP status code.

**Authentication schemes.** DeepGuard enforces two non-interchangeable authentication layers, plus a small set of public endpoints.

*Table 2.16: The three authentication schemes of DeepGuard.*

| Scheme | Header | Token form | Consumers | Tenant scoping |
|--------|--------|------------|-----------|----------------|
| Public | — | — | Auth register/login, accept-invite, `/health` | None |
| JWT Bearer | `Authorization: Bearer <jwt>` | Signed JWT (HS256, python-jose) | Dashboard / admin users | `current_user.tenant_id` |
| API-Key Bearer | `Authorization: Bearer sk-dg-…` | Opaque key `sk-dg-…` | External eKYC integrators | `api_key.tenant_id` |

The JWT layer governs the dashboard (`/auth`, `/users`, `/tenant(s)`, `/detections`, `/analytics`, `/audit-logs`, `/playground/*`) and is further constrained by RBAC over five roles. The API-key layer governs the integration surface (`/v1/detect/*`, `/v1/liveness/*`, `/v1/results/*`, `/v1/jobs/*`) that a customer's backend invokes during live authentication. The two layers are never mixed on a single endpoint.

**Common conventions.** Deepfake verdicts are derived from the SFDCT score `prob_fake` and the calibrated decision threshold τ: `FAKE` when `prob_fake ≥ τ + 0.10`, `REAL` when `prob_fake ≤ τ − 0.10`, and `UNCERTAIN` within τ ± 0.10. Liveness verdicts follow the analogous rule against the liveness score (`LIVE` ≥ 0.58, `SPOOF` ≤ 0.42, `UNCERTAIN` in τ ± 0.08). Each `POST /v1/detect/*` call consumes one unit of the tenant's `monthly_quota`; exceeding the quota yields HTTP 402, while exceeding the per-key `rate_limit_rpm` (default 60 requests/min) yields HTTP 429 with a `Retry-After` header.

*Table 2.17: Index of the core endpoints specified below.*

| # | Method | Path | Auth | Purpose |
|---|--------|------|------|---------|
| 1 | POST | `/v1/detect/image` | API-Key | Detect deepfake on a single image |
| 2 | POST | `/v1/detect/video` | API-Key | Detect deepfake on a video (sampled frames, async) |
| 3 | GET | `/v1/results/{request_id}` | API-Key | Retrieve a previously computed detection result |
| 4 | GET | `/v1/jobs/{job_id}` | API-Key | Poll the status of an asynchronous video job |
| 5 | POST | `/v1/detect/liveness` | API-Key | Passive liveness check on a single image |
| 6 | POST | `/auth/login` | Public | Authenticate a user, return a JWT |
| 7 | POST | `/auth/register` | Public | Create a new tenant + admin (SUSPENDED, pending) |
| 8 | POST | `/auth/accept-invite` | Public | Activate an invited account from a token |
| 9 | POST | `/api-keys` | JWT (developer/admin) | Mint a new API key (plain value shown once) |
| 10 | POST | `/tenants` | JWT (sysadmin) | Provision a new tenant (ACTIVE) + admin |

#### A. Deepfake-detection API

*Table 2.18: Endpoint specification — POST /v1/detect/image.*

| Field | Specification |
|-------|---------------|
| Method | `POST` |
| Path | `/v1/detect/image` |
| Auth | API-Key (`Authorization: Bearer sk-dg-…`) — tenant-scoped via `api_key.tenant_id` |
| Request — body | `multipart/form-data` with field `file` = a single face image (JPEG/PNG). Optional `callback_url` for a webhook on completion. |
| Response 200 | JSON with `request_id`, `risk_score` ∈ [0,1], `risk_band`, `verdict` ∈ {`FAKE`,`REAL`,`UNCERTAIN`}, and `gradcam_b64` (base64 PNG overlay). |
| Error codes | `400` malformed/empty image; `401` missing/invalid API key; `402` monthly quota exhausted; `429` per-key rate limit exceeded (with `Retry-After`); `5xx` SFDCT microservice unavailable. |

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

*Table 2.19: Endpoint specification — POST /v1/detect/video.*

| Field | Specification |
|-------|---------------|
| Method | `POST` |
| Path | `/v1/detect/video` |
| Auth | API-Key |
| Request — body | `multipart/form-data` with `file` = a video. The server samples frames, crops faces with MTCNN, and aggregates per-frame scores asynchronously. |
| Response 200 | JSON acknowledging the async job: `job_id`, `status` = `queued`, `result_url` to poll. The verdict is retrieved via `GET /v1/jobs/{job_id}` and `GET /v1/results/{request_id}`. |
| Error codes | `400` unsupported/corrupt video; `401` invalid API key; `402` quota exhausted; `429` rate limit. |

Example 200 response:

```json
{
  "job_id": "job_01HZXA1F7N5R2QW9",
  "request_id": "det_01HZXA1F7N5R2QW9",
  "status": "queued",
  "result_url": "/v1/jobs/job_01HZXA1F7N5R2QW9"
}
```

*Table 2.20: Endpoint specification — GET /v1/results/{request_id} and GET /v1/jobs/{job_id}.*

| Field | `/v1/results/{request_id}` | `/v1/jobs/{job_id}` |
|-------|----------------------------|---------------------|
| Method | `GET` | `GET` |
| Auth | API-Key | API-Key |
| Path param | `request_id` from a prior `/v1/detect/*` | `job_id` from `POST /v1/detect/video` |
| Response 200 | Full detection record (`risk_score`, `risk_band`, `verdict`, `gradcam_b64`, timestamps), tenant-scoped | Job status (`queued`/`processing`/`done`/`failed`), `progress` ∈ [0,1], and on `done` the aggregated `verdict` + `request_id` |
| Error codes | `401`; `403` belongs to another tenant; `404` unknown id | `401`; `403`; `404` unknown id |

Example completed-job response:

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

#### B. Liveness-detection API

*Table 2.21: Endpoint specification — POST /v1/detect/liveness.*

| Field | Specification |
|-------|---------------|
| Method | `POST` |
| Path | `/v1/detect/liveness` |
| Auth | API-Key (`Authorization: Bearer sk-dg-…`) |
| Request — body | `multipart/form-data` with `file` = a single face image for passive (no-challenge) liveness scoring. |
| Response 200 | JSON with `check_id`, `score` ∈ [0,1], `verdict` ∈ {`LIVE`,`SPOOF`,`UNCERTAIN`}, and, when a spoof is detected, `spoof_type` ∈ {`print`,`screen`,`mask_3d`,`deepfake`,`unknown`}. |
| Error codes | `400` no face / malformed image; `401` invalid API key; `402` quota exhausted; `429` rate limit. |

Example 200 response (spoof detected):

```json
{
  "check_id": "liv_01HZXB4G2P8T6KM3",
  "score": 0.31,
  "verdict": "SPOOF",
  "spoof_type": "screen"
}
```

> The liveness model behind this endpoint is the module of Section 2.4, **trained and measured** on the official LCC-FASD split (§3.1.8: B4 head — ACER 6.85% / AUC 0.9829). The contract (score, verdict band, spoof-type enum) is fixed here so the API surface is stable; wiring the trained weights behind this endpoint, replacing the interim heuristic scorer, is an integration item noted in Future Work.

#### C. Authentication & provisioning (supporting)

The remaining endpoints (`/auth/login`, `/auth/register`, `/auth/accept-invite`, `/api-keys`, `/tenants`) gate access to the two detection APIs. `POST /auth/login` validates credentials against PostgreSQL and rejects a SUSPENDED tenant with 403; `POST /auth/register` creates a tenant in the SUSPENDED state (status `pending`) until a sysadmin activates it; `POST /auth/accept-invite` consumes an invitation token and auto-logs-in with the pre-assigned role; `POST /api-keys` (developer/admin) mints an `sk-dg-…` key whose plain value is shown exactly once; and `POST /tenants` (sysadmin only) provisions an ACTIVE tenant with a one-time temporary admin password. These follow the same envelope conventions; their full request/response tables are unchanged from the implemented system.

*Takeaway:* two detection APIs (deepfake and liveness) share one envelope, one auth model and one band convention; the liveness contract is fixed and its model is measured (§3.1.8), with the final endpoint wiring tracked as an integration item.

---

## 2.3 Method — Deepfake Detection (SFDCT)

This is the deep, measured contribution of the thesis. The name **SFDCT** stands for **S**patial–**F**requency learning with block-wise **DCT**. The core idea originates from an empirical observation already established in Chapter 1: the artefacts of GAN/upsampling (checkerboard grids, frequency-spectrum anomalies) are very hard to see in the pixel domain but appear clearly in the DCT frequency domain. A spatial backbone such as EfficientNet-B4 learns semantic features (eyes, nose, skin texture) very well but is partially "blind" to subtle frequency anomalies. SFDCT adds a dedicated *frequency branch* and fuses it into the backbone in a *safe* manner, so that in the worst case the model is never worse than B4.

> **Credit.** SFDCT is built on the **DeepfakeBench** training/evaluation framework [4], uses **EfficientNet** [1] as its backbone, and *adapts* ideas from five frequency-based deepfake papers — **SPSL** [6], **SRM** [7], **FreqDebias** [12], **FcaNet** [5], **FDFL** [11] — transferring them into the block-DCT domain. SFDCT does not claim state of the art: as Chapter 3 reports, SPSL (CDFv2 AUC 0.7650) still beats naive SFDCT (0.7572).

### 2.3.1 Data Solutions

The quality of the frequency features depends directly on the quality of pre-processing: a misaligned or improperly compressed face crop can create spurious frequency artefacts that mislead the model. The data pipeline is therefore rigorously standardised following DeepfakeBench to ensure fairness and reproducibility.

#### Data sources, train/val/test split & label alignment

Following the DeepfakeBench protocol, the model is **trained on FaceForensics++ (FF++), the c23 compressed version** (≈ **159,626** sampled frames), and **tested cross-dataset on Celeb-DF-v2 (CDFv2)** (**16,420** test frames: **5,620 real + 10,800 fake**). Clearly separating the training set and the test set into two different distributions is precisely the core of measuring generalisation. Each frame inherits its REAL/FAKE label from the video-level annotation of the source dataset (label alignment), so every sampled frame of a forged video is labelled FAKE and every frame of a genuine video is labelled REAL.

*Table 2.22: Data sources and their role in the evaluation protocol.*

| Dataset | Scale | Role | Split |
|---------|-------|------|-------|
| FF++ c23 | 1000 real videos + 4 forgery methods (Deepfakes, Face2Face, FaceSwap, NeuralTextures); ≈ 159,626 sampled frames | Train | Standard DeepfakeBench video split (720 / 140 / 140 per group) |
| Celeb-DF-v2 | 590 real + 5,639 high-quality deepfake videos; 16,420 test frames (5,620 real + 10,800 fake) | Cross-dataset test (no training) | Entirely used for testing |
| DFDC | not used in this thesis | Additional cross-dataset (future) | Future direction |
| Vietnamese deepfake set | test-only pilot — collection in progress | eKYC-realistic cross-test | In progress, test-only |

The logic of the split: FF++ provides a diversity of *manipulation types* so the model learns generalisable forgery traces; CDFv2, with its high-quality celebrity deepfakes, plays the role of a genuine "examination" — if the model has merely memorised the artefacts specific to FF++, it fails on CDFv2. Frame-level AUC on CDFv2 is therefore a faithful measure of generalisation ability.

#### Preprocessing & feature extraction

Each frame is passed through a face detector (MTCNN at serving time, dlib/landmark detection in the training pipeline) to locate the bounding box and landmarks, after which it is **aligned** to a canonical pose and **cropped to 256×256**. When the face lies close to the border, **padding** preserves the frame ratio without distorting geometry. The final image is normalised with `mean = std = 0.5` (mapping pixels to ≈ [−1, 1]).

*Table 2.23: Face pre-processing steps.*

| Step | Operation | Input | Output |
|------|-----------|-------|--------|
| 1 | Face + landmark detection | Raw frame | Bounding box + landmarks |
| 2 | Alignment | Box + landmarks | Pose-rectified face |
| 3 | Crop + padding | Aligned face | 256×256 image preserving the ratio |
| 4 | Normalisation | 256×256 image | Tensor (mean=std=0.5) |

The reason for strict alignment is that the block-DCT branch (Section 2.3.4) divides the image into fixed 8×8 blocks; if the face is not aligned consistently, the same anatomical region (e.g. the cheek) falls into different blocks across images, corrupting the per-band frequency statistics. Good alignment keeps the frequency features stable and comparable across samples.

#### Sequence construction (frame sampling + face crop)

Each video is sampled at **32 frames** (`frame_num = 32`) evenly distributed along the temporal axis; each sampled frame is then face-cropped as above. A frame-level model does not need every frame, only a representative set large enough to cover the variation in pose, expression and lighting within the video. The number 32 balances information coverage against computation/storage cost, and is held constant across all configurations to allow a fair comparison.

#### Augmentation

Augmentation is applied only in the training flow, to increase diversity and reduce overfitting. Beyond standard geometric/photometric augmentations (from the training config: horizontal flip p = 0.5, rotation ±10° p = 0.5, Gaussian blur with kernel 3–7 p = 0.5, brightness/contrast jitter ±0.1, and simulated JPEG compression with quality 40–100), the distinctive contribution is **DCTFoMixup** (activated when lever S3 is enabled): it mixes the DCT frequency bands of two samples and performs an inverse-DCT to create a new sample, forcing the model to learn more invariant frequency features (detailed in Section 2.3.5). Augmentations that strongly affect the spectrum must be designed carefully so as not to inadvertently erase the very forgery traces the model needs.

#### Storage optimization

To keep training I/O efficient, sampled crops are stored at the fixed 256×256 resolution with their pre-computed labels, so the expensive detection/alignment step runs once rather than every epoch. Frame indices and labels are cached per video, following the DeepfakeBench data-manager convention, so re-runs are deterministic under the fixed seed (NFR3, NFR4).

*Takeaway:* the data pipeline standardises FF++→CDFv2 cross-dataset evaluation, aligns faces tightly so 8×8 block statistics stay comparable, and confines augmentation (including DCTFoMixup) to training.

### 2.3.2 Evaluation method and loss function

#### The metrics

For a comprehensive evaluation, this work uses several metrics but emphasises one *headline* metric.

*Table 2.24: Evaluation metrics.*

| Metric | Short definition | Role |
|--------|------------------|------|
| **Frame-level AUC** | Area under the ROC curve at the frame level | **Headline** — measures cross-dataset generalisation |
| AP | Average Precision (area under the PR curve) | Supplementary, sensitive to class imbalance |
| EER | Equal Error Rate (FPR = FNR) | Related to the operating threshold |
| Accuracy / F1 | Threshold-dependent correctness | Reference at the operating point |

**Frame-level AUC is the primary metric** because it is *threshold-invariant* (it measures the quality of REAL/FAKE ranking independently of the cut-off) and is the comparison standard of the DeepfakeBench leaderboard, allowing a fair comparison with other methods. The evaluation procedure strictly follows DeepfakeBench: **train on FF++ c23, test on CDFv2** the model has never seen.

#### The loss function

The loss aggregates components depending on the enabled configuration:

$$
\mathcal{L} = \mathcal{L}_{\text{CE}} \;+\; \lambda_{\text{aug}}\,\mathcal{L}_{\text{cls\_aug}} \;+\; \lambda_{\text{cons}}\,\mathcal{L}_{\text{cons}} \;+\; \lambda_{\text{sc}}\,\mathcal{L}_{\text{sc}}
$$

*Table 2.25: Components of the loss function.*

| Component | Formula/meaning | Enabled when |
|-----------|-----------------|--------------|
| $\mathcal{L}_{\text{CE}}$ | REAL/FAKE classification cross-entropy on the original sample | Always on |
| $\mathcal{L}_{\text{cls\_aug}}$ | Cross-entropy on the DCTFoMixup hybrid sample | S3 on |
| $\mathcal{L}_{\text{cons}}$ | symmetric-KL (probabilities) + MSE (embedding) — see §2.3.5 | S3 on |
| $\mathcal{L}_{\text{sc}}$ | Single-center loss — see §2.3.5 | S5 on |

When all levers are off (naive SFDCT), the loss reduces to exactly the standard cross-entropy — affirming the principle of "safe by default, enable more when needed". The composite weights are λ_cons = **1.0**, λ_sc = **0.3**, margin m = **0.3**, with λ_aug = 1.0.

#### Optimiser & hyperparameters

The training configuration is identical across all ablation configurations to ensure a fair comparison — any AUC difference comes solely from the architecture/levers, not from hyperparameter tuning.

*Table 2.26: Training hyperparameters.*

| Hyperparameter | Value |
|----------------|-------|
| Optimizer | Adam |
| Learning rate | 2 × 10⁻⁴ |
| Weight decay | 5 × 10⁻⁴ |
| Batch size | 32 |
| Frames per video (`frame_num`) | 32 |
| Image size | 256 × 256 |
| Normalisation | mean = std = 0.5 |
| Number of epochs | 10 |
| LR scheduler | None (fixed LR) |
| Seed | 1024 (single seed — not yet multi-seed) |
| Base loss | Cross-entropy (no label smoothing) |

No LR scheduler and no early stopping are used; each of the 10 epochs is evaluated on the test set and the **checkpoint with the best test-AUC** is retained (`save_epoch = 1`), then used for cross-dataset evaluation on CDFv2.

*Takeaway:* AUC is the threshold-invariant headline; the loss is plain cross-entropy by default and grows only as levers turn on; one fixed, single-seed recipe trains every configuration.

### 2.3.3 EfficientNet-B4 architecture (spatial branch)

The spatial branch is **EfficientNet-B4 pretrained on ImageNet**, the carrier of most of the classification capability. As discussed in Chapter 1, EfficientNet uses *compound scaling* to grow depth, width and resolution together, and its core unit is the **MBConv** (mobile inverted bottleneck with squeeze-and-excitation). B4 is the chosen operating point because it offers strong accuracy at a parameter/compute budget that fits a single mid-range GPU — large enough to learn rich semantic and textural face features, small enough to serve at acceptable latency. Transfer learning from ImageNet gives the branch a strong texture prior before it is fine-tuned on FF++.

In SFDCT the B4 branch consumes the 256×256 normalised crop and produces a spatial feature map $x$ that, after the fusion step, feeds the REAL/FAKE classifier. On its own — with the frequency gate closed — this branch *is* the B4 baseline (CDFv2 AUC **0.7497**), which is exactly the floor the fusion design protects.

*Takeaway:* B4 is the proven spatial backbone; with the frequency gate closed, SFDCT is exactly B4 and inherits its 0.7497 baseline.

### 2.3.4 SFDCT architecture

#### Two-branch overview

SFDCT comprises two parallel branches sharing the same 256×256 input:

- **Spatial branch:** EfficientNet-B4 (Section 2.3.3), extracting semantic and textural features.
- **Frequency branch:** transforms the image into the frequency domain via a block-wise 8×8 2D-DCT, extracts spectral features over 16 zigzag frequency bands, and produces a supplementary representation focused on frequency-domain forgery traces.

The two branches meet at the **zero-initialised gated cross-attention** module, where the frequency features are injected into the spatial features through a gate `alpha` initialised to 0. The intuition: rather than forcing a single network to learn both semantics and the spectrum (which easily causes gradient conflict), each branch specialises and they fuse under control. The frequency branch is a "consulting expert" — the backbone still makes the main decision but can consult frequency evidence when needed. (The architecture is depicted in Figure 2.2.)

#### The 8×8 block-DCT frequency branch

This is the heart of the representational contribution: turn a face image into a compact, stable, forgery-informative set of frequency features. Four steps go from the colour image to a per-band statistical vector.

**Step 1 — Convert to YCbCr.** The RGB image is converted to YCbCr, separating luminance (Y) from chrominance (Cb, Cr). JPEG compression and most forgery artefacts manifest differently on luminance and chrominance; separating the channels lets the branch see anomalies that RGB blends together.

**Step 2 — Block-wise 8×8 2D-DCT.** The image is divided into non-overlapping 8×8 blocks. On each block $B$, the 2D-DCT coefficient at position $(u,v)$ is:

$$
F(u,v) = \frac{1}{4}\,C(u)\,C(v)\sum_{x=0}^{7}\sum_{y=0}^{7} B(x,y)\,\cos\!\Big[\frac{(2x+1)u\pi}{16}\Big]\cos\!\Big[\frac{(2y+1)v\pi}{16}\Big]
$$

where $C(0)=1/\sqrt{2}$ and $C(k)=1$ for $k>0$. The 8×8 block is not arbitrary: it is exactly the JPEG block size, so compression/forgery artefacts tend to "phase-align" with the block grid, becoming more prominent in the DCT coefficients.

**Step 3 — Log-magnitude.** We take $D(u,v) = \log\big(1 + |F(u,v)|\big)$. The log compresses the enormous dynamic range of the DCT spectrum (the DC coefficient is typically thousands of times larger than high-frequency coefficients), so high-frequency traces — small but forgery-rich — are not overwhelmed.

**Step 4 — Aggregate into 16 zigzag bands & band statistics.** The 64 coefficients of each 8×8 block are traversed in **zigzag** order (DC at top-left → high-frequency at bottom-right) and grouped into **16 zigzag frequency bands**, low to high. For each band $b$:

$$
\mu_b = \frac{1}{|\mathcal{B}_b|}\sum_{(u,v)\in \mathcal{B}_b} D(u,v), \qquad
\sigma_b = \sqrt{\frac{1}{|\mathcal{B}_b|}\sum_{(u,v)\in \mathcal{B}_b}\big(D(u,v)-\mu_b\big)^2}
$$

where $\mathcal{B}_b$ is the set of coefficient positions in band $b$ (aggregated over all blocks and channels). The result is a compact frequency vector describing the per-band "spectral signature".

**Optional drop of low bands.** The DC term and the lowest bands can be *removed* before fusion. The low bands carry mainly *content* (overall shape, brightness) rather than forgery traces; keeping them risks *content leakage* (the model learns the *person/scene* instead of the *forgery*), which harms cross-dataset generalisation. Dropping them forces the branch to focus on the mid-to-high range where GAN/upsampling artefacts reside.

*Table 2.27: The block-DCT frequency branch (step → input → output → role).*

| Step | Operation | Input | Output | Role |
|------|-----------|-------|--------|------|
| 1 | RGB → YCbCr | 256×256 face crop | Y, Cb, Cr | Separate luminance/chrominance |
| 2 | 8×8 block-DCT | Each channel in 8×8 blocks | $F(u,v)$ per block | Move to JPEG-aligned frequency domain |
| 3 | Log-magnitude | $\|F(u,v)\|$ | $D(u,v)=\log(1+\|F\|)$ | Compress range, emphasise high freq |
| 4 | Zigzag → 16 bands + stats | $D(u,v)$ over the image | $(\mu_b,\sigma_b)_{b=1..16}$ | Compact, stable spectral signature |
| (opt) | Drop low bands | Full band vector | DC + low bands removed | Counter content leakage |

#### Zero-initialised gated cross-attention fusion

The central fusion problem: *how do we combine frequency features into the backbone without risking making the model worse?* A brute-force fusion (direct add/concat) of an under-trained frequency branch could inject noise into the backbone, dragging AUC below even B4. The solution is a **zero-initialised gate**.

Let $x$ be the B4 spatial feature and $\text{context}(\text{DCT})$ the frequency representation after cross-attention. The fused feature is:

$$
\text{feature\_fused} = x + \alpha \cdot \text{context}(\text{DCT}), \qquad \alpha \text{ learnable, initialised } \alpha = 0
$$

At initialisation $\alpha = 0$ gives $\text{feature\_fused}|_{\alpha=0} = x$ — that is, **SFDCT starts exactly equal to EfficientNet-B4**. The model begins at the baseline and *decides for itself* whether to open the frequency gate. If the frequency branch is useful, the gradient pushes $\alpha$ away from 0; if not, $\alpha$ stays near 0 and the model remains safely at B4.

*Table 2.28: Meaning of the gate $\alpha$ by value.*

| Value of $\alpha$ | Model state | Interpretation |
|-------------------|-------------|----------------|
| $\alpha = 0$ (init) | Equivalent to B4 | Safe "floor" — never worse than the baseline |
| $\alpha \to$ small positive | Frequency lightly supplementary | Backbone dominant, frequency fine-tunes |
| $\alpha$ larger | Frequency contributes strongly | Frequency traces genuinely important |

This is the **"floor ≥ B4" guarantee** — the most important risk-safety property of the design. The learned $\alpha$ is visualised in Chapter 3 (Fig 3.13, `gate_alpha.png`), showing how much the model actually relies on the frequency branch. The zero-init gate is inspired by zero-initialised residual-gating techniques in modern architectures, notably ReZero [31].

> **Distinction from SFCL-HCMF.** SFCL-HCMF initialises its fusion gate at **0.5** (it *starts* fusing) and adds a global-differential / SIDA branch. SFDCT, by contrast, initialises the gate at **α = 0** (it starts as plain B4) and has **no global-differential / SIDA branch** — only the 8×8 block-DCT branch plus the zero-init gated cross-attention. The α = 0 choice is exactly what makes the floor guarantee hold.

#### The five levers and four ablations (design space)

The block-DCT branch + gated fusion ("naive SFDCT", a.k.a. **B4-DCT**) already yields a modest improvement over B4 (CDFv2 AUC 0.7497 → 0.7572, **+0.0075** — *within noise*, as Chapter 3 states). To push further, this work assembles and *adapts* five improvement levers — each from a frequency-based deepfake paper — and transfers them into the block-DCT domain. The philosophy: rather than inventing from scratch, stand on proven methods but unify them in a single block-DCT framework.

- **S1 — `dct_use_sign` (adapted from SPSL).** The log-magnitude step discards the coefficient *sign*, yet the sign carries phase information sensitive to upsampling artefacts. S1 stores signed statistics, $D_{\pm}(u,v)=\text{sign}(F(u,v))\cdot\log(1+|F(u,v)|)$, a phase-analog signal. Cost: **0 added learnable parameters**.
- **S2 — `dct_srm_residual` (adapted from SRM).** Forgery traces hide in the high-frequency noise component. S2 runs an SRM high-pass filter first, $R = \text{SRM}_{\text{high-pass}}(I)$, then computes block-DCT on the residual $R$, yielding a content-clean spectrum. Cost: **0 added learnable parameters** (the SRM kernels are fixed).
- **S3 — `use_dct_fomixup` + dual consistency loss (adapted from FreqDebias).** DCTFoMixup mixes the DCT bands of two samples and inverse-DCTs to create a hybrid; a dual consistency loss forces original/hybrid agreement: $\mathcal{L}_{\text{cons}} = \tfrac{1}{2}[\text{KL}(p\|q)+\text{KL}(q\|p)] + \lambda_{\text{emb}}\|z-z'\|_2^2$. S3 is the only lever in *both* Row1 and Row2 because it debiases generically.
- **S4 — `dct_fca_attention` (adapted from FcaNet).** Channel attention with global average pooling keeps only the DC component; FcaNet uses multiple DCT frequencies as attention weights. S4 inserts a MultiSpectralAttentionLayer, $\text{att}=\text{sigmoid}(\text{MLP}(\text{DCT-pool}_{\text{multi-freq}}(X)))$, $X'=\text{att}\odot X$. Cost: **adds learnable parameters** (the attention MLP).
- **S5 — `use_single_center_loss` (adapted from FDFL).** Real faces form a tight cluster while fakes are diverse. The single-center loss compresses real toward a centre $c$ and pushes fakes out by a margin $m\sqrt{D}$. Cost: **adds learnable parameters** (the centre $c$).

The five levers combine into four configurations that tell an incremental story. Row1 and Row2 are deliberately designed to *separate* the two lever types: **Row1** uses only the levers that **add no learnable parameters** (S1+S2+S3 — input features and loss only), while **Row2** uses the levers that **add learnable parameters** (S4+S5+S3). This answers a scientific question: *does the improvement come from better information or from greater model capacity?*

*Table 2.29: Four ablation configurations and lever states.*

| Configuration | Description | S1 | S2 | S3 | S4 | S5 | Added params | CDFv2 AUC |
|---------------|-------------|:--:|:--:|:--:|:--:|:--:|:------------:|:---------:|
| **B4** | EfficientNet-B4 spatial-only | – | – | – | – | – | No | 0.7497 |
| **naive SFDCT** (B4-DCT) | B4 + block-DCT + gated fusion (levers off) | ✗ | ✗ | ✗ | ✗ | ✗ | No (besides fusion) | 0.7572 |
| **Row1** | naive + S1 + S2 + S3 | ✓ | ✓ | ✓ | ✗ | ✗ | **No** | 0.7333 |
| **Row2** | naive + S3 + S4 + S5 | ✗ | ✗ | ✓ | ✓ | ✓ | **Yes** | not trained (future work) |

Two honesty notes belong here. First, naive SFDCT's +0.0075 over B4 is **within statistical noise** for a single seed; multi-seed runs would be needed to confirm it. Second, **Row1 = 0.7333 is *below* the B4 baseline (Δ −0.0164)** — an honest negative result: stacking the parameter-free levers (sign + SRM residual + FoMixup) did not help and in fact hurt cross-dataset AUC in this single run, a finding we report rather than hide. Row2 was not trained within the thesis GPU budget and is left as future work; two single-axis variants trained under the identical recipe (Fix1, Fix2 — Chapter 3) provide a partial decomposition in its place.

*Takeaway:* SFDCT = B4 + 8×8 block-DCT + α=0 gated cross-attention, with a floor-≥-B4 guarantee; the five adapted levers form a design space whose two rows isolate "better information" from "more capacity", and the results so far are modest-and-honest (naive +0.0075 within noise; Row1 below baseline).

### 2.3.5 Risk-Score / Decision Inference

#### Introduction

While the SFDCT model outputs a per-frame fake probability `prob_fake`, an eKYC provider needs a higher-level, *operational* signal — a calibrated risk score, a coarse risk band, and a decision hint — together with a single concrete decision threshold τ that satisfies a stated false-positive budget. This subsection describes how the raw probability is turned into that operational signal. The mechanism is implemented in `risk.py` (`to_risk_score` / `risk_band` / `decision_hint` / `thresholds_dict`).

#### Motivation and Principle

In eKYC, the model should return a **risk signal, not a hard label** — the eKYC provider, who knows its own fraud appetite and regulatory posture, makes the final call. Two principles follow. First, the probability should be *calibrated* so that a "0.9 risk" really means high risk; we use **temperature scaling** [19] (identity when the fitted temperature $T=1$). Second, the score should be summarised into **bands** (low / medium / high) that map to plain-language **hints** (pass / review / reject), because operators act on bands, not on three-decimal probabilities. The band thresholds are per-tenant (defaulting to a global setting) so each customer can tune them to its own FPR budget.

#### Inference Mechanism

The mechanism has four steps, going from the raw probability to a decision hint.

**Step 1 — Calibrate to a risk score (temperature scaling).** Given `prob_fake` and a fitted temperature $T$:

$$
\text{risk\_score} =
\begin{cases}
\text{clip}_{[0,1]}(\text{prob\_fake}), & T = 1 \\[4pt]
\sigma\!\Big(\dfrac{1}{T}\,\log\dfrac{p}{1-p}\Big), & T \neq 1
\end{cases}
\qquad p = \text{clip}(\text{prob\_fake},\, 10^{-6},\, 1-10^{-6})
$$

With $T=1$ the score is just the clipped probability; a fitted $T$ (loaded from the calibration step) sharpens or softens the score so it is more trustworthy.

**Step 2 — Map the score to a band.** Using per-tenant thresholds (defaults `RISK_BAND_LOW = 0.30`, `RISK_BAND_HIGH = 0.70`):

$$
\text{band} =
\begin{cases}
\text{low}, & \text{score} < 0.30 \\
\text{medium}, & 0.30 \le \text{score} < 0.70 \\
\text{high}, & \text{score} \ge 0.70
\end{cases}
$$

**Step 3 — Derive a decision hint.** The band maps to a hint that the provider may follow or override: `low → pass`, `medium → review`, `high → reject`. This is a *suggestion*, never the final eKYC decision.

**Step 4 — Calibrate the eKYC threshold τ at FPR ≤ 5%.** AUC is threshold-invariant, but operation needs a *concrete* cut-off. We **adopt FPR ≤ 5% per ISO/IEC 30107-3 (BPCER20)** to satisfy the **qualitative** biometric-verification requirement of Circular 17/2024/TT-NHNN — TT17 mandates biometric verification but does **not** prescribe any numeric threshold; the 5% figure is **our** engineering choice, not a regulatory mandate. The threshold τ is calibrated so the measured FPR is ≤ 5%, then fixed and applied to the test set to report the corresponding TPR.

*Table 2.30: Calibrated eKYC operating point of naive SFDCT on CDFv2.*

| Quantity | Value |
|----------|-------|
| Threshold τ (best naive-SFDCT model) | **0.9514** |
| FPR on test (CDFv2) at τ | **0.0500** |
| TPR / recall (fake detection) at τ | **0.2298** (22.98%) |
| Accuracy / F1 at τ | **0.476 / 0.366** |
| Confusion at τ | TN **5,339** · FP **281** · FN **8,318** · TP **2,482** |

#### Example

Suppose a customer selfie scores `prob_fake = 0.087`. With $T=1$, risk_score = 0.087 → band = **low** (since 0.087 < 0.30) → hint = **pass**. Now suppose a frame scores `prob_fake = 0.913`: risk_score = 0.913 → band = **high** → hint = **reject**. At the formal eKYC cut-off τ = 0.9514, however, even a 0.913 frame falls *below* τ and would not be flagged FAKE by the strict eKYC rule — which is exactly why the band/hint signal (operator-facing) and the τ rule (compliance-facing) coexist: bands give graded guidance, τ gives a single auditable line tied to the FPR budget.

#### Summary

The risk-score / decision-inference layer turns a raw frame probability into an operationally meaningful, calibrated, banded signal plus a single FPR-anchored threshold. It is honest about its limits: at τ ensuring FPR ≤ 5%, naive SFDCT recovers only **22.98%** of deepfakes (FN dominate: 8,318 / 10,800 ≈ 77% slip through). This is precisely why deepfake detection is composed *behind* a liveness pre-filter (Section 2.4) and complemented by video-level aggregation (video-AUC **0.808**): at a customer-friendly operating point, the single-frame model is a screening layer, not a stand-alone gate.

> Honesty note: τ here is set on the CDFv2 scores directly because a separate validation split has not yet been carved out; in real deployment, τ must be calibrated on the dev set of the deployment distribution (Vietnamese faces — see Future Work).

*Takeaway:* the system returns a calibrated risk band and hint plus an FPR-≤-5% threshold τ = 0.9514; at that operating point recall is only 22.98%, so the model is a screening signal that the cascade and video aggregation must reinforce.

### 2.3.6 The block-DCT-HFF architectural variant (R1/R3)

Beyond the lever design space, the thesis trains one *architectural* alternative that adapts the high-frequency-features idea of Luo et al. [7] into the block-DCT domain — referred to as **block-DCT-HFF**. Where the SFDCT frequency branch summarises per-band *statistics*, HFF keeps the frequency information *as an image*: the 8×8 block-DCT coefficients of each block are computed, the low-frequency bands are zeroed, and an inverse DCT reconstructs a **high-pass residual image** in which content is suppressed and high-frequency traces (blending boundaries, upsampling grids) dominate. This residual image is processed by a **multi-scale convolutional stream** (parallel kernels capture artefacts at several spatial scales), whose output drives a **residual-guided spatial attention** map over the B4 feature map — telling the spatial backbone *where* the high-frequency evidence is — before merging through the same **zero-initialised gate** as SFDCT (preserving the floor-≥-B4 property). Two variants are trained: **R1** (minimal — single-scale stream, no attention) and **R3** (full — multi-scale stream + residual-guided attention). Chapter 3 reports R3 as the strongest measured member of the whole family (best CDFv2 frame-AUC **0.7695**, video-AUC **0.8269**), while noting honestly that its paired bootstrap confidence interval against B4 still contains zero.

*Takeaway:* block-DCT-HFF keeps the frequency evidence as a high-pass residual image and uses it to steer spatial attention — the same zero-init-gate safety, a different way of consuming the spectrum — and yields the family's best (but still not statistically separated) cross-dataset score.

### 2.3.7 Statistical tools: AUC, bootstrap confidence intervals, and threshold selection

Because the thesis's conclusions rest on *small differences between models*, the statistical machinery is stated explicitly.

**AUC as a ranking probability (Mann–Whitney form).** With $N_f$ fake scores $s_i$ and $N_r$ real scores $t_j$, the empirical AUC [21] is

$$
\mathrm{AUC} = \frac{1}{N_f N_r}\sum_{i=1}^{N_f}\sum_{j=1}^{N_r}\Big[\mathbb{1}(s_i > t_j) + \tfrac{1}{2}\,\mathbb{1}(s_i = t_j)\Big],
$$

i.e. the probability that a randomly chosen fake is ranked above a randomly chosen real. This form is what the evaluation scripts compute directly (pure NumPy, no library dependence), and it makes explicit why AUC is threshold-free.

**Video-level bootstrap confidence intervals.** A single AUC number carries no uncertainty. The thesis attaches a 95% confidence interval (CI) by the **bootstrap** [20] at the *video* level — resampling videos, not frames, because frames of one video are strongly correlated: from the 518 test videos, draw 518 video IDs *with replacement*, recompute the video-level AUC on the resample, repeat $B = 2{,}000$ times (fixed seed 42), and take the 2.5th/97.5th percentiles as the CI. For **paired comparisons** (model A vs B4), the *same* resampled index set is applied to both models in each replicate and the difference $\Delta\mathrm{AUC}$ is recorded; if the resulting CI of $\Delta$ contains zero, the two models are not statistically separated at this seed — the criterion used throughout Chapter 3.

**Threshold selection as constrained optimisation.** The eKYC operating point is the solution of

$$
\tau^{*} = \arg\max_{\tau}\; \mathrm{TPR}(\tau) \quad \text{subject to} \quad \mathrm{FPR}(\tau) \le 0.05,
$$

computed on the empirical score distribution (choose the smallest threshold whose measured FPR does not exceed 5%, then read off the TPR). This formalises Step 4 of Section 2.3.5 and is reproducible from the saved score arrays.

**Temperature scaling.** The calibration of Step 1 (Section 2.3.5) fits a single scalar $T$ by minimising the negative log-likelihood on a calibration split [19]; $T = 1$ leaves the probability unchanged, $T > 1$ softens over-confident scores.

*Takeaway:* every comparative claim in Chapter 3 is backed by an explicit statistic — Mann–Whitney AUC, video-level paired bootstrap CIs (n = 2,000, seed 42), and a constrained-optimisation threshold — all reproducible from the released score arrays.

---

## 2.4 Method — Liveness Detection (secondary, measured)

> **Status.** Liveness is a **secondary** module, designed by *reusing* the SFDCT components and **trained and measured** on the official LCC-FASD split [28]. The measured results (§3.1.8) are: **B4 head — ACER 6.85% / AUC 0.9829**; **B4+DCT head — ACER 7.54% / AUC 0.9776** (the frequency branch adds nothing on this dataset, an honest negative mirroring the deepfake finding). The metrics are APCER/BPCER/ACER (ISO/IEC 30107-3) [13], with spoof/attack as the positive class.

### 2.4.1 Data Solutions

#### Data collection

Following the cheap-and-reusable strategy, two RGB still-image datasets are used:

- **LCC-FASD** (~18,000 images; 1,942 real / 16,885 fake; print + replay attacks) — the **primary** local training/evaluation set; downloads directly from Kaggle, no licence agreement, RGB crops that match the SFDCT input pipeline, runnable on a single RTX 3060.
- **NUAA Imposter** (~12,614 grayscale images; print attack) — a **smoke-test / sanity** set to confirm the pipeline generalises beyond LCC-FASD.

(Optionally, CelebA-Spoof crop (HF, 4.95 GB) could serve as a larger training source with LCC-FASD as cross-test; this is noted as a possible extension.) Heavier or licence-locked sets (OULU-NPU, SiW, CASIA-SURF/WMCA, multi-modal RGB+Depth+IR) are deliberately avoided; where a community number is needed, the published result is cited rather than reproduced.

#### Preprocessing, augmentation & parameter reasons

The liveness pipeline reuses the SFDCT preprocessing exactly: face detect/align/crop to 256×256, normalise mean=std=0.5. This identical pipeline is the whole point of reuse — the same crops feed either the deepfake head or the liveness head. Augmentation mirrors the deepfake pipeline (flip, mild photometric jitter, JPEG simulation); strong spectral augmentation is used cautiously because the physical cue we rely on (moiré/recapture peaks in the DCT) can be blurred by aggressive JPEG. The 8×8 block size and 16-band zigzag aggregation are kept unchanged so the frequency branch is *literally* the same module as in deepfake detection.

*Table 2.31: Liveness datasets and roles.*

| Dataset | Scale | Attack types | Role | Licence |
|---------|-------|-------------|------|---------|
| LCC-FASD | ~18,000 (1,942 real / 16,885 fake) | print, replay | Primary train + eval | Direct Kaggle download |
| NUAA Imposter | ~12,614 (grayscale) | print | Smoke-test / cross-check | Kaggle mirror |

*Takeaway:* liveness reuses the exact SFDCT crop pipeline on two licence-free RGB sets, so the only thing that changes between deepfake and liveness is the head and the labels.

### 2.4.2 Architecture — reuse SFDCT (B4 vs B4+DCT) + cascade pre-filter

The liveness module is intentionally a **minimal delta** on SFDCT, giving a clean baseline-vs-proposal pair on the same backbone:

- **Baseline = B4-liveness.** EfficientNet-B4 spatial-only with a two-layer live/spoof head, fine-tuned from ImageNet (or from the deepfake checkpoint). This is the most common deep-FAS baseline.
- **Proposal = B4+DCT-liveness.** The *same* 8×8 block-DCT branch + zero-init gated cross-attention from SFDCT, with the binary head. The physical justification is identical in spirit to deepfake detection: replay (screen) and print attacks leave **moiré/recapture peaks in the frequency domain** that are weak in the pixel domain — so the block-DCT branch has a principled reason to help liveness too. (Honest caveat: moiré is strongest for *replay*; print artefacts are halftone/printing noise, so the frequency branch may help replay more than print.)

This pair lets us answer, for liveness, the same question as for deepfake: does the frequency branch generalise across spoof types and datasets (LCC-FASD → NUAA)? Architecturally, prior art closest to this is dual-stream spatial+frequency FAS (e.g. bandpass dual-stream, EfficientNet+Fourier); SFDCT's distinction is block-wise 8×8 DCT + gated cross-attention + a backbone **shared** between deepfake and liveness — a "first" claim would require a novelty check and is *not* made here.

**Cascade pre-filter (liveness → deepfake).** Operationally the liveness head runs **first** in the eKYC cascade (Figures 2.4, 2.6): a `SPOOF`/`UNCERTAIN` verdict short-circuits before any deepfake compute. This is not only a security ordering but a *compensation* design: because the deepfake model has low recall at the FPR-≤-5% point (Section 2.3.5), a cheap liveness pre-filter removes a whole class of presentation attacks before the expensive, low-recall stage runs.

*Takeaway:* liveness is SFDCT with a binary head — B4 vs B4+DCT on the shared backbone — placed first in the cascade so it pre-filters spoofs the deepfake stage would likely miss.

### 2.4.3 Evaluation method and loss function

#### Loss

The liveness head is trained with **binary cross-entropy** over {live, spoof}, the natural analog of the deepfake CE loss. No extra term is required for the baseline; the B4+DCT proposal reuses the same gated fusion (α = 0 floor), so it starts equal to B4-liveness and can only add value.

#### Metrics (ISO/IEC 30107-3)

With **spoof/attack as the positive class**, the standard PAD metrics are:

$$
\text{APCER} = \frac{\text{FP}}{\text{TN}+\text{FP}}, \qquad
\text{BPCER} = \frac{\text{FN}}{\text{TP}+\text{FN}}, \qquad
\text{ACER} = \tfrac{1}{2}\big(\text{APCER}+\text{BPCER}\big)
$$

APCER (attack presentations accepted as bona fide — the dangerous error) is reported as the worst case across attack instruments; BPCER (genuine users rejected); ACER is their mean at a single threshold. For cross-dataset evaluation, **HTER** (≡ ACER when positive = spoof) is reported. AUC (threshold-independent) is the headline, mirroring the deepfake reporting. Crucially, the operating threshold is **chosen at EER on a dev set and fixed**, never tuned on test, exactly as in the deepfake protocol; for eKYC we additionally report **BPCER @ APCER ≤ 5%** to tie the liveness operating point to the same 5% FPR budget (ISO/IEC 30107-3) adopted for deepfake.

*Table 2.32: Liveness evaluation plan and measured results (details in §3.1.8).*

| Metric | Definition | Pre-registered target | Measured (B4 head) | Measured (B4+DCT) |
|--------|------------|----------------------|--------------------|-------------------|
| AUC | Area under ROC (threshold-independent) | ≈ 0.92 | **0.9829** | 0.9776 |
| ACER | ½(APCER + BPCER) at threshold@EER on dev | ≈ 16% | **6.85%** | 7.54% |
| APCER / BPCER | Reported separately | — | **2.86% / 10.83%** | 4.25% / 10.83% |
| HTER | Cross-dataset (LCC-FASD → another PAD set) | — | not measured (future work) | not measured |

The pre-registered targets **ACER ≈ 16% / AUC ≈ 0.92** were recorded *before* training so the plan had a concrete success criterion; the measured results clear both with margin. The threshold protocol (EER fixed on the official development split, never tuned on the evaluation split) and the independent verification of these numbers are detailed in §3.1.8.

*Takeaway:* liveness is evaluated with binary CE + APCER/BPCER/ACER, threshold fixed at EER on dev; measured — B4 ACER 6.85% / AUC 0.9829, B4+DCT 7.54% / 0.9776: the spatial head already solves LCC-FASD well and the frequency branch adds nothing, an honest negative consistent with the deepfake task.

---

## 2.5 Conclusion

Chapter 2 has traversed the full path from *requirements* to *design* to the *two detection methods*. The requirement analysis defined four functional families — deepfake detection, liveness detection, UI & upload, and monitoring & alert (FR1–FR16) — and seven non-functional attributes (performance, scalability, availability & reliability, maintainability, usability, portability, monitoring & logging), placing **cross-dataset performance (NFR1)** at the top to reflect the adversarial nature of eKYC. The system design then formalised six actors and eight use cases, a five-block labelled architecture (A. Frontend · B. Backend API · C. AI Inference microservice · D. Monitoring · E. Alerting via Google Chat), the deepfake and eKYC-cascade activity diagrams, their sequence diagrams, and the deepfake-and-liveness API contract — all bound to concrete endpoints, roles and error paths.

The central, parallel contribution is the **two methods**. The **deepfake method (SFDCT)** is the deep, measured one: a two-branch architecture combining the spatial EfficientNet-B4 backbone (baseline AUC **0.7497**) with an 8×8 block-DCT frequency branch (16 zigzag bands, optional low-band drop against content leakage), fused via **zero-initialised gated cross-attention** (α = 0, the floor-≥-B4 guarantee, distinct from SFCL-HCMF's 0.5 gate and with **no** SIDA branch). On that base, five adapted levers — S1 (SPSL), S2 (SRM), S3 (FreqDebias), S4 (FcaNet), S5 (FDFL) — form a design space whose Row1/Row2 split isolates "better information" from "more capacity". The results are reported honestly: naive SFDCT reaches **0.7572** (Δ **+0.0075**, *within noise*), Row1 reaches **0.7333** (Δ **−0.0164**, *below baseline — a negative result*), Row2 was not trained within the GPU budget (future work), the block-DCT-HFF variant (§2.3.6) reaches **0.7695** as the family's best, and **SPSL (0.7650) still beats naive SFDCT (0.7572)** — no SOTA is claimed. The risk-score / decision-inference layer turns probabilities into calibrated bands, hints, and an FPR-≤-5% threshold **τ = 0.9514** (TPR **0.2298**, our ISO/IEC 30107-3 choice satisfying TT17's *qualitative* requirement), and is honest that recall is only 22.98% at that point. The **liveness method** mirrors SFDCT with a binary head (B4 vs B4+DCT), placed first in the cascade as a pre-filter, and is **measured** on the official LCC-FASD split: B4 — **ACER 6.85% / AUC 0.9829**; B4+DCT — 7.54% / 0.9776 (Δ within noise) — an honest negative on the frequency branch, consistent with the deepfake finding.

Chapter 3 will present the implementation and evaluation in detail — the experimental environment, data distributions, training curves, the cross-dataset comparison table, ROC/PR/confusion/t-SNE/Grad-CAM/gate-α visualisations, the 16-configuration evaluation, the deployed system, and the measured liveness results — to validate each design argument set out here.
