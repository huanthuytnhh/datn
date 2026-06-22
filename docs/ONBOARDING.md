# ONBOARDING — Bản đồ & cheat-sheet đọc/sửa repo `datn`

> Dành cho người mới nhận repo và **chưa quen tổ chức source code**.
> Mục tiêu: KHÔNG bắt bạn nhớ 100 file. Bạn chỉ cần nắm **bộ xương 3 tầng + 1 luật vàng**,
> rồi gặp file lạ vẫn đoán đúng nó làm gì, gặp bug vẫn biết mở file nào.
> Đọc theo thứ tự: Phần 1 (tư duy) → 2 (bản đồ app) → 3 (bug→file) → 4 (tự tìm) → 5 (AI & báo cáo) → 6 (bẫy).

---

## 1. Mô hình tư duy — đọc phần này KỸ nhất

### 1.1. Repo này là 3 dự án xếp chồng, KHÔNG phải 1
| Tầng | Thư mục | Làm gì | Ngôn ngữ |
|---|---|---|---|
| 🟦 **AI** (nghiên cứu) | `DeepfakeBench/` | Train + đánh giá model deepfake/liveness | Python scripts |
| 🟨 **Báo cáo** (bằng chứng) | `report/`, `DeepfakeBench/report_prepare/` | Sinh số/bảng/hình từ kết quả train | Python + Markdown |
| 🟩 **App** (sản phẩm) | `backend/`, `frontend/`, `deepguard_db/` | Nền tảng eKYC DeepGuard (web + API) | FastAPI + Next.js + Postgres |

👉 Khi lạc, câu hỏi đầu tiên luôn là: **"Mình đang ở tầng nào?"** Ba tầng gần như độc lập — sửa app không đụng AI, và ngược lại.

### 1.2. LUẬT VÀNG: mỗi file = 1 trách nhiệm ở 1 lớp
App được tổ chức theo **layering** (xem `CONVENTIONS.md`). Một request đi qua các lớp xếp tầng, **mỗi lớp 1 file riêng**:

```
[Giao diện]      frontend/src/components/...-page.tsx   ← người dùng bấm nút
      │
[API client]     frontend/src/lib/api.ts               ← gói HTTP request, gắn token
      │ (HTTP)
[Cửa vào BE]     backend/app/routers/<tài_nguyên>.py    ← nhận request, kiểm quyền
      │
[Logic nghiệp vụ] backend/app/services/<...>.py         ← xử lý, gọi model AI
      │
[Truy cập DB]    deepguard_db/app/db/crud.py            ← câu lệnh đọc/ghi DB (CHỖ DUY NHẤT)
      │
[Bảng dữ liệu]   deepguard_db/app/db/models.py          ← định nghĩa cấu trúc bảng
```

**Hệ quả cực kỳ hữu ích:** lỗi nằm ở lớp nào thì sửa file lớp đó. Quyền sai → `routers/` hoặc `rbac.ts`. Tính toán sai → `services/`. Dữ liệu sai/thiếu cột → `crud.py`/`models.py`. Nút bấm/hiển thị sai → `*-page.tsx`. **Không bao giờ sửa logic nghiệp vụ trong router, không bao giờ viết SQL ngoài `crud.py`.**

### 1.3. Hai loại "khoá cửa" (auth) — hay nhầm
- **JWT** (token đăng nhập dashboard): dùng cho web. Định nghĩa ở `backend/app/dependencies.py::get_current_user` + `require_role(...)`.
- **API-key** (khoá `sk-dg...`): dùng cho tích hợp ngoài, gọi `/v1/detect/*`. Định nghĩa ở `dependencies.py::get_api_key_auth`.
- Quy tắc: trang dashboard + `/playground/*` → **JWT**; `/v1/detect/*` → **API-key**.

---

## 2. Bản đồ app theo *dòng đi của 1 request* (vd: "phân tích 1 ảnh")

