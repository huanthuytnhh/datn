# Nội dung slide bảo vệ: bám bố cục mẫu `MauDoAnSlide.pptx` (VKU)

> Mẫu VKU đi theo 5 mục đánh số: **1. Overview · 2. Project Goals · 3. System Analysis and Design ·
> 4. Dataset Design And Model Training · 5. Application Development**. Mục 4 chiếm phần lớn slide:
> mỗi "model" trình bày theo nhịp *Dataset → Kiến trúc → Kết quả train*. Tôi map đồ án deepfake vào đúng nhịp đó.
>
> Quy ước file: bullet trên slide = **tiếng Anh** (khớp mẫu) · `[ẢNH: tên_file | mô tả]` = chỗ chèn hình
> (ở `report/figures/`) · *Ý nói* = gợi ý lời nói tiếng Việt.
>
> **SỐ LIỆU KHOÁ** (không đổi): cross-dataset (train FF++ c23 → test Celeb-DF-v2) frame-AUC best-checkpoint
> B4 0.7497 / SFDCT 0.7572 / SFDCT-HFF 0.7695 · công bố B4 0.7487 · SPSL 0.7650 · mean-over-run 0.7082/0.7140/0.7236 ·
> video-AUC 0.8203/0.8083/0.8269, **mọi paired CI vs baseline chứa 0** (518 clip, bootstrap 2000×, 32 frame/clip) ·
> gate mean|α|≈1.5×10⁻⁴, peak 0.0232, 44/1792 kênh mở · @FPR 5% bắt ~23% deepfake (frame) ·
> liveness LCC-FASD eval: B4 AUC **0.9829** ACER 6.85% / B4+DCT 0.9776 ACER 7.54% (split chính thức train1223/7076,
> dev405/2543, eval314/7266; ngưỡng chốt ở EER của dev) · CPU ~1 s/ảnh.
> Quy ước phát biểu: thứ tự B4<SFDCT<HFF **luôn kèm "frame level"**; 0.7695 **luôn kèm "best-checkpoint"**.

---

## Slide 0: Title (trang bìa, dùng template trường)
[ẢNH: logo VKU/DUT của template, không cần figure]
- **Hybrid Spatial–Frequency Block-DCT for Deepfake & Liveness Detection in eKYC**
- Le Ngoc Thanh · 102220041 · 22T_KHDL · Computer Science & AI
- Advisor: Assoc. Prof. Dr. Pham Cong Thang, DUT, 2026
- *Ý nói:* chào hội đồng, một câu giới thiệu tên đề tài và mục tiêu chung.

---

## 1. Overview

### Slide 1: Overview – the problem
[ẢNH: fig_3_2_preprocess_realfake.png | mặt thật vs giả + phổ tần gần như giống nhau bằng mắt]
- eKYC verifies identity from a single face photo, acting as the first door to digital banking.
- Two threats at that door: **deepfake** (GAN face-swap / synthesis) and **presentation attack** (printed photo, screen replay).
- Regulatory driver: Circular 17/2024/TT-NHNN mandates biometric checks (no error rate prescribed, left to the designer).
- The hard part, the **generalisation gap**: a detector trained on one forgery family collapses on families it never saw.
- → Building a deepfake + liveness defence that still works on *unseen* forgeries.
- *Ý nói:* "Kẻ tấn công luôn dùng công cụ sinh ảnh mới, nên mô hình phải tổng quát hoá. Đây là lý do đề tài đo bằng *cross-dataset*."

---

## 2. Project Goals

### Slide 2: Project Goals
[ẢNH: không cần, 4 mục tiêu dạng cột/icon]
- **A disciplined comparison**: spatial vs spatial+frequency deepfake detection under an honest cross-dataset protocol (train FF++, test Celeb-DF-v2).
- **A fair, safe fusion mechanism** (zero-init gate) so the frequency branch is compared without changing the starting point.
- **An explainable eKYC system**: web + backend API + Grad-CAM heat-map + liveness pre-filter, runnable on CPU.
- **Results reported as measured**: frame & video level, with bootstrap confidence intervals, including inconvenient outcomes.
- *Ý nói:* "Mục tiêu không phải tạo model thắng SOTA, mà **so sánh – đánh giá** có kỷ luật rồi rút kết luận có cơ sở, đúng yêu cầu một đồ án cử nhân."

