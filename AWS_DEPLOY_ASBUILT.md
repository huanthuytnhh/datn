# AWS_DEPLOY_ASBUILT — Nhật ký TOÀN BỘ thao tác đã làm (màn hình + lệnh)

> Bản "as-built": ghi đúng những gì ĐÃ làm khi deploy DeepGuard lên AWS, theo thứ tự thời gian,
> kèm các fix phát sinh lúc nghiệm thu. Mọi lệnh đều gõ tay được (không heredoc, file sửa bằng nano).
> KHÔNG commit file này (repo public). Bản kế hoạch đầy đủ: `AWS_DEPLOY_RUNBOOK.md`.

## 0. Thông tin chốt (tra nhanh)

| Mục | Giá trị |
|---|---|
| Instance | `i-01a36996d33c371ea` — `deepguard-demo`, **m7i-flex.large**, Ubuntu **24.04**, us-east-1 |
| IP tĩnh (Elastic IP) | `3.90.19.159` |
| Domain | `http://deepguard.ddns.net` (No-IP, type A → 3.90.19.159) |
| Security group | `launch-wizard-1`: 80 + 443 ← 0.0.0.0/0 · 22 ← IP nhà + dải EC2 Instance Connect |
| Vào máy | AWS Console → EC2 → chọn instance → **Connect** → tab **EC2 Instance Connect** (terminal trên web) |
| Services | nginx :80 → FE :3000 + API :8000 · SFDCT :8501 · liveness :8502 · Postgres docker :5432 (chỉ localhost) |
| Đường dẫn trên EC2 | repo `~/deepguard/app` · backend `~/deepguard/backend` · frontend `~/deepguard/frontend` |
| Login demo | `sysadmin@deepguard.vn` / `Password123!` (4 account còn lại: admin/dev/compliance/viewer `@vietbank.vn`, cùng mật khẩu) |
| Swagger | `http://deepguard.ddns.net/api/docs` |

---

## 1. [MÀN HÌNH] AWS Console — tạo máy chủ

1. Đăng nhập AWS Console → tìm **EC2** → **Launch instance**.
2. Điền:
   - Name: `deepguard-demo`
   - AMI: **Ubuntu Server 24.04 LTS (64-bit x86)**
   - Instance type: **m7i-flex.large** (2 vCPU / 8 GB)
   - Key pair: chọn/tạo key (chỉ cần nếu SSH; vào bằng Instance Connect thì không dùng đến)
   - Network settings → security group: mở **SSH 22 (My IP)**, **HTTP 80 (Anywhere)**, **HTTPS 443 (Anywhere)**. KHÔNG mở 3000/8000/8501/8502/5432.
   - Storage: **30 GiB gp3**
3. **Launch** → chờ trạng thái `Running`.
4. Gắn IP tĩnh: EC2 → **Elastic IPs** → **Allocate Elastic IP address** → chọn IP vừa cấp → **Actions → Associate** → chọn instance `deepguard-demo`. (Đã cấp: `3.90.19.159` — giữ IP qua các lần Stop/Start.)
5. Mở terminal web: chọn instance → **Connect** → tab **EC2 Instance Connect** → **Connect**. (Mọi block lệnh dưới đây paste vào cửa sổ này.)

## 2. [MÀN HÌNH] No-IP — domain miễn phí

1. Đăng ký/đăng nhập `noip.com` → **My Services → DNS Records → Create Hostname**.
2. Hostname: `deepguard` · Domain: `ddns.net` · Record Type: **A** · IPv4: `3.90.19.159` → **Create**.
3. Kiểm tra từ máy local:

```
ping -c 2 deepguard.ddns.net
```

phải ra `3.90.19.159`. (Tài khoản free: 30 ngày phải bấm confirm hostname 1 lần qua email.)

## 3. Cài nền trên EC2 (1 lần)

```
sudo apt update
sudo apt install -y nginx python3.11-venv python3-pip docker.io unzip
sudo usermod -aG docker ubuntu
newgrp docker
```

Node 20 + bun (frontend chạy bằng bun):

```
curl -fsSL https://deb.nodesource.com/setup_20.x -o /tmp/node20.sh
sudo bash /tmp/node20.sh
sudo apt install -y nodejs
curl -fsSL https://bun.sh/install -o /tmp/bun.sh
bash /tmp/bun.sh
echo 'export PATH=$HOME/.bun/bin:$PATH' >> ~/.bashrc
source ~/.bashrc
```

