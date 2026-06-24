# Bài Giảng 5 Chương — Hiểu Toàn Bộ Dự Án DeepGuard
> Dành cho intern / người mới — không vibe code, mọi khẳng định đều có file:dòng kèm theo.
> Đọc theo thứ tự chương 1→5. Mỗi chương có phần "Hội đồng hỏi" ở cuối để ôn thi.

---

# CHƯƠNG 1: BỨC TRANH TỔNG THỂ

## 1.1 DeepGuard là gì và tại sao tồn tại

DeepGuard là hệ thống **phát hiện deepfake + xác thực liveness** cho quy trình **eKYC ngân hàng** (electronic Know Your Customer — định danh khách hàng từ xa). Đây là đồ án tốt nghiệp ngành AI Engineering của Le Ngoc Thanh.

**Bài toán thực tế:** Khi khách hàng mở tài khoản ngân hàng online, họ chụp ảnh CCCD và quay video selfie. Rủi ro:
- Ảnh CCCD có thể là ảnh in/giả mạo
- Selfie có thể là deepfake (AI tạo ra)
- Video có thể là replay (phát lại video cũ trước camera)

Thông tư 17/2024/TT-NHNN của NHNN yêu cầu FPR ≤ 5% (tỷ lệ nhận nhầm giả thành thật không quá 5%).

**DeepGuard giải quyết:** Cascade 3 lớp — Liveness → Deepfake → Face Match.

---

## 1.2 Repo có 3 tầng độc lập — đừng nhầm

```
repo/
├── DeepfakeBench/     ← Tầng AI: train + đánh giá model (Python scripts)
├── report/            ← Tầng báo cáo: sinh số liệu/bảng/hình cho luận văn
└── app/               ← Tầng App: nền tảng eKYC DeepGuard (WEB + API)
    ├── backend/       ← FastAPI :8000
    ├── frontend/      ← Next.js :3000
    ├── serving/       ← Model microservice :8501 (deepfake), :8502 (liveness)
    ├── deepguard_db/  ← DB package dùng chung
    └── deepguard_liveness/  ← eKYC pipeline 3 lớp
```

**Quy tắc vàng:** Sửa app KHÔNG đụng DeepfakeBench. Train model KHÔNG đụng backend. Ba tầng gần như độc lập.

Khi được hỏi về bất cứ điều gì — câu hỏi đầu tiên: **"Mình đang ở tầng nào?"**

---

## 1.3 Kiến trúc App — 6 service, 7 cổng

```
Trình duyệt (nhân viên ngân hàng)
    │ HTTP JWT
    ▼
[FRONTEND :3000]  Next.js — dashboard quản trị
    │ HTTP JWT
    ▼
[BACKEND :8000]   FastAPI — "tổng đài" điều phối
    │ httpx HTTP          │ SQL (qua deepguard_db)
    ▼                     ▼
[SFDCT :8501]    [LIVENESS :8502]    [Postgres :5432]  [MinIO :9000/:9001]
Model deepfake    Model liveness       Dữ liệu           Heatmap + ảnh

App của dev tenant (ekyc_demo / Streamlit)
    │ HTTP API Key
    ▼
[BACKEND :8000]  ← cùng backend, khác auth
```

**Điểm cốt lõi phải thuộc:**
- Backend **KHÔNG chạy model AI**. Nó chỉ là tổng đài: nhận request → gọi `:8501`/`:8502` → ghi DB → trả kết quả.
- Có **2 loại khách** gọi backend: nhân viên ngân hàng (JWT) và app tích hợp ngoài (API key).

---

## 1.4 Cascade eKYC — luồng 3 lớp bảo vệ

```
Upload CCCD + video selfie
        │
        ▼
[1] LIVENESS CHECK (serving :8502)
        │ SPOOF / UNCERTAIN → FAIL ngay (dừng, không xử lý tiếp)
        │ LIVE ──────────────────────────────────────────────────┐
        ▼                                                         │
[2] DEEPFAKE DETECT (serving :8501)                              │
        │ FAKE → FAIL                                             │
        │ REAL ───────────────────────────────────────────────┐  │
        ▼                                                      │  │
[3] FACE MATCH (ArcFace)                                       │  │
        │ NO MATCH → FAIL                                      │  │
        │ MATCH ────────────────────────────────────────────┐  │  │
        ▼                                                    ▼  ▼  ▼
    overall_pass = True                               overall_pass = False
```

**Vì sao cascade dừng sớm?** Chặn ảnh in/replay ngay ở liveness → tiết kiệm tính toán + đúng logic bảo mật (không phí công soi deepfake một bức ảnh in).

Code: `deepguard_liveness/ekyc_pipeline.py` — hàm `ekyc_verify()`.

---

## 1.5 Khởi động và tắt toàn hệ

```bash
cd ~/deepguard/app
./up.sh    # bật 6 service theo thứ tự, mỗi bước có health-check (timeout 90s)
./down.sh  # tắt tất cả, giữ nguyên data Postgres/MinIO
```

`up.sh` khởi động theo thứ tự: Postgres → MinIO → serving deepfake → serving liveness → backend → frontend.

Log: `tail -f /tmp/backend.log /tmp/serving_*.log /tmp/frontend.log`

Login demo: `dev@vietbank.vn / Password123!`

---

## Hội đồng hỏi — Chương 1

**Q: Backend có chạy AI không?**
> Không. Backend là tổng đài: nhận request → gọi microservice model (:8501/:8502) qua HTTP → ghi kết quả vào DB → trả về. Model nặng (torch ~70MB) chạy riêng ở `serving/`. Tách để: restart backend không mất 30s load model, model crash không kéo toàn hệ thống chết.

**Q: Vì sao 2 lớp auth?**
> JWT cho nhân viên ngân hàng đã login (có danh tính + role, hết hạn 60 phút). API key cho app tích hợp ngoài (không có phiên đăng nhập, định danh theo app, có quota). Một tenant có thể dùng cả hai.