Đọc bảng này theo thứ tự trên→dưới = đúng đường request chạy. Mỗi dòng = 1 file + nó chứa gì.

| # | File | Chứa gì (1 dòng) |
|---|---|---|
| 1 | `frontend/src/components/deepguard/playground-page.tsx` | Trang upload ảnh, nút "Phân tích", hiển thị kết quả |
| 2 | `frontend/src/lib/api.ts` | Hàm `req<T>()` (dòng 8) gắn `Authorization: Bearer <token>`; mọi hàm gọi API ở đây (`playgroundDetectImage`, `authLogin`...) |
| 3 | `backend/app/main.py` | Đăng ký TẤT CẢ router (dòng 57–77). Muốn biết endpoint nào tồn tại → xem đây |
| 4 | `backend/app/routers/playground.py` (JWT) **hoặc** `routers/detect.py` (API-key) | Nhận request, kiểm quyền, gọi service. `detect.py:45` gọi `run_inference` |
| 5 | `backend/app/dependencies.py` | Cửa kiểm quyền: `get_current_user` (JWT), `get_api_key_auth`, `require_role`, `require_sysadmin` |
| 6 | `backend/app/services/ml_inference.py` | `run_inference()` (dòng 163) / `run_video_inference()` — gọi microservice SFDCT qua `httpx.post(SFDCT_INFER_URL + "/predict")` (dòng 138) |
| 7 | `backend/app/config.py` | `Settings`: `SFDCT_INFER_URL` (rỗng=trả mock; set `http://127.0.0.1:8501`=gọi model thật), `DATABASE_URL`, `SECRET_KEY`, token hết hạn 60' |
| 8 | `backend/app/services/risk.py` | Quy `prob_fake` → `risk_score` / `risk_band` (pass/review/reject) |
| 9 | `deepguard_db/app/db/crud.py` | Ghi bản ghi detection, cộng quota... (mọi lệnh DB) |
| 10 | `deepguard_db/app/db/models.py` | Bảng `Detection`, `User`, `ApiKey`, `Tenant`... + enum (`UserRole`, `DetectionVerdict`) |
| 11 | `backend/app/schemas/detect.py` | Hình dạng JSON trả về (`DetectionResponse`) — Pydantic |

**Phía frontend, "trang nào → file nào":**
- `frontend/src/app/page.tsx` — SPA **1 route duy nhất**; biến `currentPage` quyết định render component nào (dòng 140–166). `standalonePages` (landing/login/register/accept-invite) không cần đăng nhập.
- `frontend/src/lib/rbac.ts` — **nguồn chân lý phân quyền UI**: `PAGE_ACCESS` (trang nào role nào vào được), `canAccess`, `canEdit`, `defaultPageFor`.
- `frontend/src/store/navigation.ts` — giữ `currentPage`. `store/appearance.ts` — theme.
- `frontend/src/components/deepguard/<tên>-page.tsx` — mỗi trang 1 file (login, dashboard, team, tenants, history, detail, audit...).

---

## 3. Cheat-sheet BUG → MỞ FILE NÀO TRƯỚC

