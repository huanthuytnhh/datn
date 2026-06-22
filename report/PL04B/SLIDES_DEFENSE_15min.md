# Defense slides (19, ~15-17 minutes) — SFDCT thesis

Condensed from the v2 report for a short defense talk. 16 main-content slides + 2 diagram slides + 1 screenshot slide = 19 total (nearly 20, the 3 auxiliary slides are counted inside). Slide title and bullets are slide-ready English; the *Speaker note* is in Vietnamese. Figure paths are real assets in `report/figures/`.

Verified numbers: frame AUC B4 0.7497 / SFDCT 0.7572 / SFDCT-HFF 0.7695 (benchmark 0.7487, SPSL 0.7650); video AUC 0.8203 / 0.8083 / 0.8269 (every paired CI contains zero); eKYC threshold 0.9514, FPR 0.0500, catch 0.2298, confusion 5339 / 281 / 8318 / 2482; liveness B4 AUC 0.9829 / ACER 6.85% / APCER 2.86% / BPCER 10.83%, B4+DCT 0.9776.

---

## Slide 1 — Title
- Hybrid Spatial-Frequency Learning with Block-wise DCT for Deepfake and Liveness Detection in eKYC
- Le Ngoc Thanh — 102220041 — 22T_KHDL
- Supervisor: Assoc. Prof. Dr. Pham Cong Thang — DUT, 2026
- **Figure:** none (school logo)
- *Speaker note:* chào hội đồng, 1 câu giới thiệu đề tài.

## Slide 2 — Problem and Motivation
- eKYC opens accounts and approves payments from a single face photo
- Two threats at that step: deepfake (synthetic face) and presentation attack (printed photo / screen replay)
- Core difficulty: generalisation — the detector must catch manipulations it never saw in training
- Regulatory driver: Circular 17/2024/TT-NHNN (biometric verification)
- **Figure:** `fig_3_2_preprocess_realfake.png` (real vs fake face with frequency spectrum)
- *Speaker note:* nhấn "kẻ tấn công luôn dùng công cụ mới → mô hình phải tổng quát hoá".

## Slide 3 — Objectives and Scope
- Build a deepfake detector that generalises across datasets, plus a secondary liveness pre-filter
- Frame level on single aligned faces (no temporal/video-level modelling in the method)
- Evaluate under the public DeepfakeBench protocol: train FaceForensics++, test Celeb-DF-v2 (cross-dataset)
- Deliver an explainable web service with a calibrated eKYC operating point
- **Figure:** none (a short in/out-of-scope bullet box)
- *Speaker note:* làm rõ phạm vi: ảnh đơn, cross-dataset là phép đo tổng quát hoá thật; liveness là phụ.

## Slide 4 — Core hypothesis: traces live in the frequency domain
- Forgery traces are faint in pixels but loud in the mid and high frequency bands
- Three recurring traces: blending boundary, upsampling artifact, frequency inconsistency
- Therefore read the image two ways at once, spatial and frequency
- **Figure:** `fig_3_11_frequency.png` (mean DCT energy per band, real vs fake)
- *Speaker note:* giả thuyết lõi; mọi thiết kế sau bám vào đây.

## Slide 5 — Background: from 8x8 block-DCT to a compact descriptor
- 8x8 block-DCT (the JPEG grid) keeps a forgery trace local
- Zigzag scan orders the 64 coefficients low-to-high, then groups them into 16 bands
- Per-band mean magnitude over 3 YCbCr channels gives a 48-dim descriptor, with no learnable frequency parameters
- Low (content) bands can be dropped so the branch attends to forgery bands
- **Figure:** `fig_1_3_zigzag_detailed.png` (zigzag scan to 16 bands to 48-dim vector)
- *Speaker note:* giải thích nhanh chuỗi DCT; nhấn "0 tham số học ở nhánh tần số" (rẻ, ổn định).

## Slide 6 — Method: SFDCT architecture
- Spatial stream: EfficientNet-B4 produces a feature map F_s
- Frequency stream: 8x8 block-DCT, 16 zigzag bands x 3 YCbCr = 48-dim descriptor, no learnable frequency parameters
- The two are merged by a gated cross-attention, then a two-class head outputs a fake probability
- **Figure:** `fig_arch_sfdct.png` (SFDCT pipeline overview)
- *Speaker note:* kiến trúc đề xuất chính; nhắc nhánh tần số 0 tham số học.