**Q: Cascade eKYC là gì, vì sao?**
> Liveness trước: SPOOF→FAIL dừng ngay. LIVE→mới chạy deepfake. REAL→mới face match. Dừng sớm để chặn tấn công trình bày + tiết kiệm tính toán.

---

# CHƯƠNG 2: TẦNG DỮ LIỆU

## 2.1 Vì sao `deepguard_db/` là package riêng

Backend không tự viết SQL. Mọi truy cập DB đi qua package `deepguard_db/`. Lý do:

1. **Nhiều nơi dùng chung:** backend router, background job, ekyc_pipeline — tất cả import chung 1 package → không duplicate code
2. **Tập trung schema:** đổi bảng chỉ sửa 1 chỗ (`models.py`), không phải tìm SQL rải rác
3. **Dễ test:** mock hàm `crud.*` là mock được toàn bộ DB layer

```
deepguard_db/app/db/
├── models.py    ← định nghĩa 12 bảng (schema thật duy nhất)
├── database.py  ← engine async, get_db(), init_db()
└── crud.py      ← CHỖ DUY NHẤT gọi DB (không raw SQL ở nơi nào khác)
```

---

## 2.2 `models.py` — 12 bảng, hiểu cấu trúc cây

Bảng **Tenant** là gốc. Mọi bảng khác đều có `tenant_id` FK trỏ về Tenant với `ondelete="CASCADE"`.

```
Tenant (gốc — ngân hàng/fintech)
  ├── User         (nhân viên dashboard)
  ├── ApiKey       (key tích hợp ngoài)
  ├── Detection    (mỗi lần gọi /v1/detect/image → 1 row)
  ├── LivenessCheck (mỗi lần check liveness → 1 row)
  ├── Job          (async video processing)
  ├── Webhook      (cấu hình webhook)
  ├── Invitation   (mời user vào tenant)
  ├── WebhookDelivery (log giao webhook)
  ├── AuditLog     (mọi hành động audit)
  ├── ModelVersion (model versions + A/B test)
  └── Notification (in-app notification)
```

`ondelete="CASCADE"` ở dòng 176: xóa Tenant → xóa hết data của tenant đó tự động.

**Multi-tenant isolation:** Mọi query phải filter `tenant_id`. Code backend luôn dùng `user.tenant_id` (lấy từ JWT đã verify), không bao giờ nhận `tenant_id` từ client → Tenant A không thể xem data Tenant B.

---

## 2.3 Mixin và Enum quan trọng

**TimestampMixin** (dòng 50-63 `models.py`):
```python
class TimestampMixin:
    created_at: Mapped[datetime] = mapped_column(server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(onupdate=func.now())
```
Mọi bảng kế thừa `TimestampMixin` đều có 2 cột này tự động. Không cần set thủ công.

**Enum cần thuộc lòng:**
```python
class UserRole(str, Enum):
    VIEWER     = "viewer"      # chỉ xem
    DEVELOPER  = "developer"   # tích hợp API
    COMPLIANCE = "compliance"  # audit
    ADMIN      = "admin"       # quản trị tenant
    SYSADMIN   = "sysadmin"    # DeepGuard ops (xuyên tenant)

class TenantStatus(str, Enum):
    PENDING   = "pending"    # chờ sysadmin duyệt
    ACTIVE    = "active"
    SUSPENDED = "suspended"  # bị tạm ngưng
    DELETED   = "deleted"

class DetectionVerdict(str, Enum):
    REAL = "REAL"  |  FAKE = "FAKE"  |  UNCERTAIN = "UNCERTAIN"

class LivenessVerdict(str, Enum):
    LIVE = "LIVE"  |  SPOOF = "SPOOF"  |  UNCERTAIN = "UNCERTAIN"
```

---

## 2.4 Bảng Detection — bảng quan trọng nhất cho demo

Mỗi lần gọi `/v1/detect/image` → 1 row trong bảng `detections`. Đây là bằng chứng audit.

**Field quan trọng (dòng 285-336):**
```python
prob_fake: float        # số thô từ model (0.0 → 1.0)
verdict: DetectionVerdict  # REAL / FAKE / UNCERTAIN (từ threshold)
confidence: float       # 0-100 (scale của prob_fake)
image_hash: str         # SHA-256 của ảnh gốc — KHÔNG lưu ảnh
image_thumb: Text       # base64 JPEG ~320px — lưu thẳng DB
heatmap_url: str        # S3 link Grad-CAM (nếu có)
source: str             # "api" hoặc "playground" (phân biệt nguồn)
model_version: str      # version model dùng lúc detect
```

**Tại sao không lưu ảnh gốc?** Compliance — ảnh CCCD là dữ liệu cá nhân nhạy cảm. Chỉ lưu hash (để biết ảnh có bị submit lại không) và thumbnail nhỏ (để audit xem).

---

## 2.5 `database.py` — kết nối async

```python
# Tạo engine async PostgreSQL:
engine = create_async_engine(settings.DATABASE_URL, echo=settings.DB_ECHO)

# Dependency inject vào mọi router:
async def get_db() -> AsyncSession:
    async with AsyncSessionLocal() as session:
        yield session
        # session tự close sau khi request xong

# Gọi 1 lần khi server start (trong lifespan của main.py):
async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
```

`get_db()` được inject qua `Depends(get_db)` trong mọi router. FastAPI tự quản lý lifecycle.

---

## 2.6 `crud.py` — luật bất di bất dịch

**Không bao giờ viết SQL trực tiếp trong router.** Chỉ gọi hàm trong `crud.py`.

Ví dụ pattern:
```python
# ĐÚNG (trong router):
detection = await crud.create_detection(db, tenant_id=..., verdict=..., ...)

# SAI — không bao giờ làm thế này trong router:
await db.execute("INSERT INTO detections ...")
```

