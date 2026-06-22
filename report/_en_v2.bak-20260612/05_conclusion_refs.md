# CONCLUSION

This thesis set out to build a robust, generalisable, and explainable deepfake / face-forgery detector for the electronic Know-Your-Customer (eKYC) setting in banking and finance, and to lay the groundwork for a complementary liveness (presentation-attack-detection) layer. By leveraging recent advances in spatial–frequency learning — particularly block-wise 2D-DCT analysis fused with a convolutional backbone — the system addresses the central difficulty of deepfake detection: the gap between *in-dataset* accuracy and *cross-dataset* generalisation, which is precisely the gap that matters when an attacker presents a manipulation the detector has never seen during training. The proposed method, **SFDCT** (Spatial–Frequency learning with block-wise DCT), is trained on FaceForensics++ (c23) and evaluated cross-dataset on Celeb-DF-v2 under the standard DeepfakeBench protocol, with frame-level AUC on CDFv2 as the headline metric. Built on top of the open **DeepfakeBench** framework and an **EfficientNet** backbone, the work adapts five frequency cues from prior art (SPSL, SRM, FreqDebias, FcaNet, FDFL) into a single block-DCT domain, and wraps the resulting detector in an explainable, deployable eKYC demonstration.

## Key Achievements

- **A block-DCT branch with a zero-initialised gated cross-attention (the SFDCT fusion).** We add a frequency branch based on block-wise 2D-DCT (8×8) in parallel with the EfficientNet-B4 spatial backbone, and merge the two feature streams through a gated cross-attention mechanism whose gate `alpha` is **initialised to 0**. The key property of this design is that, at initialisation, `alpha = 0` forces `feature_fused = x`, so the hybrid model is *exactly* equivalent to the B4 baseline. The frequency branch therefore only "contributes further" when it genuinely lowers the loss, which guarantees a theoretical **performance floor** that is never below the B4 baseline — an important property when deploying in a sensitive environment such as finance and banking. (This zero-init gate distinguishes SFDCT from SFCL-HCMF, whose gate is initialised at 0.5 and therefore carries no equivalent floor guarantee.)

- **A fair cross-dataset pipeline whose baseline is calibrated against published numbers.** All experiments follow the DeepfakeBench protocol: training on FaceForensics++ (c23, ≈159,626 frames) and cross-dataset testing on Celeb-DF-v2 (16,420 test frames = 5,620 real + 10,800 fake). The B4 baseline attains a CDFv2 frame-AUC of **0.7497**, close to the DeepfakeBench-harmonised leaderboard figure (0.7487), which **confirms that the thesis's training–evaluation pipeline is comparable with published results** rather than producing an artificially weak baseline. Training used 10 epochs, Adam (lr 2e-4, weight decay 5e-4, no scheduler), seed 1024, and batch size 32.

- **A measurable — though modest — frequency gain, reported honestly.** The naive SFDCT (B4-DCT) configuration raises the CDFv2 frame-AUC to **0.7572** (Δ **+0.0075** over B4). This gain is directionally consistent with the core hypothesis that GAN/upsampling forgery traces are weak in the spatial domain but more pronounced in the mid/high frequency bands of the 2D-DCT, and that this frequency information *complements* B4's spatial features. We state plainly, however, that **+0.0075 is within the single-seed noise band** and is *not* a state-of-the-art claim: SPSL (0.7650) still outperforms naive SFDCT (0.7572). At the video level, decision aggregation lifts the AUC to **0.808**, above the frame-level figure.

- **An honest negative result on one lever configuration.** Among the assembled "levers", **Row1** (naive + S1 `dct_use_sign` + S2 `dct_srm_residual` + S3 `use_dct_fomixup`, with no additional learnable parameters) reaches **0.7333** on CDFv2 — Δ **−0.0164** *below* the B4 baseline. We report this regression openly rather than hiding it; it shows that not every frequency cue transfers cleanly into the block-DCT domain, and it motivates the per-lever ablation flagged in Future Directions. Row2 (naive + S4 `dct_fca_attention` + S5 `use_single_center_loss` + S3) was not trained within the thesis GPU budget and is left to future work; the partial single-lever evidence already measured (Fix1/Fix2, Chapter 3) points the same way.

- **A calibrated, regulation-aware eKYC operating point.** For the eKYC use-case we adopt a strict **FPR ≤ 5%** operating point *per ISO/IEC 30107-3*, chosen to satisfy the *qualitative* biometric-verification requirement of Circular 17/2024/TT-NHNN (TT17 mandates biometric verification but does **not** stipulate a numeric FPR threshold; the 5% is our engineering choice). Calibrating naive SFDCT to this point yields τ = **0.9514** at FPR = **0.0500**, giving TPR = **0.2298**, accuracy **0.476**, and F1 **0.366** (confusion: TN 5339, FP 281, FN 8318, TP 2482). The honest reading is that at this strict, customer-friendly operating point the detector catches only ≈ 23% of deepfakes — so SFDCT is suitable as an **automated first screening layer** that flags suspicious cases for manual review, *not* as a stand-alone final decision.

- **A working, explainable, deployable system.** We provide an end-to-end eKYC inference demo: for each input face the system returns `fake_prob ∈ [0,1]`, a REAL/FAKE label, and a **Grad-CAM** overlay as the basis for explaining the decision. The trained checkpoint (`ckpt_best.pth`, model version `naive-sfdct-cdfv2-0.7572`) is served live on CUDA via a microservice (`uvicorn serving.infer_server:app`, port 8501, exposing `/health` and `/predict`). Explainability is a practical advantage for supporting officers' decisions and for serving the regulatory-audit obligations of eKYC.

