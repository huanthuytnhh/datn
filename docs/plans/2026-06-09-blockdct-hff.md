# Block-DCT-HFF on B4 — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: superpowers:executing-plans, task-by-task.
> Project rules: **smoke-test (shape→dry-run→overfit-1-batch) before any full/paid run**; file ≤250 lines;
> **commit only when asked**; NO `Co-Authored-By`; branch `dev-thanhln-blockdct-hff`.

**Goal:** Train an end-to-end detector that keeps **block-DCT as the only frequency operator** but adopts
HFF's *winning mechanism* (learnable, multi-scale, residual-guided attention) — and **measure honestly**
whether it beats naive SFDCT (0.7572) on CDFv2 cross-test, with SRM/shuffle controls.

**Architecture:** B4 spatial trunk + a **block-DCT high-pass RESIDUAL** stream (learnable conv, multi-scale)
+ **residual-guided spatial attention** + **zero-init gated fusion** (floor≥B4). Block-DCT 8×8 is the sole
frequency transform. (SRM-residual variant = control only.)

**Tech:** DeepfakeBench / PyTorch. Anchors: `training/detectors/efficientnetb4_sfdct_detector.py`,
`training/detectors/sfdct_core.py`, `training/config/detector/efficientnetb4_sfdct.yaml`,
`training/trainer/trainer.py`. efficientnet_pytorch trunk (`extract_endpoints` for multi-scale).

---

## ⚠️ HONEST EXPECTATION (read before spending GPU)

Pre-screen evidence is **MIXED**, not a green light:
- block-DCT-residual frozen-probe: **GO 0.598 on naive trunk, but ~chance 0.506 on neutral B4 trunk** (trunk-dependent).
- DCT-sign ("phase"): **dead** (below chance on neutral trunk) → NOT used.
- naive gate α≈0 → current fusion leaves the DCT branch inert (this design FORCES it via RSA + dedicated stream).

**Realistic outcome:** likely **~naive (0.75–0.77)**, with an honest chance of a small gain if RSA + multi-scale
make the residual stream contribute. **A block-DCT-HFF ≤ SRM-HFF result is a VALID finding, not a failure.**
The thesis value is the clean ablation (block-DCT vs SRM vs shuffle within one HFF-style framework), regardless
of who wins. Do NOT promise an AUC win in the report.

---

## Files

- **New:** `DeepfakeBench/training/detectors/sfdct_hff_core.py` (modules, ≤250 lines)
- **New:** `DeepfakeBench/training/detectors/efficientnetb4_hff_detector.py` (detector, overrides `features()`)
- **New:** `DeepfakeBench/training/config/detector/efficientnetb4_hff.yaml`
- **Modify:** `training/trainer/trainer.py` — val-selection (FF++ held-out, replace test-peek `save_best`)
- **Reuse:** `sfdct_core.py` `dct_matrix`, `zigzag_band_of`, `SRMHighPass`; probe `BlockDCTHighPass` logic.

---

## PHASE 0 — Correctness (do first, applies to all runs)

### Task 0.1: FF++ held-out val split + val-based checkpoint selection
**Files:** `training/dataset/abstract_dataset.py` (add `mode=='val'`), `trainer.py:375-389` (`save_best` reads FF++-val, not CDFv2), both yamls (`val_dataset`).
- Step 1: test `tests/test_val_split.py` — val loader is FF++ holdout, not CDFv2; `save_best` uses val metric.
- Step 2: run → FAIL. Step 3: implement. Step 4: PASS. Step 5: smoke 1-epoch. Step 6: commit (when asked).
> Removes the test-peek objection. Re-baseline B4 + naive under val-selection OR disclose protocol in report.

---

## PHASE 1 — Build block-DCT-HFF modules (`sfdct_hff_core.py`)

### Task 1.1: `BlockDCTHighPass` (0-param residual image)
8×8 block-DCT → zero DC + (k−1) low zigzag bands → iDCT → residual image [B,3,H,W].
(Copy from `tools/probe_residual_modality.py::BlockDCTHighPass`, verified working.)
- Smoke: shape [B,3,256,256] in→out; residual mean≈0; k∈{1,2,3} configurable.

### Task 1.2: High-frequency conv stream
Small conv stack (e.g. 3× [conv3×3→BN→ReLU→stride2] from 3ch → C) producing a feature map matching a B4
endpoint resolution. Keep lightweight (≤~1M params). Output feeds fusion.
- Smoke: residual [B,3,256,256] → [B,C,8,8] (or matched scale).