Hàm quan trọng trong crud.py:
- `validate_api_key(db, plain_key)` — SHA-256 hash → tìm trong DB
- `create_detection(db, ...)` — ghi 1 row detection
- `create_liveness_check(db, ...)` — ghi 1 row liveness
- `increment_tenant_usage(db, tenant_id)` — +1 current_usage
- `get_tenant(db, tenant_id)` — lấy thông tin tenant
- `write_audit_log(db, action, ...)` — ghi AuditLog

---

## Hội đồng hỏi — Chương 2

**Q: Vì sao tách `deepguard_db` thành package riêng không gộp vào backend?**
> Backend, job, ekyc_pipeline dùng chung. Tập trung schema, dễ test bằng mock. Không raw SQL rải rác.

**Q: Multi-tenant isolation hoạt động thế nào?**
> Mọi bảng có `tenant_id`. Code luôn lấy `tenant_id` từ `user.tenant_id` (đã verify qua JWT), không nhận từ client. `ondelete=CASCADE` đảm bảo xóa tenant là xóa hết data.

**Q: Tại sao không lưu ảnh gốc trong DB?**
> CCCD là dữ liệu cá nhân nhạy cảm (GDPR/PDPA). Chỉ lưu SHA-256 hash để audit dedup, thumbnail ~320px để compliance review, heatmap URL trên S3 (max 90 ngày).

---

# CHƯƠNG 3: BACKEND FASTAPI

## 3.1 Thứ tự build và dependency

```
config.py          ← đọc .env, không phụ thuộc gì
    │
core/security.py   ← dùng config.SECRET_KEY
core/exceptions.py ← không phụ thuộc gì
core/audit.py      ← dùng crud (gọi write_audit_log)
    │
dependencies.py    ← dùng security + crud + exceptions
    │
services/          ← dùng config + exceptions + crud
    │
routers/           ← dùng dependencies + services + crud
    │
main.py            ← đăng ký tất cả router vào FastAPI app
```

Đọc theo thứ tự này = hiểu tại sao mỗi file cần những file trước đó.

---

## 3.2 `config.py` — công tắc tổng của hệ thống

`config.py` là file quyết định hệ thống **chạy model thật hay giả**, token hết hạn bao lâu, ngưỡng deepfake ở đâu.

**Biến quan trọng nhất:**
```python
SFDCT_INFER_URL: str = ""
# Rỗng → backend dùng mock (kết quả giả, xác định theo hash ảnh)
# "http://127.0.0.1:8501" → backend gọi model SFDCT thật

LIVENESS_INFER_URL: str = ""  # tương tự cho liveness

MOCK_ML: bool = True
# True → luôn mock dù có MODEL_PATH
# Thứ tự ưu tiên: SFDCT_INFER_URL > MOCK_ML=False > MODEL_PATH

SECRET_KEY: str = "dev-secret-key-..."
# Dùng ký JWT. In ra warning nếu vẫn dùng default khi start.

MODEL_THRESHOLD: float = 0.35
# prob_fake >= 0.35 → FAKE (ngưỡng calibrate từ luận văn)

LIVENESS_THRESHOLD: float = 0.125
# P(live) < 0.125 → SPOOF (nới rộng cho webcam OOD)
```

`@lru_cache` ở `get_settings()` = Settings chỉ parse 1 lần khi start. Đổi `.env` phải restart mới có hiệu lực.

**Dấu hiệu đang chạy mock:** kết quả detect giống nhau với mọi ảnh giống nhau (hash-seeded). Kiểm tra: `curl http://localhost:8000/health` → xem `SFDCT_INFER_URL` có được set không.

---

## 3.3 `core/security.py` — JWT và bcrypt

**Tạo JWT khi login thành công:**
```python
def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    to_encode["exp"] = now + timedelta(minutes=60)  # hết hạn 60 phút
    return jwt.encode(to_encode, SECRET_KEY, algorithm="HS256")
# data thường là: {"sub": str(user.id)}
```

**Giải mã JWT (dùng trong get_current_user):**
```python
def decode_token(token: str) -> Optional[dict]:
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
    except JWTError:
        return None   # token sai chữ ký hoặc đã hết hạn
```

**Bcrypt cho mật khẩu:**
```python
hash_password("Password123!")  → "$2b$12$abc..."  # 1 chiều, không đảo ngược
verify_password("Password123!", "$2b$12$abc...")   → True/False
```

Không bao giờ lưu plain text password. Không bao giờ so sánh password string trực tiếp.

---

## 3.4 `core/exceptions.py` — lỗi nhất quán

Thay vì viết `HTTPException(status_code=403, detail="...")` khắp 15 router, toàn backend dùng:

```python
raise unauthorized("Invalid or expired token")    # → 401
raise forbidden("Requires role: admin")            # → 403
raise not_found("Detection")                       # → 404 "Detection not found"
raise conflict("Email đã tồn tại")                # → 409
raise bad_request("prob_fake phải từ 0 đến 1")    # → 400
raise quota_exceeded()                             # → 429
raise service_unavailable("SFDCT :8501 lỗi")      # → 503
```

Khi thấy lỗi HTTP trong Swagger → trace ngược `raise forbidden(...)` → về `dependencies.py` là thường.

---

## 3.5 `dependencies.py` — trái tim của auth 2 lớp

**Guard 1: `get_current_user()` — cho JWT (dashboard)**

```python
async def get_current_user(request, credentials, db) -> User:
    token = credentials.credentials          # lấy từ "Authorization: Bearer <token>"
    payload = decode_token(token)            # giải mã JWT
    uid = UUID(payload.get("sub"))           # lấy user_id

    user = await db.execute(select(User).where(User.id == uid))

    # 5 điều kiện phải thỏa:
    # 1. user tồn tại trong DB
    if not user: raise unauthorized()
    # 2. user chưa bị xóa (soft delete)
    if user.deleted_at: raise unauthorized()
    # 3. user đang active
    if not user.is_active: raise unauthorized()
    # 4. tenant của user đang ACTIVE (T1 đã sửa)
    if tenant.status != "active": raise forbidden("Tổ chức bị tạm ngưng")
    # 5. nếu phải đổi mật khẩu, chặn mọi route trừ /auth/change-password
    if user.must_change_password and path not in _MUST_CHANGE_ALLOWED:
        raise forbidden("Phải đổi mật khẩu trước")

    return user   # → router nhận được User object
```

