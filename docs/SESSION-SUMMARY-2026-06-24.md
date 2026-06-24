# HANDOFF — DeepGuard (phiên 2026-06-24, chi tiết để session khác continue)

> Đọc file này là nắm đủ để tiếp tục mà không cần lịch sử chat. Repo CHUẨN = **WSL `~/deepguard/app`** (user `huanthuytnhh`), branch **`dev-thanhln-22062026`**.
> Đọc kèm theo thứ tự: (1) file này → (2) `docs/HIEU-SOURCE-DEEPGUARD.md` (hiểu kiến trúc) → (3) `docs/AUDIT-REPORT-2.md` (việc tồn) → (4) `DEV-WORKFLOW.md`.

---

## 0. Bối cảnh dự án (1 phút)

- **Ai:** Lê Ngọc Thanh, SV làm đồ án tốt nghiệp. **Cái gì:** "DeepGuard" — hệ phát hiện **deepfake + liveness cho eKYC ngân hàng** (model SFDCT: DCT spatial-frequency block-wise + cascade liveness).
- **Mục tiêu/triết lý:** demo phải **khớp báo cáo docx + chỉn chu + KHÔNG bug**; KHÔNG cần hardening production. Deploy trên **AWS (Linux x86, CPU instance)** — đã có sẵn 1 EC2 (đang chạy bản cũ `report-finalize`); muốn S3 + CloudWatch, KHÔNG CloudFront.
- **Nguyên tắc bắt buộc "no-vibe-code":** mọi thay đổi phải giải thích **nguyên nhân gốc → sửa gì (file:dòng) → vì sao**, để chủ dự án HIỂU và bảo vệ trước hội đồng. Code do AI sinh nên chủ dự án (intern) không nắm hết → luôn giải thích.
- **Quy ước repo (CLAUDE.md):** branch `dev-{tên}-{feature}` từ `dev`; **KHÔNG** trailer `Co-Authored-By`; **commit chỉ khi được yêu cầu**; file ≤250 dòng; DB chỉ qua package `deepguard_db`.

---

## 1. Môi trường & cách vận hành (PHẦN QUAN TRỌNG NHẤT để continue)

### 1.1 Một bản code duy nhất trong WSL
- Code/chạy/git đều ở **WSL `/home/huanthuytnhh/deepguard/app`** (ext4 — nhanh, có venv Linux + Docker + model, giống AWS).
- Bản Windows `C:\Users\LAPTOP AK\Desktop\thanhln\datn` = **bản cũ, đã ngừng dùng** (chỉ còn để tham khảo, sẽ xoá). **ĐỪNG sửa code ở đó** (gây phân kỳ).
- Sửa code nên dùng **VS Code Remote-WSL** (`code .` trong WSL) hoặc **chạy Claude Code TỪ terminal WSL** (path Linux gốc, hết lỗi CRLF/UNC).

### 1.2 Nếu phiên Claude chạy trên Windows (như phiên này)
Tool Edit/Read/Write truy cập file WSL qua UNC:
`\\wsl.localhost\Ubuntu-24.04\home\huanthuytnhh\deepguard\app\...`
- **GOTCHA CRLF:** Edit/Write qua UNC có thể lật file `.tsx`/`.md` sang CRLF → git diff phình cả file. **Fix sau mỗi lần sửa:** `sed -i 's/\r$//' <file>` rồi kiểm `grep -cP '\r$' file` = 0. Repo ép LF qua `.gitattributes`.
- **Chạy lệnh WSL** (đừng nhồi redirect/`&&`/`$()` inline — hay vỡ "unexpected token"): **Write 1 file `.sh` vào WSL** rồi:
  `wsl.exe -d Ubuntu-24.04 bash -lc 'bash ~/deepguard/app/_x.sh'`  (để `~` trong nháy đơn; KHÔNG dùng absolute `/home/...` vì Git Bash dịch thành `C:/Program Files/Git/home/...`).

### 1.3 Bật/tắt & truy cập
```bash
cd ~/deepguard/app
./up.sh        # bật cả stack, đợi ~60-90s
./down.sh      # tắt + Docker (data giữ nguyên)
tail -f /tmp/backend.log /tmp/serving_*.log /tmp/frontend.log   # log khi chạy
```
| Cổng | Service | | Cổng | Service |
|---|---|---|---|---|
| 3000 | Frontend (Next dev) | | 5432 | Postgres (docker `deepguard-db`) |
| 8000 | Backend FastAPI (`/docs` Swagger) | | 9000/9001 | MinIO/console (docker `deepguard-minio`) |
| 8501 | serving deepfake (SFDCT) | | 8502 | serving liveness |

