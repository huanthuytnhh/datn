#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Figure 3.4 / 3.6 / 3.8 — model summary CHI TIẾT (torchinfo) cho B4 / SFDCT / SFDCT-HFF.
Load kiến trúc thật qua DETECTOR (backbone pretrained local), chạy torchinfo (output shape + params
+ mult-adds, depth 3) rồi render thành ảnh monospace. KHÔNG để số "Figure" trong ảnh (caption lo)."""
import os, sys
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ROOT = os.path.dirname(ROOT)                         # .../datn
DFB = os.path.join(ROOT, "DeepfakeBench")
FIGABS = os.path.join(ROOT, "report", "figures")
os.chdir(DFB)
sys.path.insert(0, os.path.join(DFB, "training"))
import cv2  # noqa
import yaml, torch
from torchinfo import summary
import matplotlib; matplotlib.use("Agg")
import matplotlib.pyplot as plt
from detectors import DETECTOR

MODELS = [
    ("EfficientNet-B4 (baseline)", "training/config/detector/efficientnetb4.yaml", "fig_3_4_summary_b4.png"),
    ("SFDCT", "training/config/detector/efficientnetb4_sfdct.yaml", "fig_3_6_summary_sfdct.png"),
    ("SFDCT-HFF (full)", "training/config/detector/efficientnetb4_hff.yaml", "fig_3_8_summary_hff.png"),
]

def build(cfg_path):
    cfg = yaml.safe_load(open(cfg_path))
    cfg.setdefault("backbone_config", {"num_classes": 2, "inc": 3, "dropout": False, "mode": "Original"})
    cfg.setdefault("pretrained", "training/pretrained/efficientnet-b4-6ed6700e.pth")
    return DETECTOR[cfg["model_name"]](cfg).eval()

def render_text(s, title, out):
    lines = s.split("\n")
    width = max(len(l) for l in lines)
    fig_w = min(15, max(9, width * 0.083))
    fig_h = 0.8 + 0.155 * len(lines)
    fig, ax = plt.subplots(figsize=(fig_w, fig_h)); ax.axis("off")
    ax.text(0.0, 1.0, s, family="monospace", fontsize=7, va="top", ha="left", transform=ax.transAxes)
    ax.set_title(title, fontsize=12, fontweight="bold", loc="left")
    fig.savefig(os.path.join(FIGABS, out), dpi=170, bbox_inches="tight"); plt.close(fig)

x = torch.randn(1, 3, 256, 256)
for title, cfg, out in MODELS:
    try:
        m = build(cfg)
        info = summary(m, input_data=({"image": x},), depth=3,
                       col_names=["output_size", "num_params", "params_percent", "mult_adds"],
                       row_settings=["var_names"], verbose=0)
        s = str(info)
        render_text(s, f"Model summary — {title}", out)
        nlines = len(s.split("\n"))
        print(f"OK {title}: total={info.total_params/1e6:.2f}M, {nlines} dòng -> {out}")
    except Exception as e:
        import traceback; traceback.print_exc()
        print(f"FAIL {title}: {type(e).__name__}: {e}")
