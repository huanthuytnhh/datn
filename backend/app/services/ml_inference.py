"""
ML inference service cho deepfake detection.

Khi MOCK_ML=true: trả về kết quả giả lập realistic để test API flow.
Khi MODEL_PATH được set: load EfficientNet-B4 thực và chạy inference.
"""

import hashlib
import random
import time
from dataclasses import dataclass
from typing import Optional

from app.config import get_settings

settings = get_settings()


@dataclass
class InferenceResult:
    verdict: str          # REAL | FAKE | UNCERTAIN
    confidence: float     # 0-100
    prob_fake: float      # 0-1
    prob_cnn: float       # 0-1
    spatial_score: float
    frequency_score: float
    threshold_used: float
    face_detected: bool
    processing_time_ms: int
    model_version: str
    image_width: Optional[int]
    image_height: Optional[int]
    image_hash: str


def _compute_image_hash(image_bytes: bytes) -> str:
    return hashlib.sha256(image_bytes).hexdigest()


def _mock_inference(image_bytes: bytes) -> InferenceResult:
    """Sinh kết quả giả lập realistic dựa trên hash của ảnh."""
    start = time.perf_counter()
    image_hash = _compute_image_hash(image_bytes)

    # Dùng hash để tạo kết quả deterministic (cùng ảnh → cùng kết quả)
    seed = int(image_hash[:8], 16)
    rng = random.Random(seed)

    prob_cnn = rng.uniform(0.05, 0.95)
    spatial_score = rng.uniform(0.0, 1.0)
    frequency_score = rng.uniform(0.0, 1.0)
    freq_weight = 0.25
    prob_fake = prob_cnn * (1 - freq_weight) + frequency_score * freq_weight

    threshold = settings.MODEL_THRESHOLD
    margin = 0.05

    if prob_fake >= threshold + margin:
        verdict = "FAKE"
        confidence = round((prob_fake - threshold) / (1 - threshold) * 100, 2)
        confidence = min(confidence, 99.9)
    elif prob_fake <= threshold - margin:
        verdict = "REAL"
        confidence = round((threshold - prob_fake) / threshold * 100, 2)
        confidence = min(confidence, 99.9)
    else:
        verdict = "UNCERTAIN"
        confidence = round(50.0 + abs(prob_fake - threshold) / margin * 10, 2)

    elapsed_ms = int((time.perf_counter() - start) * 1000)
    # Mock processing time: 50-250ms
    elapsed_ms = rng.randint(50, 250)

    return InferenceResult(
        verdict=verdict,
        confidence=confidence,
        prob_fake=round(prob_fake, 4),
        prob_cnn=round(prob_cnn, 4),
        spatial_score=round(spatial_score, 4),
        frequency_score=round(frequency_score, 4),
        threshold_used=threshold,
        face_detected=True,
        processing_time_ms=elapsed_ms,
        model_version=settings.MODEL_VERSION,
        image_width=rng.choice([640, 720, 1280]),
        image_height=rng.choice([480, 540, 720]),
        image_hash=image_hash,
    )


def _real_inference(image_bytes: bytes) -> InferenceResult:
    """
    Thực chạy EfficientNet-B4.
    Chỉ active khi MODEL_PATH được set.
    """
    try:
        import numpy as np
        import torch
        import torch.nn as nn
        from PIL import Image
        import io

        # Import tại đây để không break nếu torch chưa install
        start = time.perf_counter()
        image_hash = _compute_image_hash(image_bytes)

        img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        width, height = img.size

        # Placeholder: implement actual EfficientNet-B4 inference here
        # from efficientnet_pytorch import EfficientNet
        # model = EfficientNet.from_pretrained('efficientnet-b4')
        # ... transform, inference, TTA ...

        raise NotImplementedError("Real model inference not yet implemented. Set MOCK_ML=true.")

    except ImportError as e:
        raise RuntimeError(f"ML dependencies missing: {e}. Install torch, timm, etc.")


async def run_inference(image_bytes: bytes) -> InferenceResult:
    """Entry point cho detection endpoints."""
    if settings.MOCK_ML or not settings.MODEL_PATH:
        return _mock_inference(image_bytes)
    return _real_inference(image_bytes)
