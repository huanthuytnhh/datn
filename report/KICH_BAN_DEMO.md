# Kịch bản DEMO DeepGuard — bảo vệ DATN

> Mục tiêu demo (nói 1 câu trước khi bấm): **"Em demo hệ thống eKYC chạy thật — đầu ra giải thích được, có
> liveness chặn trước, lưu bằng chứng để audit. Đây là đóng góp hệ thống, đứng độc lập với việc nhánh tần số
> giúp nhiều hay ít."**
> Thời lượng: **lõi 90 giây** (bắt buộc chạy được) → mở rộng tối đa **2.5–3 phút** nếu còn giờ.
> Nguyên tắc vàng: **dùng Sample Presets có sẵn** (không upload ảnh lạ lúc bảo vệ), **chạy stack & warm-up TRƯỚC
> khi vào phòng**, và **luôn có video quay màn hình + screenshot dự phòng**.

---

## A. CHUẨN BỊ TRƯỚC (pre-flight) — làm xong trước khi hội đồng vào

1. **Khởi động full stack** theo `START_DEV_STACK.md` (1 terminal, chạy khối lệnh tuần tự). Đợi đến khi in:
   `:5432 :9000 :8501 :8502 :8000 :3000 UP` và `{"status":"ok"}`.
2. **Kiểm cổng nhanh:** `for p in 8000 8501 8502 3000; do ss -ltn | grep -q ":$p " && echo ":$p UP" || echo ":$p DOWN"; done`
3. **Đăng nhập sẵn** ở `http://localhost:3000` — tài khoản tenant: `admin@vietbank.vn` / `Password123!`.
   (Các tài khoản khác: `sysadmin@deepguard.vn` = platform, `dev@vietbank.vn` = developer, `compliance@vietbank.vn`,
   `viewer@vietbank.vn`.)
4. **WARM-UP MODEL (quan trọng):** vào **API Playground**, bấm 1 sample bất kỳ → **Phân Tích** một lần.
   Lần infer đầu bị cold-start chậm; warm rồi thì lúc demo ra kết quả ~1 giây.
5. **TỔNG DUYỆT đúng đường demo** và **ghi nhớ sample nào ra verdict rõ ràng**: model là *tầng sàng lọc*
   (~23% catch @ FPR 5% ở frame-level), nên **không phải ảnh giả nào cũng bị gắn cờ mạnh**. Chọn sẵn 1 sample fake
   mà model gắn cờ chắc + 1 sample real điểm thấp, và nhớ vị trí **Threshold** cho ra demo đẹp.
6. **Quay sẵn video màn hình** toàn bộ flow (1 lần chạy ngon) + chụp 4–5 **screenshot** màn kết quả. Để ở desktop.
   Nếu mạng/stack chết lúc bảo vệ → mở video, không bấm live.
7. Phóng to trình duyệt (Ctrl+ +) cho hội đồng nhìn rõ; ẩn bookmark bar; tắt thông báo OS.

**Phương án dự phòng theo mức hỏng:**
- Stack ok nhưng infer lỗi → mở màn **Lịch sử phát hiện** (kết quả đã lưu) thay cho chạy mới.
- FE/BE chết → mở **video quay sẵn**.
- Không có máy/mạng → dùng **screenshot trong slide** (`screenshot_demo_image_detect.png`).

---

## B. KỊCH BẢN CHÍNH (đường bấm + lời nói + chỉ vào đâu)

### ⏱ 0:00–0:10 — Đăng nhập (multi-tenant, RBAC)
- **Bấm:** (đã đăng nhập sẵn) hoặc đăng nhập `admin@vietbank.vn`.
- **Chỉ vào:** tên tenant + role ở góc, sidebar đổi theo quyền.
- **Nói:** *"Đây là nền tảng eKYC đa người thuê. Em đăng nhập với vai trò admin của tenant VietBank — mỗi vai trò
  thấy đúng phần được phân quyền."*

### ⏱ 0:10–1:00 — API Playground = phát hiện deepfake (LÕI demo, màn quan trọng nhất)
- **Bấm:** sidebar → **API Playground**. Ở cột trái, vùng **Sample Presets** → chọn **SWAP FAKE** → bấm **Phân Tích**.
- **Khi kết quả hiện, chỉ lần lượt 4 thành phần giải thích** (đây là điểm bán hàng của đồ án):
  1. **Risk score `/100` + verdict** — *"con số rủi ro kèm mức kết luận, không phải hộp đen."*
  2. **DCT Heatmap / Grad-CAM** — *"bản đồ nhiệt tô đúng vùng nghi bị chỉnh — người duyệt thấy VÌ SAO hệ thống cảnh báo."*
  3. **Phổ tần số** — *"phổ tần của ảnh, gắn với giả thuyết tần số của đồ án."*
  4. **Response JSON + Recent runs** — *"trả về có cấu trúc để tích hợp; mỗi lần chạy được ghi lại."*
- **Tương phản:** chọn preset **ẢNH THẬT** → **Phân Tích** → điểm thấp.
  - **Nói:** *"Cùng một pipeline, ảnh thật cho điểm thấp, ảnh giả-swap cho điểm cao và chỉ ra vùng nghi."*
