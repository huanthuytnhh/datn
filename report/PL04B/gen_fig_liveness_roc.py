#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""3.20 / 3.23 — ROC + score distribution cho B4-liveness và B4+DCT-liveness.
CHẠY model thật trên 7580 ảnh LCC-FASD eval (verify AUC khớp metrics.json 0.9829 / 0.9776).
positive = spoof. KHÔNG số 'Figure' trong ảnh. Ghi file mới fig_3_20_*/fig_3_23_*."""
import os, sys, json
from pathlib import Path
import numpy as np, cv2, torch
import matplotlib; matplotlib.use("Agg"); import matplotlib.pyplot as plt
from sklearn.metrics import roc_curve, auc as sk_auc

ROOT = Path(__file__).resolve().parents[2]
LIV = ROOT / "DeepfakeBench" / "liveness"; FIG = ROOT / "report" / "figures"
sys.path.insert(0, str(LIV))
from model_liveness import B4Liveness, RESOLUTION, NORM_MEAN, NORM_STD
from model_dct_liveness import B4DCTLiveness
from dataset_liveness import list_split_liveness

items = list_split_liveness(str(LIV / "_data/LCC_FASD/LCC_FASD_evaluation"))
mean = torch.tensor(NORM_MEAN).view(1, 3, 1, 1); std = torch.tensor(NORM_STD).view(1, 3, 1, 1)
print(f"eval items = {len(items)}")

def run(model):
    model.eval(); probs, labs = [], []
    with torch.no_grad():
        for i in range(0, len(items), 32):
            xs = []
            for p, l in items[i:i+32]:
                im = cv2.cvtColor(cv2.imread(p), cv2.COLOR_BGR2RGB)
                im = cv2.resize(im, (RESOLUTION, RESOLUTION), interpolation=cv2.INTER_CUBIC)
                xs.append(torch.from_numpy(im).permute(2, 0, 1).float() / 255.); labs.append(l)
            x = (torch.stack(xs) - mean) / std
            logits = model.classifier(model.features(x))
            probs.extend(torch.softmax(logits, 1)[:, 1].numpy())
    return np.array(probs), np.array(labs)

def fig_roc(name, probs, labs, tau, ref_auc, out):
    fpr, tpr, _ = roc_curve(labs, probs); a = sk_auc(fpr, tpr)
    fnr = 1 - tpr; eer = fpr[np.argmin(np.abs(fpr - fnr))]
    # điểm vận hành @tau
    pp = (probs >= tau).astype(int)
    op_fpr = ((pp == 1) & (labs == 0)).mean() * 0 + (((pp == 1) & (labs == 0)).sum() / max((labs == 0).sum(), 1))
    op_tpr = ((pp == 1) & (labs == 1)).sum() / max((labs == 1).sum(), 1)
    fig, (aR, aH) = plt.subplots(1, 2, figsize=(11, 4.6))
    aR.plot(fpr, tpr, color="#4C72B0", lw=1.8, label=f"ROC — AUC {a:.4f}")
    aR.plot([0, 1], [0, 1], "k:", lw=.7); aR.plot(op_fpr, op_tpr, "o", ms=9, color="#C44E52", label=f"op @τ={tau:.3f}")
    aR.set(xlabel="FPR (live as spoof = BPCER)", ylabel="TPR (spoof caught = 1-APCER)",
           title=f"ROC — {name}  (EER≈{eer*100:.1f}%)", xlim=(0, 1), ylim=(0, 1))
    aR.legend(loc="lower right", fontsize=9); aR.grid(alpha=.3)
    aH.hist(probs[labs == 0], bins=40, density=True, alpha=.6, color="#55A868", label="live")
    aH.hist(probs[labs == 1], bins=40, density=True, alpha=.6, color="#C44E52", label="spoof")
    aH.axvline(tau, color="k", ls="--", lw=1.2, label=f"threshold {tau:.3f}")
    aH.set(xlabel="P(spoof)", ylabel="density", title="Score distribution (live vs spoof)")
    aH.legend(fontsize=9); aH.grid(alpha=.3, axis="y")
    fig.suptitle(f"{name} on LCC-FASD evaluation (n={len(labs)}, {int((labs==0).sum())} live / {int((labs==1).sum())} spoof)",
                 fontsize=12, fontweight="bold")
    fig.tight_layout(rect=[0, 0, 1, 0.95]); fig.savefig(FIG / out, dpi=160, bbox_inches="tight"); plt.close(fig)
    ok = "✓" if abs(a - ref_auc) < 1e-3 else "✗ (lệch ref!)"
    print(f"OK {out}: AUC={a:.4f} (ref {ref_auc:.4f}) {ok}")

# B4-liveness (3.20)
m = B4Liveness(use_pretrained=False)
sd = torch.load(ROOT / "serving/liveness_b4/ckpt_best.pth", map_location="cpu"); sd = sd.get("state_dict", sd)
m.load_state_dict(sd, strict=False)
ref = json.load(open(ROOT / "serving/liveness_b4/metrics.json"))
pr, lb = run(m); fig_roc("B4-liveness", pr, lb, ref["threshold@dev_eer"], ref["auc"], "fig_3_20_roc_b4_liveness.png")

# B4+DCT-liveness (3.23)
md = B4DCTLiveness(use_pretrained=False)
sd2 = torch.load(ROOT / "liveness_pulled/runs/liveness-20260606-100514/b4dct/ckpt_best_liveness.pth", map_location="cpu"); sd2 = sd2.get("state_dict", sd2)
miss, unexp = md.load_state_dict(sd2, strict=False); print(f"  b4dct load: missing={len(miss)} unexpected={len(unexp)}")
ref2 = json.load(open(ROOT / "liveness_pulled/runs/liveness-20260606-100514/b4dct/metrics_liveness.json"))
pr2, lb2 = run(md); fig_roc("B4+DCT-liveness", pr2, lb2, ref2["threshold@dev_eer"], ref2["auc"], "fig_3_23_roc_b4dct_liveness.png")
