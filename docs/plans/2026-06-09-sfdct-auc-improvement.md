# SFDCT — Tăng AUC cho naive model (cross-test CDFv2) — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: dùng superpowers:executing-plans để thực thi từng task.
> Tuân thủ rule dự án: **smoke-test trước mọi full run** (shape → dry-run → overfit-1-batch);
> file ≤250 dòng; **chỉ commit khi được yêu cầu**; KHÔNG trailer Co-Authored-By; branch `dev-thanhln-sfdct-auc`.

**Goal:** Đưa SFDCT (block-DCT) **vượt same-pipeline EfficientNet-B4 (~0.7487)** trên Celeb-DF-v2 cross-test
frame-AUC, một cách **trung thực và bảo vệ được** (≥5 seed, CI lower-bound (SFDCT−B4) > 0, val≠test).

**Architecture:** Giữ nguyên identity đã khoá — B4 spatial + block-8×8 DCT branch + zero-init gated cross-attn
(floor ≥ B4). KHÔNG đổi kiến trúc lớn, KHÔNG SBI ở headline. Gain đến từ (a) sửa lỗi chọn checkpoint +
fair-engineering đối xứng 2 nhánh, (b) tín hiệu pure-DCT content-suppressed.

**Tech Stack:** DeepfakeBench (PyTorch). Code anchor:
`training/detectors/sfdct_core.py` · `efficientnetb4_sfdct_detector.py` ·
`training/config/detector/efficientnetb4_sfdct.yaml` · `training/trainer/trainer.py` ·
`training/dataset/abstract_dataset.py`. Bằng chứng đầy đủ: `refine-logs/AUC_IMPROVEMENT_PLAYBOOK.md`
(47 lever), `refine-logs/SFDCT_FINAL_PLAN.md`, `refine-logs/AUC_METHODS_EVIDENCE.md`.

---

## ⚠️ Sự thật phải đọc trước (đừng bỏ qua)

1. **0.7572 hiện tại là số "peeked".** `trainer.save_best` (L375–389) chọn epoch tốt nhất bằng AUC đo
   trên `test_data_loaders` = **chính CDFv2 (test-set)**. Đây là test-set peeking → con số bị thổi lên.
   **Sau khi sửa (chọn checkpoint trên FF++-val), baseline trung thực có thể THẤP hơn 0.7572.** Mọi "tăng AUC"
   phải tính từ baseline đã-sửa này, không phải từ 0.7572. Đây là **điều kiện tiên quyết** để cả bảng có giá trị.
2. **Naive (DCT all-16-bands) ≈ tie/lose là kỳ vọng đúng** (twin SFCL-HCMF chỉ +1.88% **in-domain**, CDFv2
   74.68 ≈ B4 đã tune). Kiến trúc DCT đơn thuần KHÔNG tự nâng cross-dataset. Lực nâng nằm ở **"Learning"**
   (content-suppression + debiasing), không phải ở việc thêm nhánh.
3. **Mọi lever orthogonal phải áp y hệt cho B4.** Headline luôn là EMA-B4 vs EMA-SFDCT, soup-B4 vs soup-SFDCT…
   Bất kỳ bất đối xứng nào → vô hiệu hoá claim.
4. **"Win" = CI lower-bound của (SFDCT − B4) > 0** trên ≥5 seed. Delta dương trên 1 seed KHÔNG phải win.
5. Probability đã thẩm định (playbook §6): Stack B ~**80–88%**. Không hứa chắc thắng; hứa một bảng trung thực
   + downside cap ở ~B4 nhờ zero-init gate.

**Lộ trình chọn: Stack B** (DCT pure-levers tạo gap + fair-engineering đối xứng giảm variance). Lý do: P(win)
cao nhất mà vẫn giữ identity block-DCT đã khoá.

---

## PHASE 0 — Correctness + free engineering (làm TRƯỚC mọi thay đổi modeling)

> EV cao nhất / chi phí thấp nhất. Áp **đồng thời cho `efficientnetb4.yaml` và `efficientnetb4_sfdct.yaml`**.

### Task 0.1: FF++ held-out val split + chọn checkpoint trên val (lever #1, CORRECTNESS)

**Files:**
- Modify: `DeepfakeBench/training/dataset/abstract_dataset.py` (thêm `mode == 'val'`, hiện chỉ train/test ở L73/L91)
- Modify: `DeepfakeBench/training/trainer/trainer.py:375-389` (`save_best`) + nơi gọi `test_epoch` (L307-330)
- Modify: `DeepfakeBench/training/config/detector/efficientnetb4_sfdct.yaml` + `efficientnetb4.yaml` (khai báo `val_dataset` = FF++-internal split)
- Test: `DeepfakeBench/tests/test_val_split.py` (mới)

