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
    MODEL_VERSION: str = "SFDCT · B4+block-DCT (cdfv2 0.7572)"  # canonical — khớp serving + báo cáo
    MODEL_THRESHOLD: float = 0.35
    MOCK_ML: bool = True
    # Khi set -> backend gọi microservice SFDCT (DeepfakeBench) thay vì model nội bộ.
    # Vd: SFDCT_INFER_URL=http://127.0.0.1:8501
    SFDCT_INFER_URL: str = ""
    # Liveness microservice (DeepfakeBench liveness_server.py :8502)
    LIVENESS_INFER_URL: str = ""
    # Ngưỡng quyết định LIVE/SPOOF (tùy chỉnh qua .env). P(live) < THRESHOLD => SPOOF.
    # Mặc định demo 0.125 (12.5%): nới rộng để mặt thật OOD/webcam không bị gắn nhầm spoof.
    # (Điểm dev-EER chuẩn của model là 0.8743 — dùng cho báo cáo, chặt hơn nhiều.)
    LIVENESS_THRESHOLD: float = 0.125
    # Vùng "không chắc chắn" quanh ngưỡng: |score-threshold| <= MARGIN => UNCERTAIN.
    # 0.0 = cắt nhị phân sạch tại ngưỡng (không có UNCERTAIN).
    LIVENESS_MARGIN: float = 0.0

    # Video: số frame TỐI ĐA gửi đi suy luận, lấy ĐỀU trên toàn clip (chặn video dài chạy quá lâu).
    # Mỗi frame qua serving ~0.5-1s (GPU) -> 8 frame vài giây, vẫn đại diện toàn video.
    VIDEO_MAX_FRAMES: int = 8

    CORS_ORIGINS: str = "http://localhost:3000,http://localhost:5173"

    # S3 artifact storage (heatmap evidence + media gốc) — để trống là tắt, app chạy như cũ.
    # Credentials lấy từ env chuẩn AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY (boto3 tự đọc).
    S3_BUCKET: str = ""
    S3_REGION: str = "ap-southeast-1"

    # CloudWatch custom metrics (Detections / ProbFake / latency / errors).
    # CW_METRIC_NAMESPACE trống -> tắt, app chạy như cũ.
    CW_METRIC_NAMESPACE: str = ""
    CW_REGION: str = "ap-southeast-1"

    # Optional custom AWS endpoint (e.g. LocalStack http://localhost:4566) so S3 and
    # CloudWatch can be exercised locally without a real AWS account. Empty -> real AWS.
    AWS_ENDPOINT_URL: str = ""

    @property
    def cors_origins_list(self) -> List[str]:
        return [o.strip() for o in self.CORS_ORIGINS.split(",") if o.strip()]


_DEFAULT_SECRET_KEY = "dev-secret-key-change-in-production"


@lru_cache
def get_settings() -> Settings:
    settings = Settings()
    if settings.SECRET_KEY == _DEFAULT_SECRET_KEY:
        print(
            "[WARN] SECRET_KEY đang dùng giá trị mặc định — "
            "đặt SECRET_KEY trong .env trước khi deploy"
        )
    return settings
