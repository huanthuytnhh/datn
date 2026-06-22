# Bảng ABLATION ĐẦY ĐỦ — Celeb-DF-v2 (train FF++ c23) — TÍNH TỪ LOG/PICKLE THẬT

## ✅ BẢNG TỔNG (7 ablation, cập nhật 2026-06-10)

| Model | top-3-avg | last-epoch | mean±std (21 ev.) | best | video-best | video-CI95 | paired Δ vs B4 (video) |
|---|---|---|---|---|---|---|---|
| B4 baseline | 0.7434 | 0.7063 | 0.7082±0.0219 | 0.7497 | 0.8203 | [0.781, 0.857] | — |
| SFDCT naive | 0.7507 | 0.7123 | 0.7140±0.0253 | 0.7572 | 0.8083 | [0.770, 0.847] | −0.011 [−0.044, +0.021] |
| Row1 (lever) | 0.7315 | 0.7046 | 0.7054±0.0188 | 0.7332 | 0.7869 | [0.744, 0.829] | **−0.033 [−0.067, +0.001]** ← cận biên XẤU hơn |
| Fix1 (sign+droplow1) | 0.7474 | 0.6775 | 0.7099±0.0250 | 0.7523 | 0.8121 | [0.774, 0.848] | −0.008 [−0.035, +0.019] |
| Fix2 (FcaNet) | 0.7494 | 0.6860 | 0.7149±0.0240 | 0.7523 | 0.8137 | [0.775, 0.851] | −0.006 [−0.037, +0.026] |
| HFF-R1 | ✗ mất | ✗ mất | ✗ mất | 0.7553 | 0.8146 | [0.774, 0.853] | −0.006 [−0.038, +0.026] |
| HFF-R3 | 0.7410† | 0.7335† | 0.7236±0.0183† | **0.7695** | **0.8269** | [0.788, 0.864] | **+0.007** [−0.022, +0.037] |