**Guard 2: `get_api_key_auth()` — cho API Key (tích hợp ngoài)**

```python
async def get_api_key_auth(credentials, db) -> ApiKey:
    plain_key = credentials.credentials     # "sk-dg-abc123..."

    # crud.validate_api_key: SHA-256(plain_key) → tìm trong bảng api_keys
    api_key = await crud.validate_api_key(db, plain_key)
    if not api_key: raise unauthorized("Invalid API key")

    # Kiểm tra quota từng key:
    if api_key.quota_used >= api_key.quota_limit: raise quota_exceeded()

    # Kiểm tra quota tháng của tenant (T2 đã sửa):
    if tenant.current_usage >= tenant.monthly_quota:
        raise HTTPException(429, "Tenant đã đạt quota tháng")

    return api_key   # → router nhận được ApiKey object
```

**Factory `require_role()`:**
```python
# Cách dùng trong router:
@router.delete("/users/{user_id}")
async def delete_user(
    user_id: UUID,
    current_user: User = Depends(require_role("admin", "sysadmin"))
    #                             ↑ chỉ admin và sysadmin mới qua được
):
```

---

## 3.6 `services/ml_inference.py` — 3 chế độ inference

**Hàm public `run_inference()` (dòng 173):**
```python
async def run_inference(image_bytes, include_heatmap=True, threshold=None, model=None):
    if settings.SFDCT_INFER_URL:          # ưu tiên 1: model thật (thesis)
        return _sfdct_inference(...)
    if settings.MOCK_ML or not settings.MODEL_PATH:  # ưu tiên 2: mock
        return _mock_inference(...)
    return _real_inference(...)            # ưu tiên 3: model local (ít dùng)
```

**Chế độ SFDCT thật (dòng 130):**
```python
r = httpx.post(
    settings.SFDCT_INFER_URL + "/predict",
    params={"gradcam": "true"},
    files={"file": ("upload.jpg", image_bytes, "image/jpeg")},
    timeout=60.0
)
j = r.json()  # {"prob_fake": 0.9591, "gradcam": "<base64>", "model_version": "..."}
```
Serving chết → raise 503 ngay, **không fallback mock** (tránh trả kết quả giả mà tưởng thật).

**Chế độ Mock (dòng 89):**
```python
seed = int(SHA256(image_bytes)[:8], 16)
rng  = random.Random(seed)  # seed từ hash ảnh → cùng ảnh = cùng kết quả
prob_fake = rng.uniform(0.05, 0.95)
```
Mock có thể dùng để smoke test, develop FE mà không cần GPU.

**`InferenceResult` dataclass (dòng 26):** gom tất cả output vào 1 object:
```python
@dataclass
class InferenceResult:
    verdict: str            # "REAL" | "FAKE" | "UNCERTAIN"
    prob_fake: float        # số thô từ model (0.0-1.0)
    confidence: float       # 0-100 (display)
    heatmap: Optional[str]  # base64 JPEG Grad-CAM overlay
    processing_time_ms: int
    model_version: str
    # ...12 field tổng
```

---

## 3.7 `services/risk.py` — prob_fake thành tín hiệu kinh doanh

```python
# Bước 1: calibrate (temperature scaling — T=1.0 = giữ nguyên)
risk_score = to_risk_score(prob_fake, temperature=1.0)

# Bước 2: xếp band theo ngưỡng (cấu hình qua env)
band = risk_band(risk_score)
# score < 0.30  → "low"
# 0.30-0.70     → "medium"
# >= 0.70       → "high"

# Bước 3: gợi ý cho nhân viên ngân hàng
hint = decision_hint(band)
# "low" → "pass" | "medium" → "review" | "high" → "reject"
```

**Quan trọng:** `verdict` (REAL/FAKE/UNCERTAIN) và `risk_band` (low/medium/high) là **hai thứ khác nhau**:
- `verdict` → từ ngưỡng model (`MODEL_THRESHOLD = 0.35`)
- `risk_band` → từ ngưỡng business (`RISK_BAND_LOW=0.30`, `RISK_BAND_HIGH=0.70`)
- `decision_hint` → chỉ là GỢI Ý, ngân hàng tự quyết định cuối

---

## 3.8 Routers — pattern chuẩn

**Pattern mọi router đều theo (đọc `detect.py` làm mẫu):**

```python
router = APIRouter(tags=["detect"])

@router.post("/v1/detect/image")
async def detect_image(
    file: UploadFile,                            # 1. Input từ client
    include_heatmap: bool = Query(True),
    api_key: ApiKey = Depends(get_api_key_auth), # 2. Guard auth
    db: AsyncSession = Depends(get_db),          # 3. DB session
):
    # Bước 1: Validate input
    image_bytes = await file.read()
    Image.open(io.BytesIO(image_bytes)).verify() # reject file rác giả đuôi .jpg

    # Bước 2: Gọi service (business logic)
    result = await run_inference(image_bytes, include_heatmap=include_heatmap)

    # Bước 3: Tính risk
    risk_score = to_risk_score(result.prob_fake)
    band = risk_band(risk_score)

    # Bước 4: Ghi DB (qua crud — không raw SQL)
    detection = await crud.create_detection(db, tenant_id=api_key.tenant_id, ...)
    await crud.increment_tenant_usage(db, api_key.tenant_id)

    # Bước 5: Trả response
    return DetectionResponse(verdict=result.verdict, prob_fake=result.prob_fake, ...)
```

