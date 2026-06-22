#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Figure 3.4 v2 — Training dynamics: in-distribution (FF++) vs cross-dataset (Celeb-DF-v2).
3 hàng (B4 · SFDCT · SFDCT-HFF). Trái: train loss/iter. Phải: AUC per test-event với HAI đường
FF++ test (in-distribution) + Celeb-DF test (cross-dataset) + sàn B4. Số THẬT parse từ log;
HFF-R3 chỉ còn 11 giá trị Celeb cuối-epoch (log gốc mất) -> ghi rõ, KHÔNG bịa FF++."""
import re
from pathlib import Path
import numpy as np
import matplotlib; matplotlib.use("Agg")
import matplotlib.pyplot as plt

ROOT = Path(__file__).resolve().parents[2]
LOGS = ROOT / "report" / "evidence" / "ablation_cdfv2" / "logs"
FIG  = ROOT / "report" / "figures"
B4_FLOOR = 0.7497

RE_LOSS = re.compile(r"Iter:\s*(\d+)\s+training-loss, overall:\s*([0-9.]+)")
RE_FF   = re.compile(r"dataset:\s*FaceForensics\+\+.*?testing-metric, auc:\s*([0-9.]+)")
RE_CD   = re.compile(r"dataset:\s*Celeb-DF-v2.*?testing-metric, auc:\s*([0-9.]+)")

def parse_log(p):
    t = Path(p).read_text(errors="ignore")
    loss = [(int(m.group(1)), float(m.group(2))) for m in RE_LOSS.finditer(t)]
    ff = [float(m.group(1)) for m in RE_FF.finditer(t)]
    cd = [float(m.group(1)) for m in RE_CD.finditer(t)]
    return loss, ff, cd

def parse_hff(p):
    t = Path(p).read_text(errors="ignore")
    cd = [float(m.group(2)) for m in re.finditer(r"epoch\s+(\d+)\s*=\s*([0-9.]+)", t)]
    return cd

# ---- data ----
b4_loss, b4_ff, b4_cd       = parse_log(LOGS / "b4.training.log")
sf_loss, sf_ff, sf_cd       = parse_log(LOGS / "sfdct.training.log")
hff_cd                      = parse_hff(LOGS / "hff_r3.console_capture.txt")
print(f"B4:    loss={len(b4_loss)} ff={len(b4_ff)} cd={len(b4_cd)}  (ff best {max(b4_ff):.4f}, cd best {max(b4_cd):.4f})")
print(f"SFDCT: loss={len(sf_loss)} ff={len(sf_ff)} cd={len(sf_cd)}  (ff best {max(sf_ff):.4f}, cd best {max(sf_cd):.4f})")
print(f"HFF:   cd={len(hff_cd)}  (cd best {max(hff_cd):.4f}) — FF++/loss per-epoch n/a")

C_FF, C_CD = "#2471a3", "#e8732b"          # FF++ in-dist = xanh, Celeb cross = cam
# Chỉ B4 + SFDCT (đủ data per-epoch). HFF-R3 mất log gốc -> để số best ở Bảng 3.5/3.8, KHÔNG bịa.
rows = [("EfficientNet-B4 (baseline)", b4_loss, b4_ff, b4_cd),
        ("SFDCT", sf_loss, sf_ff, sf_cd)]

fig, ax = plt.subplots(2, 2, figsize=(13.5, 7.6), gridspec_kw={"width_ratios": [1, 1.25]})

for r, (name, loss, ff, cd) in enumerate(rows):
    aL, aR = ax[r, 0], ax[r, 1]
    # ---- LEFT: train loss ----
    if loss:
        it = [i for i, _ in loss]; lv = [v for _, v in loss]
        aL.plot(it, lv, color="#555555", lw=1.1)
        aL.set_xlabel("iteration"); aL.set_ylabel("train loss (FF++)")
        aL.set_title(f"{name} — training loss", fontsize=10)
        aL.grid(alpha=.3)
    else:
        aL.text(0.5, 0.5, "Per-epoch training loss\nnot available\n(instance log lost)",
                ha="center", va="center", fontsize=10, color="#999999",
                transform=aL.transAxes, style="italic")
        aL.set_title(f"{name} — training loss", fontsize=10); aL.axis("off")

    # ---- RIGHT: AUC FF++ vs Celeb ----
    aR.axhline(B4_FLOOR, ls=":", color="#888888", lw=1, label=f"B4 cross-dataset floor {B4_FLOOR:.4f}")
    if ff:
        xf = np.arange(1, len(ff) + 1)
        aR.plot(xf, ff, "-o", ms=3.5, color=C_FF, label="FF++ test (in-distribution)")
    if cd:
        xc = np.arange(1, len(cd) + 1)
        aR.plot(xc, cd, "-s", ms=3.5, color=C_CD, label="Celeb-DF-v2 test (cross-dataset)")
        aR.annotate(f"best {max(cd):.4f}", xy=(1 + int(np.argmax(cd)), max(cd)),
                    fontsize=8, color=C_CD, xytext=(3, 6), textcoords="offset points")
    aR.set_ylim(0.62, 1.0)
    aR.set_xlabel("test checkpoint  (≈ 2 per epoch)" if ff else "epoch")
    aR.set_ylabel("test AUC")
    aR.set_title(f"{name} — test AUC: in-distribution vs cross-dataset", fontsize=10)
    aR.grid(alpha=.3); aR.legend(fontsize=8, loc="center right")
    if not ff:
        aR.text(0.5, 0.90, "FF++ in-distribution per-epoch not available (log lost)",
                ha="center", fontsize=8.5, color="#999999", style="italic", transform=aR.transAxes)

fig.suptitle("Training dynamics — in-distribution (FaceForensics++) vs cross-dataset (Celeb-DF-v2)",
             fontsize=14, fontweight="bold")
fig.text(0.5, 0.02,
         "In-distribution FF++ test stays high and stable (~0.95); only the cross-dataset AUC oscillates — "
         "the wobble is a generalisation gap, not failed optimisation.",
         ha="center", fontsize=9.5, style="italic", color="#444444")
fig.text(0.5, -0.01,
         "(SFDCT-HFF: per-epoch log not saved; its best AUC is reported in the comparison table.)",
         ha="center", fontsize=8.5, style="italic", color="#999999")
fig.tight_layout(rect=[0, 0.03, 1, 0.95])
out = FIG / "fig_3_4_v2_train_dynamics.png"
fig.savefig(out, dpi=150, bbox_inches="tight"); plt.close(fig)
print("saved:", out)