- **Login dashboard:** `dev@vietbank.vn` / `Password123!`
- **Venv:** `backend/.venv310`, `serving/.venv310` (đều python3.12, tên `.venv310`).
- **Verify python/pytest:** `cd ~/deepguard/app && PYTHONPATH=backend:. SECRET_KEY=test-secret backend/.venv310/bin/python -m pytest backend/tests/ -q` (cần `backend/` cho `app`, root cho `deepguard_db`).
- **Mock vs real model:** backend đọc `SFDCT_INFER_URL`/`LIVENESS_INFER_URL` trong `backend/.env`; trống hoặc `MOCK_ML=true` → kết quả giả theo hash (smoke không GPU). "Heatmap không khả dụng" ở playground = đang mock.

---

## 2. Kiến trúc tóm tắt (chi tiết xem `docs/HIEU-SOURCE-DEEPGUARD.md`)

3 khối + 2 microservice + DB + S3:
- **Frontend** (Next.js, dashboard ngân hàng, JWT) → **Backend** (FastAPI "tổng đài", KHÔNG chạy model) → **serving :8501/:8502** (model THẬT torch) + **Postgres** (qua `deepguard_db`) + **MinIO/S3**.
- **Auth 2 lớp** (cùng header `Authorization: Bearer`): **JWT** cho dashboard (`get_current_user`, RBAC 5 role: sysadmin/admin/developer/compliance/viewer) · **API key** cho app tích hợp ngoài như `ekyc_demo` (`get_api_key_auth`, có quota). Định nghĩa ở `backend/app/dependencies.py`.
- **ekyc_demo** (Streamlit) = app của **dev tenant** gọi API DeepGuard từ ngoài bằng API key (KHÁC dashboard). `deepguard_liveness/ekyc_pipeline.py` = endpoint `/v1/ekyc/verify` 3 lớp (liveness→deepfake→face match, cascade dừng sớm).
- **Deepfake ≠ Liveness:** deepfake = ảnh có bị AI tạo (model SFDCT/DCT). liveness = người thật trước camera (chống in/replay/mặt nạ).

---

## 3. ĐÃ LÀM trong phiên này (chi tiết)

### 3.1 `up.sh` / `down.sh` (đã test OK)
`up.sh`: bật 6 service/7 cổng tuần tự, mỗi bước health-check có timeout (`wait_up`), service nền bằng `setsid` (`svc()`), tự `export LANG=C.UTF-8` (tránh lỗi ký tự `✓`), set biến S3/MinIO. `down.sh`: `fuser -k` app ports + `docker stop` + in trạng thái 7 cổng.

### 3.2 Feature "Liveness thử bằng JWT (bỏ rào API key)" — ĐÃ CODE & VERIFY (chưa commit)
**Vấn đề:** trang Liveness dashboard (đã login JWT) lại bắt tạo API key — vô lý; deepfake playground đã dùng JWT.
**Giải pháp:** thêm `POST /playground/detect/liveness` (JWT, role admin/developer), lưu `api_key_id=NULL, source='playground'`; `/v1/detect/liveness` (API key) giữ nguyên cho tích hợp ngoài.

Các thay đổi (đã verify khớp WSL):
| File | Nội dung |
|---|---|
| `deepguard_db/app/db/models.py:462` | `LivenessCheck.api_key_id` → `nullable=True` + thêm `source: Mapped[str] = mapped_column(String(20), default="api")` |
| `backend/app/routers/_liveness_helpers.py` | `_save_liveness(...)` thêm param `source="api"`; set `source=source` vào row; **chỉ cộng quota key khi `api_key_id is not None`** |
| `backend/app/routers/playground.py` | thêm imports (`io`, `PIL.Image`, `run_liveness_check`, `_save_liveness/_to_response`, `LivenessResponse`, `Request`) + endpoint `playground_detect_liveness` (validate type/size/PIL.verify → `run_liveness_check` → `_save_liveness(api_key_id=None, source="playground")`) |
| `backend/app/schemas/liveness.py` | `LivenessListItem` thêm `source: str = "api"` |
| `backend/tests/test_playground_liveness.py` | doc test (2 test) rule quota: `api_key_id=None → không cộng quota` |
| `frontend/src/lib/api.ts` | `playgroundDetectLiveness(file, threshold?)` (JWT) + `LivenessListItem.source?` |
| `frontend/src/components/deepguard/liveness-page.tsx` | bỏ `useAuthStore` apiKey + gate `if(!apiKey)`, đổi call → `playgroundDetectLiveness(target, threshold)` |
| `frontend/src/components/deepguard/history-page.tsx:205` | `source:'liveness'` → `source: it.source` (để badge Playground hiện đúng; `kind` vẫn là 'liveness') |

