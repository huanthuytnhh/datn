"""
Platform Console — sysadmin-only, cross-tenant endpoints (DeepGuard Ops).

These intentionally do NOT filter by tenant_id; access is gated by require_sysadmin.
"""

import uuid
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, Query, Request
from pydantic import BaseModel
from sqlalchemy import select, desc
from sqlalchemy.ext.asyncio import AsyncSession

from deepguard_db.app.db.database import get_db
from deepguard_db.app.db import crud
from deepguard_db.app.db.models import User, ApiKey, TenantPlan, TenantStatus, UserRole

from app.core.exceptions import bad_request, conflict, not_found
from app.core.security import hash_password
from app.core.audit import audit
from app.dependencies import require_sysadmin
from app.routers._users_helpers import _gen_temp_password
from app.schemas.common import Paginated

router = APIRouter(tags=["platform"])


class TenantListItem(BaseModel):
    id: uuid.UUID
    name: str
    plan: str
    status: str
    monthly_quota: int
    current_usage: int
    user_count: int
    created_at: datetime


class PlatformOverview(BaseModel):
    total_tenants: int
    active_tenants: int
    total_users: int
    total_requests: int
    fake_detected: int
    fake_rate: float
    avg_latency_ms: int


class UpdateTenantAdminRequest(BaseModel):
    status: Optional[str] = None
    plan: Optional[str] = None
    monthly_quota: Optional[int] = None


class CreateTenantRequest(BaseModel):
    name: str
    admin_email: str
    admin_name: Optional[str] = None
    plan: str = "starter"
    monthly_quota: int = 1000


class CreateTenantResponse(BaseModel):
    tenant: TenantListItem
    admin_email: str
    temp_password: str   # hiện 1 lần — admin mới buộc đổi mật khẩu lần đầu


@router.get("/tenants", response_model=Paginated[TenantListItem])
async def list_all_tenants(
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=50, ge=1, le=200),
    current_user: User = Depends(require_sysadmin),
    db: AsyncSession = Depends(get_db),
):
    """List ALL tenants across the platform (sysadmin only)."""
    items, total = await crud.list_all_tenants(db, page=page, limit=limit)
    return Paginated(
        items=[TenantListItem(**item) for item in items],
        total=total,
        page=page,
        limit=limit,
    )


@router.post("/tenants", response_model=CreateTenantResponse, status_code=201)
async def create_tenant_admin(
    body: CreateTenantRequest,
    current_user: User = Depends(require_sysadmin),
    db: AsyncSession = Depends(get_db),
):
    """Sysadmin tạo tenant MỚI + tài khoản admin đầu tiên (ACTIVE ngay, khác self-register).
    Trả mật khẩu tạm 1 lần; admin mới buộc đổi mật khẩu lần đầu."""
    if body.plan not in {p.value for p in TenantPlan}:
        raise bad_request(f"Invalid plan: {body.plan}")
    if body.monthly_quota < 0:
        raise bad_request("monthly_quota must be >= 0")
    if await crud.get_user_by_email(db, body.admin_email):
        raise conflict("Email admin đã có tài khoản")

    tenant = await crud.create_tenant(
        db, name=body.name, admin_email=body.admin_email,
        plan=body.plan, monthly_quota=body.monthly_quota,
    )
    tenant.status = TenantStatus.ACTIVE   # sysadmin tạo → kích hoạt ngay

    temp = _gen_temp_password()
    admin = await crud.create_user(
        db, tenant_id=tenant.id, email=body.admin_email,
        password_hash=hash_password(temp),
        name=body.admin_name or body.admin_email, role=UserRole.ADMIN,
    )
    admin.must_change_password = True
    await db.commit()
    await crud.write_audit_log(
        db, action="platform.create_tenant", resource_type="tenant",
        tenant_id=tenant.id, user_id=current_user.id, resource_id=tenant.id,
    )
    await db.commit()
    await db.refresh(tenant)

    return CreateTenantResponse(
        tenant=TenantListItem(
            id=tenant.id, name=tenant.name, plan=tenant.plan.value,
            status=tenant.status.value, monthly_quota=tenant.monthly_quota,
            current_usage=tenant.current_usage, user_count=1,
            created_at=tenant.created_at,
        ),
        admin_email=body.admin_email,
        temp_password=temp,
    )