---

## 3. System Analysis and Design

### Slide 3: System components & actors
[ẢNH: fig_2_2_architecture.png | kiến trúc 4 lớp] · [ẢNH: fig_2_1_usecase.png | use-case 6 actor]
- Multi-tenant eKYC platform, four layers: **frontend (Next.js) · backend API (FastAPI) · AI inference service · monitoring**.
- Six actors with role-based access control (RBAC): admin, tenant, operator, developer, end-user, auditor.
- Each verdict is stored as **evidence** (S3) with metrics and logs (CloudWatch) for audit.
- *Ý nói:* "Hệ thống chạy thật, đa người thuê (multi-tenant). Phần này cho thấy đóng góp kỹ thuật của em đứng độc lập với chuyện tần số giúp nhiều hay ít."

### Slide 4: eKYC processing flow (the cascade)
[ẢNH: fig_2_4_activity_ekyc.png | activity diagram eKYC] · [ẢNH (phụ): fig_4_deployment.png | sơ đồ triển khai]
- Pipeline per request: **MTCNN face crop → liveness pre-filter → deepfake detector → verdict + Grad-CAM**.
- **Cascade logic:** liveness runs *first*; a spoof verdict stops the request before any deepfake compute (cheap filter ahead of the heavier model).
- Single 256×256 aligned face; whole pipeline runs on **CPU, ~1 s/image**; services packaged with Docker.
- *Ý nói:* "Liveness đặt trước như bộ lọc rẻ, chặn ảnh phát lại/ảnh in sớm. Deepfake là tầng sau, nặng hơn."

---

## 4. Dataset Design And Model Training

> *Model A = Deepfake detector (SFDCT). Model B = Liveness pre-filter. Theo đúng nhịp mẫu: dataset → kiến trúc → kết quả.*

### Slide 5: [Model A · Deepfake] Datasets & cross-dataset protocol
[ẢNH: fig_ff_manipulations.png | lưới FF++: real + 4 kiểu giả mạo ở pixel & DCT] · [ẢNH (phụ): fig_3_1_distribution.png | phân bố dữ liệu]
- **Train:** FaceForensics++ (c23, moderate compression), real + four manipulation families (Deepfakes, Face2Face, FaceSwap, NeuralTextures).
- **Test:** Celeb-DF-v2, **never seen in training** (the public DeepfakeBench cross-dataset protocol).
- 32 frames/video, fixed across all configs; metric = frame-level AUC (threshold-free) + video-level bootstrap (518 clips, 2000×).
- **Sanity control:** B4 baseline AUC **0.7497** reproduces the published **0.7487** (≈0.001) → pipeline is correct, so every later change is attributable to design.
- *Ý nói:* "Em test trên một bộ HOÀN TOÀN khác bộ train, đây là phép đo khó và công bằng. Tái lập đúng số công bố là điều kiện để so sánh có nghĩa."

### Slide 6: [Model A] The frequency hypothesis – three forgery traces
[ẢNH: fig_3_11_frequency.png | mean DCT energy per band, real vs fake] · [ẢNH (tuần tự): fig_trace3_freqinconsist_ffceleb.png | Δ(fake−real) đo trên FF++ & Celeb]
- Forgery traces are faint in pixels but live in the **mid/high frequency bands**.
- **Blending boundary**: a face-swap seam shows in mid-frequency DCT.
- **Upsampling artifact**: GAN upsampling leaves periodic high-band peaks.
- **Frequency inconsistency**: a spliced/synthesised face breaks the camera's coherent spectrum.
- → Motivation to read the image two ways: spatial **and** frequency.
- *Ý nói:* "Đây là giả thuyết lõi. Lúc bắt đầu, literature (F3-Net, SPSL, FAD) cho thấy hướng tần số đáng kiểm tra. Hình thứ hai là vết em ĐO được trên dữ liệu thật, bàn kỹ ở slide kết quả."