**Step 1 — Viết test fail trước:** val loader trả batch FF++ KHÁC tập test; `save_best` đọc metric từ val, không từ CDFv2.
```python
def test_val_loader_is_ffpp_not_celebdf():
    val = build_loader(mode='val')          # FF++ internal holdout
    assert val.dataset.dataset_name.startswith('FaceForensics')
    assert 'Celeb' not in val.dataset.dataset_name
def test_save_best_reads_val_metric(monkeypatch):
    # save_best phải nhận metric từ val_data_loader, KHÔNG từ test_data_loaders
    ...
```
**Step 2 — Run để xác nhận fail:** `pytest DeepfakeBench/tests/test_val_split.py -v` → FAIL (chưa có mode 'val').
**Step 3 — Implement tối thiểu:** thêm nhánh `mode=='val'` trong `abstract_dataset.py` (đọc danh sách FF++ holdout, KHÔNG overlap train); thêm `val_data_loader` ở trainer; đổi `save_best` chọn theo `val` AUC; CDFv2 chỉ chạm 1 lần ở report cuối.
**Step 4 — Test pass:** `pytest ... -v` → PASS.
**Step 5 — Smoke:** chạy 1 epoch nEpochs=1 trên local 3050 → log "best selected on FF++-val".
**Step 6 — Commit** (khi được yêu cầu): `fix(train): chọn checkpoint trên FF++ val, bỏ test-set peeking`.

> Ghi lại baseline ĐÃ-SỬA của B4 và naive SFDCT (đây là điểm xuất phát thật, thay 0.7497/0.7572).

### Task 0.2: Bật EMA của trọng số (lever #2) — hoặc SWA (#5), chọn 1 làm primary

**Files:** Modify `trainer.py` (shadow weights + **recompute BN trên EMA params trước eval**); thêm `ema_decay` vào cả 2 config.
- SWA scaffolding đã có sẵn (`AveragedModel`/`SWALR` import ở `trainer.py:28`) → có thể bật `SWA: true`, nhớ `update_bn`.

**Steps:** (1) test: eval dùng shadow model, `ema_decay∈(0,1)`, BN được recompute. (2) fail. (3) implement EMA hook. (4) pass. (5) smoke overfit-1-batch: EMA loss ≤ raw. (6) commit `feat(train): EMA weights (đối xứng B4/SFDCT)`.

### Task 0.3: Train dài hơn + cosine LR (lever #12)

**Files:** `efficientnetb4_sfdct.yaml` + `efficientnetb4.yaml`: `lr_scheduler: cosine` (hiện `null`, L110), `nEpochs: 10 → 20–30` (L111). Cùng budget cho cả 2 nhánh.
**Steps:** smoke dry-run xác nhận scheduler dựng đúng (LR giảm theo cosine) → commit.

### Task 0.4: TTA h-flip lúc eval (lever #9)

**Files:** vòng test trong `trainer.py` test_epoch (L419+): trung bình logit ảnh gốc + h-flip. **DCT phải tính lại trên ảnh đã flip** (ContentDCT chạy trên input tensor → flip ảnh TRƯỚC `features()` là đúng; KHÔNG flip hệ số đã tính).
**Steps:** test: logit_tta = mean(logit(x), logit(flip(x))); shape giữ nguyên; áp cho cả B4. → commit.

**✅ Checkpoint Phase 0:** chạy lại B4 vs SFDCT (naive, all bands) với val-selection + EMA + cosine + TTA, ≥3 seed.
Báo cáo baseline trung thực mới. **Chưa kỳ vọng SFDCT>B4 ở đây** — đây là nền công bằng để Phase 1 tạo gap.

---

## PHASE 1 — Tín hiệu pure-DCT rẻ (sweep trên FF++-val, KHÔNG trên CDFv2)

### Task 1.1: Suppress DC + lowest-AC bands (lever #6) — **rẻ nhất, đánh đúng band làm F3-Net thua**

**Files:** `sfdct_core.py` `ContentDCT` — tham số `drop_low_bands` **đã có** (L94, L149); config key `dct_drop_low_bands` **đã có** (yaml L23, hiện =0).
**Steps:** (1) unit test mask: với `drop_low_bands=k`, các band `0..k-1` bằng 0 trong `_bands` output. (2) fail (hiện k=0 chỉ drop DC). (3) đã có logic — chỉ cần bật + sweep `k∈{1,2,3}` trên FF++-val. (4) test pass. (5) chọn k tốt nhất theo **val**, khoá lại. (6) commit `feat(dct): sweep drop_low_bands chống rò content`.

### Task 1.2: High-pass / mid-high emphasis + band-selection (levers #7, #8)

**Files:** `sfdct_core.py` — thêm `band_mode: {full, highpass, midhigh_topk}`; giới hạn `zigzag_band_of` về mid/high ranks. Kết hợp với 1.1.
**Steps:** test band_mode='highpass' loại low ranks; smoke; sweep trên val; commit.

### Task 1.3: Mở rộng compression aug (lever #13) — **bất biến đúng dải tần SFDCT**

**Files:** cả 2 config: `quality_lower: 40 → 20` (yaml L87), tăng `p` JPEG/blur ~0.7. **Retrain B4 với cùng mix.**
**Steps:** sweep sao cho HF cue không bị xoá (theo val); commit. (Cẩn thận: quá mạnh sẽ erase mid/high → mất tín hiệu.)

