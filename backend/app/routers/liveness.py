import uuid
import secrets
from datetime import datetime, timedelta, timezone
from typing import Optional

from fastapi import APIRouter, Depends, File, Form, Query, Request, UploadFile
from sqlalchemy import select, func, update
from sqlalchemy.ext.asyncio import AsyncSession
from deepguard_db.app.db.database import get_db
from deepguard_db.app.db import crud
from deepguard_db.app.db.models import (
    ApiKey as ApiKeyModel,
    LivenessCheck,
    LivenessVerdict,
    SpoofType,
    User,
)

from app.core.exceptions import bad_request, not_found
from app.dependencies import get_api_key_auth, require_role
from app.schemas.common import Paginated
from app.schemas.liveness import (
    LivenessChallengeResponse,
    LivenessDetail,
    LivenessListItem,
    LivenessResponse,
)
from app.services.liveness import (
    LivenessResult,
    random_challenge,
    run_active_liveness,
    run_liveness_check,
)

# Two routers: one with /v1 prefix for API-key endpoints, one for JWT dashboard endpoints
api_router = APIRouter(prefix="/v1", tags=["liveness"])
dashboard_router = APIRouter(prefix="/liveness", tags=["liveness"])

ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp", "image/bmp"}
MAX_IMAGE_SIZE = 10 * 1024 * 1024  # 10 MB
CHALLENGE_TTL_SECONDS = 60

CHALLENGE_INSTRUCTIONS = {
    "blink":      "Chớp mắt 2 lần trong vòng 3 giây",
    "turn_left":  "Quay đầu sang trái 30 độ rồi giữ 1 giây",
    "turn_right": "Quay đầu sang phải 30 độ rồi giữ 1 giây",
    "smile":      "Cười tự nhiên trong 1 giây",
    "nod":        "Gật đầu nhẹ 1 lần",
}


# ─────────────────────────────────────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────────────────────────────────────
async def _save_liveness(
    db: AsyncSession,
    *,
    tenant_id: uuid.UUID,
    api_key_id: uuid.UUID,
    result: LivenessResult,
    mode: str,
    request: Request,
) -> LivenessCheck:
    row = LivenessCheck(
        tenant_id=tenant_id,
        api_key_id=api_key_id,
        verdict=LivenessVerdict(result.verdict),
        liveness_score=result.liveness_score,
        confidence=result.confidence,
        spoof_type=SpoofType(result.spoof_type) if result.spoof_type else None,
        threshold_used=result.threshold_used,
        mode=mode,
        challenge_type=result.challenge_type,
        challenge_passed=result.challenge_passed,
        frame_count=result.frame_count,
        image_hash=result.image_hash,
        image_width=result.image_width,
        image_height=result.image_height,
        image_thumb=result.image_thumb,
        processing_time_ms=result.processing_time_ms,
        model_version=result.model_version,
        user_agent=request.headers.get("user-agent"),
        ip_address=request.client.host if request.client else None,
    )
    db.add(row)
    await db.flush()

    # Same quota accounting as detection
    await db.execute(
        update(ApiKeyModel).where(ApiKeyModel.id == api_key_id)
        .values(quota_used=ApiKeyModel.quota_used + 1)
    )
    await crud.increment_tenant_usage(db, tenant_id)
    await db.commit()
    await db.refresh(row)
    return row


def _to_response(row: LivenessCheck) -> LivenessResponse:
    return LivenessResponse(
        check_id=row.check_id,
        verdict=row.verdict.value,
        liveness_score=row.liveness_score,
        confidence=row.confidence,
        spoof_type=row.spoof_type.value if row.spoof_type else None,
        threshold_used=row.threshold_used,
        mode=row.mode,
        challenge_type=row.challenge_type,
        challenge_passed=row.challenge_passed,
        frame_count=row.frame_count,
        processing_time_ms=row.processing_time_ms,
        model_version=row.model_version,
        image_width=row.image_width,
        image_height=row.image_height,
        created_at=row.created_at,
    )


# ─────────────────────────────────────────────────────────────────────────────
# Public detect API (API key auth)
# ─────────────────────────────────────────────────────────────────────────────
@api_router.post("/detect/liveness", response_model=LivenessResponse)
async def detect_liveness_passive(
    request: Request,
    file: UploadFile = File(...),
    api_key: ApiKeyModel = Depends(get_api_key_auth),
    db: AsyncSession = Depends(get_db),
):
    """Passive liveness — 1 ảnh đơn → kết quả."""
    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise bad_request(f"Unsupported file type: {file.content_type}")
    image_bytes = await file.read()
    if len(image_bytes) > MAX_IMAGE_SIZE:
        raise bad_request("File size exceeds 10 MB limit")

    result = await run_liveness_check(image_bytes)
    row = await _save_liveness(
        db, tenant_id=api_key.tenant_id, api_key_id=api_key.id,
        result=result, mode="passive", request=request,
    )
    return _to_response(row)


