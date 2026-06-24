"""
models.py — SQLAlchemy 2.0 models cho DeepGuard

Tổng: 10 tables
- tenants:           Khách hàng (ngân hàng/fintech)
- users:             Dashboard users
- api_keys:          Backend integration keys
- invitations:       User invite system
- webhooks:          Webhook configurations
- detections:        Audit log mỗi /v1/detect/image call
- jobs:              Async video processing
- webhook_deliveries: Webhook delivery log
- audit_logs:        Generic audit cho compliance
- model_versions:    Model versions deployed

Conventions:
- UUID làm Primary Key cho hầu hết (BIGSERIAL cho audit_logs vì high-write)
- TimestampMixin: created_at + updated_at tự động
- TenantScopedMixin: tenant_id FK cho multi-tenancy
- Cascade delete: tenant bị xóa → mọi data của tenant bị xóa
- Soft delete với deleted_at cho api_keys, users (audit purpose)
"""

from __future__ import annotations

import uuid
from datetime import datetime
from enum import Enum
from typing import Optional, List

from sqlalchemy import (
    String, Text, Integer, BigInteger, Float, Boolean, ForeignKey,
    DateTime, Index, UniqueConstraint, CheckConstraint, text
)
from sqlalchemy.dialects.postgresql import UUID, JSONB, ENUM as PGEnum
from sqlalchemy.orm import (
    DeclarativeBase, Mapped, mapped_column, relationship
)
from sqlalchemy.sql import func


# ─────────────────────────────────────────────────────────────────────────────
# Base & Mixins
# ─────────────────────────────────────────────────────────────────────────────
class Base(DeclarativeBase):
    """Base class cho tất cả ORM models."""
    pass


class TimestampMixin:
    """Mixin tự động set created_at, updated_at."""
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
        index=True,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )


# ─────────────────────────────────────────────────────────────────────────────
# Enums
# ─────────────────────────────────────────────────────────────────────────────
class TenantPlan(str, Enum):
    STARTER    = "starter"
    PRO        = "pro"
    ENTERPRISE = "enterprise"


class TenantStatus(str, Enum):
    PENDING   = "pending"      # tự đăng ký — CHỜ sysadmin duyệt (khác suspended)
    ACTIVE    = "active"
    SUSPENDED = "suspended"
    DELETED   = "deleted"


class UserRole(str, Enum):
    VIEWER     = "viewer"        # Chỉ xem (read-only)
    DEVELOPER  = "developer"     # Tích hợp API
    COMPLIANCE = "compliance"    # Audit
    ADMIN      = "admin"         # Tenant admin
    SYSADMIN   = "sysadmin"      # DeepGuard ops (xuyên tenant)


class ApiKeyStatus(str, Enum):
    ACTIVE    = "active"
    SUSPENDED = "suspended"
    REVOKED   = "revoked"


class WebhookStatus(str, Enum):
    ACTIVE = "active"
    PAUSED = "paused"


class DetectionVerdict(str, Enum):
    REAL      = "REAL"
    FAKE      = "FAKE"
    UNCERTAIN = "UNCERTAIN"


class LivenessVerdict(str, Enum):
    LIVE     = "LIVE"
    SPOOF    = "SPOOF"
    UNCERTAIN = "UNCERTAIN"


class SpoofType(str, Enum):
    PRINT    = "print"          # printed photo
    SCREEN   = "screen"         # replayed on a screen
    MASK_3D  = "mask_3d"        # silicone/paper mask
    DEEPFAKE = "deepfake"       # generated face video
    UNKNOWN  = "unknown"


class JobType(str, Enum):
    VIDEO_DETECTION = "video_detection"
    BATCH_DETECTION = "batch_detection"


class JobStatus(str, Enum):
    PENDING    = "PENDING"
    PROCESSING = "PROCESSING"
    COMPLETED  = "COMPLETED"
    FAILED     = "FAILED"


