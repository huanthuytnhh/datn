"""audit.py — tiện ích ghi audit log gọn: tự bắt IP + user-agent từ Request, scope theo user.
Caller tự commit (write_audit_log chỉ db.add). Action đặt tên dạng '<resource>.<verb>' để FE
suy ra mức độ (delete/revoke/suspend → warning)."""
from typing import Optional
import uuid

from fastapi import Request
from sqlalchemy.ext.asyncio import AsyncSession

from deepguard_db.app.db import crud
from deepguard_db.app.db.models import User


async def audit(
    db: AsyncSession,
    request: Optional[Request],
    *,
    action: str,
    resource_type: str,
    user: User,
    resource_id: Optional[uuid.UUID] = None,
    metadata: Optional[dict] = None,
) -> None:
    await crud.write_audit_log(
        db,
        action=action,
        resource_type=resource_type,
        tenant_id=user.tenant_id,
        user_id=user.id,
        resource_id=resource_id,
        metadata=metadata,
        ip_address=(request.client.host if request and request.client else None),
        user_agent=(request.headers.get("user-agent") if request else None),
    )
