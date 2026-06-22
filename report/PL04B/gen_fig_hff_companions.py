#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Bản SFDCT-HFF cho 2 hình model-specific: confusion (3.12.2) + example predictions (3.15.2).
Số THẬT từ pickle hff_r3 (model 0.7695) + frames CDFv2 local. KHÔNG số 'Figure' trong ảnh."""
import pickle
from pathlib import Path
import numpy as np
import matplotlib; matplotlib.use("Agg")
import matplotlib.pyplot as plt
from PIL import Image
from sklearn.metrics import roc_curve

ROOT = Path(__file__).resolve().parents[2]
EV = ROOT / "report" / "evidence" / "ablation_cdfv2" / "pickles" / "hff_r3"
DS = ROOT / "DeepfakeBench" / "datasets"
FIG = ROOT / "report" / "figures"

p = np.asarray(pickle.load(open(EV / "metric_dict_best.pickle", "rb"))["pred"], float)
dd = pickle.load(open(EV / "data_dict_test.pickle", "rb"))
imgs = np.asarray(dd["image"]); y = np.asarray(dd["label"], int)

# ---------- 3.12.2 confusion HFF @ 4 ngưỡng ----------
real = p[y == 0]
fpr, tpr, th = roc_curve(y, p); tau_eer = th[np.argmin(np.abs(fpr - (1 - tpr)))]
points = [("default  τ=0.50", 0.50), (f"EER  τ={tau_eer:.3f}", tau_eer),
          (f"FPR≤10%  τ={np.quantile(real,.9):.3f}", np.quantile(real, .9)),
          (f"FPR≤5%  τ={np.quantile(real,.95):.3f}", np.quantile(real, .95))]
fig, axes = plt.subplots(1, 4, figsize=(15.5, 4.3))
for (name, tau), ax in zip(points, axes):
    pp = (p >= tau).astype(int)
    TN = int(((pp == 0) & (y == 0)).sum()); FP = int(((pp == 1) & (y == 0)).sum())
    FN = int(((pp == 0) & (y == 1)).sum()); TP = int(((pp == 1) & (y == 1)).sum())
    cm = np.array([[TN, FP], [FN, TP]]); fpr_ = FP/(FP+TN); rec = TP/(TP+FN); acc = (TP+TN)/cm.sum()
    ax.imshow(cm, cmap="Purples")
    cells = [[("accepted", TN), ("flagged", FP)], [("missed", FN), ("caught", TP)]]
    for i in range(2):
        for j in range(2):
            lab, v = cells[i][j]
            col = "white" if cm[i, j] > cm.max()*.5 else "black"
            ax.text(j, i-.12, f"{v:,}", ha="center", va="center", fontsize=12, fontweight="bold", color=col)
            ax.text(j, i+.22, lab, ha="center", va="center", fontsize=8, color=col)
    ax.set_xticks([0, 1]); ax.set_xticklabels(["pred real", "pred fake"], fontsize=8)
    ax.set_yticks([0, 1]); ax.set_yticklabels(["actual real", "actual fake"], fontsize=8)
    ax.set_title(f"{name}\nFPR {fpr_*100:.1f}%  ·  recall {rec*100:.1f}%  ·  acc {acc*100:.1f}%", fontsize=9)
fig.suptitle("Confusion matrices of SFDCT-HFF at different operating points — Celeb-DF-v2 (real 5,620 · fake 10,800 frames)",
             fontsize=12, fontweight="bold")
fig.tight_layout(); fig.savefig(FIG / "fig_3_12_2_confusion_hff.png", dpi=160, bbox_inches="tight"); plt.close(fig)
print(f"OK fig_3_12_2_confusion_hff.png  (FPR5% recall = {points[3]}; caught@5%={int(((p>=np.quantile(real,.95))&(y==1)).sum())})")

# ---------- 3.15.2 example predictions HFF ----------
ok = np.array([(DS / str(imgs[i])).exists() for i in range(len(imgs))])
TAU = 0.5
def pick(mask, n, hi):
    c = np.where(mask & ok)[0]; c = c[np.argsort(p[c])[::-1 if hi else 1]]; return list(c[:n])
sel = pick(y == 1, 2, True) + pick(y == 0, 2, False) + pick(y == 0, 2, True) + pick(y == 1, 2, False)
fig, axes = plt.subplots(2, 4, figsize=(12, 7.6))
for k, i in enumerate(sel):
    a = axes.ravel()[k]; a.imshow(Image.open(DS / str(imgs[i])).convert("RGB").resize((224, 224))); a.axis("off")
    true = "FAKE" if y[i] == 1 else "REAL"; verdict = "fake" if p[i] >= TAU else "real"
    correct = (p[i] >= TAU) == (y[i] == 1)
    a.set_title(f"p(fake)={p[i]:.2f} → {verdict}\ntrue: {true}  {'✓' if correct else '✗'}",
                fontsize=10, color=("#1a7f37" if correct else "#c4314b"), fontweight="bold")
fig.suptitle("Example SFDCT-HFF predictions on Celeb-DF-v2 test faces (verdict at τ = 0.5; green ✓ correct, red ✗ wrong)",
             fontsize=12, fontweight="bold")
fig.subplots_adjust(left=.02, right=.98, top=.88, bottom=.02, hspace=.55, wspace=.1)
fig.savefig(FIG / "fig_3_15_2_predictions_hff.png", dpi=160, bbox_inches="tight"); plt.close(fig)
print("OK fig_3_15_2_predictions_hff.png  (paths ok:", int(ok.sum()), ")")
