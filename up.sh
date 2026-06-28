#!/bin/bash
# up.sh — Bật TOÀN BỘ DeepGuard stack (Postgres, MinIO, serving x2, backend, frontend).
# Dùng:  cd ~/deepguard/app && ./up.sh
set -u
cd "$(dirname "$(readlink -f "$0")")"
APP="$PWD"
export LANG=C.UTF-8 PYTHONIOENCODING=utf-8
# S3 = MinIO local (backend đọc các biến này để lưu bằng chứng)
export S3_BUCKET=deepguard-evidence S3_REGION=us-east-1 \
       AWS_ENDPOINT_URL=http://localhost:9000 \
       AWS_ACCESS_KEY_ID=minioadmin AWS_SECRET_ACCESS_KEY=minioadmin

wait_up(){
  local t_start=$(date +%s)
  for i in $(seq 1 90); do
    if curl -s "$1" >/dev/null 2>&1; then
      local t_end=$(date +%s)
      echo "  ✓ $2 (took $((t_end - t_start))s)"
      return 0
    fi
    sleep 1
  done
  echo "  ✗ $2 CHƯA lên — xem log."
}
svc(){ fuser -k "$1/tcp" 2>/dev/null; sleep 1; setsid bash -c "$2 >>$3 2>&1" </dev/null & }

echo "[1/6] Postgres :5432"
docker start deepguard-db >/dev/null 2>&1 || docker run -d --name deepguard-db \
  -e POSTGRES_DB=deepguard -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 postgres:15-alpine >/dev/null
t_pg_start=$(date +%s)
until docker exec deepguard-db pg_isready -U postgres >/dev/null 2>&1; do sleep 1; done
t_pg_end=$(date +%s)
echo "  ✓ Postgres (took $((t_pg_end - t_pg_start))s)"

echo "[2/6] MinIO :9000/:9001"
docker start deepguard-minio >/dev/null 2>&1 || docker run -d --name deepguard-minio \
  -p 9000:9000 -p 9001:9001 -v "$HOME/.minio-deepguard:/data" \
  -e MINIO_ROOT_USER=minioadmin -e MINIO_ROOT_PASSWORD=minioadmin \
  minio/minio:latest server /data --console-address ":9001" >/dev/null
t_minio_start=$(date +%s)
until curl -s http://localhost:9000/minio/health/live >/dev/null 2>&1; do sleep 2; done
t_minio_end=$(date +%s)
echo "  ✓ MinIO (took $((t_minio_end - t_minio_start))s)"

echo "[3/6] Serving deepfake :8501 (nạp model ~30s)"
svc 8501 "cd '$APP' && serving/.venv310/bin/uvicorn serving.infer_server:app --port 8501" /tmp/serving_deepfake.log
wait_up http://127.0.0.1:8501/health "serving 8501"

echo "[4/6] Serving liveness :8502"
svc 8502 "cd '$APP' && serving/.venv310/bin/uvicorn serving.liveness_server:app --port 8502" /tmp/serving_liveness.log
wait_up http://127.0.0.1:8502/health "serving 8502"

echo "[5/6] Backend :8000"
svc 8000 "cd '$APP/backend' && .venv310/bin/uvicorn app.main:app --port 8000" /tmp/backend.log
wait_up http://127.0.0.1:8000/health "backend 8000"

echo "[6/6] Frontend :3000"
svc 3000 "cd '$APP/frontend' && node_modules/.bin/next dev -p 3000" /tmp/frontend.log
wait_up http://localhost:3000/ "frontend 3000"

echo ""
echo "✅ DeepGuard UP → http://localhost:3000  ·  Swagger http://localhost:8000/docs  ·  MinIO http://localhost:9001"
echo "   Login: dev@vietbank.vn / Password123!"
echo "   Log:   tail -f /tmp/backend.log /tmp/serving_*.log /tmp/frontend.log"
echo "   Tắt:   ./down.sh"
