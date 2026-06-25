# Deploy `dev-thanhln-24062026` lên EC2 + bật S3 & CloudWatch — Manual

> Hướng dẫn tự làm 100%, không cần ai truy cập EC2. Làm lần lượt PHẦN 1 → 5.
> Nhánh này gồm: cascade endpoint, error-mapping, attack-type print/screen, i18n EN/VIE, FE hardening, nhãn model canonical.

---

## 0. Bức tranh tổng thể (hiểu trước khi làm)

**Cái gì chạy ở đâu:**
- **EC2 `deepguard-demo`** (`deepguard.ddns.net`) chạy 4 service systemd:
  - `deepguard-api` (backend :8000) · `deepguard-fe` (Next.js :3000) · `deepguard-sfdct` (serving deepfake :8501) · `deepguard-liveness` (serving :8502)
  - nginx phía trước → web vào qua `http://deepguard.ddns.net`, API qua prefix `/api`.
- **S3** = kho lưu bằng chứng (ảnh gốc + Grad-CAM). **CloudWatch** = số liệu (Detections/ProbFake/Latency).
- Code đã **env-switched**: bật bằng biến môi trường, không sửa code.

**3 nơi bạn thao tác:**
1. **Máy bạn (local WSL)** — push nhánh lên GitHub.
2. **AWS Console (trình duyệt)** — gắn IAM Role cho EC2.
3. **EC2 Instance Connect (terminal web của instance)** — chạy lệnh deploy.

**Cần có sẵn:** tài khoản AWS quản được instance `deepguard-demo`; tài khoản GitHub đẩy được `huanthuytnhh/datn`.

---

## PHẦN 1 — Local: push nhánh lên GitHub (máy bạn)

EC2 sẽ `git fetch` nhánh này, nên phải đẩy lên origin trước.

### 1.1 Tạo GitHub Personal Access Token (PAT) — nếu chưa có
GitHub đã bỏ mật khẩu cho git HTTPS, phải dùng token:
1. Vào https://github.com/settings/tokens → **Tokens (classic)** → **Generate new token (classic)**.
2. Note: `deepguard-deploy` · Expiration: 30 days · tick scope **`repo`** (toàn bộ).
3. **Generate token** → **copy** chuỗi `ghp_...` (chỉ hiện 1 lần — lưu tạm).

### 1.2 Push
Trong terminal WSL của bạn:
```bash
cd ~/deepguard/app
git push -u origin dev-thanhln-24062026
```
- Hỏi **Username**: gõ `huanthuytnhh`.
- Hỏi **Password**: **dán PAT** `ghp_...` (KHÔNG phải mật khẩu GitHub).

> Đỡ phải nhập lại lần sau: `git config --global credential.helper store` (lưu token plaintext ở `~/.git-credentials` — tiện cho máy cá nhân).

### 1.3 Xác nhận đã lên
```bash
git ls-remote --heads origin dev-thanhln-24062026
```
Phải in 1 dòng hash + tên nhánh. Có dòng đó = xong PHẦN 1.

---

## PHẦN 2 — AWS Console: gắn IAM Role cho EC2 (1 lần)

EC2 chạy ON AWS nên lấy quyền S3/CloudWatch qua **IAM Role** — KHÔNG dán access key.

1. Đăng nhập AWS Console → dịch vụ **EC2** → **Instances** → tick instance `deepguard-demo`.
2. **Actions → Security → Modify IAM role**.
3. Nếu dropdown **chưa có role phù hợp** → mở tab mới vào **IAM → Roles → Create role**:
   - Trusted entity type: **AWS service** → Use case: **EC2** → Next.
   - Add permissions: tìm và tick **AmazonS3FullAccess** + **CloudWatchFullAccess**
     (muốn siết chặt: chỉ `AmazonS3FullAccess` cho 1 bucket + `CloudWatchAgentServerPolicy`).
   - Name: `deepguard-ec2-s3-cw` → **Create role**.
4. Quay lại tab **Modify IAM role** → refresh dropdown → chọn `deepguard-ec2-s3-cw` → **Update IAM role**.

Có hiệu lực **ngay**, không cần restart instance.

---

## PHẦN 3 — EC2 Instance Connect: chạy deploy

### 3.1 Mở terminal web của instance
EC2 Console → **Instances** → tick `deepguard-demo` → nút **Connect** (góc trên) → tab **EC2 Instance Connect** → **Connect**.
→ Mở 1 terminal trong trình duyệt (user `ubuntu` hoặc `ec2-user`).

