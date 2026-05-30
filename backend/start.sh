#!/usr/bin/env bash
# Quick-start script cho DeepGuard backend (dev)
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

# 1. Start PostgreSQL nếu chưa chạy (dùng Docker)
if ! nc -z localhost 5432 2>/dev/null; then
  if docker ps -a --format '{{.Names}}' | grep -q '^deepguard-db$'; then
    echo "→ Starting existing deepguard-db container..."
    docker start deepguard-db
  else
    echo "→ Starting PostgreSQL via Docker..."
    docker run -d \
      --name deepguard-db \
      -e POSTGRES_DB=deepguard \
      -e POSTGRES_USER=postgres \
      -e POSTGRES_PASSWORD=postgres \
      -p 5432:5432 \
      postgres:15-alpine
  fi

  echo "→ Waiting for PostgreSQL to be ready..."
  until docker exec deepguard-db pg_isready -U postgres 2>/dev/null; do
    sleep 1
  done
  echo "→ PostgreSQL ready!"
else
  echo "→ PostgreSQL already running on :5432"
fi

# 2. Copy .env nếu chưa có
if [ ! -f .env ]; then
  cp .env.example .env
  echo "→ Created .env from .env.example"
fi

# 3. Start uvicorn — chạy từ thư mục backend/
echo "→ Starting DeepGuard API on http://localhost:8000"
echo "→ Docs: http://localhost:8000/docs"
echo ""

python3 -m uvicorn app.main:app \
  --host 0.0.0.0 \
  --port 8000 \
  --reload \
  --reload-dir app
