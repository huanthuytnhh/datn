"""playground.py — detect bằng JWT cho Playground trong dashboard (KHÔNG cần API key).

Người dùng dashboard (admin/developer) test thử ngay sau khi login. Tách bạch với /v1/detect/*
(API-key, dùng cho tích hợp ngoài). Ghi detections với source='playground' để hiện trong History
với badge riêng — api_key_id = NULL (đã cho phép nullable ở schema).
"""
import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, UploadFile, File, Query, Request
from sqlalchemy.ext.asyncio import AsyncSession

from deepguard_db.app.db.database import get_db
from deepguard_db.app.db import crud
from deepguard_db.app.db.models import User, DetectionVerdict

from app.config import get_settings
from app.dependencies import require_role
from app.services.ml_inference import run_inference, run_video_inference
from app.services.ml_model import frequency_viz, _encode_image_thumb
from app.services.risk import to_risk_score, risk_band, decision_hint, thresholds_dict
from app.services import storage
from app.schemas.detect import DetectionResponse, VideoDetectionResponse, FrameResult
from app.core.exceptions import bad_request
import io
from PIL import Image
from app.services.liveness import run_liveness_check
from app.routers._liveness_helpers import _save_liveness, _to_response
from app.schemas.liveness import LivenessResponse

settings = get_settings()

router = APIRouter(prefix="/playground", tags=["playground"])

ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp", "image/bmp"}
ALLOWED_VIDEO_TYPES = {"video/mp4", "video/mpeg", "video/quicktime", "video/x-msvideo", "video/webm"}
MAX_IMAGE_SIZE = 10 * 1024 * 1024    # 10 MB
MAX_VIDEO_SIZE = 200 * 1024 * 1024   # 200 MB

# Cùng tập role được xem trang Playground ở FE (rbac.ts)
_playground_user = require_role("admin", "developer")


@router.post("/detect/image", response_model=DetectionResponse)
async def playground_detect_image(
    file: UploadFile = File(...),
    threshold: float = Query(default=None, ge=0.0, le=1.0, description="Override detection threshold"),
    include_heatmap: bool = Query(default=True, description="Tắt để bỏ Grad-CAM (nhanh ~2x)"),
    model: str = Query(default=None, description="Model deepfake: sfdct|b4|hff (mặc định sfdct)"),
    current_user: User = Depends(_playground_user),
    db: AsyncSession = Depends(get_db),
):
    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise bad_request(f"Unsupported file type: {file.content_type}")
    image_bytes = await file.read()
    if len(image_bytes) > MAX_IMAGE_SIZE:
        raise bad_request("File size exceeds 10 MB limit")

    result = await run_inference(image_bytes, include_heatmap=include_heatmap, threshold=threshold, model=model)

    risk = to_risk_score(result.prob_fake)
    band = risk_band(risk)
    freq = frequency_viz(image_bytes)

    import hashlib
    image_hash = hashlib.sha256(image_bytes).hexdigest()

    # Ghi vào detections với source='playground', api_key_id=None
    det = await crud.create_detection(
        db,
        tenant_id=current_user.tenant_id,
        api_key_id=None,
        source="playground",
        verdict=DetectionVerdict(result.verdict),
        confidence=result.confidence,
        prob_fake=result.prob_fake,
        prob_cnn=result.prob_cnn,
        spatial_score=result.spatial_score,
        frequency_score=result.frequency_score,
        threshold_used=result.threshold_used,
        image_hash=image_hash,
        image_width=result.image_width,
        image_height=result.image_height,
        image_thumb=_encode_image_thumb(image_bytes),  # store thumbnail so Detail can show the analysed image
        processing_time_ms=result.processing_time_ms,
        model_version=result.model_version,
        user_agent=file.filename,
    )
    # Phase 2: lưu bằng chứng Grad-CAM lên S3 (no-op khi S3_BUCKET trống)
    if storage.enabled() and result.heatmap:
        import asyncio
        det.heatmap_url = await asyncio.to_thread(
            storage.upload_heatmap, current_user.tenant_id, det.request_id, result.heatmap
        )
    # Phase 3: lưu media gốc lên S3 (audit) + bắn CloudWatch metric (no-op khi tắt)
    import asyncio as _aio
    from app.services import metrics
    if storage.enabled():
        await _aio.to_thread(storage.upload_media, current_user.tenant_id, det.request_id,
                             image_bytes, file.content_type or "image/jpeg", "input")
    if metrics.enabled():
        await _aio.to_thread(metrics.emit_detection, result.verdict, result.prob_fake,
                             result.processing_time_ms, "playground")
    await crud.increment_tenant_usage(db, current_user.tenant_id)
    await db.commit()

    return DetectionResponse(
        request_id=det.request_id,
        risk_score=risk,
        risk_band=band,
        decision_hint=decision_hint(band),
        thresholds=thresholds_dict(),
        heatmap=result.heatmap,
        frequency=freq,
        verdict=result.verdict,
        confidence=result.confidence,
        prob_fake=result.prob_fake,
        threshold_used=result.threshold_used,
        face_detected=result.face_detected,
        processing_time_ms=result.processing_time_ms,
        model_version=result.model_version,
        image_width=result.image_width,
        image_height=result.image_height,
        created_at=datetime.now(timezone.utc),
    )


