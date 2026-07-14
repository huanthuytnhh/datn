# serving/ — ML inference servers (SFDCT deepfake :8501 + liveness :8502)

**Chạy độc lập từ repo này** — không cần clone DeepfakeBench. Mã suy luận cần thiết
đã được vendor vào repo (đồng bộ với DeepfakeBench nhánh `dev-thanhln-blockdct-hff`):

- `tools/infer.py` — load_model + Grad-CAM (infer_server nạp qua đường tương đối).
- `training/{detectors,networks,loss,metrics}/` — closure tối thiểu cho
  `efficientnetb4_sfdct` (registry DETECTOR/BACKBONE/LOSSFUNC; các detector khác
  thiếu file/dep sẽ tự skip với warning — vô hại).
- `liveness/model_liveness.py` — kiến trúc B4Liveness cho liveness_server.

## Deploy = clone 1 repo + tải 2 checkpoint từ HF

```bash
git clone -b dev-thanhln-report-finalize --depth 1 https://github.com/huanthuytnhh/datn.git
cd datn
pip install -r serving/requirements.txt   # EC2 CPU: cài torch bản CPU (xem ghi chú trong file)

# 2 checkpoint từ HF huanthuytnhh/deepfake (public, không cần token):
pip install -q huggingface_hub
python3 - <<'EOF'
from huggingface_hub import hf_hub_download
import shutil
for src, dst in [
    ("runs/20260605-230747/ckpt/efficientnetb4_sfdct/ckpt_best.pth",
     "serving/naive_sfdct/ckpt_best.pth"),
    ("runs/liveness-20260606-100514/b4/ckpt_best_liveness.pth",
     "serving/liveness_b4/ckpt_best.pth"),
]:
    shutil.copy(hf_hub_download("huanthuytnhh/deepfake", src), dst)
    print("ok:", dst)
EOF
sha256sum serving/naive_sfdct/ckpt_best.pth serving/liveness_b4/ckpt_best.pth
# phải ra: 1c5f04fa… (sfdct) và 6ed8c9ee… (liveness)

# Chạy từ repo root (REPO = thư mục cha của serving/):
uvicorn serving.infer_server:app    --host 0.0.0.0 --port 8501
uvicorn serving.liveness_server:app --host 0.0.0.0 --port 8502
```

Smoke nhanh: `curl localhost:8501/health` và `curl -F "file=@anh.jpg" localhost:8501/predict`.

## Cập nhật / re-deploy (1 lệnh)

`serving/redeploy.sh` lo trọn vòng cập nhật trên máy đã deploy (EC2 hoặc local):

```bash
serving/redeploy.sh code                              # update code: git pull + pip (nếu requirements đổi) + restart
serving/redeploy.sh model sfdct <NGUỒN> [VERSION]     # thay model: tải ckpt mới, backup bản cũ, swap, restart
serving/redeploy.sh rollback sfdct                    # model mới tệ → quay về ckpt cũ ngay (hoán đổi với .bak)
serving/redeploy.sh restart                           # chỉ restart cả 2 server
```

- `<NGUỒN>` nhận file `.pth` local **hoặc** path trong HF `huanthuytnhh/deepfake`
  (vd: `runs/<run-mới>/ckpt/efficientnetb4_sfdct/ckpt_best.pth`).
- Trước khi swap, script **kiểm tra ckpt load được bằng torch** — file hỏng/sai không bao giờ
  đè lên model đang chạy; bản cũ luôn còn ở `*.bak` để rollback.
- `[VERSION]` (tuỳ chọn) cập nhật nhãn `model_version` trả về ở `/health`, ghi vào
  `serving/serving.env` (không commit; mẫu ở `serving.env.example`). systemd nhận file env này
  khi unit có dòng `EnvironmentFile=-/home/ubuntu/deepguard/app/serving/serving.env`.
- Restart: tự dùng `systemctl restart deepguard-sfdct|deepguard-liveness` nếu có unit;
  không có (chạy tay) thì in lệnh `uvicorn` để chạy lại.

## Ghi chú kỹ thuật

- `serving/naive_sfdct/config.yaml` đặt `pretrained: null`: serving KHÔNG cần file
  ImageNet-pretrained 78MB — `ckpt_best.pth` chứa đủ trọng số đã train và
  `load_state_dict` đè toàn bộ. Đã đối chứng cùng ảnh với bản chạy trong
  DeepfakeBench (có pretrained): prob_fake giống hệt (0.017793).
- Env override: `SFDCT_CONFIG` / `SFDCT_CKPT` / `SFDCT_THRESHOLD` (mặc định 0.5),
  `LIVENESS_CKPT`; device tự chọn cuda/cpu.
- Checkpoint `.pth` KHÔNG nằm trong git (`.gitignore *.pth`) — luôn tải từ HF.

Backend gọi 2 server này qua env `SFDCT_INFER_URL` / `LIVENESS_INFER_URL`
(xem `backend/app/config.py`).
