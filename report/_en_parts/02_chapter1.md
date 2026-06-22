# CHAPTER 1: THEORIES AND TECHNOLOGIES

This chapter establishes the theoretical foundation required to understand the **SFDCT** method (Hybrid Spatial–Frequency Learning with Block-wise DCT) proposed in this thesis. The narrative proceeds from *why deepfake detection is needed* (the technical nature of forgery technology and the traces it leaves behind), to *the core problem and challenge* (cross-dataset generalisation), then to *the technical tools* (EfficientNet-B4 for the spatial domain, block-DCT for the frequency domain, attention mechanisms for fusion), and finally to *the foundations of the five improvement levers* (S1–S5) together with the *eKYC application context*. The guiding philosophy throughout is to present intuition first and formulas second; each concept is anchored by a mapping table or a brief illustrative example.

## 1.1 Overview of Deepfake Technology

### 1.1.1 Why we must understand how deepfakes are generated

Before building a detector, we must understand how the *adversary* creates fake images. The reason is highly practical: every fake-image generation method leaves behind a kind of "fingerprint" characteristic of its generation pipeline. If we understand the pixel-transformation steps a generative algorithm performs, we know *where to look for the traces* — and more importantly, in *which representation domain* (spatial or frequency) those traces are most visible. This is precisely the cornerstone of the entire thesis: the argument that certain traces are almost invisible in the spatial domain yet become "loud" in the mid- and high-frequency bands.

### 1.1.2 Three families of face-forgery techniques

The term "deepfake" covers many different techniques. They can be reduced to three dominant architectural families:

**(a) Autoencoder face-swap.** This is the classic architecture behind tools such as FaceSwap/DeepFaceLab. The idea is to train two autoencoders that *share a common encoder* but have two separate decoders for two identities A and B. The encoder learns a compressed (latent) representation that is identity-invariant — encoding pose, expression, and lighting. At inference time, we feed face A into the encoder and then *combine* it with B's decoder, obtaining face B with the pose and expression of A. The final step is always to **blend** the generated face region back into the original frame — and it is precisely this blending step that creates the **blending boundary**.

**(b) GAN (Generative Adversarial Network).** A *generator* network learns to transform noise/input images into fake images, competing against a *discriminator* network that learns to distinguish real from fake; the two networks train adversarially until the fake images are realistic enough to fool the discriminator. The GAN is the core of many high-quality face synthesisers (for example StyleGAN). The key point for this thesis is that the generator almost always builds a high-resolution image from a low-resolution tensor through **upsampling** layers (transposed convolution or interpolation + convolution). This upsampling process leaves behind **upsampling artifacts** — periodic patterns that manifest as abnormal spectral peaks in the frequency spectrum [n].

**(c) Diffusion model.** The newest generation synthesises images by learning to reverse a process of gradually adding noise: starting from pure Gaussian noise, a denoising network iterates over many steps to reconstruct an image. Diffusion produces very high quality but still leaves frequency statistics that differ from those of natural photographs. Within the scope of this thesis, diffusion is mentioned as a trend that the detector should eventually generalise to (a future-work direction), while the main training data (FF++) belongs to the first two families.

[[HÌNH 1.1: minh hoạ ba pipeline sinh khuôn mặt giả (autoencoder face-swap, GAN, diffusion) với điểm chung là bước upsampling/blending cuối cùng để lại artifact]]

### 1.1.3 Four forgery families in FaceForensics++

The standard FaceForensics++ (FF++) dataset [n] aggregates four forgery methods, representing two major manipulation types — *identity swap* and *expression reenactment*:

[[BẢNG 1.1: Bốn họ giả mạo trong FF++ — cơ chế và loại dấu vết chính]]

| Method | Manipulation type | Core mechanism | Characteristic trace |
|---|---|---|---|
| **Deepfakes** | Identity swap | Autoencoder swaps identity then blends into the frame | Blending boundary, texture inconsistency between face region and background |
| **Face2Face** | Expression reenactment | 3D-model-based expression reenactment, re-rendering the mouth/face region | Rendering errors, boundary noise around the reenacted region |
| **FaceSwap** | Identity swap | Graphics-based face swap, matching 3D landmarks then blending | Rigid geometric seams, lighting inconsistency |
| **NeuralTextures** | Expression reenactment | Learned neural textures combined with differentiable rendering (neural rendering) | Subtle artifacts around the mouth, hard to see in the spatial domain |

These four families were chosen because they span both *deep-learning-based* manipulations (Deepfakes, NeuralTextures) and *traditional graphics-based* manipulations (Face2Face, FaceSwap), forcing the detector to learn *common* traces rather than memorising a single type of artifact.

### 1.1.4 Forgery traces: weak in the spatial domain, clear in the frequency domain

This is the *central thesis* of the work, so the intuition deserves to be made explicit. The three most common types of trace are:

1. **Blending boundary.** When the generated face region is blended into the original frame, two regions with different statistics (sharpness, sensor-noise level, colour balance) are forced to meet. In the pixel domain, smoothing techniques (feathering, Poisson blending) render the boundary almost invisible to the human eye. However, this smoothing alters the *local frequency structure*: it abnormally suppresses part of the high-frequency energy around the boundary.

