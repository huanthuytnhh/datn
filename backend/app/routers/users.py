import secrets
import uuid
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, Request
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from deepguard_db.app.db.database import get_db
from deepguard_db.app.db import crud
from deepguard_db.app.db.models import Invitation, User, UserRole

from app.core.exceptions import bad_request, conflict, forbidden, not_found
from app.core.security import hash_password
from app.core.audit import audit
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


@router.get("", response_model=UserListResponse)
async def list_users(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """List tất cả user trong tenant hiện tại."""
    _require_admin(current_user)
    q = (
        select(User)
        .where(User.tenant_id == current_user.tenant_id, User.deleted_at.is_(None))
        .order_by(User.created_at.desc())
    )
    rows = (await db.execute(q)).scalars().all()
    count_q = (
        select(func.count())
        .select_from(User)
        .where(User.tenant_id == current_user.tenant_id, User.deleted_at.is_(None))
    )
    total = (await db.execute(count_q)).scalar_one()

    return UserListResponse(
        items=[
            UserListItem(
                id=u.id, email=u.email, name=u.name, role=u.role.value,
                is_active=u.is_active, last_login_at=u.last_login_at,
                created_at=u.created_at,
            )
            for u in rows
        ],
        total=total,
    )


@router.post("", response_model=UserListItem, status_code=201)
async def create_user_direct(
    body: CreateUserRequest,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Tạo nhân viên trực tiếp trong tenant hiện tại (active ngay). Chỉ admin/sysadmin."""
    _require_admin(current_user)

    try:
        role_enum = UserRole(body.role)
    except ValueError:
        raise bad_request(f"Invalid role: {body.role}")
    # SoD: admin không tạo compliance/sysadmin (do nền tảng quản)
    if not _can_assign(current_user, role_enum.value):
        raise forbidden("Không thể tạo người dùng vai trò này (compliance/sysadmin do quản trị nền tảng cấp)")

    # Email không trùng trong tenant
    existing_q = select(User).where(
        User.email == body.email, User.tenant_id == current_user.tenant_id,
        User.deleted_at.is_(None),
    )
    if (await db.execute(existing_q)).scalar_one_or_none():
        raise conflict("Email đã tồn tại trong tổ chức")

    user = await crud.create_user(
        db,
        tenant_id=current_user.tenant_id,
        email=body.email,
        password_hash=hash_password(body.password),
        name=body.name,
        role=role_enum,
    )
    # Mật khẩu admin cấp là TẠM THỜI → buộc nhân viên đổi khi đăng nhập lần đầu
    user.must_change_password = True
    await audit(db, request, action="user.created", resource_type="user",
                user=current_user, resource_id=user.id,
                metadata={"email": user.email, "role": user.role.value})
    await db.commit()
    await db.refresh(user)
    return UserListItem(
        id=user.id, email=user.email, name=user.name, role=user.role.value,
        is_active=user.is_active, last_login_at=user.last_login_at,
        created_at=user.created_at,
    )


@router.patch("/{user_id}", response_model=UserListItem)
async def update_user(
    user_id: uuid.UUID,
    body: UpdateUserRequest,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update user (role, name, is_active). Chỉ admin."""
    _require_admin(current_user)

    q = select(User).where(
        User.id == user_id,
        User.tenant_id == current_user.tenant_id,
        User.deleted_at.is_(None),
    )
    user = (await db.execute(q)).scalar_one_or_none()
    if not user:
        raise not_found("User")

    # SoD: admin không thao tác compliance/sysadmin (auditor do nền tảng quản)
    if not _can_manage(current_user, user.role):
        raise forbidden("Không thể chỉnh sửa người dùng vai trò này (compliance/sysadmin do quản trị nền tảng quản)")
    # Không tự đổi vai trò / tự vô hiệu hóa chính mình
    if user.id == current_user.id and (body.role is not None or body.is_active is False):
        raise bad_request("Không thể tự đổi vai trò hoặc vô hiệu hóa chính mình")

    if body.name is not None:
        user.name = body.name
    if body.role is not None:
        try:
            new_role = UserRole(body.role)
        except ValueError:
            raise bad_request(f"Invalid role: {body.role}")
        # Không được gán vai trò compliance/sysadmin (nếu là admin)
        if not _can_assign(current_user, new_role.value):
            raise forbidden("Không thể gán vai trò này (compliance/sysadmin do quản trị nền tảng cấp)")
        user.role = new_role
    if body.is_active is not None:
        user.is_active = body.is_active

    await audit(db, request, action="user.updated", resource_type="user",
                user=current_user, resource_id=user.id,
                metadata={"email": user.email, "role": user.role.value, "is_active": user.is_active})
    await db.commit()
    await db.refresh(user)
    return UserListItem(
        id=user.id, email=user.email, name=user.name, role=user.role.value,
        is_active=user.is_active, last_login_at=user.last_login_at,
        created_at=user.created_at,
    )


@router.delete("/{user_id}", status_code=204)
async def delete_user(
    user_id: uuid.UUID,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Soft-delete user. Không cho phép tự xóa chính mình."""
    _require_admin(current_user)

    if user_id == current_user.id:
        raise bad_request("Cannot delete yourself")

    q = select(User).where(
        User.id == user_id,
        User.tenant_id == current_user.tenant_id,
        User.deleted_at.is_(None),
    )
    user = (await db.execute(q)).scalar_one_or_none()
    if not user:
        raise not_found("User")

    # SoD: admin không xóa compliance/sysadmin (auditor do nền tảng quản)
    if not _can_manage(current_user, user.role):
        raise forbidden("Không thể xóa người dùng vai trò này (compliance/sysadmin do quản trị nền tảng quản)")

    user.deleted_at = datetime.now(timezone.utc)
    user.is_active = False
    await audit(db, request, action="user.deleted", resource_type="user",
                user=current_user, resource_id=user.id,
                metadata={"email": user.email, "role": user.role.value})
    await db.commit()
