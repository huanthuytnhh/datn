# Tech Stack — DeepGuard (eKYC Deepfake & Liveness Detection)

Hệ thống đồ án: **phát hiện deepfake + liveness cho eKYC ngân hàng**. Gồm 3 tầng:
**Frontend (Next.js)** → **Backend API (FastAPI)** → **Model serving (PyTorch microservice)**, DB **PostgreSQL**.

```
┌──────────────┐   HTTPS    ┌───────────────┐  httpx   ┌────────────────────┐
│  Frontend    │──────────▶│  Backend API   │────────▶│ SFDCT microservice │
│  Next.js 16  │  fetch     │  FastAPI :8000 │  :8501   │ PyTorch + Grad-CAM │
│  :3000       │◀──────────│  JWT / API-key │◀────────│ (DeepfakeBench)    │
└──────────────┘  JSON      └───────┬────────┘          └────────────────────┘
                                    │ SQLAlchemy async
                              ┌─────▼─────┐
                              │ PostgreSQL │ (deepguard_db)
                              └────────────┘
```

---

## 1. Frontend — Next.js (`/frontend`)

| Hạng mục | Công nghệ | Phiên bản |
|---|---|---|
| **Framework** | Next.js (App Router) · React · TypeScript | 16.1.1 · 19 · 5 |
| **Runtime** | Node.js | v22 |
| **Styling** | Tailwind CSS · tailwindcss-animate · tw-animate-css | 4 |
| **UI kit** | **shadcn/ui** trên **Radix UI** (~30 primitives: dialog, dropdown, select, tabs, tooltip, accordion…) | — |
| **Icons / UX** | lucide-react · cmdk (command) · vaul (drawer) · sonner (toast) · input-otp · embla-carousel · react-resizable-panels | — |
| **State (client)** | **Zustand** (auth, navigation, appearance) | 5 |
| **Data (server)** | **@tanstack/react-query** · @tanstack/react-table | 5 |
| **Forms** | react-hook-form · @hookform/resolvers · **zod** (validation) | 7 · 4 |
| **Animation** | framer-motion | 12 |
| **Charts** | recharts | 2 |
| **Drag & drop** | @dnd-kit (core/sortable/utilities) | — |
| **Markdown/code** | react-markdown · react-syntax-highlighter · @mdxeditor/editor | — |
| **Theme / i18n / date** | next-themes · next-intl · date-fns | — |
| **Image** | sharp | — |
| **Build/lint** | eslint 9 · eslint-config-next · cn (clsx + tailwind-merge + cva) | — |

**API client:** `src/lib/api.ts` — Fetch API thuần, base URL `NEXT_PUBLIC_API_URL` (mặc định `http://localhost:8000`), Bearer JWT + API key.
**Cấu trúc:** `src/app/` (App Router) · `src/components/deepguard/*` (các page) · `src/components/ui/*` (shadcn) · `src/store/*` (Zustand) · `src/lib/*`.

> ⚠️ **Lưu ý (dọn dẹp):** package.json còn `next-auth`, `@prisma/client`/`prisma`, `z-ai-web-dev-sdk` — **scaffold thừa từ template** (app thật dùng JWT custom qua `api.ts` + Zustand, backend FastAPI riêng; KHÔNG dùng NextAuth/Prisma). Nên gỡ để gọn.

---

## 2. Backend — FastAPI (`/backend`)

| Hạng mục | Công nghệ | Phiên bản |
|---|---|---|
| **Framework** | **FastAPI** · **Uvicorn**[standard] | 0.115.5 · 0.32.1 |
| **Runtime** | Python | 3.11 (Docker) / 3.10 (local) |
| **ORM / DB driver** | **SQLAlchemy 2.0** (async) · asyncpg (PostgreSQL) · aiosqlite (SQLite fallback) | 2.0.36 · 0.30 |
| **Database** | **PostgreSQL 15** (Docker `postgres:15-alpine`) | — |
| **DB layer** | gói riêng **`deepguard_db`** (models, crud, `schema.sql`) — dùng chung | — |
| **Auth** | **JWT** (python-jose[cryptography]) + **API key** · passlib[bcrypt] (hash mật khẩu) | — |
| **Validation / config** | **Pydantic 2** · pydantic-settings (`.env`) | 2.10 |
| **HTTP client** | **httpx** (gọi SFDCT microservice) | 0.28 |
| **Upload / ảnh / file** | python-multipart · Pillow · aiofiles · numpy | — |

**API:** prefix `/v1` (API-key auth) + dashboard (JWT + role). Endpoints chính: `/v1/detect/image`, `/v1/detect/video`, `/v1/detect/liveness`, `/v1/ekyc/verify`, + auth/users/tenants/api-keys/analytics/webhooks/audit.
**RBAC:** 5 vai trò (viewer/developer/compliance/admin/sysadmin), `require_role`.
**Chạy:** `uvicorn app.main:app --port 8000`. **Infra:** Docker Compose (api + postgres).

> **ML deps (nạp lazy trong `ml_inference`, KHÔNG ở requirements.txt):** torch, torchvision, opencv-python, mtcnn, albumentations, efficientnet_pytorch. Khi dùng SFDCT microservice thì backend **không cần** torch (chỉ httpx).

---

## 3. Model / Serving — PyTorch (thesis core)

| Hạng mục | Công nghệ |
|---|---|
| **Training framework** | **DeepfakeBench** (PyTorch) — train FF++ c23 → test cross-dataset Celeb-DF-v2 |
| **Mô hình** | **SFDCT** = EfficientNet-B4 (efficientnet_pytorch) + nhánh **block-wise DCT 8×8** + gated cross-attention |
| **Serving** | microservice **FastAPI** `serving/infer_server.py` (:8501) — load ckpt, `POST /predict` → `prob_fake` + REAL/FAKE + **Grad-CAM** (base64) |
| **Giải thích (XAI)** | Grad-CAM · t-SNE · frequency spectrum · gate-α |
| **Liveness** | module standalone `liveness/` (B4 vs B4+block-DCT, LCC-FASD) |
| **Lưu trữ** | model trên **HuggingFace** `huanthuytnhh/deepfake` · data `huanthuytnhh/deepfake-data` |
| **Face detect** | MTCNN (backend) cho crop khuôn mặt |

**Luồng inference:** Frontend upload ảnh → `POST /v1/detect/image` → `run_inference` → (nếu `SFDCT_INFER_URL`) gọi microservice SFDCT → prob thật + Grad-CAM → trả frontend.

---

## 4. Hạ tầng & công cụ

| | |
|---|---|
| **Container** | Docker + docker-compose (backend + PostgreSQL) |
| **Git** | repo `datn` (nhánh dev `dev-thanhln-newfe`, workflow nhánh-riêng-mỗi-task) · repo `DeepfakeBench` (HuggingFace push) |
| **GPU train** | vast.ai (RTX 5090/3090) — train; RTX 3050Ti 4GB local — smoke + liveness |
| **Ports** | frontend 3000 · backend 8000 · SFDCT microservice 8501 · PostgreSQL 5432 |

---

## 5. Tóm tắt 1 dòng (cho slide/báo cáo)

> **Next.js 16 + React 19 + Tailwind/shadcn (Zustand + React Query)** ⟶ **FastAPI + SQLAlchemy async + PostgreSQL (JWT/API-key, RBAC)** ⟶ **PyTorch SFDCT microservice (EfficientNet-B4 + block-DCT + Grad-CAM)**, đóng gói Docker.
