"""
seed.py — Seed database with demo Vietnamese banking/fintech data.

Usage:
    cd backend/
    python3 scripts/seed.py              # seed with default .env
    python3 scripts/seed.py --drop       # drop all tables first, then seed
    python3 scripts/seed.py --reset      # alias for --drop

All names are Vietnamese without diacritics (English-style spelling).
Default password for all users: DeepGuard@2024
"""

import asyncio
import hashlib
import os
import secrets
import sys
import uuid
from datetime import datetime, timezone, timedelta
from typing import Optional

# ── path setup so deepguard_db is importable ─────────────────────────────────
_here = os.path.dirname(os.path.abspath(__file__))
_backend = os.path.dirname(_here)
_datn    = os.path.dirname(_backend)
sys.path.insert(0, _datn)
sys.path.insert(0, _backend)

from dotenv import load_dotenv
load_dotenv(os.path.join(_backend, ".env"))

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from passlib.context import CryptContext

from deepguard_db.app.db.models import (
    Base, Tenant, User, ApiKey, Detection, Job, Webhook,
    WebhookDelivery, AuditLog, ModelVersion,
    TenantPlan, TenantStatus, UserRole, ApiKeyStatus,
    DetectionVerdict, JobType, JobStatus, WebhookStatus,
)

# ─────────────────────────────────────────────────────────────────────────────
pwd_ctx = CryptContext(schemes=["bcrypt"], deprecated="auto")
DEFAULT_PASSWORD = "DeepGuard@2024"
HASHED_PASSWORD  = pwd_ctx.hash(DEFAULT_PASSWORD)

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql+asyncpg://postgres:postgres@localhost:5432/deepguard",
)

engine = create_async_engine(DATABASE_URL, echo=False)
SessionLocal = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

now = datetime.now(timezone.utc)


# ─────────────────────────────────────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────────────────────────────────────
def _days_ago(n: int) -> datetime:
    return now - timedelta(days=n)


def _hours_ago(n: int) -> datetime:
    return now - timedelta(hours=n)


def _gen_api_key() -> tuple[str, str, str]:
    """Return (plain_key, key_hash, prefix)."""
    plain = "dg_" + secrets.token_hex(24)
    key_hash = hashlib.sha256(plain.encode()).hexdigest()
    prefix = plain[:8] + "..." + plain[-4:]
    return plain, key_hash, prefix


def _image_hash(seed: str) -> str:
    return hashlib.sha256(seed.encode()).hexdigest()


def _detection(
    tenant_id: uuid.UUID,
    api_key_id: uuid.UUID,
    verdict: DetectionVerdict,
    prob_fake: float,
    created_at: datetime,
    ip: str,
) -> Detection:
    confidence = round(abs(prob_fake - 0.5) * 200, 1)  # 0–100
    return Detection(
        tenant_id=tenant_id,
        api_key_id=api_key_id,
        verdict=verdict,
        confidence=min(confidence, 99.9),
        prob_fake=prob_fake,
        prob_cnn=round(prob_fake + (secrets.randbelow(10) - 5) * 0.01, 4),
        spatial_score=round(0.1 + secrets.randbelow(80) * 0.01, 3),
        frequency_score=round(0.05 + secrets.randbelow(70) * 0.01, 3),
        threshold_used=0.35,
        image_hash=_image_hash(str(uuid.uuid4())),
        image_width=1920 if secrets.randbelow(2) else 1280,
        image_height=1080 if secrets.randbelow(2) else 720,
        processing_time_ms=80 + secrets.randbelow(400),
        model_version="b4-baseline-v1",
        user_agent="Mozilla/5.0 (DeepGuard-SDK/1.0)",
        ip_address=ip,
        audit_notes=[],
        created_at=created_at,
        updated_at=created_at,
    )


