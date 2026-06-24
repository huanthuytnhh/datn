import io
import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, UploadFile, File, Request, Query, HTTPException
from PIL import Image
from sqlalchemy.ext.asyncio import AsyncSession

from deepguard_db.app.db.database import get_db
from deepguard_db.app.db import crud
from deepguard_db.app.db.models import ApiKey, DetectionVerdict, JobType, JobStatus

from app.config import get_settings
from app.dependencies import get_api_key_auth
from app.services.ml_inference import run_inference, run_video_inference
from app.services.ml_model import frequency_viz, _encode_image_thumb
from app.services.risk import to_risk_score, risk_band, decision_hint, thresholds_dict
from app.services import storage

settings = get_settings()
from app.schemas.detect import DetectionResponse, DetectionListItem, VideoDetectionResponse, FrameResult
from app.schemas.common import Paginated
from app.core.exceptions import bad_request, not_found

router = APIRouter(prefix="/v1", tags=["detection"])

ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp", "image/bmp"}
ALLOWED_VIDEO_TYPES = {"video/mp4", "video/mpeg", "video/quicktime", "video/x-msvideo", "video/webm"}
MAX_IMAGE_SIZE = 10 * 1024 * 1024   # 10 MB
MAX_VIDEO_SIZE = 200 * 1024 * 1024  # 200 MB


def _assert_valid_image(image_bytes: bytes) -> None:
    # BUG-3: validate ảnh THẬT (không chỉ content_type) — chặn file rác giả header image/*.
    try:
        Image.open(io.BytesIO(image_bytes)).verify()
    except Exception:
        raise bad_request("File không phải ảnh hợp lệ (không giải mã được).")


@router.post("/detect/image", response_model=DetectionResponse)
async def detect_image(
    request: Request,
    file: UploadFile = File(...),
    threshold: float = Query(default=None, ge=0.0, le=1.0, description="Override detection threshold"),
    model: str = Query(default=None, description="Model deepfake: sfdct|b4|hff (mặc định sfdct)"),
    api_key: ApiKey = Depends(get_api_key_auth),
    db: AsyncSession = Depends(get_db),
):
    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise bad_request(f"Unsupported file type: {file.content_type}")

    image_bytes = await file.read()
    if len(image_bytes) > MAX_IMAGE_SIZE:
        raise bad_request("File size exceeds 10 MB limit")
    _assert_valid_image(image_bytes)   # BUG-3: chặn file rác giả header image/*

    result = await run_inference(image_bytes, threshold=threshold, model=model)

    # ── Tín hiệu rủi ro (định vị eKYC) — calibrate prob_fake → risk_score + band + gợi ý ──
    risk = to_risk_score(result.prob_fake)
    band = risk_band(risk)
    freq = frequency_viz(image_bytes)   # phổ log|2D-DCT| (bằng chứng tần số, nhìn chuyên nghiệp)

    verdict_enum = DetectionVerdict(result.verdict)
    detection = await crud.create_detection(
        db,
        tenant_id=api_key.tenant_id,
        api_key_id=api_key.id,
        verdict=verdict_enum,
        confidence=result.confidence,
        prob_fake=result.prob_fake,
        prob_cnn=result.prob_cnn,
        spatial_score=result.spatial_score,
        frequency_score=result.frequency_score,
        threshold_used=result.threshold_used,
        image_hash=result.image_hash,
        image_width=result.image_width,
        image_height=result.image_height,
        image_thumb=result.image_thumb or _encode_image_thumb(image_bytes),
        processing_time_ms=result.processing_time_ms,
        model_version=result.model_version,
        user_agent=request.headers.get("user-agent"),
        ip_address=request.client.host if request.client else None,
    )

    # Phase 2: lưu bằng chứng Grad-CAM lên S3 (no-op khi S3_BUCKET trống)
    if storage.enabled() and result.heatmap:
        import asyncio
        detection.heatmap_url = await asyncio.to_thread(
            storage.upload_heatmap, api_key.tenant_id, detection.request_id, result.heatmap
        )

    # Phase 3: lưu media gốc lên S3 (audit) + bắn CloudWatch metric (no-op khi tắt)
    import asyncio as _aio
    from app.services import metrics
    if storage.enabled():
        await _aio.to_thread(storage.upload_media, api_key.tenant_id, detection.request_id,
                             image_bytes, file.content_type or "image/jpeg", "input")
    if metrics.enabled():
        await _aio.to_thread(metrics.emit_detection, result.verdict, result.prob_fake,
                             result.processing_time_ms, "api")

    # Increment quotas
    from sqlalchemy import update
    from deepguard_db.app.db.models import ApiKey as ApiKeyModel, Tenant
    await db.execute(
        update(ApiKeyModel).where(ApiKeyModel.id == api_key.id)
        .values(quota_used=ApiKeyModel.quota_used + 1)
    )
    await crud.increment_tenant_usage(db, api_key.tenant_id)
    await db.commit()

    return DetectionResponse(
        request_id=detection.request_id,
        # ── Tín hiệu rủi ro (khách eKYC dùng cái này) ──
        risk_score=risk,
        risk_band=band,
        decision_hint=decision_hint(band),
        thresholds=thresholds_dict(),
        # ── Giải thích (nhìn chuyên nghiệp) ──
        heatmap=result.heatmap,   # Grad-CAM overlay (base64) — vùng nghi vấn
        frequency=freq,           # phổ log|2D-DCT| (base64) — bằng chứng tần số
        # ── Tương thích ngược + chi tiết ──
        verdict=detection.verdict.value,
        confidence=detection.confidence,
        prob_fake=detection.prob_fake,
        threshold_used=detection.threshold_used,
        face_detected=result.face_detected,
        processing_time_ms=detection.processing_time_ms,
        model_version=detection.model_version,
        image_width=detection.image_width,
        image_height=detection.image_height,
        created_at=detection.created_at,
    )


