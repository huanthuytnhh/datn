"""
DeepGuard Liveness + Face Match module.

Components:
- liveness.LivenessDetector — MediaPipe FaceMesh + EAR + head pose
- face_matching.FaceMatcher — InsightFace ArcFace + cosine similarity
- ekyc_pipeline.router — FastAPI router exposing POST /v1/ekyc/verify
"""

from .liveness import LivenessDetector
from .face_matching import FaceMatcher
from .ekyc_pipeline import router as ekyc_router

__all__ = ["LivenessDetector", "FaceMatcher", "ekyc_router"]
