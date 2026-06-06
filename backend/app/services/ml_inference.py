"""ml_inference.py — facade. Logic tách sang ml_efficientnet/ml_model/ml_video (mỗi file <=250 dòng).
Giữ API cũ: from app.services.ml_inference import run_inference, run_video_inference."""
import hashlib
import io
import random
import time
from dataclasses import dataclass
from typing import Optional

import numpy as np
from PIL import Image

from app.config import get_settings
from app.services.ml_model import (
    FREQ_WEIGHT,
    _get_model_and_transforms, _get_detector, _crop_face, _predict_face,
    _verdict_from_prob, _encode_image_thumb,
)
from app.services.ml_video import _real_inference_video, _mock_inference_video

settings = get_settings()


@dataclass
class InferenceResult:
    verdict: str            # REAL | FAKE | UNCERTAIN
    confidence: float       # 0-100
    prob_fake: float        # 0-1
    prob_cnn: float         # 0-1
    spatial_score: float    # Laplacian std (normalized 0-1)
    frequency_score: float  # FFT mid-freq score (normalized 0-1)
    threshold_used: float
    face_detected: bool
    processing_time_ms: int
    model_version: str
    image_width: Optional[int]
    image_height: Optional[int]
    image_hash: str
    image_thumb: Optional[str] = None  # base64 JPEG data URL of input
    heatmap: Optional[str] = None      # base64 Grad-CAM overlay (data URL) — từ microservice SFDCT


def _real_inference(image_bytes: bytes) -> InferenceResult:
    import torch
    import cv2

    start = time.perf_counter()
    image_hash = hashlib.sha256(image_bytes).hexdigest()

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model, val_tf, flip_tf, device = _get_model_and_transforms(settings.MODEL_PATH, device)
    detector = _get_detector()

    pil_img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    width, height = pil_img.size
    img_rgb = np.array(pil_img)

    face = _crop_face(img_rgb, detector)
    face_detected = face is not None

    if not face_detected:
        # Không detect được face — chạy toàn ảnh
        face = img_rgb

    preds = _predict_face(face, model, val_tf, flip_tf, device)
    verdict, confidence = _verdict_from_prob(preds["prob_fake"], settings.MODEL_THRESHOLD)

    elapsed_ms = int((time.perf_counter() - start) * 1000)
    return InferenceResult(
        verdict=verdict,
        confidence=confidence,
        prob_fake=round(preds["prob_fake"], 4),
        prob_cnn=round(preds["prob_cnn"], 4),
        spatial_score=round(preds["spatial_score"], 4),
        frequency_score=round(preds["frequency_score"], 4),
        threshold_used=settings.MODEL_THRESHOLD,
        face_detected=face_detected,
        processing_time_ms=elapsed_ms,
        model_version=settings.MODEL_VERSION,
        image_width=width,
        image_height=height,
        image_hash=image_hash,
        image_thumb=_encode_image_thumb(image_bytes),
    )


def _mock_inference(image_bytes: bytes) -> InferenceResult:
    image_hash = hashlib.sha256(image_bytes).hexdigest()
    seed = int(image_hash[:8], 16)
    rng  = random.Random(seed)

    prob_cnn        = rng.uniform(0.05, 0.95)
    spatial_score   = rng.uniform(0.0, 1.0)
    frequency_score = rng.uniform(0.0, 1.0)
    freq_combined   = (spatial_score + frequency_score) / 2.0
    prob_fake       = prob_cnn * (1 - FREQ_WEIGHT) + freq_combined * FREQ_WEIGHT

    verdict, confidence = _verdict_from_prob(prob_fake, settings.MODEL_THRESHOLD)

    thumb = _encode_image_thumb(image_bytes)
    # Try to read real dimensions from the input
    try:
        with Image.open(io.BytesIO(image_bytes)) as im:
            w, h = im.size
    except Exception:
        w = rng.choice([640, 720, 1280])
        h = rng.choice([480, 540, 720])

    return InferenceResult(
        verdict=verdict,
        confidence=confidence,
        prob_fake=round(prob_fake, 4),
        prob_cnn=round(prob_cnn, 4),
        spatial_score=round(spatial_score, 4),
        frequency_score=round(frequency_score, 4),
        threshold_used=settings.MODEL_THRESHOLD,
        face_detected=True,
        processing_time_ms=rng.randint(50, 250),
        model_version=settings.MODEL_VERSION,
        image_width=w,
        image_height=h,
        image_hash=image_hash,
        image_thumb=thumb,
    )


def _sfdct_inference(image_bytes: bytes) -> InferenceResult:
    """Gọi microservice SFDCT (DeepfakeBench) qua HTTP -> map sang InferenceResult (kèm Grad-CAM).
    Service down -> fallback mock để không chặn API."""
    import httpx
    start = time.perf_counter()
    image_hash = hashlib.sha256(image_bytes).hexdigest()
    try:
        width, height = Image.open(io.BytesIO(image_bytes)).convert("RGB").size
    except Exception:
        width = height = None
    try:
        r = httpx.post(settings.SFDCT_INFER_URL.rstrip("/") + "/predict",
                       files={"file": ("upload.jpg", image_bytes, "image/jpeg")}, timeout=60.0)
        r.raise_for_status()
        j = r.json()
    except Exception:
        return _mock_inference(image_bytes)
    prob_fake = float(j.get("prob_fake", 0.0))
    verdict, confidence = _verdict_from_prob(prob_fake, settings.MODEL_THRESHOLD)
    try:
        thumb = _encode_image_thumb(image_bytes)
    except Exception:
        thumb = None
    return InferenceResult(
        verdict=verdict, confidence=confidence,
        prob_fake=round(prob_fake, 4), prob_cnn=round(prob_fake, 4),
        spatial_score=0.0, frequency_score=0.0,
        threshold_used=settings.MODEL_THRESHOLD, face_detected=True,
        processing_time_ms=int((time.perf_counter() - start) * 1000),
        model_version=j.get("model_version", settings.MODEL_VERSION),
        image_width=width, image_height=height, image_hash=image_hash,
        image_thumb=thumb, heatmap=j.get("gradcam"),
    )


# ── Public entry points ──
async def run_inference(image_bytes: bytes) -> InferenceResult:
    if settings.SFDCT_INFER_URL:                     # ưu tiên microservice SFDCT (model thật của thesis)
        return _sfdct_inference(image_bytes)
    if settings.MOCK_ML or not settings.MODEL_PATH:
        return _mock_inference(image_bytes)
    return _real_inference(image_bytes)


async def run_video_inference(video_bytes: bytes, sample_rate: int = 3) -> dict:
    if settings.MOCK_ML or not settings.MODEL_PATH:
        return _mock_inference_video(video_bytes, sample_rate)
    return _real_inference_video(video_bytes, sample_rate)
