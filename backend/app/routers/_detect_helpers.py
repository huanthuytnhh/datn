"""_detect_helpers.py — builder dùng chung cho /detect/image và /detect/cascade (DRY).

Tách nguyên khối logic inference→persist→response của detect_image để cascade tái dùng,
giữ y hệt hành vi (cùng 17 field DetectionResponse, S3 evidence, metrics, cộng quota)."""
import asyncio

from sqlalchemy import update
from sqlalchemy.ext.asyncio import AsyncSession

from deepguard_db.app.db import crud
from deepguard_db.app.db.models import ApiKey as ApiKeyModel, DetectionVerdict
from app.services.ml_inference import run_inference
from app.services.ml_model import frequency_viz, _encode_image_thumb
from app.services.risk import to_risk_score, risk_band, decision_hint, thresholds_dict
from app.services import storage, metrics
from app.schemas.detect import DetectionResponse


async def build_detection_response(
    db: AsyncSession, image_bytes: bytes, *, api_key, request,
    threshold=None, model=None, content_type="image/jpeg", source="api",
) -> DetectionResponse:
    """Chạy deepfake inference → lưu Detection(source) → cộng quota → trả DetectionResponse."""
    result = await run_inference(image_bytes, threshold=threshold, model=model)

    risk = to_risk_score(result.prob_fake)
    band = risk_band(risk)
    freq = frequency_viz(image_bytes)

    detection = await crud.create_detection(
        db,
        tenant_id=api_key.tenant_id,
        api_key_id=api_key.id,
        verdict=DetectionVerdict(result.verdict),
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
        source=source,
    )

    # Bằng chứng Grad-CAM + media gốc lên S3 (no-op khi S3 tắt) + metric
    if storage.enabled() and result.heatmap:
        detection.heatmap_url = await asyncio.to_thread(
            storage.upload_heatmap, api_key.tenant_id, detection.request_id, result.heatmap
        )
    if storage.enabled():
        await asyncio.to_thread(storage.upload_media, api_key.tenant_id, detection.request_id,
                                image_bytes, content_type or "image/jpeg", "input")
    if metrics.enabled():
        await asyncio.to_thread(metrics.emit_detection, result.verdict, result.prob_fake,
                                result.processing_time_ms, "api")

    from datetime import datetime
    await db.execute(
        update(ApiKeyModel).where(ApiKeyModel.id == api_key.id)
        .values(quota_used=ApiKeyModel.quota_used + 1, last_used_at=datetime.utcnow())
    )
    await crud.increment_tenant_usage(db, api_key.tenant_id)
    await db.commit()

    return DetectionResponse(
        request_id=detection.request_id,
        risk_score=risk,
        risk_band=band,
        decision_hint=decision_hint(band),
        thresholds=thresholds_dict(),
        heatmap=result.heatmap,
        frequency=freq,
        verdict=detection.verdict.value,
        confidence=detection.confidence,
        prob_fake=detection.prob_fake,
        threshold_used=detection.threshold_used,
        face_detected=result.face_detected,
        processing_time_ms=detection.processing_time_ms,
        model_version=detection.model_version,
        image_width=detection.image_width,
        image_height=detection.image_height,
        quality=result.quality,
        created_at=detection.created_at,
    )