# ─────────────────────────────────────────────────────────────────────────────
# 1. TENANTS — Customer organizations
# ─────────────────────────────────────────────────────────────────────────────
class Tenant(Base, TimestampMixin):
    """Tenant = Khách hàng (ngân hàng/fintech). Root entity của multi-tenancy."""
    __tablename__ = "tenants"

    id:             Mapped[uuid.UUID]   = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name:           Mapped[str]         = mapped_column(String(200), nullable=False)
    plan:           Mapped[TenantPlan]  = mapped_column(PGEnum(TenantPlan, name="tenant_plan"), default=TenantPlan.STARTER, nullable=False)
    status:         Mapped[TenantStatus]= mapped_column(PGEnum(TenantStatus, name="tenant_status"), default=TenantStatus.ACTIVE, nullable=False)
    monthly_quota:  Mapped[int]         = mapped_column(Integer, default=100, nullable=False)
    current_usage:  Mapped[int]         = mapped_column(Integer, default=0, nullable=False)
    admin_email:    Mapped[str]         = mapped_column(String(255), nullable=False)
    billing_email:  Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    metadata_:      Mapped[dict]        = mapped_column("metadata", JSONB, default=dict, nullable=False)

    # Relationships
    users:        Mapped[List["User"]]      = relationship(back_populates="tenant", cascade="all, delete-orphan")
    api_keys:     Mapped[List["ApiKey"]]    = relationship(back_populates="tenant", cascade="all, delete-orphan")
    detections:   Mapped[List["Detection"]] = relationship(back_populates="tenant", cascade="all, delete-orphan")
    webhooks:     Mapped[List["Webhook"]]   = relationship(back_populates="tenant", cascade="all, delete-orphan")
    jobs:         Mapped[List["Job"]]       = relationship(back_populates="tenant", cascade="all, delete-orphan")
    invitations:  Mapped[List["Invitation"]]= relationship(back_populates="tenant", cascade="all, delete-orphan")

    __table_args__ = (
        Index("idx_tenant_status_plan", "status", "plan"),
        CheckConstraint("monthly_quota >= 0", name="ck_quota_positive"),
        CheckConstraint("current_usage >= 0", name="ck_usage_positive"),
    )

    def __repr__(self) -> str:
        return f"<Tenant {self.name} ({self.plan.value})>"


# ─────────────────────────────────────────────────────────────────────────────
# 2. USERS — Dashboard users (developer/compliance/admin/sysadmin)
# ─────────────────────────────────────────────────────────────────────────────
class User(Base, TimestampMixin):
    """Người dùng dashboard."""
    __tablename__ = "users"

    id:             Mapped[uuid.UUID]   = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id:      Mapped[uuid.UUID]   = mapped_column(UUID(as_uuid=True), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False)
    email:          Mapped[str]         = mapped_column(String(255), nullable=False)
    password_hash:  Mapped[str]         = mapped_column(String(255), nullable=False)
    name:           Mapped[str]         = mapped_column(String(200), nullable=False)
    phone:          Mapped[Optional[str]] = mapped_column(String(40), nullable=True)
    timezone:       Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    role:           Mapped[UserRole]    = mapped_column(PGEnum(UserRole, name="user_role"), default=UserRole.DEVELOPER, nullable=False)
    is_active:      Mapped[bool]        = mapped_column(Boolean, default=True, nullable=False)
    must_change_password: Mapped[bool]  = mapped_column(Boolean, default=False, nullable=False)
    last_login_at:  Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    deleted_at:     Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    tenant:     Mapped["Tenant"]            = relationship(back_populates="users")
    audit_logs: Mapped[List["AuditLog"]]    = relationship(back_populates="user")

    __table_args__ = (
        UniqueConstraint("email", "tenant_id", name="uq_user_email_tenant"),
        Index("idx_user_tenant_role", "tenant_id", "role"),
        Index("idx_user_email", "email"),
    )

    def __repr__(self) -> str:
        return f"<User {self.email} ({self.role.value})>"