@router.patch("/tenants/{tenant_id}", response_model=TenantListItem)
async def update_tenant_admin(
    tenant_id: uuid.UUID,
    body: UpdateTenantAdminRequest,
    request: Request,
    current_user: User = Depends(require_sysadmin),
    db: AsyncSession = Depends(get_db),
):
    """Update a tenant's status | plan | monthly_quota (sysadmin only)."""
    if body.status is not None and body.status not in {s.value for s in TenantStatus}:
        raise bad_request(f"Invalid status: {body.status}")
    if body.plan is not None and body.plan not in {p.value for p in TenantPlan}:
        raise bad_request(f"Invalid plan: {body.plan}")
    if body.monthly_quota is not None and body.monthly_quota < 0:
        raise bad_request("monthly_quota must be >= 0")
    # Chặn sysadmin tự tạm ngưng tổ chức của chính mình -> tránh tự khóa toàn bộ truy cập.
    if body.status == "suspended" and tenant_id == current_user.tenant_id:
        raise bad_request("Không thể tạm ngưng tổ chức của chính bạn (tránh tự khóa).")

    tenant = await crud.update_tenant_admin(
        db, tenant_id,
        status=body.status, plan=body.plan, monthly_quota=body.monthly_quota,
    )
    if not tenant:
        raise not_found("Tenant")
    # Action theo verb để FE tô mức độ: suspend → warning; activate/approve → info
    act = ("tenant.suspended" if body.status == "suspended"
           else "tenant.activated" if body.status == "active"
           else "platform.update_tenant")
    await audit(db, request, action=act, resource_type="tenant",
                user=current_user, resource_id=tenant.id,
                metadata={"status": body.status, "plan": body.plan, "monthly_quota": body.monthly_quota})
    await db.commit()
    await db.refresh(tenant)

    user_count = await crud.tenant_user_count(db, tenant.id)

    return TenantListItem(
        id=tenant.id,
        name=tenant.name,
        plan=tenant.plan.value,
        status=tenant.status.value,
        monthly_quota=tenant.monthly_quota,
        current_usage=tenant.current_usage,
        user_count=user_count,
        created_at=tenant.created_at,
    )


class TenantUserItem(BaseModel):
    id: uuid.UUID
    email: str
    name: str
    role: str
    is_active: bool
    last_login_at: Optional[datetime] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class TenantApiKeyItem(BaseModel):
    id: uuid.UUID
    name: str
    prefix: str
    status: str
    quota_limit: int
    quota_used: int
    rate_limit_rpm: int
    last_used_at: Optional[datetime] = None
    created_at: datetime

    model_config = {"from_attributes": True}


@router.get("/tenants/{tenant_id}/users", response_model=list[TenantUserItem])
async def tenant_users(
    tenant_id: uuid.UUID,
    current_user: User = Depends(require_sysadmin),
    db: AsyncSession = Depends(get_db),
):
    """List users of ANY tenant (sysadmin cross-tenant visibility)."""
    tenant = await crud.get_tenant(db, tenant_id)
    if not tenant:
        raise not_found("Tenant")
    rows = (await db.execute(
        select(User).where(User.tenant_id == tenant_id, User.deleted_at.is_(None))
        .order_by(desc(User.created_at))
    )).scalars().all()
    return [TenantUserItem.model_validate(u) for u in rows]


class UpdateTenantUserRequest(BaseModel):
    role: Optional[str] = None
    is_active: Optional[bool] = None


@router.patch("/tenants/{tenant_id}/users/{user_id}", response_model=TenantUserItem)
async def update_tenant_user(
    tenant_id: uuid.UUID,
    user_id: uuid.UUID,
    body: UpdateTenantUserRequest,
    current_user: User = Depends(require_sysadmin),
    db: AsyncSession = Depends(get_db),
):
    """Sysadmin sửa vai trò/trạng thái 1 thành viên của BẤT KỲ tenant (cross-tenant console)."""
    from deepguard_db.app.db.models import UserRole
    user = (await db.execute(
        select(User).where(
            User.id == user_id, User.tenant_id == tenant_id, User.deleted_at.is_(None)
        )
    )).scalar_one_or_none()
    if not user:
        raise not_found("User")
    if user.id == current_user.id:
        raise bad_request("Dùng trang Tài khoản để tự đổi thông tin của mình")

    if body.role is not None:
        if body.role not in {r.value for r in UserRole}:
            raise bad_request(f"Invalid role: {body.role}")
        # Vai trò sysadmin (platform) không gán cho thành viên tenant qua console này
        if body.role == "sysadmin":
            raise bad_request("Không thể gán vai trò sysadmin cho thành viên tenant")
        user.role = UserRole(body.role)
    if body.is_active is not None:
        user.is_active = body.is_active

    await db.commit()
    await crud.write_audit_log(
        db, action="platform.update_tenant_user", resource_type="user",
        tenant_id=tenant_id, user_id=current_user.id, resource_id=user.id,
    )
    await db.commit()
    await db.refresh(user)
    return TenantUserItem.model_validate(user)


@router.get("/tenants/{tenant_id}/api-keys", response_model=list[TenantApiKeyItem])
async def tenant_api_keys(
    tenant_id: uuid.UUID,
    current_user: User = Depends(require_sysadmin),
    db: AsyncSession = Depends(get_db),
):
    """List API keys of ANY tenant (sysadmin cross-tenant visibility)."""
    tenant = await crud.get_tenant(db, tenant_id)
    if not tenant:
        raise not_found("Tenant")
    keys = await crud.list_api_keys(db, tenant_id)
    return [TenantApiKeyItem.model_validate(k) for k in keys]


@router.get("/platform/overview", response_model=PlatformOverview)
async def platform_overview(
    days: int = Query(default=30, ge=1, le=365),
    current_user: User = Depends(require_sysadmin),
    db: AsyncSession = Depends(get_db),
):
    """Cross-tenant aggregate metrics for the Platform Console (sysadmin only)."""
    data = await crud.platform_overview(db, days=days)
    return PlatformOverview(**data)
