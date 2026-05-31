"""
DeepGuard FastAPI Backend
"""

import os
import sys

# Add parent directory so deepguard_db is importable
_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
if _root not in sys.path:
    sys.path.insert(0, _root)

# Load .env before any db imports
from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import get_settings
from app.routers import auth, detect, api_keys, analytics, detections, webhooks, audit, liveness, users, tenants, platform, models, notifications

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    from deepguard_db.app.db.database import init_db
    try:
        await init_db()
    except Exception as exc:
        print(f"[WARNING] Database not available: {exc}")
        print("[WARNING] Server starting without DB — endpoints requiring DB will fail.")
    yield


app = FastAPI(
    title="DeepGuard API",
    description="Deepfake Detection Platform for Banking & Fintech",
    version="1.0.0-mvp",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(auth.router)
app.include_router(detect.router)
app.include_router(api_keys.router)
app.include_router(analytics.router)
app.include_router(detections.router)
app.include_router(webhooks.router)
app.include_router(audit.router)
app.include_router(liveness.api_router)
app.include_router(liveness.dashboard_router)
app.include_router(users.router)
app.include_router(tenants.router)
app.include_router(platform.router)
app.include_router(models.router)
app.include_router(notifications.router)

# Real eKYC pipeline (MediaPipe + InsightFace + B4 deepfake)
try:
    from deepguard_liveness import ekyc_router
    app.include_router(ekyc_router)
    print("[DeepGuard] eKYC pipeline mounted at /v1/ekyc/verify")
except Exception as exc:
    print(f"[DeepGuard] eKYC pipeline NOT mounted: {exc}")


@app.get("/health", tags=["system"])
async def health():
    return {"status": "ok", "version": "1.0.0-mvp"}


@app.get("/", tags=["system"])
async def root():
    return {
        "name": "DeepGuard API",
        "docs": "/docs",
        "health": "/health",
    }