- **Threshold (nếu còn giờ):** kéo thanh **Threshold** giữa *Nhạy (Real)* ↔ *Chặt (Fake)*.
  - **Nói:** *"Trong eKYC em chốt ngưỡng ở mức giữ tỉ lệ từ chối nhầm khách thật ≤ 5%. Đây là điểm vận hành, không phải con số tuyệt đối."*

### ⏱ 1:00–1:30 — Liveness Check (bộ lọc cascade chạy TRƯỚC)
- **Bấm:** sidebar → **Liveness Check** → chọn ảnh chân dung spoof (ảnh in/chụp màn hình) → nút kiểm tra.
- **Chỉ vào:** **Phát hiện Spoof Attack** + **Liveness Score** + **Loại giả mạo (spoof)** + **Latency / Model**.
- **Nói:** *"Liveness là bộ lọc rẻ chạy TRƯỚC trong cascade: ảnh phát lại hay ảnh in bị chặn ngay, trước khi tốn
  compute cho deepfake. Detector này mạnh — AUC 0.98 trên LCC-FASD."*

### ⏱ 1:30–2:10 — Lịch sử + Chi tiết (bằng chứng & audit)
- **Bấm:** sidebar → **Lịch sử phát hiện** → click 1 bản ghi → mở **Chi tiết phát hiện** (Detail).
- **Chỉ vào:** **Forensic Visualizer** (GRAD-CAM + DCT Heatmap Overlay), **Score breakdown · Explainable AI**,
  **Request metadata** (User Agent, **Image SHA-256**), ô **ghi chú review**.
- **Nói:** *"Mỗi phán quyết được lưu làm bằng chứng — có hash ảnh, metadata, và chỗ cho compliance ghi chú. Bằng
  chứng lưu trên S3, log đẩy sang CloudWatch — đủ để audit."*

### ⏱ 2:10–2:40 — (tùy chọn) API Keys / Docs — góc nhìn nhà tích hợp
- **Bấm:** sidebar → **API Keys** (hoặc **API Docs**).
- **Nói:** *"Khách hàng doanh nghiệp lấy API key ở đây để backend của họ gọi endpoint phát hiện — đúng mô hình SaaS đa người thuê."*

### ⏱ kết — chốt 1 câu, quay lại slide
- **Nói:** *"Hệ thống chạy thật, đầu ra giải thích được, có liveness chặn trước và lưu vết để audit. Em quay lại phần kết luận."*

---

## C. Bản đồ màn ↔ component code (để chỉnh nhanh nếu cần)
| Màn demo | Component | Sidebar |
|---|---|---|
| Phát hiện deepfake (ảnh) | `playground-page.tsx` | API Playground |
| Liveness | `liveness-page.tsx` | Liveness Check |
| Lịch sử | `history-page.tsx` | Lịch sử phát hiện |
| Chi tiết forensic | `detail-page.tsx` | (click 1 bản ghi) |
| Dashboard | `dashboard-page.tsx` | Dashboard |
| API keys / Docs | `apikeys-page.tsx` / `docs-page.tsx` | API Keys / API Docs |

Sample presets (đã wire sẵn, ảnh ở `frontend/public/samples/`): **ẢNH THẬT** `real_01.jpg` · **GAN FAKE** `fake_03.jpg` ·
**SWAP FAKE** `fake_01.jpg`.

---

## D. Câu hỏi hay gặp NGAY KHI demo (trả lời ngắn)
- **"Ảnh giả này sao điểm không cao tuyệt đối?"** → *"Đúng, model là tầng SÀNG LỌC ở mức frame; em chốt ngưỡng để
  ưu tiên không từ chối nhầm khách thật. Bảo vệ thật đến từ cascade: liveness + gộp video-level + người duyệt."*
- **"Chạy trên GPU à?"** → *"Không, toàn bộ chạy CPU ~1 giây/ảnh — đúng ràng buộc triển khai rẻ của đồ án."*
- **"Grad-CAM lấy từ đâu?"** → *"Từ chính nhánh spatial B4 của detector — bản đồ nhiệt là gradient lớp cuối, tô vùng đóng góp vào phán quyết."*
- **"Dữ liệu khách lưu ở đâu?"** → *"Bằng chứng trên S3 (dev là MinIO), tách theo tenant; log sang CloudWatch. Có hash ảnh để chống chối bỏ."*
- **"Có thật là real-time?"** → *"Ảnh ~1s; video thì rút khung 32 frame/clip rồi gộp điểm — không phải xử lý từng frame thời gian thực."*

---

## E. Checklist 30 giây trước khi bấm (đọc thầm)
- [ ] 6 cổng UP · `/health` ok · đã warm-up 1 lần
- [ ] đã đăng nhập `admin@vietbank.vn`
- [ ] đã nhớ sample fake + real cho verdict đẹp + vị trí Threshold
- [ ] video dự phòng + screenshot mở sẵn ở tab khác
- [ ] trình duyệt phóng to, tắt thông báo
