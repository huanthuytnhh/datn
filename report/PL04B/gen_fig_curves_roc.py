#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Figure 3.5 / 3.7 (training curve B4, SFDCT) · 3.9 (HFF-R3 AUC/epoch) · 3.10 (ROC).
Số THẬT từ report/evidence/ablation_cdfv2/ (training.log + pickle best-ckpt). KHÔNG số 'Figure' trong ảnh.
Ghi đè đúng tên file MD đang trỏ tới."""
import os, re, pickle
from pathlib import Path
import numpy as np
import matplotlib; matplotlib.use("Agg")
import matplotlib.pyplot as plt
from sklearn.metrics import roc_curve, auc as sk_auc

ROOT = Path(__file__).resolve().parents[2]
EV = ROOT / "report" / "evidence" / "ablation_cdfv2"
FIG = ROOT / "report" / "figures"
B4_FLOOR = 0.7497
RE_L = re.compile(r"Iter:\s*(\d+)\s+training-loss,\s*overall:\s*([0-9.]+)")
RE_A = re.compile(r"dataset:\s*Celeb-DF-v2\s+step:\s*(\d+).*?testing-metric, auc:\s*([0-9.]+)")

def parse(tag):
    t = open(EV / "logs" / f"{tag}.training.log", errors="ignore").read()
    return np.array(RE_L.findall(t), float), np.array(RE_A.findall(t), float)

def train_fig(tag, title, color, out):
    L, A = parse(tag)
    ep = A[:, 0] / A[-1, 0] * 10.0
    fig, (a1, a2) = plt.subplots(1, 2, figsize=(11, 4.2))
    a1.plot(L[:, 0], L[:, 1], color=color, lw=1.0, alpha=.9)
    a1.set(xlabel="iteration", ylabel="train loss (overall)", title="Training loss"); a1.grid(alpha=.3)
    a2.plot(ep, A[:, 1], "-o", ms=4, color=color, label=f"best AUC = {A[:,1].max():.4f}")
    a2.axhline(B4_FLOOR, color="gray", ls=":", lw=1.0, label=f"B4 floor {B4_FLOOR}")
    a2.set(xlabel="epoch (≈)", ylabel="Celeb-DF-v2 test AUC", title="Cross-dataset test AUC per epoch")
    a2.legend(fontsize=8); a2.grid(alpha=.3)
    fig.suptitle(f"Training dynamics — {title}", fontsize=12, fontweight="bold")
    fig.tight_layout(); fig.savefig(FIG / out, dpi=160, bbox_inches="tight"); plt.close(fig)
    print(f"OK {out}: best test-AUC={A[:,1].max():.4f}  (loss pts={len(L)}, auc pts={len(A)})")

train_fig("b4", "EfficientNet-B4 (baseline)", "#4C72B0", "fig_3_3_train_b4.png")        # Figure 3.5
train_fig("sfdct", "SFDCT", "#DD8452", "fig_3_4_train_naive.png")                       # Figure 3.7

# --- 3.9 HFF-R3: AUC/epoch (11 điểm console capture, không có loss) ---
r3 = [0.7344, 0.7551, 0.7321, 0.7209, 0.7284, 0.7191, 0.7174, 0.7154, 0.7271, 0.6761, 0.7335]
fig, ax = plt.subplots(figsize=(7.2, 4.3))
ax.plot(range(len(r3)), r3, "--s", ms=5, lw=1.6, color="#DA8BC3", label=f"SFDCT-HFF (HFF-R3), best {max(r3):.4f}")
ax.axhline(B4_FLOOR, color="#4C72B0", ls=":", lw=1.0, label=f"B4 floor {B4_FLOOR}")
im = max(range(len(r3)), key=lambda i: r3[i])
ax.annotate(f"{r3[im]:.4f}", (im, r3[im]), textcoords="offset points", xytext=(0, 8), ha="center", fontsize=9, color="#DA8BC3")
ax.set(xlabel="epoch (console capture, 11 points)", ylabel="Celeb-DF-v2 test AUC",
       title="SFDCT-HFF (HFF-R3) — cross-dataset test AUC per epoch")
ax.set_xticks(range(len(r3))); ax.legend(loc="lower left", fontsize=9); ax.grid(alpha=.3)
fig.tight_layout(); fig.savefig(FIG / "fig_3_9_train_hff_r3.png", dpi=160, bbox_inches="tight"); plt.close(fig)
print("OK fig_3_9_train_hff_r3.png")

# --- 3.10 ROC (frame-level) + vạch FPR=5% ---
def roc_of(tag):
    mm = pickle.load(open(EV / "pickles" / tag / "metric_dict_best.pickle", "rb"))
    pred = np.asarray(mm["pred"], float); label = np.asarray(mm["label"], int)
    fpr, tpr, _ = roc_curve(label, pred)
    return fpr, tpr, sk_auc(fpr, tpr)
fig, ax = plt.subplots(figsize=(6.6, 5.6))
for tag, name, color in [("b4", "B4 (baseline)", "#4C72B0"), ("sfdct", "SFDCT", "#DD8452"),
                         ("hff_r3", "SFDCT-HFF (full)", "#DA8BC3")]:
    fpr, tpr, a = roc_of(tag)
    ax.plot(fpr, tpr, color=color, lw=1.8, label=f"{name} — AUC {a:.4f}")
ax.axvline(0.05, color="red", ls="--", lw=1.3, label="FPR = 5% (eKYC operating point)")
ax.plot([0, 1], [0, 1], "k:", lw=.7)
ax.set(xlabel="False Positive Rate", ylabel="True Positive Rate (recall on fakes)",
       title="ROC — Celeb-DF-v2 cross-dataset (frame level)", xlim=(0, 1), ylim=(0, 1))
ax.legend(loc="lower right", fontsize=9); ax.grid(alpha=.3)
fig.tight_layout(); fig.savefig(FIG / "fig_3_7_roc.png", dpi=160, bbox_inches="tight"); plt.close(fig)
print("OK fig_3_7_roc.png")