# ─────────────────────────────────────────────────────────────────────────────
# 3. API_KEYS — Backend integration keys
# ─────────────────────────────────────────────────────────────────────────────
class ApiKey(Base, TimestampMixin):
    """API key cho Banking App tích hợp DeepGuard."""
    __tablename__ = "api_keys"

    id:             Mapped[uuid.UUID]   = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id:      Mapped[uuid.UUID]   = mapped_column(UUID(as_uuid=True), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False)
    key_hash:       Mapped[str]         = mapped_column(String(64), nullable=False)   # SHA-256 hash của key (không lưu plaintext)
    prefix:         Mapped[str]         = mapped_column(String(32), nullable=False)   # display prefix
    name:           Mapped[str]         = mapped_column(String(200), nullable=False)
    status:         Mapped[ApiKeyStatus]= mapped_column(PGEnum(ApiKeyStatus, name="api_key_status"), default=ApiKeyStatus.ACTIVE, nullable=False)
    quota_limit:    Mapped[int]         = mapped_column(Integer, default=1000, nullable=False)
    quota_used:     Mapped[int]         = mapped_column(Integer, default=0, nullable=False)
    rate_limit_rpm: Mapped[int]         = mapped_column(Integer, default=60, nullable=False)
    last_used_at:   Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    expires_at:     Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)  # nullable = never expire
    deleted_at:     Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    tenant:     Mapped["Tenant"]              = relationship(back_populates="api_keys")
    detections: Mapped[List["Detection"]]     = relationship(back_populates="api_key")
    jobs:       Mapped[List["Job"]]           = relationship(back_populates="api_key")

    __table_args__ = (
        UniqueConstraint("key_hash", name="uq_api_key_hash"),
        Index("idx_apikey_tenant_status", "tenant_id", "status"),
        Index("idx_apikey_prefix", "prefix"),
    )

    def __repr__(self) -> str:
        return f"<ApiKey {self.prefix} ({self.status.value})>"


# ─────────────────────────────────────────────────────────────────────────────
# 4. INVITATIONS — User invite tokens
# ─────────────────────────────────────────────────────────────────────────────
class Invitation(Base, TimestampMixin):
    """Token mời user vào tenant qua email."""
    __tablename__ = "invitations"

    id:          Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id:   Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False)
    email:       Mapped[str]       = mapped_column(String(255), nullable=False)
    role:        Mapped[UserRole]  = mapped_column(PGEnum(UserRole, name="user_role"), nullable=False)
    token:       Mapped[str]       = mapped_column(String(128), nullable=False)
    expires_at:  Mapped[datetime]  = mapped_column(DateTime(timezone=True), nullable=False)
    accepted_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    tenant: Mapped["Tenant"] = relationship(back_populates="invitations")

    __table_args__ = (
        UniqueConstraint("token", name="uq_invitation_token"),
        Index("idx_invitation_email", "email"),
    )


# ─────────────────────────────────────────────────────────────────────────────
# 5. WEBHOOKS — Webhook configurations per tenant
# ─────────────────────────────────────────────────────────────────────────────
class Webhook(Base, TimestampMixin):
    """Webhook URL đăng ký bởi tenant."""
    __tablename__ = "webhooks"

    id:                  Mapped[uuid.UUID]    = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id:           Mapped[uuid.UUID]    = mapped_column(UUID(as_uuid=True), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False)
    url:                 Mapped[str]          = mapped_column(String(500), nullable=False)
    events:              Mapped[list]         = mapped_column(JSONB, default=list, nullable=False)  # ["job.completed", "job.failed"]
    secret:              Mapped[Optional[str]]= mapped_column(String(255), nullable=True)
    status:              Mapped[WebhookStatus]= mapped_column(PGEnum(WebhookStatus, name="webhook_status"), default=WebhookStatus.ACTIVE, nullable=False)
    last_delivery_at:    Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    last_delivery_status:Mapped[Optional[int]]= mapped_column(Integer, nullable=True)

    tenant:     Mapped["Tenant"]                  = relationship(back_populates="webhooks")
    deliveries: Mapped[List["WebhookDelivery"]]   = relationship(back_populates="webhook", cascade="all, delete-orphan")

    __table_args__ = (
        Index("idx_webhook_tenant_status", "tenant_id", "status"),
    )


