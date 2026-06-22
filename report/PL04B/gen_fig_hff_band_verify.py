#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""XÁC MINH cơ chế HFF: khác biệt thật/giả nằm ở băng nào, HFF (drop_k=3) GIỮ hay BỎ băng đó?
- 16 băng zigzag, 3 kênh Y/Cb/Cr (BT.601), block 8x8 DCT, log1p(|coef|) — KHỚP sfdct_core/ContentDCT.
- Dùng ĐÚNG frame test Celeb-DF (data_dict_test.pickle, nhãn thật) + FF++ train (glob).
- Đo "khác biệt" bằng Cohen's d mỗi băng (chuẩn hoá theo độ lệch) — tránh nhiễu do băng thấp năng lượng lớn.
- Tô vùng HFF BỎ (băng 0,1,2 < drop_k=3) vs GIỮ (3..15). KHÔNG mô phỏng số.
"""
import glob, pickle
from pathlib import Path
import numpy as np
import matplotlib; matplotlib.use("Agg")
import matplotlib.pyplot as plt
from PIL import Image
from scipy.fftpack import dct

ROOT = Path(__file__).resolve().parents[2]
DS   = ROOT / "DeepfakeBench" / "datasets"
FIG  = ROOT / "report" / "figures"
PKL  = ROOT / "report" / "evidence" / "ablation_cdfv2" / "pickles" / "sfdct" / "data_dict_test.pickle"
rng  = np.random.RandomState(0)
N    = 400                       # ảnh mỗi nhóm (real/fake)
DROP_K = 3                       # HFF: bỏ băng < 3  (đọc từ sfdct_hff_core.BlockDCTHighPass)

# BT.601 RGB[0,1] -> YCbCr (offset 0.5 cho Cb,Cr; chỉ ảnh hưởng DC, không ảnh hưởng band AC)
M_YCC = np.array([[ 0.299,     0.587,     0.114   ],
                  [-0.168736, -0.331264,  0.5     ],
                  [ 0.5,      -0.418688, -0.081312]], np.float32)

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
    """-> [3,16] mean log|DCT| theo băng, cho Y,Cb,Cr."""
    rgb = np.asarray(Image.open(p).convert("RGB").resize((256, 256)), np.float32)/255.
    ycc = rgb @ M_YCC.T                                              # [256,256,3]
    ycc[..., 1:] += 0.5
    out = np.zeros((3, 16), np.float32)
    for ch in range(3):
        g   = ycc[..., ch]
        blk = g.reshape(32, B, 32, B).transpose(0, 2, 1, 3).reshape(-1, B, B)
        L   = np.log1p(np.abs(dct(dct(blk, axis=1, norm="ortho"), axis=2, norm="ortho")))
        out[ch] = [L[:, BAND == b].mean() for b in range(16)]
    return out

def collect(paths):
    paths = list(paths); rng.shuffle(paths); paths = paths[:N]
    arr = []
    for p in paths:
        try: arr.append(band_vec(p))
        except Exception: pass
    return np.stack(arr)                                            # [n,3,16]

def cohend(a, b):
    """effect size mỗi (kênh,băng): (mean_real-mean_fake)/pooled_sd."""
    ma, mb = a.mean(0), b.mean(0); sa, sb = a.std(0), b.std(0)
    sp = np.sqrt((sa**2 + sb**2)/2) + 1e-8
    return (ma - mb)/sp                                             # [3,16]

# ---- Celeb-DF test: đúng frame model đã chấm ----
d = pickle.load(open(PKL, "rb")); imgs, labs = list(d["image"]), list(d["label"])
real = [str(DS/p) for p, y in zip(imgs, labs) if y == 0]
fake = [str(DS/p) for p, y in zip(imgs, labs) if y == 1]
print(f"Celeb-DF test: real={len(real)} fake={len(fake)} (lấy {N} mỗi nhóm)")
Rcd, Fcd = collect(real), collect(fake)

# ---- FF++ train ----
Rff = collect(glob.glob(str(DS/"FaceForensics++/original_sequences/youtube/c23/frames/*/*.png")))
Fff = collect(glob.glob(str(DS/"FaceForensics++/manipulated_sequences/*/c23/frames/*/*.png")))
print(f"FF++ train: real={Rff.shape[0]} fake={Fff.shape[0]}")

CHN = ["Y (luma)", "Cb", "Cr"]
COL = ["#3477eb", "#e8950c", "#10a36b"]
bands = np.arange(16)
fig, ax = plt.subplots(2, 2, figsize=(13, 8.4))

for row, (R, F, name) in enumerate([
        (Rcd, Fcd, "Celeb-DF-v2 (TEST, cross-dataset)"),
        (Rff, Fff, "FaceForensics++ (TRAIN)")]):
    # col 1: Y-channel energy, real vs fake, log scale
    aE = ax[row, 0]
    aE.axvspan(-0.5, DROP_K-0.5, color="#e74c3c", alpha=0.10)
    aE.plot(bands, R[:, 0].mean(0), "-o", ms=4, color="#55A868", label="real (Y)")
    aE.plot(bands, F[:, 0].mean(0), "-s", ms=4, color="#C44E52", label="fake (Y)")
    aE.set_yscale("log")
    aE.set_title(f"{name}\nY-channel energy by band (log scale)", fontsize=10)
    aE.set_xlabel("zigzag band  (0 = DC/low → 15 = high)"); aE.set_ylabel("mean log|DCT|")
    aE.legend(fontsize=8); aE.grid(alpha=.3, which="both")
    aE.text(0.7, 0.93, "HFF drops\nbands 0–2", transform=aE.transAxes, fontsize=7.5,
            color="#c0392b", ha="left", va="top")

    # col 2: Cohen's d per band, 3 channels -> the "real" discriminative difference
    aD = ax[row, 1]
    aD.axvspan(-0.5, DROP_K-0.5, color="#e74c3c", alpha=0.10, label="HFF drops (bands 0–2)")
    aD.axhline(0, color="k", lw=.6)
    d_all = cohend(R, F)                                            # [3,16]
    for ch in range(3):
        aD.plot(bands, d_all[ch], "-o", ms=3.5, color=COL[ch], label=CHN[ch])
    aD.set_title("Standardised real−fake difference (Cohen's d) by band", fontsize=10)
    aD.set_xlabel("zigzag band"); aD.set_ylabel("Cohen's d  (>0: real higher)")
    aD.legend(fontsize=8, ncol=2); aD.grid(alpha=.3)
    # in số quyết định
    dY = d_all[0]
    dropped = np.abs(dY[:DROP_K]).mean(); kept = np.abs(dY[DROP_K:]).mean()
    peak = int(np.argmax(np.abs(dY)))
    print(f"\n[{name}] |Cohen d| kênh Y — băng BỎ(0-2)={dropped:.3f}  băng GIỮ(3-15)={kept:.3f}")
    print(f"    băng tách mạnh nhất = band {peak} (d={dY[peak]:+.3f})  | "
          f"{'HFF GIỮ' if peak>=DROP_K else 'HFF BỎ'} băng này")
    print(f"    d theo băng (Y): " + " ".join(f"{v:+.2f}" for v in dY))

fig.suptitle("HFF verification: which bands carry the real/fake difference — kept or dropped by HFF (drop_k=3)?",
             fontsize=13, fontweight="bold")
fig.tight_layout()
out = FIG/"fig_hff_band_verify.png"
fig.savefig(out, dpi=160, bbox_inches="tight"); plt.close(fig)
print("\nsaved:", out)
