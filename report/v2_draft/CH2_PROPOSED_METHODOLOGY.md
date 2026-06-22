# CHAPTER 2: PROPOSED METHODOLOGY

## 2.1 Overview of the Proposed AI Pipeline

The proposed system takes one face capture and returns a forgery verdict through a fixed sequence of stages ordered for both accuracy and cost: locate the face, run a cheap presentation-attack check first, and spend the heavier deepfake compute only afterward, so obvious spoofs are rejected before any expensive stage runs.

The first operation on every input is **face detection and alignment**. The raw frame passes through an MTCNN detector [17], which returns the face box and five landmarks. The landmarks drive an alignment to a canonical pose, and the aligned region is cropped, padded to a fixed size, and normalised. This single cropped tensor is the shared input for everything downstream, so the liveness head and the deepfake head reuse one preprocessing path.

The deepfake stage uses two streams. A spatial stream built on an EfficientNet-B4 backbone [1] reads the aligned crop and extracts spatial and textural features. In parallel, a frequency stream converts the crop to the brightness-and-colour space and applies a block-wise discrete cosine transform [10] over fixed 8×8 blocks, summarising the spectrum into a compact per-band descriptor. A gated cross-attention fusion merges the two, with a gate that starts closed so the frequency path is added on top of the backbone rather than replacing it [31]. The fused representation passes to a real-or-fake head that emits a fake probability and a verdict. The figure below shows the architecture.

![Figure 2.1: Overview of the SFDCT pipeline](figures/fig_arch_sfdct.png)

*Figure 2.1: Overview of the SFDCT pipeline: aligned crop into a spatial EfficientNet-B4 stream and a block-DCT frequency stream, merged by a zero-start gated fusion into a real-or-fake head.*

Liveness detection sits ahead of the deepfake stage as a **cascade pre-filter**. The liveness head runs first, and a spoof or uncertain verdict stops the request before any deepfake compute is spent, removing a whole class of presentation attacks cheaply at the front. The ordering is partly a security choice and partly a compensation: the deepfake model has limited recall at its chosen operating point, so a low-cost liveness gate ahead of it improves the overall eKYC flow at little extra cost. The liveness architecture, which reuses the SFDCT components, is described later in this chapter.

The following table records the input and output of each stage.

*Table 2.1: Input and output of each pipeline stage.*

| Stage | Input | Output |
|---|---|---|
| Face detection and alignment | Raw frame | Aligned fixed-size face crop and landmarks |
| Liveness pre-filter | Aligned face crop | Live or spoof verdict and score (stops the cascade on spoof) |
| Spatial stream (EfficientNet-B4) | Normalised crop | Spatial feature map $F_s$ |
| Frequency stream (block-DCT) | Normalised crop in YCbCr | Block-DCT descriptor $D$ |
| Gated fusion | $F_s$ and $D$ | Fused feature $F_{\text{fused}}$ |
| Real or fake head | $F_{\text{fused}}$ | Fake probability, verdict, heat map |

## 2.2 Dataset and Preprocessing

The quality of the frequency features depends directly on the preprocessing, since a misaligned or badly compressed crop introduces spurious artefacts that the frequency branch reads as forgery traces. The data pipeline therefore follows the DeepfakeBench protocol strictly [4], which keeps the evaluation fair and reproducible.

### 2.2.1 Dataset Structure

The model is trained on FaceForensics++ at a moderate compression level [2] and tested on Celeb-DF-v2 [3], a dataset it never sees during training, which is the standard way to measure generalisation. FaceForensics++ supplies 1000 real videos and four forgery methods derived from them, giving a variety of manipulation types to learn from. Celeb-DF-v2 supplies 590 real videos and 5639 high-quality deepfake videos and acts as the examination, where a model that has merely memorised the training artefacts fails on these subtler fakes. Other public sets are reserved for future cross-dataset evaluation.