**Phân biệt 2 router detect:**

| | `routers/detect.py` | `routers/playground.py` |
|---|---|---|
| Auth | API key | JWT |
| Dùng cho | App tích hợp ngoài | Dashboard test |
| Ghi vào DB | `source="api"` | `source="playground"` |
| Endpoint | `/v1/detect/image` | `/playground/detect/image` |

**`routers/platform.py`** — sysadmin cross-tenant console:
- `GET /tenants` — list ALL tenant (sysadmin only)
- `POST /tenants` — tạo tenant + admin đầu tiên
- `PATCH /tenants/{id}` — suspend/activate/đổi plan
- Không filter theo `tenant_id` — sysadmin thấy tất cả

---

## 3.9 `main.py` — entry point

```python
@asynccontextmanager
async def lifespan(app):
    await init_db()  # tạo bảng nếu chưa có (idempotent)
    yield

app = FastAPI(title="DeepGuard API", lifespan=lifespan)

# CORS: cho phép :3000 (frontend) gọi :8000 (backend)
app.add_middleware(CORSMiddleware, allow_origins=["http://localhost:3000"])

# Đăng ký 15 router — nếu endpoint 404, check xem đã include chưa:
app.include_router(auth.router)
app.include_router(detect.router)
# ...
```

---

## Hội đồng hỏi — Chương 3

**Q: Làm sao backend biết request dùng JWT hay API key?**
> Cùng header `Authorization: Bearer <...>`. Endpoint quyết định: endpoint dùng `Depends(get_current_user)` → xử lý như JWT. Endpoint dùng `Depends(get_api_key_auth)` → xử lý như API key. Hai scheme instance riêng trong Swagger.

**Q: Nếu SFDCT_INFER_URL trống thì kết quả ra sao?**
> `run_inference()` chạy `_mock_inference()`: seed từ SHA-256 hash ảnh, `prob_fake` random nhưng xác định (cùng ảnh = cùng kết quả). Không nói là model thật. Dấu hiệu: heatmap không có (None).

**Q: prob_fake và risk_band khác nhau thế nào?**
> `prob_fake` là số thô từ model (0-1). `verdict` từ so sánh `prob_fake` với `MODEL_THRESHOLD`. `risk_band` (low/medium/high) từ ngưỡng business riêng, dùng để gợi ý quyết định. `decision_hint` chỉ là gợi ý — ngân hàng tự quyết định cuối.

---

# CHƯƠNG 4: TẦNG AI — SERVING VÀ EKYC PIPELINE

## 4.1 Tại sao serving là microservice riêng (4 lý do)

**Lý do 1 — Restart độc lập:**
Model EfficientNet-B4 (~70MB) mất ~30s để load vào RAM/VRAM. Nếu gộp vào backend, sửa 1 dòng code auth phải chờ 30s. Tách ra thì backend restart 3s, model không bị ảnh hưởng.

**Lý do 2 — Cô lập sự cố:**
Model crash (CUDA error, OOM) → chỉ detection bị ảnh hưởng. Dashboard, auth, history vẫn chạy. Backend trả 503 rõ ràng thay vì chết hẳn.

**Lý do 3 — Tài nguyên khác nhau:**
Backend cần CPU nhẹ + I/O. Serving cần GPU/VRAM + tính toán nặng. Gộp chung = tranh nhau tài nguyên.

**Lý do 4 — Pattern chuẩn ngành:**
AWS SageMaker, Google Vertex AI, NVIDIA Triton, BentoML — tất cả đều tách inference server khỏi application server. DeepGuard áp dụng đúng pattern này.

---

## 4.2 `serving/infer_server.py` — model deepfake (:8501)

```python
# Startup: load model vào GPU 1 lần duy nhất
@asynccontextmanager
async def lifespan(app):
    global _model, _transforms, _device
    _model, _transforms, _device = load_sfdct_checkpoint(MODEL_NAME)
    yield

# Endpoint duy nhất:
@app.post("/predict")
async def predict(file: UploadFile, gradcam: bool = True):
    image_bytes = await file.read()

    # 1. Crop mặt (MTCNN qua face_crop.py)
    face = crop_face(image_bytes)

    # 2. Forward pass SFDCT model
    prob_fake, logits = model_forward(face, _model, _transforms, _device)

    # 3. Grad-CAM nếu yêu cầu (backward pass để visualize)
    heatmap_b64 = compute_gradcam(face, logits) if gradcam else None

    return {
        "prob_fake": prob_fake,          # 0.0-1.0
        "gradcam": heatmap_b64,          # base64 JPEG overlay
        "model_version": MODEL_NAME,     # "SFDCT · B4+block-DCT (cdfv2 0.7572)"
    }
```

4 checkpoint có sẵn: `naive_sfdct` (70MB), `b4` (70MB), `hff` (85MB), `liveness_b4` (68MB). Chọn qua query param `?model=b4`.

---

## 4.3 `serving/liveness_server.py` — model liveness (:8502)

```python
@app.post("/predict")
async def predict_liveness(file: UploadFile):
    image_bytes = await file.read()
    prob_live, prob_spoof = model_forward_liveness(image_bytes)
    # probs[0] = P(live), probs[1] = P(spoof)  — đã verify dòng 9 model_liveness.py

    return {
        "liveness_score": float(prob_live),   # 0.0-1.0 (cao = chắc live)
        "prob_spoof": float(prob_spoof),
    }
```

**B8 đã verify:** `liveness/model_liveness.py:9` xác nhận `label: live/real=0, spoof=1` → `probs[0]=P(live), probs[1]=P(spoof)` là ĐÚNG, không bị đảo ngược.

---

## 4.4 `serving/face_crop.py` + `serving/attack_classifier.py`

**`face_crop.py`:** Dùng MTCNN để detect và crop khuôn mặt trước khi đưa vào SFDCT. Nếu không detect được mặt → dùng toàn bộ ảnh (fallback).