# ─────────────────────────────────────────────────────────────────────────────
# Data definitions
# ─────────────────────────────────────────────────────────────────────────────
TENANTS_DEF = [
    {
        "name": "FPT Bank Digital",
        "admin_email": "admin@fptbank.vn",
        "billing_email": "billing@fptbank.vn",
        "plan": TenantPlan.ENTERPRISE,
        "monthly_quota": 50000,
        "current_usage": 12430,
        "metadata_": {"industry": "banking", "tier": "private", "city": "Ha Noi"},
        "users": [
            {"email": "tran.van.son@fptbank.vn",   "name": "Tran Van Son",   "role": UserRole.ADMIN},
            {"email": "nguyen.thi.mai@fptbank.vn", "name": "Nguyen Thi Mai", "role": UserRole.DEVELOPER},
            {"email": "le.minh.tuan@fptbank.vn",   "name": "Le Minh Tuan",   "role": UserRole.COMPLIANCE},
            {"email": "pham.hong.duc@fptbank.vn",  "name": "Pham Hong Duc",  "role": UserRole.DEVELOPER},
        ],
        "api_keys": [
            {"name": "FPT Production Key", "quota_limit": 30000, "rate_limit_rpm": 120},
            {"name": "FPT Testing Key",    "quota_limit": 5000,  "rate_limit_rpm": 60},
        ],
        "webhook_url": "https://api.fptbank.vn/deepguard/webhook",
        "ips": ["14.161.24.10", "14.161.24.11", "14.161.24.12"],
    },
    {
        "name": "Techcombank Security",
        "admin_email": "admin@techcombank.com.vn",
        "billing_email": "it@techcombank.com.vn",
        "plan": TenantPlan.PRO,
        "monthly_quota": 10000,
        "current_usage": 3841,
        "metadata_": {"industry": "banking", "tier": "private", "city": "Ha Noi"},
        "users": [
            {"email": "hoang.thi.lan@techcombank.com.vn",   "name": "Hoang Thi Lan",   "role": UserRole.ADMIN},
            {"email": "do.van.phuong@techcombank.com.vn",   "name": "Do Van Phuong",   "role": UserRole.DEVELOPER},
            {"email": "bui.minh.quan@techcombank.com.vn",   "name": "Bui Minh Quan",   "role": UserRole.COMPLIANCE},
        ],
        "api_keys": [
            {"name": "TCB Main API Key", "quota_limit": 8000,  "rate_limit_rpm": 90},
            {"name": "TCB Staging Key",  "quota_limit": 2000,  "rate_limit_rpm": 30},
        ],
        "webhook_url": "https://webhook.techcombank.com.vn/deepguard",
        "ips": ["116.96.45.200", "116.96.45.201"],
    },
    {
        "name": "MoMo Fintech",
        "admin_email": "admin@momo.vn",
        "billing_email": "finance@momo.vn",
        "plan": TenantPlan.PRO,
        "monthly_quota": 20000,
        "current_usage": 8762,
        "metadata_": {"industry": "fintech", "tier": "startup", "city": "Ho Chi Minh"},
        "users": [
            {"email": "dang.thi.giang@momo.vn",  "name": "Dang Thi Giang",  "role": UserRole.ADMIN},
            {"email": "ngo.van.hai@momo.vn",      "name": "Ngo Van Hai",      "role": UserRole.DEVELOPER},
            {"email": "vu.thi.huong@momo.vn",     "name": "Vu Thi Huong",     "role": UserRole.DEVELOPER},
            {"email": "dinh.van.khai@momo.vn",    "name": "Dinh Van Khai",    "role": UserRole.COMPLIANCE},
        ],
        "api_keys": [
            {"name": "MoMo KYC Production", "quota_limit": 15000, "rate_limit_rpm": 120},
            {"name": "MoMo KYC Sandbox",    "quota_limit": 5000,  "rate_limit_rpm": 60},
        ],
        "webhook_url": "https://hooks.momo.vn/deepguard/events",
        "ips": ["42.118.224.10", "42.118.224.11", "42.118.224.12"],
    },
    {
        "name": "VPBank Innovation",
        "admin_email": "admin@vpbank.com.vn",
        "billing_email": None,
        "plan": TenantPlan.STARTER,
        "monthly_quota": 1000,
        "current_usage": 234,
        "metadata_": {"industry": "banking", "tier": "private", "city": "Ha Noi"},
        "users": [
            {"email": "ly.van.nam@vpbank.com.vn",  "name": "Ly Van Nam",  "role": UserRole.ADMIN},
            {"email": "mai.thi.oanh@vpbank.com.vn", "name": "Mai Thi Oanh", "role": UserRole.DEVELOPER},
        ],
        "api_keys": [
            {"name": "VPB Dev Key", "quota_limit": 1000, "rate_limit_rpm": 30},
        ],
        "webhook_url": None,
        "ips": ["103.90.220.5"],
    },
]