The figure below shows a real and fake face pair after cropping with its frequency spectrum. The crops and labels are cached per dataset and split, so the expensive detect-and-align step runs once and is read from disk thereafter.

![Figure 2.2: A real and fake face pair after cropping, with the frequency spectrum](figures/fig_3_2_2_celeb_realfake.png)

*Figure 2.2: A real and fake face pair after cropping, with the frequency spectrum, showing the frequency footprint of a deepfake.*

### 2.2.2 Class Definition

The task is binary at the frame level, and each frame inherits the label of its source video, which keeps the labelling unambiguous and consistent across both datasets. The following table records the label mapping used throughout training and evaluation.

*Table 2.4: Deepfake label mapping.*

| Class | Label | Definition |
|---|---|---|
| real | 0 | Frame sampled from a genuine video |
| fake | 1 | Frame sampled from a forged video (any of the four FaceForensics++ methods, or a Celeb-DF-v2 deepfake at test time) |

### 2.2.3 Preprocessing Pipeline

A face detector locates the face and its landmarks, the face is aligned to a canonical pose and cropped to a fixed size, with padding to preserve the aspect ratio near the border, and the crop is resized to 256 pixels and normalised to a standard range. The frequency branch additionally converts the crop to YCbCr before the 8×8 block-DCT, separating brightness from colour because compression and forgery artefacts affect the two differently.

Strict alignment matters because the frequency branch divides the image into fixed 8×8 blocks: without it, the same region of the face falls into different blocks across images and the per-band statistics become corrupted. The full sequence is drawn in the figure below, and the per-step input and output of the module are listed in the table that follows.

![Figure 2.3: The preprocessing pipeline](figures/fig_2_preprocess_pipeline.png)

*Figure 2.3: The preprocessing pipeline: detect, align, crop and pad, resize to 256 px, normalise, with the YCbCr block-DCT branch.*

*Table 2.8: Face preprocessing steps (from FULL Table 2.10).*

| Step | Operation | Input | Output |
|---|---|---|---|
| 1 | face and landmark detection | the raw frame | the face box and landmarks |
| 2 | alignment | the box and landmarks | a pose-corrected face |
| 3 | crop and padding | the aligned face | a fixed-size image |
| 4 | normalisation | the fixed-size image | a normalised tensor |

### 2.2.4 Data Augmentation

Augmentation is applied only during training, to increase diversity and reduce overfitting, while the test set is left untouched so the cross-dataset measurement stays clean. The pipeline uses the standard DeepfakeBench augmentations [4]: horizontal flip, small rotation, mild blur, brightness and contrast jitter, and JPEG compression over a moderate quality range [34]. The following table lists them with their parameters.

*Table 2.6: Training-set data augmentation (DeepfakeBench settings).*

| Augmentation | Type | Parameters |
|---|---|---|
| Horizontal flip | Geometric | probability 0.5 |
| Rotation | Geometric | ±10°, probability 0.5 |
| Gaussian blur | Photometric | kernel 3 to 7 px, probability 0.5 |
| Brightness and contrast jitter | Photometric | ±0.1, probability 0.5 |
| JPEG compression | Photometric and spectral | quality 40 to 100, probability 0.5 |

### 2.2.5 Dataset Splitting

This thesis follows the cross-dataset protocol exactly: it trains entirely on FaceForensics++ and tests only on Celeb-DF-v2, which never appears in training. The split mirrors the real eKYC situation, where the model must face deepfake styles and faces it has never seen, so the result is a generalisation measure rather than an in-distribution score. Each video is sampled at thirty-two frames spaced evenly along its length and cropped through the pipeline above. A frame-level model needs only a representative set covering pose, expression, and lighting, and this number is held constant across all configurations for a fair comparison. The per-dataset counts, taken verbatim from the protocol, are given in the following table.

*Table 2.7: Data sources and their role (from FULL Table 2.9).*

