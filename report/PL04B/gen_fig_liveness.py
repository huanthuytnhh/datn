#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Liveness explainer (style mt16) — LCC-FASD live vs spoof: ví dụ ảnh + footprint 16-band DCT.
Kể đúng kết quả thật §3.1.9: spoof khác live về KHÔNG GIAN nhưng GẦN GIỐNG ở band-DCT → nhánh
tần số không giúp (B4 0.9829 ≥ B4+DCT 0.9776). Số/ảnh THẬT từ LCC_FASD_evaluation. Không số 'Figure'."""
import glob
from pathlib import Path
import numpy as np
import matplotlib; matplotlib.use("Agg")
import matplotlib.pyplot as plt
from PIL import Image
from scipy.fftpack import dct

ROOT = Path(__file__).resolve().parents[2]
D = ROOT / "DeepfakeBench" / "liveness" / "_data" / "LCC_FASD" / "LCC_FASD_evaluation"
FIG = ROOT / "report" / "figures"
rng = np.random.RandomState(1)

def _zz(n=8, nb=16):
    o = []
    for s in range(2*n-1):
        ks = range(s+1) if s % 2 else range(s, -1, -1)
        for k in ks:
            r, c = (k, s-k) if s % 2 else (s-k, k)
            if r < n and c < n: o.append((r, c))
    bo = np.zeros((n, n), int)
    for rk, (r, c) in enumerate(o): bo[r, c] = min(rk*nb//(n*n), nb-1)
    return bo
BAND = _zz()
def bandvec(p):
    g = np.asarray(Image.open(p).convert("RGB").resize((256, 256)), np.float32)/255.
    g = g @ np.array([.299, .587, .114], np.float32)
    blk = g.reshape(32, 8, 32, 8).transpose(0, 2, 1, 3).reshape(-1, 8, 8)
    L = np.log1p(np.abs(dct(dct(blk, axis=1, norm="ortho"), axis=2, norm="ortho")))
    return np.array([L[:, BAND == b].mean() for b in range(16)])
def agg(sub, k=200):
    fs = glob.glob(str(D/sub/"*")); rng.shuffle(fs); fs = fs[:k]
    return np.mean([bandvec(f) for f in fs], 0)

live_fs = sorted(glob.glob(str(D/"real"/"*")))
spoof_fs = sorted(glob.glob(str(D/"spoof"/"*")))
ex_live = [live_fs[i] for i in rng.choice(len(live_fs), 4, False)]
ex_spoof = [spoof_fs[i] for i in rng.choice(len(spoof_fs), 4, False)]
Lv, Sp = agg("real"), agg("spoof")

fig = plt.figure(figsize=(12, 8))
gs = fig.add_gridspec(3, 4, height_ratios=[1, 1, 1.25])
for j, p in enumerate(ex_live):
    a = fig.add_subplot(gs[0, j]); a.imshow(Image.open(p).convert("RGB").resize((220, 220))); a.axis("off")
    if j == 0: a.set_ylabel("LIVE", fontsize=12, fontweight="bold", color="#1a7f37")
    a.set_title("live (genuine)", fontsize=9, color="#1a7f37")
for j, p in enumerate(ex_spoof):
    a = fig.add_subplot(gs[1, j]); a.imshow(Image.open(p).convert("RGB").resize((220, 220))); a.axis("off")
    a.set_title("spoof (print / replay)", fontsize=9, color="#c4314b")
b = np.arange(16)
aE = fig.add_subplot(gs[2, :2])
aE.plot(b, Lv, "-o", ms=4, color="#55A868", label="live")
aE.plot(b, Sp, "-s", ms=4, color="#C44E52", label="spoof")
aE.set_yscale("log"); aE.set_xlabel("zigzag band (0=DC → 15=high)"); aE.set_ylabel("mean log|DCT| (log)")
aE.set_title("16-band DCT energy — live vs spoof (n=200 each)", fontsize=10); aE.legend(); aE.grid(alpha=.3, which="both")
aD = fig.add_subplot(gs[2, 2:]); diff = Sp - Lv
aD.bar(b, diff, color=["#C44E52" if d >= 0 else "#55A868" for d in diff])
aD.axhline(0, color="k", lw=.6); aD.set_xlabel("zigzag band"); aD.set_ylabel("spoof − live")
aD.set_title("difference ≈ 0 → no exploitable band-DCT cue (why freq branch did not help)", fontsize=9.5)
aD.grid(alpha=.3, axis="y")
fig.suptitle("Liveness on LCC-FASD: spoof differs from live SPATIALLY but barely in the per-band DCT spectrum\n"
             "→ the spatial B4 head (AUC 0.9829) is not improved by the frequency branch (B4+DCT 0.9776)",
             fontsize=11.5, fontweight="bold")
fig.tight_layout(rect=[0, 0, 1, 0.93])
fig.savefig(FIG / "fig_3_17_liveness.png", dpi=160, bbox_inches="tight"); plt.close(fig)
print(f"OK fig_3_17_liveness.png  (spoof-live hi-band[8:]={(Sp-Lv)[8:].mean():+.4f})")