### Slide 7: [Model A] Block-DCT descriptor (48-D)
[ẢNH: fig_1_3_zigzag_detailed.png | zigzag scan 8×8 → 16 band → vector 48-D]
- 8×8 block-DCT on the JPEG grid keeps a forgery trace local.
- Zigzag-order the 64 coefficients low→high, group into **16 bands**.
- Per-band mean magnitude over 3 YCbCr channels → **48-D descriptor, zero learnable frequency parameters** (cheap, stable, interpretable per band).
- Low (content) bands can be dropped so the branch attends to forgery bands.
- *Ý nói:* "Đặc trưng tần số CỐ ĐỊNH, rẻ, diễn giải được theo từng dải, không phải hộp đen, không thêm tham số học cho phần tần số."

### Slide 8: [Model A] Two-stream SFDCT architecture
[ẢNH: fig_sfdct_architecture_final.png | sơ đồ 2 nhánh: spatial B4 + block-DCT → gated fusion → head]
- **Spatial stream:** EfficientNet-B4 → feature map Fₛ (reads pixels).
- **Frequency stream:** 8×8 block-DCT → 48-D descriptor (no learnable frequency params).
- Merged by a **gated cross-attention**, then a two-class head → fake probability + Grad-CAM.
- One 256×256 MTCNN-aligned face feeds both streams in parallel.
- *Ý nói:* "Em GIỮ NGUYÊN backbone B4 đã kiểm chứng và gắn thêm nhánh tần số chạy song song. Đây là cách *kết hợp*, không thay backbone, để so sánh sạch."

### Slide 9: [Model A] Zero-init gated fusion (the fair-comparison mechanism)
[ẢNH: fig_1_4_gate_fusion.png | sơ đồ gated cross-attention] · [ẢNH (tuần tự): fig_3_13_gate_alpha.png | phân phối gate α sau train]
- Query = spatial Fₛ; Key/Value = block-DCT descriptor (selective, not flat concat).
- `F_fused = Fₛ + α·context`, with the gate **α initialised to 0** → at init the model *equals* the proven backbone.
- This makes the comparison **fair**: any difference is attributable to the frequency branch, not a different start point.
- The learned gate is also a **meter**: mean |α| ≈ 1.5×10⁻⁴ (near 0, not 0), peak |α| = 0.0232, only 44/1792 channels open.
- *Ý nói:* "Zero-init KHÔNG phải learning rate, đây là residual gating (ReZero/LayerScale). Nó vừa cho so sánh công bằng, vừa là *cái cân* đo đóng góp tần số."

### Slide 10: [Model A] SFDCT-HFF variant (high-pass carrier)
[ẢNH: fig_arch_sfdct_hff.png | kiến trúc HFF] · [ẢNH (phụ): fig_hff_residual.png | ảnh residual cao tần]
- Same backbone, same zero-init gate; only the **frequency carrier** changes.
- Frequency = high-pass residual (zero low DCT bands → inverse DCT) → a multi-scale stream + residual-guided attention.
- A second point on the comparison curve, not a separate product.
- *Ý nói:* "HFF là một biến thể nữa trong cuộc so sánh, đổi cách biểu diễn tần số, giữ mọi thứ khác cố định."

### Slide 11: [Model A] Training & cross-dataset results ⭐
[ẢNH: fig_3_7_roc.png | ROC 3 mô hình trên Celeb-DF-v2 (đường sát nhau)] · [ẢNH (phụ): fig_3_4_v2_train_dynamics.png | train dynamics]

