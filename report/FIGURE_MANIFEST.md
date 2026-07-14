# FIGURE MANIFEST — ánh xạ Hình ↔ file ↔ trạng thái

Tất cả hình đã gom vào `report/figures/`. ✅ = có sẵn (dùng được) · ⏳ = cần train/infer.

| Hình | File | Nguồn sinh | Trạng thái |
|---|---|---|---|
| 3.1 Phân bố real/fake | `figures/fig_3_1_distribution.png` | `report_prepare/mt04_dataset_distribution.py` | ✅ |
| 3.2 Cặp real/fake + DCT | `figures/fig_3_2_preprocess_realfake.png` | `report_prepare/mt07_freq_panel.py` | ✅ |
| 3.3 Training curve B4 | `figures/fig_3_3_train_b4.png` | `report_prepare/mt09_training_curves.py` (log thật) | ✅ |
| 3.4 Training curve naive | `figures/fig_3_4_train_naive.png` | mt09 (log thật) | ✅ |
| 3.5 Training curve Row1 | `figures/fig_3_5_train_row1.png` | mt09 (log thật) | ✅ |
| 3.6 Training curve Row2 | — | — | ⏳ cần train Row2 |
| 3.7 ROC | `figures/fig_3_7_roc.png` | `mt_plotly_report.py` → chrome PNG | ✅ |
| 3.8 PR curve | `figures/fig_3_8_pr_curve.png` | `viz_out/naive_local/pr_curve.png` | ✅ |
| 3.9 Confusion matrix | `figures/fig_3_9_confusion.png` | `report_prepare/mt02_confusion_matrix.py` | ✅ |
| 3.10 t-SNE | `figures/fig_3_10_tsne.png` | `viz_out/naive_local/tsne.png` | ✅ |
| 3.11 Frequency | `figures/fig_3_11_frequency.png` | `report_prepare/mt07_freq_panel.py` | ✅ |
| 3.12 Grad-CAM | `figures/fig_3_12_gradcam.png` | `viz_out/naive_local/gradcam.png` | ✅ |
| 3.13 Gate alpha | `figures/fig_3_13_gate_alpha.png` | `viz_out/naive_local/gate_alpha.png` | ✅ |
| 3.14 Demo REAL | — | `tools/infer.py` | ⏳ cần chạy infer trên checkpoint |
| 3.15 Demo FAKE | — | `tools/infer.py` | ⏳ cần chạy infer trên checkpoint |

**Tái tạo toàn bộ (không train):**
```
cd DeepfakeBench/report_prepare && bash run_quickwins.sh
python3 mt07_freq_panel.py && python3 mt_plotly_report.py
# rồi gom vào report/figures/ (xem lệnh trong git log commit này)
```
