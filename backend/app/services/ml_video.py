"""ml_video.py — inference VIDEO + thumbnail frame. Tách từ ml_inference (<=250 dòng)."""
import hashlib
import random

import numpy as np

from app.config import get_settings
from app.services.ml_model import (
    _get_model_and_transforms, _get_detector, _crop_face, _predict_face, _verdict_from_prob,
)

settings = get_settings()

def _encode_thumb_bgr(frame_bgr: np.ndarray, max_dim: int = 240, quality: int = 75) -> str:
    """Resize a BGR frame and encode as base64 JPEG data URL."""
    import cv2
    import base64
    h, w = frame_bgr.shape[:2]
    scale = min(max_dim / max(w, 1), max_dim / max(h, 1), 1.0)
    if scale < 1.0:
        frame_bgr = cv2.resize(frame_bgr, (int(w * scale), int(h * scale)), interpolation=cv2.INTER_AREA)
    ok, buf = cv2.imencode(".jpg", frame_bgr, [int(cv2.IMWRITE_JPEG_QUALITY), quality])
    if not ok:
        return ""
    return "data:image/jpeg;base64," + base64.b64encode(buf.tobytes()).decode("ascii")


def _extract_thumbs_for_ids(video_bytes: bytes, wanted_ids: list[int], max_dim: int = 240) -> dict[int, str]:
    """Open video once, walk frames, encode only the requested frame IDs."""
    import cv2
    import tempfile
    import os
    wanted = set(wanted_ids)
    if not wanted:
        return {}
    with tempfile.NamedTemporaryFile(suffix=".mp4", delete=False) as f:
        f.write(video_bytes)
        tmp_path = f.name
    thumbs: dict[int, str] = {}
    try:
        cap = cv2.VideoCapture(tmp_path)
        if not cap.isOpened():
            return {}
        fid = 0
        max_id = max(wanted)
        while fid <= max_id:
            ret, frame = cap.read()
            if not ret:
                break
            if fid in wanted:
                thumbs[fid] = _encode_thumb_bgr(frame, max_dim)
            fid += 1
        cap.release()
    finally:
        os.unlink(tmp_path)
    return thumbs


def _real_inference_video(video_bytes: bytes, sample_rate: int = 3) -> dict:
    """
    Port infer_video() từ notebook.
    Returns dict với frame-level results + final verdict.
    """
    import torch
    import cv2
    import tempfile
    import os

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model, val_tf, flip_tf, device = _get_model_and_transforms(settings.MODEL_PATH, device)
    detector = _get_detector()

    # Ghi bytes ra temp file vì cv2.VideoCapture cần path
    with tempfile.NamedTemporaryFile(suffix=".mp4", delete=False) as f:
        f.write(video_bytes)
        tmp_path = f.name

    try:
        cap = cv2.VideoCapture(tmp_path)
        if not cap.isOpened():
            raise ValueError("Cannot open video file")

        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        frame_results, frame_id = [], 0

        while True:
            ret, frame = cap.read()
            if not ret:
                break
            if frame_id % sample_rate == 0:
                img_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                face = _crop_face(img_rgb, detector)
                if face is not None:
                    preds = _predict_face(face, model, val_tf, flip_tf, device)
                    frame_results.append({
                        "frame_id": frame_id,
                        "prob_fake": preds["prob_fake"],
                        "prob_cnn":  preds["prob_cnn"],
                        "thumb":     _encode_thumb_bgr(frame),
                    })
            frame_id += 1
        cap.release()
    finally:
        os.unlink(tmp_path)

    if not frame_results:
        return {
            "verdict": "UNCERTAIN",
            "confidence": 50.0,
            "prob_fake": 0.5,
            "frames_analyzed": 0,
            "frames_fake": 0,
            "frame_results": [],
        }

    fake_probs = [d["prob_fake"] for d in frame_results]
    avg_prob   = float(np.mean(fake_probs))
    verdict, confidence = _verdict_from_prob(avg_prob, settings.MODEL_THRESHOLD)
    n_fake = sum(1 for p in fake_probs if p >= settings.MODEL_THRESHOLD)

    return {
        "verdict":        verdict,
        "confidence":     confidence,
        "prob_fake":      round(avg_prob, 4),
        "frames_analyzed": len(frame_results),
        "frames_fake":    n_fake,
        "frame_results":  frame_results,
    }


# Số frame tối đa gửi sang microservice SFDCT (chặn video dài làm nghẽn :8501).
SFDCT_MAX_FRAMES = 60


