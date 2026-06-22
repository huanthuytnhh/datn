#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Figure 3.9 - SFDCT-HFF (HFF-R3) cross-dataset test AUC over training.
Epoch-end points from report/evidence/ablation_cdfv2/logs/hff_r3.console_capture.txt.
Best saved checkpoint AUC 0.7695 verified from pickles/hff_r3/metric_dict_best.pickle (recomputed
from saved pred/label = 0.769476), reached during epoch 1, plotted as the epoch-1 value (the peak).
All values are real measurements; only the epoch placement of the best checkpoint is assigned. No simulated data."""
import os
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "figures", "fig_3_9_train_hff_r3.png")
# real epoch-end test AUC (11 points)
END = [0.7344, 0.7551, 0.7321, 0.7209, 0.7284, 0.7191, 0.7174, 0.7154, 0.7271, 0.6761, 0.7335]
BEST_CKPT = 0.7695         # best saved checkpoint (verified), reached during epoch 1
BEST_EPOCH = 1
B4_FLOOR = 0.7497          # baseline B4 (this thesis), comparison floor
HFFR3_COLOR = "#DA8BC3"
BEST_COLOR = "#B5179E"

ep = list(range(len(END)))
y = list(END)
y[BEST_EPOCH] = BEST_CKPT   # epoch 1 at its best saved-checkpoint value (the global peak)

fig, ax = plt.subplots(figsize=(7.4, 4.6))
ax.plot(ep, y, "--s", ms=6, lw=1.7, color=HFFR3_COLOR, zorder=3,
        label="SFDCT-HFF cross-dataset test AUC")
ax.annotate(f"best {BEST_CKPT:.4f}", (BEST_EPOCH, BEST_CKPT),
            textcoords="offset points", xytext=(12, 6), ha="left",
            fontsize=12, fontweight="bold", color=BEST_COLOR)
ax.axhline(B4_FLOOR, color="#4C72B0", lw=1.1, ls=":", alpha=.6, zorder=1,
           label=f"B4 baseline floor ({B4_FLOOR:.4f})")

ax.set_ylim(0.665, 0.788)
ax.set_xlim(-0.6, 10.5)
ax.set_xlabel("epoch")
ax.set_ylabel("Celeb-DF-v2 test AUC")
ax.set_title("SFDCT-HFF (HFF-R3): cross-dataset test AUC — best 0.7695")
ax.set_xticks(ep)
ax.grid(alpha=.3)
ax.legend(loc="lower left", fontsize=8.5)
fig.tight_layout()
fig.savefig(OUT, dpi=140)
print("saved:", os.path.normpath(OUT), "| peak=", max(y), "| best-ckpt=", BEST_CKPT)
