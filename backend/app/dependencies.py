"""
FastAPI dependency injection — auth guards, db session, tenant context.
"""

import sys
import os

from fastapi import Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", ".."))

from deepguard_db.app.db.database import get_db
from deepguard_db.app.db import crud
from deepguard_db.app.db.models import User, ApiKey

from app.core.security import decode_token
from app.core.exceptions import unauthorized, forbidden

# Two separate scheme instances so Swagger shows them as distinct
_jwt_scheme     = HTTPBearer(scheme_name="JWT Token",     description="Dashboard JWT — from POST /auth/login")
_api_key_scheme = HTTPBearer(scheme_name="API Key",       description="Detect API key — plain key from POST /api-keys")


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(_jwt_scheme),
    db: AsyncSession = Depends(get_db),
) -> User:
    token = credentials.credentials
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
    credentials: HTTPAuthorizationCredentials = Depends(_api_key_scheme),
    db: AsyncSession = Depends(get_db),
) -> ApiKey:
    plain_key = credentials.credentials
    api_key = await crud.validate_api_key(db, plain_key)

    if not api_key:
        raise unauthorized("Invalid API key")

    if api_key.quota_limit > 0 and api_key.quota_used >= api_key.quota_limit:
        from app.core.exceptions import quota_exceeded
        raise quota_exceeded()

    return api_key


async def require_admin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role not in ("admin", "sysadmin"):
        raise forbidden("Admin access required")
    return current_user
