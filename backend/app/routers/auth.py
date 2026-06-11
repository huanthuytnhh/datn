from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, Query, Request
from sqlalchemy.ext.asyncio import AsyncSession

from deepguard_db.app.db.database import get_db
from deepguard_db.app.db import crud
from app.core.audit import audit

from app.core.security import hash_password, verify_password, create_access_token
from app.core.exceptions import conflict, unauthorized, not_found, bad_request
from app.dependencies import get_current_user
from app.schemas.auth import (
    RegisterRequest, RegisterPendingResponse, LoginRequest, TokenResponse,
    MeResponse, UserOut, TenantOut, UpdateMeRequest, ChangePasswordRequest,
    AcceptInviteRequest, InviteInfoResponse,
)
from deepguard_db.app.db.models import User, TenantStatus

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=RegisterPendingResponse, status_code=201)
async def register(body: RegisterRequest, db: AsyncSession = Depends(get_db)):
    """Đăng ký B2B: tạo tổ chức ở trạng thái SUSPENDED, CHỜ quản trị nền tảng (sysadmin)
    kích hoạt. Không tự đăng nhập ngay (tránh tự cấp quyền admin không kiểm soát)."""
    existing = await crud.get_user_by_email(db, body.email)
    if existing:
        raise conflict("Email already registered")

    tenant = await crud.create_tenant(
        db, name=body.tenant_name, admin_email=body.email
    )
    tenant.status = TenantStatus.PENDING  # tự đăng ký → CHỜ sysadmin duyệt (tag riêng, khác suspended)
    await crud.create_user(
        db,
        tenant_id=tenant.id,
        email=body.email,
        password_hash=hash_password(body.password),
        name=body.name,
        role="admin",
    )
    await db.commit()

    return RegisterPendingResponse(
        message="Đã tạo tổ chức. Tài khoản sẽ hoạt động sau khi quản trị nền tảng phê duyệt.",
        tenant_id=tenant.id,
    )


def _invitation_state(inv) -> Optional[str]:
    """Trả lý do invalid nếu có, None nếu hợp lệ."""
    if inv is None:
        return "Lời mời không tồn tại"
    if inv.accepted_at is not None:
        return "Lời mời đã được sử dụng"
    if inv.expires_at < datetime.now(timezone.utc):
        return "Lời mời đã hết hạn"
    return None


@router.get("/accept-invite", response_model=InviteInfoResponse)
async def invite_info(token: str = Query(...), db: AsyncSession = Depends(get_db)):
    """Validate token mời (FE gọi để hiển thị email/role/tổ chức trước khi đặt mật khẩu)."""
    inv = await crud.get_invitation_by_token(db, token)
    reason = _invitation_state(inv)
    if reason:
        return InviteInfoResponse(valid=False, reason=reason)
    return InviteInfoResponse(
        valid=True,
        email=inv.email,
        role=inv.role.value,
        tenant_name=inv.tenant.name if inv.tenant else None,
    )


@router.post("/accept-invite", response_model=TokenResponse, status_code=201)
async def accept_invite(body: AcceptInviteRequest, db: AsyncSession = Depends(get_db)):
    """Chấp nhận lời mời: đặt tên + mật khẩu → tạo user theo role đã mời → auto-login."""
    inv = await crud.get_invitation_by_token(db, body.token)
    reason = _invitation_state(inv)
    if reason:
        raise bad_request(reason)

    if await crud.get_user_by_email(db, inv.email):
        raise conflict("Email đã có tài khoản")

    user = await crud.create_user(
        db,
        tenant_id=inv.tenant_id,
        email=inv.email,
        password_hash=hash_password(body.password),
        name=body.name,
        role=inv.role,
    )
    inv.accepted_at = datetime.now(timezone.utc)   # tiêu thụ lời mời
    await db.commit()
    await crud.write_audit_log(
        db, action="user.accept_invite", resource_type="user",
        tenant_id=inv.tenant_id, user_id=user.id, resource_id=user.id,
    )
    await db.commit()

    token = create_access_token({"sub": str(user.id)})
    return TokenResponse(access_token=token)


@router.post("/login", response_model=TokenResponse)
async def login(body: LoginRequest, request: Request, db: AsyncSession = Depends(get_db)):
    user = await crud.get_user_by_email(db, body.email)
    if not user or not verify_password(body.password, user.password_hash):
        raise unauthorized("Invalid email or password")

    if not user.is_active:
        raise unauthorized("Account is disabled")

    tenant = await crud.get_tenant(db, user.tenant_id)
    if not tenant or tenant.status.value != "active":
        if tenant and tenant.status.value == "pending":
            raise unauthorized("Tổ chức đang chờ quản trị nền tảng phê duyệt.")
        raise unauthorized("Tổ chức đã bị tạm ngưng. Liên hệ quản trị nền tảng.")

    await crud.update_last_login(db, user.id)
    await audit(db, request, action="user.login", resource_type="user", user=user, resource_id=user.id)
    await db.commit()

    token = create_access_token({"sub": str(user.id)})
    return TokenResponse(access_token=token)


@router.get("/me", response_model=MeResponse)
async def me(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    tenant = await crud.get_tenant(db, current_user.tenant_id)
    if not tenant:
        raise not_found("Tenant")

    return MeResponse(
        user=UserOut.model_validate(current_user),
        tenant=TenantOut.model_validate(tenant),
    )


@router.patch("/me", response_model=UserOut)
async def update_me(
    body: UpdateMeRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Cập nhật hồ sơ cá nhân (name / phone / timezone)."""
    if body.name is not None:
        current_user.name = body.name
    if body.phone is not None:
        current_user.phone = body.phone
    if body.timezone is not None:
        current_user.timezone = body.timezone
    await db.commit()
    await db.refresh(current_user)
    return UserOut.model_validate(current_user)


@router.post("/change-password", status_code=204)
async def change_password(
    body: ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Đổi mật khẩu — xác thực mật khẩu hiện tại trước."""
    if not verify_password(body.current_password, current_user.password_hash):
        raise bad_request("Mật khẩu hiện tại không đúng")
    if len(body.new_password) < 8:
        raise bad_request("Mật khẩu mới phải có ít nhất 8 ký tự")
    current_user.password_hash = hash_password(body.new_password)
    current_user.must_change_password = False
    await db.commit()
    await crud.write_audit_log(
        db,
        action="user.change_password",
        resource_type="user",
        tenant_id=current_user.tenant_id,
        user_id=current_user.id,
        resource_id=current_user.id,
    )
    await db.commit()


@router.post("/logout", status_code=204)
async def logout(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Logout — stateless JWT, client phải tự xóa token.
    Endpoint này chỉ ghi audit log để compliance trace.
    """
    await crud.write_audit_log(
        db,
        action="user.logout",
        resource_type="user",
        tenant_id=current_user.tenant_id,
        user_id=current_user.id,
        resource_id=current_user.id,
    )
    await db.commit()


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(
    current_user: User = Depends(get_current_user),
):
    """Cấp lại access token mới với expiry mới (cho long-lived sessions)."""
    if not current_user.is_active:
        raise unauthorized("Account is disabled")
    token = create_access_token({"sub": str(current_user.id)})
    return TokenResponse(access_token=token)
