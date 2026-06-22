# Nội dung slide bảo vệ — SFDCT (bản hoàn thiện để dựng pptx)

> Trục: **đồ án so sánh–đánh giá** (không phải "phát minh model thắng SOTA"). Bullet trên slide = tiếng Anh (khớp deck);
> `[ẢNH: tên_file — mô tả]` = chỗ chèn hình (file ở `report/figures/`); *Ý nói* = gợi ý lời nói tiếng Việt.
> Số liệu KHOÁ: best-frame B4 0.7497 / SFDCT 0.7572 / SFDCT-HFF 0.7695 (best-checkpoint) · công bố 0.7487 · SPSL 0.7650 ·
> mean-over-run 0.7082 / 0.7140 / 0.7236 · video: mọi paired CI vs baseline chứa 0 · gate mean|α|≈1.5×10⁻⁴, peak 0.0232, 44/1792 kênh ·
> liveness B4 0.9829 (ACER 6.85%) / B4+DCT 0.9776 · FPR 5% → catch ~23% · CPU ~1s/ảnh.
> Quy ước: thứ tự B4<SFDCT<HFF luôn kèm "frame level"; 0.7695 kèm "best-checkpoint". KHÔNG dùng từ "trung thực".

---

### Slide 1 — Title
[ẢNH: logo trường (template), không cần figure]
- Hybrid Spatial–Frequency Block-DCT for Deepfake & Liveness Detection in eKYC
- Le Ngoc Thanh · 102220041 · 22T_KHDL · Computer Science & AI
- Advisor: Assoc. Prof. Dr. Pham Cong Thang — DUT, 2026
- *Ý nói:* chào hội đồng, một câu giới thiệu đề tài.

### Slide 2 — [Divider] PART 1 · Introduction
- *Ý nói:* "Phần 1 — đặt vấn đề: vì sao phát hiện deepfake trong eKYC lại khó."

### Slide 3 — Problem & the Generalisation Gap
[ẢNH: fig_3_2_preprocess_realfake.png — mặt thật vs giả + phổ tần, gần như giống nhau bằng mắt]
- eKYC verifies identity from a single face photo — the lock on the first door to banking.
- Two threats at that step: deepfake (GAN face-swap / synthesis) and presentation attack (print, screen replay).
- Regulatory driver: Circular 17/2024/TT-NHNN mandates biometric checks (fixes no error rate — left to the designer).
- Core difficulty — the **generalisation gap**: a detector trained on one forgery family collapses on families it never saw.
- *Ý nói:* nhấn "kẻ tấn công luôn dùng công cụ mới → mô hình phải tổng quát hoá", dẫn sang phép đo cross-dataset.

### Slide 4 — Objectives & Scope  ⭐ (trục so sánh–đánh giá)
[ẢNH: không cần — bảng/cột mục tiêu]
- **Main goal — a disciplined comparison:** evaluate spatial vs spatial+frequency deepfake detection under an honest cross-dataset protocol (train FF++, test Celeb-DF-v2).
- Design a **fair, safe fusion mechanism** (zero-init gate) so the frequency branch can be compared without changing the starting point.
- Build an **explainable eKYC system** (web + Grad-CAM heat-map + liveness pre-filter), runnable on CPU.
- **Report results as measured** — frame & video level, with bootstrap confidence intervals — including inconvenient outcomes.
- Scope: frame-level on aligned faces; no temporal/video modelling in the method.
- *Ý nói:* "Mục tiêu của em không phải tạo model thắng SOTA, mà **so sánh–đánh giá** có kỷ luật rồi rút kết luận có cơ sở."

### Slide 5 — [Divider] PART 2 · Methodology
- *Ý nói:* "Phần 2 — các hướng em so sánh và cơ chế để so sánh công bằng."

