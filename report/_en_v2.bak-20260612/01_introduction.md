# INTRODUCTION

## 1. Problem Statement

In recent years, electronic Know Your Customer (eKYC) has become a core piece of infrastructure for the banking and finance industry: a customer can open an account, take out a loan, or confirm a transaction entirely remotely, using only a portrait photograph and a few taps on a phone. Yet this very convenience opens up a new attack surface. The explosive progress of **deepfake** techniques — which use Generative Adversarial Networks (GANs) and generative models to swap or synthesise faces — means that a forged face that looks exactly real can now be produced at low cost. When such faces are fed into the biometric verification stage of eKYC, the system risks being bypassed, leading to identity fraud, account takeover, and serious financial loss. In Vietnam, **Circular 17/2024/TT-NHNN (TT17)** sets out a *qualitative* requirement for biometric verification in banking transactions; it underscores the pressing need for a reliable deepfake detector but does not itself fix a numerical error budget.

**Why is relying on the spatial domain alone not enough?** Most current deepfake detectors are convolutional neural networks (CNNs) that learn directly from pixels in the spatial domain. This approach performs well when the test set shares the same distribution as the training set, but it tends to "memorise" the idiosyncratic traces of each specific forgery method. As a consequence, when the model is confronted with a new forgery technique or a new dataset, performance drops considerably. This is precisely the problem of **cross-dataset generalisation** — the core and hardest challenge of the deepfake detection task.

**Why do we need the frequency domain (DCT)?** A key observation is that the deepfake generation process — and in particular the **upsampling** operations inside GAN architectures — leaves very characteristic traces (artifacts). In the spatial domain these traces are usually faint and easily "washed away" by image compression (such as JPEG or c23 video coding). However, when the image is transformed into the frequency domain via the **Discrete Cosine Transform (DCT)**, these traces become clearly exposed in the **mid and high** frequency bands, where real and fake images differ in how they distribute energy. This is the basis for the central hypothesis of this thesis: **spatial features and frequency features complement each other**, and collaboration between the two domains helps the model generalise better across forgery methods and datasets. Using **block-wise DCT (8×8)** — rather than whole-image DCT — further lets the model capture *local* traces while naturally matching the way videos and images are compressed block by block.

**Why is cross-dataset generalisation the core challenge?** In a realistic eKYC setting, an attacker always uses the latest deepfake generation tools — almost certainly different from the data the model saw during training. A detector that achieves high accuracy on a "familiar" (in-dataset) test set but collapses on unseen data would be useless in practice. We therefore adopt **frame-level AUC on Celeb-DF-v2 (trained on FaceForensics++)** as the representative evaluation metric (the headline metric), because it directly reflects the ability to generalise to an unseen domain.

> **Takeaway.** Spatial-only deepfake detectors overfit forgery-specific cues and fail across datasets; block-DCT frequency features expose compression-resistant artifacts, motivating a spatial–frequency detector evaluated under cross-dataset generalisation.

## 2. Purposes

**Scientifically,** this thesis empirically reinforces the hypothesis about spatial–frequency collaboration in deepfake detection, and at the same time contributes a unified **zero-initialised gated cross-attention** design with a performance-"floor" guarantee — a property seldom emphasised in prior work. Aggregating and adapting five frequency levers from different research directions (SPSL [6], SRM [7], FreqDebias [12], FcaNet [5], FDFL [11]) into a common block-DCT framework also provides a systematic comparative perspective. All of this is built **on top of DeepfakeBench** [4] (fully attributed), using **EfficientNet** [1] as the spatial backbone.

**Practically,** this thesis aims directly at the eKYC problem in Vietnam's banking industry: a fair cross-dataset evaluation under DeepfakeBench closely mirrors the real deployment scenario (encountering unseen deepfakes), while an explainable demo with Grad-CAM increases the transparency and interpretability of each decision — an important factor both for legal compliance and for building user trust. The threshold is calibrated at an **FPR ≤ 5% operating point adopted per ISO/IEC 30107-3** in order to satisfy TT17's qualitative biometric-verification requirement (the 5% is *our* engineering choice, not a figure mandated by TT17).

> **Takeaway.** The purpose is twofold: scientifically, to validate and unify spatial–frequency collaboration with a floor-safe fusion; practically, to deliver a fairly-evaluated, explainable detector aligned with Vietnam's eKYC compliance context.

## 3. Objectives

**Overall objective.** To build a **hybrid spatial–frequency** deepfake detector based on block-wise DCT that achieves better cross-dataset generalisation than a purely spatial baseline, while remaining safe with respect to risk (never worse than the baseline) and explainable, oriented towards eKYC applications.

