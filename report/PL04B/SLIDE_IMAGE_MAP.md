# Bản đồ chèn hình cho slide bảo vệ — SFDCT (eKYC)

> ĐÃ THỰC HIỆN (file mới `report/SFDCT_defense_with_figures.pptx`, 20 slide, KHÔNG ghi đè bản gốc).
> Lý do điều chỉnh so với kế hoạch: deck gốc tự dựng "hình" bằng khối chữ/bảng native nên các slide
> phương pháp (5, 7, 8, 10) gần như kín, không nhét hình lớn mà còn đọc được. Cách xử lý:
> - Chèn hình vào dải trống đáy các slide có chỗ sạch: slide 9 (gate α), slide 13 (ROC + đường train),
>   slide 15 (Grad-CAM).
> - Thêm 3 slide hình chuyên dụng (khớp giao diện: thanh trang trí, tag chương, tiêu đề, rule) cho các
>   hình kiến trúc lớn cần đọc rõ: SAU slide 7 = SFDCT architecture + frequency band; SAU slide 8 =
>   zigzag→48-D; SAU slide 10 = SFDCT-HFF + liveness + HFF residual.
> - Script tái lập: `report/PL04B/insert_slide_figures.py`. Đã render LibreOffice kiểm tra từng slide.
> - LƯU Ý: chèn 3 slide làm số trang in sẵn (text box) lệch vị trí vật lý. Nếu giữ 3 slide mới thì nên
>   đánh số lại; nếu coi chúng là slide phụ/backup có thể xóa thì số gốc vẫn đúng.
> - Slide 5/12 (deployment, distribution) chưa chèn vì chỗ trống xấu/giá trị phụ; báo nếu muốn thêm.


File slide: `SFDCT_ A Frequency-Aware Deepfake Detector for Banking eKYC.pptx` (17 slide).
Kho hình: `report/figures/`. Đường dẫn dưới đây tính từ gốc repo.

Mặc định đã chọn (anh đổi được bất cứ lúc nào):
- Cách giao: bảng map + hướng dẫn chèn tay (chưa động vào file pptx).
- Mật độ: vừa phải, mỗi slide nội dung 1 hình chủ lực, slide quan trọng thêm 1 hình bằng chứng.
- Slide 9: dùng bản tiếng Anh `fig_3_13_gate_alpha`, bỏ diagram nhãn tiếng Việt.

Hiện trạng: chỉ slide 4 và slide 8 đã có hình nhúng sẵn. 15 slide còn lại trống.

---

## Map từng slide

### Slide 1 — Title
Không chèn. Slide tiêu đề nên sạch. (Tùy chọn: teaser mờ `report/figures/fig_sfdct_architecture_final.png` ở nền.)

### Slide 2 — Defense Overview (mục lục)
Không chèn.

### Slide 3 / 6 / 11 / 14 — Divider chương
Không chèn.

### Slide 4 — Problem and Motivation
Đã có sẵn: Real vs Deepfake face. Giữ nguyên, đủ ý "gần như giống hệt mắt người".
- Tùy chọn thêm (nếu muốn nhấn "đối thủ luôn dùng công cụ mới"): `report/figures/fig_ff_manipulations.png` đặt nhỏ phía dưới.

### Slide 5 — Objectives and Scope (hệ thống 2 lớp)
- Chính: `report/figures/fig_4_deployment.png` — minh họa Obj 4 (triển khai AWS EC2: Internet → reverse proxy → frontend/backend/model/DB).
- Phụ: `report/figures/fig_2_1_usecase.png` — minh họa Obj 1 (web platform, các role).
Đặt deployment bên phải khối "Four Objectives", usecase thu nhỏ bên dưới.

### Slide 6 — Divider Chương 2
Không chèn.

### Slide 7 — Two-Stream SFDCT + Frequency Hypothesis  ⭐ hình chủ lực
- Chính: `report/figures/fig_sfdct_architecture_final.png` — sơ đồ 2 nhánh đầy đủ (spatial B4 + frequency block-DCT → cross-attention → gated fusion → head). Khớp đúng 4 khối "01-04" trên slide.
- Bằng chứng giả thuyết tần số: `report/figures/fig_3_11_frequency.png` — năng lượng DCT theo band, real vs fake (FF++ và Celeb-DF). Cho thấy dấu vết nằm ở band mid/high.
Đặt kiến trúc to chiếm 60% chiều ngang, frequency góc dưới phải.

### Slide 8 — Block-DCT to 48-Dim Descriptor
Đã có sẵn: sơ đồ channel-wise 2D-DCT (time → frequency domain).
- Thêm: `report/figures/fig_1_3_zigzag_detailed.png` — đúng pipeline mô tả trên slide: zigzag scan → gom 16 band (floor(rank/4)) → mean per band × 3 kênh = 48-dim. Đây là hình giải thích bước 5-6 trong "Descriptor Construction Pipeline".
Đặt hình channel-DCT trên, zigzag-detailed dưới (hoặc cạnh bảng band).