### Slide 6 — The Frequency Hypothesis: Three Forgery Traces
[ẢNH: fig_3_11_frequency.png — mean DCT energy per band, real vs fake (đỉnh dải giữa/cao)]
- Forgery traces are faint in pixels but stand out in the mid/high frequency bands.
- **Blending boundary** — a face-swap seam, visible in mid-frequency DCT bands.
- **Upsampling artifact** — GAN upsampling layers leave periodic peaks in high bands.
- **Frequency inconsistency** — a spliced/synthesised face breaks the camera's coherent spectrum.
- → Motivation for reading the image two ways: spatial **and** frequency.
- *Ý nói:* giả thuyết lõi — lúc bắt đầu, literature (F3Net, SPSL, FAD) cho thấy đây là hướng đáng kiểm.

### Slide 7 — Block-DCT Descriptor (48-D)
[ẢNH: fig_1_3_zigzag_detailed.png — zigzag scan → 16 band → vector 48-D]
- 8×8 block-DCT on the JPEG grid keeps a forgery trace local.
- Zigzag-order the 64 coefficients low→high, group into 16 bands.
- Per-band mean magnitude over 3 YCbCr channels → **48-dim descriptor, zero learnable frequency parameters** (cheap, stable).
- Low (content) bands can be dropped so the branch attends to forgery bands.
- *Ý nói:* "đặc trưng tần số cố định, rẻ, diễn giải được theo từng dải — không phải hộp đen."

### Slide 8 — Two-Stream SFDCT Architecture
[ẢNH: fig_sfdct_architecture_final.png — sơ đồ 2 nhánh đầy đủ: spatial B4 + block-DCT → gated fusion → head]
- Spatial stream: EfficientNet-B4 → feature map Fₛ (reads pixels).
- Frequency stream: 8×8 block-DCT → 48-D descriptor (no learnable frequency params).
- Merged by a **gated cross-attention**, then a two-class head → fake probability + Grad-CAM.
- One 256×256 MTCNN-aligned face feeds both streams in parallel.
- *Ý nói:* "Em giữ nguyên backbone B4 đã kiểm chứng và gắn thêm nhánh tần số chạy song song — đây là *cách kết hợp*, không thay backbone."

### Slide 9 — Zero-Init Gated Fusion (the fair-comparison mechanism)
[ẢNH: fig_1_4_gate_fusion.png — sơ đồ gated cross-attention] · [ẢNH: fig_3_13_gate_alpha.png — phân phối gate α sau train]
- Query = spatial Fₛ; Key/Value = block-DCT descriptor (selective, not flat concat).
- `F_fused = Fₛ + α·context`, with the gate **α initialised to 0** → at init the model equals the proven backbone.
- This makes the comparison **fair**: any difference is attributable to the frequency branch, not a different start point. (Floor holds at initialisation.)
- The learned gate is also a **meter**: mean |α| ≈ 1.5×10⁻⁴ (near 0, not 0), peak |α| = 0.0232, only 44/1792 channels open.
- *Ý nói:* "Zero-init không phải learning rate — đây là kỹ thuật residual gating (ReZero/LayerScale) để so sánh công bằng + đo đóng góp tần số."

### Slide 10 — Forgery Footprints — FF++  *(có thể gộp vào Slide 6 nếu cần rút)*
[ẢNH: fig_ff_manipulations.png — lưới các kiểu giả mạo FF++ (real + Deepfakes/Face2Face/FaceSwap/NeuralTextures) ở pixel & DCT]
- Columns = FF++ types: real, Deepfakes, Face2Face, FaceSwap, NeuralTextures.
- RGB row: forgeries look clean to the eye.
- DCT log-spectrum row: fakes add structured mid/high-band energy.
- → The cue *exists*; the question this thesis tests is whether a fixed block-DCT branch can use it across datasets.
- *Ý nói:* "vết giả mạo có thật trong tần số — nhưng có khai thác được khi đổi dataset không lại là chuyện phải kiểm."

