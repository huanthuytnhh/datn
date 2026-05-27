import uuid
from typing import Optional
from datetime import datetime

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from deepguard_db.app.db.database import get_db
from deepguard_db.app.db import crud
from deepguard_db.app.db.models import User, DetectionVerdict

from app.dependencies import get_current_user
from app.schemas.detect import DetectionListItem
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
    current_user: User = Depends(get_current_user),
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
