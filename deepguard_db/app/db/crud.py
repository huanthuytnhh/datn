"""
crud.py — Reusable CRUD operations.

Pattern: function-based, không phải class — dễ test, dễ compose.
Tất cả functions đều async.
"""

import hashlib
import secrets
from datetime import datetime, timedelta, timezone
from typing import Optional, List
import uuid

from sqlalchemy import select, update, delete, and_, func, desc, Integer
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from .models import (
    Tenant, User, ApiKey, Webhook, Detection, Job,
    WebhookDelivery, AuditLog, ModelVersion, Invitation,
    DetectionVerdict, JobStatus, ApiKeyStatus, UserRole,
)


# ─────────────────────────────────────────────────────────────────────────────
# TENANT
# ─────────────────────────────────────────────────────────────────────────────
async def create_tenant(
    db: AsyncSession, *, name: str, admin_email: str, plan: str = "starter",
    monthly_quota: int = 100,
) -> Tenant:
    tenant = Tenant(
        name=name, admin_email=admin_email,
        plan=plan, monthly_quota=monthly_quota,
    )
    db.add(tenant)
    await db.flush()
    return tenant


async def get_tenant(db: AsyncSession, tenant_id: uuid.UUID) -> Optional[Tenant]:
    return await db.get(Tenant, tenant_id)


async def list_tenants(
    db: AsyncSession, *, status: Optional[str] = None,
    page: int = 1, limit: int = 20,
) -> tuple[List[Tenant], int]:
    """Returns (items, total_count)."""
    q = select(Tenant)
    if status:
        q = q.where(Tenant.status == status)

    count_q = select(func.count()).select_from(q.subquery())
    total = (await db.execute(count_q)).scalar_one()

    q = q.order_by(desc(Tenant.created_at)).offset((page-1)*limit).limit(limit)
    items = (await db.execute(q)).scalars().all()
    return list(items), total


async def increment_tenant_usage(db: AsyncSession, tenant_id: uuid.UUID) -> None:
    await db.execute(
        update(Tenant)
        .where(Tenant.id == tenant_id)
        .values(current_usage=Tenant.current_usage + 1)
    )


# ─────────────────────────────────────────────────────────────────────────────
# USER
# ─────────────────────────────────────────────────────────────────────────────
async def create_user(
    db: AsyncSession, *, tenant_id: uuid.UUID, email: str,
    password_hash: str, name: str, role: UserRole = UserRole.DEVELOPER,
) -> User:
    user = User(
        tenant_id=tenant_id, email=email,
        password_hash=password_hash, name=name, role=role,
    )
    db.add(user)
    await db.flush()
    return user


async def get_user_by_email(db: AsyncSession, email: str) -> Optional[User]:
    q = select(User).where(User.email == email, User.deleted_at.is_(None))
    return (await db.execute(q)).scalar_one_or_none()


async def update_last_login(db: AsyncSession, user_id: uuid.UUID) -> None:
    await db.execute(
        update(User).where(User.id == user_id)
        .values(last_login_at=datetime.now(timezone.utc))
    )


# ─────────────────────────────────────────────────────────────────────────────
# API_KEY
# ─────────────────────────────────────────────────────────────────────────────
def _hash_api_key(plain_key: str) -> str:
    return hashlib.sha256(plain_key.encode()).hexdigest()


def _generate_api_key(prefix: str = "sk-dg") -> tuple[str, str, str]:
    """Returns (plain_key, key_hash, prefix_display)."""
    random_part = secrets.token_urlsafe(32)
    plain = f"{prefix}-{random_part}"
    key_hash = _hash_api_key(plain)
    prefix_display = f"{prefix}-{random_part[:8]}...{random_part[-4:]}"
    return plain, key_hash, prefix_display


async def create_api_key(
    db: AsyncSession, *, tenant_id: uuid.UUID, name: str,
    quota_limit: int = 1000, rate_limit_rpm: int = 60,
) -> tuple[ApiKey, str]:
    """Returns (api_key_obj, plain_key). Plain key chỉ trả về 1 lần!"""
    plain, key_hash, prefix = _generate_api_key()
    api_key = ApiKey(
        tenant_id=tenant_id, key_hash=key_hash, prefix=prefix,
        name=name, quota_limit=quota_limit, rate_limit_rpm=rate_limit_rpm,
    )
    db.add(api_key)
    await db.flush()
    return api_key, plain


async def validate_api_key(db: AsyncSession, plain_key: str) -> Optional[ApiKey]:
    """Look up by hash, check status. Returns None nếu invalid."""
    key_hash = _hash_api_key(plain_key)
    q = select(ApiKey).where(
        ApiKey.key_hash == key_hash,
        ApiKey.status == ApiKeyStatus.ACTIVE,
        ApiKey.deleted_at.is_(None),
    ).options(selectinload(ApiKey.tenant))
    return (await db.execute(q)).scalar_one_or_none()


