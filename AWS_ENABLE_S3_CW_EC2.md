# Bật S3 + CloudWatch thật + cập nhật code trên EC2 (deepguard-demo)

> Chạy trong **EC2 Instance Connect** (terminal web của instance). KHÔNG commit file này.
> EC2 chạy ON EC2 nên dùng **IAM Role** — KHÔNG cần dán access key.

## PREREQ (làm 1 lần trên AWS Console — không script được)

Gắn IAM Role cho instance:
1. EC2 → chọn `deepguard-demo` → **Actions → Security → Modify IAM role**.
2. Nếu chưa có role: IAM → Roles → Create role → trusted entity **EC2** → gắn policy
   **AmazonS3FullAccess** + **CloudWatchFullAccess** (hoặc siết: chỉ 1 bucket + `CloudWatchLogsFullAccess`).
3. Quay lại Modify IAM role → chọn role vừa tạo → **Update**.

(Không cần restart instance — role có hiệu lực ngay.)

---

## BLOCK dán-1-phát (EC2 Instance Connect)

```bash
# ── 0. Tên bucket (toàn cầu phải duy nhất — sửa nếu muốn) ──
BUCKET="deepguard-evidence-$(date +%s)"
echo "BUCKET=$BUCKET"

# ── 1. aws cli + kiểm IAM role đã ăn chưa ──
if ! command -v aws >/dev/null; then sudo apt-get update -y && sudo apt-get install -y awscli; fi
aws sts get-caller-identity                      # PHẢI in ra Account/Arn — nếu lỗi: chưa gắn IAM role (xem PREREQ)
aws s3 mb "s3://$BUCKET" --region us-east-1       # tạo bucket (mặc định private, block public)

# ── 2. Cập nhật code lên newfe_2 (history tag, Detail Grad-CAM, mật khẩu tạm 123456, cap frame video, AWS_ENDPOINT_URL) ──
cd ~/deepguard/app
git fetch --depth 1 origin newfe_2:newfe_2
git checkout newfe_2
git log --oneline -1

# ── 3. Bật S3 + CloudWatch trong backend/.env (idempotent, KHÔNG đặt AWS_ENDPOINT_URL → dùng AWS thật) ──
cd ~/deepguard/backend
sed -i '/^S3_BUCKET=/d;/^S3_REGION=/d;/^CW_METRIC_NAMESPACE=/d;/^CW_REGION=/d;/^AWS_ENDPOINT_URL=/d' .env
printf 'S3_BUCKET=%s\nS3_REGION=us-east-1\nCW_METRIC_NAMESPACE=DeepGuard\nCW_REGION=us-east-1\n' "$BUCKET" >> .env
tail -7 .env

# ── 4. Rebuild frontend (FE đã đổi code) ──
cd ~/deepguard/frontend
bun install
NEXT_PUBLIC_API_URL=http://deepguard.ddns.net/api bun run build
cp -r .next/static .next/standalone/.next/
cp -r public .next/standalone/

# ── 5. Restart toàn bộ service ──
sudo systemctl restart deepguard-api deepguard-fe deepguard-sfdct deepguard-liveness
sleep 3
curl -s http://127.0.0.1:8000/health && echo
```

## Verify (sau khi vào web chạy 1 detect ảnh ở Playground)

```bash
aws s3 ls "s3://$BUCKET/" --recursive        # phải thấy tenants/<id>/detections/<rid>_input.* + _heatmap.*
aws cloudwatch list-metrics --namespace DeepGuard --query 'Metrics[].MetricName' --output text   # Detections / ProbFake / ProcessingLatency
```

---

## Ghi chú
- Chỉ muốn **bật S3/CloudWatch** trên code hiện tại (không cập nhật tính năng mới): chạy **bước 1, 3, 5** (bỏ 2 và 4). Code S3/CloudWatch đã có sẵn trên report-finalize.
- DB **không cần migrate** (schema newfe_2 = report-finalize).
- `git checkout newfe_2` báo lỗi "local changes": chạy `git -C ~/deepguard/app status` xem; nếu chỉ là file không cần giữ thì `git -C ~/deepguard/app checkout -- .` rồi checkout lại.
- Muốn quay lại bản cũ: `cd ~/deepguard/app && git checkout dev-thanhln-report-finalize` + rebuild FE + restart.
- Tắt S3/CloudWatch: xoá 4 dòng trong `.env` rồi `sudo systemctl restart deepguard-api` (app chạy như cũ).
```
