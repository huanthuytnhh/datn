"""cascade.py — schema phản hồi /v1/detect/cascade.

Lồng FULL payload y hệt endpoint lẻ để client (Streamlit) tái dùng render."""
from typing import Optional
from pydantic import BaseModel

from app.schemas.liveness import LivenessResponse
from app.schemas.detect import DetectionResponse


class CascadeResponse(BaseModel):
    request_id: str
    liveness: LivenessResponse
    deepfake: Optional[DetectionResponse] = None   # null khi liveness chặn (SPOOF/UNCERTAIN)
    final_decision: str                            # PASS | REVIEW | FAIL
    reason: str
    processing_time_ms: int
