import uuid
from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class CreateApiKeyRequest(BaseModel):
    name: str
    quota_limit: int = 1000
    rate_limit_rpm: int = 60


class ApiKeyCreated(BaseModel):
    id: uuid.UUID
    name: str
    prefix: str
    status: str
    quota_limit: int
    quota_used: int
    rate_limit_rpm: int
    plain_key: str
    created_at: datetime

    model_config = {"from_attributes": True}


class ApiKeyOut(BaseModel):
    id: uuid.UUID
    name: str
    prefix: str
    status: str
    quota_limit: int
    quota_used: int
    rate_limit_rpm: int
    last_used_at: Optional[datetime] = None
    expires_at: Optional[datetime] = None
    created_at: datetime

    model_config = {"from_attributes": True}
