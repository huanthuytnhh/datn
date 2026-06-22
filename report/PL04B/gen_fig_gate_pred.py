#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""3.16 Gate α distribution (SFDCT) · 3.15 Example predictions on test faces.
Số/ảnh THẬT: checkpoint serving/naive_sfdct (fusion.alpha) + pickle pred/label + frames CDFv2 local.
KHÔNG số 'Figure' trong ảnh."""
import pickle
from pathlib import Path
import numpy as np
import torch
import matplotlib; matplotlib.use("Agg")
import matplotlib.pyplot as plt
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
EV = ROOT / "report" / "evidence" / "ablation_cdfv2" / "pickles" / "sfdct"
DS = ROOT / "DeepfakeBench" / "datasets"
FIG = ROOT / "report" / "figures"

# ---------- 3.16 gate α ----------
sd = torch.load(ROOT / "serving" / "naive_sfdct" / "ckpt_best.pth", map_location="cpu")
sd = sd.get("state_dict", sd)
alpha = sd["fusion.alpha"].float().flatten().numpy()
fig, (axL, axR) = plt.subplots(1, 2, figsize=(11.5, 4.4))
# trái: zoom ±0.003 (~±2.3σ) thấy hình dạng đỉnh; phải: full range + log-y thấy cả đuôi
zl = 0.003
axL.hist(alpha, bins=np.linspace(-zl, zl, 61), color="#DD8452", edgecolor="white", linewidth=.3)
axL.set_xlim(-zl, zl); axL.axvline(0, color="k", ls=":", lw=1.4)
axL.set(xlabel="α (per channel)", ylabel="number of channels", title="Zoom ±0.003 (≈ ±2.3σ) — shape of the peak")
axL.grid(alpha=.3, axis="y")
lim = np.abs(alpha).max() * 1.08
axR.hist(alpha, bins=np.linspace(-lim, lim, 81), color="#DD8452", edgecolor="white", linewidth=.3)
axR.set_xlim(-lim, lim); axR.set_yscale("log"); axR.set_ylim(0.7, None)
axR.axvline(0, color="k", ls=":", lw=1.4, label="zero init (α = 0)")
axR.set(xlabel="α (per channel)", ylabel="number of channels (log)", title="Full range, log-y — the few channels that opened")
axR.legend(fontsize=8); axR.grid(alpha=.3, axis="y")
axR.text(0.97, 0.95, f"channels = {alpha.size}\nmean = {alpha.mean():+.4f}\nstd = {alpha.std():.4f}\nmax|α| = {np.abs(alpha).max():.4f}",
         transform=axR.transAxes, ha="right", va="top", fontsize=8.5, bbox=dict(boxstyle="round", fc="#F2F2F2", ec="#CCC"))
fig.suptitle("Distribution of the fusion gate α after training — SFDCT (gate stays ≈ 0 → frequency contributes little, floor preserved)",
             fontsize=11, fontweight="bold")
fig.tight_layout(); fig.savefig(FIG / "fig_3_13_gate_alpha.png", dpi=160, bbox_inches="tight"); plt.close(fig)
print(f"OK fig_3_13_gate_alpha.png: mean={alpha.mean():+.4f} std={alpha.std():.4f} max|α|={np.abs(alpha).max():.4f}")

# ---------- 3.15 example predictions ----------
mm = pickle.load(open(EV / "metric_dict_best.pickle", "rb"))
dd = pickle.load(open(EV / "data_dict_test.pickle", "rb"))
pred = np.asarray(mm["pred"], float); imgs = np.asarray(dd["image"]); lab = np.asarray(dd["label"], int)
def lp(i): return DS / str(imgs[i])
ok = np.array([lp(i).exists() for i in range(len(imgs))])
print(f"  paths resolve local: {ok.sum()}/{len(ok)}")
TAU = 0.5
def pick(mask, n, by_high):
    cand = np.where(mask & ok)[0]
    cand = cand[np.argsort(pred[cand])[::-1 if by_high else 1]]
    return list(cand[:n])
sel = (pick((lab == 1), 2, True) +      # TP: fake, high pred
       pick((lab == 0), 2, False) +     # TN: real, low pred
       pick((lab == 0), 2, True) +      # FP: real, high pred (flagged)
       pick((lab == 1), 2, False))      # FN: fake, low pred (missed)
fig, axes = plt.subplots(2, 4, figsize=(12, 7.6))
for k, i in enumerate(sel):
    a = axes.ravel()[k]
    a.imshow(Image.open(lp(i)).convert("RGB").resize((224, 224))); a.axis("off")
    true = "FAKE" if lab[i] == 1 else "REAL"
    verdict = "fake" if pred[i] >= TAU else "real"
    correct = (pred[i] >= TAU) == (lab[i] == 1)
    a.set_title(f"p(fake)={pred[i]:.2f} → {verdict}\ntrue: {true}  {'✓' if correct else '✗'}",
                fontsize=10, color=("#1a7f37" if correct else "#c4314b"), fontweight="bold")
fig.suptitle("Example SFDCT predictions on Celeb-DF-v2 test faces (verdict at τ = 0.5; green ✓ correct, red ✗ wrong)",
             fontsize=12, fontweight="bold")
fig.subplots_adjust(left=.02, right=.98, top=.88, bottom=.02, hspace=.55, wspace=.1)
fig.savefig(FIG / "fig_3_15_predictions.png", dpi=160, bbox_inches="tight"); plt.close(fig)
print("OK fig_3_15_predictions.png  (sel idx:", sel, ")")
