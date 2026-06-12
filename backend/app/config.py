from functools import lru_cache
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/deepguard"
    DB_ECHO: bool = False

    SECRET_KEY: str = "dev-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    MODEL_PATH: str = ""
    MODEL_VERSION: str = "b4-baseline-v1"
    MODEL_THRESHOLD: float = 0.35
    MOCK_ML: bool = True
    # Khi set -> backend gọi microservice SFDCT (DeepfakeBench) thay vì model nội bộ.
    # Vd: SFDCT_INFER_URL=http://127.0.0.1:8501
    SFDCT_INFER_URL: str = ""
    # Liveness microservice (DeepfakeBench liveness_server.py :8502)
    LIVENESS_INFER_URL: str = ""
    # threshold@dev_eer từ metrics_liveness.json (B4, AUC=0.9829)
    LIVENESS_THRESHOLD: float = 0.8743

    CORS_ORIGINS: str = "http://localhost:3000,http://localhost:5173"

    # S3 artifact storage (heatmap evidence) — để trống là tắt, app chạy như cũ.
    # Credentials lấy từ env chuẩn AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY (boto3 tự đọc).
    S3_BUCKET: str = ""
    S3_REGION: str = "ap-southeast-1"

    @property
    def cors_origins_list(self) -> List[str]:
        return [o.strip() for o in self.CORS_ORIGINS.split(",") if o.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
