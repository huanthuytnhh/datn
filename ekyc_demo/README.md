# DeepGuard eKYC — Streamlit Dev Demo

Màn mô phỏng một dev đang tích hợp API eKYC của DeepGuard. Nhập API key, chọn mode,
upload ảnh khuôn mặt → gọi API thật và xem kết quả + response JSON + cURL tương đương.

## Mode
- **Liveness** → `POST /v1/detect/liveness` (B4-liveness, ảnh tĩnh).
- **Deepfake** → `POST /v1/detect/image` (SFDCT).
- **eKYC (cascade)** → chạy liveness trước; nếu **LIVE** mới chạy deepfake, rồi tổng hợp verdict
  PASS / REVIEW / FAIL. Nếu liveness = SPOOF → chặn ngay (không tốn compute deepfake).

## API key
Ưu tiên **ô nhập trên sidebar**; nếu trống → lấy `DEEPGUARD_API_KEY` trong `.env`.
Tạo key trong app DeepGuard: đăng nhập → **API Keys** → tạo key.

## Chạy
```bash
cd ekyc_demo
cp .env.example .env          # (tùy chọn) điền key + URL
pip install -r requirements.txt
streamlit run app.py          # chạy ở http://localhost:8601
```
Yêu cầu backend DeepGuard đang chạy (mặc định `http://localhost:8000` — xem `START_DEV_STACK.md`).

> ⚠️ **Quan trọng:** demo chạy ở **cổng 8601** (đã ghim trong `.streamlit/config.toml`). **KHÔNG** chạy
> `streamlit run app.py` ở thư mục khác — streamlit mặc định lấy cổng **8501**, đúng cổng serving deepfake
> SFDCT → đẩy serving rớt → web app báo "heatmap không khả dụng" và điểm deepfake thành mock.

## Ghi chú
- Liveness & Deepfake **chỉ nhận ảnh** (liveness không có endpoint video).
- `spoof_type` là heuristic tham khảo, không phải quyết định cuối.
- `threshold` để trống = dùng mặc định của server; tick "Tự đặt threshold" để override.
