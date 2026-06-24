"""Model versions & thresholds (S — Models & Thresholds page).

Read: any authenticated user. Mutate threshold/active/traffic: admin or sysadmin.
Backed by the existing model_versions table.
"""
import uuid
from datetime import datetime
from typing import Optional, List

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy import select, desc
from sqlalchemy.ext.asyncio import AsyncSession

from deepguard_db.app.db.database import get_db
from deepguard_db.app.db.models import ModelVersion, User
from app.dependencies import get_current_user, require_sysadmin
from app.core.exceptions import not_found

router = APIRouter(prefix="/models", tags=["models"])


class ModelOut(BaseModel):
    id: uuid.UUID
    version: str
    architecture: str
    auc_celeb: Optional[float] = None
    auc_ffpp: Optional[float] = None
    threshold: float
    training_dataset: Optional[str] = None
    is_active: bool
    traffic_percent: int
    deployed_at: Optional[datetime] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class UpdateModelRequest(BaseModel):
    threshold: Optional[float] = None
    is_active: Optional[bool] = None
    traffic_percent: Optional[int] = None


@router.get("", response_model=List[ModelOut])
async def list_models(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    rows = (await db.execute(select(ModelVersion).order_by(desc(ModelVersion.created_at)))).scalars().all()
    return [ModelOut.model_validate(m) for m in rows]


@router.patch("/{model_id}", response_model=ModelOut)
async def update_model(
    model_id: uuid.UUID,
    body: UpdateModelRequest,
    current_user: User = Depends(require_sysadmin),
    db: AsyncSession = Depends(get_db),
):
    m = await db.get(ModelVersion, model_id)
    if not m:
        raise not_found("Model")
    if body.threshold is not None:
        m.threshold = max(0.0, min(1.0, body.threshold))
    if body.is_active is not None:
        m.is_active = body.is_active
    if body.traffic_percent is not None:
        m.traffic_percent = max(0, min(100, body.traffic_percent))
    await db.commit()
    await db.refresh(m)
    return ModelOut.model_validate(m)
