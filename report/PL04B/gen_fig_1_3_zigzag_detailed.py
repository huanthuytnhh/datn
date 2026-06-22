#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""fig_1_3_zigzag_detailed — detailed chain: zigzag scan 8x8 -> group into 16 frequency bands
-> mean per band x 3 YCbCr channels = 48-dim feature vector (ContentDCT global48).

Zigzag order + band split taken EXACTLY from DeepfakeBench/.../sfdct_core.py::zigzag_band_of:
  band(r,c) = min(rank * 16 // 64, 15) = rank // 4  (4 consecutive zigzag coeffs = 1 band).
"""
import numpy as np
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.patches import Rectangle, FancyArrowPatch
from matplotlib import cm

N, NB = 8, 16
CMAP = cm.get_cmap("viridis")
bandcol = [CMAP(b / (NB - 1)) for b in range(NB)]


def zigzag_order(n=8):
    order = []
    for s in range(2 * n - 1):
        ks = range(s + 1) if s % 2 else range(s, -1, -1)
        for k in ks:
            r, c = (k, s - k) if s % 2 else (s - k, k)
            if r < n and c < n:
                order.append((r, c))
    return order


ORDER = zigzag_order(N)              # 64 (r,c) pairs by increasing rank
rank_of = {(r, c): i for i, (r, c) in enumerate(ORDER)}
band_of = {(r, c): min(i * NB // (N * N), NB - 1) for i, (r, c) in enumerate(ORDER)}


def text_color(rgba):
    lum = 0.299 * rgba[0] + 0.587 * rgba[1] + 0.114 * rgba[2]
    return "white" if lum < 0.55 else "#111111"


fig = plt.figure(figsize=(18, 8.2))
ax = fig.add_axes([0, 0, 1, 1]); ax.set_xlim(0, 100); ax.set_ylim(0, 100); ax.axis("off")
fig.suptitle("From zigzag scan to 16 frequency bands and the 48-dim feature vector (ContentDCT)",
             fontsize=17, fontweight="bold", y=0.985)

# ───────────────────────── PANEL A: 8×8 block + zigzag + band coloring ─────────────────────────
Ax0, Ay_top, cell = 3.0, 84.0, 3.4
def cellxy(r, c):
    return Ax0 + c * cell, Ay_top - (r + 1) * cell        # (x_left, y_bottom)
def center(r, c):
    x, y = cellxy(r, c); return x + cell / 2, y + cell / 2

ax.text(Ax0 + 4 * cell, Ay_top + 5.2, "(1) Zigzag scan on the 8×8 DCT block",
        ha="center", fontsize=12.5, fontweight="bold")
ax.text(Ax0 + 4 * cell, Ay_top + 2.2, "colored by band · number = frequency order (0 = DC)",
        ha="center", fontsize=10, color="#555")

for (r, c), rank in rank_of.items():
    x, y = cellxy(r, c); col = bandcol[band_of[(r, c)]]
    ax.add_patch(Rectangle((x, y), cell, cell, facecolor=col, edgecolor="white", lw=1.0))
    ax.text(x + cell / 2, y + cell / 2, str(rank), ha="center", va="center",
            fontsize=8.0, color=text_color(col))
# zigzag path (red) connecting cell centers by rank
pts = [center(r, c) for (r, c) in ORDER]
xs, ys = zip(*pts)
ax.plot(xs, ys, color="#e23b3b", lw=1.4, alpha=0.85, zorder=5)
# DC dot
cx, cy = center(0, 0)
ax.scatter([cx], [cy], s=130, color="#ff9800", zorder=6, edgecolor="white", lw=1.2)
ax.text(cx - 0.2, cy + cell * 0.9, "DC", ha="center", fontsize=9, color="#ff9800", fontweight="bold")

# ───────────────────────── PANEL B: 64 zigzag coeffs → 16 bands × 4 ─────────────────────────
Bx0, By_top, bw, bh, gap = 36.5, 86.0, 3.0, 3.0, 0.9
ax.text(Bx0 + 8.5, By_top + 3.2, "(2) Group 4 consecutive zigzag coefficients → 1 band",
        ha="center", fontsize=12.5, fontweight="bold")
ax.text(Bx0 + 8.5, By_top + 0.4, "64 coefficients (rank 0–63)  →  16 frequency bands",
        ha="center", fontsize=10, color="#555")
row_h = 4.55
for b in range(NB):
    y = By_top - 2 - (b + 1) * row_h
    col = bandcol[b]
    ax.text(Bx0 - 0.6, y + bh / 2, f"band {b}", ha="right", va="center", fontsize=8.6,
            color=col if b != 0 else "#5b2c83", fontweight="bold")
    for j in range(4):
        rank = b * 4 + j
        x = Bx0 + 1.5 + j * (bw + gap)
        ax.add_patch(Rectangle((x, y), bw, bh, facecolor=col, edgecolor="white", lw=1.0))
        ax.text(x + bw / 2, y + bh / 2, str(rank), ha="center", va="center",
                fontsize=7.6, color=text_color(col))
ax.text(Bx0 + 8.5, By_top - 2 - (NB) * row_h - 2.0,
        "each band = 4 coefficients · low bands = low frequency (content), high bands = high frequency (artefacts)",
        ha="center", fontsize=8.4, color="#666", style="italic")

# ───────────────────────── PANEL C: bands → mean → 48-dim vector ─────────────────────────
Cx0, Cy_top = 70.0, 86.0
ax.text(Cx0 + 13, Cy_top + 3.2, "(3) Mean |DCT| per band × 3 YCbCr channels",
        ha="center", fontsize=12.5, fontweight="bold")
ax.text(Cx0 + 13, Cy_top + 0.4, "= 48-dim feature vector (global48, 0 learnable params)",
        ha="center", fontsize=10, color="#555")

# 16-band vertical bar
barx, bary_top, barw, barh = Cx0, Cy_top - 4, 5.0, 4.0
for b in range(NB):
    y = bary_top - (b + 1) * barh
    ax.add_patch(Rectangle((barx, y), barw, barh, facecolor=bandcol[b], edgecolor="white", lw=0.8))
ax.text(barx + barw / 2, bary_top + 1.2, "16 bands", ha="center", fontsize=9, fontweight="bold")
ax.text(barx + barw + 0.8, bary_top - barh / 2, "band 0 (DC + low)", va="center", fontsize=8.4, color="#5b2c83")
ax.text(barx + barw + 0.8, bary_top - 8 * barh + barh / 2, "band 7 (mid)", va="center", fontsize=8.4, color="#1f9e89")
ax.text(barx + barw + 0.8, bary_top - 16 * barh + barh / 2, "band 15 (high)", va="center", fontsize=8.4, color="#b5b300")

# 3 vector columns Y/Cb/Cr (16 cells each) = 48
vx0 = Cx0 + 17.5
vbar_top = bary_top
vcw, vch = 3.2, barh
for ch, name in enumerate(["Y", "Cb", "Cr"]):
    vx = vx0 + ch * (vcw + 1.2)
    ax.text(vx + vcw / 2, vbar_top + 1.2, name, ha="center", fontsize=9, fontweight="bold")
    for b in range(NB):
        y = vbar_top - (b + 1) * vch
        ax.add_patch(Rectangle((vx, y), vcw, vch, facecolor=bandcol[b], edgecolor="white", lw=0.7))
ax.text(vx0 + 1.5 * (vcw + 1.2) - 0.6, vbar_top - 16 * vch - 2.2,
        "16 × 3 = 48 dims", ha="center", fontsize=9.5, fontweight="bold", color="#333")

# arrow inside panel C: 16 bands -> mean -> 3 columns
arr_kw = dict(arrowstyle="-|>", color="#444", lw=2.0, mutation_scale=18)
ax.add_patch(FancyArrowPatch((barx + barw + 9.5, bary_top - 8 * barh),
                             (vx0 - 0.8, bary_top - 8 * vch), **arr_kw))
ax.text(barx + barw + 9.0, bary_top - 8 * barh + 2.4, "mean\n|DCT|/band",
        ha="center", fontsize=8.2, color="#444")

# ───────────────────────── arrows linking A→B→C ─────────────────────────
big = dict(arrowstyle="-|>", color="#0050cb", lw=2.6, mutation_scale=24)
ax.add_patch(FancyArrowPatch((Ax0 + 8 * cell + 0.8, 56), (Bx0 - 1.5, 56), **big))
ax.add_patch(FancyArrowPatch((Bx0 + 18.5, 56), (Cx0 - 1.5, 56), **big))

# bottom note: drop low bands
ax.text(50, 4.2,
        "ContentDCT drops DC + a few lowest bands (drop_low_bands) to remove content/identity leakage, "
        "emphasising the mid–high bands where forgery traces live.",
        ha="center", fontsize=10, color="#444", style="italic")

out = "/home/huanthuytnhh/Desktop/thanhln/datn/report/figures/fig_1_3_zigzag_detailed.png"
fig.savefig(out, dpi=150, bbox_inches="tight"); plt.close(fig)
print("saved:", out)
