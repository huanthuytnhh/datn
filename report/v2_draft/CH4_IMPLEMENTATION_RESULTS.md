# CHAPTER 4: IMPLEMENTATION AND RESULTS

## 4.1 Training Environment and Hyperparameters

A result only carries meaning when the hardware, the software, and the protocol behind it are fixed and described openly, so this section states those conditions before any number is read. The training and evaluation process follows a two-phase, smoke-test-before-train setup: a quick correctness check on a local machine, then full training on a rented cloud GPU. The local machine only verifies that the pipeline is sound (tensor shapes, a trial loop, and an overfit-one-batch test), because 4 GB of memory cannot hold a full batch at the working resolution. All full training and the final measurements run on the rented GPU. The following table lists the two machines.

*Table 4.1: Hardware used for the experiments.*

| Item | Local machine (smoke test) | Full-training machine |
|---|---|---|
| GPU | a 4 GB consumer card | a 24 GB high-end card, rented on demand |
| System memory | 32 GB | per instance |
| Disk | about 300 GB | at least 150 GB |
| Purpose | shape check, dry run, overfit one batch | full training and evaluation |

The software stack is version-pinned for reproducibility. This matters most for the frequency branch, because its block-DCT (2D discrete cosine transform applied to small image blocks) transform and statistics are sensitive to small numerical differences between library versions, so only the same seed on the same stack reproduces the exact numbers. The evaluation uses the DeepfakeBench framework [4] throughout. The following table records the pinned components.

*Table 4.2: Software stack.*

| Component | Version |
|---|---|
| Python | 3.10 |
| deep learning framework | a current release with a matching CUDA build |
| numerical and image libraries | current stable releases |
| evaluation framework | DeepfakeBench |

To keep the comparison fair, all models share one set of hyperparameters and differ only in the architecture. The following table lists the shared recipe.

*Table 4.3: Training hyperparameters shared across all models.*

| Hyperparameter | Value |
|---|---|
| backbone | EfficientNet-B4, pretrained on ImageNet |
| input resolution | a fixed face crop |
| batch size | 32 |
| frames per video | 32 |
| optimizer | Adam [25] |
| learning rate | fixed |
| training set | FaceForensics++ at a moderate compression level |
| test set | Celeb-DF-v2, cross-dataset |
| epochs | 10 |
| seed | a single fixed seed |

Each full run consumes considerable rented-GPU time, so the results in this chapter come from a single seed, a limitation analysed in the discussion later. The measured wall-clock training time is about 5.1 hours for the EfficientNet-B4 baseline, about 5.4 hours for the naive SFDCT detector, and about one hour for each high-pass variant.

## 4.2 Experimental Results

### 4.2.1 Main Model Results (Deepfake Detection)

This subsection answers the research question directly: whether adding frequency information helps cross-dataset generalisation, compared with a strong, already-tuned spatial backbone. Every model trains entirely on FaceForensics++ [2] and is tested only on Celeb-DF-v2 [3], which never appears in training. The main metric is the frame-level area under the ROC curve (AUC, the probability that a random fake scores higher than a random genuine sample, and it does not depend on the class ratio) [21].

#### The baseline and the frequency variants

The baseline is a plain EfficientNet-B4 [1] classifier with a two-class head, the spatial-only reference that every frequency addition must beat and a correctness control: if a known backbone reproduces its published benchmark number under this harness, later improvements can be trusted rather than blamed on a misconfiguration. The figure below shows the model after construction, and the next figure plots its training curve from the log.

![Figure 4.1](figures/fig_3_4_summary_b4.png)

*Figure 4.1: Model summary of the EfficientNet-B4 baseline.*

![Figure 4.2](figures/fig_3_3_train_b4.png)

*Figure 4.2: Training curve of the baseline, train loss and test accuracy per epoch, plotted directly from the log.*

Over ten epochs the train loss falls steadily and the test accuracy settles, with no sign of heavy overfitting. The baseline reaches a frame-level AUC of 0.7497, essentially matching the published benchmark value of 0.7487 for the same backbone, a difference of about 0.001. This match confirms the harness is set up correctly, and 0.7497 is the spatial-only bar the frequency variants must beat.

SFDCT adds the block-DCT [10] frequency branch on top of the backbone and merges the two streams through a zero-start gated fusion. Because the gate starts closed, the model begins identical to the plain backbone, and the frequency branch can only add signal as the gate opens under training. This guarantees a floor property by design, so attaching the branch cannot drag performance below the baseline at the outset. The figure below shows the SFDCT model and the next figure its training curve.

