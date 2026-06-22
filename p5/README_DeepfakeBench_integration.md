# ECSF-Fast trên DeepfakeBench — Hướng dẫn tích hợp & kế hoạch

Train **kiến trúc P5 (ECSF-Fast)** ngay trong **protocol DeepfakeBench** để số liệu so trực tiếp với leaderboard. SFCL-HCMF = nguồn cảm hứng kiến trúc / baseline.

---

## 1. Đặt file vào đâu

```
DeepfakeBench/
└── training/
    ├── detectors/
    │   ├── ecsf_detector.py     ← copy vào đây
    │   └── ecsf_core.py         ← copy vào đây (cạnh detector)
    └── config/detector/
        └── ecsf.yaml            ← copy vào đây
```
Đăng ký detector: thêm `from .ecsf_detector import ECSFDetector` vào `training/detectors/__init__.py` (theo cách các detector khác được import).

Chạy:
```bash
# train (FF++ c23) + test cross-dataset
python training/train.py --detector_path ./training/config/detector/ecsf.yaml
# test riêng
python training/test.py --detector_path ./training/config/detector/ecsf.yaml \
    --test_dataset "Celeb-DF-v2" "DFDCP" --weights_path ./training/weights/ecsf_best.pth
```

---

## 2. Quy tắc giữ tính so sánh (RẤT QUAN TRỌNG)

DeepfakeBench so được vì mọi method dùng **cùng** data + eval. Vì vậy:

**GIỮ NGUYÊN (không đổi ở bảng chính):** train FF++ c23, `frame_num=32`, resolution 256, optimizer/epoch chuẩn, frame-level AUC, các test set chuẩn.

**Lấy "hiệu quả" của P5 từ những thứ KHÔNG phá protocol (đều ở phía model):**
- *Kiến trúc nhẹ* — LFBA + fusion 1 tầng thay SBCM+CNN-F+SIDA+FAAE+HCMA → ít params/FLOPs.
- *Đóng băng B4 (PEFT)* — chỉ ~**1.37M** trainable (head) + vài block cuối → train nhanh, ít VRAM.
- *AMP* (precision) + *EMA* (trung bình trọng số) → tăng tốc/chất lượng, không đổi data/eval.

**KHÔNG dùng ở bảng chính (vì lệch protocol):** smart frame sampling thay 32-frame, one-cycle LR tùy biến, epoch khác chuẩn. Nếu muốn, để **một ablation riêng** "off-protocol efficiency", ghi nhãn tách bạch.

---

## 3. Baseline so sánh — chiến lược

Hai tầng baseline, đều **cùng protocol DeepfakeBench**:

**(A) Built-in của DeepfakeBench** (số có sẵn / chạy lại được, KHÔNG tốn công tái hiện):
EfficientNet-B4, Xception (naive); **F3-Net, SPSL, SRM** (frequency — đối thủ trực tiếp của ECSF).
→ Đây là nhóm so chính: ECSF vs các frequency-detector, cùng protocol, công bằng tuyệt đối.

**(B) SFCL-HCMF (tùy chọn, tốn compute):** port gói tái hiện `sfcl_hcmf/` thành một detector DeepfakeBench nữa để có dòng SFCL *cùng protocol*. Nếu ngân sách chật → **trích dẫn** SFCL như SOTA cùng hướng, không bắt buộc tái hiện trong DeepfakeBench.

> Khuyến nghị: bắt buộc (A); làm (B) nếu còn ngân sách. Câu chuyện "ECSF sánh ngang các frequency-detector chuẩn với ít trainable params hơn nhiều" đã đủ mạnh và sòng phẳng.

---

## 4. Bảng kết quả kỳ vọng (frame-level AUC, train FF++ c23)

Số tham chiếu của DeepfakeBench (xấp xỉ):

| Method | Loại | FF++ c23 | CDF-v2 | DFDCP | Trainable params |
|---|---|---|---|---|---|
| Xception | naive | ~0.964 | ~0.737 | ~0.737 | ~20M |
| EfficientNet-B4 | naive | ~0.957 | ~0.749 | — | ~19M |
| F3-Net | freq | ~0.964 | ~0.735 | ~0.735 | ~20M+ |
| SPSL | freq | ~0.961 | **~0.765** | ~0.741 | ~20M+ |
| SRM | freq | ~0.958 | ~0.755 | — | ~20M+ |
| **ECSF-Fast (của bạn)** | freq nhẹ | *~0.95–0.97* | *~0.72–0.77* | *~0.72–0.76* | **~1.4–4M** |

Ô *nghiêng* = chạy thật mới điền. **Cột ăn tiền** là **Trainable params**: ECSF ~1.4–4M so với ~19–20M, mà AUC nằm cùng dải.