| Dataset | Scale | Role |
|---|---|---|
| FaceForensics++ | 1000 real videos and 4 forgery methods | training |
| Celeb-DF-v2 | 590 real and 5639 high-quality deepfake videos | cross-dataset test, no training |
| Other public sets | not used here | future cross-dataset evaluation |

Both datasets lean towards the fake class, the training set at roughly one real to four fake at the video level and the test set more strongly skewed. The figure below shows the resulting distribution of real and fake counts. This skew is the reason the area under the ROC curve [21], rather than raw accuracy, is the main metric.

![Figure 2.4: Distribution of real and fake counts](figures/fig_3_1_distribution.png)

*Figure 2.4: Distribution of real and fake counts for the training and test sets.*

## 2.3 Proposed Model (SFDCT)

The detector proposed in this thesis is named **SFDCT**, for spatial-frequency learning with block-wise discrete cosine transform. It keeps a strong spatial backbone and attaches a frequency branch beside it, so two views of the same face crop are read together rather than one replacing the other. This section defines in full the two contributions deferred from the introduction: the block-DCT feature chain and the zero-initialised gated fusion. The measured cross-dataset scores that test whether each part earns its place are reported in the results chapter.

### 2.3.1 Motivation for Improvement

A spatial classifier such as EfficientNet-B4 [1] learns texture, shape, and blending cues from pixels, which suffices on the training distribution but generalises poorly. The artefacts left by a face swap or a generative-adversarial pipeline [23] are often faint in the pixel domain, yet show up as excess or deficit of energy in the middle and high two-dimensional DCT bands [10]. A purely spatial model cannot reach that evidence, so the natural improvement is a second branch that reads the frequency domain directly.

A second branch carries two design risks: the model must decide where the frequency evidence is trustworthy, since not every region carries a usable trace, and adding the branch must not make the detector worse than the backbone it started from. SFDCT addresses both with one mechanism. The frequency context enters through a gate whose coefficient starts at zero, so the fused model begins numerically identical to the plain backbone and can only improve as training opens the gate where the frequency branch lowers the loss. This is the **floor guarantee**: attaching the branch cannot push performance below the spatial baseline at the outset, which makes it safe to study rather than a gamble, and it licenses reusing the design unchanged for liveness later in this chapter.

### 2.3.2 Overall Architecture

SFDCT has two streams that meet at a gated fusion. The spatial stream is an EfficientNet-B4 backbone [1] applied to the aligned face crop, producing a spatial feature map $F_s$. The frequency stream takes the same crop, converts it to YCbCr, applies the block-wise DCT feature chain described below, and produces a frequency descriptor $D$. A gated cross-attention block then merges the two: the spatial features query the frequency features, and the result is added back through a zero-initialised gate. A two-class head maps the fused representation to a fake probability. This is the pipeline shown earlier.

Placing the branches in parallel rather than in series is deliberate: the spatial features stay the primary signal and the residual fusion only adds to them, which preserves the floor guarantee of the zero-initialised gate. The end-to-end behaviour exposed by the serving layer is summarised in the pipeline-stage table above, and the API contracts that wrap it appear in the two tables below for image and video.

*Table 2.2: Image-detection API specification (input and output). Source: FULL §2.2.5 Table 2.6. Endpoint `/v1/detect/image`, POST, multipart face image in. JSON out with `risk_score`, `risk_band`, `verdict`, and a Grad-CAM heat map [9].*

*Table 2.3: Video-detection API specification (input and output). Source: FULL §2.2.5 Table 2.7. Endpoint `/v1/detect/video`, POST, multipart video in. An asynchronous job identifier out, polled for the aggregated per-frame verdict.*

### 2.3.3 Description of Individual Modules

This subsection defines the parts that make SFDCT more than a backbone: the frequency feature chain that builds $D$, the gated cross-attention that fuses it with $F_s$, and the high-pass variant that replaces per-band statistics with a residual image.

#### (a) Block-DCT feature chain

