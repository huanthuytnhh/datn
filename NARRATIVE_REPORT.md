# NARRATIVE REPORT — SFDCT (handoff cho /paper-writing, venue IEEE_CONF)

> Sinh từ: `idea-stage/IDEA_REPORT.md` (novelty positioning) + kết quả own-run (`viz_out/`) +
> `report/BAO_CAO_DATN_SFDCT.md`. **KHÔNG train mới.** Mọi số giữ nguyên own-run.
> Nguyên tắc viết: **KHÔNG bán AUC/SOTA**; bán safety-property + regulation-aware eval + localized resource; trung thực Δ-trong-nhiễu.

## 1. Problem statement & core claim
- **Vấn đề:** deepfake đe doạ eKYC ngân hàng; detector huấn luyện một nguồn (FF++) **rớt mạnh cross-dataset** (Celeb-DF-v2) — đúng kịch bản triển khai gặp deepfake lạ.
- **Core claim (đã hiệu chỉnh, KHÔNG phải SOTA AUC):** một cơ chế hợp nhất **spatial (B4) + frequency (block-DCT 8×8)** *floor-preserving* (gated cross-attention **zero-init**, model tại init ≡ B4 → **không bao giờ tệ hơn baseline đã calibrate**), kèm **khung đánh giá theo điểm vận hành eKYC** và một **bộ test deepfake gương mặt người Việt** — phù hợp triển khai eKYC, đánh giá trung thực cross-dataset.

## 2. Method summary
- **Backbone không gian:** EfficientNet-B4 (pretrained ImageNet).
- **Nhánh tần số:** ảnh→YCbCr→block-DCT 8×8→log-magnitude→16 zigzag bands (tùy chọn drop low bands chống content-leakage).
- **Hợp nhất:** gated cross-attention `feature = x + α·context(DCT)`, **α=0 tại init** (floor ≥ B4).
- **Năm đòn tần số S1–S5** (adapt vào MỘT miền block-DCT): S1 dấu hệ số DCT (≈SPSL), S2 DCT-trên-SRM-residual (≈SRM), S3 DCTFoMixup+dual consistency (≈FreqDebias), S4 multispectral DCT attention (≈FcaNet), S5 single-center loss (≈FDFL).
- **Siêu tham số (config thật):** Adam lr 2e-4, wd 5e-4, batch 32, frame_num 32, res 256, epoch 10, seed 1024, no scheduler, loss cross-entropy (+ S3/S5 khi bật).

## 3. Key quantitative results (own-run, evidence cho mỗi claim)
| Claim | Số | Bằng chứng |
|---|---|---|
| Pipeline đúng | B4 = **0.7497** ≈ leaderboard 0.7487 | `viz_out/b4_local/results.json` |
| +block-DCT không tệ hơn baseline | naive SFDCT = **0.7572** (Δ=+0.0075) | `viz_out/naive_local/results.json` |
| Δ nằm trong NHIỄU (trung thực) | bootstrap CI95 ΔAUC = [−0.004, +0.019], p≈0.18 (unpaired) | `report_prepare/outputs/mt05_paired_diff.md` |
| Ladder không monotonic (trung thực) | Row1 = **0.7333** (< B4) | `viz_out/row1_local/results.json` |
| Video-level tốt hơn frame | video-AUC = **0.808** > frame 0.757 | results.json |
| Điểm vận hành eKYC | τ=0.9514 @FPR≤5% → TPR=0.2298, bỏ sót ~77% fake (FN=8318) | `mt02_*`, Bảng 3.4 |
| Tần số có tín hiệu (nhưng yếu trên c23) | real > fake ở dải mid/high (radial) | `mt07_freq_radial` |

> **Định vị leaderboard (BẮT BUỘC giữ trung thực):** trên thang DeepfakeBench chuẩn, SFDCT 0.7572 **chèn giữa SRM (0.7552) và SPSL (0.7650)**, vượt B4/F3Net/RECCE nhưng **chưa vượt SPSL**. KHÔNG claim SOTA. Trần hiện đại (LSDA 0.911, SBI/FSBI ~0.85–0.93) là tier khác → future work.

## 4. Đóng góp (tái cấu trúc 5 ĐG → 3 đóng góp + 2 trụ phương pháp luận)
1. **C1 (kiến trúc/an toàn):** floor-preserving spatial–frequency fusion (zero-init gate, α=0). *Khác SFCL-HCMF (gate σ(γ)init=0.5, không floor) và Flamingo/ReZero (domain khác).* Mức: INCREMENTAL — bán như **safety property**, không SOTA.
2. **C2 (đánh giá):** regulation-aware eKYC operating-point + áp ISO/IEC 30107-3 (APCER/BPCER/ACER) lên forgery. *Khác GenD (TPR@FPR thuần).* Mức: INCREMENTAL — bán như **honest diagnostic**.
3. **C3 (tài nguyên):** bộ deepfake gương mặt người Việt **test-only** cho điểm vận hành eKYC. *Khác KoDF/eKYC-DF (đổi quốc gia).* Mức: INCREMENTAL hợp lệ — claim hẹp "first VN-face for eKYC operating-point".
- **Trụ P1:** experimental protocol/ablation theo DeepfakeBench (không đánh số ngang).
- **Trụ P2:** bootstrap CI cấp-video + báo Δ-trong-nhiễu trung thực.

## 5. Figure/table inventory
- **Có sẵn** (`report/figures/`): 3.1 distribution, 3.2 real/fake+DCT, 3.3–3.5 training curve (log thật), 3.7 ROC, 3.8 PR, 3.9 confusion, 3.10 t-SNE, 3.11 frequency, 3.12 Grad-CAM, 3.13 gate alpha. Bảng: 3.2 ablation, 3.4 threshold eKYC, 5.1.
- **Cần train/infer (chưa có):** 3.6 Row2 curve, 3.14/3.15 demo infer, per-knob S1–S5, FF++ in-dataset AUC, DFDC cross-dataset.
- **Cần vẽ tay:** sơ đồ kiến trúc (1.x, 2.x).

## 6. Limitations & follow-ups (giữ nguyên, trung thực)
1. Δ=+0.0075 trong nhiễu → cần **bootstrap CI cấp-VIDEO** (không frame) + multi-seed trước khi claim.
2. Chưa vượt SPSL (0.7650); Row1<B4 (giải thích: thiếu gate/band-drop).
3. **TT17 KHÔNG ấn định FPR≤5%** — đã sửa cách phát biểu (ISO 30107-3 convention).
4. APCER/BPCER là thuật ngữ PAD → phải định nghĩa lại cho forgery.
5. ĐG5 N nhỏ + cần Ethics/consent (TT17 là luật bảo vệ sinh trắc).
6. Frame-level ≠ eKYC thật (video+liveness) → đóng khung lower-bound diagnostic.

## 7. Next step
`/paper-writing "NARRATIVE_REPORT.md" — venue: IEEE_CONF` — dệt 3 đóng góp + 2 trụ vào Related Work/Method/Experiments/Discussion; giữ số own-run + mọi cảnh báo trung thực; KHÔNG train mới. Trước phần claim: ưu tiên bootstrap-CI cấp-video + ablation 5-đòn (cần re-eval, đánh dấu nếu chưa có).
