#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""ERD of the DeepGuard backend — built FROM the real schema (deepguard_db/schema.sql).
10 tables, PK/FK/enum/unique, relationship lines with cardinality (1 — N) + ON DELETE behaviour.
English labels, paper look. NOT invented: every table/column/FK comes from schema.sql."""
from pathlib import Path
import matplotlib; matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.patches import FancyBboxPatch, Rectangle

ROOT = Path(__file__).resolve().parents[2]
FIG  = ROOT / "report" / "figures"

# ---- per-table curated fields (PK / FK / enum / unique + signature cols); full DDL in schema.sql ----
# row = (tag, text)  tag in {'pk','fk','enum','uq',''}
T = {
 "tenants": ("#dbe9ff", "#5b8def", [
    ("pk","id : uuid"),("", "name : varchar(200)"),("enum","plan : tenant_plan"),
    ("enum","status : tenant_status"),("", "monthly_quota / current_usage : int"),
    ("", "admin_email / billing_email"),("", "metadata : jsonb"),("", "created_at / updated_at")]),
 "users": ("#dcf5e3", "#3fae6b", [
    ("pk","id : uuid"),("fk","tenant_id → tenants"),("uq","email (uq per tenant)"),
    ("", "password_hash : varchar"),("enum","role : user_role"),("", "is_active : bool"),
    ("", "last_login_at / deleted_at"),("", "created_at / updated_at")]),
 "api_keys": ("#dcf5e3", "#3fae6b", [
    ("pk","id : uuid"),("fk","tenant_id → tenants"),("uq","key_hash : sha-256 (uq)"),
    ("", "prefix : varchar(16)"),("enum","status : api_key_status"),
    ("", "quota_used / quota_limit · rate_limit_rpm"),("", "last_used_at / expires_at / deleted_at"),
    ("", "created_at / updated_at")]),
 "invitations": ("#dcf5e3", "#3fae6b", [
    ("pk","id : uuid"),("fk","tenant_id → tenants"),("", "email : varchar"),
    ("enum","role : user_role"),("uq","token : varchar(128) (uq)"),
    ("", "expires_at / accepted_at"),("", "created_at / updated_at")]),
 "webhooks": ("#efe2ff", "#9b6ad6", [
    ("pk","id : uuid"),("fk","tenant_id → tenants"),("", "url : varchar(500)"),
    ("", "events : jsonb · secret"),("enum","status : webhook_status"),
    ("", "last_delivery_at / _status"),("", "created_at / updated_at")]),
 "webhook_deliveries": ("#efe2ff", "#9b6ad6", [
    ("pk","id : uuid"),("fk","webhook_id → webhooks"),("", "event_type : varchar(100)"),
    ("", "payload : jsonb · status_code"),("", "delivered : bool · attempt_count"),
    ("", "latency_ms · next_retry_at"),("", "created_at / updated_at")]),
 "detections": ("#ffe7cc", "#e08a2b", [
    ("pk","request_id : uuid"),("fk","tenant_id → tenants"),("fk","api_key_id → api_keys (null)"),
    ("", "source : 'api' | 'playground'"),("enum","verdict : detection_verdict"),
    ("", "confidence · prob_fake · prob_cnn"),("", "spatial_score · frequency_score · threshold_used"),
    ("", "image_hash · width · height · heatmap_url"),("", "model_version · processing_time_ms"),
    ("", "user_agent · ip_address · audit_notes(jsonb)"),("", "created_at / updated_at")]),
 "jobs": ("#ffe7cc", "#e08a2b", [
    ("pk","id : uuid"),("fk","tenant_id → tenants"),("fk","api_key_id → api_keys"),
    ("enum","type : job_type"),("enum","status : job_status"),
    ("", "progress_percent : int · input_url"),("", "result : jsonb · error_message"),
    ("", "started_at / completed_at · webhook_url"),("", "created_at / updated_at")]),
 "audit_logs": ("#eceff1", "#8a96a3", [
    ("pk","id : bigserial"),("fk","tenant_id → tenants (set null)"),("fk","user_id → users (set null)"),
    ("", "action : varchar(100)"),("", "resource_type · resource_id"),
    ("", "metadata : jsonb · ip_address · user_agent"),("", "created_at")]),
 "model_versions": ("#ffe7cc", "#e08a2b", [
    ("pk","id : uuid"),("uq","version : varchar (uq)"),("", "architecture : varchar(200)"),
    ("", "auc_celeb · auc_ffpp · threshold"),("", "training_dataset · checkpoint_path"),
    ("", "is_active : bool · traffic_percent"),("", "deployed_at · metadata(jsonb)"),
    ("", "created_at / updated_at")]),
}

# ---- placement: top-left (x,y) of each box. tenants = left hub. ----
POS = {
 "tenants":            (0.3, 7.6),
 "users":              (6.2, 12.2),
 "api_keys":           (6.2, 8.7),
 "invitations":        (6.2, 5.3),
 "webhooks":           (6.2, 2.0),
 "detections":         (12.4, 12.6),
 "jobs":               (12.4, 8.9),
 "webhook_deliveries": (12.4, 2.0),
 "audit_logs":         (12.4, 5.2),
 "model_versions":     (0.3, 2.4),
}
BW = 5.4                     # box width
HH = 0.46                    # header height
RH = 0.34                    # row height
TAGCOL = {"pk":"#c0392b","fk":"#2471a3","enum":"#7d3c98","uq":"#117a65","":"#333333"}
TAGTXT = {"pk":"PK","fk":"FK","enum":"EN","uq":"UQ","":""}

fig, ax = plt.subplots(figsize=(20, 13))
anchors = {}                 # name -> dict of edge points

def draw_box(name):
    fill, hdr, rows = T[name]
    x, ytop = POS[name]
    h = HH + len(rows)*RH + 0.12
    ybot = ytop - h
    # body
    ax.add_patch(FancyBboxPatch((x, ybot), BW, h, boxstyle="round,pad=0.02,rounding_size=0.06",
                                fc="white", ec=hdr, lw=1.4, zorder=2))
    # header
    ax.add_patch(Rectangle((x, ytop-HH), BW, HH, fc=hdr, ec=hdr, lw=1.4, zorder=3))
    ax.text(x+BW/2, ytop-HH/2, name, ha="center", va="center", fontsize=12.5,
            fontweight="bold", color="white", zorder=4, family="monospace")
    # rows
    for i, (tag, txt) in enumerate(rows):
        yr = ytop - HH - RH*(i+0.5)
        if tag:
            ax.text(x+0.18, yr, TAGTXT[tag], ha="left", va="center", fontsize=8.0,
                    fontweight="bold", color=TAGCOL[tag], zorder=4, family="monospace")
        ax.text(x+0.78, yr, txt, ha="left", va="center", fontsize=9.3,
                color="#222222", zorder=4,
                fontweight=("bold" if tag in ("pk","fk") else "normal"))
        if i < len(rows)-1:
            ax.plot([x+0.06, x+BW-0.06], [ytop-HH-RH*(i+1)]*2, color="#eeeeee", lw=0.6, zorder=2)
    anchors[name] = dict(
        L=(x, ytop-h/2), R=(x+BW, ytop-h/2),
        T=(x+BW/2, ytop), B=(x+BW/2, ybot),
        x=x, y=ybot, w=BW, h=h, ytop=ytop)

for n in T: draw_box(n)

# ---- relationship edges: (parent, child, parentanchor, childanchor, on_delete, waypoints) ----
LINE = "#444444"
def edge(parent, child, pa, ca, ondel, pts=None, lbloff=(0,0)):
    p = anchors[parent][pa]; c = anchors[child][ca]
    path = [p] + (pts or []) + [c]
    xs = [q[0] for q in path]; ys = [q[1] for q in path]
    ax.plot(xs, ys, color=LINE, lw=1.2, zorder=1, solid_capstyle="round")
    # "1" near parent
    ax.text(p[0]+(0.18 if pa=="R" else -0.18 if pa=="L" else 0),
            p[1]+(0.20 if pa in("T","B") else 0.18), "1", fontsize=10, fontweight="bold",
            color=LINE, ha="center", va="center", zorder=5,
            bbox=dict(boxstyle="circle,pad=0.05", fc="white", ec="none"))
    # "N" near child  (crow's-foot many)
    ax.text(c[0]+(0.22 if ca=="R" else -0.22 if ca=="L" else 0),
            c[1]+(0.22 if ca in("T","B") else 0.18), "N", fontsize=10, fontweight="bold",
            color=LINE, ha="center", va="center", zorder=5,
            bbox=dict(boxstyle="circle,pad=0.05", fc="white", ec="none"))
    # ON DELETE label at mid
    mx, my = path[len(path)//2]
    ax.text(mx+lbloff[0], my+lbloff[1], ondel, fontsize=7.2, style="italic",
            color="#777777", ha="center", va="center", zorder=5,
            bbox=dict(boxstyle="round,pad=0.12", fc="white", ec="none"))

# tenants (left hub) -> direct children (right)
edge("tenants","users","R","L","ON DELETE CASCADE")
edge("tenants","api_keys","R","L","CASCADE")
edge("tenants","invitations","R","L","CASCADE")
edge("tenants","webhooks","R","L","CASCADE")
# tenants -> second-level (route over the TOP / BOTTOM margins to avoid crossing column B)
edge("tenants","detections","T","T","CASCADE", pts=[(3.0,16.9),(15.1,16.9)])
edge("tenants","jobs","T","L","CASCADE", pts=[(3.0,16.4),(11.4,16.4),(11.4, anchors['jobs']['L'][1])])
edge("tenants","audit_logs","B","L","SET NULL", pts=[(3.0,1.1),(11.5,1.1),(11.5, anchors['audit_logs']['L'][1])])
# second-level FKs
edge("api_keys","detections","R","L","NO ACTION")
edge("api_keys","jobs","R","L","NO ACTION")
edge("users","audit_logs","R","L","SET NULL", pts=[(11.7, anchors['users']['R'][1]),(11.7, anchors['audit_logs']['T'][0])] and None)
edge("webhooks","webhook_deliveries","R","L","CASCADE")
# soft link (not an FK): detections.model_version matches model_versions.version (string)
mv=anchors["model_versions"]; de=anchors["detections"]
ax.plot([mv["x"]+mv["w"]/2, mv["x"]+mv["w"]/2, de["x"]+de["w"]+0.0],
        [mv["ytop"], 17.4, 17.4], color="#bbbbbb", lw=1.0, ls=(0,(4,3)), zorder=1)
ax.plot([de["x"]+de["w"], de["x"]+de["w"]], [de["ytop"], 17.4], color="#bbbbbb", lw=1.0, ls=(0,(4,3)), zorder=1)
ax.text(8.7, 17.55, "model_version (string match, not an enforced FK)", fontsize=8,
        style="italic", color="#999999", ha="center")

# users->audit_logs handled separately (waypoint) to avoid the 'and None' issue
ua_u = anchors["users"]["R"]; ua_a = anchors["audit_logs"]["L"]
ax.plot([ua_u[0], 11.7, 11.7, ua_a[0]], [ua_u[1], ua_u[1], ua_a[1], ua_a[1]],
        color=LINE, lw=1.2, zorder=1)
ax.text(ua_u[0]+0.18, ua_u[1]+0.18, "1", fontsize=10, fontweight="bold", color=LINE, ha="center", zorder=5,
        bbox=dict(boxstyle="circle,pad=0.05", fc="white", ec="none"))
ax.text(ua_a[0]-0.22, ua_a[1]+0.18, "N", fontsize=10, fontweight="bold", color=LINE, ha="center", zorder=5,
        bbox=dict(boxstyle="circle,pad=0.05", fc="white", ec="none"))
ax.text(11.7, (ua_u[1]+ua_a[1])/2, "SET NULL", fontsize=7.2, style="italic", color="#777777",
        ha="center", rotation=90, bbox=dict(boxstyle="round,pad=0.12", fc="white", ec="none"), zorder=5)

# ---- enum legend ----
enums = ("tenant_plan: starter|pro|enterprise   ·   tenant_status: active|suspended|deleted\n"
         "user_role: developer|compliance|admin|sysadmin   ·   api_key_status: active|suspended|revoked\n"
         "webhook_status: active|paused   ·   detection_verdict: REAL|FAKE|UNCERTAIN\n"
         "job_type: video_detection|batch_detection   ·   job_status: PENDING|PROCESSING|COMPLETED|FAILED")
ax.text(0.3, 0.55, "ENUM types\n"+enums, fontsize=8, va="top", ha="left", family="monospace",
        bbox=dict(boxstyle="round,pad=0.4", fc="#fafafa", ec="#cccccc"))
# tag legend
ax.text(18.4, 1.0, "PK primary key   FK foreign key\nEN enum   UQ unique\n1—N  one-to-many",
        fontsize=8.5, va="bottom", ha="left",
        bbox=dict(boxstyle="round,pad=0.4", fc="#fafafa", ec="#cccccc"))

ax.set_title("DeepGuard backend — Entity-Relationship Diagram (PostgreSQL, from schema.sql)",
             fontsize=15, fontweight="bold", pad=14)
ax.set_xlim(-0.3, 21.5); ax.set_ylim(0, 18.2); ax.axis("off")
fig.tight_layout()
out = FIG/"fig_erd_backend.png"
fig.savefig(out, dpi=150, bbox_inches="tight"); plt.close(fig)
print("saved:", out)
