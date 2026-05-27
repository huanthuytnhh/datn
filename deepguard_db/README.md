# DeepGuard Database

SQLAlchemy 2.0 models + PostgreSQL schema cho hệ thống DeepGuard.

## Cấu trúc

```
deepguard_db/
├── app/db/
│   ├── __init__.py     # Re-export tất cả models
│   ├── models.py       # 10 SQLAlchemy ORM models
│   ├── database.py     # Engine, session, dependency
│   └── crud.py         # CRUD operations cơ bản
├── schema.sql          # Pure SQL DDL (có thể chạy thẳng)
└── README.md
```

## 10 bảng

| # | Bảng | Mục đích |
|---|------|----------|
| 1 | `tenants` | Khách hàng (ngân hàng/fintech) — root entity |
| 2 | `users` | Dashboard users (developer/compliance/admin) |
| 3 | `api_keys` | Backend integration keys |
| 4 | `invitations` | User invite tokens |
| 5 | `webhooks` | Webhook configurations per tenant |
| 6 | `detections` | Audit log mỗi /v1/detect/image call |
| 7 | `jobs` | Async video detection jobs |
| 8 | `webhook_deliveries` | Webhook delivery attempts |
| 9 | `audit_logs` | Generic audit (BIGSERIAL high-write) |
| 10 | `model_versions` | Model versions deployed (A/B test) |

## Setup

### Option 1: SQLAlchemy auto-create (dev only)

```bash
pip install sqlalchemy[asyncio] asyncpg

# Set DATABASE_URL
export DATABASE_URL="postgresql+asyncpg://postgres:postgres@localhost:5432/deepguard"

# Init from Python
python -c "
import asyncio
from app.db import init_db
asyncio.run(init_db())
"
```

### Option 2: Pure SQL DDL (production-ready)

```bash
# Tạo DB
createdb deepguard

# Run schema
psql -d deepguard -f schema.sql
```

### Option 3: SQLite cho MVP/test (không cần Postgres)

```bash
export DATABASE_URL="sqlite+aiosqlite:///./deepguard.db"
pip install aiosqlite

# ⚠ Lưu ý: SQLite không hỗ trợ JSONB, UUID, ENUM native
# Sẽ phải sửa models cho SQLite-compatible
```

## Sử dụng trong FastAPI

```python
from fastapi import FastAPI, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.db import get_db, crud, DetectionVerdict

app = FastAPI()

@app.post("/v1/detect/image")
async def detect_image(
    image: UploadFile,
    api_key: str = Header(..., alias="X-API-Key"),
    db: AsyncSession = Depends(get_db),
):
    # 1. Validate API key
    key_obj = await crud.validate_api_key(db, api_key)
    if not key_obj:
        raise HTTPException(401, "Invalid API key")

    # 2. Check quota
    if key_obj.quota_used >= key_obj.quota_limit:
        raise HTTPException(429, "Quota exceeded")

    # 3. Run inference (model code)
    # ...

    # 4. Save detection
    detection = await crud.create_detection(
        db,
        tenant_id=key_obj.tenant_id,
        api_key_id=key_obj.id,
        verdict=DetectionVerdict.FAKE,
        confidence=87.3,
        prob_fake=0.873,
        prob_cnn=0.901,
        threshold_used=0.6197,
        image_hash="sha256_hash_here",
        processing_time_ms=142,
        model_version="b4-baseline-v1",
    )

    # 5. Increment tenant usage
    await crud.increment_tenant_usage(db, key_obj.tenant_id)

    # 6. Audit log
    await crud.write_audit_log(
        db,
        action="detection.created",
        resource_type="detection",
        resource_id=detection.request_id,
        tenant_id=key_obj.tenant_id,
    )

    return {
        "request_id": detection.request_id,
        "verdict": detection.verdict.value,
        "confidence": detection.confidence,
        # ...
    }
```

## Migration với Alembic (production)

```bash
pip install alembic

alembic init alembic
# Edit alembic.ini → set sqlalchemy.url
# Edit alembic/env.py → import Base from app.db

alembic revision --autogenerate -m "initial schema"
alembic upgrade head
```

## Index strategy

| Index | Tại bảng | Mục đích |
|-------|----------|----------|
| `idx_tenant_status_plan` | tenants | Lọc tenant active theo plan |
| `idx_user_email` | users | Lookup login |
| `idx_apikey_tenant_status` | api_keys | List active keys của tenant |
| `idx_detection_tenant_created` | detections | Compliance history query |
| `idx_detection_verdict_created` | detections | Filter theo verdict |
| `idx_job_status_created` | jobs | Worker poll pending jobs |
| `idx_audit_tenant_created` | audit_logs | Audit trail per tenant |

## Performance notes

- **`detections`** là bảng growth nhanh nhất (~10K rows/ngày với 10 tenants)
- Khuyên partition theo `created_at` per month sau 6 tháng
- **`audit_logs`** dùng BIGSERIAL thay vì UUID vì insert performance
- **JSONB** cho `metadata`, `result`, `payload` — query với GIN index nếu cần
- **Multi-tenancy**: mọi query phải filter `WHERE tenant_id = ?` để isolation

## MVP simplification

Cho 10h MVP, **không cần PostgreSQL thật**. Dùng:

```python
# In-memory dict thay vì DB
DETECTIONS_DB = {}
TENANTS_DB = {"demo": {...}}
API_KEYS_DB = {"demo-key": {...}}
```

Restart server mất data nhưng demo OK. Code Python dùng cùng pattern (CRUD functions) — chỉ đổi backend storage. Phase 2 swap sang PostgreSQL với SQLAlchemy không phải sửa business logic.
