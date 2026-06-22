# Khởi động full stack DeepGuard (dev local) — chạy tuần tự

> Mở 1 terminal ở thư mục repo. Chạy từng khối theo thứ tự.
> Cổng: 5432 Postgres · 9000 MinIO(S3) + 9001 console · 8501 serving deepfake · 8502 serving liveness · 8000 API · 3000 FE.
> S3 dev = **MinIO** (lưu BỀN thành file thật, không mất khi xoá container). CloudWatch chỉ chạy thật trên AWS — dev xem log ở `backend/app.log`.

```bash
cd /home/huanthuytnhh/Desktop/thanhln/datn

# 0) Docker dùng socket hệ thống (context đang trỏ Docker Desktop không có)
docker context use default 2>/dev/null || export DOCKER_HOST=unix:///var/run/docker.sock

# 1) PostgreSQL :5432
docker start deepguard-db 2>/dev/null || docker run -d --name deepguard-db -e POSTGRES_DB=deepguard -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 postgres:15-alpine
until docker exec deepguard-db pg_isready -U postgres >/dev/null 2>&1; do sleep 1; done; echo "PG ready"

# 2) MinIO :9000 (S3 bền) + console :9001 — data ở ~/.minio-deepguard
docker start deepguard-minio 2>/dev/null || docker run -d --name deepguard-minio -p 9000:9000 -p 9001:9001 \
  -v $HOME/.minio-deepguard:/data -e MINIO_ROOT_USER=minioadmin -e MINIO_ROOT_PASSWORD=minioadmin \
  minio/minio:latest server /data --console-address ":9001"
until curl -s http://localhost:9000/minio/health/live >/dev/null 2>&1; do sleep 2; done
# tạo bucket (idempotent)
AWS_ACCESS_KEY_ID=minioadmin AWS_SECRET_ACCESS_KEY=minioadmin python3 -c "import boto3;from botocore.config import Config;boto3.client('s3',region_name='us-east-1',endpoint_url='http://localhost:9000',config=Config(s3={'addressing_style':'path'})).create_bucket(Bucket='deepguard-evidence')" 2>/dev/null; echo "MinIO + bucket ready"

# 3) Serving deepfake :8501
python3 -m uvicorn serving.infer_server:app --host 127.0.0.1 --port 8501 > /tmp/sfdct.log 2>&1 &

# 4) Serving liveness :8502
python3 -m uvicorn serving.liveness_server:app --host 127.0.0.1 --port 8502 > /tmp/liveness.log 2>&1 &

# 5) Backend :8000 — kèm S3 (MinIO). Bỏ 5 biến S3/AWS nếu KHÔNG cần lưu bằng chứng.
( cd backend && S3_BUCKET=deepguard-evidence S3_REGION=us-east-1 \
  AWS_ENDPOINT_URL=http://localhost:9000 AWS_ACCESS_KEY_ID=minioadmin AWS_SECRET_ACCESS_KEY=minioadmin \
  python3 -m uvicorn app.main:app --host 127.0.0.1 --port 8000 > /tmp/backend.log 2>&1 & )
until curl -s http://127.0.0.1:8000/health >/dev/null 2>&1; do sleep 1; done; echo "API up"
# Lần đầu / DB mới: ( cd backend && python3 scripts/seed.py )

# 6) Frontend :3000
( cd frontend && bun dev > /tmp/frontend.log 2>&1 & )

# 7) Kiểm tra
sleep 5
for p in 5432 9000 8501 8502 8000 3000; do ss -ltn | grep -q ":$p " && echo ":$p UP" || echo ":$p DOWN"; done
curl -s http://127.0.0.1:8000/health; echo
echo "App http://localhost:3000 · Swagger http://localhost:8000/docs · MinIO console http://localhost:9001 (minioadmin/minioadmin)"
```

## Xem data S3 dev (MinIO)
- **Web console**: http://localhost:9001 (login `minioadmin`/`minioadmin`) → bucket `deepguard-evidence` → duyệt/tải ảnh trực tiếp.
- **File trên đĩa**: `~/.minio-deepguard/deepguard-evidence/tenants/<tenant>/detections/...`
- **CLI/boto3**: endpoint `http://localhost:9000`, creds minioadmin, path-style.
- **Log (nguồn CloudWatch)**: `tail -f backend/app.log`.

## Tài khoản demo
`Password123!` · `sysadmin@deepguard.vn` / `admin@vietbank.vn` / `dev@vietbank.vn` / `compliance@vietbank.vn` / `viewer@vietbank.vn`.

## Tắt stack
```bash
docker context use default 2>/dev/null || export DOCKER_HOST=unix:///var/run/docker.sock
fuser -k 8000/tcp 8501/tcp 8502/tcp 3000/tcp 2>/dev/null
docker stop deepguard-db deepguard-minio   # data Postgres + MinIO đều BỀN qua stop/rm (volume)
```

## Ghi chú
- MinIO **bền**: object là file thật trong `~/.minio-deepguard`, còn nguyên kể cả `docker rm` container (chỉ mất nếu xoá thư mục đó).
- Không cần S3: bỏ bước 2 + 5 biến môi trường ở bước 5 — app vẫn đủ predict/history.
- CloudWatch: dev không chạy (chỉ thật trên AWS/EC2 — xem `AWS_ENABLE_S3_CW_EC2.md`); dev xem log ở `backend/app.log`.
