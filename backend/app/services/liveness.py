"""
Liveness / anti-spoofing detection service.

Phân biệt người thật ngồi trước camera vs. presentation attack:
  • Printed photo (print)
  • Screen replay (screen)
  • 3D mask (mask_3d)
  • Generated face video (deepfake)

Pipeline (real mode):
  1. Detect face với MTCNN (tái dùng từ ml_inference)
  2. Crop face → MiniFASNet (Silent-Face-Anti-Spoofing) hoặc DeepPixBiS
  3. Combine multiple cues:
       - Texture (moire pattern on screen)
       - Color distribution (printed = low chroma variance)
       - 3D structure (single image: depth estimation)
       - Motion liveness nếu có sequence frames (active mode)
  4. Verdict: LIVE / SPOOF / UNCERTAIN với threshold zone ±0.05

Mock mode: deterministic theo hash bytes input (tái dùng pattern từ ml_inference).
"""

from __future__ import annotations

import base64
import hashlib
import io
import random
import time
from dataclasses import dataclass
from typing import Optional

import numpy as np
from PIL import Image

from app.config import get_settings

settings = get_settings()

# Threshold giống ml_inference: > 0.5 + margin = LIVE, < 0.5 - margin = SPOOF
LIVENESS_THRESHOLD = 0.5
LIVENESS_MARGIN    = 0.08

CHALLENGES = ["blink", "turn_left", "turn_right", "smile", "nod"]


@dataclass
class LivenessResult:
    verdict: str                       # LIVE | SPOOF | UNCERTAIN
    liveness_score: float              # 0-1 (1 = chắc chắn live)
    confidence: float                  # 0-100
    spoof_type: Optional[str]          # print | screen | mask_3d | deepfake | unknown | None nếu LIVE
    threshold_used: float
    processing_time_ms: int
    model_version: str
    image_width: Optional[int]
    image_height: Optional[int]
    image_hash: str
    image_thumb: Optional[str]
    frame_count: int = 1
    challenge_type: Optional[str] = None
    challenge_passed: Optional[bool] = None


# ─────────────────────────────────────────────────────────────────────────────
# Helper: encode thumbnail (tái dùng ý tưởng từ ml_inference)
# ─────────────────────────────────────────────────────────────────────────────
def _encode_thumb(image_bytes: bytes, max_dim: int = 320, quality: int = 80) -> Optional[str]:
    try:
        img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        img.thumbnail((max_dim, max_dim), Image.Resampling.LANCZOS)
        buf = io.BytesIO()
        img.save(buf, format="JPEG", quality=quality, optimize=True)
        return "data:image/jpeg;base64," + base64.b64encode(buf.getvalue()).decode("ascii")
    except Exception:
        return None


def _verdict_from_score(score: float, threshold: float = LIVENESS_THRESHOLD) -> tuple[str, float]:
    """Returns (verdict, confidence 0-100)."""
    if score >= threshold + LIVENESS_MARGIN:
        verdict = "LIVE"
        confidence = min(round((score - threshold) / (1 - threshold) * 100, 2), 99.9)
    elif score <= threshold - LIVENESS_MARGIN:
        verdict = "SPOOF"
        confidence = min(round((threshold - score) / threshold * 100, 2), 99.9)
    else:
        verdict = "UNCERTAIN"
        confidence = round(50.0 + abs(score - threshold) / LIVENESS_MARGIN * 10, 2)
    return verdict, confidence


# ─────────────────────────────────────────────────────────────────────────────
# Real inference stub — wire vào MiniFASNet hoặc DeepPixBiS khi có checkpoint
# ─────────────────────────────────────────────────────────────────────────────
def _real_liveness(image_bytes: bytes) -> LivenessResult:
    """
    TODO: load Silent-Face-Anti-Spoofing MiniFASNet model.
    Hiện tại fallback sang mock vì chưa có checkpoint trong settings.
    """
    # Khi có checkpoint thật: load via torch.load(settings.LIVENESS_MODEL_PATH),
    # crop face với MTCNN (share từ ml_inference._get_detector()),
    # forward qua MiniFASNet → softmax → score = P(live).
    return _mock_liveness(image_bytes)


