# VAST_HFF_RUNBOOK — block-DCT-HFF (R1 + R3) trên Vast.ai mới thuê

> Hợp nhất từ `VAST_TRAIN_RUNBOOK.md` (đã verify), tinh chỉnh cho 2 run **R1 / R3** của block-DCT-HFF.
> Files mới: `sfdct_hff_core.py`, `efficientnetb4_hff_detector.py`, `efficientnetb4_hff.yaml` (+ `__init__.py` đã thêm import).
> ⚠️ **Dataset KHÔNG ở trên HF** (HF repo chỉ có `runs/` = checkpoint). Data kéo từ gdrive (STEP 5), HOẶC tự upload lên HF 1 lần (STEP 5-ALT).

---

## STEP 0 — LOCAL: push code HFF trước (BLOCKER — clone chỉ lấy cái đã push)
```bash
cd ~/Desktop/thanhln/datn/DeepfakeBench
git add training/detectors/sfdct_hff_core.py \
        training/detectors/efficientnetb4_hff_detector.py \
        training/detectors/__init__.py \
        training/config/detector/efficientnetb4_hff.yaml \
        tools/smoke_hff.py tools/probe_residual_modality.py tools/probe_sign_and_depth.py
git commit -m "feat: block-DCT-HFF detector (R1/R3) + smoke + residual-modality probes"
git push origin <branch>     # branch dev-thanhln-blockdct-hff (hoặc main fork)
```
> KHÔNG commit `train_config.yaml`/`test_config.yaml`/`efficientnetb4.yaml` nếu chúng đang là bản smoke 25-vid local.

## STEP 1 — Thuê + SSH
- Instance: **RTX 4090/5090 (24GB)**, image **PyTorch 2.x / CUDA 12.x**, disk **≥150 GB**.
- `ssh -p <PORT> root@<VAST_IP>`

## STEP 2 — Gói hệ thống + git-lfs
```bash
apt-get update && apt-get install -y curl git-core wget unzip
curl -s https://packagecloud.io/install/repositories/github/git-lfs/script.deb.sh | bash \
  && apt-get install -y git-lfs && git lfs install
```

## STEP 3 — Clone + deps
```bash
cd /workspace
git clone -b <branch> https://github.com/huanthuytnhh/DeepfakeBench.git
cd DeepfakeBench
python -c "import torch;print('cuda',torch.cuda.is_available(),torch.cuda.get_device_name(0))"
pip install -U gdown "huggingface_hub[cli]"
pip install efficientnet_pytorch albumentations opencv-python-headless imgaug \
            scikit-image scikit-learn pandas tqdm pyyaml imageio einops kornia tensorboard
```

## STEP 4 — Pretrained B4 + JSONs
```bash
mkdir -p training/pretrained
wget -O training/pretrained/efficientnet-b4-6ed6700e.pth \
  https://github.com/lukemelas/EfficientNet-PyTorch/releases/download/1.0/efficientnet-b4-6ed6700e.pth
mkdir -p preprocessing/dataset_json && cd preprocessing/dataset_json
gdown 11BxHUbcYl10SctvS-BWaSnPtMIQTT6AY -O FaceForensics++.json    # full 719 vids/manip
gdown 1CEr_vuI8UuJkD6oAExl6_Hf6cZmYMgpm -O Celeb-DF-v2.json
cd /workspace/DeepfakeBench
```

## STEP 5 — Data (gdrive, trong tmux) + UNZIP
```bash
tmux new -s dl
mkdir -p /workspace/DeepfakeBench/datasets && cd /workspace/DeepfakeBench/datasets
gdown 1mZ9NNtgW_4oo9S996uQh9-SmRYaLxPnb     # FF++  (lớn)
gdown 1oSihXtB0caSGAX0Tt3MxgFbsuY46ecml     # Celeb-DF-v2
for f in *.zip; do unzip -q "$f"; done ;  for f in *.tar *.tar.gz; do tar xf "$f"; done
ls          # EXPECT: FaceForensics++/  Celeb-DF-v2/
# detach: Ctrl-b d   (gdown quota -> retry / mirror)
```

### STEP 5-ALT — Kéo data từ HF (NẾU bạn đã upload lên HF 1 lần)
```bash
# (một lần, từ LOCAL — upload 36GB lên HF dataset repo):
#   huggingface-cli login
#   huggingface-cli upload-large-folder huanthuytnhh/deepfake-data datasets/ --repo-type=dataset
# trên VAST — kéo về (ổn định hơn gdrive, không dính quota):
huggingface-cli download huanthuytnhh/deepfake-data --repo-type=dataset --local-dir /workspace/DeepfakeBench/datasets
# nếu lưu dạng .zip trên HF thì unzip như STEP 5
```

## STEP 6 — Trỏ path trong train_config.yaml (nó OVERRIDE detector yaml)
```bash
cd /workspace/DeepfakeBench
sed -i 's#^rgb_dir:.*#rgb_dir: /workspace/DeepfakeBench/datasets#' training/config/train_config.yaml
sed -i 's#^dataset_json_folder:.*#dataset_json_folder: ./preprocessing/dataset_json#' training/config/train_config.yaml
grep -nE "rgb_dir|dataset_json_folder|^log_dir|lmdb:" training/config/train_config.yaml   # lmdb: False
# verify 1 frame thật resolve được:
python - <<'PY'
import json,os
d=json.load(open("preprocessing/dataset_json/FaceForensics++.json"))["FaceForensics++"]
fp=list(d["FF-real"]["train"]["c23"].values())[0]["frames"][0]
print(os.path.join("/workspace/DeepfakeBench/datasets",fp), "OK" if os.path.exists(os.path.join("/workspace/DeepfakeBench/datasets",fp)) else "❌")
PY
```

