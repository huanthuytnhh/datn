# AWS_DEPLOY_RUNBOOK — Deploy DeepGuard lên AWS (EC2 + S3 + CloudWatch)

> Mục tiêu: demo bảo vệ đồ án chạy thật trên cloud, chi phí ~vài chục nghìn VNĐ/ngày demo,
> tắt được khi không dùng. Kiến trúc cố tình đơn giản: **1 EC2 chạy đúng stack local**,
> cộng S3 (artifact) + CloudWatch (log) để có chương "AWS" trong báo cáo.

## 0. Kiến trúc & chi phí

```
Người dùng ──HTTP/HTTPS──▶ Nginx (EC2 :80)
                            ├── /        ──▶ Next.js  :3000  (frontend, standalone build)
                            └── /api/*   ──▶ FastAPI  :8000  (backend DeepGuard)
                                              ├──▶ PostgreSQL :5432 (Docker container)
                                              ├──▶ SFDCT     :8501 (serving/ trong repo datn, CPU)
                                              ├──▶ Liveness  :8502 (tuỳ chọn)
                                              ├──▶ S3 bucket  (heatmap/freq artifact — phase 2)
                                              └──▶ CloudWatch Logs (log forwarder — phase 2)
```

| Khoản | Cấu hình | Giá (ap-southeast-1, on-demand) |
|---|---|---|
| EC2 `t3.large` (2 vCPU, 8GB RAM) | đủ cho 2 server torch CPU + node + postgres | ~$0.105/h ≈ **$2.5/ngày** nếu chạy 24/7 |
| EBS 30GB gp3 (ổ đĩa, tính cả khi máy TẮT) | chứa code + ckpt + docker | ~$2.6/tháng |
| S3 + CloudWatch | free tier 5GB là thừa | ~$0 |

- **Mẹo tiết kiệm chính**: `Stop` instance khi không demo → chỉ trả tiền EBS. Bật lại mất ~1 phút
  (IP public sẽ ĐỔI trừ khi gắn Elastic IP — Elastic IP gắn vào máy đang chạy thì miễn phí,
  máy stop thì bị tính ~$3.6/tháng).
- `t3.micro` free tier (1GB RAM) KHÔNG đủ chạy torch — đừng cố.
- `t3.medium` (4GB) chạy được nếu bỏ liveness server, nhưng sát nút khi load 2 model; t3.large an toàn.
- GPU không cần: SFDCT B4 infer 1 ảnh trên CPU ~1–2s, đủ cho demo Playground; video thì chậm hơn
  (sample frame) — chấp nhận được cho demo.

## 1. Việc BẠN phải tự làm trên AWS Console (liên quan tài khoản/credentials)

1. Tạo tài khoản AWS (cần thẻ Visa/Master). Bật MFA cho root.
2. IAM → tạo user `deepguard-deploy`, KHÔNG quyền admin. Gắn 2 policy hẹp:
   - `AmazonS3FullAccess` tạm thời (phase 2 sẽ siết về 1 bucket — xem §7)
   - `CloudWatchLogsFullAccess` (phase 2)
   Tạo **Access key** cho user này → lưu vào trình quản lý mật khẩu, KHÔNG commit.
3. EC2 → Key Pairs → tạo key `deepguard-ec2` (ED25519), tải file `.pem` về `~/.ssh/`, `chmod 400`.

## 2. Tạo EC2 instance (Console, ~5 phút)

EC2 → Launch instance:
- **Name**: `deepguard-demo`
- **AMI**: Ubuntu Server 22.04 LTS (64-bit x86)
- **Type**: `t3.large`
- **Key pair**: `deepguard-ec2`
- **Network / Security group** (tạo mới `deepguard-sg`):
  - SSH 22 — Source: `My IP` (chỉ IP của bạn)
  - HTTP 80 — Source: `0.0.0.0/0`
  - HTTPS 443 — Source: `0.0.0.0/0`
  - **KHÔNG mở** 3000/8000/8501/8502/5432 — tất cả đi qua nginx.
- **Storage**: 30 GiB gp3
- Launch → chờ `Running`, ghi lại **Public IPv4** (gọi là `<IP>` từ đây).

```bash
ssh -i ~/.ssh/deepguard-ec2.pem ubuntu@<IP>
```

## 3. Cài nền trên EC2 (1 lần)

```bash
sudo apt update && sudo apt install -y nginx python3.11-venv python3-pip docker.io unzip
sudo usermod -aG docker ubuntu && newgrp docker

# Node 20 + bun (frontend standalone chạy bằng bun theo package.json)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - && sudo apt install -y nodejs
curl -fsSL https://bun.sh/install | bash && echo 'export PATH=$HOME/.bun/bin:$PATH' >> ~/.bashrc && source ~/.bashrc
```

## 4. Đưa code + model lên máy (clone 1 REPO duy nhất + 2 ckpt từ HF)

Toàn bộ code deploy nằm trong **một repo `datn`** nhánh `dev-thanhln-report-finalize`
(public, không cần token): backend + frontend + deepguard_db + `serving/` kèm closure
suy luận đã vendor (`tools/infer.py`, `training/{detectors,networks,loss,metrics}`,
`liveness/model_liveness.py`). KHÔNG cần clone DeepfakeBench.
2 file `ckpt_best.pth` (~70MB) KHÔNG trong git → tải từ HF `huanthuytnhh/deepfake`.
(Vì repo public: tuyệt đối không commit `.env`/key — hiện chỉ có `.env.example` tracked, đúng.)

