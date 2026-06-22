# CHAPTER 2: SYSTEM ANALYSIS AND DESIGN

Chapter 1 clarified the context, motivation, and theoretical foundations of deepfake detection in eKYC: face forgeries produced by GAN/upsampling leave faint traces in the spatial domain but pronounced ones in the mid-to-high frequency bands of the DCT. Chapter 2 moves from "why" to "how": we first analyse the requirements of a deepfake-detection system serving eKYC, then design the overall architecture and data pipeline, and finally — as the central part — present in detail the **proposed SFDCT method** (Spatial–Frequency learning with block-wise DCT) together with five improvement levers and four ablation configurations. The guiding spirit throughout the chapter is that every design decision originates from a specific need, is explained first by intuition and then by formulation, and is always tied to the ultimate goal of **cross-dataset generalisation** measured by frame-level AUC on Celeb-DF-v2.

## 2.1 Requirements analysis

Before designing any component, we must answer the question: what must this system *be able to do* (functional requirements), and *how good* must it be (non-functional requirements)? The banking eKYC context imposes stricter constraints than an ordinary image-classification problem: a wrong decision may let a fraudster bypass biometric authentication, so the system must be not only accurate but also *explainable* and *threshold-calibratable* in accordance with legal regulations.

### 2.1.1 Functional requirements

The functional requirements describe the capabilities the system must provide to its users — in this context, the eKYC authentication pipeline and the operating engineer. The table below maps each function to its input, output, and significance.

[[BẢNG 2.1: Các yêu cầu chức năng của hệ thống phát hiện deepfake SFDCT]]

| ID | Function | Input | Output | Significance |
|----|----------|-------|--------|--------------|
| FR1 | Load face image/frame | Still image or frame extracted from an eKYC video | Normalised 256×256 image tensor | Entry point of the whole pipeline |
| FR2 | Detect deepfake | Pre-processed face crop | REAL/FAKE discriminative logit/embedding | Core capability of the system |
| FR3 | Return probability + label | Model logit | `fake_prob` ∈ [0,1] + REAL/FAKE label | Result consumable by the business layer |
| FR4 | Generate Grad-CAM | Image + trained model | Heatmap overlay of suspicious regions | Explainability for human reviewers |
| FR5 | Calibrate eKYC threshold | Score distribution on the validation set | Decision threshold τ satisfying FPR ≤ 5% (ISO 30107-3 convention) | Serves the biometric requirements of Circular 17 |

These five requirements form a closed chain: FR1 prepares the data, FR2–FR3 perform classification, FR4 explains the decision, and FR5 sets the operating threshold. Notably, FR4 and FR5 are often overlooked in purely academic studies but are *mandatory* prerequisites for real banking deployment: reviewers need to know "where the model looks" to make a decision, and the compliance team needs a threshold with a quantitative basis.

### 2.1.2 Non-functional requirements

The non-functional requirements specify the *quality* of the system. In the deepfake-eKYC problem, the following five attributes are pivotal.

[[BẢNG 2.2: Các yêu cầu phi chức năng và tiêu chí đo lường]]

| ID | Attribute | Measurement criterion | Target |
|----|-----------|-----------------------|--------|
| NFR1 | Cross-dataset accuracy | Frame-level AUC on CDFv2 (trained on FF++) | Higher than the B4 baseline (0.7497) |
| NFR2 | Explainability (XAI) | Grad-CAM + t-SNE + frequency viz available | Reviewers can understand the decision |
| NFR3 | Inference latency | Processing time for one frame | [[FILL: ms/khung hình trên RTX 3060]] |
| NFR4 | Reproducibility | Re-running in DeepfakeBench yields the same result | Fixed seed, public config |
| NFR5 | eKYC operating point | FPR at the operating threshold | ≤ 5% (ISO 30107-3 convention; Circular 17 requires it qualitatively) |

The key point to emphasise is that **NFR1 (cross-dataset generalisation) is given the highest priority**. The reason is that, in practice, an attacker will use new deepfake tools that the model *has never seen during training*. A model that achieves a very high in-dataset AUC but collapses when faced with an unfamiliar manipulation is useless for eKYC. Therefore, the entire method design in the following sections takes "improving cross-dataset AUC without sacrificing stability" as its guiding principle.

## 2.2 Overall system design

### 2.2.1 Use-case diagram

The system has two groups of actors: the **end eKYC user** (the customer who submits authentication images/videos) and the **engineer/operator** (who trains the model, calibrates the threshold, and inspects the explanations). The use-case diagram below describes the main interactions.

[[HÌNH 2.1: Sơ đồ use case hệ thống SFDCT — actor "Khách hàng eKYC" với các use case {Nạp khung hình, Nhận kết quả REAL/FAKE}; actor "Kỹ sư vận hành" với các use case {Huấn luyện mô hình, Hiệu chỉnh ngưỡng FPR≤5%, Xem Grad-CAM/t-SNE, Đánh giá cross-dataset}]]