**`attack_classifier.py`:** Phân loại kiểu tấn công dựa trên đặc trưng của liveness model:
- `print` — ảnh in giấy
- `screen` — phát lại màn hình
- `mask_3d` — mặt nạ silicone/giấy
- `deepfake` — video AI tạo ra
- `unknown`

---

## 4.5 `deepguard_liveness/liveness.py` — thuật toán liveness thật

Không dùng model deepfake. Dùng **MediaPipe FaceMesh** để phân tích chuyển động.

**EAR — Eye Aspect Ratio (phát hiện chớp mắt):**
```
EAR = (||p2-p6|| + ||p3-p5||) / (2 * ||p1-p4||)
# p1-p6: 6 landmark điểm quanh mắt từ FaceMesh
# Mắt mở → EAR cao (~0.3)
# Mắt nhắm (chớp) → EAR thấp (~0.15)
# Phát hiện chớp: EAR xuống dưới ngưỡng rồi lên lại
```

**Head yaw (phát hiện quay đầu):**
```
yaw = f(nose_tip_x, face_width)
# Nose tip dịch sang trái/phải so với trung tâm mặt
# Quay ≥ 10° → liveness thật
```

**Quyết định:**
```python
is_live = (blink_count >= 1) AND (max_yaw >= 10°) AND (face_detected_frames >= MIN)
```

**Giới hạn đã biết (tự nêu trước):** Chống replay yếu — video quay sẵn có chớp mắt vẫn lọt. Hướng nâng cấp: active challenge ("chớp 2 lần theo lệnh"), thêm tín hiệu tần số.

---

## 4.6 `deepguard_liveness/face_matching.py` — ArcFace cosine

```python
def match_faces(id_card_image, selfie_frames):
    # 1. Lấy embedding ArcFace từ ảnh CCCD
    id_embedding = arcface.get_embedding(id_card_image)

    # 2. Lấy embedding từ nhiều frame selfie
    selfie_embeddings = [arcface.get_embedding(f) for f in selfie_frames]

    # 3. Tính cosine similarity
    similarities = [cosine(id_embedding, emb) for emb in selfie_embeddings]

    # 4. Dùng MEAN (không phải max) — ổn định hơn (T7 đã sửa)
    mean_sim = sum(similarities) / len(similarities)
    max_sim  = max(similarities)

    is_match = mean_sim >= 0.45  # ngưỡng calibrate trên dataset

    return {
        "is_match": is_match,
        "similarity": round(mean_sim, 4),  # metric dùng quyết định
        "mean_similarity": round(mean_sim, 4),
        "max_similarity": round(max_sim, 4),  # giữ cho debug
    }
```

**Vì sao dùng mean không phải max?** Max dễ bị 1 frame tốt "kéo" kết quả — ảnh giả có thể có 1 frame rất giống. Mean ổn định hơn trên toàn clip.

---

## 4.7 `deepguard_liveness/ekyc_pipeline.py` — cascade thật

```python
@ekyc_router.post("/v1/ekyc/verify")
async def ekyc_verify(id_card: UploadFile, selfie_video: UploadFile):
    # Bước 1: Liveness
    liveness_result = await check_video(video_bytes)
    if liveness_result.verdict != "LIVE":
        return {"overall_pass": False, "fail_reason": "liveness", ...}
    # Dừng sớm — không xử lý tiếp

    # Bước 2: Deepfake (lấy 3 frame từ video)
    frames = extract_frames(video_bytes, n=3, filename=selfie_video.filename)
    deepfake_results = [await run_inference(f) for f in frames]
    # aggregate: majority vote hoặc max prob_fake
    if deepfake_verdict == "FAKE":
        return {"overall_pass": False, "fail_reason": "deepfake", ...}

    # Bước 3: Face match (CCCD vs selfie)
    match = match_faces(id_card_bytes, frames)
    if not match["is_match"]:
        return {"overall_pass": False, "fail_reason": "face_match", ...}

    return {"overall_pass": True, "liveness": ..., "deepfake": ..., "face_match": ...}
```

File ảnh tạm được cleanup trong `finally` block (T7 đã sửa — guard `os.unlink(None)`).

---

## Hội đồng hỏi — Chương 4

**Q: Liveness và deepfake khác nhau thế nào?**
> Deepfake: "ảnh/video có bị AI tạo/ghép không?" — dùng model SFDCT phân tích miền tần số DCT. Liveness: "có phải người thật đang ngồi trước camera không?" — dùng MediaPipe phân tích chuyển động (chớp mắt, quay đầu). Khác model, khác use case, chạy ở 2 microservice khác nhau.

**Q: Ngưỡng 0.45 của face match và 0.62 của deepfake từ đâu?**
> Calibrate từ ROC curve trên dataset FF++/Celeb-DF tại FPR ≤ 5% (theo Thông tư 17). Chạy với data người Việt/codec khác phải hiệu chỉnh lại.

**Q: Điểm yếu của liveness?**
> Chống replay yếu — video quay sẵn có chớp mắt vẫn lọt vì yaw/blink là heuristic không phân biệt được thật vs video. Hướng nâng cấp: active challenge, tín hiệu tần số.

---

# CHƯƠNG 5: FRONTEND NEXT.JS

## 5.1 Kiến trúc SPA — 1 route duy nhất

Next.js thường routing theo file (`/dashboard` → `app/dashboard/page.tsx`). DeepGuard **không làm vậy**. Toàn bộ app là **1 URL duy nhất** (`/`), điều hướng bằng state.

```
frontend/src/
├── app/
│   ├── layout.tsx         ← HTML root + no-FOUC script theme
│   ├── page.tsx           ← 1 component duy nhất, chứa toàn bộ routing
│   └── api/route.ts       ← Next.js API proxy (ít dùng)
├── components/deepguard/  ← 20+ trang, mỗi file 1 trang
├── components/ui/         ← 48 file shadcn/ui — KHÔNG đọc
├── lib/                   ← api.ts, rbac.ts, dg.ts, utils.ts
├── store/                 ← auth.ts, navigation.ts, appearance.ts, onboarding.ts
└── hooks/                 ← use-toast.ts, use-mobile.ts (shadcn)
```

