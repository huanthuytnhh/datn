# DeepGuard — Bảng tiến độ Đồ án tốt nghiệp (AI Engineer)

> Đề tài: **Phát hiện Deepfake bằng EfficientNet-B4 + DCT-residual attention**, triển khai thành nền tảng eKYC đa tenant (DeepGuard).
> Cập nhật cột **Trạng thái**: ⬜ Chưa làm · 🟡 Đang làm · ✅ Xong · ⏸ Khoan/Optional · ❗Blocker
> Ưu tiên: **P0** = bắt buộc để ra đồ án · **P1** = quan trọng · **P2** = nice-to-have.

> **Title (chốt):** *Hybrid DCT and Spatial Deepfake Detection and Liveness in eKYC*.
> **Phân bổ công sức (chống "rộng mà nông"):** Rộng ở phạm vi, sâu dồn vào AI.
> - 🟦 **Hybrid DCT+Spatial (deepfake)** = SÂU NHẤT (novelty chính) → Phần 1.
> - 🟩 **Liveness/eKYC** = TRUNG BÌNH, có số liệu thật nhưng là tích-hợp+đánh-giá (không cần novel kiến trúc) → Phần 1B.
> - ⬜ **App SaaS (RBAC/multi-tenant/FE)** = **ĐÓNG BĂNG TÍNH NĂNG nhưng KIẾN TRÚC PHẢI CHUẨN + CHẠY ĐƯỢC.** Không code thêm tính năng/trang/role mới; NHƯNG bắt buộc: layering đúng (router→service→crud→db), auth nhất quán, không lỗ bảo mật, không feature chết trên UI, chạy không lỗi. ⇒ **Phần 3 là BẮT BUỘC (sửa lỗi kiến trúc/bảo mật), không phải polish.**

---

## 0. Đã hoàn thành (context)
| | Hạng mục | Trạng thái |
|---|---|---|
| ✓ | Tích hợp model B4 + DCT-residual vào DeepfakeBench (fca_layer, detector, config) | ✅ |
| ✓ | Smoke test pipeline local (data tí xíu) — chứng minh chạy được | ✅ |
| ✓ | Nền tảng DeepGuard: BE FastAPI + FE Next.js, RBAC 5 role, multi-tenant, eKYC pages | ✅ |
| ✓ | Vá bảo mật RBAC (8 fix: must_change, models-sysadmin, SoD, tenant-status, register-gate, compliance-protect, PII mask, sysadmin cross-tenant) | ✅ |
| ✓ | Manual Test Plan (`MANUAL_TEST_PLAN.md`) | ✅ |

---

## PHẦN 1 — Đóng góp AI / Model (CỐT LÕI — trọng số chấm cao nhất)
> Chạy trên GPU mạnh (Vast theo `VAST_SETUP.md`), KHÔNG phải RTX 3050 local.

| ID | Việc cụ thể | Ưu tiên | Phụ thuộc | Done-criteria (làm xong khi…) | Trạng thái |
|---|---|---|---|---|---|
| P1.1 | Thuê GPU Vast + dựng môi trường (torch+cu, requirements, repo) | P0 | — | `torch.cuda.is_available()`=True, import DETECTOR OK | ⬜ |
| P1.2 | Tải FULL data: FF++ (c23) + Celeb-DF-v2 + JSON config | P0 | P1.1 | frames + json đầy đủ, verify path | ⬜ |
| P1.3 | Khôi phục config FULL (nEpochs=10, frame_num=32, batch=32, lr=2e-4) cho cả 2 yaml; trỏ data full | P0 | P1.2 | yaml đúng FULL (bỏ giá trị SMOKE) | ⬜ |
| P1.4 | Thêm 2 cấu hình ablation còn thiếu: **B4+SE** và **B4+DCT-concat (no residual)** | P0 | P1.3 | 2 detector/config mới, build forward OK | ⬜ |
| P1.5 | Train **C1: B4 baseline** × 3 seed (1024/2025/7) | P0 | P1.3 | 3 checkpoint + log AUC | ⬜ |
| P1.6 | Train **C4: B4+DCT-residual (đề xuất)** × 3 seed | P0 | P1.3 | 3 checkpoint + log | ⬜ |
| P1.7 | Train **C2: B4+SE** ×1 + **C3: B4+DCT-concat** ×1 seed | P1 | P1.4 | 2 checkpoint + log | ⬜ |
| P1.8 | Eval cross-dataset (Celeb-DF-v2) cho mọi checkpoint | P0 | P1.5–1.7 | AUC within(FF++) + cross(Celeb) mỗi run | ⬜ |
| P1.9 | Bảng kết quả tổng hợp: AUC/ACC/EER/AP, **mean±std + paired t-test** (C1 vs C4) | P0 | P1.8 | bảng + p-value (script sinh tự động) | ⬜ |
| P1.10 | Visualization: Grad-CAM/heatmap so sánh B4 vs B4+DCT, biểu đồ `alpha` học được | P1 | P1.6 | ≥4 hình minh hoạ | ⬜ |
| P1.11 | Kết luận khoa học: DCT có cải thiện cross-domain không? (trung thực) | P0 | P1.9 | đoạn phân tích + nhận định | ⬜ |