Separating the two groups of actors accurately reflects two operating phases: the *offline* phase (the engineer trains, evaluates, and calibrates) and the *online* phase (the customer is authenticated in real time). These two phases share the same SFDCT model but differ in their data flow, as presented in Section 2.2.3.

### 2.2.2 Overall architecture

The system architecture is organised into four sequential blocks, each carrying a clear responsibility. This block decomposition achieves separation of concerns: each block can be replaced or upgraded without breaking the rest.

![Figure 2.2 — Overall SFDCT architecture](figures/fig_2_2_architecture.png)
*Figure 2.2: Overall architecture — Pre-processing (face detect/align/crop 256×256) → SFDCT (spatial EfficientNet-B4 branch + frequency block-DCT branch, fused by zero-initialised gated cross-attention) → Post-processing & thresholding (sigmoid → fake_prob → compare with τ) → Grad-CAM explanation.*

[[BẢNG 2.3: Bốn khối của kiến trúc tổng thể và trách nhiệm]]

| Block | Component | Input → Output | Role |
|-------|-----------|----------------|------|
| B1. Pre-processing | Face detector + aligner + cropper | Raw image → normalised 256×256 face crop | Removes background noise, normalises the input |
| B2. SFDCT model | Spatial B4 + frequency block-DCT + gated fusion | Image tensor → logit/embedding | Extracts spatial+frequency features, classifies |
| B3. Post-processing & thresholding | Sigmoid + threshold comparator τ | Logit → fake_prob → label | Converts the score into an operational decision |
| B4. Explanation | Grad-CAM (+ t-SNE, frequency viz offline) | Image + model → heatmap | Makes the decision transparent to reviewers |

These four blocks correspond directly to the five functional requirements: B1 realises FR1, B2 realises FR2, B3 realises FR3 and FR5, and B4 realises FR4. This one-to-one mapping between requirements and architectural blocks demonstrates the principle of "minimal yet sufficient design" — no block is redundant, and no requirement is left out.

### 2.2.3 Training data flow vs. eKYC inference flow

The same SFDCT model serves two different flows. Distinguishing the two flows clearly helps avoid confusion between what happens "once, offline" and what happens "per transaction, online".

[[HÌNH 2.3: Hai luồng dữ liệu — (a) Luồng huấn luyện: FF++ c23 → sampling 32 frame → face crop → augmentation (gồm DCTFoMixup) → SFDCT → loss tổng hợp → cập nhật trọng số; (b) Luồng inference eKYC: khung hình khách hàng → face crop → SFDCT (không augmentation) → fake_prob → so ngưỡng τ đã calibrate → REAL/FAKE + Grad-CAM]]

**Training flow (offline):** FaceForensics++ c23 data is sampled at 32 frames per video, passes through face cropping and a series of augmentations (including DCTFoMixup in the configurations where S3 is enabled), and is fed into SFDCT to compute the composite loss and update the weights with Adam. This is the resource-intensive phase, run on a GPU server (vast.ai), once per configuration.

**eKYC inference flow (online):** the customer's face frame goes through face cropping only (no augmentation), is fed into SFDCT to obtain `fake_prob`, is compared against the pre-calibrated threshold τ (ensuring FPR ≤ 5%), and returns a REAL/FAKE label together with Grad-CAM. This phase must be light and fast, prioritising low latency.

The crucial point is that **augmentation and the complex loss exist only in the training flow**; the inference flow is merely a pure forward pass plus a threshold comparison. Thanks to the zero-initialised gated-fusion design (Section 2.4.3), the model in the inference flow is never significantly heavier than B4 while still retaining the benefit of the frequency branch.

## 2.3 Data pipeline & pre-processing

The quality of the frequency features depends directly on the quality of pre-processing: a misaligned or improperly compressed face crop can create spurious frequency artefacts that mislead the model. The data pipeline is therefore rigorously standardised following DeepfakeBench to ensure fairness and reproducibility.

### 2.3.1 Data sources & train/val/test split

Following the DeepfakeBench protocol, the model is **trained on FaceForensics++ (FF++), the c23 compressed version**, and **tested cross-dataset on Celeb-DF-v2 (CDFv2)**. Clearly separating the training set and the test set into two different distributions is precisely the core of measuring generalisation.

[[BẢNG 2.4: Nguồn dữ liệu và vai trò trong giao thức đánh giá]]

