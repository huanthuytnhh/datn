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