## 4. Lấy code + 2 checkpoint model

```
mkdir -p ~/deepguard
cd ~/deepguard
git clone -b dev-thanhln-report-finalize --depth 1 https://github.com/huanthuytnhh/datn.git app
ln -s app/backend backend
ln -s app/frontend frontend
ln -s app/deepguard_db deepguard_db
```

2 file `.pth` không nằm trong git — tải từ HuggingFace (repo public, không cần token):

```
cd ~/deepguard/app
pip install -q huggingface_hub
huggingface-cli download huanthuytnhh/deepfake runs/20260605-230747/ckpt/efficientnetb4_sfdct/ckpt_best.pth --local-dir /tmp/hfdl
cp /tmp/hfdl/runs/20260605-230747/ckpt/efficientnetb4_sfdct/ckpt_best.pth serving/naive_sfdct/ckpt_best.pth
huggingface-cli download huanthuytnhh/deepfake runs/liveness-20260606-100514/b4/ckpt_best_liveness.pth --local-dir /tmp/hfdl
cp /tmp/hfdl/runs/liveness-20260606-100514/b4/ckpt_best_liveness.pth serving/liveness_b4/ckpt_best.pth
sha256sum serving/naive_sfdct/ckpt_best.pth serving/liveness_b4/ckpt_best.pth
```

sha256 phải bắt đầu bằng `1c5f04fa…` (sfdct) và `6ed8c9ee…` (liveness).

## 5. PostgreSQL (Docker)

```
docker run -d --name deepguard-db --restart unless-stopped -e POSTGRES_DB=deepguard -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=MAT_KHAU_DB_CUA_BAN -p 127.0.0.1:5432:5432 -v pgdata:/var/lib/postgresql/data postgres:15-alpine
```

(`MAT_KHAU_DB_CUA_BAN` = mật khẩu bạn tự đặt, lưu password manager. `127.0.0.1:` = DB không lộ ra Internet.)

## 6. Serving SFDCT :8501 + liveness :8502

```
cd ~/deepguard/app
python3.11 -m venv .venv-serve
source .venv-serve/bin/activate
pip install torch torchvision --index-url https://download.pytorch.org/whl/cpu
pip install -r serving/requirements.txt
```

Smoke test trước khi đăng ký service (Ctrl+C để dừng sau khi thấy OK):

```
uvicorn serving.infer_server:app --host 127.0.0.1 --port 8501
```

mở tab Instance Connect thứ 2:

```
curl http://127.0.0.1:8501/health
```

phải ra `{"ok":true,...}`. Liveness tương tự với `serving.liveness_server:app` port 8502.

## 7. Backend :8000

```
cd ~/deepguard/backend
python3.11 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
pip install bcrypt==4.0.1
```

> ⚠️ Dòng `bcrypt==4.0.1` là FIX bắt buộc (xem §11.2): `passlib 1.7.4` vỡ với bcrypt 5.x mà pip mặc định kéo về.

Sinh SECRET_KEY (copy chuỗi in ra):

```
python3 -c "import secrets; print(secrets.token_hex(32))"
```

Tạo file env:

```
nano .env
```

gõ nội dung (thay 2 chỗ in hoa):

```
DATABASE_URL=postgresql+asyncpg://postgres:MAT_KHAU_DB_CUA_BAN@127.0.0.1:5432/deepguard
SECRET_KEY=CHUOI_64_KY_TU_VUA_SINH
MOCK_ML=false
SFDCT_INFER_URL=http://127.0.0.1:8501
LIVENESS_INFER_URL=http://127.0.0.1:8502
CORS_ORIGINS=http://deepguard.ddns.net
```

Ctrl+O Enter Ctrl+X để lưu. Seed dữ liệu demo + smoke:

```
python3 scripts/seed.py
uvicorn app.main:app --host 127.0.0.1 --port 8000 --root-path /api
```

tab khác: `curl http://127.0.0.1:8000/health` → OK thì Ctrl+C. (`--root-path /api` để Swagger sinh đúng đường dẫn sau nginx.)

## 8. Frontend :3000

