import uuid
from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from deepguard_db.app.db.database import get_db
from deepguard_db.app.db import crud
from deepguard_db.app.db.models import User

from app.dependencies import get_current_user
from app.schemas.api_keys import CreateApiKeyRequest, ApiKeyCreated, ApiKeyOut
from app.core.exceptions import not_found, forbidden

router = APIRouter(prefix="/api-keys", tags=["api-keys"])


@router.post("", response_model=ApiKeyCreated, status_code=201)
async def create_api_key(
    body: CreateApiKeyRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    api_key, plain_key = await crud.create_api_key(
        db,
        tenant_id=current_user.tenant_id,
        name=body.name,
        quota_limit=body.quota_limit,
        rate_limit_rpm=body.rate_limit_rpm,
    )
    await db.commit()

    return ApiKeyCreated(
        id=api_key.id,
        name=api_key.name,
        prefix=api_key.prefix,
        status=api_key.status.value,
        quota_limit=api_key.quota_limit,
        quota_used=api_key.quota_used,
        rate_limit_rpm=api_key.rate_limit_rpm,
        plain_key=plain_key,
        created_at=api_key.created_at,
    )


@router.get("", response_model=List[ApiKeyOut])
async def list_api_keys(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    keys = await crud.list_api_keys(db, current_user.tenant_id)
    return [ApiKeyOut.model_validate(k) for k in keys]


@router.delete("/{key_id}", status_code=204)
async def revoke_api_key(
    key_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    from sqlalchemy import select
    from deepguard_db.app.db.models import ApiKey
    result = await db.execute(
        select(ApiKey).where(
            ApiKey.id == key_id,
            ApiKey.tenant_id == current_user.tenant_id,
            ApiKey.deleted_at.is_(None),
        )
    )
    key = result.scalar_one_or_none()
    if not key:
        raise not_found("API key")

    await crud.revoke_api_key(db, key_id)
    await db.commit()
