# PAPER_PLAN — SFDCT (venue: IEEE_CONF, assurance: draft)

**Title:** *SFDCT: A Floor-Preserving Spatial–Frequency Fusion for Cross-Dataset Deepfake Detection under eKYC Operating Points*

**Honesty stance (từ IDEA_REPORT):** KHÔNG claim SOTA. Bán: C1 safety-property (floor≥B4), C2 regulation-aware eKYC eval, C3 Vietnamese test resource. Δ+0.0075 trong nhiễu — báo thẳng.

## Claims–Evidence Matrix
| Claim | Evidence | Status |
|---|---|---|
| Pipeline đúng (B4≈leaderboard) | B4=0.7497 vs 0.7487 (`viz_out/b4_local`) | ✅ |
| +block-DCT không tệ hơn baseline (floor) | naive=0.7572, gate α>0 | ✅ |
| Δ trong nhiễu (trung thực) | bootstrap CI [−0.004,+0.019], p≈0.18 | ✅ (frame-level; video-level = TODO) |
| Chưa vượt SPSL | SPSL 0.7650 > 0.7572 | ✅ |
| eKYC operating-point: bỏ sót nhiều | τ@FPR5% → TPR 0.23, FN=8318 | ✅ |
| Frequency có tín hiệu (yếu trên c23) | radial real>fake mid/high | ✅ |
| Row1<B4 (ladder không monotonic) | Row1=0.7333 | ✅ (giải thích) |

## Sections (IEEE 2-col)
1. Abstract · 2. Introduction (eKYC threat, cross-dataset gap, 3 đóng góp) · 3. Related Work (frequency/DCT, fusion/zero-init, cross-dataset/eKYC) · 4. Method (B4 + block-DCT + zero-init gated fusion + S1–S5) · 5. Experiments (protocol DeepfakeBench, results, ablation, eKYC operating-point, qualitative) · 6. Discussion & Limitations (honest) · 7. Conclusion.

## Figures (report/figures → paper/figures)
3.1 dist · 3.2 real/fake+DCT · 3.3–3.5 train curve · 3.7 ROC · 3.8 PR · 3.9 confusion · 3.10 tsne · 3.11 frequency · 3.12 gradcam · 3.13 gate.

## TODO (cần re-eval/train, đánh dấu trong paper)
bootstrap cấp-video · ablation 5-đòn per-knob · Row2 · DFDC · demo infer · multi-seed.

## Citations (references.bib)
DeepfakeBench, EfficientNet, F3-Net, SPSL, SRM/Luo, FcaNet, FDFL, FreqDebias, SFCL-HCMF, ReZero, Flamingo, Celeb-DF, FaceForensics++, ISO/IEC 30107-3, TT17/2024.
