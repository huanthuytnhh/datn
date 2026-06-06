"""ml_model.py — load model+transforms (cache), MTCNN detector, freq score, crop, predict,
verdict, thumbnail ảnh. Tách từ ml_inference (<=250 dòng)."""
import io
from typing import Optional

import numpy as np
from PIL import Image

from app.config import get_settings
from app.services.ml_efficientnet import _build_efficientnet

settings = get_settings()

IMG_SIZE       = 224
FAKE_THRESHOLD = 0.35
FACE_PAD_RATIO = 0.25
USE_TTA        = True
USE_FREQ       = True
FREQ_WEIGHT    = 0.25
UNCERTAIN_MARGIN = 0.10


def _get_model_and_transforms(model_path: str, device):
    """Load model + transforms lần đầu, cache lại."""
    import torch
    import albumentations as A
    from albumentations.pytorch import ToTensorV2

    cache_key = (model_path, str(device))
    if cache_key in _model_cache:
        return _model_cache[cache_key]

    DeepFakeModel, _ = _build_efficientnet()
    model = DeepFakeModel().to(device)
    state = torch.load(model_path, map_location=device)
    model.load_state_dict(state)
    model.eval()
    print(f"[DeepGuard] Model loaded from {model_path}")

    val_transform = A.Compose([
        A.Resize(IMG_SIZE, IMG_SIZE),
        A.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
        ToTensorV2(),
    ])
    flip_transform = A.Compose([
        A.Resize(IMG_SIZE, IMG_SIZE),
        A.HorizontalFlip(p=1.0),
        A.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
        ToTensorV2(),
    ])

    result = (model, val_transform, flip_transform, device)
    _model_cache[cache_key] = result
    return result


def _get_detector():
    """Lazy-load MTCNN detector."""
    if "detector" not in _model_cache:
        import torch
        from mtcnn import MTCNN
        dev_str = "GPU:0" if torch.cuda.is_available() else "CPU:0"
        _model_cache["detector"] = MTCNN(device=dev_str)
    return _model_cache["detector"]


def freq_fake_score(face_rgb: np.ndarray) -> tuple[float, float]:
    """
    Returns (spatial_score, frequency_score) mỗi cái 0-1.
    spatial_score  = Laplacian std normalized
    frequency_score = FFT mid-freq energy normalized
    """
    import cv2
    gray = cv2.cvtColor(face_rgb, cv2.COLOR_RGB2GRAY).astype(np.float32)
    gray = cv2.resize(gray, (128, 128))

    lap     = cv2.Laplacian(gray, cv2.CV_32F)
    lap_std = float(np.std(lap))

    fft    = np.fft.fft2(gray)
    mag    = np.log1p(np.abs(np.fft.fftshift(fft)))
    h, w   = mag.shape
    cx, cy = h // 2, w // 2
    low_e  = float(np.mean(mag[cx-16:cx+16, cy-16:cy+16]))
    mid_e  = float(np.mean(mag[cx-48:cx+48, cy-48:cy+48])) - low_e

    spatial_score   = float(np.clip((lap_std - 20) / 60, 0, 1))
    frequency_score = float(np.clip((mid_e - 1.5) / 2.0, 0, 1))
    return spatial_score, frequency_score


def _crop_face(img_rgb: np.ndarray, detector) -> Optional[np.ndarray]:
    """Returns cropped face (RGB numpy) hoặc None nếu không detect được."""
    results = detector.detect_faces(img_rgb)
    if not results:
        return None
    best   = max(results, key=lambda r: r["confidence"])
    x, y, w, h = best["box"]
    pad_x = int(w * FACE_PAD_RATIO)
    pad_y = int(h * FACE_PAD_RATIO)
    H, W  = img_rgb.shape[:2]
    x1 = max(0, x - pad_x);   y1 = max(0, y - pad_y)
    x2 = min(W, x + w + pad_x); y2 = min(H, y + h + pad_y)
    face = img_rgb[y1:y2, x1:x2]
    return face if face.size > 0 else None


def _predict_face(face_rgb: np.ndarray, model, val_transform, flip_transform, device) -> dict:
    """
    Returns {prob_fake, prob_cnn, spatial_score, frequency_score}.
    Đúng pipeline của predict_frame() trong notebook.
    """
    import torch
    import torch.nn.functional as F

    t_orig   = val_transform(image=face_rgb)["image"].unsqueeze(0).to(device)
    with torch.no_grad():
        prob_cnn = F.softmax(model(t_orig).float(), dim=1)[0, 1].item()

        if USE_TTA:
            t_flip   = flip_transform(image=face_rgb)["image"].unsqueeze(0).to(device)
            prob_cnn = (prob_cnn + F.softmax(model(t_flip).float(), dim=1)[0, 1].item()) / 2.0

    spatial_score, frequency_score = (0.0, 0.0)
    if USE_FREQ:
        spatial_score, frequency_score = freq_fake_score(face_rgb)
        freq_combined = (spatial_score + frequency_score) / 2.0
        prob_fake = (1 - FREQ_WEIGHT) * prob_cnn + FREQ_WEIGHT * freq_combined
    else:
        prob_fake = prob_cnn

    return {
        "prob_fake": prob_fake,
        "prob_cnn":  prob_cnn,
        "spatial_score":   spatial_score,
        "frequency_score": frequency_score,
    }


def _verdict_from_prob(prob_fake: float, threshold: float = FAKE_THRESHOLD) -> tuple[str, float]:
    """Returns (verdict, confidence 0-100)."""
    if prob_fake >= threshold + UNCERTAIN_MARGIN:
        verdict    = "FAKE"
        confidence = min(round((prob_fake - threshold) / (1 - threshold) * 100, 2), 99.9)
    elif prob_fake <= threshold - UNCERTAIN_MARGIN:
        verdict    = "REAL"
        confidence = min(round((threshold - prob_fake) / threshold * 100, 2), 99.9)
    else:
        verdict    = "UNCERTAIN"
        confidence = round(50.0 + abs(prob_fake - threshold) / UNCERTAIN_MARGIN * 10, 2)
    return verdict, confidence


def _encode_image_thumb(image_bytes: bytes, max_dim: int = 320, quality: int = 80) -> Optional[str]:
    """PIL-based thumbnail encoder for input image bytes — works without cv2."""
    import base64
    try:
        img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        img.thumbnail((max_dim, max_dim), Image.Resampling.LANCZOS)
        buf = io.BytesIO()
        img.save(buf, format="JPEG", quality=quality, optimize=True)
        return "data:image/jpeg;base64," + base64.b64encode(buf.getvalue()).decode("ascii")
    except Exception:
        return None
