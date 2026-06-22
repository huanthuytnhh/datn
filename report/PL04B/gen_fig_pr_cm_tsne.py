#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""3.11 PR · 3.12 confusion (4 ngưỡng: default 0.5 + EER + FPR10% + FPR5%) · 3.13 t-SNE · 3.14 Grad-CAM.
Số/feature THẬT: pickle best-ckpt (pred/label) + viz_out npz (feat 1792) + viz_out gradcam.png.
KHÔNG số 'Figure' trong ảnh. Ghi đè đúng tên file MD đang trỏ."""
import pickle, shutil
from pathlib import Path
import numpy as np
import matplotlib; matplotlib.use("Agg")
import matplotlib.pyplot as plt
from sklearn.metrics import precision_recall_curve, roc_curve, average_precision_score
from sklearn.decomposition import PCA
from sklearn.manifold import TSNE

ROOT = Path(__file__).resolve().parents[2]
EV = ROOT / "report" / "evidence" / "ablation_cdfv2" / "pickles"
VIZ = ROOT / "DeepfakeBench" / "viz_out"
FIG = ROOT / "report" / "figures"

def load(tag):
    mm = pickle.load(open(EV / tag / "metric_dict_best.pickle", "rb"))
    return np.asarray(mm["pred"], float), np.asarray(mm["label"], int)

# ---------- 3.11 Precision–Recall ----------
fig, ax = plt.subplots(figsize=(6.6, 5.4))
for tag, name, color in [("b4", "B4 (baseline)", "#4C72B0"), ("sfdct", "SFDCT", "#DD8452"),
                         ("hff_r3", "SFDCT-HFF (full)", "#DA8BC3")]:
    p, y = load(tag); prec, rec, _ = precision_recall_curve(y, p); ap = average_precision_score(y, p)
    ax.plot(rec, prec, color=color, lw=1.8, label=f"{name} — AP {ap:.4f}")
ax.axhline((load("sfdct")[1] == 1).mean(), color="gray", ls=":", lw=1, label=f"chance (prevalence {(load('sfdct')[1]==1).mean():.2f})")
ax.set(xlabel="Recall (fakes caught)", ylabel="Precision", title="Precision–Recall — Celeb-DF-v2 (fake = positive)",
       xlim=(0, 1), ylim=(0, 1.02))
ax.legend(loc="lower left", fontsize=9); ax.grid(alpha=.3)
fig.tight_layout(); fig.savefig(FIG / "fig_3_8_pr_curve.png", dpi=160, bbox_inches="tight"); plt.close(fig)
print("OK fig_3_8_pr_curve.png")

# ---------- 3.12 Confusion @ 4 operating points (SFDCT) ----------
p, y = load("sfdct")
real = p[y == 0]
tau_eer = roc_curve(y, p)[2][np.argmin(np.abs(roc_curve(y, p)[0] - (1 - roc_curve(y, p)[1])))]
points = [("default  τ=0.50", 0.50),
          (f"EER  τ={tau_eer:.3f}", tau_eer),
          (f"FPR≤10%  τ={np.quantile(real,0.90):.3f}", np.quantile(real, 0.90)),
          (f"FPR≤5%  τ={np.quantile(real,0.95):.3f}", np.quantile(real, 0.95))]
fig, axes = plt.subplots(1, 4, figsize=(15.5, 4.3))
for (name, tau), ax in zip(points, axes):
    pp = (p >= tau).astype(int)
    TN = int(((pp == 0) & (y == 0)).sum()); FP = int(((pp == 1) & (y == 0)).sum())
    FN = int(((pp == 0) & (y == 1)).sum()); TP = int(((pp == 1) & (y == 1)).sum())
    cm = np.array([[TN, FP], [FN, TP]])
    fpr = FP / (FP + TN); rec = TP / (TP + FN); acc = (TP + TN) / cm.sum()
    ax.imshow(cm, cmap="Blues")
    cells = [[("accepted", TN), ("flagged", FP)], [("missed", FN), ("caught", TP)]]
    for i in range(2):
        for j in range(2):
            lab, v = cells[i][j]
            ax.text(j, i - .12, f"{v:,}", ha="center", va="center", fontsize=12, fontweight="bold",
                    color="white" if cm[i, j] > cm.max() * .5 else "black")
            ax.text(j, i + .22, lab, ha="center", va="center", fontsize=8,
                    color="white" if cm[i, j] > cm.max() * .5 else "#444")
    ax.set_xticks([0, 1]); ax.set_xticklabels(["pred real", "pred fake"], fontsize=8)
    ax.set_yticks([0, 1]); ax.set_yticklabels(["actual real", "actual fake"], fontsize=8)
    ax.set_title(f"{name}\nFPR {fpr*100:.1f}%  ·  recall {rec*100:.1f}%  ·  acc {acc*100:.1f}%", fontsize=9)
fig.suptitle("Confusion matrices of SFDCT at different operating points — Celeb-DF-v2 (real 5,620 · fake 10,800 frames)",
             fontsize=12, fontweight="bold")
fig.tight_layout(); fig.savefig(FIG / "fig_3_9_confusion.png", dpi=160, bbox_inches="tight"); plt.close(fig)
print("OK fig_3_9_confusion.png  (τ: 0.50 / EER %.3f / FPR10 %.3f / FPR5 %.3f)" % (tau_eer, np.quantile(real,.90), np.quantile(real,.95)))

# ---------- 3.13 t-SNE (SFDCT features, balanced subsample) ----------
z = np.load(VIZ / "naive_local" / "scores_Celeb-DF-v2.npz")
feat, lab = z["feat"], z["label"]
rng = np.random.RandomState(0)
ir = rng.choice(np.where(lab == 0)[0], 1500, replace=False)
iff = rng.choice(np.where(lab == 1)[0], 1500, replace=False)
idx = np.concatenate([ir, iff])
X = PCA(n_components=50, random_state=0).fit_transform(feat[idx])
emb = TSNE(n_components=2, init="pca", perplexity=30, random_state=0).fit_transform(X)
L = lab[idx]
fig, ax = plt.subplots(figsize=(6.6, 5.8))
ax.scatter(emb[L == 0, 0], emb[L == 0, 1], s=8, c="#55A868", alpha=.6, label="real")
ax.scatter(emb[L == 1, 0], emb[L == 1, 1], s=8, c="#C44E52", alpha=.6, label="fake")
ax.set(title="t-SNE of SFDCT fused features — Celeb-DF-v2 (1,500 real + 1,500 fake)", xticks=[], yticks=[])
ax.legend(markerscale=2, fontsize=10)
fig.tight_layout(); fig.savefig(FIG / "fig_3_10_tsne.png", dpi=160, bbox_inches="tight"); plt.close(fig)
print("OK fig_3_10_tsne.png")

# ---------- 3.14 Grad-CAM (dùng lại bản render thật từ viz_out) ----------
shutil.copy(VIZ / "naive_local" / "gradcam.png", FIG / "fig_3_12_gradcam.png")
print("OK fig_3_12_gradcam.png (copy từ viz_out/naive_local/gradcam.png)")
