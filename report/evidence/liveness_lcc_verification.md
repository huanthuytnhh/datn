# KIỂM CHỨNG SỐ LIVENESS — VERDICT: PASS, ĐƯỢC PHÉP VÀO BÁO CÁO (2026-06-10)

Nghi vấn ban đầu: AUC 0.9829 trên LCC-FASD quá cao so mốc văn liệu (kprokofi MobileNetV3:
AUC 0.921/ACER 16.3%) → README_liveness tự cảnh báo "AUC ~0.99 thường = leak split". Đã kiểm 4 lớp:

## 4 lớp kiểm chứng (script đóng băng: `DeepfakeBench/liveness/verify_liveness_eval.py`)

| # | Phép kiểm | Kết quả |
|---|---|---|
| 1 | **Code split** — `train_liveness.py:84-93` | dùng folder OFFICIAL `*_training/_development/_evaluation`; `assert train≠test`; guard dev≡test; ngưỡng fix @EER trên dev "không nhìn test" ✅ |
| 2 | **Đếm split** | eval = 7580 ảnh (314 live + 7266 spoof) = khớp CHÍNH XÁC official + `metrics.json n_test` ✅ |
| 3 | **Hash-leak** (md5 toàn bộ ảnh) | Bộ LCC-FASD OFFICIAL tự có **48 ảnh train∩eval + 25 dev∩eval** (~0.96% eval) — lỗi dataset gốc, không phải loader (vd `REDMI3_id123_s0_75.png` ≡ `real_279.png`) ⚠️ |
| 4 | **Re-eval local** (GPU 3050, 110s) | FULL: AUC **0.9829** APCER 0.0288 BPCER 0.1083 ACER **0.0685** — **tái lập metrics.json đến 4 chữ số trên máy khác** ✅. **LOẠI 73 ảnh leak**: AUC **0.9858** (tăng nhẹ!) ACER 0.0704 → **leak KHÔNG thổi số** ✅ |

**Kết luận:** AUC 0.9829 / ACER 6.85% là số THẬT, tái lập được, không nhờ leak. Vượt mốc MobileNetV3
(0.921) hợp lý vì B4 19M tham số + ImageNet pretrain. Ghi chú trung thực khi dùng: (a) đây là
**within-dataset** (train+eval cùng LCC-FASD, chưa cross-dataset FAS); (b) bộ official có 48 ảnh trùng
train∩eval — đã kiểm và chứng minh không ảnh hưởng.

## Ablation liveness (HF `runs/liveness-20260606-100514/`, cùng protocol, thr@dev-EER riêng từng model)

| Model | AUC | ACER | APCER | BPCER |
|---|---|---|---|---|
| **B4 baseline** (đang serve :8502) | **0.9829** | **0.0685** | 0.0286 | 0.1083 |
| B4 + block-DCT | 0.9776 | 0.0754 | 0.0425 | 0.1083 |

→ Nhánh block-DCT **không cải thiện FAS** — NHẤT QUÁN với kết quả deepfake (SFDCT ≈ B4): câu chuyện
"block-DCT không thêm tín hiệu generalizable" giữ vững trên CẢ HAI bài toán. Đây là negative result
có giá trị, viết thẳng vào chương liveness.
(Run `liveness-20260606-094114` là smoke hỏng — AUC 0.37, undertrained — LOẠI, không trích.)

## Nguồn
- ckpt + metrics: `DeepfakeBench/serving/liveness_b4/{ckpt_best.pth,metrics.json}` (= HF `runs/liveness-20260606-100514/b4/`)
- b4dct: HF `runs/liveness-20260606-100514/b4dct/metrics_liveness.json`
- data: HF dataset `huanthuytnhh/deepfake-data/lcc-fasd.zip` (4.96GB) → `liveness/_data/LCC_FASD/`
- tái lập: `python3 liveness/verify_liveness_eval.py` (assert tự gãy nếu không tái lập / leak thổi số)
