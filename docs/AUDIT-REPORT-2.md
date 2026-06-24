# DeepGuard — Audit Report #2 (2026-06-24) + Task Breakdown

> Pass audit thứ 2 (sau PHASE A-F). 3 agent đọc sâu fe/be/ekyc, đã loại trùng với `AUDIT-REPORT.md`.
> ~30 finding mới, đã verify bằng `file:dòng`. Đây là demo đồ án — ưu tiên: **đúng báo cáo + chỉn chu + không bug**, không cần hardening production.
> Đường dẫn `file:dòng` theo cây repo (bản WSL `~/deepguard/app` = chuẩn).

## Bảng tổng hợp theo mức độ

### 🔴 HIGH
| # | Vấn đề | File:dòng | Sửa |
|---|--------|-----------|-----|
| B1 | `accept_invite` không kiểm `tenant.status` → tenant pending/suspended vẫn vào được (bypass cổng duyệt sysadmin mà `login` có) | `backend/app/routers/auth.py:78-106` | kiểm `inv.tenant.status=="active"` → 403 |
| B2 | `monthly_quota` của tenant KHÔNG bao giờ enforce — chỉ `+current_usage` rồi hiển thị | `detect.py:111`, `playground.py:99/155`, `_liveness_helpers.py:54`; gate duy nhất là key ở `dependencies.py:83` | so `current_usage>=monthly_quota` → 429 |
| B6 | Temp password cứng `"123456"` cho create/invite/reset (generator mạnh là dead code) | `backend/app/routers/_users_helpers.py:53` | gate sau `DEMO_MODE`, mặc định random |
| F2 | apikeys/webhooks KHÔNG gate RBAC nút create/edit/revoke (các trang khác đều gate) | `apikeys-page.tsx:200/469/549`, `webhooks-page.tsx` | `canEdit(role,'apikeys'/'webhooks')` ẩn/disable |
| F3 | Chip lọc "Real/Fake" ở History làm BIẾN MẤT record liveness (verdict LIVE/SPOOF không normalize, dù counter có) | `history-page.tsx` (VERDICT_CHIPS vs stat ~246-248) | normalize LIVE→REAL, SPOOF→FAKE trong predicate |
| E1 | `finally` gọi `os.unlink(None)` khi lưu upload lỗi → `TypeError` che lỗi gốc + leak file kia | `deepguard_liveness/ekyc_pipeline.py:277-280` | `if id_path: unlink(...)` mỗi cái try riêng |
| ✅F1 | ~~Liveness dùng API key~~ | `liveness-page.tsx` | **ĐÃ FIX (WSL hôm nay)** |

### 🟠 MEDIUM
| # | Vấn đề | File:dòng | Sửa |
|---|--------|-----------|-----|
| B3 | `list_detections` `verdict` lạ → `ValueError`→500 (liveness router đã wrap, detections thì không) | `detections.py:39` | try/except → `bad_request` |
| B4 | `liveness_server` ảnh rác/rỗng → 500 → client dịch thành 503 "service down" (che lỗi input) | `serving/liveness_server.py:85-102` | validate decode → 400 |
| B5 | `attack_classifier.confidence` luôn ≈1.0 (chỉ 1 key có điểm, total=best) → evidence hiển thị sai | `serving/attack_classifier.py` | tính điểm độc lập từng loại rồi chuẩn hoá |
| B7 | `update_tenant_user` không chặn hạ cấp/khóa **sysadmin khác** | `platform.py:233-270` | từ chối sửa khi target là sysadmin |
| F4 | `models-page`: `threshold`/`traffic_percent` không guard null → 1 model null crash cả trang | `models-page.tsx:120/277/296/325/364/471` | `(m.threshold ?? 0).toFixed`, `?? 0` |
| F5 | Race set-state sau unmount (nhiều effect fetch thiếu cờ `alive`) → response cũ đè mới | `dashboard-page.tsx:553-572/704/807/966`, `settings:127`, `detail:73`, `liveness:114` | thêm `let alive` (pattern có sẵn ở analytics/account) |
| F6 | `detail-page`: lưu note lỗi dùng chung biến `error` → mất cả trang detail | `detail-page.tsx:106-108 vs 153` | state riêng `noteError` |
| F7 | Liveness camera leak khi `play()` lỗi; `stopCamera` không reset `srcObject` | `liveness-page.tsx:59-81` | bọc play() an toàn + `srcObject=null` |
| F8 | Billing toàn dữ liệu FAKE (hoá đơn, thẻ Visa, "kỳ tới") hiện như thật + nhiều nút chết | `billing-page.tsx:41-79/141/273-294` | badge "mẫu/sắp có" + disable nút chết |
| F9 | History pagination không clamp `currentPage` khi lọc co lại → bảng trắng "Trang 5/1" | `history-page.tsx` (cả `audit-page` nhẹ) | clamp `currentPage>totalPages→1` |
| F10 | `settings`: gửi `billing_email:''` rỗng đè giá trị hợp lệ | `settings-page.tsx:151` | gửi `undefined` khi rỗng |
| F11 | Dashboard: tab counts từ 6 dòng `recent` mâu thuẫn KPI; ô health "Hoạt động"/retention hardcode | `dashboard-page.tsx:1249-1254/1442/1074-1075/917-918` | nhãn "(gần đây)" + health từ `apiHealth` |
| E2 | Deepfake VIDEO không có REVIEW (thiếu `decision_hint`→chỉ PASS/FAIL) — lệch cascade 3 trạng thái | `ekyc_demo/app.py:282-286/364-365` | suy band từ `prob_fake` cho video |
| E3 | Liveness: blink ở frame cuối (mắt còn nhắm) không đếm → FAIL oan; `EAR=0.21` cứng | `liveness.py:177-208` | đếm blink lúc kết, ngưỡng tương đối |
| E5 | Face match: quyết định `mean_sim` nhưng field `similarity` trả `max_sim` → mâu thuẫn hiển thị, reject oan | `face_matching.py:131-141` | thống nhất metric quyết định = hiển thị |
| E6 | `extract_frames` luôn `suffix=".mp4"` cho mọi codec (mov/webm/mkv) → có thể mở fail | `ekyc_demo/app.py:135-138` | suffix theo `up.name` |