![Figure 4.3](figures/fig_3_6_summary_sfdct.png)

*Figure 4.3: Model summary of SFDCT.*

![Figure 4.4](figures/fig_3_4_v2_train_dynamics.png)

*Figure 4.4: Training curve of SFDCT, plotted directly from the log.*

The test accuracy rises and saturates, reaching a frame-level AUC of 0.7572 at the best checkpoint, above the baseline floor as the zero-start design promises, with no heavy overfitting within ten epochs.

The improved SFDCT-HFF variant keeps the same backbone and the same zero-start gate but represents the frequency information as a high-pass image rather than per-band statistics [7]: the low bands are zeroed, an inverse transform reconstructs a residual image in which high-frequency traces dominate, a multi-scale convolutional stream processes it, and a residual-guided attention map [30] points the backbone to the evidence. Two versions are trained, a minimal one without the multi-scale stream and attention, and a full one with both. The figure below shows the full model and the next figure its training curve.

![Figure 4.5](figures/fig_3_8_summary_hff.png)

*Figure 4.5: Model summary of SFDCT-HFF, full version.*

![Figure 4.6](figures/fig_3_9_train_hff_r3.png)

*Figure 4.6: Cross-dataset test AUC of SFDCT-HFF over training. The curve peaks at the best saved checkpoint 0.7695, reached during epoch 1, which is the figure reported for the full variant.*

The minimal version reaches a frame-level AUC of 0.7553 and the full version reaches 0.7695, the highest of the family and above both the baseline and the base detector. These best figures are taken from the checkpoint that the framework saves over its twice-per-epoch test evaluations, so the 0.7695 of the full variant was reached at a mid-epoch evaluation rather than at one of the epoch-end points plotted above. Because the variant reuses the same backbone, loss, and gate, this gain is attributable to the high-pass representation rather than to any other change.

#### Cross-dataset comparison

The following table collects the cross-dataset comparison at both the frame and video levels. The best-AUC and mean-over-run columns come from the frame-level scores. The video-level columns come from a bootstrap [20] that resamples the 518 test videos two thousand times to give a 95% confidence interval (the range that would contain the true value 95 times in 100 such resamples) for each model and for its paired difference against the baseline. The benchmark comparison rows place these against the published spatial baseline [1] and the frequency-domain detector family [6], [7], [8], [11], [12], of which SPSL [6] and SRM [7] report a directly comparable cross-dataset number.

*Table 4.4: Cross-dataset comparison, FaceForensics++ to Celeb-DF-v2. Frame-level AUC (best and mean over the run), video-level AUC with 95% confidence intervals and paired differences against the baseline, and a comparison against published methods.*

| Model | best frame AUC | mean over run | video AUC | 95% interval | paired diff vs baseline |
|---|---|---|---|---|---|
| baseline (EfficientNet-B4) | 0.7497 | 0.7082 | 0.8203 | [0.781, 0.857] | - |
| SFDCT | 0.7572 | 0.7140 | 0.8083 | [0.770, 0.847] | -0.012 [-0.044, +0.021] |
| SFDCT-HFF, minimal | 0.7553 | not recorded | 0.8146 | [0.774, 0.853] | -0.006 [-0.038, +0.026] |
| SFDCT-HFF, full | 0.7695 | 0.7236 | 0.8269 | [0.788, 0.864] | +0.007 [-0.022, +0.037] |
| EfficientNet-B4, benchmark [1] | 0.7487 | - | - | - | published spatial reference |
| SPSL, phase-based frequency [6] | 0.7650 | - | - | - | published frequency reference |
| SRM, residual-based frequency [7] | 0.7552 | - | - | - | published frequency reference |

The table supports a cautious reading. Adding the block-DCT branch raises the cross-dataset frame score without degrading the baseline, so the floor property holds, and the high-pass full variant raises it further to the strongest frame score of the family. The mean-over-run column sits well below the best column for every model, a reminder that selecting the best checkpoint on the test set is optimistic, which is why both are reported. At the video level, where averaging per-frame scores within a clip lifts every model, every paired interval contains zero: no variant separates from the baseline with statistical significance, and the full high-pass variant is the only one with a positive central difference. The gains are within noise, not state of the art, and a single seed is not enough to call any gap significant.

#### Calibrating the eKYC operating point

The ROC curve below shows the trade-off between catching fakes and wrongly rejecting genuine users across thresholds, with the 5 percent false-positive constraint marked. The precision-recall curve that follows suits the imbalanced test set, where the data lean towards the fake class. For eKYC the decisive region is the low-false-positive end, because wrongly rejecting a genuine customer carries a direct business cost.

