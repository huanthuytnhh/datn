"""
database.py — Database engine và session setup cho FastAPI.

Sử dụng async SQLAlchemy 2.0 + asyncpg driver cho PostgreSQL.
"""

import os
from typing import AsyncGenerator

from sqlalchemy.ext.asyncio import (
    AsyncSession, async_sessionmaker, create_async_engine
)
from sqlalchemy.orm import sessionmaker

from .models import Base


# ─────────────────────────────────────────────────────────────────────────────
# Connection URL
# ─────────────────────────────────────────────────────────────────────────────
# Production: postgresql+asyncpg://user:password@host:5432/dbname
# Dev:        postgresql+asyncpg://postgres:postgres@localhost:5432/deepguard
# Test/MVP:   sqlite+aiosqlite:///./deepguard.db  (đơn giản, không cần Postgres)

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql+asyncpg://postgres:postgres@localhost:5432/deepguard"
)

# Echo SQL queries trong dev mode (set DB_ECHO=1)
DB_ECHO = os.getenv("DB_ECHO", "0") == "1"


# ─────────────────────────────────────────────────────────────────────────────
# Async engine + session factory
# ─────────────────────────────────────────────────────────────────────────────
engine = create_async_engine(
    DATABASE_URL,
    echo=DB_ECHO,
    pool_size=20,          # connection pool size
    max_overflow=10,       # extra connections nếu pool full
    pool_pre_ping=True,    # health check trước khi dùng connection
    pool_recycle=3600,     # recycle connection sau 1h tránh stale
)

AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,  # objects vẫn usable sau commit
    autoflush=False,
)


# ─────────────────────────────────────────────────────────────────────────────
# FastAPI dependency để inject session
# ─────────────────────────────────────────────────────────────────────────────
async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """
    Dependency injection cho FastAPI endpoints.

    Usage:
        @app.get("/items")
        async def get_items(db: AsyncSession = Depends(get_db)):
            result = await db.execute(select(Item))
            return result.scalars().all()
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


# ─────────────────────────────────────────────────────────────────────────────
# DDL helpers — chạy 1 lần để tạo tables
# ─────────────────────────────────────────────────────────────────────────────
async def init_db() -> None:
    """Tạo tables (chỉ dùng cho dev/test). Production dùng Alembic migration."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("✓ Database initialized")


async def drop_db() -> None:
    """⚠ Drop tất cả tables. CHỈ DÙNG TRONG TEST."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    print("✓ Database dropped")