## Slide 7 — Key mechanism: zero-initialised gated fusion
- Spatial features query, frequency features are key/value (cross-attention)
- F_fused = F_s + alpha . context, with alpha initialised to 0
- At init the model equals the backbone, so it cannot perform below the baseline (floor guarantee); the gate opens only where it lowers the loss
- **Figure:** `fig_1_4_gate_fusion.png` (gated cross-attention fusion)
- *Speaker note:* điểm mấu chốt/đóng góp: floor guarantee.

## Slide 8 — Improved variant: SFDCT-HFF
- Same backbone and gate, frequency carried as a high-pass image instead of band statistics
- Low bands zeroed, inverse DCT gives a high-pass residual; a multi-scale stream and a residual-guided attention map point the backbone to the evidence
- The only difference from SFDCT is the representation, so any gain is attributable to it
- **Figure:** `fig_arch_sfdct_hff.png` (SFDCT-HFF variant)
- *Speaker note:* biến thể mạnh nhất họ; cùng gate nên so sánh công bằng.

## Slide 9 — Secondary task: liveness
- Liveness runs first as a cascade pre-filter; a spoof verdict stops the request before deepfake compute
- Two end-to-end CNN architectures on the same backbone: B4 spatial-only vs B4 + block-DCT
- Physical basis: replay/print leave faint recapture and dot frequency traces
- **Figure:** `fig_2_b4dct_liveness.png` (B4+DCT-liveness architecture)
- *Speaker note:* liveness là phụ, tái dùng đúng nhánh tần số của deepfake.

## Slide 10 — DIAGRAM 1: system design (actors and architecture)
- Six actors over a multi-tenant platform; main functions: tenant, user, and API-key management plus detection
- Five blocks: frontend, backend API, AI inference service, monitoring, alerting
- Backend is the single guarded gateway to the database and the model
- **Figure:** `fig_2_1_usecase.png` (use-case diagram) — pair with `fig_2_2_architecture.png` if space allows
- *Speaker note:* 1 slide cho thấy thiết kế hệ thống; nói nhanh ai dùng gì + 5 khối.

## Slide 11 — DIAGRAM 2: the eKYC cascade flow
- A request is localised, then the liveness gate runs first
- A spoof or uncertain verdict stops here; only a live capture goes to the deepfake stage
- The deepfake stage returns a risk score, a verdict band, and a heat map
- **Figure:** `fig_2_4_activity_ekyc.png` (eKYC cascade activity diagram) — or `fig_2_6_sequence_ekyc.png`
- *Speaker note:* giải thích luồng cascade: liveness chặn trước, deepfake sau; tiết kiệm compute + tăng an toàn.

## Slide 12 — Datasets, protocol and setup
- Train: FaceForensics++ (1000 real, 4000 fake, 4 methods); Test: Celeb-DF-v2 (590 real, 5639 fake), never seen
- 32 frames per video; about 159,600 train and 16,420 test frames; frame-level AUC under DeepfakeBench
- EfficientNet-B4 pretrained on ImageNet, 256 px, batch 32, Adam, 10 epochs, a single seed
- **Figure:** `fig_3_1_distribution.png` (real/fake counts, train and test)
- *Speaker note:* gộp data + setup; nói thẳng single seed (sẽ là hạn chế).

## Slide 13 — Main result: cross-dataset AUC
- Baseline B4 0.7497 (matches the published 0.7487, confirms a correct pipeline)
- Naive SFDCT 0.7572; SFDCT-HFF (full) 0.7695, the highest of the family
- In-distribution test AUC stays at 0.95 to 0.97; only the cross-dataset AUC oscillates, which is the generalisation gap
- **Figure:** `fig_3_7_roc.png` (ROC curves with the 5% FPR line) — or `fig_3_4_v2_train_dynamics.png`
- *Speaker note:* thứ tự B4 < SFDCT < HFF đúng giả thuyết; chuẩn bị cho slide trung thực kế tiếp.

