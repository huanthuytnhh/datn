# DANH SÁCH FIGURE CẦN CÓ — PL04_B_RuotThuyetMinh

> Tổng **41 figure** tài liệu tham chiếu (Ch1: 4 · Ch2: 10 · Ch3: 27).
> Cột **Loại** = cách tạo: `Sơ đồ` (vẽ/mermaid) · `Khái niệm` (minh hoạ lý thuyết) ·
> `Đồ thị` (generate từ số liệu thật) · `Bảng text` (torchinfo) · `Ảnh mẫu` (grid ảnh) · `Screenshot`.
> Cột **Nguồn** = lấy ở đâu để tạo đúng.

## Chương 1 — Cơ sở lý thuyết (4)

| Figure | Caption | Cần thể hiện | Loại | Nguồn |
|---|---|---|---|---|
| 1.1 | REST API Architecture | Client ↔ REST server: request (method/URL/headers/body) → response (status/headers/JSON) | Sơ đồ | tự vẽ |
| 1.2 | The MBConv block | Khối MBConv: expand 1×1 → depthwise conv → SE → project 1×1, có residual | Khái niệm | tự vẽ |
| 1.3 | Zigzag scan and the 16 frequency bands | Block DCT 8×8, đường zigzag, 64 hệ số gom 16 band DC→cao | Khái niệm | tự vẽ |
| 1.4 | Gated cross-attention fusion (zero-init gate) | Spatial=query, freq=key/value → context → gate α (init 0): fused = x + α·context | Khái niệm | tự vẽ |

## Chương 2 — Phân tích & thiết kế (10)

| Figure | Caption | Cần thể hiện | Loại | Nguồn |
|---|---|---|---|---|
| 2.1 | Overview use case diagram | 6 actor (Anon/Viewer/Dev/Compliance/Admin/Sysadmin + eKYC client) × 8 use case | Sơ đồ | mermaid trong DOCX |
| 2.2 | System architecture | 5 khối: Frontend / Backend / Model service / Monitoring / Alerting | Sơ đồ | tự vẽ |
| 2.3 | Activity diagram — deepfake image detection | Auth → quota → crop face → model → map band → render | Sơ đồ | mermaid trong DOCX |
| 2.4 | Activity diagram — eKYC cascade | Liveness trước → nếu live → deepfake → kết luận | Sơ đồ | mermaid trong DOCX |
| 2.5 | Deepfake detection sequence diagram | User→FE→BE→Model service (crop, predict, band, trả về) | Sơ đồ | mermaid trong DOCX |
| 2.6 | eKYC cascade sequence diagram | Customer backend→API→Model service: liveness rồi deepfake | Sơ đồ | mermaid trong DOCX |
| 2.7 | Overall architecture of SFDCT | B4 (spatial) + nhánh block-DCT (YCbCr→8×8 DCT→log→16 band) → gated cross-attention → head | Sơ đồ | tự vẽ |
| 2.8 | Overall architecture of SFDCT-HFF | B4 + high-pass residual (zero low band + inverse DCT) → multi-scale conv → residual-guided attn → gated fusion | Sơ đồ | tự vẽ |
| 2.9 | Architecture of B4-liveness baseline | B4 spatial-only → head nhị phân → spoof prob | Sơ đồ | tự vẽ |
| 2.10 | Architecture of B4+DCT-liveness | B4 + nhánh block-DCT → gated fusion → head nhị phân | Sơ đồ | tự vẽ |

## Chương 3 — Triển khai & đánh giá (27)