> Tuyên bố trung thực: *"ECSF-Fast đạt AUC ngang nhóm frequency-detector chuẩn (F3-Net/SPSL/SRM) dưới cùng protocol DeepfakeBench, với trainable params ~1/5–1/10 và máy tần số nhẹ hơn nhiều; train nhanh hơn nhờ đóng băng backbone."* KHÔNG hứa thắng AUC tuyệt đối.

---

## 5. Ngân sách & lưu trữ ($50) — thực tế hơn protocol rút gọn

Protocol DeepfakeBench nặng hơn: FF++ c23 ~**115k frame** × epoch.

**Compute (RTX 4090 spot ~$0.30/h):**
| Hạng mục | Run | Giờ/run (ước lượng) | Giờ |
|---|---|---|---|
| ECSF-Fast (đóng băng B4, nhẹ) | 2 seed | ~6–10h | ~16h |
| Ablation (−EMA, −LFBA-att, −fusion) | 3 | ~6–8h | ~21h |
| (tùy chọn) SFCL port | 1 | ~12–18h | ~15h |
| Test cross-dataset (inference) | — | — | ~3h |

→ Không tính SFCL: ~40h → **~$12**. Có SFCL: ~55h → **~$17**. Vẫn dưới $50 về compute.

**⚠️ Lưu trữ là rủi ro lớn hơn compute.** Dataset DeepfakeBench (FF++, Celeb-DF, DFDC, DFDCP, DFD) rất nặng (LMDB hàng chục–trăm GB). Trên vast.ai **storage tính phí theo giờ**. Giảm thiểu:
- Chỉ train FF++ c23 + test **CDF-v2 + DFDCP** (hai bộ được trích dẫn nhiều nhất) → đủ cho bảng so.
- Tải qua script của DeepfakeBench, xoá ngay khi xong; dùng instance có ổ đủ lớn nhưng thuê ngắn.
- Celeb-DF + DFDCP cần **form xin quyền** → nộp ngày 1.

---

## 6. Đóng góp (định khung cho báo cáo)

1. **Thiết kế tần số hiệu quả** (LFBA + gated fusion 1 tầng) đạt ngang các frequency-detector chuẩn của DeepfakeBench với trainable params ~1/5–1/10 — *chứng minh dưới protocol chuẩn, sòng phẳng*.
2. **Recipe huấn luyện hiệu quả** (đóng băng B4 + AMP + EMA) — train nhanh hơn, không phá protocol.
3. **Threshold calibration theo Thông tư 17** (FPR ≤ 5%) — đóng góp domain (chạy trên đầu ra ECSF).
4. **Robustness eKYC** + tích hợp pipeline (liveness EAR/head-pose + face matching ArcFace) — chương hệ thống.
5. (tùy chọn) Tái hiện SFCL-HCMF trong DeepfakeBench.

KHÔNG claim: ý tưởng block-wise DCT / spatial-frequency / cross-attention (thuộc SFCL, F3-Net, Frank et al.).

---

## 7. Việc kỹ thuật cần kiểm khi cắm vào DeepfakeBench

- **Ảnh đã chuẩn hoá**: dataloader trả ảnh đã normalize (ImageNet mean/std). ECSF de-normalize lại trước DCT (đã set trong `ecsf.yaml` qua `denorm_mean/std`). Nếu config dùng mean/std khác, sửa cho khớp.
- **`backbone.features()`** của `efficientnetb4` trong DeepfakeBench trả feature map → ECSF đã GAP để lấy S (1792). Kiểm chiều thực tế; nếu khác 1792, sửa `spatial_feat_dim`.
- **Tên backbone**: xác nhận key đúng là `efficientnetb4` trong `networks/__init__.py` của bản DeepfakeBench bạn dùng; chỉnh `backbone_name` nếu khác.
- **EMA/AMP**: nếu trainer bản bạn dùng chưa hỗ trợ sẵn cờ `amp/use_ema`, cần thêm vài dòng vào vòng train (hoặc bỏ, vẫn chạy được — chỉ mất phần tăng tốc/chất lượng).
- **`unfreeze_last_blocks`**: heuristic theo tên layer; kiểm log "trainable params ~= X M" in ra khi khởi tạo để chắc đã freeze đúng.

---

## 8. ĐIỂM CẦN BẠN DUYỆT (⚙️)

1. Test set: chỉ **CDF-v2 + DFDCP** (rẻ) hay thêm DFDC/DFD (đắt storage)?
2. Có **port SFCL** vào DeepfakeBench (dòng baseline cùng protocol) hay chỉ trích dẫn?
3. `unfreeze_last_blocks`: 2 (mặc định) hay 0 (đóng băng hoàn toàn, nhanh nhất) / 3 (nếu AUC thiếu)?
4. Giữ EMA + AMP không (nếu trainer bản bạn chưa hỗ trợ, mình hướng dẫn thêm)?
5. Xác nhận trụ = **trainable params ↓ + train nhanh + AUC ngang nhóm frequency-detector**, domain = Thông tư 17?