# ─────────────────────────────────────────────────────────────────────────────
# 6. DETECTIONS — Audit log mỗi /v1/detect/image call
# ─────────────────────────────────────────────────────────────────────────────
class Detection(Base, TimestampMixin):
    """Mỗi lần gọi /v1/detect/image → 1 row ở đây. Cho compliance audit."""
    __tablename__ = "detections"

    request_id:         Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id:          Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False)
    api_key_id:         Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("api_keys.id"), nullable=True)
    source:             Mapped[str]      = mapped_column(String(20), nullable=False, default="api")  # 'api' | 'playground'

    # Detection result
    verdict:            Mapped[DetectionVerdict] = mapped_column(PGEnum(DetectionVerdict, name="detection_verdict"), nullable=False, index=True)
    confidence:         Mapped[float]    = mapped_column(Float, nullable=False)
    prob_fake:          Mapped[float]    = mapped_column(Float, nullable=False)
    prob_cnn:           Mapped[float]    = mapped_column(Float, nullable=False)
    spatial_score:      Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    frequency_score:    Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    threshold_used:     Mapped[float]    = mapped_column(Float, nullable=False)

    # Image metadata (KHÔNG lưu ảnh gốc, chỉ hash + dimensions)
    image_hash:         Mapped[str]      = mapped_column(String(64), nullable=False)  # SHA-256
    image_width:        Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    image_height:       Mapped[Optional[int]] = mapped_column(Integer, nullable=True)

    # Optional heatmap URL (S3 link, lưu max 90 ngày)
    heatmap_url:        Mapped[Optional[str]] = mapped_column(String(500), nullable=True)

    # Optional base64 JPEG thumbnail of the original input (max ~320px)
    image_thumb:        Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Performance
    processing_time_ms: Mapped[int]      = mapped_column(Integer, nullable=False)
    model_version:      Mapped[str]      = mapped_column(String(50), nullable=False)

    # Audit metadata
    user_agent:         Mapped[Optional[str]]   = mapped_column(String(500), nullable=True)
    ip_address:         Mapped[Optional[str]]   = mapped_column(String(45), nullable=True)  # IPv6 max
    audit_notes:        Mapped[list]            = mapped_column(JSONB, default=list, nullable=False)

    tenant:  Mapped["Tenant"] = relationship(back_populates="detections")
    api_key: Mapped["ApiKey"] = relationship(back_populates="detections")

    __table_args__ = (
        # Critical indexes cho compliance queries
        Index("idx_detection_tenant_created", "tenant_id", "created_at"),
        Index("idx_detection_verdict_created", "verdict", "created_at"),
        Index("idx_detection_apikey_created", "api_key_id", "created_at"),
        CheckConstraint("confidence >= 0 AND confidence <= 100", name="ck_confidence_range"),
        CheckConstraint("prob_fake >= 0 AND prob_fake <= 1", name="ck_prob_range"),
    )

    def __repr__(self) -> str:
        return f"<Detection {self.verdict.value} {self.confidence:.1f}%>"


# ─────────────────────────────────────────────────────────────────────────────
# 7. JOBS — Async video processing jobs
# ─────────────────────────────────────────────────────────────────────────────
class Job(Base, TimestampMixin):
    """Async job (video detection, batch processing)."""
    __tablename__ = "jobs"

    id:               Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id:        Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False)
    api_key_id:       Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("api_keys.id"), nullable=False)
    type:             Mapped[JobType]   = mapped_column(PGEnum(JobType, name="job_type"), nullable=False)
    status:           Mapped[JobStatus] = mapped_column(PGEnum(JobStatus, name="job_status"), default=JobStatus.PENDING, nullable=False)
    progress_percent: Mapped[int]       = mapped_column(Integer, default=0, nullable=False)
    input_url:        Mapped[Optional[str]]  = mapped_column(String(500), nullable=True)  # S3 URL của input video
    result:           Mapped[dict]      = mapped_column(JSONB, default=dict, nullable=False)
    error_message:    Mapped[Optional[str]] = mapped_column(String(1000), nullable=True)
    started_at:       Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    completed_at:     Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    webhook_url:      Mapped[Optional[str]] = mapped_column(String(500), nullable=True)  # callback after done

    tenant:  Mapped["Tenant"]  = relationship(back_populates="jobs")
    api_key: Mapped["ApiKey"]  = relationship(back_populates="jobs")

    __table_args__ = (
        Index("idx_job_status_created", "status", "created_at"),
        Index("idx_job_tenant_created", "tenant_id", "created_at"),
        CheckConstraint("progress_percent >= 0 AND progress_percent <= 100", name="ck_progress_range"),
    )


