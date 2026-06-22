#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Figure 2.1 — DeepGuard use-case (UML: actor que + ellipse + «include»/«extend»).
Bố cục 2 nhóm trên/dưới: đường KHÔNG cắt xuyên ellipse. Output: report/figures/fig_2_1_usecase.png"""
import os
import numpy as np
import matplotlib; matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.patches import Ellipse, FancyBboxPatch

FIG = os.path.join(os.path.dirname(__file__), "..", "figures")
fig, ax = plt.subplots(figsize=(15, 11.5)); ax.set_xlim(0, 15); ax.set_ylim(0, 11.5); ax.axis("off")

def stick(x, y, name):
    ax.add_patch(plt.Circle((x, y + 0.32), 0.15, fill=False, lw=1.5))
    ax.plot([x, x], [y + 0.17, y - 0.22], "k", lw=1.5)
    ax.plot([x - 0.22, x + 0.22], [y + 0.03, y + 0.03], "k", lw=1.5)
    ax.plot([x, x - 0.18], [y - 0.22, y - 0.5], "k", lw=1.5)
    ax.plot([x, x + 0.18], [y - 0.22, y - 0.5], "k", lw=1.5)
    ax.text(x, y - 0.64, name, ha="center", va="top", fontsize=9.3, fontweight="bold")

UC = {}
def uc(key, x, y, text, w=1.95, h=1.0, fc="#eef3fb"):
    ax.add_patch(Ellipse((x, y), w, h, fc=fc, ec="#33558a", lw=1.5))
    ax.text(x, y, text, ha="center", va="center", fontsize=8.1); UC[key] = (x, y, w, h)
def edge(box, toward):
    x, y, w, h = box; dx, dy = toward[0] - x, toward[1] - y
    n = np.hypot(dx / (w/2), dy / (h/2)) + 1e-9; return (x + dx/n, y + dy/n)
def assoc(ax_xy, key):
    p = edge(UC[key], ax_xy); ax.plot([ax_xy[0] + 0.3, p[0]], [ax_xy[1], p[1]], "k", lw=1.0)
def dep(a, b, label):
    pa = edge(UC[a], (UC[b][0], UC[b][1])); pb = edge(UC[b], (UC[a][0], UC[a][1]))
    ax.annotate("", xy=pb, xytext=pa, arrowprops=dict(arrowstyle="-|>", ls=(0, (5, 4)), color="#666", lw=1.2))
    mx, my = (pa[0]+pb[0])/2, (pa[1]+pb[1])/2
    ax.text(mx, my, f"«{label}»", ha="center", va="center", fontsize=7.6, color="#444", style="italic",
            bbox=dict(fc="white", ec="none", pad=0.4))

ax.add_patch(FancyBboxPatch((3.4, 0.5), 9.3, 10.4, boxstyle="round,pad=0.02,rounding_size=0.12",
                            fill=False, ec="#999", lw=1.4))
ax.text(8.0, 10.6, "DeepGuard platform", ha="center", fontsize=11, fontweight="bold", color="#555")
ax.plot([3.4, 12.7], [5.55, 5.55], color="#ddd", lw=1.0, ls=(0, (2, 3)))

# ===== NHÓM TRÊN: detection (Developer + eKYC client) =====
stick(1.3, 9.3, "Developer"); stick(1.3, 7.4, "External\neKYC client")
uc("keys", 5.45, 10.0, "Manage\nAPI keys")
uc("img", 5.45, 8.7, "Detect deepfake\n(image)")
uc("vid", 5.45, 7.4, "Detect deepfake\n(video)")
uc("live", 5.45, 6.2, "Liveness check")
uc("cam", 8.55, 9.4, "View Grad-CAM\n& spectrum", w=2.0, fc="#eaf5ec")
uc("crop", 8.55, 7.6, "Crop & align\nface (MTCNN)", w=1.95, fc="#f3f0e8")
uc("atk", 8.55, 6.2, "Identify\nattack type", w=1.8, fc="#eaf5ec")
for k in ("keys", "img", "vid", "live"): assoc((1.3, 9.3), k)
for k in ("img", "vid", "live"): assoc((1.3, 7.4), k)
dep("img", "crop", "include"); dep("vid", "crop", "include")
dep("cam", "img", "extend"); dep("atk", "live", "extend")

# ===== NHÓM DƯỚI: quản lý (5 role) — đường ngang sạch =====
mgmt = [("Sysadmin", "approve", "Approve tenant", 4.85),
        ("Admin", "team", "Manage team", 3.85),
        ("Compliance", "review", "Review &\nadd note", 2.85),
        ("Viewer", "hist", "View history\n& analytics", 1.85),
        ("Anonymous", "reg", "Register\norganisation", 0.95)]
for actor, key, text, y in mgmt:
    stick(1.3, y, actor); uc(key, 5.45, y, text); assoc((1.3, y), key)

ax.set_title("DeepGuard use-case diagram — dashboard roles (JWT) and the external eKYC client (API key)",
             fontsize=12.5, fontweight="bold")
fig.tight_layout()
fig.savefig(os.path.join(FIG, "fig_2_1_usecase.png"), dpi=160, bbox_inches="tight"); plt.close(fig)
print("OK fig_2_1_usecase.png")