| Model | frame AUC (best) | mean-over-run | video AUC | paired diff vs B4 (video) |
|---|---|---|---|---|
| B4 (spatial) | 0.7497 | 0.7082 | 0.8203 | (baseline) |
| SFDCT | 0.7572 | 0.7140 | 0.8083 | −0.012 [−0.044, +0.021] |
| SFDCT-HFF | 0.7695 | 0.7236 | 0.8269 | +0.007 [−0.022, +0.037] |
| SPSL (published freq.) | 0.7650 | n/a | n/a | n/a |

- At **frame level** the order follows the hypothesis: B4 < SFDCT < SFDCT-HFF; HFF (best-checkpoint 0.7695) edges the SPSL reference (0.7650).
- At **video level**, every paired CI vs the baseline **contains zero** → no variant separates with significance at a single seed.
- *Ý nói:* "Em đọc cả best, mean lẫn video, đúng hướng ở frame, nhưng chưa đủ ý nghĩa thống kê ở video. Em nói đúng như đo, không tô."

### Slide 12: [Model A] What the comparison shows (analysis) ⭐
[ẢNH: fig_3_10_tsne.png | t-SNE feature (tách nhẹ hơn)] · [ẢNH (phụ): fig_3_9_confusion.png | confusion @FPR 5%]
- **Order follows the hypothesis** at frame level; the zero-init floor holds for every variant.
- **Small, not SOTA:** gains sit inside single-seed noise; video-level CIs include zero.
- **Identified *when* frequency is not enough:** under c23 compression the high bands are erased, measured directly by the gate (mean |α| ≈ 1.5×10⁻⁴, peak 0.0232).
- **Operating point:** at 5% false-positive rate the detector catches ~23% of deepfakes (frame level), a screening layer with explanation, not a standalone gate.
- *Ý nói:* "Đây là kết quả phân tích: em xác định được *khi nào* nhánh tần số không đủ và *vì sao* (nén c23 xoá dải cao), đó là kiến thức cho người làm sau."

### Slide 13: [Model A] Explainability: Grad-CAM
[ẢNH: fig_3_12_gradcam.png | input fake + bản đồ nhiệt Grad-CAM tô vùng nghi]
- Every verdict ships with a fake probability **and** a Grad-CAM heat-map.
- Heat concentrates on blended/forged regions → the operator sees *why* the system flagged.
- Output = a risk signal with visual evidence for human review, not a black-box score.
- *Ý nói:* "Trong duyệt eKYC, người vận hành cần biết VÌ SAO hệ thống nghi. Grad-CAM cho họ điều đó."

### Slide 14: [Model B · Liveness] Dataset (LCC-FASD)
[ẢNH: fig_3_17_liveness.png | ví dụ live vs spoof crop (cùng cách crop với deepfake)]
- Presentation-attack detection = the **secondary task**; reuses the SFDCT machinery so spatial vs spatial+frequency is tested again at almost no extra cost.
- **LCC-FASD, official three-way split:** train 1223 live / 7076 spoof · dev 405 / 2543 · eval 314 / 7266.
- Threshold fixed at the **dev equal-error point**, never tuned on eval; metrics = ISO/IEC 30107-3 (APCER / BPCER / ACER).
- Same cropping convention as the deepfake task → that is what makes the reuse possible.
- *Ý nói:* "Liveness dùng đúng split chính thức 3 phần, ngưỡng chốt ở dev. Cơ sở vật lý: replay để lại đỉnh re-capture, print để lại vân chấm, mờ trong pixel, lộ trong tần số."

### Slide 15: [Model B] Models & results
[ẢNH: fig_2_b4_liveness.png | kiến trúc B4-liveness] · [ẢNH (tuần tự): fig_3_20_roc_b4_liveness.png | ROC + score-distribution tách sạch]

| Model | AUC | ACER | APCER | BPCER |
|---|---|---|---|---|
| B4-liveness | **0.9829** | 6.85% | 2.86% | 10.83% |
| B4+DCT-liveness | 0.9776 | 7.54% | 4.25% | 10.83% |