**Milestone M1:** có bảng kết quả + kết luận model → *xong đóng góp AI #1 (deepfake).*

---

## PHẦN 1B — Đóng góp AI #2: Liveness / eKYC (CÓ SỐ LIỆU — title yêu cầu)
> Mức đầu tư TRUNG BÌNH: phải có metric thật, nhưng là "tích hợp + đánh giá", không cần kiến trúc novel.
> Code có sẵn: `backend/app/routers/liveness.py` (passive/active), `deepguard_liveness/ekyc_pipeline.py` (3-layer).

| ID | Việc cụ thể | Ưu tiên | Phụ thuộc | Done-criteria | Trạng thái |
|---|---|---|---|---|---|
| P1B.1 | Chọn + tải dataset anti-spoofing (CASIA-FASD / Replay-Attack / CelebA-Spoof) + split | P0 | — | data + train/test split, verify path | ⬜ |
| P1B.2 | Viết rõ phương pháp liveness hiện tại thành thuật toán/công thức (passive features? active blink/head-motion?) | P0 | — | mô tả method + pipeline diagram | ⬜ |
| P1B.3 | Eval liveness: ROC, **FAR/FRR/EER/HTER**, calibrate threshold theo FPR mục tiêu | P0 | P1B.1 | bảng số + đường ROC | ⬜ |
| P1B.4 | Eval **eKYC end-to-end**: pass-rate + **ablation 3-layer** (liveness / deepfake / face-match đóng góp gì) | P0 | M1, P1B.3 | bảng pass/fail theo kịch bản | ⬜ |
| P1B.5 | Kết luận: deepfake-check bổ sung gì cho eKYC so với chỉ liveness (trung thực) | P0 | P1B.4 | đoạn phân tích | ⬜ |

**Milestone M1B:** có số liệu liveness + eKYC end-to-end → *xong đóng góp AI #2.*

---

## PHẦN 2 — MLOps: nối model thật vào sản phẩm (điểm mạnh "Engineer")
| ID | Việc cụ thể | Ưu tiên | Phụ thuộc | Done-criteria | Trạng thái |
|---|---|---|---|---|---|
| P2.1 | Chọn + export checkpoint DCT tốt nhất (freeze .pth + config) | P0 | M1 | file checkpoint + metadata | ⬜ |
| P2.2 | Viết loader trong `backend/app/services/ml_inference.py` dùng **đúng model DCT** + preprocessing DeepfakeBench (resize 256, normalize) | P0 | P2.1 | load_state_dict OK, forward 1 ảnh ra prob | ⬜ |
| P2.3 | Tắt `MOCK_ML`, set `MODEL_PATH`; `/v1/detect/image` trả verdict từ model thật | P0 | P2.2 | so verdict API ≈ eval offline | 🟡 (2026-05-31: ĐÃ bật model thật `best_model.pth` = **B4 baseline thuần** + freq-heuristic; REAL→0.03, FAKE→0.54; nhưng **CHƯA phải hybrid DCT** → còn đợi P1 train model DCT + loader FcaNet) |
| P2.4 | Đo latency/throughput `/v1/detect` (CPU & GPU) → bảng số | P1 | P2.3 | bảng ms/req + RPS | ⬜ |
| P2.5 | (optional) video pipeline async thật + poll `/jobs/{id}` | P2 | P2.3 | — | ⏸ |

**Milestone M2:** demo app detect bằng **model do mình train** → *khép vòng research→product.*

---

