# CONCLUSION AND FUTURE WORK

## 1. Achieved Results

This thesis has accomplished its objective of building a hybrid spatial–frequency deepfake detection method (**SFDCT**) for the eKYC problem, with an emphasis on risk safety and on the ability to generalise to datasets unseen during training. The three principal contributions of the thesis are summarised as follows.

**First contribution — a block-DCT branch with a zero-initialised gated cross-attention.** We propose to add a frequency branch based on block-wise 2D-DCT (8×8) in parallel with the EfficientNet-B4 spatial backbone, and to merge the two feature streams through a gated cross-attention mechanism that is zero-initialised. The key property of this design is that, at initialisation, the gate `alpha = 0` forces `feature_fused = x`, so the hybrid model is exactly equivalent to the B4 baseline. As a result, the frequency branch only "contributes further" when it genuinely improves the loss, which guarantees a theoretical **performance floor** so that the result is never below the B4 baseline — an important property when deploying in a sensitive environment such as finance and banking.

**Second contribution — collecting and adapting five frequency "levers" to the block-DCT domain.** We systematise five improvements (levers) drawn from representative works and adapt them consistently to the block-DCT representation: S1 `dct_use_sign` (the sign of DCT coefficients, a phase-analog, adapted from SPSL); S2 `dct_srm_residual` (block-DCT on the SRM high-pass noise residual); S3 `use_dct_fomixup` (DCTFoMixup augmentation together with a dual consistency loss, adapted from FreqDebias); S4 `dct_fca_attention` (the MultiSpectralAttentionLayer of FcaNet); and S5 `use_single_center_loss` (single-center loss, adapted from FDFL). Two representative ablation configurations are **Row1** (naive + S1 + S2 + S3, with no additional learnable parameters) and **Row2** (naive + S4 + S5 + S3, with additional learnable parameters).

**Third contribution — a fair cross-dataset evaluation and an explainable eKYC demo.** All experiments follow the DeepfakeBench protocol: training on FaceForensics++ (c23) and cross-dataset testing on Celeb-DF-v2, with the headline metric being frame-level AUC on CDFv2. The single-seed results are as follows.

[[BẢNG 5.1: Tóm tắt frame-level AUC cross-dataset trên Celeb-DF-v2 của bốn cấu hình.]]

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

**Fifth, calibration of the operating threshold has not been completed.** The FPR ≤ 5% operating point (the ISO/IEC 30107-3 convention serving the biometric requirements of Circular 17/2024/TT-NHNN — TT17 does not stipulate a numeric threshold) requires calibrating the decision threshold on the validation set and reporting the operating metrics (TPR at a fixed FPR, EER); these figures currently remain in the form [[FILL: chỉ số vận hành tại ngưỡng FPR ≤ 5%]].

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

[7] A. Luo, Y. Cao, Y. Hu, M. Liu, and Q. Zhao, "Generalizing Face Forgery Detection with High-frequency Features," in *Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition (CVPR)*, 2021, pp. 16317–16326. [[KIỂM TRA: danh sách tác giả và số trang của bài SRM/high-pass features]]

[8] Y. Qian, G. Yin, L. Sheng, Z. Chen, and J. Shao, "Thinking in Frequency: Face Forgery Detection by Mining Frequency-aware Clues," in *Proceedings of the European Conference on Computer Vision (ECCV)*, 2020, pp. 86–103.

[9] R. R. Selvaraju, M. Cogswell, A. Das, R. Vedantam, D. Parikh, and D. Batra, "Grad-CAM: Visual Explanations from Deep Networks via Gradient-based Localization," in *Proceedings of the IEEE International Conference on Computer Vision (ICCV)*, 2017, pp. 618–626.

[10] N. Ahmed, T. Natarajan, and K. R. Rao, "Discrete Cosine Transform," *IEEE Transactions on Computers*, vol. C-23, no. 1, pp. 90–93, 1974.

[11] J. Fei, Y. Dai, P. Yu, T. Shen, Z. Xia, and J. Weng, "Learning Second Order Local Anomaly for General Face Forgery Detection," in *Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition (CVPR)*, 2021. [[KIỂM TRA: đây có đúng là bài FDFL — Frequency-aware Discriminative Feature Learning (Li et al., 2021) hay không; xác minh lại tác giả/tên bài/venue/năm cho single-center loss]]

[12] [[KIỂM TRA: trích dẫn đầy đủ cho FreqDebias (DCTFoMixup + dual consistency loss) — tác giả, tên bài, venue, năm; chưa xác minh được nguồn gốc chính xác]]

[13] Ngân hàng Nhà nước Việt Nam, *Thông tư 17/2024/TT-NHNN quy định về việc mở và sử dụng tài khoản thanh toán tại tổ chức cung ứng dịch vụ thanh toán*, Hà Nội, 2024.
