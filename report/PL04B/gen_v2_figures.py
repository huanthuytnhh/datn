#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Generate the small set of conceptual figures for thesis v2 (clean, minimal style).
All figures are conceptual/illustrative (no experimental data) -> safe, not fabrication.
Output: report/figures/*.png
"""
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.patches import FancyBboxPatch, Rectangle, FancyArrowPatch
from matplotlib import cm
import numpy as np

OUT = "/home/huanthuytnhh/Desktop/thanhln/datn/report/figures"
INK = "#1b1b1b"; GREY = "#666666"; FILL = "#f4f4f4"; ACC = "#2c5f8a"

def box(ax, x, y, w, h, text, fc=FILL, fs=10, ec=INK, tc=INK, lw=1.2):
    ax.add_patch(FancyBboxPatch((x, y), w, h, boxstyle="round,pad=0.02,rounding_size=0.06",
                                fc=fc, ec=ec, lw=lw))
    ax.text(x + w/2, y + h/2, text, ha="center", va="center", fontsize=fs, color=tc, wrap=True)

def arrow(ax, x1, y1, x2, y2, color=INK, lw=1.4):
    ax.add_patch(FancyArrowPatch((x1, y1), (x2, y2), arrowstyle="-|>", mutation_scale=14,
                                 color=color, lw=lw, shrinkA=2, shrinkB=2))

def fig_axes(w, h):
    fig = plt.figure(figsize=(w, h)); ax = fig.add_axes([0, 0, 1, 1])
    ax.set_xlim(0, 100); ax.set_ylim(0, 100); ax.axis("off")
    return fig, ax

def save(fig, name):
    p = f"{OUT}/{name}"; fig.savefig(p, dpi=150, bbox_inches="tight"); plt.close(fig)
    print("saved", name)

# ---------- 1. convolution operation ----------
def convolution():
    fig, ax = fig_axes(9, 4.2)
    # input grid 5x5
    gx, gy, c = 6, 28, 8
    vals = np.array([[3,1,2,0,1],[0,2,1,3,2],[1,0,4,1,0],[2,1,0,2,3],[0,3,1,1,2]])
    for i in range(5):
        for j in range(5):
            inwin = (i < 3 and j < 3)
            ax.add_patch(Rectangle((gx+j*c, gy+(4-i)*c), c, c, fc="#d7e6f2" if inwin else "white", ec=INK, lw=1))
            ax.text(gx+j*c+c/2, gy+(4-i)*c+c/2, str(vals[i, j]), ha="center", va="center", fontsize=9, color=INK)
    # highlight 3x3 kernel window
    ax.add_patch(Rectangle((gx, gy+2*c), 3*c, 3*c, fc="none", ec=ACC, lw=2.4))
    ax.text(gx+2.5*c, gy+5*c+4, "input (kernel slides over it)", ha="center", fontsize=10, color=GREY)
    # kernel
    kx, ky = 54, 52
    ax.text(kx+1.5*6, ky+3*6+5, "3x3 kernel", ha="center", fontsize=10, color=GREY)
    kw = np.array([[1,0,1],[0,1,0],[1,0,1]])
    for i in range(3):
        for j in range(3):
            ax.add_patch(Rectangle((kx+j*6, ky+(2-i)*6), 6, 6, fc="#fbeed2", ec=INK, lw=1))
            ax.text(kx+j*6+3, ky+(2-i)*6+3, str(kw[i, j]), ha="center", va="center", fontsize=8, color=INK)
    # output cell
    arrow(ax, kx+18, ky+9, 80, 50)
    ax.text(70, 58, "weighted\nsum", ha="center", fontsize=9, color=GREY)
    ax.add_patch(Rectangle((80, 44), 10, 10, fc="#d7e6f2", ec=ACC, lw=2))
    ax.text(85, 49, "13", ha="center", va="center", fontsize=11, color=INK)
    ax.text(85, 40, "one output\nvalue", ha="center", va="top", fontsize=9, color=GREY)
    save(fig, "fig_1_convolution.png")

# ---------- 2. REST API architecture ----------
def rest_api():
    fig, ax = fig_axes(9, 3.4)
    box(ax, 4, 38, 20, 22, "Client\n(browser / bank system)", fc="white", fs=10)
    box(ax, 40, 60, 28, 16, "HTTP request\nmethod + URL + headers + body", fc="#fbeed2", fs=8.5)
    box(ax, 40, 22, 28, 16, "HTTP response\nstatus + headers + JSON body", fc="#d7e6f2", fs=8.5)
    box(ax, 78, 38, 18, 22, "FastAPI\nserver", fc=FILL, fs=10)
    arrow(ax, 24, 52, 40, 68); arrow(ax, 68, 68, 80, 56)
    arrow(ax, 80, 44, 68, 30); arrow(ax, 40, 30, 24, 46)
    ax.text(50, 86, "RESTful contract over HTTP", ha="center", fontsize=10, color=GREY)
    save(fig, "fig_1_rest_api.png")

# ---------- 3. preprocessing pipeline ----------
def preprocess():
    fig, ax = fig_axes(11, 3.6)
    steps = ["raw\nframe", "MTCNN\ndetect", "align", "crop +\npad", "resize\n256px", "normalise"]
    x = 2; w = 13.5; y = 56; gap = 2.0
    cx = []
    for s in steps:
        box(ax, x, y, w, 16, s, fs=9); cx.append(x+w/2)
        x += w + gap
    for i in range(len(steps)-1):
        arrow(ax, cx[i]+w/2, y+8, cx[i+1]-w/2, y+8)
    # branch to frequency
    arrow(ax, cx[-1], y, cx[-1], 30)
    box(ax, cx[-1]-13, 12, 26, 16, "YCbCr -> 8x8 block-DCT\n(frequency stream)", fc="#fbeed2", fs=8.5)
    ax.text(cx[-1]+18, 20, "spatial stream continues to the backbone", ha="left", va="center", fontsize=8.5, color=GREY)
    save(fig, "fig_2_preprocess_pipeline.png")

# ---------- 4. 48-dim DCT feature design + drop-low-band ----------
def dct_feature():
    fig, ax = fig_axes(10, 4.6)
    NB = 16; cmap = cm.get_cmap("viridis")
    x0, y0, cw, ch = 8, 60, 5.0, 9
    ax.text(x0+NB*cw/2, y0+18, "16 frequency bands (zigzag-ordered), per YCbCr channel", ha="center", fontsize=10, color=GREY)
    for ch_i, name in enumerate(["Y", "Cb", "Cr"]):
        yy = y0 - ch_i*(ch+2)
        ax.text(x0-3, yy+ch/2, name, ha="right", va="center", fontsize=10, color=INK)
        for b in range(NB):
            drop = b < 3
            ax.add_patch(Rectangle((x0+b*cw, yy), cw, ch, fc=cmap(b/(NB-1)), ec="white", lw=0.8, alpha=0.35 if drop else 1))
            if drop:
                ax.plot([x0+b*cw, x0+(b+1)*cw], [yy, yy+ch], color="#c0392b", lw=1.4)
    # band index labels
    for b in (0, 3, 9, 15):
        ax.text(x0+b*cw+cw/2, y0-3*(ch+2)-4, str(b), ha="center", fontsize=7.5, color=GREY)
    ax.text(x0+1.5*cw, 22, "low bands\ndropped\n(content)", ha="center", fontsize=8, color="#c0392b")
    arrow(ax, x0+NB*cw+3, 60-ch, x0+NB*cw+14, 60-ch)
    box(ax, x0+NB*cw+15, 52, 18, 16, "48-dim\ndescriptor\n(16 x 3)", fc="#d7e6f2", fs=9)
    save(fig, "fig_2_dct_feature_design.png")

# ---------- 5. B4 liveness baseline ----------
def b4_liveness():
    fig, ax = fig_axes(9, 2.8)
    y = 40; h = 22
    box(ax, 4, y, 16, h, "face\ncrop", fs=9)
    box(ax, 26, y, 24, h, "EfficientNet-B4\nspatial backbone", fs=9)
    box(ax, 56, y, 18, h, "2-layer\nhead", fs=9)
    box(ax, 80, y, 17, h, "spoof prob\n+ verdict", fc="#d7e6f2", fs=9)
    for a, b in [(20, 26), (50, 56), (74, 80)]:
        arrow(ax, a, y+h/2, b, y+h/2)
    save(fig, "fig_2_b4_liveness.png")

# ---------- 6. B4+DCT liveness proposal ----------
def b4dct_liveness():
    fig, ax = fig_axes(10, 4.0)
    box(ax, 3, 42, 14, 16, "face\ncrop", fs=9)
    box(ax, 26, 62, 26, 15, "EfficientNet-B4\nspatial -> F_s", fs=8.5)
    box(ax, 26, 24, 26, 15, "block-DCT\nfrequency -> D", fc="#fbeed2", fs=8.5)
    box(ax, 60, 42, 20, 16, "gated fusion\n(alpha init 0)", fc="#eae3f3", fs=8.5)
    box(ax, 84, 42, 14, 16, "head ->\nverdict", fc="#d7e6f2", fs=8.5)
    arrow(ax, 17, 50, 26, 69); arrow(ax, 17, 50, 26, 31)
    arrow(ax, 52, 69, 62, 54); arrow(ax, 52, 31, 62, 46)
    arrow(ax, 80, 50, 84, 50)
    save(fig, "fig_2_b4dct_liveness.png")

# ---------- 7. deployment topology ----------
def deployment():
    fig, ax = fig_axes(10, 4.6)
    box(ax, 3, 44, 13, 14, "Internet\n(DNS +\nElastic IP)", fc="white", fs=8.5)
    box(ax, 22, 44, 16, 14, "HTTPS\nreverse proxy\n(ACM cert)", fc="#fbeed2", fs=8)
    # EC2 host containing containers
    ax.add_patch(FancyBboxPatch((44, 14), 52, 74, boxstyle="round,pad=0.02,rounding_size=0.06",
                                fc="#fafafa", ec=GREY, lw=1.4, linestyle="--"))
    ax.text(70, 92, "single EC2 instance (private network)", ha="center", fontsize=9.5, color=GREY)
    box(ax, 48, 64, 20, 14, "frontend\n(Next.js)", fs=8.5)
    box(ax, 72, 64, 20, 14, "backend\n(FastAPI)", fs=8.5)
    box(ax, 48, 26, 20, 14, "model service\n(SFDCT)", fc="#d7e6f2", fs=8.5)
    box(ax, 72, 26, 20, 14, "database\n(PostgreSQL)", fs=8.5)
    arrow(ax, 16, 51, 22, 51); arrow(ax, 38, 51, 48, 60)
    arrow(ax, 82, 64, 82, 40)   # backend -> database (down)
    arrow(ax, 68, 71, 72, 71)   # frontend -> backend
    arrow(ax, 74, 64, 60, 40)   # backend -> model service (diagonal)
    save(fig, "fig_4_deployment.png")

for f in (convolution, rest_api, preprocess, dct_feature, b4_liveness, b4dct_liveness, deployment):
    f()
print("done")
