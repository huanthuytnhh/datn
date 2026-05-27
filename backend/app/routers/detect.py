import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, UploadFile, File, Request
from sqlalchemy.ext.asyncio import AsyncSession

from deepguard_db.app.db.database import get_db
from deepguard_db.app.db import crud
from deepguard_db.app.db.models import ApiKey, DetectionVerdict

from app.dependencies import get_api_key_auth
from app.services.ml_inference import run_inference
from app.schemas.detect import DetectionResponse, DetectionListItem
from app.schemas.common import Paginated
from app.core.exceptions import bad_request, not_found

router = APIRouter(prefix="/v1", tags=["detection"])

ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/png", "image/webp", "image/bmp"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB


@router.post("/detect/image", response_model=DetectionResponse)
async def detect_image(
    request: Request,
    file: UploadFile = File(...),
    api_key: ApiKey = Depends(get_api_key_auth),
    db: AsyncSession = Depends(get_db),
):
    if file.content_type not in ALLOWED_CONTENT_TYPES:
        raise bad_request(f"Unsupported file type: {file.content_type}")

    image_bytes = await file.read()
    if len(image_bytes) > MAX_FILE_SIZE:
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
    )


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