**Specific objectives.**

1. Design a frequency branch based on **block-wise DCT (8×8)** with 16 zigzag frequency bands, and a **zero-initialised gated cross-attention** fusion mechanism that guarantees a performance floor ≥ EfficientNet-B4.
2. Aggregate and adapt **five frequency levers** (S1–S5, adapted from SPSL, SRM, FreqDebias, FcaNet, FDFL) into the block-DCT domain.
3. Evaluate **fairly** under the DeepfakeBench protocol (train FF++ c23 → test cross-dataset CDFv2) through ablation configurations: B4 → B4-DCT → Row1 → Row2.
4. Build an **explainable eKYC demo** with Grad-CAM and discuss decision-threshold calibration under the FPR ≤ 5% operating point.

**Research questions.**

- **RQ1.** Does adding a block-DCT branch to EfficientNet-B4 improve cross-dataset AUC compared with a purely spatial baseline?
- **RQ2.** Among the five frequency levers, which one (or which combination) yields a reliable improvement, and which does not?
- **RQ3.** Does the zero-initialised gated cross-attention mechanism truly guarantee a performance "floor" no lower than B4?

**Research object and scope.**

- **Research object:** the problem of **deepfake** (face-forgery) detection on face images, focusing on the collaboration between spatial-domain features and block-DCT frequency-domain features, in the context of eKYC applications.
- **Focus primarily on deepfake detection (DEEPFAKE-FIRST).** Going deep on the deepfake detection task is the implemented and evaluated core of this thesis. The problem of **liveness / anti-spoofing detection (PAD)** — also important in eKYC — is treated as a **secondary** module: a cascade pre-filter that reuses the SFDCT machinery (B4 vs B4+DCT) on LCC-FASD. It has been trained and evaluated **within-dataset** (B4: ACER 6.85% / AUC 0.9829, independently verified — §3.1.8); cross-dataset PAD evaluation and full cascade wiring remain future work.
- **Frame-level, no temporal-sequence processing.** This thesis works on independent face-crop frames and does not exploit temporal/motion features across frames.
- **Data:** training on FaceForensics++ (c23, ≈ 159,626 frames); cross-dataset testing on Celeb-DF-v2 (16,420 test frames = 5,620 real + 10,800 fake). DFDC is noted as an additional cross-dataset set for future work. A Vietnamese-face deepfake set for eKYC is **test-only and under construction** (recording and generation protocol specified; collection in progress).
- **Evaluation:** following the DeepfakeBench protocol, with frame-level AUC on CDFv2 as the representative metric.

**Main contributions (novelty).** This thesis positions its contributions along **five axes**, in which the methodological axis (C1) is the original novelty and the remaining four are novelty at the evaluation–data–deployment level:

1. **C1 — Original method:** a **block-DCT spatial–frequency** branch fused with EfficientNet-B4 through **zero-initialised gated cross-attention** with gate α initialised to **0** (guaranteeing a *floor ≥ B4*); together with aggregating and adapting five frequency levers (SPSL/SRM/FreqDebias/FcaNet/FDFL) into **one** unified block-DCT domain. (This is distinct from SFCL-HCMF, whose gate initialises at 0.5; SFDCT also has **no** global-differential / SIDA branch.)
2. **C2 — Multi-configuration evaluation framework + aggregate heatmap:** a systematic comparison of B4 → B4-DCT → Row1 → Row2 on cross-dataset, summarised in a single AUC heatmap.
3. **C3 — Evaluation at the eKYC operating point:** calibrating the threshold τ at the **FPR ≤ 5% operating point** (the ISO/IEC 30107-3 convention we adopt to operationalise the *qualitative* biometric-verification requirement of **Circular 17/2024/TT-NHNN** — TT17 does not fix a numerical threshold), with error decomposition (FP/FN confusion, two-sided APCER/BPCER) instead of a single AUC number.
4. **C4 — An honest cross-dataset study with statistics:** using **bootstrap CI** to test the significance of ΔAUC and **reporting outright when a result falls within the noise** when that is indeed the case (no sugar-coating).
5. **C5 — (data, in progress) A Vietnamese-face deepfake set for eKYC:** a cross-domain Vietnamese-face test set close to identity-verification scenarios, complementing CDFv2 (test-only; protocol specified, collection in progress — no number is reported before it is measured).

> Everything is built **on top of DeepfakeBench** (fully attributed) together with the inherited frequency-domain works (SPSL, SRM, FreqDebias, FcaNet, FDFL) and the **EfficientNet** backbone — see the References.

