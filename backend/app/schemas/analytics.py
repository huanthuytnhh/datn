from pydantic import BaseModel


class AnalyticsOverview(BaseModel):
    total_requests: int
    fake_detected: int
    real_detected: int
    uncertain: int
    fake_rate: float
    avg_latency_ms: int
    p95_latency_ms: int
    days: int


class UsageInfo(BaseModel):
    monthly_quota: int
    current_usage: int
    remaining: int
    usage_percent: float