2. **Upsampling artifact.** As noted above, the upsampling layers of a GAN/decoder produce periodic grid-like patterns. The human eye barely perceives them, but in the DCT/Fourier spectrum they manifest as *energy peaks* clearly localised in the mid- and high-frequency bands [n].

3. **Frequency inconsistency.** A real camera applies a processing chain (demosaicing, JPEG compression) that produces a natural and *consistent* frequency-statistics "signature" across the whole image. Fake images composited from multiple sources or passed through a generative network typically violate this consistency, leaving phase and amplitude mismatches across the frequency bands.

**Why does this matter for the design?** A spatial CNN learns filters over the pixel grid; it *can* indirectly capture some frequency artifacts, but it does so inefficiently because these traces have very small amplitude and are "submerged" in the image content. By contrast, if we *actively* project the image into the frequency domain (via block-DCT), the frequency artifacts are "pulled out" into discrete coefficients that are easy to separate from the content. This is precisely the motivation for adding a **frequency branch** in parallel with the spatial backbone — and the direct rationale for SFDCT's two-branch architecture.

[[HÌNH 1.2: so sánh trực quan — biên hoà trộn gần như vô hình ở ảnh pixel (trái) nhưng lộ rõ thành đỉnh năng lượng ở phổ DCT log-magnitude (phải)]]

## 1.2 The Deepfake Detection Problem and the Generalisation Challenge

### 1.2.1 Definition of the binary classification problem

At the most basic level, deepfake detection is a frame-level **binary classification** problem: given a face image $x$, the model $f_\theta$ outputs a probability

$$
\hat{y} = f_\theta(x) \in [0, 1],
$$

where $\hat{y}$ is the probability that the image belongs to the **FAKE** class; the ground-truth label is $y \in \{0, 1\}$ with $0 = $ REAL, $1 = $ FAKE. The model is trained with the binary cross-entropy loss:

$$
\mathcal{L}_{\text{BCE}} = -\big[\, y \log \hat{y} + (1 - y)\log(1 - \hat{y}) \,\big].
$$

Because this is a frame-level problem, a video is scored by aggregating the per-frame probabilities (for example by averaging), but the *headline metric* of this thesis remains **frame-level AUC** — a direct measure of the ability to separate real from fake at the image level.

**Why use AUC rather than accuracy?** Accuracy depends on a fixed decision threshold and is highly sensitive to class imbalance — whereas deepfake sets are typically strongly skewed (more fakes than reals). **AUC (Area Under the ROC Curve)** measures the probability that the model ranks a random FAKE sample higher than a random REAL sample, *independently of any threshold*. This is why AUC is the de-facto standard metric in deepfake benchmarks.

[[BẢNG 1.2: Ánh xạ ký hiệu bài toán]]

| Symbol | Role | Meaning |
|---|---|---|
| $x$ | Input | 256×256 face-crop image |
| $f_\theta$ | Model | Detector with parameters $\theta$ |
| $\hat{y}$ | Output | Probability of being FAKE, $\in [0,1]$ |
| $y$ | Label | 0 = REAL, 1 = FAKE |
| AUC | Metric | Real–fake separability, threshold-independent |

### 1.2.2 The paradox: high in-dataset, dropping cross-dataset

A modern model trained and tested *on the same dataset* (in-dataset) usually attains a very high AUC — not uncommonly exceeding 0.99 on FF++. But when the same model is tested on a *different* dataset (cross-dataset), for example Celeb-DF-v2, the AUC typically drops sharply to around 0.6–0.75. This is the **generalisation paradox** — and the central challenge this thesis targets.

**Why does it drop?** At its core, the model learns to *mistakenly* rely on *method-specific artifacts* characteristic of a particular generation pipeline rather than on *common* traces shared by all forgery types. For example, a model may inadvertently learn that "images generated by Deepfakes-FF++ exhibit an upsampling grid pattern at frequency $k$"; this pattern disappears entirely when the model encounters Celeb-DF (which uses a different synthesis pipeline), so the model loses its bearings. This phenomenon is a form of *overfitting to the training set's artifacts*.

**Design implication.** To generalise, we must steer the model towards traces that are *invariant* to the generation pipeline. This is precisely why the thesis prioritises the *frequency domain*: shared physical principles (every generative network must upsample, every blend breaks frequency consistency) produce a more universal class of traces than any specific spatial-domain texture. It is also why the thesis's evaluation protocol *deliberately* places training and testing on two different datasets (FF++ → CDFv2) — to measure exactly what we care about: the ability to generalise.

### 1.2.3 Robustness to image compression