### Slide 11 — SFDCT-HFF Variant (high-pass)  *(part of the comparison)*
[ẢNH: fig_arch_sfdct_hff.png — kiến trúc HFF] · [ẢNH (phụ): fig_hff_residual.png — ảnh residual cao tần]
- Same backbone, same zero-init gate; only the **frequency carrier** changes.
- Frequency = high-pass residual (zero low DCT bands → inverse DCT); a multi-scale stream + residual-guided attention.
- A second point on the comparison curve, not a separate product.
- *Ý nói:* "HFF là một biến thể nữa trong cuộc so sánh — đổi cách biểu diễn tần số, giữ mọi thứ khác cố định."

### Slide 12 — Liveness Pre-Filter (B4) + eKYC Cascade  *(reframed — system component)*
[ẢNH: fig_2_b4_liveness.png — kiến trúc B4-liveness] · [ẢNH: fig_3_20_roc_b4_liveness.png — ROC + score distribution (tách sạch)]
- eKYC needs a presentation-attack filter → **B4-liveness** runs first in the cascade; a spoof verdict stops the request before deepfake compute.
- Strong working pre-filter: **AUC 0.9829, ACER 6.85%** on LCC-FASD (official train/dev/eval split, threshold fixed on dev), above light-net baselines (~0.92).
- Reuse-and-test note: the same block-DCT branch was tried here; it did **not** transfer (0.9776) — consistent with the deepfake finding. Reported, not sold.
- *Ý nói:* "Liveness là *thành phần hệ thống* (pre-filter mạnh, AUC 0.98). Nhánh tần số chỉ là một dòng kiểm chứng — artifact spoof khác artifact deepfake nên không kỳ vọng nó giúp."

### Slide 13 — [Divider] PART 3 · Experiments & Results
- *Ý nói:* "Phần 3 — phép đo và kết quả so sánh."

### Slide 14 — Cross-Dataset Protocol & Setup  *(có thể gộp vào Slide 15)*
[ẢNH: fig_3_1_distribution.png — phân bố dữ liệu / hoặc bảng protocol]
- Public **DeepfakeBench** protocol: train FaceForensics++ (c23), test Celeb-DF-v2 — the test set is never seen in training.
- 32 frames/video, fixed across configs; metric = frame-level AUC (threshold-free) + video-level bootstrap (518 clips, 2000×).
- **Sanity check:** B4 baseline AUC 0.7497 reproduces the published 0.7487 (≈0.001) → the pipeline is correct, so every later change is attributable to design.
- *Ý nói:* "tái lập đúng số công bố làm control — đây là điều kiện để so sánh có nghĩa."

### Slide 15 — Cross-Dataset Results: the Comparison  ⭐
[ẢNH: fig_3_7_roc.png — ROC 3 mô hình trên Celeb-DF-v2 (đường sát nhau)]
| Model | frame AUC (best) | mean-over-run | video AUC | paired diff vs B4 (video) |
|---|---|---|---|---|
| B4 (spatial) | 0.7497 | 0.7082 | 0.8203 | — |
| SFDCT | 0.7572 | 0.7140 | 0.8083 | −0.012 [−0.044,+0.021] |
| SFDCT-HFF | 0.7695 | 0.7236 | 0.8269 | +0.007 [−0.022,+0.037] |
| SPSL (published freq.) | 0.7650 | — | — | — |
- At **frame level** the order follows the hypothesis: B4 < SFDCT < SFDCT-HFF; HFF (best-checkpoint 0.7695) edges the SPSL reference (0.7650).
- At **video level**, every paired CI vs the baseline **contains zero** → no variant separates with significance at a single seed.
- *Ý nói:* "đọc cả best lẫn mean lẫn video — đúng hướng ở frame, nhưng chưa đủ ý nghĩa thống kê. Em nói đúng như đo."

### Slide 16 — What the Comparison Shows  ⭐ (honest reading + mechanism finding)
[ẢNH: fig_3_10_tsne.png — t-SNE feature (tách nhẹ hơn)] *(hoặc fig_3_8_pr_curve.png)*
- **Order follows the hypothesis** at frame level; the zero-init floor holds for every variant.
- **Small, not SOTA:** gains sit inside single-seed noise; video-level CIs include zero.
- **Identified the condition where frequency is *not* enough:** on compressed c23 data the high bands are erased — measured directly by the gate (mean |α| ≈ 1.5×10⁻⁴, peak 0.0232). *(phát hiện, không phải lời thú nhận)*
- **Operating point:** at 5% false-positive rate the detector catches ~23% of deepfakes (frame level) — a screening layer with explanation, not a standalone gate.
- *Ý nói:* "đây là kết quả phân tích: em xác định được *khi nào* nhánh tần số không đủ và *vì sao* — đó là kiến thức cho người sau."