```bash
# Chạy TRÊN EC2 (cửa sổ Instance Connect hoặc SSH)
mkdir -p ~/deepguard && cd ~/deepguard
git clone -b dev-thanhln-report-finalize --depth 1 https://github.com/huanthuytnhh/datn.git app
ln -s app/backend backend && ln -s app/frontend frontend && ln -s app/deepguard_db deepguard_db

# Checkpoint từ HF (repo HF public — không cần token)
# Đường dẫn đã verify bằng sha256 khớp ckpt đang serve local (2026-06-11):
#   SFDCT    sha 1c5f04fa… = runs/20260605-230747/ckpt/efficientnetb4_sfdct/ckpt_best.pth
#   Liveness sha 6ed8c9ee… = runs/liveness-20260606-100514/b4/ckpt_best_liveness.pth
cd app && pip install -q huggingface_hub
python3 - <<'EOF'
from huggingface_hub import hf_hub_download
import shutil
for src, dst in [
    ("runs/20260605-230747/ckpt/efficientnetb4_sfdct/ckpt_best.pth",
     "serving/naive_sfdct/ckpt_best.pth"),
    ("runs/liveness-20260606-100514/b4/ckpt_best_liveness.pth",
     "serving/liveness_b4/ckpt_best.pth"),
]:
    p = hf_hub_download("huanthuytnhh/deepfake", src)
    shutil.copy(p, dst)
    print("ok:", dst)
EOF
sha256sum serving/naive_sfdct/ckpt_best.pth serving/liveness_b4/ckpt_best.pth
# phải ra: 1c5f04fa…  và  6ed8c9ee…
```

Cập nhật về sau = 1 lệnh `serving/redeploy.sh` trong `~/deepguard/app` (chi tiết: `serving/README.md`):

```bash
serving/redeploy.sh code                            # update code: git pull + pip nếu requirements đổi + restart
serving/redeploy.sh model sfdct <hf_path> [version] # thay model mới: tự validate + backup + swap + restart
serving/redeploy.sh rollback sfdct                  # model mới tệ → quay về ckpt cũ ngay
```

(BE/FE update vẫn là `git pull` + build FE + `systemctl restart deepguard-api deepguard-fe`.)
`serving/naive_sfdct/config.yaml` đã đặt `pretrained: null` — KHÔNG cần file
ImageNet-pretrained 78MB (ckpt_best chứa đủ trọng số; đã đối chứng prob giống hệt
bản chạy trong DeepfakeBench — xem `serving/README.md`).

> Phương án dự phòng (không có mạng ra GitHub): `rsync` từ máy local —
> `rsync -avz -e "ssh -i ~/.ssh/deepguard-ec2.pem" --exclude node_modules --exclude .next --exclude __pycache__ --exclude .git backend frontend deepguard_db serving tools training liveness ubuntu@<IP>:~/deepguard/app/`.

## 5. Dựng từng service (theo đúng cách chạy local)

### 5.1 PostgreSQL (Docker)

```bash
docker run -d --name deepguard-db --restart unless-stopped \
  -e POSTGRES_DB=deepguard -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD='<MẬT_KHẨU_MỚI>' \
  -p 127.0.0.1:5432:5432 -v pgdata:/var/lib/postgresql/data postgres:15-alpine
```

(Chú ý `127.0.0.1:` — DB không lộ ra ngoài. Phụ lục A nếu muốn dùng RDS free tier cho "đẹp báo cáo".)

### 5.2 SFDCT serving :8501 (CPU)

```bash
cd /home/ubuntu/deepguard/app          # repo root = REPO của infer_server (cha của serving/)
python3.11 -m venv .venv-serve && source .venv-serve/bin/activate
# torch bản CPU (~200MB thay vì 2.5GB CUDA)
pip install torch torchvision --index-url https://download.pytorch.org/whl/cpu
pip install -r serving/requirements.txt
# Smoke test TRƯỚC khi đăng ký service (quy tắc smoke-test-before-deploy):
uvicorn serving.infer_server:app --host 127.0.0.1 --port 8501
# tab khác: curl http://127.0.0.1:8501/health  → {"ok":true,"device":"cpu",...}
# rồi test thật: curl -F "file=@anh.jpg" http://127.0.0.1:8501/predict
```

Nếu import lỗi thiếu package nào → `pip install` đúng package đó rồi thử lại
(danh sách trong `serving/requirements.txt` đã smoke-test đủ ngày 2026-06-11).

### 5.3 Liveness :8502 (tuỳ chọn — bỏ qua nếu muốn nhẹ RAM)

```bash
uvicorn serving.liveness_server:app --host 127.0.0.1 --port 8502
```

### 5.4 Backend :8000

```bash
cd /home/ubuntu/deepguard/backend
python3.11 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
```

Tạo `/home/ubuntu/deepguard/backend/.env` (KHÁC dev ở 4 điểm: mật khẩu DB, SECRET_KEY mới,
MOCK_ML=false, CORS trỏ IP public):

```env
DATABASE_URL=postgresql+asyncpg://postgres:<MẬT_KHẨU_MỚI>@127.0.0.1:5432/deepguard
SECRET_KEY=<chuỗi ngẫu nhiên 64 ký tự — python3 -c "import secrets;print(secrets.token_hex(32))">
MOCK_ML=false
SFDCT_INFER_URL=http://127.0.0.1:8501
LIVENESS_INFER_URL=http://127.0.0.1:8502
CORS_ORIGINS=http://<IP>
```

