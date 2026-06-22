#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Blend-boundary test for HFF: run the ACTUAL BlockDCTHighPass(drop_k=3) on real vs fake faces
and show the high-pass residual image. If fakes light up a seam/boundary more than reals, that
supports the 'HFF keys on the blend boundary' explanation. English labels, no 'Figure' number.
Real test frames from data_dict_test.pickle (Celeb-DF-v2). NO simulated data."""
import sys, pickle
from pathlib import Path
import numpy as np
import torch
import matplotlib; matplotlib.use("Agg")
import matplotlib.pyplot as plt
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "DeepfakeBench" / "training" / "detectors"))
from sfdct_hff_core import BlockDCTHighPass                       # the real module

DS  = ROOT / "DeepfakeBench" / "datasets"
FIG = ROOT / "report" / "figures"
PKL = ROOT / "report" / "evidence" / "ablation_cdfv2" / "pickles" / "sfdct" / "data_dict_test.pickle"
rng = np.random.RandomState(7)
NCOL = 6                                                          # examples per class

# input_mean=0, input_std=1 -> module denorm is identity; feed raw [0,1] image
hp = BlockDCTHighPass(drop_k=3, nbands=16, block=8, input_mean=0.0, input_std=1.0).eval()

def load(p):
    return np.asarray(Image.open(p).convert("RGB").resize((256, 256)), np.float32) / 255.

def residual(rgb):
    x = torch.from_numpy(rgb.transpose(2, 0, 1))[None]            # [1,3,256,256] in [0,1]
    with torch.no_grad():
        r = hp(x)[0].numpy()                                     # [3,256,256] high-pass residual
    mag = np.abs(r).mean(0)                                       # per-pixel magnitude
    return mag

d = pickle.load(open(PKL, "rb")); imgs, labs = list(d["image"]), list(d["label"])
real = [str(DS/p) for p, y in zip(imgs, labs) if y == 0]
fake = [str(DS/p) for p, y in zip(imgs, labs) if y == 1]
rng.shuffle(real); rng.shuffle(fake)
real, fake = real[:NCOL], fake[:NCOL]

fig, ax = plt.subplots(4, NCOL, figsize=(2.1*NCOL, 9.0))
rowlab = ["REAL — face", "REAL — high-pass residual",
          "FAKE — face", "FAKE — high-pass residual"]
e_real, e_fake = [], []
for col in range(NCOL):
    for blk, paths, store in [(0, real, e_real), (2, fake, e_fake)]:
        rgb = load(paths[col]); mag = residual(rgb); store.append(mag.mean())
        ax[blk,   col].imshow(rgb)
        vmax = np.percentile(mag, 99)                             # robust contrast
        ax[blk+1, col].imshow(mag, cmap="magma", vmin=0, vmax=vmax)
        for r in (blk, blk+1):
            ax[r, col].set_xticks([]); ax[r, col].set_yticks([])
for r in range(4):
    ax[r, 0].set_ylabel(rowlab[r], fontsize=9)

mr, mf = float(np.mean(e_real)), float(np.mean(e_fake))
print(f"mean residual magnitude  real={mr:.4f}  fake={mf:.4f}  (fake-real={mf-mr:+.4f})")
fig.suptitle("HFF high-pass residual (drop_k=3, bands 3-15): real vs fake faces — "
             f"mean |residual| real={mr:.3f}, fake={mf:.3f}",
             fontsize=12, fontweight="bold")
fig.tight_layout()
out = FIG / "fig_hff_residual.png"
fig.savefig(out, dpi=150, bbox_inches="tight"); plt.close(fig)
print("saved:", out)
