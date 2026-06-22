#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Figure 3.13.2 — KHÁI NIỆM: đối chứng gate init 0 (SFDCT) vs init 0.5 (model liên quan).
Schematic tại t=0 minh hoạ floor guarantee. KHÔNG phải số đo (không có model 0.5-init được train).
Phần zero-init tham chiếu kết quả thật Fig 3.16 (gate ≈ 0). Không số 'Figure' trong ảnh."""
import os
from pathlib import Path
import matplotlib; matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.patches import FancyBboxPatch

FIG = Path(__file__).resolve().parents[2] / "report" / "figures"
B4 = 0.7497

def panel(ax, init, title, color, eqn, conseq, measured):
    ax.set_xlim(-0.08, 1.08); ax.set_ylim(0, 1); ax.axis("off")
    ax.set_title(title, fontsize=12, fontweight="bold", color=color)
    # thanh α 0..1
    y = 0.78
    ax.annotate("", xy=(1.05, y), xytext=(-0.05, y), arrowprops=dict(arrowstyle="->", lw=1.4))
    for t in (0, 0.5, 1.0):
        ax.plot([t, t], [y - .02, y + .02], color="k", lw=1)
        ax.text(t, y - .07, f"{t:g}", ha="center", va="top", fontsize=9)
    ax.text(0.0, y + .19, "gate α (0 → 1)", ha="left", fontsize=9, style="italic", color="#666")
    ax.plot(init, y, "o", ms=18, color=color, zorder=5)
    ax.annotate(f"init α = {init:g}", xy=(init, y), xytext=(init, y + .1),
                ha="center", fontsize=10, fontweight="bold", color=color)
    # phương trình tại t=0
    ax.text(0.5, 0.52, eqn, ha="center", va="center", fontsize=11, family="monospace")
    # hộp hệ quả
    box = FancyBboxPatch((0.02, 0.06), 0.96, 0.36, boxstyle="round,pad=0.02,rounding_size=0.03",
                         fc=color, ec=color, alpha=.12, mutation_aspect=.5)
    ax.add_patch(box)
    ax.text(0.5, 0.24, conseq, ha="center", va="center", fontsize=9.2, wrap=True)
    ax.text(0.5, 0.005, measured, ha="center", va="bottom", fontsize=8, style="italic", color="#555")

fig, (a1, a2) = plt.subplots(1, 2, figsize=(12, 4.8))
panel(a1, 0.0, "Zero-init  α = 0   (SFDCT — this thesis)", "#1a7f37",
      "fused = x + α·context = x",
      f"Starts exactly AT the B4 backbone → AUC floor = {B4} guaranteed.\n"
      "The gate opens only if the frequency branch lowers the loss;\nthe model can never be worse than B4.",
      "Measured: after training α stays ≈ 0 (see Fig 3.16, gate distribution).")
panel(a2, 0.5, "Half-init  α = 0.5   (related model, e.g. SFCL-HCMF)", "#c4314b",
      "fused = x + 0.5·context",
      "Frequency injected at half strength from step 0, before it is proven useful.\n"
      "If the under-trained branch is noisy, the fused model\ncan drop BELOW B4 → no floor guarantee.",
      "Schematic: no 0.5-init model was trained here; illustrative of the design difference.")
fig.suptitle("Gate initialisation and the performance-floor guarantee — conceptual (schematic at t = 0)",
             fontsize=12, fontweight="bold")
fig.tight_layout(rect=[0, 0, 1, 0.95])
fig.savefig(FIG / "fig_3_13_2_gate_init.png", dpi=160, bbox_inches="tight"); plt.close(fig)
print("OK fig_3_13_2_gate_init.png")