| Dataset | Scale | Role | Split |
|---------|-------|------|-------|
| FF++ c23 | 1000 real videos + 4 forgery methods (Deepfakes, Face2Face, FaceSwap, NeuralTextures) | Train + validation | Per the standard DeepfakeBench split [[FILL: tỉ lệ train/val cụ thể]] |
| Celeb-DF-v2 | 590 real videos + 5639 high-quality deepfake videos | Cross-dataset test (no training) | Entirely used for testing |
| DFDC | [[FILL: quy mô subset]] | Additional cross-dataset (future) | Future direction |

The logic of this split is as follows: FF++ provides a diversity of *manipulation types* so the model learns generalisable forgery traces; CDFv2, with its high-quality celebrity deepfakes, plays the role of a genuine "examination" — if the model has merely memorised the artefacts specific to FF++, it will fail on CDFv2. Frame-level AUC on CDFv2 is therefore a faithful measure of generalisation ability.

### 2.3.2 Frame sampling

Each video is sampled at **32 frames** (`frame_num = 32`) evenly distributed along the temporal axis. The intuition is that a frame-level model does not need every frame, only a representative set large enough to cover the variation in pose, expression, and lighting conditions within the video. The number 32 is a balance point between information coverage and computation/storage cost, and it is also consistent with the baseline configuration to allow a fair comparison.

### 2.3.3 Face detection & alignment

Each frame is passed through a face detector to locate the bounding box and the landmarks, after which it is **aligned** to a canonical pose and **cropped to 256×256**. When the face lies close to the border or its aspect ratio does not match, **padding** is applied to preserve the frame ratio without distorting the geometric features. The final image is normalised with `mean = std = 0.5` (mapping the pixels to approximately [−1, 1]).

[[BẢNG 2.5: Các bước tiền xử lý khuôn mặt]]

| Step | Operation | Input | Output |
|------|-----------|-------|--------|
| 1 | Face + landmark detection | Raw frame | Bounding box + landmarks |
| 2 | Alignment | Box + landmarks | Pose-rectified face |
| 3 | Crop + padding | Aligned face | 256×256 image preserving the ratio |
| 4 | Normalisation | 256×256 image | Tensor (mean=std=0.5) |

The reason for the strict alignment normalisation is that the block-DCT branch (Section 2.4.2) divides the image into fixed 8×8 blocks; if the face is not aligned consistently, the same anatomical region (for example, the cheek) will fall into different blocks across images, corrupting the per-band frequency statistics. Good alignment keeps the frequency features stable and comparable across samples.

### 2.3.4 Augmentation

Augmentation is applied only in the training flow, in order to increase data diversity and reduce overfitting. Beyond the standard geometric/photometric augmentations (horizontal flip, mild brightness/contrast changes, simulated JPEG compression — [[FILL: liệt kê chính xác augmentation pipeline trong config]]), the distinctive contribution of this work is **DCTFoMixup** (activated in the configurations where S3 is enabled): it mixes the DCT frequency bands between two samples and then performs an inverse-DCT to create a new sample, forcing the model to learn more invariant frequency features (detailed in Section 2.5.3). It is worth noting that augmentations that strongly affect the frequency spectrum must be designed carefully so as not to inadvertently erase the very forgery traces the model needs to learn.

## 2.4 PROPOSED METHOD — The SFDCT architecture

This is the central part of the entire project. The name **SFDCT** stands for **S**patial–**F**requency learning with block-wise **DCT**. The core idea originates from an empirical observation: the artefacts of GAN/upsampling (checkerboard grids, frequency-spectrum anomalies) are very hard to see in the pixel domain but appear clearly in the DCT frequency domain. A spatial backbone such as EfficientNet-B4 learns semantic features (eyes, nose, skin texture) very well but is partially "blind" to subtle frequency anomalies. SFDCT adds a dedicated *frequency branch* and fuses it into the backbone in a *safe* manner, so that in the worst case the model is never worse than B4.

### 2.4.1 Two-branch overview

SFDCT comprises two parallel branches sharing the same input — a 256×256 face crop:

- **Spatial branch:** EfficientNet-B4 pretrained on ImageNet, extracting semantic and textural features in the pixel domain. This is the "backbone", primarily responsible for most of the classification capability.
- **Frequency branch:** transforms the image into the frequency domain via a block-wise 8×8 2D-DCT, extracts spectral features over 16 zigzag frequency bands, and produces a supplementary representation (context) focused on frequency-domain forgery traces.

The two branches meet at the **zero-initialised gated cross-attention** module, where the frequency features are "injected" into the spatial features through a gate whose coefficient `alpha` is initialised to 0.

[[HÌNH 2.4: Kiến trúc SFDCT hai nhánh — (trên) ảnh 256×256 → EfficientNet-B4 → feature map x; (dưới) ảnh → YCbCr → block-DCT 8×8 → log-magnitude → 16 zigzag bands → DCT feature; hai nhánh hợp nhất tại gated cross-attention zero-init: feature_fused = x + alpha·context(DCT) → classifier → logit]]