### Slide 9 — Gated Cross-Attention  ⭐
- Chính: `report/figures/fig_3_13_gate_alpha.png` — phân phối gate α sau train. Khớp ĐÚNG số trên slide: 1792 channels, mean +0.0000, std 0.0013, max|α| 0.0232. Đây vừa là minh họa "gate khởi tạo 0" vừa là bằng chứng "đóng góp tần số nhỏ và chọn lọc".
- Lưu ý: hình diagram cơ chế đẹp (`fig_1_4_gate_fusion.png`) đang gắn nhãn tiếng Việt, lệch với deck tiếng Anh nên KHÔNG dùng. Nếu cần diagram cơ chế, yêu cầu tôi vẽ lại bản tiếng Anh.

### Slide 10 — SFDCT-HFF Variant + Liveness  ⭐ (slide nhiều ý)
- Chính: `report/figures/fig_sfdct_hff_architect_final.png` — kiến trúc HFF (high-pass residual → HF-stream Conv-BN-ReLU → RSAttention → gated fusion).
- Liveness: `report/figures/fig_2_b4dct_liveness.png` — sơ đồ tái dùng B4 + block-DCT cho liveness.
- Tùy chọn (nếu chọn mật độ Đậm): `report/figures/fig_hff_residual.png` — ảnh residual cao tần real vs fake, minh họa "frequency carrier" của HFF.

### Slide 11 — Divider Chương 3
Không chèn.

### Slide 12 — Cross-Dataset Protocol
Slide dạng bảng, có thể để trống.
- Tùy chọn: `report/figures/fig_3_1_distribution.png` — phân phối điểm số, đặt nhỏ cạnh bảng giao thức.

### Slide 13 — Cross-Dataset Results + Honest Reading  ⭐ hình chủ lực
- Chính: `report/figures/fig_3_7_roc.png` — ROC Celeb-DF-v2, chứa đủ cả 3 AUC (B4 0.7497, SFDCT 0.7572, HFF 0.7695) VÀ đường FPR=5% (điểm vận hành eKYC, đúng thông điệp "bắt ~23%"). Một hình thay cho cả bảng kết quả.
- Tùy chọn thêm 1 trong 2:
  - `report/figures/fig_3_9_train_hff_r3.png` — đường train HFF đỉnh 0.7695 so với floor B4 0.7497.
  - `report/figures/fig_3_10_tsne.png` — t-SNE đặc trưng fused (cho thấy real/fake còn trộn lẫn → khớp "honest reading, cải thiện nhỏ").

### Slide 14 — Divider Chương 4
Không chèn.

### Slide 15 — Conclusion and Contributions
- `report/figures/fig_3_12_gradcam.png` — input fake + Grad-CAM heatmap. Minh họa Contribution 03 (hệ thống giải thích được, chạy CPU). Đặt cạnh khối "Summary Numbers".

### Slide 16 — Limitations and Development Directions
Không chèn (slide chữ dày).

### Slide 17 — Thank You
Không chèn.

---

## Tổng hợp danh sách hình cần chuẩn bị

| Slide | File | Vai trò |
|---|---|---|
| 5 | `fig_4_deployment.png` | chính |
| 5 | `fig_2_1_usecase.png` | phụ |
| 7 | `fig_sfdct_architecture_final.png` | chính |
| 7 | `fig_3_11_frequency.png` | bằng chứng |
| 8 | `fig_1_3_zigzag_detailed.png` | bổ sung (đã có 1 hình) |
| 9 | `fig_3_13_gate_alpha.png` | chính |
| 10 | `fig_sfdct_hff_architect_final.png` | chính |
| 10 | `fig_2_b4dct_liveness.png` | liveness |
| 10 | `fig_hff_residual.png` | tùy chọn (mật độ Đậm) |
| 13 | `fig_3_7_roc.png` | chính |
| 13 | `fig_3_9_train_hff_r3.png` hoặc `fig_3_10_tsne.png` | tùy chọn |
| 15 | `fig_3_12_gradcam.png` | chính |

Tùy chọn nhẹ: slide 4 thêm `fig_ff_manipulations.png`, slide 12 thêm `fig_3_1_distribution.png`.

---

## Decision log

- Cách giao = hướng dẫn chèn tay: an toàn layout nhất, không phá vị trí khối chữ sẵn có trên slide. Tự chèn bằng python-pptx khả thi nhưng dễ lệch bố cục.
- Mật độ = vừa phải: tránh slide quá rậm khi bảo vệ.
- Slide 9 bỏ `fig_1_4_gate_fusion.png`: nhãn tiếng Việt lệch deck tiếng Anh. Thay bằng `fig_3_13_gate_alpha.png` (tiếng Anh, lại khớp đúng số liệu).
- Ưu tiên hình "đa năng": `fig_3_7_roc` (gộp 3 AUC + điểm FPR 5%) và `fig_sfdct_architecture_final` (gộp cả 4 bước của slide 7) để 1 hình gánh nhiều ý.
- Divider/title/agenda không chèn hình để giữ nhịp trình bày.