The frequency branch turns a face crop into a compact, localised, normalised descriptor through a fixed sequence of steps [10][34].

The crop is first divided into non-overlapping $8\times8$ blocks, and the two-dimensional DCT defined earlier is applied to each block independently. A whole-image transform would blend global content with local artefacts, whereas the block grid keeps a forgery trace localised and aligns it with the JPEG quantisation grid [34], where compression and blending traces are most visible.

The DC coefficient of a block can be thousands of times larger than a high-frequency one, so raw magnitudes would numerically swamp the small values where artefacts live. Each coefficient is therefore rescaled by a log-magnitude transform,

$$D(u,v)=\log\!\big(1+|F(u,v)|\big),\tag{2.1}$$

which compresses the dynamic range while avoiding the logarithm of zero. The DCT is taken on YCbCr rather than RGB because most frequency traces sit in the brightness channel $Y$, while the chroma channels $C_b,C_r$ carry complementary compression statistics.

The $64$ coefficients of each block are then ordered by increasing frequency along a zigzag path and grouped into $16$ bands. With the zigzag rank written as $\mathit{rank}$, a coefficient is assigned to a band by

$$\mathrm{band}(\mathit{rank})=\big\lfloor \mathit{rank}/4\big\rfloor,\tag{2.2}$$

so four consecutive ranks fall into each band. The per-band feature for band $b$ in channel $c$ is the mean magnitude of its coefficients,

$$g_{b,c}=\frac{1}{|\mathcal{B}_b|}\sum_{(u,v)\in\mathcal{B}_b}\big|F_c(u,v)\big|,\tag{2.3}$$

where $\mathcal{B}_b$ is the set of coefficient positions in band $b$. Stacking $16$ bands across the three YCbCr channels yields a $48$-dimensional descriptor. Averaging within a band, rather than carrying the $64$ raw coefficients, keeps the signature stable and reduces noise.

![Figure 2.5: From an 8x8 DCT block to the 48-dimensional descriptor](figures/fig_1_3_zigzag_detailed.png)

*Figure 2.5: From an $8\times8$ DCT block to the descriptor. The zigzag scan orders the $64$ coefficients by frequency, four consecutive ranks form each of the $16$ bands by Equation (2.2), and the per-band means of Equation (2.3) across three YCbCr channels give the $48$-dimensional feature.*

The $48$-dimensional layout follows the band-region split introduced earlier. The following table gives, per band group, the zigzag ranks, the frequency region, and the content each carries.

*Table 2.9: The 48-dimensional block-DCT feature design.*

| Band group | Zigzag ranks | Frequency region | Carried content | Dimensions |
|---|---|---|---|---|
| Low bands 0 to 3 | 0 to 15 | Low | Coarse content and identity | 4 x 3 = 12 |
| Mid bands 4 to 9 | 16 to 39 | Mid | Upsampling and blending traces | 6 x 3 = 18 |
| High bands 10 to 15 | 40 to 63 | High | Compression noise and edges | 6 x 3 = 18 |

In total, 16 bands x 3 YCbCr channels = 48 dimensions.

The descriptor removes the DC component and keeps the 16 bands. Removing further low bands is offered as an option, since the lowest bands carry mainly image content rather than forgery traces. The naive SFDCT keeps all 16 bands, while the SFDCT-HFF variant described below zeroes the lowest bands to build a high-pass residual. The setting is illustrated in the figure below and specified in the table that follows.

![Figure 2.6: The 48-dimensional band design and the drop-low-band filter](figures/fig_2_dct_feature_design.png)

*Figure 2.6: The 48-dimensional band design and the optional drop-low-band filter. The greyed low bands carry content and are removed so the branch attends to the mid and high bands where forgery traces concentrate.*

*Table 2.10: The drop-low-band setting.*

| Setting | Bands used | Where it is used |
|---|---|---|
| Keep the low bands | DC removed, all 16 bands kept | The naive SFDCT, where the low bands still carry some content |
| Drop the low bands | Mid and high bands only | The SFDCT-HFF variant, which zeroes the lowest bands to form its high-pass residual |

