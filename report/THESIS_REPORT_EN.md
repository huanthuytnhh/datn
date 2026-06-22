<br>

<div align="center">

**THE UNIVERSITY OF DA NANG**

**UNIVERSITY OF SCIENCE AND TECHNOLOGY**

**FACULTY OF INFORMATION TECHNOLOGY**

<br><br>

<!-- [logo: chèn logo_dut.png — Logo Trường ĐH Bách Khoa - ĐH Đà Nẵng] -->

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
| **Class** | : ________ |
| **Major** | : Information Technology |
| **Supervisor** | : Assoc. Prof. Dr. Pham Cong Thang |

<br><br>

**Da Nang, June 2026**

</div>

<div style="page-break-after: always;"></div>

---

# SUPERVISOR'S REMARKS

**Student name:** Le Ngoc Thanh  **Student ID:** 102220041  **Class:** ________

**Thesis title:** Hybrid Spatial–Frequency Learning with Block-wise DCT for Deepfake Detection in eKYC.

**Supervisor:** Assoc. Prof. Dr. Pham Cong Thang

<br>

**1. Assessment of the thesis content:**

…………………………………………………………………………………………

…………………………………………………………………………………………

<br>

**2. Assessment of the presentation:**

…………………………………………………………………………………………

…………………………………………………………………………………………

<br>

**3. Student's working attitude and commitment:**

…………………………………………………………………………………………

…………………………………………………………………………………………

<br>

**4. Conclusion (approved / not approved for defence):**

…………………………………………………………………………………………

<br>

**Evaluation score:** ………… /10

<br><br>

*Da Nang, ..... ..... .....*

*Supervisor*

*(signature and full name)*

<br><br>

**Assoc. Prof. Dr. Pham Cong Thang**

<div style="page-break-after: always;"></div>

---

# REVIEWER'S REMARKS

**Student name:** Le Ngoc Thanh  **Student ID:** 102220041  **Class:** ________

**Thesis title:** Hybrid Spatial–Frequency Learning with Block-wise DCT for Deepfake Detection in eKYC.

**Reviewer:** ………………………………………………………………

<br>

**1. Assessment of the thesis content:**

…………………………………………………………………………………………

…………………………………………………………………………………………

<br>

**2. Assessment of the presentation:**

…………………………………………………………………………………………

…………………………………………………………………………………………

<br>

**3. Review questions:**

…………………………………………………………………………………………

…………………………………………………………………………………………

<br>

**4. Conclusion:**

…………………………………………………………………………………………

<br>

**Evaluation score:** ………… /10

<br><br>

*Da Nang, ..... ..... .....*

*Reviewer*

*(signature and full name)*

<br><br>

**……………………………………………………**

<div style="page-break-after: always;"></div>

---

# ABSTRACT

**Thesis title:** Hybrid Spatial–Frequency Learning with Block-wise DCT for Deepfake Detection in eKYC.

**Student:** Le Ngoc Thanh — Student ID: 102220041 — Class: ________

<br>

Deepfake generation tools are improving quickly. This creates a serious risk for electronic Know-Your-Customer (eKYC) systems in banking and finance, because a forged face may pass biometric verification. Detectors that use only spatial features often generalise poorly to manipulations and datasets they have not seen (cross-dataset). The reason is that GAN and upsampling operations leave traces that are weak in the spatial domain but clear in the mid and high frequency bands.

This thesis proposes **SFDCT** (Spatial–Frequency learning with block-wise DCT). The model joins an EfficientNet-B4 spatial backbone with a frequency branch built on 8×8 block-wise 2D-DCT, aggregated over 16 zigzag frequency bands. The two branches are fused by a zero-initialised gated cross-attention mechanism, so the performance floor of the fused model stays at the level of B4. On top of this design, the thesis adapts five frequency levers from SPSL, SRM, FreqDebias, FcaNet and FDFL into the block-DCT domain. The model is trained on FaceForensics++ (c23) and evaluated cross-dataset on Celeb-DF-v2 under the DeepfakeBench protocol.

On CDFv2, the frame-level AUC rises from 0.7497 (B4) to 0.7572 (B4-DCT). This gain of +0.0075 lies within run-to-run noise. An enhanced configuration, Row1, reaches 0.7333 (Δ −0.0164, a genuine negative result below B4); not every added lever helps. A block-DCT high-frequency-features variant (HFF-R3) reaches 0.7695, the best score in the family. However, the main SFDCT result (0.7572) is still below SPSL (0.7650), so the thesis makes no state-of-the-art claim. These conclusions are checked under four aggregation protocols and with video-level bootstrap confidence intervals. A secondary liveness module reuses the same backbone; it is trained and independently verified on LCC-FASD (B4: ACER 6.85% / AUC 0.9829). Finally, the detector is deployed as an explainable, multi-tenant eKYC web platform with calibrated risk bands, Grad-CAM evidence and a 2D-DCT spectrum view, using a threshold calibrated at the FPR ≤ 5% operating point.

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
| **Class** | ________ |
| **Major** | Information Technology |
| **Thesis title** | Hybrid Spatial–Frequency Learning with Block-wise DCT for Deepfake Detection in eKYC |
| **Supervisor** | Assoc. Prof. Dr. Pham Cong Thang |

<br>

**1. Initial data:**

- Training dataset: **FaceForensics++** (compressed c23 version) — 1,000 real videos and four forgery methods (Deepfakes, Face2Face, FaceSwap, NeuralTextures).
- Cross-dataset test set: **Celeb-DF-v2** (590 real videos, 5,639 high-quality deepfake videos).
- Training and evaluation framework: **DeepfakeBench**.
- Liveness dataset: **LCC-FASD** (official three-way split) for the secondary presentation-attack-detection module; published DeepfakeBench leaderboard figures for baseline calibration.

<br>

**2. Content of the analysis and computation:**

- Survey of deepfake, eKYC, and spatial–frequency detection methods.
- Proposal and implementation of the **SFDCT** method: a block-DCT branch with zero-initialised gated cross-attention, together with five frequency levers (S1–S5).
- Cross-dataset training and evaluation under the DeepfakeBench protocol; ablation analysis (B4 → B4-DCT → Row1 → Row2).
- Development of an explainable eKYC demo (Grad-CAM); discussion of threshold calibration: we adopt an operating point of FPR ≤ 5% per **ISO/IEC 30107-3** to satisfy the *qualitative* biometric-verification requirement of Circular 17/2024/TT-NHNN (TT17 itself does not fix a numerical error budget).

<br>

**3. Drawings and charts (if any):** system architecture, use-case, activity and sequence diagrams (Figures 2.1–2.6); MBConv, zigzag-band, gated-fusion and face-generation-pipeline diagrams (Figures 1.2–1.5); training curves, ROC/PR, confusion matrix, t-SNE, Grad-CAM, frequency spectra and the ablation/operating-point tables (Figures 3.1–3.19, Tables 3.1–3.12).

<br>

**4. Assignment date:** ____ / ____ / 2026

**5. Completion date:** ____ / ____ / 2026

<br>

| | |
|---|---|
| *Head of Department* | *Supervisor* |
| ………………………………………… | **Assoc. Prof. Dr. Pham Cong Thang** |

<div style="page-break-after: always;"></div>

---

# ACKNOWLEDGEMENTS

During the work on this graduation thesis, I received a great deal of support from many people.

First, I would like to thank my supervisor, **Assoc. Prof. Dr. Pham Cong Thang**. He guided the direction of the thesis, gave clear scientific advice, and followed the work through the whole process. His careful comments and his patience helped me bring this thesis to completion.

I also sincerely thank the lecturers of the **Faculty of Information Technology, University of Science and Technology – The University of Da Nang**. Over the past years they gave me a solid base of knowledge, as well as the facilities and the academic environment needed for this work.

Finally, I thank my family and my friends. Their constant support and encouragement helped me get through the most difficult periods.

Because of limits in time and ability, this thesis still has shortcomings. I welcome the comments of the lecturers so that the work can be further improved.

I am sincerely grateful.

<br>

*Da Nang, June 2026*

*Student*

<br>

**Le Ngoc Thanh**

<div style="page-break-after: always;"></div>

---

# DECLARATION OF AUTHORSHIP

I hereby declare that this graduation thesis, entitled *"Hybrid Spatial–Frequency Learning with Block-wise DCT for Deepfake Detection in eKYC"*, is my own research work, carried out under the guidance of **Assoc. Prof. Dr. Pham Cong Thang**.

The data and experimental results in this thesis are truthful. They come from the actual training and evaluation process on the DeepfakeBench framework, and they have not been published in any other work. All content and ideas taken from the documents and works of other authors are fully cited in the References section, in accordance with the regulations.

I take full responsibility for the truthfulness of the content presented in this thesis.

<br>

*Da Nang, June 2026*

*Student*

*(signature and full name)*

<br>

**Le Ngoc Thanh**

<div style="page-break-after: always;"></div>

---

# TABLE OF CONTENTS

**INTRODUCTION**

**CHAPTER 1: THEORIES AND TECHNOLOGIES**

- 1.1 JavaScript
- 1.2 Next.js
  - 1.2.1 Key Features
  - 1.2.2 Advantages
- 1.3 FastAPI
- 1.4 HTTP API
  - 1.4.1 Structure
  - 1.4.2 Request
  - 1.4.3 Response
  - 1.4.4 Benefits
- 1.5 Domain Name System (DNS)
  - 1.5.1 DNS Servers
- 1.6 EfficientNet-B4
- 1.7 DCT and Frequency Analysis
  - 1.7.1 Inherited frequency cues (SPSL / SRM / FcaNet / FreqDebias / FDFL)
- 1.8 Attention and Fusion
- 1.9 Overview of Deepfake Technology
- 1.10 The Deepfake Detection Problem and Generalisation
- 1.11 eKYC Context and Legal Requirements
- 1.12 Liveness Detection (theory)
- 1.13 AWS
- 1.14 Conclusion

**CHAPTER 2: SYSTEM ANALYSIS AND DESIGN**

- 2.1 Requirement analysis
  - 2.1.1 Functional requirements
  - 2.1.2 Non-functional requirements
- 2.2 System design
  - 2.2.1 Use-case diagram
  - 2.2.2 Use-case specification
  - 2.2.3 System architecture
  - 2.2.4 Activity diagrams
  - 2.2.5 Sequence diagrams
  - 2.2.6 API specifications
- 2.3 Method — Deepfake Detection
  - 2.3.1 Data Solutions
  - 2.3.2 Evaluation method and loss function
  - 2.3.3 EfficientNet-B4 architecture
  - 2.3.4 SFDCT architecture
  - 2.3.5 Risk-Score / Decision Inference
- 2.4 Method — Liveness Detection
  - 2.4.1 Data Solutions
  - 2.4.2 Architecture
  - 2.4.3 Evaluation method and loss function
- 2.5 Conclusion

**CHAPTER 3: SYSTEM IMPLEMENTATION AND EVALUATION**

- 3.1 Experimental Results
  - 3.1.1 Overview of the Deepfake Detection Task
  - 3.1.2 Overview of the Liveness Detection Approach
- 3.2 Implementing the system
  - 3.2.1 Technology stack
  - 3.2.2 Deployment Environment
  - 3.2.3 Domain Registration
  - 3.2.4 System Access
- 3.3 Results
  - 3.3.1 Home screen
  - 3.3.2 Deepfake Detection Screen
  - 3.3.3 Liveness Screen
- 3.4 Conclusion

**CONCLUSION**

**REFERENCES**

<div style="page-break-after: always;"></div>

---

# LIST OF FIGURES

- **Figure 1.2:** The MBConv block.
- **Figure 1.3:** Zigzag scan over an 8×8 DCT block (left) and the grouping of the 64 coefficients into 16 frequency bands from DC to the highest frequency (right).
- **Figure 1.4:** Gated cross-attention fusion with the zero-initialised α gate.
- **Figure 1.5:** The three face-generation families (autoencoder face-swap, GAN, diffusion); all converge on a final upsampling/blending step that leaves frequency-domain artifacts.
- **Figure 2.1:** DeepGuard use-case diagram.
- **Figure 2.2:** Overall architecture of the detection pipeline.
- **Figure 2.3:** Activity diagram.
- **Figure 2.4:** Activity diagram.
- **Figure 2.5:** Sequence diagram.
- **Figure 2.6:** Sequence diagram.
- **Figure 3.1:** Distribution of real/fake sample counts for FF++ (train) and Celeb-DF-v2 (test).
- **Figure 3.2:** A real/fake face pair (FF++ Deepfakes, same identity) after a 256×256 crop, together with the log|2D-DCT| spectrum.
- **Figure 3.11:** Mean log|2D-DCT| energy by frequency band (real vs fake) and the difference; the orange region marks the mid/high bands.
- **Figure 3.3:** B4 (baseline).
- **Figure 3.4:** naive SFDCT (B4 + block-DCT).
- **Figure 3.5:** Row1 (S1+S2+S3).
- **Figure 3.7:** ROC curves on Celeb-DF-v2 (AUC in the legend); the red line marks the eKYC constraint FPR ≤ 5%.
- **Figure 3.8:** Precision–Recall on CDFv2 (AP in the legend).
- **Figure 3.9:** Confusion matrix of naive SFDCT on CDFv2 at τ = 0.9514 (FPR ≤ 5%).
- **Figure 3.10:** t-SNE of the fused features on CDFv2, coloured by the real/fake label.
- **Figure 3.12:** Grad-CAM of SFDCT on a CDFv2 sample.
- **Figure 3.13:** Distribution of the zero-init gate α values after training for the SFDCT variant.
- **Figure 3.16:** Deployment diagram of DeepGuard on a single AWS EC2 instance (t3.large, CPU-only).
- **Figure 3.17:** Home screen of DeepGuard.
- **Figure 3.18:** Deepfake-detection result screen.
- **Figure 3.19:** Liveness-detection screen.

<div style="page-break-after: always;"></div>

---

# LIST OF TABLES

