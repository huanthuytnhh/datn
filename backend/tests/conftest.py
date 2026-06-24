"""Pytest fixtures / setup chạy TRƯỚC khi import app.

`app.config.Settings` đọc SECRET_KEY từ env/.env. Khi chạy test trong môi
trường không có .env (CI), ta đặt sẵn một giá trị fallback để import
`app.core.security` không vỡ. `setdefault` -> KHÔNG ghi đè SECRET_KEY thật
nếu môi trường (hoặc .env đã load) đã cung cấp.
"""

import os

os.environ.setdefault("SECRET_KEY", "test-secret")