---

## 5.2 Zustand Stores — global state

**`store/auth.ts` — token + user:**
```typescript
interface AuthState {
  token: string | null     // JWT từ /auth/login
  user: UserOut | null     // {id, email, name, role, tenant_id, must_change_password}
  tenant: TenantOut | null // {name, plan, status, monthly_quota, current_usage}
  apiKey: string | null    // key người dùng nhập thủ công (dùng để test /v1/detect/*)
}

// Login thành công:
setAuth(token, user, tenant) {
  localStorage.setItem("dg_token", token);  // ⚠️ XSS vulnerability (đã documented)
  set({ token, user, tenant });
}

// Logout (hoặc token hết hạn):
logout() {
  localStorage.removeItem("dg_token");
  set({ token: null, user: null, tenant: null, apiKey: null });
}
```

`persist` middleware = Zustand tự save/restore từ `localStorage["dg-auth"]` khi reload. User vẫn đăng nhập sau khi đóng tab.

**`store/navigation.ts` — page routing:**
```typescript
interface NavigationState {
  currentPage: Page               // tên trang: "dashboard" | "history" | ...
  navigate: (page: Page) => void  // chuyển trang (không reload)
  selectedRequestId: string | null  // ID detection đang xem ở detail-page
  selectedKind: 'deepfake' | 'liveness'  // loại record ở detail-page
}
// Dùng: const { navigate } = useNavigation(); → navigate('history');
```

---

## 5.3 `lib/api.ts` — mọi API call đi qua đây

**Hàm `req<T>()` (dòng 8-31) — trái tim frontend:**

```typescript
async function req<T>(
  path: string,
  init: RequestInit = {},
  bearer?: string | null  // undefined=JWT tự động; null=không auth
): Promise<T> {
  const token = bearer !== undefined ? bearer : getToken();
  // getToken() = localStorage.getItem("dg_token")

  const headers = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(!isForm ? { "Content-Type": "application/json" } : {}),
  };

  const res = await fetch(`http://localhost:8000${path}`, { ...init, headers });

  if (!res.ok) {
    if (res.status === 401) {
      localStorage.removeItem("dg_token");
      window.dispatchEvent(new CustomEvent("dg:session-expired")); // → auto logout
    }
    throw new Error(data?.detail ?? `HTTP ${res.status}`);
  }
  return data as T;
}
```

**3 cách gọi:**
```typescript
// 1. JWT tự động (đa số endpoints):
const me = await authMe();
// req("/auth/me") → lấy JWT từ localStorage → gắn Bearer header

// 2. API key tường minh (test detect từ dashboard):
const result = await detectImage(formData, apiKey);
// req("/v1/detect/image", {body: formData}, apiKey) → gắn API key

// 3. Public (không cần auth):
const info = await authInviteInfo(token);
// req("/auth/accept-invite?token=...", {}, null) → null = không gắn header
```

---

## 5.4 `lib/rbac.ts` — phân quyền UI

```typescript
// Bảng quyền: trang nào role nào được vào
export const PAGE_ACCESS: Record<Page, Role[]> = {
  playground: ['admin', 'developer'],  // chỉ 2 role này
  apikeys:    ['admin', 'developer'],
  tenants:    ['sysadmin'],            // chỉ sysadmin
  billing:    ['admin'],               // chỉ admin
  audit:      ['sysadmin', 'admin', 'compliance'],
  // ...
};

// Kiểm tra vào trang được không:
canAccess(role, 'playground')  // → false nếu role='viewer'

// Kiểm tra được sửa không (ẩn nút create/edit/delete):
canEdit(role, 'apikeys')       // → false nếu role='viewer' hoặc 'compliance'
canEdit(role, 'models')        // → true CHỈ khi role='sysadmin'
```

**Dùng trong components (T4 đã sửa):**
```typescript
const canWrite = canEdit(userRole, 'apikeys');
// Ẩn nút nếu không có quyền:
{canWrite && <button onClick={openCreate}>Tạo key mới</button>}
```

**Nhắc lại:** RBAC ở FE chỉ là mỹ phẩm (ẩn/hiện nút). Backend `require_role()` mới là chốt chặn thật.

---

## 5.5 `app/page.tsx` — SPA router

```typescript
// Map tên page → Component:
const pageComponents = {
  dashboard: DashboardPage,
  playground: PlaygroundPage,
  history: HistoryPage,
  // ...18 trang
};

export default function Home() {
  const { currentPage } = useNavigation();
  const user = useAuthStore(s => s.user);

  // Auto logout khi nhận 401 từ bất kỳ API call nào:
  useEffect(() => {
    window.addEventListener('dg:session-expired', () => {
      logout(); navigate('login');
    });
  }, []);

  // Redirect logic:
  useEffect(() => {
    if (user && currentPage === 'login') navigate('dashboard');  // đã login → vào dashboard
    if (!user && !standalonePages.includes(currentPage)) navigate('login');  // chưa login → về login
  }, [user, currentPage]);

  // Render:
  const PageComponent = pageComponents[currentPage];
  const allowed = canAccess(user?.role, currentPage);

  if (!allowed) return <AccessDeniedView />;
  return <Layout><PageComponent /></Layout>;
}
```

---

## 5.6 Pattern của mọi `*-page.tsx` — học 1 hiểu 18

Tất cả 18 trang deepguard đều theo đúng 1 pattern:

```typescript
export default function XxxPage() {
  // 1. Global state
  const { navigate } = useNavigation();
  const user = useAuthStore(s => s.user);

  // 2. Local state
  const [data, setData] = useState<SomeType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 3. Fetch data
  useEffect(() => {
    let alive = true;  // guard race condition
    const load = async () => {
      try {
        const res = await someApiFn();
        if (alive) setData(res);
      } catch (e) {
        if (alive) setError(e.message);
      } finally {
        if (alive) setLoading(false);
      }
    };
    load();
    return () => { alive = false; };  // cleanup khi unmount
  }, []);  // dependencies thay đổi thì fetch lại

  // 4. Action handlers
  const handleCreate = async () => { ... };

  // 5. Render
  if (loading) return <Skeleton />;
  if (error)   return <ErrorMessage message={error} />;
  return <div>...UI với data...</div>;
}
```

**Khi đọc trang lạ:** tìm `useEffect` đầu tiên = data chính. Tìm `handle*` = actions. Đọc `return (...)` = UI.

---

## 5.7 `lib/dg.ts` — constants dùng khắp

File này chứa label và màu cho verdict/risk_band — dùng để hiển thị badge đồng nhất:

```typescript
// Màu verdict badge:
VERDICT_COLORS = {
  "REAL": "green",
  "FAKE": "red",
  "UNCERTAIN": "yellow",
}