Seed dữ liệu demo rồi smoke test:

```bash
python3 scripts/seed.py
uvicorn app.main:app --host 127.0.0.1 --port 8000 --root-path /api
# curl http://127.0.0.1:8000/health
```

`--root-path /api` để Swagger `/api/docs` sinh đúng đường dẫn sau nginx.

### 5.5 Frontend :3000

⚠️ `NEXT_PUBLIC_API_URL` là biến **build-time** (nướng vào bundle lúc `next build`) — đổi IP là
phải build lại:

```bash
cd /home/ubuntu/deepguard/frontend
bun install
NEXT_PUBLIC_API_URL=http://<IP>/api bun run build
bun run start   # :3000
```

### 5.6 systemd — để service tự sống qua reboot

Tạo 4 unit (mẫu cho SFDCT, nhân bản cho backend/liveness/frontend):

```ini
# /etc/systemd/system/deepguard-sfdct.service
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

| Unit | WorkingDirectory | ExecStart |
|---|---|---|
| `deepguard-api` | `.../backend` | `.../backend/.venv/bin/uvicorn app.main:app --host 127.0.0.1 --port 8000 --root-path /api` |
| `deepguard-liveness` | `.../app` (repo root) | `... serving.liveness_server:app --host 127.0.0.1 --port 8502` |
| `deepguard-fe` | `.../frontend` | `/home/ubuntu/.bun/bin/bun .next/standalone/server.js` (thêm `Environment=NODE_ENV=production`) |

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now deepguard-sfdct deepguard-api deepguard-fe   # (+liveness nếu dùng)
```

## 6. Nginx reverse proxy

`/etc/nginx/sites-available/deepguard`:

```nginx
server {
    listen 80 default_server;
    server_name _;
    client_max_body_size 200m;   # khớp MAX_VIDEO_SIZE của backend

    location /api/ {
        proxy_pass http://127.0.0.1:8000/;   # dấu / cuối = cắt prefix /api
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_read_timeout 300s;             # video infer CPU chậm
    }
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
    }
}
```

```bash
sudo ln -sf /etc/nginx/sites-available/deepguard /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx
```

**Smoke test cuối** (từ máy local): mở `http://<IP>` → login `sysadmin@deepguard.vn / Password123!`
→ Playground upload ảnh → thấy risk_score + heatmap. `http://<IP>/api/docs` ra Swagger.

> Sau khi demo OK: đổi mật khẩu các seed account hoặc re-seed với mật khẩu khác —
> máy đang public trên Internet.

## 7. Phase 2 — S3 + CloudWatch (sau khi code storage.py như đã bàn)

Phần code backend (`app/services/storage.py`, wire vào detect/detections) làm theo hướng dẫn
đã chốt trong session. Phía AWS:

1. **S3**: Console → tạo bucket `deepguard-artifacts-<tên-bạn>` (region ap-southeast-1),
   GIỮ NGUYÊN "Block all public access" = ON. Management → Lifecycle rule: expire prefix
   `tenants/` sau 90 ngày (khớp comment `models.py:308`).
2. Siết IAM: thay `AmazonS3FullAccess` bằng inline policy chỉ `s3:PutObject` + `s3:GetObject`
   trên `arn:aws:s3:::deepguard-artifacts-<tên-bạn>/*`.
3. Thêm vào `backend/.env`: `S3_BUCKET=...`, `S3_REGION=ap-southeast-1`,
   `AWS_ACCESS_KEY_ID=...`, `AWS_SECRET_ACCESS_KEY=...` → `pip install boto3` → restart api.
4. **CloudWatch**: thêm middleware log-request (mẫu: `HarmonySeeker-ai/main.py:121-162`) ghi
   `backend/app.log`, copy `HarmonySeeker-ai/log_forwarder/push_to_cloudwatch.py` về
   `backend/scripts/`, đổi `LOG_GROUP_NAME=/deepguard/backend`, chạy bằng 1 systemd unit nữa.
   (Khi viết lại có thể bỏ khối xử lý `sequenceToken` — AWS đã bỏ yêu cầu này từ 2023.)

## 8. HTTPS (tuỳ chọn, nên có cho buổi bảo vệ)

IP trần không cấp được Let's Encrypt → lấy domain miễn phí DuckDNS (`deepguard-demo.duckdns.org`
trỏ về `<IP>`), rồi:

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d deepguard-demo.duckdns.org
```

Sau đó **build lại frontend** với `NEXT_PUBLIC_API_URL=https://deepguard-demo.duckdns.org/api`
và sửa `CORS_ORIGINS` tương ứng.

## 9. Vận hành & dọn dẹp

```bash
# Tắt khi không dùng (chỉ còn trả tiền EBS ~$2.6/tháng):
aws ec2 stop-instances --instance-ids <id>     # hoặc nút Stop trên Console
# Bật lại trước demo (IP đổi nếu không có Elastic IP → build lại FE hoặc dùng DuckDNS):
aws ec2 start-instances --instance-ids <id>
```

**Teardown sau bảo vệ**: Terminate instance → xoá EBS/Elastic IP/S3 bucket/log group → xoá
access key của `deepguard-deploy`. Kiểm tra Billing → Bills = $0 ở tháng kế tiếp.

## Phụ lục A — RDS free tier (tuỳ chọn, "đẹp báo cáo" hơn Postgres-trong-Docker)