### 3.2 Dán cả block (giải thích từng cụm bên dưới)
```bash
# 0. Tên bucket (toàn cầu phải DUY NHẤT)
BUCKET="deepguard-evidence-$(date +%s)"; echo "BUCKET=$BUCKET"

# 1. aws cli + KIỂM IAM role đã ăn chưa
command -v aws >/dev/null || (sudo apt-get update -y && sudo apt-get install -y awscli)
aws sts get-caller-identity        # PHẢI ra Account/Arn. Lỗi = IAM role chưa gắn (làm lại PHẦN 2)
aws s3 mb "s3://$BUCKET" --region us-east-1     # tạo bucket (mặc định private, block public)

# 2. Cập nhật code → nhánh dev-thanhln-24062026
cd ~/deepguard/app
git fetch origin dev-thanhln-24062026:dev-thanhln-24062026
git checkout dev-thanhln-24062026
git log --oneline -1               # phải thấy commit i18n mới nhất (3d12176...)

# 3. Bật S3 + CloudWatch trong backend/.env (KHÔNG set AWS_ENDPOINT_URL → dùng AWS thật)
cd ~/deepguard/backend
sed -i '/^S3_BUCKET=/d;/^S3_REGION=/d;/^CW_METRIC_NAMESPACE=/d;/^CW_REGION=/d;/^AWS_ENDPOINT_URL=/d' .env
printf 'S3_BUCKET=%s\nS3_REGION=us-east-1\nCW_METRIC_NAMESPACE=DeepGuard\nCW_REGION=us-east-1\n' "$BUCKET" >> .env
tail -7 .env                       # kiểm 4 dòng vừa thêm, KHÔNG có AWS_ENDPOINT_URL

# 3b. boto3 có trong venv backend chưa (code import lazy)
.venv*/bin/python -c "import boto3; print('boto3', boto3.__version__)" || .venv*/bin/pip install boto3

# 4. Rebuild frontend (i18n + FE đổi nhiều)
cd ~/deepguard/frontend
bun install
NEXT_PUBLIC_API_URL=http://deepguard.ddns.net/api bun run build
cp -r .next/static .next/standalone/.next/ && cp -r public .next/standalone/

# 5. Restart hết (api + fe + 2 serving — P2/P3 đổi serving)
sudo systemctl restart deepguard-api deepguard-fe deepguard-sfdct deepguard-liveness
sleep 3 && curl -s http://127.0.0.1:8000/health && echo
```

**Giải thích cụm:**
- **0-1**: tạo bucket + chứng minh EC2 có quyền (sts get-caller-identity). Nếu lệnh này lỗi → IAM role chưa ăn, dừng lại sửa PHẦN 2.
- **2**: kéo đúng nhánh của bạn. `git log` phải ra commit mới.
- **3**: chỉ thêm 4 biến. **Quan trọng nhất:** KHÔNG có `AWS_ENDPOINT_URL` → boto3 trỏ AWS thật (có dòng này là trỏ về MinIO → sai).
- **4**: build lại Next.js vì i18n thêm rất nhiều file. *(EC2 nhỏ có thể hết RAM khi build — xem Sự cố.)*
- **5**: nạp code + .env mới. `/health` ra `{"ok":true...}` là backend sống.

---

## PHẦN 4 — Kiểm chứng

### 4.1 Tạo dữ liệu: vào web chạy 1 detect
- Mở `http://deepguard.ddns.net` → login → **API Playground** → upload 1 ảnh → Detect.
  *(Hoặc tạo API key rồi gọi `/api/v1/detect/image` — cách nào cũng ghi S3 + CloudWatch.)*

### 4.2 Kiểm S3 (trong terminal EC2)
```bash
aws s3 ls "s3://$BUCKET/" --recursive
```
Phải thấy `tenants/<id>/detections/<rid>_input.jpg` + `<rid>_heatmap.jpg`.

### 4.3 Kiểm CloudWatch
```bash
aws cloudwatch list-metrics --namespace DeepGuard --query 'Metrics[].MetricName' --output text
```
Phải in `Detections  ProbFake  ProcessingLatency`.

### 4.4 Xem biểu đồ (AWS Console)
CloudWatch → **Metrics → All metrics** → namespace **DeepGuard** → tick metric → tab **Graphed metrics** → đổi Statistic/Period → có thể **Actions → Add to dashboard** để có dashboard demo.

---

