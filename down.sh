#!/usr/bin/env bash
# Tắt toàn bộ dev stack DeepGuard trong 1 lệnh.
#   App (uvicorn/bun): API :8000 · serving :8501/:8502 · FE :3000
#   Docker (data BỀN, chỉ stop): Postgres :5432 · MinIO :9000/:9001
# Dùng: bash down.sh
set -u
export DOCKER_HOST="${DOCKER_HOST:-unix:///var/run/docker.sock}"

echo "→ Tắt tiến trình app (uvicorn/bun) ở 8000/8501/8502/3000…"
fuser -k 8000/tcp 8501/tcp 8502/tcp 3000/tcp 2>/dev/null && echo "  đã gửi kill" || echo "  (không có tiến trình)"

echo "→ Dừng container Docker (data Postgres + MinIO vẫn còn)…"
docker stop deepguard-db deepguard-minio 2>/dev/null

sleep 1
echo "→ Trạng thái cổng:"
for p in 5432 9000 9001 8501 8502 8000 3000; do
  ss -ltn 2>/dev/null | grep -q ":$p " && echo "  :$p VẪN UP" || echo "  :$p down ✔"
done
echo "Xong."
