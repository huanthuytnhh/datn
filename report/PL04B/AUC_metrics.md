The main score is the **AUC**, the area under the ROC curve [21]. The ROC curve plots the true-positive rate (TPR, the share of fakes caught) against the false-positive rate (FPR, the share of real faces wrongly flagged) as the decision threshold sweeps across all values, and the AUC is the area under it, obtained by the trapezoidal rule over the curve's points:

$$\mathrm{AUC}=\sum_{i}\frac{TPR_i+TPR_{i-1}}{2}\,\left(FPR_i-FPR_{i-1}\right) \quad (1.5)$$

An AUC of 1.0 is a perfect ranking and 0.5 is no better than a random guess. Equivalently, the AUC is the probability that a randomly chosen fake scores higher than a randomly chosen real face, so it depends only on the ordering of the scores, not on the threshold $\tau$ or on the class balance [21]. Both properties matter for deepfake data, where the class mix is uneven and a threshold tuned on one dataset rarely carries over to another.

A second, related number is the **equal error rate** (EER), the common value of the false-positive and false-negative rates at the threshold where the two are equal. A lower EER means the real and fake score distributions overlap less. Where the AUC ignores the threshold entirely, the EER pins down a single representative threshold, so the two views complement each other.

All training and evaluation follow the DeepfakeBench protocol [4], which fixes the preprocessing, the data splits, and how each metric is computed, so the scores can be lined up directly against published numbers. The AUC is computed frame by frame, each sampled frame scored on its own and the metric taken over the whole pool. Plain accuracy is reported only as a secondary figure, since it forces a hard decision at one operating point and is easily skewed by class imbalance, so a model can show high accuracy while still ranking faces poorly.

The presentation-attack metrics APCER, BPCER, and ACER belong to the liveness task rather than to forgery classification, and they are defined in Section 1.4.2.