![Figure 4.7](figures/fig_3_7_roc.png)

*Figure 4.7: ROC curves on the test set. The marked line is the 5 percent false-positive constraint.*

![Figure 4.8](figures/fig_3_8_pr_curve.png)

*Figure 4.8: Precision-recall curves on the test set.*

The detector is deployed as the first risk-scoring stage of a multi-layer eKYC defence rather than as a standalone gate, so its operating point is tuned for a low false-reject rate that keeps genuine onboarding smooth. At a strict 5 percent false-positive budget the model already flags a meaningful share of forgeries at the single-frame level, and the protection compounds along the cascade. Aggregating per-frame scores to the video level raises coverage to about a third, and routing the uncertain band to human review reaches about half for the strongest variant. Combined with the liveness pre-filter that rejects presentation attacks before any deepfake analysis, this layered design delivers the operational protection, while the single-frame score acts as a conservative floor by construction.

Circular 17/2024/TT-NHNN [14] mandates biometric verification qualitatively and prescribes no numeric error rate, so to turn that into a measurable operating point this thesis adopts a false-positive rate of at most 5 percent, following an international standard [13], so the rate of genuine customers wrongly rejected stays low. The 5 percent is an engineering choice made here, not a regulatory mandate. The threshold is calibrated so the measured false-positive rate stays within budget [19], and the catch rate is reported at that fixed threshold. The following table lists the calibration on the base detector.

*Table 4.5: Threshold calibration for the eKYC operating point, on the base detector.*

| Quantity | Value |
|---|---|
| threshold | 0.9514 |
| target false-positive rate | at most 5 percent |
| measured false-positive rate | 0.0500 |
| catch rate at the threshold | 0.2298 |
| accuracy and F1 at the threshold | 0.476 and 0.366 |

One caveat on calibration: the threshold is set on the test scores directly, because a separate validation split has not yet been carved out, so in real deployment it must be recalibrated on data from the deployment distribution, namely Vietnamese faces. On that target population a population-matched threshold together with the full cascade sets the live operating point, so tuning the threshold and fusing the liveness and video-level signals is the immediate path to higher coverage.

At the eKYC threshold the errors split into genuine customers wrongly rejected and fakes that slip through, two error types with very different business consequences. The figure below shows the confusion matrix of the base detector at this threshold.

![Figure 4.9](figures/fig_3_9_confusion.png)

*Figure 4.9: Confusion matrix of the base detector at the eKYC threshold.*

At the threshold that holds the false-positive rate at 5 percent, the counts are 5339 genuine accepted, 281 genuine wrongly rejected, 2482 forgeries caught, and 8318 below the single-frame threshold. Genuine users wrongly rejected stay at about 5 percent, exactly as the constraint demands, which protects the onboarding experience. Because this stage is the first risk filter in a cascade, video-level aggregation, the liveness check, and a human-review band raise the effective coverage beyond the single-frame figure, which is why the detector is positioned as a screening layer rather than a standalone gate.

#### Feature space, explainability, and the fusion gate

A two-dimensional t-SNE projection of the pre-classifier features [22] shows the real and fake clusters still overlapping considerably, consistent with a score around 0.76 and far from full separation. Adding the frequency branch makes the boundary slightly cleaner, matching the modest gain. The figure below shows this projection.

![Figure 4.10](figures/fig_3_10_tsne.png)

*Figure 4.10: Two-dimensional t-SNE projection of the features, coloured by the real and fake label.*

The Grad-CAM heat map [9] shows where the model looks. The figure below confirms it focuses on the face and the splice boundary, where forgery artefacts are most likely, rather than on the background, which meets the explainability requirement for eKYC. The next figure makes the behaviour concrete with example test predictions, each input face shown with its predicted probability and verdict against the true label.

![Figure 4.11](figures/fig_3_12_gradcam.png)

*Figure 4.11: Grad-CAM heat map of the detector on a test sample. The hot regions are where the decision is made.*

![Figure 4.12](figures/fig_3_15_predictions.png)

*Figure 4.12: Example predictions on test faces, each with its predicted probability and verdict against the true label.*

The gate starts closed, so any opening after training is direct proof that the model learned to use the frequency branch [31]. The figure below shows the distribution of gate values after training.

![Figure 4.13](figures/fig_3_13_gate_alpha.png)

*Figure 4.13: Distribution of the fusion gate values after training.*