> † R3: khôi phục từ **console capture** (11 giá trị CUỐI-epoch, user dán từ terminal vast — file
> `evidence/ablation_cdfv2/logs/hff_r3.console_capture.txt`). KHÔNG so trực tiếp với cột của các model
> khác (21 event gồm cả giữa-epoch); best nửa-epoch 0.7695 không nằm trong dãy này. R1: per-epoch mất
> vĩnh viễn (vast destroy; `cmd_model` chỉ upload *.pth/*.pickle, pickle bị ghi đè không giữ lịch sử).
> Run bỏ dở (không vào bảng): `improved-20260605-160241/-161956` (row1/row2 `<none>`); Row2 chưa từng hoàn thành.
> HFF run `17-25-02` = smoke n=2071 → loại. Fix1/Fix2 best trùng 0.7523 là trùng hợp (0.75229 vs 0.75232).

**Đọc bảng (3 câu cho báo cáo):** (1) Điểm-ước-lượng frame-level: HFF-R3 cao nhất (0.7695, ≥ SPSL
leaderboard 0.7650 trên cơ sở best), SFDCT nhất quán trên B4 ở cả 4 giao thức. (2) Video-level paired:
KHÔNG biến thể nào tách khỏi B4 (mọi CI chứa 0); duy nhất Row1 cận-biên-xấu-hơn (−0.033, CI chạm 0)
= negative result rõ nhất. (3) Kết luận trung thực: các biến thể tương đương trong nhiễu đơn-seed →
đóng góp = floor≥B4 + giao thức đánh giá trung thực + phân tích đa-đại-lượng, không phải Δ AUC.

---

# (chi tiết bên dưới) Bảng kết quả đa-đại-lượng — Celeb-DF-v2 (train FF++ c23) — TÍNH TỪ LOG THẬT

> Nguồn: per-epoch `training.log` trên HF `huanthuytnhh/deepfake` (21 test event/run = 11 epoch × 2, trừ event đầu).
> Parse dòng `dataset: Celeb-DF-v2 ... testing-metric, auc: ... video_auc: ...` (số HIỆN TẠI mỗi lần test,
> KHÔNG phải dòng `| Celeb-DF-v2: auc= |` vốn là best-so-far bị đóng băng).
> Script: grep + numpy, xem hội thoại 2026-06-10. KHÔNG mô phỏng số.

## Frame-level AUC (CDFv2)

| Model | top-3-avg¹ | last-epoch | mean±std (21 events) | best (top-1)² |
|---|---|---|---|---|
| B4 baseline | 0.7434 | 0.7063 | 0.7082 ± 0.0219 | 0.7497 |
| SFDCT naive | **0.7507** | **0.7123** | **0.7140 ± 0.0253** | **0.7572** |
| Row1 (lever, âm tính) | 0.7315 | 0.7046 | 0.7054 ± 0.0188 | 0.7332 |

¹ top-3-avg = trung bình 3 AUC cao nhất qua các test event — ĐÚNG đại lượng DeepfakeBench paper báo cáo (so được với leaderboard: B4 0.7487, SPSL 0.7650, SRM 0.7552).
² best top-1 = đại lượng save_best lưu ckpt (lạc quan nhất, có test-peeking — disclose khi dùng).

## Video-level AUC (CDFv2)

| Model | top-3-avg | last-epoch | best |
|---|---|---|---|
| B4 baseline | 0.8030 | 0.7488 | 0.8203 |
| SFDCT naive | **0.8039** | **0.7621** | 0.8083 |
| Row1 | 0.7841 | 0.7471 | 0.7869 |

## HFF (3 ckpt trên HF `runs/20260610-003615/` — best-epoch từ metric_dict_best.pickle)

| Run | frame-AUC best | video-AUC best | Ghi chú |
|---|---|---|---|
| 2026-06-09-17-25-02 | 0.6880 | 0.7146 | **SMOKE/partial (n=2071 frame) — LOẠI khỏi bảng** |
| 2026-06-09-17-30-34 (**R3** full) | 0.7695 | **0.8269** | per-epoch log còn trên vast `/workspace/r3.log` — CẦN CỨU |
| 2026-06-09-21-06-21 (**R1** minimal) | 0.7553 | 0.8146 | per-epoch log còn trên vast `/workspace/r1.log` — CẦN CỨU |

## Phát hiện then chốt (dùng cho báo cáo + bảo vệ)

**Thứ hạng SFDCT > B4 > Row1 GIỮ NGUYÊN dưới CẢ BỐN cách đo** (top-3-avg / last-epoch /
mean±std / best): Δ(SFDCT−B4) = +0.0073 / +0.0060 / +0.0058 / +0.0075. Điểm ước lượng nhất quán
về hướng dù biên độ nhỏ hơn std (±0.022) → trình bày là "cải thiện nhỏ, nhất quán qua mọi giao thức
tổng hợp, chưa tách khỏi nhiễu đơn-seed" — KHÔNG claim significant, KHÔNG bị tố cherry-pick.

## Bootstrap CI cấp video (best checkpoint) — TÍNH TỪ PICKLE, KHÔNG GPU (2026-06-10)

> Phương pháp: `pred/label` từ `metric_dict_best.pickle` + frame path từ `data_dict_test.pickle`
> (cùng thứ tự — đã kiểm chứng: video-AUC tái tính khớp pickle 4 chữ số ✅). Video score = mean frame
> score theo folder (đúng get_video_metrics). Bootstrap resample 518 video, n=2000, seed=42, AUC thuần
> numpy (Mann-Whitney — sklearn local hỏng ABI).

| Model (best ckpt) | frame-AUC | video-AUC | video-CI95 |
|---|---|---|---|
| B4 baseline | 0.7497 | **0.8203** | [0.7816, 0.8580] |
| SFDCT naive | 0.7572 | 0.8083 | [0.7692, 0.8447] |
| HFF-R3 | **0.7695** | **0.8269** | [0.7898, 0.8629] |
| HFF-R1 | 0.7553 | 0.8146 | [0.7751, 0.8503] |

**Paired bootstrap Δ video-AUC (cùng 518 video, n=2000):** SFDCT−B4 = −0.0120 [−0.0443, +0.0215] ·
R3−B4 = +0.0066 [−0.0210, +0.0372] · R3−SFDCT = +0.0186 [−0.0122, +0.0493] · R1−B4 = −0.0058
[−0.0392, +0.0283] → **MỌI cặp CI chứa 0 = không cặp nào tách nhau có ý nghĩa thống kê ở video-level.**

**Cách trình bày trung thực:** frame-level best xếp R3 > SFDCT > R1 > B4, nhưng video-level best xếp
R3 > B4 > R1 > SFDCT (đảo thứ hạng), và paired CI đều chứa 0 → kết luận: "các biến thể tương đương
trong nhiễu đơn-seed; đóng góp là thiết kế floor≥B4 + giao thức đánh giá trung thực, không phải Δ AUC."

## ⚠️ LỖI DỮ LIỆU PHÁT HIỆN KHI AUDIT (2026-06-10)

`runs/20260605-230747/ckpt/efficientnetb4/` trên HF là **bản sao byte-identical của SFDCT**
(md5 metric pickle trùng `a2f9475f...`; ckpt_best.pth 73,112,459 bytes = đúng size SFDCT; B4 thật ~71MB).
**KHÔNG dùng folder này làm nguồn B4.** Nguồn B4 đúng: `runs/naive-20260605-233339/b4/ckpt/`
(cho 0.7497/0.8203 khớp log + viz_out). TODO: xoá/re-upload folder lỗi để khỏi nhầm về sau.

## Nguồn chính xác từng số (provenance)

- Per-epoch B4: HF `runs/naive-20260605-233339/logs/logs__training__efficientnetb4_2026-06-05-10-44-13__training.log`
- Per-epoch SFDCT: HF `runs/naive-20260605-233339/logs/logs__training__efficientnetb4_sfdct_2026-06-05-15-48-33__training.log`
- Per-epoch Row1: HF `runs/improved-20260606-010618/row1_sfdct_s1024/row1_sfdct_s1024.train.log`
- Best+CI B4/SFDCT: HF `runs/naive-20260605-233339/{b4,sfdct_naive}/ckpt/{metric_dict_best,data_dict_test}.pickle`
- Best+CI HFF R3/R1: HF `runs/20260610-003615/ckpt/efficientnetb4_hff_2026-06-09-{17-30-34,21-06-21}/...`
- Đối chiếu độc lập: local `DeepfakeBench/viz_out/{b4_local,naive_local,row1_local}/results.json` (khớp 4 chữ số)
- Leaderboard: github.com/SCLBD/DeepfakeBench (arXiv:2307.01426)

Còn thiếu để hoàn tất: (a) per-epoch HFF — `training.log`/`r1.log`/`r3.log` CHỈ còn trên vast box
`/workspace/` (metric pickle bị ghi đè mỗi lần best mới nên không tái dựng được lịch sử từ HF — cần cứu log);
(b) re-eval bằng `eval_and_viz.py` (đã patch lưu `img`) cho FF++ + t-SNE/feat nếu cần hình.
