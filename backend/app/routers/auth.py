from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from deepguard_db.app.db.database import get_db
from deepguard_db.app.db import crud

from app.core.security import hash_password, verify_password, create_access_token
from app.core.exceptions import conflict, unauthorized, not_found, bad_request
from app.dependencies import get_current_user
from app.schemas.auth import (
    RegisterRequest, LoginRequest, TokenResponse, MeResponse, UserOut, TenantOut,
    UpdateMeRequest, ChangePasswordRequest,
)
from deepguard_db.app.db.models import User

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=TokenResponse, status_code=201)
async def register(body: RegisterRequest, db: AsyncSession = Depends(get_db)):
    existing = await crud.get_user_by_email(db, body.email)
    if existing:
        raise conflict("Email already registered")

    tenant = await crud.create_tenant(
        db, name=body.tenant_name, admin_email=body.email
    )
    user = await crud.create_user(
        db,
        tenant_id=tenant.id,
        email=body.email,
        password_hash=hash_password(body.password),
        name=body.name,
        role="admin",
    )
    await db.commit()

    token = create_access_token({"sub": str(user.id)})
    return TokenResponse(access_token=token)


@router.post("/login", response_model=TokenResponse)
async def login(body: LoginRequest, db: AsyncSession = Depends(get_db)):
    user = await crud.get_user_by_email(db, body.email)
    if not user or not verify_password(body.password, user.password_hash):
        raise unauthorized("Invalid email or password")

    if not user.is_active:
        raise unauthorized("Account is disabled")

    await crud.update_last_login(db, user.id)
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
