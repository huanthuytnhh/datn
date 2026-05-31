import uuid
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr


class RegisterRequest(BaseModel):
    tenant_name: str
    email: EmailStr
    password: str
    name: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserOut(BaseModel):
    id: uuid.UUID
    email: str
    name: str
    role: str
    tenant_id: uuid.UUID
    is_active: bool
    last_login_at: Optional[datetime] = None
    phone: Optional[str] = None
    timezone: Optional[str] = None
    must_change_password: bool = False

    model_config = {"from_attributes": True}


class UpdateMeRequest(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    timezone: Optional[str] = None


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str


class TenantOut(BaseModel):
    id: uuid.UUID
    name: str
    plan: str
    status: str
    monthly_quota: int
    current_usage: int
    admin_email: str

    model_config = {"from_attributes": True}


class MeResponse(BaseModel):
    user: UserOut
    tenant: TenantOut
