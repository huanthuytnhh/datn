#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Kiến trúc model vẽ theo MẪU học thuật (kiểu Fig 2.17 Time-Distributed FCN):
khối tensor 3D xếp chồng (hatching) + brace chiều + hộp module xám + ký hiệu ℝ.
Số/shape THẬT từ code: sfdct_core.py / efficientnetb4_sfdct_detector.py / sfdct_hff_core.py.
Tiếng Anh, KHÔNG in số 'Figure' trong ảnh. Xuất report/figures/fig_arch_*.png

Vẽ 3 kiến trúc:
  fig_arch_sfdct.png      — SFDCT two-stream + gated cross-attention fusion
  fig_arch_sfdct_hff.png  — SFDCT-HFF: B4 + HF-stream(SRM/blockDCT high-pass→conv→RSA) + zero-gate
  fig_arch_contentdct.png — ContentDCT front-end: image → 8×8 blocks → DCT → 16 zigzag bands → tokens
"""
import os
import numpy as np
import matplotlib; matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.patches import FancyBboxPatch, Polygon, FancyArrowPatch, Rectangle

FIG = os.path.join(os.path.dirname(__file__), "..", "figures")
plt.rcParams["font.family"] = "DejaVu Sans"

# ---- depth skew cho mặt trên/phải của khối 3D ----
SX, SY = 0.16, 0.22

def cuboid(ax, x, y, w, h, fc="#ffffff", hatch=None, ec="#222", lw=1.2, alpha=1.0, depth=True):
    """1 khối hộp 3D: front face + top + right (isometric nhẹ)."""
    front = Rectangle((x, y), w, h, fc=fc, ec=ec, lw=lw, hatch=hatch, alpha=alpha, zorder=3)
    ax.add_patch(front)
    if depth:
        top = Polygon([(x, y+h), (x+SX, y+h+SY), (x+w+SX, y+h+SY), (x+w, y+h)],
                      fc="#f2f2f2", ec=ec, lw=lw, zorder=2)
        side = Polygon([(x+w, y), (x+w+SX, y+SY), (x+w+SX, y+h+SY), (x+w, y+h)],
                       fc="#e2e2e2", ec=ec, lw=lw, zorder=2)
        ax.add_patch(top); ax.add_patch(side)

def stack(ax, x, y, w, h, n=4, gap=0.13, hatches=None, fcs=None, ec="#222", lw=1.1):
    """Stack n mặt phẳng (feature maps) lệch chéo lên-phải — biểu diễn tensor [C,H,W]."""
    hatches = hatches or [None]*n
    fcs = fcs or ["#ffffff"]*n
    for i in range(n-1, -1, -1):                       # back -> front
        ox, oy = i*gap, i*gap*0.86
        front = Rectangle((x+ox, y+oy), w, h, fc=fcs[i], ec=ec, lw=lw,
                          hatch=hatches[i], zorder=3+(n-i))
        ax.add_patch(front)
    return (x, y, w+(n-1)*gap, h+(n-1)*gap*0.86)        # bbox bao cả stack

def brace_top(ax, x0, x1, y, label, pad=0.12):
    xm = (x0+x1)/2
    ax.plot([x0, x0, x1, x1], [y, y+pad, y+pad, y], color="#444", lw=1.0)
    ax.plot([xm, xm], [y+pad, y+pad+0.06], color="#444", lw=1.0)
    ax.text(xm, y+pad+0.12, label, ha="center", va="bottom", fontsize=9.5, style="italic")

def brace_left(ax, y0, y1, x, label, pad=0.12):
    ym = (y0+y1)/2
    ax.plot([x, x-pad, x-pad, x], [y0, y0, y1, y1], color="#444", lw=1.0)
    ax.plot([x-pad, x-pad-0.06], [ym, ym], color="#444", lw=1.0)
    ax.text(x-pad-0.12, ym, label, ha="right", va="center", fontsize=9.5, style="italic", rotation=90)

def module(ax, x, y, w, h, title, sub=None, fc="#ededed", ec="#666"):
    ax.add_patch(FancyBboxPatch((x, y), w, h, boxstyle="round,pad=0.02,rounding_size=0.10",
                                fc=fc, ec=ec, lw=1.6, zorder=4))
    ax.text(x+w/2, y+h-0.22, title, ha="center", va="top", fontsize=10.5, fontweight="bold", zorder=5)
    if sub:
        ax.text(x+w/2, y+h-0.62, sub, ha="center", va="top", fontsize=8.4, color="#333", zorder=5)

def arrow(ax, x0, y0, x1, y1, color="#222", lw=1.6, style="-|>", rad=0.0):
    ax.add_patch(FancyArrowPatch((x0, y0), (x1, y1), arrowstyle=style, mutation_scale=15,
                                 color=color, lw=lw, zorder=6,
                                 connectionstyle=f"arc3,rad={rad}"))

def shape(ax, x, y, text, color="#1a3b6b"):
    ax.text(x, y, text, ha="center", va="top", fontsize=10, color=color, zorder=6)

HATCH_SET = ["////", "....", "xxxx", "\\\\\\\\"]
FCS = ["#ffffff", "#eef3fb", "#fdf3e7", "#eaf5ec"]


# ================================================================= 1) SFDCT
def fig_sfdct():
    fig, ax = plt.subplots(figsize=(15.5, 7.6)); ax.set_xlim(0, 15.5); ax.set_ylim(0, 7.6); ax.axis("off")

    # input image cuboid
    cuboid(ax, 0.6, 3.4, 1.0, 1.4, fc="#dfe7f2"); ax.text(1.1, 3.05, "RGB face\n256×256", ha="center", va="top", fontsize=8.6)
    shape(ax, 1.1, 2.35, r"$X\in\mathbb{R}^{3\times256\times256}$")
    arrow(ax, 1.95, 5.0, 2.7, 5.9)        # to spatial
    arrow(ax, 1.95, 3.2, 2.7, 2.1)        # to frequency

    # ---- TOP: spatial stream ----
    module(ax, 2.8, 5.35, 2.6, 1.5, "EfficientNet-B4", "MBConv backbone\n(ImageNet pretrained)", fc="#e9eef7", ec="#33558a")
    arrow(ax, 5.4, 6.1, 6.2, 6.1)
    bb = stack(ax, 6.3, 5.4, 0.95, 1.25, n=4, hatches=HATCH_SET, fcs=FCS)
    brace_left(ax, 5.4, 5.4+1.25, 6.3, "8")
    ax.text(6.55, 5.25, "8×8", ha="center", fontsize=8.4, color="#444", style="italic")
    ax.text(6.3+bb[2]+0.3, 5.4+1.25+0.3, "1792 ch", fontsize=8.4, ha="left", va="center")
    shape(ax, 7.0, 4.95, r"$F_s\in\mathbb{R}^{1792\times8\times8}$")

    # ---- BOTTOM: frequency stream ----
    module(ax, 2.8, 0.95, 2.6, 1.5, "ContentDCT", "YCbCr · 8×8 block-DCT\nlog|·| · 16 zigzag bands", fc="#fdf1e3", ec="#c9853a")
    arrow(ax, 5.4, 1.7, 6.2, 1.7)
    # freq tokens: 16 tokens x 3 (YCbCr) -> draw as 16 thin bars grouped in 3 rows
    tx, ty = 6.3, 1.05
    for r in range(3):
        for c in range(16):
            ax.add_patch(Rectangle((tx + c*0.13, ty + r*0.34), 0.11, 0.28,
                                   fc=["#f6c9a0", "#a8c8e8", "#aedcb6"][r], ec="#888", lw=0.5, zorder=4))
    ax.text(tx + 8*0.13, ty + 3*0.34 + 0.18, "16 zigzag bands  ×  (Y, Cb, Cr)", ha="center", fontsize=8.5,
            color="#c9853a", style="italic")
    shape(ax, tx + 8*0.13, 0.78, r"$F_f\in\mathbb{R}^{16\times3}$  (global48 tokens)")

    # ---- FUSION ----
    arrow(ax, 7.35, 5.55, 9.7, 4.45, rad=-0.18)       # spatial -> fusion (Q)
    arrow(ax, 8.4, 1.6, 9.7, 3.25, rad=0.18)          # freq -> fusion (K,V)
    ax.text(8.55, 4.95, "Q (8×8 grid)", fontsize=8.2, color="#33558a", rotation=-20)
    ax.text(8.45, 2.35, "K, V (tokens)", fontsize=8.2, color="#c9853a", rotation=33)
    module(ax, 9.75, 3.0, 3.0, 1.75, "Gated cross-attention", None, fc="#ededed", ec="#555")
    ax.text(11.25, 4.18, "MultiHeadAttn(d=128, h=4)", ha="center", fontsize=8.2)
    ax.text(11.25, 3.78, r"$F_s' = F_s + \alpha \cdot \mathrm{Attn}(Q,K,V)$", ha="center", fontsize=9.0)
    ax.text(11.25, 3.35, r"$\alpha$ init $=0\ \Rightarrow$ identity at init", ha="center", fontsize=8.0,
            color="#a33", style="italic")

    arrow(ax, 12.8, 3.9, 13.5, 3.9)
    bb2 = stack(ax, 13.55, 3.3, 0.85, 1.1, n=4, hatches=HATCH_SET, fcs=FCS)
    ax.text(13.95, 4.7, "fused\n1792×8×8", ha="center", fontsize=8.0)
    arrow(ax, 14.35, 3.0, 14.35, 2.3)
    module(ax, 13.35, 1.35, 2.0, 0.85, "Classifier", "real / fake", fc="#e9eef7", ec="#33558a")
    shape(ax, 14.35, 1.1, r"$\hat{y}\in\mathbb{R}^{2}$")

    ax.set_title("SFDCT — spatial (EfficientNet-B4) + block-DCT frequency stream, gated cross-attention fusion",
                 fontsize=12.6, fontweight="bold")
    fig.savefig(os.path.join(FIG, "fig_arch_sfdct.png"), dpi=160, bbox_inches="tight"); plt.close(fig)
    print("OK fig_arch_sfdct.png")


# ================================================================= 2) SFDCT-HFF
def fig_sfdct_hff():
    fig, ax = plt.subplots(figsize=(15.5, 7.6)); ax.set_xlim(0, 15.5); ax.set_ylim(0, 7.6); ax.axis("off")

    cuboid(ax, 0.6, 3.4, 1.0, 1.4, fc="#dfe7f2"); ax.text(1.1, 3.05, "RGB face\n256×256", ha="center", va="top", fontsize=8.6)
    shape(ax, 1.1, 2.35, r"$X\in\mathbb{R}^{3\times256\times256}$")
    arrow(ax, 1.95, 5.0, 2.7, 5.9)
    arrow(ax, 1.95, 3.2, 2.7, 2.1)

    # spatial stream
    module(ax, 2.8, 5.35, 2.6, 1.5, "EfficientNet-B4", "MBConv backbone", fc="#e9eef7", ec="#33558a")
    arrow(ax, 5.4, 6.1, 6.2, 6.1)
    bb = stack(ax, 6.3, 5.4, 0.95, 1.25, n=4, hatches=HATCH_SET, fcs=FCS)
    brace_top(ax, 6.3, 6.3+0.95, 6.65+0.4, "8"); brace_left(ax, 5.4, 5.4+1.25, 6.3, "8")
    ax.text(6.3+bb[2]+0.25, 5.4+1.25+0.45, "1792\nch", fontsize=8.4, ha="left", va="center")
    shape(ax, 7.0, 5.05, r"$F_s\in\mathbb{R}^{1792\times8\times8}$")

    # HF stream
    module(ax, 2.8, 3.95, 2.6, 1.1, "Block-DCT high-pass", "keep mid/high bands\n→ inverse DCT → residual", fc="#f3e8f6", ec="#8a4f9e")
    arrow(ax, 4.1, 3.95, 4.1, 3.25)
    cuboid(ax, 3.35, 2.35, 1.5, 0.85, fc="#efe2f3"); ax.text(4.1, 2.0, "HF residual image", ha="center", va="top", fontsize=8.2)
    arrow(ax, 4.85, 2.75, 5.6, 2.75)
    module(ax, 5.65, 2.25, 2.05, 1.05, "HF-Stream", "5 × Conv-BN-ReLU", fc="#f3e8f6", ec="#8a4f9e")
    arrow(ax, 7.7, 2.75, 8.35, 2.75)
    module(ax, 8.4, 2.2, 1.95, 1.15, "RSAttention", "residual-guided\nspatial mask (7×7)", fc="#f3e8f6", ec="#8a4f9e")
    bb2 = stack(ax, 10.55, 2.25, 0.8, 1.05, n=3, hatches=HATCH_SET, fcs=["#efe2f3", "#f3e8f6", "#ffffff"])
    arrow(ax, 10.35, 2.75, 10.5, 2.75)
    ax.text(10.95, 3.55, "HF feature\n(out_ch×8×8)", ha="center", fontsize=8.0, color="#8a4f9e")

    # fusion gate
    arrow(ax, 7.35, 5.5, 11.9, 4.55, rad=-0.16)
    arrow(ax, 11.1, 3.4, 11.9, 3.95, rad=0.2)
    module(ax, 11.95, 3.2, 2.8, 1.45, "HFF gate", None, fc="#ededed", ec="#555")
    ax.text(13.35, 4.15, r"$F_s' = F_s + \alpha \cdot \mathrm{RSA}(\mathrm{HF})$", ha="center", fontsize=9.0)
    ax.text(13.35, 3.7, r"$\alpha$ init $=0\ \Rightarrow$ identity at init", ha="center", fontsize=8.0,
            color="#a33", style="italic")
    ax.text(13.35, 3.38, "(R3 training run)", ha="center", fontsize=7.8, color="#666")

    arrow(ax, 13.35, 3.15, 13.35, 2.5)
    module(ax, 12.35, 1.55, 2.0, 0.85, "Classifier", "real / fake", fc="#e9eef7", ec="#33558a")
    shape(ax, 13.35, 1.3, r"$\hat{y}\in\mathbb{R}^{2}$")

    ax.set_title("SFDCT-HFF — B4 spatial stream + high-frequency residual stream (RSAttention), zero-init gate",
                 fontsize=12.6, fontweight="bold")
    fig.savefig(os.path.join(FIG, "fig_arch_sfdct_hff.png"), dpi=160, bbox_inches="tight"); plt.close(fig)
    print("OK fig_arch_sfdct_hff.png")


# ================================================================= 3) ContentDCT front-end
def fig_contentdct():
    fig, ax = plt.subplots(figsize=(15.5, 5.6)); ax.set_xlim(0, 15.5); ax.set_ylim(0, 5.6); ax.axis("off")
    yc = 2.7

    cuboid(ax, 0.5, yc-0.7, 1.1, 1.4, fc="#dfe7f2"); ax.text(1.05, yc-1.05, "face crop", ha="center", va="top", fontsize=8.4)
    shape(ax, 1.05, yc-1.55, r"$\mathbb{R}^{3\times256\times256}$")
    arrow(ax, 1.95, yc, 2.5, yc)

    module(ax, 2.55, yc-0.55, 1.7, 1.1, "to YCbCr", "denorm → [0,1]\nRGB→YCbCr", fc="#fdf1e3", ec="#c9853a")
    arrow(ax, 4.3, yc, 4.85, yc)

    # 8x8 block grid
    gx, gy = 4.95, yc-0.6
    for i in range(8):
        for j in range(8):
            ax.add_patch(Rectangle((gx+j*0.16, gy+i*0.16), 0.16, 0.16, fc="#eef3fb", ec="#7b93bb", lw=0.5))
    ax.add_patch(Rectangle((gx, gy), 0.16, 0.16, fc="#f6c9a0", ec="#333", lw=1.0))   # highlight one block
    ax.text(gx+0.64, gy-0.3, "8×8 blocks", ha="center", fontsize=8.4, color="#c9853a")
    arrow(ax, gx+1.4, yc, gx+2.0, yc)

    # DCT block -> 8x8 coeff heatmap
    hx = gx+2.1
    M = np.abs(np.random.RandomState(0).randn(8, 8)); M[0, 0] = 6; M = np.log1p(M)
    ax.imshow(M, extent=[hx, hx+1.3, yc-0.65, yc+0.65], cmap="viridis", aspect="auto", zorder=3)
    ax.add_patch(Rectangle((hx, yc-0.65), 1.3, 1.3, fill=False, ec="#333", lw=1.0, zorder=4))
    ax.text(hx+0.65, yc-0.95, "log|DCT| 8×8", ha="center", fontsize=8.4)
    ax.text(hx+0.05, yc+0.5, "DC", color="w", fontsize=7)
    arrow(ax, hx+1.4, yc, hx+2.0, yc)

    # zigzag -> 16 bands
    zx = hx+2.1
    module(ax, zx, yc-0.55, 1.7, 1.1, "zigzag → 16 bands", "average log-mag\nper frequency band", fc="#fdf1e3", ec="#c9853a")
    arrow(ax, zx+1.7, yc, zx+2.25, yc)

    # tokens 16 x 3
    tx = zx+2.35
    for r in range(3):
        for c in range(16):
            ax.add_patch(Rectangle((tx + c*0.13, yc-0.45 + r*0.32), 0.11, 0.26,
                                   fc=["#f6c9a0", "#a8c8e8", "#aedcb6"][r], ec="#888", lw=0.5, zorder=4))
    brace_top(ax, tx, tx+16*0.13, yc-0.45+3*0.32+0.05, "16 bands")
    ax.text(tx-0.12, yc+0.1, "Y\nCb\nCr", ha="right", va="center", fontsize=7.6, color="#444")
    shape(ax, tx+16*0.13/2, yc-0.75, r"tokens $\in\mathbb{R}^{16\times3}$")
    ax.text(tx+16*0.13/2, yc+1.05, "→ K/V for gated cross-attention", ha="center", fontsize=8.6,
            color="#c9853a", style="italic")

    ax.set_title("ContentDCT front-end — block-wise 8×8 DCT band statistics (0 learnable parameters)",
                 fontsize=12.6, fontweight="bold")
    fig.savefig(os.path.join(FIG, "fig_arch_contentdct.png"), dpi=160, bbox_inches="tight"); plt.close(fig)
    print("OK fig_arch_contentdct.png")


if __name__ == "__main__":
    fig_sfdct()
    fig_sfdct_hff()
    fig_contentdct()