## Slide 14 — Honest reading of the numbers
- Gains over the baseline are small and within run-to-run noise
- Video-level bootstrap: every paired interval against the baseline contains zero, so none is significant at a single seed
- SPSL (0.7650) still beats the naive SFDCT, so no state-of-the-art claim is made
- **Figure:** `fig_3_8_pr_curve.png` (precision-recall curves) — or a small comparison table
- *Speaker note:* SLIDE LIÊM CHÍNH quan trọng nhất: nói thẳng chưa significant, single seed, không SOTA.

## Slide 15 — eKYC operating point
- Threshold calibrated to keep the false-positive rate at 5% (Circular 17 budget): threshold 0.9514, FPR 0.0500, catch 0.2298
- Confusion at 5% FPR: 5339 genuine accepted, 281 rejected, 8318 fakes missed, 2482 caught (about 23% caught)
- Low recall at a customer-friendly threshold is why the liveness pre-filter is composed in front
- **Figure:** `fig_3_9_confusion.png` (confusion matrix at the eKYC threshold)
- *Speaker note:* đánh đổi: giữ FPR 5% thì chỉ bắt ~23% giả → cần cascade liveness.

## Slide 16 — Explainability and feature separation
- Grad-CAM heat map shows where the decision is made (eyes, blending boundaries)
- t-SNE projection shows the real/fake separation learned by the model
- Explanation is a banking review requirement, not optional
- **Figure:** `fig_3_12_gradcam.png` (Grad-CAM) — pair with `fig_3_10_tsne.png` if space allows
- *Speaker note:* explainability là yêu cầu nghiệp vụ ngân hàng, không chỉ trang trí.

## Slide 17 — Liveness results
- B4-liveness on LCC-FASD: AUC 0.9829, ACER 6.85%, APCER 2.86%, BPCER 10.83%
- B4+DCT 0.9776; the frequency branch does not beat the spatial head here either (honest negative)
- Consistent with the deepfake finding, reported plainly
- **Figure:** `fig_3_20_roc_b4_liveness.png` (B4-liveness ROC and score distribution)
- *Speaker note:* liveness dễ hơn (AUC ~0.98) nhưng freq vẫn không thắng — trung thực.

## Slide 18 — SCREENS: the deployed application
- An explainable, multi-tenant eKYC web platform, served on a single CPU instance (model about 70 MB, about 1 second per image)
- Screens: home, image-detection result (risk score, verdict band, heat map, spectrum), liveness check, detection history
- Output is one input to a reviewable decision, not an automatic verdict
- **Figure:** `screenshot_demo_image_detect.png` (the result screen; show home/liveness/history as a small strip if available)
- *Speaker note:* 1 slide screenshot cho thấy sản phẩm chạy thật; nói nhanh.

## Slide 19 — Conclusion, limitations, future work
- Contribution: a spatial-frequency detector with a floor guarantee, evaluated honestly cross-dataset; liveness reuses the same design
- Findings: frequency raises cross-dataset AUC in the right order (0.7497 to 0.7572 to 0.7695), but gains are within noise at a single seed and are not state of the art
- Limitations: single seed, small margins. Future: multi-seed significance tests, Vietnamese-face calibration, video-level aggregation
- **Figure:** none (a short contributions / limitations / future box)
- *Speaker note:* kết bằng đóng góp + trung thực về hạn chế; mở hướng multi-seed và mặt người Việt.

---

### Time budget (~15-17 minutes)
- Slides 1-3 (intro + scope): ~2 min
- Slides 4-5 (hypothesis + background): ~2 min
- Slides 6-9 (method, the core): ~4 min
- Slides 10-11 (diagrams): ~1.5 min
- Slide 12 (data/setup): ~1 min
- Slides 13-17 (results): ~4.5 min
- Slides 18-19 (screens + conclusion): ~1.5 min

### Likely committee questions
- Why is the cross-dataset gain so small? (cross-dataset is hard; gains within noise; honest, not over-claimed)
- Is 0.7695 reliable given the curve peaks at 0.7551? (0.7695 is the saved best checkpoint from twice-per-epoch evaluation, verified from the checkpoint; 0.7551 is the epoch-end peak of the recoverable points)
- Why does the frequency branch not help liveness? (honest negative; recapture trace helps replay more than print)
- Why single seed? (rented-GPU cost; multi-seed is stated future work)
- Why low recall at the eKYC threshold? (5% FPR budget forces a high threshold; the liveness cascade compensates)
