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

[32] M. Sandler, A. Howard, M. Zhu, A. Zhmoginov, and L.-C. Chen, "MobileNetV2: Inverted Residuals and Linear Bottlenecks" (MBConv block), in *Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition (CVPR)*, 2018, pp. 4510–4520.

[33] K. He, X. Zhang, S. Ren, and J. Sun, "Deep Residual Learning for Image Recognition" (ResNet residual shortcut), in *Proceedings of the IEEE Conference on Computer Vision and Pattern Recognition (CVPR)*, 2016, pp. 770–778.

[34] G. K. Wallace, "The JPEG Still Picture Compression Standard," *IEEE Transactions on Consumer Electronics*, vol. 38, no. 1, pp. xviii–xxxiv, 1992.

[35] U. Mittal, "Understanding the Core Computational Blocks in Deep Learning: A Hands-On Tutorial," *Towards AI*, Jan. 12, 2026. [Online]. Available: https://pub.towardsai.net/understanding-the-core-computational-blocks-in-deep-learning-a-hands-on-tutorial-8b4472a0bcfe (accessed Jun. 17, 2026).