**DB local:** đã chạy
```sql
ALTER TABLE liveness_checks ALTER COLUMN api_key_id DROP NOT NULL;
ALTER TABLE liveness_checks ADD COLUMN IF NOT EXISTS source VARCHAR(20) NOT NULL DEFAULT 'api';
```
**Verify (đã chạy thật):**
- pytest toàn bộ: **10 passed**.
- import routers OK; `LivenessListItem.source` tồn tại.
- smoke: login JWT → `POST /playground/detect/liveness` (KHÔNG key) → **200** `verdict=LIVE, model b4-liveness, mode passive` (đã persist check_id).
- `POST /v1/detect/liveness` thiếu key → **403** (không hồi quy).
- `GET /liveness?limit=5` → `source: ['playground','api','api','api']`.
- frontend `tsc --noEmit` → **0 lỗi**.
**CÒN LẠI:** click-through trình duyệt (mở `:3000` → Liveness, tenant chưa có key vẫn chạy → History thấy badge **Playground**). **Chưa commit.**
> **AWS (dữ liệu thật) khi redeploy:** chạy 2 câu `ALTER TABLE` ở trên — TUYỆT ĐỐI không recreate bảng.
Spec/plan: `docs/superpowers/specs/2026-06-24-liveness-playground-jwt-design.md`, `docs/superpowers/plans/2026-06-24-liveness-playground-jwt.md`.

### 3.3 Giải đáp nhanh (đã trả lời, không phải bug)
- **Chọn model ở Playground:** qua query `?model=sfdct|b4|hff` (mặc định sfdct, `detect.py:46`). UI playground CHƯA có dropdown chọn model (chỉ Threshold + DCT Heatmap). Nếu muốn đổi model trong playground → cần thêm dropdown (chưa làm).
- **Lỗi hydration `bis_skin_checked`:** KHÔNG phải bug code — extension trình duyệt chèn attr trước khi React hydrate. Khắc phục: mở Ẩn danh / tắt extension. `layout.tsx` đã có `suppressHydrationWarning` nhưng không chặn node lồng sâu.

### 3.4 Tài liệu hiểu source
`docs/HIEU-SOURCE-DEEPGUARD.md` — sổ tay intern: tổng thể → backend → frontend → ekyc-demo → up/down.sh → "thầy hỏi-trả lời" → bảng "muốn sửa X mở file nào".

### 3.5 Quyết định môi trường + setup (đã thực hiện)
- Chốt **1 bản code trong WSL** (xem §1). Đã thêm `.gitattributes` (`* text=auto eol=lf`), `DEV-WORKFLOW.md`, copy spec/plan/HIEU từ `datn` sang `docs/` WSL.
- Lý do (đã thảo luận): "dev trên Win rồi chuyển WSL khi deploy" CHỈ đúng với stack chạy native trên Win (frontend/.NET). Stack này là Python ML + bash + Docker-Linux → phải dev nơi chạy được. Mô hình 2-bản chính là anti-pattern gây CRLF/lệch. Lời giải = **VS Code Remote-WSL (1 bản)**: editor GUI trên Windows nhưng file/runtime ở WSL.

---

## 4. VIỆC TỒN — Audit #2 → 8 task (chi tiết đầy đủ trong `docs/AUDIT-REPORT-2.md`)

~30 finding mới (đã loại trùng PHASE A-F). Gom thành 8 task, mỗi task = 1 PR test được riêng:

| Task | Mức | Folder | Gồm |
|---|---|---|---|
| **T1** Auth correctness | 🔴 | be | accept_invite bỏ qua `tenant.status` (bypass duyệt) · password cứng `123456` (`_users_helpers.py:53`) · `update_tenant_user` không bảo vệ sysadmin khác |
| **T2** Enforce quota tenant | 🔴 | be | `monthly_quota` không bao giờ chặn — chỉ `+current_usage` rồi hiển thị; thêm 429 ở key-auth + playground |
| **T3** Error mapping đúng | 🟠 | be/serving | `detections.py:39` verdict lạ→500 (nên 400) · `liveness_server.py:85-102` ảnh rác→500→client dịch 503 |
| **T4** Frontend RBAC + History | 🔴 | fe | apikeys/webhooks không gate RBAC nút ghi · chip "Real/Fake" ẩn record liveness (LIVE/SPOOF không normalize) · pagination không clamp |
| **T5** Frontend robustness | 🟠 | fe | models-page `.toFixed` trên null → crash · race set-state thiếu cờ `alive` · detail note dùng chung `error` → mất trang · camera leak khi `play()` lỗi · settings gửi `billing_email:''` |
| **T6** Frontend trung thực/polish | 🟠 | fe | billing toàn dữ liệu fake + nút chết · dashboard counters mâu thuẫn + health hardcode · `key={index}` list có prepend |
| **T7** eKYC pipeline | 🔴 | ekyc | `ekyc_pipeline.py:277-280` `os.unlink(None)` crash/leak · `extract_frames` suffix `.mp4` cho mọi codec · video không có REVIEW · face match `mean` vs hiển thị `max` |
| **T8** Liveness algo + polish | 🟡 | nhiều | blink cuối clip không đếm · ghi chú giới hạn replay/standalone · `.env` quote key · thang đo confidence · `attack_classifier.confidence≈1.0` · **verify class-index** · dọn user_agent/prob_cnn |