Nếu tài khoản AWS < 12 tháng tuổi: RDS → Create database → PostgreSQL 15, template **Free tier**
(`db.t4g.micro`, 20GB), VPC cùng EC2, Security group chỉ cho phép inbound 5432 **từ `deepguard-sg`**,
Public access = No. Lấy endpoint → thay `DATABASE_URL` trong `backend/.env`. Đổi lại kiến trúc
trong báo cáo: "managed database (RDS) tách khỏi compute (EC2)".

## Phụ lục B — Toàn bộ lệnh AWS CLI (theo mẫu kiến trúc HarmonySeeker của Trí)

> Map mẫu Trí → DeepGuard: EC2+Elastic IP (toàn bộ app+ML), S3 (heatmap/video, secured),
> CloudWatch (log forwarder), CloudFront (HTTPS không cần domain — thay ACM+domain),
> Lambda+Mangum (gateway mỏng detect-image, đúng vai voiceseparator.py).
> Backend chính KHÔNG đặt lên Lambda: giới hạn payload ~6MB chặn upload ảnh 10MB/video 200MB.

### B0. Cài AWS CLI + đăng nhập (local, 1 lần — tự nhập key của bạn)

```bash
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o /tmp/awscliv2.zip
cd /tmp && unzip -q awscliv2.zip && sudo ./aws/install
aws configure   # Access key của IAM user deploy + region: ap-southeast-1 + output: json
export AWS_DEFAULT_REGION=ap-southeast-1
```

### B1. EC2 bằng CLI (thay cho thao tác Console ở §2)

```bash
aws ec2 create-key-pair --key-name deepguard-ec2 --key-type ed25519 \
  --query 'KeyMaterial' --output text > ~/.ssh/deepguard-ec2.pem && chmod 400 ~/.ssh/deepguard-ec2.pem

MYIP=$(curl -s https://checkip.amazonaws.com)
SG=$(aws ec2 create-security-group --group-name deepguard-sg \
  --description "DeepGuard demo" --query GroupId --output text)
aws ec2 authorize-security-group-ingress --group-id $SG --protocol tcp --port 22 --cidr ${MYIP}/32
aws ec2 authorize-security-group-ingress --group-id $SG --protocol tcp --port 80 --cidr 0.0.0.0/0
aws ec2 authorize-security-group-ingress --group-id $SG --protocol tcp --port 443 --cidr 0.0.0.0/0

AMI=$(aws ec2 describe-images --owners 099720109477 \
  --filters "Name=name,Values=ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*" \
  --query 'sort_by(Images,&CreationDate)[-1].ImageId' --output text)
aws ec2 run-instances --image-id $AMI --instance-type t3.large \
  --key-name deepguard-ec2 --security-group-ids $SG \
  --block-device-mappings '[{"DeviceName":"/dev/sda1","Ebs":{"VolumeSize":30,"VolumeType":"gp3"}}]' \
  --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=deepguard-demo}]'
IID=$(aws ec2 describe-instances --filters Name=tag:Name,Values=deepguard-demo \
  Name=instance-state-name,Values=running \
  --query 'Reservations[0].Instances[0].InstanceId' --output text)
```

### B2. Elastic IP — IP tĩnh (mẫu Trí mục 7)

```bash
ALLOC=$(aws ec2 allocate-address --query AllocationId --output text)
aws ec2 associate-address --instance-id $IID --allocation-id $ALLOC
EIP=$(aws ec2 describe-addresses --allocation-ids $ALLOC --query 'Addresses[0].PublicIp' --output text)
EIP_DNS=$(aws ec2 describe-instances --instance-ids $IID \
  --query 'Reservations[0].Instances[0].PublicDnsName' --output text)   # cần cho CloudFront origin
echo "EIP=$EIP  DNS=$EIP_DNS"
```

Sau đó dựng app trên máy theo §3–§6 (rsync → venv → systemd → nginx), thay `<IP>` = `$EIP`.

### B3. S3 — lưu heatmap/video, ĐẢM BẢO SECURITY (mẫu Trí mục 3)

```bash
BUCKET=deepguard-media-$(whoami)-$RANDOM
aws s3api create-bucket --bucket $BUCKET \
  --create-bucket-configuration LocationConstraint=ap-southeast-1

# (1) Chặn mọi public access — chỉ truy cập qua presigned URL
aws s3api put-public-access-block --bucket $BUCKET --public-access-block-configuration \
  BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true
# (2) Mã hoá at-rest mặc định
aws s3api put-bucket-encryption --bucket $BUCKET --server-side-encryption-configuration \
  '{"Rules":[{"ApplyServerSideEncryptionByDefault":{"SSEAlgorithm":"AES256"}}]}'
# (3) Từ chối mọi kết nối không-TLS
aws s3api put-bucket-policy --bucket $BUCKET --policy "{\"Version\":\"2012-10-17\",\"Statement\":[{\"Sid\":\"DenyInsecure\",\"Effect\":\"Deny\",\"Principal\":\"*\",\"Action\":\"s3:*\",\"Resource\":[\"arn:aws:s3:::$BUCKET\",\"arn:aws:s3:::$BUCKET/*\"],\"Condition\":{\"Bool\":{\"aws:SecureTransport\":\"false\"}}}]}"
# (4) Tự xoá media sau 90 ngày (khớp comment models.py:308)
aws s3api put-bucket-lifecycle-configuration --bucket $BUCKET --lifecycle-configuration \
  '{"Rules":[{"ID":"expire-tenant-media-90d","Status":"Enabled","Filter":{"Prefix":"tenants/"},"Expiration":{"Days":90}}]}'

# (5) IAM user RIÊNG cho backend, quyền hẹp đúng bucket + log group này
aws iam create-user --user-name deepguard-backend
aws iam put-user-policy --user-name deepguard-backend --policy-name deepguard-runtime \
  --policy-document "{\"Version\":\"2012-10-17\",\"Statement\":[
    {\"Effect\":\"Allow\",\"Action\":[\"s3:PutObject\",\"s3:GetObject\"],\"Resource\":\"arn:aws:s3:::$BUCKET/*\"},
    {\"Effect\":\"Allow\",\"Action\":[\"logs:CreateLogStream\",\"logs:PutLogEvents\",\"logs:DescribeLogStreams\"],\"Resource\":\"arn:aws:logs:ap-southeast-1:*:log-group:/deepguard/*\"}]}"
aws iam create-access-key --user-name deepguard-backend
# → AccessKeyId/SecretAccessKey điền vào backend/.env (S3_BUCKET=$BUCKET, S3_REGION=ap-southeast-1)
```

