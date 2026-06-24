"""Doc test — quy tắc cộng quota khi lưu liveness theo nguồn auth.

Playground (JWT, dashboard) lưu LivenessCheck với api_key_id=None -> KHÔNG cộng
quota của api_keys (không có key để cộng). API-key (/v1) -> CÓ cộng quota.
Mirror rule trong _save_liveness; không gọi DB (đúng style repo).
"""
import uuid
from typing import Optional


def should_charge_apikey_quota(api_key_id: Optional[uuid.UUID]) -> bool:
    """True nếu cần UPDATE api_keys.quota_used (chỉ khi có api_key_id)."""
    return api_key_id is not None


def test_playground_jwt_skips_quota():
    assert should_charge_apikey_quota(None) is False


def test_apikey_charges_quota():
    assert should_charge_apikey_quota(uuid.uuid4()) is True
