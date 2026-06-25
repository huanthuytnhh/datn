#!/usr/bin/env bash
# redeploy.sh — cập nhật code mới nhất + rebuild FE + restart service. Chạy trên EC2.
#   Cách dùng:  cd ~/deepguard/app && ./redeploy.sh
# Không phụ thuộc "upstream tracking" (fetch theo tên nhánh) nên luôn chạy.
set -e

# ── Sửa 2 dòng này nếu layout EC2 khác (mặc định khớp runbook đã chạy) ──
APP=~/deepguard/app          # thư mục git repo
FE=~/deepguard/frontend      # thư mục frontend để build
API_URL=http://deepguard.ddns.net/api
# ───────────────────────────────────────────────────────────────────────

cd "$APP"
BRANCH=$(git rev-parse --abbrev-ref HEAD)
echo "▶ [1/3] Cập nhật code ($BRANCH)…"
git fetch origin "$BRANCH"
git merge --ff-only FETCH_HEAD     # an toàn: chỉ tua nhanh, không ghi đè; lỗi = có commit lạ trên EC2
git log --oneline -1

echo "▶ [2/3] Build frontend…"
cd "$FE"
bun install
NEXT_PUBLIC_API_URL="$API_URL" bun run build
cp -r .next/static .next/standalone/.next/
cp -r public .next/standalone/

echo "▶ [3/3] Restart services…"
sudo systemctl restart deepguard-api deepguard-fe deepguard-sfdct deepguard-liveness
sleep 3
curl -s http://127.0.0.1:8000/health && echo "  ✓ redeploy xong"