### Task 1.3: `ResidualGuidedSpatialAttention` (HFF RSA)
residual feature → MaxPool+AvgPool over channels → 7×7 conv → sigmoid → spatial attention map M;
B4 feature `F → F * M`. Init conv near-zero so M≈1 at start (≈ identity → floor preserved).
- Smoke: M∈[0,1], shape matches B4 feature; at init F*M ≈ F.

### Task 1.4: Multi-scale hook + zero-init gated fusion
Apply 1.1→1.2 at 2 B4 scales (e.g. reduction_4 @160ch, reduction_5 @448ch via `extract_endpoints`),
RSA-gate each, then fuse the high-freq stream into the final [B,1792,8,8] via **zero-init gate** (reuse
`GatedCrossAttnFusion` gate_mode='zero' or a scalar-gated add `x + α·stream`, α=0 init).
- Smoke: at init, output == B4 final map (gate 0, M≈1) → floor≥B4 verified.

---

## PHASE 2 — Detector + config

### Task 2.1: `efficientnetb4_hff_detector.py`
Inherit `EfficientDetector`; override `features()`:
```
endpoints = backbone.extract_endpoints(image)         # multi-scale
res  = BlockDCTHighPass(image)                         # block-DCT residual
hf   = HFStream(res) gated by RSA at reduction_4/5
out  = zero_init_gate_fuse(endpoints[final], hf)       # floor≥B4
```
`get_optim_groups`: gate/stream get `lr_mult` warm-up (like sfdct detector).
- `residual_source: {blockdct, srm}` config switch → enables the **C2 SRM control** with same architecture.
- `shuffle_bands` passthrough → **C1 negative control**.

### Task 2.2: `efficientnetb4_hff.yaml`
Clone `efficientnetb4_sfdct.yaml`; add `residual_source`, `dct_drop_low_bands`, `hf_stream_dim`, `lr_mult`.
Keep batch 32, Adam 2e-4, FF++ c23→CDFv2, seed 1024, `lr_scheduler: cosine`, val-selection ON.

---

## PHASE 3 — Smoke + ablation runs (vast.ai)

**Smoke FIRST (local 3050, $0):** `nEpochs:1`, `frame_num:4` → shape→dry-run→overfit-1-batch. Gate=0 ⇒ ≈B4.

### Ablation set — **ONLY 2 RUNS, split of R3** (single-seed 1024; ~$3/run = ~$6). No SRM (off block-DCT title).
| Run | Config | Isolates |
|-----|--------|----------|
| **R1** | block-DCT residual stream + zero-init gate (single-scale, NO multi-scale/RSA) | learnable residual-image stream vs naive band-stats |
| **R3** | R1 + multi-scale + RSA **(= full block-DCT-HFF)** | the HFF mechanism (multi-scale + residual-guided attn) on top of R1 |

Reuse **B0 (0.7497)** + **B1 naive (0.7572)** — $0.
**Outcome reading:** R1>naive → residual-image stream helps; R3>R1 → mechanism adds value; R1≈R3≈naive → ceiling confirmed.

**⚠️ Control dropped:** no SRM / same-capacity / shuffle control this round → if R3>naive, frequency-vs-capacity
attribution is WEAKER (R1↔R3 only isolates multi-scale/RSA, not total added params). Disclose this caveat in the
report; add `shuffle_bands` or SRM control later only if budget allows.

### Abort gate (per run, save $)
After 2–3 epochs check **FF++-val AUC**: if not tracking ≥ B4's val curve, **kill** (lose <$1). Log the kill.

---

## Testing / reporting
- Per module: smoke (shape→overfit-1-batch) before any full run.
- **Line-chart metrics (REQUIRED):** trainer auto-writes `logs/training/<tag>/training.log` (per-iter loss/AUC +
  per-epoch test AUC). After each run: `python report_prepare/mt09_training_curves.py --all` →
  `outputs/training_curves/<tag>.png` = 3 line charts (train loss / train AUC / test AUC FF++ & CDFv2 per epoch).
  Parses REAL logs only (no simulated curves — the script enforces this). Produce one per R1, R3.
- Final: full CDFv2 eval (val-selected ckpt), report R1 + R3 vs B0/B1 in one table + the training-curve PNGs.
- **Honest report rule:** state val-selection protocol; if block-DCT-HFF ≤ naive or ≤ SRM, report it plainly
  as the ablation finding (which mechanism/modality moves cross-dataset AUC) — do NOT spin.

## Notes
- Block-DCT 8×8 stays the sole frequency transform in R1–R3 (title-safe). SRM only in C2 (labeled control).
- No FFT-phase, no DCT-sign (both pre-screened dead/off-title). No SBI. No shallow exit (probe NO on B4).
- Commit only when asked; branch `dev-thanhln-blockdct-hff`.
