import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, UploadFile, File, Request, Query
from sqlalchemy.ext.asyncio import AsyncSession

from deepguard_db.app.db.database import get_db
from deepguard_db.app.db import crud
from deepguard_db.app.db.models import ApiKey, DetectionVerdict, JobType, JobStatus

from app.config import get_settings
from app.dependencies import get_api_key_auth
from app.services.ml_inference import run_inference, run_video_inference

settings = get_settings()
from app.schemas.detect import DetectionResponse, DetectionListItem, VideoDetectionResponse, FrameResult
from app.schemas.common import Paginated
from app.core.exceptions import bad_request, not_found

router = APIRouter(prefix="/v1", tags=["detection"])

ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp", "image/bmp"}
ALLOWED_VIDEO_TYPES = {"video/mp4", "video/mpeg", "video/quicktime", "video/x-msvideo", "video/webm"}
MAX_IMAGE_SIZE = 10 * 1024 * 1024   # 10 MB
MAX_VIDEO_SIZE = 200 * 1024 * 1024  # 200 MB


@router.post("/detect/image", response_model=DetectionResponse)
async def detect_image(
    request: Request,
    file: UploadFile = File(...),
    threshold: float = Query(default=None, ge=0.0, le=1.0, description="Override detection threshold"),
    api_key: ApiKey = Depends(get_api_key_auth),
    db: AsyncSession = Depends(get_db),
):
    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise bad_request(f"Unsupported file type: {file.content_type}")

    image_bytes = await file.read()
    if len(image_bytes) > MAX_IMAGE_SIZE:
        raise bad_request("File size exceeds 10 MB limit")

    result = await run_inference(image_bytes)

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
        image_thumb=result.image_thumb,
        processing_time_ms=result.processing_time_ms,
        model_version=result.model_version,
        user_agent=request.headers.get("user-agent"),
        ip_address=request.client.host if request.client else None,
    )

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
        verdict=detection.verdict.value,
        confidence=detection.confidence,
        prob_fake=detection.prob_fake,
        prob_cnn=detection.prob_cnn,
        spatial_score=detection.spatial_score,
        frequency_score=detection.frequency_score,
        threshold_used=detection.threshold_used,
        face_detected=result.face_detected,
        processing_time_ms=detection.processing_time_ms,
        model_version=detection.model_version,
        image_width=detection.image_width,
        image_height=detection.image_height,
        created_at=detection.created_at,
        heatmap=result.heatmap,   # Grad-CAM overlay (base64) cho UI
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

    return DetectionResponse(
        request_id=detection.request_id,
        verdict=detection.verdict.value,
        confidence=detection.confidence,
        prob_fake=detection.prob_fake,
        prob_cnn=detection.prob_cnn,
        spatial_score=detection.spatial_score,
        frequency_score=detection.frequency_score,
        threshold_used=detection.threshold_used,
        face_detected=True,
        processing_time_ms=detection.processing_time_ms,
        model_version=detection.model_version,
        image_width=detection.image_width,
        image_height=detection.image_height,
        created_at=detection.created_at,
    )
