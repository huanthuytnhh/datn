"""_liveness_helpers.py — lưu kết quả liveness + map sang response (tách <=250)."""
import uuid

from fastapi import Request
from sqlalchemy import update
from sqlalchemy.ext.asyncio import AsyncSession

from deepguard_db.app.db import crud
from deepguard_db.app.db.models import (
    ApiKey as ApiKeyModel, LivenessCheck, LivenessVerdict, SpoofType,
)
from app.services.liveness import LivenessResult
from app.schemas.liveness import LivenessResponse


async def _save_liveness(
    db: AsyncSession,
    *,
    tenant_id: uuid.UUID,
    api_key_id: uuid.UUID | None,
    result: LivenessResult,
    mode: str,
    request: Request,
    source: str = "api",
) -> LivenessCheck:
    row = LivenessCheck(
        tenant_id=tenant_id,
        api_key_id=api_key_id,
        source=source,
        verdict=LivenessVerdict(result.verdict),
        liveness_score=result.liveness_score,
        confidence=result.confidence,
        spoof_type=SpoofType(result.spoof_type) if result.spoof_type else None,
        threshold_used=result.threshold_used,
        mode=mode,
        challenge_type=result.challenge_type,
        challenge_passed=result.challenge_passed,
        frame_count=result.frame_count,
        image_hash=result.image_hash,
        image_width=result.image_width,
        image_height=result.image_height,
        image_thumb=result.image_thumb,
        processing_time_ms=result.processing_time_ms,
        model_version=result.model_version,
        user_agent=request.headers.get("user-agent"),
        ip_address=request.client.host if request.client else None,
    )
    db.add(row)
    await db.flush()

    # Same quota accounting as detection — chỉ khi có API key (playground JWT: api_key_id=None -> bỏ qua)
    if api_key_id is not None:
        await db.execute(
            update(ApiKeyModel).where(ApiKeyModel.id == api_key_id)
            .values(quota_used=ApiKeyModel.quota_used + 1)
        )
    await crud.increment_tenant_usage(db, tenant_id)
    await db.commit()
    await db.refresh(row)
    return row


def _to_response(row: LivenessCheck, attack_analysis: dict = None) -> LivenessResponse:
    return LivenessResponse(
        check_id=row.check_id,
        verdict=row.verdict.value,
        liveness_score=row.liveness_score,
        confidence=row.confidence,
        spoof_type=row.spoof_type.value if row.spoof_type else None,
        threshold_used=row.threshold_used,
        mode=row.mode,
        frame_count=row.frame_count,
        processing_time_ms=row.processing_time_ms,
        model_version=row.model_version,
        attack_analysis=attack_analysis,
        image_width=row.image_width,
        image_height=row.image_height,
        created_at=row.created_at,
    )
