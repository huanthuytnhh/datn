#!/bin/bash
# down.sh — Tắt TOÀN BỘ DeepGuard stack + Docker (data Postgres/MinIO giữ nguyên).
# Dùng:  cd ~/deepguard/app && ./down.sh
echo "→ Tắt app (8000 / 8501 / 8502 / 3000)…"
fuser -k 8000/tcp 8501/tcp 8502/tcp 3000/tcp 2>/dev/null
echo "→ Dừng Docker (Postgres + MinIO — data còn nguyên)…"
docker stop deepguard-db deepguard-minio 2>/dev/null
sleep 1
echo "→ Trạng thái cổng:"
for p in 5432 9000 9001 8501 8502 8000 3000; do
  ss -ltn 2>/dev/null | grep -q ":$p " && echo "  :$p VẪN UP" || echo "  :$p ✔ down"
done
echo "✅ Đã tắt hết. Bật lại: ./up.sh"