#### (b) Gated cross-attention fusion

The two streams are merged by cross-attention in which the spatial features form the query and the frequency descriptor forms the key and value [30]. Each spatial position queries which frequency traces are relevant in its region and retrieves a weighted summary, so the fusion is selective in space rather than a flat concatenation. With $Q=W_qF_s$, $K=W_kD$, and $V=W_vD$, the attended context is

$$\mathrm{context}=\mathrm{softmax}\!\left(\frac{Q K^{\top}}{\sqrt{d_k}}\right)V,\tag{2.4}$$

where $d_k$ is the key dimension and the $\sqrt{d_k}$ factor keeps the softmax weights from saturating. The context then enters the spatial stream through a gated residual connection whose scalar gate $\alpha$ is initialised to zero [31],

$$F_{\text{fused}}=F_s+\alpha\cdot\mathrm{context},\qquad \alpha \text{ initialised to } 0.\tag{2.5}$$

The zero initialisation is the load-bearing detail. At the first step $\alpha=0$, so $F_{\text{fused}}=F_s$ and the model is exactly the backbone, which realises the floor guarantee of the zero-initialised gate. The coefficient then behaves as a learned strength control [31]: if the frequency context reduces the training loss the gradient opens the gate, and if it is noisy or useless $\alpha$ is driven back towards zero. The learned value of $\alpha$ is therefore also a direct measurement of how much the frequency branch contributes.

![Figure 2.7: Gated cross-attention fusion](figures/fig_1_4_gate_fusion.png)

*Figure 2.7: Gated cross-attention fusion. The spatial features supply the query $Q$ and the frequency descriptor supplies the key $K$ and value $V$. The attended context of Equation (2.4) is added back through the zero-initialised gate of Equation (2.5), so the path starts closed and opens only where the frequency branch helps.*

#### (c) SFDCT-HFF variant

A second variant, **SFDCT-HFF**, keeps the same backbone and the same zero-start gate but represents the frequency information as a high-pass image rather than per-band statistics, following the hierarchical-frequency idea of Luo et al. [7]. The lowest DCT bands are zeroed and an inverse transform reconstructs a residual image in which the high-frequency traces dominate. A multi-scale convolutional stream processes this residual, and a residual-guided attention map directs the spatial stream towards the regions where the high-frequency evidence is strongest. The fused result enters through the identical zero-initialised gated residual defined above, so the floor guarantee carries over unchanged. Because the variant differs from SFDCT only in how the frequency information is carried, any measured difference is attributable to that representation rather than to a different backbone, loss, or gate.

![Figure 2.8: The SFDCT-HFF variant](figures/fig_arch_sfdct_hff.png)

*Figure 2.8: The SFDCT-HFF variant. Low bands are zeroed and inverse-transformed into a high-pass residual image, a multi-scale stream extracts its features, and a residual-guided attention map feeds the same zero-initialised gate as in Figure 2.7.*

The frequency signal these modules exploit is real. Averaged over a face crop, genuine faces consistently carry more mid- and high-band energy than fakes, because generative pipelines over-smooth the face and lose fine detail. The figure below shows this per-band energy gap. The gap is smaller on compressed data, since compression itself removes high frequencies, which is the honest reason the frequency improvement is expected to be modest.

![Figure 2.9: Mean frequency energy per band for real and fake faces](figures/fig_3_11_frequency.png)

*Figure 2.9: Mean frequency energy per band for real and fake faces, with the difference. The mid and high bands carry the discriminative signal that the block-DCT branch is designed to read.*

## 2.4 Liveness Detection