Code phía backend (storage.py + wire detect/detections) làm theo hướng dẫn đã chốt — hạ tầng
trên là đủ để presigned URL hoạt động ngay khi code xong.

### B4. CloudWatch Logs (mẫu Trí mục 6)

```bash
aws logs create-log-group --log-group-name /deepguard/backend
aws logs put-retention-policy --log-group-name /deepguard/backend --retention-in-days 30
```

Trên EC2: thêm middleware log-request (mẫu `HarmonySeeker-ai/main.py:121-162`) ghi `app.log`,
copy `push_to_cloudwatch.py` → `backend/scripts/`, sửa `LOG_GROUP_NAME=/deepguard/backend`,
chạy bằng systemd unit `deepguard-logfwd` (giống unit §5.6, ExecStart=`python3 scripts/push_to_cloudwatch.py`).
Cảnh báo lỗi qua email (tuỳ chọn):

```bash
TOPIC=$(aws sns create-topic --name deepguard-alerts --query TopicArn --output text)
aws sns subscribe --topic-arn $TOPIC --protocol email --notification-endpoint <email-bạn>
aws logs put-metric-filter --log-group-name /deepguard/backend --filter-name errors \
  --filter-pattern '"ERROR"' \
  --metric-transformations metricName=BackendErrors,metricNamespace=DeepGuard,metricValue=1
aws cloudwatch put-metric-alarm --alarm-name deepguard-backend-errors \
  --namespace DeepGuard --metric-name BackendErrors --statistic Sum --period 300 \
  --threshold 5 --comparison-operator GreaterThanOrEqualToThreshold \
  --evaluation-periods 1 --alarm-actions $TOPIC
```

### B5. CloudFront — HTTPS không cần mua domain (thay vai CloudFront+ACM mục 4–5)

Làm trên Console cho nhanh (CLI cần JSON ~60 dòng): CloudFront → **Create distribution**:
- Origin domain: dán `$EIP_DNS` (PHẢI là DNS name, không dán IP trần) · Protocol: **HTTP only**, port 80
- Default behavior: Allowed methods **GET,HEAD,OPTIONS,PUT,POST,PATCH,DELETE** ·
  Cache policy **CachingDisabled** · Origin request policy **AllViewer**
- WAF: tắt (đỡ phí) → Create, chờ `Deployed` → nhận `https://dxxxxxxxx.cloudfront.net`

Sau đó trên EC2 (IP đổi vai bằng domain CloudFront):

```bash
# build lại FE trỏ qua CloudFront + sửa CORS
cd ~/deepguard/frontend && NEXT_PUBLIC_API_URL=https://<dxxx>.cloudfront.net/api bun run build
sed -i 's|^CORS_ORIGINS=.*|CORS_ORIGINS=https://<dxxx>.cloudfront.net|' ~/deepguard/backend/.env
sudo systemctl restart deepguard-api deepguard-fe
```

ACM chỉ cần khi có domain riêng: request cert ở **us-east-1**, validate DNS, gắn
Alternate domain name vào distribution — ghi vào báo cáo là "hướng mở rộng".

### B6. Lambda + Mangum — gateway mỏng detect-image (mẫu Trí mục 2, đúng vai voiceseparator.py)

Chỉ nhận ảnh ≤~5MB (giới hạn payload Lambda ~6MB); video vẫn đi đường CloudFront→EC2.

