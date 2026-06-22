# SFCL-HCMF — Re-implementation (unofficial)

A faithful, runnable PyTorch re-implementation of:

> **Towards Generalizable Deepfake Detection with Spatial-Frequency
> Collaborative Learning and Hierarchical Cross-Modal Fusion**
> Mengyu Qiao, Runze Tian, Yang Wang. arXiv:2504.17223 (2025).
> (Later published as **SFCL**, IJCB 2025.)

> ⚠️ **No official code was released by the authors.** This repository is an
> independent reconstruction from the paper's equations and figures. Numbers
> from your runs may differ from the paper.

---

## ⚖️ Academic-integrity note (read this first)

This code is intended as a **baseline / comparison method** to reproduce and
benchmark against — **not** as your own contribution. If you use it in a thesis
or paper:

- **Cite the original paper** wherever you use the architecture.
- Describe it as *"a re-implementation of SFCL-HCMF (Qiao et al., 2025), used as
  a baseline,"* not as a novel method of yours.
- Your own novelty must live elsewhere (e.g. for an eKYC thesis: regulatory
  threshold calibration, liveness detection, deployment — components this paper
  does **not** address).

Re-implementing a published SOTA method to compare against is standard, valuable
research practice. Presenting it as original work is not.

---

## Architecture (paper Fig. 2)

```
            ┌─────────────► Spatial pipeline: EfficientNet-B4 ──► shallow map X_S, deep S(1792)
  RGB face ─┤
   (0..255) └─► BlockDCT(8×8, YCbCr) ─► X~ [B,3,64,H/8,W/8] ─┬─► Local Branch (SBCM 3D + CNN-F) ─► F(2048), SBCM map
                                                             └─► Global Branch (SIDA differentials) ─► D(2304)

  Shallow fusion :  FAAE(X_S, SBCM map) ──► frequency-enhanced spatial features
  Deep fusion    :  HCMA(S, F, D) ─► F_fused ─► Classifier ─► {real, fake}
```

| Module | File | Paper section | Output |
|---|---|---|---|
| Block-wise DCT (YCbCr, 8×8, zigzag) | `sfcl/dct.py` | 3.2 | `X~ [B,3,64,H/8,W/8]` |
| SIDA — global differential stats | `sfcl/sida.py` | 3.2.1, eq 1-8 | `D [B,2304]` |
| SBCM + CNN-F — local branch | `sfcl/local_branch.py` | 3.2.2, eq 9 | `F [B,2048]` |
| FAAE — shallow cross-modal | `sfcl/fusion.py` | 3.3.1, eq 10-13 | enhanced `X_S` |
| HCMA — deep cross-modal + gating | `sfcl/fusion.py` | 3.3.2, eq 14-17 | `F_fused [B,1024]` |
| Full model (+ ablation flags) | `sfcl/model.py` | Fig. 2 | logits `[B,2]` |

---

## Install & quick check

```bash
pip install -r requirements.txt          # torch, numpy, pillow, scikit-learn
pip install timm                         # for the real EfficientNet-B4 backbone

python -m sfcl.smoke_test                # end-to-end shape check (uses a stub backbone)
```

Each module is independently runnable, e.g. `python -m sfcl.dct`,
`python -m sfcl.sida`, `python -m sfcl.fusion`.

## Train (paper config, Sec 4.1)

```bash
python -m sfcl.train \
  --train_dir DATA/train --val_dir DATA/val \
  --backbone timm --epochs 20 --batch_size 20 --lr 1e-3 --weight_decay 1e-8
```

Paper settings baked into `train.py`: Adam, lr `1e-3`, weight_decay `1e-8`,
batch `20`, input `380×380`, `20` epochs, Acc + AUC at image level, 2× GPU via
`DataParallel`.

Expected data layout (already-cropped faces):

```
DATA/train/real/*.png   DATA/train/fake/*.png
DATA/val/real/*.png     DATA/val/fake/*.png
```

For raw videos (FF++, Celeb-DF, DFDC): extract frames and crop faces first
(dlib / MTCNN / RetinaFace), then point the dataset at the crop folders. Frame
extraction + face cropping is left to you (needs the raw videos and a detector).

## Ablation (paper Tables 3 & 4)

`build_model()` exposes toggles to reproduce the component ablations:

```python
from sfcl.model import build_model
build_model(backbone="timm", use_sida=False)   # remove SIDA (global branch)
build_model(backbone="timm", use_local=False)  # remove SBCM/local frequency branch
build_model(backbone="timm", use_faae=False)   # remove shallow fusion
build_model(backbone="timm", use_hcma=False)   # replace deep fusion with simple concat
```

---

## Reconstruction choices (where the paper is ambiguous)

These are documented so you can defend them or adjust:

1. **Input 380→384 for DCT.** EfficientNet-B4's native 380×380 is not divisible
   by 8, so `BlockDCT` reflect-pads to 384 before block transform. The spatial
   backbone still receives the original 380.
2. **SBCM channel schedule.** The paper specifies 3D kernels `(7,1,1)→(5,1,1)→
   (3,1,1)` along the 64 spectral bands and an output of `C=64, depth=3`, but not
   the intermediate channels. We use `3→16→32→64` with strided depth reduction +
   adaptive pool to depth 3.
3. **CNN-F backbone.** Paper: a modified Xception (first two convs + one
   separable block removed, replaced by SBCM, 192 input channels). We provide a
   self-contained Xception-style body (separable-conv stacks → 2048-d). Swap in
   `timm.create_model("xception")` for the exact original topology.
4. **HCMA dimensions.** The text mentions projecting `S,F` to `R^1792` while the
   `W_Q/W_K/W_V` are `R^{1024×1024}`. We project both modalities to
   `d_model=1024` (matching the weight matrices) and run 8-head attention, using
   the 8 heads as the sequence dimension so attention is non-degenerate on a
   single fused token.
5. **SIDA stat layout.** Four stats (mean/std/skew/kurt) on |row|, |col|, |intra|
   differential maps, each reduced over the (H/8, W/8) spatial dims to a
   `C·64 = 192`-d vector → `4 × (3 × 192) = 2304`, matching eq. 8.

If/when the authors release official code (check the IJCB 2025 page), diff
against it and adjust items 2–4 in particular.

---

## File map

```
sfcl_hcmf/
├── requirements.txt
├── README.md
└── sfcl/
    ├── dct.py           # block-wise DCT front-end
    ├── sida.py          # global differential branch -> D(2304)
    ├── local_branch.py  # SBCM(3D) + CNN-F -> F(2048)
    ├── fusion.py        # FAAE (shallow) + HCMA (deep)
    ├── spatial.py       # EfficientNet-B4 wrapper (timm/torchvision/stub)
    ├── model.py         # full SFCL-HCMF + ablation flags
    ├── data.py          # FaceCropDataset
    ├── train.py         # training loop (paper hyper-params)
    └── smoke_test.py    # end-to-end shape validation
```
