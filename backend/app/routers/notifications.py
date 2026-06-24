"""In-app notifications (Notifications page).

Scope: current user sees their own notifications + tenant-wide ones (user_id NULL).
Any authenticated role.
"""
import uuid
from datetime import datetime
from typing import Optional, List

from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel
from sqlalchemy import select, update, func, and_, or_, desc
from sqlalchemy.ext.asyncio import AsyncSession

from deepguard_db.app.db.database import get_db
from deepguard_db.app.db.models import Notification, User
from app.dependencies import get_current_user
from app.core.exceptions import not_found

router = APIRouter(prefix="/notifications", tags=["notifications"])


class NotificationOut(BaseModel):
    id: uuid.UUID
    type: str
    title: str
    body: Optional[str] = None
    link: Optional[str] = None
    read: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class NotificationListResponse(BaseModel):
    items: List[NotificationOut]
    total: int
    unread: int


def _scope(user: User):
    return and_(
        Notification.tenant_id == user.tenant_id,
        or_(Notification.user_id == user.id, Notification.user_id.is_(None)),
    )


@router.get("", response_model=NotificationListResponse)
async def list_notifications(
    unread_only: bool = Query(default=False),
    limit: int = Query(default=50, ge=1, le=200),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    base = _scope(current_user)
    q = select(Notification).where(base)
    if unread_only:
        q = q.where(Notification.read.is_(False))
    q = q.order_by(desc(Notification.created_at)).limit(limit)
    items = (await db.execute(q)).scalars().all()

    total = (await db.execute(
        select(func.count()).select_from(Notification).where(base)
    )).scalar_one()
    unread = (await db.execute(
        select(func.count()).select_from(Notification).where(and_(base, Notification.read.is_(False)))
    )).scalar_one()

    return NotificationListResponse(
        items=[NotificationOut.model_validate(n) for n in items],
        total=total,
        unread=unread,
    )


@router.patch("/{notif_id}/read", response_model=NotificationOut)
async def mark_read(
    notif_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    n = await db.get(Notification, notif_id)
    if not n or n.tenant_id != current_user.tenant_id:
        raise not_found("Notification")
    n.read = True
    await db.commit()
    await db.refresh(n)
    return NotificationOut.model_validate(n)


@router.post("/read-all", status_code=204)
async def mark_all_read(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await db.execute(
        update(Notification).where(and_(_scope(current_user), Notification.read.is_(False))).values(read=True)
    )
    await db.commit()


@router.delete("/{notif_id}", status_code=204)
async def delete_notification(
    notif_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    n = await db.get(Notification, notif_id)
    if not n or n.tenant_id != current_user.tenant_id:
        raise not_found("Notification")
    await db.delete(n)
    await db.commit()