## REDEPLOY nhanh (mỗi lần có code mới) — 1 lệnh

Sau lần deploy đầu (repo đã có `redeploy.sh`), mỗi lần update chỉ cần:
```bash
cd ~/deepguard/app && ./redeploy.sh
```
Script tự: fetch nhánh hiện tại → ff-merge → `bun run build` → restart 4 service → check `/health`.
*(Không đụng `.env`, nên S3/CloudWatch đã bật vẫn giữ nguyên.)*

**Nếu thích gõ tay (3 cụm quen thuộc, không cần script):**
```bash
cd ~/deepguard/app && git fetch origin dev-thanhln-24062026 && git merge --ff-only FETCH_HEAD
cd ~/deepguard/frontend && bun install && NEXT_PUBLIC_API_URL=http://deepguard.ddns.net/api bun run build && cp -r .next/static .next/standalone/.next/ && cp -r public .next/standalone/
sudo systemctl restart deepguard-api deepguard-fe deepguard-sfdct deepguard-liveness
```

> Lần đầu `./redeploy.sh` báo "Permission denied": `chmod +x redeploy.sh` rồi chạy lại.
> Mất quen với `git pull`? Sửa EC2 1 lần: `git branch --set-upstream-to=origin/dev-thanhln-24062026` (sau khi `git config remote.origin.fetch '+refs/heads/*:refs/remotes/origin/*' && git fetch`), từ đó `git pull` chạy thẳng.

---

## PHẦN 5 — Tắt / Rollback

**Tắt S3+CloudWatch** (app chạy lại như cũ, không mất gì):
```bash
cd ~/deepguard/backend
sed -i '/^S3_BUCKET=/d;/^S3_REGION=/d;/^CW_METRIC_NAMESPACE=/d;/^CW_REGION=/d' .env
sudo systemctl restart deepguard-api
```

**Quay lại nhánh cũ:**
```bash
cd ~/deepguard/app && git checkout dev-thanhln-22062026
cd ~/deepguard/frontend && bun install && NEXT_PUBLIC_API_URL=http://deepguard.ddns.net/api bun run build
cp -r .next/static .next/standalone/.next/ && cp -r public .next/standalone/
sudo systemctl restart deepguard-api deepguard-fe deepguard-sfdct deepguard-liveness
```

---

## Sự cố thường gặp

| Triệu chứng | Nguyên nhân | Xử |
|---|---|---|
| `aws sts get-caller-identity` lỗi `Unable to locate credentials` | IAM role chưa gắn / chưa kịp ăn | Làm lại PHẦN 2, đợi ~30s, thử lại |
| `git checkout` báo *local changes* | EC2 có file đổi rác | `git -C ~/deepguard/app status`; nếu rác: `git -C ~/deepguard/app checkout -- .` rồi checkout lại |
| `bun run build` bị **Killed** (OOM) | EC2 RAM nhỏ | Thêm swap tạm: `sudo fallocate -l 2G /swapfile && sudo chmod 600 /swapfile && sudo mkswap /swapfile && sudo swapon /swapfile` rồi build lại |
| Service không lên | code/.env lỗi | `systemctl status deepguard-api` + `journalctl -u deepguard-api -n 50 --no-pager` |
| S3 vẫn rỗng sau detect | còn `AWS_ENDPOINT_URL` trong .env / S3_BUCKET trống | `grep -E 'S3_|AWS_ENDPOINT' ~/deepguard/backend/.env` — phải có S3_BUCKET, KHÔNG có AWS_ENDPOINT_URL; restart api |
| CloudWatch không có metric | namespace trống / quyền thiếu | kiểm `grep CW_ .env`; IAM role có CloudWatch policy |
| `bun: command not found` | shell mới chưa có PATH | `source ~/.bashrc` hoặc dùng đường dẫn đầy đủ `~/.bun/bin/bun` |

---

## Lưu ý khớp nhánh này
- **MODEL_VERSION**: không cần sửa `.env` EC2 — `config.py` default đã canonical; detection lấy nhãn từ serving cũng canonical.
- **Tenant "ACB Demo Bank" (PENDING)** chỉ ở DB local máy bạn, KHÔNG lên EC2 (DB riêng). Muốn demo "duyệt tenant" trên deploy → vào web deploy **Register** 1 tổ chức mới rồi login sysadmin duyệt.
- **i18n**: sau deploy, hard-refresh trình duyệt (Ctrl+Shift+R) để chắc nạp bundle mới.