# ── Role-based demo login users (idempotent) ─────────────────────────────────
# One demo user per role for testing role-based login. The tenant-scoped roles
# live in the same demo tenant; sysadmin lives there too (role is what matters).
DEMO_TENANT_DEF = {
    "name": "VietBank Demo",
    "admin_email": "admin@vietbank.vn",
    "billing_email": "billing@vietbank.vn",
    "plan": TenantPlan.ENTERPRISE,
    "monthly_quota": 50000,
    "current_usage": 0,
    "metadata_": {"industry": "banking", "tier": "demo", "city": "Ha Noi"},
}

DEMO_USERS_DEF = [
    {"email": "sysadmin@deepguard.vn",  "name": "System Admin",       "role": UserRole.SYSADMIN},
    {"email": "admin@vietbank.vn",      "name": "Tenant Admin",       "role": UserRole.ADMIN},
    {"email": "dev@vietbank.vn",        "name": "Developer",          "role": UserRole.DEVELOPER},
    {"email": "compliance@vietbank.vn", "name": "Compliance Officer", "role": UserRole.COMPLIANCE},
    {"email": "viewer@vietbank.vn",     "name": "Viewer",             "role": UserRole.VIEWER},
]
DEMO_PASSWORD = "Password123!"


MODEL_VERSIONS_DEF = [
    {
        "version": "b4-baseline-v1",
        "architecture": "EfficientNet-B4 + MTCNN + Frequency Analysis",
        "auc_celeb": 0.9712,
        "auc_ffpp":  0.9834,
        "threshold": 0.35,
        "training_dataset": "CelebDF-v2 + FF++ (c23)",
        "checkpoint_path": "models/b4_baseline_v1.pth",
        "is_active": True,
        "traffic_percent": 100,
        "deployed_at": _days_ago(30),
    },
    {
        "version": "b4-augmented-v2",
        "architecture": "EfficientNet-B4 + MTCNN + Frequency Analysis + MixUp",
        "auc_celeb": 0.9801,
        "auc_ffpp":  0.9891,
        "threshold": 0.33,
        "training_dataset": "CelebDF-v2 + FF++ (c23) + DFDC-Preview",
        "checkpoint_path": "models/b4_augmented_v2.pth",
        "is_active": False,
        "traffic_percent": 0,
        "deployed_at": None,
    },
]


# ─────────────────────────────────────────────────────────────────────────────
# Seed functions
# ─────────────────────────────────────────────────────────────────────────────
async def seed_model_versions(db: AsyncSession) -> None:
    print("  → Seeding model versions...")
    for mv_def in MODEL_VERSIONS_DEF:
        mv = ModelVersion(**mv_def)
        db.add(mv)
    await db.flush()
    print(f"    ✓ {len(MODEL_VERSIONS_DEF)} model versions")


