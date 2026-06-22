#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Distribution Analysis in Training and Test Sets — Plotly 2x3 (theo mẫu HarmonySeeker
interactive_chord_distribution.html). Số THẬT: FaceForensics++.json (train videos) +
pickle SFDCT (Celeb-DF-v2 test frames). Xuất HTML tương tác (CDN) + PNG tĩnh (không số 'Figure').

Lưới giống reference:
  Hàng 1: pie Train · pie Test · grouped-bar Real/Fake (Train vs Test)
  Hàng 2: bar FF++ forgery methods · bar Celeb test frames · radar dataset-profile
"""
import json, pickle
from pathlib import Path
import numpy as np
import plotly.graph_objects as go
from plotly.subplots import make_subplots

ROOT = Path(__file__).resolve().parents[2]
DFB  = ROOT / "DeepfakeBench"
FIG  = ROOT / "report" / "figures"
FFJSON = DFB / "preprocessing" / "dataset_json" / "FaceForensics++.json"
SFDCT_PKL = ROOT / "report" / "evidence" / "ablation_cdfv2" / "pickles" / "sfdct" / "metric_dict_best.pickle"

C_TRAIN, C_TEST = "#3498db", "#2ecc71"          # xanh dương = Train, xanh lá = Test (như reference)
C_REAL,  C_FAKE = "#2ecc71", "#e74c3c"          # real = xanh lá, fake = đỏ

# ---------------- số liệu THẬT ----------------
jp = json.load(open(FFJSON))["FaceForensics++"]
ff_real = len(jp["FF-real"]["train"]["c23"])
methods = [("Deepfakes", "FF-DF"), ("Face2Face", "FF-F2F"), ("FaceSwap", "FF-FS"), ("NeuralTextures", "FF-NT")]
ff_meth = [len(jp[k]["train"]["c23"]) for _, k in methods]
ff_fake = sum(ff_meth)
ff_tot  = ff_real + ff_fake

y = np.asarray(pickle.load(open(SFDCT_PKL, "rb"))["label"], int)
cd_real, cd_fake = int((y == 0).sum()), int((y == 1).sum())
cd_tot = cd_real + cd_fake

tr_real_pct, tr_fake_pct = 100*ff_real/ff_tot, 100*ff_fake/ff_tot
te_real_pct, te_fake_pct = 100*cd_real/cd_tot, 100*cd_fake/cd_tot
print(f"Train FF++ videos: real={ff_real} fake={ff_fake} ({tr_real_pct:.1f}/{tr_fake_pct:.1f})")
print(f"Test  Celeb frames: real={cd_real} fake={cd_fake} ({te_real_pct:.1f}/{te_fake_pct:.1f})")

# ---------------- figure ----------------
fig = make_subplots(
    rows=2, cols=3,
    specs=[[{"type": "domain"}, {"type": "domain"}, {"type": "xy"}],
           [{"type": "xy"}, {"type": "xy"}, {"type": "polar"}]],
    subplot_titles=("FaceForensics++ — Training (videos)",
                    "Celeb-DF-v2 — Test (frames)",
                    "Real vs Fake share — Train vs Test",
                    "FF++ forgery methods (train videos)",
                    "Celeb-DF-v2 test frames",
                    "Dataset distribution profile"),
    vertical_spacing=0.16, horizontal_spacing=0.08)

# (1) pie Train real/fake
fig.add_trace(go.Pie(labels=["Real", "Fake"], values=[ff_real, ff_fake], pull=[0.05, 0],
                     marker=dict(colors=[C_REAL, C_FAKE]), textinfo="label+percent",
                     hoverinfo="label+value+percent", name="Training", sort=False,
                     showlegend=False), 1, 1)
# (2) pie Test real/fake
fig.add_trace(go.Pie(labels=["Real", "Fake"], values=[cd_real, cd_fake], pull=[0.05, 0],
                     marker=dict(colors=[C_REAL, C_FAKE]), textinfo="label+percent",
                     hoverinfo="label+value+percent", name="Test", sort=False,
                     showlegend=False), 1, 2)
# (3) grouped bar real/fake share, Train vs Test
fig.add_trace(go.Bar(x=["Real", "Fake"], y=[tr_real_pct, tr_fake_pct], name="Training",
                     legendgroup="train", marker_color=C_TRAIN, opacity=0.85,
                     text=[f"{tr_real_pct:.1f}", f"{tr_fake_pct:.1f}"], texttemplate="%{text}%",
                     hovertemplate="%{x}: %{y:.1f}%<extra>Training</extra>"), 1, 3)
fig.add_trace(go.Bar(x=["Real", "Fake"], y=[te_real_pct, te_fake_pct], name="Test",
                     legendgroup="test", marker_color=C_TEST, opacity=0.85,
                     text=[f"{te_real_pct:.1f}", f"{te_fake_pct:.1f}"], texttemplate="%{text}%",
                     hovertemplate="%{x}: %{y:.1f}%<extra>Test</extra>"), 1, 3)
# (4) bar FF++ forgery methods
fig.add_trace(go.Bar(x=[m for m, _ in methods], y=ff_meth, marker_color=C_TRAIN, opacity=0.85,
                     text=ff_meth, texttemplate="%{text}", showlegend=False,
                     hovertemplate="%{x}: %{y} videos<extra>Training</extra>"), 2, 1)
# (5) bar Celeb test frames real/fake
fig.add_trace(go.Bar(x=["Real", "Fake"], y=[cd_real, cd_fake], marker_color=[C_REAL, C_FAKE],
                     opacity=0.85, text=[cd_real, cd_fake], texttemplate="%{text:,}",
                     showlegend=False, hovertemplate="%{x}: %{y:,} frames<extra>Test</extra>"), 2, 2)
# (6) radar — chỉ số chuẩn hoá 0..100 cho 2 tập
def balance(rp):  # 100 = cân bằng hoàn hảo (50/50)
    return 100 - abs(rp - 50) * 2
axes = ["Real %", "Fake %", "Method<br>diversity %", "Class<br>balance %"]
tr_prof = [tr_real_pct, tr_fake_pct, 100*len(methods)/4, balance(tr_real_pct)]
te_prof = [te_real_pct, te_fake_pct, 100*1/4,            balance(te_real_pct)]
fig.add_trace(go.Scatterpolar(r=tr_prof + [tr_prof[0]], theta=axes + [axes[0]], fill="toself",
                              name="Training", legendgroup="train", showlegend=False,
                              line_color=C_TRAIN, fillcolor="rgba(52,152,219,0.25)"), 2, 3)
fig.add_trace(go.Scatterpolar(r=te_prof + [te_prof[0]], theta=axes + [axes[0]], fill="toself",
                              name="Test", legendgroup="test", showlegend=False,
                              line_color=C_TEST, fillcolor="rgba(46,204,113,0.25)"), 2, 3)

fig.update_yaxes(title_text="% of set", row=1, col=3, range=[0, 100])
fig.update_yaxes(title_text="# videos", row=2, col=1)
fig.update_yaxes(title_text="# frames", row=2, col=2)
fig.update_polars(radialaxis=dict(range=[0, 100], tickfont=dict(size=8), angle=-90, tickangle=-90,
                                  nticks=6),
                  angularaxis=dict(tickfont=dict(size=9)))
fig.update_layout(
    title=dict(text="<b>Distribution Analysis in Training and Test Sets</b><br>"
                    "<span style='font-size:13px;color:#555'>Training = FaceForensics++ c23 (video-level) · "
                    "Test = Celeb-DF-v2 (frame-level, cross-dataset)</span>",
               x=0.5, xanchor="center"),
    barmode="group", height=820, width=1320, template="plotly_white",
    legend=dict(orientation="h", x=1, xanchor="right", y=1.04, yanchor="bottom"),
    margin=dict(t=120, b=70))
fig.add_annotation(text=f"FF++ train: {ff_real:,} real + {ff_fake:,} fake videos (4 manipulations) "
                        f"&nbsp;|&nbsp; Celeb-DF-v2 test: {cd_real:,} real + {cd_fake:,} fake frames",
                   xref="paper", yref="paper", x=0.5, y=-0.09, showarrow=False,
                   font=dict(size=11, color="#666"))

out_html = FIG / "interactive_distribution_deepguard.html"
fig.write_html(str(out_html), include_plotlyjs="cdn", full_html=True)
print("OK html ->", out_html)

out_png = FIG / "fig_3_1_2_distribution_analysis.png"
try:
    import kaleido
    kaleido.write_fig_sync(fig, str(out_png), opts=dict(width=1320, height=820, scale=2, format="png"))
    print("OK png  ->", out_png)
except Exception as e:
    print("PNG (kaleido) failed:", repr(e)[:200])