@router.post("/detect/video", response_model=VideoDetectionResponse)
async def playground_detect_video(
    file: UploadFile = File(...),
    sample_rate: int = Query(default=3, ge=1, le=30, description="Process every Nth frame"),
    current_user: User = Depends(_playground_user),
    db: AsyncSession = Depends(get_db),
):
    if file.content_type not in ALLOWED_VIDEO_TYPES:
        raise bad_request(f"Unsupported video type: {file.content_type}")
    video_bytes = await file.read()
    if len(video_bytes) > MAX_VIDEO_SIZE:
        raise bad_request("Video size exceeds 200 MB limit")

    start_ts = datetime.now(timezone.utc)
    try:
        result = await run_video_inference(video_bytes, sample_rate=sample_rate)
    except Exception as exc:
        raise bad_request(f"Video inference failed: {exc}")

    processing_ms = int((datetime.now(timezone.utc) - start_ts).total_seconds() * 1000)

    # Phase 3: lưu video gốc lên S3 (audit) + CloudWatch metric (no-op khi tắt)
    import asyncio as _aio
    from app.services import metrics
    pg_job_id = uuid.uuid4()
    if storage.enabled():
        await _aio.to_thread(storage.upload_media, current_user.tenant_id, pg_job_id,
                             video_bytes, "video/mp4", "input")
    if metrics.enabled():
        await _aio.to_thread(metrics.emit_detection, result["verdict"], result["prob_fake"],
                             processing_ms, "playground")

    await crud.increment_tenant_usage(db, current_user.tenant_id)
    await db.commit()

    return VideoDetectionResponse(
        job_id=pg_job_id,
        verdict=result["verdict"],
        confidence=result["confidence"],
        prob_fake=result["prob_fake"],
        frames_analyzed=result["frames_analyzed"],
        frames_fake=result["frames_fake"],
        frame_results=[FrameResult(**f) for f in result["frame_results"]],
        model_version=settings.MODEL_VERSION,
        processing_time_ms=processing_ms,
        created_at=start_ts,
    )


@router.post("/detect/liveness", response_model=LivenessResponse)
async def playground_detect_liveness(
    request: Request,
    file: UploadFile = File(...),
    threshold: float = Query(default=None, ge=0.0, le=1.0,
        description="Ngưỡng LIVE/SPOOF override (0-1). Bỏ trống => LIVENESS_THRESHOLD ở config."),
    current_user: User = Depends(_playground_user),
    db: AsyncSession = Depends(get_db),
):
    """Passive liveness bằng JWT cho Playground (KHÔNG cần API key). Lưu source='playground'."""
    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise bad_request(f"Unsupported file type: {file.content_type}")
    image_bytes = await file.read()
    if len(image_bytes) > MAX_IMAGE_SIZE:
        raise bad_request("File size exceeds 10 MB limit")
    try:
        Image.open(io.BytesIO(image_bytes)).verify()
    except Exception:
        raise bad_request("File không phải ảnh hợp lệ (không giải mã được).")

    result = await run_liveness_check(image_bytes, threshold=threshold)
    row = await _save_liveness(
        db, tenant_id=current_user.tenant_id, api_key_id=None,
        result=result, mode="passive", request=request, source="playground",
    )
    return _to_response(row)