### 🟡 LOW (chỉn chu / ghi chú giới hạn)
| # | Vấn đề | File:dòng |
|---|--------|-----------|
| B8 | Liveness class-index magic `probs[0]=live,[1]=spoof` — **cần verify** với config train (nếu sai = đảo verdict, thành Critical) | `serving/liveness_server.py:99-100` |
| B9 | `playground` nhét `file.filename` vào cột audit `user_agent` (sai ngữ nghĩa) | `playground.py:82` |
| B10 | `FrameResult` thiếu `prob_cnn` → real/sfdct trả thừa bị drop; mock/real không nhất quán | `detect.py:80-83` vs `ml_video.py` |
| E4 | "head motion" = offset nose-tip → **không chống replay** video phẳng (vượt cả ghi chú yaw cũ) | `liveness.py:72-94` |
| E7 | Standalone fallback deepfake `prob_fake=0.15` luôn PASS, không cờ mock | `ekyc_pipeline.py:192-207` |
| E8 | Streamlit ghi `.env` key không quote → key có ký tự đặc biệt hỏng | `ekyc_demo/app.py:71-81` |
| E9 | `render_liveness`: `liveness_score*100` vs `confidence` `:.1f%` — lệch thang đo (video gộp dễ sai ×100) | `ekyc_demo/app.py:244-245` |
| E10 | `call_liveness_video` cộng dồn `processing_time_ms` → "Latency" phình phi thực tế | `ekyc_demo/app.py:180` |
| F12 | `key={index}` trên list có prepend (runs/alerts/IP) → DOM tái dùng sai | `playground:543`, `dashboard:1524`, `settings:413` |

---

## Break thành TASK (gom theo chủ đề, mỗi task = 1 đơn vị PR test được riêng)

- **T1 — Auth correctness (HIGH):** B1 (tenant status ở accept_invite) · B6 (temp password gate DEMO_MODE) · B7 (bảo vệ sysadmin khác). *be · effort M.*
- **T2 — Enforce quota tenant (HIGH):** B2 (chặn khi `current_usage>=monthly_quota` ở key-auth + playground → 429). *be · M.*
- **T3 — Error mapping đúng (MED):** B3 (detections 400) · B4 (liveness_server 400 cho ảnh rác). *be/serving · S.*
- **T4 — Frontend RBAC + History (HIGH):** F2 (gate apikeys/webhooks) · F3 (normalize verdict ở chip) · F9 (clamp pagination). *fe · S-M.*
- **T5 — Frontend robustness (MED):** F4 (null guard models) · F5 (cờ alive chống race) · F6 (noteError) · F7 (camera leak) · F10 (email rỗng). *fe · M.*
- **T6 — Frontend trung thực/polish (MED):** F8 (billing nhãn mẫu + nút chết) · F11 (counters/health nhãn đúng) · F12 (key ổn định). *fe · M.*
- **T7 — eKYC pipeline correctness (HIGH/MED):** E1 (unlink None) · E6 (video suffix) · E2 (video REVIEW) · E5 (face match metric nhất quán). *ekyc/liveness · M.*
- **T8 — Liveness algo + demo polish (LOW/MED):** E3 (blink cuối) · E4+E7 (ghi rõ giới hạn replay/standalone) · E8/E9/E10 (env quote, thang đo, latency label) · B5 (attack confidence) · B8 (verify class-index) · B9/B10 (dọn). *nhiều file · S mỗi cái.*

**Thứ tự đề xuất:** T1 → T2 → T4 → T7 (HIGH trước) → T3/T5 → T6 → T8.

**Lưu ý cần verify trước khi tin:** B8 (class-index liveness) — nếu mapping sai là lỗi nặng nhất; phải xem config train `model_liveness`. E2/E4 phần nào là *giới hạn thuật toán* nên có thể chỉ cần ghi chú trong báo cáo thay vì sửa.
