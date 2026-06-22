#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Trích 11 khối mermaid từ MD -> mermaid_11.md (sạch, render trong VS Code/mermaid.live)
+ mermaid_view.html (mermaid.js CDN, mở browser để xem render)."""
import re
from pathlib import Path

DIR = Path(__file__).resolve().parent
MD = DIR / "PL04_B_RuotThuyetMinh.md"
text = MD.read_text(encoding="utf-8")
lines = text.split("\n")

# tìm các khối ```mermaid ... ``` + caption gần nhất (dòng *Figure ...* hoặc Figure ...)
blocks = []
i = 0
while i < len(lines):
    if lines[i].strip() == "```mermaid":
        j = i + 1; body = []
        while j < len(lines) and lines[j].strip() != "```":
            body.append(lines[j]); j += 1
        # caption: dòng "Figure x.y" gần nhất trong 6 dòng sau khối
        cap = ""
        for k in range(j + 1, min(j + 7, len(lines))):
            m = re.search(r"(Figure\s+\d+\.\d+[^*<]*)", lines[k])
            if m: cap = m.group(1).strip().rstrip("*").strip(); break
        blocks.append((cap or f"diagram {len(blocks)+1}", "\n".join(body)))
        i = j + 1
    else:
        i += 1

# 1) mermaid_11.md
md = ["# 11 sơ đồ Mermaid — PL04_B (xem render trong VS Code / mermaid.live)\n"]
for cap, body in blocks:
    md.append(f"\n## {cap}\n\n```mermaid\n{body}\n```\n")
(DIR / "mermaid_11.md").write_text("\n".join(md), encoding="utf-8")

# 2) mermaid_view.html
cards = "\n".join(
    f'<div class="card"><h3>{cap}</h3><pre class="mermaid">{body}</pre></div>'
    for cap, body in blocks)
html = f"""<!doctype html><html><head><meta charset="utf-8">
<title>11 Mermaid — PL04_B</title>
<script src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"></script>
<style>body{{font-family:Segoe UI,Arial;background:#fafafa;margin:24px}}
.card{{background:#fff;border:1px solid #ddd;border-radius:8px;padding:16px;margin:18px 0;box-shadow:0 1px 4px #0001}}
h3{{margin:0 0 12px;color:#333}}</style></head>
<body><h1>11 sơ đồ Mermaid — PL04_B_RuotThuyetMinh</h1>
{cards}
<script>mermaid.initialize({{startOnLoad:true,theme:"default"}});</script>
</body></html>"""
(DIR / "mermaid_view.html").write_text(html, encoding="utf-8")
print(f"trích {len(blocks)} khối mermaid:")
for cap, _ in blocks: print("  -", cap)
print("→ mermaid_11.md + mermaid_view.html")