# ─────────────────────────────────────────────────────────────────────────────
# 8. WEBHOOK_DELIVERIES — Delivery log
# ─────────────────────────────────────────────────────────────────────────────
class WebhookDelivery(Base, TimestampMixin):
    """Mỗi lần thử gửi webhook → 1 row. Cho debug + retry."""
    __tablename__ = "webhook_deliveries"

    id:            Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    webhook_id:    Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("webhooks.id", ondelete="CASCADE"), nullable=False)
    event_type:    Mapped[str]       = mapped_column(String(100), nullable=False)
    payload:       Mapped[dict]      = mapped_column(JSONB, nullable=False)
    status_code:   Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    response_body: Mapped[Optional[str]] = mapped_column(String(2000), nullable=True)
    latency_ms:    Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    delivered:     Mapped[bool]      = mapped_column(Boolean, default=False, nullable=False)
    attempt_count: Mapped[int]       = mapped_column(Integer, default=1, nullable=False)
    next_retry_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    webhook: Mapped["Webhook"] = relationship(back_populates="deliveries")

    __table_args__ = (
        Index("idx_delivery_webhook_created", "webhook_id", "created_at"),
        Index("idx_delivery_retry", "next_retry_at"),
    )


# ─────────────────────────────────────────────────────────────────────────────
# 9. AUDIT_LOGS — Generic audit log (high-write, dùng BIGSERIAL)
# ─────────────────────────────────────────────────────────────────────────────
class AuditLog(Base):
    """
    Generic audit log cho mọi hành động trên hệ thống.
    Dùng BIGSERIAL thay vì UUID vì high-write throughput.
    Có thể partition theo created_at trong production.
    """
    __tablename__ = "audit_logs"

    id:           Mapped[int]            = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    tenant_id:    Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("tenants.id", ondelete="SET NULL"), nullable=True)
    user_id:      Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    action:       Mapped[str]            = mapped_column(String(100), nullable=False)  # api_key.created, detection.viewed, ...
    resource_type:Mapped[str]            = mapped_column(String(50), nullable=False)   # api_key, detection, webhook, ...
    resource_id:  Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), nullable=True)
    metadata_:    Mapped[dict]           = mapped_column("metadata", JSONB, default=dict, nullable=False)
    ip_address:   Mapped[Optional[str]]  = mapped_column(String(45), nullable=True)
    user_agent:   Mapped[Optional[str]]  = mapped_column(String(500), nullable=True)
    created_at:   Mapped[datetime]       = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False, index=True)

    user: Mapped[Optional["User"]] = relationship(back_populates="audit_logs")

    __table_args__ = (
        Index("idx_audit_tenant_created", "tenant_id", "created_at"),
        Index("idx_audit_action_created", "action", "created_at"),
        Index("idx_audit_resource", "resource_type", "resource_id"),
    )


# ─────────────────────────────────────────────────────────────────────────────
# 10. MODEL_VERSIONS — Deployed model versions (cho A/B testing)
# ─────────────────────────────────────────────────────────────────────────────
class ModelVersion(Base, TimestampMixin):
    """Model versions deployed. Cho A/B test giữa các model."""
    __tablename__ = "model_versions"

    id:              Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    version:         Mapped[str]       = mapped_column(String(50), nullable=False)
    architecture:    Mapped[str]       = mapped_column(String(200), nullable=False)
    auc_celeb:       Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    auc_ffpp:        Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    threshold:       Mapped[float]     = mapped_column(Float, default=0.5, nullable=False)
    training_dataset:Mapped[Optional[str]]   = mapped_column(String(200), nullable=True)
    checkpoint_path: Mapped[str]       = mapped_column(String(500), nullable=False)
    is_active:       Mapped[bool]      = mapped_column(Boolean, default=False, nullable=False)
    traffic_percent: Mapped[int]       = mapped_column(Integer, default=0, nullable=False)  # 0-100 cho A/B test
    deployed_at:     Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    metadata_:       Mapped[dict]      = mapped_column("metadata", JSONB, default=dict, nullable=False)

    __table_args__ = (
        UniqueConstraint("version", name="uq_model_version"),
        CheckConstraint("traffic_percent >= 0 AND traffic_percent <= 100", name="ck_traffic_range"),
    )