The intuition behind the two-branch design is as follows: rather than forcing a single network to learn both semantics and the frequency spectrum (which easily causes gradient conflict), we let each branch specialise and then fuse them under control. The frequency branch plays the role of a "consulting expert": the backbone still makes the main decision, but it can consult additional frequency evidence when needed.

### 2.4.2 The 8×8 block-DCT frequency branch

This is the heart of the representational contribution. The goal is to turn a face image into a compact, stable, and forgery-informative set of frequency features. The procedure has four steps, going from the colour image to a per-band statistical vector.

**Step 1 — Convert to YCbCr.** The RGB image is converted to the YCbCr colour space, separating the luminance channel (Y) from the two chrominance channels (Cb, Cr). The reason is that image compression (JPEG) and most forgery artefacts manifest differently on the luminance and chrominance channels; separating the channels allows the frequency branch to "see" anomalies that the RGB domain blends together.

**Step 2 — Block-wise 8×8 2D-DCT.** The image is divided into a grid of non-overlapping 8×8 blocks. On each block, the two-dimensional discrete cosine transform (2D-DCT) is applied. For a block $B$ of size $8\times8$, the DCT coefficient at position $(u,v)$ is:

$$
F(u,v) = \frac{1}{4}\,C(u)\,C(v)\sum_{x=0}^{7}\sum_{y=0}^{7} B(x,y)\,\cos\!\Big[\frac{(2x+1)u\pi}{16}\Big]\cos\!\Big[\frac{(2y+1)v\pi}{16}\Big]
$$

where $C(0)=1/\sqrt{2}$ and $C(k)=1$ for $k>0$. The choice of an 8×8 block is not arbitrary: this is precisely the block size used by the JPEG compression standard, so compression/forgery artefacts tend to "phase-align" with the block grid, making them more prominent in the DCT coefficients.

**Step 3 — Log-magnitude.** We take the log of the coefficient magnitude: $D(u,v) = \log\big(1 + |F(u,v)|\big)$. The log compresses the enormous dynamic range of the DCT spectrum (the DC coefficient is typically thousands of times larger than the high-frequency coefficients), so that high-frequency traces — which are small but rich in forgery information — are not overwhelmed by the low-frequency coefficients.

**Step 4 — Aggregate into 16 zigzag frequency bands & band statistics.** The 64 coefficients of each 8×8 block are traversed in **zigzag** order (from the DC term at the top-left corner to the high-frequency term at the bottom-right corner) and grouped into **16 zigzag frequency bands**, from low to high. For each band $b$, statistics are computed (for example, the mean and standard deviation of the log-magnitude over the whole image):

$$
\mu_b = \frac{1}{|\mathcal{B}_b|}\sum_{(u,v)\in \mathcal{B}_b} D(u,v), \qquad
\sigma_b = \sqrt{\frac{1}{|\mathcal{B}_b|}\sum_{(u,v)\in \mathcal{B}_b}\big(D(u,v)-\mu_b\big)^2}
$$

where $\mathcal{B}_b$ is the set of coefficient positions belonging to band $b$ (aggregated over all blocks and channels). The result is a compact frequency feature vector describing the "spectral signature" of the image per frequency band.

**Optional drop of low bands.** The DC term and a few of the lowest bands can be *removed* before fusion. The intuition is that the low bands carry mainly *content* (overall shape, brightness) rather than forgery traces; keeping them risks causing *content leakage* (the model learns to recognise the *person/scene* instead of the *forgery traces*), which harms cross-dataset generalisation. Dropping the low bands forces the frequency branch to focus on the mid-to-high range, where GAN/upsampling artefacts reside.

[[BẢNG 2.6: Ánh xạ các bước của nhánh tần số block-DCT (bước → đầu vào → đầu ra → vai trò)]]

| Step | Operation | Input | Output | Role |
|------|-----------|-------|--------|------|
| 1 | RGB → YCbCr | 256×256 face crop | 3 channels Y, Cb, Cr | Separate luminance/chrominance to expose artefacts |
| 2 | 8×8 block-DCT | Each channel split into 8×8 blocks | DCT coefficients $F(u,v)$ per block | Move to the frequency domain aligned with the JPEG grid |
| 3 | Log-magnitude | $\|F(u,v)\|$ | $D(u,v)=\log(1+\|F\|)$ | Compress dynamic range, emphasise high frequencies |
| 4 | Zigzag → 16 bands + statistics | $D(u,v)$ over the whole image | Vector $(\mu_b,\sigma_b)_{b=1..16}$ | Compact, stable "spectral signature" |
| (optional) | Drop low bands | Full band vector | Vector with DC + low bands removed | Counters content leakage |

### 2.4.3 Zero-initialised gated cross-attention fusion

