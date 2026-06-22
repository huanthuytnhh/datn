# Defense slides (20) — SFDCT thesis

Condensed from the v2 report. Main parts only (theory → method → results → conclusion); auxiliary parts (web stack, DNS/AWS, use-case/sequence detail, app screenshots, DB schema) are omitted or compressed to one slide. Slide title and bullets are slide-ready English; the *Speaker note* is in Vietnamese. Figure paths are real assets in `report/figures/`.

Numbers are the verified report values: frame AUC B4 0.7497 / SFDCT 0.7572 / SFDCT-HFF 0.7695 (benchmark 0.7487, SPSL 0.7650); mean-over-run 0.7082 / 0.7140 / 0.7236; video AUC 0.8203 / 0.8083 / 0.8269 (every paired CI contains zero); eKYC threshold 0.9514, FPR 0.0500, catch 0.2298, confusion 5339 / 281 / 8318 / 2482; liveness B4 AUC 0.9829 / ACER 6.85% / APCER 2.86% / BPCER 10.83%, B4+DCT 0.9776.

---

## Slide 1 — Title
- Hybrid Spatial-Frequency Learning with Block-wise DCT for Deepfake and Liveness Detection in eKYC
- Student: Le Ngoc Thanh — Student ID 102220041 — Class 22T_KHDL
- Supervisor: Assoc. Prof. Dr. Pham Cong Thang
- Da Nang University of Science and Technology, 2026
- **Figure:** none (or school logo)
- *Speaker note:* chào hội đồng, giới thiệu đề tài 1 câu (phát hiện deepfake + liveness cho eKYC bằng học kết hợp không gian–tần số).

## Slide 2 — Problem and Motivation
- eKYC opens accounts and approves payments from a single face photo
- Two threats at the face-verification step: deepfake (synthetic face) and presentation attack (printed photo / screen replay)
- Core difficulty: generalisation — a detector must catch manipulations it never saw in training
- Regulatory driver: Circular 17/2024/TT-NHNN (biometric verification, no fixed error rate)
- **Figure:** `fig_3_2_preprocess_realfake.png` (a real vs fake face with frequency spectrum)
- *Speaker note:* nhấn "kẻ tấn công luôn dùng công cụ mới → mô hình phải tổng quát hoá", đây là vấn đề trung tâm.

## Slide 3 — Objectives and Scope
- Build a deepfake detector that generalises across datasets, plus a secondary liveness pre-filter
- Frame level on single aligned faces (no temporal/video-level modelling in the method)
- Evaluate under the public DeepfakeBench protocol: train on FaceForensics++, test on Celeb-DF-v2 (cross-dataset)
- Deliver an explainable web service with a calibrated eKYC operating point
- **Figure:** none (a short in/out-of-scope bullet box is enough)
- *Speaker note:* làm rõ phạm vi: ảnh đơn, cross-dataset là phép đo tổng quát hoá; liveness là phụ.

## Slide 4 — Core Hypothesis: traces live in the frequency domain
- Forgery traces are faint in pixels but loud in the mid and high frequency bands
- Three recurring traces: blending boundary, upsampling artifact, frequency inconsistency
- Genuine faces keep one coherent frequency signature; fakes break it
- Therefore read the image two ways: spatial and frequency, in parallel
- **Figure:** `fig_3_11_frequency.png` (mean DCT energy per band, real vs fake, with difference)
- *Speaker note:* đây là giả thuyết lõi của luận văn, mọi thiết kế sau đều bám vào nó.

## Slide 5 — Background: from 8x8 block-DCT to a compact descriptor
- 8x8 block-DCT (the JPEG grid) keeps a forgery trace local
- Zigzag scan orders the 64 coefficients low-to-high; group into 16 bands
- Per-band mean magnitude over 3 YCbCr channels gives a 48-dim descriptor, with no learnable frequency parameters
- Low (content) bands can be dropped so the branch attends to forgery bands
- **Figure:** `fig_1_3_zigzag_detailed.png` (zigzag scan to 16 bands to 48-dim vector)
- *Speaker note:* giải thích nhanh chuỗi DCT; nhấn "0 tham số học ở nhánh tần số" (rẻ, ổn định).

## Slide 6 — Proposed Method: SFDCT architecture
- Two streams meet at a gated fusion
- Spatial stream: EfficientNet-B4 backbone produces a spatial feature map F_s
- Frequency stream: block-DCT descriptor D
- Gated cross-attention fuses them, then a two-class head outputs a fake probability
- **Figure:** `fig_arch_sfdct.png` (SFDCT pipeline overview)
- *Speaker note:* đây là kiến trúc đề xuất chính (SFDCT). Hai nhánh song song, hợp nhất có cổng.