// Label liveness:
LIVENESS_LABELS = {
  "LIVE": "Người thật",
  "SPOOF": "Giả mạo",
  "UNCERTAIN": "Không chắc",
}

// Risk band badge:
RISK_BAND_COLORS = { "low": "green", "medium": "yellow", "high": "red" }
```

Khi thấy badge màu trong UI → màu đến từ `dg.ts`, không phải hardcode trong từng trang.

---

## 5.8 `components/deepguard/shared/index.tsx` — components dùng chung

```typescript
// Icon (Material Symbols): <Icon name="dashboard" fill className="text-[24px]" />
// ScoreBar: progress bar hiển thị prob_fake (0-1)
// Gauge: đồng hồ tròn hiển thị liveness score
// CodeBlock: syntax highlight cho JSON response trong docs-page
```

Mọi trang đều import từ đây thay vì tự viết.

---

## 5.9 `app/layout.tsx` — root layout

```typescript
// No-FOUC script: set theme TRƯỚC khi paint (tránh flash trắng khi dùng dark mode)
// Chạy trước React hydrate — đặt data-theme attribute vào <html>

export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      <head>
        <script dangerouslySetInnerHTML={{ __html: noFoucScript }} />
        {/* script nhỏ đọc localStorage["dg-appearance"] → set data-radius, data-theme */}
      </head>
      <body>{children}</body>
    </html>
  );
}
```

---

## Hội đồng hỏi — Chương 5

**Q: Tại sao chỉ có 1 route `/` không dùng Next.js file routing?**
> Dashboard là SPA (Single Page Application). Điều hướng bằng Zustand state (`currentPage`) thay vì URL. Ưu điểm: transition mượt (Framer Motion), không reload trang. Nhược điểm: URL không thay đổi khi chuyển trang — không thể bookmark trang cụ thể.

**Q: JWT lưu localStorage có an toàn không?**
> Không hoàn toàn — XSS có thể đọc được. Đây là điểm yếu đã biết và documented. Hardening production sẽ dùng `httpOnly cookie` (JavaScript không đọc được). Đây là giới hạn của đồ án, không phải lỗi thiết kế.

**Q: RBAC frontend và backend khác nhau thế nào?**
> Frontend RBAC (rbac.ts) ẩn/hiện UI element — chỉ là UX, không phải bảo mật. Backend RBAC (`require_role()` trong dependencies.py) là chốt chặn thật — gõ thẳng URL qua Postman vẫn bị chặn. Hai lớp phải sync nhau để UX đúng và bảo mật thật.

---

# TÓM TẮT — BẢN ĐỒ NHANH

## Luồng 1 request detect ảnh — từ click đến DB

```
[FE] playground-page.tsx
  → playgroundDetectImage(formData)         [lib/api.ts]
    → req("/playground/detect/image", ...)  [lib/api.ts: Bearer JWT]
      → POST /playground/detect/image       [HTTP]
        → get_current_user()                [dependencies.py: verify JWT]
        → detect_image_playground()         [routers/playground.py]
          → run_inference(image_bytes)      [services/ml_inference.py]
            → httpx.post(:8501/predict)     [→ serving/infer_server.py]
              → SFDCT forward + Grad-CAM   [serving: PyTorch model]
            ← {prob_fake, gradcam}
          → to_risk_score() + risk_band()   [services/risk.py]
          → crud.create_detection()         [deepguard_db/crud.py]
            → INSERT INTO detections        [PostgreSQL :5432]
          ← DetectionResponse(verdict, prob_fake, heatmap, ...)
        ← JSON response
      ← JSON
    ← result object
  → setState({result})                      [FE re-render với kết quả]
```

## File nào mở khi gặp bug

| Triệu chứng | Mở trước |
|---|---|
| 401 Unauthorized | `core/security.py` → `dependencies.py` |
| 403 Forbidden | `dependencies.py` → `routers/*` (require_role) |
| 404 endpoint không tồn tại | `main.py` (include_router đã có chưa?) |
| Kết quả detect giả/luôn giống | `config.py` (SFDCT_INFER_URL có set chưa?) |
| 503 model lỗi | serving log: `/tmp/serving_deepfake.log` |
| Số liệu DB sai | `deepguard_db/crud.py` |
| Nút FE không hiện | `lib/rbac.ts` (canEdit/canAccess) |
| Trang trắng/crash | DevTools Console → `app/page.tsx` → component tương ứng |
| Gọi API từ FE lỗi CORS | `config.py` (CORS_ORIGINS) + `main.py` (CORSMiddleware) |

---

*Tài liệu này được tổng hợp từ đọc code thật tại `~/deepguard/app` — 2026-06-24. Số dòng có thể thay đổi khi code update, dùng `grep -n "tên hàm"` để xác nhận lại.*
