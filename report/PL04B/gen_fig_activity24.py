#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Figure 2.4 — Activity diagram (swimlane) cho eKYC cascade: liveness trước → live → deepfake.
Theo mẫu UML. Output: report/figures/fig_2_4_activity.png"""
import os
import numpy as np
import matplotlib; matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.patches import FancyBboxPatch, Polygon, Circle, Rectangle

FIG = os.path.join(os.path.dirname(__file__), "..", "figures")
fig, ax = plt.subplots(figsize=(11.5, 12.4)); ax.set_xlim(0, 11.5); ax.set_ylim(0, 12.4); ax.axis("off")
AC = "#fff7d6"; EC = "#c9a93a"

ax.add_patch(Rectangle((0.3, 0.3), 10.9, 11.6, fill=False, ec="#bbb", lw=1.3))
ax.axvline(4.45, ymin=0.3/12.4, ymax=11.9/12.4, color="#bbb", lw=1.2)
ax.add_patch(Rectangle((0.3, 11.4), 4.15, 0.5, fc="#eee", ec="#bbb")); ax.text(2.37, 11.65, "Customer backend", ha="center", fontsize=11.5, fontweight="bold")
ax.add_patch(Rectangle((4.45, 11.4), 6.75, 0.5, fc="#eee", ec="#bbb")); ax.text(7.8, 11.65, "DeepGuard System", ha="center", fontsize=11.5, fontweight="bold")

def action(cx, y, text, w=2.7, h=0.74, fc=AC):
    ax.add_patch(FancyBboxPatch((cx-w/2, y-h/2), w, h, boxstyle="round,pad=0.02,rounding_size=0.12", fc=fc, ec=EC, lw=1.3))
    ax.text(cx, y, text, ha="center", va="center", fontsize=8.4); return {"x": cx, "y": y, "w": w, "h": h}
def decision(cx, y, text, w=2.2, h=1.1):
    ax.add_patch(Polygon([(cx, y+h/2), (cx+w/2, y), (cx, y-h/2), (cx-w/2, y)], fc=AC, ec=EC, lw=1.3))
    ax.text(cx, y, text, ha="center", va="center", fontsize=8.1); return {"x": cx, "y": y, "w": w, "h": h}
def start(cx, y): ax.add_patch(Circle((cx, y), 0.17, fc="k")); return {"x": cx, "y": y, "w": .34, "h": .34}
def end(cx, y):
    ax.add_patch(Circle((cx, y), 0.21, fill=False, ec="k", lw=1.6)); ax.add_patch(Circle((cx, y), 0.1, fc="k"))
    return {"x": cx, "y": y, "w": .42, "h": .42}
def ep(n, tx, ty):
    dx, dy = tx-n["x"], ty-n["y"]; s = max(abs(dx)/(n["w"]/2+1e-9), abs(dy)/(n["h"]/2+1e-9))+1e-9
    return (n["x"]+dx/s, n["y"]+dy/s)
def arrow(a, b, label=None, color="#444"):
    pa = ep(a, b["x"], b["y"]); pb = ep(b, a["x"], a["y"])
    ax.annotate("", xy=pb, xytext=pa, arrowprops=dict(arrowstyle="-|>", color=color, lw=1.3))
    if label:
        mx, my = (pa[0]+pb[0])/2, (pa[1]+pb[1])/2
        ax.text(mx, my, label, fontsize=7.8, color=color, ha="center", va="center", bbox=dict(fc="white", ec="none", pad=0.3))

# ---- nodes ----
s = start(2.37, 11.0)
sub = action(2.37, 10.1, "Submit face frame\n(API key)")
liv = action(7.0, 10.1, "Passive liveness check")
d1 = decision(7.0, 8.6, "liveness\nband?")
rj_pa = action(9.5, 9.2, "Reject:\npresentation\nattack", w=1.9, h=1.0); e1 = end(9.5, 7.95)
rt = action(9.5, 6.9, "Ask user\nto retry", w=1.9, h=0.8); e2 = end(9.5, 5.85)
df = action(7.0, 6.7, "Deepfake detection\n(same live frame)")
d2 = decision(7.0, 5.2, "deepfake\nband?")
rj_df = action(9.5, 4.6, "Reject:\ndeepfake", w=1.9, h=0.85); e3 = end(9.5, 3.5)
rev = action(9.5, 2.4, "Escalate:\nmanual review", w=1.9, h=0.85); e4 = end(9.5, 1.3)
appr = action(7.0, 3.4, "Approve:\nlive & genuine", fc="#dff3e0")
out = action(2.37, 3.4, "Receive eKYC\noutcome")
e0 = end(2.37, 2.1)

# ---- flow ----
arrow(s, sub); arrow(sub, liv); arrow(liv, d1)
arrow(d1, rj_pa, "spoof"); arrow(rj_pa, e1)
arrow(d1, rt, "uncertain"); arrow(rt, e2)
arrow(d1, df, "live"); arrow(df, d2)
arrow(d2, rj_df, "fake"); arrow(rj_df, e3)
arrow(d2, rev, "uncertain"); arrow(rev, e4)
arrow(d2, appr, "real"); arrow(appr, out); arrow(out, e0)

ax.set_title("Activity diagram — eKYC cascade: liveness first, then deepfake (API key, /v1 endpoints)",
             fontsize=12.3, fontweight="bold")
fig.tight_layout()
fig.savefig(os.path.join(FIG, "fig_2_4_activity.png"), dpi=160, bbox_inches="tight"); plt.close(fig)
print("OK fig_2_4_activity.png")