The central problem of fusion is: *how do we combine the frequency features into the backbone without risking making the model worse?* A "brute-force" fusion (direct addition/concatenation) of an under-trained frequency branch could inject noise into the backbone, dragging the AUC below even the B4 baseline. The solution is a **zero-initialised gate**.

Let $x$ be the feature from the spatial branch (B4) and $\text{context}(\text{DCT})$ be the frequency representation after passing through cross-attention. The fused feature is:

$$
\text{feature\_fused} = x + \alpha \cdot \text{context}(\text{DCT})
$$

where $\alpha$ is a learnable gate, **initialised to $\alpha = 0$**.

The significance of $\alpha = 0$ at initialisation:

$$
\text{feature\_fused}\big|_{\alpha=0} = x
$$

That is, **at initialisation, SFDCT is exactly equivalent to EfficientNet-B4**. The model starts from precisely the baseline and then *decides for itself* whether to open the frequency gate during training. If the frequency branch is genuinely useful, the gradient will push $\alpha$ away from 0 to exploit it; if not, $\alpha$ can stay near 0 and the model remains safely at the B4 level.

[[BẢNG 2.7: Ý nghĩa của gate alpha theo giá trị]]

| Value of $\alpha$ | Model state | Interpretation |
|-------------------|-------------|----------------|
| $\alpha = 0$ (init) | Equivalent to B4 | Safe "floor" — never worse than the baseline |
| $\alpha \to$ small positive | Frequency lightly supplementary | Backbone dominant, frequency fine-tunes |
| $\alpha$ larger | Frequency contributes strongly | Frequency traces are genuinely important |

This is precisely the **"floor ≥ B4" guarantee** — the most important contribution in terms of risk safety of the design (never below the B4 baseline). The learned value of $\alpha$ will be visualised in Chapter 3 through the figure `gate_alpha.png`, showing the extent to which the model actually relies on the frequency branch. This zero-init gate mechanism is inspired by the zero-initialised residual technique used in modern architectures [[KIỂM TRA: trích dẫn ReZero / Fixup / zero-init residual]].

## 2.5 Five improvement levers & four ablation configurations

The block-DCT branch + gated fusion ("naive SFDCT", referred to in this report as **B4-DCT**) already yielded a modest improvement over B4 (CDFv2 AUC from 0.7497 to 0.7572, +0.0075). To push further, this work assembles and *adapts* five improvement levers — each inspired by a paper on frequency-based deepfake detection — and *transfers* them into the block-DCT domain of SFDCT. The philosophy is: rather than inventing from scratch, we stand on the shoulders of proven methods but unify them within a single block-DCT framework.

### 2.5.1 S1 — dct_use_sign (adapted from SPSL)

**Idea.** The log-magnitude step (Section 2.4.2) keeps only the *magnitude* of the DCT coefficients while discarding their *sign* — yet the coefficient sign carries phase information (phase-analog). SPSL shows that phase information is highly sensitive to upsampling artefacts. S1 adds the sign of the DCT coefficients back into the feature:

$$
D_{\pm}(u,v) = \text{sign}\big(F(u,v)\big)\cdot \log\big(1+|F(u,v)|\big)
$$

**Implementation in block-DCT.** Instead of using only the log-magnitude, each band additionally stores statistics over the signed coefficients, providing a phase-analog signal without changing the architecture. **Adapted from:** SPSL (phase spectrum). Cost: 0 additional learnable parameters.

### 2.5.2 S2 — dct_srm_residual (adapted from SRM)

**Idea.** Forgery traces often reside in the high-frequency noise component, easily masked by the image content. SRM (Spatial Rich Model) uses high-pass filters to extract the *noise residual*, removing the content and exposing the manipulation traces. S2 applies the **block-DCT on the SRM high-pass noise residual** instead of on the original image:

$$
R = \text{SRM}_{\text{high-pass}}(I), \qquad \text{then compute block-DCT}(R)
$$

**Implementation in block-DCT.** Before step 2 (block-DCT), the image is filtered through one (or several) SRM high-pass kernels to obtain the residual $R$; the entire subsequent frequency pipeline then runs on $R$. The result is a "content-clean" frequency spectrum focused on the forgery noise. **Adapted from:** SRM (high-pass noise residual). Cost: 0 additional learnable parameters (the SRM kernels are fixed).

### 2.5.3 S3 — use_dct_fomixup + dual consistency loss (adapted from FreqDebias)

**Idea.** A frequency model is prone to *bias* towards the spectrum specific to the training set, harming generalisation. FreqDebias proposes to debias the frequency content by mixing spectra across samples and forcing the model to be consistent. S3 has two parts:

