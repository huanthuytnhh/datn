import uuid
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, Query, Request
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from deepguard_db.app.db.database import get_db
from deepguard_db.app.db import crud
from deepguard_db.app.db.models import User, DetectionVerdict, Detection, ApiKey, Tenant

from app.core.exceptions import not_found
from app.core.audit import audit
from app.dependencies import require_role
from app.schemas.detect import (
    AuditNoteCreate,
    DetectionDetail,
    DetectionListItem,
)
from app.schemas.common import Paginated

router = APIRouter(prefix="/detections", tags=["detections"])


@router.get("", response_model=Paginated[DetectionListItem])
async def list_detections(
    verdict: Optional[str] = Query(default=None),
    start_date: Optional[datetime] = Query(default=None),
    end_date: Optional[datetime] = Query(default=None),
    api_key_id: Optional[uuid.UUID] = Query(default=None),
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=20, ge=1, le=100),
    current_user: User = Depends(require_role("admin", "developer", "compliance", "viewer", "sysadmin")),
    db: AsyncSession = Depends(get_db),
):
    verdict_enum = DetectionVerdict(verdict) if verdict else None
    items, total = await crud.list_detections(
        db,
        tenant_id=current_user.tenant_id,
        verdict=verdict_enum,
        start_date=start_date,
        end_date=end_date,
        api_key_id=api_key_id,
        page=page,
        limit=limit,
    )
    return Paginated(
        items=[DetectionListItem.model_validate(d) for d in items],
        total=total,
        page=page,
        limit=limit,
    )


async def _load_detection_with_relations(
    db: AsyncSession, request_id: uuid.UUID, tenant_id: uuid.UUID,
) -> Optional[Detection]:
    q = (
        select(Detection)
        .options(selectinload(Detection.api_key), selectinload(Detection.tenant))
        .where(Detection.request_id == request_id, Detection.tenant_id == tenant_id)
    )
    return (await db.execute(q)).scalar_one_or_none()


# Vai trò được xem PII thô (ảnh khuôn mặt thumbnail, IP, user-agent) — phục vụ điều tra.
_PII_ROLES = {"admin", "compliance", "sysadmin"}


def _to_detail(d: Detection, mask_pii: bool = False) -> DetectionDetail:
    return DetectionDetail(
        request_id=d.request_id,
        verdict=d.verdict.value,
        confidence=d.confidence,
        prob_fake=d.prob_fake,
        prob_cnn=d.prob_cnn,
        spatial_score=d.spatial_score,
        frequency_score=d.frequency_score,
        threshold_used=d.threshold_used,
        image_hash=d.image_hash,
        image_width=d.image_width,
        image_height=d.image_height,
        image_thumb=None if mask_pii else d.image_thumb,
        heatmap_url=d.heatmap_url,
        processing_time_ms=d.processing_time_ms,
        model_version=d.model_version,
        user_agent=None if mask_pii else d.user_agent,
        ip_address=None if mask_pii else d.ip_address,
        audit_notes=d.audit_notes or [],
        created_at=d.created_at,
        api_key_id=d.api_key_id,
        api_key_prefix=d.api_key.prefix if d.api_key else None,
        api_key_name=d.api_key.name if d.api_key else None,
        tenant_name=d.tenant.name if d.tenant else None,
    )


@router.get("/{request_id}", response_model=DetectionDetail)
async def get_detection_detail(
    request_id: uuid.UUID,
    current_user: User = Depends(require_role("admin", "developer", "compliance", "viewer", "sysadmin")),
    db: AsyncSession = Depends(get_db),
):
    d = await _load_detection_with_relations(db, request_id, current_user.tenant_id)
    if not d:
        raise not_found("Detection")
    return _to_detail(d, mask_pii=current_user.role.value not in _PII_ROLES)


@router.post("/{request_id}/notes", response_model=DetectionDetail)
async def add_audit_note(
    request_id: uuid.UUID,
    payload: AuditNoteCreate,
    request: Request,
    current_user: User = Depends(require_role("admin", "compliance")),
    db: AsyncSession = Depends(get_db),
):
    # SoD: chỉ admin/compliance ghi ghi-chú điều tra; developer (bên tạo detection) không tự ghi audit của mình
    d = await _load_detection_with_relations(db, request_id, current_user.tenant_id)
    if not d:
        raise not_found("Detection")
    notes = list(d.audit_notes or [])
    notes.append({
        "note": payload.note[:500],
        "author_email": current_user.email,
        "author_id": str(current_user.id),
        "created_at": datetime.now(timezone.utc).isoformat(),
    })
    d.audit_notes = notes
    await audit(db, request, action="detection.note_added", resource_type="detection",
                user=current_user, resource_id=request_id)
    await db.commit()
    await db.refresh(d)
    return _to_detail(d)
