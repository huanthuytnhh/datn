"""test_liveness_crop.py — kiểm thử LOCAL bước crop mặt cho liveness (:8502).

TEST 1 — sanity trên LCC-FASD eval (ảnh đã crop sẵn): crop KHÔNG được làm hỏng số
         (real -> P(live) cao, spoof -> P(live) thấp).
TEST 2 — mô phỏng frame webcam (dán mặt LCC lên canvas lớn, mặt nhỏ + nền): chứng minh
         KHÔNG crop -> điểm lệch; CÓ crop -> điểm hồi phục về gần ảnh gốc.

Chạy:  python3 serving/test_liveness_crop.py
"""
import os
import sys
import glob
import random

import numpy as np
import cv2
import torch
import torch.nn.functional as F
from PIL import Image
import torchvision.transforms as T

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(REPO, "serving"))
sys.path.insert(0, os.path.join(REPO, "liveness"))
from model_liveness import B4Liveness, NORM_MEAN, NORM_STD, RESOLUTION  # noqa: E402
from face_crop import crop_face_bgr  # noqa: E402

CKPT = os.path.join(REPO, "serving/liveness_b4/ckpt_best.pth")
EVAL = os.path.join(REPO, "DeepfakeBench/liveness/_data/LCC_FASD/LCC_FASD_evaluation")
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"

_tfm = T.Compose([T.Resize((RESOLUTION, RESOLUTION)), T.ToTensor(),
                  T.Normalize(mean=NORM_MEAN, std=NORM_STD)])


def load_model():
    m = B4Liveness(num_classes=2, use_pretrained=False)
    ck = torch.load(CKPT, map_location=DEVICE)
    m.load_state_dict(ck["state_dict"])
    m.to(DEVICE).eval()
    return m


@torch.no_grad()
def p_live(model, bgr):
    rgb = cv2.cvtColor(bgr, cv2.COLOR_BGR2RGB)
    x = _tfm(Image.fromarray(rgb)).unsqueeze(0).to(DEVICE)
    return float(F.softmax(model(x), dim=1)[0, 0].cpu())   # P(live) = class 0


def make_webcam(bgr, scale=3.0, bg=205):
    """Mô phỏng frame webcam: dán mặt (đã crop) vào giữa 1 canvas lớn hơn -> mặt nhỏ + nhiều nền."""
    h, w = bgr.shape[:2]
    H, W = int(h * scale), int(w * scale)
    rng = np.random.default_rng(0)
    canvas = (np.full((H, W, 3), bg, np.uint8) +
              rng.integers(-12, 12, (H, W, 3)).astype(np.int16)).clip(0, 255).astype(np.uint8)
    y0, x0 = (H - h) // 2, (W - w) // 2
    canvas[y0:y0 + h, x0:x0 + w] = bgr
    return canvas


def sample(cls, n, seed=0):
    files = sorted(glob.glob(os.path.join(EVAL, cls, "*.png")) +
                   glob.glob(os.path.join(EVAL, cls, "*.jpg")))
    random.Random(seed).shuffle(files)
    return files[:n]


def main():
    if not os.path.exists(CKPT):
        print("CKPT not found:", CKPT); return
    model = load_model()
    print(f"model on {DEVICE}, ckpt {os.path.basename(CKPT)}, expand={os.environ.get('LIVENESS_CROP_EXPAND','1.3')}")

    print("\n=== TEST 1 — LCC-FASD eval (đã crop) + face-crop bật ===")
    for cls, expect in [("real", "P(live) cao"), ("spoof", "P(live) thấp")]:
        scs, found = [], 0
        for f in sample(cls, 40):
            bgr = cv2.imread(f)
            if bgr is None:
                continue
            crop, ok = crop_face_bgr(bgr)
            found += int(ok)
            scs.append(p_live(model, crop))
        print(f"  {cls:5s}: mean P(live)={np.mean(scs):.3f}  n={len(scs)}  face_found={found}/{len(scs)}  (kỳ vọng {expect})")

    print("\n=== TEST 2 — mô phỏng frame webcam (mặt nhỏ trên nền) ===")
    print(f"  {'file':30s} {'orig':>6s} {'no-crop':>8s} {'crop':>6s} {'found':>6s}")
    drift_nocrop, drift_crop = [], []
    for cls in ["real", "spoof"]:
        for f in sample(cls, 5, seed=1):
            bgr = cv2.imread(f)
            if bgr is None:
                continue
            orig = p_live(model, bgr)
            cam = make_webcam(bgr)
            nocrop = p_live(model, cam)
            crop, ok = crop_face_bgr(cam)
            cropped = p_live(model, crop)
            drift_nocrop.append(abs(nocrop - orig))
            drift_crop.append(abs(cropped - orig))
            name = f"{cls}/{os.path.basename(f)}"
            print(f"  {name:30s} {orig:6.3f} {nocrop:8.3f} {cropped:6.3f} {str(ok):>6s}")
    print(f"\n  Lệch trung bình so với ảnh gốc |Δ P(live)|:  no-crop={np.mean(drift_nocrop):.3f}   crop={np.mean(drift_crop):.3f}")
    print("  -> crop tốt nếu lệch crop << lệch no-crop (điểm hồi phục về gần ảnh đã-crop gốc).")


if __name__ == "__main__":
    main()
