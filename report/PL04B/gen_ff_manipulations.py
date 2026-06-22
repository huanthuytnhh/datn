#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""FF++ — cung mot danh tinh, sau preprocess, 2 hang trong 1 hinh:
  Hang tren : 1 anh THAT + 4 phuong phap GIA (mat).
  Hang duoi : pho block-DCT 8x8 cua THAT (tham chieu) + footprint Real-Fake cua tung phuong phap.
4 phuong phap chuan FF++: Deepfakes, Face2Face, FaceSwap, NeuralTextures.
Pho DCT = cat 8x8 block -> DCT tung block -> log(1+|.|) -> trung binh moi block & frame => pho 8x8
(DC goc tren-trai, tan so tang ve duoi-phai). Footprint = Real_pho - Fake_pho. KHONG mo phong.
"""
import glob
from pathlib import Path
import numpy as np
import matplotlib; matplotlib.use("Agg")
import matplotlib.pyplot as plt
from PIL import Image
from scipy.fftpack import dct

ROOT = Path(__file__).resolve().parents[2]
DS = ROOT / "DeepfakeBench" / "datasets" / "FaceForensics++"
FIG = ROOT / "report" / "figures"

TARGET = "000"          # danh tinh goc
PAIR = "000_003"        # folder gia tuong ung (target_source)
NSPEC = 24              # so frame gop khi tinh pho

# phuong phap : (ten hien thi, loai dau vet)
METHODS = [
    ("Deepfakes",      "identity swap (autoencoder)"),
    ("Face2Face",      "expression reenactment"),
    ("FaceSwap",       "identity swap (graphics)"),
    ("NeuralTextures", "neural reenactment"),
]


def load256(p):
    return np.asarray(Image.open(p).convert("RGB").resize((256, 256)))


def load256f(p):
    return np.asarray(Image.open(p).convert("RGB").resize((256, 256)), np.float32) / 255.0


def togray(img):
    return img @ np.array([0.299, 0.587, 0.114], np.float32)


def mid_frame(folder):
    fs = sorted(glob.glob(str(Path(folder) / "*.png")))
    return fs[len(fs) // 2] if fs else None


def block_dct_spectrum(folder, n=NSPEC, B=8):
    fs = sorted(glob.glob(str(Path(folder) / "*.png")))[:n]
    accs = []
    for f in fs:
        g = togray(load256f(f))
        blk = g.reshape(32, B, 32, B).transpose(0, 2, 1, 3).reshape(-1, B, B)
        L = np.log1p(np.abs(dct(dct(blk, axis=1, norm="ortho"), axis=2, norm="ortho")))
        accs.append(L.mean(0))
    return np.mean(accs, 0), len(fs)


def main():
    real_dir = DS / "original_sequences" / "youtube" / "c23" / "frames" / TARGET

    # ---- mat ----
    faces = [(load256(mid_frame(real_dir)), f"Real  (id {TARGET})", "original", "#2E7D32")]
    fake_dirs = []
    for name, kind in METHODS:
        fdir = DS / "manipulated_sequences" / name / "c23" / "frames" / PAIR
        faces.append((load256(mid_frame(fdir)), name, kind, "#C62828"))
        fake_dirs.append((name, fdir))

    # ---- pho + footprint ----
    R, nr = block_dct_spectrum(real_dir)
    foots = []
    for name, fdir in fake_dirs:
        F, _ = block_dct_spectrum(fdir)
        foots.append((name, R - F))
    dl = max(float(np.abs(D).max()) for _, D in foots)         # thang doi xung dung chung
    m = np.ones((8, 8), bool); m[0, 0] = False                 # bo DC khoi thang mau pho
    vmin, vmax = R[m].min(), R[m].max()

    n = len(faces)
    fig = plt.figure(figsize=(3.15 * n, 6.9))
    gs = fig.add_gridspec(2, n, height_ratios=[1.0, 1.08], hspace=0.18, wspace=0.10)
    fig.suptitle(f"FaceForensics++ (id {TARGET}) after preprocessing  —  faces + block-DCT footprint per method",
                 fontsize=15, fontweight="bold", y=0.99)

    # hang tren: mat
    for c, (img, title, sub, col) in enumerate(faces):
        ax = fig.add_subplot(gs[0, c])
        ax.imshow(img)
        ax.set_title(title, fontsize=13.5, fontweight="bold", color=col, pad=5)
        ax.text(0.5, -0.05, sub, transform=ax.transAxes, ha="center", va="top",
                fontsize=10, style="italic", color="#444")
        ax.set_xticks([]); ax.set_yticks([])
        for s in ax.spines.values():
            s.set_edgecolor(col); s.set_linewidth(2.4)

    def style_hm(ax, ttl, color):
        ax.set_title(ttl, fontsize=11.5, fontweight="bold", color=color, pad=4)
        ax.set_xlabel("horizontal freq  DC→high", fontsize=8)
        ax.set_ylabel("vertical freq  DC→high", fontsize=8)
        ax.set_xticks([0, 7]); ax.set_yticks([0, 7])

    # hang duoi, cot 0: pho THAT (tham chieu)
    axR = fig.add_subplot(gs[1, 0])
    imR = axR.imshow(R, cmap="viridis", vmin=vmin, vmax=vmax, interpolation="nearest")
    style_hm(axR, f"Real — DCT spectrum (n={nr})", "#2E7D32")
    fig.colorbar(imR, ax=axR, fraction=0.046, pad=0.02).set_label("log(1+|DCT|)", fontsize=8)

    # hang duoi, cot 1..n: footprint Real - Fake
    foot_axes = []
    for c, (name, D) in enumerate(foots, start=1):
        ax = fig.add_subplot(gs[1, c])
        imD = ax.imshow(D, cmap="coolwarm", vmin=-dl, vmax=dl, interpolation="nearest")
        style_hm(ax, f"Real − {name}", "#C62828")
        foot_axes.append(ax)
    cb = fig.colorbar(imD, ax=foot_axes, fraction=0.045, pad=0.02)
    cb.set_label("Δ = Real − Fake  (red: real>fake)", fontsize=8)

    fig.subplots_adjust(left=0.04, right=0.93, top=0.92, bottom=0.06)
    out = FIG / "fig_ff_manipulations.png"
    fig.savefig(out, dpi=160, bbox_inches="tight")
    print("saved ->", out, "| dl=%.4f" % dl)


if __name__ == "__main__":
    main()