**Thứ tự đề xuất:** T1 → T2 → T4 → T7 (HIGH) → T3 → T5 → T6 → T8.
**VERIFY TRƯỚC KHI TIN (quan trọng):**
- **B8** — `serving/liveness_server.py:99-100` giả định `probs[0]=live, probs[1]=spoof`. Nếu train map ngược → **đảo toàn bộ verdict LIVE/SPOOF** (lỗi nặng nhất). Phải đối chiếu config train `model_liveness` TRƯỚC khi làm gì khác.
- **E2/E4** (video không có REVIEW; yaw không chống replay) phần lớn là **giới hạn thuật toán** → có thể chỉ cần **ghi rõ trong báo cáo docx** thay vì sửa code (đỡ rủi ro, đúng tinh thần "demo khớp docx").

---

## 5. Trạng thái git & commit (chưa commit gì)

`git status` (WSL repo) — KHÔNG commit (theo "commit only when asked"). Đang lẫn lộn:
- **Feature liveness-playground** (8 file ở §3.2 + `backend/tests/test_playground_liveness.py`).
- **Setup môi trường** (`.gitattributes`, `DEV-WORKFLOW.md`, các `docs/*.md` mới).
- **Đống PHASE A-F cũ chưa commit** (nhiều file `M`: serving/, deepguard_liveness/, ekyc_demo/app.py, một loạt frontend; untracked `up.sh`/`down.sh`/`RUN_LOCAL_WSL.md`/`docs/AUDIT-REPORT.md`/`backend/tests/`).
→ **Khi commit phải CHỌN PHẠM VI** (chỉ feature liveness, hay cả PHASE A-F). Lý tưởng: tách commit feature riêng. `.gitattributes eol=lf` đã có → muốn dọn LF đồng loạt: `git add --renormalize .`.

---

## 6. Cách tiếp tục (workflow chuẩn cho mỗi task)

Mỗi task nên đi đúng quy trình đã dùng cho feature liveness (đảm bảo no-vibe-code + verify):
1. **brainstorming** skill → chốt thiết kế.
2. **writing-plans** → spec `docs/superpowers/specs/`, plan `docs/superpowers/plans/` (bite-sized, TDD, verify từng bước).
3. **executing-plans** → code trong WSL (nhớ §1.2 gotcha CRLF nếu sửa qua UNC), verify bằng pytest + curl smoke (pattern §1.3).
4. Giải thích từng thay đổi: nguyên nhân → file:dòng → vì sao.

**Gợi ý bước kế:** (A) **verify B8** (class-index liveness) trước vì rủi ro cao nhất → rồi (B) làm loạt HIGH T1 → T2 → T4 → T7.

---

## 7. Index tài liệu (đều trong repo WSL `~/deepguard/app`)
- `docs/SESSION-SUMMARY-2026-06-24.md` — **file này** (handoff).
- `docs/HIEU-SOURCE-DEEPGUARD.md` — sổ tay hiểu source (be/fe/ekyc + up/down + Q&A bảo vệ).
- `docs/AUDIT-REPORT.md` — audit #1 (PHASE A-F, ~37 mục đã fix).
- `docs/AUDIT-REPORT-2.md` — audit #2 (~30 mục mới + 8 task).
- `docs/superpowers/specs/2026-06-24-liveness-playground-jwt-design.md` — spec feature liveness.
- `docs/superpowers/plans/2026-06-24-liveness-playground-jwt.md` — plan feature liveness.
- `DEV-WORKFLOW.md` — quy trình dev 1-bản-WSL + Remote-WSL.
- `RUN_LOCAL_WSL.md` — chạy local.
- `up.sh` / `down.sh` — bật/tắt stack.
- `.gitattributes` — ép LF.
- (Bộ nhớ Claude bền vững ở `…\.claude\projects\…\memory\`: `deepguard-project.md`, `deepguard-api-contract.md`, `wsl-edit-from-windows.md`.)
