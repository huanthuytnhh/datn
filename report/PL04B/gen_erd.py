#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""ER diagram for the DeepGuard backend (core 8 tables), from deepguard_db/app/db/models.py.
Tables: tenants, users, invitations, api_keys, detections, liveness_checks, audit_logs, jobs.
Conceptual diagram (no fabricated columns; key columns + FKs only)."""
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.patches import FancyBboxPatch, FancyArrowPatch

OUT = "/home/huanthuytnhh/Desktop/thanhln/datn/report/figures/fig_erd_backend_v2.png"
INK = "#1b1b1b"; HEAD = "#2c5f8a"; FK = "#b5651d"; LINE = "#8a8a8a"

# table: (x, y_bottom, w, rows[(text, tag)])  tag in {'PK','FK',''}
TABLES = {
 "tenants":        (3,  44, 19, [("id","PK"),("name",""),("plan",""),("status",""),("monthly_quota","")]),
 "users":          (30, 78, 19, [("id","PK"),("tenant_id","FK"),("email",""),("role","")]),
 "invitations":    (54, 78, 19, [("id","PK"),("tenant_id","FK"),("email",""),("token","")]),
 "api_keys":       (30, 44, 19, [("id","PK"),("tenant_id","FK"),("key_hash",""),("status","")]),
 "audit_logs":     (78, 78, 20, [("id","PK"),("tenant_id","FK"),("user_id","FK"),("action","")]),
 "detections":     (30, 4,  21, [("request_id","PK"),("tenant_id","FK"),("api_key_id","FK"),("verdict",""),("prob_fake","")]),
 "liveness_checks":(56, 4,  23, [("check_id","PK"),("tenant_id","FK"),("api_key_id","FK"),("verdict",""),("liveness_score","")]),
 "jobs":           (84, 4,  15, [("id","PK"),("tenant_id","FK"),("api_key_id","FK"),("type",""),("status","")]),
}
RH = 4.2; HH = 5.2  # row height, header height

def draw(ax, name):
    x, y0, w, rows = TABLES[name]
    h = HH + RH*len(rows)
    top = y0 + h
    ax.add_patch(FancyBboxPatch((x, y0), w, h, boxstyle="round,pad=0.1,rounding_size=0.6",
                                fc="white", ec=INK, lw=1.2, zorder=3))
    ax.add_patch(plt.Rectangle((x, top-HH), w, HH, fc=HEAD, ec=INK, lw=1.0, zorder=4))
    ax.text(x+w/2, top-HH/2, name, ha="center", va="center", color="white",
            fontsize=9.5, fontweight="bold", zorder=5)
    for i,(t,tag) in enumerate(rows):
        ry = top - HH - RH*(i+0.5)
        label = t + (f"  ({tag})" if tag else "")
        ax.text(x+1.2, ry, label, ha="left", va="center", fontsize=7.6,
                color=FK if tag=="FK" else INK, zorder=5)
    return dict(x=x, y0=y0, w=w, h=h, top=top, cy=y0+h/2)

def anchor(b, side):
    if side=="L": return (b["x"], b["cy"])
    if side=="R": return (b["x"]+b["w"], b["cy"])
    if side=="T": return (b["x"]+b["w"]/2, b["top"])
    if side=="B": return (b["x"]+b["w"]/2, b["y0"])

def fk(ax, child, cside, parent, pside):
    a = anchor(B[child], cside); b = anchor(B[parent], pside)
    ax.add_patch(FancyArrowPatch(a, b, arrowstyle="-|>", mutation_scale=11,
                 color=LINE, lw=1.1, connectionstyle="arc3,rad=0.06",
                 shrinkA=1, shrinkB=1, zorder=1))

fig = plt.figure(figsize=(12, 8)); ax = fig.add_axes([0,0,1,1])
ax.set_xlim(0,104); ax.set_ylim(0,110); ax.axis("off")
B = {n: draw(ax, n) for n in TABLES}

# FK edges (child -> parent)
fk(ax,"users","L","tenants","R")
fk(ax,"invitations","L","tenants","R")
fk(ax,"api_keys","L","tenants","R")
fk(ax,"audit_logs","T","tenants","T")
fk(ax,"audit_logs","L","users","R")
fk(ax,"detections","L","tenants","B")
fk(ax,"liveness_checks","B","tenants","B")
fk(ax,"jobs","B","tenants","B")
fk(ax,"detections","T","api_keys","B")
fk(ax,"liveness_checks","T","api_keys","B")
fk(ax,"jobs","T","api_keys","B")

ax.text(52, 106, "DeepGuard backend schema (multi-tenant): the tenant is the root and every table carries tenant_id",
        ha="center", fontsize=10, color="#555")
fig.savefig(OUT, dpi=150, bbox_inches="tight"); plt.close(fig)
print("saved", OUT)