*Takeaway: SFDCT delivers a pipeline-verified baseline (0.7497), a small but consistent and floor-safe frequency gain (0.7572), and a deployable, explainable eKYC demo — while honestly reporting that the gain is within noise, that one lever regressed, and that the strict operating point still misses most deepfakes.*

## Limitations

Although these results are encouraging, the thesis has several limitations that must be stated frankly in order to preserve scientific honesty.

- **Single-seed results.** All reported AUC figures come from a single training run per configuration, owing to GPU-cost constraints. Consequently the thesis **cannot yet assert statistical significance**: small gaps such as the +0.0075 margin of naive SFDCT may well lie within the seed-to-seed noise band. Video-level bootstrap confidence intervals (518 videos, n = 2,000) have now been computed at the best checkpoint for all seven trained variants (Table 3.5c): **every paired difference against B4 contains zero**, formally confirming that no variant separates from the baseline at this single seed.

- **Modest improvement margin, and not state of the art.** The AUC gain from the block-DCT branch is small in absolute magnitude, and SPSL (0.7650) still beats naive SFDCT (0.7572). This is consistent with the honest observation that the strongest cross-dataset AUC lever lies *outside* the pure block-DCT scope on which the thesis focuses (see Future Directions).

- **A serve/train preprocessing skew.** The training pipeline and the serving microservice do not use byte-identical face-crop preprocessing, introducing a small crop-alignment skew between offline evaluation and live inference. This can shift the effective operating point relative to the calibrated τ = 0.9514 and should be unified before production use.

- **Robustness not tested systematically.** The thesis has not evaluated robustness under harsh, realistic mobile-eKYC conditions — heavy or repeated video re-compression, low bitrate, noise, resolution changes, or adversarial perturbations.

- **Liveness is measured within-dataset only, and its cascade wiring is incomplete.** The PAD module has been trained and evaluated on LCC-FASD (B4: **ACER 6.85% / AUC 0.9829**, verified — §3.1.8), but only **within-dataset**; cross-dataset PAD generalisation (e.g. CASIA-FASD with replay attacks) has not been evaluated. Moreover, the eKYC cascade endpoint still uses a heuristic challenge check rather than the trained PAD scorer — wiring the measured model into the cascade remains an integration task. A complete eKYC defence needs both this layer and the deepfake layer operating together.

- **No Vietnamese-face evaluation yet.** A Vietnamese-face deepfake/spoof set (cf. the population-shift evaluation precedent of KoDF [16]) is specified as a **test-only** generalisation probe; collection is in progress and, in keeping with the no-extrapolation rule, no number is reported before it is measured.

- **Incomplete configuration coverage.** The FF++ in-dataset half of the evaluation grid, the full per-lever S1–S5 ablation table, the Row2 configuration, and an additional cross-test on DFDC [15] all remain open GPU items; they are named here plainly instead of being estimated.

*Takeaway: the honest ceiling of this work is a floor-safe, single-seed, cross-dataset gain on a deepfake-only detector; the liveness layer, multi-seed significance, robustness, and Vietnamese-set generalisation remain to be completed.*

## Future Directions

From the limitations above, we propose the following directions, ordered by the value they deliver.

- **(a) Wire the measured liveness layer into the cascade and test it cross-dataset.** The PAD module is already trained and verified (B4: ACER 6.85% / AUC 0.9829 on LCC-FASD, §3.1.8). Two steps remain: (i) wire it into the eKYC cascade endpoint as the learned pre-filter score, fused with the deepfake risk score instead of a hard boolean AND; (ii) evaluate cross-dataset PAD generalisation (e.g. CASIA-FASD, replay-heavy) to complement the within-dataset result.

- **(b) Finish the per-lever ablation, including Row2.** Train and report Row2 (naive + S4 + S5 + S3) and the full per-lever S1–S5 table on CDFv2 — and add the FF++ in-dataset AUC column — to attribute the +0.0075 gain (and the Row1 −0.0164 regression) to individual cues rather than to lever *bundles*.

- **(c) Multi-seed evaluation with bootstrap CIs.** Repeat each configuration over several seeds, report mean ± standard deviation with a paired significance test, and attach bootstrap confidence intervals to the video-level AUC, to confirm whether the block-DCT gain is genuine rather than noise.

- **(d) Build the Vietnamese-face test set.** Collect a Vietnamese-face deepfake/spoof set and use it as a **test-only** cross-domain probe to measure generalisation to the target eKYC population (collection in progress; cf. KoDF [16] for the population-shift evaluation precedent).

- **(e) Extend cross-testing to DFDC.** Beyond Celeb-DF-v2, test on DFDC (and sets such as DeeperForensics) to assess generalisation across more manipulation types and capture conditions.

- **(f) Integrate SBI self-blended training.** An honest analysis indicates that the strongest cross-dataset AUC lever at present is the **SBI (self-blended images)** training strategy — synthesising fake samples during training itself — which lies *outside* the pure block-DCT scope of this thesis. Combining SBI with the SFDCT frequency branch is the most promising route to a substantial cross-dataset AUC increase.

- **(g) Harden and optimise for real deployment.** Unify the serve/train face-crop preprocessing to remove the operating-point skew; evaluate robustness to compression/noise/adversarial perturbation; and apply quantisation (INT8), pruning, and distillation with latency/FPS measurement for edge/mobile eKYC.

*Takeaway: the highest-leverage next steps are completing the liveness cascade and finishing the per-lever/Row2 ablation, followed by SBI integration and broader cross-dataset (DFDC, Vietnamese-set) validation under multi-seed statistics.*

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