class LivenessCheck(Base, TimestampMixin):
    """
    Kiểm tra liveness (anti-spoofing) cho KYC / face verification.
    Khác Detection (deepfake forensic): liveness check trả lời "có phải người thật đang ngồi trước camera?",
    còn deepfake detect trả lời "video/ảnh này có bị AI sinh ra không?". Hai pipeline khác model, khác use case.
    """
    __tablename__ = "liveness_checks"

    check_id:           Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id:          Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False)
    api_key_id:         Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("api_keys.id"), nullable=True)
    source:             Mapped[str]      = mapped_column(String(20), nullable=False, default="api")  # 'api' | 'playground'

    # Liveness result
    verdict:            Mapped[LivenessVerdict] = mapped_column(PGEnum(LivenessVerdict, name="liveness_verdict"), nullable=False, index=True)
    liveness_score:     Mapped[float]    = mapped_column(Float, nullable=False)     # 0-1 (1 = chắc chắn live)
    confidence:         Mapped[float]    = mapped_column(Float, nullable=False)     # 0-100
    spoof_type:         Mapped[Optional[SpoofType]] = mapped_column(PGEnum(SpoofType, name="spoof_type", values_callable=lambda x: [e.value for e in x]), nullable=True)
    threshold_used:     Mapped[float]    = mapped_column(Float, nullable=False)

    # Mode
    mode:               Mapped[str]      = mapped_column(String(20), nullable=False, default="passive")  # passive | active
    challenge_type:     Mapped[Optional[str]] = mapped_column(String(50), nullable=True)                  # blink | turn_left | smile | nod
    challenge_passed:   Mapped[Optional[bool]] = mapped_column(Boolean, nullable=True)
    frame_count:        Mapped[int]      = mapped_column(Integer, default=1, nullable=False)

    # Image metadata (1 frame đại diện)
    image_hash:         Mapped[str]      = mapped_column(String(64), nullable=False)
    image_width:        Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    image_height:       Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    image_thumb:        Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Performance
    processing_time_ms: Mapped[int]      = mapped_column(Integer, nullable=False)
    model_version:      Mapped[str]      = mapped_column(String(50), nullable=False)

    # Audit
    user_agent:         Mapped[Optional[str]]  = mapped_column(String(500), nullable=True)
    ip_address:         Mapped[Optional[str]]  = mapped_column(String(45), nullable=True)
    metadata_:          Mapped[dict]           = mapped_column("metadata", JSONB, default=dict, nullable=False)

    __table_args__ = (
        Index("idx_liveness_tenant_created", "tenant_id", "created_at"),
        Index("idx_liveness_verdict_created", "verdict", "created_at"),
        Index("idx_liveness_apikey_created", "api_key_id", "created_at"),
        CheckConstraint("liveness_score >= 0 AND liveness_score <= 1", name="ck_liveness_score_range"),
        CheckConstraint("confidence >= 0 AND confidence <= 100", name="ck_liveness_confidence_range"),
    )


# ─────────────────────────────────────────────────────────────────────────────
# NOTIFICATION
# ─────────────────────────────────────────────────────────────────────────────
class Notification(Base, TimestampMixin):
    """In-app notification. user_id NULL = gửi toàn tenant."""
    __tablename__ = "notifications"

    id:          Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id:   Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False)
    user_id:     Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=True)
    type:        Mapped[str]       = mapped_column(String(20), default="info", nullable=False)  # info|success|warning|critical
    title:       Mapped[str]       = mapped_column(String(255), nullable=False)
    body:        Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    link:        Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    read:        Mapped[bool]      = mapped_column(Boolean, default=False, nullable=False)

    __table_args__ = (
        Index("idx_notif_tenant_created", "tenant_id", "created_at"),
        Index("idx_notif_user_read", "user_id", "read"),
    )

    def __repr__(self) -> str:
        return f"<Notification {self.type}:{self.title[:20]}>"