- Strong working pre-filter: **AUC 0.9829, ACER 6.85%**, well above light-net baselines on this set (~0.92 AUC, ~16% ACER).
- The block-DCT branch was tried here too; it did **not** improve (0.9776), the **same conclusion** as the deepfake task, on a second problem.
- Caveat: train+test both LCC-FASD → cross-dataset liveness is future work; eval rests on only 314 genuine images, so the 0.005 gap is within noise.
- *Ý nói:* "Detector mạnh tuyệt đối (AUC 0.98). Và đúng như bên deepfake, thêm nhánh tần số KHÔNG vượt spatial. Chính sự lặp lại kết luận ở bài toán thứ hai làm em tin đó là quy luật, không phải may rủi một lần."

---

## 5. Application Development

### Slide 16: DeepGuard application & demo ⭐
[ẢNH: screenshot_demo_image_detect.png | màn deepfake detection 4 thành phần] · [ẢNH (tuần tự): fig_3_12_gradcam.png | heat-map] · [ẢNH (phụ): fig_2_2_architecture.png]
- Deepfake-detection screen renders four explainability components together: **risk score (0–100 + verdict band) · Grad-CAM heat-map · frequency spectrum · detection history**.
- Liveness screen = front end for the cascade pre-filter: face capture → live/spoof verdict + confidence + attack type.
- Developer API-keys screen issues keys an external customer backend uses to call the detection endpoint (multi-tenant).
- *(Demo trực tiếp nếu kịp; nếu không, dùng screenshot tuần tự.)*
- *Ý nói:* "Đây là sản phẩm chạy thật, đầu ra giải thích được. Đóng góp hệ thống đứng độc lập với việc nhánh tần số giúp nhiều hay ít."

---

## Conclusion (chuẩn cho mọi buổi bảo vệ; mẫu VKU dừng ở mục 5, nhưng nên thêm)

### Slide 17: Conclusion & contributions
[ẢNH: không cần, 4 đóng góp dạng cột]
- **(1)** A disciplined cross-dataset comparison (B4 / SFDCT / HFF vs SPSL, multi-metric, baseline reproduced).
- **(2)** A **zero-init gate** that enables a fair comparison *and* measures the frequency contribution.
- **(3)** A mechanistic explanation of *when & why* the frequency branch is not enough on compressed data.
- **(4)** An explainable, CPU-runnable eKYC system with a liveness cascade.
- **Limitations:** single seed per config; gains within noise; liveness single-dataset; train/serving crop mismatch.
- *Ý nói (nếu thầy hỏi "đóng góp nhỏ sao chọn đề tài này"):* "Lúc bắt đầu đây là câu hỏi mở được literature cho là hứa hẹn. Em trả lời nó nghiêm túc, kể cả phần bất tiện, và *giải thích được vì sao*. Một câu trả lời có cơ sở cho câu hỏi đáng hỏi, kèm hệ thống chạy được, là giá trị của đồ án cử nhân."

### Slide 18: Future work & Thank you / Q&A
[ẢNH: không cần]
- **Future work:** multi-seed paired tests · cross-dataset liveness (NUAA) · self-blended training with the frequency branch · wire the liveness scorer into the live cascade endpoint.
- **Thank you. Questions & discussion.**

---

## Ghi chú dựng pptx
- Tổng **~19 slide** (title + 16 nội dung + conclusion + thanks) → khít 11–12 phút theo mật độ mẫu VKU.
- Khác mẫu VKU một điểm: mẫu dừng ở "5. Application Development"; mình thêm Conclusion + Q&A (chuẩn mọi buổi bảo vệ).
- Muốn rút ngắn hơn: gộp **Slide 6→7** (giả thuyết + descriptor) và **Slide 14→15** (liveness dataset + model) → còn ~17.
- Mọi số phải khớp khối **SỐ LIỆU KHOÁ** ở đầu file; gate-α dùng bản mean|α|≈1.5×10⁻⁴ (đồng bộ với kịch bản nói + committee doc).
- Hình tuần tự ("[ẢNH (tuần tự)…]") = click hiện lần lượt trong CÙNG một slide, đúng ý "1 slide 2–3 hình".
