#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Phổ block-DCT theo từng kênh Y/Cb/Cr — FF++ real vs fake (+ hiệu).
YCbCr dùng đúng ma trận BT.601 như _RGB2YCBCR trong sfdct_core. Block 8×8 -> DCT -> log|.| ->
trung bình mọi block & nhiều ảnh => phổ 8×8/kênh. Số/ảnh THẬT, gộp ~200 ảnh/nhóm."""
import glob
from pathlib import Path
import numpy as np
import matplotlib; matplotlib.use("Agg")
import matplotlib.pyplot as plt
from PIL import Image
from scipy.fftpack import dct

ROOT = Path(__file__).resolve().parents[2]
DS = ROOT / "DeepfakeBench" / "datasets"
FIG = ROOT / "report" / "figures"
rng = np.random.RandomState(0)
K = 200
M = np.array([[0.299, 0.587, 0.114],            # BT.601 RGB->YCbCr (khớp model)
              [-0.168736, -0.331264, 0.5],
              [0.5, -0.418688, -0.081312]], np.float32)

def channels_dct(path, B=8):
    rgb = np.asarray(Image.open(path).convert("RGB").resize((256, 256)), np.float32) / 255.
    ycc = rgb @ M.T                                            # [256,256,3] = Y,Cb,Cr
    out = []
    for c in range(3):
        blk = ycc[:, :, c].reshape(32, B, 32, B).transpose(0, 2, 1, 3).reshape(-1, B, B)
        L = np.log1p(np.abs(dct(dct(blk, axis=1, norm="ortho"), axis=2, norm="ortho")))
        out.append(L.mean(0))                                  # 8x8
    return np.stack(out)                                       # [3,8,8]

def agg(globpat, k=K):
    fs = glob.glob(globpat); rng.shuffle(fs); fs = fs[:k]
    return np.mean([channels_dct(f) for f in fs], 0), len(fs)  # [3,8,8]

R, nr = agg(str(DS / "FaceForensics++/original_sequences/youtube/c23/frames/*/*.png"))
F, nf = agg(str(DS / "FaceForensics++/manipulated_sequences/*/c23/frames/*/*.png"))

chans = ["Y  (luma)", "Cb  (chroma)", "Cr  (chroma)"]
fig, ax = plt.subplots(3, 3, figsize=(9.5, 9.2))
for r in range(3):
    rr, ff = R[r], F[r]
    m = np.ones((8, 8), bool); m[0, 0] = False                 # bỏ DC khỏi thang màu
    vmin, vmax = min(rr[m].min(), ff[m].min()), max(rr[m].max(), ff[m].max())
    d = rr - ff; dl = float(np.abs(d).max())
    im0 = ax[r, 0].imshow(rr, cmap="viridis", vmin=vmin, vmax=vmax, interpolation="nearest")
    ax[r, 1].imshow(ff, cmap="viridis", vmin=vmin, vmax=vmax, interpolation="nearest")
    imd = ax[r, 2].imshow(d, cmap="coolwarm", vmin=-dl, vmax=dl, interpolation="nearest")
    ax[r, 0].set_ylabel(chans[r], fontsize=12, fontweight="bold")
    fig.colorbar(im0, ax=[ax[r, 0], ax[r, 1]], fraction=.046, pad=.02)
    fig.colorbar(imd, ax=ax[r, 2], fraction=.09, pad=.04)
    for a in ax[r]:
        a.set_xticks([0, 7]); a.set_yticks([0, 7])
    print(f"{chans[r].strip()}: hi-band(real-fake)[4:,4:] = {(rr[4:,4:]-ff[4:,4:]).mean():+.4f}  DCΔ(real-fake)={d[0,0]:+.3f}")
for j, t in enumerate(["Real", "Fake", "Real − Fake"]):
    ax[0, j].set_title(t, fontsize=12, fontweight="bold")
fig.suptitle(f"Block-DCT spectrum per YCbCr channel — FF++ real vs fake  (n_real={nr}, n_fake={nf})",
             fontsize=12, fontweight="bold")
fig.savefig(FIG / "fig_ycbcr_dct_spectrum.png", dpi=160, bbox_inches="tight"); plt.close(fig)
print("saved:", FIG / "fig_ycbcr_dct_spectrum.png")
