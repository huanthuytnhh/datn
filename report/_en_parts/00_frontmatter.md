<br>

<div align="center">

**THE UNIVERSITY OF DA NANG**

**UNIVERSITY OF SCIENCE AND TECHNOLOGY**

**FACULTY OF INFORMATION TECHNOLOGY**

<br><br>

[[HÌNH: logo_dut.png — Logo of the University of Science and Technology – The University of Da Nang]]

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