@router.post("/detect/video", response_model=VideoDetectionResponse, status_code=202)
async def detect_video(
    request: Request,
    file: UploadFile = File(...),
    sample_rate: int = Query(default=3, ge=1, le=30, description="Process every Nth frame"),
    api_key: ApiKey = Depends(get_api_key_auth),
    db: AsyncSession = Depends(get_db),
):
    """
    Video deepfake detection — port infer_video() từ notebook.
    Sample frames tại mỗi `sample_rate` frames, aggregate verdict.
    """
    if file.content_type not in ALLOWED_VIDEO_TYPES:
        raise bad_request(f"Unsupported video type: {file.content_type}")

    video_bytes = await file.read()
    if len(video_bytes) > MAX_VIDEO_SIZE:
        raise bad_request("Video size exceeds 200 MB limit")

    start_ts = datetime.now(timezone.utc)

    # Tạo job record trước khi process
    from deepguard_db.app.db.models import Job
    job = Job(
        tenant_id=api_key.tenant_id,
        api_key_id=api_key.id,
        type=JobType.VIDEO_DETECTION,
        status=JobStatus.PROCESSING,
        started_at=start_ts,
    )
    db.add(job)
    await db.flush()

    try:
        result = await run_video_inference(video_bytes, sample_rate=sample_rate)

        import time
        processing_ms = int((datetime.now(timezone.utc) - start_ts).total_seconds() * 1000)

        # Phase 3: lưu video gốc lên S3 (audit) + CloudWatch metric (no-op khi tắt)
        import asyncio as _aio
        from app.services import metrics
        if storage.enabled():
            await _aio.to_thread(storage.upload_media, api_key.tenant_id, job.id,
                                 video_bytes, "video/mp4", "input")
        if metrics.enabled():
            await _aio.to_thread(metrics.emit_detection, result["verdict"], result["prob_fake"],
                                 processing_ms, "api")

        job.status = JobStatus.COMPLETED
        job.progress_percent = 100
        job.completed_at = datetime.now(timezone.utc)
        job.result = {
            "verdict":         result["verdict"],
            "confidence":      result["confidence"],
            "prob_fake":       result["prob_fake"],
            "frames_analyzed": result["frames_analyzed"],
            "frames_fake":     result["frames_fake"],
            "model_version":   settings.MODEL_VERSION,
            "processing_ms":   processing_ms,
        }

        # Increment quota
        from sqlalchemy import update
        from deepguard_db.app.db.models import ApiKey as ApiKeyModel
        await db.execute(
            update(ApiKeyModel).where(ApiKeyModel.id == api_key.id)
            .values(quota_used=ApiKeyModel.quota_used + 1)
        )
        await crud.increment_tenant_usage(db, api_key.tenant_id)
        await db.commit()

        return VideoDetectionResponse(
            job_id=job.id,
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

    except HTTPException:
        # BUG-1: giữ nguyên 503 từ serving (đừng nuốt thành 400 chung chung)
        job.status = JobStatus.FAILED
        await db.commit()
        raise
    except Exception as exc:
        job.status = JobStatus.FAILED
        job.error_message = str(exc)[:1000]
        await db.commit()
        raise bad_request(f"Video inference failed: {exc}")


@router.get("/jobs/{job_id}")
async def get_job(
    job_id: uuid.UUID,
    api_key: ApiKey = Depends(get_api_key_auth),
    db: AsyncSession = Depends(get_db),
):
    """Poll trạng thái job video detection."""
    from sqlalchemy import select
    from deepguard_db.app.db.models import Job
    result = await db.execute(
        select(Job).where(Job.id == job_id, Job.tenant_id == api_key.tenant_id)
    )
    job = result.scalar_one_or_none()
    if not job:
        raise not_found("Job")
    return {
        "job_id":          job.id,
        "status":          job.status.value,
        "progress_percent": job.progress_percent,
        "result":          job.result,
        "error_message":   job.error_message,
        "created_at":      job.created_at,
        "completed_at":    job.completed_at,
    }


@router.get("/results/{request_id}", response_model=DetectionResponse)
async def get_result(
    request_id: uuid.UUID,
    api_key: ApiKey = Depends(get_api_key_auth),
    db: AsyncSession = Depends(get_db),
):
    detection = await crud.get_detection(db, request_id, api_key.tenant_id)
    if not detection:
        raise not_found("Detection result")

    # Tái tạo tín hiệu rủi ro từ prob_fake đã lưu (frequency/heatmap không lưu DB → bỏ qua khi xem lại)
    risk = to_risk_score(detection.prob_fake)
    band = risk_band(risk)

    return DetectionResponse(
        request_id=detection.request_id,
        risk_score=risk,
        risk_band=band,
        decision_hint=decision_hint(band),
        thresholds=thresholds_dict(),
        verdict=detection.verdict.value,
        confidence=detection.confidence,
        prob_fake=detection.prob_fake,
        threshold_used=detection.threshold_used,
        face_detected=True,
        processing_time_ms=detection.processing_time_ms,
        model_version=detection.model_version,
        image_width=detection.image_width,
        image_height=detection.image_height,
        created_at=detection.created_at,
    )
