#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Figure 3.1 (real/fake distribution) + Figure 3.2 / 3.2.2 (real/fake pair + PHỔ DCT block 8×8).
Số/ảnh THẬT: FaceForensics++.json · pickle SFDCT (CDFv2 labels) · frames FF++/Celeb.
Phổ DCT = cắt 8×8 block -> DCT từng block -> log|.| -> trung bình mọi block & frame => phổ 8×8
(DC góc trên-trái, tần số tăng về dưới-phải) — đúng biểu diễn block-DCT model dùng. KHÔNG mô phỏng.
Figure 3.3 (biểu đồ 16 band) ở gen_fig_3_3.py riêng."""
import os, json, glob, pickle
from pathlib import Path
import numpy as np
import matplotlib; matplotlib.use("Agg")
import matplotlib.pyplot as plt
from PIL import Image
from scipy.fftpack import dct

ROOT = Path(__file__).resolve().parents[2]
DFB  = ROOT / "DeepfakeBench"
FIG  = ROOT / "report" / "figures"
FFJSON = DFB / "preprocessing" / "dataset_json" / "FaceForensics++.json"
SFDCT_PKL = ROOT / "report" / "evidence" / "ablation_cdfv2" / "pickles" / "sfdct" / "metric_dict_best.pickle"
DS = DFB / "datasets"

def load256(p):
    return np.asarray(Image.open(p).convert("RGB").resize((256, 256)), np.float32) / 255.0
def togray(img):
    return img @ np.array([0.299, 0.587, 0.114], np.float32)
def pick_frame(folder):
    fs = sorted(glob.glob(str(Path(folder) / "*.png")))
    return fs[len(fs) // 2] if fs else None
def auto_pair():
    for fd in sorted(glob.glob(str(DS / "FaceForensics++/manipulated_sequences/Deepfakes/c23/frames/*"))):
        tgt = Path(fd).name.split("_")[0]
        rd = DS / f"FaceForensics++/original_sequences/youtube/c23/frames/{tgt}"
        if rd.exists() and pick_frame(rd) and pick_frame(fd):
            return pick_frame(rd), pick_frame(fd), tgt
    return None, None, None

# ================= FIGURE 3.1 — distribution =================
jp = json.load(open(FFJSON))["FaceForensics++"]
grp = list(jp)
tr = [len(jp[g]["train"]["c23"]) for g in grp]
te = [len(jp[g]["test"]["c23"]) for g in grp]
y = np.asarray(pickle.load(open(SFDCT_PKL, "rb"))["label"], int)
n_real, n_fake = int((y == 0).sum()), int((y == 1).sum())
fig, (a1, a2) = plt.subplots(1, 2, figsize=(11, 4.2), gridspec_kw={"width_ratios": [2.1, 1]})
x = np.arange(len(grp))
a1.bar(x - .2, tr, .4, label="train", color="#4C72B0")
a1.bar(x + .2, te, .4, label="test", color="#DD8452")
a1.set_xticks(x); a1.set_xticklabels(grp, rotation=20, ha="right", fontsize=9)
a1.set_ylabel("# videos"); a1.set_title("FaceForensics++ c23 — videos per group (train set)")
a1.legend(); a1.grid(alpha=.3, axis="y")
a2.bar(["real", "fake"], [n_real, n_fake], color=["#55A868", "#C44E52"])
a2.set_ylabel("# frames"); a2.set_title(f"Celeb-DF-v2 test — class imbalance ({n_fake/(n_real+n_fake)*100:.0f}% fake)")
a2.grid(alpha=.3, axis="y")
for i, v in enumerate([n_real, n_fake]):
    a2.text(i, v, f"{v:,}", ha="center", va="bottom", fontsize=9)
fig.tight_layout(); fig.savefig(FIG / "fig_3_1_distribution.png", dpi=160, bbox_inches="tight"); plt.close(fig)
print(f"OK 3.1: CDFv2 real/fake {n_real}/{n_fake}")

# ================= FIGURE 3.2 / 3.2.2 — real/fake pair + PHỔ DCT (block 8×8) =================
def block_dct_spectrum(folder, n=24, B=8):
    fs = sorted(glob.glob(str(Path(folder) / "*.png")))[:n]
    accs = []
    for f in fs:
        g = togray(load256(f))
        blk = g.reshape(32, B, 32, B).transpose(0, 2, 1, 3).reshape(-1, B, B)
        L = np.log1p(np.abs(dct(dct(blk, axis=1, norm="ortho"), axis=2, norm="ortho")))
        accs.append(L.mean(0))                 # mean over 1024 block -> phổ 8x8
    return np.mean(accs, 0), len(fs)           # mean over frame -> phổ 8x8

def pair_figure(real_dir, fake_dir, title, outname):
    ri, fi = load256(pick_frame(real_dir)), load256(pick_frame(fake_dir))
    R, nr = block_dct_spectrum(real_dir); F, nf = block_dct_spectrum(fake_dir)
    m = np.ones((8, 8), bool); m[0, 0] = False                 # bỏ DC khỏi thang màu -> thấy mid/high
    vmin, vmax = min(R[m].min(), F[m].min()), max(R[m].max(), F[m].max())
    D = R - F; dl = float(np.abs(D).max())
    fig = plt.figure(figsize=(11.5, 7.4))
    gs = fig.add_gridspec(2, 3, height_ratios=[0.95, 1.2])
    for c, (img, t) in enumerate([(ri, "Real face"), (fi, "Fake face")]):
        a = fig.add_subplot(gs[0, c]); a.imshow(img); a.set_title(t, fontsize=12); a.axis("off")
    fig.add_subplot(gs[0, 2]).axis("off")
    def hm(col, M, ttl, cmap, vmn, vmx):
        a = fig.add_subplot(gs[1, col])
        im = a.imshow(M, cmap=cmap, vmin=vmn, vmax=vmx, interpolation="nearest")
        a.set_title(ttl, fontsize=10)
        a.set_xlabel("horizontal freq  DC→high", fontsize=8)
        a.set_ylabel("vertical freq  DC→high", fontsize=8)
        a.set_xticks([0, 7]); a.set_yticks([0, 7])
        return a, im
    aR, _   = hm(0, R, f"Real — DCT spectrum (n={nr})", "viridis", vmin, vmax)
    aF, imF = hm(1, F, f"Fake — DCT spectrum (n={nf})", "viridis", vmin, vmax)
    aD, imD = hm(2, D, "Real − Fake (footprint)", "coolwarm", -dl, dl)
    fig.colorbar(imF, ax=[aR, aF], fraction=.046, pad=.02, label="log(1+|DCT|)  (DC excluded from scale)")
    fig.colorbar(imD, ax=[aD], fraction=.09, pad=.04, label="Δ")
    fig.suptitle(title, fontsize=12)
    fig.savefig(FIG / outname, dpi=160, bbox_inches="tight"); plt.close(fig)
    print(f"OK {outname}: Δmid/high(real-fake)={(R[4:,4:]-F[4:,4:]).mean():+.4f}")

_, _, tgt = auto_pair()
ff_real = DS / f"FaceForensics++/original_sequences/youtube/c23/frames/{tgt}"
ff_fake = sorted(glob.glob(str(DS / f"FaceForensics++/manipulated_sequences/Deepfakes/c23/frames/{tgt}_*")))[0]
pair_figure(ff_real, ff_fake, f"Real vs fake — block-DCT 8×8 spectrum (FF++ Deepfakes, id {tgt})", "fig_3_2_preprocess_realfake.png")

cr = sorted(glob.glob(str(DS / "Celeb-DF-v2/Celeb-real/frames/*")))[0]
cf = sorted(glob.glob(str(DS / "Celeb-DF-v2/Celeb-synthesis/frames/*")))[0]
pair_figure(cr, cf, "Real vs fake — block-DCT 8×8 spectrum (Celeb-DF-v2)", "fig_3_2_2_celeb_realfake.png")