```bash
mkdir -p ~/deepguard-lambda && cd ~/deepguard-lambda
cat > lambda_function.py <<'PY'
"""Gateway mỏng kiểu voiceseparator.py: nhận ảnh + API key, forward sang backend (HTTPS CloudFront)."""
import os
import httpx
from fastapi import FastAPI, UploadFile, File, Header
from mangum import Mangum

BACKEND = os.environ["BACKEND_BASE"]  # https://<dxxx>.cloudfront.net/api
app = FastAPI()

@app.post("/edge/detect-image")
async def detect(file: UploadFile = File(...), authorization: str | None = Header(None)):
    async with httpx.AsyncClient(timeout=120) as client:
        r = await client.post(
            f"{BACKEND}/v1/detect/image",
            files={"file": (file.filename, await file.read(), file.content_type)},
            headers={"Authorization": authorization or ""},
        )
    return r.json()

handler = Mangum(app)
PY

# Đóng gói kiểu build_api.sh của Trí: site-packages + source vào 1 zip
python3 -m pip install --target package "fastapi" "mangum" "httpx" "python-multipart"
cd package && zip -qr ../edge.zip . && cd .. && zip -q edge.zip lambda_function.py

ROLE=$(aws iam create-role --role-name deepguard-lambda-role --assume-role-policy-document \
  '{"Version":"2012-10-17","Statement":[{"Effect":"Allow","Principal":{"Service":"lambda.amazonaws.com"},"Action":"sts:AssumeRole"}]}' \
  --query Role.Arn --output text)
aws iam attach-role-policy --role-name deepguard-lambda-role \
  --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole
sleep 10  # đợi role propagate

aws lambda create-function --function-name deepguard-edge --runtime python3.12 \
  --handler lambda_function.handler --zip-file fileb://edge.zip --role $ROLE \
  --timeout 60 --memory-size 512 \
  --environment "Variables={BACKEND_BASE=https://<dxxx>.cloudfront.net/api}"

# Function URL = endpoint HTTPS công khai (đơn giản hơn API Gateway; ghi báo cáo: tương đương)
aws lambda create-function-url-config --function-name deepguard-edge --auth-type NONE
aws lambda add-permission --function-name deepguard-edge --action lambda:InvokeFunctionUrl \
  --principal '*' --function-url-auth-type NONE --statement-id public

# Test (API key tạo từ dashboard):
curl -X POST "https://<url-lambda>.lambda-url.ap-southeast-1.on.aws/edge/detect-image" \
  -H "Authorization: Bearer dg_..." -F "file=@test.jpg"
```

Bonus cho báo cáo: log của Lambda TỰ ĐỘNG vào CloudWatch (`/aws/lambda/deepguard-edge`) —
không cần forwarder, đối chiếu đẹp với đường EC2 phải tự đẩy log.

### B7. Teardown bằng CLI (sau bảo vệ)

```bash
aws lambda delete-function --function-name deepguard-edge
aws ec2 terminate-instances --instance-ids $IID
aws ec2 release-address --allocation-id $ALLOC          # Elastic IP — nhớ release kẻo bị tính phí
aws s3 rb s3://$BUCKET --force
aws logs delete-log-group --log-group-name /deepguard/backend
# CloudFront: Console → Disable → đợi → Delete. IAM: xoá access key + user deepguard-backend.
```

## Phụ lục C — Thao tác HOÀN TOÀN bằng giao diện AWS Console (click-by-click)

> Bản "bằng chuột" của Phụ lục B — cùng kết quả, không cần cài AWS CLI.
> Quy tắc chung cho MỌI màn hình:
> - **Region**: góc trên-phải Console phải luôn là **Asia Pacific (Singapore) ap-southeast-1**
>   (riêng CloudFront là service Global — không có chọn region, đó là bình thường).
> - Tìm service: gõ tên (EC2, S3, CloudWatch…) vào **ô search trên cùng** rồi Enter.
> - Thứ tự làm: C1 → C2 (EC2 + Elastic IP) → cài app qua trình duyệt (C3) → C4 (S3) →
>   C5 (IAM key cho backend) → C6 (CloudWatch) → C7 (CloudFront) → C8 (Lambda) → C9 (teardown).

### C1. EC2 — đã có sẵn ở §1–§2 (vốn là hướng dẫn Console)

Làm đúng §1 (tài khoản + IAM `deepguard-deploy` + key pair) và §2 (Launch instance với
security group 22-My IP/80/443). Không cần làm lại B1.

### C2. Elastic IP — IP tĩnh (mẫu Trí mục 7)

1. Search **EC2** → menu trái → **Network & Security → Elastic IPs**.
2. Nút cam **Allocate Elastic IP address** → giữ mặc định (Amazon pool) → **Allocate**.
3. Chọn dòng IP vừa tạo → **Actions → Associate Elastic IP address**:
   - **Resource type**: Instance
   - **Instance**: chọn `deepguard-demo`
   - → **Associate**.
4. Ghi lại 2 thứ (cần về sau):
   - **Elastic IP** (vd `54.x.x.x`) — đây là `<IP>` dùng trong §4–§6.
   - Vào **EC2 → Instances → chọn instance → tab Details → Public IPv4 DNS**
     (dạng `ec2-54-x-x-x.ap-southeast-1.compute.amazonaws.com`) — đây là **origin cho CloudFront** ở C7.

> 💸 Elastic IP miễn phí KHI đang gắn vào instance đang chạy. Nếu Stop instance lâu ngày
> hoặc quên release sau khi terminate → bị tính ~$0.005/giờ.

### C3. Cài app KHÔNG cần SSH từ máy local — terminal ngay trong trình duyệt

Không có giao diện kéo-thả nào thay được việc cài phần mềm BÊN TRONG server,
nhưng bạn không cần mở terminal ở máy mình:

1. **EC2 → Instances** → chọn `deepguard-demo` → nút **Connect** (trên cùng).
2. Tab **EC2 Instance Connect** → user `ubuntu` → **Connect**
   → mở ra **một cửa sổ terminal ngay trong trình duyệt**.
3. Dán lần lượt các lệnh ở **§3 → §5 → §6** vào cửa sổ đó (cài nền, dựng service, nginx).
   Riêng bước `rsync` code (§4) chạy từ máy local — hoặc thay bằng
   `git clone` repo + tải ckpt từ HF ngay trong cửa sổ Instance Connect (không cần rsync).

