# VAST_SETUP.md — Chạy DeepfakeBench + DCT trên Vast.ai

> Mẫu theo README bạn gửi (GroundingDINO/COCO), đổi sang DeepfakeBench + module DCT.
> Mục tiêu: SSH vào máy thuê → cài môi trường → tải data → clone fork của bạn → train thật.

---

## Bước 1 — SSH key (làm 1 lần trên máy của bạn)

```bash
ls -al ~/.ssh                                    # kiểm tra key có sẵn
ssh-keygen -t ed25519 -C "nduc90313@gmail.com"   # tạo key mới nếu chưa có
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519
cat ~/.ssh/id_ed25519.pub                         # copy nội dung này
```
- Dán public key vào https://cloud.vast.ai/manage-keys/ (ô SSH Keys).
- Thuê 1 instance: chọn **GPU 24GB (RTX 4090/3090)**, image **PyTorch (CUDA 11.x)**, disk ≥ 80GB.
- Copy lệnh SSH mà Vast cấp để kết nối vào máy.

---

## Bước 2 — Script setup (chạy NGAY khi vừa SSH vào máy Vast)

```bash
# --- 2.1 Gói hệ thống ---
apt-get update
apt-get install -y curl git-core wget unzip

# --- 2.2 git-lfs (cho checkpoint lớn) ---
curl -s https://packagecloud.io/install/repositories/github/git-lfs/script.deb.sh | bash \
  && apt-get install -y git-lfs && git lfs install

# --- 2.3 SSH key để clone fork private trên GitHub (nếu fork để private) ---
mkdir -p ~/.ssh && chmod 700 ~/.ssh
cat > ~/.ssh/id_ed25519 <<- 'EOM'
-----BEGIN OPENSSH PRIVATE KEY-----
   << DÁN PRIVATE KEY CỦA BẠN VÀO ĐÂY >>
-----END OPENSSH PRIVATE KEY-----
EOM
chmod 400 ~/.ssh/id_ed25519
ssh-keygen -F github.com || ssh-keyscan github.com >> ~/.ssh/known_hosts
git config --global user.email "nduc90313@gmail.com"
git config --global user.name "ducido"
```

---

## Bước 3 — Clone FORK của bạn (đã chứa 4 file DCT)

```bash
cd /workspace
git clone git@github.com:<your-username>/DeepfakeBench.git
cd DeepfakeBench
pip install -r requirements.txt
# nếu lỗi version: cài tay torch khớp CUDA của máy, ví dụ:
# pip install torch==1.12.1+cu113 torchvision==0.13.1+cu113 --extra-index-url https://download.pytorch.org/whl/cu113
pip install torch-dct                # cho phép DCT khả vi (nếu module DCT cần)
```

---

## Bước 4 — Tải DATA (preprocessed) + pretrained

> ⚠️ Folder Drive ID đổi theo thời gian → LẤY LINK MỚI từ mục "Download" của README repo DeepfakeBench. KHÔNG dùng link cũ chép sẵn. Chỉ tải 3 thứ: FF++ c23, Celeb-DF-v2, dataset_json.

```bash
pip install gdown
mkdir -p /workspace/DeepfakeBench/datasets
cd /workspace/DeepfakeBench/datasets

# Ví dụ MẪU (THAY <ID> bằng folder/file id thật từ README):
gdown --folder "https://drive.google.com/drive/folders/<FF++_FOLDER_ID>"        # FaceForensics++ c23
gdown --folder "https://drive.google.com/drive/folders/<CELEBDF_V2_FOLDER_ID>"  # Celeb-DF-v2
# Nếu gdown lỗi với folder lớn -> dùng rclone:
#   rclone copy gdrive:DeepfakeBench/FF++ ./FaceForensics++ -P

# JSON config (đặt vào preprocessing/dataset_json/)
cd /workspace/DeepfakeBench
mkdir -p preprocessing/dataset_json
gdown --folder "https://drive.google.com/drive/folders/<JSON_FOLDER_ID>" -O preprocessing/dataset_json/

# pretrained backbone EfficientNet-B4
mkdir -p training/pretrained
gdown "https://...efficientnet-b4-6ed6700e.pth" -O training/pretrained/efficientnet-b4-6ed6700e.pth
```

> Sau khi tải xong: mở `training/train_config.yaml` và `training/test_config.yaml`, sửa
> `rgb_dir` / `dataset_json_folder` trỏ về `/workspace/DeepfakeBench/datasets` và `.../dataset_json`.

---

## Bước 5 — TRAIN (full, đúng protocol)

> Bảo đảm config đã FULL: `nEpochs` (10), `frame_num:32`, `train_batchSize:32`, `lr:0.0002`.
> GIỮ CỐ ĐỊNH batch/lr/epoch cho cả B4 lẫn B4+DCT (để so sánh công bằng).

```bash
cd /workspace/DeepfakeBench

# 5.1 B4 baseline (MUST) — chạy trong tmux để không mất khi rớt SSH
tmux new -s b4
python training/train.py \
  --detector_path ./training/config/detector/efficientnetb4.yaml \
  --train_dataset "FaceForensics++" \
  --test_dataset "FaceForensics++" "Celeb-DF-v2"
# Ctrl+B rồi D để detach; "tmux attach -t b4" để xem lại

# 5.2 B4 + DCT (MUST)
python training/train.py \
  --detector_path ./training/config/detector/efficientnetb4_dct.yaml \
  --train_dataset "FaceForensics++" \
  --test_dataset "FaceForensics++" "Celeb-DF-v2"

# 5.3 (SHOULD) eval lại 1 checkpoint cụ thể trên Celeb-DF
python training/test.py \
  --detector_path ./training/config/detector/efficientnetb4_dct.yaml \
  --test_dataset "Celeb-DF-v2" \
  --weights_path ./logs/<đường_dẫn>/ckpt_best.pth
```

---

## Bước 6 — Lấy kết quả ra + TẮT máy

```bash
# Copy checkpoint + log + csv kết quả về máy bạn TRƯỚC khi tắt instance
# (chạy trên MÁY BẠN, không phải trên Vast):
scp -r root@<vast_ip>:-p <port> /workspace/DeepfakeBench/logs ./deepguard_logs
```
> ⚠️ **TẮT (Destroy/Stop) instance ngay khi xong** — Vast tính tiền cả lúc idle, và data trên đó MẤT khi destroy. Lần sau thuê lại phải tải data lần nữa (nhanh nếu từ Drive).

---

## Mẹo sống còn trên Vast
- Luôn chạy train trong **tmux** (rớt SSH không mất tiến độ).
- `save_ckpt: true` + `save_epoch: 1` → có checkpoint mỗi epoch, resume được nếu hết giờ.
- Theo dõi VRAM bằng `watch -n2 nvidia-smi`. Nếu OOM → giảm `train_batchSize` (nhớ giảm GIỐNG nhau cho mọi cấu hình).
- Đo `phút/epoch` ở batch đầu → ước tính tổng giờ → biết tốn ~bao nhiêu tiền.