| Triệu chứng | Mở trước (theo thứ tự) | Cách xác nhận |
|---|---|---|
| Đăng nhập lỗi 401 / token sai | `backend/app/routers/auth.py` → `core/security.py` → `dependencies.py` | Thử `POST /auth/login` trên `/docs` |
| "Không có quyền" / trang bị chặn sai | FE: `lib/rbac.ts` (`PAGE_ACCESS`); BE: `dependencies.py` (`require_role`) | So role với bảng trong `ROLE_FLOWS.md` |
| Detect trả kết quả **giả/luôn giống nhau** | `backend/app/config.py` → `SFDCT_INFER_URL` đang **rỗng** = mock | Set biến môi trường rồi xem `ml_inference.py:138` có gọi :8501 |
| Detect lỗi 500 khi gọi model | `services/ml_inference.py` / `ml_video.py` (microservice :8501 chết?) | Check serving SFDCT có chạy; xem log `[DeepGuard] SFDCT :8501 lỗi` |
| Số liệu/quota sai trong DB | `deepguard_db/app/db/crud.py` → `models.py` | Query thẳng Postgres đối chiếu |
| Thiếu cột / lỗi migrate DB | `deepguard_db/app/db/models.py` + `schema.sql` | So 2 file phải khớp |
| Trang trắng / FE crash | `frontend/src/app/page.tsx` (route) → component `*-page.tsx` tương ứng | Mở DevTools Console xem stack trace |
| Gọi API từ FE bị CORS/sai URL | `frontend/src/lib/api.ts` (base URL) + `config.py` `CORS_ORIGINS` | Network tab xem request thật |
| Endpoint mới "không tồn tại" (404) | `backend/app/main.py` — quên `include_router`? | Xem danh sách dòng 57–77 |
| Reload xong rớt về landing | `frontend/src/app/page.tsx` effect dòng 119–124 + `store/navigation.ts` | — |

---

## 4. Công thức TỰ TÌM bất kỳ thứ gì (để không phụ thuộc bảng trên)

Khi gặp việc lạ, hỏi 3 câu rồi `grep`:

1. **Tầng nào?** Giao diện→FE · logic API→`routers`/`services` · dữ liệu→`crud`/`models` · model AI→`DeepfakeBench/training/detectors`.
2. **Tài nguyên/trang nào?** (vd `detect`, `users`, `tenants`, `liveness`)
3. **FE hay BE?**

Rồi tìm bằng `rg` (ripgrep) — luôn lần ra file:
```bash
# Tìm endpoint backend xử lý detect ảnh:
rg "detect/image|def detect_image" backend/app/routers
# Tìm chỗ frontend gọi nó:
rg "detect/image|playgroundDetect" frontend/src/lib
# Tìm định nghĩa 1 hàm/biến bất kỳ:
rg "def run_inference" backend
rg "PAGE_ACCESS" frontend/src
```
👉 Quy tắc: **đi từ chuỗi bạn THẤY trên UI hoặc URL** (vd nhãn nút, đường dẫn `/v1/detect/image`) rồi `rg` chuỗi đó — nó dẫn thẳng tới file.

---

## 5. Tầng AI & Báo cáo (gọn — cùng khuôn skeleton + bug→file)

### 5.1. AI — `DeepfakeBench/`
| File | Chứa gì |
|---|---|
| `training/train.py` | Entry train: `argparse` `--detector_path` (1 yaml) `--train_dataset` `--test_dataset`; dựng `Trainer` + `DETECTOR` |
| `training/trainer/trainer.py` | Vòng train + **`save_best` (dòng ~375)**: framework **KHÔNG có tập val**, chọn checkpoint theo test (best-on-test). Đây là lõi câu chuyện "phản biện hội đồng vì sao không chia val" |
| `training/config/detector/*.yaml` | Mỗi thí nghiệm = 1 yaml: `efficientnetb4_repro` (baseline B4), `efficientnetb4_sfdct` (method chính), `efficientnetb4_hff(_r1)` (biến thể) |
| `training/detectors/efficientnetb4_sfdct_detector.py` + `sfdct_core.py` | Model SFDCT: nhánh block-DCT + `GatedCrossAttnFusion` (gate `alpha` **init 0** ⇒ lúc đầu = đúng B4, "floor ≥ B4") |
| `training/detectors/efficientnetb4_detector.py` | Baseline B4 để đối chiếu (mọi Δ so với nó) |
| `training/test.py` | Entry đánh giá |
| `dataset_json/` (gốc datn) | Mô tả dataset dạng JSON 4 tầng (filename→nhóm nhãn→split→frames) |
| `start.sh` | Runner 1 lệnh trên vast: `setup→data→smoke→train`, tự push kết quả |