**✅ Checkpoint Phase 1:** ablation rows {B4 | naive | +drop_low | +highpass/select | +compression}, ≥5 seed, mean±std trên CDFv2. Đây là **xương sống luận văn** — chứng minh *component DCT nào* dịch chuyển cross-dataset AUC. Story đứng vững **bất kể delta cuối** vì nó localize được lever.

---

## PHASE 2 — Lõi kiến trúc (1 biến/lần, zero-init gated, có negative control)

### Task 2.1: Chọn MỘT — multi-stage fusion (#21) HOẶC local block-DCT + global moments (#22)

**Files:** `efficientnetb4_sfdct_detector.py` — hiện `features()` (L84) chỉ fuse ở map cuối `[B,1792,8,8]`.
- **#21 (refactor nhẹ, rủi ro thấp):** thêm fusion hook ở B4 block2/3 (đọc số channel runtime), mỗi hook 1 zero-init gate (#11) + progressive warm-up (#16).
- **#22 (headline cao hơn, variance cao):** nối `p1/local_branch.py` (SBCM) + `p1/sida.py` (global moments), tính ở **native resolution trước resize**.

**Bắt buộc:** chạy `shuffle_bands: true` (negative control, đã có ở yaml L22) + 1 biến thể B4 cùng param-budget → quy gain về **frequency**, không phải capacity.
**Steps:** smoke (shape→dry-run→overfit-1-batch) → full ablation → commit.

---

## PHASE 3 — Loss + ensemble (rẻ, làm cuối)

### Task 3.1: Single-Center Loss trên class real + BCE (lever #18)
**Files:** detector loss — thêm SCL (1 λ tune trên val); cùng tuỳ chọn cho B4.

### Task 3.2: ≥5 seed → model soup (#4) + multi-seed ensemble (#3); báo cáo CI (SFDCT−B4)
**Files:** script eval — greedy soup gate **chỉ trên FF++-val**; soup cả B4; recompute BN. Seeds: 1024/2025/7/+2.
**Output:** bảng cuối: B4 vs SFDCT mỗi cấu hình, mean±std, **95% CI lower-bound của (SFDCT−B4)**. Win ⇔ lower-bound > 0.

---

## Defer / KHÔNG đưa vào headline
- #20 dual-CR · #26 HCMA gate · #23 quant-aware (→ cột robustness eKYC) · #29 phase channel (làm loãng identity block-DCT) · #25/SBI (chỉ Stack C, **row riêng dán nhãn rõ**, không gọi là "SFDCT thắng B4").
- #46 temperature scaling, #47 score-norm: **AUC-invariant** → là deliverable điểm-vận-hành eKYC, KHÔNG phải lever AUC.

## Kỷ luật công bằng (giữ mọi gain bảo vệ được) — trích playbook §4
1. Lever orthogonal (EMA/SWA/soup/TTA/longer/cosine/label-smooth/SAM/score-norm/temp): **set y hệt cho B4**.
2. Aug delta khớp: đổi compression/resize/mixup/pseudo-fake → **retrain B4 cùng mix**.
3. val ≠ test, **không peek**: mọi sweep (band-k, λ, decay, ε) tune trên FF++-val; CDFv2 chạm 1 lần cuối.
4. ≥5 seed, mean±std, **CI lower-bound (SFDCT−B4) > 0** mới tính win.
5. Lever thêm param → chạy gate-zeroed/shuffle-bands control + B4 cùng param-budget.

## Kiểm thử / vận hành
- Smoke local (RTX 3050 4GB): shape → dry-run → overfit-1-batch cho MỖI thay đổi code trước full run.
- Full ablation: trên box 2-GPU (vast.ai, xem `VAST_SETUP.md`); 1 biến/lần.
- Mỗi task: unit/smoke test pass → (commit khi được yêu cầu).

## Files đụng tới (tổng hợp)
- **Modify BE/train:** `abstract_dataset.py` (val mode) · `trainer.py` (save_best→val, EMA, TTA) ·
  `sfdct_core.py` (drop_low_bands sweep, band_mode) · `efficientnetb4_sfdct_detector.py` (Phase 2 fusion) ·
  `efficientnetb4_sfdct.yaml` + `efficientnetb4.yaml` (scheduler/nEpochs/quality/ema, đối xứng).
- **Mới:** `DeepfakeBench/tests/test_val_split.py` (+ test mask band, EMA, TTA).

## Ghi chú trung thực cho báo cáo
- Nếu sau val-fix baseline tụt dưới 0.7572: ghi rõ "số cũ do test-set selection; số mới là honest OOD" — đây là
  điểm cộng liêm chính, không phải thất bại.
- Nếu cuối cùng SFDCT không vượt B4 (CI chứa 0): vẫn là đóng góp hợp lệ (negative result + ablation định vị
  lever + downside cap ở B4 + trục eKYC) — đúng tinh thần [[sfdct-auc-improvement-evidence]].
