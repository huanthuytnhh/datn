#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Figure 2.5 / 2.6 — Sequence diagram (lifeline + message) chuẩn UML. Output PNG.
2.5 deepfake detection · 2.6 eKYC cascade (có alt fragment). Không số 'Figure' trong ảnh."""
import os
import matplotlib; matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.patches import FancyBboxPatch, Rectangle

FIG = os.path.join(os.path.dirname(__file__), "..", "figures")

def seq(parts, msgs, title, out, alt=None, H=9.5):
    fig, ax = plt.subplots(figsize=(11.5, H)); ax.set_xlim(0, 11.5); ax.set_ylim(0, H); ax.axis("off")
    top = H - 0.7; bot = 0.7
    px = {n: x for n, x in parts}
    for n, x in parts:
        ax.add_patch(FancyBboxPatch((x - 1.05, top - 0.32), 2.1, 0.64, boxstyle="round,pad=0.02,rounding_size=0.08",
                                    fc="#e9eef7", ec="#33558a", lw=1.4))
        ax.text(x, top, n, ha="center", va="center", fontsize=9, fontweight="bold")
        ax.plot([x, x], [top - 0.36, bot], color="#888", lw=1.0, ls=(0, (4, 4)))
    if alt:
        x0, x1, y0, y1, lab = alt
        ax.add_patch(Rectangle((x0, y0), x1 - x0, y1 - y0, fill=False, ec="#c98", lw=1.2))
        ax.add_patch(FancyBboxPatch((x0, y1 - 0.34), 0.95, 0.34, boxstyle="square,pad=0", fc="#f3e8df", ec="#c98", lw=1.0))
        ax.text(x0 + 0.47, y1 - 0.17, lab, ha="center", va="center", fontsize=8, fontstyle="italic")
    for m in msgs:
        a, b, y, label, dashed = m["a"], m["b"], m["y"], m["t"], m.get("d", False)
        ls = (0, (5, 3)) if dashed else "-"
        if a == b:  # self message
            xa = px[a]
            ax.plot([xa, xa + 0.7, xa + 0.7, xa + 0.06], [y, y, y - 0.32, y - 0.32], color="#333", lw=1.2, ls=ls)
            ax.annotate("", xy=(xa, y - 0.32), xytext=(xa + 0.3, y - 0.32), arrowprops=dict(arrowstyle="-|>", color="#333", lw=1.2))
            ax.text(xa + 0.85, y - 0.16, label, ha="left", va="center", fontsize=7.8)
        else:
            xa, xb = px[a], px[b]
            ax.annotate("", xy=(xb, y), xytext=(xa, y), arrowprops=dict(arrowstyle="-|>", color="#333", lw=1.3, linestyle=ls))
            ax.text((xa + xb) / 2, y + 0.12, label, ha="center", va="bottom", fontsize=7.9,
                    color=("#666" if dashed else "#111"))
    ax.set_title(title, fontsize=12.3, fontweight="bold")
    fig.tight_layout(); fig.savefig(os.path.join(FIG, out), dpi=160, bbox_inches="tight"); plt.close(fig)
    print("OK", out)

# ---------- 2.5 deepfake detection ----------
P5 = [("User", 1.4), ("Frontend\n(:3000)", 4.3), ("Backend\n(:8000)", 7.2), ("Model service\n(:8501)", 10.1)]
M5 = [
    {"a": "User", "b": "Frontend\n(:3000)", "y": 7.5, "t": "Upload a face image"},
    {"a": "Frontend\n(:3000)", "b": "Backend\n(:8000)", "y": 7.2, "t": "POST image + JWT"},
    {"a": "Backend\n(:8000)", "b": "Backend\n(:8000)", "y": 6.5, "t": "check role & quota; MTCNN crop"},
    {"a": "Backend\n(:8000)", "b": "Model service\n(:8501)", "y": 5.5, "t": "POST /predict (cropped face)"},
    {"a": "Model service\n(:8501)", "b": "Backend\n(:8000)", "y": 4.8, "t": "prob_fake, verdict, Grad-CAM", "d": True},
    {"a": "Backend\n(:8000)", "b": "Backend\n(:8000)", "y": 4.1, "t": "map prob_fake → risk band; persist"},
    {"a": "Backend\n(:8000)", "b": "Frontend\n(:3000)", "y": 3.1, "t": "score, band, heat-map, spectrum (JSON)", "d": True},
    {"a": "Frontend\n(:3000)", "b": "User", "y": 2.4, "t": "render result", "d": True},
]
seq(P5, M5, "Sequence diagram — single-image deepfake detection (frontend → backend → SFDCT)", "fig_2_5_sequence.png", H=9.0)

# ---------- 2.6 eKYC cascade (alt) ----------
P6 = [("Customer\nbackend", 1.7), ("Backend API\n(:8000)", 5.8), ("Model service\n(:8501)", 9.7)]
M6 = [
    {"a": "Customer\nbackend", "b": "Backend API\n(:8000)", "y": 8.3, "t": "POST /v1/detect/liveness (API key)"},
    {"a": "Backend API\n(:8000)", "b": "Model service\n(:8501)", "y": 8.0, "t": "crop → liveness head"},
    {"a": "Model service\n(:8501)", "b": "Backend API\n(:8000)", "y": 7.3, "t": "score, verdict", "d": True},
    {"a": "Backend API\n(:8000)", "b": "Customer\nbackend", "y": 6.2, "t": "SPOOF / UNCERTAIN → stop", "d": True},
    {"a": "Customer\nbackend", "b": "Backend API\n(:8000)", "y": 4.7, "t": "[if LIVE] POST /v1/detect/image (same frame)"},
    {"a": "Backend API\n(:8000)", "b": "Model service\n(:8501)", "y": 4.0, "t": "crop → deepfake head"},
    {"a": "Model service\n(:8501)", "b": "Backend API\n(:8000)", "y": 3.3, "t": "prob_fake, verdict", "d": True},
    {"a": "Backend API\n(:8000)", "b": "Customer\nbackend", "y": 2.4, "t": "combined eKYC outcome", "d": True},
]
seq(P6, M6, "Sequence diagram — eKYC cascade: liveness then deepfake (/v1, API key)", "fig_2_6_sequence.png",
    alt=(1.0, 10.6, 1.9, 6.7, "alt"), H=9.6)