## PHẦN 3 — Kiến trúc chuẩn + Hardening (BẮT BUỘC — app phải đúng & chạy được, không chỉ "polish")
> App đóng băng tính năng nhưng phải đạt kiến trúc chuẩn: auth nhất quán, không lỗ bảo mật, không feature chết, layering đúng.
| ID | Việc cụ thể | Ưu tiên | Done-criteria | Trạng thái |
|---|---|---|---|---|
| P3.1 | Vá `/v1/ekyc/verify`: validate API key + **thống nhất auth về `Authorization: Bearer`** cho khớp `/v1/detect/*` + quota ❗HIGH | P0 | key sai → 401; cùng 1 kiểu auth toàn `/v1/*` | ✅ (2026-05-31: key sai→401, X-API-Key cũ→403, key đúng→200; dùng get_api_key_auth + tăng quota) |
| P3.2 | Chặn sysadmin suspend tenant của chính mình ❗HIGH | P0 | thao tác bị 400 | ⬜ |
| P3.3 | `SECRET_KEY` fail-fast nếu còn default ở prod | P1 | raise khi prod + default | ⬜ |
| P3.4 | Rate limiting (enforce `rate_limit_rpm`) trên /v1/detect + /auth | P1 | vượt RPM → 429 | ⬜ |
| P3.5 | Interceptor 401 → logout/redirect login (FE `api.ts`) | P1 | token hết hạn → về login | ⬜ |
| P3.6 | Notifications: emit khi có sự kiện (FAKE/quota/key) + seed; hoặc ẩn nav | P1 | có notification thật / hoặc ẩn | ⬜ |
| P3.7 | Test tối thiểu (pytest): auth, RBAC guard, PII mask, SoD | P1 | ≥10 test pass | ⬜ |
| P3.8 | Chạy `MANUAL_TEST_PLAN.md` đầy đủ, log pass/fail | P0 | bảng kết quả test | ⬜ |
| P3.9 | (optional) đóng invite loop `/auth/accept-invite` | P2 | — | ⏸ |

**Milestone M3:** hệ thống không còn lỗ HIGH + qua manual test → *demo an tâm.*

---

## PHẦN 4 — Báo cáo & Bảo vệ (deliverable nộp)
| ID | Việc cụ thể | Ưu tiên | Phụ thuộc | Done-criteria | Trạng thái |
|---|---|---|---|---|---|
| P4.1 | Dàn ý quyển (6 chương) + thống nhất với GVHD | P0 | — | outline duyệt | ⬜ |
| P4.2 | Ch.1 Mở đầu: bối cảnh deepfake/eKYC, mục tiêu, đóng góp | P0 | P4.1 | bản nháp | ⬜ |
| P4.3 | Ch.2 Tổng quan: deepfake detection, frequency/DCT, attention (FcaNet), eKYC liveness | P0 | P4.1 | ≥10 trích dẫn | ⬜ |
| P4.4 | Ch.3 Phương pháp: B4 + DCT-residual (công thức, kiến trúc, novelty cổng `alpha`) | P0 | — | sơ đồ + công thức | ⬜ |
| P4.5 | Ch.4 Hệ thống: kiến trúc DeepGuard, multi-tenant, RBAC, serving, eKYC | P0 | M2 | sơ đồ kiến trúc + ERD | ⬜ |
| P4.6a | Ch.5a Kết quả **deepfake**: dataset, setup, bảng ablation 4 cấu hình, t-test, robustness nén, Grad-CAM | P0 | M1 | bảng+hình nhúng | ⬜ |
| P4.6b | Ch.5b Kết quả **liveness/eKYC**: ROC, FAR/FRR/EER, calibrate threshold, ablation 3-layer eKYC | P0 | M1B | bảng+hình nhúng | ⬜ |
| P4.7 | Ch.6 Kết luận & hướng phát triển | P0 | P4.6 | bản nháp | ⬜ |
| P4.8 | Sinh hình: ROC, confusion, ablation bar, Grad-CAM, sơ đồ kiến trúc | P1 | M1 | ≥6 hình chất lượng in | ⬜ |
| P4.9 | Slide bảo vệ (15–20 slide) | P0 | P4.2–4.7 | slide hoàn chỉnh | ⬜ |
| P4.10 | Kịch bản demo (app detect bằng model thật + tour RBAC) | P0 | M2,M3 | demo chạy mượt | ⬜ |
| P4.11 | README tái lập (train/eval/serve) + dọn repo (bỏ DeepfakeBench data nặng khỏi git) | P1 | — | clone+chạy được | ⬜ |

**Milestone M4 (FINAL):** quyển + slide + demo + source → **nộp & bảo vệ.**

---

## Thứ tự đề xuất (để không kẹt)
1. **Song song ngay:** P1.1–P1.3 (dựng train) ‖ P3.1–P3.2 (vá 2 HIGH, rẻ) ‖ P4.1/P4.4 (dàn ý + chương Phương pháp — viết được trước khi có kết quả).
2. **Chạy train dài** (P1.5–P1.8) — tốn thời gian nhất → khởi động SỚM.
3. Trong lúc train: P4.2–P4.3 (Mở đầu, Tổng quan) + P3.4–P3.7 (hardening).
4. Có kết quả → P1.9–P1.11 + P2 (nối model) + P4.5–P4.6.
5. Cuối: P4.8–P4.11 + P3.8 (manual test) → M4.

## Phụ thuộc quan trọng (đừng để miss)
- P2 (serve model) **phải đợi** M1 (có checkpoint train xong).
- P4.6 (chương kết quả) **phải đợi** M1.
- P4.10 (demo) **phải đợi** M2 + M3.
- Train (P1.5–P1.7) là **đường găng (critical path)** → bắt đầu trước tiên.
