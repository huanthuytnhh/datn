import io
import time
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
from app.routers._detect_helpers import build_detection_response
from app.routers._liveness_helpers import _save_liveness, _to_response
from app.services.cascade import cascade_decision
from app.services.liveness import run_liveness_check
from app.schemas.cascade import CascadeResponse

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

    return await build_detection_response(
        db, image_bytes, api_key=api_key, request=request,
        threshold=threshold, model=model, content_type=file.content_type, source="api",
    )


@router.post("/detect/cascade", response_model=CascadeResponse)
async def detect_cascade(
    request: Request,
    file: UploadFile = File(...),
    threshold: float = Query(default=None, ge=0.0, le=1.0,
                             description="Override ngưỡng (áp cho cả liveness lẫn deepfake)"),
    api_key: ApiKey = Depends(get_api_key_auth),
    db: AsyncSession = Depends(get_db),
):
    """Cascade eKYC: liveness prefilter → (nếu LIVE) deepfake. Logic gộp ở backend.

    Mirror nhánh client cũ (ekyc_demo): SPOOF→FAIL, UNCERTAIN→REVIEW, LIVE→deepfake.
    Trả payload lồng full (liveness + deepfake) y hệt endpoint lẻ để client tái dùng render."""
    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise bad_request(f"Unsupported file type: {file.content_type}")
    image_bytes = await file.read()
    if len(image_bytes) > MAX_IMAGE_SIZE:
        raise bad_request("File size exceeds 10 MB limit")
    _assert_valid_image(image_bytes)

    t0 = time.perf_counter()
    # 1) Liveness prefilter — lưu LivenessCheck (source='cascade')
    live_result = await run_liveness_check(image_bytes, threshold=threshold)
    live_row = await _save_liveness(
        db, tenant_id=api_key.tenant_id, api_key_id=api_key.id,
        result=live_result, mode="passive", request=request, source="cascade",
    )
    live_resp = _to_response(live_row, attack_analysis=live_result.attack_analysis)

    # 2) Deepfake chỉ chạy khi LIVE (tiết kiệm 1 forward pass khi đã chặn)
    deepfake_resp = None
    hint = None
    if live_resp.verdict == "LIVE":
        deepfake_resp = await build_detection_response(
            db, image_bytes, api_key=api_key, request=request,
            threshold=threshold, model=None, content_type=file.content_type, source="cascade",
        )
        hint = deepfake_resp.decision_hint

    final, reason = cascade_decision(live_resp.verdict, hint)
    rid = str(deepfake_resp.request_id) if deepfake_resp else str(live_resp.check_id)
    return CascadeResponse(
        request_id=rid, liveness=live_resp, deepfake=deepfake_resp,
        final_decision=final, reason=reason,
        processing_time_ms=int((time.perf_counter() - t0) * 1000),
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