# ─────────────────────────────────────────────────────────────────────────────
# Mock inference (deterministic theo hash)
# ─────────────────────────────────────────────────────────────────────────────
def _mock_liveness(image_bytes: bytes) -> LivenessResult:
    start = time.perf_counter()
    image_hash = hashlib.sha256(image_bytes).hexdigest()
    seed = int(image_hash[:8], 16)
    rng = random.Random(seed)

    # Phân bố: 70% LIVE, 20% SPOOF, 10% gần threshold
    bucket = rng.random()
    if bucket < 0.70:
        score = rng.uniform(0.70, 0.98)
        spoof = None
    elif bucket < 0.90:
        score = rng.uniform(0.05, 0.30)
        spoof = rng.choice(["print", "screen", "mask_3d", "deepfake"])
    else:
        score = rng.uniform(0.42, 0.58)
        spoof = rng.choice(["unknown", "screen"]) if score < 0.5 else None

    verdict, confidence = _verdict_from_score(score)
    if verdict == "LIVE":
        spoof = None

    try:
        with Image.open(io.BytesIO(image_bytes)) as im:
            w, h = im.size
    except Exception:
        w, h = rng.choice([640, 720, 1280]), rng.choice([480, 540, 720])

    elapsed = int((time.perf_counter() - start) * 1000) + rng.randint(40, 140)

    return LivenessResult(
        verdict=verdict,
        liveness_score=round(score, 4),
        confidence=confidence,
        spoof_type=spoof,
        threshold_used=LIVENESS_THRESHOLD,
        processing_time_ms=elapsed,
        model_version="liveness-mock-v1",
        image_width=w,
        image_height=h,
        image_hash=image_hash,
        image_thumb=_encode_thumb(image_bytes),
    )


# ─────────────────────────────────────────────────────────────────────────────
# Active liveness: aggregate multiple frames + verify challenge
# ─────────────────────────────────────────────────────────────────────────────
def _aggregate_frames(
    frame_results: list[LivenessResult],
    challenge_type: Optional[str],
    challenge_passed: Optional[bool],
) -> LivenessResult:
    """Aggregate per-frame liveness scores cho active mode."""
    if not frame_results:
        raise ValueError("No frames to aggregate")

    scores = [f.liveness_score for f in frame_results]
    avg_score = float(np.mean(scores))

    # Nếu user fail challenge → ép thành SPOOF luôn
    if challenge_passed is False:
        avg_score = min(avg_score, 0.25)

    verdict, confidence = _verdict_from_score(avg_score)

    spoof_types = [f.spoof_type for f in frame_results if f.spoof_type]
    most_common = max(set(spoof_types), key=spoof_types.count) if spoof_types else None
    if verdict == "LIVE":
        most_common = None

    # Lấy thumb của frame đầu làm đại diện
    repr_frame = frame_results[0]

    total_time = sum(f.processing_time_ms for f in frame_results)

    return LivenessResult(
        verdict=verdict,
        liveness_score=round(avg_score, 4),
        confidence=confidence,
        spoof_type=most_common,
        threshold_used=LIVENESS_THRESHOLD,
        processing_time_ms=total_time,
        model_version=repr_frame.model_version + "+active",
        image_width=repr_frame.image_width,
        image_height=repr_frame.image_height,
        image_hash=repr_frame.image_hash,
        image_thumb=repr_frame.image_thumb,
        frame_count=len(frame_results),
        challenge_type=challenge_type,
        challenge_passed=challenge_passed,
    )


# ─────────────────────────────────────────────────────────────────────────────
# Public entry points
# ─────────────────────────────────────────────────────────────────────────────
async def run_liveness_check(image_bytes: bytes) -> LivenessResult:
    """Passive liveness — 1 frame → kết quả."""
    if settings.MOCK_ML or not settings.MODEL_PATH:
        return _mock_liveness(image_bytes)
    return _real_liveness(image_bytes)


async def run_active_liveness(
    frames: list[bytes],
    challenge_type: str,
    challenge_passed: bool,
) -> LivenessResult:
    """Active liveness — list of frames + đã verify challenge ở client → aggregate."""
    per_frame: list[LivenessResult] = []
    for fb in frames:
        if settings.MOCK_ML or not settings.MODEL_PATH:
            per_frame.append(_mock_liveness(fb))
        else:
            per_frame.append(_real_liveness(fb))
    return _aggregate_frames(per_frame, challenge_type, challenge_passed)


def random_challenge() -> str:
    return random.choice(CHALLENGES)
