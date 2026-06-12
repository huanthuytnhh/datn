"""request_logging.py — middleware ghi 1 dòng JSON/request vào backend/app.log (Phase 2 runbook).

File app.log được scripts/push_to_cloudwatch.py tail và đẩy lên CloudWatch Logs.
Status >=500 ghi mức ERROR — khớp metric filter '"ERROR"' để bắn alarm.
Mẫu gốc: HarmonySeeker-ai/main.py log_requests, gọn lại + bỏ phần không dùng.
"""
import json
import logging
import os
import time
import uuid
from logging.handlers import RotatingFileHandler

from fastapi import Request

LOG_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "app.log"))
SKIP_PATHS = {"/health", "/docs", "/openapi.json", "/redoc"}

logger = logging.getLogger("deepguard.requests")


def setup_request_logging(app) -> None:
    logger.setLevel(logging.INFO)
    handler = RotatingFileHandler(LOG_PATH, maxBytes=5_000_000, backupCount=3)
    handler.setFormatter(logging.Formatter("%(asctime)s %(levelname)s %(message)s"))
    logger.addHandler(handler)

    @app.middleware("http")
    async def log_requests(request: Request, call_next):
        if request.url.path in SKIP_PATHS:
            return await call_next(request)
        start = time.perf_counter()
        ctx = {
            "request_id": uuid.uuid4().hex[:12],
            "client": request.client.host if request.client else "unknown",
            "method": request.method,
            "path": request.url.path,
        }
        try:
            response = await call_next(request)
        except Exception as exc:
            ctx["error"] = str(exc)
            ctx["process_time_ms"] = int((time.perf_counter() - start) * 1000)
            logger.error("REQUEST_ERROR: %s", json.dumps(ctx))
            raise
        ctx["status_code"] = response.status_code
        ctx["process_time_ms"] = int((time.perf_counter() - start) * 1000)
        level = logger.error if response.status_code >= 500 else logger.info
        level("REQUEST: %s", json.dumps(ctx))
        return response
