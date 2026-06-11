import uuid
from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class DetectionResponse(BaseModel):
    request_id: uuid.UUID
    # ── Tín hiệu rủi ro (định vị eKYC — khách dùng cái này) ──
    risk_score: float                          # P(deepfake) đã calibrate ∈ [0,1]
    risk_band: str                             # low | medium | high (theo ngưỡng per-tenant)
    decision_hint: str                         # pass | review | reject (GỢI Ý, không phải quyết định cuối)
    thresholds: dict = {}                      # ngưỡng band đang dùng {low, high}
    # ── Giải thích (nhìn chuyên nghiệp) ──
    heatmap: Optional[str] = None              # Grad-CAM overlay (base64) — vùng nghi vấn
    frequency: Optional[str] = None            # phổ log|2D-DCT| (base64) — bằng chứng tần số
    # ── Tương thích ngược + chi tiết ──
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
    source: str = "api"  # 'api' | 'playground'

    model_config = {"from_attributes": True}


class DetectionDetail(BaseModel):
    request_id: uuid.UUID
    verdict: str
    confidence: float
    prob_fake: float
    prob_cnn: float
    spatial_score: Optional[float] = None
    frequency_score: Optional[float] = None
    threshold_used: float
    image_hash: str
    image_width: Optional[int] = None
    image_height: Optional[int] = None
    image_thumb: Optional[str] = None
    heatmap_url: Optional[str] = None
    processing_time_ms: int
    model_version: str
    user_agent: Optional[str] = None
    ip_address: Optional[str] = None
    audit_notes: list = []
    created_at: datetime
    # Joined fields
    api_key_id: uuid.UUID
    api_key_prefix: Optional[str] = None
    api_key_name: Optional[str] = None
    tenant_name: Optional[str] = None


class AuditNoteCreate(BaseModel):
    note: str


class VideoJobResponse(BaseModel):
    job_id: uuid.UUID
    status: str
    message: str


class FrameResult(BaseModel):
    frame_id: int
    prob_fake: float
    thumb: Optional[str] = None  # base64 JPEG data URL of the actual frame


class VideoDetectionResponse(BaseModel):
    job_id: uuid.UUID
    verdict: str
    confidence: float
    prob_fake: float
    frames_analyzed: int
    frames_fake: int
    frame_results: list[FrameResult]
    model_version: str
    processing_time_ms: int
    created_at: datetime
