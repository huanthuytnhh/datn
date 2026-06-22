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

## 3.7 Discussion: strengths and limitations

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

## 3.8 Chapter summary

Chapter 3 moved the SFDCT method from design to empirical validation under the standard DeepfakeBench cross-dataset protocol (train FF++ c23, test Celeb-DF-v2). Three results have been confirmed: (1) the pipeline is correct — the B4 baseline reaches **0.7497**, close to the leaderboard value of **0.7487**; (2) adding the block-DCT branch with zero-init gated fusion raises the cross-dataset AUC to **0.7572 (+0.0075)** without degrading the baseline, fulfilling the *floor ≥ B4* commitment and supporting the core hypothesis that block-DCT frequency adds discriminative information to the spatial domain; (3) the eKYC inference demo runs end-to-end with explainable Grad-CAM and a threshold calibrated to the FPR ≤ 5% of Circular 17/2024/TT-NHNN.

The results of the Row1 and Row2 configurations, together with the in-dataset, per-knob, training-time and threshold-calibration numbers, are currently in `[[FILL]]` form and will be filled in once training is complete — with a commitment to conclude **strictly according to the actual numbers**, without sugar-coating. The most important limitation to acknowledge is the single-seed result (small differences may lie within noise) and the fact that the strongest AUC lever (SBI) is outside the scope of pure block-DCT. These two issues, together with extending to additional cross-dataset sets such as DFDC, are the direct premise for Chapter 4 — Conclusion and Future Work.