| Figure | Caption | Cần thể hiện | Loại | Nguồn |
|---|---|---|---|---|
| 3.1 | Real/fake distribution (train/test) | Bar đếm real/fake FF++ (train) & CDFv2 (test) | Đồ thị | evidence label |
| 3.2 | Real/fake pair + frequency spectrum | 1 mặt real + 1 fake (đã crop) + phổ log\|DCT\| của chúng | Ảnh mẫu | viz_out |
| 3.3 | Mean frequency energy by band | Năng lượng trung bình 16 band real vs fake + hiệu | Đồ thị | viz_out |
| 3.4 | Model summary of baseline (B4) | Bảng torchinfo: layer + param B4 | Bảng text | torchinfo |
| 3.5 | Training curve of baseline (B4) | Train loss + test AUC theo epoch | Đồ thị | log B4 |
| 3.6 | Model summary of SFDCT | Bảng torchinfo SFDCT | Bảng text | torchinfo |
| 3.7 | Training curve of SFDCT | Loss + AUC theo epoch | Đồ thị | log naive |
| 3.8 | Model summary of SFDCT-HFF (full) | Bảng torchinfo SFDCT-HFF | Bảng text | torchinfo |
| 3.9 | Training curve of SFDCT-HFF (HFF-R3) | AUC theo epoch (chỉ có 11 điểm console-capture) | Đồ thị | hff_r3 console capture |
| 3.10 | ROC curves on test set | ROC các model + vạch FPR≤5% | Đồ thị | pickle best-ckpt |
| 3.11 | Precision-recall curves | PR trên CDFv2 (lệch lớp) | Đồ thị | pickle |
| 3.12 | Confusion matrix at eKYC threshold | Ma trận nhầm lẫn ở τ@FPR5% (5339/281/8318/2482) | Đồ thị | pickle + τ |
| 3.13 | t-SNE 2D projection of features | Chiếu 2D feature, tô màu real/fake | Đồ thị | viz_out |
| 3.14 | Grad-CAM heat map (1 mẫu test) | Overlay Grad-CAM lên 1 mặt test | Ảnh mẫu | viz_out |
| 3.15 | Example predictions on test faces | Lưới mặt test + prob + verdict vs nhãn thật | Ảnh mẫu | inference test |
| 3.16 | Gate value distribution | Phân bố α sau train (đa số ~0) | Đồ thị | checkpoint gate |
| 3.17 | Example live/spoof faces | Lưới mặt live & spoof (LCC-FASD) sau crop | Ảnh mẫu | LCC-FASD |
| 3.18 | Model summary of B4-liveness | Bảng torchinfo B4-liveness | Bảng text | torchinfo |
| 3.19 | Training curve of B4-liveness | Loss/AUC theo epoch | Đồ thị | log liveness b4 (chưa có per-epoch) |
| 3.20 | ROC + score dist of B4-liveness | ROC + histogram live/spoof | Đồ thị | score array liveness (chưa có) |
| 3.21 | Model summary of B4+DCT-liveness | Bảng torchinfo B4+DCT-liveness | Bảng text | torchinfo |
| 3.22 | Training curve of B4+DCT-liveness | Loss/AUC theo epoch | Đồ thị | log liveness b4dct (chưa có per-epoch) |
| 3.23 | ROC + score dist of B4+DCT-liveness | ROC + histogram | Đồ thị | score array (chưa có) |
| 3.24 | Deployment diagram | 1 EC2, reverse proxy + 4 container (FE/BE/Model/DB) trên private net | Sơ đồ | mermaid trong DOCX |
| 3.25 | Home screen | Ảnh chụp trang chủ app | Screenshot | demo đang chạy |
| 3.26 | Deepfake-detection result screen | Ảnh chụp màn kết quả: risk score + band + heatmap + phổ + history | Screenshot | demo đang chạy |
| 3.27 | Liveness-detection screen | Ảnh chụp màn liveness | Screenshot | demo đang chạy |

---

## Ghi chú nhanh để quyết

- **Tự vẽ được ngay (Sơ đồ + Khái niệm)**: 1.1, 1.2, 1.3, 1.4, 2.2, 2.7, 2.8, 2.9, 2.10 — và 2.1/2.3/2.4/2.5/2.6/3.24 đã có sẵn mã mermaid trong DOCX.
- **Generate lại từ số liệu thật (Đồ thị)**: 3.1, 3.3, 3.5, 3.7, 3.9, 3.10, 3.11, 3.12, 3.13, 3.16 — có evidence/pickle/log để dựng đúng.
- **Bảng text (không nên làm "hình")**: 3.4, 3.6, 3.8, 3.18, 3.21 — nên để code block torchinfo.
- **Chưa có dữ liệu để dựng**: 3.19/3.20/3.22/3.23 (liveness chỉ có số cuối) · 3.2/3.14/3.15/3.17 (cần ảnh mẫu từ viz_out / dataset).
- **Cần demo chạy**: 3.25/3.26/3.27 (chụp màn).
