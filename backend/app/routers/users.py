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

router = APIRouter(prefix="/users", tags=["users"])

INVITATION_TTL_DAYS = 7
ADMIN_ROLES = {"admin", "sysadmin"}

# Thứ bậc vai trò — chỉ được thao tác user có bậc THẤP HƠN hoặc BẰNG mình,
# và không được gán vai trò cao hơn bậc của mình.
ROLE_LEVEL = {"viewer": 0, "developer": 1, "compliance": 2, "admin": 3, "sysadmin": 4}


def _level(role) -> int:
    return ROLE_LEVEL.get(role.value if hasattr(role, "value") else str(role), 0)


# SoD: compliance (auditor) & sysadmin được quản bởi NỀN TẢNG (sysadmin) — tenant admin
# KHÔNG được sửa/xóa/đổi-role/đặt-lại-mật-khẩu auditor giám sát chính mình.
ADMIN_PROTECTED_ROLES = {"compliance", "sysadmin"}


def _role_value(role) -> str:
    return role.value if hasattr(role, "value") else str(role)


def _can_manage(actor: User, target_role) -> bool:
    """actor có quyền sửa/xóa/reset user mang target_role không."""
    a = actor.role.value
    if a == "sysadmin":
        return True
    if a == "admin":
        return _role_value(target_role) not in ADMIN_PROTECTED_ROLES
    return False


def _can_assign(actor: User, role_value: str) -> bool:
    """actor có quyền gán/mời/tạo vai trò role_value không."""
    a = actor.role.value
    if a == "sysadmin":
        return True
    if a == "admin":
        return role_value not in ADMIN_PROTECTED_ROLES
    return False


def _require_admin(user: User):
    if user.role.value not in ADMIN_ROLES:
        raise forbidden("Admin role required")


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
    await db.commit()
    await db.refresh(user)
    return UserListItem(
        id=user.id, email=user.email, name=user.name, role=user.role.value,
        is_active=user.is_active, last_login_at=user.last_login_at,
        created_at=user.created_at,
    )


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


@router.patch("/{user_id}", response_model=UserListItem)
async def update_user(
    user_id: uuid.UUID,
    body: UpdateUserRequest,
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

    await db.commit()
    await db.refresh(user)
    return UserListItem(
        id=user.id, email=user.email, name=user.name, role=user.role.value,
        is_active=user.is_active, last_login_at=user.last_login_at,
        created_at=user.created_at,
    )


def _gen_temp_password(n: int = 12) -> str:
    """Mật khẩu tạm mạnh, dễ copy (có đủ chữ thường/HOA/số)."""
    import string
    alphabet = string.ascii_letters + string.digits
    while True:
        pw = "".join(secrets.choice(alphabet) for _ in range(n))
        if any(c.islower() for c in pw) and any(c.isupper() for c in pw) and any(c.isdigit() for c in pw):
            return pw


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


@router.delete("/{user_id}", status_code=204)
async def delete_user(
    user_id: uuid.UUID,
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
    await db.commit()
