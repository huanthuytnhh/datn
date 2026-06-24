# DeepGuard — Audit Report & Fix Log

> Branch `dev-thanhln-22062026`. Audit toàn app (backend + frontend + serving + streamlit + db) bằng 4 agent song song, mục tiêu: demo khớp docx + chỉn chu + không bug. ~37 finding. **Đa số đã FIX & verify** (pytest 8/8, smoke detect/liveness/bad-image OK).

## 🔴 CRITICAL — đã FIX
| Vấn đề | File:dòng | Fix |
|--------|-----------|-----|
| Cascade client không chặn UNCERTAIN (lệch docx 2.1) | `ekyc_demo/app.py:358` | LIVE→deepfake, SPOOF→FAIL, UNCERTAIN→REVIEW ✅ |
| Pipeline server không cascade (chạy cả 3 bước) | `deepguard_liveness/ekyc_pipeline.py:138` | Liveness fail → return FAIL ngay, bỏ deepfake+match ✅ |
| eKYC FAIL oan khi total_frames≤0 + avg=1.0 | `ekyc_pipeline.py:148-174` | Fallback đọc tuần tự; rỗng → 422, không mặc định FAKE ✅ |

## 🟠 HIGH — đã FIX
| Vấn đề | File | Fix |
|--------|------|-----|
| 2 nút header chết (Xuất Báo Cáo, Forensic) | `top-header.tsx` | `window.print()` ✅ |
| Chấm đỏ thông báo giả luôn sáng | `top-header.tsx:105` | Fetch unread, chỉ sáng khi >0 ✅ |
| Focus dashboard click → sai trang | `dashboard-page.tsx:1462` | setSelectedRequestId + navigate('detail') ✅ |
| update_webhook không validate status → 500 | `routers/webhooks.py` | Validate `WebhookStatus(...)` → 400 ✅ |
| infer_server cache không thread-safe | `serving/infer_server.py` | `threading.Lock` double-checked ✅ |
| attack_classifier ngưỡng moiré lệ thuộc size | `serving/attack_classifier.py` | Resize 256×256 trước FFT ✅ |
| JWT token trong localStorage (XSS) | `store/auth.ts` | ⚠️ FLAG — chấp nhận cho đồ án (không hardening) |

## 🟡 MEDIUM — đã FIX (trừ ghi chú)
Copilot card + icon "More" giả → ẩn ✅ · liveness `image_hash=''` → hiện check_id/"—" ✅ · model name lạ → 400 (không mock im lặng) ✅ · temp file leak → try/finally ✅ · face_matching MAX→mean ✅ · webhook url/events (giữ) · SECRET_KEY default → thêm WARN ✅ + docker-compose dùng `${SECRET_KEY}` ✅ · **thiếu test → thêm pytest (8 test) ✅** · estimate_yaw replay = giới hạn heuristic (ghi chú trong báo cáo, không đổi).

## 🟢 LOW — đã FIX
require_admin dead code → xóa ✅ · notifications count tối ưu ✅ · audit mutable default → Field ✅ · ml_video gradcam=false cho video (~2x nhanh) + bỏ print ✅ · tenant wizard bỏ field Domain/Khu vực thừa + sửa comment ✅ · liveness `console.log` xóa ✅ · frame_count passive ẩn ✅ · check_update stub (giữ) · on_event startup deprecated (giữ, không chặn demo).

## Verify (sau fix)
- `cd backend && .venv310/bin/python -m pytest tests/ -q` → **8 passed**
- Smoke: DETECT fake_01=FAKE +heatmap · b4/hff/sfdct model thật · LIVENESS=LIVE 0.9996 · file rác→400 · py_compile toàn bộ OK.

## Còn lại (flag, không bắt buộc cho đồ án)
- Token/API key trong localStorage → lý tưởng httpOnly cookie (production).
- SECRET_KEY vẫn có default (đã WARN); production phải set `.env`.
- Liveness chống replay tĩnh (yaw heuristic) yếu — đã nêu là giới hạn trong báo cáo.
