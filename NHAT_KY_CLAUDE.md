# NHẬT KÝ LÀM VIỆC — Claude

> Mỗi dòng = 1 việc đã làm, kèm commit/file nếu có. Mới nhất ở TRÊN CÙNG.
> Mục đích: chủ repo (Thành) kiểm soát được Claude đã đụng vào đâu, làm gì.

## 2026-06-12

- Tạo file nhật ký này; quy ước từ nay mỗi việc xong ghi 1 dòng
- Tích hợp Phase 2 AWS: S3 lưu heatmap evidence + CloudWatch log forwarder — commit `98d909b` (storage.py, request_logging.py, push_to_cloudwatch.py + wire 3 router)
- Smoke test ONNX export model SFDCT: PASS (vá `index_add_`→matmul, parity 4e-07, forward nhanh 1.69x) — CHƯA tích hợp vào serving, chờ quyết định
- Tư vấn GPU: đổi sang g4dn.xlarge theo giờ demo (~$0.53/h), cần xin quota G-instance trước
- Đo latency production sau deploy: 4850ms ảnh mới / 22ms cache / 2277ms tắt heatmap
- Tăng tốc inference: warmup model + cache theo sha256 + toggle heatmap có tác dụng thật — commit `4a7eb30`; push bị mạng công ty chặn → Thành push thủ công
- Fix "Phổ tần số không khả dụng": backend thiếu OpenCV → thêm `opencv-python-headless` vào requirements + pin `bcrypt==4.0.1`
- Fix Spatial hiện 0.0% giả: backend trả null, FE ẩn thanh điểm
- PHÁT HIỆN chưa sửa: slider Threshold ở Playground gửi lên nhưng backend bỏ qua (verdict luôn dùng MODEL_THRESHOLD trong .env)
- Hướng dẫn cài SSL Let's Encrypt cho deepguard.ddns.net + rebuild FE với API URL https + sửa CORS
- Fix seed DB rỗng trên EC2: lỗi bcrypt 5.x vs passlib → `pip install bcrypt==4.0.1` rồi `seed.py --full` (5 account demo / Password123!)
- Hướng dẫn xem table Postgres: psql trong Docker hoặc SSH tunnel + DBeaver (không mở port 5432)
- Tư vấn DB: giữ Postgres Docker trên EC2, không dùng RDS; thêm cron pg_dump 2h sáng giữ 7 bản
- Hướng dẫn cài aaPanel trên EC2 (port 7800, mở SG theo My IP, KHÔNG cài LNMP để khỏi sập nginx)
- Chẩn đoán 4 service systemd sau reboot EC2: đều active, web + API healthy từ ngoài
