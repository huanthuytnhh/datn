# Chạy DeepGuard trên WSL Ubuntu 24.04 (local — parity với AWS)

> Đây là môi trường chạy **CHÍNH** (Linux, giống hệt EC2). Code ở `~/deepguard/app`.
> Chạy **model THẬT** (SFDCT/HFF/liveness) trên CPU. Bản Windows-native chỉ là fallback.

## Chạy hằng ngày (2 lệnh)

```bash
cd ~/deepguard/app
bash up.sh      # bật ĐỦ 6 service
bash down.sh    # tắt (data Postgres + MinIO giữ nguyên)
```

`up.sh` bật: **Postgres :5432 · MinIO :9000/:9001 · serving deepfake :8501 · serving liveness :8502 · API :8000 · FE :3000**.

- App http://localhost:3000 · Swagger http://localhost:8000/docs · MinIO UI http://localhost:9001 (`minioadmin`/`minioadmin`)
- Login 5 role (cùng mật khẩu `Password123!`): `sysadmin@deepguard.vn` · `admin@vietbank.vn` · `dev@vietbank.vn` · `compliance@vietbank.vn` · `viewer@vietbank.vn`
- Log: `tail -f /tmp/backend.log` · `/tmp/serving_deepfake.log` · `/tmp/serving_liveness.log` · `/tmp/frontend.log`

## Cài lại từ đầu (nếu mất venv / model)

```bash
# prereq 1 lần: Node 20, python3-venv, git, bun (~/.bun/bin/bun)
git clone -b dev-thanhln-22062026 https://github.com/huanthuytnhh/datn.git ~/deepguard/app
cd ~/deepguard/app

# 1) serving venv + torch CPU + 2 model .pth (KHÔNG có trong git → tải từ HuggingFace)
python3 -m venv serving/.venv310
serving/.venv310/bin/pip install torch torchvision --index-url https://download.pytorch.org/whl/cpu
serving/.venv310/bin/pip install -r serving/requirements.txt huggingface_hub
# sfdct
serving/.venv310/bin/hf download huanthuytnhh/deepfake runs/20260605-230747/ckpt/efficientnetb4_sfdct/ckpt_best.pth --local-dir /tmp/hfdl
cp /tmp/hfdl/runs/20260605-230747/ckpt/efficientnetb4_sfdct/ckpt_best.pth serving/naive_sfdct/ckpt_best.pth
# b4 (spatial baseline)
serving/.venv310/bin/hf download huanthuytnhh/deepfake runs/20260605-230747/ckpt/efficientnetb4/ckpt_best.pth --local-dir /tmp/hfdl
cp /tmp/hfdl/runs/20260605-230747/ckpt/efficientnetb4/ckpt_best.pth serving/b4/ckpt_best.pth
# hff R3 (0.7695, ban tot nhat)
serving/.venv310/bin/hf download huanthuytnhh/deepfake runs/20260610-003615/ckpt/efficientnetb4_hff_2026-06-09-21-06-21/ckpt_best.pth --local-dir /tmp/hfdl
cp /tmp/hfdl/runs/20260610-003615/ckpt/efficientnetb4_hff_2026-06-09-21-06-21/ckpt_best.pth serving/hff/ckpt_best.pth
# liveness
serving/.venv310/bin/hf download huanthuytnhh/deepfake runs/liveness-20260606-100514/b4/ckpt_best_liveness.pth --local-dir /tmp/hfdl
cp /tmp/hfdl/runs/liveness-20260606-100514/b4/ckpt_best_liveness.pth serving/liveness_b4/ckpt_best.pth

# 2) backend venv
python3 -m venv backend/.venv310
backend/.venv310/bin/pip install -r backend/requirements.txt

# 3) frontend deps
cd frontend && ~/.bun/bin/bun install && cd ..

# 4) backend/.env — MOCK_ML=false, trỏ serving + DB local. Tối thiểu:
#    DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/deepguard
#    SECRET_KEY=<python3 -c "import secrets;print(secrets.token_hex(32))">
#    MOCK_ML=false
#    SFDCT_INFER_URL=http://127.0.0.1:8501
#    LIVENESS_INFER_URL=http://127.0.0.1:8502
#    CORS_ORIGINS=http://localhost:3000

# 5) seed + chạy
backend/.venv310/bin/python3 backend/scripts/seed.py
bash up.sh
```

## Lưu ý quan trọng (đã từng vấp)

- Tải model dùng **`hf download`** — KHÔNG dùng `huggingface-cli` (đã khai tử).
- venv tên `.venv310` nhưng thực chất **python3.12** (chỉ là TÊN thư mục; `up.sh` gọi theo path `serving/.venv310/bin/python3`, đổi tên là hỏng).
- 2 file `.pth` **không nằm trong git** → phải tải từ HF mỗi lần clone mới.
- S3 dev = **MinIO** (data bền ở `~/.minio-deepguard`); CloudWatch chỉ chạy thật trên AWS.
- Tắt WSL/PC rồi bật lại: data Postgres + MinIO còn → chỉ cần `bash up.sh` lại.
