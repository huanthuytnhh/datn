#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Figure 2.3 — Activity diagram (swimlane User | System) cho deepfake image detection, theo mẫu UML.
action = rounded rect, decision = diamond, start/end = circle. Không số 'Figure' trong ảnh."""
import os
import numpy as np
import matplotlib; matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.patches import FancyBboxPatch, Polygon, Circle, Rectangle

FIG = os.path.join(os.path.dirname(__file__), "..", "figures")
fig, ax = plt.subplots(figsize=(10.5, 12.8)); ax.set_xlim(0, 10.5); ax.set_ylim(0, 12.8); ax.axis("off")
AC = "#fff7d6"; EC = "#c9a93a"

# ---- swimlanes ----
ax.add_patch(Rectangle((0.3, 0.3), 9.9, 12.0, fill=False, ec="#bbb", lw=1.3))
ax.axvline(5.05, ymin=0.3/12.8, ymax=12.3/12.8, color="#bbb", lw=1.2)
for cx, name in [(2.65, "User"), (7.6, "System")]:
    ax.add_patch(Rectangle((cx - 2.35 if name == "User" else 5.1, 11.8), 4.75 if name == "User" else 5.1, 0.5,
                           fc="#eee", ec="#bbb", lw=1.0))
    ax.text(cx, 12.05, name, ha="center", va="center", fontsize=12.5, fontweight="bold")

def action(cx, y, text, w=2.9, h=0.72):
    ax.add_patch(FancyBboxPatch((cx - w/2, y - h/2), w, h, boxstyle="round,pad=0.02,rounding_size=0.12",
                                fc=AC, ec=EC, lw=1.3))
    ax.text(cx, y, text, ha="center", va="center", fontsize=8.6)
    return {"x": cx, "y": y, "w": w, "h": h}
def decision(cx, y, text, w=2.3, h=1.15):
    ax.add_patch(Polygon([(cx, y + h/2), (cx + w/2, y), (cx, y - h/2), (cx - w/2, y)], fc=AC, ec=EC, lw=1.3))
    ax.text(cx, y, text, ha="center", va="center", fontsize=8.2)
    return {"x": cx, "y": y, "w": w, "h": h}
def start(cx, y): ax.add_patch(Circle((cx, y), 0.17, fc="k")); return {"x": cx, "y": y, "w": .34, "h": .34}
def end(cx, y):
    ax.add_patch(Circle((cx, y), 0.21, fill=False, ec="k", lw=1.6)); ax.add_patch(Circle((cx, y), 0.1, fc="k"))
    return {"x": cx, "y": y, "w": .42, "h": .42}

def ep(n, tx, ty):
    dx, dy = tx - n["x"], ty - n["y"]; s = max(abs(dx) / (n["w"]/2 + 1e-9), abs(dy) / (n["h"]/2 + 1e-9)) + 1e-9
    return (n["x"] + dx/s, n["y"] + dy/s)
def arrow(a, b, label=None, color="#444"):
    pa = ep(a, b["x"], b["y"]); pb = ep(b, a["x"], a["y"])
    ax.annotate("", xy=pb, xytext=pa, arrowprops=dict(arrowstyle="-|>", color=color, lw=1.3))
    if label:
        mx, my = (pa[0] + pb[0]) / 2, (pa[1] + pb[1]) / 2
        ax.text(mx, my, label, fontsize=8, color=color, ha="center", va="center",
                bbox=dict(fc="white", ec="none", pad=0.4))

# ---- nodes ----
s = start(2.65, 11.4)
up = action(2.65, 10.5, "Upload a face image")
ck = action(6.8, 10.5, "Check token, role & quota")
d1 = decision(6.8, 9.1, "authorised &\nquota OK?")
rj1 = action(9.1, 9.1, "Reject\n(401/403/quota)", w=1.9, h=0.9); e1 = end(9.1, 7.9)
cr = action(6.8, 7.7, "Detect & crop face\n(MTCNN)")
d2 = decision(6.8, 6.3, "face found?")
rj2 = action(9.1, 6.3, "Return:\nno face", w=1.8, h=0.8); e2 = end(9.1, 5.2)
fw = action(6.8, 5.0, "Model forward pass\n→ prob_fake")
d3 = decision(6.8, 3.65, "map prob_fake\n→ risk band")
ret = action(6.8, 2.25, "Return score, band &\nGrad-CAM heat-map")
vw = action(2.65, 2.25, "View score, band\n& heat-map")
e0 = end(2.65, 1.1)

# ---- flow ----
arrow(s, up); arrow(up, ck); arrow(ck, d1)
arrow(d1, rj1, "no"); arrow(rj1, e1)
arrow(d1, cr, "yes"); arrow(cr, d2)
arrow(d2, rj2, "no"); arrow(rj2, e2)
arrow(d2, fw, "yes"); arrow(fw, d3)
arrow(d3, ret, "fake / real / uncertain"); arrow(ret, vw); arrow(vw, e0)

ax.set_title("Activity diagram — deepfake image detection (dashboard Playground, JWT)",
             fontsize=12.5, fontweight="bold")
fig.tight_layout()
fig.savefig(os.path.join(FIG, "fig_2_3_activity.png"), dpi=160, bbox_inches="tight"); plt.close(fig)
print("OK fig_2_3_activity.png")
