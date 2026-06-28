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
from app.core.exceptions import service_unavailable

settings = get_settings()

# Ngưỡng + margin lấy từ config (tùy chỉnh qua .env: LIVENESS_THRESHOLD / LIVENESS_MARGIN).
# P(live) < THRESHOLD => SPOOF. MARGIN=0 => cắt nhị phân sạch tại ngưỡng.
LIVENESS_THRESHOLD = settings.LIVENESS_THRESHOLD
LIVENESS_MARGIN    = settings.LIVENESS_MARGIN

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
    attack_analysis: Optional[dict] = None   # scores + evidence print/screen (heuristic) — debug


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


def _verdict_from_score(score: float, threshold: float = None, margin: float = None) -> tuple[str, float]:
    """Returns (verdict, confidence 0-100). threshold/margin None => lấy từ config."""
    threshold = LIVENESS_THRESHOLD if threshold is None else threshold
    margin = LIVENESS_MARGIN if margin is None else margin
    if score >= threshold + margin:
        verdict = "LIVE"
        confidence = min(round((score - threshold) / max(1 - threshold, 1e-6) * 100, 2), 99.9)
    elif score <= threshold - margin:
        verdict = "SPOOF"
        confidence = min(round((threshold - score) / max(threshold, 1e-6) * 100, 2), 99.9)
    else:
        verdict = "UNCERTAIN"
        confidence = round(50.0 + abs(score - threshold) / max(margin, 1e-6) * 10, 2)
    return verdict, confidence


# ─────────────────────────────────────────────────────────────────────────────
# Real inference — gọi liveness microservice (port 8502) qua HTTP
# ─────────────────────────────────────────────────────────────────────────────
def _real_liveness(image_bytes: bytes, threshold: float = None) -> LivenessResult:
    """Gọi liveness_server.py qua HTTP. Fallback mock nếu service down.
    threshold None => dùng config (LIVENESS_THRESHOLD); truyền vào để override per-request."""
    import httpx
    start = time.perf_counter()
    image_hash = hashlib.sha256(image_bytes).hexdigest()
    try:
        w, h = Image.open(io.BytesIO(image_bytes)).convert("RGB").size
    except Exception:
        w, h = None, None
    try:
        r = httpx.post(
            settings.LIVENESS_INFER_URL.rstrip("/") + "/predict",
            files={"file": ("upload.jpg", image_bytes, "image/jpeg")},
            timeout=60.0,
        )
        r.raise_for_status()
        j = r.json()
    except Exception as e:
        # BUG-1: serving liveness lỗi -> 503 rõ ràng, KHÔNG fallback mock âm thầm.
        # (cũng bỏ 2 dòng print DEBUG rò rỉ vào log mỗi request)
        raise service_unavailable(f"Model serving liveness (:8502) không phản hồi: {e}")

    score = float(j.get("liveness_score", 0.5))
    threshold = settings.LIVENESS_THRESHOLD if threshold is None else threshold
    verdict, confidence = _verdict_from_score(score, threshold)
    # Đọc attack_type từ heuristic classifier (attack_analysis) nếu có
    attack_info = j.get("attack_analysis")
    if verdict == "LIVE":
        spoof_type = None
    elif attack_info and attack_info.get("attack_type") and attack_info["attack_type"] != "unknown":
        spoof_type = attack_info["attack_type"]   # "print" | "screen"
    else:
        spoof_type = "unknown"
    elapsed = int((time.perf_counter() - start) * 1000)
    serving_details = j.get("timing_details_ms")
    print(f"[DEBUG TIMING BE-LIVENESS] total_be_request={elapsed}ms "
          f"serving_reported={j.get('processing_time_ms')}ms "
          f"serving_details={serving_details}", flush=True)

    return LivenessResult(
        verdict=verdict,
        liveness_score=round(score, 4),
        confidence=confidence,
        spoof_type=spoof_type,
        threshold_used=threshold,
        processing_time_ms=elapsed,
        model_version=j.get("model_version", "b4-liveness"),
        image_width=w,
        image_height=h,
        image_hash=image_hash,
        image_thumb=_encode_thumb(image_bytes),
        attack_analysis=attack_info,
    )


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
        attack_analysis=repr_frame.attack_analysis,
    )


# ─────────────────────────────────────────────────────────────────────────────
# Public entry points
# ─────────────────────────────────────────────────────────────────────────────
async def run_liveness_check(image_bytes: bytes, threshold: float = None) -> LivenessResult:
    """Passive liveness — 1 frame → kết quả. threshold None => dùng config."""
    if settings.LIVENESS_INFER_URL:
        return _real_liveness(image_bytes, threshold=threshold)
    return _mock_liveness(image_bytes)


async def run_active_liveness(
    frames: list[bytes],
    challenge_type: str,
    challenge_passed: bool,
) -> LivenessResult:
    """Active liveness — list of frames + đã verify challenge ở client → aggregate."""
    per_frame: list[LivenessResult] = []
    for fb in frames:
        if settings.LIVENESS_INFER_URL:
            per_frame.append(_real_liveness(fb))
        else:
            per_frame.append(_mock_liveness(fb))
    return _aggregate_frames(per_frame, challenge_type, challenge_passed)


def random_challenge() -> str:
    return random.choice(CHALLENGES)
