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
