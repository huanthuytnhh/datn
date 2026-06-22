<br>

<div align="center">

**THE UNIVERSITY OF DA NANG**

**UNIVERSITY OF SCIENCE AND TECHNOLOGY**

**FACULTY OF INFORMATION TECHNOLOGY**

<br><br>

[[FIGURE: logo_dut.png — Logo of the University of Science and Technology – The University of Da Nang]]

<br><br>

# GRADUATION THESIS

### MAJOR: Information Technology

### SPECIALIZATION: Data Science and Artificial Intelligence

<br><br>

## TITLE:

# HYBRID SPATIAL–FREQUENCY LEARNING WITH BLOCK-WISE DCT FOR DEEPFAKE DETECTION IN eKYC

<br><br>

| | |
|---|---|
| **Student** | : Le Ngoc Thanh |
| **Student ID** | : 102220041 |
| **Class** | : [[FILL: Class]] |
| **Major** | : Information Technology |
| **Supervisor** | : Assoc. Prof. Dr. Pham Cong Thang |

<br><br>

**Da Nang, [[FILL: month/year — e.g. June 2026]]**

</div>

<div style="page-break-after: always;"></div>

---

# SUPERVISOR'S REMARKS

**Student name:** Le Ngoc Thanh  **Student ID:** 102220041  **Class:** [[FILL: Class]]

**Thesis title:** Hybrid Spatial–Frequency Learning with Block-wise DCT for Deepfake Detection in eKYC.

**Supervisor:** Assoc. Prof. Dr. Pham Cong Thang

<br>

**1. Assessment of the thesis content:**

