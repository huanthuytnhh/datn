import uuid
from datetime import datetime
from typing import Optional, List

from pydantic import BaseModel, EmailStr, Field


class UserListItem(BaseModel):
    id: uuid.UUID
    email: str
    name: str
    role: str
    is_active: bool
    last_login_at: Optional[datetime] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class UserListResponse(BaseModel):
    items: List[UserListItem]
    total: int


class InviteUserRequest(BaseModel):
    email: EmailStr
    name: str = Field(..., min_length=1, max_length=200)
    role: str = Field(default="developer")  # developer | compliance | admin


class InviteUserResponse(BaseModel):
    invitation_id: uuid.UUID
    email: str
    role: str
    token: str
    expires_at: datetime
    invite_url: str  # frontend phải build URL từ token


class CreateUserRequest(BaseModel):
    email: EmailStr
    name: str = Field(..., min_length=1, max_length=200)
    role: str = Field(default="developer")  # viewer | developer | compliance | admin
    password: str = Field(..., min_length=8, max_length=128)


class UpdateUserRequest(BaseModel):
    name: Optional[str] = Field(default=None, min_length=1, max_length=200)
    role: Optional[str] = None       # developer | compliance | admin
    is_active: Optional[bool] = None


class TenantOut(BaseModel):
    id: uuid.UUID
    name: str
    plan: str
    status: str
    monthly_quota: int
    current_usage: int
    admin_email: str
    billing_email: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class UpdateTenantRequest(BaseModel):
    name: Optional[str] = Field(default=None, min_length=1, max_length=200)
    billing_email: Optional[EmailStr] = None
    metadata: Optional[dict] = None
