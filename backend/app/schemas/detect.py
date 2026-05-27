import uuid
from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class DetectionResponse(BaseModel):
    request_id: uuid.UUID
    verdict: str
    confidence: float
    prob_fake: float
    prob_cnn: float
    spatial_score: Optional[float] = None
    frequency_score: Optional[float] = None
    threshold_used: float
    face_detected: bool
    processing_time_ms: int
    model_version: str
    image_width: Optional[int] = None
    image_height: Optional[int] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class DetectionListItem(BaseModel):
    request_id: uuid.UUID
    verdict: str
    confidence: float
    prob_fake: float
    processing_time_ms: int
    model_version: str
    image_hash: str
    created_at: datetime

    model_config = {"from_attributes": True}


class VideoJobResponse(BaseModel):
    job_id: uuid.UUID
    status: str
    message: str