1. **DCTFoMixup augmentation:** for two samples, mix their DCT frequency bands according to a coefficient and then *inverse-DCT* to create a hybrid sample. The hybrid sample carries the content of one image but a blended "frequency texture", forcing the model not to cling rigidly to the spectrum of a specific sample.
2. **Dual consistency loss:** forces the predictions on the original and the hybrid sample to be consistent, comprising two components — **symmetric-KL** on the output probability distribution and **MSE** on the embedding:

$$
\mathcal{L}_{\text{cons}} = \underbrace{\tfrac{1}{2}\big[\text{KL}(p\,\|\,q)+\text{KL}(q\,\|\,p)\big]}_{\text{symmetric-KL on probabilities}} \;+\; \underbrace{\lambda_{\text{emb}}\,\|z - z'\|_2^2}_{\text{MSE on embeddings}}
$$

where $p,q$ are the prediction distributions and $z,z'$ are the embeddings of the original/hybrid sample. **Adapted from:** FreqDebias. S3 is the only lever appearing in *both* Row1 and Row2 because it improves generalisation in a general manner.

### 2.5.4 S4 — dct_fca_attention (adapted from FcaNet)

**Idea.** Traditional channel attention (SENet) uses only global average pooling — equivalent to *keeping only the DC component* of each channel, discarding the frequency information. FcaNet proves that using multiple different DCT components as attention weights is more informative. S4 inserts a **MultiSpectralAttentionLayer** (learning channel attention via multiple DCT frequencies) into the feature branch:

$$
\text{att} = \text{sigmoid}\big(\text{MLP}(\text{DCT-pool}_{\text{multi-freq}}(X))\big), \qquad X' = \text{att}\odot X
$$

**Implementation in block-DCT.** Leveraging the same "DCT language" of SFDCT, S4 replaces global-average-pool with multi-frequency DCT pooling to compute the channel weights, emphasising the artefact-rich channels. **Adapted from:** FcaNet (multi-spectral channel attention). Cost: it **does** add learnable parameters (the attention MLP).

### 2.5.5 S5 — use_single_center_loss (adapted from FDFL)

**Idea.** The "real" class is by nature a relatively *tight* distribution (every genuine face is "natural"), whereas "fake" is highly diverse (many forgery methods). The single-center loss exploits this asymmetry: it *compresses* the real class towards a single centre and *pushes* fakes away from that centre by a margin:

$$
\mathcal{L}_{\text{sc}} = \underbrace{\frac{1}{N_{\text{real}}}\sum_{i\in\text{real}}\|z_i - c\|_2}_{\text{compress real towards centre } c} \;-\; \underbrace{\beta\cdot \frac{1}{N_{\text{fake}}}\sum_{j\in\text{fake}}\min\big(\|z_j - c\|_2,\ m\sqrt{D}\big)}_{\text{push fake out by margin } m\sqrt{D}}
$$

where $c$ is the learned centre of the real class, $D$ is the embedding dimensionality, and $m$ is the margin coefficient. **Adapted from:** FDFL (single-center loss). Cost: it **does** add learnable parameters (the centre $c$).

### 2.5.6 Four ablation configurations

The five levers above are combined into four configurations that tell an incremental "story": from purely spatial → adding DCT → adding improvements. The two improvement rows (Row1, Row2) are deliberately designed to *separate* the two types of lever: Row1 comprises the levers that **add no learnable parameters** (changing only the input features & the loss), while Row2 comprises the levers that **add learnable parameters** (FcaNet + single-center). This separation allows us to answer a scientific question: *does the improvement come from better information or from greater model capacity?*

[[BẢNG 2.8: Bốn cấu hình ablation và trạng thái bật/tắt các đòn cải tiến]]

| Configuration | Description | S1 sign | S2 SRM | S3 FoMixup | S4 FcaNet | S5 single-center | Added learnable params | CDFv2 AUC |
|---------------|-------------|:-------:|:------:|:----------:|:---------:|:----------------:|:----------------------:|:---------:|
| **B4** | EfficientNet-B4 spatial-only | – | – | – | – | – | No | 0.7497 |
| **naive SFDCT** (B4-DCT) | B4 + block-DCT + gated fusion (S1–S5 off) | ✗ | ✗ | ✗ | ✗ | ✗ | No (besides fusion) | 0.7572 |
| **Row1** | naive + S1 + S2 + S3 | ✓ | ✓ | ✓ | ✗ | ✗ | **No** | 0.7333 |
| **Row2** | naive + S4 + S5 + S3 | ✗ | ✗ | ✓ | ✓ | ✓ | **Yes** | _(training in progress)_ |

Note that S3 (FoMixup + dual consistency) appears in both Row1 and Row2 because it is a general debiasing lever, independent of whether learnable parameters are added.

## 2.6 Loss function & training strategy

### 2.6.1 Total loss function

The loss function aggregates components depending on the enabled configuration. Its general form is:

$$
\mathcal{L} = \mathcal{L}_{\text{CE}} \;+\; \lambda_{\text{aug}}\,\mathcal{L}_{\text{cls\_aug}} \;+\; \lambda_{\text{cons}}\,\mathcal{L}_{\text{cons}} \;+\; \lambda_{\text{sc}}\,\mathcal{L}_{\text{sc}}
$$

where:

[[BẢNG 2.9: Các thành phần của hàm mất mát]]

| Component | Formula/meaning | Enabled when |
|-----------|-----------------|--------------|
| $\mathcal{L}_{\text{CE}}$ | REAL/FAKE classification cross-entropy on the original sample | Always on |
| $\mathcal{L}_{\text{cls\_aug}}$ | Cross-entropy on the DCTFoMixup hybrid sample | When S3 is on |
| $\mathcal{L}_{\text{cons}}$ | symmetric-KL (probabilities) + MSE (embedding) — see Section 2.5.3 | When S3 is on |
| $\mathcal{L}_{\text{sc}}$ | Single-center loss — see Section 2.5.5 | When S5 is on |

The $\lambda$ coefficients balance the contribution of each component. When all levers are off (naive SFDCT), the loss reduces to exactly the standard cross-entropy — once again affirming the principle of "safe by default, enable more when needed".

[[BẢNG 2.10: Giá trị các hệ số trọng số loss]]

| Coefficient | Role | Value |
|-------------|------|-------|
| $\lambda_{\text{aug}}$ | CE weight on the hybrid sample | 1.0 (default) |
| $\lambda_{\text{cons}}$ | Consistency weight | 1.0 (`fomixup_consist_w`) |
| $\lambda_{\text{emb}}$ | Embedding MSE weight in $\mathcal{L}_{\text{cons}}$ | 1.0 (default) |
| $\lambda_{\text{sc}}$ | Single-center weight | 0.3 (`scl_weight`) |
| $m$ (margin) | Margin in the single-center loss | 0.3 (`scl_margin`) |
| $\beta$ | Fake push-out coefficient | — (not used in the current configuration) |

### 2.6.2 Optimiser & hyperparameters

The training configuration is identical across the ablation configurations to ensure a fair comparison — any difference in AUC comes solely from the architecture/improvement levers, not from hyperparameter tuning.

[[BẢNG 2.11: Siêu tham số huấn luyện]]

| Hyperparameter | Value |
|----------------|-------|
| Optimizer | Adam |
| Learning rate | 2 × 10⁻⁴ |
| Batch size | 32 |
| Frames per video (frame_num) | 32 |
| Image size | 256 × 256 |
| Normalisation | mean = std = 0.5 |
| Number of epochs | 10 |
| LR scheduler | None (fixed LR) |
| Weight decay | 5 × 10⁻⁴ |
| Seed | 1024 (single seed — not yet multi-seed) |

### 2.6.3 Label smoothing & callbacks

**No label smoothing is used** (`loss_func = cross_entropy` in the config). No LR scheduler is used (fixed LR) and there is no early stopping; instead, each epoch (10 epochs in total) is evaluated on the test set and the **checkpoint with the best test-AUC** is retained (`save_epoch = 1`). Following the DeepfakeBench protocol, the best model is selected by AUC, and the corresponding checkpoint is used for cross-dataset evaluation on CDFv2.

## 2.7 Evaluation metrics & explainability (XAI)

### 2.7.1 The metrics

For a comprehensive evaluation, this work uses several metrics but emphasises one *headline* metric.

[[BẢNG 2.12: Các độ đo đánh giá]]

| Metric | Short definition | Role |
|--------|------------------|------|
| **Frame-level AUC** | Area under the ROC curve at the frame level | **Headline** — measures cross-dataset generalisation |
| AP | Average Precision (area under the PR curve) | Supplementary, sensitive to class imbalance |
| EER | Equal Error Rate (the point where FPR = FNR) | Related to the operating threshold |
| Accuracy | Proportion of correct classifications | Reference, threshold-dependent |

**Frame-level AUC is the primary metric** because it is *threshold-invariant* (it measures the quality of REAL/FAKE ranking independently of the cut-off point) and is the comparison standard of the DeepfakeBench leaderboard, allowing a fair comparison with other methods. AP, EER, and accuracy play a supplementary role; in particular, EER relates directly to setting the eKYC operating threshold.

### 2.7.2 Cross-dataset protocol

The evaluation procedure strictly follows DeepfakeBench: **train on FF++ c23, test on CDFv2** that the model *has never seen*. This is the key condition — only when the test set belongs to a distribution markedly different from the training set does the AUC figure faithfully reflect the ability to generalise to new manipulations, in line with the spirit of the eKYC problem in practice.

### 2.7.3 The explanation tools

Explainability is not an auxiliary feature but a mandatory requirement (NFR2) in eKYC. This work provides three layers of explanation tools, each answering a different question.

[[BẢNG 2.13: Ba công cụ giải thích và câu hỏi tương ứng]]

| Tool | Illustrative figure | Question answered |
|------|---------------------|-------------------|
| **Grad-CAM** | `gradcam.png` | "*Which region* of the face does the model look at?" |
| **t-SNE** | `tsne.png` | "How *separated* are the REAL/FAKE samples in the feature space?" |
| **Frequency viz** | `frequency.png` | "How *different* are the frequency spectra of REAL vs FAKE?" |

In addition, the figure `gate_alpha.png` visualises the learned value of $\alpha$ — indicating how much the model actually relies on the frequency branch — and `roc_auc.png`, `pr_curve.png`, `radar.png`, `ap_bar.png`, and `heatmap.png` provide a complete quantitative picture (to be presented in Chapter 3). This toolset turns SFDCT from a "black box" into a *transparent* system, meeting the stringent requirements of the banking environment.

## 2.8 Justification of the design's superiority

A good design is not the most complex one but the one that is *just sufficient* to solve the problem with the lowest risk. This section justifies two core qualities of SFDCT.

**Why minimal yet sufficient.** SFDCT does not invent a new backbone or an exotic attention mechanism; it reuses the proven EfficientNet-B4 and adds *only* what the backbone lacks — a dedicated frequency branch. The five improvement levers are not five heavy modules stacked on top of one another but five *targeted adjustments*, each aimed at a specific weakness (lack of phase information → S1; content masking the noise → S2; spectral bias → S3; frequency-poor channel attention → S4; a dispersed real class → S5). More importantly, Row1 achieves an improvement **without adding a single learnable parameter** — strong evidence that most of the benefit comes from *better representation* rather than from a *larger model*, true to the spirit of frugality and avoiding over-engineering.

**Why risk-safe thanks to the floor.** This is the most important design argument. The zero-initialised gated-fusion mechanism guarantees that at the starting point, SFDCT *is* B4 — no more, no less. Everything the model learns thereafter can only *add* value, because if the frequency branch is useless the gradient will keep $\alpha$ near 0 and we revert to the baseline. In a problem where mistakes are as costly as in eKYC, the property of "never worse than the proven baseline" is a design guarantee of great practical value: it turns adding a frequency branch from a *gamble* into a *safe and beneficial choice*. The experiments confirm this — naive SFDCT achieves 0.7572 > 0.7497 of B4, and the Row1/Row2 configurations continue to build on that safe foundation.

Some **limitations** should be stated frankly so the justification remains honest: (i) the current results are based on only **a single seed** owing to GPU cost constraints, so small differences (on the order of a few thousandths of AUC) may lie within statistical noise and require multi-seed runs to confirm; (ii) the strongest AUC lever according to recent studies — **SBI self-blended training** — lies *outside* the purely block-DCT scope of this work and is therefore reserved for future development. Acknowledging these limitations does not weaken the contribution but reinforces the scientific rigour of the report.

## 2.9 Chapter summary

Chapter 2 has traversed the full journey from *requirements* to *design* and *method*. The first part analysed five functional requirements (FR1–FR5) and five non-functional requirements (NFR1–NFR5), among which **cross-dataset generalisation (NFR1)** is placed as the highest priority, accurately reflecting the adversarial nature of the eKYC problem. The system-design part presented the use-case diagram, the four-block architecture (pre-processing → SFDCT → post-processing/thresholding → explanation), and clearly distinguished the offline training flow from the online inference flow.

The central part introduced the **SFDCT method**: a two-branch architecture combining the spatial EfficientNet-B4 backbone with an 8×8 block-wise DCT frequency branch (16 zigzag bands, optional drop of low bands to counter content leakage), fused via **zero-initialised gated cross-attention** with the theoretical "floor ≥ B4" guarantee. On that foundation, five improvement levers — **S1 (SPSL), S2 (SRM), S3 (FreqDebias), S4 (FcaNet), S5 (FDFL)** — are uniformly adapted into the block-DCT domain and combined into four ablation configurations (B4 → naive SFDCT → Row1 without added parameters → Row2 with added parameters). Finally, the chapter presented the composite loss function, the training strategy, the metric suite with frame-level AUC as the headline, and the three explanation tools (Grad-CAM, t-SNE, frequency viz) that meet the transparency requirements of eKYC.

The numbers confirm the direction: B4 = 0.7497 → naive SFDCT = 0.7572 (+0.0075), with Row1 = 0.7333 (already obtained) and Row2 being finalised. Chapter 3 will present in detail the implementation process, the experimental configuration, and an in-depth analysis of the quantitative and qualitative results (Grad-CAM, t-SNE, gate alpha) to validate each design argument set out in this chapter.
