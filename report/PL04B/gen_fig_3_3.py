#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Figure 3.3 — Mean frequency energy by 16 zigzag bands, real vs fake + difference,
for BOTH FaceForensics++ (train) and Celeb-DF-v2 (test). Gộp nhiều ảnh khác danh tính.
Block 8×8 DCT -> log|.| -> gom theo zigzag (band=rank//4, khớp sfdct_core). Số THẬT, không mô phỏng.
Ghi đè report/figures/fig_3_11_frequency.png (file mà Figure 3.3 trong MD trỏ tới)."""
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
K = 300                                   # số ảnh mỗi nhóm

def _zigzag_band(n=8, nb=16):
    order = []
    for s in range(2*n-1):
        ks = range(s+1) if s % 2 else range(s, -1, -1)
        for k in ks:
            r, c = (k, s-k) if s % 2 else (s-k, k)
            if r < n and c < n: order.append((r, c))
    bo = np.zeros((n, n), int)
    for rank, (r, c) in enumerate(order):
        bo[r, c] = min(rank*nb//(n*n), nb-1)
    return bo
BAND = _zigzag_band()

def band_vec(p, B=8):
    g = np.asarray(Image.open(p).convert("RGB").resize((256, 256)), np.float32)/255.
    g = g @ np.array([.299, .587, .114], np.float32)
    blk = g.reshape(32, B, 32, B).transpose(0, 2, 1, 3).reshape(-1, B, B)
    L = np.log1p(np.abs(dct(dct(blk, axis=1, norm="ortho"), axis=2, norm="ortho")))
    return np.array([L[:, BAND == b].mean() for b in range(16)])

def agg(globpat, k=K):
    fs = glob.glob(globpat); rng.shuffle(fs); fs = fs[:k]
    return np.mean([band_vec(f) for f in fs], 0), len(fs)

print("đang gộp FF++ ...")
Rff, n1 = agg(str(DS/"FaceForensics++/original_sequences/youtube/c23/frames/*/*.png"))
Fff, n2 = agg(str(DS/"FaceForensics++/manipulated_sequences/*/c23/frames/*/*.png"))
print("đang gộp Celeb-DF ...")
Rcd, n3 = agg(str(DS/"Celeb-DF-v2/Celeb-real/frames/*/*.png"))
Fcd, n4 = agg(str(DS/"Celeb-DF-v2/Celeb-synthesis/frames/*/*.png"))

bands = np.arange(16)
fig, ax = plt.subplots(2, 2, figsize=(11, 7.2))
for row, (R, F, name, nr, nf) in enumerate([
        (Rff, Fff, "FaceForensics++ (train, 4 methods)", n1, n2),
        (Rcd, Fcd, "Celeb-DF-v2 (cross-dataset test)", n3, n4)]):
    aE = ax[row, 0]
    aE.plot(bands, R, "-o", ms=4, color="#55A868", label="real")
    aE.plot(bands, F, "-s", ms=4, color="#C44E52", label="fake")
    aE.set_yscale("log")
    aE.set_xlabel("zigzag band  (0 = DC/low → 15 = high)"); aE.set_ylabel("mean log|DCT|  (log scale)")
    aE.set_title(f"{name} — energy by band  (n_real={nr}, n_fake={nf})", fontsize=10)
    aE.legend(); aE.grid(alpha=.3, which="both")
    aD = ax[row, 1]; diff = R - F
    aD.bar(bands, diff, color=["#55A868" if d >= 0 else "#C44E52" for d in diff])
    aD.axhline(0, color="k", lw=.6)
    aD.set_xlabel("zigzag band"); aD.set_ylabel("real − fake")
    aD.set_title("difference  (positive = real has more → fake is smoother)", fontsize=10)
    aD.grid(alpha=.3, axis="y")
    print(f"{name}: Δ(real-fake) mid/high band[8:] = {diff[8:].mean():+.4f}")
fig.suptitle("Mean DCT energy per zigzag band: real vs fake (FF++ and Celeb-DF)", fontsize=13, fontweight="bold")
fig.tight_layout()
fig.savefig(FIG/"fig_3_11_frequency.png", dpi=160, bbox_inches="tight"); plt.close(fig)
print("saved:", FIG/"fig_3_11_frequency.png")