> **Takeaway.** The objective is a floor-safe spatial–frequency detector with strong cross-dataset generalisation; contributions span method (C1), evaluation framework (C2–C4), and an in-progress Vietnamese eKYC dataset (C5), with liveness measured as a secondary module (§3.1.8).

## 4. Implementation process

The implementation process of this thesis comprises four consecutive stages.

**Step 1 — Data preparation (data).** Extract faces from FF++ and CDFv2 videos, align and crop them into 256×256 face-crop images, and normalise according to the DeepfakeBench configuration (mean = std = 0.5). Generate JSON files describing the dataset for training and evaluation.

**Step 2 — Building the SFDCT model.** A spatial backbone, EfficientNet-B4 (ImageNet-pretrained), is combined with a block-wise DCT (8×8) frequency branch (image converted to YCbCr, taking the log-magnitude, grouped into 16 zigzag bands, with an optional drop of low bands to prevent content leakage), fused by **zero-initialised gated cross-attention**; with an optional integration of the five levers S1–S5.

**Step 3 — Training and cross-dataset evaluation (DeepfakeBench).** Training on FF++ c23 (batch 32, frame_num 32, Adam optimiser, lr 2e-4, weight decay 5e-4, no scheduler, seed 1024, 10 epochs, 256×256 images, cross-entropy base loss; naive extra loss weights λ_cons = 1.0, λ_sc = 0.3, margin m = 0.3); evaluating frame-level AUC on CDFv2 under four ablation configurations (B4 → B4-DCT → Row1 → Row2), accompanied by illustrative figures (ROC, PR, t-SNE, frequency spectrum, gate alpha, Grad-CAM, training curve).

**Step 4 — Explainable eKYC demo.** The inference tool returns a forgery probability fake_prob ∈ [0, 1], a REAL/FAKE label, and a Grad-CAM overlay image; we then calibrate the decision threshold at the FPR ≤ 5% operating point (adopted per ISO/IEC 30107-3 to satisfy TT17's qualitative requirement) and discuss the resulting error trade-off.

> **Takeaway.** The pipeline runs data → model → fair cross-dataset training/evaluation → explainable eKYC demo, with every hyperparameter fixed and reported for reproducibility.

## 5. Structure of the thesis

Apart from the Introduction, the Conclusion, and the References, the main content of the report is organised into three chapters.

**INTRODUCTION** — gives the context and purpose of the project and states the scope of the problems the thesis focuses on.

**Chapter 1: THEORIES AND TECHNOLOGIES** — introduces the core theories and technologies used in the project: the web stack (JavaScript, Next.js, FastAPI, HTTP API, DNS), the AI foundations (EfficientNet-B4, DCT and frequency analysis, attention and fusion), the application domain (overview of deepfake technology, the deepfake detection problem and generalisation, the eKYC context and legal requirements, liveness detection theory), and the cloud platform (AWS).

**Chapter 2: SYSTEM ANALYSIS AND DESIGN** — describes the system's functional and non-functional requirements and its architectural design (use cases, system architecture, activity and sequence diagrams, API specifications), then details the proposed methods: the deepfake detection method (data solutions, EfficientNet-B4 and SFDCT architecture with the block-DCT branch and zero-initialised gated cross-attention, the five frequency levers, loss/evaluation, and risk-score decision inference) and the secondary liveness detection method (measured in §3.1.8).

**Chapter 3: SYSTEM IMPLEMENTATION AND EVALUATION** — details the experimental environment and data, the training and convergence of the B4 baseline and SFDCT, the comparative cross-dataset results (B4 0.7497 → naive SFDCT 0.7572 → Row1 0.7333, plus the Fix and block-DCT-HFF variants up to 0.7695) with the multi-protocol and video-level robustness analysis, the qualitative–quantitative analysis (ROC, PR, confusion, t-SNE, Grad-CAM, gate alpha), the evaluation across 16 experimental configurations, the eKYC demo, the system implementation/deployment, and the application screens.

**CONCLUSION** — summarises the contributions, states the limitations outright (results from a single seed; the naive ΔAUC of +0.0075 lies within noise and does not beat SPSL at 0.7650; Row1 is a genuine negative result; the strongest lever, SBI, lies outside the pure block-DCT scope; liveness is measured within-dataset only and its cascade wiring is incomplete), and outlines extension directions (multi-seed evaluation, integrating SBI self-blended training, cross-dataset liveness, DFDC, and the Vietnamese-face test set).

**REFERENCES** — presents the detailed referenced information used in this thesis.

> **Takeaway.** The thesis flows from context (Introduction) through foundations (Chapter 1) and design/method (Chapter 2) to fair, honest evaluation and deployment (Chapter 3), closing with attributed conclusions and references.
