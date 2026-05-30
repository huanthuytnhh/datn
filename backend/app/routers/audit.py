import uuid
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from deepguard_db.app.db.database import get_db
from deepguard_db.app.db.models import AuditLog, User

from app.dependencies import require_role
from app.schemas.common import Paginated

router = APIRouter(prefix="/audit-logs", tags=["audit"])


class AuditLogItem(BaseModel):
    id: int
    action: str
    resource_type: str
    resource_id: Optional[uuid.UUID] = None
    user_id: Optional[uuid.UUID] = None
    user_email: Optional[str] = None
    metadata: dict = {}
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    created_at: datetime


@router.get("", response_model=Paginated[AuditLogItem])
async def list_audit_logs(
    action: Optional[str] = Query(default=None),
    resource_type: Optional[str] = Query(default=None),
    start_date: Optional[datetime] = Query(default=None),
    end_date: Optional[datetime] = Query(default=None),
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=50, ge=1, le=200),
    current_user: User = Depends(require_role("admin", "compliance", "sysadmin")),
    db: AsyncSession = Depends(get_db),
):
    base = select(AuditLog, User.email).join(
        User, User.id == AuditLog.user_id, isouter=True
    ).where(AuditLog.tenant_id == current_user.tenant_id)

    if action:
        base = base.where(AuditLog.action == action)
    if resource_type:
        base = base.where(AuditLog.resource_type == resource_type)
    if start_date:
        base = base.where(AuditLog.created_at >= start_date)
    if end_date:
        base = base.where(AuditLog.created_at <= end_date)

    count_q = select(func.count()).select_from(base.subquery())
    total = (await db.execute(count_q)).scalar_one()

    page_q = base.order_by(AuditLog.created_at.desc()).offset((page - 1) * limit).limit(limit)
    rows = (await db.execute(page_q)).all()

    items = [
        AuditLogItem(
            id=log.id,
            action=log.action,
            resource_type=log.resource_type,
            resource_id=log.resource_id,
            user_id=log.user_id,
            user_email=email,
            metadata=log.metadata_ or {},
            ip_address=log.ip_address,
            user_agent=log.user_agent,
            created_at=log.created_at,
        )
        for log, email in rows
    ]
    return Paginated(items=items, total=total, page=page, limit=limit)