async def seed_tenants(db: AsyncSession) -> list[dict]:
    print("  → Seeding tenants, users, API keys, detections, webhooks...")
    seeded = []

    for i, t_def in enumerate(TENANTS_DEF):
        # ── Tenant ────────────────────────────────────────────────────────────
        tenant = Tenant(
            name=t_def["name"],
            admin_email=t_def["admin_email"],
            billing_email=t_def["billing_email"],
            plan=t_def["plan"],
            status=TenantStatus.ACTIVE,
            monthly_quota=t_def["monthly_quota"],
            current_usage=t_def["current_usage"],
            metadata_=t_def["metadata_"],
            created_at=_days_ago(90 - i * 15),
            updated_at=_days_ago(1),
        )
        db.add(tenant)
        await db.flush()
        print(f"    ✓ Tenant: {tenant.name}")

        # ── Users ─────────────────────────────────────────────────────────────
        users = []
        for u_def in t_def["users"]:
            user = User(
                tenant_id=tenant.id,
                email=u_def["email"],
                name=u_def["name"],
                password_hash=HASHED_PASSWORD,
                role=u_def["role"],
                is_active=True,
                last_login_at=_hours_ago(2 + secrets.randbelow(72)),
                created_at=_days_ago(85 - i * 15),
                updated_at=_days_ago(1),
            )
            db.add(user)
            users.append(user)
        await db.flush()
        print(f"      ✓ {len(users)} users")

        # ── API Keys ──────────────────────────────────────────────────────────
        api_keys = []
        for k_def in t_def["api_keys"]:
            _plain, key_hash, prefix = _gen_api_key()
            key = ApiKey(
                tenant_id=tenant.id,
                key_hash=key_hash,
                prefix=prefix,
                name=k_def["name"],
                status=ApiKeyStatus.ACTIVE,
                quota_limit=k_def["quota_limit"],
                quota_used=secrets.randbelow(k_def["quota_limit"] // 2),
                rate_limit_rpm=k_def["rate_limit_rpm"],
                last_used_at=_hours_ago(secrets.randbelow(24)),
                created_at=_days_ago(80 - i * 15),
                updated_at=_days_ago(1),
            )
            db.add(key)
            api_keys.append(key)
        await db.flush()
        print(f"      ✓ {len(api_keys)} API keys")

        # ── Webhook ───────────────────────────────────────────────────────────
        webhook = None
        if t_def["webhook_url"]:
            webhook = Webhook(
                tenant_id=tenant.id,
                url=t_def["webhook_url"],
                events=["detection.completed", "job.completed", "job.failed"],
                secret=secrets.token_hex(16),
                status=WebhookStatus.ACTIVE,
                last_delivery_at=_hours_ago(secrets.randbelow(12)),
                last_delivery_status=200,
                created_at=_days_ago(75 - i * 15),
                updated_at=_days_ago(1),
            )
            db.add(webhook)
            await db.flush()

        # ── Detections (40–80 per tenant) ─────────────────────────────────────
        prod_key = api_keys[0]
        ips = t_def["ips"]
        n_detections = 40 + i * 15  # 40 / 55 / 70 / 55

        verdicts_weights = [
            (DetectionVerdict.REAL,      0.60),
            (DetectionVerdict.FAKE,      0.25),
            (DetectionVerdict.UNCERTAIN, 0.15),
        ]
        detections = []
        for d in range(n_detections):
            roll = secrets.randbelow(100)
            if roll < 60:
                verdict, prob_fake = DetectionVerdict.REAL, round(0.05 + secrets.randbelow(20) * 0.01, 4)
            elif roll < 85:
                verdict, prob_fake = DetectionVerdict.FAKE, round(0.46 + secrets.randbelow(54) * 0.01, 4)
            else:
                verdict, prob_fake = DetectionVerdict.UNCERTAIN, round(0.26 + secrets.randbelow(18) * 0.01, 4)

            det = _detection(
                tenant_id=tenant.id,
                api_key_id=prod_key.id,
                verdict=verdict,
                prob_fake=prob_fake,
                created_at=_hours_ago(secrets.randbelow(720)),  # last 30 days
                ip=ips[secrets.randbelow(len(ips))],
            )
            detections.append(det)
            db.add(det)

        await db.flush()
        print(f"      ✓ {len(detections)} detections")

        # ── Jobs (video, 3–5 per tenant) ──────────────────────────────────────
        job_statuses = [JobStatus.COMPLETED, JobStatus.COMPLETED, JobStatus.COMPLETED, JobStatus.FAILED, JobStatus.PROCESSING]
        n_jobs = 3 + i
        for j in range(min(n_jobs, len(job_statuses))):
            jstatus = job_statuses[j]
            started = _hours_ago(secrets.randbelow(168))
            completed = started + timedelta(seconds=30 + secrets.randbelow(120)) if jstatus != JobStatus.PROCESSING else None
            job = Job(
                tenant_id=tenant.id,
                api_key_id=prod_key.id,
                type=JobType.VIDEO_DETECTION,
                status=jstatus,
                progress_percent=100 if jstatus == JobStatus.COMPLETED else (0 if jstatus == JobStatus.FAILED else 45),
                result={
                    "verdict":         "FAKE" if jstatus == JobStatus.COMPLETED and j == 1 else "REAL",
                    "confidence":      91.2 if j == 1 else 78.5,
                    "prob_fake":       0.82  if j == 1 else 0.12,
                    "frames_analyzed": 120,
                    "frames_fake":     98 if j == 1 else 3,
                    "model_version":   "b4-baseline-v1",
                    "processing_ms":   4200 + secrets.randbelow(2000),
                } if jstatus == JobStatus.COMPLETED else {},
                error_message="CUDA out of memory — video too long" if jstatus == JobStatus.FAILED else None,
                started_at=started,
                completed_at=completed,
                created_at=started,
                updated_at=completed or started,
            )
            db.add(job)
        await db.flush()
        print(f"      ✓ {n_jobs} video jobs")

        # ── Audit logs ────────────────────────────────────────────────────────
        audit_actions = [
            ("api_key.created", "api_key", prod_key.id),
            ("user.login",      "user",    users[0].id),
            ("user.login",      "user",    users[0].id),
            ("detection.viewed","detection", None),
        ]
        for action, resource_type, resource_id in audit_actions:
            log = AuditLog(
                tenant_id=tenant.id,
                user_id=users[0].id,
                action=action,
                resource_type=resource_type,
                resource_id=resource_id,
                metadata_={"source": "dashboard"},
                ip_address=ips[0],
                user_agent="Mozilla/5.0 (DeepGuard Dashboard)",
                created_at=_hours_ago(secrets.randbelow(48)),
            )
            db.add(log)
        await db.flush()
        print(f"      ✓ {len(audit_actions)} audit logs")

        seeded.append({
            "tenant":   tenant,
            "users":    users,
            "api_keys": api_keys,
        })

    return seeded


async def print_summary(seeded: list[dict]) -> None:
    print("\n" + "─" * 60)
    print("SEED SUMMARY")
    print("─" * 60)
    print(f"{'Tenant':<28} {'Plan':<12} {'Users':<6} {'Keys':<5}")
    print("─" * 60)
    for s in seeded:
        t = s["tenant"]
        print(f"{t.name:<28} {t.plan.value:<12} {len(s['users']):<6} {len(s['api_keys']):<5}")
    print("─" * 60)
    print(f"\nDefault login password: {DEFAULT_PASSWORD}")
    print("\nExample logins:")
    print("  nguyen.van.an@vietcombank.com.vn  /  DeepGuard@2024  (ADMIN)")
    print("  hoang.thi.lan@techcombank.com.vn  /  DeepGuard@2024  (ADMIN)")
    print("  dang.thi.giang@momo.vn            /  DeepGuard@2024  (ADMIN)")
    print("  ly.van.nam@vpbank.com.vn           /  DeepGuard@2024  (ADMIN)")


async def seed_demo_role_users(db: AsyncSession) -> None:
    """Idempotently ensure one demo login user per role exists.

    Safe to re-run: finds-or-creates the demo tenant, then upserts each user by
    (email, tenant_id) — the unique constraint on the users table.
    """
    print("\n  → Seeding role-based demo login users...")
    demo_hash = pwd_ctx.hash(DEMO_PASSWORD)

    # ── Find-or-create demo tenant ──────────────────────────────────────────
    tenant = (
        await db.execute(
            select(Tenant).where(Tenant.name == DEMO_TENANT_DEF["name"])
        )
    ).scalar_one_or_none()

    if tenant is None:
        tenant = Tenant(
            name=DEMO_TENANT_DEF["name"],
            admin_email=DEMO_TENANT_DEF["admin_email"],
            billing_email=DEMO_TENANT_DEF["billing_email"],
            plan=DEMO_TENANT_DEF["plan"],
            status=TenantStatus.ACTIVE,
            monthly_quota=DEMO_TENANT_DEF["monthly_quota"],
            current_usage=DEMO_TENANT_DEF["current_usage"],
            metadata_=DEMO_TENANT_DEF["metadata_"],
            created_at=now,
            updated_at=now,
        )
        db.add(tenant)
        await db.flush()
        print(f"    ✓ Created demo tenant: {tenant.name}")
    else:
        print(f"    ✓ Demo tenant exists: {tenant.name}")

    # ── Upsert each demo user ───────────────────────────────────────────────
    for u_def in DEMO_USERS_DEF:
        user = (
            await db.execute(
                select(User).where(
                    User.email == u_def["email"],
                    User.tenant_id == tenant.id,
                )
            )
        ).scalar_one_or_none()

        if user is None:
            user = User(
                tenant_id=tenant.id,
                email=u_def["email"],
                name=u_def["name"],
                password_hash=demo_hash,
                role=u_def["role"],
                is_active=True,
                created_at=now,
                updated_at=now,
            )
            db.add(user)
            print(f"      + created  {u_def['email']:<24} ({u_def['role'].value})")
        else:
            # Keep idempotent but ensure role/name/password stay in sync.
            user.name = u_def["name"]
            user.role = u_def["role"]
            user.password_hash = demo_hash
            user.is_active = True
            user.updated_at = now
            print(f"      = exists   {u_def['email']:<24} ({u_def['role'].value})")

    await db.flush()
    print(f"    ✓ {len(DEMO_USERS_DEF)} demo role users ready (password: {DEMO_PASSWORD})")


# ─────────────────────────────────────────────────────────────────────────────
# Entry point
# ─────────────────────────────────────────────────────────────────────────────
async def main(drop: bool = False, full: bool = False) -> None:
    if drop:
        print("⚠ Dropping all tables...")
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.drop_all)
        print("✓ Tables dropped")

    print("Creating tables if not exists...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("✓ Tables ready\n")

    # The bulk tenant/detection seed is NOT idempotent — it always inserts new
    # rows. Only run it on a fresh DB (--drop/--reset) or when explicitly asked
    # (--full), so the default invocation stays safe to re-run.
    run_bulk = drop or full

    print("Seeding data...")
    async with SessionLocal() as db:
        try:
            seeded = []
            if run_bulk:
                await seed_model_versions(db)
                seeded = await seed_tenants(db)
            else:
                print("  → Skipping bulk tenant seed (idempotent mode; use --full or --drop to include it)")

            # Always ensure role-based demo login users exist (idempotent).
            await seed_demo_role_users(db)

            await db.commit()
            print("\n✓ Seed completed successfully!")
            if seeded:
                await print_summary(seeded)
        except Exception as exc:
            await db.rollback()
            print(f"\n✗ Seed failed: {exc}")
            raise


if __name__ == "__main__":
    drop = "--drop" in sys.argv or "--reset" in sys.argv
    full = "--full" in sys.argv
    asyncio.run(main(drop=drop, full=full))
