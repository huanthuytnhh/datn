# CHAPTER 3: SYSTEM ANALYSIS AND DESIGN

## 3.1 Use Case Diagram

DeepGuard is delivered as a multi-tenant web platform rather than a single detection script, so the analysis begins with who is allowed to invoke each capability. Authentication is split into two layers that are never mixed: a login-token layer that gates the dashboard, and an API-key layer that gates external eKYC integration. The platform groups its behaviour into five functional blocks: deepfake detection on images and videos, liveness checking, the upload and history interface, tenant and member administration, and monitoring with alert integration. The figure below shows how these blocks map onto the deployed components (the web frontend, the FastAPI backend, the model serving service, and the supporting datastore and monitoring channels), so the use cases below can be read against the parts that realise them.

![Figure 3.2](figures/fig_2_2_architecture.png)

*Figure 3.2: System and component architecture of the DeepGuard platform.*

Six actors interact with the platform, from an unauthenticated visitor up to the cross-tenant operator. The table below names each actor and the scope of what it may do, and the following figure places the actors against the use cases they reach.

![Figure 3.1](figures/fig_2_1_usecase.png)

*Figure 3.1: Overview use case diagram.*

*Table 3.1: Actors in the system.*

| Actor | Description |
|---|---|
| Anonymous | An unauthenticated visitor. Browses public pages, registers a new organisation, or accepts a team invitation. |
| Viewer | A read-only member of a tenant. Views detection history and analytics, with personal data masked. |
| Developer | A tenant member responsible for integration. Runs the dashboard playground and manages API keys. |
| Compliance | A tenant member responsible for review. Views the flagged queue with full data and attaches audit notes. |
| Admin | The administrator of a single tenant. Manages members, roles, keys, and settings within their own organisation. |
| Sysadmin | The platform operator across all tenants. Creates and activates tenants and edits model versions and thresholds. |

## 3.2 Use Case Specifications

### 3.2.1 Detect Deepfake on an Image

The first detection capability, UC-01, takes one face image and returns a fake probability, a verdict, and a heat map. The following table gives its full specification.

*Table 3.2: Use case specification for detect deepfake on an image.*

| Use Case Name | Detect deepfake on an image |
|---|---|
| Use Case ID | UC-01 |
| Actor | Developer, Admin (dashboard); external eKYC client (API) |
| Description | The system analyses a single face image and returns a fake probability, a verdict, and a heat map explaining the decision. |
| Trigger | The user uploads an image and presses analyse, or the client posts an image to the detection endpoint. |
| Pre-condition | A valid login token or API key, an active tenant, and remaining quota. |
| Post-condition | A detection result is produced and returned, and can be retrieved later by its identifier. |
| Basic Flow | The actor submits the image. The system authenticates and checks quota. The face is detected and cropped. The crop is sent to the model service. The service returns the probability and heat map. The system maps the probability to a verdict and returns it. |
| Alternative Flow | A score near the threshold is returned as uncertain. A playground request counts quota but is not stored. |
| Exception Flow | No face detected returns an error. An invalid token is rejected. An exhausted quota is refused. An unreachable model service returns an error. |

### 3.2.2 Detect Deepfake on a Video

UC-02 extends the image case to video by sampling frames and aggregating their per-frame scores, with long videos handled as an asynchronous job. The following table gives its specification.

*Table 3.3: Use case specification for detect deepfake on a video.*

| Use Case Name | Detect deepfake on a video |
|---|---|
| Use Case ID | UC-02 |
| Actor | Developer, Admin (dashboard); external eKYC client (API) |
| Description | The system samples frames from a video, runs detection on each, and aggregates an overall verdict. Long videos run as an asynchronous job. |
| Trigger | The user uploads a video, or the client posts a video to the detection endpoint. |
| Pre-condition | A valid login token or API key, an active tenant, and remaining quota. |
| Post-condition | An aggregated verdict and a per-frame view are returned. A long video returns a job identifier to poll. |
| Basic Flow | The actor submits the video. The system authenticates and checks quota. Representative frames are sampled and cropped. Each frame is sent to the model service. The per-frame scores are aggregated into one verdict. |
| Alternative Flow | A large video returns a job identifier. The client polls until the job completes and then fetches the result. |
| Exception Flow | No face in any frame returns an error. An invalid token is rejected. An exhausted quota is refused. A failed job is reported on the job status. |

### 3.2.3 Liveness Check

UC-03 decides whether the subject is a live person rather than a printed photo or a screen replay, and names the attack type on a spoof. It is the use case that the eKYC cascade runs first. The following table gives its specification.

*Table 3.4: Use case specification for liveness check.*

| Use Case Name | Liveness check |
|---|---|
| Use Case ID | UC-03 |
| Actor | Developer (dashboard); external eKYC client (API) |
| Description | The system decides whether the subject is a live person rather than a printed photo or a screen replay, and identifies the attack type on a spoof. |
| Trigger | The client submits an image for a passive check, or requests a challenge and submits the captured frames for an active check. |
| Pre-condition | A valid API key (or login token for the playground), and for the active mode a previously issued challenge. |
| Post-condition | A live, spoof, or uncertain verdict is returned, with the attack type when the verdict is spoof. |
| Basic Flow | The client submits the image. The system runs the liveness model. The verdict and, if a spoof, the attack type are returned. |
| Alternative Flow | The active mode first requests a challenge and captures the required frames. A score near the threshold is returned as uncertain, prompting a retry. |
| Exception Flow | No face or a poor-quality frame returns an error. An invalid key is rejected. An expired challenge is refused. |