### C4. S3 — tạo bucket BẢO MẬT bằng màn hình (mẫu Trí mục 3)

**Tạo bucket:**
1. Search **S3** → **Create bucket**.
2. **Bucket name**: `deepguard-media-<tên-bạn>-<số bất kỳ>` (phải duy nhất toàn cầu, vd `deepguard-media-thanhln-2026`).
3. **Region**: ap-southeast-1.
4. **Block Public Access settings**: GIỮ NGUYÊN ✅ **Block all public access** (mặc định đã bật cả 4 ô — đừng bỏ tick).
5. **Default encryption**: giữ **SSE-S3 (Amazon S3 managed keys)** — mặc định đã đúng.
6. **Create bucket**.

**Chính sách "chỉ chấp nhận TLS" (deny non-HTTPS):**
1. Mở bucket → tab **Permissions** → khung **Bucket policy** → **Edit** → dán (THAY `TÊN-BUCKET` 2 chỗ):
```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Sid": "DenyInsecureTransport",
    "Effect": "Deny",
    "Principal": "*",
    "Action": "s3:*",
    "Resource": ["arn:aws:s3:::TÊN-BUCKET", "arn:aws:s3:::TÊN-BUCKET/*"],
    "Condition": {"Bool": {"aws:SecureTransport": "false"}}
  }]
}
```
2. **Save changes**.

**Tự xoá sau 90 ngày (khớp ghi chú `heatmap_url` trong models.py):**
1. Tab **Management** → **Create lifecycle rule**.
2. **Rule name**: `expire-tenant-media-90d`.
3. **Choose a rule scope** → *Limit the scope... using filters* → **Prefix**: `tenants/`.
4. **Lifecycle rule actions**: tick ✅ **Expire current versions of objects** → **Days after object creation**: `90`.
5. **Create rule**.

### C5. IAM — access key riêng cho backend (quyền hẹp)

1. Search **IAM** → menu trái **Users** → **Create user**.
2. **User name**: `deepguard-backend`. KHÔNG tick "Provide user access to the AWS Management Console" → **Next**.
3. **Set permissions** → chọn **Attach policies directly** → đừng chọn policy nào vội → **Next** → **Create user**.
4. Mở user vừa tạo → tab **Permissions** → **Add permissions → Create inline policy**
   → tab **JSON** → dán (THAY `TÊN-BUCKET`):
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {"Effect": "Allow",
     "Action": ["s3:PutObject", "s3:GetObject"],
     "Resource": "arn:aws:s3:::TÊN-BUCKET/*"},
    {"Effect": "Allow",
     "Action": ["logs:CreateLogGroup", "logs:CreateLogStream", "logs:PutLogEvents", "logs:DescribeLogStreams"],
     "Resource": "arn:aws:logs:ap-southeast-1:*:log-group:/deepguard/*"}
  ]
}
```
   → **Next** → **Policy name**: `deepguard-runtime` → **Create policy**.
5. Tab **Security credentials** → khung **Access keys** → **Create access key**:
   - Use case: **Application running outside AWS** → Next → **Create access key**.
   - **Copy ngay cả 2 giá trị** (Secret chỉ hiện 1 lần) → điền vào `backend/.env` trên EC2:
     `AWS_ACCESS_KEY_ID=...`, `AWS_SECRET_ACCESS_KEY=...`, `S3_BUCKET=TÊN-BUCKET`, `S3_REGION=ap-southeast-1`.

### C6. CloudWatch — log group + cảnh báo email (mẫu Trí mục 6)

**Log group:**
1. Search **CloudWatch** → menu trái **Logs → Log groups** → **Create log group**.
2. **Name**: `/deepguard/backend` · **Retention**: 1 month (30 days) → **Create**.

**(Tuỳ chọn) Cảnh báo email khi backend lỗi nhiều:**
1. Trong log group `/deepguard/backend` → tab **Metric filters** → **Create metric filter**:
   - **Filter pattern**: `ERROR` → Next.
   - **Filter name**: `backend-errors` · **Metric namespace**: `DeepGuard` ·
     **Metric name**: `BackendErrorCount` · **Metric value**: `1` → Next → **Create**.
2. Menu trái **Alarms → All alarms** → **Create alarm** → **Select metric**
   → `DeepGuard → BackendErrorCount`:
   - **Statistic**: Sum · **Period**: 5 minutes.
   - **Threshold**: Greater/Equal `5` → Next.
3. **Notification** → **Create new topic**: tên `deepguard-alerts`, nhập email của bạn
   → **Create topic** → Next → đặt tên alarm `deepguard-backend-errors` → **Create alarm**.
4. **Mở email → bấm "Confirm subscription"** (không confirm thì không bao giờ nhận cảnh báo).

> Nhớ: log chỉ chảy vào đây sau khi làm Phase-2 code (middleware ghi `app.log` + forwarder
> `deepguard-logfwd` trên EC2 — xem §7). Tạo trước log group thì forwarder chạy phát ăn ngay.

### C7. CloudFront — HTTPS miễn phí không cần domain (mẫu Trí mục 4–5)

1. Search **CloudFront** → **Create distribution**.
2. **Origin domain**: dán **Public IPv4 DNS** của EC2 lấy ở C2 bước 4
   (`ec2-...compute.amazonaws.com`) — KHÔNG dán IP trần, CloudFront không nhận.
3. **Protocol**: chọn **HTTP only** · port `80` (EC2 chưa có cert, TLS sẽ kết thúc ở CloudFront).
4. **Default cache behavior**:
   - **Viewer protocol policy**: Redirect HTTP to HTTPS.
   - **Allowed HTTP methods**: **GET, HEAD, OPTIONS, PUT, POST, PATCH, DELETE** (cần cho API upload).
   - **Cache policy**: **CachingDisabled** (app động — đừng cache).
   - **Origin request policy**: **AllViewer** (chuyển nguyên Authorization header + body về EC2).
5. **Web Application Firewall (WAF)**: *Do not enable* (đỡ phí, demo đồ án).
6. **Create distribution** → chờ ~5–10 phút cột Status thành *Enabled* →
   ghi lại **Distribution domain name** dạng `dxxxxxxxx.cloudfront.net`.
7. Quay lại terminal Instance Connect (C3), build lại FE + sửa CORS để trỏ qua domain mới:
```bash
cd ~/deepguard/frontend
NEXT_PUBLIC_API_URL=https://dxxxxxxxx.cloudfront.net/api bun run build
sudo sed -i 's|^CORS_ORIGINS=.*|CORS_ORIGINS=https://dxxxxxxxx.cloudfront.net|' ~/deepguard/backend/.env
sudo systemctl restart deepguard-fe deepguard-api
```
8. Mở `https://dxxxxxxxx.cloudfront.net` — có ổ khoá HTTPS, không tốn đồng nào cho domain/cert.