Liveness detection is the secondary module of the system and stays subordinate to the deepfake method described above. It is not a separate model line but reuses the SFDCT components: the same MTCNN face crop [17], the same EfficientNet-B4 spatial backbone [1], and, for the proposal, the same block-DCT frequency branch and zero-initialised gated fusion. Two heads are compared, a spatial-only baseline and a spatial-plus-frequency proposal, mirroring the deepfake comparison one for one, and the module is trained and measured on a public anti-spoofing dataset. Following the international presentation-attack-detection standard [13], the attack (spoof) is the positive class throughout.

This head runs first in the eKYC cascade described at the start of this chapter, where a spoof or uncertain verdict stops the request before any deepfake compute is spent.

### 2.4.1 Model Architectures

The liveness head consumes the same face crop produced by the shared preprocessing pipeline described below, so the model differs from the deepfake side only in its classification target. Two architectures are compared, and both learn their features end to end rather than through a separate feature-engineering step.

The **baseline** is the most common deep anti-spoofing design: EfficientNet-B4 [1] as a spatial-only backbone followed by a small two-layer binary head that decides live or spoof. It is fine-tuned from ImageNet weights or from the deepfake checkpoint, which already carries a strong facial prior. The figure below shows the single-stream flow from crop to verdict.

![Figure 2.10: Architecture of the B4-liveness baseline](figures/fig_2_b4_liveness.png)

*Figure 2.10: Architecture of the B4-liveness baseline: EfficientNet-B4 as a spatial-only extractor feeding a binary head.*

The **proposal** reuses the spatial-plus-frequency design of SFDCT directly: the EfficientNet-B4 spatial branch, the same block-DCT frequency branch described above, the zero-initialised gated cross-attention defined above, and the same binary head. Because the gate starts closed, the proposal begins numerically equal to the baseline and can only add value once the gate opens, the same floor guarantee used on the deepfake side. The physical justification carries over: replay and print attacks leave faint frequency traces, the recapture peaks of a photographed screen and the dot pattern of a printer, that are weak in the pixel domain but visible in the frequency domain.

![Figure 2.11: Architecture of the B4+DCT-liveness proposal](figures/fig_2_b4dct_liveness.png)

*Figure 2.11: Architecture of the B4+DCT-liveness proposal: the SFDCT spatial branch, block-DCT frequency branch, and zero-start gated fusion, reused for the live-or-spoof decision.*

One caveat belongs with the architecture. The recapture peaks are strongest for replay attacks, whereas print artefacts are mainly the dot pattern and printing noise, so the frequency branch may help replay more than print. Pairing the baseline against the proposal on the same backbone lets the thesis ask, for liveness, the question it asks for deepfake: whether the frequency branch generalises across attack types. The closest prior art is the family of two-stream spatial-and-frequency anti-spoofing models, distinguished here by the block-wise DCT, the gated fusion, and a backbone shared with the deepfake task. No claim of novelty is made without a proper check.

### 2.4.2 Datasets and Preprocessing

Two still-image anti-spoofing datasets are used, chosen to be cheap and reusable. LCC-FASD [28], roughly eighteen thousand images covering print and replay attacks, is the primary training and evaluation set: it downloads without a licence agreement, its crops match the SFDCT input pipeline, and it trains on a single mid-range GPU. NUAA Imposter [26], roughly twelve thousand grayscale print-attack images, serves as a smoke-test and sanity set beyond the primary set. Heavier or licence-locked collections, including multi-modal sets with depth and infrared channels, are deliberately avoided, and where a community number is needed the published result is cited rather than reproduced.

_Table 2.11: Liveness datasets and their role (from FULL Table 2.12)._

| Dataset | Scale | Attack types | Role |
|---|---|---|---|
| LCC-FASD [28] | ~18,000 images | print, replay | primary training and evaluation |
| NUAA Imposter [26] | ~12,000 grayscale images | print | smoke-test and sanity check |

The preprocessing reuses the SFDCT pipeline exactly: detect the face with MTCNN [17], align, crop to a fixed size, and normalise, so one crop can feed either head. Augmentation mirrors the deepfake pipeline (horizontal flip, mild photometric jitter, and the same moderate JPEG compression). The moderate compression range is relevant here, since heavy compression would remove the recapture peaks that a screen-replay attack leaves [34].

