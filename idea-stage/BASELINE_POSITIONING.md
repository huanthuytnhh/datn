# Baseline Positioning — which toy = baseline?

**Thesis**: *Hybrid Spatial–Frequency Learning with Block-wise DCT for Deepfake and Liveness
Detection in eKYC.*
**Question**: of the 4 toy notebooks, which should be the **baseline**?

> Pipeline note: this is the *positioning* (Phase 0) output of `/idea-discovery`. The full
> idea-generation pipeline (lit survey → idea-creator → pilots → novelty → review) was **not**
> run — it needs the vast.ai GPU config filled and is opt-in. See "Next" at the bottom.

## TL;DR

Your thesis title **is** the SFCL approach (spatial+frequency, **block-wise DCT**). So:

- **Your method** = `ecsf` (ECSF-Fast, already in `p5/` + registered in DeepfakeBench) — a
  *lighter, eKYC-adapted* SFCL.
- **Primary / strongest baseline** = **SFCL-HCMF** (`sfcl_toy_implementation.ipynb`). It is the
  *direct prior art* your method derives from — the one you must match (ideally at lower cost).
- **DeepfakeBench** (`deepfakebench_toy…`) is **NOT a baseline** — it is your **evaluation
  harness**. Run every method through it (within-domain + cross-dataset, leakage-free splits).
- **F3-Net** and **FcaNet/efficientnetb4_dct** are **secondary frequency baselines**.

## Role of each of the 4 toys

| Toy notebook | Real method | Role in your thesis |
|---|---|---|
| `deepfakebench_toy_implementation.ipynb` | DeepfakeBench (NeurIPS'23 framework) | **Harness, not a baseline.** Train+eval *all* methods here for a fair comparison (within FF++ + cross to Celeb-DF/DFDC; video-disjoint splits). |
| `sfcl_toy_implementation.ipynb` | SFCL-HCMF (Qiao et al. 2025) | **Primary baseline = direct prior art.** Same idea as your title (hybrid spatial-freq + 8×8 block DCT). Your `ecsf` explicitly cites it as the "architectural inspiration / baseline". Headline comparison: **ECSF vs SFCL** (match accuracy at lower cost + eKYC fit). |
| `f3net_toy_implementation.ipynb` | F3-Net (ECCV'20, FAD) | **Frequency baseline** (full-image DCT band decomposition). Classic, must-cite. |
| `fcanet_toy_implementation.ipynb` | FcaNet → `efficientnetb4_dct` | **Frequency-attention baseline** *and* a candidate **component/ablation** of your own model (DCT channel attention on B4). |

## Recommended baseline **suite** (run all under DeepfakeBench)

A thesis needs a *suite*, not one baseline — to show the hybrid earns its complexity:

1. **Spatial**: `xception` and/or `efficientnetb4` (plain RGB). The "naive but surprisingly
   competitive" baseline — DeepfakeBench's own finding; cheap to beat-or-tie.
2. **Frequency**: `f3net` (FAD)  ·  optionally `spsl` / `srm` (other frequency detectors already
   in DeepfakeBench).
3. **Frequency-attention**: `efficientnetb4_dct` (FcaNet) — your repo's block-wise DCT attention.
4. **Hybrid (strong / prior SOTA)**: **SFCL-HCMF** — the one to match/beat.
5. **Your method**: `ecsf` (ECSF-Fast) + ablation `ecsf_nofreq` (spatial-only) to prove the
   frequency branch pays off.

Metric protocol (already in your DeepfakeBench toy): AUC / AP / ACC / EER, **within-domain vs
cross-dataset**, frame-level, leakage-free.

## Gaps the baselines do NOT cover (= your contributions)

None of the 4 toys touch the parts that make this an **eKYC** thesis — so these are
*differentiators*, not baselines, and need their own setup:

- **Liveness / anti-spoofing** (print/replay/mask). Add a FAS baseline (e.g. CDCN / DC-CDN or a
  simple depth/rPPG/texture baseline) + a spoof dataset; deepfake detectors above do not do this.
- **eKYC threshold calibration** (Thông tư 17/2024/TT-NHNN, target FPR ≤ 5%) — report operating
  point, not just AUC.
- **Vietnamese-face robustness** + heavy compression (c40) generalization.

## Verdict

- **"The baseline" (if you must name one)** → **SFCL-HCMF** (`sfcl_toy`).
- **The framework you run everything in** → **DeepfakeBench** (`deepfakebench_toy`).
- **Your method** → **ECSF-Fast** (`p5/ecsf`), positioned as a lighter, eKYC-ready SFCL.

## Next (optional, opt-in)

- Run the *real* `/idea-discovery` on the thesis direction to surface **novel contributions**
  beyond "lighter SFCL" (e.g. liveness+deepfake joint head, compression-robust band selection,
  calibration method). Needs: fill the vast.ai GPU block in `CLAUDE.md` (for pilots) — or run
  paper-only (no pilots).
- Then `/experiment-bridge` to implement the baseline suite + ECSF under DeepfakeBench.
