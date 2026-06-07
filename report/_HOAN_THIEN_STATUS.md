# Trạng thái hoàn thiện báo cáo (branch `dev-thanhln-report-finalize`)

Mục tiêu: hoàn thiện **toàn bộ phần KHÔNG cần train**, từ số liệu/hình THẬT, không bịa.

## ✅ ĐÃ HOÀN THIỆN (điền từ data/config thật)
- **Hình 3.1–3.13** nhúng ảnh thật vào `report/figures/` (xem `FIGURE_MANIFEST.md`).
- **Bảng 2.8** AUC Row1 = 0.7333 (Row2 đang train).
- **Bảng 2.10** trọng số loss (từ config: λ_cons=1.0, λ_sc=0.3, m=0.3).
- **Bảng 2.11 / 3.0d** siêu tham số (epoch 10, Adam lr 2e-4, wd 5e-4, no scheduler, seed 1024, batch 32).
- **Mục 2.6.3** label smoothing/callbacks (từ config: cross_entropy, no smoothing, best test-AUC).
- **Bảng 1.3 / 3.1** số frame (FF++ ≈159.626; CDFv2 test 16.420 = 5.620 real + 10.800 fake).
- **Bảng 3.2** AUC cross-dataset CDFv2: B4 0.7497 · naive 0.7572 (+0.0075) · Row1 0.7333 (−0.0164) · Row2 (train).
- **Bảng 3.4** ngưỡng eKYC (naive): τ=0.9514, FPR=0.0500, TPR=0.2298, ACC 0.476, F1 0.366.
- **Nhận xét hình 3.7–3.13** (ROC/PR, confusion TN5339/FP281/FN8318/TP2482, t-SNE, frequency, Grad-CAM, gate) + nhận xét hội tụ — đều từ số thật.
- **Bảng 5.1** Row1 = 0.7333.
- Ngành/Chuyên ngành.

## ⏳ CÒN LẠI — KHÔNG điền được nếu không train / không bịa (≈125 placeholder)
1. **Cần TRAIN/INFER:** Row2 (mọi nơi), Bảng 3.3 per-knob (S1..S5 đơn lẻ), cột FF++ in-dataset AUC, thời gian train (Bảng 3.0c), Hình 3.6 (Row2 curve), Hình 3.14/3.15 (demo `infer.py`). P0-① "DCT sửa lỗi spatial" cần **re-eval 2 model trên cùng loader** (`.npz` hiện không cùng thứ tự mẫu — xem `report_prepare/outputs/p0_dct_corrects_spatial.md`).
2. **Thông tin cá nhân/hành chính:** Lớp, ngày giao/hoàn thành, nhận xét + điểm GVHD/phản biện, chữ ký → sinh viên/GV điền.
3. **Sơ đồ kiến trúc (cần vẽ tay):** Hình 1.1–1.5, 2.1–2.4, logo (use case, kiến trúc tổng thể, MBConv, zigzag, gated fusion) → vẽ bằng draw.io/PowerPoint.
4. **Citation cần VERIFY (`[[KIỂM TRA]]`):** số hiệu Thông tư 17/2024/TT-NHNN, ref FreqDebias/FDFL/SRM/ReZero, số leaderboard DeepfakeBench → tra cứu, không bịa.
5. **Phần cứng/phần mềm máy thuê:** GPU thuê, VRAM, RAM, PyTorch/CUDA/cuDNN version, DFDC subset → điền theo máy thực tế.

## ⚠️ NHẮC LIÊM CHÍNH (tránh lỗi của đồ án tham khảo)
- **Phải CREDIT nguồn** trong báo cáo: framework **DeepfakeBench**, các paper được adapt (SPSL, SRM, FreqDebias, FcaNet, FDFL), backbone EfficientNet. Hoàn thiện danh mục tham khảo + ghi rõ "xây trên DeepfakeBench".
- Mọi số "đang huấn luyện" giữ nguyên nhãn, KHÔNG điền số giả.

## Tái tạo (không train)
```
cd DeepfakeBench/report_prepare && bash run_quickwins.sh
python3 mt07_freq_panel.py && python3 mt07_per_manip.py && python3 mt_plotly_report.py && python3 mt07_plotly.py
python3 mt_dct_corrects_spatial.py
```
Lộ trình phần còn lại: xem `DeepfakeBench/report_prepare/TUTOR_GUIDE.md`.