### 2.4.3 Role in the eKYC Cascade

In the eKYC cascade described at the start of this chapter, the liveness head acts as a **pre-filter**. It does not introduce a new frequency design. The block-DCT frequency branch of the deepfake method (the same 8×8 block partition, the same 16 zigzag bands, the same per-band log-magnitude summary described above) is carried over without re-tuning. Keeping the settings identical lets a single module serve both tasks and lets the floor guarantee of the closed gate transfer cleanly to the liveness setting.

_Table 2.12: Justification for the main liveness design choices (from FULL Table 2.11 / Table 2.13)._

| Design choice | Justification |
|---|---|
| Reuse the SFDCT preprocessing | the same crops feed both the deepfake and liveness heads |
| Same 8×8 block and 16 bands | the frequency branch is literally the same module as in deepfake detection |
| Moderate compression range | heavy compression would erase the recapture peaks the frequency branch reads |
| Lightweight datasets | training and evaluation run on a single mid-range GPU without licence locks |

### 2.4.4 Training and Evaluation

Both heads are trained with the same binary cross-entropy as the deepfake loss defined earlier, here over the live-and-spoof label. The head maps the fused feature vector $z$ to a single spoof probability $p$ through a sigmoid, $p=\sigma(w^{\top}z+b)$, and the loss penalises $p$ against the label $y$, zero for a live face and one for a spoof. The proposal reuses the same gated fusion with the gate starting closed, so it begins equal to the baseline and can only add value as the gate opens.

The presentation-attack metrics APCER, BPCER, and ACER were defined in the introduction, following the international standard [13], and are not re-derived here. The following table records the label and metric mapping for the head. The area under the ROC curve [21] is the primary number, being threshold-independent and mirroring the deepfake reporting. The operating threshold is chosen at the equal-error point on a development split and then fixed, never tuned on the test set, exactly as in the deepfake protocol. For eKYC, the genuine-rejection rate is additionally reported at the operating point where the attack-acceptance rate is at most five percent, tying the liveness budget to the deepfake side. Targets for these metrics were recorded before training, so the plan carried a concrete success criterion from the start.

*Table 2.5: Liveness label mapping.*

| Class | Label | Definition |
|---|---|---|
| live (bona fide) | 0 | Genuine live face, the negative class |
| spoof (presentation attack) | 1 | Print, replay, or mask attack, the positive class [13] |

The full label and metric mapping is recorded below.

| Item | Definition |
|---|---|
| Class 0 | live (genuine) face, negative class |
| Class 1 | spoof / presentation attack, positive class [13] |
| Output | spoof probability $p=\sigma(w^{\top}z+b)$, with a live/spoof verdict at the fixed threshold |
| APCER | attacks wrongly accepted as live (the dangerous error) [13] |
| BPCER | genuine users wrongly rejected |
| ACER | average of APCER and BPCER at one threshold |
| Primary metric | AUC of the ROC curve (threshold-independent) [21] |
| Operating threshold | equal-error point fixed on a development split, with the eKYC point reporting BPCER at APCER ≤ 5% |

As with the deepfake branch, the frequency stream does not improve over the spatial head on this dataset. This is an honest negative, reported rather than hidden, and the closed-gate floor guarantee makes it safe to attempt.

## 2.5 Conclusion

This chapter defined the proposed method. SFDCT keeps a strong spatial backbone and adds a block-DCT frequency branch, joining the two through a cross-attention fusion whose gate starts at zero, so the model begins equal to the backbone and can only improve as the frequency branch proves useful. The high-pass variant carries the same idea with a residual image in place of per-band statistics. The same design is reused for liveness, where a spatial-only baseline is compared against a spatial-plus-frequency proposal on a shared backbone. Whether each addition earns its place is the question the results chapter answers.
