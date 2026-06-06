"""users_invites.py — endpoint mời thành viên + reset mật khẩu (tách từ users.py, <=250)."""
import secrets
import uuid
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from deepguard_db.app.db.database import get_db
from deepguard_db.app.db import crud
from deepguard_db.app.db.models import Invitation, User, UserRole

from app.core.exceptions import bad_request, conflict, forbidden, not_found
from app.core.security import hash_password
from app.dependencies import get_current_user
from app.schemas.users import (
    CreateUserRequest,
    InviteUserRequest,
    InviteUserResponse,
    UpdateUserRequest,
    UserListItem,
    UserListResponse,
)
from app.routers._users_helpers import (
    INVITATION_TTL_DAYS, ADMIN_ROLES, ADMIN_PROTECTED_ROLES, ROLE_LEVEL,
    _level, _role_value, _can_manage, _can_assign, _require_admin, _gen_temp_password,
)

router = APIRouter(prefix="/users", tags=["users"])


@router.post("/invite", response_model=InviteUserResponse, status_code=201)
async def invite_user(
    body: InviteUserRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Mời user mới — tạo Invitation token để user click link signup."""
    _require_admin(current_user)

    # Email không được trùng user đã tồn tại trong tenant
    existing_q = select(User).where(
        User.email == body.email, User.tenant_id == current_user.tenant_id,
        User.deleted_at.is_(None),
    )
    if (await db.execute(existing_q)).scalar_one_or_none():
        raise conflict("User with this email already exists in tenant")

    try:
        role_enum = UserRole(body.role)
    except ValueError:
        raise bad_request(f"Invalid role: {body.role}")

    # SoD: admin không mời compliance/sysadmin
    if not _can_assign(current_user, role_enum.value):
        raise forbidden("Không thể mời vai trò này (compliance/sysadmin do quản trị nền tảng cấp)")

    token = secrets.token_urlsafe(48)
    expires = datetime.now(timezone.utc) + timedelta(days=INVITATION_TTL_DAYS)
    inv = Invitation(
        tenant_id=current_user.tenant_id,
        email=body.email,
        role=role_enum,
        token=token,
        expires_at=expires,
    )
    db.add(inv)
    await db.commit()
    await db.refresh(inv)

    return InviteUserResponse(
        invitation_id=inv.id,
        email=inv.email,
        role=inv.role.value,
        token=inv.token,
        expires_at=inv.expires_at,
        invite_url=f"/auth/accept-invite?token={token}",
    )


@router.post("/{user_id}/reset-password", status_code=200)
async def reset_member_password(
    user_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Admin đặt lại mật khẩu cho member: cấp mật khẩu TẠM (hiện 1 lần) + buộc đổi lần đầu.
    Admin KHÔNG đặt/biết mật khẩu cố định của member."""
    _require_admin(current_user)

    q = select(User).where(
        User.id == user_id,
        User.tenant_id == current_user.tenant_id,
        User.deleted_at.is_(None),
    )
    user = (await db.execute(q)).scalar_one_or_none()
    if not user:
        raise not_found("User")
    if not _can_manage(current_user, user.role):
        raise forbidden("Không thể đặt lại mật khẩu cho người dùng vai trò này (compliance/sysadmin do nền tảng quản)")
    if user.id == current_user.id:
        raise bad_request("Dùng trang Tài khoản để tự đổi mật khẩu")

    temp = _gen_temp_password()
    user.password_hash = hash_password(temp)
    user.must_change_password = True
    await db.commit()
    await crud.write_audit_log(
        db,
        action="user.reset_password",
        resource_type="user",
        tenant_id=current_user.tenant_id,
        user_id=current_user.id,
        resource_id=user.id,
    )
    await db.commit()
    return {"temp_password": temp, "must_change_password": True}
