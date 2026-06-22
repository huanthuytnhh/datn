# Figure & Table Plan — Thesis v2 (DeepGuard / SFDCT)

## 1. Purpose + locked decisions

This document is the single design contract for every figure and table in thesis v2. It maps each reference-density slot (~49 figures, ~30 tables) onto either an existing real asset in `report/figures/`, a result figure/table from `report/102220041_LeNgocThanh_Thesis_FULL.md` (FULL.md), a NEW illustrative diagram/logo/tree we author, or the real backend database schema. It also lists the exact files to create.

**Locked decisions:**

- Target the reference density (~49 figures, ~30 tables) but every RESULT figure/table comes ONLY from FULL.md real data. No new experiments, no fabricated numbers or curves.
- Allowed figure/table sources: (a) the 64 real assets already in `report/figures/` (author's own work, just unused in the official PDF); (b) NEW illustrative/conceptual figures (diagrams, logos, directory trees, operation/metric illustrations) — safe, not fabrication; (c) result figures/tables from FULL.md.
- The reference's "feature correlation / feature list / feature filtering" slots assume a classical-ML feature-engineering downstream. This thesis is END-TO-END CNN with NO such pipeline. Those slots are REINTERPRETED to the REAL frequency-feature design: 48-dim = 16 zigzag bands x 3 YCbCr channels; drop-low-band = filtering; per-band energy real-vs-fake = analysis. NO SVM/RF/XGBoost pipeline is invented.
- Database Design (Ch3) is written for REAL, from the real backend schema + the existing ERD asset `fig_erd_backend.png`. Not a TODO placeholder.
- Liveness = secondary/downstream task.

**Status legend:** READY = existing asset on disk · CREATE = new illustrative (spec below) · NEEDS-DATA = verify-before-place / DB columns from live schema · NEEDS-APP = screenshot from running frontend.

---

## 2. Figure Plan

> CORRECTION (re-bucketed to the locked 4-chapter structure; the map agent returned the old 3-chapter layout). Contribution figures (zigzag-16-band chain, gated fusion) moved from Ch1 → Ch2; results moved → Ch4; system-design isolated in Ch3.

### Chapter 1 — Theoretical Background (general theory only)

| Figure no. | Slot | Source | Status | Asset / Spec |
|---|---|---|---|---|
| Figure 1.1 | Input-data illustration (real vs fake face) | existing-asset | READY | `fig_explain_ffpp_real.png` |
| Figure 1.2 | Problem illustration (image → P(fake) → verdict) | new | CREATE | `fig_1_problem_io.png` |
| Figure 1.3 | Basic operation: 8×8 block-wise DCT | existing-asset | READY | `fig_explain_blocks.png` |
| Figure 1.4 | EfficientNet-B4 backbone / compound scaling | existing-asset | READY | `fig_detail_b4.png` |
| Figure 1.5 | MBConv block + SE | existing-asset | READY | `fig_1_2_mbconv.png` |
| Figure 1.6 | Forgery trace: spatial vs frequency footprint | existing-asset | READY | `fig_ycbcr_dct_spectrum.png` |
| Figure 1.7 | ROC/AUC concept | new | CREATE | `fig_1_roc_concept.png` |
| Figure 1.8 | Confusion-matrix / error-types concept | new | CREATE | `fig_1_confusion_concept.png` |
| Figure 1.9 | REST/HTTP API architecture | new | CREATE | `fig_1_rest_api.png` |
| Figure 1.10 | Technology-stack logos | new | CREATE | `fig_1_tech_stack_logos.png` |
| Figure 1.11 | AWS deployment services | new | CREATE | `fig_1_aws_services.png` |

*Moved to Ch2 (contributions): zigzag-16-band detailed `fig_1_3_zigzag_detailed.png`; gated cross-attention fusion `fig_1_4_gate_fusion.png`.*

### Chapter 2 — Analysis & Design (methods + data)

| Figure no. | Slot | Source | Status | Asset / Spec |
|---|---|---|---|---|
| Figure 2.1 | Proposed SFDCT pipeline overview | existing-asset | READY | `fig_arch_sfdct.png` |
| Figure 2.2 | SFDCT-HFF improved variant | existing-asset | READY | `fig_arch_sfdct_hff.png` |
| Figure 2.3 | Dataset illustration (real/fake faces) | existing-asset | READY | `fig_3_2_2_celeb_realfake.png` |
| Figure 2.4 | Data directory structure | new-illustrative | CREATE | `fig_2_data_tree.png` — monospace tree of dataset_json + cropped-frames layout |
| Figure 2.5 | Label/class illustration (4 forgery methods) | new-illustrative | CREATE | `fig_2_label_classes.png` — real=0/fake=1 + one crop per FF++ method |
| Figure 2.6 | Preprocessing pipeline diagram | new-illustrative | CREATE | `fig_2_preprocess_pipeline.png` — raw -> detect -> align -> crop/pad -> normalise; branch to YCbCr->block-DCT |
| Figure 2.7 | Data distribution chart (train/test counts) | existing-asset | READY | `fig_3_1_distribution.png` (reused as Fig 3.8) |
| Figure 2.8 | Per-band energy real vs fake [REINTERPRET-DCT] | reinterpret-DCT | READY | `fig_3_11_frequency.png` — mean DCT energy per band + difference (also FULL.md result) |
| Figure 2.9 | 48-dim band design + drop-low-band filtering [REINTERPRET-DCT] | reinterpret-DCT | CREATE | `fig_2_dct_feature_design.png` — 16 bands x 3 YCbCr, lowest bands struck out |
| Figure 2.10 | Output-class verdict bands (real/uncertain/fake) | new-illustrative | CREATE | `fig_2_output_bands.png` — score axis 0..100 split into verdict bands (risk_band contract) |
| Figure 2.11 | Liveness B4 baseline architecture (FULL.md Fig 2.6) | new-illustrative | CREATE | `fig_2_b4_liveness.png` — crop -> B4 -> 2-layer head -> spoof prob/verdict |
| Figure 2.12 | Liveness B4+DCT proposal architecture (FULL.md Fig 2.7) | new-illustrative | CREATE | `fig_2_b4dct_liveness.png` — Fig 2.11 + block-DCT branch + zero-start gate |

### Chapter 3 — Implementation, Evaluation & App

| Figure no. | Slot | Source | Status | Asset / Spec |
|---|---|---|---|---|
| Figure 3.1 | Use-case diagram (6 actors) | existing-asset | READY | `fig_2_1_usecase.png` |
| Figure 3.2 | Activity: deepfake image detection | existing-asset | READY | `fig_2_3_activity_image_detection.png` |
| Figure 3.3 | Activity: eKYC cascade | existing-asset | READY | `fig_2_4_activity_ekyc.png` |
| Figure 3.4 | Sequence: deepfake detection | existing-asset | READY | `fig_2_5_sequence_image_detection.png` |
| Figure 3.5 | Sequence: eKYC cascade | existing-asset | READY | `fig_2_6_sequence_ekyc.png` |
| Figure 3.6 | System / component architecture | existing-asset | READY | `fig_2_2_architecture.png` |
| Figure 3.7 | Database ERD (real backend schema) | db-schema | READY | `fig_erd_backend.png` (verify it shows all 12 tables; may predate liveness_checks/notifications) |
| Figure 3.8 | Data distribution (FULL.md Fig 3.1) | existing-asset | READY | `fig_3_1_distribution.png` |
| Figure 3.9 | Real/fake pair + frequency spectrum (FULL.md Fig 3.2) | existing-asset | READY | `fig_3_2_preprocess_realfake.png` |
| Figure 3.10 | Mean frequency energy by band (FULL.md Fig 3.3) | result-from-FULL | READY | `fig_3_11_frequency.png` |
| Figure 3.11 | Baseline B4 model summary (FULL.md Fig 3.4) | existing-asset | READY | `fig_3_4_summary_b4.png` |
| Figure 3.12 | Baseline training curve (AUC 0.7497) (FULL.md Fig 3.5) | result-from-FULL | READY | `fig_3_3_train_b4.png` |
| Figure 3.13 | SFDCT model summary (FULL.md Fig 3.6) | existing-asset | READY | `fig_3_6_summary_sfdct.png` |
| Figure 3.14 | SFDCT training curve (AUC 0.7572) (FULL.md Fig 3.7) | result-from-FULL | NEEDS-DATA | `fig_3_4_v2_train_dynamics.png` — VERIFY this is SFDCT run (not naive); fallback `fig_3_4_train_naive.png` |
| Figure 3.15 | SFDCT-HFF model summary (FULL.md Fig 3.8) | existing-asset | READY | `fig_3_8_summary_hff.png` |
| Figure 3.16 | SFDCT-HFF training curve (AUC 0.7695) (FULL.md Fig 3.9) | result-from-FULL | READY | `fig_3_9_train_hff_r3.png` |
| Figure 3.17 | ROC curves + 5% FPR line (FULL.md Fig 3.10) | result-from-FULL | READY | `fig_3_7_roc.png` |
| Figure 3.18 | Precision-recall curves (FULL.md Fig 3.11) | result-from-FULL | READY | `fig_3_8_pr_curve.png` |
| Figure 3.19 | Confusion matrix at eKYC threshold (FULL.md Fig 3.12) | result-from-FULL | READY | `fig_3_9_confusion.png` (5339/281/8318/2482) |
| Figure 3.20 | t-SNE feature projection (FULL.md Fig 3.13) | result-from-FULL | READY | `fig_3_10_tsne.png` |
| Figure 3.21 | Grad-CAM heat map (FULL.md Fig 3.14) | result-from-FULL | READY | `fig_3_12_gradcam.png` |
| Figure 3.22 | Example predictions on test faces (FULL.md Fig 3.15) | result-from-FULL | READY | `fig_3_15_predictions.png` |
| Figure 3.23 | Fusion-gate alpha distribution (FULL.md Fig 3.16) | result-from-FULL | READY | `fig_3_13_gate_alpha.png` |
| Figure 3.24 | Liveness live/spoof crops (FULL.md Fig 3.17) | result-from-FULL | READY | `fig_3_17_liveness.png` |
| Figure 3.25 | B4-liveness ROC + score dist (AUC 0.9829) (FULL.md Fig 3.18) | result-from-FULL | READY | `fig_3_20_roc_b4_liveness.png` |
| Figure 3.26 | B4+DCT-liveness ROC + score dist (AUC 0.9776) (FULL.md Fig 3.19) | result-from-FULL | READY | `fig_3_23_roc_b4dct_liveness.png` |
| Figure 3.27 | Deployment topology on single cloud instance (FULL.md Fig 3.20) | new-illustrative | CREATE | `fig_3_deployment.png` — EC2 host: HTTPS proxy -> 4 containers; DNS/Elastic IP |
| Figure 3.28 | Home screen screenshot (FULL.md Fig 3.21) | screenshot | NEEDS-APP | `fig_3_screen_home.png` — capture four-capability home |
| Figure 3.29 | Deepfake result screen (FULL.md Fig 3.22) | existing-asset | READY | `screenshot_demo_image_detect.png` (recapture only if UI changed) |
| Figure 3.30 | Liveness detection screen (FULL.md Fig 3.23) | screenshot | NEEDS-APP | `fig_3_screen_liveness.png` |
| Figure 3.31 | Login screen | screenshot | NEEDS-APP | `fig_3_screen_login.png` |
| Figure 3.32 | History / detection-list screen | screenshot | NEEDS-APP | `fig_3_screen_history.png` (optional if visible in result screen) |
| Figure 3.33 | API-keys management (developer) screen | screenshot | NEEDS-APP | `fig_3_screen_apikeys.png` |

---

## 3. Table Plan

### Introduction

| Table no. | Slot | Source | Status | Note |
|---|---|---|---|---|
| Table 0.1 | Research scope (in/out of scope) | new-illustrative | CREATE | Aspect \| In scope \| Out of scope; restate Intro Objective/Purposes |
| Table 0.2 | Research-methodology steps | result-from-FULL | READY | Reflow Intro Step 1..7 prose into Step \| Activity |

### Chapter 1

| Table no. | Slot | Source | Status | Note |
|---|---|---|---|---|
| Table 1.1 | Compound-scaling config | result-from-FULL | READY | Existing FULL.md Table 1.1 (Dimension/Meaning/Benefit/Risk) |
| Table 1.2 | Symbols & notation | result-from-FULL | READY | Existing front-matter list (41 entries) surfaced as Ch1 notation |
| Table 1.3 | DCT regions of a coefficient block | result-from-FULL | READY | Existing FULL.md Table 1.2 |
| Table 1.4 | Cross-attention roles | result-from-FULL | READY | Existing FULL.md Table 1.3 |
| Table 1.5 | Four FF++ forgery methods | result-from-FULL | READY | Existing FULL.md Table 1.4 (merge 2 fragments) |
| Table 1.6 | The two datasets | result-from-FULL | READY | Existing FULL.md Table 1.5 |

### Chapter 2

| Table no. | Slot | Source | Status | Note |
|---|---|---|---|---|
| Table 2.1 | End-to-end pipeline I/O | new-illustrative | CREATE | Stage \| Input \| Output; restate Sec 2.3 stages |
| Table 2.2 | Deepfake image API I/O | result-from-FULL | READY | Existing Table 2.6 |
| Table 2.3 | Video API I/O | result-from-FULL | READY | Existing Table 2.7 |
| Table 2.4 | Deepfake label mapping | new-illustrative | CREATE | Label \| Value \| Definition \| Source (real=0/fake=1 inherited) |
| Table 2.5 | Liveness label/metric mapping | new-illustrative | CREATE | live=0/spoof=1; APCER/BPCER/ACER definitions |
| Table 2.6 | Data-augmentation methods | new-illustrative | CREATE | Augmentation \| Type \| Spectrum note (flip/rotate/blur/jitter/JPEG) |
| Table 2.7 | Dataset split | result-from-FULL | READY | Existing Table 2.9 |
| Table 2.8 | Preprocessing module config | result-from-FULL | READY | Existing Table 2.10 |
| Table 2.9 | 48-dim feature design [REINTERPRET-DCT] | reinterpret-DCT | CREATE | Feature group \| Construction \| Dimension (16 bands x 3 YCbCr = 48) |
| Table 2.10 | Drop-low-band filtering [REINTERPRET-DCT] | reinterpret-DCT | CREATE | Band range \| Content \| Kept? \| Reason |
| Table 2.11 | Liveness dataset spec | result-from-FULL | READY | Existing Table 2.12 (LCC-FASD) |
| Table 2.12 | Design-choice justifications | result-from-FULL | READY | Existing Table 2.11 |

### Chapter 3 (use-cases + database)

| Table no. | Slot | Source | Status | Note |
|---|---|---|---|---|
| Table 3.1 | UC-01 detect deepfake image | result-from-FULL | READY | Existing Table 2.2 |
| Table 3.2 | UC-02 detect deepfake video | result-from-FULL | READY | Existing Table 2.3 (merge 2 fragments) |
| Table 3.3 | UC-03 liveness check | result-from-FULL | READY | Existing Table 2.4 (merge 2 fragments) |
| Table 3.4 | Supporting/auth use cases | result-from-FULL | READY | Existing Table 2.5 |
| Table 3.5 | Actors | result-from-FULL | READY | Existing Table 2.1 |
| Table 3.6 | Liveness API contract | result-from-FULL | READY | Existing Table 2.8 |
| Table 3.7–3.18 | Per-table DB column specs | db-schema | NEEDS-DATA | One column-spec table per real table (12 tables, §4); columns from `deepguard_db/app/db/models.py` |

### Chapter 4 (results + deployment)

| Table no. | Slot | Source | Status | Note |
|---|---|---|---|---|
| Table 4.1 | Training hyperparameters | result-from-FULL | READY | Existing Table 3.3 (batch 32, fixed LR, 10 epochs); + Table 3.1 hardware, 3.2 software |
| Table 4.2 | Model comparison (cross-dataset AUC) | result-from-FULL | READY | Existing Tables 3.5/3.6 (0.7497/0.7572/0.7695; video ~0.82/0.81/0.83; CIs include zero) |
| Table 4.3 | Operating-point calibration | result-from-FULL | READY | Existing Table 3.7 (thr 0.9514, catch 0.2298, FPR<=5%) + Table 3.8 |
| Table 4.4 | Liveness comparison | result-from-FULL | READY | Existing Tables 3.9/3.10 (AUC 0.98, ACER 6.85%, B4 vs B4+DCT) |
| Table 4.5–4.6 | Deployment specs | result-from-FULL | READY | Existing Tables 3.11 (instance spec) / 3.12 (demo accounts) |

---

## 4. Database Design (Ch3 §3.4) — DEFERRED, write LAST

> STATUS: DEFERRED per user (2026-06-16): write the other chapters first, DB Design last. When written, keep it BRIEF — ERD figure + one overview paragraph + a single summary table (table → purpose) detailing the 7 core tables (tenants, users, api_keys, detections, liveness_checks, jobs, model_versions) and listing the 5 supporting ones. The full schema below is captured here only as the source to draw from.

Authoritative source: `deepguard_db/app/db/models.py` (SQLAlchemy 2.0). Secondary DDL: `deepguard_db/schema.sql` (stale: 10 tables; models.py is live and adds `liveness_checks` + `notifications` plus extra columns/enum values). ERD asset: `report/figures/fig_erd_backend.png`. **12 real tables, status READY** (column specs drawn from models.py; the per-table thesis tables are NEEDS-DATA only in that the prose agent transcribes columns verbatim — no fabrication). All tenant-scoped tables carry `tenant_id` FK with ON DELETE CASCADE; `created_at`/`updated_at` via TimestampMixin except where noted.

### 4.1 tenants
Root of multi-tenancy. `id` UUID PK; `name` VARCHAR(200); `plan` ENUM tenant_plan{starter,pro,enterprise} def starter; `status` ENUM tenant_status{pending,active,suspended,deleted} def active; `monthly_quota` INT def 100; `current_usage` INT def 0; `admin_email` VARCHAR(255); `billing_email` VARCHAR(255) NULL; `metadata` JSONB def {}; `created_at`/`updated_at`. CK: quota>=0, usage>=0. IX: (status,plan),(created_at). No FK (root). NOTE: status 'pending' in models.py only.

### 4.2 users
`id` UUID PK; `tenant_id` FK->tenants CASCADE; `email` VARCHAR(255); `password_hash` VARCHAR(255); `name` VARCHAR(200); `phone` VARCHAR(40) NULL; `timezone` VARCHAR(64) NULL; `role` ENUM user_role{viewer,developer,compliance,admin,sysadmin} def developer; `is_active` BOOL def true; `must_change_password` BOOL def false; `last_login_at` NULL; `deleted_at` NULL (soft delete); `created_at`/`updated_at`. UQ: (email,tenant_id). IX: (tenant_id,role),(email). Child: audit_logs (SET NULL). NOTE: phone/timezone/must_change_password/role 'viewer' in models.py only.

### 4.3 api_keys
SHA-256 hashed, plaintext never stored. `id` UUID PK; `tenant_id` FK CASCADE; `key_hash` VARCHAR(64); `prefix` VARCHAR(32); `name` VARCHAR(200); `status` ENUM api_key_status{active,suspended,revoked} def active; `quota_limit` INT def 1000; `quota_used` INT def 0; `rate_limit_rpm` INT def 60; `last_used_at` NULL; `expires_at` NULL; `deleted_at` NULL; `created_at`/`updated_at`. UQ: key_hash. IX: (tenant_id,status),(prefix). NOTE: trust models.py prefix VARCHAR(32) over schema.sql (16).

### 4.4 invitations
`id` UUID PK; `tenant_id` FK CASCADE; `email` VARCHAR(255); `role` ENUM user_role; `token` VARCHAR(128); `expires_at`; `accepted_at` NULL; `created_at`/`updated_at`. UQ: token. IX: (email).

### 4.5 webhooks
`id` UUID PK; `tenant_id` FK CASCADE; `url` VARCHAR(500); `events` JSONB def []; `secret` VARCHAR(255) NULL; `status` ENUM webhook_status{active,paused} def active; `last_delivery_at` NULL; `last_delivery_status` INT NULL; `created_at`/`updated_at`. IX: (tenant_id,status). Child: webhook_deliveries CASCADE.

### 4.6 detections
PK is `request_id` (not id). `request_id` UUID PK; `tenant_id` FK CASCADE; `api_key_id` FK->api_keys NULL (NULL=playground); `source` VARCHAR(20) def 'api'; `verdict` ENUM detection_verdict{REAL,FAKE,UNCERTAIN} (IX); `confidence` FLOAT (0-100); `prob_fake` FLOAT (0-1); `prob_cnn` FLOAT; `spatial_score` FLOAT NULL; `frequency_score` FLOAT NULL; `threshold_used` FLOAT; `image_hash` VARCHAR(64) (no raw image); `image_width`/`image_height` INT NULL; `heatmap_url` VARCHAR(500) NULL (S3); `image_thumb` TEXT NULL; `processing_time_ms` INT; `model_version` VARCHAR(50); `user_agent` VARCHAR(500) NULL; `ip_address` VARCHAR(45) NULL; `audit_notes` JSONB def []; `created_at`/`updated_at`. CK: confidence 0-100, prob 0-1. IX: (tenant_id,created_at),(verdict,created_at),(api_key_id,created_at),(source,created_at). NOTE: image_thumb in models.py only.

### 4.7 jobs
Async video/batch. `id` UUID PK; `tenant_id` FK CASCADE; `api_key_id` FK; `type` ENUM job_type{video_detection,batch_detection}; `status` ENUM job_status{PENDING,PROCESSING,COMPLETED,FAILED} def PENDING; `progress_percent` INT def 0; `input_url` VARCHAR(500) NULL; `result` JSONB def {}; `error_message` VARCHAR(1000) NULL; `started_at`/`completed_at` NULL; `webhook_url` VARCHAR(500) NULL; `created_at`/`updated_at`. CK: progress 0-100. IX: (status,created_at),(tenant_id,created_at).

### 4.8 webhook_deliveries
`id` UUID PK; `webhook_id` FK->webhooks CASCADE; `event_type` VARCHAR(100); `payload` JSONB; `status_code` INT NULL; `response_body` VARCHAR(2000) NULL; `latency_ms` INT NULL; `delivered` BOOL def false; `attempt_count` INT def 1; `next_retry_at` NULL; `created_at`/`updated_at`. IX: (webhook_id,created_at),(next_retry_at).

### 4.9 audit_logs
High-write, BIGSERIAL PK, NO updated_at. `id` BIGSERIAL PK; `tenant_id` FK->tenants SET NULL; `user_id` FK->users SET NULL; `action` VARCHAR(100); `resource_type` VARCHAR(50); `resource_id` UUID NULL; `metadata` JSONB def {}; `ip_address` VARCHAR(45) NULL; `user_agent` VARCHAR(500) NULL; `created_at` (IX). IX: (created_at),(tenant_id,created_at),(action,created_at),(resource_type,resource_id). Production note: partition by month.

### 4.10 model_versions
Standalone registry, A/B testing. `id` UUID PK; `version` VARCHAR(50); `architecture` VARCHAR(200); `auc_celeb`/`auc_ffpp` FLOAT NULL; `threshold` FLOAT def 0.5; `training_dataset` VARCHAR(200) NULL; `checkpoint_path` VARCHAR(500); `is_active` BOOL def false; `traffic_percent` INT def 0; `deployed_at` NULL; `metadata` JSONB def {}; `created_at`/`updated_at`. UQ: version. CK: traffic 0-100. Seed: 'b4-baseline-v1' (active 100%), 'hybrid-b4-dct-v3' (inactive) — illustrative demo rows.

### 4.11 liveness_checks
Secondary task. PK is `check_id`. `check_id` UUID PK; `tenant_id` FK CASCADE; `api_key_id` FK; `verdict` ENUM liveness_verdict{LIVE,SPOOF,UNCERTAIN} (IX); `liveness_score` FLOAT (0-1); `confidence` FLOAT (0-100); `spoof_type` ENUM spoof_type{print,screen,mask_3d,deepfake,unknown} NULL; `threshold_used` FLOAT; `mode` VARCHAR(20) def 'passive'; `challenge_type` VARCHAR(50) NULL; `challenge_passed` BOOL NULL; `frame_count` INT def 1; `image_hash` VARCHAR(64); `image_width`/`image_height` INT NULL; `image_thumb` TEXT NULL; `processing_time_ms` INT; `model_version` VARCHAR(50); `user_agent`/`ip_address` NULL; `metadata` JSONB def {}; `created_at`/`updated_at`. CK: score 0-1, confidence 0-100. IX: (tenant_id,created_at),(verdict,created_at),(api_key_id,created_at). NOTE: models.py only.

### 4.12 notifications
`id` UUID PK; `tenant_id` FK CASCADE; `user_id` FK->users CASCADE NULL (NULL=whole tenant); `type` VARCHAR(20) def 'info'; `title` VARCHAR(255); `body` TEXT NULL; `link` VARCHAR(255) NULL; `read` BOOL def false; `created_at`/`updated_at`. IX: (tenant_id,created_at),(user_id,read). NOTE: models.py only.

---

## 5. New Illustrative Figures to Create

### Matplotlib charts (conceptual, no real data)
- `fig_1_roc_concept.png` — conceptual ROC: TPR vs FPR axes, AUC shaded area, dashed 5%-FPR operating line. Labelled "illustrative".
- `fig_1_confusion_concept.png` — 2x2 confusion template (TP/FP/FN/TN) with "genuine wrongly rejected" / "fake missed" eKYC labels.
- `fig_2_output_bands.png` — horizontal score axis 0..100 split into real / uncertain-review / fake bands (risk_band contract).

### Diagrams (flow / block / topology)
- `fig_1_problem_io.png` — x -> f_theta -> P(fake) in [0,1] -> verdict + heatmap.
- `fig_1_rest_api.png` — client -> HTTP request (URL/method/headers/body) -> FastAPI -> JSON response.
- `fig_1_aws_services.png` — EC2 host with S3/ACM/CloudWatch/Elastic IP icons.
- `fig_2_preprocess_pipeline.png` — raw -> detect -> align -> crop/pad -> normalise; branch YCbCr->block-DCT.
- `fig_2_dct_feature_design.png` — 16 zigzag bands x 3 YCbCr = 48-dim grid, lowest bands struck out (drop-low-band).
- `fig_2_b4_liveness.png` — crop -> EfficientNet-B4 -> 2-layer head -> spoof prob/verdict.
- `fig_2_b4dct_liveness.png` — as above + block-DCT branch + zero-start gate.
- `fig_3_deployment.png` — single EC2: HTTPS reverse proxy -> 4 containers (frontend/backend/model-service/db) on private net; DNS/Elastic IP in front.

### Directory tree (monospace render)
- `fig_2_data_tree.png` — dataset_json + cropped-frames layout (FF++/{real,Deepfakes,Face2Face,FaceSwap,NeuralTextures}; Celeb-DF-v2/{real,fake}; per-video frame folders).

### Logo collage / composition from existing crops
- `fig_1_tech_stack_logos.png` — labelled grid: Next.js, React, TypeScript, FastAPI, PyTorch, Docker, PostgreSQL, AWS (EC2/S3/ACM/CloudWatch).
- `fig_2_label_classes.png` — real=0/fake=1 with one example crop per FF++ forgery method (compose from existing crops).

### Screenshots from running app (NEEDS-APP)
- `fig_3_screen_home.png`, `fig_3_screen_liveness.png`, `fig_3_screen_login.png`, `fig_3_screen_history.png`, `fig_3_screen_apikeys.png` — capture with seeded demo accounts. `screenshot_demo_image_detect.png` already exists for the result screen.

**14 NEW illustrative figures total** (10 diagram/chart/tree/logo + the 2 reinterpret-DCT diagram is counted within; Fig 2.11/2.12 liveness are new). Plus 5 NEEDS-APP screenshots.

---

## 6. Totals

### Figures per chapter
| Chapter | Total | READY | CREATE | NEEDS-DATA | NEEDS-APP |
|---|---|---|---|---|---|
| Ch1 | 13 | 7 | 6 | 0 | 0 |
| Ch2 | 12 | 5 | 7 | 0 | 0 |
| Ch3 | 33 | 22 | 1 | 1 | 5 |
| **Total** | **33 distinct numbers across 3 chapters = 58 figure entries** | **34** | **14** | **1** | **5** |

(58 figure rows: Ch1=13, Ch2=12, Ch3=33. READY 34, CREATE 14, NEEDS-DATA 1 (Fig 3.14 SFDCT curve verify), NEEDS-APP 5, and note `fig_3_1_distribution.png` / `fig_3_2_preprocess_realfake.png` / `fig_3_11_frequency.png` are intentionally reused across Ch2 and Ch3.)

### Tables per chapter
| Chapter | Total | READY | CREATE | NEEDS-DATA |
|---|---|---|---|---|
| Intro | 2 | 1 | 1 | 0 |
| Ch1 | 6 | 6 | 0 | 0 |
| Ch2 | 12 | 7 | 5 | 0 |
| Ch3 (use-case+DB) | 6 + 12 DB | 6 | 0 | 12 DB transcribe |
| Ch4 | 6 | 6 | 0 | 0 |
| **Total** | **44** (32 table-numbers + 12 DB tables) | **26** | **6** | **12 DB** |

6 genuinely NEW tables to author (all conceptual restatements): 0.1 scope, 2.1 pipeline I/O, 2.4 deepfake labels, 2.5 liveness labels, 2.6 augmentation, plus reinterpret-DCT 2.9 and 2.10 (7 new authored, of which 2 are reinterpret-DCT). 12 DB tables are transcribed verbatim from the live schema (NEEDS-DATA = transcribe, not fabricate).

---

## 7. Integrity note

Every RESULT figure and table comes ONLY from FULL.md real numbers/curves (existing real assets): AUC baseline 0.7497, SFDCT 0.7572, SFDCT-HFF 0.7695; video-level ~0.82/0.81/0.83 with 95% CIs that include zero (not significant); eKYC threshold 0.9514 / catch 0.2298 / FPR<=5%; confusion 5339/281/8318/2482; liveness AUC 0.98 / ACER 6.85% (B4 0.9829 vs B4+DCT 0.9776, no gain). No new experiments, no fabricated curves.

NEW illustrative figures are diagrams, logos, directory trees, and conceptual metric/operation illustrations — safe restatements of existing prose, not fabrication. The reinterpret-DCT figures/tables describe the REAL 48-dim frequency-feature design (16 zigzag bands x 3 YCbCr) and drop-low-band filtering; NO classical-ML SVM/RF/XGBoost pipeline is invented. The database design is the REAL DeepGuard backend schema transcribed from `deepguard_db/app/db/models.py` and depicted by the existing ERD asset `fig_erd_backend.png` — real, not a placeholder.
