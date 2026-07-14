"""metrics.py — CloudWatch custom metrics (Phase 3).

Bắn metric mỗi lần detect: số lượt, phán quyết, xác suất fake, độ trễ, lỗi suy luận.
CW_METRIC_NAMESPACE trống -> mọi hàm no-op, app chạy như cũ. KHÔNG raise (metric là phụ trợ,
hỏng CloudWatch không được chặn flow detect). Credentials lấy từ env AWS chuẩn (boto3 tự đọc).
"""
import logging
from functools import lru_cache
from typing import Optional

from app.config import get_settings

settings = get_settings()
log = logging.getLogger("deepguard.metrics")


def enabled() -> bool:
    return bool(settings.CW_METRIC_NAMESPACE)


@lru_cache
def _client():
    import boto3  # import muộn: môi trường không bật CloudWatch thì không cần boto3
    kwargs = {"region_name": settings.CW_REGION}
    if settings.AWS_ENDPOINT_URL:  # LocalStack / custom endpoint for local testing
        kwargs["endpoint_url"] = settings.AWS_ENDPOINT_URL
    return boto3.client("cloudwatch", **kwargs)


def emit_detection(verdict: str, prob_fake: Optional[float], latency_ms: Optional[float],
                   source: str = "api", error: bool = False) -> None:
    """Bắn metric cho 1 lượt detect (ảnh/video). source = 'api' | 'playground'."""
    if not enabled():
        return
    try:
        dim_src = [{"Name": "Source", "Value": source}]
        data = [
            {"MetricName": "Detections", "Value": 1, "Unit": "Count", "Dimensions": dim_src},
            {"MetricName": "Detections", "Value": 1, "Unit": "Count",
             "Dimensions": dim_src + [{"Name": "Verdict", "Value": str(verdict)}]},
        ]
        if latency_ms is not None:
            data.append({"MetricName": "ProcessingLatency", "Value": float(latency_ms),
                         "Unit": "Milliseconds", "Dimensions": dim_src})
        if prob_fake is not None:
            data.append({"MetricName": "ProbFake", "Value": float(prob_fake),
                         "Unit": "None", "Dimensions": dim_src})
        if error:
            data.append({"MetricName": "InferenceErrors", "Value": 1, "Unit": "Count", "Dimensions": dim_src})
        _client().put_metric_data(Namespace=settings.CW_METRIC_NAMESPACE, MetricData=data)
    except Exception as exc:
        log.warning("CloudWatch put_metric_data failed: %s", exc)
