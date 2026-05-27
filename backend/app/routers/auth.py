from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from deepguard_db.app.db.database import get_db
from deepguard_db.app.db import crud

from app.core.security import hash_password, verify_password, create_access_token
from app.core.exceptions import conflict, unauthorized, not_found
from app.dependencies import get_current_user
from app.schemas.auth import RegisterRequest, LoginRequest, TokenResponse, MeResponse, UserOut, TenantOut
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