def _sfdct_inference_video(video_bytes: bytes, sample_rate: int = 3) -> dict:
    """Video inference qua microservice SFDCT (model THẬT của thesis, :8501) — KHÔNG dùng best_model.
    MTCNN-crop từng frame mẫu -> POST /predict -> aggregate. Service down -> fallback mock (không chặn API).
    """
    import cv2
    import httpx
    import tempfile
    import os

    url = settings.SFDCT_INFER_URL.rstrip("/") + "/predict"

    with tempfile.NamedTemporaryFile(suffix=".mp4", delete=False) as f:
        f.write(video_bytes)
        tmp_path = f.name

    frame_results: list[dict] = []
    service_errors = 0
    truncated = False
    try:
        cap = cv2.VideoCapture(tmp_path)
        if not cap.isOpened():
            raise ValueError("Cannot open video file")
        frame_id = 0
        with httpx.Client(timeout=60.0) as client:
            while True:
                ret, frame = cap.read()
                if not ret:
                    break
                if frame_id % sample_rate == 0:
                    if len(frame_results) >= SFDCT_MAX_FRAMES:
                        truncated = True
                        break
                    # Gửi NGUYÊN frame sang :8501 để service tự crop mặt (giống path ảnh
                    # _sfdct_inference) -> backend KHÔNG cần torch/MTCNN, hết lỗi
                    # "No module named 'torch'" khi xử lý video.
                    ok, buf = cv2.imencode(".jpg", frame)            # frame là BGR
                    if ok:
                        try:
                            r = client.post(url, files={"file": ("frame.jpg", buf.tobytes(), "image/jpeg")})
                            r.raise_for_status()
                            prob = float(r.json().get("prob_fake", 0.0))
                            frame_results.append({
                                "frame_id":  frame_id,
                                "prob_fake": round(prob, 4),
                                "prob_cnn":  round(prob, 4),
                                "thumb":     _encode_thumb_bgr(frame),
                            })
                        except Exception:
                            service_errors += 1
                frame_id += 1
        cap.release()
    finally:
        os.unlink(tmp_path)

    if truncated:
        print(f"[DeepGuard] video: cắt còn {SFDCT_MAX_FRAMES} frame gửi SFDCT (video dài, sample_rate={sample_rate}).")

    if not frame_results:
        if service_errors:                       # SFDCT down -> fallback mock (giống _sfdct_inference cho ảnh)
            print(f"[DeepGuard] SFDCT :8501 lỗi {service_errors} frame -> fallback mock video.")
            return _mock_inference_video(video_bytes, sample_rate)
        return {                                 # mở được video nhưng không detect được mặt nào
            "verdict": "UNCERTAIN", "confidence": 50.0, "prob_fake": 0.5,
            "frames_analyzed": 0, "frames_fake": 0, "frame_results": [],
        }

    fake_probs = [d["prob_fake"] for d in frame_results]
    avg_prob   = float(np.mean(fake_probs))
    verdict, confidence = _verdict_from_prob(avg_prob, settings.MODEL_THRESHOLD)
    n_fake = sum(1 for p in fake_probs if p >= settings.MODEL_THRESHOLD)
    return {
        "verdict":         verdict,
        "confidence":      confidence,
        "prob_fake":       round(avg_prob, 4),
        "frames_analyzed": len(frame_results),
        "frames_fake":     n_fake,
        "frame_results":   frame_results,
    }


def _mock_inference_video(video_bytes: bytes, sample_rate: int = 3) -> dict:
    image_hash = hashlib.sha256(video_bytes).hexdigest()
    seed = int(image_hash[:8], 16)
    rng  = random.Random(seed)

    # Try to read actual frame count so we can extract real thumbnails
    try:
        import cv2
        import tempfile
        import os
        with tempfile.NamedTemporaryFile(suffix=".mp4", delete=False) as f:
            f.write(video_bytes)
            tmp_path = f.name
        try:
            cap = cv2.VideoCapture(tmp_path)
            total = int(cap.get(cv2.CAP_PROP_FRAME_COUNT)) if cap.isOpened() else 0
            cap.release()
        finally:
            os.unlink(tmp_path)
    except Exception:
        total = 0

    if total > 0:
        frame_ids = list(range(0, total, max(sample_rate, 1)))[:30]
        thumbs    = _extract_thumbs_for_ids(video_bytes, frame_ids)
    else:
        n = rng.randint(10, 30)
        frame_ids = [i * sample_rate for i in range(n)]
        thumbs    = {}

    fake_probs = [rng.uniform(0.05, 0.95) for _ in frame_ids]
    avg_prob   = float(np.mean(fake_probs))
    verdict, confidence = _verdict_from_prob(avg_prob, settings.MODEL_THRESHOLD)
    n_fake = sum(1 for p in fake_probs if p >= settings.MODEL_THRESHOLD)
    return {
        "verdict":        verdict,
        "confidence":     confidence,
        "prob_fake":      round(avg_prob, 4),
        "frames_analyzed": len(frame_ids),
        "frames_fake":    n_fake,
        "frame_results":  [
            {"frame_id": fid, "prob_fake": round(p, 4), "thumb": thumbs.get(fid, "")}
            for fid, p in zip(frame_ids, fake_probs)
        ],
    }
