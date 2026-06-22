# Mockup slide Liveness (khung trình bày — không chạy thêm thí nghiệm)

> Mục tiêu: biến liveness từ "lấy data → train B4 → xong" thành **một thí nghiệm chuyển giao có chủ đích**,
> đủ ý để nói, bám đúng mạch cross-dataset của luận văn. Số liệu khoá theo CH4.2.2 (không đổi).

## Thông điệp lõi (cái "ý để nói")
Liveness **không phải một mô-đun phụ làm cho có**. Nó là một **phép thử chuyển giao**: lấy *nguyên bộ máy SFDCT*
(B4 + nhánh block-DCT + cổng zero-init) đặt sang một bài toán thứ hai, dưới *cùng kỷ luật* (split 3 phần chuẩn,
metrics ISO, so B4 vs B4+DCT có kiểm soát) — và ra **cùng một kết luận** với deepfake: nhánh tần số đóng góp
rất ít. Sự *nhất quán hai bài toán* này **củng cố** phát hiện chính, chứ không phải một kết quả lẻ yếu ớt.
Đồng thời nó là một detector mạnh tuyệt đối (AUC 0.98) chạy trước như **bộ lọc cascade** rẻ.

---

## PHƯƠNG ÁN A — 1 slide riêng (đề xuất, cân 11–12 phút)

### Slide — "Liveness: cùng bộ máy, bài toán thứ hai"  ⏱ ~50s

**Headline:** Cùng bộ máy SFDCT, đặt sang bài toán thứ hai.

**Cột trái — Thiết kế (tái dùng, không thiết kế mới)**
- Dùng lại **đúng** B4 + nhánh block-DCT + cổng zero-init; chỉ đổi nhãn sang *live / spoof*.
- Cùng kỷ luật: **split 3 phần chính thức** (train / dev / eval), ngưỡng chốt ở EER của **dev**, metrics ISO/IEC 30107-3 (APCER / BPCER / ACER).
- Cơ sở vật lý: replay để lại **đỉnh re-capture**, print để lại **vân chấm** — mờ trong pixel, lộ trong tần số.
- Vai trò **cascade**: chạy *trước*; verdict spoof chặn yêu cầu ngay, tiết kiệm compute deepfake.

**Cột phải — Kết quả (LCC-FASD, eval split)**
| Model | AUC | ACER | APCER | BPCER |
|---|---|---|---|---|
| B4-liveness | **0.9829** | 6.85% | 2.86% | 10.83% |
| B4+DCT-liveness | 0.9776 | 7.54% | 4.25% | 10.83% |

- Hình: `fig_3_20_roc_b4_liveness.png` (ROC sát góc + score-dist tách sạch).
- **Đọc một câu:** detector mạnh (AUC 0.98, trên light-net ~0.92); nhánh tần số **không vượt** spatial ở đây — *đúng phát hiện như bên deepfake*. Cả train+test cùng LCC-FASD → **cross-dataset liveness là future work**.

**Cue:** [chỉ score-dist: live dồn trái, spoof dồn phải — tách sạch] · nhấn "cùng kết luận hai bài toán" · nhấn "chạy trước, chặn sớm".

**Lời nói (nói ~50s):**
Liveness em không thiết kế mới, mà dùng lại đúng bộ máy của SFDCT — cùng backbone B4, cùng nhánh block-DCT, cùng cổng khởi tạo 0 — chỉ đổi nhãn sang live hay spoof. [DỪNG] Nó chạy dưới cùng kỷ luật: split ba phần chính thức, ngưỡng chốt trên tập dev, đo bằng metrics chuẩn ISO. Về vật lý, ảnh phát lại để lại đỉnh tần số khi quay màn hình, ảnh in để lại vân chấm — mờ với mắt nhưng rõ ở miền tần số. [DỪNG] Kết quả: B4-liveness đạt AUC 0 chấm 98, cao hơn hẳn các mạng nhẹ quanh 0.92. Và đúng như bên deepfake, thêm nhánh tần số **không** làm tốt hơn. Chính sự lặp lại của kết luận này ở bài toán thứ hai làm em tin nó là một quy luật, không phải may rủi một lần. Trong hệ thống, liveness chạy trước như một bộ lọc, chặn ảnh giả trước khi tốn compute cho deepfake.

---

## PHƯƠNG ÁN B — 2 slide (nếu liveness được tính điểm nặng, ~+1 slide, ~13 phút)

- **Slide B1 — Method & Cascade:** kiến trúc tái dùng (`fig_2_b4_liveness.png` + `fig_2_b4dct_liveness.png`) + sơ đồ cascade + cơ sở vật lý. (bỏ bảng kết quả)
- **Slide B2 — Liveness Results:** bảng B4 vs B4+DCT + `fig_3_20_roc_b4_liveness.png` (ROC + score-dist) + đọc số trung thực + giới hạn (eval chỉ 314 ảnh genuine, single seed, single dataset).

---

## Giới hạn nói thẳng (đưa vào lời nói hoặc dự phòng Q&A)
- Cả train và test đều LCC-FASD → **chưa có cross-dataset liveness** (NUAA mới smoke-test). Nêu là future work.
- Eval chỉ **314 ảnh genuine** → BPCER mong manh; chênh 0.005 AUC nằm trong nhiễu.
- **Single seed**. Scorer đã train nhưng **chưa nối** vào endpoint cascade (integration item).

## Hình dùng (đã có sẵn trong report/figures)
`fig_2_b4_liveness.png` · `fig_2_b4dct_liveness.png` · `fig_3_17_liveness.png` (ví dụ live/spoof) ·
`fig_3_20_roc_b4_liveness.png` · `fig_3_23_roc_b4dct_liveness.png`
