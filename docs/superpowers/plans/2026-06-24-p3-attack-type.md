# P3 — Attack-type print/screen (engineering-correct) (Plan)

**Goal:** Fix B5 — phân loại print/screen có label VÀ confidence đúng nghĩa; cấp harness validate.
**Branch:** `p3-attack-type` → merge `dev-thanhln-24062026`.

## Gap (xác minh từ code)
- `serving/attack_classifier.py` scoring cũ: `if/elif/else` 1 nhánh → chỉ 1 điểm khác 0 → `confidence = best/total = 1.0` LUÔN (B5). Label thô, không phản ánh độ chắc.
- Mock `_mock_liveness` (`backend/.../liveness.py:169`) dùng `rng.choice` cho spoof_type — nhưng **chỉ chạy khi `LIVENESS_INFER_URL` rỗng** (dev, không serving). Demo dùng serving thật → mock KHÔNG chạy; và rng đã seeded-by-hash (deterministic per ảnh). → ngoài demo path, để nguyên (YAGNI).

## Change
- **attack_classifier.py:** chấm `print_s`/`screen_s` **độc lập** từ 5 dấu hiệu (moiré→screen, texture→print, color_entropy banding→screen/print, saturation→print, freq_ratio→print); `confidence = best/(print+screen)` → có nghĩa; `unknown` khi tổng quá thấp hoặc 2 loại sát nhau.
- **_test_attack_classifier.py (mới):** harness chạy classifier trên ảnh bất kỳ → in type/conf/scores/evidence. Smoke-test (samples) + validate (ảnh labeled của user).

## Verify
- Harness trên samples: confidence **biến thiên** (fake_03=0.714, real_01=0.667, không còn luôn 1.0) — cấu trúc B5 fixed. ✓
- *Accuracy print vs screen: cần ảnh print/screen LABELED của user → `serving/.venv310/bin/python serving/_test_attack_classifier.py <ảnh>` rồi đối chiếu nhãn, tune ngưỡng nếu lệch.*
- Serving liveness :8502 boot sạch với classifier mới.

## Commit
`fix(serving): attack-type print/screen scoring độc lập + meaningful confidence (B5) + harness`. No co-author.