@api_router.get("/liveness/challenge", response_model=LivenessChallengeResponse)
async def get_liveness_challenge(
    api_key: ApiKeyModel = Depends(get_api_key_auth),
):
    """Trả về 1 challenge ngẫu nhiên cho active liveness."""
    ctype = random_challenge()
    # opaque challenge id — client gửi lại khi verify (stateless: encode trong id)
    cid = secrets.token_urlsafe(16)
    return LivenessChallengeResponse(
        challenge_id=cid,
        challenge_type=ctype,
        instructions=CHALLENGE_INSTRUCTIONS[ctype],
        expires_at=datetime.now(timezone.utc) + timedelta(seconds=CHALLENGE_TTL_SECONDS),
    )


@api_router.post("/detect/liveness/active", response_model=LivenessResponse)
async def detect_liveness_active(
    request: Request,
    files: list[UploadFile] = File(...),
    challenge_type: str = Form(...),
    challenge_passed: bool = Form(...),
    api_key: ApiKeyModel = Depends(get_api_key_auth),
    db: AsyncSession = Depends(get_db),
):
    """Active liveness — nhiều frame + kết quả verify challenge ở client."""
    if not files:
        raise bad_request("At least one frame required")
    if len(files) > 30:
        raise bad_request("Max 30 frames per request")

    frame_bytes: list[bytes] = []
    for f in files:
        if f.content_type not in ALLOWED_IMAGE_TYPES:
            raise bad_request(f"Unsupported frame type: {f.content_type}")
        data = await f.read()
        if len(data) > MAX_IMAGE_SIZE:
            raise bad_request("Frame exceeds 10 MB")
        frame_bytes.append(data)

    result = await run_active_liveness(frame_bytes, challenge_type, challenge_passed)
    row = await _save_liveness(
        db, tenant_id=api_key.tenant_id, api_key_id=api_key.id,
        result=result, mode="active", request=request,
    )
    return _to_response(row)


# ─────────────────────────────────────────────────────────────────────────────
# Dashboard API (JWT auth) — list + detail
# ─────────────────────────────────────────────────────────────────────────────
@dashboard_router.get("", response_model=Paginated[LivenessListItem])
async def list_liveness_checks(
    verdict: Optional[str] = Query(default=None),
    mode: Optional[str] = Query(default=None),
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=20, ge=1, le=100),
    current_user: User = Depends(require_role("admin", "developer", "compliance", "viewer")),
    db: AsyncSession = Depends(get_db),
):
    base = select(LivenessCheck).where(LivenessCheck.tenant_id == current_user.tenant_id)
    if verdict:
        try:
            base = base.where(LivenessCheck.verdict == LivenessVerdict(verdict))
        except ValueError:
            raise bad_request(f"Invalid verdict: {verdict}")
    if mode:
        base = base.where(LivenessCheck.mode == mode)

    total = (await db.execute(select(func.count()).select_from(base.subquery()))).scalar_one()
    rows = (await db.execute(
        base.order_by(LivenessCheck.created_at.desc())
            .offset((page - 1) * limit).limit(limit)
    )).scalars().all()

    return Paginated(
        items=[LivenessListItem.model_validate(r) for r in rows],
        total=total, page=page, limit=limit,
    )


@dashboard_router.get("/{check_id}", response_model=LivenessDetail)
async def get_liveness_detail(
    check_id: uuid.UUID,
    current_user: User = Depends(require_role("admin", "developer", "compliance", "viewer")),
    db: AsyncSession = Depends(get_db),
):
    q = select(LivenessCheck).where(
        LivenessCheck.check_id == check_id,
        LivenessCheck.tenant_id == current_user.tenant_id,
    )
    row = (await db.execute(q)).scalar_one_or_none()
    if not row:
        raise not_found("Liveness check")

    # Fetch joined fields manually (no relationship configured to avoid circular)
    ak_q = select(ApiKeyModel).where(ApiKeyModel.id == row.api_key_id)
    api_key = (await db.execute(ak_q)).scalar_one_or_none()

    from deepguard_db.app.db.models import Tenant
    tn_q = select(Tenant).where(Tenant.id == row.tenant_id)
    tenant = (await db.execute(tn_q)).scalar_one_or_none()

    return LivenessDetail(
        check_id=row.check_id,
        verdict=row.verdict.value,
        liveness_score=row.liveness_score,
        confidence=row.confidence,
        spoof_type=row.spoof_type.value if row.spoof_type else None,
        threshold_used=row.threshold_used,
        mode=row.mode,
        challenge_type=row.challenge_type,
        challenge_passed=row.challenge_passed,
        frame_count=row.frame_count,
        processing_time_ms=row.processing_time_ms,
        model_version=row.model_version,
        image_width=row.image_width,
        image_height=row.image_height,
        image_thumb=row.image_thumb,
        image_hash=row.image_hash,
        ip_address=row.ip_address,
        user_agent=row.user_agent,
        api_key_id=row.api_key_id,
        api_key_prefix=api_key.prefix if api_key else None,
        api_key_name=api_key.name if api_key else None,
        tenant_name=tenant.name if tenant else None,
        created_at=row.created_at,
    )