> ACM (mẫu Trí mục 5) chỉ cần khi mua domain riêng: ACM **us-east-1** → Request certificate
> → validate DNS → gắn vào CloudFront (Alternate domain name). Ghi vào báo cáo là "hướng mở rộng".

### C8. Lambda + Mangum — gateway mỏng (mẫu Trí mục 2)

Lambda Console KHÔNG cài được thư viện (fastapi/mangum/httpx) bằng chuột — file zip vẫn phải
đóng gói 1 lần (lệnh ở B6, chạy ngay trong cửa sổ Instance Connect cũng được, rồi tải zip về máy
bằng lệnh `python3 -m http.server` + trình duyệt, hoặc đóng gói ở máy local). Sau khi có
`deepguard-edge.zip`, mọi bước còn lại đều bằng màn hình:

1. Search **Lambda** → **Create function** → **Author from scratch**:
   - **Function name**: `deepguard-edge` · **Runtime**: Python 3.12 · **Architecture**: x86_64.
   - **Permissions**: giữ mặc định *Create a new role with basic Lambda permissions*
     (role này tự có quyền ghi CloudWatch Logs — khỏi tạo tay như B6) → **Create function**.
2. Tab **Code** → **Upload from → .zip file** → chọn `deepguard-edge.zip` → **Save**.
3. Tab **Configuration → General configuration → Edit**: **Timeout** `1 min`, **Memory** `512 MB` → Save.
4. **Configuration → Environment variables → Edit → Add**:
   `BACKEND_BASE` = `https://dxxxxxxxx.cloudfront.net/api` → Save.
5. **Configuration → Function URL → Create function URL**:
   - **Auth type**: `NONE` (auth thật nằm ở API key DeepGuard trong header) → **Save**.
   - Ghi lại URL dạng `https://xxxx.lambda-url.ap-southeast-1.on.aws/`.
6. Test bằng Swagger/curl/Postman:
   `POST <FunctionURL>/edge/detect-image` + header `Authorization: Bearer dg_...` + form-data `file=@anh.jpg`.
7. Bằng chứng tích hợp cho báo cáo: **CloudWatch → Log groups → `/aws/lambda/deepguard-edge`**
   tự xuất hiện sau request đầu tiên.

### C9. Teardown bằng Console (sau bảo vệ — thứ tự này tránh sót phí)

1. **Lambda** → chọn `deepguard-edge` → **Actions → Delete**.
2. **CloudFront** → chọn distribution → **Disable** → chờ Status *Disabled* (vài phút) → **Delete**.
3. **EC2 → Instances** → chọn instance → **Instance state → Terminate instance**.
4. **EC2 → Elastic IPs** → chọn IP → **Actions → Release Elastic IP addresses** ← BƯỚC HAY QUÊN NHẤT, để lại là bị tính phí.
5. **S3** → chọn bucket → **Empty** (gõ xác nhận) → rồi **Delete**.
6. **CloudWatch → Log groups** → xoá `/deepguard/backend` và `/aws/lambda/deepguard-edge`.
7. **IAM → Users** → `deepguard-backend` → xoá access key → xoá user. (Giữ `deepguard-deploy` nếu còn dùng.)
8. Kiểm tra lần cuối: **Billing → Bills** sau 1–2 ngày xem còn dòng phí nào không.

## Checklist nhanh trước buổi demo

- [ ] `systemctl status deepguard-api deepguard-sfdct deepguard-fe` đều `active`
- [ ] `curl http://<IP>/api/health` ok; `curl http://127.0.0.1:8501/health` (trên EC2) ok
- [ ] Login 5 seed account theo `backend/docs/ROLE_FLOWS.md` — RBAC tour chạy
- [ ] Playground: ảnh thật + ảnh fake mẫu đã chuẩn bị sẵn trong máy demo
- [ ] (Phase 2) History detail hiện lại heatmap qua presigned URL
- [ ] CloudWatch console thấy log group `/deepguard/backend` nhận log
