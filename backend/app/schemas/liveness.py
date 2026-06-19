import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class LivenessResponse(BaseModel):
    check_id: uuid.UUID
    verdict: str                          # LIVE | SPOOF | UNCERTAIN
    liveness_score: float                 # 0-1
    confidence: float                     # 0-100
    spoof_type: Optional[str] = None      # print | screen | mask_3d | deepfake | unknown
    threshold_used: float
    mode: str                             # passive | active
    frame_count: int
    processing_time_ms: int
    model_version: str
    attack_analysis: Optional[dict] = None   # debug: scores + evidence print/screen (chỉ khi ?debug=true)
    image_width: Optional[int] = None
    image_height: Optional[int] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class LivenessDetail(LivenessResponse):
    image_thumb: Optional[str] = None
    image_hash: str
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    api_key_id: Optional[uuid.UUID] = None   # None for dashboard (JWT) checks
    api_key_prefix: Optional[str] = None
    api_key_name: Optional[str] = None
    tenant_name: Optional[str] = None


class LivenessChallengeResponse(BaseModel):
    challenge_id: str                     # opaque id (client tracks state)
    challenge_type: str                   # blink | turn_left | turn_right | smile | nod
    instructions: str                     # human-readable
    expires_at: datetime


class LivenessListItem(BaseModel):
    check_id: uuid.UUID
    verdict: str
    liveness_score: float
    confidence: float
    spoof_type: Optional[str] = None
    mode: str
    processing_time_ms: int
    model_version: str
    created_at: datetime

    model_config = {"from_attributes": True}
