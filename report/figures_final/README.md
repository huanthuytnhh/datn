# FIGURES_FINAL — bộ hình báo cáo cuối (sinh 2026-06-10)

Generator: `DeepfakeBench/report_prepare/mt12_report_figures.py` (1 lệnh tái lập).
PNG = nhúng docx · HTML = plotly interactive (mở browser, demo/phụ lục).
**Mọi số từ dữ liệu thật**: `report/evidence/ablation_cdfv2/` (log+pickle) · `viz_out/*` (npz + ảnh GPU
đã render) · `mt10/mt11` CSV. KHÔNG có số mô phỏng.

| File | Loại | Nguồn số | Caption đề xuất (Bảng/Hình trong report) |
|---|---|---|---|
| `01_training/loss_curves` | PNG+HTML | 5 training.log (evidence) | Train loss theo iteration — 5 run, log thật |
| `01_training/auc_per_epoch` | PNG+HTML | 5 log + console-capture R3† | CDFv2 AUC theo epoch — dao động ±0.05 (động lực bảng đa-giao-thức 3.5b) |
| `02_evaluation/roc_cdfv2` | PNG+HTML | 7 pickle best-ckpt | ROC 7 model + vạch FPR≤5% eKYC (Fig 3.7 mở rộng) |
| `02_evaluation/pr_cdfv2` | PNG+HTML | 7 pickle | Precision–Recall, fake=positive (Fig 3.8 mở rộng) |
| `02_evaluation/confusion_grid_tau5` | PNG | 7 pickle + τ@5% (mt11) | Confusion 7 model tại ngưỡng eKYC riêng từng model |
| `03_data_features/class_distribution_ffpp` | PNG+HTML | FaceForensics++.json | Phân bố video FF++ theo nhóm (train/test) |
| `03_data_features/class_distribution_cdfv2` | PNG | label npz | Lệch lớp CDFv2 test (66% fake) — lý do dùng AP |
| `03_data_features/tsne_{B4,SFDCT,Row1}` | PNG | viz_out (GPU render 06/06) | t-SNE feature fused — real vs fake (Fig 3.10) |
| `03_data_features/gradcam_*` / `frequency_*` | PNG | viz_out | Grad-CAM (Fig 3.12) · phổ log|DCT| real vs fake (Fig 3.x) |
| `04_comparison/ablation_bar_multiprotocol` | PNG+HTML | mt10 csv | Bar 7 model × 4 giao thức + vạch floor B4 (đối chứng Bảng 3.5b) |
| `04_comparison/benchmark_heatmap` | PNG+HTML | mt10+mt11 | Heatmap model × metric (AUC/video-AUC/TPR@5/vTPR@5/vTPR@10) |
| `04_comparison/event_variance_box` | PNG | 5 log | Box 21 test-event/run — THAY multi-seed (ghi chú trung thực: phân tán trong-run, không phải giữa-seed) |
| `05_misc/score_histograms` | PNG | 7 pickle | Phân bố P(fake) real vs fake + vạch τ@5% — cho thấy vì sao TPR thấp |
| `05_misc/video_score_scatter` | PNG+HTML | pickle SFDCT | Score cấp video vs nhãn thật (518 video) — prediction vs ground truth |

## grids/ — 4 dashboard lưới 2×3 (6 đồ thị/hình, style HarmonySeeker, generator `mt13_grid_figures.py`)
| File | 6 panel |
|---|---|
| `grid1_training_dynamics` | (a) train loss · (b) AUC/epoch + R3† · (c) save_best đóng-băng-tại-đỉnh (minh hoạ test-peeking!) · (d) box 21-event · (e) thứ hạng qua 4 giao thức · (f) best vs mean |
| `grid2_evaluation` | (a) ROC + vạch 5% · (b) zoom vùng eKYC FPR≤12% · (c) PR · (d) confusion SFDCT@τ · (e) histogram score + τ · (f) TPR frame/video/review-band 7 model |
| `grid3_data_features` | (a) FF++ groups · (b) lệch lớp CDFv2 (log) · (c) t-SNE · (d) Grad-CAM · (e) phổ log\|DCT\| · (f) video score vs nhãn |
| `grid4_comparison` | (a) bar 4-giao-thức · (b) forest video-AUC+CI · (c) forest paired Δ vs B4 (CI chứa 0) · (d) heatmap · (e) TPR theo mức FPR · (f) so leaderboard (*bản DeepfakeBench tái hiện) |

Ghi chú: † R3 console capture (11 điểm cuối-epoch, xem evidence README). LR-schedule KHÔNG vẽ:
lr cố định 2e-4, không scheduler (Table 3.3) — vẽ là thừa. Box-plot across-SEED không tồn tại
(single-seed); box theo test-event là thay thế trung thực, caption phải nói rõ.
Cột FF++ (in-dataset) sẽ bổ sung vào heatmap sau khi vast eval xong (mt12 chạy lại là tự cập nhật
nếu thêm nguồn).
