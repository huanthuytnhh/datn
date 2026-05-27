"""
FastAPI dependency injection — auth guards, db session, tenant context.
"""

import sys
import os
from typing import Optional

from fastapi import Depends, Header
from sqlalchemy.ext.asyncio import AsyncSession

# Add parent dir so deepguard_db package is importable
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", ".."))

from deepguard_db.app.db.database import get_db
from deepguard_db.app.db import crud
from deepguard_db.app.db.models import User, ApiKey, Tenant

from app.core.security import decode_token
from app.core.exceptions import unauthorized, forbidden, not_found


async def get_current_user(
    authorization: Optional[str] = Header(default=None),
    db: AsyncSession = Depends(get_db),
) -> User:
    """JWT auth guard cho dashboard endpoints."""
    if not authorization or not authorization.startswith("Bearer "):
        raise unauthorized("Missing or invalid Authorization header")

    token = authorization.removeprefix("Bearer ")
    payload = decode_token(token)
    if not payload:
        raise unauthorized("Invalid or expired token")

    user_id = payload.get("sub")
    if not user_id:
        raise unauthorized("Invalid token payload")

    import uuid
    try:
        uid = uuid.UUID(user_id)
    except ValueError:
        raise unauthorized("Invalid token payload")

    from sqlalchemy import select
    from deepguard_db.app.db.models import User as UserModel
    result = await db.execute(select(UserModel).where(UserModel.id == uid))
    user = result.scalar_one_or_none()

    if not user or not user.is_active or user.deleted_at is not None:
        raise unauthorized("User not found or inactive")

    return user


async def get_api_key_auth(
    authorization: Optional[str] = Header(default=None),
    db: AsyncSession = Depends(get_db),
) -> ApiKey:
    """API key auth guard cho /v1/detect/* endpoints."""
    if not authorization or not authorization.startswith("Bearer "):
        raise unauthorized("Missing or invalid Authorization header")

    plain_key = authorization.removeprefix("Bearer ")
    api_key = await crud.validate_api_key(db, plain_key)

    if not api_key:
        raise unauthorized("Invalid API key")

    if api_key.quota_limit > 0 and api_key.quota_used >= api_key.quota_limit:
        from app.core.exceptions import quota_exceeded
        raise quota_exceeded()

    return api_key


async def require_admin(current_user: User = Depends(get_current_user)) -> User:
    """Only admin or sysadmin."""
    if current_user.role not in ("admin", "sysadmin"):
        raise forbidden("Admin access required")
    return current_user