async def revoke_api_key(db: AsyncSession, key_id: uuid.UUID) -> None:
    await db.execute(
        update(ApiKey).where(ApiKey.id == key_id)
        .values(status=ApiKeyStatus.REVOKED, deleted_at=datetime.now(timezone.utc))
    )


async def list_api_keys(db: AsyncSession, tenant_id: uuid.UUID) -> List[ApiKey]:
    q = select(ApiKey).where(
        ApiKey.tenant_id == tenant_id, ApiKey.deleted_at.is_(None)
    ).order_by(desc(ApiKey.created_at))
    return list((await db.execute(q)).scalars().all())


# ─────────────────────────────────────────────────────────────────────────────
# DETECTION (audit log)
# ─────────────────────────────────────────────────────────────────────────────
async def create_detection(
    db: AsyncSession, *,
    tenant_id: uuid.UUID, api_key_id: uuid.UUID,
    verdict: DetectionVerdict, confidence: float, prob_fake: float,
    prob_cnn: float, threshold_used: float, image_hash: str,
    processing_time_ms: int, model_version: str,
    spatial_score: Optional[float] = None,
    frequency_score: Optional[float] = None,
    heatmap_url: Optional[str] = None,
    image_width: Optional[int] = None,
    image_height: Optional[int] = None,
    image_thumb: Optional[str] = None,
    user_agent: Optional[str] = None, ip_address: Optional[str] = None,
) -> Detection:
    det = Detection(
        tenant_id=tenant_id, api_key_id=api_key_id,
        verdict=verdict, confidence=confidence, prob_fake=prob_fake,
        prob_cnn=prob_cnn, spatial_score=spatial_score,
        frequency_score=frequency_score, threshold_used=threshold_used,
        image_hash=image_hash, image_width=image_width,
        image_height=image_height, heatmap_url=heatmap_url,
        image_thumb=image_thumb,
        processing_time_ms=processing_time_ms, model_version=model_version,
        user_agent=user_agent, ip_address=ip_address,
    )
    db.add(det)
    await db.flush()
    return det


async def list_detections(
    db: AsyncSession, *,
    tenant_id: uuid.UUID,
    verdict: Optional[DetectionVerdict] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    api_key_id: Optional[uuid.UUID] = None,
    page: int = 1, limit: int = 20,
) -> tuple[List[Detection], int]:
    """Cho S09 Detection History với filter."""
    q = select(Detection).where(Detection.tenant_id == tenant_id)
    if verdict:
        q = q.where(Detection.verdict == verdict)
    if start_date:
        q = q.where(Detection.created_at >= start_date)
    if end_date:
        q = q.where(Detection.created_at <= end_date)
    if api_key_id:
        q = q.where(Detection.api_key_id == api_key_id)

    count_q = select(func.count()).select_from(q.subquery())
    total = (await db.execute(count_q)).scalar_one()

    q = q.order_by(desc(Detection.created_at)).offset((page-1)*limit).limit(limit)
    items = (await db.execute(q)).scalars().all()
    return list(items), total


async def get_detection(
    db: AsyncSession, request_id: uuid.UUID, tenant_id: uuid.UUID,
) -> Optional[Detection]:
    """Tenant-scoped: chỉ trả về nếu detection thuộc tenant."""
    q = select(Detection).where(
        Detection.request_id == request_id,
        Detection.tenant_id == tenant_id,
    )
    return (await db.execute(q)).scalar_one_or_none()


# ─────────────────────────────────────────────────────────────────────────────
# ANALYTICS aggregation
# ─────────────────────────────────────────────────────────────────────────────
async def analytics_overview(
    db: AsyncSession, *, tenant_id: uuid.UUID, days: int = 30,
) -> dict:
    """Tổng quan metrics cho S03 Dashboard."""
    start = datetime.now(timezone.utc) - timedelta(days=days)

    q = select(
        func.count().label("total"),
        func.sum((Detection.verdict == DetectionVerdict.FAKE).cast(Integer)).label("fake_count"),
        func.sum((Detection.verdict == DetectionVerdict.REAL).cast(Integer)).label("real_count"),
        func.sum((Detection.verdict == DetectionVerdict.UNCERTAIN).cast(Integer)).label("uncertain_count"),
        func.avg(Detection.processing_time_ms).label("avg_latency"),
        func.percentile_cont(0.95).within_group(Detection.processing_time_ms).label("p95_latency"),
    ).where(
        Detection.tenant_id == tenant_id,
        Detection.created_at >= start,
    )
    result = (await db.execute(q)).one()

    total = result.total or 0
    fake = result.fake_count or 0

    return {
        "total_requests":   total,
        "fake_detected":    fake,
        "real_detected":    result.real_count or 0,
        "uncertain":        result.uncertain_count or 0,
        "fake_rate":        round(fake / total * 100, 2) if total else 0.0,
        "avg_latency_ms":   int(result.avg_latency or 0),
        "p95_latency_ms":   int(result.p95_latency or 0),
    }