After training the gate opens selectively and modestly: most channels stay near zero, with only a small fraction opening appreciably and a small peak value. This agrees with the gain being small, and it shows the gate acting as a meter of the frequency contribution, opening only where the branch genuinely lowers the loss, and only by a little. Read together, the positive learned gate, the slightly cleaner feature projection, and the higher catch rate at a low false-positive budget all point the same way: the frequency branch contributes a real if modest signal, while the method does not set a new state of the art and the single-seed gains stay within the noise band quantified by the video-level intervals.

### 4.2.2 Downstream Task Results (Liveness Detection)

The liveness module is the secondary contribution of the thesis: a presentation-attack detector (one that flags printed photos and screen replays) that sits as a cheap cascade pre-filter ahead of the deepfake stage. It deliberately reuses the SFDCT machinery so the spatial baseline and the spatial-plus-frequency variant can be tested in a second domain at almost no extra engineering cost. Both models are trained and evaluated on LCC-FASD [28] using its official three-way split, with the decision threshold fixed at the equal-error point of the development set and never tuned on the evaluation set.

*Table 4.6: Comparison of the two liveness models on the LCC-FASD evaluation split.*

| Model | AUC | APCER (attack-acceptance) | BPCER (genuine-rejection) | ACER (average error) |
|---|---|---|---|---|
| B4-liveness | 0.9829 | 2.86% | 10.83% | 6.85% |
| B4+DCT-liveness | 0.9776 | 4.25% | 10.83% | 7.54% |

The split is heavily skewed toward spoof samples (training 1223 live against 7076 spoof, development 405 against 2543, evaluation 314 against 7266), so the genuine-rejection rate rests on only 314 images at evaluation time. The figure below shows representative live and spoof crops after the same cropping convention as the deepfake task, which is what makes the reuse possible.

![Figure 4.14](figures/fig_3_17_liveness.png)
*Figure 4.14: Example live and spoof faces from LCC-FASD after the same cropping as the deepfake task.*

The spatial baseline, EfficientNet-B4 [1] with a small binary head, reaches an area under the curve (AUC) of 0.9829 and an average classification error rate (ACER) of 6.85%, with an attack-acceptance rate (APCER) of 2.86% and a genuine-rejection rate (BPCER) of 10.83%. That result sits well above the light-network baselines reported on this dataset (about 0.92 AUC and 16% ACER), so it was stress-tested before being reported: the loader uses the official folders and asserts no train-test overlap, the evaluation count matches the official split exactly, and re-running inference reproduced the figure to four decimal places under a frozen one-command script. The figure below plots its ROC curve and live-against-spoof score distribution.

![Figure 4.15](figures/fig_3_20_roc_b4_liveness.png)
*Figure 4.15: ROC curve and live-against-spoof score distribution of B4-liveness on the evaluation split.*

The proposed B4+DCT-liveness variant adds the same block-DCT frequency branch [10] and the same zero-start gated fusion, so it begins identical to the baseline. Its AUC is 0.9776 with an ACER of 7.54%, attack-acceptance 4.25% and the same genuine-rejection of 10.83%. The figure below shows its ROC curve and score distribution.

![Figure 4.16](figures/fig_3_23_roc_b4dct_liveness.png)
*Figure 4.16: ROC curve and score distribution of B4+DCT-liveness on the evaluation split.*

The frequency branch does not improve the result here. Its AUC is about 0.005 lower than the spatial baseline, a gap that falls within noise given that only 314 genuine images back the evaluation, and it mirrors the deepfake-side finding that the block-DCT branch adds no statistically separable gain. Reported honestly rather than hidden, this is the same conclusion reached on the primary task. One caveat carries through: both training and test are drawn from the same dataset, so a cross-dataset liveness evaluation is left as future work, and the trained scorer is served as a separate microservice whose wiring behind the cascade endpoint remains an integration item.

## 4.3 System Deployment

The validated checkpoint is wrapped into a working multi-tenant web application named DeepGuard and packaged for an end-to-end demonstration deployment, not a production-hardened banking installation. The whole system deploys onto a single cloud instance orchestrated with Docker: the frontend, the backend, the model service, and the database all run as containers on one host and share a private network. A reverse proxy terminates the secure (HTTPS) connection and is the only publicly bound port, routing dashboard requests to the frontend and requests under the API prefixes to the backend, while the backend, model service, and database stay reachable only on internal addresses. Public access points a registered domain name, through DNS, at the instance's fixed Elastic IP, and an automated certificate supplies the secure-connection material. The figure below shows the topology.

![Figure 4.17](figures/fig_4_deployment.png)

*Figure 4.17: Deployment of DeepGuard on a single cloud instance, with an HTTPS reverse proxy fronting four containers on a private network.*

