# Conventions — DeepGuard (kiến trúc & code standards)

Quy ước **bất biến** cho dự án. Mọi feature/PR phải tuân thủ. (Xem stack ở `TECH_STACK.md`.)

---

## 0. Architecture & Flow (bất biến)

- **Request flow một chiều:** `Frontend (fetch api.ts) → FastAPI /v1/ → Service → Repository (SQLAlchemy async) → PostgreSQL`. **Không shortcut**, không gọi DB thẳng từ router.
- **SFDCT microservice (:8501) là black-box** — backend chỉ giao tiếp qua `httpx POST /predict`. **Không import torch/torchvision vào backend chính**; ML deps chỉ **lazy-load trong `ml_inference`**.
- **Mọi route có prefix** `/v1/` (API-key auth) **hoặc** `/dashboard|/<resource>` (JWT + role). **Không expose route naked không auth** (trừ `/health`, `/`).

---

## 1. Backend — FastAPI

- **Auth chia 2 loại rõ ràng:** external client → **API-key**; internal dashboard → **JWT Bearer**. Không lẫn guard giữa 2 loại.
- **RBAC bằng `require_role`** — 5 vai trò: `viewer / developer / compliance / admin / sysadmin`. **Mỗi endpoint khai báo role tối thiểu**, không để open.
- **Pydantic v2 tách `Create / Read / Update`** riêng. Không tái dùng 1 schema cho cả input lẫn output.
- **DB access chỉ qua `deepguard_db`** (models, crud, `schema.sql`). **Không raw SQL** rải trong service. **SQLAlchemy async** — không sync session.
- **Env qua `pydantic-settings` (`config.py`)**. Không hardcode URL/secret/port ở bất kỳ đâu, kể cả test.
- **File ≤ 250 dòng** — tách module theo trách nhiệm (vd `ml_inference` → `ml_efficientnet`/`ml_model`/`ml_video`; router lớn → `_helpers.py` + router phụ).

---

## 2. Frontend — Next.js

- **KHÔNG NextAuth / @prisma/client** — scaffold thừa từ template, **gỡ**. Auth hoàn toàn qua `src/lib/api.ts` (Fetch + Bearer JWT + API key) + **Zustand**.
- **Server Component mặc định.** Thêm `"use client"` **chỉ khi** cần event handler / hook / Zustand. Không client component bừa bãi.
- **Data fetching luôn qua TanStack Query** (`useQuery`/`useMutation`). **Không** fetch trong component body, **không** `useEffect` để fetch.
- **Zustand chỉ cho 3 thứ:** `auth`, `navigation`, `appearance`. **Server data** (detect result, user list…) **không** vào Zustand — để React Query cache.
- **Validate form bắt buộc** qua `react-hook-form + zod`. Không validate thủ công bằng `if/else` trong submit handler.
- **File ≤ 250 dòng** (logic/component). File **data/config catalog** có thể lớn hơn (chấp nhận).

---

## 3. Model / Inference

- **Một đường duy nhất:** `POST /v1/detect/image → run_inference() → check SFDCT_INFER_URL → microservice → {prob_fake, label, gradcam_b64}`. Không đường tắt.
- **Face crop bắt buộc bằng MTCNN** trước khi đẩy vào SFDCT. Không infer ảnh raw chưa crop mặt.
- **Grad-CAM trả base64 trong JSON** — không lưu file tạm, không expose đường dẫn file.

---

## 4. Infra & Dev

- **Chạy local bằng `docker-compose`** (api + postgres). Không chạy `uvicorn` thủ công khi dev — để Compose quản port/network.
- **Migration schema chỉ qua `schema.sql`** trong `deepguard_db`. **Không** `Base.metadata.create_all()` trong production.
- **Feature mới → nhánh riêng từ dev:** pattern `dev-{tên}-{feature}`. **Không commit thẳng `dev`/`main`.** Merge về `dev-thanhln-newfe`. **Không** thêm trailer `Co-Authored-By`.

---

## 5. Trạng thái tuân thủ (audit 2026-06-06)

| Rule | Trạng thái |
|---|---|
| BE không raw SQL (qua crud) · async only | ✅ tuân thủ |
| BE file ≤250 (ml_inference, users, liveness đã tách) | ✅ tuân thủ |
| FE không fetch raw trong component | ✅ (chỉ false-positive: string snippet / blob ảnh) |
| **FE gỡ next-auth/prisma/z-ai-sdk** (0 import) | ⏳ **TODO**: `npm rm next-auth @prisma/client prisma z-ai-web-dev-sdk` rồi `npm install` |
| **FE useEffect-fetch** (account/liveness/apikeys) | ⏳ **TODO**: chuyển sang `useQuery` |
| **BE service layer** (router gọi crud thẳng) | ⏳ **NÊN**: thêm `services/<resource>.py` mỏng giữa router ↔ crud (làm dần, không gấp) |
| FE ~20 page > 250 dòng | ⏳ refactor theo wave (mỗi page 1 nhánh + `npm run build`) |
