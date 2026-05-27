import uuid
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, HttpUrl


class CreateWebhookRequest(BaseModel):
    url: str
    events: List[str] = ["job.completed", "job.failed"]
    secret: Optional[str] = None


class UpdateWebhookRequest(BaseModel):
    url: Optional[str] = None
    events: Optional[List[str]] = None
    status: Optional[str] = None


class WebhookOut(BaseModel):
    id: uuid.UUID
    url: str
    events: List[str]
    status: str
    last_delivery_at: Optional[datetime] = None
    last_delivery_status: Optional[int] = None
    created_at: datetime

    model_config = {"from_attributes": True}