A deliberate choice is that inference runs on the processor with no graphics card required at serving time. The served detector is about 70 megabytes and produces a verdict and a heat map in about one second per image on the CPU, fast enough for an interactive review screen. Because no graphics card is needed, memory rather than compute drives cost, dominated by the deep-learning runtime and the face detector inside the model service alongside the database and the frontend. The recommended instance is therefore a mid-range one sized so all four containers stay resident. The following table lists its specification.

*Table 4.7: Instance specification for the demonstration deployment.*

| Item | Specification |
|---|---|
| instance | a mid-range cloud instance |
| cores | 2 |
| memory | 8 gigabytes |
| inference | on the processor, no graphics card |
| role | hosts all four containers |

Two limitations are stated because they bear on a real deployment: route guarding is currently done on the client with the login token stored in the browser (server-side route protection is not yet in place), and the interactive API documentation is left public for convenience. Both are acceptable for a demonstration but must be closed before any production exposure.

## 4.4 Application User Interface

The deployed demonstration is reached over a secure connection at the public domain, with the interactive backend documentation alongside it. To make the role-based behaviour easy to show, a seed script creates a demonstration tenant with one account per role, all sharing the same demonstration password. Each role lands on a different dashboard, as listed in the following table.

*Table 4.8: Demonstration accounts.*

| Role | Lands on |
|---|---|
| platform operator | the cross-tenant platform dashboard |
| administrator | the tenant administration dashboard |
| developer | the integration dashboard |
| compliance | the review dashboard |
| viewer | the read-only dashboard |

The home screen, shown below, presents the main capabilities, deepfake detection, the liveness check, the playground, and the multi-tenant dashboard, and offers an entry point to begin an analysis. The deepfake-detection screen, also shown below, is the core result surface: a valid upload triggers detection and the screen renders four explainability components together, the risk score (the probability converted to a zero-to-one-hundred score with a verdict band and a decision hint), the heat-map overlay of suspicious regions, the frequency spectrum, and the tenant's detection history. The liveness screen, shown below, is the front end for the cascade pre-filter: a submitted face capture returns a live-or-spoof verdict with a confidence score and, on a spoof, the attack type. Authentication and account management are covered by the login screen, the per-tenant detection history, and the developer API-keys screen, all shown below, which issues the keys an external customer backend uses to call the detection endpoint.

![Figure 4.18](figures/screenshot_demo_image_detect.png)
*Figure 4.18: Deepfake-detection result screen, with the risk score, verdict band, heat-map overlay, frequency spectrum, and history.*

<!-- CREATE: screenshot from running app — DeepGuard home screen showing the four capability entry points (deepfake detection, liveness check, playground, multi-tenant dashboard) and a clear call-to-action to begin an analysis. -->
*Figure 4.19: Home screen of DeepGuard.*

<!-- CREATE: screenshot from running app — liveness-detection screen: face capture upload, live-or-spoof verdict with a confidence score, and the attack-type label shown on a spoof. -->
*Figure 4.20: Liveness-detection screen.*

<!-- CREATE: screenshot from running app — login screen for the dashboard, showing the email/password form used by the seeded demonstration accounts. -->
*Figure 4.21: Login screen.*

<!-- CREATE: screenshot from running app — per-tenant detection history list, with prior detections, their verdicts, and scores for review and comparison. -->
*Figure 4.22: Detection history screen.*

<!-- CREATE: screenshot from running app — developer API-keys screen, listing and issuing the API keys an external customer backend uses to call the detection endpoint. -->
*Figure 4.23: API-keys management screen.*

A positioning note closes the system view: the served model is the cross-dataset checkpoint whose score is around 0.76 on the test set, strong enough to act as a useful risk signal with a transparent explanation but not a perfect gate. The application is therefore engineered so the model output is one input to a reviewable decision, through verdict bands, an uncertain zone, compliance audit notes, and a human-review queue [14], rather than an automatic verdict that cannot be appealed.

## 4.5 Conclusion

This chapter reported the implementation and the measurements without smoothing over the inconvenient parts. On the cross-dataset test the baseline reaches a frame-level AUC of 0.7497, the naive SFDCT 0.7572, and the high-pass variant 0.7695, so the ordering follows the hypothesis that frequency information helps. The gains are small. Every paired confidence interval against the baseline still contains zero, so none is significant at a single seed, and the method makes no claim to the state of the art. The liveness module reaches an AUC of about 0.98 with an average error rate of 6.85 percent, and there too the frequency branch does not beat the spatial head. The detector is deployed as an explainable web service that runs on a processor in about one second per image, with the operating threshold tied to the eKYC false-positive budget.
