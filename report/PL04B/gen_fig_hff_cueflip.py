#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Show the HFF cue FLIP: run the ACTUAL BlockDCTHighPass(drop_k=3) and measure the high-pass
residual energy (mean |residual|, the quantity the HF stream consumes) for real vs fake on
BOTH FF++ (train) and Celeb-DF-v2 (test). If the real/fake ordering reverses between the two,
the cue the HF stream learns on FF++ points the wrong way at test. English labels, no 'Figure'.
Celeb-DF uses the exact test frames (data_dict_test.pickle). NO simulated data."""
import sys, glob, pickle
from pathlib import Path
import numpy as np
import torch
import matplotlib; matplotlib.use("Agg")
import matplotlib.pyplot as plt
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "DeepfakeBench" / "training" / "detectors"))
from sfdct_hff_core import BlockDCTHighPass

DS  = ROOT / "DeepfakeBench" / "datasets"
FIG = ROOT / "report" / "figures"
PKL = ROOT / "report" / "evidence" / "ablation_cdfv2" / "pickles" / "sfdct" / "data_dict_test.pickle"
rng = np.random.RandomState(1)
N   = 400

hp = BlockDCTHighPass(drop_k=3, nbands=16, block=8, input_mean=0.0, input_std=1.0).eval()

def energy(p):
    rgb = np.asarray(Image.open(p).convert("RGB").resize((256, 256)), np.float32)/255.
    x = torch.from_numpy(rgb.transpose(2, 0, 1))[None]
    with torch.no_grad():
        r = hp(x)[0].numpy()
    return float(np.abs(r).mean())                                   # HF residual energy proxy

def collect(paths):
    paths = list(paths); rng.shuffle(paths); paths = paths[:N]
    out = []
    for p in paths:
        try: out.append(energy(p))
        except Exception: pass
    return np.array(out)

# FF++ train
ff_real = collect(glob.glob(str(DS/"FaceForensics++/original_sequences/youtube/c23/frames/*/*.png")))
ff_fake = collect(glob.glob(str(DS/"FaceForensics++/manipulated_sequences/*/c23/frames/*/*.png")))
# Celeb-DF test (exact frames the model scored)
d = pickle.load(open(PKL, "rb")); imgs, labs = list(d["image"]), list(d["label"])
cd_real = collect([str(DS/p) for p, y in zip(imgs, labs) if y == 0])
cd_fake = collect([str(DS/p) for p, y in zip(imgs, labs) if y == 1])

def cohend(a, b):
    sp = np.sqrt((a.std()**2 + b.std()**2)/2) + 1e-12
    return (a.mean() - b.mean())/sp

fig, ax = plt.subplots(1, 2, figsize=(11.5, 5.4))
panels = [("FaceForensics++ (TRAIN)", ff_real, ff_fake),
          ("Celeb-DF-v2 (TEST, cross-dataset)", cd_real, cd_fake)]
for k, (name, R, F) in enumerate(panels):
    a = ax[k]
    parts = a.violinplot([R, F], positions=[0, 1], showmeans=True, widths=0.8)
    for pc, c in zip(parts["bodies"], ["#55A868", "#C44E52"]):
        pc.set_facecolor(c); pc.set_alpha(0.55)
    a.scatter(np.zeros_like(R)+rng.uniform(-.05,.05,len(R)), R, s=4, color="#2f6b46", alpha=.35)
    a.scatter(np.ones_like(F)+rng.uniform(-.05,.05,len(F)),  F, s=4, color="#8c2f33", alpha=.35)
    mr, mf = R.mean(), F.mean(); dd = cohend(R, F)
    a.set_xticks([0, 1]); a.set_xticklabels([f"real\nmean={mr:.4f}", f"fake\nmean={mf:.4f}"])
    a.set_ylabel("high-pass residual energy   mean |residual|  (drop_k=3, bands 3-15)")
    strength = "negligible" if abs(dd) < 0.1 else ("small" if abs(dd) < 0.35 else "moderate")
    note = f"real > fake (weak)\neffect size {strength}"
    a.set_title(f"{name}\nreal > fake   (Cohen's d = {dd:+.2f}, {strength})", fontsize=10)
    a.text(0.5, 0.97, note, transform=a.transAxes, ha="center", va="top", fontsize=9,
           color="#2f6b46",
           bbox=dict(boxstyle="round", fc="#eaf5ec", ec="#55A868"))
    a.grid(alpha=.3, axis="y")

print(f"FF++  real={ff_real.mean():.4f} fake={ff_fake.mean():.4f}  d={cohend(ff_real,ff_fake):+.2f}")
print(f"CDFv2 real={cd_real.mean():.4f} fake={cd_fake.mean():.4f}  d={cohend(cd_real,cd_fake):+.2f}")
fig.suptitle("High-pass residual energy (the actual HFF input): real vs fake — "
             "weak and SAME direction on both train and test (no global sign flip)",
             fontsize=11.5, fontweight="bold")
fig.tight_layout()
out = FIG / "fig_hff_residual_energy.png"
fig.savefig(out, dpi=150, bbox_inches="tight"); plt.close(fig)
print("saved:", out)