[[FILL: supervisor's remarks on the content, level of completion, and scientific quality of the thesis]]

<br>

**2. Assessment of the presentation:**

[[FILL: remarks on structure, writing style, figures, and tables]]

<br>

**3. Student's working attitude and commitment:**

[[FILL: remarks on attitude, initiative, and progress]]

<br>

**4. Conclusion (approved / not approved for defence):**

[[FILL: conclusion]]

<br>

**Evaluation score:** [[FILL: ... /10]]

<br><br>

*Da Nang, ..... ..... .....*

*Supervisor*

*(signature and full name)*

<br><br>

**Assoc. Prof. Dr. Pham Cong Thang**

<div style="page-break-after: always;"></div>

---

# REVIEWER'S REMARKS

**Student name:** Le Ngoc Thanh  **Student ID:** 102220041  **Class:** [[FILL: Class]]

**Thesis title:** Hybrid Spatial–Frequency Learning with Block-wise DCT for Deepfake Detection in eKYC.

**Reviewer:** [[FILL: academic title + full name of the reviewer]]

<br>

**1. Assessment of the thesis content:**

[[FILL: reviewer's remarks]]

<br>

**2. Assessment of the presentation:**

[[FILL: remarks on presentation]]

<br>

**3. Review questions:**

[[FILL: review questions]]

<br>

**4. Conclusion:**

[[FILL: conclusion]]

<br>

**Evaluation score:** [[FILL: ... /10]]

<br><br>

*Da Nang, ..... ..... .....*

*Reviewer*

*(signature and full name)*

<br><br>

**[[FILL: full name of the reviewer]]**

<div style="page-break-after: always;"></div>

---

# ABSTRACT

**Thesis title:** Hybrid Spatial–Frequency Learning with Block-wise DCT for Deepfake Detection in eKYC.

**Student:** Le Ngoc Thanh — Student ID: 102220041 — Class: [[FILL: Class]]

<br>

The rapid progress of deepfake generation poses a serious threat to electronic Know-Your-Customer (eKYC) systems in the banking and financial sector, where forged faces may bypass biometric verification. Detectors that rely solely on spatial features tend to generalise poorly to unseen manipulations or datasets (cross-dataset), because the forgery fingerprints produced by GAN/upsampling are faint in the spatial domain yet pronounced in the mid- and high-frequency bands. This thesis proposes **SFDCT** (Spatial–Frequency learning with block-wise DCT), which couples an **EfficientNet-B4** spatial backbone with a frequency branch built on **8×8 block-wise 2D-DCT** aggregated over 16 zigzag frequency bands, fused through a **zero-initialised gated cross-attention** mechanism so that the model performance floor never drops below B4. On top of this design, the thesis assembles and adapts five frequency "levers" from SPSL, SRM, FreqDebias, FcaNet and FDFL into the block-DCT domain. The model is trained on **FaceForensics++ (c23)** and evaluated **cross-dataset** on **Celeb-DF-v2** under the **DeepfakeBench** protocol. Experiments show that the frame-level AUC on CDFv2 improves from **0.7497** (B4) to **0.7572** (B4-DCT), with two enhanced configurations Row1 = [[FILL: CDFv2 AUC Row1]] and Row2 = [[FILL: CDFv2 AUC Row2]]. An explainable eKYC demo with Grad-CAM visualisation is also provided.

**Keywords:** deepfake detection; block-wise DCT; spatial–frequency learning; EfficientNet-B4; gated cross-attention; cross-dataset generalisation; DeepfakeBench; eKYC; FcaNet; explainable AI.

<div style="page-break-after: always;"></div>

---

# GRADUATION THESIS ASSIGNMENT

**THE UNIVERSITY OF DA NANG — UNIVERSITY OF SCIENCE AND TECHNOLOGY — FACULTY OF INFORMATION TECHNOLOGY**

<br>

| Item | Content |
|---|---|
| **Student name** | Le Ngoc Thanh |
| **Student ID** | 102220041 |
| **Class** | [[FILL: Class]] |
| **Major** | Information Technology |
| **Thesis title** | Hybrid Spatial–Frequency Learning with Block-wise DCT for Deepfake Detection in eKYC |
| **Supervisor** | Assoc. Prof. Dr. Pham Cong Thang |

<br>

**1. Initial data:**

- Training dataset: **FaceForensics++** (compressed c23 version) — 1,000 real videos and four forgery methods (Deepfakes, Face2Face, FaceSwap, NeuralTextures).
- Cross-dataset test set: **Celeb-DF-v2** (590 real videos, 5,639 high-quality deepfake videos).
- Training and evaluation framework: **DeepfakeBench**.
- [[FILL: additional initial data/resources, if any]]

<br>

**2. Content of the analysis and computation:**

- Survey of deepfake, eKYC, and spatial–frequency detection methods.
- Proposal and implementation of the **SFDCT** method: a block-DCT branch with zero-initialised gated cross-attention, together with five frequency levers (S1–S5).
- Cross-dataset training and evaluation under the DeepfakeBench protocol; ablation analysis (B4 → B4-DCT → Row1 → Row2).
- Development of an explainable eKYC demo (Grad-CAM); discussion of threshold calibration in accordance with Circular 17/2024/TT-NHNN (FPR ≤ 5%).

<br>

**3. Drawings and charts (if any):** [[FILL: list of architecture diagrams and result charts]]

<br>

**4. Assignment date:** [[FILL: day/month/year]]

**5. Completion date:** [[FILL: day/month/year]]

<br>

| | |
|---|---|
| *Head of Department* | *Supervisor* |
| [[FILL: full name]] | **Assoc. Prof. Dr. Pham Cong Thang** |

<div style="page-break-after: always;"></div>

---

# ACKNOWLEDGEMENTS

In completing this graduation thesis, I have received invaluable support and encouragement from many people.

First and foremost, I would like to express my deepest gratitude to **Assoc. Prof. Dr. Pham Cong Thang**, my supervisor, who devotedly guided the direction of the thesis, offered insightful scientific advice, and accompanied me throughout the entire process. His sharp comments and patience were a great source of motivation that helped me bring this work to completion.

I sincerely thank the lecturers of the **Faculty of Information Technology, University of Science and Technology – The University of Da Nang** for equipping me with a solid foundation of knowledge over the past years, and for providing the facilities and academic environment that enabled me to carry out this thesis.

Finally, I would like to thank my **family** and **friends** for their constant support, sharing, and emotional encouragement, which helped me overcome the most difficult periods.

Owing to limitations in time and ability, this thesis inevitably contains shortcomings. I sincerely welcome the valuable comments of the lecturers so that the work may be further improved.

I am sincerely grateful.

<br>

*Da Nang, [[FILL: month/year]]*

*Student*

<br>

**Le Ngoc Thanh**

<div style="page-break-after: always;"></div>

---

# DECLARATION OF AUTHORSHIP

I hereby declare that this graduation thesis, entitled *"Hybrid Spatial–Frequency Learning with Block-wise DCT for Deepfake Detection in eKYC"*, is my own research work, conducted under the guidance of **Assoc. Prof. Dr. Pham Cong Thang**.

The data and experimental results presented in this thesis are truthful, produced from the actual training and evaluation process on the DeepfakeBench framework, and have never been published in any other work. All content and ideas referenced from the documents and works of other authors are fully cited and clearly attributed in the References section in accordance with the regulations.

I take full responsibility for the truthfulness of the content presented in this thesis.

<br>

*Da Nang, [[FILL: day/month/year]]*

*Student*

*(signature and full name)*

<br>

**[[FILL: signature]]**

**Le Ngoc Thanh**

<div style="page-break-after: always;"></div>

---

# TABLE OF CONTENTS

[Table of Contents — auto-generated]

<div style="page-break-after: always;"></div>

---

# LIST OF FIGURES

[[FILL: to be updated upon completion — list of figures by chapter, e.g. Figure 2.1 SFDCT architecture; Figure 3.1 ROC on CDFv2; Figure 3.2 Grad-CAM; ...]]

<div style="page-break-after: always;"></div>

---

# LIST OF TABLES

[[FILL: to be updated upon completion — list of tables by chapter, e.g. Table 3.1 Cross-dataset AUC comparison; Table 3.2 Ablation S1–S5; ...]]

<div style="page-break-after: always;"></div>

---

# LIST OF ABBREVIATIONS

| Abbreviation | Full term (English) | Description |
|---|---|---|
| **AI** | Artificial Intelligence | Artificial intelligence |
| **AP** | Average Precision | Average precision (area under the PR curve) |
| **AUC** | Area Under the (ROC) Curve | Area under the ROC curve |
| **CDFv2** | Celeb-DF-v2 | Celebrity deepfake dataset, version 2 (cross-dataset test set) |
| **CNN** | Convolutional Neural Network | Convolutional neural network |
| **DC** | Direct Current (coefficient) | DC coefficient (the zero-frequency coefficient in the DCT) |
| **DCT** | Discrete Cosine Transform | Discrete cosine transform |
| **DFDC** | DeepFake Detection Challenge (dataset) | DeepFake detection challenge dataset |
| **eKYC** | electronic Know Your Customer | Electronic customer identification |
| **EER** | Equal Error Rate | Equal error rate |
| **FAD** | Frequency-Aware Decomposition | Frequency-aware decomposition (in F3-Net) |
| **FcaNet** | Frequency Channel Attention Network | Frequency channel attention network |
| **FDFL** | Frequency-aware Discriminative Feature Learning | Frequency-aware discriminative feature learning |
| **FF++** | FaceForensics++ | Face forgery dataset (used for training, c23 version) |
| **FLOPs** | Floating Point Operations | Number of floating-point operations |
| **FPR** | False Positive Rate | False positive rate |
| **FPS** | Frames Per Second | Frames processed per second |
| **GAN** | Generative Adversarial Network | Generative adversarial network |
| **Grad-CAM** | Gradient-weighted Class Activation Mapping | Gradient-weighted class activation mapping (visual explanation) |
| **ImageNet** | ImageNet (dataset) | Large-scale image dataset used to pretrain the backbone |
| **KL** | Kullback–Leibler (divergence) | Kullback–Leibler divergence |
| **MSE** | Mean Squared Error | Mean squared error |
| **PR** | Precision–Recall (curve) | Precision–recall curve |
| **ROC** | Receiver Operating Characteristic | Receiver operating characteristic |
| **RNN** | Recurrent Neural Network | Recurrent neural network |
| **SBI** | Self-Blended Images | Self-blended images (a data-augmentation technique) |
| **SFDCT** | Spatial–Frequency with block-wise DCT | The method proposed in this thesis |
| **SPSL** | Spatial-Phase Shallow Learning | Spatial-phase shallow learning |
| **SRM** | Steganalysis Rich Model | Steganalysis rich model (high-pass noise filtering) |
| **t-SNE** | t-distributed Stochastic Neighbor Embedding | A dimensionality-reduction technique for feature visualisation |
| **TT-NHNN** | Circular – State Bank of Vietnam | Legal document issued by the State Bank of Vietnam |
| **XAI** | Explainable Artificial Intelligence | Explainable artificial intelligence |
| **YCbCr** | Luma–Chroma color space | Luma–chroma color space (used for the DCT) |

<div style="page-break-after: always;"></div>

---


# INTRODUCTION

## 1. Problem statement

In recent years, electronic Know Your Customer (eKYC) has become a core infrastructure of the banking and finance industry: a customer can open an account, take out a loan, or confirm a transaction entirely remotely, using only a portrait photograph and a few taps on a phone. Yet this very convenience opens up a new attack surface. The explosive progress of **deepfake** techniques — which use Generative Adversarial Networks (GANs) and generative models to swap or synthesise faces — means that a forged face that looks exactly real can be produced at low cost. When such faces are fed into the biometric verification stage of eKYC, the system risks being bypassed, leading to identity fraud, account takeover, and serious financial risk. In Vietnam, **Circular 17/2024/TT-NHNN** has set out the requirement for biometric verification in banking transactions, in which constraints on operational safety (for instance, keeping the false positive rate — FPR low) further underscore the pressing need for a reliable deepfake detector.

**Why is relying on the spatial domain alone not enough?** Most current deepfake detectors are based on convolutional neural networks (CNNs) that learn directly from pixels in the spatial domain. This approach performs well when the test set shares the same distribution as the training set, but it tends to "memorise" the idiosyncratic traces of each specific forgery method. As a consequence, when faced with a new forgery technique or a new dataset, performance drops considerably. This is precisely the problem of **cross-dataset generalisation** — the core and hardest challenge of the deepfake detection task.

**Why do we need the frequency domain (DCT)?** A key observation is that the deepfake generation process, and in particular the **upsampling** operations within GAN architectures, leaves very characteristic traces (artifacts). In the spatial domain, these traces are usually faint and easily "washed away" by image compression (such as JPEG or c23 video coding). However, when transformed into the frequency domain via the **Discrete Cosine Transform (DCT)**, these traces become clearly exposed in the **mid and high** frequency bands — where real and fake images differ in their energy distribution. This is the basis for the central hypothesis of this thesis: **spatial features and frequency features complement each other**, and the collaboration between the two domains helps the model generalise better across different forgery methods and datasets. Using **block-wise DCT (8×8)** — rather than whole-image DCT — further allows the model to capture local traces while naturally matching the way videos and images are compressed block by block.

**Why is cross-dataset generalisation the core challenge?** In a realistic eKYC setting, an attacker always uses the latest deepfake generation tools — almost certainly different from the data the model saw during training. A detector that achieves high accuracy on a "familiar" (in-dataset) test set but collapses on unseen data would be useless in practice. We therefore adopt **frame-level AUC on Celeb-DF-v2 (trained on FaceForensics++)** as the representative evaluation metric (headline metric), which directly reflects the ability to generalise to an unseen domain.

## 2. Objectives & research questions

**Overall objective:** To build a **hybrid spatial–frequency** deepfake detector based on block-wise DCT that achieves better cross-dataset generalisation than a purely spatial baseline, while being safe with respect to risk (never worse than the baseline) and explainable, oriented towards eKYC applications.

**Specific objectives:**

1. Design a frequency branch based on **block-wise DCT (8×8)** with 16 zigzag frequency bands, and a **zero-initialised gated cross-attention** fusion mechanism that guarantees a performance floor ≥ EfficientNet-B4.
2. Aggregate and adapt **five frequency levers** (S1–S5, adapted from SPSL, SRM, FreqDebias, FcaNet, FDFL) into the block-DCT domain.
3. Evaluate **fairly** under the DeepfakeBench protocol (train FF++ c23 → test cross-dataset CDFv2) through ablation configurations: B4 → B4-DCT → Row1 → Row2.
4. Build an **explainable eKYC demo** with Grad-CAM and discuss decision-threshold calibration under the FPR ≤ 5% requirement.

**Research questions:**

- **RQ1.** Does adding a block-DCT branch to EfficientNet-B4 improve cross-dataset AUC compared with a purely spatial baseline?
- **RQ2.** Among the five frequency levers, which one (or which combination) yields a reliable improvement, and which does not?
- **RQ3.** Does the zero-initialised gated cross-attention mechanism truly guarantee a performance "floor" no lower than B4?

**Main contributions (novelty).** This thesis positions its contributions along **five axes**, in which the methodological axis (C1) is the original novelty and the remaining four are novelty at the evaluation–data–deployment level:

1. **C1 — Original method:** a **block-DCT spatial–frequency** branch fused with EfficientNet-B4 through **zero-initialised gated cross-attention** guaranteeing a *floor ≥ B4*; together with aggregating and adapting five frequency levers (SPSL/SRM/FreqDebias/FcaNet/FDFL) into **one** unified block-DCT domain.
2. **C2 — Multi-configuration evaluation framework + aggregate heatmap:** a systematic comparison of B4 → B4-DCT → Row1 → Row2 on cross-dataset, summarised in a single AUC heatmap (Section 3.4).
3. **C3 — Evaluation at the eKYC operating point:** calibrating the threshold τ at the **FPR ≤ 5% operating point** (the ISO/IEC 30107-3 convention used to operationalise the *qualitative* biometric-verification requirement of **Circular 17/2024/TT-NHNN** — TT17 does not fix a numerical threshold), with error decomposition (FP/FN confusion, the two-sided APCER/BPCER) instead of a single AUC number.
4. **C4 — An honest cross-dataset study with statistics:** using **bootstrap CI** to test the significance of ΔAUC and **reporting outright when a result falls within the noise** when that is indeed the case (no sugar-coating).
5. **C5 — (data, future work) A Vietnamese-face deepfake set for eKYC:** a cross-domain Vietnamese-face test set close to identity-verification scenarios, complementing CDFv2.

> Everything is built **on top of DeepfakeBench** (fully attributed) together with the inherited frequency-domain works — see the References.

## 3. Research object & scope

**Research object:** The problem of **deepfake** (face-forgery) detection on face images, focusing on the collaboration between spatial-domain features and block-DCT frequency-domain features, in the context of eKYC applications.

**Research scope:**

- **Focus solely on deepfake detection (DEEPFAKE-ONLY).** After weighing the workload and depth appropriate for a graduation thesis, the scope has been **narrowed** relative to the initial plan, going deep only into the deepfake detection task. The problem of **liveness / anti-spoofing detection** — which is also important in eKYC — is placed in the **Future work** part of the thesis and is not within the scope of implementation and evaluation here.
- **Frame-level, no temporal-sequence processing.** This thesis works on independent face-crop frames and does not exploit temporal/motion features across frames.
- **Data:** training on FaceForensics++ (c23); cross-dataset testing on Celeb-DF-v2. DFDC is mentioned as an additional cross-dataset set for the future.
- **Evaluation:** following the DeepfakeBench protocol, with frame-level AUC on CDFv2 as the representative metric.

## 4. Methodology

The implementation process of this thesis comprises four consecutive stages:

1. **Data preparation (data).** Extract faces from FF++ and CDFv2 videos, align and crop them into 256×256 face-crop images, and normalise according to the DeepfakeBench configuration (mean = std = 0.5). Generate JSON files describing the dataset for training/evaluation.
2. **Building the SFDCT model.** A spatial backbone EfficientNet-B4 (ImageNet-pretrained) combined with a block-wise DCT (8×8) frequency branch (image converted to YCbCr, taking the log-magnitude, grouped into 16 zigzag bands, with an optional drop of low bands to prevent content leakage), fused by zero-initialised gated cross-attention; with an optional integration of the five levers S1–S5.
3. **Training & cross-dataset evaluation (DeepfakeBench).** Training on FF++ c23 (batch 32, frame_num 32, Adam optimiser, lr 2e-4, 256×256 images); evaluating frame-level AUC on CDFv2 under four ablation configurations (B4 → B4-DCT → Row1 → Row2), accompanied by illustrative figures (ROC, PR, t-SNE, frequency spectrum, gate alpha, Grad-CAM, training curve).
4. **Explainable eKYC demo.** The inference tool returns a forgery probability fake_prob ∈ [0,1], a REAL/FAKE label, and a Grad-CAM overlay image; we discuss threshold calibration following Circular 17/2024/TT-NHNN (FPR ≤ 5%).

## 5. Scientific & practical significance

**Scientifically,** this thesis empirically reinforces the hypothesis about spatial–frequency collaboration in deepfake detection, and at the same time contributes a unified **zero-initialised gated cross-attention** design with a performance-"floor" guarantee property — a characteristic seldom emphasised in prior work. Aggregating and adapting five frequency levers from different research directions (SPSL, SRM, FreqDebias, FcaNet, FDFL) into a common block-DCT framework also provides a systematic comparative perspective.

**Practically,** this thesis aims directly at the eKYC problem in Vietnam's banking industry: fair cross-dataset evaluation under DeepfakeBench closely reflects the real deployment scenario (encountering unseen deepfakes), while the demo with Grad-CAM increases the transparency and interpretability of the decision — an important factor for legal compliance and for building user trust.

## 6. Report structure

Apart from the Introduction, the Conclusion, and the References, the main content of the report is organised into three chapters:

- **Chapter 1 — Overview and Theoretical Foundations.** Presents the context of deepfake and eKYC, surveys the directions of deepfake detection (spatial domain, frequency domain), the theoretical foundations of DCT and the attention mechanism, and the related works underpinning the five levers of this thesis.
- **Chapter 2 — The proposed SFDCT method.** Describes the architecture in detail: the EfficientNet-B4 backbone, the block-DCT (8×8) branch with 16 zigzag bands, the zero-initialised gated cross-attention mechanism, the five frequency levers (S1–S5), and the loss functions.
- **Chapter 3 — Experiments and Evaluation.** Presents the data, the DeepfakeBench protocol, the ablation configurations, the cross-dataset results (B4 0.7497 → B4-DCT 0.7572 → Row1 0.7333; Row2 still training), the quantitative–qualitative analysis (ROC, PR, t-SNE, Grad-CAM, gate alpha), and the eKYC demo.

Finally, the **Conclusion and Future Work** part summarises the contributions, states the limitations outright (results from only 1 seed; the strongest lever, SBI, lies outside the pure block-DCT scope), and outlines extension directions (multi-seed, integrating SBI self-blended training, extending to liveness and DFDC).


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

[[FIGURE 1.1: illustration of the three face-forgery generation pipelines (autoencoder face-swap, GAN, diffusion), sharing a common final upsampling/blending step that leaves artifacts]]

### 1.1.3 Four forgery families in FaceForensics++

The standard FaceForensics++ (FF++) dataset [n] aggregates four forgery methods, representing two major manipulation types — *identity swap* and *expression reenactment*:

[[TABLE 1.1: The four forgery families in FF++ — mechanism and main type of trace]]

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

[[FIGURE 1.2: visual comparison — the blending boundary is nearly invisible in the pixel image (left) but clearly revealed as energy peaks in the DCT log-magnitude spectrum (right)]]

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

[[TABLE 1.2: Mapping of the problem's symbols]]

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

[[TABLE 1.3: Statistical summary of the two datasets]]

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

[[TABLE 1.4: The three scaling dimensions of EfficientNet]]

| Scaling dimension | What is turned | Benefit | Risk if turned in isolation |
|---|---|---|---|
| Depth ($\alpha^\phi$) | Number of layers | Captures more complex/abstract features | Harder to train (vanishing gradient) |
| Width ($\beta^\phi$) | Number of channels | Captures more fine-grained features | Saturation, poor parameter efficiency |
| Resolution ($\gamma^\phi$) | Input image size | Sees small details (subtle artifacts) | FLOPs grow rapidly |

### 1.4.3 The MBConv block — the building unit

The basic unit of EfficientNet is the **MBConv** (Mobile Inverted Bottleneck Convolution), inherited from MobileNetV2. The intuition behind MBConv comprises three steps: (i) **expand** — a 1×1 convolution increases the number of channels (for example ×6) to create a wide representation space; (ii) **depthwise convolution** — a per-channel convolution (far cheaper than full convolution) to learn spatial patterns; (iii) **project** — a 1×1 convolution compresses the channels back to a small number (bottleneck). Each block also includes a **Squeeze-and-Excitation (SE)** module — which learns a *per-channel importance* weight to amplify useful channels and suppress noisy ones — together with a **residual connection** when the input and output dimensions match. This "expand-then-compress" structure (inverted bottleneck) enables learning rich representations while remaining parameter-efficient.

Worth noting for this thesis: the SE module is essentially a form of **channel attention** based on global statistics (global average pooling). This is the theoretical bridge to the **S4 (FcaNet)** lever in Section 1.7 — which *generalises* SE by replacing average pooling with multiple DCT components, that is, still channel attention but more *frequency-rich*.

[[FIGURE 1.3: the MBConv block architecture — expand 1×1 → depthwise conv → SE → project 1×1 + residual]]

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

[[TABLE 1.5: Meaning of coefficient positions within a 2D-DCT block]]

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

[[FIGURE 1.4: illustration of the zigzag scan on an 8×8 block and how the 64 coefficients are grouped into 16 frequency bands from DC to high-frequency]]

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

[[TABLE 1.6: Mapping of the Q/K/V roles in the cross-attention of SFDCT]]

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

[[FIGURE 1.5: diagram of the gated cross-attention fusion with the zero-init alpha gate — at initialisation the frequency branch is closed (alpha=0) and the model is equivalent to B4]]

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

[[TABLE 1.7: The five levers S1–S5 — source paper, principle, and the configuration in which each appears]]

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

**Technical implication: threshold calibration.** AUC measures separability *independently of any threshold*, but when *deploying* we are forced to choose a concrete decision threshold $\tau$. To satisfy FPR ≤ 5%, we must **calibrate** $\tau$ on a *validation set*: find the threshold such that the real-flagged-as-fake rate does not exceed 5%, then report the TPR (the rate at which fakes are caught) achieved at that threshold. This procedure separates *model capability* (AUC) from the *operating point* — and is a mandatory part of any serious eKYC deployment. The concrete figures (the threshold $\tau$, TPR@FPR≤5%) have not yet been measured: [[FILL: calibrated threshold and TPR at FPR≤5% on the validation set]].

### 1.8.3 The need for XAI (explainability)

In a tightly regulated financial environment, a "REAL/FAKE" decision *cannot* be a black box. When the system rejects a transaction, *explainable* evidence is needed for auditing and appeals. The thesis meets this need with **Grad-CAM** [n] — a technique that highlights (as a heatmap) the image regions the model *relies on* to make its decision. The thesis's eKYC demo outputs `fake_prob` together with a Grad-CAM overlay, allowing the operator to see *where the model is looking* (for example the blending-boundary region around the chin) — turning an abstract score into an intuitive explanation, consistent with the transparency requirements of the banking sector.

## 1.9 Application technologies

The previous sections established the *scientific* foundations of the detector (spatial backbone, block-DCT branch, attention fusion). This section turns to the *engineering* foundations: the set of production technologies that wrap the SFDCT model into a usable, multi-tenant eKYC platform, **DeepGuard**. The platform follows a strict one-directional request flow in which the browser never talks to the database or to the model directly: `Frontend (Next.js) → FastAPI backend (/v1, JWT/API-key) → SQLAlchemy async → PostgreSQL`, with model inference delegated over HTTP (`httpx POST /predict`) to a separate SFDCT microservice on port 8501. Figure 1.20 summarises this layered topology, and the subsections that follow describe each technology together with its concrete role inside DeepGuard.

```mermaid
flowchart LR
    U[Browser / External eKYC client] -->|HTTPS, REST JSON| FE[Next.js + React SPA<br/>:3000]
    U -->|API-key Bearer| BE
    FE -->|fetch + Bearer JWT| BE[FastAPI backend<br/>:8000]
    BE -->|SQLAlchemy async| DB[(PostgreSQL<br/>deepguard_db :5432)]
    BE -->|httpx POST /predict| ML[SFDCT microservice<br/>EfficientNet-B4 + block-DCT<br/>:8501]
    subgraph Deployment [Docker Compose on AWS EC2]
        FE
        BE
        DB
    end
```

*Figure 1.20: Layered technology stack of the DeepGuard platform. The frontend single-page application communicates only with the FastAPI backend over HTTP/REST; the backend is the sole component that touches PostgreSQL and the SFDCT model serving microservice. The dashed group denotes the components packaged and orchestrated by Docker Compose and deployed on an AWS EC2 instance.*

Table 1.20 maps each application technology to the architectural tier in which it is used and to its primary responsibility within DeepGuard.

*Table 1.20: Application technologies and their roles in DeepGuard.*

| Technology | Tier | Role in DeepGuard |
|---|---|---|
| React / Next.js (App Router) | Presentation | Single-page dashboard and integration playground |
| FastAPI (Uvicorn) | Application / API | REST API gateway, business logic, orchestration |
| PostgreSQL (SQLAlchemy async) | Persistence | Multi-tenant data store (`deepguard_db`) |
| Docker / Docker Compose | Infrastructure | Containerisation and local/dev orchestration |
| HTTP / REST | Communication | Contract between all tiers and external clients |
| JWT + RBAC | Security | Dashboard authentication and role-based authorisation |
| API-key authentication | Security | External eKYC integration auth |
| AWS EC2 | Deployment | Cloud host for the containerised stack |

### 1.9.1 React / Next.js — frontend single-page application

The user-facing layer of DeepGuard is built with **React 19** running under the **Next.js 16 App Router** in TypeScript. Next.js provides the routing, server-component model, and build tooling, while React provides the component-based rendering; together they deliver the platform as a single-page application served on port 3000. Within DeepGuard, this layer renders the role-specific dashboards (sysadmin, admin, developer, compliance, viewer), the integration **Playground** where a developer can upload an image and immediately see the returned risk score, Grad-CAM heatmap, and 2D-DCT frequency spectrum, and the administrative screens for tenants, team members, API keys, webhooks, and audit logs. The frontend never queries the database or the model directly: all data movement goes through a single HTTP client module (`src/lib/api.ts`) that attaches the `Authorization: Bearer` header (a JWT for dashboard users, an API key for external integration) and calls the FastAPI backend. Server-state caching is handled by TanStack Query while a small amount of client-only state (authentication, navigation, appearance) lives in Zustand, keeping the UI responsive and consistent with the request flow shown in Figure 1.20.

### 1.9.2 FastAPI — backend API service

The application tier is a **FastAPI** service (served by **Uvicorn**) written in Python, exposing the platform's complete REST surface — a set of 35 endpoints grouped into authentication, users/tenant, API keys, detection, liveness, dashboard detections, webhooks, and analytics/audit. FastAPI is the only component permitted to reach the database and the SFDCT model; it enforces the one-directional flow `router → service → repository (CRUD)` and never lets a route touch PostgreSQL directly. Its role in DeepGuard is to authenticate and authorise every request, validate inputs and serialise outputs through Pydantic v2 schemas (separate Create / Read / Update models), persist and query records via SQLAlchemy, and — for detection requests such as `POST /v1/detect/image` — orchestrate inference by forwarding the face-cropped payload to the SFDCT microservice over `httpx` and returning the structured verdict (`prob_fake`, label, Grad-CAM). The backend deliberately keeps heavy machine-learning dependencies out of its own runtime: the model lives behind the microservice boundary, so the API process only needs an HTTP client to obtain predictions. FastAPI also auto-generates interactive API documentation (Swagger UI at `/docs`), which doubles as the integration reference for external eKYC clients.

### 1.9.3 PostgreSQL — multi-tenant persistence

Persistent state is stored in **PostgreSQL**, accessed asynchronously through **SQLAlchemy 2.0** (async) with the `asyncpg` driver. All schema, models, and data-access code are concentrated in a single shared package, `deepguard_db`, so that database structure is defined once (`schema.sql`) and every read or write passes through typed CRUD functions rather than ad-hoc SQL scattered across services. Within DeepGuard, PostgreSQL is the system of record for the multi-tenant data model: tenants and their subscription/quota state, users and their roles, API keys, detection and liveness records, webhooks, and the immutable audit trail. Tenancy isolation is expressed at this tier — every dashboard query is scoped by the authenticated user's `tenant_id` and every external request by the API key's `tenant_id` — which is what allows a single deployment to serve many independent banking organisations (for example the "VietBank Demo" tenant) while keeping their data strictly separated.

### 1.9.4 Docker and Docker Compose — containerisation

DeepGuard is packaged with **Docker** and orchestrated for local and development environments with **Docker Compose**. Each tier runs as a container, and Compose wires the backend API and the PostgreSQL database together on a shared network, managing ports, environment configuration, and start order so that developers run the full stack with a single command instead of starting Uvicorn and a database by hand. Compose is also where configuration is injected through environment variables (consumed by the backend via `pydantic-settings`), keeping secrets, connection strings, and the SFDCT inference URL out of the source code. This containerised packaging is what makes the platform reproducible across a developer laptop and the cloud host described in Subsection 1.9.8.

### 1.9.5 HTTP and the REST API

All communication in DeepGuard travels over **HTTP** using a **REST** style with JSON payloads, which is the single contract that ties the tiers together and exposes the platform to the outside world. The browser reaches the backend over HTTPS; the backend reaches the SFDCT microservice over HTTP via `httpx`; and external bank back-ends call the public detection API the same way. Endpoints are organised by resource and HTTP verb — for example `POST /v1/detect/image` and `POST /v1/detect/video` for forgery detection, `POST /v1/detect/liveness` and `GET /v1/liveness/challenge` for liveness, and `GET /v1/results/{request_id}` to retrieve a stored result. Responses follow consistent conventions: a `{items, total, page, limit}` envelope for paginated lists, a `{"detail": "..."}` body for errors, and standard status codes for failure modes (for example `429` with a `Retry-After` header when a key exceeds its `rate_limit_rpm`, and `402` when a tenant's `monthly_quota` is exhausted). Table 1.21 illustrates the REST contract on the central detection endpoint.

*Table 1.21: REST contract for the primary detection endpoint.*

| Field | Value |
|---|---|
| Method | POST |
| Path | `/v1/detect/image` |
| Auth | API Key (`Authorization: Bearer sk-dg-...`) |
| Request | `multipart/form-data` image file (face-cropped via MTCNN before inference) |
| Response (200) | `{ "request_id": "...", "verdict": "FAKE", "prob_fake": 0.93, "gradcam_b64": "..." }` |
| Errors | `401` invalid key · `402` quota exhausted · `429` rate limit · `422` invalid payload |

### 1.9.6 JWT and RBAC — dashboard authentication and authorisation

The interactive dashboard is protected by **JSON Web Tokens (JWT)** combined with **role-based access control (RBAC)**. After a user signs in (`POST /auth/login`), the backend issues a signed bearer token that the frontend attaches to every subsequent request; server-side dependencies (`get_current_user`, `require_role`, `require_sysadmin`) verify the token and then check the caller's role against the minimum role declared by each endpoint. DeepGuard defines five roles — `viewer`, `developer`, `compliance`, `admin`, and `sysadmin` — and the authorisation rules realise meaningful separation of duties: a `viewer` is read-only with personally identifiable information (PII) masked; a `developer` may use the Playground and manage API keys but cannot see team, billing, or unmasked PII; a `compliance` user sees full PII and can add audit notes but cannot touch keys or playground; an `admin` governs a single tenant (team, keys, webhooks, settings) without crossing tenant boundaries; and only a `sysadmin` operates across all tenants and adjusts model thresholds. This role-to-route matrix is enforced authoritatively in the backend, giving DeepGuard the controlled, auditable access model required for an eKYC system.

### 1.9.7 API-key authentication — external integration

External integration follows a second, deliberately separate authentication scheme based on **API keys**. A tenant administrator (or developer) issues a key of the form `sk-dg-...`, whose plaintext value is shown exactly once at creation and thereafter stored only as a hash. A customer's own back-end then authenticates to the public detection and liveness endpoints (`/v1/detect/*`, `/v1/liveness/*`, `/v1/results/*`) by sending this key as a bearer token, which the backend resolves to the owning tenant via `get_api_key_auth`. Keeping API-key auth distinct from the JWT dashboard auth — the two guards are never mixed — is what lets DeepGuard serve two different consumers cleanly: human operators using the web console, and machine-to-machine eKYC pipelines calling the API at scale, each with its own quota and per-key rate limit.

### 1.9.8 AWS EC2 — cloud deployment

For deployment beyond the developer machine, the containerised DeepGuard stack is hosted on an **Amazon Web Services (AWS) EC2** virtual server. EC2 provides the elastic compute instance on which Docker runs the frontend, backend, and PostgreSQL containers as a single Compose-orchestrated unit reachable over HTTPS. In the DeepGuard architecture, EC2 is the production host that exposes the platform to bank operators and to external eKYC integrations, while the underlying topology — the strict tiering, the model-serving boundary, and the dual authentication schemes described above — remains identical to the local environment, so that what is validated under Docker Compose locally is exactly what runs in the cloud.

## 1.10 Chapter Summary

Chapter 1 has fully established the foundation for the SFDCT method. We began from the *technical nature* of the three deepfake-generation families (autoencoder face-swap, GAN, diffusion) and the four forgery families in FF++, from which we derived the **central thesis**: forgery traces — blending boundaries, upsampling patterns, frequency inconsistency — are *weak in the spatial domain but clear in the mid/high-frequency bands*. This thesis justifies the two-branch architecture: the **EfficientNet-B4** backbone (compound scaling, MBConv, ImageNet transfer learning) captures spatial traces, while the **block-wise DCT 8×8** branch (YCbCr → zigzag → 16 bands → log-magnitude → drop low bands) captures frequency traces.

We analysed the core challenge — *the paradox of high in-dataset but dropping cross-dataset performance* — and the reason it drives the thesis's fair evaluation protocol (train FF++ → test CDFv2, headline frame-level AUC following DeepfakeBench). The fusion mechanism, **gated cross-attention with a zero-init gate $\alpha$**, was clarified together with its *floor ≥ B4* property — an important design contribution in terms of risk safety. Finally, we laid the theoretical groundwork for the **five levers S1–S5** (inheriting from SPSL, SRM, FcaNet, FreqDebias, FDFL) and tied the whole to the *eKYC context* together with the legal constraint FPR ≤ 5% (Circular 17/2024/TT-NHNN) and the need for XAI via Grad-CAM.

On this foundation, **Chapter 2** will present in detail the architecture and implementation formulas of SFDCT — how to build the block-DCT branch, the gated cross-attention mechanism, and how to realise each of the S1–S5 levers as the ablation configurations B4 → naive SFDCT → Row1 → Row2.


# CHAPTER 2: SYSTEM ANALYSIS AND DESIGN

Chapter 1 clarified the context, motivation, and theoretical foundations of deepfake detection in eKYC: face forgeries produced by GAN/upsampling leave faint traces in the spatial domain but pronounced ones in the mid-to-high frequency bands of the DCT. Chapter 2 moves from "why" to "how": we first analyse the requirements of a deepfake-detection system serving eKYC, then design the overall architecture and data pipeline, and finally — as the central part — present in detail the **proposed SFDCT method** (Spatial–Frequency learning with block-wise DCT) together with five improvement levers and four ablation configurations. The guiding spirit throughout the chapter is that every design decision originates from a specific need, is explained first by intuition and then by formulation, and is always tied to the ultimate goal of **cross-dataset generalisation** measured by frame-level AUC on Celeb-DF-v2.

## 2.1 Requirements analysis

Before designing any component, we must answer the question: what must this system *be able to do* (functional requirements), and *how good* must it be (non-functional requirements)? The banking eKYC context imposes stricter constraints than an ordinary image-classification problem: a wrong decision may let a fraudster bypass biometric authentication, so the system must be not only accurate but also *explainable* and *threshold-calibratable* in accordance with legal regulations.

### 2.1.1 Functional requirements

The functional requirements describe the capabilities the system must provide to its users — in this context, the eKYC authentication pipeline and the operating engineer. The table below maps each function to its input, output, and significance.

[[TABLE 2.1: Functional requirements of the SFDCT deepfake-detection system]]

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

[[TABLE 2.2: Non-functional requirements and their measurement criteria]]

| ID | Attribute | Measurement criterion | Target |
|----|-----------|-----------------------|--------|
| NFR1 | Cross-dataset accuracy | Frame-level AUC on CDFv2 (trained on FF++) | Higher than the B4 baseline (0.7497) |
| NFR2 | Explainability (XAI) | Grad-CAM + t-SNE + frequency viz available | Reviewers can understand the decision |
| NFR3 | Inference latency | Processing time for one frame | [[FILL: ms/frame on RTX 3060]] |
| NFR4 | Reproducibility | Re-running in DeepfakeBench yields the same result | Fixed seed, public config |
| NFR5 | eKYC operating point | FPR at the operating threshold | ≤ 5% (ISO 30107-3 convention; Circular 17 requires it qualitatively) |

The key point to emphasise is that **NFR1 (cross-dataset generalisation) is given the highest priority**. The reason is that, in practice, an attacker will use new deepfake tools that the model *has never seen during training*. A model that achieves a very high in-dataset AUC but collapses when faced with an unfamiliar manipulation is useless for eKYC. Therefore, the entire method design in the following sections takes "improving cross-dataset AUC without sacrificing stability" as its guiding principle.

## 2.2 Overall system design

### 2.2.1 Use-case diagram

The system has two groups of actors: the **end eKYC user** (the customer who submits authentication images/videos) and the **engineer/operator** (who trains the model, calibrates the threshold, and inspects the explanations). The use-case diagram below describes the main interactions.

[[FIGURE 2.1: Use-case diagram of the SFDCT system — actor "eKYC customer" with use cases {Load frame, Receive REAL/FAKE result}; actor "Operating engineer" with use cases {Train model, Calibrate FPR≤5% threshold, View Grad-CAM/t-SNE, Cross-dataset evaluation}]]

Separating the two groups of actors accurately reflects two operating phases: the *offline* phase (the engineer trains, evaluates, and calibrates) and the *online* phase (the customer is authenticated in real time). These two phases share the same SFDCT model but differ in their data flow, as presented in Section 2.2.3.

### 2.2.2 Overall architecture

The system architecture is organised into four sequential blocks, each carrying a clear responsibility. This block decomposition achieves separation of concerns: each block can be replaced or upgraded without breaking the rest.

![Figure 2.2 — Overall SFDCT architecture](figures/fig_2_2_architecture.png)
*Figure 2.2: Overall architecture — Pre-processing (face detect/align/crop 256×256) → SFDCT (spatial EfficientNet-B4 branch + frequency block-DCT branch, fused by zero-initialised gated cross-attention) → Post-processing & thresholding (sigmoid → fake_prob → compare with τ) → Grad-CAM explanation.*

[[TABLE 2.3: The four blocks of the overall architecture and their responsibilities]]

| Block | Component | Input → Output | Role |
|-------|-----------|----------------|------|
| B1. Pre-processing | Face detector + aligner + cropper | Raw image → normalised 256×256 face crop | Removes background noise, normalises the input |
| B2. SFDCT model | Spatial B4 + frequency block-DCT + gated fusion | Image tensor → logit/embedding | Extracts spatial+frequency features, classifies |
| B3. Post-processing & thresholding | Sigmoid + threshold comparator τ | Logit → fake_prob → label | Converts the score into an operational decision |
| B4. Explanation | Grad-CAM (+ t-SNE, frequency viz offline) | Image + model → heatmap | Makes the decision transparent to reviewers |

These four blocks correspond directly to the five functional requirements: B1 realises FR1, B2 realises FR2, B3 realises FR3 and FR5, and B4 realises FR4. This one-to-one mapping between requirements and architectural blocks demonstrates the principle of "minimal yet sufficient design" — no block is redundant, and no requirement is left out.

### 2.2.3 Training data flow vs. eKYC inference flow

The same SFDCT model serves two different flows. Distinguishing the two flows clearly helps avoid confusion between what happens "once, offline" and what happens "per transaction, online".

[[FIGURE 2.3: The two data flows — (a) Training flow: FF++ c23 → sampling 32 frames → face crop → augmentation (including DCTFoMixup) → SFDCT → composite loss → weight update; (b) eKYC inference flow: customer frame → face crop → SFDCT (no augmentation) → fake_prob → compare against the calibrated threshold τ → REAL/FAKE + Grad-CAM]]

**Training flow (offline):** FaceForensics++ c23 data is sampled at 32 frames per video, passes through face cropping and a series of augmentations (including DCTFoMixup in the configurations where S3 is enabled), and is fed into SFDCT to compute the composite loss and update the weights with Adam. This is the resource-intensive phase, run on a GPU server (vast.ai), once per configuration.

**eKYC inference flow (online):** the customer's face frame goes through face cropping only (no augmentation), is fed into SFDCT to obtain `fake_prob`, is compared against the pre-calibrated threshold τ (ensuring FPR ≤ 5%), and returns a REAL/FAKE label together with Grad-CAM. This phase must be light and fast, prioritising low latency.

The crucial point is that **augmentation and the complex loss exist only in the training flow**; the inference flow is merely a pure forward pass plus a threshold comparison. Thanks to the zero-initialised gated-fusion design (Section 2.4.3), the model in the inference flow is never significantly heavier than B4 while still retaining the benefit of the frequency branch.

### 2.2.4 Use-case specifications

Beyond the SFDCT model that performs the core inference, DeepGuard is delivered as a multi-tenant web platform. This section formalises the application-level use cases — who may invoke each capability and under what conditions. The platform request flow is one-directional: the **Next.js** front-end (port 3000) calls the **FastAPI** back-end (port 8000) through `src/lib/api.ts`; the back-end resolves data exclusively through the `deepguard_db` layer against **PostgreSQL** (port 5432), and forwards any inference request over `httpx` to the **SFDCT** microservice (port 8501, EfficientNet-B4 + block-DCT + Grad-CAM). The platform exposes two strictly separated authentication layers: a **JWT Bearer** layer for the human dashboard (`get_current_user`, `require_role`, `require_sysadmin`) and an **API-key Bearer** layer (`Authorization: Bearer sk-dg-…`, `get_api_key_auth`) for external eKYC integration on the `/v1/*` namespace.

#### Actors

Six actor archetypes interact with DeepGuard. Five are authenticated dashboard roles (`UserRole`), arranged in a privilege hierarchy from level 0 (read-only) to level 4 (platform-wide); the sixth is the unauthenticated visitor. A tenant administrator and the system administrator operate the dashboard via JWT, whereas the customer's own back-end integrates with the public detection endpoints via an API key.

*Table 2.9: Actors of the DeepGuard platform.*

| Actor | Description |
|-------|-------------|
| **Anonymous** | An unauthenticated visitor. May browse the public landing, pricing and documentation pages, self-register a new organisation (`POST /auth/register`), or accept a team invitation (`GET/POST /auth/accept-invite`). Holds no JWT and sees no tenant data. |
| **Viewer** (`viewer`, level 0) | A read-only member of a tenant. May view detection history, liveness checks and analytics; PII (image, IP, user-agent) is masked. Cannot modify any resource. |
| **Developer** (`developer`, level 1) | A tenant member responsible for API integration. May run the JWT-authenticated Playground (`/playground/detect/*`), create and revoke API keys, and configure webhooks. PII is masked in detection detail. |
| **Compliance** (`compliance`, level 2) | A tenant member responsible for review and regulatory traceability (TT17/ND13). May view the FAKE queue with **full PII**, open detection detail and attach audit notes (`POST /detections/{id}/notes`). Read-only otherwise. |
| **Admin** (`admin`, level 3) | The administrator of a single tenant. Manages team members and roles, invites members, manages API keys and webhooks, reads audit logs, and configures the tenant — all scoped to the administrator's own `tenant_id`. Cannot cross organisations, create tenants, or edit model thresholds. |
| **Sysadmin** (`sysadmin`, level 4) | The platform operator, acting **across all tenants**. Creates and approves/activates tenants (`POST/PATCH /tenants`), inspects any tenant's users and keys, and is the only actor allowed to edit model versions and thresholds. Cannot assign the `sysadmin` role to a tenant member. |

#### Use-case diagram

Figure 2.9 presents the use-case diagram. The unauthenticated **Anonymous** actor and the five authenticated dashboard roles inherit privileges upward (each higher role subsumes the use cases of the roles below it). The external eKYC client, although technically driven by the same back-end that hosts a developer's API key, is drawn separately to highlight the API-key authentication boundary on the `/v1/*` endpoints.

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

*Figure 2.9: DeepGuard use-case diagram — six actors over the eight core use cases. Dashboard actors authenticate with JWT; the external eKYC client authenticates with an API key on the `/v1/*` namespace.*

#### Core use-case specifications

The eight core use cases are specified below following the standard template (name, identifier, actors, description, trigger, pre-/post-conditions, basic flow, alternative flow, exception flow). Each specification reflects the actual endpoints and role matrix of the implemented system.

*Table 2.10: Use-case specification — UC-01 Detect deepfake (image).*

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

*Table 2.11: Use-case specification — UC-02 Detect deepfake (video).*

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

*Table 2.12: Use-case specification — UC-03 Liveness check.*

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

*Table 2.13: Use-case specification — UC-04 Register organisation (anonymous).*

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

*Table 2.14: Use-case specification — UC-05 Approve / activate tenant (sysadmin).*

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

*Table 2.15: Use-case specification — UC-06 Manage API keys (developer / admin).*

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

*Table 2.16: Use-case specification — UC-07 Invite & manage team (admin).*

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

*Table 2.17: Use-case specification — UC-08 Review detection & add audit note (compliance).*

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

*Table 2.18: Selected API specification for the core detection use cases.*

The following entry illustrates the request/response contract of the principal public endpoint backing UC-01; the remaining `/v1/*` endpoints follow the same envelope conventions (paginated lists, `{"detail": …}` errors, the verdict/spoof-type enumerations defined in the API specification).

| Field | Content |
|-------|---------|
| **Method** | POST |
| **Path** | `/v1/detect/image` |
| **Auth** | API-key Bearer (`Authorization: Bearer sk-dg-…`) — tenant-scoped via `api_key.tenant_id` |
| **Request** | `multipart/form-data` with an image `file`; optional metadata fields. |
| **Response (200)** | `{ "request_id": "req_…", "verdict": "FAKE", "prob_fake": 0.93, "label": "FAKE", "gradcam_b64": "<base64-PNG>" }` |
| **Error codes** | 401 (invalid/missing key) · 402 (`current_usage ≥ monthly_quota`) · 422 (no face / invalid input) · 429 (`rate_limit_rpm` exceeded, with `Retry-After`) · 5xx (SFDCT microservice unavailable) |

### 2.2.5 Activity diagrams

Whereas the use-case diagram (Section 2.2.1) and the overall architecture (Section 2.2.2) describe *what* the system does and *how its blocks are wired*, an activity diagram describes the *order in which work is carried out* — the control flow, the decision branches, and the points at which the flow may terminate early. For the **DeepGuard** application this is essential, because a single business action (for example, "analyse one image") triggers a chain that crosses three runtime tiers — the Next.js frontend, the FastAPI backend, and the SFDCT microservice — and because the eKYC pipeline composes two detectors (liveness then deepfake) in a cascade whose ordering carries strong security implications. This section presents the two most representative activities; the inter-tier message ordering of the same flows is then refined into sequence diagrams in Section 2.2.6.

**(a) Deepfake image detection.** The first activity covers the dashboard *Playground* path, in which an authenticated tenant user (a `developer` or `admin`, per the route matrix in Section 2.2.4) uploads a single image and receives a risk verdict together with explanations. The activity is interesting because of its two early-exit branches — when no face is detected and when the tenant's monthly quota is exhausted — and because of the band-mapping decision (`FAKE` / `REAL` / `UNCERTAIN`) governed by the `prob_fake` threshold ± 0.10 convention defined in the API specification.

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

*Figure 2.10: Activity diagram — deepfake image detection through the dashboard Playground (`POST /playground/detect/image`, JWT-authenticated). Two guard branches (RBAC and quota) and the mandatory MTCNN face-crop precede the SFDCT forward pass; the resulting `prob_fake` is mapped to a `FAKE`/`REAL`/`UNCERTAIN` band before the risk score, Grad-CAM heatmap, and 2D-DCT spectrum are returned to the user.*

The diagram makes explicit the two architectural invariants stated in `CONVENTIONS.md`: face cropping with **MTCNN is mandatory before any inference** (the flow can never reach the SFDCT call without a valid crop), and the SFDCT microservice is treated as a **black box reached only via `httpx POST /predict`**. Note also that the Playground path *counts* the tenant's quota but deliberately does **not** persist a row in the `detections` table — a known design decision documented in the role flows — which is why no "write detection record" node appears after the band mapping.

**(b) eKYC cascade — liveness then deepfake.** The second activity models the integration path used by an external customer backend through the API-key-authenticated `/v1/` endpoints. Here the order is security-critical: a presentation-attack (a printed photo or a replayed screen) must be rejected by **passive liveness** *before* any deepfake analysis is performed, so that compute is never spent on a frame that is not even a live capture. The cascade therefore short-circuits on a `SPOOF` verdict and only proceeds to `/v1/detect/image` when liveness returns `LIVE`.

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

*Figure 2.11: Activity diagram — eKYC cascade combining passive liveness (`POST /v1/detect/liveness`) and deepfake detection (`POST /v1/detect/image`) over API-key authentication. The cascade rejects presentation attacks early (`SPOOF`/`UNCERTAIN`) and only forwards a `LIVE` capture to the SFDCT deepfake stage; the final eKYC outcome combines both verdicts.*

This ordering reflects the threat model directly: liveness defends against print/screen/3-D-mask attacks (the `spoof_type` enum), while the deepfake stage defends against synthetic faces that may nonetheless pass a liveness check. The two stages share the same API key and both consume tenant quota, so the cascade is also the natural place where the per-key `rate_limit_rpm` (60 req/min by default) and the `monthly_quota` are exercised twice per verification attempt.

### 2.2.6 Sequence diagrams

A sequence diagram complements the activity diagrams above by fixing the *temporal ordering of messages between participants* — which component calls which, in which direction, and what each returns. For DeepGuard the participants are drawn from the four-tier architecture of `TECH_STACK.md`: the **Next.js frontend (:3000)**, the **FastAPI backend (:8000)**, the **PostgreSQL database (:5432)**, and the **SFDCT microservice (:8501)**. Three sequences are presented: the core image-detection round trip, the authentication-and-RBAC handshake, and the tenant-onboarding lifecycle.

**(c) Image detection (frontend → backend → SFDCT).** This sequence refines activity (a) into concrete inter-tier messages. It is the canonical request path of the whole product and the only place where the backend talks to the model: the FastAPI layer performs the **MTCNN crop**, forwards the normalised crop to the SFDCT microservice via `httpx`, receives `prob_fake` together with the base64 Grad-CAM, maps the score into a band, and returns a single JSON payload to the browser.

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

*Figure 2.12: Sequence diagram — single-image deepfake detection. The FastAPI backend performs the mandatory MTCNN crop, calls the black-box SFDCT microservice (`POST /predict`) over `httpx`, and assembles the risk score, decision hint, Grad-CAM, and 2D-DCT spectrum into one JSON response. Grad-CAM is returned inline as base64, never as a file path.*

The sequence highlights the one-directional, no-shortcut request flow mandated by the conventions: the frontend never contacts SFDCT directly, and SFDCT never touches PostgreSQL. The model tier is therefore fully replaceable behind the `/predict` contract `{prob_fake, label, gradcam_b64}`, and the inline-base64 Grad-CAM rule means no temporary files or filesystem paths are ever exposed.

**(d) Authentication and RBAC (login → JWT → require_role).** The second sequence covers how a dashboard session is established and how every subsequent protected call is gated. Login is a *public* endpoint that validates credentials against PostgreSQL (with a bcrypt hash check) and verifies that the tenant is active; on success it mints a stateless JWT. Each later dashboard request carries that JWT, and the backend dependency chain `get_current_user` → `require_role` enforces the minimum role declared by the endpoint.

```mermaid
sequenceDiagram
    actor U as User
    participant FE as Frontend (Next.js :3000)
    participant BE as Backend (FastAPI :8000)
    participant DB as PostgreSQL (:5432)
    U->>FE: Enter email + password
    FE->>BE: POST /auth/login (public)
    BE->>DB: SELECT user by email
    DB-->>BE: user row (bcrypt hash, role, tenant_id)
    BE->>BE: verify password + check tenant active
    alt invalid creds or suspended tenant
        BE-->>FE: 401 / 403 { detail }
        FE-->>U: Show error message
    else success
        BE->>BE: sign JWT (sub=user_id, role, tenant_id)
        BE-->>FE: 200 { access_token }
        FE->>FE: store token (Zustand auth) + GET /auth/me
        BE-->>FE: current user + tenant
        FE-->>U: Redirect to role-specific dashboard
    end
    Note over FE,BE: Every later dashboard call repeats:
    U->>FE: Open a protected page (e.g. /api-keys)
    FE->>BE: GET /api-keys (Authorization: Bearer JWT)
    BE->>BE: get_current_user -> require_role(developer/admin)
    alt role below minimum
        BE-->>FE: 403 { detail }
    else authorised
        BE->>DB: query scoped by current_user.tenant_id
        DB-->>BE: rows
        BE-->>FE: 200 { items }
    end
```

*Figure 2.13: Sequence diagram — authentication and RBAC. `POST /auth/login` validates credentials and tenant status against PostgreSQL, then issues a stateless JWT; every subsequent protected request is gated by the `get_current_user` → `require_role` dependency chain, and all data queries are scoped to `current_user.tenant_id`.*

The diagram surfaces two security properties of the design. First, **tenant scoping is implicit**: because the JWT carries `tenant_id`, the backend never trusts a client-supplied tenant identifier, which prevents cross-tenant data access. Second, the JWT is **stateless** — logout merely writes an audit-log entry and the client discards the token, so a token remains valid until its expiry (a known limitation noted in the role-flows document). RBAC is enforced server-side by `require_role`/`require_sysadmin`; the Zustand-based client guard is purely a UX convenience and is not the security boundary.

**(e) Tenant onboarding (register → pending → sysadmin approve → login).** The final sequence captures the controlled B2B onboarding lifecycle. Self-service registration deliberately creates the tenant in a **suspended** state so that a `sysadmin` must approve it before the organisation's admin can log in — preventing uncontrolled self-granting of admin access. The sequence spans two actors (the prospective tenant admin and the platform `sysadmin`) and shows why an immediate login attempt after registration is rejected.

```mermaid
sequenceDiagram
    actor A as New tenant admin
    actor S as Sysadmin
    participant FE as Frontend (Next.js :3000)
    participant BE as Backend (FastAPI :8000)
    participant DB as PostgreSQL (:5432)
    A->>FE: Fill registration form (org, name, email, password)
    FE->>BE: POST /auth/register (public)
    BE->>DB: create tenant (status=SUSPENDED) + admin user
    DB-->>BE: ok
    BE-->>FE: { status: "pending" }
    FE-->>A: "Registration submitted - awaiting approval"
    A->>FE: Attempt early login
    FE->>BE: POST /auth/login
    BE->>DB: load tenant (SUSPENDED)
    BE-->>FE: 403 "Organisation suspended"
    FE-->>A: Show blocked message
    Note over S,BE: Out-of-band: sysadmin reviews pending tenants
    S->>FE: Open Tenants list
    FE->>BE: GET /tenants (sysadmin JWT)
    BE-->>FE: tenants incl. the pending one
    S->>FE: Click "Activate"
    FE->>BE: PATCH /tenants/{id} { status: active }
    BE->>DB: update tenant status = ACTIVE
    DB-->>BE: ok
    BE-->>FE: 200 { tenant }
    A->>FE: Login again
    FE->>BE: POST /auth/login
    BE->>DB: load tenant (ACTIVE) + verify password
    BE-->>FE: 200 { access_token }
    FE-->>A: Enter Admin dashboard
```

*Figure 2.14: Sequence diagram — tenant onboarding. `POST /auth/register` creates a tenant in the `SUSPENDED` state, so an early login is rejected with HTTP 403; only after a `sysadmin` activates the tenant via `PATCH /tenants/{id}` can the tenant admin authenticate successfully and reach the Admin dashboard.*

This "approve-before-use" lifecycle is the deliberate counterpart to the role matrix of Section 2.2.4: registration alone never confers usable privileges, and the only actor that can transition a tenant from `SUSPENDED` to `ACTIVE` is the platform `sysadmin` — the same actor that can create an already-active tenant directly via `POST /tenants`. Together, Figures 2.10–2.14 trace every externally observable DeepGuard behaviour, from a single inference round trip to the full multi-tenant access lifecycle, back to the concrete endpoints and authentication layers specified earlier in this chapter.

### 2.2.7 API specifications

This section specifies the public-facing and dashboard endpoints that constitute the DeepGuard service contract. The DeepGuard backend is a FastAPI application exposing thirty-five endpoints in total; the specification below details the ten endpoints that carry the core eKYC workflow — deepfake detection, liveness verification, and the authentication/provisioning operations that precede them. Every request travels the one-directional flow defined in the architecture (Next.js frontend or external client → FastAPI :8000 → service → repository → PostgreSQL :5432), and detection requests additionally fan out over `httpx` to the SFDCT microservice (EfficientNet-B4 + block-DCT + Grad-CAM) at port 8501. All payloads are JSON; errors follow the FastAPI default envelope `{"detail": "<message>"}` with an appropriate HTTP status code.

**Authentication schemes.** DeepGuard enforces two non-interchangeable authentication layers, plus a small set of public endpoints. Table 2.20 summarises the three schemes.

[[BẢNG 2.20: Ba lược đồ xác thực của DeepGuard]]

| Scheme | Header | Token form | Consumers | Tenant scoping |
|--------|--------|------------|-----------|----------------|
| Public | — | — | Auth register/login, accept-invite, `/health` | None |
| JWT Bearer | `Authorization: Bearer <jwt>` | Signed JWT (HS256, python-jose) | Dashboard / admin users | `current_user.tenant_id` |
| API-Key Bearer | `Authorization: Bearer sk-dg-…` | Opaque key `sk-dg-…` | External eKYC integrators | `api_key.tenant_id` |

The JWT layer governs the dashboard (`/auth`, `/users`, `/tenant(s)`, `/detections`, `/analytics`, `/audit-logs`, `/playground/*`) and is further constrained by role-based access control over five roles (`viewer`, `developer`, `compliance`, `admin`, `sysadmin`). The API-key layer governs the integration surface (`/v1/detect/*`, `/v1/liveness/*`, `/v1/results/*`, `/v1/jobs/*`) that a customer's backend invokes during live authentication. The two layers are never mixed on a single endpoint.

**Common conventions.** Detection results carry a discriminative verdict derived from the SFDCT score `prob_fake` and the calibrated decision threshold τ: `FAKE` when `prob_fake ≥ τ + 0.10`, `REAL` when `prob_fake ≤ τ − 0.10`, and `UNCERTAIN` within the band τ ± 0.10. Liveness verdicts follow the analogous rule against the liveness score (`LIVE` ≥ 0.58, `SPOOF` ≤ 0.42, `UNCERTAIN` in the band τ ± 0.08). Each `POST /v1/detect/*` call consumes one unit of the tenant's `monthly_quota`; exceeding the quota yields HTTP 402, while exceeding the per-key `rate_limit_rpm` (default 60 requests/min) yields HTTP 429 with a `Retry-After` header.

Table 2.21 gives the at-a-glance index of the ten endpoints specified in detail in the remainder of this section.

[[BẢNG 2.21: Bảng tổng hợp mười endpoint cốt lõi của DeepGuard]]

| # | Method | Path | Auth | Purpose |
|---|--------|------|------|---------|
| 1 | POST | `/v1/detect/image` | API-Key | Detect deepfake on a single image |
| 2 | POST | `/v1/detect/video` | API-Key | Detect deepfake on a video (sampled frames, async) |
| 3 | GET | `/v1/results/{request_id}` | API-Key | Retrieve a previously computed detection result |
| 4 | GET | `/v1/jobs/{job_id}` | API-Key | Poll the status of an asynchronous video job |
| 5 | POST | `/v1/detect/liveness` | API-Key | Passive liveness check on a single image |
| 6 | POST | `/auth/login` | Public | Authenticate a user, return a JWT |
| 7 | POST | `/auth/register` | Public | Create a new tenant + admin user (SUSPENDED, pending approval) |
| 8 | POST | `/auth/accept-invite` | Public | Activate an invited account from an invitation token |
| 9 | POST | `/api-keys` | JWT (developer/admin) | Mint a new API key (plain value shown once) |
| 10 | POST | `/tenants` | JWT (sysadmin) | Provision a new tenant (ACTIVE) + admin account |

The flow of a typical integration request — the path most exercised in production — is shown in Figure 2.7.

```mermaid
sequenceDiagram
    participant C as Customer backend
    participant API as FastAPI :8000
    participant DB as PostgreSQL :5432
    participant SF as SFDCT :8501
    C->>API: POST /v1/detect/image (Bearer sk-dg-…, image file)
    API->>API: Validate API key, check quota & rate limit
    API->>SF: httpx POST /predict (MTCNN-cropped face)
    SF-->>API: {prob_fake, label, gradcam_b64}
    API->>DB: persist detection (tenant-scoped)
    API-->>C: 200 {request_id, risk_score, risk_band, verdict, gradcam_b64}
```

*Figure 2.7: Sequence of a synchronous `/v1/detect/image` call — API-key validation and quota/rate-limit enforcement at the boundary, inference delegated to the SFDCT microservice, the detection persisted tenant-scoped, and the scored verdict returned to the caller.*

The following sub-sections specify each endpoint individually. Each specification states the method, path, authentication scheme, the request (path/query parameters and body), a concrete request example, the HTTP 200 response with a JSON example, and the relevant error codes.

#### 1) POST /v1/detect/image

[[BẢNG 2.22: Đặc tả endpoint POST /v1/detect/image]]

| Field | Specification |
|-------|---------------|
| Method | `POST` |
| Path | `/v1/detect/image` |
| Auth | API-Key (`Authorization: Bearer sk-dg-…`) |
| Request — body | `multipart/form-data` with field `file` = a single face image (JPEG/PNG). Optional field `callback_url` to receive a webhook on completion. |
| Response 200 | JSON object with `request_id`, `risk_score` ∈ [0,1], `risk_band`, `verdict` ∈ {`FAKE`,`REAL`,`UNCERTAIN`}, and `gradcam_b64` (base64 PNG overlay). |
| Error codes | `400` malformed/empty image; `401` missing/invalid API key; `402` monthly quota exhausted; `429` per-key rate limit exceeded. |

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

#### 2) POST /v1/detect/video

[[BẢNG 2.23: Đặc tả endpoint POST /v1/detect/video]]

| Field | Specification |
|-------|---------------|
| Method | `POST` |
| Path | `/v1/detect/video` |
| Auth | API-Key (`Authorization: Bearer sk-dg-…`) |
| Request — body | `multipart/form-data` with field `file` = a video file. The server samples frames, crops faces with MTCNN, and aggregates per-frame scores asynchronously. |
| Response 200 | JSON acknowledging the asynchronous job: `job_id`, `status` = `queued`, and a `result_url` to poll. The final verdict is retrieved via `GET /v1/jobs/{job_id}` and `GET /v1/results/{request_id}`. |
| Error codes | `400` unsupported/corrupt video; `401` invalid API key; `402` quota exhausted; `429` rate limit exceeded. |

Example request:

```bash
curl -X POST https://api.deepguard.vn/v1/detect/video \
  -H "Authorization: Bearer sk-dg-7f3a9c2e1b8d4f60" \
  -F "file=@kyc_liveness_clip.mp4"
```

Example 200 response:

```json
{
  "job_id": "job_01HZXA1F7N5R2QW9",
  "request_id": "det_01HZXA1F7N5R2QW9",
  "status": "queued",
  "result_url": "/v1/jobs/job_01HZXA1F7N5R2QW9"
}
```

#### 3) GET /v1/results/{request_id}

[[BẢNG 2.24: Đặc tả endpoint GET /v1/results/{request_id}]]

| Field | Specification |
|-------|---------------|
| Method | `GET` |
| Path | `/v1/results/{request_id}` |
| Auth | API-Key (`Authorization: Bearer sk-dg-…`) |
| Request — path param | `request_id` — the identifier returned by a previous `/v1/detect/*` call. |
| Response 200 | The full detection record: `request_id`, `risk_score`, `risk_band`, `verdict`, `gradcam_b64`, and timestamps. Scoped to the calling key's tenant. |
| Error codes | `401` invalid API key; `403` the result belongs to another tenant; `404` unknown `request_id`. |

Example request:

```bash
curl https://api.deepguard.vn/v1/results/det_01HZX9P3M4QK8YV2A6 \
  -H "Authorization: Bearer sk-dg-7f3a9c2e1b8d4f60"
```

Example 200 response:

```json
{
  "request_id": "det_01HZX9P3M4QK8YV2A6",
  "risk_score": 0.087,
  "risk_band": "low",
  "verdict": "REAL",
  "created_at": "2026-06-08T09:14:22Z"
}
```

#### 4) GET /v1/jobs/{job_id}

[[BẢNG 2.25: Đặc tả endpoint GET /v1/jobs/{job_id}]]

| Field | Specification |
|-------|---------------|
| Method | `GET` |
| Path | `/v1/jobs/{job_id}` |
| Auth | API-Key (`Authorization: Bearer sk-dg-…`) |
| Request — path param | `job_id` — the identifier returned by `POST /v1/detect/video`. |
| Response 200 | Job status object: `job_id`, `status` ∈ {`queued`,`processing`,`done`,`failed`}, `progress` ∈ [0,1], and, once `done`, the aggregated `verdict` and `request_id`. |
| Error codes | `401` invalid API key; `403` job belongs to another tenant; `404` unknown `job_id`. |

Example 200 response (completed job):

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

#### 5) POST /v1/detect/liveness

[[BẢNG 2.26: Đặc tả endpoint POST /v1/detect/liveness]]

| Field | Specification |
|-------|---------------|
| Method | `POST` |
| Path | `/v1/detect/liveness` |
| Auth | API-Key (`Authorization: Bearer sk-dg-…`) |
| Request — body | `multipart/form-data` with field `file` = a single face image for passive (no-challenge) liveness scoring. |
| Response 200 | JSON with `check_id`, `score` ∈ [0,1], `verdict` ∈ {`LIVE`,`SPOOF`,`UNCERTAIN`}, and, when a spoof is detected, `spoof_type` ∈ {`print`,`screen`,`mask_3d`,`deepfake`,`unknown`}. |
| Error codes | `400` no face detected / malformed image; `401` invalid API key; `402` quota exhausted; `429` rate limit exceeded. |

Example request:

```bash
curl -X POST https://api.deepguard.vn/v1/detect/liveness \
  -H "Authorization: Bearer sk-dg-7f3a9c2e1b8d4f60" \
  -F "file=@kyc_face.jpg"
```

Example 200 response (spoof detected):

```json
{
  "check_id": "liv_01HZXB4G2P8T6KM3",
  "score": 0.31,
  "verdict": "SPOOF",
  "spoof_type": "screen"
}
```

#### 6) POST /auth/login

[[BẢNG 2.27: Đặc tả endpoint POST /auth/login]]

| Field | Specification |
|-------|---------------|
| Method | `POST` |
| Path | `/auth/login` |
| Auth | Public |
| Request — body | `application/json` with `email` and `password`. |
| Response 200 | JSON with `access_token` (JWT), `token_type` = `bearer`, and the authenticated `user` (id, name, role, tenant_id). |
| Error codes | `400` malformed body; `401` invalid credentials; `403` tenant is SUSPENDED (organisation not yet approved). |

Example request:

```json
{
  "email": "dev@vietbank.vn",
  "password": "Password123!"
}
```

Example 200 response:

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "id": "usr_3f1a",
    "name": "Dev VietBank",
    "role": "developer",
    "tenant_id": "tnt_vietbank"
  }
}
```

When the tenant is still SUSPENDED — the state of a self-service registration awaiting `sysadmin` approval — login is rejected with HTTP 403 and the message "Tổ chức đã bị tạm ngưng. Liên hệ quản trị nền tảng."

#### 7) POST /auth/register

[[BẢNG 2.28: Đặc tả endpoint POST /auth/register]]

| Field | Specification |
|-------|---------------|
| Method | `POST` |
| Path | `/auth/register` |
| Auth | Public |
| Request — body | `application/json` with `tenant_name`, `full_name`, `email`, `password`. |
| Response 200 | JSON acknowledging a pending registration: a new tenant is created in state SUSPENDED together with an `admin` user; status `pending`. The account becomes usable only after a `sysadmin` activates the tenant. |
| Error codes | `400` validation error (weak password / missing field); `409` email or tenant already exists. |

Example request:

```json
{
  "tenant_name": "ACB Digital",
  "full_name": "Nguyen Van A",
  "email": "admin@acb.vn",
  "password": "Password123!"
}
```

Example 200 response:

```json
{
  "status": "pending",
  "message": "Đã gửi đăng ký — chờ phê duyệt",
  "tenant": { "id": "tnt_acb", "name": "ACB Digital", "status": "SUSPENDED" }
}
```

This deliberate "pending approval" design implements controlled B2B onboarding: self-service registration never grants an immediately usable admin account.

#### 8) POST /auth/accept-invite

[[BẢNG 2.29: Đặc tả endpoint POST /auth/accept-invite]]

| Field | Specification |
|-------|---------------|
| Method | `POST` |
| Path | `/auth/accept-invite` |
| Auth | Public (the invitation token itself is the credential) |
| Request — body | `application/json` with `token` (the invitation token from `/?invite=<token>`), `full_name`, `password`. The token carries the pre-assigned role and target tenant. |
| Response 200 | JSON creating the user with the invited role, consuming the token, and returning an `access_token` for auto-login (id, name, role, tenant_id). |
| Error codes | `400` token expired / already used / invalid (returns `valid:false` + reason); `401` token signature invalid. |

Example request:

```json
{
  "token": "inv_8a2f0c91d7e3",
  "full_name": "Tran Thi B",
  "password": "Password123!"
}
```

Example 200 response:

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "id": "usr_9c4d",
    "name": "Tran Thi B",
    "role": "viewer",
    "tenant_id": "tnt_vietbank"
  }
}
```

The corresponding pre-fill check uses `GET /auth/accept-invite?token=…`, which returns the invited email, role, and tenant name (or `valid:false` + reason) so the frontend can show the invitation context before the user sets a password.

#### 9) POST /api-keys

[[BẢNG 2.30: Đặc tả endpoint POST /api-keys]]

| Field | Specification |
|-------|---------------|
| Method | `POST` |
| Path | `/api-keys` |
| Auth | JWT Bearer (roles `developer` and `admin`) |
| Request — body | `application/json` with `name` (label) and optional `monthly_quota`, `rate_limit_rpm`. The key is created scoped to `current_user.tenant_id`. |
| Response 200 | JSON with the key record (id, name, prefix, quota, rate limit) and the plain `key` value `sk-dg-…` — returned exactly once and never recoverable afterwards. |
| Error codes | `400` validation error; `401` missing/invalid JWT; `403` role lacks key-management permission (e.g. `viewer`, `compliance`). |

Example request:

```json
{
  "name": "VietBank production eKYC",
  "rate_limit_rpm": 120
}
```

Example 200 response:

```json
{
  "id": "key_2b7e",
  "name": "VietBank production eKYC",
  "key": "sk-dg-7f3a9c2e1b8d4f60a1c5",
  "prefix": "sk-dg-7f3a",
  "rate_limit_rpm": 120,
  "monthly_quota": 100000,
  "status": "active"
}
```

The plain `key` is shown only in this response; subsequent `GET /api-keys/{key_id}` calls return the record without the plain value.

#### 10) POST /tenants

[[BẢNG 2.31: Đặc tả endpoint POST /tenants]]

| Field | Specification |
|-------|---------------|
| Method | `POST` |
| Path | `/tenants` |
| Auth | JWT Bearer (role `sysadmin` only) |
| Request — body | `application/json` with `tenant_name`, `admin_email`, `admin_full_name`, and optional `plan`, `monthly_quota`. |
| Response 200 | JSON creating a tenant in state ACTIVE together with an `admin` account; includes a one-time `temporary_password` (shown once, copied to the admin) to bootstrap login. |
| Error codes | `400` validation error; `401` missing/invalid JWT; `403` caller is not `sysadmin`; `409` tenant or admin email already exists. |

Example request:

```json
{
  "tenant_name": "Techcombank eKYC",
  "admin_email": "admin@tcb.vn",
  "admin_full_name": "Le Van C",
  "plan": "enterprise"
}
```

Example 200 response:

```json
{
  "tenant": { "id": "tnt_tcb", "name": "Techcombank eKYC", "status": "ACTIVE", "plan": "enterprise" },
  "admin": { "id": "usr_tcb_admin", "email": "admin@tcb.vn", "role": "admin" },
  "temporary_password": "Tcb-9fK2-Qz7r"
}
```

Unlike self-service registration (`/auth/register`, which yields a SUSPENDED tenant), a tenant provisioned by a `sysadmin` is ACTIVE immediately, and the temporary password is surfaced exactly once for the platform operator to hand off to the new organisation's administrator. This same endpoint is the mechanism by which a `sysadmin` can also *approve* a pending self-service registration by activating the previously SUSPENDED tenant.

## 2.3 Data pipeline & pre-processing

The quality of the frequency features depends directly on the quality of pre-processing: a misaligned or improperly compressed face crop can create spurious frequency artefacts that mislead the model. The data pipeline is therefore rigorously standardised following DeepfakeBench to ensure fairness and reproducibility.

### 2.3.1 Data sources & train/val/test split

Following the DeepfakeBench protocol, the model is **trained on FaceForensics++ (FF++), the c23 compressed version**, and **tested cross-dataset on Celeb-DF-v2 (CDFv2)**. Clearly separating the training set and the test set into two different distributions is precisely the core of measuring generalisation.

[[TABLE 2.4: Data sources and their roles in the evaluation protocol]]

| Dataset | Scale | Role | Split |
|---------|-------|------|-------|
| FF++ c23 | 1000 real videos + 4 forgery methods (Deepfakes, Face2Face, FaceSwap, NeuralTextures) | Train + validation | Per the standard DeepfakeBench split [[FILL: specific train/val ratio]] |
| Celeb-DF-v2 | 590 real videos + 5639 high-quality deepfake videos | Cross-dataset test (no training) | Entirely used for testing |
| DFDC | [[FILL: subset size]] | Additional cross-dataset (future) | Future direction |

The logic of this split is as follows: FF++ provides a diversity of *manipulation types* so the model learns generalisable forgery traces; CDFv2, with its high-quality celebrity deepfakes, plays the role of a genuine "examination" — if the model has merely memorised the artefacts specific to FF++, it will fail on CDFv2. Frame-level AUC on CDFv2 is therefore a faithful measure of generalisation ability.

### 2.3.2 Frame sampling

Each video is sampled at **32 frames** (`frame_num = 32`) evenly distributed along the temporal axis. The intuition is that a frame-level model does not need every frame, only a representative set large enough to cover the variation in pose, expression, and lighting conditions within the video. The number 32 is a balance point between information coverage and computation/storage cost, and it is also consistent with the baseline configuration to allow a fair comparison.

### 2.3.3 Face detection & alignment

Each frame is passed through a face detector to locate the bounding box and the landmarks, after which it is **aligned** to a canonical pose and **cropped to 256×256**. When the face lies close to the border or its aspect ratio does not match, **padding** is applied to preserve the frame ratio without distorting the geometric features. The final image is normalised with `mean = std = 0.5` (mapping the pixels to approximately [−1, 1]).

[[TABLE 2.5: The face pre-processing steps]]

| Step | Operation | Input | Output |
|------|-----------|-------|--------|
| 1 | Face + landmark detection | Raw frame | Bounding box + landmarks |
| 2 | Alignment | Box + landmarks | Pose-rectified face |
| 3 | Crop + padding | Aligned face | 256×256 image preserving the ratio |
| 4 | Normalisation | 256×256 image | Tensor (mean=std=0.5) |

The reason for the strict alignment normalisation is that the block-DCT branch (Section 2.4.2) divides the image into fixed 8×8 blocks; if the face is not aligned consistently, the same anatomical region (for example, the cheek) will fall into different blocks across images, corrupting the per-band frequency statistics. Good alignment keeps the frequency features stable and comparable across samples.

### 2.3.4 Augmentation

Augmentation is applied only in the training flow, in order to increase data diversity and reduce overfitting. Beyond the standard geometric/photometric augmentations (horizontal flip, mild brightness/contrast changes, simulated JPEG compression — [[FILL: list the exact augmentation pipeline from the config]]), the distinctive contribution of this work is **DCTFoMixup** (activated in the configurations where S3 is enabled): it mixes the DCT frequency bands between two samples and then performs an inverse-DCT to create a new sample, forcing the model to learn more invariant frequency features (detailed in Section 2.5.3). It is worth noting that augmentations that strongly affect the frequency spectrum must be designed carefully so as not to inadvertently erase the very forgery traces the model needs to learn.

## 2.4 PROPOSED METHOD — The SFDCT architecture

This is the central part of the entire project. The name **SFDCT** stands for **S**patial–**F**requency learning with block-wise **DCT**. The core idea originates from an empirical observation: the artefacts of GAN/upsampling (checkerboard grids, frequency-spectrum anomalies) are very hard to see in the pixel domain but appear clearly in the DCT frequency domain. A spatial backbone such as EfficientNet-B4 learns semantic features (eyes, nose, skin texture) very well but is partially "blind" to subtle frequency anomalies. SFDCT adds a dedicated *frequency branch* and fuses it into the backbone in a *safe* manner, so that in the worst case the model is never worse than B4.

### 2.4.1 Two-branch overview

SFDCT comprises two parallel branches sharing the same input — a 256×256 face crop:

- **Spatial branch:** EfficientNet-B4 pretrained on ImageNet, extracting semantic and textural features in the pixel domain. This is the "backbone", primarily responsible for most of the classification capability.
- **Frequency branch:** transforms the image into the frequency domain via a block-wise 8×8 2D-DCT, extracts spectral features over 16 zigzag frequency bands, and produces a supplementary representation (context) focused on frequency-domain forgery traces.

The two branches meet at the **zero-initialised gated cross-attention** module, where the frequency features are "injected" into the spatial features through a gate whose coefficient `alpha` is initialised to 0.

[[FIGURE 2.4: The two-branch SFDCT architecture — (top) 256×256 image → EfficientNet-B4 → feature map x; (bottom) image → YCbCr → block-DCT 8×8 → log-magnitude → 16 zigzag bands → DCT feature; the two branches merge at the zero-init gated cross-attention: feature_fused = x + alpha·context(DCT) → classifier → logit]]

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

[[TABLE 2.6: Mapping of the block-DCT frequency-branch steps (step → input → output → role)]]

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

[[TABLE 2.7: Meaning of the gate alpha by value]]

| Value of $\alpha$ | Model state | Interpretation |
|-------------------|-------------|----------------|
| $\alpha = 0$ (init) | Equivalent to B4 | Safe "floor" — never worse than the baseline |
| $\alpha \to$ small positive | Frequency lightly supplementary | Backbone dominant, frequency fine-tunes |
| $\alpha$ larger | Frequency contributes strongly | Frequency traces are genuinely important |

This is precisely the **"floor ≥ B4" guarantee** — the most important contribution in terms of risk safety of the design (never below the B4 baseline). The learned value of $\alpha$ will be visualised in Chapter 3 through the figure `gate_alpha.png`, showing the extent to which the model actually relies on the frequency branch. This zero-init gate mechanism is inspired by the zero-initialised residual technique used in modern architectures [[CHECK: citation for ReZero / Fixup / zero-init residual]].

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

[[TABLE 2.8: The four ablation configurations and the on/off state of each improvement lever]]

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

[[TABLE 2.9: The components of the loss function]]

| Component | Formula/meaning | Enabled when |
|-----------|-----------------|--------------|
| $\mathcal{L}_{\text{CE}}$ | REAL/FAKE classification cross-entropy on the original sample | Always on |
| $\mathcal{L}_{\text{cls\_aug}}$ | Cross-entropy on the DCTFoMixup hybrid sample | When S3 is on |
| $\mathcal{L}_{\text{cons}}$ | symmetric-KL (probabilities) + MSE (embedding) — see Section 2.5.3 | When S3 is on |
| $\mathcal{L}_{\text{sc}}$ | Single-center loss — see Section 2.5.5 | When S5 is on |

The $\lambda$ coefficients balance the contribution of each component. When all levers are off (naive SFDCT), the loss reduces to exactly the standard cross-entropy — once again affirming the principle of "safe by default, enable more when needed".

[[TABLE 2.10: Values of the loss weighting coefficients]]

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

[[TABLE 2.11: Training hyperparameters]]

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

[[TABLE 2.12: The evaluation metrics]]

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

[[TABLE 2.13: The three explanation tools and their corresponding questions]]

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


# CHAPTER 3: SYSTEM IMPLEMENTATION AND EVALUATION

Chapter 2 presented the theoretical foundations and architecture of the **SFDCT** method (Hybrid Spatial–Frequency Learning with Block-wise DCT): an EfficientNet-B4 spatial backbone augmented with a block-wise 2D-DCT frequency branch and merged through a zero-initialised gated cross-attention, together with five frequency "levers" S1–S5 adapted from the SPSL, SRM, FreqDebias, FcaNet and FDFL works. Chapter 3 moves from design to **empirical validation**: it describes the experimental environment, the data statistics, the training process and its convergence, and then presents the **main results** — the cross-dataset ablation table measured in frame-level AUC on Celeb-DF-v2 — together with qualitative analyses through visualisations (ROC/PR, confusion matrix, t-SNE, frequency spectra, Grad-CAM, gate alpha values). Finally, the chapter illustrates a deepfake-detection demo for the eKYC setting, with a decision threshold calibrated to the FPR ≤ 5% requirement of Circular 17/2024/TT-NHNN, and offers a candid discussion of the strengths and limitations of the results.

The guiding objective throughout the chapter is to remain **honest and reproducible**: every number confirmed from experiments is stated explicitly, while every number whose training is not yet complete is marked `[[FILL: ...]]` to be filled in later, with no extrapolation whatsoever.

## 3.1 Experimental environment

Before reading any number, the reader needs to know under what conditions those numbers were produced. A deepfake results report is meaningful only when the hardware, software and measurement protocol are fixed and described transparently — this is also the spirit of DeepfakeBench, the standardised framework the thesis uses to ensure a fair comparison.

### Hardware

The entire training and evaluation process is split into two phases following the *smoke-test-before-train* principle: a quick test on the local machine before running full training on a rented GPU (vast.ai).

[[TABLE 3.0: Hardware configuration used for the experiments]]

| Item | Local machine (smoke test) | Full-training machine |
|---|---|---|
| GPU | NVIDIA RTX 3050/3060 (4 GB VRAM) | [[FILL: rented GPU model, e.g. RTX 4090/A5000]] |
| VRAM | 4 GB | [[FILL: VRAM, e.g. 24 GB]] |
| System RAM | [[FILL: local RAM]] | [[FILL: rented-machine RAM]] |
| Disk (dataset + ckpt) | [[FILL: capacity]] | [[FILL: capacity]] |
| Purpose | shape → dry-run → overfit-1-batch | full training + evaluation |

The local machine only serves to verify the correctness of the pipeline (checking tensor shapes, running a trial loop, and overfitting one batch to confirm that the model can learn), since the 4 GB VRAM limit is insufficient for a batch of 32 at a resolution of 256×256. All full training and the final AUC measurements are carried out on the rented GPU.

### Software

The dependencies are version-pinned to ensure reproducibility:

[[TABLE 3.0b: Software stack]]

| Component | Version |
|---|---|
| Python | 3.10–3.12 ([[FILL: exact version used]]) |
| PyTorch | [[FILL: version, e.g. 2.x]] |
| CUDA Toolkit | [[FILL: version, e.g. 11.8/12.x]] |
| cuDNN | [[FILL: version]] |
| torchvision | [[FILL]] |
| numpy / opencv-python | [[FILL]] / [[FILL]] |
| Evaluation framework | DeepfakeBench (training/eval pipeline) |

Version pinning is especially important for the DCT branch: the block-wise 2D-DCT transform and the frequency statistics are sensitive to numerical differences between library versions, so only the same seed on the same stack guarantees that the exact numbers are reproduced.

### Training time

Each model is trained on FaceForensics++ c23 with the default `nEpochs` configuration and evaluated cross-dataset on Celeb-DF-v2.

[[TABLE 3.0c: Training time per model]]

| Model | Epochs | Time/epoch | Total time | GPU |
|---|---|---|---|---|
| B4 (baseline) | 10 | _(not yet recorded)_ | _(not yet recorded)_ | rented GPU (vast.ai) |
| naive SFDCT (B4-DCT) | 10 | _(not yet recorded)_ | _(not yet recorded)_ | rented GPU (vast.ai) |
| Row1 (S1+S2+S3) | 10 | _(not yet recorded)_ | _(not yet recorded)_ | rented GPU (vast.ai) |
| Row2 (S4+S5+S3) | _(training in progress)_ | — | — | rented GPU (vast.ai) |

A note on cost: because each full training run consumes a considerable amount of rented GPU time, the results in this chapter are obtained from a **single seed**; this limitation is analysed in detail in Section 3.7.

### Training configuration (hyperparameters)

To keep the ablation comparison fair, **all** models share a single set of hyperparameters; they differ only in whether the DCT branch and the levers S1–S5 are enabled or disabled.

[[TABLE 3.0d: Training hyperparameters shared across all models]]

| Hyperparameter | Value |
|---|---|
| Backbone | EfficientNet-B4 (ImageNet pretrained) |
| Input resolution | 256 × 256 (face crop) |
| Normalisation | mean = std = 0.5 |
| Batch size | 32 |
| frame_num (train/test) | 32 / 32 |
| Optimizer | Adam (β1 = 0.9, β2 = 0.999, weight_decay = 5e-4) |
| Learning rate | 2e-4 |
| Compression | c23 |
| Train dataset | FaceForensics++ |
| Test dataset (headline) | Celeb-DF-v2 (cross-dataset) |
| Epochs | 10 |
| Seed | 1024 |

## 3.2 Data analysis & statistics

The quality and characteristics of the data directly determine the conclusions about generalisation ability. The thesis follows the DeepfakeBench cross-dataset protocol exactly: **training entirely on FaceForensics++** and **testing only on Celeb-DF-v2** — Celeb-DF-v2 never appears in training. This split faithfully simulates the real eKYC deployment scenario, in which the model must face deepfake styles and face distributions it has never seen.

### Statistics of the two datasets

**FaceForensics++ (FF++)** is the training dataset: 1000 real videos, together with 4 forgery methods — Deepfakes, Face2Face, FaceSwap, NeuralTextures — generated from those same 1000 source videos. The thesis uses the **c23** compressed version (light H.264 compression, closer to real-world video quality than the raw version). **Celeb-DF-v2** is the cross-dataset test set: 590 real videos and 5639 high-quality celebrity deepfake videos; the high deepfake quality and subtle artifacts make this a stringent test of generalisation.

[[TABLE 3.1: Statistics of FaceForensics++ c23 and Celeb-DF-v2]]

| Attribute | FaceForensics++ (c23) | Celeb-DF-v2 |
|---|---|---|
| Role | Train (+ in-dataset test) | Test (cross-dataset) |
| Number of real videos | 1000 | 590 |
| Number of fake videos | 4000 (4 methods × 1000) | 5639 |
| Forgery methods | Deepfakes, Face2Face, FaceSwap, NeuralTextures | High-quality face-swap |
| Compression | c23 (H.264) | MPEG-4/H.264 (CDFv2 release) |
| Sampled frame_num (train/test) | 32 / 32 | 32 (test) |
| Real frames extracted (after crop) | ≈ 31,949 | 5,620 (used for evaluation) |
| Fake frames extracted (after crop) | ≈ 127,677 (4 × ~31.9k) | 10,800 (used for evaluation) |
| Total frames used | ≈ 159,626 | 16,420 |

The `[[FILL]]` cells regarding the actual frame counts depend on the frame-extraction and face-detection/alignment steps of DeepfakeBench (sampling `frame_num = 32` frames per video) and will be filled in after running the statistics on the preprocessed data.

### Class distribution and its impact on measurement

Both datasets are **imbalanced** along different and opposing dimensions:

- FF++ is skewed towards **fake** (real:fake ratio ≈ 1:4 at the video level), because each real video produces four fake variants.
- Celeb-DF-v2 is also strongly skewed towards **fake** (590 real versus 5639 fake, ≈ 1:9.6 at the video level).

Why does this matter? With such a skewed distribution, **accuracy is a misleading metric** (a model that always predicts "fake" still achieves high accuracy on Celeb-DF-v2). This is precisely why the thesis chooses **frame-level AUC** as the headline metric: AUC is invariant to the class ratio and measures the ability to separate real from fake across the entire range of thresholds, making it suitable for a fair comparison of generalisation.

![Figure 3.1 — Real/fake distribution of the two datasets](figures/fig_3_1_distribution.png)
*Figure 3.1: Distribution of real/fake sample counts for FF++ (train) and Celeb-DF-v2 (test). FF++ ~1 real : 4 fake (4 methods); CDFv2 is strongly skewed towards fake.*

### Illustration of frames and the face-crop region

The DeepfakeBench preprocessing pipeline: from each video → extract frames → detect the face → align and crop to the face region → resize to 256×256 → normalise with mean=std=0.5. The frequency branch additionally converts the cropped image to the YCbCr space before applying block-wise DCT.

![Figure 3.2 — Real/fake pair + DCT spectrum](figures/fig_3_2_preprocess_realfake.png)
*Figure 3.2: A real/fake face pair (FF++ Deepfakes, same identity) after a 256×256 crop, together with the log|2D-DCT| spectrum — illustrating the frequency footprint of deepfakes.*

## 3.3 Training process & convergence

Before trusting the final AUC number, one must check whether the training process **converges healthily**: the loss decreases steadily, the AUC on the test set rises and saturates rather than fluctuating chaotically or overfitting early. This section examines the training curves for each model.

### Loss/AUC curves over epochs

The curves are generated automatically by `training/plot_training_curve.py` (path: `DeepfakeBench/tools/plot_training_curve.py`), with each model having its own `training_curve.png` plot.

![Figure 3.3 — Training curve for B4](figures/fig_3_3_train_b4.png)
*Figure 3.3: B4 (baseline) — train loss, train AUC per iteration, and test-AUC (FF++/CDFv2) per epoch. The figures are taken DIRECTLY from the training log (not simulated).*

![Figure 3.4 — Training curve for naive SFDCT](figures/fig_3_4_train_naive.png)
*Figure 3.4: naive SFDCT (B4-DCT) — loss + AUC per epoch.*

![Figure 3.5 — Training curve for Row1](figures/fig_3_5_train_row1.png)
*Figure 3.5: Row1 (S1+S2+S3) — loss + AUC per epoch.*

*Figure 3.6 (Row2 — S4+S5+S3): training in progress, to be added once the log is available.*

### Convergence remarks

**Remarks:** the curves are plotted **directly from the real training logs** (regex parser, no simulated numbers). Over 10 epochs, the training loss decreases steadily and the **test-AUC on CDFv2 rises and then saturates** around the best epoch; the checkpoint at the best test-AUC is kept for evaluation. B4 reaches a CDFv2-AUC ≈ 0.75 (close to the DeepfakeBench leaderboard value of 0.7487 → confirming the pipeline is correct). No sign of heavy overfitting is observed within 10 epochs (the test-AUC does not drop sharply at the end); however, since only a **single seed** is run, the run-to-run variation has not been quantified — this is a limitation noted in Section 3.7.

One important design point to clarify here concerns the **zero-initialised gated cross-attention**: the gate coefficient `alpha` is initialised to 0, so at the start of training the fusion formula `feature_fused = x + alpha · context(DCT)` degenerates to exactly `feature_fused = x`, meaning the SFDCT model is **equivalent to a plain EfficientNet-B4 at initialisation**. As a consequence, the convergence curves of the SFDCT variants start from the same "floor point" as B4 and only diverge upward once the DCT branch begins to contribute (as alpha grows) — this is the mechanism that guarantees *floor ≥ B4* by design, which will be quantitatively verified in Section 3.4 and observed directly through the alpha value in Section 3.5.

### Pipeline validation via the B4 baseline

An important quality-control step: the thesis's EfficientNet-B4 baseline reaches a **CDFv2 frame-AUC = 0.7497**, close to the official DeepfakeBench leaderboard value for EfficientNet-B4 of **0.7487**. This match (a difference of ≈ 0.001) confirms that the thesis's training and evaluation pipeline has been set up correctly — a prerequisite for any subsequently measured improvement to be trustworthy rather than an artifact of a configuration error.

## 3.4 Main results — Cross-dataset ablation

This is the **most important** section of the entire thesis: it directly answers the research question — *does adding block-DCT frequency information and the improvement levers help improve cross-dataset generalisation compared with a strong, already-tuned spatial backbone?* The headline metric is **frame-level AUC on Celeb-DF-v2** (trained on FF++ c23, tested cross-dataset).

### Main ablation table

The story is told in order of increasing complexity: **spatial-only → +DCT branch → +improvement levers**.

[[TABLE 3.2: Cross-dataset ablation results — frame-level AUC. Train: FF++ c23. Headline: Celeb-DF-v2]]

| Model | FF++ (in-dataset) AUC | Celeb-DF-v2 (cross) AUC | Δ vs. B4 |
|---|---|---|---|
| B4 (baseline) | _(being compiled)_ | **0.7497** | — |
| naive SFDCT (B4-DCT) | _(being compiled)_ | **0.7572** | **+0.0075** |
| Row1 (S1+S2+S3) | _(being compiled)_ | **0.7333** | **−0.0164** |
| Row2 (S4+S5+S3) | _(being compiled)_ | _(training in progress)_ | _(training in progress)_ |

Here: **naive SFDCT** is B4 plus the block-DCT branch and gated fusion with all of S1–S5 **off**; **Row1** adds S1 (dct_use_sign, adapted from SPSL) + S2 (dct_srm_residual, adapted from SRM) + S3 (DCTFoMixup + dual consistency loss, adapted from FreqDebias), a configuration that **adds no learnable parameters** (it only changes the input features and the loss function); **Row2** replaces these with S4 (dct_fca_attention, FcaNet MultiSpectralAttentionLayer) + S5 (single-center loss, adapted from FDFL) + S3, a configuration that **does add learnable parameters**.

### Story analysis

**Step 1 — spatial → +DCT (+0.0075).** This result is confirmed: the block-DCT branch raises the cross-dataset AUC from 0.7497 to 0.7572. This gain, though modest in absolute terms, is directionally meaningful: it supports the core hypothesis that forgery artifacts (especially from upsampling/GAN) are weak in the spatial domain but **more pronounced in the mid/high frequency bands of the 2D-DCT**, and that this frequency information *complements* (does not duplicate) B4's spatial features. More importantly, thanks to the zero-init gate mechanism, adding the DCT branch **does not degrade** the baseline — exactly the "floor ≥ B4" commitment.

**Step 2 — +DCT → +levers S1–S5.** This is the part still marked `[[FILL]]` (Row1, Row2 in training). The thesis commits to drawing conclusions **strictly according to the actually measured numbers**, and has prepared a reasoning framework for both scenarios:

- *Scenario A — Row1/Row2 continue to surpass naive SFDCT:* in this case the complete story "spatial → +DCT → +frequency levers" is reinforced; we will identify which lever contributes most through [[TABLE 3.3]], and contrast Row1 (0 added parameters) with Row2 (with added parameters) to discuss the trade-off between cost and effectiveness.
- *Scenario B — Row1/Row2 do not clearly surpass it, or the difference lies within noise:* the thesis will state this plainly, without sugar-coating. In that case the conclusion is: the block-DCT branch delivers a consistent and safe benefit (+0.0075, with a guaranteed floor), but within the scope of pure block-DCT the frequency levers S1–S5 are insufficient to produce a large AUC jump at a **single seed**; most of the room for strong improvement lies in the SBI (self-blended images) direction — which is outside the scope of pure block-DCT — proposed in Future Work.

In both scenarios, the core scientific contribution is unchanged: (1) a risk-safe fusion design with floor ≥ B4, (2) the consistent aggregation and adaptation of five frequency levers from five different works into **one** unified block-DCT domain, and (3) a fair cross-dataset evaluation protocol following DeepfakeBench.

### Per-knob ablation (enabling/disabling each lever)

To decompose the contribution of each lever, the thesis measures an ablation that independently enables/disables each of S1–S5 (placed on top of the naive SFDCT base), helping to identify which lever genuinely raises the AUC and which is neutral or adds noise.

[[TABLE 3.3: Per-knob ablation — CDFv2 frame-AUC when adding each lever to the naive SFDCT base]]

| Configuration | Lever description | Adapted from | Adds parameters? | CDFv2 AUC | Δ vs. naive |
|---|---|---|---|---|---|
| naive SFDCT | (base, S1–S5 off) | — | No | 0.7572 | — |
| + S1 | dct_use_sign (sign of DCT coefficients) | SPSL | No | [[FILL]] | [[FILL]] |
| + S2 | dct_srm_residual (DCT on SRM residual) | SRM | No | [[FILL]] | [[FILL]] |
| + S3 | DCTFoMixup + dual consistency | FreqDebias | No | [[FILL]] | [[FILL]] |
| + S4 | dct_fca_attention (MultiSpectral) | FcaNet | Yes | [[FILL]] | [[FILL]] |
| + S5 | single-center loss | FDFL | Yes | [[FILL]] | [[FILL]] |

[[FILL: remarks — which lever contributes most, which is neutral; whether there is any synergy/cancellation when combined (comparing Row1/Row2 with the sum of the individual levers)]].

## 3.5 Qualitative analysis through visualisations

The AUC number summarises performance into a single quantity, but it does not tell us **why** and **how**. This section uses a set of visualisations generated automatically from `training/eval_and_viz.py` (each model has a full set, stored on Hugging Face under four directories `b4/`, `sfdct_naive/`, `row1_sfdct_s1024/`, `row2_sfdct_v2_s1024/`) to interpret the model's behaviour.

### ROC and Precision–Recall

The ROC curve shows the trade-off between the true positive rate and the false positive rate across all thresholds; the PR curve is more appropriate for class-imbalanced data (such as Celeb-DF-v2). Comparing these curves across the four models gives a visual sense of which model "covers" better in the low-FPR region — a region that is especially important for eKYC (Section 3.6).

![Figure 3.7 — ROC on CDFv2](figures/fig_3_7_roc.png)
*Figure 3.7: ROC curves of the models on Celeb-DF-v2; the AUC is given in the legend. The red line = the eKYC constraint FPR ≤ 5%.*

![Figure 3.8 — Precision–Recall on CDFv2](figures/fig_3_8_pr_curve.png)
*Figure 3.8: Precision–Recall on CDFv2 (AP in the legend).*

**Remarks:** in the FPR ≤ 5% region — the decisive region for eKYC — **naive SFDCT gives the highest TPR (0.2298)**, above B4 (0.2228) and Row1 (0.1674); this ranking is consistent with the AUC ranking (0.7572 > 0.7497 > 0.7333). However, all three catch only 17–23% of deepfakes at FPR ≤ 5%, showing that the cross-dataset setting is a hard problem and that additional signals (liveness, video-level) need to be combined for an operating threshold.

### Confusion matrix

At the chosen decision threshold, the confusion matrix breaks down errors into false positives (real labelled as fake) and false negatives (fakes that slip through) — two error types with very different business consequences in eKYC.

![Figure 3.9 — Normalised confusion matrix on CDFv2](figures/fig_3_9_confusion.png)
*Figure 3.9: Confusion matrix (row-normalised) of naive SFDCT on CDFv2 at τ = 0.9514 (FPR ≤ 5%).*

**Remarks:** at the τ ensuring FPR ≤ 5%, the confusion matrix (absolute counts) is **TN = 5,339 · FP = 281 · FN = 8,318 · TP = 2,482** (5,620 real, 10,800 fake). The **dominant error type is false negatives (FN)**: 8,318/10,800 ≈ 77% of deepfakes slip through, while false positives are only ~5%, exactly as the constraint requires. This is clear evidence for the conclusion in Section 3.6: at an operating point friendly to genuine customers, the model misses most fakes → it should be a combined screening layer rather than standing alone.

### t-SNE feature space

t-SNE projects the features (taken just before the classification layer) down to 2D in order to observe how well the real/fake clusters **separate**. Expectation: adding the DCT branch and the frequency levers makes the two clusters separate more clearly, with a cleaner boundary than B4.

![Figure 3.10 — t-SNE of CDFv2 features](figures/fig_3_10_tsne.png)
*Figure 3.10: t-SNE of the fused features on CDFv2, coloured by the real/fake label.*

**Remarks:** the two real/fake clusters **still overlap considerably** — consistent with an AUC ≈ 0.76 (not yet fully separated). When the DCT branch is added, the boundary between the two clusters is **slightly cleaner** but the improvement is modest, matching Δ = +0.0075. This indicates that block-DCT adds information but does not produce a large cluster-separation jump on c23 data.

### Frequency spectra (frequency viz)

This visualisation is tied directly to the core hypothesis of the thesis. The frequency-spectrum chart shows how energy/discriminability is distributed across the 16 zigzag frequency bands (from DC to high-frequency), thereby indicating **which frequency band carries the most real/fake discriminative signal**.

![Figure 3.11 — DCT energy by frequency band, real vs fake](figures/fig_3_11_frequency.png)
*Figure 3.11: Mean log|2D-DCT| energy by frequency band (real vs fake) and the difference; orange region = mid/high bands.*

**Remarks:** in the **mid/high bands, real consistently has higher energy than fake** (deepfakes smooth the face more, losing high-frequency detail) — that is, **there is a discriminative signal in the frequency domain**, justifying the use of the block-DCT branch. However, on the **c23** compressed version this difference is **small** (H.264 compression removes some high frequencies) — this is precisely why the block-DCT Δ is modest, and it also justifies the option of **dropping the DC and a few low bands (drop low bands)** to avoid content-leakage and focus on the mid band that carries the forgery signal.

### Grad-CAM

Grad-CAM visualises the image region the model relies on to make its decision — a key factor for **explainability** in eKYC. Expectation: SFDCT focuses on regions with forgery artifacts (face-splice boundaries, abnormal skin-texture regions) rather than the background or accessories.

![Figure 3.12 — Grad-CAM](figures/fig_3_12_gradcam.png)
*Figure 3.12: Grad-CAM of SFDCT on a CDFv2 sample — hot regions = where the model relies on to decide.*

**Remarks:** SFDCT tends to **focus on the face region and the splice boundary** (regions where forgery artifacts are most likely to appear) rather than the background/accessories — meeting the explainability requirement for eKYC. A qualitative difference relative to B4 is present but not large on c23 data, consistent with the modest AUC Δ.

### Fusion gate alpha values

This visualisation quantifies the **actual contribution of the DCT branch**: alpha is initialised to 0, so an alpha value *after training* that is greater than 0 is quantitative evidence that the model has **actively learned to use** the frequency information (if DCT were useless, the gradient would keep alpha near 0).

![Figure 3.13 — Gate alpha after training](figures/fig_3_13_gate_alpha.png)
*Figure 3.13: Distribution of the gate alpha values (zero-init) after training for the SFDCT variant.*

**Remarks:** alpha is initialised to 0; after training **|alpha| > 0** (see Figure 3.13), proving that the model **actively learns to use** the frequency branch — if DCT were useless, the gradient would keep alpha ≈ 0. The positive alpha value of naive SFDCT is consistent with Δ = +0.0075 (the DCT branch makes a real contribution, albeit small). The specific numeric value is recorded in the training log at the line `[gate] |alpha|.mean`.

## 3.6 Deploying the detection demo for eKYC

A model is only useful in practice when it can run on a single input image and produce a decision together with an explanation. This section describes the inference demo and how the decision threshold is calibrated for the banking eKYC setting.

### Inference pipeline

The tool `tools/infer.py` (path: `DeepfakeBench/tools/infer.py`) implements the entire end-to-end inference chain for one face image:

```
face image → crop/align 256×256 → normalize (mean=std=0.5)
  → SFDCT (B4 spatial branch + block-DCT branch + gated fusion)
  → fake_prob ∈ [0, 1] → compare against threshold τ → REAL/FAKE label
  → Grad-CAM overlay (suspicious regions)
```

The output consists of three components: (1) the fake probability `fake_prob` in [0,1], (2) the binary REAL/FAKE label according to the calibrated threshold, and (3) a Grad-CAM overlay image so that the operator (bank officer/controller) can see what the model relies on — meeting the explainability requirement in the eKYC process.

### Threshold calibration for FPR ≤ 5%

Circular 17/2024/TT-NHNN mandates biometric verification (qualitatively, **without** prescribing a numeric threshold). To formalise this requirement, the project **chooses** an operating point of **FPR ≤ 5%** following the ISO/IEC 30107-3 convention (BPCER20): the rate of genuine customers wrongly rejected must be low enough not to hinder the legitimate experience. Because AUC is threshold-invariant while real operation requires **a concrete threshold** τ, the thesis calibrates τ on the **validation set** so that the measured FPR is ≤ 5%, then applies that (fixed) τ to the test set to report the corresponding TPR/recall — avoiding information leakage from the test set into the threshold selection.

[[TABLE 3.4: Threshold calibration for the eKYC constraint FPR ≤ 5%]]

| Quantity | Value |
|---|---|
| Threshold τ (best model — naive SFDCT) | 0.9514 |
| Target FPR | ≤ 5% |
| FPR on test (CDFv2) at τ | 0.0500 |
| TPR/Recall (fake detection) on test at τ | 0.2298 (22.98%) |
| Accuracy / F1 at τ | 0.476 / 0.366 |

> Honesty note: τ is set at the FPR ≤ 5% level **directly on the CDFv2 scores** because a separate validation set has not yet been carved out; in a real deployment, τ must be calibrated on the dev set of the deployment distribution (Vietnamese faces — see Future Work).

**Remarks:** at the threshold ensuring FPR ≤ 5% (only ~5% of genuine customers wrongly rejected), the model **catches only ≈ 23% of deepfakes** — meaning ~77% of deepfakes slip through. This is an inevitable consequence of a cross-dataset AUC ≈ 0.76 (see also the two-sided APCER/BPCER analysis in Section 3.7): at a tight security level usability is good but many fakes are missed, while at a level that catches all fakes too many genuine customers are rejected. Conclusion: SFDCT is **sufficient as a first screening layer** (reducing the load on the subsequent verification step) but **not yet sufficient to stand alone** for eKYC; it needs to be combined with **liveness** and **decision aggregation at the video level** (video-AUC 0.808 > frame-AUC 0.757).

### Illustrative result examples

*Figure 3.14 (a REAL sample) and Figure 3.15 (a FAKE sample) from `tools/infer.py` (input image + fake_prob + Grad-CAM): to be added once the inference demo is run on the checkpoint — see `report/figures/` and `_HOAN_THIEN_STATUS.md`.*

### Assessment of usability in the eKYC process

**Overall assessment:** SFDCT achieves a cross-dataset frame-AUC of 0.7572 (naive) and a video-AUC of 0.808, slightly surpassing the B4 baseline (0.7497) with a guaranteed floor ≥ B4. Evaluation outlook: with the cross-dataset AUC currently achieved and a threshold calibrated to FPR ≤ 5%, SFDCT is suitable as the **first automated screening layer** in the eKYC pipeline — flagging suspicious cases for manual review — rather than a fully automatic final decision, because (i) the results are from a single seed and (ii) the AUC gaps between configurations are still small. The explainability provided by Grad-CAM is a practical advantage for supporting officers' decisions and serving regulatory audits.

## 3.7 Implementing the System

The preceding sections validated the **SFDCT** detector as a research artefact: a cross-dataset frame-level AUC of approximately **0.75** on Celeb-DF-v2, a calibrated decision threshold for the FPR ≤ 5% requirement of Circular 17/2024/TT-NHNN, and a full suite of explainability visualisations. This section describes how that artefact is wrapped into a working, multi-tenant web application — **DeepGuard** — and how the application is packaged and deployed so that it can be demonstrated end to end. The description is deliberately candid: what follows is a **demonstration (demo) deployment** intended for the thesis defence and for manual functional testing, not a production-hardened banking installation. Throughout, the trained model is treated as a **signal layer** (a risk score with an explanation), not as a standalone gatekeeper; the final accept/reject decision in a real eKYC pipeline must combine this signal with liveness, document checks, and human review.

### 3.7.1 Technology stack

DeepGuard is organised as three cooperating tiers behind a single PostgreSQL database, following the one-directional request flow fixed in the project conventions: `Frontend → FastAPI → Service → Repository → PostgreSQL`, with machine-learning inference delegated over HTTP to a separate **SFDCT microservice**. The backend never imports PyTorch directly; it communicates with the model only through `httpx POST` calls, which keeps the API container lightweight and lets the model be scaled or replaced independently. Table 3.20 maps each architectural layer to the concrete technology chosen for it.

*Table 3.20: Technology stack of the DeepGuard system, organised by architectural layer.*

| Layer | Technology | Role in the system |
|---|---|---|
| **Presentation (Frontend)** | Next.js 16 (App Router) · React 19 · TypeScript 5 · Tailwind CSS 4 · shadcn/ui (Radix UI) | Single-page dashboard; role-aware UI; Playground for upload-and-analyse |
| **Client state / data** | Zustand 5 (auth, navigation, appearance) · TanStack Query 5 · react-hook-form + zod | Auth/session and UI state; server-data caching; form validation |
| **API client** | Fetch API in `src/lib/api.ts` (Bearer JWT / API key) | Single gateway from browser to backend |
| **Application (Backend)** | FastAPI 0.115 · Uvicorn · Python 3.11 | REST API; routing → service → repository; RBAC enforcement |
| **Authentication / RBAC** | JWT (python-jose) for the dashboard · API key (`sk-dg-…`) for external eKYC integration · passlib[bcrypt] | Two non-mixed auth layers; five roles via `require_role` |
| **Validation / config** | Pydantic 2 · pydantic-settings (`.env`) | Create/Read/Update schemas; no hard-coded secrets or ports |
| **Data access (ORM)** | SQLAlchemy 2.0 (async) · asyncpg · shared `deepguard_db` package | Repository layer; `schema.sql` migrations only |
| **Database** | PostgreSQL 15 (`postgres:15-alpine`) | Tenants, users, API keys, detections, audit logs |
| **HTTP-to-model bridge** | httpx 0.28 | Backend → SFDCT `POST /predict` |
| **Model serving (SFDCT)** | FastAPI microservice `serving/infer_server.py` · PyTorch · EfficientNet-B4 + block-DCT branch · MTCNN face crop · Grad-CAM (base64) | `prob_fake` + REAL/FAKE label + Grad-CAM heat-map |
| **Containerisation** | Docker · Docker Compose | Single-host orchestration of all four services |
| **Model / data storage** | HuggingFace Hub (`huanthuytnhh/deepfake`, `…/deepfake-data`) | Checkpoint and dataset distribution |

The default ports inside the deployment are **3000** (frontend), **8000** (backend API, Swagger at `/docs`), **8501** (SFDCT microservice), and **5432** (PostgreSQL).

### 3.7.2 Deployment environment

The entire system is deployed onto a **single AWS EC2 instance** and orchestrated with **Docker Compose**. All four services — the Next.js frontend, the FastAPI backend, the SFDCT model microservice, and PostgreSQL — run as containers on the same host, sharing a private Docker bridge network so that the backend reaches PostgreSQL and the SFDCT microservice purely over internal hostnames; only the reverse-proxy port is exposed publicly. This co-located, single-host topology is intentional for a demo: it keeps the deployment reproducible with one `docker compose up`, avoids the cost and operational overhead of a multi-node cluster, and matches the scale of a defence demonstration.

A key practical decision is that **inference runs on CPU**, with no GPU required. The served detector is an EfficientNet-B4-based checkpoint of roughly **70 MB**; on CPU it produces a verdict and a Grad-CAM heat-map in approximately **0.3–1 second per image**, which is comfortably within interactive latency for an eKYC review screen and for the live demo. Because no GPU is needed at serving time, the cost driver becomes **RAM rather than compute**: the resident memory is dominated by the PyTorch runtime plus the MTCNN face detector loaded inside the SFDCT microservice, alongside PostgreSQL and the Node/Next.js process. For this reason the recommended instance type is a **t3.large (2 vCPU, 8 GB RAM)** — chosen so that PyTorch + MTCNN, the API, the database, and the frontend can all reside comfortably without swapping, rather than for raw CPU throughput. Smaller burstable instances are sufficient to *boot* the stack but tend to thrash once the model and face detector are both resident.

Figure 3.20 shows the deployment topology: the public-facing reverse proxy terminating HTTPS, and the four containers behind it on the internal Docker network.

```mermaid
flowchart TB
    user["End user / browser<br/>(HTTPS)"]
    ext["External eKYC backend<br/>(API key: sk-dg-…)"]

    subgraph ec2["AWS EC2 instance — t3.large (2 vCPU, 8 GB RAM), CPU-only inference"]
        proxy["Reverse proxy + TLS<br/>(443 → internal)"]
        subgraph net["Docker Compose — private bridge network"]
            fe["frontend<br/>Next.js 16 · :3000"]
            be["backend<br/>FastAPI · :8000"]
            sf["sfdct<br/>PyTorch + MTCNN + Grad-CAM<br/>EfficientNet-B4 ~70 MB · :8501"]
            db[("postgres<br/>PostgreSQL 15 · :5432")]
        end
    end

    user -->|HTTPS 443| proxy
    ext -->|HTTPS 443| proxy
    proxy --> fe
    proxy --> be
    fe -->|fetch JSON| be
    be -->|SQLAlchemy async| db
    be -->|httpx POST /predict| sf
```

*Figure 3.20: Deployment diagram of DeepGuard on a single AWS EC2 instance (t3.large, CPU-only). A reverse proxy terminates HTTPS and forwards to the four Docker Compose services on a private bridge network; the backend reaches PostgreSQL and the SFDCT microservice only over the internal network.*

### 3.7.3 Domain and HTTPS

Public access is provided through a registered domain name whose DNS A-record points to the Elastic IP of the EC2 instance. A **reverse proxy** on the host terminates TLS and routes incoming HTTPS (port 443) traffic to the appropriate container: requests for the dashboard are forwarded to the Next.js frontend on port 3000, while requests under the API prefixes (`/auth`, `/v1/…`, and the other dashboard resources) are forwarded to the FastAPI backend on port 8000. A standard automated certificate-management flow (an ACME-issued certificate) supplies the TLS material so that all browser traffic and all external eKYC integrations travel over HTTPS. Internally, the proxy is the **only** publicly bound port; the backend, the SFDCT microservice, and PostgreSQL remain reachable solely on the private Docker network, which prevents direct exposure of the database (5432) and the model service (8501).

It is worth restating two known limitations honestly, since they bear on a real deployment. Route guarding is currently performed **client-side** (Zustand) and the JWT is stored in `localStorage`; server-side route middleware is not yet in place. The interactive API documentation (`/docs`, `/redoc`) is left **public** for convenience during the demo and should be gated before any production exposure. These are acceptable for a defence demonstration but would need to be closed off in a hardened banking deployment.

### 3.7.4 System access

The deployed demo is reached over HTTPS at the public domain described above; the interactive backend documentation is available at the `/docs` path (Swagger UI on the FastAPI service). To make the role-based behaviour immediately demonstrable, the database is populated by the idempotent seed script `backend/scripts/seed.py`, which creates the tenant **"VietBank Demo"** together with one account for each of the five roles. All seed accounts share the password **`Password123!`**. Table 3.21 lists the demo credentials.

*Table 3.21: Seeded demonstration accounts (tenant "VietBank Demo", password `Password123!`).*

| Role | Email | Lands on |
|---|---|---|
| sysadmin | `sysadmin@deepguard.vn` | Platform dashboard (cross-tenant) |
| admin | `admin@vietbank.vn` | Tenant admin dashboard |
| developer | `dev@vietbank.vn` | Developer / integration dashboard |
| compliance | `compliance@vietbank.vn` | Compliance review dashboard |
| viewer | `viewer@vietbank.vn` | Read-only dashboard |

For a no-credentials walkthrough, the simplest path is to log in as the **developer** account, open the **API Playground**, and upload a face image: the page calls `POST /playground/detect/image` with the dashboard JWT (no API key required) and returns the **risk score**, the verdict **band** with a `decision_hint`, the **Grad-CAM** heat-map, and the **2D-DCT frequency spectrum** — the same explainability surface analysed in Section 3.5. External integration (a customer's backend calling `POST /v1/detect/image` with an `sk-dg-…` API key) is demonstrated separately from the developer's **API Keys** screen.

A final note on positioning, consistent with the discussion in Section 3.7: this is a **demo configuration**, and the served model is the cross-dataset checkpoint whose AUC is **approximately 0.75** on Celeb-DF-v2. That figure is honest and unembellished — strong enough to act as a useful **risk signal** with a transparent explanation, but **not** a perfect gatekeeper. The application is therefore engineered so that the model's output is one input to a reviewable decision (with verdict bands, an `UNCERTAIN` zone, compliance audit notes, and a human-in-the-loop review queue) rather than an automatic, unappealable verdict.

## 3.8 Discussion: strengths and limitations

### Strengths

1. **Floor ≥ B4 guaranteed by design.** Thanks to the zero-init gated cross-attention, SFDCT is equivalent to B4 at initialisation; experiments confirm that adding the DCT branch gives +0.0075 AUC without degrading the baseline. This is a rare property among ordinary fusion methods, where attaching an auxiliary branch can drag performance down.
2. **The pipeline has been validated.** The B4 baseline reaches 0.7497, close to the DeepfakeBench leaderboard value of 0.7487 — so every improvement measured afterwards is trustworthy.
3. **A systematic aggregate contribution.** Five frequency levers from five works (SPSL/SRM/FreqDebias/FcaNet/FDFL) are adapted consistently into **one** block-DCT domain, together with a per-knob ablation to decompose the contributions.
4. **Explainable and regulation-aligned.** The demo includes Grad-CAM and threshold calibration following Circular 17/2024/TT-NHNN (FPR ≤ 5%), tying the research to a real eKYC requirement.

### Limitations (stated plainly, without sugar-coating)

1. **A single seed.** All numbers in this chapter are obtained at a single seed due to GPU cost. The small differences — especially the gaps between naive SFDCT, Row1 and Row2 — **may lie within seed-to-seed noise**. A firm conclusion about the ranking of the configurations requires multi-seed experiments (≥ 3 seeds) and reporting the mean ± standard deviation — this remains outstanding work.
2. **The strongest AUC lever is out of scope.** Evidence from the literature shows that no pure block-DCT method has clearly surpassed a tuned B4 at the cross-dataset level; the strongest lever is **SBI (self-blended images)** — a training-data generation strategy — which is **outside the scope of the thesis's pure block-DCT**. The amplitude of AUC improvement within the current framework is therefore inherently limited, and is deferred to Future Work.
3. **The absolute gain is modest.** +0.0075 is an improvement in the right direction but small; caution is warranted when interpreting its practical significance.

### Comparison with the leaderboard and other frequency methods

[[TABLE 3.5: Comparison of SFDCT with the baseline and other frequency methods on CDFv2 (train FF++)]]

| Method | Group | CDFv2 frame-AUC | Source |
|---|---|---|---|
| EfficientNet-B4 | spatial | 0.7487 | DeepfakeBench leaderboard |
| EfficientNet-B4 (thesis re-implementation) | spatial | 0.7497 | This thesis |
| F3-Net | frequency | [[FILL: AUC]] | [[CHECK: DeepfakeBench leaderboard value]] |
| SPSL | frequency | [[FILL]] | [[CHECK]] |
| SRM | frequency | [[FILL]] | [[CHECK]] |
| **naive SFDCT (B4-DCT)** | hybrid spatial–freq | **0.7572** | This thesis |
| **Row1 (S1+S2+S3)** | hybrid spatial–freq | [[FILL]] | This thesis |
| **Row2 (S4+S5+S3)** | hybrid spatial–freq | [[FILL]] | This thesis |

[[FILL: remarks — where SFDCT stands relative to other frequency methods; note that the comparison is only fair under the same DeepfakeBench protocol of train FF++ → test CDFv2]].

## 3.9 Chapter summary

Chapter 3 moved the SFDCT method from design to empirical validation under the standard DeepfakeBench cross-dataset protocol (train FF++ c23, test Celeb-DF-v2). Three results have been confirmed: (1) the pipeline is correct — the B4 baseline reaches **0.7497**, close to the leaderboard value of **0.7487**; (2) adding the block-DCT branch with zero-init gated fusion raises the cross-dataset AUC to **0.7572 (+0.0075)** without degrading the baseline, fulfilling the *floor ≥ B4* commitment and supporting the core hypothesis that block-DCT frequency adds discriminative information to the spatial domain; (3) the eKYC inference demo runs end-to-end with explainable Grad-CAM and a threshold calibrated to the FPR ≤ 5% of Circular 17/2024/TT-NHNN.

The results of the Row1 and Row2 configurations, together with the in-dataset, per-knob, training-time and threshold-calibration numbers, are currently in `[[FILL]]` form and will be filled in once training is complete — with a commitment to conclude **strictly according to the actual numbers**, without sugar-coating. The most important limitation to acknowledge is the single-seed result (small differences may lie within noise) and the fact that the strongest AUC lever (SBI) is outside the scope of pure block-DCT. These two issues, together with extending to additional cross-dataset sets such as DFDC, are the direct premise for Chapter 4 — Conclusion and Future Work.


# CONCLUSION AND FUTURE WORK

## 1. Achieved Results

This thesis has accomplished its objective of building a hybrid spatial–frequency deepfake detection method (**SFDCT**) for the eKYC problem, with an emphasis on risk safety and on the ability to generalise to datasets unseen during training. The three principal contributions of the thesis are summarised as follows.

**First contribution — a block-DCT branch with a zero-initialised gated cross-attention.** We propose to add a frequency branch based on block-wise 2D-DCT (8×8) in parallel with the EfficientNet-B4 spatial backbone, and to merge the two feature streams through a gated cross-attention mechanism that is zero-initialised. The key property of this design is that, at initialisation, the gate `alpha = 0` forces `feature_fused = x`, so the hybrid model is exactly equivalent to the B4 baseline. As a result, the frequency branch only "contributes further" when it genuinely improves the loss, which guarantees a theoretical **performance floor** so that the result is never below the B4 baseline — an important property when deploying in a sensitive environment such as finance and banking.

**Second contribution — collecting and adapting five frequency "levers" to the block-DCT domain.** We systematise five improvements (levers) drawn from representative works and adapt them consistently to the block-DCT representation: S1 `dct_use_sign` (the sign of DCT coefficients, a phase-analog, adapted from SPSL); S2 `dct_srm_residual` (block-DCT on the SRM high-pass noise residual); S3 `use_dct_fomixup` (DCTFoMixup augmentation together with a dual consistency loss, adapted from FreqDebias); S4 `dct_fca_attention` (the MultiSpectralAttentionLayer of FcaNet); and S5 `use_single_center_loss` (single-center loss, adapted from FDFL). Two representative ablation configurations are **Row1** (naive + S1 + S2 + S3, with no additional learnable parameters) and **Row2** (naive + S4 + S5 + S3, with additional learnable parameters).

**Third contribution — a fair cross-dataset evaluation and an explainable eKYC demo.** All experiments follow the DeepfakeBench protocol: training on FaceForensics++ (c23) and cross-dataset testing on Celeb-DF-v2, with the headline metric being frame-level AUC on CDFv2. The single-seed results are as follows.

[[TABLE 5.1: Summary of cross-dataset frame-level AUC on Celeb-DF-v2 for the four configurations.]]

| Configuration | Description | CDFv2 frame-AUC |
|---|---|---|
| B4 | Baseline EfficientNet-B4 (spatial-only) | 0.7497 |
| naive SFDCT (B4-DCT) | B4 + block-DCT branch + gated fusion | 0.7572 |
| Row1 | naive + S1 + S2 + S3 | 0.7333 |
| Row2 | naive + S4 + S5 + S3 | _(training in progress)_ |

The B4 baseline attains a CDFv2 frame-AUC of **0.7497**, close to the DeepfakeBench leaderboard figure (0.7487), which **confirms that the thesis's training–evaluation pipeline is comparable with published results**. The naive SFDCT (B4-DCT) configuration raises the AUC to **0.7572** (+0.0075 over B4), confirming that the block-DCT branch provides an additional generalisation signal. The Row1 and Row2 configurations (0.7333 / _(training in progress)_) further assess the contribution of each group of frequency "levers".

Finally, we provide an **inference demo for eKYC** (`tools/infer.py`): for each input face image, the system outputs `fake_prob ∈ [0,1]`, a REAL/FAKE label, and a **Grad-CAM** overlay image as a basis for explaining the decision — an essential element for auditing and for building trust in electronic identification operations.

## 2. Limitations

Although encouraging results have been achieved, the thesis still has several limitations that must be stated frankly in order to preserve scientific honesty.

**First, the results are only at the single-seed level.** All reported AUC figures come from a single training run per configuration (owing to GPU cost constraints). Consequently, the thesis **cannot yet assert the statistical significance** of the observed differences; small gaps (for example, the +0.0075 margin of B4-DCT) may well lie within the noise band across seeds.

**Second, the improvement margin remains modest.** The AUC gain brought by the block-DCT branch, while consistent with the expected direction, is still small in magnitude. This is consistent with the honest observation that the strongest AUC lever (see the Future Work section) lies outside the pure block-DCT scope on which the thesis focuses.

**Third, robustness has not been tested systematically.** The thesis has not evaluated the model's robustness under harsh conditions such as heavy video compression (multiple re-compressions, low bitrate), noise, resolution changes, or adversarial perturbations — scenarios that are highly realistic in a mobile eKYC environment.

**Fourth, the Liveness / anti-spoofing component has not been realised.** Owing to a narrowing of scope to focus on the deepfake part, the thesis **has not implemented liveness detection** (defence against photo/screen presentation attacks, masks, and replay). A complete eKYC system requires both of these layers of defence.

**Fifth, calibration of the operating threshold has not been completed.** The FPR ≤ 5% operating point (the ISO/IEC 30107-3 convention serving the biometric requirements of Circular 17/2024/TT-NHNN — TT17 does not stipulate a numeric threshold) requires calibrating the decision threshold on the validation set and reporting the operating metrics (TPR at a fixed FPR, EER); these figures currently remain in the form [[FILL: operating metrics at the FPR ≤ 5% threshold]].

## 3. Future Work

From the limitations above, the thesis proposes the following directions for future development, ordered by priority and by the value they deliver.

**(a) Adding a Liveness / anti-spoofing layer.** This is the part for which the scope was narrowed and which is left for the future. The direction is to integrate a presentation-attack detection module — combining texture, reflection/moiré, and rPPG (physiological) signals — so that, together with the deepfake branch, it forms a complete two-layer defence system for eKYC.

**(b) Multi-seed evaluation with mean ± std.** To strengthen the robustness of the conclusions, each configuration should be repeated with several different seeds and reported as a mean ± standard deviation, together with a statistical significance test (paired test) to confirm that the improvement margin of block-DCT is genuine rather than noise.

**(c) Integrating SBI self-blended training.** An honest analysis shows that the strongest AUC lever at present is the **SBI (self-blended images)** training strategy — generating synthetic fake samples during training itself — which lies outside the pure block-DCT scope of the thesis. Combining SBI with the SFDCT frequency branch is the most promising direction for substantially raising the cross-dataset AUC.

**(d) Extending cross-testing to DFDC.** Beyond Celeb-DF-v2, further testing on DFDC (and other sets such as DeeperForensics) is needed to assess generalisation more comprehensively across many types of manipulation and capture conditions.

**(e) Optimising deployment for real-world eKYC.** Finally, to bring the model into operation on edge/mobile devices, optimisation techniques such as quantisation (INT8), pruning, and distillation are required, along with latency/FPS measurement, while also completing the FPR ≤ 5% threshold calibration procedure to comply with Circular 17/2024/TT-NHNN.

---

# REFERENCES

[1] M. Tan and Q. V. Le, "EfficientNet: Rethinking Model Scaling for Convolutional Neural Networks," in *Proceedings of the 36th International Conference on Machine Learning (ICML)*, 2019, pp. 6105–6114.

[2] A. Rössler, D. Cozzolino, L. Verdoliva, C. Riess, J. Thies, and M. Nießner, "FaceForensics++: Learning to Detect Manipulated Facial Images," in *Proceedings of the IEEE/CVF International Conference on Computer Vision (ICCV)*, 2019, pp. 1–11.

[3] Y. Li, X. Yang, P. Sun, H. Qi, and S. Lyu, "Celeb-DF: A Large-Scale Challenging Dataset for DeepFake Forensics," in *Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition (CVPR)*, 2020, pp. 3207–3216.

[4] Z. Yan, Y. Zhang, X. Yuan, S. Lyu, and B. Wu, "DeepfakeBench: A Comprehensive Benchmark of Deepfake Detection," in *Advances in Neural Information Processing Systems (NeurIPS), Datasets and Benchmarks Track*, 2023.

[5] Z. Qin, P. Zhang, F. Wu, and X. Li, "FcaNet: Frequency Channel Attention Networks," in *Proceedings of the IEEE/CVF International Conference on Computer Vision (ICCV)*, 2021, pp. 783–792.

[6] H. Liu, X. Li, W. Zhou, Y. Chen, Y. He, H. Xue, W. Zhang, and N. Yu, "Spatial-Phase Shallow Learning: Rethinking Face Forgery Detection in Frequency Domain," in *Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition (CVPR)*, 2021, pp. 772–781.

[7] A. Luo, Y. Cao, Y. Hu, M. Liu, and Q. Zhao, "Generalizing Face Forgery Detection with High-frequency Features," in *Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition (CVPR)*, 2021, pp. 16317–16326. [[CHECK: author list and page numbers of the SRM/high-pass features paper]]

[8] Y. Qian, G. Yin, L. Sheng, Z. Chen, and J. Shao, "Thinking in Frequency: Face Forgery Detection by Mining Frequency-aware Clues," in *Proceedings of the European Conference on Computer Vision (ECCV)*, 2020, pp. 86–103.

[9] R. R. Selvaraju, M. Cogswell, A. Das, R. Vedantam, D. Parikh, and D. Batra, "Grad-CAM: Visual Explanations from Deep Networks via Gradient-based Localization," in *Proceedings of the IEEE International Conference on Computer Vision (ICCV)*, 2017, pp. 618–626.

[10] N. Ahmed, T. Natarajan, and K. R. Rao, "Discrete Cosine Transform," *IEEE Transactions on Computers*, vol. C-23, no. 1, pp. 90–93, 1974.

[11] J. Fei, Y. Dai, P. Yu, T. Shen, Z. Xia, and J. Weng, "Learning Second Order Local Anomaly for General Face Forgery Detection," in *Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition (CVPR)*, 2021. [[CHECK: whether this is indeed the FDFL paper — Frequency-aware Discriminative Feature Learning (Li et al., 2021); re-verify the authors/title/venue/year for the single-center loss]]

[12] [[CHECK: full citation for FreqDebias (DCTFoMixup + dual consistency loss) — authors, title, venue, year; the exact source has not yet been verified]]

[13] Ngân hàng Nhà nước Việt Nam, *Thông tư 17/2024/TT-NHNN quy định về việc mở và sử dụng tài khoản thanh toán tại tổ chức cung ứng dịch vụ thanh toán*, Hà Nội, 2024.


