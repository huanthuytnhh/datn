# LOCAL_3060_SETUP.md — Dựng môi trường + smoke test trên RTX 3060

> Mục đích máy local: **debug + smoke**, KHÔNG train thật. Data tí xíu, 1 epoch.
> 3060 (~12GB) đủ chạy B4 ở 256px batch 8 trên subset nhỏ.

---

## Bước 1 — Môi trường (conda)

```bash
# Cài Miniconda nếu chưa có, rồi:
conda create -n deepguard python=3.8 -y
conda activate deepguard

# PyTorch khớp CUDA của 3060 (Ampere -> CUDA 11.x). Ví dụ:
pip install torch==1.12.1+cu113 torchvision==0.13.1+cu113 \
  --extra-index-url https://download.pytorch.org/whl/cu113

# Clone fork + cài requirements
git clone https://github.com/<your-username>/DeepfakeBench.git
cd DeepfakeBench
pip install -r requirements.txt
pip install torch-dct        # nếu module DCT cần

# Kiểm tra GPU nhận chưa:
python -c "import torch; print(torch.cuda.is_available(), torch.cuda.get_device_name(0))"
```
> Nếu `requirements.txt` xung đột version: cài tay từng gói lỗi. DeepfakeBench ghim một số bản cũ; trên 3060 ưu tiên torch ≥1.12. Đây là phần beginner hay vướng — kiên nhẫn đọc thông báo lỗi, gỡ đúng gói.

---

## Bước 2 — Lấy SUBSET data nhỏ về local

> KHÔNG tải full về 3060 (quá nặng). Hai cách:
> - **Cách A (khuyên):** tải full trên Vast → `make_subset.py` → `scp` bản nhỏ về 3060.
> - **Cách B:** tải một phần nhỏ trực tiếp (vài chục video FF++ + Celeb-DF) nếu Drive cho tải lẻ.

```bash
# Trên máy có full data, tạo subset JSON:
python tools/make_subset.py --json preprocessing/dataset_json/FaceForensics++.json --keep 10
python tools/make_subset.py --json preprocessing/dataset_json/Celeb-DF-v2.json   --keep 5
# Copy *_subset.json + đúng những frame folder tương ứng về 3060.
```
> Sửa `dataset_json_folder` trong `train_config.yaml`/`test_config.yaml` trỏ về chỗ chứa `*_subset.json`.

---

## Bước 3 — SMOKE test (B4 baseline trước)

Sửa `training/config/detector/efficientnetb4.yaml` sang chế độ SMOKE:
```yaml
nEpochs: 1
frame_num: {'train': 4, 'test': 4}
train_batchSize: 8
test_batchSize: 8
workers: 2
save_ckpt: true
```
Chạy:
```bash
python training/train.py \
  --detector_path ./training/config/detector/efficientnetb4.yaml \
  --train_dataset "FaceForensics++" \
  --test_dataset "FaceForensics++" "Celeb-DF-v2"
```
**PASS nếu:** data load, loss giảm, in AUC cho FF++ + Celeb-DF, có checkpoint. Ghi lại phút/epoch.

---

## Bước 4 — Smoke B4 + DCT

Sau khi đã thêm 4 file DCT (xem `SETUP_DCT.md`):
```bash
# xác nhận số kênh feature B4 trước (điền vào yaml dct_channels):
python -c "
import torch, yaml
from training.detectors import DETECTOR   # đường import tùy repo
# ... dựng model, chạy 1 batch giả, print(feat.shape)
"
python training/train.py \
  --detector_path ./training/config/detector/efficientnetb4_dct.yaml \
  --train_dataset "FaceForensics++" \
  --test_dataset "FaceForensics++" "Celeb-DF-v2"
```
**PASS nếu:** không lỗi shape, log `[DCT]` hiện, loss giảm.

---

## Khi nào RỜI 3060 sang Vast
Khi cả hai smoke (B4 và B4+DCT) đều PASS trên local → code đã sạch → chuyển sang `VAST_SETUP.md` để train full. Đừng cố train full trên 3060: data lớn + nhiều epoch sẽ rất lâu và dễ OOM.