## STEP 7 — SMOKE trên vast (bắt buộc, trước full)
```bash
cd /workspace/DeepfakeBench
# 7a. module smoke ($0, xác nhận floor≥B4 + học được — không cần data nặng):
python tools/smoke_hff.py
# 7b. pipeline smoke (1 epoch, data thật):
python training/train.py --detector_path ./training/config/detector/efficientnetb4_hff.yaml \
  --train_dataset FaceForensics++ --test_dataset Celeb-DF-v2 --nEpochs 1 2>&1 | tee /workspace/smoke_hff.log
# PASS = load data, 1 epoch chạy, không NaN/shape/import error, in ra AUC.
```

## STEP 8 — 2 FULL RUN trong tmux (R3 full + R1 minimal)
```bash
cd /workspace/DeepfakeBench
# R3 = full (config mặc định: hff_multi_scale:true, hff_use_rsa:true)
tmux new -d -s r3 'cd /workspace/DeepfakeBench && python training/train.py \
  --detector_path ./training/config/detector/efficientnetb4_hff.yaml 2>&1 | tee /workspace/r3.log'

# R1 = minimal (tắt multi-scale + RSA bằng sed trên 1 BẢN COPY config để không đụng R3)
cp training/config/detector/efficientnetb4_hff.yaml training/config/detector/efficientnetb4_hff_r1.yaml
sed -i 's#^hff_multi_scale:.*#hff_multi_scale: false#; s#^hff_use_rsa:.*#hff_use_rsa: false#' \
  training/config/detector/efficientnetb4_hff_r1.yaml
tmux new -d -s r1 'cd /workspace/DeepfakeBench && python training/train.py \
  --detector_path ./training/config/detector/efficientnetb4_hff_r1.yaml 2>&1 | tee /workspace/r1.log'

# theo dõi: tmux attach -t r3   |   ~5 phút/epoch, ~1h/run trên 4090
```
> **Cổng abort (tiết kiệm $):** sau 2-3 epoch xem `/workspace/r3.log` — nếu FF++-val AUC không bám theo B4 thì `tmux kill-session -t r3`.
> Checkpoint: `logs/training/efficientnetb4_hff_<ts>/test/Celeb-DF-v2/ckpt_best.pth` (giữ Celeb-DF-v2 trong test_dataset, nếu không sẽ KHÔNG lưu ckpt).

## STEP 8.5 — Line chart metric + eval figures (từ log/ckpt thật)
```bash
cd /workspace/DeepfakeBench
python report_prepare/mt09_training_curves.py --all     # → outputs/training_curves/<tag>.png (loss/AUC theo epoch)
for tag in r3 r1; do
  CK=$(ls -t logs/training/efficientnetb4_hff*/test/Celeb-DF-v2/ckpt_best.pth 2>/dev/null | head -1)
  python training/eval_and_viz.py --detector_path ./training/config/detector/efficientnetb4_hff.yaml \
    --weights_path "$CK" --test_dataset FaceForensics++ Celeb-DF-v2 --out ./viz_out/$tag
done
```

## STEP 9 — PERSIST trước khi DESTROY (vast xoá sạch disk!)
```bash
# từ LOCAL:
mkdir -p ~/Desktop/thanhln/datn/vast_results
rsync -avz -e "ssh -p <PORT>" root@<VAST_IP>:/workspace/DeepfakeBench/logs    ~/Desktop/thanhln/datn/vast_results/
rsync -avz -e "ssh -p <PORT>" root@<VAST_IP>:/workspace/DeepfakeBench/viz_out ~/Desktop/thanhln/datn/vast_results/
rsync -avz -e "ssh -p <PORT>" root@<VAST_IP>:/workspace/DeepfakeBench/outputs/training_curves ~/Desktop/thanhln/datn/vast_results/
rsync -avz -e "ssh -p <PORT>" root@<VAST_IP>:/workspace/*.log                 ~/Desktop/thanhln/datn/vast_results/
find ~/Desktop/thanhln/datn/vast_results -name "ckpt_best.pth" -o -name "*.png" | head
```

---

### Quick failure map
| Symptom | Cause | Fix |
|---|---|---|
| `KeyError: efficientnetb4_hff` | code chưa push / `__init__.py` chưa import | STEP 0 (đã thêm import HFF vào `__init__.py`) |
| `...does not exist` (frame) | rgb_dir / layout giải nén sai | STEP 6 verify |
| `libGL.so.1` | opencv không headless | `pip install opencv-python-headless` |
| train chậm (CPU) | torch CPU-only | cài torch cu121 |
| gdown quota | Drive cap | retry / dùng STEP 5-ALT (HF) |
| KHÔNG lưu ckpt | test_dataset chỉ FF++ | thêm Celeb-DF-v2 |