# ─────────────────────────────────────────────────────────────────────────────
# PLATFORM (sysadmin — cross-tenant, KHÔNG filter theo tenant_id)
# ─────────────────────────────────────────────────────────────────────────────
async def list_all_tenants(
    db: AsyncSession, *, page: int = 1, limit: int = 20,
) -> tuple[List[dict], int]:
    """List TẤT CẢ tenants (xuyên tenant) kèm user_count. Returns (items, total)."""
    total = (await db.execute(select(func.count()).select_from(Tenant))).scalar_one()

    user_count_sq = (
        select(User.tenant_id, func.count().label("user_count"))
        .where(User.deleted_at.is_(None))
        .group_by(User.tenant_id)
        .subquery()
    )
    q = (
        select(Tenant, func.coalesce(user_count_sq.c.user_count, 0))
        .join(user_count_sq, user_count_sq.c.tenant_id == Tenant.id, isouter=True)
        .order_by(desc(Tenant.created_at))
        .offset((page - 1) * limit)
        .limit(limit)
    )
    rows = (await db.execute(q)).all()

    items = [
        {
            "id":            t.id,
            "name":          t.name,
            "plan":          t.plan.value,
            "status":        t.status.value,
            "monthly_quota": t.monthly_quota,
            "current_usage": t.current_usage,
            "user_count":    user_count,
            "created_at":    t.created_at,
        }
        for t, user_count in rows
    ]
    return items, total


async def platform_overview(db: AsyncSession, *, days: int = 30) -> dict:
    """Aggregate xuyên tenant cho Platform Console (sysadmin)."""
    start = datetime.now(timezone.utc) - timedelta(days=days)

    total_tenants = (await db.execute(select(func.count()).select_from(Tenant))).scalar_one()
    active_tenants = (
        await db.execute(
            select(func.count()).select_from(Tenant).where(Tenant.status == "active")
        )
    ).scalar_one()
    total_users = (
        await db.execute(
            select(func.count()).select_from(User).where(User.deleted_at.is_(None))
        )
    ).scalar_one()

    q = select(
        func.count().label("total"),
        func.sum((Detection.verdict == DetectionVerdict.FAKE).cast(Integer)).label("fake_count"),
        func.avg(Detection.processing_time_ms).label("avg_latency"),
    ).where(Detection.created_at >= start)
    result = (await db.execute(q)).one()

    total = result.total or 0
    fake = result.fake_count or 0

    return {
        "total_tenants":  total_tenants,
        "active_tenants": active_tenants,
        "total_users":    total_users,
        "total_requests": total,
        "fake_detected":  fake,
        "fake_rate":      round(fake / total * 100, 2) if total else 0.0,
        "avg_latency_ms": int(result.avg_latency or 0),
    }


async def tenant_user_count(db: AsyncSession, tenant_id: uuid.UUID) -> int:
    q = select(func.count()).select_from(User).where(
        User.tenant_id == tenant_id, User.deleted_at.is_(None)
    )
    return (await db.execute(q)).scalar_one()


async def update_tenant_admin(
    db: AsyncSession, tenant_id: uuid.UUID, *,
    status: Optional[str] = None,
    plan: Optional[str] = None,
    monthly_quota: Optional[int] = None,
) -> Optional[Tenant]:
    """Sysadmin update: status | plan | monthly_quota. Caller commit."""
    tenant = await db.get(Tenant, tenant_id)
    if not tenant:
        return None
    if status is not None:
        tenant.status = status
    if plan is not None:
        tenant.plan = plan
    if monthly_quota is not None:
        tenant.monthly_quota = monthly_quota
    return tenant


# ─────────────────────────────────────────────────────────────────────────────
# AUDIT_LOG
# ─────────────────────────────────────────────────────────────────────────────
async def write_audit_log(
    db: AsyncSession, *, action: str, resource_type: str,
    tenant_id: Optional[uuid.UUID] = None,
    user_id: Optional[uuid.UUID] = None,
    resource_id: Optional[uuid.UUID] = None,
    metadata: Optional[dict] = None,
    ip_address: Optional[str] = None,
    user_agent: Optional[str] = None,
) -> None:
    """Fire-and-forget audit log. Không return."""
    log = AuditLog(
        tenant_id=tenant_id, user_id=user_id, action=action,
        resource_type=resource_type, resource_id=resource_id,
        metadata_=metadata or {},
        ip_address=ip_address, user_agent=user_agent,
    )
    db.add(log)
    # Không await flush — caller commit khi xong request
