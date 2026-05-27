from typing import Optional
from datetime import datetime

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from deepguard_db.app.db.database import get_db
from deepguard_db.app.db import crud
from deepguard_db.app.db.models import User

from app.dependencies import get_current_user
from app.schemas.analytics import AnalyticsOverview, UsageInfo
from app.schemas.detect import DetectionListItem
from app.schemas.common import Paginated

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/overview", response_model=AnalyticsOverview)
async def overview(
    days: int = Query(default=30, ge=1, le=365),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    data = await crud.analytics_overview(db, tenant_id=current_user.tenant_id, days=days)
    return AnalyticsOverview(**data, days=days)


@router.get("/usage", response_model=UsageInfo)
async def usage(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    tenant = await crud.get_tenant(db, current_user.tenant_id)
    used = tenant.current_usage
    quota = tenant.monthly_quota
    return UsageInfo(
        monthly_quota=quota,
        current_usage=used,
        remaining=max(0, quota - used),
        usage_percent=round(used / quota * 100, 2) if quota else 0.0,
    )