## Slide 7 — Frequency branch: the 48-dim feature design
- 16 zigzag bands x 3 YCbCr channels = 48 dimensions, log-magnitude per band
- Low bands carry identity/content; mid and high bands carry forgery traces
- Optional drop-low-band keeps only mid and high bands (used by the high-pass variant)
- **Figure:** `fig_2_dct_feature_design.png` (16 bands x 3 channels, low bands struck out)
- *Speaker note:* làm rõ vì sao bỏ band thấp = chống rò nội dung/định danh.

## Slide 8 — Key mechanism: zero-initialised gated fusion
- Spatial features query, frequency features are key/value (cross-attention)
- Context injected through a gate: F_fused = F_s + alpha . context, with alpha initialised to 0
- At init the model equals the backbone, so it cannot perform below the baseline (floor guarantee)
- The gate opens only where the frequency branch lowers the loss
- **Figure:** `fig_1_4_gate_fusion.png` (gated cross-attention fusion)
- *Speaker note:* đây là điểm mấu chốt/đóng góp: "floor guarantee" — thêm nhánh không làm tệ đi.

## Slide 9 — Improved variant: SFDCT-HFF
- Same backbone and same zero-start gate, frequency carried as a high-pass image instead of band statistics
- Low bands zeroed, inverse DCT reconstructs a high-pass residual
- A multi-scale stream plus a residual-guided attention map point the backbone to the evidence
- Difference from SFDCT is only the representation, so any gain is attributable to it
- **Figure:** `fig_arch_sfdct_hff.png` (SFDCT-HFF variant)
- *Speaker note:* biến thể mạnh nhất họ; vẫn giữ cùng gate nên so sánh công bằng.

## Slide 10 — Secondary task: liveness as a cascade pre-filter
- Liveness runs first; a spoof verdict stops the request before any deepfake compute
- Two architectures compared on the same backbone: B4 spatial-only baseline vs B4 + block-DCT proposal
- End-to-end CNN, no separate feature-engineering step
- Physical basis: replay/print attacks leave faint recapture/dot frequency traces
- **Figure:** `fig_2_b4dct_liveness.png` (B4+DCT-liveness architecture)
- *Speaker note:* nhấn liveness là phụ, tái dùng đúng nhánh tần số của deepfake (cùng floor guarantee).

## Slide 11 — Datasets and evaluation protocol
- Train: FaceForensics++ (1000 real, 4000 fake from 4 methods), moderate compression
- Test: Celeb-DF-v2 (590 real, 5639 fake), never seen in training
- 32 frames per video; about 159,600 train and 16,420 test frames
- Metric: frame-level AUC under DeepfakeBench, for direct comparison with published baselines
- **Figure:** `fig_3_1_distribution.png` (real/fake counts, train and test)
- *Speaker note:* cross-dataset = phép thử tổng quát hoá thật; theo benchmark công khai nên số có thể so sánh.

## Slide 12 — Training setup
- EfficientNet-B4 pretrained on ImageNet, fine-tuned end to end with binary cross-entropy
- Input 256 px, batch 32, Adam, 10 epochs, a single fixed seed
- Smoke-test-before-train: shape, dry run, overfit-one-batch on a local GPU, then full training on a rented GPU
- **Figure:** `fig_3_6_summary_sfdct.png` (SFDCT model summary) — optional
- *Speaker note:* nói thẳng single seed (sẽ là hạn chế ở cuối); quy trình smoke-test trước khi train tốn phí.

## Slide 13 — Main result: cross-dataset AUC
- Baseline EfficientNet-B4: 0.7497 (matches the published 0.7487, confirms a correct pipeline)
- Naive SFDCT: 0.7572 (frequency branch raises AUC, floor holds)
- SFDCT-HFF (full): 0.7695, the highest of the family
- The ordering follows the hypothesis that frequency information helps
- **Figure:** `fig_3_7_roc.png` (ROC curves, with the 5% FPR line)
- *Speaker note:* trình bày thứ tự B4 < SFDCT < HFF = đúng giả thuyết; nhưng chuẩn bị cho slide trung thực kế tiếp.

## Slide 14 — Training dynamics
- In-distribution (FaceForensics++) test AUC stays high and stable, about 0.95 to 0.97
- Only the cross-dataset (Celeb-DF-v2) AUC oscillates: this wobble is the generalisation gap, not failed optimisation
- **Figure:** `fig_3_4_v2_train_dynamics.png` (B4 and SFDCT, in-distribution vs cross-dataset)
- *Speaker note:* giải thích dao động cross-dataset là "khoảng cách tổng quát hoá", không phải lỗi train.

