"""storage.py — S3 artifact storage cho bằng chứng Grad-CAM (Phase 2 runbook).

Lưu heatmap vào s3://<bucket>/tenants/<tenant_id>/detections/<request_id>_heatmap.jpg,
DB chỉ giữ S3 KEY (cột detections.heatmap_url); URL presigned sinh lúc đọc (hết hạn 1h)
để bucket giữ nguyên Block-all-public-access. S3_BUCKET trống -> mọi hàm no-op, app chạy như cũ.
"""
import base64
import logging
from functools import lru_cache
from typing import Optional

from app.config import get_settings

settings = get_settings()
log = logging.getLogger("deepguard.storage")

PRESIGN_EXPIRES = 3600  # giây


def enabled() -> bool:
    return bool(settings.S3_BUCKET)


@lru_cache
def _client():
    import boto3  # import muộn: môi trường không bật S3 thì không cần boto3
    return boto3.client("s3", region_name=settings.S3_REGION)


def upload_heatmap(tenant_id, request_id, heatmap_data_url: Optional[str]) -> Optional[str]:
    """Upload Grad-CAM (base64 data URL từ serving) -> trả về S3 key, lỗi/tắt -> None.

    Không raise: S3 là phụ trợ, hỏng S3 không được chặn flow detect.
    """
    if not enabled() or not heatmap_data_url:
        return None
    try:
        header, b64 = heatmap_data_url.split(",", 1)
        data = base64.b64decode(b64)
        ext, ctype = ("png", "image/png") if "image/png" in header else ("jpg", "image/jpeg")
        key = f"tenants/{tenant_id}/detections/{request_id}_heatmap.{ext}"
        _client().put_object(Bucket=settings.S3_BUCKET, Key=key, Body=data, ContentType=ctype)
        return key
    except Exception as exc:
        log.warning("S3 upload heatmap failed: %s", exc)
        return None


_EXT_BY_CTYPE = {
    "image/jpeg": "jpg", "image/jpg": "jpg", "image/png": "png",
    "image/webp": "webp", "video/mp4": "mp4", "video/quicktime": "mov",
}


def upload_media(tenant_id, request_id, data: Optional[bytes],
                 content_type: str = "image/jpeg", kind: str = "input") -> Optional[str]:
    """Lưu media GỐC đã upload (ảnh/video input) lên S3 -> trả về S3 key, lỗi/tắt -> None.

    Key: tenants/<tenant_id>/detections/<request_id>_<kind>.<ext>. Không raise (S3 là phụ trợ).
    Phục vụ audit eKYC: mỗi phán quyết có file đầu vào lưu lại để rà soát sau.
    """
    if not enabled() or not data:
        return None
    try:
        ext = _EXT_BY_CTYPE.get(content_type, "bin")
        key = f"tenants/{tenant_id}/detections/{request_id}_{kind}.{ext}"
        _client().put_object(Bucket=settings.S3_BUCKET, Key=key, Body=data, ContentType=content_type)
        return key
    except Exception as exc:
        log.warning("S3 upload media failed: %s", exc)
        return None


def presigned_url(key: Optional[str], expires: int = PRESIGN_EXPIRES) -> Optional[str]:
    """S3 key -> presigned GET URL. Key dạng http(s) (legacy) trả nguyên; tắt S3 -> None."""
    if not key:
        return None
    if key.startswith("http"):
        return key
    if not enabled():
        return None
    try:
        return _client().generate_presigned_url(
            "get_object",
            Params={"Bucket": settings.S3_BUCKET, "Key": key},
            ExpiresIn=expires,
        )
    except Exception as exc:
        log.warning("S3 presign failed: %s", exc)
        return None