### Slide 17 — Explainability — Grad-CAM
[ẢNH: fig_3_12_gradcam.png — input (fake) + bản đồ nhiệt Grad-CAM tô vùng nghi]
- Every verdict ships with a fake probability **and** a Grad-CAM heat-map.
- Heat concentrates on blended/forged regions → the operator sees *why* the system flagged.
- Output is a risk signal with visual evidence for human review, not a black-box score.
- *Ý nói:* "trong duyệt eKYC, người vận hành cần biết VÌ SAO hệ thống nghi — Grad-CAM cho họ điều đó."

### Slide 18 — System & Demo (the eKYC platform)  ⭐ [SLIDE MỚI]
[ẢNH: fig_2_2_architecture.png — kiến trúc hệ thống] · [ẢNH: fig_2_1_usecase.png — use case 6 actor] · [ẢNH: screenshot_demo_image_detect.png — UI demo]
- Multi-tenant eKYC platform: frontend + backend API + AI inference service + monitoring; six actors, RBAC.
- Pipeline: MTCNN crop → **liveness pre-filter** → deepfake detector → verdict + Grad-CAM, stored as evidence (S3) with metrics/logs (CloudWatch).
- Runs on CPU, ~1 s/image; deployed as services (Docker).
- *(Demo trực tiếp nếu kịp; nếu không, dùng screenshot.)*
- *Ý nói:* "đây là hệ thống chạy thật — đóng góp kỹ thuật đứng độc lập với việc tần số giúp nhiều hay ít."

### Slide 19 — [Divider] PART 4 · Conclusion
- *Ý nói:* "Phần 4 — kết luận và hướng phát triển."

### Slide 20 — Conclusion, Contributions & Future
[ẢNH: không cần — 3 cột]
- **Contributions:** (1) a disciplined cross-dataset comparison (B4/SFDCT/HFF vs SPSL, multi-metric, baseline reproduced); (2) a zero-init gate enabling a fair comparison and measuring the frequency contribution; (3) a mechanistic explanation of when/why the frequency branch is not enough on compressed data; (4) an explainable CPU eKYC system.
- **Limitations:** single seed per config; gains within noise; liveness is single-dataset (cross-dataset liveness = future); train/serving crop mismatch.
- **Future work:** multi-seed paired tests; cross-dataset liveness; self-blended training with the frequency branch; wire the liveness scorer into the live cascade.
- *Ý nói (nếu thầy hỏi "sao chọn đề tài đóng góp nhỏ"):* "Lúc bắt đầu đây là câu hỏi mở được literature cho là hứa hẹn; em trả lời nó nghiêm túc, kể cả phần bất tiện, và **giải thích được vì sao**. Một câu trả lời có cơ sở cho câu hỏi đáng hỏi, kèm hệ thống chạy được, là giá trị của đồ án cử nhân."

### Slide 21 — Thank You / Q & A
[ẢNH: không cần]
- Thank you — questions & discussion.

---

## Ghi chú dựng pptx
- Tổng ~21 slide (gồm 4 divider + title + thanks). Muốn rút ~12 phút: gộp **Slide 10→6** và **Slide 14→15** (còn ~19).
- Hình system/demo (Slide 18) lấy từ `report/figures/`: `fig_2_1_usecase`, `fig_2_2_architecture`, `fig_4_deployment`, `screenshot_demo_image_detect`.
- Mọi số phải khớp khối KHOÁ ở đầu file; gate-α dùng bản mean|α|≈1.5×10⁻⁴ (đồng bộ với script + committee doc).
