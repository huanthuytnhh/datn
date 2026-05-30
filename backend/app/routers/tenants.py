from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from deepguard_db.app.db.database import get_db
from deepguard_db.app.db import crud
from deepguard_db.app.db.models import User

from app.core.exceptions import not_found
from app.dependencies import require_role
from app.schemas.users import TenantOut, UpdateTenantRequest

router = APIRouter(prefix="/tenant", tags=["tenant"])


@router.get("", response_model=TenantOut)
async def get_current_tenant(
    current_user: User = Depends(require_role("admin", "sysadmin")),
    db: AsyncSession = Depends(get_db),
):
    """Lấy info tenant hiện tại (resolve qua JWT)."""
    tenant = await crud.get_tenant(db, current_user.tenant_id)
    if not tenant:
        raise not_found("Tenant")
    return TenantOut(
        id=tenant.id,
        name=tenant.name,
        plan=tenant.plan.value,
        status=tenant.status.value,
        monthly_quota=tenant.monthly_quota,
        current_usage=tenant.current_usage,
        admin_email=tenant.admin_email,
        billing_email=tenant.billing_email,
        created_at=tenant.created_at,
    )


@router.patch("", response_model=TenantOut)
async def update_tenant(
    body: UpdateTenantRequest,
    current_user: User = Depends(require_role("admin", "sysadmin")),
    db: AsyncSession = Depends(get_db),
):
    """Update tenant settings (admin only)."""
    tenant = await crud.get_tenant(db, current_user.tenant_id)
    if not tenant:
        raise not_found("Tenant")

    if body.name is not None:
        tenant.name = body.name
    if body.billing_email is not None:
        tenant.billing_email = body.billing_email
    if body.metadata is not None:
        # Merge thay vì replace để giữ keys cũ
        merged = dict(tenant.metadata_ or {})
        merged.update(body.metadata)
        tenant.metadata_ = merged

    await db.commit()
    await db.refresh(tenant)

    return TenantOut(
        id=tenant.id,
        name=tenant.name,
        plan=tenant.plan.value,
        status=tenant.status.value,
        monthly_quota=tenant.monthly_quota,
        current_usage=tenant.current_usage,
        admin_email=tenant.admin_email,
        billing_email=tenant.billing_email,
        created_at=tenant.created_at,
    )
