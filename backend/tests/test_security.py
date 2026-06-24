"""Test phần bảo mật: băm mật khẩu + JWT (app.core.security).

conftest.py đã đặt SECRET_KEY fallback TRƯỚC khi import nên các import dưới
đây an toàn cả khi môi trường không có .env.
"""

from app.core.security import (
    create_access_token,
    decode_token,
    hash_password,
    verify_password,
)


def test_hash_password_not_plaintext():
    password = "s3cret-pass"
    hashed = hash_password(password)
    # Hash KHÔNG được là plaintext, và phải khác chuỗi gốc.
    assert hashed != password
    assert password not in hashed
    assert len(hashed) > len(password)


def test_verify_password_correct():
    password = "correct horse battery staple"
    hashed = hash_password(password)
    assert verify_password(password, hashed) is True


def test_verify_password_wrong():
    hashed = hash_password("right-password")
    assert verify_password("wrong-password", hashed) is False


def test_create_and_decode_token_roundtrip():
    token = create_access_token({"sub": "user-123"})
    payload = decode_token(token)
    assert payload is not None
    assert payload.get("sub") == "user-123"


def test_decode_token_garbage_returns_none():
    assert decode_token("rác-không-phải-jwt") is None