The real eKYC context is this: the images/videos a user uploads are almost always **compressed** (JPEG for images, H.264 for video) when transmitted over the network. Compression does two things that are detrimental to a detector: (i) it *erases* part of the high-frequency energy — where many forgery artifacts reside; and (ii) compression itself introduces **block artifacts** (JPEG's 8×8 block patterns) that can be confused with forgery traces. For this reason FF++ is used at the **c23** compression level (moderate compression, H.264 CRF 23) — a *realistic* compression level, neither too ideal (raw) nor too heavy (c40). Training on c23 helps the model become accustomed to a signal-degradation level close to operating conditions. A detector useful for eKYC must be *robust* to compression — this is an implicit criterion running through the design of the frequency branch (which will prioritise frequency bands that remain sufficiently stable under compression).

## 1.3 Standard Datasets and Evaluation Protocol

### 1.3.1 FaceForensics++ (c23) — training set

FaceForensics++ [n] is the foundational dataset for face-forgery detection. It contains **1000 real videos** (collected from YouTube) and four corresponding sets of fake videos generated by the four methods listed in Table 1.1 (Deepfakes, Face2Face, FaceSwap, NeuralTextures). Each compression level is released in three versions: raw (uncompressed), **c23** (light–moderate compression, H.264 CRF 23) and c40 (heavy compression). The thesis uses the **c23** version because it balances realism (resembling images transmitted over the network) with retaining enough frequency traces to learn from.

### 1.3.2 Celeb-DF-v2 — cross-dataset test set

Celeb-DF-v2 (CDFv2) [n] is a *high-quality* deepfake dataset designed to be harder than FF++: it contains **590 real videos** of celebrities and **5639 deepfake videos** refined to minimise the coarse artifacts (colour flicker, visible boundaries) that were easy to spot in older datasets. Because CDFv2 uses a synthesis pipeline *entirely different* from FF++, it is an ideal generalisation test: a model that merely memorises FF++ artifacts will drop heavily on CDFv2. **Importantly: CDFv2 is used only for TESTING and must never be used for training** — this is a mandatory condition of a fair cross-dataset evaluation.

### 1.3.3 The DeepfakeBench evaluation protocol

DeepfakeBench [n] is a framework that standardises the training and evaluation of deepfake detectors in order to eliminate the inconsistencies (in pre-processing, splitting, and metric computation) that make figures across papers difficult to compare. The thesis protocol follows it:

- **Train**: on FF++ (c23).
- **Cross-dataset test**: on Celeb-DF-v2.
- **Headline metric**: frame-level AUC on CDFv2.
- **Standard hyperparameters**: batch size 32, frame_num 32, Adam optimizer, learning rate 2e-4, 256×256 input images.

Adhering to DeepfakeBench enables direct comparison with the leaderboard: the thesis's EfficientNet-B4 baseline attains a CDFv2 frame-AUC of **0.7497**, close to the leaderboard figure (≈0.7487) — *confirming the pipeline is built correctly* before any improvement is undertaken.

[[BẢNG 1.3: Tóm tắt thống kê hai bộ dữ liệu]]

| Property | FaceForensics++ (c23) | Celeb-DF-v2 |
|---|---|---|
| Role | Train | Test (cross-dataset) |
| Real videos | 1000 | 590 |
| Fake videos | 4000 (4 methods × 1000) | 5639 |
| Number of fake methods | 4 | 1 (unified pipeline) |
| Compression level used | c23 (H.264 CRF 23) | MPEG-4/H.264 (CDFv2 release) |
| Number of extracted frames | ≈ 159,626 | 16,420 (test set used for evaluation) |
| Frames per video | 32 (frame_num) | 32 (frame_num) |

## 1.4 Spatial Feature Extraction: EfficientNet-B4

### 1.4.1 Why a strong spatial backbone is needed

Although the central thesis of the work concerns the *frequency domain*, we still need a good spatial backbone to serve as the "spine": many forgery traces (skin-texture inconsistency, eye/teeth-region errors, lighting mismatches) are inherently *spatial phenomena*. The frequency branch is designed to *complement* rather than replace this part. The question is: which backbone is both strong and parameter-efficient?

### 1.4.2 Compound scaling — the core idea of EfficientNet

EfficientNet [n] stems from a simple observation: when seeking to increase a CNN's capacity, there are three "knobs" to turn — **depth** (number of layers), **width** (number of channels) and **input resolution**. Prior designs typically turned only one knob (for example, ResNet went deeper). EfficientNet showed that turning all three knobs *simultaneously and proportionally* according to a common ratio (**compound scaling**) yields a far better accuracy/FLOPs trade-off. Specifically, given a resource coefficient $\phi$, the three dimensions are scaled as:

$$
\text{depth} = \alpha^{\phi}, \quad \text{width} = \beta^{\phi}, \quad \text{resolution} = \gamma^{\phi},
$$

subject to the constraint $\alpha \cdot \beta^{2} \cdot \gamma^{2} \approx 2$ (keeping the FLOPs increase approximately $2^{\phi}$-fold), where $\alpha, \beta, \gamma$ are found by a small grid search on the base network. Increasing $\phi$ produces the B0 → B7 family; **B4** is a well-balanced, "mid-range" point within this family.

[[BẢNG 1.4: Ba chiều scaling của EfficientNet]]

| Scaling dimension | What is turned | Benefit | Risk if turned in isolation |
|---|---|---|---|
| Depth ($\alpha^\phi$) | Number of layers | Captures more complex/abstract features | Harder to train (vanishing gradient) |
| Width ($\beta^\phi$) | Number of channels | Captures more fine-grained features | Saturation, poor parameter efficiency |
| Resolution ($\gamma^\phi$) | Input image size | Sees small details (subtle artifacts) | FLOPs grow rapidly |

### 1.4.3 The MBConv block — the building unit

The basic unit of EfficientNet is the **MBConv** (Mobile Inverted Bottleneck Convolution), inherited from MobileNetV2. The intuition behind MBConv comprises three steps: (i) **expand** — a 1×1 convolution increases the number of channels (for example ×6) to create a wide representation space; (ii) **depthwise convolution** — a per-channel convolution (far cheaper than full convolution) to learn spatial patterns; (iii) **project** — a 1×1 convolution compresses the channels back to a small number (bottleneck). Each block also includes a **Squeeze-and-Excitation (SE)** module — which learns a *per-channel importance* weight to amplify useful channels and suppress noisy ones — together with a **residual connection** when the input and output dimensions match. This "expand-then-compress" structure (inverted bottleneck) enables learning rich representations while remaining parameter-efficient.

Worth noting for this thesis: the SE module is essentially a form of **channel attention** based on global statistics (global average pooling). This is the theoretical bridge to the **S4 (FcaNet)** lever in Section 1.7 — which *generalises* SE by replacing average pooling with multiple DCT components, that is, still channel attention but more *frequency-rich*.

[[HÌNH 1.3: kiến trúc khối MBConv — expand 1×1 → depthwise conv → SE → project 1×1 + residual]]

### 1.4.4 Why B4 was chosen and transfer learning from ImageNet

The choice of **B4** (rather than the smaller B0 or the larger B7) rests on three reasons:

1. **Leaderboard comparison.** EfficientNet-B4 is the backbone *commonly used* in DeepfakeBench baselines, so choosing B4 enables fair comparison and pipeline confirmation (as in the 0.7497 ≈ 0.7487 figure noted above).
2. **Resource balance.** B4 is large enough to learn subtle forgery features yet still fits a mid-range GPU, allowing batch size 32 at 256×256 resolution.
3. **Suitable resolution.** B4 was originally designed for ~380px input images; at 256×256 it still operates well and retains enough detail to capture small artifacts.

**Transfer learning.** The backbone is initialised with weights **pretrained on ImageNet** rather than trained from scratch. The reason: the low-level filters (edges, corners, textures) learned from millions of natural images are *generic* and immediately reusable; we need only fine-tune the high-level layers for the forgery-detection task. This saves data, shortens convergence time, and usually yields better generalisation. Input images are normalised with mean = std = 0.5 (mapping pixels to the range $[-1, 1]$), in line with the thesis's pipeline configuration.

## 1.5 The Discrete Cosine Transform (DCT) and Frequency-Domain Analysis

### 1.5.1 Why use DCT rather than Fourier

In Section 1.1 we argued that forgery artifacts are clearly revealed in the frequency domain. So which *transform* should be used to convert an image to the frequency domain? The thesis's choice is the **DCT (Discrete Cosine Transform)** rather than the DFT/FFT, for three reasons: (i) the DCT yields *real coefficients* (no complex imaginary part as in the Fourier transform), making it easy to feed into a neural network; (ii) the DCT has excellent **energy compaction** — it concentrates most of the signal's energy into a few low-frequency coefficients, making the "residual" at high frequencies (where artifacts reside) stand out; (iii) the DCT is *exactly* the transform that the **JPEG** compression standard applies to each 8×8 block — so block-DCT is the most natural way to inspect traces related to compression and the block grid.

### 1.5.2 One-dimensional and two-dimensional DCT

**One-dimensional DCT (1D-DCT).** Given a discrete signal $x[n]$, $n = 0,\dots,N-1$, the DCT-II (the most commonly used type) defines the $k$-th frequency coefficient:

$$
X[k] = c(k)\sum_{n=0}^{N-1} x[n]\,\cos\!\left[\frac{\pi (2n+1)k}{2N}\right], \quad k = 0,\dots,N-1,
$$

with normalisation coefficients $c(0) = \sqrt{1/N}$ and $c(k) = \sqrt{2/N}$ for $k \ge 1$. Intuition: each $X[k]$ measures the *degree of similarity* between the signal and a cosine wave of frequency $k$. The coefficient $X[0]$ (called the **DC** term) is proportional to the mean value of the signal; the $X[k]$ for large $k$ (called high-frequency **AC** terms) capture rapid variations — sharp edges, noise, and fine patterns.

**Two-dimensional DCT (2D-DCT).** For an image block $B(i,j)$ of size $M \times N$, the 2D-DCT is the application of the 1D-DCT successively along the rows and then the columns (separable):

$$
F(u,v) = c(u)\,c(v)\sum_{i=0}^{M-1}\sum_{j=0}^{N-1} B(i,j)\,\cos\!\left[\frac{\pi(2i+1)u}{2M}\right]\cos\!\left[\frac{\pi(2j+1)v}{2N}\right].
$$

The result $F(u,v)$ is a grid of coefficients: the top-left corner $(u,v)=(0,0)$ is the DC term ("coarse" energy/content); moving away from that corner towards the bottom-right gives increasingly high frequencies in both the vertical and horizontal directions.

[[BẢNG 1.5: Ý nghĩa vị trí hệ số trong khối 2D-DCT]]

| Coefficient position $(u,v)$ | Name | What it captures | Relation to forgery artifacts |
|---|---|---|---|
| $(0,0)$ | DC | Average brightness of the block | Carries content → prone to content leakage |
| Near top-left corner | Low frequency | Slow variation, coarse shape | Few artifacts |
| Mid region | Mid frequency | Texture, moderate patterns | Upsampling/blending artifacts clearly revealed |
| Bottom-right corner | High frequency | Sharp edges, noise, fine detail | Frequency inconsistency, compression traces |

### 1.5.3 Block-wise DCT 8×8 and the JPEG connection

Instead of applying the DCT to the *whole image* (global DCT — which mixes global content and makes it hard to isolate local artifacts), the thesis uses **block-wise DCT 8×8**: the image is divided into a grid of non-overlapping 8×8 blocks, and the 2D-DCT is applied *independently* to each block. This is *exactly* JPEG's unit of processing. The benefits are: (i) localising artifacts to *local regions* (a blending boundary affects only a few blocks around the edge); (ii) matching the JPEG compression grid, making it easy to detect both compression traces and forgery traces; (iii) low computational cost (the 8×8 DCT has fast algorithms). Each 8×8 block yields 64 coefficients $F(u,v)$, ordered from DC (top-left corner) to the highest frequency (bottom-right corner).

### 1.5.4 Zigzag scan and the 16 frequency bands

The 64 coefficients within an 8×8 block are not used individually — there are too many dimensions and too much noise. Instead, they are grouped into **frequency bands** based on the **zigzag scan**: a zigzag path that starts at the DC corner, traverses the anti-diagonals, and ends at the highest-frequency coefficient. Coefficients lying on the same anti-diagonal share the same total frequency level $(u+v)$, so the zigzag arranges the 64 coefficients into a sequence of *increasing frequency*. This is also exactly the order JPEG uses for encoding (because, after quantisation, the high-frequency coefficients are usually zero and lie adjacent at the end of the sequence, making them compressible).

The thesis groups the 64 (zigzag-ordered) coefficients into **16 frequency bands** from DC → high-frequency, then *computes statistics per band* (for example the mean energy/log-magnitude of each band) to form a compact and stable frequency feature. An important option is **drop low bands**: discarding the DC and the few lowest bands, since these bands mainly carry *content* — retaining them risks the model learning along the image content (content leakage) rather than learning forgery traces. Removing them forces the frequency branch to focus on the mid–high bands, precisely where artifacts reside.

[[HÌNH 1.4: minh hoạ zigzag scan trên khối 8×8 và cách gom 64 hệ số thành 16 dải tần số từ DC đến high-frequency]]

### 1.5.5 Log-magnitude

The amplitude of DCT coefficients spans a very wide dynamic range: the DC coefficient can be thousands of times larger than a high-frequency coefficient. Feeding the raw amplitude directly into a network would cause the high-frequency coefficients (which are precisely where the artifacts are!) to be numerically "swallowed". The **log-magnitude** transform addresses this:

$$
D(u,v) = \log\big(1 + |F(u,v)|\big).
$$

The function $\log(1+\cdot)$ compresses the dynamic range, lifting the small coefficients into *numerically meaningful* signals while avoiding $\log(0)$. After this transform, the high-frequency artifact peaks become *observable*, and the network can learn them stably.

### 1.5.6 The YCbCr colour space

In this thesis the DCT is applied not to the RGB channels but to **YCbCr**: the luminance channel **Y** and the two chrominance channels **Cb, Cr**. There are two reasons: (i) YCbCr separates *brightness* from *colour*, mirroring the way the human visual system and the JPEG standard operate — and most frequency traces reside in the Y channel; (ii) JPEG compresses Cb, Cr more heavily than Y (chroma subsampling), so the frequency statistics on these channels carry complementary information about compression/forgery traces. Applying block-DCT independently on all three channels gives a more complete frequency picture than using RGB or grayscale alone.

### 1.5.7 Summary: why block-DCT exposes artifacts

Taken together, the processing chain **YCbCr → block-DCT 8×8 → zigzag → 16 bands → log-magnitude (→ drop low bands)** turns a face image into a frequency representation that is *compact, locally localised, dynamic-range-normalised, and content-reduced*. In this representation, the three types of trace from Section 1.1.4 — upsampling peaks, blending-boundary inconsistency, and frequency-statistics mismatch — all become *clear patterns* that a lightweight network branch can learn. This is the input to the frequency branch of SFDCT.

## 1.6 Attention Mechanisms and Feature Fusion

### 1.6.1 Why attention is needed to fuse the two branches

We now have two information streams: *spatial* features from EfficientNet-B4 and *frequency* features from the block-DCT branch. The fusion question is: how should they be *combined*? The crudest approach — concatenation followed by a fully-connected layer — has two drawbacks: (i) it mixes them *indiscriminately*, giving the model no way to decide *when* and *where* the frequency information is trustworthy; (ii) it *breaks* equivalence with the original backbone (no longer guaranteeing "no worse than B4"). The **attention** mechanism solves both: it allows the spatial features to *actively query* the frequency features selectively.

### 1.6.2 Self-attention and cross-attention

**Self-attention** is a mechanism that lets each position in a feature sequence "look at" every other position and aggregate information weighted by relevance. It relies on three projection matrices: **Query** ($Q$), **Key** ($K$), **Value** ($V$). The scaled dot-product attention formula [n] is:

$$
\text{Attention}(Q, K, V) = \text{softmax}\!\left(\frac{QK^{\top}}{\sqrt{d_k}}\right)V,
$$

where $QK^\top$ measures the similarity between queries and keys (producing the *attention weights*), $\sqrt{d_k}$ is the scaling factor that prevents softmax saturation, and multiplication by $V$ returns a weighted combination of the values. Intuition: "for each question $Q$, take a weighted average of the values $V$, with high weight where $K$ matches $Q$."

**Cross-attention** is a variant in which $Q$ comes from *one source* while $K, V$ come from *another source*. This is exactly what we need for fusion: set $Q$ = spatial features (x), and $K, V$ = frequency features (DCT). Each spatial position then "asks" the frequency branch: *"in this region, which frequency traces are relevant?"* and retrieves a **context vector** aggregated from the most relevant DCT features. This is the essence of the "gated cross-attention" that SFDCT uses to inject frequency information into the spatial stream.

[[BẢNG 1.6: Ánh xạ vai trò Q/K/V trong cross-attention của SFDCT]]

| Component | From branch | Role |
|---|---|---|
| Query $Q$ | Spatial (B4) | "Question": what frequency information does this region need? |
| Key $K$ | Frequency (block-DCT) | "Index": what each frequency feature describes |
| Value $V$ | Frequency (block-DCT) | "Content": the frequency information retrieved |
| Context | — | Weighted combination of $V$, injected back into the spatial stream |

### 1.6.3 Gated fusion and the meaning of the alpha gate

SFDCT does not inject the frequency context directly into the spatial stream, but rather through a **gate** with a learnable coefficient $\alpha$:

$$
\text{feature}_{\text{fused}} = x + \alpha \cdot \text{context}(\text{DCT}),
$$

where $x$ is the spatial feature, $\text{context}(\text{DCT})$ is the frequency context vector retrieved via cross-attention, and $\alpha$ is a *learnable* parameter. Intuition: $\alpha$ acts as a "volume knob" for the frequency branch. If, during training, the frequency information is *useful*, the gradient pushes $\alpha$ higher (opening the gate); if it is noisy/useless, $\alpha$ is forced towards 0 (closing the gate). The learned value of $\alpha$ is therefore a *quantitative indicator* of how much the frequency branch contributes — and the thesis visualises it through the figure `gate_alpha.png` to explain the model.

### 1.6.4 Zero-init: why it guarantees a floor ≥ backbone

This is a *pivotal* design choice from a risk standpoint. We initialise $\alpha = 0$ at the very start of training (**zero-init**). The consequence is that, at initialisation,

$$
\text{feature}_{\text{fused}} = x + 0 \cdot \text{context}(\text{DCT}) = x,
$$

meaning the model is *exactly equal* to a pure EfficientNet-B4. At this point the entire frequency branch *does not* perturb the pretrained spatial stream. The subsequent training process then only *gradually opens* the gate $\alpha$ if — and only if — the frequency information genuinely reduces the loss. This creates a **guaranteed floor**: in the worst case (a useless frequency branch), $\alpha$ stays near 0 and the model is *never worse* than B4. This is precisely why the thesis can claim a "risk-safe" property for the architecture — an important design contribution, especially meaningful in the eKYC context where *reliability* is paramount.

[[HÌNH 1.5: sơ đồ gated cross-attention fusion với cổng alpha zero-init — tại init nhánh tần số bị đóng (alpha=0), mô hình tương đương B4]]

## 1.7 Foundations of the Inherited Frequency Techniques (basis for the five levers S1–S5)

This section presents the *original principle* of each of the five works the thesis inherits from, each work corresponding to one improvement "lever" $S1$–$S5$. The goal here is only the *theoretical basis*: to state the original idea and the *direction of adaptation* to the block-DCT domain; the technical details and implementation formulas are reserved for Chapter 2.

### 1.7.1 SPSL — phase spectrum → S1 (dct_use_sign)

**Original idea.** SPSL (Spatial-Phase Shallow Learning) [n] showed that the *phase spectrum* of an image, not just the magnitude, carries important traces of upsampling: upsampling operations distort the phase structure in a characteristic way. SPSL exploits phase information to detect forgery and is shown to generalise well.

**Adaptation to block-DCT.** The DCT yields *real* coefficients and therefore has no "phase" in the Fourier sense; however, the **sign** of a DCT coefficient is a quantity *analogous to phase* — it encodes the direction of the cosine component. The **S1 (`dct_use_sign`)** lever therefore adds the *sign* of the DCT coefficients to the frequency feature (instead of using only the log-magnitude, which discards the sign). The principle: provide the network with a "phase-analog" signal without leaving the DCT domain.

### 1.7.2 SRM — high-pass noise residual → S2 (dct_srm_residual)

**Original idea.** SRM (Spatial Rich Model) [n], originating from steganalysis, uses a set of fixed **high-pass** filters to extract a **noise residual** — the signal that remains after removing the low-frequency content. On this residual, forgery traces (which are high-frequency noise) stand out far more than on the original image, because the content has been suppressed.

**Adaptation to block-DCT.** The **S2 (`dct_srm_residual`)** lever applies block-DCT *not on the raw image* but on an **SRM-style high-pass residual**. Intuition: high-pass filtering first helps "clean out" the content, so that the subsequent block-DCT inspects only the noise containing the artifacts — a way of *cleaning the input* for the frequency branch.

### 1.7.3 FcaNet — multi-spectral channel attention → S4 (dct_fca_attention)

**Original idea.** FcaNet [n] generalises the Squeeze-and-Excitation module. SE compresses each feature map into *one* number via global average pooling — and average pooling is precisely the *DC component (frequency 0) of the DCT*. FcaNet argues that using only the DC discards information; instead, one should use *multiple* different DCT frequency components for different channels, forming a more information-rich **multi-spectral channel attention**.

**Adaptation to block-DCT.** The **S4 (`dct_fca_attention`)** lever brings FcaNet's MultiSpectralAttentionLayer into the architecture, so that the network *learns channel attention using the DCT components themselves*. This is an elegant theoretical anchor: both the backbone (via SE) and the S4 lever are channel attention, but S4 is *frequency-rich* — naturally resonating with the "frequency" philosophy of the whole thesis.

### 1.7.4 FreqDebias — frequency mixup and consistency → S3 (use_dct_fomixup)

**Original idea.** FreqDebias [n] targets *frequency bias*: deepfake models tend to latch onto a specific "tell-tale" frequency band of the training set, leading to poor generalisation. The solution: *mix up* the frequency information across samples to break the rigid dependence on a single band, combined with a **consistency** constraint that forces the model to predict consistently under those mixes.

**Adaptation to block-DCT.** The **S3 (`use_dct_fomixup`)** lever performs **DCTFoMixup**: mixing the DCT bands across samples and then performing an *inverse-DCT* to return to the image (a form of frequency-domain augmentation), together with a **dual consistency loss** — symmetric-KL on the predicted probabilities plus MSE on the embedding — to force the model to be invariant to frequency mixing. S3 is a lever that *adds no learnable parameters*, changing only *how data is generated and the loss function*, and is therefore present in both the Row1 and Row2 configurations.

### 1.7.5 FDFL — single-center loss → S5 (use_single_center_loss)

**Original idea.** FDFL (Frequency-aware Discriminative Feature Learning) [n] improves the *discriminativeness* of the feature space via a **single-center loss**: instead of letting the REAL and FAKE classes scatter arbitrarily, it compresses all REAL samples towards a *single center* in the embedding space while pushing the FAKE samples away from that center by a margin. Intuition: REAL is a "homogeneous" concept (real images all share natural statistics), whereas FAKE is diverse (many generation pipelines) — so compressing REAL into a tight cluster and treating everything "far from the cluster" as suspicious is a sensible discrimination that *generalises well to unseen fakes*.

**Adaptation to block-DCT.** The **S5 (`use_single_center_loss`)** lever adds the single-center loss: pulling the REAL class towards a center and pushing FAKE away by a margin proportional to $\sqrt{D}$ (where $D$ is the embedding dimension). This is a lever that *adds parameters* (the center coordinates), appearing in the Row2 configuration together with S4.

[[BẢNG 1.7: Năm đòn S1–S5 — paper gốc, nguyên lý và cấu hình xuất hiện]]

| Lever | Flag name | Source paper | Core principle | Adds parameters? | Present in |
|---|---|---|---|---|---|
| S1 | `dct_use_sign` | SPSL | Adds the DCT coefficient sign (phase-analog) | No | Row1 |
| S2 | `dct_srm_residual` | SRM | Block-DCT on the high-pass residual | No | Row1 |
| S3 | `use_dct_fomixup` | FreqDebias | Frequency mixup + dual consistency | No | Row1, Row2 |
| S4 | `dct_fca_attention` | FcaNet | Multi-spectral channel attention (DCT) | Yes | Row2 |
| S5 | `use_single_center_loss` | FDFL | Single-center loss (compress REAL to 1 center) | Yes | Row2 |

This organisation yields two configurations with a clear *story*: **Row1** = naive + S1+S2+S3 (no added learnable parameters, only changing the input feature and loss), while **Row2** = naive + S4+S5+S3 (with added learnable parameters: FcaNet + single-center loss). Splitting by "with/without added parameters" makes it possible to disentangle the source of any AUC improvement — whether it is a *better feature* or a *larger model capacity*.

## 1.8 The eKYC Application Context and Legal Requirements

### 1.8.1 What eKYC is and its anti-deepfake role

**eKYC (electronic Know Your Customer)** is the process of identifying customers *electronically*: instead of visiting a counter, users photograph their own documents and faces with a phone to open an account/transact. The core step is **face matching** between the selfie and the document photo, together with an **anti-spoofing** step. This is precisely where deepfakes become a direct threat: a fraudster can use deepfake images/videos of a victim's face to bypass the verification step, open accounts illegitimately, or hijack accounts. A strong deepfake detector that *generalises well to unseen generation pipelines* is therefore an essential layer of defence for eKYC — and this is the applied motivation of the entire thesis.

### 1.8.2 Circular 17/2024/TT-NHNN and the FPR ≤ 5% operating point (convention)

In Vietnam, **Circular 17/2024/TT-NHNN** regulates the opening and use of payment accounts and **mandates biometric authentication** for certain banking transactions. **It must be made clear (verified against the full text): Circular 17 imposes a QUALITATIVE requirement — mandatory biometric matching — but does NOT specify a concrete quantitative threshold (there is no FPR/FAR/threshold figure).** Therefore, to *mathematise* this qualitative requirement into a measurable criterion, the thesis *self-selects* the operating point **FPR ≤ 5%** following the **ISO/IEC 30107-3 convention (BPCER20 — BPCER at APCER = 5%)**. In the thesis context, we define FPR as the proportion of *real* images misclassified as *fake*; the constraint **FPR ≤ 5%** means the system must not reject more than 5% of legitimate users. In short: the 5% threshold is *a choice made by the thesis according to an international standard to serve the spirit of TT17*, not a figure mandated by TT17.

**Technical implication: threshold calibration.** AUC measures separability *independently of any threshold*, but when *deploying* we are forced to choose a concrete decision threshold $\tau$. To satisfy FPR ≤ 5%, we must **calibrate** $\tau$ on a *validation set*: find the threshold such that the real-flagged-as-fake rate does not exceed 5%, then report the TPR (the rate at which fakes are caught) achieved at that threshold. This procedure separates *model capability* (AUC) from the *operating point* — and is a mandatory part of any serious eKYC deployment. The concrete figures (the threshold $\tau$, TPR@FPR≤5%) have not yet been measured: [[FILL: ngưỡng calibrate và TPR tại FPR≤5% trên tập validation]].

### 1.8.3 The need for XAI (explainability)

In a tightly regulated financial environment, a "REAL/FAKE" decision *cannot* be a black box. When the system rejects a transaction, *explainable* evidence is needed for auditing and appeals. The thesis meets this need with **Grad-CAM** [n] — a technique that highlights (as a heatmap) the image regions the model *relies on* to make its decision. The thesis's eKYC demo outputs `fake_prob` together with a Grad-CAM overlay, allowing the operator to see *where the model is looking* (for example the blending-boundary region around the chin) — turning an abstract score into an intuitive explanation, consistent with the transparency requirements of the banking sector.

## 1.9 Chapter Summary

Chapter 1 has fully established the foundation for the SFDCT method. We began from the *technical nature* of the three deepfake-generation families (autoencoder face-swap, GAN, diffusion) and the four forgery families in FF++, from which we derived the **central thesis**: forgery traces — blending boundaries, upsampling patterns, frequency inconsistency — are *weak in the spatial domain but clear in the mid/high-frequency bands*. This thesis justifies the two-branch architecture: the **EfficientNet-B4** backbone (compound scaling, MBConv, ImageNet transfer learning) captures spatial traces, while the **block-wise DCT 8×8** branch (YCbCr → zigzag → 16 bands → log-magnitude → drop low bands) captures frequency traces.

We analysed the core challenge — *the paradox of high in-dataset but dropping cross-dataset performance* — and the reason it drives the thesis's fair evaluation protocol (train FF++ → test CDFv2, headline frame-level AUC following DeepfakeBench). The fusion mechanism, **gated cross-attention with a zero-init gate $\alpha$**, was clarified together with its *floor ≥ B4* property — an important design contribution in terms of risk safety. Finally, we laid the theoretical groundwork for the **five levers S1–S5** (inheriting from SPSL, SRM, FcaNet, FreqDebias, FDFL) and tied the whole to the *eKYC context* together with the legal constraint FPR ≤ 5% (Circular 17/2024/TT-NHNN) and the need for XAI via Grad-CAM.

On this foundation, **Chapter 2** will present in detail the architecture and implementation formulas of SFDCT — how to build the block-DCT branch, the gated cross-attention mechanism, and how to realise each of the S1–S5 levers as the ablation configurations B4 → naive SFDCT → Row1 → Row2.