> ⚠️ `NEXT_PUBLIC_API_URL` nướng vào bundle lúc build — đổi IP/domain là phải build lại.

```
cd ~/deepguard/frontend
bun install
NEXT_PUBLIC_API_URL=http://deepguard.ddns.net/api bun run build
cp -r .next/static .next/standalone/.next/
cp -r public .next/standalone/
```

(2 dòng `cp` vì chạy server standalone trực tiếp — thiếu thì CSS/JS 404.)

## 9. systemd — 4 service tự sống qua reboot

Tạo 4 file unit bằng nano. File 1:

```
sudo nano /etc/systemd/system/deepguard-sfdct.service
```

```
[Unit]
Description=DeepGuard SFDCT inference :8501
After=network.target

[Service]
User=ubuntu
WorkingDirectory=/home/ubuntu/deepguard/app
EnvironmentFile=-/home/ubuntu/deepguard/app/serving/serving.env
ExecStart=/home/ubuntu/deepguard/app/.venv-serve/bin/uvicorn serving.infer_server:app --host 127.0.0.1 --port 8501
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

File 2 `deepguard-liveness.service`: giống file 1, đổi Description + `serving.liveness_server:app` + port `8502`.

File 3 `sudo nano /etc/systemd/system/deepguard-api.service`:

```
[Unit]
Description=DeepGuard API :8000
After=network.target docker.service

[Service]
User=ubuntu
WorkingDirectory=/home/ubuntu/deepguard/backend
ExecStart=/home/ubuntu/deepguard/backend/.venv/bin/uvicorn app.main:app --host 127.0.0.1 --port 8000 --root-path /api
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

File 4 `sudo nano /etc/systemd/system/deepguard-fe.service`:

```
[Unit]
Description=DeepGuard Frontend :3000
After=network.target

[Service]
User=ubuntu
WorkingDirectory=/home/ubuntu/deepguard/frontend
Environment=NODE_ENV=production
ExecStart=/home/ubuntu/.bun/bin/bun .next/standalone/server.js
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

Kích hoạt cả 4:

```
sudo systemctl daemon-reload
sudo systemctl enable --now deepguard-sfdct deepguard-liveness deepguard-api deepguard-fe
sudo systemctl status deepguard-api --no-pager
```

## 10. Nginx reverse proxy (BẢN CUỐI — đã gồm fix gzip §11.1)

```
sudo nano /etc/nginx/sites-available/deepguard
```

```
server {
    listen 80 default_server;
    server_name _;
    client_max_body_size 200m;

    location /api/ {
        proxy_pass http://127.0.0.1:8000/;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_read_timeout 300s;
    }
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header Accept-Encoding "";
    }
}
```

(dấu `/` cuối ở `proxy_pass :8000/` = cắt prefix `/api` · dòng `Accept-Encoding ""` = fix màn hình trắng, xem §11.1)

```
sudo ln -sf /etc/nginx/sites-available/deepguard /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
```

---

## 11. Nhật ký sự cố & fix (lúc nghiệm thu)

### 11.1 Trang chủ TRẮNG TINH, console không lỗi — ĐÃ FIX ✅

- **Hiện tượng**: `http://deepguard.ddns.net/api/docs` chạy nhưng trang chủ trắng/xám mãi.
- **Nguyên nhân**: Next.js standalone chạy dưới **Bun** lỗi nén gzip — response nén bị đứt giữa chừng (HTML dừng ở ~12KB, CSS 0 byte, JS đứng ở 180KB). Chrome luôn xin gzip → trang không bao giờ tải xong. curl không nén thì OK nên ban đầu "tưởng server ổn".
- **Fix**: thêm `proxy_set_header Accept-Encoding "";` vào khối `location /` của nginx (đã nằm trong config §10) → Bun trả dữ liệu thô, nginx tự nén đúng cách. 1 dòng, không cần rebuild.
- **Verify từ ngoài**: trang chủ + CSS + JS tải trọn < 2s với header `Accept-Encoding: gzip`.

### 11.2 Đăng ký báo "Unexpected token 'I', Internal S..." + login demo 401 — fix theo 4 bước