### 3.2.4 Supporting Use Cases

The remaining use cases govern onboarding, integration management, and review. They follow the same template as the detection cases and are summarised in the following table.

*Table 3.5: Summary of the supporting use cases.*

| Use case | Actor | Description |
|---|---|---|
| Register organisation | Anonymous | Register a new organisation, created in a suspended state until the operator activates it. |
| Approve tenant | Sysadmin | Review and activate a registered organisation, or create one directly. |
| Manage API keys | Developer, Admin | Create, inspect, and revoke the API keys used by the external integration. A new key is shown once. |
| Manage team | Admin | Invite members, assign roles, and reset passwords within the administrator's own organisation. |
| Review and add note | Compliance | Review the flagged queue with full data and attach an investigation note for traceability. |

### 3.2.5 API Specifications

The three detection capabilities are exposed as authenticated HTTP endpoints with a fixed contract, so the model behind each can be replaced without changing callers. The three tables below give the image, video, and liveness contracts respectively. The detection endpoints are reached over an API key and consume one unit of the tenant's monthly quota per call. The supporting authentication endpoints, for login, registration, accepting an invitation, creating an API key, and provisioning a tenant, gate access to the two detection APIs and follow the same response conventions.

*Table 3.6: API specification for detecting a deepfake on an image.*

| Description | This API takes a face image and returns a fake probability, a verdict, and a heat map. |
|---|---|
| Endpoint | /v1/detect/image |
| HTTP Method | POST |
| Payload | multipart/form-data with a single face image |
| Response | { "request_id": "det_…", "risk_score": 0.087, "risk_band": "low", "verdict": "real", "gradcam_b64": "…" } |

*Table 3.7: API specification for detecting a deepfake on a video.*

| Description | This API takes a video, samples frames, and returns an asynchronous job to poll for the aggregated verdict. |
|---|---|
| Endpoint | /v1/detect/video |
| HTTP Method | POST |
| Payload | multipart/form-data with a video file |
| Response | { "job_id": "job_…", "status": "queued", "result_url": "/v1/jobs/job_…" } |

*Table 3.8: API specification for the liveness check.*

| Description | This API takes a face image and returns a liveness score, a verdict, and the attack type when a spoof is detected. |
|---|---|
| Endpoint | /v1/detect/liveness |
| HTTP Method | POST |
| Payload | multipart/form-data with a single face image |
| Response | { "check_id": "liv_…", "score": 0.31, "verdict": "spoof", "spoof_type": "screen" } |

## 3.3 Sequence Diagrams

Two flows carry most of the platform's behaviour, and each is described here as an activity diagram (the control flow with its early-exit branches) paired with a sequence diagram (the messages exchanged between the browser, backend, and model service).

The first flow is single-image deepfake detection from the dashboard. The dashboard path authenticates the user, checks quota, crops the face, runs the model, and maps the probability to a verdict. It stops early if no face is found or the quota is used up. The activity diagram below traces that control flow, and the sequence diagram that follows shows the matching exchange in which the backend performs the face crop, calls the model service, maps the score into a band, and returns one response to the browser.

![Figure 3.3](figures/fig_2_3_activity_image_detection.png)

*Figure 3.3: Activity diagram for deepfake image detection.*

![Figure 3.5](figures/fig_2_5_sequence_image_detection.png)

*Figure 3.5: Deepfake detection sequence diagram.*

The second flow is the eKYC cascade used by external integrations. The integration path runs the liveness check first and only forwards a live capture to the deepfake stage, so a presentation attack is rejected before any deepfake analysis. The activity diagram below traces that control flow, and the sequence diagram that follows shows the matching exchange in which the customer backend calls the liveness check first. Only a live verdict forwards the same frame to the deepfake stage, and both records are stored per tenant.

![Figure 3.4](figures/fig_2_4_activity_ekyc.png)

*Figure 3.4: Activity diagram for the eKYC cascade.*

![Figure 3.6](figures/fig_2_6_sequence_ekyc.png)

*Figure 3.6: eKYC cascade sequence diagram.*

## 3.4 Database Design

The platform stores its data in a PostgreSQL database organised around multi-tenancy. Every tenant owns its own users, API keys, and detection records, and the tenant identifier carried on each table keeps one tenant's data isolated from another's. The core entities cover the three management functions, namely tenants, their users (with invitations), and their API keys, together with the two kinds of record the system produces, the deepfake detections and the liveness checks, plus an audit log of who did what. The entity-relationship diagram below shows these entities and the foreign keys that link them.

![Figure 3.7: Entity-relationship diagram of the DeepGuard backend](figures/fig_erd_backend_v2.png)

_Figure 3.7: Entity-relationship diagram of the DeepGuard backend. The tenant is the root of the multi-tenant schema. Users, API keys, and invitations belong to a tenant, while detections, liveness checks, and asynchronous video jobs each reference both their tenant and the API key that produced them. The audit log links back to the tenant and the acting user._

## 3.5 Conclusion

This chapter turned the method into a system design. Six actors and a small set of use cases describe what each kind of user can do, from running a detection to managing a tenant. The activity and sequence diagrams trace the two main flows, the single-image check and the eKYC cascade in which the liveness gate runs before the deepfake stage. The database design captures the multi-tenant schema that keeps each customer's data separate. The next chapter reports how the system was built, trained, and measured.