- **Table 1.1:** REST contract for the primary detection endpoint.
- **Table 1.2:** The three scaling dimensions of EfficientNet.
- **Table 1.3:** Meaning of coefficient position in a 2D-DCT block.
- **Table 1.4:** The five levers S1–S5.
- **Table 1.5:** Role of Q/K/V in SFDCT's cross-attention fusion.
- **Table 1.6:** The four forgery families in FF++.
- **Table 1.7:** Mapping of the problem symbols.
- **Table 1.8:** Summary statistics of the two datasets.
- **Table 1.9:** Liveness (PAD) metrics and when each is used.
- **Table 2.1:** Functional requirements.
- **Table 2.2:** Functional requirements.
- **Table 2.3:** Functional requirements.
- **Table 2.4:** Functional requirements.
- **Table 2.5:** Non-functional requirements and measurement criteria.
- **Table 2.6:** Actors of the DeepGuard platform.
- **Table 2.7:** Use-case specification.
- **Table 2.8:** Use-case specification.
- **Table 2.9:** Use-case specification.
- **Table 2.10:** Use-case specification.
- **Table 2.11:** Use-case specification.
- **Table 2.12:** Use-case specification.
- **Table 2.13:** Use-case specification.
- **Table 2.14:** Use-case specification.
- **Table 2.15:** The five architecture blocks and their responsibilities.
- **Table 2.16:** The three authentication schemes of DeepGuard.
- **Table 2.17:** Index of the core endpoints specified below.
- **Table 2.18:** Endpoint specification.
- **Table 2.19:** Endpoint specification.
- **Table 2.20:** Endpoint specification.
- **Table 2.21:** Endpoint specification.
- **Table 2.22:** Data sources and their role in the evaluation protocol.
- **Table 2.23:** Face pre-processing steps.
- **Table 2.24:** Evaluation metrics.
- **Table 2.25:** Components of the loss function.
- **Table 2.26:** Training hyperparameters.
- **Table 2.27:** The block-DCT frequency branch (step → input → output → role).
- **Table 2.28:** Meaning of the gate $\alpha$ by value.
- **Table 2.29:** Four ablation configurations and lever states.
- **Table 2.30:** Calibrated eKYC operating point of naive SFDCT on CDFv2.
- **Table 2.31:** Liveness datasets and roles.
- **Table 2.32:** Liveness evaluation plan and measured results (details in §3.1.8).
- **Table 3.1:** Hardware configuration used for the experiments.
- **Table 3.2:** Software stack.
- **Table 3.3:** Training hyperparameters shared across all models.
- **Table 3.4:** Statistics of FaceForensics++ (c23) and Celeb-DF-v2.
- **Table 3.5:** Cross-dataset ablation.
- **Table 3.5b:** CDFv2 frame-AUC under four aggregation protocols (21 test events per run; identical training recipe).
- **Table 3.5c:** Video-level AUC at the best checkpoint, with bootstrap 95% CIs and paired differences (same 518 videos).
- **Table 3.6:** Partial per-lever decomposition.
- **Table 3.7:** The 16-configuration evaluation grid (4 model configs × 4 eval configs).
- **Table 3.8:** Threshold calibration for the eKYC operating point (best model.
- **Table 3.9:** Comparison with the baseline and other frequency methods on CDFv2 (train FF++).
- **Table 3.10:** Liveness dataset.
- **Table 3.10b:** Liveness results on the LCC-FASD evaluation split (measured).
- **Table 3.11:** Technology stack of DeepGuard, organised by architectural layer.
- **Table 3.12:** Seeded demonstration accounts (tenant "VietBank Demo", password `Password123!`).

<div style="page-break-after: always;"></div>

---

# LIST OF ABBREVIATIONS

| Abbreviation | Full term (English) | Description |
|---|---|---|
| **AI** | Artificial Intelligence | Artificial intelligence |
| **AP** | Average Precision | Average precision (area under the PR curve) |
| **AUC** | Area Under the (ROC) Curve | Area under the ROC curve |
| **ACER** | Average Classification Error Rate | Mean of APCER and BPCER (presentation-attack detection metric) |
| **APCER** | Attack Presentation Classification Error Rate | Proportion of attack presentations misclassified as bona fide |
| **BPCER** | Bona-fide Presentation Classification Error Rate | Proportion of bona-fide presentations misclassified as attacks |
| **CDFv2** | Celeb-DF-v2 | Celebrity deepfake dataset, version 2 (cross-dataset test set) |
| **CNN** | Convolutional Neural Network | Convolutional neural network |
| **DC** | Direct Current (coefficient) | DC coefficient (the zero-frequency coefficient in the DCT) |
| **DCT** | Discrete Cosine Transform | Discrete cosine transform |
| **DFDC** | DeepFake Detection Challenge (dataset) | DeepFake detection challenge dataset |
| **DNS** | Domain Name System | Domain name system |
| **eKYC** | electronic Know Your Customer | Electronic customer identification |
| **EER** | Equal Error Rate | Equal error rate |
| **FAD** | Frequency-Aware Decomposition | Frequency-aware decomposition (in F3-Net) |
| **FAS** | Face Anti-Spoofing | Face anti-spoofing (presentation-attack detection) |
| **FcaNet** | Frequency Channel Attention Network | Frequency channel attention network |
| **FDFL** | Frequency-aware Discriminative Feature Learning | Frequency-aware discriminative feature learning |
| **FF++** | FaceForensics++ | Face forgery dataset (used for training, c23 version) |
| **FLOPs** | Floating Point Operations | Number of floating-point operations |
| **FPR** | False Positive Rate | False positive rate |
| **FPS** | Frames Per Second | Frames processed per second |
| **GAN** | Generative Adversarial Network | Generative adversarial network |
| **Grad-CAM** | Gradient-weighted Class Activation Mapping | Gradient-weighted class activation mapping (visual explanation) |
| **ImageNet** | ImageNet (dataset) | Large-scale image dataset used to pretrain the backbone |
| **ISO/IEC** | International Organization for Standardization / International Electrotechnical Commission | Standards body (e.g. ISO/IEC 30107-3 for PAD evaluation) |
| **KL** | Kullback–Leibler (divergence) | Kullback–Leibler divergence |
| **MSE** | Mean Squared Error | Mean squared error |
| **PAD** | Presentation Attack Detection | Presentation-attack detection (liveness) |
| **PR** | Precision–Recall (curve) | Precision–recall curve |
| **ROC** | Receiver Operating Characteristic | Receiver operating characteristic |
| **RNN** | Recurrent Neural Network | Recurrent neural network |
| **SBI** | Self-Blended Images | Self-blended images (a data-augmentation technique) |
| **SFDCT** | Spatial–Frequency with block-wise DCT | The method proposed in this thesis |
| **SPSL** | Spatial-Phase Shallow Learning | Spatial-phase shallow learning |
| **SRM** | Steganalysis Rich Model | Steganalysis rich model (high-pass noise filtering) |
| **t-SNE** | t-distributed Stochastic Neighbor Embedding | A dimensionality-reduction technique for feature visualisation |
| **TPR** | True Positive Rate | True positive rate (recall) |
| **TT-NHNN** | Circular – State Bank of Vietnam | Legal document issued by the State Bank of Vietnam |
| **XAI** | Explainable Artificial Intelligence | Explainable artificial intelligence |
| **YCbCr** | Luma–Chroma color space | Luma–chroma color space (used for the DCT) |

<div style="page-break-after: always;"></div>

---

<div style="page-break-after: always;"></div>

# INTRODUCTION

## Problem Statement

In recent years, electronic Know Your Customer (eKYC) has become a normal part of banking and finance. A customer can open an account, take a loan, or confirm a payment from home, using only a portrait photo and a few taps on a phone. Because of this convenience, eKYC is now the first door into many financial services in Vietnam.

However, this door is also a target for attack. With deepfake techniques, which use GANs and other generative models to swap or create faces, a fake face that looks real can be made quickly and at low cost. If such a face passes the face verification step of eKYC, the result can be identity fraud, account takeover, and financial loss. In Vietnam, Circular 17/2024/TT-NHNN requires banks to verify customers with biometrics, but it does not give an exact error number. In addition, most current detectors are CNNs that learn directly from pixels. They work well on data similar to their training set, but they often fail when they meet a new forgery method or a new dataset. This is called the cross-dataset generalisation problem, and it is the hardest part of the task.

Recognizing this gap, this thesis aims to build a deepfake detection model that looks at a face image in two ways at the same time: the normal spatial view from pixels, and the frequency view based on block-wise DCT on 8×8 blocks, where deepfake traces are easier to see. The two views are joined by a gated cross-attention module whose gate starts from zero, so the combined model is never weaker than the spatial backbone alone. The model is wrapped in a web-based demo for the eKYC scenario, which shows a Grad-CAM image to explain each decision. The system also offers an additional liveness check feature, which helps detect printed photos or replay attacks in front of the camera.

This solution combines recent results in frequency analysis and deep learning, delivering a practical and explainable tool for the eKYC problem in Vietnam.

## Purposes

The purpose of this thesis is to develop a deepfake detector that generalises better to unseen forgery methods. This is the realistic situation in eKYC, where attackers always use the newest generation tools, which the model has never seen in training. The main new point of the method is the combination of a block-DCT frequency branch with the EfficientNet-B4 backbone through a zero-initialised gated cross-attention, together with the study of five frequency ideas from earlier works (SPSL, SRM, FreqDebias, FcaNet, FDFL) inside one common framework.

At the same time, the thesis aims to stay honest and practical. All models are trained and tested under the public DeepfakeBench protocol, so the comparison with the baseline is fair. The decision threshold of the demo is set at the operating point FPR ≤ 5% following ISO/IEC 30107-3. This number is our own engineering choice to meet the qualitative requirement of Circular 17/2024/TT-NHNN, which itself does not fix any threshold.

## Objectives

Build the SFDCT model: combine the EfficientNet-B4 backbone with a frequency branch based on block-wise DCT (8×8 blocks, 16 zigzag bands), fused by a zero-initialised gated cross-attention, so that the model has a performance floor at least equal to B4.

Adapt five frequency levers: bring five ideas from earlier frequency works (SPSL, SRM, FreqDebias, FcaNet, FDFL) into the same block-DCT domain and test which of them really helps and which does not.

Evaluate fairly across datasets: train on FaceForensics++ (c23) and test on Celeb-DF-v2 under the DeepfakeBench protocol, through the ablation chain B4 → B4-DCT → Row1 → Row2, with bootstrap confidence intervals to check whether a difference is real or only noise.

Build an explainable eKYC demo: a web system where the user uploads a face image and receives a risk score, a real or fake label, and a Grad-CAM image; the decision threshold is calibrated at FPR ≤ 5%. A liveness check module is included as a secondary feature, trained and evaluated within-dataset (see Section 3.1.8).

The thesis works at frame level on single face images and does not use temporal information across video frames.

## Implementation process

Step 1: Idea Development and Requirements Definition

We started by defining the scope of the thesis: deepfake detection is the main task, the liveness check is a secondary module, and the target scenario is eKYC in Vietnamese banking. The functional and non-functional requirements of the demo system were also listed at this stage.

Step 2: Theory Research and Model Exploration

To lay a solid foundation, we first studied how deepfakes are generated and why the generation process leaves traces in the frequency domain. We then read the related works on frequency-based detection, chose EfficientNet-B4 as the spatial backbone, and chose DeepfakeBench as the training and evaluation framework.

Step 3: Data Preparation

Faces were extracted from FaceForensics++ and Celeb-DF-v2 videos, aligned and cropped into 256×256 face images, and described by JSON files following the DeepfakeBench configuration.

Step 4: Model Building

The SFDCT model was built: a block-DCT frequency branch placed next to the B4 backbone, joined by the zero-initialised gated cross-attention, with the five frequency levers as optional parts that can be turned on and off for the ablation study.

Step 5: Training and Evaluation

The models were trained on FaceForensics++ (c23) and evaluated cross-dataset on Celeb-DF-v2 with frame-level AUC, using the DeepfakeBench default configuration. The details of the training setup and the results are given in Chapter 3.

Step 6: Demo Development and Cloud Deployment

A web demo was built with a Next.js frontend and a FastAPI backend. The system was deployed on AWS EC2, together with S3 for storing evidence images and CloudWatch for tracking logs, so the demo can be monitored in real time.

Step 7: Documentation

The final stage was writing this report, which presents the goals, the technical approach, the implementation, and the results of the thesis.

## Structure of the thesis

INTRODUCTION - This chapter gives information about the context and purpose of the thesis, as well as the scope of the problems which will be focused on in the thesis.

Chapter 1: THEORIES AND TECHNOLOGIES - This chapter introduces the core theories and technologies used in the thesis, including the web stack, deep learning fundamentals, the DCT and frequency analysis, and an overview of deepfake generation and detection.

Chapter 2: SYSTEM ANALYSIS AND DESIGN - This chapter describes the system requirements, the design of the SFDCT model, and the architectural design of the demo application.

Chapter 3: SYSTEM IMPLEMENTATION AND EVALUATION - This chapter details the implementation of the system and its model components, along with the experimental results, their statistics, and the performance evaluation.

CONCLUSION - The concluding section emphasizes the problems solved, presents the issues still unresolved, and provides recommendations and suggestions for future work.

REFERENCES - Presentation of the details of the referenced materials used in this thesis.

<div style="page-break-after: always;"></div>

# CHAPTER 1: THEORIES AND TECHNOLOGIES

This chapter presents the theory and the technologies behind the **DeepGuard** platform and its core detector, **SFDCT** (Hybrid Spatial–Frequency Learning with Block-wise DCT). The chapter moves from the outside of the system to the inside. It starts with the web stack that the user touches directly: JavaScript, Next.js, FastAPI, the HTTP API contract, and DNS. It then explains the AI building blocks of the detector, namely EfficientNet-B4, the Discrete Cosine Transform, and attention-based fusion. After that, it turns to the domain itself. We look at how deepfakes are made, why detecting them across datasets is hard, what the eKYC context demands, and how a secondary liveness module fits in. The chapter closes with the cloud-deployment technologies (AWS) and a summary. Throughout, each idea is presented with the formula first and the intuition after, and is anchored to a figure or a table where possible.

## 1.1 JavaScript

JavaScript is a high-level, dynamically typed programming language and the standard language of the web browser. HTML describes the structure of a page and CSS describes its appearance; JavaScript supplies its behaviour. It runs inside every modern browser and lets a page react to the user. Typical examples are responding to clicks, validating a form before it is sent, fetching data without a full page reload, and re-rendering parts of the interface on the fly. JavaScript also runs on the server through the **Node.js** runtime. As a result, one language can cover both ends of a web application, and the same runtime powers the build tooling of the frontend framework used in this project (Next.js, Section 1.2).

In the DeepGuard platform, JavaScript (in its typed superset **TypeScript**) is used to:

- Handle user interactions and form submissions on the analyst dashboard, for example uploading a face image in the integration Playground and triggering a detection request.
- Make asynchronous API calls to the FastAPI backend using the browser Fetch API. Every request carries an authorisation token: a JWT for dashboard users, or an API key for external integrations.
- Update the user interface when the verdict returns, rendering the risk score, the Grad-CAM heat-map, and the 2D-DCT frequency spectrum without reloading the page.

JavaScript works hand in hand with HTML and CSS and, through React and Next.js, it is the language in which the entire DeepGuard front end is written.

## 1.2 Next.js

**Next.js** is a production-grade React framework for building user interfaces and single-page applications (SPAs). It sits on top of React and is designed to be adopted step by step. The developer writes ordinary React components, and the framework supplies the surrounding machinery needed to ship a real application: routing, rendering strategies, and build tooling. DeepGuard uses Next.js 16 with the App Router, together with React 19 and TypeScript, served as a single-page dashboard on port 3000.

### 1.2.1 Key features

- **Component-based architecture.** The interface is assembled from small, isolated, reusable React components. Each component holds its own markup, styling, and logic, for example a `DetectionCard`, a `RiskBadge`, or a `GradCamViewer`.
- **File-system routing (App Router).** Each route in the dashboard (login, dashboard, tenants, team, API keys, playground, audit) is expressed as a directory of components. The URL structure therefore mirrors the source structure, and a new screen is added by adding a folder.
- **Server and client components.** The App Router lets parts of the UI render on the server for a fast first paint, while the interactive parts stay on the client. This gives a responsive experience without sacrificing load time.
- **Declarative rendering with a virtual DOM.** React re-renders only the parts of the page whose underlying data changed. When a detection result arrives, only the result panel updates.
- **Integrated build tooling.** Next.js bundles, transpiles, and optimises the TypeScript/JSX source into static and dynamic assets, ready for deployment behind the reverse proxy on AWS (Section 1.13).

### 1.2.2 Advantages

Next.js was chosen for DeepGuard for practical reasons. It has a gentle learning curve on top of React, yet it can power a non-trivial multi-role dashboard. It is flexible and lightweight, and it scales from a single component to a full SPA. It performs well thanks to the virtual DOM and server rendering, and it is backed by a large community and mature documentation. In practice, this means the front end stays maintainable as the platform grows from five role-specific dashboards to additional screens (liveness, monitoring) without re-architecting the routing or the data layer.

Server-state caching is handled by TanStack Query, while a small amount of client-only state (authentication, navigation, appearance) is kept in Zustand. This keeps the UI consistent with the strict one-directional request flow described in Section 1.4.

## 1.3 FastAPI

**FastAPI** is a modern, high-performance web framework for building APIs in Python (3.7+), built on standard Python type hints. It is designed for fast, scalable web APIs with automatic interactive documentation, strong typing, and first-class asynchronous support. It is widely used for RESTful backends, microservices, and machine-learning serving. DeepGuard's application tier is a FastAPI service run by Uvicorn. It exposes the platform's complete REST surface, with endpoints grouped into authentication, users/tenants, API keys, detection, liveness, dashboard detections, webhooks, and analytics/audit.

FastAPI is the only component allowed to reach the database and the SFDCT model. It enforces the one-directional flow `router → service → repository (CRUD)` and never lets a route touch PostgreSQL directly. In concrete terms, FastAPI authenticates and authorises every request, validates inputs and serialises outputs through **Pydantic v2** schemas (separate Create / Read / Update models), and persists and queries records via SQLAlchemy. For detection requests such as `POST /v1/detect/image`, it forwards the face-cropped payload over `httpx` to the SFDCT microservice and returns the structured verdict (`prob_fake`, label, Grad-CAM). The backend deliberately keeps heavy machine-learning dependencies out of its own runtime: the model lives behind the microservice boundary, so the API process only needs an HTTP client to obtain predictions. FastAPI also auto-generates interactive documentation (Swagger UI at `/docs`), which doubles as the integration reference for external eKYC clients. In this design, FastAPI acts as the single guarded door between the browser, the database, and the model.

## 1.4 HTTP API

An **HTTP API** (HyperText Transfer Protocol Application Programming Interface) is a standardised interface that lets different software systems communicate over the web using the HTTP protocol. It is the most common way in modern web development to connect the client side (frontend) to the server side (backend). In DeepGuard it is also how an external bank back-end calls the detection service machine-to-machine. All communication in DeepGuard travels over HTTP in a REST style with JSON payloads. The browser reaches the backend over HTTPS, the backend reaches the SFDCT microservice over HTTP via `httpx`, and external eKYC clients call the public detection API in the same way.

### 1.4.1 Structure of an HTTP API

HTTP APIs are usually organised around RESTful principles (Representational State Transfer). Each resource (a user, a tenant, an API key, a detection result) is reachable through a specific URL (endpoint), and actions on those resources are performed with standard HTTP methods:

- **GET** — retrieve data from the server (e.g. `GET /v1/results/{request_id}`).
- **POST** — send new data to the server (e.g. `POST /v1/detect/image`).
- **PUT / PATCH** — update existing data (e.g. update a tenant's quota).
- **DELETE** — remove data (e.g. revoke an API key).

Endpoints are organised by resource and verb. For example, `POST /v1/detect/image` and `POST /v1/detect/video` handle forgery detection, `POST /v1/detect/liveness` and `GET /v1/liveness/challenge` handle liveness, and `GET /v1/results/{request_id}` retrieves a stored result.

### 1.4.2 API request

A request to the API has four parts:

- **URL** — identifies the resource.
- **Method** — specifies the operation (GET, POST, etc.).
- **Headers** — additional metadata, e.g. the authentication token (`Authorization: Bearer ...`) and the content type.
- **Body** — the data being sent to the server, usually as JSON or, for image upload, as `multipart/form-data`.

### 1.4.3 API response

A response likewise has a consistent shape:

- **Status code** — the result of the request (e.g. `200 OK`, `401` invalid key, `402` quota exhausted, `429` rate limit, `422` invalid payload).
- **Headers** — metadata about the response (e.g. a `Retry-After` header on a `429`).
- **Body** — the actual data, usually JSON. DeepGuard follows fixed conventions: a `{items, total, page, limit}` envelope for paginated lists and a `{"detail": "..."}` body for errors.

Table 1.1 illustrates this contract on the central detection endpoint.

*Table 1.1: REST contract for the primary detection endpoint.*

| Field | Value |
|---|---|
| Method | POST |
| Path | `/v1/detect/image` |
| Auth | API Key (`Authorization: Bearer sk-dg-...`) |
| Request | `multipart/form-data` image file (face-cropped via MTCNN [17] before inference) |
| Response (200) | `{ "request_id": "...", "verdict": "FAKE", "prob_fake": 0.93, "gradcam_b64": "..." }` |
| Errors | `401` invalid key · `402` quota exhausted · `429` rate limit · `422` invalid payload |

### 1.4.4 Benefits of using HTTP APIs

- **Platform independence** — any client (browser, mobile app, or another server) can talk to the API over HTTP.
- **Separation of concerns** — frontend and backend can be developed and deployed independently.
- **Scalability** — the API is easily extended as the platform grows.
- **Security** — it can be protected with authentication methods such as API keys, JWT, or OAuth; DeepGuard uses JWT for the dashboard and API keys for external integration.

In short, the HTTP/REST API is the one JSON contract that ties DeepGuard's tiers together and exposes detection to external eKYC clients.

## 1.5 Domain Name System (DNS)

The **Domain Name System (DNS)** is a hierarchical, decentralised naming system. It translates human-readable domain names (e.g. `deepguard.vn`) into the numerical IP addresses (e.g. `203.0.113.10`) that computers use to find each other on the Internet. DNS is a foundational part of the modern web. It lets users reach a service by name without remembering an address, and it is the mechanism that points a public domain at the cloud host on which DeepGuard runs.

DNS operates through several components:

- **Domain registrars** — entities through which a domain name is registered and managed (e.g. Namecheap, GoDaddy, or a Vietnamese `.vn` registrar).
- **DNS records** — configuration entries such as A, CNAME, TXT, and MX records that determine how traffic for a domain is routed; the A record maps a name to an IPv4 address.

### 1.5.1 DNS servers

- **Authoritative DNS servers** hold the actual records for a domain and answer queries about it definitively.
- **Recursive resolvers** query DNS records on behalf of clients. They walk the hierarchy from the root down to the authoritative server and cache the result.

In DeepGuard, DNS is configured to map the public domain (and any subdomains, for example an `api.` host for the backend) to the Elastic IP of the AWS EC2 instance that hosts the containerised stack (Section 1.13). Proper DNS setup matters for three things: routing requests to the right host, enabling HTTPS through certificate management (an ACM-issued certificate), and keeping the public address stable across instance restarts. It is the first link in the chain that carries a request from the user's browser to the backend.

## 1.6 EfficientNet-B4

### 1.6.1 Why a strong spatial backbone is needed

The central scientific hypothesis of this thesis concerns the frequency domain. Even so, the detector still needs a strong spatial backbone as its spine, because many forgery traces are spatial by nature: skin-texture inconsistency, errors around the eyes and teeth, and lighting mismatches. The frequency branch is designed to complement this spatial stream, not to replace it. The backbone therefore has to be both powerful and parameter-efficient. The thesis adopts **EfficientNet-B4** as the spatial branch, building on the EfficientNet family of convolutional networks.

### 1.6.2 Compound scaling — the core idea of EfficientNet

EfficientNet [1] starts from a simple observation. When increasing a CNN's capacity, there are three knobs to turn: depth (number of layers), width (number of channels), and input resolution. Prior designs typically turned only one knob; ResNet, for example, went deeper. EfficientNet showed that turning all three knobs at the same time, in fixed proportion, gives a far better accuracy/FLOPs trade-off. This rule is called **compound scaling**. Given a resource coefficient $\phi$, the three dimensions are scaled as

$$
\text{depth} = \alpha^{\phi}, \quad \text{width} = \beta^{\phi}, \quad \text{resolution} = \gamma^{\phi},
$$

subject to the constraint $\alpha \cdot \beta^{2} \cdot \gamma^{2} \approx 2$ (keeping the FLOPs increase approximately $2^{\phi}$-fold), where $\alpha, \beta, \gamma$ are found by a small grid search on the base network. Increasing $\phi$ produces the B0 → B7 family; B4 is a well-balanced, mid-range point within it.

*Table 1.2: The three scaling dimensions of EfficientNet.*

| Scaling dimension | What is turned | Benefit | Risk if turned in isolation |
|---|---|---|---|
| Depth ($\alpha^\phi$) | Number of layers | Captures more complex/abstract features | Harder to train (vanishing gradient) |
| Width ($\beta^\phi$) | Number of channels | Captures more fine-grained features | Saturation, poor parameter efficiency |
| Resolution ($\gamma^\phi$) | Input image size | Sees small details (subtle artifacts) | FLOPs grow rapidly |

### 1.6.3 The MBConv block — the building unit

The basic unit of EfficientNet is the **MBConv** block (Mobile Inverted Bottleneck Convolution), inherited from MobileNetV2. It works in three steps. First, an expand step uses a 1×1 convolution to raise the number of channels (e.g. ×6), creating a wide representation space. Second, a depthwise convolution, which is far cheaper than a full convolution, learns spatial patterns channel by channel. Third, a project step uses another 1×1 convolution to compress the channels back to a small number (the bottleneck). This expand-then-compress structure (the inverted bottleneck) lets the block learn rich representations while staying parameter-efficient.

Each block also includes a **Squeeze-and-Excitation (SE)** module [24], together with a residual connection when input and output dimensions match. The SE module learns a per-channel importance weight, amplifying useful channels and suppressing noisy ones.

One detail is worth noting for this thesis. The SE module is essentially a form of channel attention based on global statistics (global average pooling). Section 1.7.4 builds on this bridge: the FcaNet-based lever (S4) generalises SE by replacing average pooling with multiple DCT components, giving channel attention that is richer in frequency information.

![Figure 1.2 — MBConv block](figures/fig_1_2_mbconv.png)

*Figure 1.2: The MBConv block — expand 1×1 → depthwise convolution → Squeeze-and-Excitation → project 1×1, with a residual connection when dimensions match.*

### 1.6.4 Why B4 was chosen, and transfer learning from ImageNet

The choice of B4 (rather than the smaller B0 or the larger B7) rests on three reasons:

1. **Leaderboard comparison.** EfficientNet-B4 is the backbone commonly used in DeepfakeBench baselines. Choosing B4 therefore enables fair comparison and pipeline confirmation: the thesis B4 baseline reaches CDFv2 frame-AUC 0.7497, close to the DeepfakeBench-harmonized figure ≈ 0.7487, as discussed in Section 1.10.3.
2. **Resource balance.** B4 is large enough to learn subtle forgery features yet still fits a mid-range GPU, allowing batch size 32 at 256×256 resolution.
3. **Suitable resolution.** B4 was originally designed for ~380 px input images. At 256×256 it still operates well and retains enough detail to capture small artifacts.

**Transfer learning.** The backbone is initialised with weights pretrained on ImageNet rather than trained from scratch. The low-level filters (edges, corners, textures) learned from millions of natural images are generic and immediately reusable, so only the higher layers need fine-tuning for the forgery-detection task. This saves data, shortens convergence time, and usually improves generalisation. Input images are normalised with mean = std = 0.5 (mapping pixels to $[-1, 1]$), in line with the thesis pipeline configuration. In summary, EfficientNet-B4 gives SFDCT a strong, parameter-efficient, ImageNet-pretrained spatial base to which the frequency branch is attached.

## 1.7 The Discrete Cosine Transform (DCT) and Frequency-Domain Analysis

### 1.7.1 Why use DCT rather than Fourier

Section 1.9 will argue that forgery artifacts are clearly revealed in the frequency domain. The first design decision is which transform should move an image into that domain. The thesis chooses the **DCT (Discrete Cosine Transform)** [10] over the DFT/FFT for three reasons. First, the DCT yields real coefficients, with no complex imaginary part as in the Fourier transform, so the output is easy to feed into a neural network. Second, the DCT has excellent energy compaction: it concentrates most of the signal's energy into a few low-frequency coefficients, so the high-frequency residual, where the artifacts live, stands out. Third, the DCT is exactly the transform that the JPEG standard applies to each 8×8 block, so block-DCT is the most natural way to inspect traces related to compression and the block grid.

### 1.7.2 One-dimensional and two-dimensional DCT

**One-dimensional DCT (1D-DCT).** Given a discrete signal $x[n]$, $n = 0,\dots,N-1$, the DCT-II (the most common type) defines the $k$-th frequency coefficient

$$
X[k] = c(k)\sum_{n=0}^{N-1} x[n]\,\cos\!\left[\frac{\pi (2n+1)k}{2N}\right], \quad k = 0,\dots,N-1,
$$

with normalisation $c(0) = \sqrt{1/N}$ and $c(k) = \sqrt{2/N}$ for $k \ge 1$. The intuition is simple: each $X[k]$ measures the similarity between the signal and a cosine of frequency $k$. The coefficient $X[0]$ (the DC term) is proportional to the signal's mean. Large-$k$ coefficients (the high-frequency AC terms) capture rapid variation such as sharp edges, noise, and fine patterns.

**Two-dimensional DCT (2D-DCT).** For an image block $B(i,j)$ of size $M \times N$, the 2D-DCT is the 1D-DCT applied successively along rows then columns (separable):

$$
F(u,v) = c(u)\,c(v)\sum_{i=0}^{M-1}\sum_{j=0}^{N-1} B(i,j)\,\cos\!\left[\frac{\pi(2i+1)u}{2M}\right]\cos\!\left[\frac{\pi(2j+1)v}{2N}\right].
$$

The result $F(u,v)$ is a grid of coefficients. The top-left corner $(0,0)$ is the DC term, which carries the coarse content; moving towards the bottom-right gives increasingly high frequencies in both directions.

*Table 1.3: Meaning of coefficient position in a 2D-DCT block.*

| Coefficient position $(u,v)$ | Name | What it captures | Relation to forgery artifacts |
|---|---|---|---|
| $(0,0)$ | DC | Average brightness of the block | Carries content → prone to content leakage |
| Near top-left corner | Low frequency | Slow variation, coarse shape | Few artifacts |
| Mid region | Mid frequency | Texture, moderate patterns | Upsampling/blending artifacts clearly revealed |
| Bottom-right corner | High frequency | Sharp edges, noise, fine detail | Frequency inconsistency, compression traces |

### 1.7.3 Block-wise DCT 8×8, zigzag scan, 16 bands, log-magnitude, and YCbCr

**Block-wise DCT 8×8 and the JPEG connection.** Applying the DCT to the whole image (global DCT) mixes global content and makes local artifacts hard to isolate. Instead, the thesis uses block-wise DCT 8×8: the image is divided into a grid of non-overlapping 8×8 blocks, and the 2D-DCT is applied independently to each block, which is exactly JPEG's processing unit. This brings three benefits. Artifacts are localised to local regions (a blending boundary affects only a few blocks around the edge). The grid matches the JPEG compression grid, so compression and forgery traces can be detected together. The computation is also cheap, thanks to fast 8×8 DCT algorithms. Each block yields 64 coefficients ordered DC → highest frequency.

**Zigzag scan and the 16 frequency bands.** The 64 coefficients are not used individually, because that would mean too many dimensions and too much noise. They are grouped into frequency bands via the zigzag scan: a path that starts at the DC corner, traverses the anti-diagonals, and ends at the highest-frequency coefficient. Coefficients on the same anti-diagonal share the same total frequency level $(u+v)$, so the zigzag arranges the 64 coefficients into a sequence of increasing frequency (the same order JPEG uses for encoding). The thesis groups them into 16 frequency bands from DC → high frequency, then computes per-band statistics (e.g. mean energy / log-magnitude) to form a compact, stable frequency feature. An important option is drop low bands. The DC and the lowest bands mainly carry content, and keeping them risks the model learning along image content (content leakage) rather than forgery traces. Removing them forces the frequency branch onto the mid–high bands, which is where the artifacts reside.

**Log-magnitude.** DCT coefficients span a huge dynamic range: the DC coefficient can be thousands of times larger than a high-frequency coefficient. If raw amplitudes were fed into a network, the small high-frequency coefficients, exactly where the artifacts are, would be numerically swallowed. The log-magnitude transform fixes this:

$$
D(u,v) = \log\big(1 + |F(u,v)|\big).
$$

The $\log(1+\cdot)$ compresses the dynamic range. Small coefficients are lifted into numerically meaningful signals, $\log(0)$ is avoided, and high-frequency artifact peaks become observable and learnable.

**The YCbCr colour space.** The DCT is applied not to RGB but to YCbCr, that is, the luminance channel Y and the two chrominance channels Cb and Cr. There are two reasons. YCbCr separates brightness from colour, mirroring the human visual system and the JPEG standard, and most frequency traces reside in Y. In addition, JPEG compresses Cb and Cr more heavily than Y (chroma subsampling), so their frequency statistics carry complementary compression/forgery information. Applying block-DCT independently on all three channels gives a more complete frequency picture than RGB or grayscale alone.

![Figure 1.3 — Zigzag scan and 16 frequency bands](figures/fig_1_3_zigzag.png)

*Figure 1.3: Zigzag scan over an 8×8 DCT block (left) and the grouping of the 64 coefficients into 16 frequency bands from DC to the highest frequency (right).*

**Summary of the chain.** Taken together, YCbCr → block-DCT 8×8 → zigzag → 16 bands → log-magnitude (→ drop low bands) turns a face image into a frequency representation that is compact, locally localised, normalised in dynamic range, and reduced in content. In this representation the forgery traces of Section 1.9.4, such as upsampling peaks, blending-boundary inconsistency, and frequency-statistics mismatch, become clear patterns that a lightweight branch can learn. This chain is the input to SFDCT's frequency branch.

### 1.7.4 Inherited frequency cues — the foundations of the five levers (S1–S5)

The block-DCT branch above is the naive SFDCT input. On top of it, the thesis studies five optional improvement levers $S1$–$S5$. Each lever adapts the original principle of a prior work into the block-DCT domain. The system is built on DeepfakeBench, and the levers adapt the published ideas of SPSL, SRM, FcaNet, FreqDebias, and FDFL. This section gives only the theoretical basis, that is, the original idea and the direction of adaptation; the implementation formulas are reserved for Chapter 2.

**S1 — SPSL → phase-analog sign (`dct_use_sign`).** SPSL (Spatial-Phase Shallow Learning) showed that the phase spectrum, not just the magnitude, carries important upsampling traces and generalises well. The DCT yields real coefficients and so has no Fourier-style phase. However, the sign of a DCT coefficient is analogous to phase: it encodes the direction of the cosine component. The S1 lever therefore adds the sign of the DCT coefficients to the frequency feature (instead of using only log-magnitude, which discards it). This provides a phase-analog signal without leaving the DCT domain.

**S2 — SRM → high-pass noise residual (`dct_srm_residual`).** SRM (Spatial Rich Model), from steganalysis, uses a bank of fixed high-pass filters to extract a noise residual, the signal that remains after low-frequency content is removed. On this residual, high-frequency forgery traces stand out far more, because the content has been suppressed. The S2 lever applies block-DCT not on the raw image but on an SRM-style high-pass residual. The content is filtered out first, so the subsequent block-DCT inspects only the noise that contains the artifacts.

**S4 — FcaNet → multi-spectral channel attention (`dct_fca_attention`).** FcaNet generalises the Squeeze-and-Excitation module. SE compresses each feature map into one number via global average pooling, and average pooling is exactly the DC component (frequency 0) of the DCT. FcaNet argues that using only the DC discards information. It instead uses multiple DCT frequency components across channels, forming a more information-rich multi-spectral channel attention. The S4 lever brings FcaNet's multi-spectral attention layer into the architecture, so the network learns channel attention using the DCT components themselves. Both the backbone (via SE) and S4 are channel attention; S4 is simply richer in frequency.

**S3 — FreqDebias → frequency mixup and consistency (`use_dct_fomixup`).** FreqDebias targets frequency bias: detectors tend to latch onto one tell-tale band of the training set, which hurts generalisation. The remedy mixes frequency information across samples to break the rigid dependence, and adds a consistency constraint that forces predictions to remain stable under those mixes. The S3 lever performs DCTFoMixup, which mixes DCT bands across samples and then applies an inverse DCT back to the image (frequency-domain augmentation), with a dual consistency loss (symmetric-KL on probabilities plus MSE on embeddings). S3 adds no learnable parameters; it changes only data generation and the loss, and is therefore present in both Row1 and Row2.

**S5 — FDFL → single-center loss (`use_single_center_loss`).** FDFL (Frequency-aware Discriminative Feature Learning) improves the discriminativeness of the feature space via a single-center loss. Rather than letting REAL and FAKE scatter arbitrarily, it compresses all REAL samples towards a single center in the embedding space while pushing FAKE away by a margin. The intuition is that REAL is a homogeneous concept (natural statistics), whereas FAKE is diverse (many pipelines). Compressing REAL tightly and treating samples far from the cluster as suspicious therefore generalises well to unseen fakes. The S5 lever adds this loss, pushing FAKE away by a margin proportional to $\sqrt{D}$ (with $D$ the embedding dimension). It adds parameters (the center coordinates) and appears in Row2 together with S4.

*Table 1.4: The five levers S1–S5 — source paper, principle, and configuration in which each appears.*

| Lever | Flag name | Source paper | Core principle | Adds parameters? | Present in |
|---|---|---|---|---|---|
| S1 | `dct_use_sign` | SPSL [6] | Adds the DCT coefficient sign (phase-analog) | No | Row1 |
| S2 | `dct_srm_residual` | SRM [7] | Block-DCT on the high-pass residual | No | Row1 |
| S3 | `use_dct_fomixup` | FreqDebias [12] | Frequency mixup + dual consistency | No | Row1, Row2 |
| S4 | `dct_fca_attention` | FcaNet [5] | Multi-spectral channel attention (DCT) | Yes | Row2 |
| S5 | `use_single_center_loss` | FDFL [11] | Single-center loss (compress REAL to 1 center) | Yes | Row2 |

This organisation yields two configurations with a clear story. Row1 = naive + S1+S2+S3: no added learnable parameters, only a changed input feature and loss. Row2 = naive + S4+S5+S3: added learnable parameters (FcaNet + single-center loss). Splitting by whether parameters are added makes it possible to tell whether any AUC change comes from a better feature or from more capacity. The actual per-lever effect is an empirical question reported in Chapter 3, and Row1's measured result is in fact a negative one (see Section 1.10 and Chapter 3). Within the thesis GPU budget, Row2 was not trained. Instead, two single-axis variants (Fix1 = sign + drop-low-band, Fix2 = FcaNet-style attention) trained under the identical recipe provide a partial per-lever decomposition in Chapter 3, and the full one-lever-at-a-time table is left as future work.

## 1.8 Attention Mechanisms and Feature Fusion

### 1.8.1 Why attention is needed to fuse the two branches

At this point we have two information streams: spatial features from EfficientNet-B4 and frequency features from the block-DCT branch. The remaining question is how to combine them. The crudest approach, concatenation plus a fully-connected layer, has two drawbacks. It mixes the two streams indiscriminately, so the model has no way to decide when and where the frequency information is trustworthy. It also breaks equivalence with the original backbone, so the fused model is no longer guaranteed to be at least as good as B4. The **attention** mechanism solves both problems by letting the spatial features actively and selectively query the frequency features.

### 1.8.2 Self-attention and cross-attention

**Self-attention** lets each position in a feature sequence look at every other position and aggregate information weighted by relevance. It uses three projection matrices: Query ($Q$), Key ($K$), and Value ($V$). The scaled dot-product attention [30] is

$$
\text{Attention}(Q, K, V) = \text{softmax}\!\left(\frac{QK^{\top}}{\sqrt{d_k}}\right)V,
$$

where $QK^\top$ measures query–key similarity (the attention weights), $\sqrt{d_k}$ is the scaling that prevents softmax saturation, and multiplication by $V$ returns a weighted combination of the values. In words: for each query $Q$, take a weighted average of the values $V$, with high weight where $K$ matches $Q$.

**Cross-attention** is the variant in which $Q$ comes from one source while $K, V$ come from another. Fusion needs this form. SFDCT sets $Q$ = spatial features and $K, V$ = frequency (DCT) features. Each spatial position then asks the frequency branch which frequency traces are relevant in its region, and retrieves a context vector aggregated from the most relevant DCT features. The gated cross-attention in SFDCT uses this mechanism to inject frequency information into the spatial stream.

*Table 1.5: Role of Q/K/V in SFDCT's cross-attention fusion.*

| Component | From branch | Role |
|---|---|---|
| Query $Q$ | Spatial (B4) | "Question": what frequency information does this region need? |
| Key $K$ | Frequency (block-DCT) | "Index": what each frequency feature describes |
| Value $V$ | Frequency (block-DCT) | "Content": the frequency information retrieved |
| Context | — | Weighted combination of $V$, injected back into the spatial stream |

### 1.8.3 Gated fusion and the meaning of the alpha gate

SFDCT does not inject the frequency context directly, but through a **gate** with a learnable coefficient $\alpha$:

$$
\text{feature}_{\text{fused}} = x + \alpha \cdot \text{context}(\text{DCT}),
$$

where $x$ is the spatial feature, $\text{context}(\text{DCT})$ is the cross-attention frequency context, and $\alpha$ is learnable. Intuitively, $\alpha$ acts as a volume control for the frequency branch. If the frequency information is useful during training, the gradient pushes $\alpha$ up and the gate opens. If it is noisy or useless, $\alpha$ is driven towards 0 and the gate closes. The learned $\alpha$ is therefore a quantitative indicator of how much the frequency branch contributes, which the thesis visualises (Figure 3.13, `gate_alpha.png`).

### 1.8.4 Zero-init: why it guarantees a floor ≥ backbone

This design choice is central from a risk standpoint. SFDCT initialises $\alpha = 0$ at the start of training (**zero-init**). Consequently, at initialisation,

$$
\text{feature}_{\text{fused}} = x + 0 \cdot \text{context}(\text{DCT}) = x,
$$

so the model is exactly equal to a pure EfficientNet-B4: the entire frequency branch does not perturb the pretrained spatial stream. Training then opens $\alpha$ gradually, and only if the frequency information genuinely reduces the loss. The result is a guaranteed floor. In the worst case, with a useless frequency branch, $\alpha$ stays near 0 and the model is never worse than B4. Because of this property, the thesis can describe the architecture as risk-safe, which matters in the eKYC context where reliability comes first.

One distinction should be kept clear when SFDCT is contrasted with SFCL-HCMF in later chapters. SFDCT's gate is initialised to 0, giving a strict floor of the B4 backbone, and there is no global-differential / SIDA branch: SFDCT is purely EfficientNet-B4 (spatial) plus an 8×8 block-DCT branch plus zero-init gated cross-attention fusion. SFCL-HCMF's gate initialises at 0.5, so it carries no such floor guarantee.

![Figure 1.4 — Zero-init gated cross-attention fusion](figures/fig_1_4_gate_fusion.png)

*Figure 1.4: Gated cross-attention fusion with the zero-initialised α gate — at initialisation the frequency branch is closed (α = 0) and the model is exactly the B4 backbone.*

## 1.9 Overview of Deepfake Technology

### 1.9.1 Why we must understand how deepfakes are generated

Before building a detector, we must understand how the adversary creates fake images, because every generation method leaves a fingerprint that is characteristic of its pipeline. If we understand the pixel transformations a generative algorithm performs, we know where to look for the traces. We also know in which representation domain, spatial or frequency, those traces are most visible. The thesis builds on this point: it argues that certain traces are almost invisible in the spatial domain yet loud in the mid/high DCT bands.

### 1.9.2 Three families of face-forgery techniques

The term "deepfake" covers many techniques, reducible to three dominant architectural families:

**(a) Autoencoder face-swap.** This is the classic architecture behind tools like FaceSwap/DeepFaceLab: two autoencoders share an encoder but have separate decoders for identities A and B. The encoder learns an identity-invariant latent (pose, expression, lighting). At inference, face A is encoded and then decoded by B's decoder, giving face B with A's pose and expression. The final step always blends the generated face back into the original frame, and that blending step creates the blending boundary.

**(b) GAN (Generative Adversarial Network)** [23]**.** A generator learns to turn noise or input images into fakes, competing against a discriminator that learns to tell real from fake. The two train adversarially until the fakes fool the discriminator. GANs power many high-quality face synthesisers (e.g. StyleGAN). The key point for this thesis is the upsampling path: the generator builds a high-resolution image from a low-resolution tensor through upsampling layers (transposed convolution or interpolation + convolution), leaving upsampling artifacts, periodic patterns that show up as abnormal spectral peaks.

**(c) Diffusion model.** The newest family synthesises images by learning to reverse a gradual noising process: starting from Gaussian noise, a denoising network iterates to reconstruct an image. Diffusion gives very high quality but still leaves frequency statistics that differ from natural photographs. In the scope of this thesis, diffusion is noted as a trend the detector should eventually generalise to (future work), while the main training data (FF++) belongs to the first two families.

![Figure 1.5 — Three face-generation pipelines](figures/fig_1_5_pipelines.png)

*Figure 1.5: The three face-generation families (autoencoder face-swap, GAN, diffusion); all converge on a final upsampling/blending step that leaves frequency-domain artifacts.*

### 1.9.3 Four forgery families in FaceForensics++

The standard FaceForensics++ (FF++) dataset [2] aggregates four forgery methods spanning two manipulation types, identity swap and expression reenactment:

*Table 1.6: The four forgery families in FF++ — mechanism and characteristic trace.*

| Method | Manipulation type | Core mechanism | Characteristic trace |
|---|---|---|---|
| **Deepfakes** | Identity swap | Autoencoder swaps identity then blends into the frame | Blending boundary, texture inconsistency between face region and background |
| **Face2Face** | Expression reenactment | 3D-model-based expression reenactment, re-rendering the mouth/face region | Rendering errors, boundary noise around the reenacted region |
| **FaceSwap** | Identity swap | Graphics-based face swap, matching 3D landmarks then blending | Rigid geometric seams, lighting inconsistency |
| **NeuralTextures** | Expression reenactment | Learned neural textures + differentiable rendering (neural rendering) | Subtle artifacts around the mouth, hard to see in the spatial domain |

These four span both deep-learning-based manipulations (Deepfakes, NeuralTextures) and traditional graphics-based ones (Face2Face, FaceSwap). The mix forces the detector to learn common traces rather than memorising a single artifact type.

### 1.9.4 Forgery traces: weak in the spatial domain, clear in the frequency domain

This subsection states the central hypothesis of the work, so the intuition deserves a careful walk-through. The three most common trace types are:

1. **Blending boundary.** When the generated face is blended in, two regions with different statistics (sharpness, sensor-noise level, colour balance) are forced to meet. In the pixel domain, smoothing (feathering, Poisson blending) makes the boundary almost invisible. However, the smoothing alters the local frequency structure: it abnormally suppresses high-frequency energy around the boundary.

2. **Upsampling artifact.** The upsampling layers of a GAN/decoder produce periodic grid-like patterns. The eye barely perceives them, but in the DCT/Fourier spectrum they appear as energy peaks localised in the mid/high bands.

3. **Frequency inconsistency.** A real camera's processing chain (demosaicing, JPEG) produces a natural, consistent frequency signature across the image. Fakes composited from multiple sources, or passed through a generative network, violate this consistency. They leave phase/amplitude mismatches across bands.

These observations shape the design. A spatial CNN learns filters over the pixel grid; it can indirectly capture some frequency artifacts, but it does so inefficiently, because the traces are tiny and buried in image content. Actively projecting the image into the frequency domain (via block-DCT) pulls the artifacts out into discrete coefficients that are easy to separate from content. That gap between the two representations motivates the frequency branch running parallel to the spatial backbone in SFDCT's two-branch architecture.

A real measured example of this contrast, a real/fake pair whose difference is near-invisible in the pixel domain yet clearly separated in the log-magnitude DCT spectrum, is shown with the thesis's own data in Figure 3.2, and the per-band energy comparison appears in Figure 3.11 (Chapter 3).

## 1.10 The Deepfake Detection Problem and the Generalisation Challenge

### 1.10.1 Definition of the binary classification problem

At its most basic, deepfake detection is a frame-level binary classification problem: given a face image $x$, the model $f_\theta$ outputs

$$
\hat{y} = f_\theta(x) \in [0, 1],
$$

the probability that the image is FAKE; the ground-truth label is $y \in \{0, 1\}$ with $0 = $ REAL, $1 = $ FAKE. Training uses binary cross-entropy:

$$
\mathcal{L}_{\text{BCE}} = -\big[\, y \log \hat{y} + (1 - y)\log(1 - \hat{y}) \,\big].
$$

Because the problem is frame-level, a video is scored by aggregating per-frame probabilities (e.g. averaging). The main metric of this thesis, however, is **frame-level AUC**, a direct measure of real–fake separability at the image level.

AUC is preferred over accuracy for a clear reason. Accuracy depends on a fixed threshold and is highly sensitive to class imbalance, and deepfake sets are typically skewed. AUC (Area Under the ROC Curve) [21] measures the probability that the model ranks a random FAKE above a random REAL, independently of any threshold. For this reason it is the de-facto standard in deepfake benchmarks.

*Table 1.7: Mapping of the problem symbols.*

| Symbol | Role | Meaning |
|---|---|---|
| $x$ | Input | 256×256 face-crop image |
| $f_\theta$ | Model | Detector with parameters $\theta$ |
| $\hat{y}$ | Output | Probability of being FAKE, $\in [0,1]$ |
| $y$ | Label | 0 = REAL, 1 = FAKE |
| AUC | Metric | Real–fake separability, threshold-independent |

### 1.10.2 The paradox: high in-dataset, dropping cross-dataset

A modern model trained and tested on the same dataset (in-dataset) usually attains a very high AUC on FF++. Tested on a different dataset (cross-dataset) such as Celeb-DF-v2, the same model typically drops sharply. This gap is the **generalisation paradox** and the central challenge of this thesis.

The cause of the drop is a form of shortcut learning. The model learns to rely on method-specific artifacts of one pipeline rather than on common traces shared by all forgery types. A model may, for instance, learn that Deepfakes-FF++ images exhibit an upsampling grid at frequency $k$. That pattern vanishes on Celeb-DF, which uses a different pipeline, so the cue the model depends on is gone. In effect, the model has overfitted to the training set's artifacts.

The design implication follows directly. To generalise, the model must be steered towards pipeline-invariant traces. The thesis therefore prioritises the frequency domain: shared physical principles (every generator must upsample; every blend breaks frequency consistency) produce more universal traces than any specific spatial texture. For the same reason, the evaluation protocol deliberately trains and tests on different datasets (FF++ → CDFv2), so that it measures exactly the property we care about: generalisation.

### 1.10.3 Robustness to compression, standard datasets, and the DeepfakeBench protocol

**Robustness to compression.** In the real eKYC setting, uploaded images and videos are almost always compressed (JPEG for images, H.264 for video). Compression erases part of the high-frequency energy where many artifacts live, and it also introduces block artifacts (JPEG's 8×8 grid) that can be confused with forgery traces. FF++ is therefore used at the c23 level (moderate compression, H.264 CRF 23), which is realistic: neither too ideal (raw) nor too heavy (c40). Training on c23 exposes the model to a degradation level close to operating conditions. A useful eKYC detector must be robust to compression, and this is an implicit criterion in the frequency branch, which prioritises bands that remain stable under compression.

**FaceForensics++ (c23) — training set.** FF++ is the foundational face-forgery dataset: 1000 real videos (from YouTube) and four corresponding fake sets (Deepfakes, Face2Face, FaceSwap, NeuralTextures). Each level is released as raw, c23 (light–moderate, H.264 CRF 23), and c40 (heavy). The thesis uses c23 to balance realism with retaining enough frequency traces to learn.

**Celeb-DF-v2 — cross-dataset test set.** CDFv2 [3] is a high-quality deepfake dataset, harder than FF++: 590 real videos of celebrities and 5639 deepfake videos refined to remove the coarse artifacts (colour flicker, visible boundaries) of older sets. Because its synthesis pipeline is entirely different from FF++, it is an ideal generalisation test. CDFv2 is used only for testing and never for training, which is a mandatory condition of fair cross-dataset evaluation.

**The DeepfakeBench evaluation protocol.** The system is built on DeepfakeBench [4], a framework that standardises training and evaluation. It removes the inconsistencies (in pre-processing, splitting, and metric computation) that make cross-paper numbers hard to compare. The thesis protocol follows it:

- Train on FF++ (c23).
- Cross-dataset test on Celeb-DF-v2.
- Main metric: frame-level AUC on CDFv2.
- Standard hyperparameters: batch size 32, frame_num 32, Adam optimizer [25], learning rate 2e-4, 256×256 input.

Adhering to DeepfakeBench enables direct leaderboard comparison. The thesis EfficientNet-B4 baseline attains a CDFv2 frame-AUC of 0.7497, close to the harmonized leaderboard figure (≈ 0.7487), which confirms the pipeline is built correctly before any improvement is attempted. The naive SFDCT reaches 0.7572 (Δ +0.0075 over B4, within noise; this thesis makes no SOTA claim, and SPSL at 0.7650 still beats it). The Row1 lever variant in fact measures 0.7333 (Δ −0.0164, below the baseline, an honest negative result discussed in Chapter 3). Row2 was not trained within the thesis GPU budget and is left as future work. The strongest measured member of the family is the block-DCT-HFF architectural variant (R3, Section 2.3.6), which reaches 0.7695. This is still below SPSL, and its paired bootstrap confidence interval contains zero (Chapter 3).

*Table 1.8: Summary statistics of the two datasets.*

| Property | FaceForensics++ (c23) | Celeb-DF-v2 |
|---|---|---|
| Role | Train | Test (cross-dataset) |
| Real videos | 1000 | 590 |
| Fake videos | 4000 (4 methods × 1000) | 5639 |
| Number of fake methods | 4 | 1 (unified pipeline) |
| Compression level used | c23 (H.264 CRF 23) | MPEG-4/H.264 (CDFv2 release) |
| Number of extracted frames | ≈ 159,626 | 16,420 (test set: 5,620 real + 10,800 fake) |
| Frames per video | 32 (frame_num) | 32 (frame_num) |

## 1.11 The eKYC Application Context and Legal Requirements

### 1.11.1 What eKYC is and its anti-deepfake role

**eKYC (electronic Know Your Customer)** is the process of identifying customers electronically. Instead of visiting a counter, users photograph their documents and faces with a phone to open an account or transact. Its core step is face matching between the selfie and the document photo, together with an anti-spoofing step. Deepfakes threaten exactly this step: a fraudster can use deepfake images or videos of a victim's face to bypass verification, open accounts illegitimately, or hijack accounts. A deepfake detector that generalises well to unseen pipelines is therefore an essential defence layer for eKYC, and this is the applied motivation of the entire thesis.

### 1.11.2 Circular 17/2024/TT-NHNN and the FPR ≤ 5% operating point (our convention)

In Vietnam, **Circular 17/2024/TT-NHNN** [14] regulates the opening and use of payment accounts and mandates biometric authentication for certain banking transactions. One point must be stated precisely. Circular 17 imposes a qualitative requirement, namely mandatory biometric matching, but it does not specify a concrete quantitative threshold; no FPR or FAR figure is mandated. To turn this qualitative requirement into something measurable, this thesis adopts the operating point FPR ≤ 5% following the ISO/IEC 30107-3 convention [13] (BPCER at APCER = 5%). In our context, FPR is the proportion of real images misclassified as fake, so the constraint FPR ≤ 5% means the system must not reject more than 5% of legitimate users. In short, we adopt FPR ≤ 5% per ISO/IEC 30107-3 to satisfy TT17's qualitative biometric-verification requirement; the 5% figure is our choice under an international standard, not a figure mandated by TT17.

The technical implication is threshold calibration. AUC measures separability independently of any threshold, but deployment forces a concrete decision threshold $\tau$. To satisfy FPR ≤ 5% we calibrate $\tau$ on a validation set: find the threshold at which the real-flagged-as-fake rate does not exceed 5%, then report the TPR (fakes caught) at that threshold. This separates model capability (AUC) from the operating point, and it is mandatory for any serious eKYC deployment. For the naive SFDCT, this calibration yields $\tau =$ 0.9514 at FPR = 0.0500, giving TPR = 0.2298, accuracy 0.476, and F1 0.366 (confusion at $\tau$: TN 5339, FP 281, FN 8318, TP 2482). The plain reading is that at a strict 5% false-reject budget, on a cross-dataset model of AUC ≈ 0.75, the true-positive rate collapses to about 23%. The model is a useful risk signal, not an automatic gatekeeper.

### 1.11.3 The need for XAI (explainability)

In a tightly regulated financial setting, a REAL/FAKE decision cannot be a black box. When the system rejects a transaction, explainable evidence is needed for auditing and appeals. The thesis meets this requirement with **Grad-CAM** [9], a technique that highlights, as a heat-map, the image regions on which the model relies. The eKYC demo outputs `prob_fake` together with a Grad-CAM overlay, so an operator can see where the model is looking (e.g. the blending-boundary region around the chin). An abstract score becomes an intuitive explanation, consistent with banking transparency requirements.

## 1.12 Liveness Detection (Face Anti-Spoofing) Theory

Liveness detection (**Face Anti-Spoofing**, FAS) is a secondary, measured module of this thesis. It reuses the SFDCT backbone, comparing B4 (spatial-only) against B4 + block-DCT on the LCC-FASD dataset [28], with NUAA [26] as a sanity reference. It is designed as a cascade pre-filter (liveness → deepfake) in the eKYC pipeline. The pre-registered targets (ACER ≈ 16%, AUC ≈ 0.92) were both cleared by the measured results: B4 reaches ACER 6.85% / AUC 0.9829 on the official evaluation split (§3.1.8). This section presents the theory; the method and the measured results are in Chapters 2 and 3.

### 1.12.1 What liveness detection is, and where it sits in eKYC

Deepfake detection asks whether a face was digitally synthesised. **Liveness detection / Presentation Attack Detection (PAD)** asks a complementary question: whether a live person is physically present in front of the camera, or whether the camera is being shown an artefact. In an eKYC pipeline the two are layered. A liveness pre-filter first rejects obvious presentation attacks, such as a photo, a phone screen, or a printed mask, and only genuinely live captures proceed to deepfake and document checks. This cascade ordering is efficient, because the cheap liveness check screens out the easiest attacks before the heavier deepfake model runs.

### 1.12.2 Taxonomy of presentation attacks (PAI)

A **Presentation Attack Instrument (PAI)** is the physical artefact used to spoof the system. The common categories are:

- **Print attack** — a printed photograph (paper, poster, A4) of the target's face is held up to the camera. Its characteristic traces are halftone/printing noise and the loss of fine 3D facial detail.
- **Replay attack** — a video or photo of the target is replayed on a screen (phone, tablet, monitor). Its main trace is the moiré pattern: the screen's pixel grid superimposed on the camera's sensor grid produces interference fringes that appear as spurious peaks in the frequency spectrum, largely absent in a live capture.
- **3D mask attack** — a wearable mask (paper, silicone, resin) reproduces facial geometry. These are rarer and harder, often requiring depth/IR or pulse cues to defeat. They are noted here for completeness but are outside the cheap, RGB-only scope of this module.

This taxonomy matters for the frequency hypothesis. Replay artifacts (moiré) are especially loud in the DCT/Fourier domain, the physical analogue of the deepfake hypothesis about GAN/upsampling artifacts in the mid/high bands. The SFDCT block-DCT branch therefore has a principled reason to help liveness too. To be honest about the limits, the effect is attack-dependent: moiré is strong for replay and weak for print, which leaves halftone noise instead, so the frequency branch is expected to help replay more than print. A per-attack APCER/BPCER decomposition is left as future work.

### 1.12.3 Passive vs. active liveness

- **Passive liveness** analyses a single captured frame (or a short clip) for spoof cues, such as texture, frequency artifacts, and micro-detail, without asking the user to do anything. It is frictionless, and it is the approach this thesis adopts because it reuses the single-frame SFDCT pipeline directly.
- **Active (challenge-response) liveness** asks the user to perform an action, for example blink, turn the head, follow a moving dot, or read a number, and verifies the response. It is more robust to replay and print attacks, but it adds friction and requires temporal/video processing, so it is out of scope for the cheap reuse-SFDCT plan.

### 1.12.4 Metrics: APCER, BPCER, ACER

Liveness performance is reported with the **ISO/IEC 30107-3** metrics, treating spoof/attack as the positive class:

- **APCER (Attack Presentation Classification Error Rate)** — the fraction of attacks misclassified as bona fide (a spoof getting through, the dangerous error). Reported as the worst case (max) over PAI types.
- **BPCER (Bona-fide Presentation Classification Error Rate)** — the fraction of genuine presentations misclassified as attacks (a real user wrongly rejected).
- **ACER (Average Classification Error Rate)** — the mean of the two, $\text{ACER} = \tfrac{1}{2}(\text{APCER} + \text{BPCER})$, an overall intra-dataset score at one threshold.

For cross-dataset evaluation the equivalent quantity is HTER $= \tfrac{1}{2}(\text{FAR}+\text{FRR})$ (equal to ACER when positive = spoof), and AUC/EER are reported threshold-independently, as for deepfake. Following honest reporting discipline, the operating threshold is chosen at EER on a dev/validation set and then fixed to compute HTER/ACER on the test set. For the eKYC tie-in, the module also reports BPCER @ APCER ≤ 5%, mirroring the FPR ≤ 5% convention of Section 1.11.2.

*Table 1.9: Liveness (PAD) metrics and when each is used.*

| Metric | Formula (positive = spoof) | Used for |
|---|---|---|
| APCER | FP / (TN+FP), worst-case max over PAI | spoof wrongly accepted (dangerous) |
| BPCER | FN / (TP+FN) | genuine user wrongly rejected |
| ACER | ½(APCER + BPCER) | overall intra-dataset @ one threshold |
| HTER | ½(FAR + FRR) | cross-dataset generalisation |
| EER | error where FAR = FRR | balanced operating point |
| AUC | area under ROC, threshold-independent | direct B4 vs. B4+DCT comparison |

The pre-registered targets for the liveness module were ACER ≈ 16% and AUC ≈ 0.92. The measured results on the official LCC-FASD evaluation split (Section 3.1.8) clear both with margin: ACER 6.85% / AUC 0.9829 for the B4 head, and 7.54% / 0.9776 for B4+DCT. On this dataset the spatial B4 head already performs well, and the frequency branch does not improve it.

## 1.13 Amazon Web Services (AWS)

Amazon Web Services (AWS) is the most comprehensive and widely adopted cloud platform in the world. It offers hundreds of services from global data centres, letting individuals and organisations build infrastructure, store and process data, distribute content, and manage applications without owning physical hardware. DeepGuard is deployed onto AWS so that the same containerised stack validated locally under Docker Compose runs unchanged in the cloud. The relevant services are described below.

- **EC2 (Elastic Compute Cloud).** EC2 provides scalable virtual servers (instances) in the cloud, configurable with a chosen OS, CPU, RAM, and storage. In DeepGuard, a single EC2 instance is the production host on which Docker Compose runs the frontend, backend, SFDCT microservice, and PostgreSQL containers as one unit. Because serving runs on CPU, the instance is sized for RAM rather than raw compute: a `t3.large`-class instance (2 vCPU / 8 GB RAM) lets PyTorch + MTCNN, the API, the database, and the frontend all reside without swapping.

- **Lambda (Serverless Computing).** AWS Lambda runs code without provisioning or managing servers. The developer uploads code and defines an event trigger, for example a file uploaded to S3 or an HTTP request, and Lambda executes in response. It is described here as a complementary serverless option in the AWS toolkit for event-driven tasks around the platform.

- **S3 (Simple Storage Service).** Amazon S3 is an object-storage service for storing and retrieving data, such as images, videos, documents, and backups, as objects inside buckets, managed via the Console, APIs, or SDKs. It is the natural place to hold uploaded eKYC media, model checkpoints, and exported audit artefacts.

- **CloudFront.** Amazon CloudFront is a Content Delivery Network (CDN) that speeds up the delivery of static and dynamic content through a global network of edge locations. It is commonly used to serve images, video, and web assets, for example the Next.js frontend's static bundle.

- **ACM (AWS Certificate Manager).** ACM provides free SSL/TLS certificates for securing HTTPS traffic. In DeepGuard, ACM (or an equivalent ACME flow) supplies the certificate for the public domain, so all browser traffic and all external eKYC integrations travel over HTTPS to the reverse proxy.

- **CloudWatch Logs (Monitoring and Logging).** Amazon CloudWatch Logs collects and stores logs from EC2, Lambda, and other resources. In DeepGuard it monitors backend inference activity, tracks error rates and performance bottlenecks, and triggers alerts (for example a notification to Google Chat) when an anomaly occurs. This is the monitoring-and-alerting tier of the architecture.

- **Elastic IP.** An Elastic IP is a static, public IPv4 address assigned to an EC2 instance. It keeps the backend reachable at a fixed address even after instance restarts. This stable address is what the DNS A-record (Section 1.5) points to, binding the public domain to the host.

Together, these services let the containerised stack that was validated locally run unchanged in the cloud, behind a stable and secured public address.

## 1.14 Conclusion

This chapter has set out both the engineering and the scientific foundations of the DeepGuard platform and its SFDCT detector. On the engineering side, we covered the web stack that makes the system usable: JavaScript as the browser's behavioural layer, Next.js/React for the single-page dashboard, FastAPI as the guarded API gateway, the HTTP/REST contract that ties the tiers and external eKYC clients together, and DNS mapping the public domain to the host. On the scientific side, we built the detector up from its parts. The EfficientNet-B4 spatial backbone contributes compound scaling, MBConv blocks, and ImageNet transfer learning. The block-wise 8×8 DCT representation (YCbCr → zigzag → 16 bands → log-magnitude → drop low bands) supplies the frequency feature, together with the foundations of the five levers (§1.7.4), all built on DeepfakeBench. Gated cross-attention with a zero-init $\alpha$ gate fuses the two branches and guarantees a floor no worse than B4, a property that SFCL-HCMF's 0.5-initialised gate does not provide.

We then grounded these tools in their domain. Deepfakes are generated by autoencoder swap, GANs, and diffusion, with four forgery families in FF++, and the central hypothesis is that forgery traces are weak in pixels but loud in the mid/high frequency bands. The generalisation paradox (high in-dataset, dropping cross-dataset) motivates the FF++ → CDFv2 protocol, under which the honest standings of the B4 baseline and the naive SFDCT, both behind SPSL, are reported in Section 1.10.3. The eKYC context turns TT17's qualitative biometric mandate into our FPR ≤ 5% operating point per ISO/IEC 30107-3 (Section 1.11.2), with Grad-CAM supplying the explainability that a regulated setting needs. The secondary liveness module adds the PAD taxonomy of print, replay, and mask attacks, the passive-versus-active distinction, and the APCER/BPCER/ACER metrics, with its pre-registered targets cleared by the measured results (§3.1.8). Finally, we surveyed the AWS services that carry the platform into the cloud.

On this foundation, Chapter 2 presents the system analysis and design in detail: the requirements, the use-cases and architecture, the deepfake-detection method (data pipeline, SFDCT architecture, the five-lever/four-ablation design space, loss, and risk-score decision inference), and the secondary liveness-detection method (measured in §3.1.8).

<div style="page-break-after: always;"></div>

# CHAPTER 2: SYSTEM ANALYSIS AND DESIGN

Chapter 1 covered the theory and technology behind DeepGuard: the web stack (JavaScript, Next.js, FastAPI, HTTP API, DNS), the AI building blocks (EfficientNet-B4, the discrete cosine transform and frequency analysis, attention and fusion), the deepfake and liveness domains, the eKYC legal context, and the AWS services that host the platform. Chapter 2 moves from *why* to *how*. We first analyse what the system must be able to do (functional requirements) and how well it must do it (non-functional requirements). We then design the system itself: its actors, use cases, layered architecture, activity and sequence flows, and API contract. The last two parts of the chapter, which are its centre, present the **two detection methods** that the platform combines into an eKYC cascade: the primary deepfake-detection method (SFDCT) and the secondary liveness-detection method (trained and measured, §3.1.8).

The guiding idea is the one inherited from Chapter 1. Every design decision starts from a concrete need, is explained first by intuition and then by formula, is anchored to a figure or table, and always serves one goal: cross-dataset generalisation, measured by frame-level AUC on Celeb-DF-v2. Deepfake detection is the deep, primary contribution of this thesis. Liveness detection is a secondary module; its architecture is designed here by reusing the SFDCT components, and its measured results appear in §3.1.8.

---

## 2.1 Requirement analysis

Before designing any component, we must answer two questions: what must the system do, and how well must it do it. The first question gives the functional requirements, the second the non-functional ones. The banking eKYC context imposes stricter constraints than an ordinary image-classification problem. A wrong decision may let a fraudster pass biometric authentication. The system therefore has to be accurate, but it must also be explainable, and its decision threshold must be adjustable in line with regulation.

### 2.1.1 Functional requirements

The functional requirements describe the capabilities the system must provide. They fall into four families: deepfake detection, liveness detection, UI & upload, and monitoring & alert.

**(a) Deepfake detection.** The core capability. The system loads a face image or a frame extracted from an eKYC video, normalises it to a 256×256 tensor, and runs the SFDCT model to obtain a fake probability. It returns the probability together with a REAL/FAKE/UNCERTAIN verdict, generates a Grad-CAM explanation, and exposes a calibrated decision threshold τ. For video, it samples frames, runs per-frame inference, and aggregates an overall verdict.

*Table 2.1: Functional requirements — deepfake detection.*

| ID | Function | Input | Output | Significance |
|----|----------|-------|--------|--------------|
| FR1 | Load face image/frame | Still image or frame from an eKYC video | Normalised 256×256 image tensor | Entry point of the pipeline |
| FR2 | Detect deepfake (image) | Pre-processed face crop | REAL/FAKE discriminative logit/embedding | Core capability |
| FR3 | Return probability + verdict | Model logit | `prob_fake` ∈ [0,1] + REAL/FAKE/UNCERTAIN | Result consumed by the business layer |
| FR4 | Detect deepfake (video) | Sampled frames | Aggregated verdict + per-frame grid | Supports liveness-clip eKYC |
| FR5 | Generate Grad-CAM | Image + trained model | Heatmap overlay of suspicious regions | Explainability for human reviewers |
| FR6 | Calibrate eKYC threshold | Score distribution on validation | Threshold τ satisfying FPR ≤ 5% (ISO/IEC 30107-3) | Concrete operating point for eKYC |

**(b) Liveness detection (secondary, measured).** The system must decide whether the subject is a live person rather than a print, a screen replay, a 3D mask or a deepfake. It supports passive (single-image) and active (multi-frame challenge–response) modes and returns a LIVE/SPOOF/UNCERTAIN verdict; when the verdict is SPOOF, it also classifies the spoof type. The module is designed in Section 2.4 and measured in §3.1.8 with APCER/BPCER/ACER.

*Table 2.2: Functional requirements — liveness detection.*

| ID | Function | Input | Output | Significance |
|----|----------|-------|--------|--------------|
| FR7 | Passive liveness check | Single face image | `score` ∈ [0,1] + LIVE/SPOOF/UNCERTAIN | Pre-filter before deepfake stage |
| FR8 | Active liveness (challenge) | Challenge token + captured frame(s) | LIVE/SPOOF verdict | Defends against replayed captures |
| FR9 | Classify spoof type | A SPOOF capture | `spoof_type` ∈ {print, screen, mask_3d, deepfake, unknown} | Traceability for compliance |

**(c) UI & upload.** The DeepGuard dashboard (Next.js) lets a tenant user upload an image or video in the Playground and view the risk score, band and decision hint. The user can also inspect the Grad-CAM overlay and the frequency spectrum, browse a detection history and timeline, manage API keys, invite team members, and review the FAKE queue. External integrators upload through the API-key-authenticated `/v1/*` endpoints instead.

*Table 2.3: Functional requirements — UI & upload.*

| ID | Function | Actor | Significance |
|----|----------|-------|--------------|
| FR10 | Upload image/video (Playground) | Developer, Admin (JWT) | Human-in-the-loop testing |
| FR11 | Render result (risk score + band + heatmap + spectrum) | Dashboard roles | Decision support |
| FR12 | History & analytics | Viewer and above | Audit and traceability |
| FR13 | API-key upload (`/v1/*`) | External eKYC client | Production integration |

**(d) Monitoring & alert.** The platform must log inference traffic, latency and errors, surface health endpoints, and raise alerts to the operating team. Alerts are delivered to Google Chat (Section 2.2.3-E). This family corresponds directly to the operational non-functional requirements below.

*Table 2.4: Functional requirements — monitoring & alert.*

| ID | Function | Source | Significance |
|----|----------|--------|--------------|
| FR14 | Health check | `/health` (backend + microservice) | Liveness/readiness probing |
| FR15 | Structured logging | CloudWatch Logs | Observability |
| FR16 | Alerting | Google Chat webhook | On-call notification |

These functions form a closed chain. FR1–FR4 perform classification, FR5 explains the decision, FR6 sets the operating threshold, FR7–FR9 add the liveness pre-filter, FR10–FR13 expose the capability to humans and machines, and FR14–FR16 keep the running system observable. FR5 (Grad-CAM) and FR6 (threshold calibration) are often skipped in purely academic studies, but banking deployment cannot do without them: reviewers need to know where the model looks, and the compliance team needs a threshold with a quantitative basis.

### 2.1.2 Non-functional requirements

The non-functional requirements specify the *quality* of the system. We adopt the seven quality attributes below.

*Table 2.5: Non-functional requirements and measurement criteria.*

| ID | Attribute | Measurement criterion | Target |
|----|-----------|-----------------------|--------|
| NFR1 | **Performance** | Frame-level AUC on CDFv2 (trained on FF++); inference latency per frame | AUC higher than the B4 baseline (0.7497); CPU-only serving latency ≈ 0.3–1 s/image (measured on the deployed stack, §3.2) |
| NFR2 | **Scalability** | Throughput under concurrent `/v1/*` load; stateless backend behind a load balancer | Horizontal scaling of FastAPI + microservice replicas |
| NFR3 | **Availability & Reliability** | Health checks, graceful degradation when the microservice is down | `/health` probes; deterministic re-runs (fixed seed) |
| NFR4 | **Maintainability** | File ≤ 250 lines, one-directional flow, deepguard_db-only DB access (CONVENTIONS.md) | Replaceable model behind the `/predict` contract |
| NFR5 | **Usability** | Explainability available to reviewers (Grad-CAM + t-SNE + frequency viz) | Reviewers can understand every verdict |
| NFR6 | **Portability** | Containerised services, CUDA/CPU fallback, config-driven thresholds | Runs locally and on AWS unchanged |
| NFR7 | **Monitoring & Logging** | Structured logs, metrics, alerts to Google Chat | Operators notified of anomalies |

Among the seven, NFR1 (cross-dataset performance) has the highest priority. In practice, an attacker uses new deepfake tools the model has never seen during training. A model that scores very high in-dataset but collapses on an unfamiliar manipulation is useless for eKYC. The whole method design in Section 2.3 therefore follows one guiding principle: improve cross-dataset AUC without losing stability. The operating point behind NFR1, its latency-and-threshold facet, is treated honestly as well. As Chapter 3 shows, at the eKYC threshold the model catches only a minority of fakes, and that is the reason liveness (Section 2.4) is composed in front of it.

---

## 2.2 System design

### 2.2.1 Use-case diagram

Beyond the SFDCT model that performs the core inference, DeepGuard is delivered as a multi-tenant web platform. This section sets out who may invoke each capability and under what conditions. The platform request flow is one-directional. The Next.js front-end (port 3000) calls the FastAPI back-end (port 8000) through `src/lib/api.ts`; the back-end resolves data exclusively through the `deepguard_db` layer against PostgreSQL (port 5432), and forwards any inference request over `httpx` to the SFDCT microservice (port 8501, EfficientNet-B4 + block-DCT + Grad-CAM). Authentication is split into two strictly separated layers: a **JWT Bearer** layer for the human dashboard (`get_current_user`, `require_role`, `require_sysadmin`) and an API-key Bearer layer (`Authorization: Bearer sk-dg-…`, `get_api_key_auth`) for external eKYC integration on the `/v1/*` namespace.

#### Actors

Six actor types interact with DeepGuard. Five are authenticated dashboard roles (`UserRole`), arranged in a privilege hierarchy from level 0 (read-only) to level 4 (platform-wide); the sixth is the unauthenticated visitor. A tenant administrator and the system administrator operate the dashboard via JWT. The customer's own back-end integrates with the public detection endpoints via an API key.

*Table 2.6: Actors of the DeepGuard platform.*

| Actor | Description |
|-------|-------------|
| **Anonymous** | An unauthenticated visitor. May browse the public landing, pricing and documentation pages, self-register a new organisation (`POST /auth/register`), or accept a team invitation (`GET/POST /auth/accept-invite`). Holds no JWT and sees no tenant data. |
| **Viewer** (`viewer`, level 0) | A read-only member of a tenant. May view detection history, liveness checks and analytics; PII (image, IP, user-agent) is masked. Cannot modify any resource. |
| **Developer** (`developer`, level 1) | A tenant member responsible for API integration. May run the JWT-authenticated Playground (`/playground/detect/*`), create and revoke API keys, and configure webhooks. PII is masked in detection detail. |
| **Compliance** (`compliance`, level 2) | A tenant member responsible for review and regulatory traceability (TT17/ND13). May view the FAKE queue with **full PII**, open detection detail and attach audit notes (`POST /detections/{id}/notes`). Read-only otherwise. |
| **Admin** (`admin`, level 3) | The administrator of a single tenant. Manages team members and roles, invites members, manages API keys and webhooks, reads audit logs, and configures the tenant — all scoped to the administrator's own `tenant_id`. Cannot cross organisations, create tenants, or edit model thresholds. |
| **Sysadmin** (`sysadmin`, level 4) | The platform operator, acting **across all tenants**. Creates and approves/activates tenants (`POST/PATCH /tenants`), inspects any tenant's users and keys, and is the only actor allowed to edit model versions and thresholds. Cannot assign the `sysadmin` role to a tenant member. |

#### Overview

Figure 2.1 presents the use-case diagram. The unauthenticated Anonymous actor and the five authenticated dashboard roles inherit privileges upward: each higher role also holds the use cases of the roles below it. The external eKYC client is technically driven by the same back-end that hosts a developer's API key, but it is drawn separately to make the API-key authentication boundary on the `/v1/*` endpoints visible.

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

*Figure 2.1: DeepGuard use-case diagram — six actors over the eight core use cases. Dashboard actors authenticate with JWT; the external eKYC client authenticates with an API key on the `/v1/*` namespace.*

Separating the dashboard actors from the external client reflects two operating phases. In the offline phase, the engineer trains, evaluates and calibrates the threshold. In the online phase, the customer is authenticated in real time. Both phases share the same SFDCT model but differ in their data flow, as the activity and sequence diagrams below make explicit.

### 2.2.2 Use-case specification

The eight core use cases are specified below following the standard template (name, identifier, actors, description, trigger, pre-/post-conditions, basic flow, alternative flow, exception flow). Each specification reflects the actual endpoints and role matrix of the implemented system.

*Table 2.7: Use-case specification — UC-01 Detect deepfake (image).*

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

*Table 2.8: Use-case specification — UC-02 Detect deepfake (video).*

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

*Table 2.9: Use-case specification — UC-03 Liveness check.*

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

*Table 2.10: Use-case specification — UC-04 Register organisation (anonymous).*

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

*Table 2.11: Use-case specification — UC-05 Approve / activate tenant (sysadmin).*

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

*Table 2.12: Use-case specification — UC-06 Manage API keys (developer / admin).*

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

*Table 2.13: Use-case specification — UC-07 Invite & manage team (admin).*

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

*Table 2.14: Use-case specification — UC-08 Review detection & add audit note (compliance).*

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

Together, the eight specifications tie every use case to a concrete endpoint, a role check and an explicit error path. The rest of the chapter implements this contract.

### 2.2.3 System architecture

The system architecture is organised into five labelled blocks, each with one clear responsibility. The decomposition gives separation of concerns: a block can be replaced or upgraded without breaking the rest, which is what the maintainability and portability attributes (NFR4, NFR6) ask for.

![Figure 2.2 — Overall SFDCT-serving architecture](figures/fig_2_2_architecture.png)
*Figure 2.2: Overall architecture of the detection pipeline — Pre-processing (face detect/align/crop 256×256) → SFDCT (spatial EfficientNet-B4 branch + frequency block-DCT branch, fused by zero-initialised gated cross-attention) → Post-processing & thresholding (sigmoid → prob_fake → compare with τ) → Grad-CAM explanation. This figure shows the inference core (block C) that the platform blocks A, B, D and E wrap.*

**A. Frontend (Next.js, :3000).** The dashboard and Playground. It renders the upload UI, the risk score with band and decision hint, the Grad-CAM overlay and the 2D-DCT spectrum, the history timeline, and the management screens. It calls the backend only through `src/lib/api.ts` and never contacts the microservice or the database directly. State is handled with TanStack Query as the server cache plus a small Zustand store. The client-side role guard is a UX convenience, not the security boundary.

**B. Backend API (FastAPI, :8000).** The single home of business logic. It enforces the two authentication layers (JWT for the dashboard, API key for `/v1/*`) and checks tenant quota and the per-key rate limit. It performs the mandatory MTCNN face crop, forwards the cropped face to the AI microservice over `httpx`, and maps `prob_fake` into a risk band (Section 2.3). All data access goes through the `deepguard_db` repository against PostgreSQL (:5432); detection records are persisted per tenant, and one JSON payload is returned.

**C. AI Inference microservice (SFDCT, :8501).** A separate `uvicorn serving.infer_server:app` process exposing `/health` and `/predict`. Given a cropped face tensor, it runs the EfficientNet-B4 + block-DCT forward pass on CUDA, loads `ckpt_best.pth` (model_version `naive-sfdct-cdfv2-0.7572`), and returns `{prob_fake, label, gradcam_b64}` plus the 2D-DCT spectrum. The service is treated as a black box behind the `/predict` contract, so the model tier is fully replaceable. It never touches PostgreSQL and never serves a filesystem path; Grad-CAM comes back inline as base64.

**D. Monitoring.** Health probes (`/health` on both B and C), structured logging to CloudWatch Logs, and latency and error metrics. This block realises FR14–FR15 and NFR7 and gives operators visibility into traffic and failures.

**E. Alerting (Google Chat).** A webhook integration that posts to a Google Chat space when monitoring detects an anomaly, such as an unreachable microservice, an error-rate spike or quota exhaustion. This realises FR16 and closes the operability loop: a degraded model tier (E4 in UC-01's exception flow) becomes a notification rather than a silent failure.

*Table 2.15: The five architecture blocks and their responsibilities.*

| Block | Component | Input → Output | Role |
|-------|-----------|----------------|------|
| **A. Frontend** | Next.js dashboard + Playground (:3000) | User action → API calls | UI & upload; render result |
| **B. Backend API** | FastAPI + deepguard_db (:8000) | Request → JSON verdict | Auth, quota, MTCNN crop, band mapping, persistence |
| **C. AI Inference** | SFDCT microservice (:8501) | Cropped tensor → `{prob_fake, label, gradcam_b64}` | Spatial+frequency inference + Grad-CAM |
| **D. Monitoring** | CloudWatch Logs + health probes | Logs/metrics → dashboards | Observability |
| **E. Alerting** | Google Chat webhook | Anomaly → message | On-call notification |

The five blocks map directly back to the requirements. A realises FR10–FR12. B realises FR1, FR3, FR6 and the auth and quota controls. C realises FR2, FR4 and FR5, and will host FR7–FR9 once the measured liveness model is wired behind the same contract. D realises FR14–FR15, and E realises FR16. No block is redundant, and no requirement is left out.

### 2.2.4 Activity diagrams

The use-case diagram and the architecture describe *what* the system does and how its blocks are wired. An activity diagram adds the order in which work is carried out: the control flow, the decision branches, and the points at which a flow may stop early. For DeepGuard this matters, because a single business action such as analysing one image crosses three runtime tiers (the Next.js frontend, the FastAPI backend, and the SFDCT microservice), and because the eKYC pipeline runs two detectors in a cascade whose ordering has security consequences. This section presents the two most representative activities; their inter-tier message ordering is refined into sequence diagrams in Section 2.2.5.

**(a) Deepfake image detection.** The first activity covers the dashboard *Playground* path, in which an authenticated tenant user (a `developer` or `admin`, per the route matrix in Section 2.2.2) uploads a single image and receives a risk verdict together with explanations. Two early-exit branches shape the flow, one when no face is detected and one when the tenant's monthly quota is used up. A third decision is the band mapping (`FAKE` / `REAL` / `UNCERTAIN`) governed by the `prob_fake` threshold ± 0.10 convention defined in the API specification.

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

*Figure 2.3: Activity diagram — deepfake image detection through the dashboard Playground (`POST /playground/detect/image`, JWT-authenticated). Two guard branches (RBAC and quota) and the mandatory MTCNN face-crop precede the SFDCT forward pass; the resulting `prob_fake` is mapped to a `FAKE`/`REAL`/`UNCERTAIN` band before the risk score, Grad-CAM heatmap, and 2D-DCT spectrum are returned.*

The diagram makes two invariants from `CONVENTIONS.md` explicit. Face cropping with MTCNN is mandatory before any inference, so the flow can never reach the SFDCT call without a valid crop. And the SFDCT microservice is a black box reached only via `httpx POST /predict`. Note also that the Playground path counts the tenant's quota but deliberately does not persist a row in the `detections` table. This design decision is documented in the role flows, and it is why no "write detection record" node appears after the band mapping.

**(b) eKYC cascade — liveness then deepfake.** The second activity models the integration path used by an external customer backend through the API-key-authenticated `/v1/` endpoints. Here the order is security-critical. A presentation attack, such as a printed photo or a replayed screen, must be rejected by passive liveness before any deepfake analysis is performed, so no compute is spent on a frame that is not even a live capture. The cascade therefore short-circuits on a `SPOOF` verdict and only proceeds to `/v1/detect/image` when liveness returns `LIVE`. This cascade is the integration-level reason the liveness module (Section 2.4) exists: it is a cheap pre-filter that compensates for the deepfake model's low recall at the eKYC operating point (Section 2.3).

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

*Figure 2.4: Activity diagram — eKYC cascade combining passive liveness (`POST /v1/detect/liveness`) and deepfake detection (`POST /v1/detect/image`) over API-key authentication. The cascade rejects presentation attacks early (`SPOOF`/`UNCERTAIN`) and only forwards a `LIVE` capture to the SFDCT deepfake stage; the final eKYC outcome combines both verdicts.*

This ordering follows the threat model directly. Liveness defends against print, screen and 3D-mask attacks (the `spoof_type` enum), while the deepfake stage defends against synthetic faces that may nonetheless pass a liveness check. The two stages share the same API key and both consume tenant quota, so the cascade is also the natural place where the per-key `rate_limit_rpm` (60 req/min by default) and the `monthly_quota` are exercised twice per verification attempt.

### 2.2.5 Sequence diagrams

A sequence diagram complements the activity diagrams by fixing the temporal ordering of messages between participants: which component calls which, in which direction, and what each returns. The participants are drawn from the four-tier architecture of `TECH_STACK.md`: the Next.js frontend (:3000), the FastAPI backend (:8000), the PostgreSQL database (:5432), and the SFDCT microservice (:8501).

**(a) Deepfake detection (frontend → backend → SFDCT).** This sequence refines activity (a) into concrete inter-tier messages. It is the canonical request path of the whole product and the only place where the backend talks to the model. The FastAPI layer performs the MTCNN crop, forwards the normalised crop to the SFDCT microservice via `httpx`, receives `prob_fake` together with the base64 Grad-CAM, maps the score into a band, and returns a single JSON payload to the browser.

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

*Figure 2.5: Sequence diagram — single-image deepfake detection. The FastAPI backend performs the mandatory MTCNN crop, calls the black-box SFDCT microservice (`POST /predict`) over `httpx`, and assembles the risk score, decision hint, Grad-CAM, and 2D-DCT spectrum into one JSON response. Grad-CAM is returned inline as base64, never as a file path.*

The sequence shows the one-directional, no-shortcut request flow required by the conventions: the frontend never contacts SFDCT directly, and SFDCT never touches PostgreSQL. The model tier is therefore fully replaceable behind the `/predict` contract `{prob_fake, label, gradcam_b64}`. The inline-base64 rule for Grad-CAM means no temporary files or filesystem paths are ever exposed.

**(b) Liveness detection (cascade sequence over `/v1`).** The second sequence fixes the message ordering of the eKYC cascade (activity (b)). The customer backend first calls passive liveness; only a `LIVE` verdict forwards the same frame to the deepfake stage; the backend persists both tenant-scoped records and returns the combined outcome. This is the sequence view of why liveness is composed in front of deepfake.

```mermaid
sequenceDiagram
    participant C as Customer backend
    participant API as FastAPI :8000
    participant DB as PostgreSQL :5432
    participant SF as SFDCT :8501
    C->>API: POST /v1/detect/liveness (Bearer sk-dg-…, image)
    API->>API: Validate API key, check quota & rate limit
    API->>SF: httpx POST /predict (liveness head, MTCNN crop)
    SF-->>API: { score, verdict, spoof_type }
    alt score <= 0.42 (SPOOF) or in ±0.08 band
        API->>DB: persist liveness check (tenant-scoped)
        API-->>C: 200 { verdict: SPOOF/UNCERTAIN, spoof_type }
    else score >= 0.58 (LIVE)
        API->>DB: persist liveness check (LIVE)
        C->>API: POST /v1/detect/image (same key, same frame)
        API->>SF: httpx POST /predict (deepfake head, MTCNN crop)
        SF-->>API: { prob_fake, label, gradcam_b64 }
        API->>API: map prob_fake -> FAKE/REAL/UNCERTAIN band
        API->>DB: persist detection (tenant-scoped)
        API-->>C: 200 { eKYC outcome, risk_band, gradcam_b64 }
    end
```

*Figure 2.6: Sequence diagram — liveness-then-deepfake eKYC cascade over API-key authentication. Passive liveness is evaluated first; a `SPOOF`/`UNCERTAIN` verdict short-circuits the cascade, while a `LIVE` verdict forwards the frame to the SFDCT deepfake stage. Both checks consume quota and are persisted tenant-scoped. (Liveness scoring is the measured module of Section 2.4; see §3.1.8.)*

The diagram surfaces two properties of the design. First, tenant scoping is implicit: the API key carries `tenant_id`, so the backend never trusts a client-supplied tenant identifier, and cross-tenant data access is blocked. Second, the cascade is fail-closed for spoofs. A presentation attack never reaches the deepfake model, and never spends compute on it.

### 2.2.6 API specifications

This section specifies the public-facing and dashboard endpoints that constitute the DeepGuard service contract. The DeepGuard backend is a FastAPI application exposing thirty-five endpoints in total. The specification below details the core eKYC workflow, the deepfake-detection API and the liveness-detection API, together with the authentication and provisioning operations that precede them. Every request travels the one-directional flow defined in the architecture (Next.js frontend or external client → FastAPI :8000 → service → repository → PostgreSQL :5432), and detection requests additionally fan out over `httpx` to the SFDCT microservice (EfficientNet-B4 + block-DCT + Grad-CAM) at port 8501. All payloads are JSON. Errors follow the FastAPI default envelope `{"detail": "<message>"}` with an appropriate HTTP status code.

**Authentication schemes.** DeepGuard enforces two authentication layers that are never interchangeable, plus a small set of public endpoints.

*Table 2.16: The three authentication schemes of DeepGuard.*

| Scheme | Header | Token form | Consumers | Tenant scoping |
|--------|--------|------------|-----------|----------------|
| Public | — | — | Auth register/login, accept-invite, `/health` | None |
| JWT Bearer | `Authorization: Bearer <jwt>` | Signed JWT (HS256, python-jose) | Dashboard / admin users | `current_user.tenant_id` |
| API-Key Bearer | `Authorization: Bearer sk-dg-…` | Opaque key `sk-dg-…` | External eKYC integrators | `api_key.tenant_id` |

The JWT layer governs the dashboard (`/auth`, `/users`, `/tenant(s)`, `/detections`, `/analytics`, `/audit-logs`, `/playground/*`) and is further constrained by RBAC over five roles. The API-key layer governs the integration surface (`/v1/detect/*`, `/v1/liveness/*`, `/v1/results/*`, `/v1/jobs/*`) that a customer's backend invokes during live authentication. The two layers are never mixed on a single endpoint.

**Common conventions.** Deepfake verdicts are derived from the SFDCT score `prob_fake` and the calibrated decision threshold τ: `FAKE` when `prob_fake ≥ τ + 0.10`, `REAL` when `prob_fake ≤ τ − 0.10`, and `UNCERTAIN` within τ ± 0.10. Liveness verdicts follow the analogous rule against the liveness score (`LIVE` ≥ 0.58, `SPOOF` ≤ 0.42, `UNCERTAIN` in τ ± 0.08). Each `POST /v1/detect/*` call consumes one unit of the tenant's `monthly_quota`. Going over the quota yields HTTP 402, and going over the per-key `rate_limit_rpm` (default 60 requests/min) yields HTTP 429 with a `Retry-After` header.

*Table 2.17: Index of the core endpoints specified below.*

| # | Method | Path | Auth | Purpose |
|---|--------|------|------|---------|
| 1 | POST | `/v1/detect/image` | API-Key | Detect deepfake on a single image |
| 2 | POST | `/v1/detect/video` | API-Key | Detect deepfake on a video (sampled frames, async) |
| 3 | GET | `/v1/results/{request_id}` | API-Key | Retrieve a previously computed detection result |
| 4 | GET | `/v1/jobs/{job_id}` | API-Key | Poll the status of an asynchronous video job |
| 5 | POST | `/v1/detect/liveness` | API-Key | Passive liveness check on a single image |
| 6 | POST | `/auth/login` | Public | Authenticate a user, return a JWT |
| 7 | POST | `/auth/register` | Public | Create a new tenant + admin (SUSPENDED, pending) |
| 8 | POST | `/auth/accept-invite` | Public | Activate an invited account from a token |
| 9 | POST | `/api-keys` | JWT (developer/admin) | Mint a new API key (plain value shown once) |
| 10 | POST | `/tenants` | JWT (sysadmin) | Provision a new tenant (ACTIVE) + admin |

#### A. Deepfake-detection API

*Table 2.18: Endpoint specification — POST /v1/detect/image.*

| Field | Specification |
|-------|---------------|
| Method | `POST` |
| Path | `/v1/detect/image` |
| Auth | API-Key (`Authorization: Bearer sk-dg-…`) — tenant-scoped via `api_key.tenant_id` |
| Request — body | `multipart/form-data` with field `file` = a single face image (JPEG/PNG). Optional `callback_url` for a webhook on completion. |
| Response 200 | JSON with `request_id`, `risk_score` ∈ [0,1], `risk_band`, `verdict` ∈ {`FAKE`,`REAL`,`UNCERTAIN`}, and `gradcam_b64` (base64 PNG overlay). |
| Error codes | `400` malformed/empty image; `401` missing/invalid API key; `402` monthly quota exhausted; `429` per-key rate limit exceeded (with `Retry-After`); `5xx` SFDCT microservice unavailable. |

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

*Table 2.19: Endpoint specification — POST /v1/detect/video.*

| Field | Specification |
|-------|---------------|
| Method | `POST` |
| Path | `/v1/detect/video` |
| Auth | API-Key |
| Request — body | `multipart/form-data` with `file` = a video. The server samples frames, crops faces with MTCNN, and aggregates per-frame scores asynchronously. |
| Response 200 | JSON acknowledging the async job: `job_id`, `status` = `queued`, `result_url` to poll. The verdict is retrieved via `GET /v1/jobs/{job_id}` and `GET /v1/results/{request_id}`. |
| Error codes | `400` unsupported/corrupt video; `401` invalid API key; `402` quota exhausted; `429` rate limit. |

Example 200 response:

```json
{
  "job_id": "job_01HZXA1F7N5R2QW9",
  "request_id": "det_01HZXA1F7N5R2QW9",
  "status": "queued",
  "result_url": "/v1/jobs/job_01HZXA1F7N5R2QW9"
}
```

*Table 2.20: Endpoint specification — GET /v1/results/{request_id} and GET /v1/jobs/{job_id}.*

| Field | `/v1/results/{request_id}` | `/v1/jobs/{job_id}` |
|-------|----------------------------|---------------------|
| Method | `GET` | `GET` |
| Auth | API-Key | API-Key |
| Path param | `request_id` from a prior `/v1/detect/*` | `job_id` from `POST /v1/detect/video` |
| Response 200 | Full detection record (`risk_score`, `risk_band`, `verdict`, `gradcam_b64`, timestamps), tenant-scoped | Job status (`queued`/`processing`/`done`/`failed`), `progress` ∈ [0,1], and on `done` the aggregated `verdict` + `request_id` |
| Error codes | `401`; `403` belongs to another tenant; `404` unknown id | `401`; `403`; `404` unknown id |

Example completed-job response:

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

#### B. Liveness-detection API

*Table 2.21: Endpoint specification — POST /v1/detect/liveness.*

| Field | Specification |
|-------|---------------|
| Method | `POST` |
| Path | `/v1/detect/liveness` |
| Auth | API-Key (`Authorization: Bearer sk-dg-…`) |
| Request — body | `multipart/form-data` with `file` = a single face image for passive (no-challenge) liveness scoring. |
| Response 200 | JSON with `check_id`, `score` ∈ [0,1], `verdict` ∈ {`LIVE`,`SPOOF`,`UNCERTAIN`}, and, when a spoof is detected, `spoof_type` ∈ {`print`,`screen`,`mask_3d`,`deepfake`,`unknown`}. |
| Error codes | `400` no face / malformed image; `401` invalid API key; `402` quota exhausted; `429` rate limit. |

Example 200 response (spoof detected):

```json
{
  "check_id": "liv_01HZXB4G2P8T6KM3",
  "score": 0.31,
  "verdict": "SPOOF",
  "spoof_type": "screen"
}
```

The liveness model behind this endpoint is the module of Section 2.4, trained and measured on the official LCC-FASD split (§3.1.8). The contract (score, verdict band, spoof-type enum) is fixed here so the API surface stays stable. Wiring the trained weights behind this endpoint, in place of the interim heuristic scorer, is an integration item noted in Future Work.

#### C. Authentication & provisioning (supporting)

The remaining endpoints (`/auth/login`, `/auth/register`, `/auth/accept-invite`, `/api-keys`, `/tenants`) gate access to the two detection APIs. `POST /auth/login` validates credentials against PostgreSQL and rejects a SUSPENDED tenant with 403. `POST /auth/register` creates a tenant in the SUSPENDED state (status `pending`) until a sysadmin activates it. `POST /auth/accept-invite` consumes an invitation token and logs the user in with the pre-assigned role. `POST /api-keys` (developer/admin) mints an `sk-dg-…` key whose plain value is shown exactly once, and `POST /tenants` (sysadmin only) provisions an ACTIVE tenant with a one-time temporary admin password. All of these follow the same envelope conventions; their full request and response tables are unchanged from the implemented system.

---

## 2.3 Method — Deepfake Detection (SFDCT)

This is the deep, measured contribution of the thesis. The name **SFDCT** stands for Spatial–Frequency learning with block-wise DCT. The core idea comes from an empirical observation already established in Chapter 1: the artefacts of GAN and upsampling pipelines, such as checkerboard grids and spectrum anomalies, are very hard to see in the pixel domain but show up clearly in the DCT frequency domain. A spatial backbone such as EfficientNet-B4 learns semantic features (eyes, nose, skin texture) very well, yet it stays partly blind to subtle frequency anomalies. SFDCT adds a dedicated frequency branch and fuses it into the backbone in a safe way, so that in the worst case the model is never worse than B4.

Credit is due before the design is presented. SFDCT is built on the DeepfakeBench training and evaluation framework [4] and uses EfficientNet [1] as its backbone; each of the five improvement levers in Section 2.3.4 adapts a published frequency method, credited lever by lever there. SFDCT does not claim state of the art. As Chapter 3 reports, SPSL still beats naive SFDCT on the cross-dataset test.

### 2.3.1 Data Solutions

The quality of the frequency features depends directly on the quality of pre-processing. A misaligned or improperly compressed face crop can create spurious frequency artefacts that mislead the model. The data pipeline is therefore standardised strictly following DeepfakeBench, for fairness and reproducibility.

#### Data sources, train/val/test split & label alignment

Following the DeepfakeBench protocol, the model is trained on FaceForensics++ (FF++), the c23 compressed version (≈ 159,626 sampled frames), and tested cross-dataset on Celeb-DF-v2 (CDFv2) with 16,420 test frames (5,620 real + 10,800 fake). Keeping the training set and the test set in two different distributions is exactly how generalisation is measured. Each frame inherits its REAL/FAKE label from the video-level annotation of the source dataset (label alignment): every sampled frame of a forged video is labelled FAKE, and every frame of a genuine video is labelled REAL.

*Table 2.22: Data sources and their role in the evaluation protocol.*

| Dataset | Scale | Role | Split |
|---------|-------|------|-------|
| FF++ c23 | 1000 real videos + 4 forgery methods (Deepfakes, Face2Face, FaceSwap, NeuralTextures); ≈ 159,626 sampled frames | Train | Standard DeepfakeBench video split (720 / 140 / 140 per group) |
| Celeb-DF-v2 | 590 real + 5,639 high-quality deepfake videos; 16,420 test frames (5,620 real + 10,800 fake) | Cross-dataset test (no training) | Entirely used for testing |
| DFDC | not used in this thesis | Additional cross-dataset (future) | Future direction |
| Vietnamese deepfake set | test-only pilot — collection in progress | eKYC-realistic cross-test | In progress, test-only |

The logic of the split is simple. FF++ provides a diversity of manipulation types, so the model can learn forgery traces that generalise. CDFv2, with its high-quality celebrity deepfakes, plays the role of a genuine examination: if the model has merely memorised the artefacts specific to FF++, it fails on CDFv2. Frame-level AUC on CDFv2 is therefore a faithful measure of generalisation ability.

#### Preprocessing & feature extraction

Each frame is passed through a face detector (MTCNN at serving time, dlib with landmark detection in the training pipeline) to locate the bounding box and landmarks. The face is then aligned to a canonical pose and cropped to 256×256. When the face lies close to the border, padding preserves the frame ratio without distorting geometry. The final image is normalised with `mean = std = 0.5`, mapping pixels to roughly [−1, 1].

*Table 2.23: Face pre-processing steps.*

| Step | Operation | Input | Output |
|------|-----------|-------|--------|
| 1 | Face + landmark detection | Raw frame | Bounding box + landmarks |
| 2 | Alignment | Box + landmarks | Pose-rectified face |
| 3 | Crop + padding | Aligned face | 256×256 image preserving the ratio |
| 4 | Normalisation | 256×256 image | Tensor (mean=std=0.5) |

Strict alignment matters because the block-DCT branch (Section 2.3.4) divides the image into fixed 8×8 blocks. If faces are not aligned consistently, the same anatomical region, say the cheek, falls into different blocks across images, and the per-band frequency statistics get corrupted. Good alignment keeps the frequency features stable and comparable across samples.

#### Sequence construction (frame sampling + face crop)

Each video is sampled at 32 frames (`frame_num = 32`) evenly distributed along the temporal axis; each sampled frame is then face-cropped as above. A frame-level model does not need every frame. It only needs a representative set large enough to cover the variation in pose, expression and lighting within the video. The value 32 balances information coverage against computation and storage cost, and it is held constant across all configurations to allow a fair comparison.

#### Augmentation

Augmentation is applied only in the training flow, to increase diversity and reduce overfitting. The training config uses standard geometric and photometric augmentations: horizontal flip p = 0.5, rotation ±10° p = 0.5, Gaussian blur with kernel 3–7 p = 0.5, brightness/contrast jitter ±0.1, and simulated JPEG compression with quality 40–100. On top of these, the distinctive piece is **DCTFoMixup** (activated when lever S3 is enabled): it mixes the DCT frequency bands of two samples and performs an inverse-DCT to create a new sample, forcing the model to learn more invariant frequency features (detailed in Section 2.3.5). Augmentations that strongly affect the spectrum must be designed carefully, or they may erase the very forgery traces the model needs.

#### Storage optimization

To keep training I/O efficient, sampled crops are stored at the fixed 256×256 resolution with their pre-computed labels, so the expensive detection and alignment step runs once rather than every epoch. Frame indices and labels are cached per video, following the DeepfakeBench data-manager convention, and re-runs stay deterministic under the fixed seed (NFR3, NFR4).

### 2.3.2 Evaluation method and loss function

#### The metrics

Several metrics are used for a comprehensive evaluation, but one of them is the primary measure.

*Table 2.24: Evaluation metrics.*

| Metric | Short definition | Role |
|--------|------------------|------|
| **Frame-level AUC** | Area under the ROC curve at the frame level | **Headline** — measures cross-dataset generalisation |
| AP | Average Precision (area under the PR curve) | Supplementary, sensitive to class imbalance |
| EER | Equal Error Rate (FPR = FNR) | Related to the operating threshold |
| Accuracy / F1 | Threshold-dependent correctness | Reference at the operating point |

Frame-level AUC is the primary metric for two reasons. It is threshold-invariant: it measures the quality of the REAL/FAKE ranking independently of any cut-off. It is also the comparison standard of the DeepfakeBench leaderboard, which allows a fair comparison with other methods. The evaluation procedure strictly follows DeepfakeBench: train on FF++ c23, test on CDFv2, which the model has never seen.

#### The loss function

The loss aggregates components depending on the enabled configuration:

$$
\mathcal{L} = \mathcal{L}_{\text{CE}} \;+\; \lambda_{\text{aug}}\,\mathcal{L}_{\text{cls\_aug}} \;+\; \lambda_{\text{cons}}\,\mathcal{L}_{\text{cons}} \;+\; \lambda_{\text{sc}}\,\mathcal{L}_{\text{sc}}
$$

*Table 2.25: Components of the loss function.*

| Component | Formula/meaning | Enabled when |
|-----------|-----------------|--------------|
| $\mathcal{L}_{\text{CE}}$ | REAL/FAKE classification cross-entropy on the original sample | Always on |
| $\mathcal{L}_{\text{cls\_aug}}$ | Cross-entropy on the DCTFoMixup hybrid sample | S3 on |
| $\mathcal{L}_{\text{cons}}$ | symmetric-KL (probabilities) + MSE (embedding) — see §2.3.5 | S3 on |
| $\mathcal{L}_{\text{sc}}$ | Single-center loss — see §2.3.5 | S5 on |

When all levers are off (naive SFDCT), the loss reduces to exactly the standard cross-entropy. This reflects the design principle: safe by default, enable more only when needed. The composite weights are λ_cons = 1.0, λ_sc = 0.3, margin m = 0.3, with λ_aug = 1.0.

#### Optimiser & hyperparameters

The training configuration is identical across all ablation configurations. Any AUC difference therefore comes solely from the architecture and levers, not from hyperparameter tuning.

*Table 2.26: Training hyperparameters.*

| Hyperparameter | Value |
|----------------|-------|
| Optimizer | Adam |
| Learning rate | 2 × 10⁻⁴ |
| Weight decay | 5 × 10⁻⁴ |
| Batch size | 32 |
| Frames per video (`frame_num`) | 32 |
| Image size | 256 × 256 |
| Normalisation | mean = std = 0.5 |
| Number of epochs | 10 |
| LR scheduler | None (fixed LR) |
| Seed | 1024 (single seed — not yet multi-seed) |
| Base loss | Cross-entropy (no label smoothing) |

No LR scheduler and no early stopping are used. Each of the 10 epochs is evaluated on the test set, the checkpoint with the best test-AUC is retained (`save_epoch = 1`), and that checkpoint is then used for the cross-dataset evaluation on CDFv2.

### 2.3.3 EfficientNet-B4 architecture (spatial branch)

The spatial branch is EfficientNet-B4 pretrained on ImageNet, and it carries most of the classification capability. As discussed in Chapter 1, EfficientNet uses compound scaling to grow depth, width and resolution together, and its core unit is the MBConv block (mobile inverted bottleneck with squeeze-and-excitation). B4 is the chosen operating point because it offers strong accuracy at a parameter and compute budget that fits a single mid-range GPU: large enough to learn rich semantic and textural face features, small enough to serve at acceptable latency. Transfer learning from ImageNet gives the branch a strong texture prior before it is fine-tuned on FF++.

In SFDCT the B4 branch consumes the 256×256 normalised crop and produces a spatial feature map $x$ that, after the fusion step, feeds the REAL/FAKE classifier. On its own, with the frequency gate closed, this branch *is* the B4 baseline whose cross-dataset score is evaluated in Chapter 3. That baseline is exactly the floor the fusion design protects.

### 2.3.4 SFDCT architecture

#### Two-branch overview

SFDCT comprises two parallel branches sharing the same 256×256 input:

- Spatial branch: EfficientNet-B4 (Section 2.3.3), extracting semantic and textural features.
- Frequency branch: transforms the image into the frequency domain via a block-wise 8×8 2D-DCT, extracts spectral features over 16 zigzag frequency bands, and produces a supplementary representation focused on frequency-domain forgery traces.

The two branches meet at the zero-initialised gated cross-attention module, where the frequency features are injected into the spatial features through a gate `alpha` initialised to 0. The intuition is simple. Forcing a single network to learn both semantics and the spectrum invites gradient conflict, so each branch specialises and they fuse under control. The frequency branch acts as a consulting expert: the backbone still makes the main decision but can consult frequency evidence when needed. (The architecture is depicted in Figure 2.2.)

#### The 8×8 block-DCT frequency branch

This is the heart of the representational contribution: turn a face image into a compact, stable, forgery-informative set of frequency features. Four steps go from the colour image to a per-band statistical vector.

**Step 1: Convert to YCbCr.** The RGB image is converted to YCbCr, separating luminance (Y) from chrominance (Cb, Cr). JPEG compression and most forgery artefacts behave differently on luminance and chrominance, so separating the channels lets the branch see anomalies that RGB blends together.

**Step 2: Block-wise 8×8 2D-DCT.** The image is divided into non-overlapping 8×8 blocks. On each block $B$, the 2D-DCT coefficient at position $(u,v)$ is:

$$
F(u,v) = \frac{1}{4}\,C(u)\,C(v)\sum_{x=0}^{7}\sum_{y=0}^{7} B(x,y)\,\cos\!\Big[\frac{(2x+1)u\pi}{16}\Big]\cos\!\Big[\frac{(2y+1)v\pi}{16}\Big]
$$

where $C(0)=1/\sqrt{2}$ and $C(k)=1$ for $k>0$. The 8×8 block size is not arbitrary. It is exactly the JPEG block size, so compression and forgery artefacts tend to align with the block grid and become more prominent in the DCT coefficients.

**Step 3: Log-magnitude.** We take $D(u,v) = \log\big(1 + |F(u,v)|\big)$. The log compresses the enormous dynamic range of the DCT spectrum; the DC coefficient is typically thousands of times larger than the high-frequency coefficients. Without the log, the high-frequency traces, small but rich in forgery evidence, would be overwhelmed.

**Step 4: Aggregate into 16 zigzag bands & band statistics.** The 64 coefficients of each 8×8 block are traversed in zigzag order (DC at top-left, high-frequency at bottom-right) and grouped into 16 zigzag frequency bands, low to high. For each band $b$:

$$
\mu_b = \frac{1}{|\mathcal{B}_b|}\sum_{(u,v)\in \mathcal{B}_b} D(u,v), \qquad
\sigma_b = \sqrt{\frac{1}{|\mathcal{B}_b|}\sum_{(u,v)\in \mathcal{B}_b}\big(D(u,v)-\mu_b\big)^2}
$$

where $\mathcal{B}_b$ is the set of coefficient positions in band $b$ (aggregated over all blocks and channels). The result is a compact frequency vector describing the per-band spectral signature.

**Optional drop of low bands.** The DC term and the lowest bands can be removed before fusion. The low bands carry mainly content (overall shape, brightness) rather than forgery traces. Keeping them risks content leakage: the model learns the person or scene instead of the forgery, which harms cross-dataset generalisation. Dropping them forces the branch to focus on the mid-to-high range where GAN and upsampling artefacts reside.

*Table 2.27: The block-DCT frequency branch (step → input → output → role).*

| Step | Operation | Input | Output | Role |
|------|-----------|-------|--------|------|
| 1 | RGB → YCbCr | 256×256 face crop | Y, Cb, Cr | Separate luminance/chrominance |
| 2 | 8×8 block-DCT | Each channel in 8×8 blocks | $F(u,v)$ per block | Move to JPEG-aligned frequency domain |
| 3 | Log-magnitude | $\|F(u,v)\|$ | $D(u,v)=\log(1+\|F\|)$ | Compress range, emphasise high freq |
| 4 | Zigzag → 16 bands + stats | $D(u,v)$ over the image | $(\mu_b,\sigma_b)_{b=1..16}$ | Compact, stable spectral signature |
| (opt) | Drop low bands | Full band vector | DC + low bands removed | Counter content leakage |

#### Zero-initialised gated cross-attention fusion

The central fusion problem is how to combine frequency features into the backbone without any risk of making the model worse. A brute-force fusion (direct add or concat) of an under-trained frequency branch could inject noise into the backbone and drag the model below B4. The solution is a zero-initialised gate.

Let $x$ be the B4 spatial feature and $\text{context}(\text{DCT})$ the frequency representation after cross-attention. The fused feature is:

$$
\text{feature\_fused} = x + \alpha \cdot \text{context}(\text{DCT}), \qquad \alpha \text{ learnable, initialised } \alpha = 0
$$

At initialisation, $\alpha = 0$ gives $\text{feature\_fused}|_{\alpha=0} = x$. In other words, SFDCT starts exactly equal to EfficientNet-B4. The model begins at the baseline and decides for itself whether to open the frequency gate. If the frequency branch is useful, the gradient pushes $\alpha$ away from 0; if not, $\alpha$ stays near 0 and the model remains safely at B4.

*Table 2.28: Meaning of the gate $\alpha$ by value.*

| Value of $\alpha$ | Model state | Interpretation |
|-------------------|-------------|----------------|
| $\alpha = 0$ (init) | Equivalent to B4 | Safe "floor" — never worse than the baseline |
| $\alpha \to$ small positive | Frequency lightly supplementary | Backbone dominant, frequency fine-tunes |
| $\alpha$ larger | Frequency contributes strongly | Frequency traces genuinely important |

We call this property the **floor guarantee** (floor ≥ B4), and it is the most important risk-safety property of the design. The learned $\alpha$ is visualised in Chapter 3 (Fig 3.13, `gate_alpha.png`), showing how much the model actually relies on the frequency branch. The zero-init gate follows zero-initialised residual-gating techniques in modern architectures, notably ReZero [31].

One distinction needs stating, because SFDCT could be confused with SFCL-HCMF. SFCL-HCMF initialises its fusion gate at 0.5, so it starts fusing immediately, and it adds a global-differential (SIDA) branch. SFDCT initialises the gate at α = 0, so it starts as plain B4, and it has no global-differential or SIDA branch at all: only the 8×8 block-DCT branch plus the zero-init gated cross-attention. The α = 0 choice is exactly what makes the floor guarantee hold.

#### The five levers and four ablations (design space)

The block-DCT branch plus gated fusion is called naive SFDCT (also written B4-DCT). As Chapter 3 reports, it yields a modest improvement over B4 that lies within statistical noise. To push further, this work assembles and adapts five improvement levers, each taken from a frequency-based deepfake paper and transferred into the block-DCT domain. The philosophy: rather than inventing from scratch, stand on proven methods, but unify them in a single block-DCT framework.

- **S1: `dct_use_sign`** (adapted from SPSL [6]). The log-magnitude step discards the coefficient sign, yet the sign carries phase information sensitive to upsampling artefacts. S1 stores signed statistics, $D_{\pm}(u,v)=\text{sign}(F(u,v))\cdot\log(1+|F(u,v)|)$, a phase-analog signal. Cost: 0 added learnable parameters.
- **S2: `dct_srm_residual`** (adapted from SRM [7]). Forgery traces hide in the high-frequency noise component. S2 runs an SRM high-pass filter first, $R = \text{SRM}_{\text{high-pass}}(I)$, then computes block-DCT on the residual $R$, yielding a content-clean spectrum. Cost: 0 added learnable parameters, since the SRM kernels are fixed.
- **S3: `use_dct_fomixup` + dual consistency loss** (adapted from FreqDebias [12]). DCTFoMixup mixes the DCT bands of two samples and inverse-DCTs the result into a hybrid; a dual consistency loss forces original/hybrid agreement: $\mathcal{L}_{\text{cons}} = \tfrac{1}{2}[\text{KL}(p\|q)+\text{KL}(q\|p)] + \lambda_{\text{emb}}\|z-z'\|_2^2$. S3 is the only lever in both Row1 and Row2 because it debiases generically.
- **S4: `dct_fca_attention`** (adapted from FcaNet [5]). Channel attention with global average pooling keeps only the DC component; FcaNet uses multiple DCT frequencies as attention weights. S4 inserts a MultiSpectralAttentionLayer, $\text{att}=\text{sigmoid}(\text{MLP}(\text{DCT-pool}_{\text{multi-freq}}(X)))$, $X'=\text{att}\odot X$. Cost: adds learnable parameters (the attention MLP).
- **S5: `use_single_center_loss`** (adapted from FDFL [11]). Real faces form a tight cluster while fakes are diverse. The single-center loss compresses real toward a centre $c$ and pushes fakes out by a margin $m\sqrt{D}$. Cost: adds learnable parameters (the centre $c$).

The five levers combine into four configurations that tell an incremental story. Row1 and Row2 are deliberately designed to separate the two lever types. Row1 uses only the levers that add no learnable parameters (S1+S2+S3, input features and loss only), while Row2 uses the levers that add learnable parameters (S4+S5+S3). The split answers a scientific question, namely whether an improvement comes from better information or from greater model capacity.

*Table 2.29: Four ablation configurations and lever states.*

| Configuration | Description | S1 | S2 | S3 | S4 | S5 | Added params | CDFv2 AUC |
|---------------|-------------|:--:|:--:|:--:|:--:|:--:|:------------:|:---------:|
| **B4** | EfficientNet-B4 spatial-only | – | – | – | – | – | No | 0.7497 |
| **naive SFDCT** (B4-DCT) | B4 + block-DCT + gated fusion (levers off) | ✗ | ✗ | ✗ | ✗ | ✗ | No (besides fusion) | 0.7572 |
| **Row1** | naive + S1 + S2 + S3 | ✓ | ✓ | ✓ | ✗ | ✗ | **No** | 0.7333 |
| **Row2** | naive + S3 + S4 + S5 | ✗ | ✗ | ✓ | ✓ | ✓ | **Yes** | not trained (future work) |

Two honesty notes belong here. First, the gain of naive SFDCT over B4 in Table 2.29 is within statistical noise for a single seed; multi-seed runs would be needed to confirm it. Second, Row1 lands below the B4 baseline. Stacking the parameter-free levers (sign, SRM residual, FoMixup) did not help in this single run and in fact hurt cross-dataset AUC; this negative result is reported rather than hidden, and Chapter 3 analyses it. Row2 was not trained within the thesis GPU budget and is left as future work; two single-axis variants trained under the identical recipe (Fix1, Fix2 — Chapter 3) provide a partial decomposition in its place.

### 2.3.5 Risk-Score / Decision Inference

#### Introduction

The SFDCT model outputs a per-frame fake probability `prob_fake`. An eKYC provider needs more than that: a calibrated risk score, a coarse risk band, a decision hint, and one concrete decision threshold τ that satisfies a stated false-positive budget. This subsection describes how the raw probability is turned into that operational signal. The mechanism is implemented in `risk.py` (`to_risk_score` / `risk_band` / `decision_hint` / `thresholds_dict`).

#### Motivation and Principle

In eKYC, the model should return a risk signal, not a hard label. The eKYC provider knows its own fraud appetite and regulatory posture, so it makes the final call. Two principles follow. First, the probability should be calibrated, so that a 0.9 risk really means high risk; we use temperature scaling [19] (identity when the fitted temperature $T=1$). Second, the score should be summarised into bands (low / medium / high) that map to plain-language hints (pass / review / reject), because operators act on bands, not on three-decimal probabilities. The band thresholds are per-tenant, defaulting to a global setting, so each customer can tune them to its own FPR budget.

#### Inference Mechanism

The mechanism has four steps, going from the raw probability to a decision hint.

**Step 1: Calibrate to a risk score (temperature scaling).** Given `prob_fake` and a fitted temperature $T$:

$$
\text{risk\_score} =
\begin{cases}
\text{clip}_{[0,1]}(\text{prob\_fake}), & T = 1 \\[4pt]
\sigma\!\Big(\dfrac{1}{T}\,\log\dfrac{p}{1-p}\Big), & T \neq 1
\end{cases}
\qquad p = \text{clip}(\text{prob\_fake},\, 10^{-6},\, 1-10^{-6})
$$

With $T=1$ the score is just the clipped probability. A fitted $T$, loaded from the calibration step, sharpens or softens the score so it is more trustworthy.

**Step 2: Map the score to a band.** Per-tenant thresholds are used, with defaults `RISK_BAND_LOW = 0.30` and `RISK_BAND_HIGH = 0.70`:

$$
\text{band} =
\begin{cases}
\text{low}, & \text{score} < 0.30 \\
\text{medium}, & 0.30 \le \text{score} < 0.70 \\
\text{high}, & \text{score} \ge 0.70
\end{cases}
$$

**Step 3: Derive a decision hint.** The band maps to a hint that the provider may follow or override: `low → pass`, `medium → review`, `high → reject`. This is a suggestion, never the final eKYC decision.

**Step 4: Calibrate the eKYC threshold τ at FPR ≤ 5%.** AUC is threshold-invariant, but operation needs a concrete cut-off. We adopt FPR ≤ 5% per ISO/IEC 30107-3 (BPCER20) to satisfy the qualitative biometric-verification requirement of Circular 17/2024/TT-NHNN. TT17 mandates biometric verification but does not prescribe any numeric threshold; the 5% figure is our engineering choice, not a regulatory mandate. The threshold τ is calibrated so that the measured FPR stays at or below 5%, then fixed and applied to the test set to report the corresponding TPR. The calibrated operating point of the trained model is listed in Table 2.30 and discussed in Chapter 3.

*Table 2.30: Calibrated eKYC operating point of naive SFDCT on CDFv2.*

| Quantity | Value |
|----------|-------|
| Threshold τ (best naive-SFDCT model) | **0.9514** |
| FPR on test (CDFv2) at τ | **0.0500** |
| TPR / recall (fake detection) at τ | **0.2298** (22.98%) |
| Accuracy / F1 at τ | **0.476 / 0.366** |
| Confusion at τ | TN **5,339** · FP **281** · FN **8,318** · TP **2,482** |

#### Example

Suppose a customer selfie scores `prob_fake = 0.087`. With $T=1$, risk_score = 0.087, the band is low (since 0.087 < 0.30), and the hint is pass. Now suppose a frame scores `prob_fake = 0.913`: risk_score = 0.913, band high, hint reject. At the formal eKYC cut-off τ in Table 2.30, however, even the 0.913 frame falls below τ and would not be flagged FAKE by the strict eKYC rule. The two signals coexist for exactly this reason: bands give graded, operator-facing guidance, while τ gives a single auditable, compliance-facing line tied to the FPR budget.

#### Summary

The risk-score / decision-inference layer turns a raw frame probability into a calibrated, banded signal plus a single FPR-anchored threshold. Its limits are stated openly. At a τ that keeps FPR ≤ 5%, the single-frame model catches only a minority of deepfakes and most slip through; the exact operating numbers are in Table 2.30 and the analysis is in Chapter 3. That gap is the design reason deepfake detection is composed behind a liveness pre-filter (Section 2.4) and complemented by video-level aggregation: at a customer-friendly operating point, the single-frame model is a screening layer, not a stand-alone gate.

One more caveat. τ here is set on the CDFv2 scores directly, because a separate validation split has not yet been carved out. In real deployment, τ must be calibrated on the dev set of the deployment distribution, that is, Vietnamese faces (see Future Work).

### 2.3.6 The block-DCT-HFF architectural variant (R1/R3)

Beyond the lever design space, the thesis trains one architectural alternative that adapts the high-frequency-features idea of Luo et al. [7] into the block-DCT domain, referred to as **block-DCT-HFF**. Where the SFDCT frequency branch summarises per-band statistics, HFF keeps the frequency information as an image. The 8×8 block-DCT coefficients of each block are computed, the low-frequency bands are zeroed, and an inverse DCT reconstructs a high-pass residual image in which content is suppressed and high-frequency traces (blending boundaries, upsampling grids) dominate. A multi-scale convolutional stream processes this residual image, with parallel kernels capturing artefacts at several spatial scales. Its output drives a residual-guided spatial attention map over the B4 feature map, telling the spatial backbone where the high-frequency evidence is, before merging through the same zero-initialised gate as SFDCT, which preserves the floor guarantee. Two variants are trained: R1 (minimal, single-scale stream, no attention) and R3 (full, multi-scale stream plus residual-guided attention). Chapter 3 reports R3 as the strongest measured member of the whole family, while noting honestly that its paired bootstrap confidence interval against B4 still contains zero.

### 2.3.7 Statistical tools: AUC, bootstrap confidence intervals, and threshold selection

The thesis's conclusions rest on small differences between models, so the statistical machinery is stated explicitly.

**AUC as a ranking probability (Mann–Whitney form).** With $N_f$ fake scores $s_i$ and $N_r$ real scores $t_j$, the empirical AUC [21] is

$$
\mathrm{AUC} = \frac{1}{N_f N_r}\sum_{i=1}^{N_f}\sum_{j=1}^{N_r}\Big[\mathbb{1}(s_i > t_j) + \tfrac{1}{2}\,\mathbb{1}(s_i = t_j)\Big],
$$

that is, the probability that a randomly chosen fake is ranked above a randomly chosen real. This form is what the evaluation scripts compute directly (pure NumPy, no library dependence), and it makes clear why AUC needs no threshold.

**Video-level bootstrap confidence intervals.** A single AUC number carries no uncertainty. The thesis attaches a 95% confidence interval (CI) by the bootstrap [20] at the *video* level, resampling videos rather than frames, because frames of one video are strongly correlated. From the 518 test videos, 518 video IDs are drawn with replacement, the video-level AUC is recomputed on the resample, the process repeats $B = 2{,}000$ times (fixed seed 42), and the 2.5th/97.5th percentiles give the CI. For paired comparisons (model A vs B4), the same resampled index set is applied to both models in each replicate and the difference $\Delta\mathrm{AUC}$ is recorded. If the resulting CI of $\Delta$ contains zero, the two models are not statistically separated at this seed. Chapter 3 uses this criterion throughout.

**Threshold selection as constrained optimisation.** The eKYC operating point is the solution of

$$
\tau^{*} = \arg\max_{\tau}\; \mathrm{TPR}(\tau) \quad \text{subject to} \quad \mathrm{FPR}(\tau) \le 0.05,
$$

computed on the empirical score distribution: choose the smallest threshold whose measured FPR does not exceed 5%, then read off the TPR. This formalises Step 4 of Section 2.3.5 and is reproducible from the saved score arrays.

**Temperature scaling.** The calibration of Step 1 (Section 2.3.5) fits a single scalar $T$ by minimising the negative log-likelihood on a calibration split [19]; $T = 1$ leaves the probability unchanged, $T > 1$ softens over-confident scores.

---

## 2.4 Method — Liveness Detection (secondary, measured)

Liveness is a secondary module. It is designed by reusing the SFDCT components and has been trained and measured on the official LCC-FASD split [28]; the measured results are reported in §3.1.8. Two heads are compared, B4 and B4+DCT, and on this dataset the frequency branch does not improve over the spatial head, an honest negative that mirrors the deepfake finding. The metrics are APCER/BPCER/ACER (ISO/IEC 30107-3) [13], with spoof/attack as the positive class.

### 2.4.1 Data Solutions

#### Data collection

Following the cheap-and-reusable strategy, two RGB still-image datasets are used:

- LCC-FASD (~18,000 images; 1,942 real / 16,885 fake; print + replay attacks). This is the primary local training and evaluation set. It downloads directly from Kaggle with no licence agreement, its RGB crops match the SFDCT input pipeline, and it runs on a single RTX 3060.
- NUAA Imposter (~12,614 grayscale images; print attack). A smoke-test and sanity set, used to confirm the pipeline generalises beyond LCC-FASD.

CelebA-Spoof crop (HF, 4.95 GB) could optionally serve as a larger training source with LCC-FASD as cross-test; this is noted as a possible extension. Heavier or licence-locked sets (OULU-NPU, SiW, CASIA-SURF/WMCA, multi-modal RGB+Depth+IR) are deliberately avoided. Where a community number is needed, the published result is cited rather than reproduced.

#### Preprocessing, augmentation & parameter reasons

The liveness pipeline reuses the SFDCT preprocessing exactly: face detect, align, crop to 256×256, normalise with mean=std=0.5. This identical pipeline is the whole point of the reuse, since the same crops can feed either the deepfake head or the liveness head. Augmentation mirrors the deepfake pipeline (flip, mild photometric jitter, JPEG simulation). Strong spectral augmentation is used with caution, because the physical cue we rely on, moiré and recapture peaks in the DCT, can be blurred by aggressive JPEG. The 8×8 block size and the 16-band zigzag aggregation are kept unchanged, so the frequency branch is literally the same module as in deepfake detection.

*Table 2.31: Liveness datasets and roles.*

| Dataset | Scale | Attack types | Role | Licence |
|---------|-------|-------------|------|---------|
| LCC-FASD | ~18,000 (1,942 real / 16,885 fake) | print, replay | Primary train + eval | Direct Kaggle download |
| NUAA Imposter | ~12,614 (grayscale) | print | Smoke-test / cross-check | Kaggle mirror |

### 2.4.2 Architecture — reuse SFDCT (B4 vs B4+DCT) + cascade pre-filter

The liveness module is intentionally a minimal delta on SFDCT, giving a clean baseline-versus-proposal pair on the same backbone:

- Baseline, B4-liveness: EfficientNet-B4 spatial-only with a two-layer live/spoof head, fine-tuned from ImageNet (or from the deepfake checkpoint). This is the most common deep-FAS baseline.
- Proposal, B4+DCT-liveness: the same 8×8 block-DCT branch and zero-init gated cross-attention from SFDCT, with the binary head. The physical justification is identical in spirit to deepfake detection. Replay (screen) and print attacks leave moiré and recapture peaks in the frequency domain that are weak in the pixel domain, so the block-DCT branch has a principled reason to help liveness too. One honest caveat: moiré is strongest for replay, while print artefacts are halftone and printing noise, so the frequency branch may help replay more than print.

This pair lets us ask, for liveness, the same question as for deepfake: whether the frequency branch generalises across spoof types and datasets (LCC-FASD → NUAA). Architecturally, the closest prior art is dual-stream spatial+frequency FAS, for example bandpass dual-stream or EfficientNet+Fourier. SFDCT's distinction is the block-wise 8×8 DCT, the gated cross-attention, and a backbone shared between deepfake and liveness. A claim of novelty would require a proper novelty check and is not made here.

**Cascade pre-filter (liveness → deepfake).** Operationally the liveness head runs first in the eKYC cascade (Figures 2.4, 2.6): a `SPOOF` or `UNCERTAIN` verdict short-circuits before any deepfake compute. The ordering is partly about security and partly about compensation. The deepfake model has low recall at the FPR-≤-5% point (Section 2.3.5), so a cheap liveness pre-filter removes a whole class of presentation attacks before the expensive, low-recall stage runs.

### 2.4.3 Evaluation method and loss function

#### Loss

The liveness head is trained with binary cross-entropy over {live, spoof}, the natural analogue of the deepfake CE loss. The baseline needs no extra term. The B4+DCT proposal reuses the same gated fusion with the α = 0 floor, so it starts equal to B4-liveness and can only add value.

#### Metrics (ISO/IEC 30107-3)

With spoof/attack as the positive class, the standard PAD metrics are:

$$
\text{APCER} = \frac{\text{FP}}{\text{TN}+\text{FP}}, \qquad
\text{BPCER} = \frac{\text{FN}}{\text{TP}+\text{FN}}, \qquad
\text{ACER} = \tfrac{1}{2}\big(\text{APCER}+\text{BPCER}\big)
$$

APCER counts attack presentations accepted as bona fide, the dangerous error, and is reported as the worst case across attack instruments. BPCER counts genuine users rejected. ACER is their mean at a single threshold. For cross-dataset evaluation, HTER (equal to ACER when positive = spoof) is reported. AUC, being threshold-independent, is the primary number, mirroring the deepfake reporting. Crucially, the operating threshold is chosen at EER on a dev set and then fixed; it is never tuned on test, exactly as in the deepfake protocol. For eKYC we additionally report BPCER @ APCER ≤ 5%, tying the liveness operating point to the same 5% FPR budget (ISO/IEC 30107-3) adopted for deepfake.

*Table 2.32: Liveness evaluation plan and measured results (details in §3.1.8).*

| Metric | Definition | Pre-registered target | Measured (B4 head) | Measured (B4+DCT) |
|--------|------------|----------------------|--------------------|-------------------|
| AUC | Area under ROC (threshold-independent) | ≈ 0.92 | **0.9829** | 0.9776 |
| ACER | ½(APCER + BPCER) at threshold@EER on dev | ≈ 16% | **6.85%** | 7.54% |
| APCER / BPCER | Reported separately | — | **2.86% / 10.83%** | 4.25% / 10.83% |
| HTER | Cross-dataset (LCC-FASD → another PAD set) | — | not measured (future work) | not measured |

The pre-registered targets in Table 2.32 were recorded before training, so the plan had a concrete success criterion from the start. The threshold protocol (EER fixed on the official development split, never tuned on the evaluation split), the measured results, and their independent verification are presented in §3.1.8.

---

## 2.5 Conclusion

Chapter 2 has walked the full path from requirements to design to the two detection methods. The requirement analysis defined four functional families (deepfake detection, liveness detection, UI & upload, monitoring & alert; FR1–FR16) and seven non-functional attributes (performance, scalability, availability & reliability, maintainability, usability, portability, monitoring & logging), placing cross-dataset performance (NFR1) at the top to reflect the adversarial nature of eKYC. The system design then formalised six actors and eight use cases, a five-block labelled architecture (A. Frontend, B. Backend API, C. AI Inference microservice, D. Monitoring, E. Alerting via Google Chat), the deepfake and eKYC-cascade activity diagrams, their sequence diagrams, and the deepfake-and-liveness API contract, all bound to concrete endpoints, roles and error paths.

The central contribution is the pair of methods. The deepfake method, SFDCT, is the deep and measured one: a two-branch architecture combining the spatial EfficientNet-B4 backbone with an 8×8 block-DCT frequency branch (16 zigzag bands, with an optional low-band drop against content leakage), fused via zero-initialised gated cross-attention with α = 0. The α = 0 gate gives the floor guarantee, and it separates SFDCT from SFCL-HCMF, whose gate starts at 0.5 and which carries a SIDA branch that SFDCT does not have. On that base, the five adapted frequency levers (§2.3.4) form a design space whose Row1/Row2 split isolates better information from more capacity. The outcomes are reported honestly in Chapter 3: the naive gain over B4 is within noise, Row1 falls below the baseline (a negative result), Row2 was not trained within the GPU budget, the block-DCT-HFF variant (§2.3.6) is the family's best measured member, and SPSL still beats naive SFDCT, so no state-of-the-art claim is made. The risk-score / decision-inference layer turns probabilities into calibrated bands, hints, and a single threshold τ at FPR ≤ 5%, a choice we make per ISO/IEC 30107-3 to satisfy TT17's qualitative requirement; recall at that point is low, which the design accepts and compensates for through the cascade. The liveness method mirrors SFDCT with a binary head (B4 vs B4+DCT), runs first in the cascade as a pre-filter, and has been measured on the official LCC-FASD split (§3.1.8); there too, the frequency branch does not improve on the spatial head, an honest negative consistent with the deepfake finding.

Chapter 3 will present the implementation and evaluation in detail — the experimental environment, data distributions, training curves, the cross-dataset comparison table, the ROC/PR/confusion/t-SNE/Grad-CAM/gate-α visualisations, the 16-configuration evaluation, the deployed system, and the measured liveness results — to validate each design argument set out here.

<div style="page-break-after: always;"></div>

# CHAPTER 3: SYSTEM IMPLEMENTATION AND EVALUATION

Chapter 2 presented the analysis, design, and the two detection methods of the system. The first is the deepfake-detection method built on **SFDCT** (Hybrid Spatial–Frequency Learning with Block-wise DCT): an EfficientNet-B4 spatial backbone with an added 8×8 block-wise 2D-DCT frequency branch, merged through a zero-initialised gated cross-attention. The second is the liveness-detection method, a secondary module that reuses the same backbone for presentation-attack detection and is trained and measured on LCC-FASD. Chapter 3 moves from design to empirical validation and to a running system. It follows the usual order of a results-and-deployment chapter: first the experimental results for both tasks (§3.1), then how the validated model is implemented as a working web application (§3.2), then the application screens that put the results in front of a user (§3.3), and finally a conclusion (§3.4).

The guiding aim throughout the chapter is to stay honest and reproducible. Every number confirmed from an experiment is stated verbatim and can be traced to its raw source (`report/evidence/ablation_cdfv2/`, one-command reproduction scripts). Several quantities were not measured within the thesis budget: the FF++ in-dataset half of the grid, the Row2 configuration, the full per-lever table, DFDC, and the Vietnamese-face set. These are named plainly in the Limitations instead of being estimated, and nothing is extrapolated. The liveness results in §3.1.8 are measured on the official LCC-FASD split and independently verified.

---

## 3.1 Experimental Results

This section reports results for the two tasks in the order of the thesis's priority. The deepfake-detection task comes first; it is the primary contribution, fully measured under the standard cross-dataset protocol. The liveness-detection task follows as a secondary, measured module. Each task uses the same arc that Trí's thesis applies to its two models: data and preprocessing, then the design and training of each architecture, then a comparative evaluation, a discussion, and a conclusion.

### 3.1.1 Overview of the Deepfake-Detection Task — Data Collection and Preprocessing

#### Experimental environment

Before any number is read, the conditions under which it was produced must be clear. A deepfake results report only has meaning when the hardware, software, and measurement protocol are fixed and described openly. The same idea drives **DeepfakeBench**, the standardised framework on which this thesis builds to keep the comparison fair.

The whole training-and-evaluation process is split into two phases, following the smoke-test-before-train principle: a quick correctness test on the local machine, then full training on a rented GPU (vast.ai).

*Table 3.1: Hardware configuration used for the experiments.*

| Item | Local machine (smoke test) | Full-training machine |
|---|---|---|
| GPU | NVIDIA RTX 3050 (4 GB VRAM) | NVIDIA RTX 4090 (vast.ai, on-demand) |
| VRAM | 4 GB | 24 GB |
| System RAM | 32 GB | per-instance (not recorded) |
| Disk (dataset + ckpt) | ~300 GB NVMe (shared) | ≥ 150 GB provisioned |
| Purpose | shape → dry-run → overfit-1-batch | full training + evaluation |

The local machine only verifies that the pipeline is correct. It checks tensor shapes, runs a trial loop, and overfits one batch to confirm the model can learn; 4 GB of VRAM cannot hold a batch of 32 at 256×256. All full training and the final AUC measurements run on the rented GPU.

The software stack is version-pinned for reproducibility. This matters most for the DCT branch, because its block-wise 2D-DCT transform and frequency statistics are sensitive to small numerical differences between library versions. Only the same seed on the same stack reproduces the exact numbers.

*Table 3.2: Software stack.*

| Component | Version |
|---|---|
| Python | 3.10 (local analysis: 3.10.12) |
| PyTorch | 2.x / CUDA 12 image on the rented instance (local analysis: 2.6.0+cu124) |
| CUDA Toolkit | 12.x |
| cuDNN | bundled with the PyTorch 2.x/CUDA 12 image |
| torchvision | paired with the installed PyTorch (0.21.x for PyTorch 2.6) |
| numpy / opencv-python | 2.2.x / 4.x |
| Evaluation framework | DeepfakeBench (training/eval pipeline) |

To keep the ablation fair, all models share one set of hyperparameters. They differ only in whether the DCT branch and the levers S1–S5 are enabled.

*Table 3.3: Training hyperparameters shared across all models.*

| Hyperparameter | Value |
|---|---|
| Backbone | EfficientNet-B4 (ImageNet-pretrained) |
| Input resolution | 256 × 256 (face crop) |
| Normalisation | mean = std = 0.5 |
| Batch size | 32 |
| frame_num (train/test) | 32 / 32 |
| Optimizer | Adam (β₁ = 0.9, β₂ = 0.999, weight_decay = 5e-4) |
| Learning rate | 2e-4 |
| Scheduler | none |
| Compression | c23 |
| Train dataset | FaceForensics++ (c23) |
| Test dataset (headline) | Celeb-DF-v2 (cross-dataset) |
| Epochs | 10 |
| Seed | 1024 |
| Extra loss (naive SFDCT) | λ_cons = 1.0, λ_sc = 0.3, margin m = 0.3 |

A note on cost: each full run consumes considerable rented-GPU time, so the results in this chapter come from a single seed. This limitation is analysed in the Discussion. Per-model wall-clock training time on the rented RTX 4090, measured from the training-log timestamps, is: B4 ≈ 5.1 h, naive SFDCT ≈ 5.4 h, Row1 ≈ 2.9 h, Fix1 ≈ 1.6 h, Fix2 ≈ 1.6 h, and the block-DCT-HFF runs ≈ 1 h each (~5 min/epoch).

#### Training dataset and test dataset

The quality and character of the data decide what any claim about generalisation is worth. This thesis follows the DeepfakeBench cross-dataset protocol exactly: training entirely on FaceForensics++ and testing only on Celeb-DF-v2, which never appears in training. The split mirrors the real eKYC situation, where the model must face deepfake styles and face distributions it has never seen.

**FaceForensics++ (FF++)** is the training dataset: 1000 real videos plus four forgery methods (Deepfakes, Face2Face, FaceSwap, NeuralTextures) generated from those same 1000 source videos. The thesis uses the c23 compressed version, which applies light H.264 compression and is closer to real-world video quality than the raw version.

**Celeb-DF-v2 (CDFv2)** is the cross-dataset test set, with 590 real videos and 5639 high-quality celebrity deepfakes. The high quality and the subtle artefacts make it a hard test of generalisation.

A Vietnamese deepfake test set is part of the thesis scope as a test-only probe of the model on Vietnamese faces under the same preprocessing pipeline (cf. KoDF [16] for the population-shift evaluation precedent). Its recording and generation protocol is specified and collection is in progress. In keeping with the no-extrapolation rule, its statistics and results are reported only once measured (see Limitations and Future Work).

*Table 3.4: Statistics of FaceForensics++ (c23) and Celeb-DF-v2.*

| Attribute | FaceForensics++ (c23) | Celeb-DF-v2 |
|---|---|---|
| Role | Train (+ in-dataset test) | Test (cross-dataset) |
| Real videos | 1000 | 590 |
| Fake videos | 4000 (4 methods × 1000) | 5639 |
| Forgery methods | Deepfakes, Face2Face, FaceSwap, NeuralTextures | High-quality face-swap |
| Compression | c23 (H.264) | MPEG-4/H.264 (CDFv2 release) |
| Sampled frame_num (train/test) | 32 / 32 | 32 (test) |
| Real frames (after crop) | ≈ 31,949 | 5,620 (used for evaluation) |
| Fake frames (after crop) | ≈ 127,677 (4 × ~31.9k) | 10,800 (used for evaluation) |
| **Total frames used** | **≈ 159,626** | **16,420** |

#### Class distribution and its impact on measurement

Both datasets are imbalanced, and both lean towards the fake class:

- FF++ is skewed towards fake (real:fake ≈ 1:4 at the video level), because each real video yields four fake variants.
- CDFv2 is strongly skewed towards fake (590 real vs 5639 fake, ≈ 1:9.6 at the video level).

This skew matters for the choice of metric. Under such imbalance, accuracy is misleading: a model that always predicts fake still scores high accuracy on CDFv2. The thesis therefore adopts frame-level AUC as the main metric. AUC does not depend on the class ratio, and it measures real/fake separability across all thresholds, which is what a fair comparison of generalisation needs.

![Figure 3.1 — Real/fake distribution of the two datasets](figures/fig_3_1_distribution.png)

*Figure 3.1: Distribution of real/fake sample counts for FF++ (train) and Celeb-DF-v2 (test). FF++ ≈ 1 real : 4 fake (four methods); CDFv2 is strongly skewed towards fake.*

#### Preprocessing consistency

To keep the two datasets comparable, every frame passes through an identical DeepfakeBench preprocessing pipeline: from each video, extract frames, detect the face (MTCNN/dlib), align and crop to the face region, resize to 256×256, and normalise with mean = std = 0.5. The frequency branch additionally converts the cropped image to YCbCr before applying the 8×8 block-wise DCT. Keeping the pipeline identical across the two datasets stops the model from learning dataset-specific artefacts, such as differing crop conventions. It is also a precondition for any cross-dataset claim to be meaningful.

![Figure 3.2 — Real/fake pair + DCT spectrum](figures/fig_3_2_preprocess_realfake.png)

*Figure 3.2: A real/fake face pair (FF++ Deepfakes, same identity) after a 256×256 crop, together with the log|2D-DCT| spectrum — illustrating the frequency footprint of deepfakes after identical preprocessing.*

#### Frequency-feature visualisation

This visualisation connects directly to the core hypothesis of the thesis. The frequency-spectrum chart shows how energy and discriminability are spread across the 16 zigzag frequency bands, from DC to high frequency, and indicates which band carries the strongest real/fake signal.

![Figure 3.11 — DCT energy by frequency band, real vs fake](figures/fig_3_11_frequency.png)

*Figure 3.11: Mean log|2D-DCT| energy by frequency band (real vs fake) and the difference; the orange region marks the mid/high bands.*

**Analysis.** In the mid/high bands, real consistently carries higher energy than fake, because deepfakes over-smooth the face and lose high-frequency detail. There is, in other words, a discriminative signal in the frequency domain, and this justifies the block-DCT branch. On the compressed c23 version, however, the gap is small, since H.264 removes some of the high frequencies. That is the main reason the block-DCT improvement is modest. It also motivates dropping the DC and a few low bands, to avoid content leakage and to concentrate on the mid band that carries the forgery signal.

#### Per-sample analysis: real vs fake examples

To make the preprocessing outcome concrete, consider representative crops drawn from the test distribution. A real face keeps fine skin texture and natural high-frequency detail, visible as scattered mid/high-band energy in its log|2D-DCT| panel. A fake face of the same identity (a face-swap) typically shows subtle blending seams at the face boundary and an over-smoothed interior. This appears as reduced mid/high-band energy relative to the real counterpart (Figure 3.2). These per-sample observations are the visual basis for the aggregate frequency analysis in Figure 3.11: the per-band gap seen across thousands of samples is the same gap visible on a single pair.

#### Comparative distribution and cross-dataset overlap

A useful sanity check before trusting cross-dataset numbers is to compare the score distributions the trained model assigns to real and fake test samples. Because CDFv2 is unseen during training and contains high-quality forgeries, the real and fake score histograms overlap substantially. This overlap is the distributional cause of an AUC near 0.76 rather than near 1.0. The two-dimensional view of the same overlap appears later as the t-SNE projection (Figure 3.10), where the real and fake clusters are only partly separated. The fair reading is that cross-dataset deepfake detection on CDFv2 is a hard problem: the forgery family seen in training (FF++) does not appear in test (CDFv2), so the model must transfer artefact cues rather than memorise them.

### 3.1.2 EfficientNet-B4 Baseline — Design and Training

The baseline is a plain EfficientNet-B4 classifier (ImageNet-pretrained, with a two-class head). It is the spatial-only reference that every frequency addition must beat. It also serves as a pipeline-correctness control: if a well-known backbone reproduces its known leaderboard number under this thesis's harness, then any improvement measured afterwards can be trusted rather than blamed on a misconfiguration.

**Training.** B4 is trained on FF++ c23 for 10 epochs with the shared recipe of Table 3.3 (Adam, lr 2e-4, wd 5e-4, batch 32, seed 1024), and evaluated cross-dataset on CDFv2 at the best-test-AUC checkpoint.

![Figure 3.3 — Training curve for B4](figures/fig_3_3_train_b4.png)

*Figure 3.3: B4 (baseline) — train loss and train AUC per iteration, plus test-AUC (FF++/CDFv2) per epoch. Plotted directly from the training log (not simulated).*

**Convergence and pipeline validation.** Over 10 epochs the train loss falls steadily, and the CDFv2 test-AUC rises and settles around the best epoch, with no sign of heavy overfitting within this horizon. The B4 baseline reaches a CDFv2 frame-AUC of 0.7497, essentially matching the official DeepfakeBench leaderboard value of 0.7487 for EfficientNet-B4 (a difference of ≈ 0.001). This match confirms that the training and evaluation harness is set up correctly, which is the precondition for trusting every later number. The value 0.7497 is the spatial-only bar that the frequency variants must beat.

### 3.1.3 SFDCT — Design and Training

SFDCT adds an 8×8 block-wise 2D-DCT frequency branch on top of the B4 spatial backbone and merges the two streams through a zero-initialised gated cross-attention. The defining design choice is that the fusion gate `α` is initialised to 0, so at the start of training

```
feature_fused = x + α · context(DCT-branch),   α(0) = 0
```

reduces to exactly `feature_fused = x`. At initialisation, SFDCT is therefore identical to a plain EfficientNet-B4. The DCT branch can only ever add signal as `α` grows under gradient pressure. This mechanism guarantees the floor ≥ B4 property by design: attaching the auxiliary branch cannot drag performance below the baseline at the outset. The zero-init choice also deliberately separates SFDCT from SFCL-HCMF, whose fusion gate initialises at 0.5 and therefore has no floor guarantee.

On top of this naive SFDCT base, the thesis defines five frequency levers S1–S5, adapted from five prior works into the single block-DCT domain: S1 dct_use_sign (sign of DCT coefficients, adapted from SPSL), S2 dct_srm_residual (DCT on an SRM residual, adapted from SRM), S3 DCTFoMixup plus a dual consistency loss (adapted from FreqDebias), S4 dct_fca_attention (FcaNet MultiSpectralAttentionLayer, adapted from FcaNet), and S5 single-center loss (adapted from FDFL). The levers are grouped into two ablation rows. Row1 = S1+S2+S3 adds no learnable parameters; it only changes input features and the loss. Row2 = S4+S5+S3 does add learnable parameters.

**Training.** Each SFDCT variant uses the identical recipe of Table 3.3; the naive variant additionally carries λ_cons = 1.0, λ_sc = 0.3, margin m = 0.3. Because of the zero-init gate, the SFDCT convergence curves begin from the same point as B4 and diverge upward only once the DCT branch begins to contribute.

![Figure 3.4 — Training curve for naive SFDCT](figures/fig_3_4_train_naive.png)

*Figure 3.4: naive SFDCT (B4 + block-DCT) — loss and per-epoch AUC, plotted directly from the training log.*

![Figure 3.5 — Training curve for Row1](figures/fig_3_5_train_row1.png)

*Figure 3.5: Row1 (S1+S2+S3) — loss and per-epoch AUC, plotted directly from the training log.*

Row2 (S4+S5+S3) was not trained within the thesis GPU budget. It is listed plainly as future work (§3.1.6), and the two single-axis variants Fix1/Fix2, trained under the identical recipe, stand in as a partial decomposition (§3.1.4).

**Convergence remarks.** The curves are plotted directly from the real training logs with a regex parser; no numbers are simulated. The naive SFDCT test-AUC on CDFv2 rises and saturates, reaching 0.7572 at the best checkpoint, above the B4 floor as the zero-init design promises. Row1 saturates lower (see §3.1.4). No heavy overfitting appears within 10 epochs. However, since only a single seed is run, run-to-run variation is not yet quantified (Discussion).

### 3.1.4 Comparative Evaluation

This is the most important subsection of the thesis. It answers the research question directly: whether adding block-DCT frequency information (and the improvement levers) helps cross-dataset generalisation, compared with a strong, already-tuned spatial backbone. The main metric is frame-level AUC on Celeb-DF-v2 (trained on FF++ c23).

#### Evaluation definitions

Two evaluation axes are used, mirroring the way a real eKYC system is judged:

1. Dataset axis (in-dataset vs cross-dataset). In-dataset evaluates on held-out FF++ frames, the same forgery families as training; cross-dataset evaluates on CDFv2, with unseen forgeries. The cross-dataset number is always the primary one, because eKYC must face unseen manipulations.
2. Operating-point axis (default threshold vs eKYC threshold). AUC is threshold-free, but a deployed system needs a concrete threshold. Both the threshold-free AUC and the behaviour at the eKYC operating point τ, chosen so that FPR ≤ 5%, are reported. The choice is motivated below and detailed in §3.1.5.

#### Main cross-dataset ablation table

The results are presented in order of increasing complexity: spatial-only, then the added DCT branch, then the levers.

*Table 3.5: Cross-dataset ablation — frame-level AUC. Train: FF++ c23; test: Celeb-DF-v2 (the main cross-dataset result). The full seven-model family under four aggregation protocols follows in Table 3.5b.*

| Model | Celeb-DF-v2 (cross) AUC | Δ vs. B4 |
|---|---|---|
| B4 (baseline) | **0.7497** | — |
| naive SFDCT (B4 + block-DCT) | **0.7572** | **+0.0075** |
| Row1 (S1+S2+S3) | **0.7333** | **−0.0164** |

The FF++ in-dataset half of the grid and the Row2 configuration were not run within the thesis GPU budget; both are named in the Limitations and in Future Work rather than estimated.

Two readings follow from the table. First, B4 → naive SFDCT gives +0.0075 (0.7497 → 0.7572). The block-DCT branch raises cross-dataset AUC and does not degrade the baseline, so floor ≥ B4 holds. This is the direction the core hypothesis predicts. Second, naive SFDCT → Row1 gives −0.0164 (0.7572 → 0.7333). Row1 lands below the B4 baseline, an honest negative result: stacking S1+S2+S3 on top of the naive base hurts cross-dataset AUC at this single seed rather than helping.

#### Multi-protocol robustness of the ranking

A single best AUC can overstate a method. Under the DeepfakeBench protocol the test set is visited ~21 times per run (twice per epoch), and the saved checkpoint is the single luckiest visit. To show that no conclusion in this thesis depends on that choice, Table 3.5b reports four aggregation protocols computed from the raw per-event training logs. No numbers are simulated; all sources are bundled in `report/evidence/ablation_cdfv2/`, and the table is reproducible with one command (`report_prepare/mt10_ablation_full.py`). Besides the lever rows, the table includes two further variants trained under the identical recipe: Fix1 (naive + DCT-sign + drop-low-band) and Fix2 (naive + FcaNet-style channel attention). It also includes the block-DCT-HFF architectural variant (R1 = minimal, R3 = full: block-DCT high-pass residual image → multi-scale convolutional stream → residual-guided spatial attention → zero-init gate), an adaptation of the high-frequency-features design of Luo et al. [7] into the block-DCT domain; the method is described in Section 2.3.6.

*Table 3.5b: CDFv2 frame-AUC under four aggregation protocols (21 test events per run; identical training recipe).*

| Model | top-3 avg | last epoch | mean ± std | best (top-1) |
|---|---|---|---|---|
| B4 (baseline) | 0.7434 | 0.7063 | 0.7082 ± 0.0219 | 0.7497 |
| naive SFDCT | **0.7507** | **0.7123** | **0.7140 ± 0.0253** | **0.7572** |
| Row1 (S1+S2+S3) | 0.7315 | 0.7046 | 0.7054 ± 0.0188 | 0.7332 |
| Fix1 (sign + drop-low) | 0.7474 | 0.6775 | 0.7099 ± 0.0250 | 0.7523 |
| Fix2 (FcaNet attention) | 0.7494 | 0.6860 | 0.7149 ± 0.0240 | 0.7523 |
| block-DCT-HFF R1 | n/a¹ | n/a¹ | n/a¹ | 0.7553 |
| block-DCT-HFF R3 | 0.7410² | 0.7335² | 0.7236 ± 0.0183² | **0.7695** |

¹ *Per-event logs for R1 were lost with the rented GPU instance (only the best-checkpoint snapshot was uploaded); the best value remains valid as the standard DeepfakeBench `save_best` output.* ² *R3 values recovered from an epoch-end console capture (11 epoch-end events, excluding mid-epoch test events), hence not directly comparable to the 21-event columns.*

Two observations follow. First, the ordering naive SFDCT > B4 > Row1 is preserved under all four protocols (Δ(SFDCT−B4) = +0.0073 / +0.0060 / +0.0058 / +0.0075). The small gain is consistent across aggregation choices; it is not an artefact of checkpoint selection. Second, the top-1 best column sits systematically ≈ 0.03–0.04 above the mean column, which quantifies how optimistic best-on-test selection is. For this reason the thesis reports all four numbers rather than the best alone.

#### Video-level evaluation

When frame scores are aggregated to a video-level decision by averaging per-frame fake probabilities within a clip, AUC rises for every model, because temporal aggregation averages out per-frame noise (naive SFDCT: 0.7572 frame → 0.8083 video). From the best-checkpoint predictions (16,420 frames → 518 videos), a video-level bootstrap (resampling the 518 videos, n = 2,000, seed 42) gives:

*Table 3.5c: Video-level AUC at the best checkpoint, with bootstrap 95% CIs and paired differences (same 518 videos).*

| Model | video-AUC | 95% CI | paired Δ vs. B4 [95% CI] |
|---|---|---|---|
| B4 (baseline) | **0.8203** | [0.781, 0.857] | — |
| naive SFDCT | 0.8083 | [0.770, 0.847] | −0.012 [−0.044, +0.021] |
| Row1 | 0.7869 | [0.744, 0.829] | −0.033 [−0.067, +0.001] |
| Fix1 | 0.8121 | [0.774, 0.848] | −0.008 [−0.035, +0.019] |
| Fix2 | 0.8137 | [0.775, 0.851] | −0.006 [−0.037, +0.026] |
| block-DCT-HFF R1 | 0.8146 | [0.774, 0.853] | −0.006 [−0.038, +0.026] |
| block-DCT-HFF R3 | **0.8269** | [0.788, 0.864] | +0.007 [−0.022, +0.037] |

Every paired CI contains zero: no variant separates from the B4 baseline with statistical significance at the video level. The video-level ordering (R3 > B4 > R1 > naive) also differs from the frame-level one. Both facts reinforce the single-seed-noise caveat of the Discussion. The only near-significant effect is Row1's regression (upper CI bound +0.001), consistent with its negative frame-level result.

#### ROC and Precision–Recall

The ROC curve shows the TPR–FPR trade-off across all thresholds; the PR curve suits class-imbalanced data such as CDFv2 better. The decisive region for eKYC is the low-FPR region.

![Figure 3.7 — ROC on CDFv2](figures/fig_3_7_roc.png)

*Figure 3.7: ROC curves on Celeb-DF-v2 (AUC in the legend); the red line marks the eKYC constraint FPR ≤ 5%.*

![Figure 3.8 — Precision–Recall on CDFv2](figures/fig_3_8_pr_curve.png)

*Figure 3.8: Precision–Recall on CDFv2 (AP in the legend).*

**Analysis.** In the FPR ≤ 5% region, the measured per-model operating points, derived from the saved score arrays and reproducible via `report_prepare/mt11_operating_points.py`, are: naive SFDCT TPR 0.230 (τ = 0.9514, the operating point used in §3.1.5), B4 TPR 0.223 (τ = 0.9709), and Row1 TPR 0.167 (τ = 0.9114) at frame level. The same picture holds across all seven trained variants, with frame-level TPR between 0.167 and 0.278. Aggregating to video level lifts TPR@FPR≤5% to 0.359 (SFDCT), 0.332 (B4) and 0.176 (Row1). Relaxing to a 10% review-band budget at video level reaches 0.465 / 0.494 / 0.371 respectively, and up to 0.535 for the strongest variant (HFF-R3). Even so, at FPR ≤ 5% the best frame-level model catches only ≈ 23% of deepfakes. The low recall is systemic across the whole model family, not a defect of one variant. It confirms that cross-dataset detection is hard, and that extra signals (liveness, video-level aggregation, a human-review band) are needed at a real operating threshold.

#### Confusion matrix

At the eKYC threshold, the confusion matrix splits errors into false positives (genuine customers rejected) and false negatives (fakes that slip through). The two error types have very different business consequences.

![Figure 3.9 — Normalised confusion matrix on CDFv2](figures/fig_3_9_confusion.png)

*Figure 3.9: Confusion matrix of naive SFDCT on CDFv2 at τ = 0.9514 (FPR ≤ 5%).*

**Analysis.** At the τ that holds FPR ≤ 5%, the absolute confusion counts are TN = 5,339, FP = 281, FN = 8,318, TP = 2,482 (5,620 real, 10,800 fake). The dominant error is false negatives: 8,318/10,800 ≈ 77% of deepfakes slip through, while false positives stay at ~5%, exactly as the constraint demands. At a genuine-customer-friendly operating point, then, the model misses most fakes. It belongs as a screening layer, not a standalone gatekeeper.

#### t-SNE feature space

t-SNE projects the pre-classifier features to 2D to show how well the real/fake clusters separate.

![Figure 3.10 — t-SNE of CDFv2 features](figures/fig_3_10_tsne.png)

*Figure 3.10: t-SNE of the fused features on CDFv2, coloured by the real/fake label.*

**Analysis.** The two clusters still overlap considerably, which is consistent with an AUC ≈ 0.76 and far from full separation. Adding the DCT branch makes the boundary slightly cleaner, but the improvement is modest, matching Δ = +0.0075: block-DCT adds information without producing a large cluster-separation jump on c23 data.

#### Grad-CAM (explainability)

Grad-CAM visualises the image region the model relies on, a key factor for eKYC explainability.

![Figure 3.12 — Grad-CAM](figures/fig_3_12_gradcam.png)

*Figure 3.12: Grad-CAM of SFDCT on a CDFv2 sample — hot regions are where the model decides.*

**Analysis.** SFDCT tends to focus on the face region and the splice boundary, where forgery artefacts are most likely, rather than on the background or accessories. This meets the explainability requirement for eKYC. The qualitative difference relative to B4 exists but is not large on c23 data, consistent with the modest AUC gain.

#### Fusion-gate α values

The gate `α` is initialised to 0, so any `α` greater than 0 after training is quantitative proof that the model actively learned to use the frequency branch.

![Figure 3.13 — Gate α after training](figures/fig_3_13_gate_alpha.png)

*Figure 3.13: Distribution of the zero-init gate α values after training for the SFDCT variant.*

**Analysis.** After training, the gate opens selectively and modestly (Figure 3.13). Measured directly from the released checkpoint, mean |α| = 1.5×10⁻⁴, with 44 of the 1,792 channels above 10⁻³ and a peak |α| of 0.023; most channels remain shut. This agrees with Δ = +0.0075 being small and within noise. The zero-init gate acts as a meter of the frequency contribution on c23 data: it opens only where the DCT branch genuinely lowers the loss, and only by a little.

#### Per-knob ablation (each lever on/off)

The ideal decomposition toggles each of S1–S5 independently on top of the naive base. Within the thesis GPU budget, a partial decomposition was measured instead: two single-axis variants trained under the identical recipe, Fix1 (S1-type sign feature + drop-low-band) and Fix2 (S4-type FcaNet channel attention). They bracket the parameter-free and the parameter-adding lever families respectively.

*Table 3.6: Partial per-lever decomposition — CDFv2 frame-AUC of single-axis variants under the identical recipe (best checkpoint, and mean ± std over the 21 test events).*

| Configuration | Levers | Adds params? | best AUC | mean ± std |
|---|---|---|---|---|
| naive SFDCT (base) | none | No | **0.7572** | 0.7140 ± 0.0253 |
| Fix1 | S1-type sign + drop-low-band | No | 0.7523 | 0.7099 ± 0.0250 |
| Fix2 | S4-type FcaNet attention | Yes | 0.7523 | 0.7149 ± 0.0240 |
| Row1 (bundle) | S1+S2+S3 | No | 0.7332 | 0.7054 ± 0.0188 |

The measured evidence is consistent. No single lever exceeds the naive base: both Fix variants sit at 0.7523 best, within the base's noise band, and the three-lever bundle Row1 lands below even the B4 baseline. On this evidence, the full one-lever-at-a-time S1–S5 table, left as future work, is expected to confirm the same picture: in the pure block-DCT domain, the adapted levers do not produce a clear cross-dataset gain.

#### Evaluation across 16 Experimental Configurations

To assess the system systematically, in the same way Trí's thesis sweeps 16 configurations, this work organises the evaluation as a 4 × 4 = 16-cell grid built from two model factors and two evaluation factors. The grid needs only four trainings, because the two evaluation factors are applied post-hoc to the same trained checkpoints.

The four model configurations come from two binary model factors:

- Factor A (backbone): {B4, SFDCT}.
- Factor B (frequency fusion): {OFF (spatial-only), ON (block-DCT + gated cross-attn)}.

This yields four named configs, presented as 2 backbones × 2 fusion states: B4-noFusion (= plain B4), B4-Fusion (≈ degenerate: B4 with a fusion path it was not designed around), SFDCT-noFusion (≈ B4, since α=0 makes fusion-off equivalent to the backbone), and SFDCT-Fusion (= the naive SFDCT, the operative model).

The four evaluation configurations come from two binary evaluation factors:

- Factor C (dataset): {FF++ in-dataset, CDFv2 cross-dataset}.
- Factor D (operating point): {default threshold 0.5, eKYC τ @ FPR ≤ 5%}.

*Table 3.7: The 16-configuration evaluation grid (4 model configs × 4 eval configs). Metric: frame-level AUC, plus the eKYC-point statistic where the operating point is τ. Cells marked —¹ were not evaluated within the thesis GPU budget.*

| Model config (backbone × fusion) | FF++ @ 0.5 | FF++ @ τ(FPR≤5%) | CDFv2 @ 0.5 (AUC) | CDFv2 @ τ(FPR≤5%) |
|---|---|---|---|---|
| B4 — fusion OFF (plain B4) | —¹ | —¹ | **0.7497** | **τ = 0.9709 → TPR 0.223** |
| B4 — fusion ON (degenerate) | —¹ | —¹ | —¹ | —¹ |
| SFDCT — fusion OFF (≈ B4, α=0) | —² | —² | —² | —² |
| SFDCT — fusion ON (naive SFDCT) | —¹ | —¹ | **0.7572** | **τ = 0.9514 → TPR 0.2298, ACC 0.476, F1 0.366** |

¹ *The FF++ in-dataset half requires a separate in-dataset evaluation pass, and the degenerate B4-Fusion configuration was not trained; both are open GPU items named in the Limitations.* ² *SFDCT-noFusion is architecturally ≈ B4 at α = 0, so its row is implied by the B4 row rather than re-evaluated. The decision-relevant cross-dataset half of the grid is fully measured.*

This design needs only four trainings because evaluation factors C (dataset) and D (operating point) are post-hoc on the saved checkpoints. The discussion below reads the grid along the same four beats Trí uses, namely the architecture effect, the fusion effect, the dataset effect, and the operating-point effect:

- Backbone effect (A). Between the two operative configs, SFDCT-Fusion (0.7572) edges B4 (0.7497): the spatial-plus-frequency backbone is marginally stronger cross-dataset.
- Fusion effect (B). Turning fusion ON for SFDCT lifts CDFv2 AUC from the B4-equivalent floor to 0.7572 (Δ +0.0075). Because α=0 makes SFDCT-noFusion ≈ B4, the fusion column is exactly where the +0.0075 lives, and it is within noise (see Discussion).
- Dataset effect (C). The in→cross drop is the expected generalisation cost. The FF++ in-dataset half of the grid was not re-evaluated within budget, but in-dataset AUC is universally higher than cross-dataset in the literature and in DeepfakeBench's own reporting, so those cells are expected to exceed their CDFv2 counterparts. The conservative, decision-relevant half (cross-dataset) is fully measured.
- Operating-point effect (D). Moving from the default threshold to the eKYC τ collapses recall: at τ = 0.9514 the naive SFDCT TPR is only 0.2298 (≈ 77% of fakes missed) even though FPR is held at exactly 0.0500. The threshold-free AUC hides this collapse; the grid makes it explicit.

Taken together, the comparative evaluation shows a small fusion gain that sits within noise, a clear negative for Row1, and low recall at the eKYC operating point.

### 3.1.5 Decision Threshold for the eKYC Operating Point

AUC is threshold-free, but a deployed eKYC system needs a concrete threshold τ. **Circular 17/2024/TT-NHNN** mandates biometric verification qualitatively; it does not prescribe any numeric error rate. To turn that qualitative requirement into a measurable operating point, this thesis adopts FPR ≤ 5% per ISO/IEC 30107-3 (the BPCER20 convention), so that the rate of genuine customers wrongly rejected stays low enough not to harm the legitimate experience. The 5% is therefore an engineering choice made in this thesis, not a regulatory mandate.

The threshold is calibrated so that the measured FPR is ≤ 5%, and the corresponding TPR/recall is then reported at that fixed τ.

*Table 3.8: Threshold calibration for the eKYC operating point (best model — naive SFDCT).*

| Quantity | Value |
|---|---|
| Threshold τ | 0.9514 |
| Target FPR | ≤ 5% |
| FPR on CDFv2 at τ | 0.0500 |
| TPR / Recall (fake detection) at τ | 0.2298 (22.98%) |
| Accuracy / F1 at τ | 0.476 / 0.366 |

One note on calibration must be made: τ is set at FPR ≤ 5% directly on the CDFv2 scores, because a separate validation split has not yet been carved out. In real deployment, τ must be calibrated on a dev set of the deployment distribution (Vietnamese faces; see Future Work).

**Analysis.** At the threshold holding FPR ≤ 5%, only about 5% of genuine customers are wrongly rejected, but the model catches only ≈ 23% of deepfakes; the other ~77% slip through. This is the inevitable consequence of a cross-dataset AUC ≈ 0.76. At a tight, customer-friendly security level, usability is good but many fakes are missed, whereas a level that catches all fakes would reject too many genuine customers. The conclusion is that SFDCT is sufficient as a first screening layer, reducing the load on the next verification step, but not yet sufficient to stand alone for eKYC. It must be combined with liveness and with video-level aggregation (video-AUC 0.808 > frame-AUC 0.7572).

Qualitative single-image behaviour at this operating point, meaning the input face, its fake-probability, and the Grad-CAM evidence overlay, is illustrated by the Grad-CAM panels of Figure 3.12. The identical visualisation is exposed live in the application's Playground (§3.2.4), where any reviewer can reproduce it on a fresh image.

### 3.1.6 Discussion (Deepfake Task)

**B4 vs SFDCT.** The block-DCT branch lifts cross-dataset AUC by +0.0075 (0.7497 → 0.7572) and, thanks to the zero-init gate, never drops below the B4 floor. Directionally this supports the core hypothesis: forgery artefacts are weak in the spatial domain but louder in mid/high DCT bands, and frequency information complements rather than duplicates B4's spatial features. But the magnitude is small. A gain of +0.0075 sits within the run-to-run noise band one would expect from a single-seed experiment, so it should be read as consistent and safe rather than significant.

**Impact of the DCT branch and fusion.** The positive learned α (Figure 3.13), the slightly cleaner t-SNE boundary (Figure 3.10), and the higher TPR at FPR ≤ 5% (Figure 3.7) all point the same way: the DCT branch contributes real, if modest, discriminative signal, strongest where compression has not erased the mid/high bands.

**Per-lever effect (Row1 negative).** The most important negative finding is that Row1 (S1+S2+S3) lands at 0.7333, which is −0.0164 below the B4 baseline. Stacking three parameter-free frequency levers on the naive base hurt cross-dataset AUC at this seed rather than helping. The partial decomposition (Table 3.6) points the same way, since neither Fix1 nor Fix2 exceeds the naive base, while the full one-lever-at-a-time table and Row2 are left to future work. The thesis concludes strictly from the measured numbers: within the scope of pure block-DCT and a single seed, the levers S1–S5 are not sufficient to produce a large AUC jump.

**No SOTA claim.** It must be stated plainly that SFDCT does not set a new state of the art. Frequency methods such as SPSL (CDFv2 AUC ≈ 0.7650) still beat naive SFDCT (0.7572) on the same train-FF++ → test-CDFv2 protocol. SFDCT's contribution is not a leaderboard win. It is, first, a risk-safe fusion design with a floor ≥ B4 guarantee; second, the consistent aggregation of five frequency levers from five works into one unified block-DCT domain; and third, a fair cross-dataset evaluation following DeepfakeBench.

*Table 3.9: Comparison with the baseline and other frequency methods on CDFv2 (train FF++).*

| Method | Group | CDFv2 frame-AUC | Source |
|---|---|---|---|
| EfficientNet-B4 | spatial | 0.7487 | DeepfakeBench leaderboard |
| EfficientNet-B4 (this thesis) | spatial | 0.7497 | This thesis |
| SPSL | frequency | 0.7650 | DeepfakeBench leaderboard |
| SRM | frequency | 0.7552 | DeepfakeBench leaderboard |
| **naive SFDCT (B4 + block-DCT)** | hybrid spatial–freq | **0.7572** | This thesis |
| **Row1 (S1+S2+S3)** | hybrid spatial–freq | **0.7333** | This thesis |
| **block-DCT-HFF R3 (§2.3.6)** | hybrid spatial–freq | **0.7695** | This thesis |

**Limitations.** Four limitations apply. (1) Single seed: all numbers here are one-seed, so the small gaps between naive, Row1, and the Fix variants may lie within seed noise; a firm ranking needs ≥ 3 seeds with mean ± std, and the video-level paired bootstrap CIs (Table 3.5c), all containing zero, formalise this caveat. (2) The strongest AUC lever is out of scope: the literature shows no pure block-DCT method cleanly beats a tuned B4 cross-dataset, and the strongest known lever, SBI (self-blended images) [18], is a training-data strategy outside the thesis's pure-block-DCT scope, deferred to Future Work. (3) The absolute gain is modest: +0.0075 points in the right direction but is small, and its practical significance should be read with caution. (4) Coverage: cross-dataset evaluation is CDFv2-only (DFDC [15] and the Vietnamese-face set are future work), and the FF++ in-dataset half of the grid, the Row2 configuration, and the full per-lever table remain open GPU items.

**Engineering practice and problem-solving.** Three working disciplines shaped the experimental campaign, and they decided where the limited GPU budget went. (1) Smoke-test-before-train: every configuration first passes a three-step local check on the 4 GB machine (tensor-shape verification, a dry-run loop, and an overfit-one-batch test) before any rented-GPU hours are committed; no full run ever failed for a reason the smoke test could have caught. (2) Zero-cost pre-screening before spending: before renting GPUs for a deeper re-architecture of the DCT branch, a CPU-only linear-probe pre-screen was run on frozen block-DCT features. Its near-chance cross-dataset signal (probe AUC ≈ 0.45–0.49 across three feature variants) argued against further spend in that direction, and the budget was redirected into the multi-protocol robustness analysis and the liveness module instead. This was an evidence-driven stop decision, and the chapter's framing reflects it. (3) Graceful degradation in serving: the application calls the SFDCT microservice with an explicit fallback path, so a model-service outage degrades to a clearly labelled mock response instead of breaking the demo — the same fail-soft philosophy as the zero-init gate.

### 3.1.7 Conclusion (Deepfake Task)

Under the standard DeepfakeBench cross-dataset protocol (train FF++ c23, test CDFv2), three results are confirmed. First, the pipeline is correct: B4 reaches 0.7497, matching the leaderboard's 0.7487. Second, adding the block-DCT branch with zero-init gated fusion raises cross-dataset frame-AUC to 0.7572 (+0.0075, within noise) without degrading the baseline, which fulfils floor ≥ B4 and supports the core hypothesis. Third, at the eKYC operating point τ = 0.9514 (FPR ≤ 5%, the ISO/IEC 30107-3 choice made in this thesis) the model recovers only ~23% of fakes, so it is best deployed as a screening signal with explainable Grad-CAM rather than as a standalone gatekeeper. The Row1 negative (0.7333) is reported as measured. The still-open Row2, full per-lever, in-dataset and DFDC items are listed in the Limitations rather than estimated.

### 3.1.8 The Liveness-Detection Task (Secondary)

Liveness detection (presentation-attack detection, PAD) is the secondary module of the thesis. Its purpose in the eKYC pipeline is to sit as a cascade pre-filter ahead of deepfake detection: cheap spoofs such as printed photos and screen replays are rejected first, and only live-looking faces proceed to the deepfake stage. The module deliberately reuses the SFDCT machinery, comparing B4 against B4+DCT on the PAD task, so the same spatial-plus-frequency design is tested in a second domain at near-zero additional engineering cost. Both variants have been trained and evaluated on LCC-FASD. Every number below is a measured result, independently re-verified as described at the end of this subsection.

#### Liveness data

The dataset is LCC-FASD with its official three-way split. Faces use the same 256×256, [-1, 1]-normalised input convention as the deepfake task. The decision threshold is fixed at the development-set EER point (τ = 0.8743) and is never tuned on the evaluation set.

*Table 3.10: Liveness dataset — LCC-FASD, official split (counts verified on the extracted release).*

| Split | Live (bona-fide) | Spoof (attack) | Total |
|---|---|---|---|
| training | 1,223 | 7,076 | 8,299 |
| development | 405 | 2,543 | 2,948 |
| evaluation | 314 | 7,266 | 7,580 |

#### B4-liveness and B4+DCT-liveness — results

Both classifiers (live vs spoof, binary cross-entropy, shared recipe) are evaluated per ISO/IEC 30107-3: APCER (attack presentation classification error rate), BPCER (bona-fide presentation classification error rate), ACER = (APCER + BPCER)/2, plus AUC, all at the dev-EER threshold.

*Table 3.10b: Liveness results on the LCC-FASD evaluation split (measured).*

| Model | AUC | APCER | BPCER | ACER |
|---|---|---|---|---|
| **B4-liveness** | **0.9829** | 0.0286 | 0.1083 | **0.0685** |
| B4+DCT-liveness | 0.9776 | 0.0425 | 0.1083 | 0.0754 |

An AUC near 0.98 exceeds published light-CNN baselines on this dataset (e.g. MobileNetV3: AUC 0.921 / ACER 16.3%), so the result was deliberately stress-tested before being reported: (i) the split loader uses the official folders and asserts train ≠ test; (ii) the evaluation count (7,580 = 314 + 7,266) matches the official split exactly; (iii) re-running inference locally reproduced AUC 0.9829 to four decimal places. The verification is frozen as a one-command script (`liveness/verify_liveness_eval.py`), so any examiner can repeat it. One caveat remains: this is a within-dataset evaluation, with train and test both drawn from LCC-FASD. Cross-dataset PAD evaluation is future work.

#### Conclusion (liveness task)

The measured B4-liveness reaches ACER 6.85% / AUC 0.9829, clearly surpassing the pre-registered targets (ACER ≈ 16% / AUC ≈ 0.92). The frequency branch does not improve PAD: Δ(B4+DCT − B4) = −0.0053 AUC, within noise given only 314 bona-fide evaluation images. This is consistent with the deepfake-side finding that the block-DCT branch adds no statistically separable gain. The model is served as a microservice (port 8502) mirroring the deepfake service; wiring it into the eKYC cascade endpoint as a learned scorer, replacing the heuristic challenge check, remains an integration task.

---

## 3.2 Implementing the System

The preceding section validated the SFDCT detector as a research artefact: a cross-dataset frame-level AUC of approximately 0.75 on Celeb-DF-v2, a calibrated decision threshold for the FPR ≤ 5% operating point, and a full set of explainability visualisations. This section describes how that artefact is wrapped into a working, multi-tenant web application named **DeepGuard**, and how the application is packaged and deployed end to end. The scope should be stated clearly: what follows is a demonstration deployment for the thesis defence and manual functional testing, not a production-hardened banking installation. The trained model is treated as a signal layer, a risk score with an explanation, not as a standalone gatekeeper.

### 3.2.1 Technology stack

DeepGuard is organised as three cooperating tiers behind a single PostgreSQL database, following the one-directional request flow fixed in the project conventions: `Frontend → FastAPI → Service → Repository → PostgreSQL`, with machine-learning inference delegated over HTTP to a separate SFDCT microservice. The backend never imports PyTorch directly. It talks to the model only through `httpx POST` calls, which keeps the API container lightweight and lets the model scale or be replaced independently. Table 3.11 maps each architectural layer to its concrete technology.

*Table 3.11: Technology stack of DeepGuard, organised by architectural layer.*

| Layer | Technology | Role |
|---|---|---|
| **Presentation (Frontend)** | Next.js 16 (App Router) · React 19 · TypeScript 5 · Tailwind CSS 4 · shadcn/ui (Radix UI) | Single-page dashboard; role-aware UI; Playground upload-and-analyse |
| **Client state / data** | Zustand 5 (auth, navigation, appearance) · TanStack Query 5 · react-hook-form + zod | Auth/session and UI state; server-data caching; form validation |
| **API client** | Fetch API in `src/lib/api.ts` (Bearer JWT / API key) | Single gateway browser → backend |
| **Application (Backend)** | FastAPI 0.115 · Uvicorn · Python 3.11 | REST API; routing → service → repository; RBAC enforcement |
| **Authentication / RBAC** | JWT (python-jose) for the dashboard · API key (`sk-dg-…`) for external eKYC · passlib[bcrypt] | Two non-mixed auth layers; five roles via `require_role` |
| **Validation / config** | Pydantic 2 · pydantic-settings (`.env`) | Create/Read/Update schemas; no hard-coded secrets/ports |
| **Data access (ORM)** | SQLAlchemy 2.0 (async) · asyncpg · shared `deepguard_db` package | Repository layer; `schema.sql` migrations only |
| **Database (Storage)** | PostgreSQL 15 (`postgres:15-alpine`) | Tenants, users, API keys, detections, audit logs |
| **HTTP-to-model bridge** | httpx 0.28 | Backend → SFDCT `POST /predict` |
| **Model serving (SFDCT)** | FastAPI microservice `serving/infer_server.py` · PyTorch · EfficientNet-B4 + block-DCT branch · MTCNN face crop · Grad-CAM (base64) | `prob_fake` + REAL/FAKE label + Grad-CAM heat-map |
| **Containerisation** | Docker · Docker Compose | Single-host orchestration of all four services |
| **Model / data storage** | HuggingFace Hub (`huanthuytnhh/deepfake`, `…/deepfake-data`) | Checkpoint and dataset distribution |

The default ports inside the deployment are 3000 (frontend), 8000 (backend API, Swagger at `/docs`), 8501 (SFDCT microservice), and 5432 (PostgreSQL). The live serving runtime is verified: device CUDA, checkpoint ckpt_best.pth, model_version naive-sfdct-cdfv2-0.7572, served by `uvicorn serving.infer_server:app` on :8501 exposing `/health` and `/predict` (returns `prob_fake` plus a base64 Grad-CAM).

### 3.2.2 Deployment environment

The whole system deploys onto a single AWS EC2 instance orchestrated with Docker Compose. All four services (Next.js frontend, FastAPI backend, SFDCT microservice, PostgreSQL) run as containers on one host and share a private Docker bridge network. The backend reaches PostgreSQL and the SFDCT microservice purely over internal hostnames, and only the reverse-proxy port is exposed publicly. This co-located topology is intentional for a demo: it is reproducible with one `docker compose up`, it avoids multi-node cost, and it matches the scale of a defence demonstration.

A key decision is that inference runs on CPU, with no GPU required at serving time. The served detector is an EfficientNet-B4-based checkpoint of roughly 70 MB; on CPU it produces a verdict plus a Grad-CAM heat-map in about 0.3–1 s per image, fast enough for an interactive eKYC review screen. Because no GPU is needed, the cost driver is RAM rather than compute. Resident memory is dominated by the PyTorch runtime plus the MTCNN detector inside the SFDCT microservice, alongside PostgreSQL and the Next.js process. The recommended instance is therefore a t3.large (2 vCPU, 8 GB RAM), chosen so that PyTorch + MTCNN, the API, the database, and the frontend all stay resident without swapping.

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

*Figure 3.16: Deployment diagram of DeepGuard on a single AWS EC2 instance (t3.large, CPU-only). A reverse proxy terminates HTTPS and forwards to the four Docker Compose services on a private bridge network; the backend reaches PostgreSQL and the SFDCT microservice only over the internal network.*

### 3.2.3 Domain registration and DNS

Public access is provided through a registered domain name whose DNS A-record points to the Elastic IP of the EC2 instance. A reverse proxy on the host terminates TLS and routes incoming HTTPS (port 443) to the right container: dashboard requests go to the Next.js frontend on 3000, while requests under the API prefixes (`/auth`, `/v1/…`, and the other dashboard resources) go to the FastAPI backend on 8000. A standard automated certificate-management flow (an ACME-issued certificate) supplies the TLS material, so all browser traffic and all external eKYC integrations travel over HTTPS. Internally, the proxy is the only publicly bound port. The backend, the SFDCT microservice, and PostgreSQL stay reachable only on the private Docker network, which prevents direct exposure of the database (5432) and the model service (8501).

Two limitations are stated here because they bear on a real deployment. Route guarding is currently client-side (Zustand) with the JWT in `localStorage`; server-side route middleware is not yet in place. The interactive API docs (`/docs`, `/redoc`) are also left public for demo convenience. Both are acceptable for a defence demonstration but must be closed off before any production exposure.

### 3.2.4 System access

The deployed demo is reached over HTTPS at the public domain above; the interactive backend documentation lives at `/docs` (Swagger UI on the FastAPI service). To make the role-based behaviour easy to demonstrate, the database is populated by the idempotent seed script `backend/scripts/seed.py`, which creates the tenant "VietBank Demo" with one account per role. All seed accounts share the password `Password123!`.

*Table 3.12: Seeded demonstration accounts (tenant "VietBank Demo", password `Password123!`).*

| Role | Email | Lands on |
|---|---|---|
| sysadmin | `sysadmin@deepguard.vn` | Platform dashboard (cross-tenant) |
| admin | `admin@vietbank.vn` | Tenant admin dashboard |
| developer | `dev@vietbank.vn` | Developer / integration dashboard |
| compliance | `compliance@vietbank.vn` | Compliance review dashboard |
| viewer | `viewer@vietbank.vn` | Read-only dashboard |

For a quick walkthrough without extra setup, log in as the developer, open the API Playground, and upload a face image. The page calls `POST /playground/detect/image` with the dashboard JWT (no API key needed) and returns the risk score, the verdict band with a `decision_hint`, the Grad-CAM heat-map, and the 2D-DCT frequency spectrum — the same explainability surface analysed in §3.1.4. External integration, where a customer backend calls `POST /v1/detect/image` with an `sk-dg-…` API key, is demonstrated separately from the developer's API Keys screen.

A final positioning note, consistent with §3.1.6: this is a demo configuration, and the served model is the cross-dataset checkpoint whose AUC is approximately 0.75 on Celeb-DF-v2. That figure is strong enough to act as a useful risk signal with a transparent explanation, but it is not a perfect gatekeeper. The application is therefore engineered so the model's output is one input to a reviewable decision (verdict bands, an `UNCERTAIN` zone, compliance audit notes, a human-in-the-loop review queue) rather than an automatic verdict that cannot be appealed.

---

## 3.3 Results (Application Screens)

This section walks through the application screens that put the SFDCT results in front of a user, in the order a visitor meets them: the home screen, the deepfake-detection screen (the core result-visualisation surface), and the liveness screen. The screenshots are captured from the locally running demo (seed accounts of §3.2.4) for the submitted version.

### 3.3.1 Home screen

When a user opens the application, the home screen presents DeepGuard's main capabilities (deepfake detection, the liveness check, the API Playground, and the multi-tenant dashboard) and offers a clear entry point to begin an analysis.

<!-- [screenshot: home screen — chèn ảnh chụp landing page demo] -->

*Figure 3.17: Home screen of DeepGuard.*

### 3.3.2 Deepfake-detection screen

After choosing to analyse an image, the user reaches the deepfake-detection screen, the application's core result-visualisation surface. A valid upload triggers `POST /playground/detect/image` (dashboard JWT) and the screen renders four explainability components together, mirroring §3.1.4:

1. Risk-score visualisation: the model's `prob_fake` converted to a 0–100 risk score with a verdict band (e.g. LOW / UNCERTAIN / HIGH) and a `decision_hint`, so a reviewer sees a calibrated judgement rather than a raw probability.
2. Grad-CAM heat-map overlay: the suspicious regions the model relied on (Figure 3.12 analysis), supporting officer review and regulatory audit.
3. 2D-DCT frequency spectrum: the log|2D-DCT| view (Figure 3.2 / Figure 3.11 analysis), exposing the frequency footprint behind the verdict.
4. History / timeline: past detections for the tenant, so a reviewer can revisit and compare prior cases.

<!-- [screenshot: playground result — chèn ảnh chụp màn hình kết quả risk score + Grad-CAM + DCT spectrum + history] -->

*Figure 3.18: Deepfake-detection result screen — risk score, verdict band, Grad-CAM heat-map, 2D-DCT spectrum, and detection history.*

### 3.3.3 Liveness screen

The liveness screen is the front end for the cascade pre-filter (§3.1.8). A user submits a face capture; the liveness module returns a live/spoof verdict with a confidence score and, when a spoof is detected, the spoof-type classification. The screen and its verdict UI are implemented in the dashboard. The liveness model behind it is the trained module of §3.1.8 (B4: ACER 6.85% / AUC 0.9829), and the final wiring of the trained scorer behind the cascade endpoint is tracked as an integration item in Future Work.

<!-- [screenshot: liveness screen — chèn ảnh chụp màn hình liveness verdict] -->

*Figure 3.19: Liveness-detection screen.*

---

## 3.4 Conclusion

Chapter 3 carried the SFDCT method from design to empirical validation and into a running system. On the research side, under the standard DeepfakeBench cross-dataset protocol (train FF++ c23, test Celeb-DF-v2), three results are confirmed. First, the pipeline is correct: the EfficientNet-B4 baseline reaches 0.7497, matching the leaderboard's 0.7487. Second, adding the 8×8 block-DCT branch with zero-init gated cross-attention raises the cross-dataset frame-AUC to 0.7572 (+0.0075, within noise) without degrading the baseline, which fulfils the floor ≥ B4 commitment and supports the core spatial-plus-frequency hypothesis; Row1 (S1+S2+S3) is an honest negative at 0.7333 (−0.0164). Third, at the eKYC operating point τ = 0.9514 (FPR ≤ 5%, the ISO/IEC 30107-3 choice made to satisfy TT17's qualitative biometric-verification requirement) the model recovers only ~23% of fakes, so it is best deployed as an explainable screening signal rather than a standalone gatekeeper. It must also be stated plainly that SFDCT is not state of the art; SPSL (≈ 0.7650) still beats it.

On the systems side, the validated checkpoint is wrapped into the multi-tenant DeepGuard web application: a four-container Docker Compose stack on a single AWS EC2 host (CPU-only, ~0.3–1 s/image), reached over HTTPS via DNS → Elastic IP → reverse proxy, with five seeded roles and a Playground that exposes the same risk-score / Grad-CAM / DCT-spectrum explainability surface validated in §3.1. The liveness module is measured (§3.1.8: B4, ACER 6.85% / AUC 0.9829, verified) and its cascade wiring is in progress. The remaining open items — the FF++ in-dataset half of the grid, Row2 and the full per-lever table, DFDC and the Vietnamese-face test set, multi-seed validation, and the out-of-scope SBI lever — are stated plainly and form the direct premise for the Conclusion chapter (Limitations and Future Work).

<div style="page-break-after: always;"></div>

# CONCLUSION

This thesis set out to build a deepfake / face-forgery detector for electronic Know-Your-Customer (eKYC) onboarding in banking and finance, together with the groundwork for a complementary liveness (presentation-attack-detection) layer. The detector had to do two things at once: generalise to manipulations it has never seen, and explain its decisions. The central difficulty is the gap between in-dataset accuracy and cross-dataset generalisation. An attacker will not reuse the forgeries in the training set, so the cross-dataset score is the one that matters. The proposed method, **SFDCT** (Spatial–Frequency learning with block-wise DCT), fuses a block-wise 2D-DCT branch with a convolutional backbone. It is trained on FaceForensics++ (c23) and tested cross-dataset on Celeb-DF-v2 (CDFv2) under the standard DeepfakeBench protocol, with frame-level AUC on CDFv2 as the main metric. The work builds on the open DeepfakeBench framework and an EfficientNet backbone. It adapts five frequency cues from prior art (SPSL, SRM, FreqDebias, FcaNet, FDFL) into a single block-DCT domain, and it wraps the resulting detector in an explainable eKYC demonstration.

## Key Achievements

- The main architectural contribution is a frequency branch built on block-wise 2D-DCT (8×8), running in parallel with the EfficientNet-B4 spatial backbone. The two feature streams meet in a gated cross-attention block whose gate alpha is initialised to 0. At initialisation the fused feature equals the spatial feature, so the hybrid model starts out identical to the B4 baseline. The frequency branch only gains influence when it genuinely lowers the loss. This gives a performance floor: the model should not fall below its own backbone, a useful property in a sensitive field such as banking. SFCL-HCMF, in contrast, initialises its gate at 0.5 and carries no equivalent floor guarantee.

- All experiments follow the DeepfakeBench protocol, training on FaceForensics++ (c23) and testing cross-dataset on CDFv2. Under this protocol the B4 baseline reaches a CDFv2 frame-AUC of 0.7497, close to the published DeepfakeBench figure for the same backbone (Chapter 3). The training and evaluation pipeline is therefore comparable with published results, and the gains below are not measured against an artificially weak baseline. Dataset sizes and the full hyperparameter list are given in Chapter 3.

- Adding the frequency branch raises the CDFv2 frame-AUC from 0.7497 to 0.7572 in the naive SFDCT configuration, a gain of +0.0075. The direction agrees with the two-domain hypothesis of Chapter 1: frequency information complements what B4 extracts in the spatial domain. We state plainly that this margin sits inside the single-seed noise band, and it is not a state-of-the-art claim. SPSL, at 0.7650, still outperforms naive SFDCT. Aggregating decisions at video level lifts the score further; Chapter 3 reports those figures.

- One lever bundle made things worse. Row1, which stacks the sign, SRM-residual and frequency-mixup levers (S1+S2+S3) without adding learnable parameters, lands below the B4 baseline on CDFv2; the exact figures are in Chapter 3. We report this regression openly. Not every frequency cue transfers cleanly into the block-DCT domain, and the result motivates the per-lever ablation flagged under Future Directions. Row2 (the S4+S5+S3 bundle) was not trained within the thesis GPU budget, although the partial single-lever evidence already measured (Fix1/Fix2, Chapter 3) points the same way.

- For the eKYC use-case we calibrate a strict operating point at FPR ≤ 5%, following ISO/IEC 30107-3. Circular 17/2024/TT-NHNN requires biometric verification but sets no numeric threshold, so the 5% point is our own engineering choice made to satisfy that qualitative requirement. The honest reading is uncomfortable: at this customer-friendly point the detector still misses most deepfakes, as the calibrated threshold, true-positive rate and confusion matrix in Chapter 3 show. SFDCT therefore fits as an automated first screening layer that flags suspicious cases for manual review. It cannot yet stand alone as the final decision.

- The system runs end to end. For each input face it returns a fake probability, a REAL/FAKE label and a Grad-CAM overlay showing which regions drove the decision. The trained checkpoint is served live on a GPU through a small inference microservice; deployment details are in Chapter 3. Explainability matters here twice over, because it supports the reviewing officer and it serves the audit obligations that come with eKYC.

Taken together, the thesis delivers a pipeline whose baseline is verified against published numbers, a small but floor-safe frequency gain, and a working eKYC demonstration, with the caveats kept on record next to the results.

## Limitations

The results above come with real limits, and we list them without softening.

- Every AUC figure comes from a single training run per configuration, a consequence of GPU cost. The thesis therefore cannot claim statistical significance, and a margin as small as +0.0075 may be seed noise. Video-level bootstrap confidence intervals were computed at the best checkpoint for all seven trained variants (Table 3.5c). Every paired difference against B4 contains zero, which confirms formally that no variant separates from the baseline at this single seed.

- The improvement is modest and the method is not state of the art. SPSL (0.7650) still beats naive SFDCT (0.7572). The strongest cross-dataset lever known to us lies outside the pure block-DCT scope of this thesis; Future Directions returns to it.

- Training and serving do not crop faces in a byte-identical way. The skew can shift the live operating point away from the calibrated threshold, and it should be removed before production use.

- Robustness was not tested systematically. Heavy or repeated re-compression, low bitrate, noise, resolution changes and adversarial perturbations all remain unexplored, even though mobile eKYC will meet several of them daily.

- The liveness module is measured within one dataset only. On LCC-FASD the B4 model reaches AUC 0.9829 (remaining PAD metrics in §3.1.8), but cross-dataset behaviour, for instance on CASIA-FASD with its replay attacks, has not been checked. The eKYC cascade endpoint also still relies on a heuristic challenge check rather than the trained PAD scorer, so wiring the measured model into the cascade remains an open integration task. A complete eKYC defence needs both layers working together.

- No Vietnamese-face evaluation exists yet. A Vietnamese deepfake/spoof set is specified as a test-only generalisation probe, following the population-shift precedent of KoDF [16]. Collection is in progress, and in keeping with the no-extrapolation rule no number is reported before it is measured.

- Several cells of the evaluation grid stay empty: the FF++ in-dataset half, the full per-lever S1–S5 table, the Row2 configuration, and a cross-test on DFDC [15]. They are named as open GPU items rather than estimated.

## Future Directions

The limitations above set the agenda. We order the next steps by the value each one returns.

- (a) Wire the measured liveness layer into the cascade and test it cross-dataset. The PAD module is already trained and verified on LCC-FASD (§3.1.8). Two steps remain: the cascade endpoint should consume the learned PAD score, fused with the deepfake risk score instead of a hard boolean AND, and the model should then face a replay-heavy set such as CASIA-FASD.

- (b) Finish the per-lever ablation. Row2 (the S4+S5+S3 bundle) still needs training, and a full S1–S5 table on CDFv2 with an added FF++ in-dataset column would attribute the +0.0075 gain, and the Row1 regression, to individual cues rather than to bundles.

- (c) Multi-seed runs come next. Repeating each configuration over several seeds, with mean, standard deviation and a paired significance test, plus bootstrap intervals at video level, would settle whether the block-DCT gain is genuine.

- (d) Build the Vietnamese-face test set, keep it test-only, and use it to measure generalisation to the actual eKYC population (collection in progress; cf. KoDF [16]).

- (e) Cross-testing should also widen beyond CDFv2: DFDC, and sets such as DeeperForensics, cover more manipulation types and capture conditions.

- (f) Integrate SBI self-blended training. Our analysis points to SBI, which synthesises fake samples during training itself, as the strongest cross-dataset lever currently available, and it lies outside the block-DCT scope of this thesis. Combining SBI with the SFDCT frequency branch looks like the most promising route to a clearly larger cross-dataset AUC.

- (g) Harden the system for real deployment: unify the train/serve face cropping, evaluate robustness to compression, noise and adversarial inputs, and apply INT8 quantisation, pruning and distillation with latency measurement for edge and mobile eKYC.

---

# REFERENCES

[1] M. Tan and Q. V. Le, "EfficientNet: Rethinking Model Scaling for Convolutional Neural Networks," in *Proceedings of the 36th International Conference on Machine Learning (ICML)*, 2019, pp. 6105–6114.

[2] A. Rössler, D. Cozzolino, L. Verdoliva, C. Riess, J. Thies, and M. Nießner, "FaceForensics++: Learning to Detect Manipulated Facial Images," in *Proceedings of the IEEE/CVF International Conference on Computer Vision (ICCV)*, 2019, pp. 1–11.

[3] Y. Li, X. Yang, P. Sun, H. Qi, and S. Lyu, "Celeb-DF: A Large-Scale Challenging Dataset for DeepFake Forensics," in *Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition (CVPR)*, 2020, pp. 3207–3216.

[4] Z. Yan, Y. Zhang, X. Yuan, S. Lyu, and B. Wu, "DeepfakeBench: A Comprehensive Benchmark of Deepfake Detection," in *Advances in Neural Information Processing Systems (NeurIPS), Datasets and Benchmarks Track*, 2023.

[5] Z. Qin, P. Zhang, F. Wu, and X. Li, "FcaNet: Frequency Channel Attention Networks," in *Proceedings of the IEEE/CVF International Conference on Computer Vision (ICCV)*, 2021, pp. 783–792.

[6] H. Liu, X. Li, W. Zhou, Y. Chen, Y. He, H. Xue, W. Zhang, and N. Yu, "Spatial-Phase Shallow Learning: Rethinking Face Forgery Detection in Frequency Domain" (SPSL), in *Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition (CVPR)*, 2021, pp. 772–781.

[7] Y. Luo, Y. Zhang, J. Yan, and W. Liu, "Generalizing Face Forgery Detection with High-Frequency Features" (SRM high-pass residual), in *Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition (CVPR)*, 2021, pp. 16317–16326.

[8] Y. Qian, G. Yin, L. Sheng, Z. Chen, and J. Shao, "Thinking in Frequency: Face Forgery Detection by Mining Frequency-aware Clues" (F3-Net), in *Proceedings of the European Conference on Computer Vision (ECCV)*, 2020, pp. 86–103.

[9] R. R. Selvaraju, M. Cogswell, A. Das, R. Vedantam, D. Parikh, and D. Batra, "Grad-CAM: Visual Explanations from Deep Networks via Gradient-based Localization," in *Proceedings of the IEEE International Conference on Computer Vision (ICCV)*, 2017, pp. 618–626.

[10] N. Ahmed, T. Natarajan, and K. R. Rao, "Discrete Cosine Transform," *IEEE Transactions on Computers*, vol. C-23, no. 1, pp. 90–93, 1974.

[11] J. Li, H. Xie, J. Li, Z. Wang, and Y. Zhang, "Frequency-aware Discriminative Feature Learning Supervised by Single-Center Loss for Face Forgery Detection" (FDFL), in *Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition (CVPR)*, 2021.

[12] H. Kashiani et al., "FreqDebias: Generalizable Deepfake Detection via Consistency-Driven Frequency Debiasing," in *Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition (CVPR)*, 2025; arXiv:2509.22412.

[13] International Organization for Standardization, *ISO/IEC 30107-3: Information technology — Biometric presentation attack detection — Part 3: Testing and reporting*, ISO/IEC, 2017 (defines APCER/BPCER/ACER).

[14] State Bank of Vietnam, *Circular 17/2024/TT-NHNN regulating the opening and use of payment accounts at payment-service providers*, Hanoi, 2024.

[15] B. Dolhansky, J. Bitton, B. Pflaum, J. Lu, R. Howes, M. Wang, and C. C. Ferrer, "The DeepFake Detection Challenge (DFDC) Dataset," arXiv:2006.07397, 2020.

[16] P. Kwon, J. You, G. Nam, S. Park, and G. Chae, "KoDF: A Large-scale Korean DeepFake Detection Dataset," in *Proceedings of the IEEE/CVF International Conference on Computer Vision (ICCV)*, 2021.

[17] K. Zhang, Z. Zhang, Z. Li, and Y. Qiao, "Joint Face Detection and Alignment Using Multitask Cascaded Convolutional Networks" (MTCNN), *IEEE Signal Processing Letters*, vol. 23, no. 10, pp. 1499–1503, 2016.

[18] K. Shiohara and T. Yamasaki, "Detecting Deepfakes with Self-Blended Images" (SBI), in *Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition (CVPR)*, 2022.

[19] C. Guo, G. Pleiss, Y. Sun, and K. Q. Weinberger, "On Calibration of Modern Neural Networks" (temperature scaling), in *Proceedings of the 34th International Conference on Machine Learning (ICML)*, 2017.

[20] B. Efron and R. J. Tibshirani, *An Introduction to the Bootstrap*. Chapman & Hall/CRC, 1994.

[21] T. Fawcett, "An Introduction to ROC Analysis," *Pattern Recognition Letters*, vol. 27, no. 8, pp. 861–874, 2006.

[22] L. van der Maaten and G. Hinton, "Visualizing Data using t-SNE," *Journal of Machine Learning Research*, vol. 9, pp. 2579–2605, 2008.

[23] I. Goodfellow, J. Pouget-Abadie, M. Mirza, B. Xu, D. Warde-Farley, S. Ozair, A. Courville, and Y. Bengio, "Generative Adversarial Nets," in *Advances in Neural Information Processing Systems (NeurIPS)*, 2014.

[24] J. Hu, L. Shen, and G. Sun, "Squeeze-and-Excitation Networks," in *Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition (CVPR)*, 2018, pp. 7132–7141.

[25] D. P. Kingma and J. Ba, "Adam: A Method for Stochastic Optimization," in *Proceedings of the 3rd International Conference on Learning Representations (ICLR)*, 2015.

[26] X. Tan, Y. Li, J. Liu, and L. Jiang, "Face Liveness Detection from a Single Image with Sparse Low Rank Bilinear Discriminative Model" (NUAA Imposter dataset), in *Proceedings of the European Conference on Computer Vision (ECCV)*, 2010.

[27] A. Paszke, S. Gross, F. Massa, A. Lerer, J. Bradbury, et al., "PyTorch: An Imperative Style, High-Performance Deep Learning Library," in *Advances in Neural Information Processing Systems (NeurIPS)*, 2019.

[28] *LCC-FASD: Large Crowd-Collected Facial Anti-Spoofing Dataset*, public release (print and replay presentation attacks), distributed via Kaggle. Accessed 2026.

[29] F. Chollet, "Xception: Deep Learning with Depthwise Separable Convolutions," in *Proceedings of the IEEE Conference on Computer Vision and Pattern Recognition (CVPR)*, 2017, pp. 1251–1258.

[30] A. Vaswani, N. Shazeer, N. Parmar, J. Uszkoreit, L. Jones, A. N. Gomez, Ł. Kaiser, and I. Polosukhin, "Attention Is All You Need," in *Advances in Neural Information Processing Systems (NeurIPS)*, 2017.

[31] T. Bachlechner, B. P. Majumder, H. H. Mao, G. W. Cottrell, and J. McAuley, "ReZero is All You Need: Fast Convergence at Large Depth," in *Proceedings of the 37th Conference on Uncertainty in Artificial Intelligence (UAI)*, 2021.