- **Nguyên nhân kép**:
  - `requirements.txt` ghi `passlib[bcrypt]==1.7.4` nhưng KHÔNG khoá bcrypt → EC2 cài bcrypt 5.x → hash mật khẩu nổ → register 500, và `seed.py` chết ngay dòng hash → bảng users rỗng → login 401 mọi mật khẩu.
  - (Trên máy local còn thêm lỗi enum `tenant_status` trong Postgres thiếu nhãn `PENDING` — DB tạo từ code cũ. Đã vá local bằng `ALTER TYPE`.)
- **Fix trên EC2** (web terminal):

```
sudo journalctl -u deepguard-api -n 40 --no-pager
```

(xem lỗi thật — dòng cuối có `bcrypt` hoặc `tenant_status`)

```
cd /home/ubuntu/deepguard/backend
source .venv/bin/activate
pip install bcrypt==4.0.1
sudo docker exec deepguard-db psql -U postgres -d deepguard -c "ALTER TYPE tenant_status ADD VALUE IF NOT EXISTS 'PENDING' BEFORE 'ACTIVE';"
python3 scripts/seed.py
sudo systemctl restart deepguard-api
sudo docker exec deepguard-db psql -U postgres -d deepguard -c "SELECT email, role FROM users ORDER BY email;"
```

lệnh cuối phải liệt kê 5 tài khoản demo.

### 11.3 Đính chính mật khẩu demo

5 tài khoản demo theo role dùng **`Password123!`** (KHÔNG phải `DeepGuard@2024` — bản đó chỉ cho user bulk trong seed).

---

## 12. [MÀN HÌNH] Nghiệm thu trên trình duyệt

1. **Ctrl+Shift+R** tại `http://deepguard.ddns.net` → landing page hiện.
2. `http://deepguard.ddns.net/api/docs` → Swagger.
3. Đăng ký tổ chức mới (vd FPT) → màn "chờ quản trị nền tảng phê duyệt".
4. Login `sysadmin@deepguard.vn` / `Password123!` → Dashboard sysadmin → trang **Tenants** → Activate tenant vừa đăng ký.
5. Login `dev@vietbank.vn` / `Password123!` → **Playground** → upload ảnh → thấy risk_score + heatmap.

## 13. Vận hành hằng ngày

```
sudo systemctl status deepguard-api deepguard-fe deepguard-sfdct deepguard-liveness --no-pager
sudo journalctl -u deepguard-api -n 50 --no-pager
sudo systemctl restart deepguard-api deepguard-fe
```

Cập nhật code mới (sau khi push lên GitHub):

```
cd ~/deepguard/app
git pull
serving/redeploy.sh code
sudo systemctl restart deepguard-api
```

FE đổi code thì build lại (§8) rồi `sudo systemctl restart deepguard-fe`.

**Tắt máy khi không dùng** (Console → chọn instance → Instance state → **Stop**; Elastic IP giữ nguyên nên bật lại không phải build lại FE). **Sau bảo vệ**: Terminate instance → Release Elastic IP → xoá EBS volume → đổi/khoá mật khẩu seed.

## 12. Stop/Start instance — runbook 0 lệnh (chốt 12/6/2026)

**Stop**: Console → Instance state → Stop. Không cần lệnh gì trên máy.

**Start lại**: Console → Start → đợi ~2 phút (`2/2 checks`) → verify từ máy bất kỳ:

```
curl -s https://deepguard.ddns.net/api/health     # {"status":"ok",...} là xong
```

Toàn stack TỰ LÊN (đã kiểm chứng qua reboot 12/6): Docker Postgres (`--restart unless-stopped`)
+ 4 service deepguard + nginx + aaPanel + logfwd (đều `systemctl enable`).

Chỉ khi health FAIL sau 3 phút mới vào Instance Connect:

```
sudo systemctl status deepguard-api deepguard-fe deepguard-sfdct deepguard-liveness --no-pager
docker ps                                          # deepguard-db phải Up
sudo journalctl -u <tên-service> -n 50 --no-pager  # xem lỗi service failed
sudo systemctl restart <tên-service>
```

Giữ nguyên qua stop/start: Elastic IP (→ domain + SSL ok), data DB (EBS), code/model/env.
MẤT: cache inference trong RAM → trước demo chạy mỗi preset 1 lần để làm nóng.
Chi phí lúc stopped: ~$5–6/tháng (EBS ~$2.2 + IPv4 ~$3.6).