## Slide 15 — Honest reading of the numbers
- Gains over the baseline are small and within run-to-run noise
- Video-level bootstrap (518 videos): B4 0.8203, SFDCT 0.8083, SFDCT-HFF 0.8269; every paired interval against the baseline contains zero
- Mean over the run: 0.7082 / 0.7140 / 0.7236; best-on-test selection is optimistic
- Single seed, and SPSL (0.7650) still beats the naive SFDCT: no state-of-the-art claim
- **Figure:** `fig_3_8_pr_curve.png` (precision-recall curves) — or a small comparison table
- *Speaker note:* SLIDE QUAN TRỌNG NHẤT về liêm chính: nói thẳng chênh lệch chưa significant, single seed, không SOTA. Hội đồng đánh giá cao sự trung thực.

## Slide 16 — eKYC operating point
- Threshold calibrated to keep the false-positive rate at 5% (Circular 17 budget)
- Threshold 0.9514, measured FPR 0.0500, catch rate 0.2298 (about 23% of fakes caught)
- Confusion at 5% FPR: 5339 genuine accepted, 281 genuine rejected, 8318 fakes missed, 2482 fakes caught
- Low recall at a customer-friendly threshold is why a liveness pre-filter is composed in front
- **Figure:** `fig_3_9_confusion.png` (confusion matrix at the eKYC threshold)
- *Speaker note:* giải thích đánh đổi: giữ FPR 5% (không đuổi nhầm khách) thì chỉ bắt ~23% giả → cần cascade liveness.

## Slide 17 — Explainability and feature separation
- Grad-CAM heat map shows where the decision is made (eyes, blending boundaries)
- t-SNE projection shows the real/fake separation learned by the model
- Explanation is required for banking review, not optional
- **Figure:** `fig_3_12_gradcam.png` (Grad-CAM) — pair with `fig_3_10_tsne.png` if space allows
- *Speaker note:* nhấn explainability là yêu cầu nghiệp vụ ngân hàng (FR5), không chỉ trang trí.

## Slide 18 — Liveness results
- B4-liveness on LCC-FASD: AUC 0.9829, ACER 6.85%, APCER 2.86%, BPCER 10.83%
- B4+DCT-liveness: AUC 0.9776; the frequency branch does not beat the spatial head here either
- Consistent with the deepfake finding, reported as an honest negative
- **Figure:** `fig_3_20_roc_b4_liveness.png` (B4-liveness ROC and score distribution)
- *Speaker note:* liveness dễ hơn deepfake (AUC ~0.98); nhưng nhánh tần số vẫn không cải thiện — trung thực.

## Slide 19 — System and deployment (product)
- The detector is wrapped in an explainable, multi-tenant eKYC web platform
- Served on a single CPU instance: model about 70 MB, about 1 second per image, no GPU at serving time
- Output is a risk score with verdict bands, a Grad-CAM image, and a threshold tied to the FPR budget
- **Figure:** `screenshot_demo_image_detect.png` (the result screen) — or `fig_4_deployment.png`
- *Speaker note:* 1 slide cho thấy sản phẩm chạy thật; nói nhanh, đây là phần phụ trợ.

## Slide 20 — Conclusion, limitations, future work
- Contribution: a spatial-frequency detector with a floor guarantee, evaluated honestly cross-dataset
- Findings: the frequency branch raises cross-dataset AUC in the right order, but the gains are within noise at a single seed and are not state of the art
- Liveness reuses the same design and is measured independently (AUC 0.98, ACER 6.85%)
- Limitations: single seed, small margins; Future: multi-seed significance tests, Vietnamese-face calibration, video-level aggregation
- **Figure:** none (a short contributions / limitations / future box)
- *Speaker note:* kết bằng đóng góp + trung thực về hạn chế; mở hướng multi-seed và mặt người Việt.

---

### Time budget (about 18 minutes)
- Slides 1-3 (intro/scope): ~2 min
- Slides 4-5 (background): ~2 min
- Slides 6-10 (method, the core): ~6 min
- Slides 11-12 (data/setup): ~1.5 min
- Slides 13-18 (results): ~5 min
- Slides 19-20 (system + conclusion): ~1.5 min

### Likely committee questions
- Why is the cross-dataset gain so small? (answer: cross-dataset is hard; gains within noise; honest, not over-claimed)
- Is 0.7695 reliable given the curve peaks at 0.7551? (answer: 0.7695 is the saved best checkpoint from twice-per-epoch evaluation, verified from the checkpoint; 0.7551 is the epoch-end peak of the recoverable points)
- Why does the frequency branch not help liveness? (answer: honest negative; the recapture trace helps replay more than print)
- Why single seed? (answer: rented-GPU cost; multi-seed is stated future work)
- Why low recall at the eKYC threshold? (answer: 5% FPR budget forces a high threshold; the liveness cascade compensates)
