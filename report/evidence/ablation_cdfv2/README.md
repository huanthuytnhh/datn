# EVIDENCE BUNDLE — bảng ablation Celeb-DF-v2 (gom 2026-06-10)

Mọi con số trong `report/_en_v2/TABLE_PROTOCOL_3MODELS.md` truy được về các file trong folder này.
Integrity: `md5sums.txt`. Nguồn gốc: HF repo `huanthuytnhh/deepfake` (đường dẫn gốc ghi dưới) +
2 file cross-check local. KHÔNG file nào được sửa nội dung — chỉ copy + đổi tên cho dễ đọc.

## logs/ — per-epoch training log (nuôi cột top-3-avg · last-epoch · mean±std · best)
Parse: dòng `dataset: Celeb-DF-v2 ... testing-metric, auc: ... video_auc: ...` (21 event/run).

| File | Nguồn HF gốc (`huanthuytnhh/deepfake`) |
|---|---|
| `b4.training.log` | `runs/naive-20260605-233339/logs/logs__training__efficientnetb4_2026-06-05-10-44-13__training.log` |
| `sfdct.training.log` | `runs/naive-20260605-233339/logs/logs__training__efficientnetb4_sfdct_2026-06-05-15-48-33__training.log` |
| `row1.training.log` | `runs/improved-20260606-010618/row1_sfdct_s1024/row1_sfdct_s1024.train.log` |
| `fix1.training.log` | `runs/fix-20260606-060937/fix1_sign_droplow1_s1024/fix1_sign_droplow1_s1024.train.log` |
| `fix2.training.log` | `runs/fix-20260606-060937/fix2_fca_s1024/fix2_fca_s1024.train.log` |
| (HFF R1/R3 log) | ❌ CHƯA CÓ — chỉ còn trên vast box `/workspace/{r1,r3}.log` + `logs/training/efficientnetb4_hff_2*/training.log` |

## pickles/<model>/ — best-checkpoint metrics (nuôi cột best · video-best · video-CI95 · paired Δ)
`metric_dict_best.pickle` = {acc,auc,eer,ap,**pred**,**label**,video_auc} của LẦN TEST BEST (bị ghi đè
mỗi best mới → không chứa lịch sử). `data_dict_test.pickle` = {image: 16420 frame path, label} CÙNG THỨ TỰ
với pred → ghép 2 file = tính được video-AUC + bootstrap CI cấp video (518 video) không cần GPU.
Đã kiểm chứng alignment: video-AUC tái tính khớp giá trị trong pickle 4 chữ số ở cả 7 model.

| Folder | Nguồn HF gốc |
|---|---|
| `b4/` | `runs/naive-20260605-233339/b4/ckpt/` |
| `sfdct/` | `runs/naive-20260605-233339/sfdct_naive/ckpt/` |
| `row1/` | `runs/improved-20260606-010618/row1_sfdct_s1024/ckpt/test/Celeb-DF-v2/` |
| `fix1/` | `runs/fix-20260606-060937/fix1_sign_droplow1_s1024/ckpt/test/Celeb-DF-v2/` |
| `fix2/` | `runs/fix-20260606-060937/fix2_fca_s1024/ckpt/test/Celeb-DF-v2/` |
| `hff_r3/` | `runs/20260610-003615/ckpt/efficientnetb4_hff_2026-06-09-17-30-34/` |
| `hff_r1/` | `runs/20260610-003615/ckpt/efficientnetb4_hff_2026-06-09-21-06-21/` |

⚠️ KHÔNG copy vào đây (và KHÔNG được dùng): `runs/20260605-230747/ckpt/efficientnetb4/` — bản sao
byte-identical của SFDCT (md5 metric pickle `a2f9475f...` trùng nhau, ckpt 73,112,459 bytes = size SFDCT).
⚠️ Loại khỏi bảng: HFF run `17-25-02` (smoke, n=2071 frame).

## summaries/ — bằng chứng run bỏ dở / số best in từ uploader
`improved-160241/-161956_cdfv2_summary.txt`: row1/row2 `<none>` (2 lần thử fail — Row2 chưa từng hoàn thành).
`fix-060937_cdfv2_summary.txt`: fix1=0.75229, fix2=0.75232 (khớp pickle).

## crosscheck/ — nguồn độc lập đối chiếu
`{b4,naive,row1}_local_results.json` (từ `DeepfakeBench/viz_out/*/results.json`, re-eval local 2026-06-06
bằng eval_and_viz.py): frame_auc khớp best-log 4 chữ số (B4 0.74974 · SFDCT 0.75724 · Row1 0.73327)
+ tpr@fpr=5% + video_auc. `liveness_b4_metrics.json`: AUC 0.9829/ACER 6.85%/τ 0.8743 (CHƯA kiểm chứng
split — chưa được trích vào báo cáo cho tới khi kiểm xong).

## Cách tái lập số (1 lệnh, thuần numpy — sklearn local hỏng ABI)
Xem script trong hội thoại 2026-06-10 (parse log regex + Mann-Whitney AUC + bootstrap video n=2000 seed=42)
— sẽ đóng băng thành `report_prepare/mt10_ablation_full.py` ở bước tiếp theo.