**AI bug→file:** model học sai/lỗi forward → `detectors/*.py`; sai metric/chọn ckpt → `trainer.py`; sai dataset/đường dẫn → yaml + `dataset_json/`.

### 5.2. Báo cáo — `report/` + `DeepfakeBench/report_prepare/`
| File | Chứa gì |
|---|---|
| `report/_en_v2/SKELETON.md` | **"Hợp đồng số liệu"**: số canonical + ràng buộc liêm chính (không claim SOTA…). Mọi chương phải khớp |
| `report/_en_v2/01..05_*.md` | Source từng chương; `report/THESIS_REPORT_EN.md` = bản ghép (sửa ở source rồi mirror) |
| `report/evidence/ablation_cdfv2/README.md` | Manifest: mỗi con số ↔ file log/pickle ↔ link HuggingFace |
| `report_prepare/mt10_ablation_full.py` | Tái lập bảng ablation 7 model × 4 giao thức |
| `report_prepare/mt11_operating_points.py` | TPR@FPR≤5%, ngưỡng τ eKYC |
| `report_prepare/mt12_report_figures.py` + `mt13_grid_figures.py` | Sinh toàn bộ hình ở `report/figures_final/` (1 lệnh) |

**Báo cáo bug→file:** số trong báo cáo sai → chạy lại `mt10`/`mt11` đối chiếu, lần về `evidence/`; hình xấu → sửa `mt12`/`mt13` rồi sinh lại.

---

## 6. Quy tắc sống còn (đọc kẻo vấp)
- **`CONVENTIONS.md` (gốc datn)** là luật bắt buộc cho app: file code **≤250 dòng**, layering `router→service→crud→db`, **chỉ `deepguard_db` được truy cập DB**, branch `dev-{tên}-{feature}`, **KHÔNG** trailer Co-Authored-By, **chỉ commit khi được yêu cầu**.
- **`SFDCT_INFER_URL` rỗng = backend trả kết quả MOCK** (giả). Demo mà thấy điểm "lạ giống nhau" → kiểm biến này trước tiên, không phải lỗi model.
- **Checkpoint B4 CẤM dùng** từ `runs/20260605-230747/ckpt/efficientnetb4/` (bản upload lỗi, trùng byte với SFDCT). Nguồn B4 đúng: `runs/naive-20260605-233339/b4/ckpt/`. Chi tiết: `report/evidence/ablation_cdfv2/README.md`.
- **Thư mục KHÔNG cần học / đừng sửa nhầm:** `DeepfakeBench2805/`, `2905/`, `glm_deepfake/`, `HarmonySeeker-*/` (bản cũ / dự án tham khảo).
- Đừng sửa file là **symlink** trong các skill ARIS (trỏ vào `~/aris_repo`).

---

## Phụ lục — Decision log (vì sao tài liệu này như vậy)
- **Sắp theo dòng request, không theo ABC** → người mới nhớ vai trò file tốt hơn vì gắn với hành động thật.
- **Có "công thức tự tìm" (Phần 4)** → để tài liệu còn dùng được kể cả khi bảng bug→file chưa phủ hết.
- **App sâu nhất, AI/báo cáo gọn** → đúng nơi bạn dễ gặp bug khi chạy/demo (theo yêu cầu).
- **Top 7 file nếu chỉ kịp đọc 7:** `THESIS_PROGRESS_TRACKER.md` · `trainer.py` (save_best) · `sfdct_core.py` · `evidence/ablation_cdfv2/README.md` · `mt10_ablation_full.py` · `_en_v2/SKELETON.md` · `CONVENTIONS.md`.

*Mọi đường dẫn/dòng trong tài liệu này được verify từ file thật tại thời điểm viết (2026-06-10). Nếu code đổi, số dòng có thể lệch — dùng `rg` (Phần 4) để xác nhận lại.*
