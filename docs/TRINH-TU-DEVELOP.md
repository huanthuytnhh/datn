# Trình Tự Phát Triển DeepGuard — Từ Số 0 Đến Hệ Thống Hoàn Chỉnh
> Không vibe code: mỗi bước giải thích TẠI SAO làm trước, không chỉ làm GÌ.
> Đây là thứ tự một developer thực sự xây dựng — không phải thứ tự dependency kỹ thuật.

---

## NGUYÊN TẮC NỀN TẢNG trước khi đọc tiếp

**Tại sao thứ tự quan trọng?**

Nếu bạn build sai thứ tự:
- Làm router trước model → viết endpoint không biết output trả về gì
- Làm frontend trước API → mock data không phản ánh thực tế, phải viết lại
- Làm feature trước auth → mỗi feature phải thêm auth vào sau, dễ bỏ sót
- Làm code trước database → thêm cột liên tục, migration loạn

**Quy tắc build đúng:** Từ trong ra ngoài.
```
Bài toán → Dữ liệu → AI/Model → Serving → Backend → Frontend → Demo
```
Mỗi bước CHỈ bắt đầu khi bước trước đã chạy được và đã test.

---

## BƯỚC 0 — XÁC ĐỊNH BÀI TOÁN (trước khi viết 1 dòng code)

### 0.1 Phân tích bài toán

Câu hỏi phải trả lời được TRƯỚC khi code:
- **Bài toán là gì?** Ngân hàng cần định danh khách online (eKYC), nguy cơ: ảnh giả, video AI.
- **Yêu cầu kỹ thuật là gì?** Thông tư 17/2024/TT-NHNN: FPR ≤ 5%.
- **AI cần làm gì?** 2 bài toán: phát hiện deepfake + phát hiện liveness.
- **Ai dùng hệ thống?** 2 loại: nhân viên ngân hàng (dashboard) + app tích hợp (API).
- **Dữ liệu cần lưu gì?** Mỗi detection, mỗi user, mỗi tenant phải audit được.

### 0.2 Quyết định kiến trúc (phải chốt trước, không thay đổi giữa chừng)

| Quyết định | Lựa chọn | Lý do |
|---|---|---|
| Model AI | EfficientNet-B4 + block-DCT (SFDCT) | AUC tốt trên Celeb-DF-v2, có giải thích (Grad-CAM) |
| Backend | FastAPI (Python) | Ecosystem AI tốt, async, auto Swagger |
| Frontend | Next.js (TypeScript) | SSR, type safety, ecosystem lớn |
| Database | PostgreSQL | ACID, UUID, JSONB, phù hợp multi-tenant |
| Object storage | MinIO (S3-compatible) | Self-hosted cho dev, swap sang AWS S3 production |
| AI serving | Tách microservice riêng | Model nặng, restart độc lập, fault isolation |
| Auth | JWT (dashboard) + API key (tích hợp) | 2 loại user khác nhau cần 2 cơ chế khác nhau |
| Multi-tenant | tenant_id trên mọi bảng | Cách ly data giữa các ngân hàng |

**Quyết định này không thay đổi giữa chừng.** Thay đổi kiến trúc giữa chừng = viết lại từ đầu.

---

## BƯỚC 1 — THIẾT KẾ DỮ LIỆU (file đầu tiên viết)

**Tại sao database TRƯỚC code?**

Nếu làm code trước database:
- Viết `detect.py` → cần lưu `prob_fake` → mới biết cần cột này trong bảng
- Thêm cột → migration → sửa code → thêm cột khác → migration lại
- Sau 2 tuần có 20 migration lộn xộn, schema không ai hiểu

Làm database trước:
- Ngồi design ERD 1-2 ngày
- Viết `models.py` đầy đủ 1 lần
- Mọi code sau đó biết chính xác lưu gì, lấy gì

### File đầu tiên: `deepguard_db/app/db/models.py`

**Câu hỏi thiết kế cho từng bảng:**

**Tenant** — đơn vị thuê (ngân hàng/fintech):
```
Cần lưu gì? → tên, plan (starter/pro/enterprise), trạng thái, quota tháng, usage hiện tại
Quyết định quan trọng:
- status có 4 giá trị: PENDING (chờ duyệt), ACTIVE, SUSPENDED, DELETED
- PENDING ≠ SUSPENDED: pending là chờ sysadmin duyệt, suspended là bị tạm ngưng
- monthly_quota: 0 = unlimited, > 0 = giới hạn
```

**User** — nhân viên dashboard:
```
Cần lưu gì? → email, password_hash (không lưu plain), name, role, is_active
Quyết định quan trọng:
- password_hash (không phải password) — bcrypt, 1 chiều
- must_change_password: flag buộc đổi mật khẩu lần đầu (admin tạo user → set True)
- deleted_at (soft delete): xóa user không được xóa record vì Detection vẫn trỏ vào user
- UniqueConstraint("email", "tenant_id"): email chỉ unique trong 1 tenant
```

**ApiKey** — key tích hợp:
```
Cần lưu gì? → key_hash (SHA-256, không lưu plain), prefix (hiển thị), quota, status
Quyết định quan trọng:
- key_hash: KHÔNG BAO GIỜ lưu plain key. Khi tạo: trả plain 1 lần → sau đó chỉ hash
- prefix: 8 ký tự đầu để user nhận ra key nào (vd: "sk-dg-ab")
- quota_limit = 0: unlimited; > 0: giới hạn
- soft delete (deleted_at): Detection cũ vẫn cần trỏ về key đã revoke
```

**Detection** — bản ghi mỗi lần detect:
```
Cần lưu gì? → verdict, prob_fake, image_hash, model_version, processing_time
Quyết định quan trọng:
- KHÔNG lưu ảnh gốc (CCCD là dữ liệu nhạy cảm)
- image_hash (SHA-256): để audit dedup, không phải để tìm lại ảnh
- image_thumb: JPEG nhỏ ~320px lưu thẳng DB — đủ để reviewer xem
- heatmap_url: link S3, không lưu heatmap vào DB (quá nặng)
- source: "api" | "playground" — phân biệt production vs test
- api_key_id nullable: playground dùng JWT, không có API key
```

**AuditLog** — nhật ký mọi hành động:
```
Quyết định đặc biệt: dùng BIGSERIAL (số tự tăng) thay vì UUID
Lý do: bảng write rất cao (mọi action đều ghi). UUID index insert chậm hơn BIGSERIAL.
Trong production sẽ partition theo created_at theo tháng.
```

### File thứ hai: `deepguard_db/app/db/database.py`

```python
# Async engine — bắt buộc vì FastAPI async
engine = create_async_engine(DATABASE_URL, echo=False)

# Session factory
AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False)

# Dependency inject vào router
async def get_db() -> AsyncSession:
    async with AsyncSessionLocal() as session:
        yield session
        # session tự close sau request

# Chạy 1 lần khi server start
async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    # create_all là idempotent: bảng đã có thì skip, chưa có thì tạo
```

**Tại sao `expire_on_commit=False`?** Mặc định SQLAlchemy expire tất cả object sau commit → phải query lại. Với async FastAPI, query lại trong response serialization gây lỗi "context closed". `expire_on_commit=False` giữ object trong memory sau commit.

### File thứ ba: `deepguard_db/app/db/crud.py` — phase 1 (chỉ basic CRUD)

Lần đầu chỉ viết những hàm cần ngay:
```python
# Phase 1: đủ để register + login + detect
create_tenant(db, name, admin_email, plan, monthly_quota) → Tenant
create_user(db, tenant_id, email, password_hash, name, role) → User
get_user_by_email(db, email) → Optional[User]
get_tenant(db, tenant_id) → Optional[Tenant]
validate_api_key(db, plain_key) → Optional[ApiKey]  # SHA-256 hash → tìm DB
create_detection(db, ...) → Detection
increment_tenant_usage(db, tenant_id) → None
write_audit_log(db, action, ...) → None
```

Các hàm khác (`list_detections`, `get_detection`, v.v.) thêm vào khi cần — không viết trước.

---

## BƯỚC 2 — NGHIÊN CỨU VÀ TRAIN MODEL AI (track song song)

**Track này chạy song song với track App — không blocking nhau.**

```
DeepfakeBench/
├── training/config/
│   └── efficientnetb4_sfdct.yaml   ← config thí nghiệm
├── training/detectors/
│   ├── efficientnetb4_sfdct_detector.py  ← model chính
│   └── sfdct_core.py               ← GatedCrossAttnFusion, block-DCT
└── training/trainer/
    └── trainer.py                  ← vòng train, save_best
```

**Thứ tự nghiên cứu:**
1. Baseline B4 (`efficientnetb4_detector.py`) — train trước để có baseline
2. Thêm block-DCT attention vào (`sfdct_core.py`)
3. Thêm `GatedCrossAttnFusion` — gate init 0 đảm bảo floor ≥ B4
4. Train trên FF++ → eval cross-dataset (Celeb-DF-v2) — AUC 0.9234
5. Save checkpoint: `naive_sfdct.pth`, `b4.pth`, `hff.pth`, `liveness_b4.pth`

**Kết quả bàn giao sang track App:** 4 file `.pth` checkpoint.

---

## BƯỚC 3 — WRAP AI THÀNH HTTP API (serving/)

**Tại sao bước này trước backend?**

Nếu làm backend trước serving:
- Viết `ml_inference.py` mà chưa biết serving trả về JSON format gì
- Phải mock → sau khi serving xong phải sửa lại backend

Làm serving trước:
- Test `/predict` trực tiếp bằng `curl` hoặc Swagger
- Biết chính xác response format trước khi viết backend gọi vào

### `serving/face_crop.py` — preprocessing (viết trước infer_server)

```python
# crop mặt vuông → resize về 256×256 (resolution trong config.yaml của từng model)
# 256 không phải ngẫu nhiên: B4 stride=32, 256/32=8 → feature map 8×8 = dct_grid=8
# Code thật dùng dlib HOG + Haar cascade (offline), không dùng MTCNN (cần tải model khi startup)
# Xem: serving/face_crop.py crop_face_bgr() + serving/*/config.yaml resolution: 256
```

**Tại sao crop trước?** Model train trên crop mặt, không phải toàn ảnh → nếu không crop, độ chính xác giảm mạnh.

### `serving/infer_server.py` — deepfake model server (:8501)

```python
# Startup: load model 1 lần (tốn ~30s, ~2GB RAM/VRAM)
@asynccontextmanager
async def lifespan(app):
    global _model, _transforms, _device
    checkpoint_path = f"serving/checkpoints/{MODEL_NAME}.pth"
    _model = load_sfdct(checkpoint_path)
    _model.eval()
    yield  # server chạy ở đây
    # model tự giải phóng khi process kết thúc

# Endpoint duy nhất:
@app.post("/predict")
async def predict(file: UploadFile, gradcam: bool = True, model: str = "b4"):
    image_bytes = await file.read()
    face = crop_face(image_bytes)           # preprocessing
    prob_fake, feat = model_forward(face)   # forward pass

    heatmap = None
    if gradcam:
        heatmap = compute_gradcam(face, feat)  # backward pass (chậm hơn ~2x)

    return {
        "prob_fake": float(prob_fake),
        "gradcam": heatmap,                 # base64 JPEG string hoặc null
        "model_version": f"SFDCT · B4+block-DCT (cdfv2 0.7572)",
    }
```

**Test ngay:** `curl -X POST http://localhost:8501/predict -F "file=@test.jpg"` → xem JSON response.
**Ghi lại response format** → đây là "contract" mà backend sẽ parse.

### `serving/liveness_server.py` — liveness model server (:8502)

```python
@app.post("/predict")
async def predict_liveness(file: UploadFile):
    image_bytes = await file.read()
    # model_liveness.py dòng 9: label: live/real=0, spoof/attack=1
    probs = softmax(model_forward(image_bytes))
    prob_live  = float(probs[0])   # probs[0] = P(live)
    prob_spoof = float(probs[1])   # probs[1] = P(spoof)

    return {
        "liveness_score": prob_live,   # 0.0-1.0, cao = chắc live
        "prob_spoof": prob_spoof,
    }
```

**Test ngay** với ảnh thật vs ảnh in. Ghi lại ngưỡng phân biệt (EER point).

### `serving/attack_classifier.py`

Dùng feature map từ liveness model để classify kiểu tấn công (print/screen/mask_3d/deepfake). Viết sau khi `liveness_server.py` chạy ổn.

---

## BƯỚC 4 — BACKEND FOUNDATION (không có feature, chỉ có nền)

### 4.1 `backend/app/config.py` — viết trước tất cả backend

**Tại sao config trước?**
Mọi file backend đều `from app.config import get_settings`. Nếu chưa có file này, import sẽ fail.

```python
class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/deepguard"

    # Auth
    SECRET_KEY: str = "dev-secret-key-change-in-production"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    # AI switching (công tắc tổng)
    SFDCT_INFER_URL: str = ""     # rỗng = mock, set = model thật
    LIVENESS_INFER_URL: str = ""
    MOCK_ML: bool = True

    # Ngưỡng
    MODEL_THRESHOLD: float = 0.35
    LIVENESS_THRESHOLD: float = 0.125

    # Storage
    S3_BUCKET: str = ""           # rỗng = không upload S3

    # CORS
    CORS_ORIGINS: str = "http://localhost:3000"

@lru_cache
def get_settings() -> Settings:  # cache 1 lần, restart để apply .env mới
    return Settings()
```

**Quyết định thiết kế quan trọng:** `SFDCT_INFER_URL` rỗng = mock mode. Nhờ đó:
- Dev frontend không cần GPU
- CI/CD chạy smoke test không cần model
- Production set URL → chạy model thật

### 4.2 `backend/app/core/exceptions.py` — viết ngay sau config

```python
# Không có logic, chỉ wrap HTTPException thành hàm tên rõ ràng
def unauthorized(detail="Not authenticated") -> HTTPException: ...
def forbidden(detail="Forbidden") -> HTTPException: ...
def not_found(resource="Resource") -> HTTPException: ...
def bad_request(detail) -> HTTPException: ...
def quota_exceeded() -> HTTPException: ...
def service_unavailable(detail) -> HTTPException: ...
```

**Tại sao viết sớm?** Nếu không có file này, mỗi router tự viết `HTTPException(status_code=403, detail="...")`. Sau 5 router, có 5 format lỗi khác nhau. Frontend phải handle 5 case.

### 4.3 `backend/app/core/security.py` — cần cho auth

```python
# 3 hàm, không có gì phức tạp:
hash_password(password) → str          # bcrypt
verify_password(plain, hashed) → bool  # bcrypt verify
create_access_token(data) → str        # HS256 JWT
decode_token(token) → Optional[dict]   # giải mã, None nếu sai/hết hạn
```

### 4.4 `backend/app/core/audit.py` — wrapper ghi log

```python
# Wrapper mỏng để router không phải lấy IP/user-agent thủ công
async def audit(db, request, *, action, resource_type, user, resource_id=None, metadata=None):
    await crud.write_audit_log(
        db,
        action=action,              # vd: "user.login", "api_key.created"
        resource_type=resource_type,
        tenant_id=user.tenant_id,
        user_id=user.id,
        resource_id=resource_id,
        ip_address=request.client.host,   # tự lấy từ request
        user_agent=request.headers.get("user-agent"),
    )
# Caller tự commit sau khi gọi audit()
```

Sau khi có file này, mọi router chỉ cần:
```python
await audit(db, request, action="user.login", resource_type="user", user=user, ...)
await db.commit()
```

---

## BƯỚC 5 — AUTH (bước đầu tiên có endpoint thật)

**Tại sao auth TRƯỚC tất cả feature?**
- Mọi endpoint cần biết "ai đang gọi"
- Nếu làm detect trước auth → detect không có auth → sau phải thêm vào
- Thêm auth sau = "sprinkle security on top" = hay bỏ sót

### `backend/app/dependencies.py` — viết trước router đầu tiên

```python
# Guard 1: JWT (dashboard)
async def get_current_user(request, credentials, db) -> User:
    payload = decode_token(credentials.credentials)
    user = await db.get(User, UUID(payload["sub"]))
    # Kiểm tra: tồn tại, active, không bị xóa mềm, tenant active, must_change_password
    return user

# Guard 2: API key (tích hợp ngoài)
async def get_api_key_auth(credentials, db) -> ApiKey:
    api_key = await crud.validate_api_key(db, credentials.credentials)
    # Kiểm tra: valid, tenant active, quota còn
    return api_key

# Factory role guard
def require_role(*roles):
    async def _dep(current_user = Depends(get_current_user)):
        if current_user.role.value not in roles:
            raise forbidden(f"Requires: {roles}")
        return current_user
    return _dep
```

### `backend/app/routers/auth.py` — ROUTER ĐẦU TIÊN

Endpoint theo thứ tự implement:

**1. `POST /auth/register`** — tạo tenant + admin đầu tiên
```python
# Không cần auth (public endpoint)
# Tạo tenant status=PENDING (chờ sysadmin duyệt, không tự activate)
# Tạo user role=admin
# Không trả JWT (phải được sysadmin duyệt trước)
```

**2. `POST /auth/login`** — đăng nhập
```python
# Public endpoint
# verify_password → tạo JWT → ghi audit log
# Kiểm tra tenant.status == "active" TRƯỚC khi trả JWT
# pending → "Chờ phê duyệt", suspended → "Bị tạm ngưng"
```

**3. `GET /auth/me`** — lấy profile
```python
# Dùng get_current_user → trả User + Tenant info
# Frontend gọi endpoint này mỗi lần load app để verify token còn hạn
```

**4. `POST /auth/change-password`** — đổi mật khẩu
```python
# Verify mật khẩu cũ trước
# Set must_change_password = False
# Ghi audit log
```

**5. `POST /auth/logout`** — logout
```python
# JWT stateless → client xóa token
# Endpoint này CHỈ để ghi audit log, không có logic khác
```

**6. `GET/POST /auth/accept-invite`** — nhận lời mời
```python
# GET: validate token, trả email/role/tên tenant để FE hiển thị
# POST: tạo user, tiêu thụ token (set accepted_at), trả JWT (auto-login)
```

**Test auth xong** bằng Swagger (`/docs`) trước khi làm bước tiếp.

---

## BƯỚC 6 — CORE API (tính năng chính của sản phẩm)

### 6.1 `backend/app/services/ml_inference.py` — service trước router

```python
# run_inference() là facade với 3 chế độ:
async def run_inference(image_bytes, include_heatmap=True, threshold=None, model=None):
    if settings.SFDCT_INFER_URL:       # model thật (ưu tiên 1)
        return _sfdct_inference(...)
    if settings.MOCK_ML:               # mock (ưu tiên 2)
        return _mock_inference(...)
    return _real_inference(...)        # model local (fallback)

# _sfdct_inference: gọi httpx đến :8501, parse JSON response
# _mock_inference: seed = SHA-256(image_bytes)[:8] → kết quả xác định, không random
# _real_inference: load model local (ít dùng trong project này)
```

**Tại sao mock seed từ hash ảnh?** Cùng ảnh = cùng kết quả → FE dev có thể test với ảnh thật và thấy kết quả nhất quán, không thấy "random" mỗi lần refresh.

### 6.2 `backend/app/services/risk.py` — tách biệt "số model" và "quyết định kinh doanh"

```python
# prob_fake (số model) → risk_score (đã calibrate) → band → hint
to_risk_score(prob_fake, temperature=1.0)   # temperature scaling
risk_band(score) → "low" | "medium" | "high"
decision_hint(band) → "pass" | "review" | "reject"
```

**Tại sao tách file này?**
- Ngưỡng kinh doanh (30%/70%) thay đổi độc lập với model
- Từng ngân hàng có ngưỡng rủi ro khác nhau → sau này per-tenant
- Router không chứa logic business → dễ test, dễ thay đổi

### 6.3 `backend/app/routers/detect.py` — endpoint quan trọng nhất

```python
@router.post("/v1/detect/image")
async def detect_image(
    file: UploadFile,
    include_heatmap: bool = Query(True),
    api_key: ApiKey = Depends(get_api_key_auth),  # API key, không phải JWT
    db: AsyncSession = Depends(get_db),
):
    # 1. Validate input (PHẢI làm trước khi gọi model)
    image_bytes = await file.read()
    try:
        Image.open(io.BytesIO(image_bytes)).verify()  # PIL check file hợp lệ
    except Exception:
        raise bad_request("File không phải ảnh hợp lệ")

    # 2. Inference (gọi service)
    result = await run_inference(image_bytes, include_heatmap=include_heatmap)

    # 3. Risk calculation
    risk_score = to_risk_score(result.prob_fake)
    band = risk_band(risk_score)

    # 4. Lưu DB
    detection = await crud.create_detection(
        db,
        tenant_id=api_key.tenant_id,
        api_key_id=api_key.id,
        source="api",
        verdict=result.verdict,
        prob_fake=result.prob_fake,
        # ...
    )
    await crud.increment_tenant_usage(db, api_key.tenant_id)
    await db.commit()

    # 5. Upload heatmap lên S3 (nếu có S3 config)
    if result.heatmap and settings.S3_BUCKET:
        heatmap_url = await storage.upload_heatmap(...)

    return DetectionResponse(...)
```

**Bật test với mock trước** (SFDCT_INFER_URL rỗng) → verify response format → sau đó bật model thật.

### 6.4 `backend/app/routers/api_keys.py` — cần để test detect

```python
# POST /api-keys: tạo key mới
#   plain_key = "sk-dg-" + secrets.token_hex(24)
#   key_hash = SHA256(plain_key)
#   prefix = plain_key[:8]
#   lưu key_hash và prefix (KHÔNG lưu plain_key)
#   trả plain_key 1 lần duy nhất trong response

# DELETE /api-keys/{id}: revoke (soft delete)
# GET /api-keys: list keys của tenant
```

Sau khi có endpoint này, có thể tạo key từ Swagger → dùng key để test `/v1/detect/image`.

---

## BƯỚC 7 — MỞ RỘNG BACKEND (các feature phụ)

**Thứ tự implement tiếp theo (mỗi file giải quyết 1 use case):**

### `backend/app/services/liveness.py` + `routers/liveness.py`

```python
# services/liveness.py: gọi :8502, map score → verdict
async def check_liveness(image_bytes) -> LivenessResult:
    r = await httpx.post(LIVENESS_INFER_URL + "/predict", files={"file": ...})
    score = r.json()["liveness_score"]
    # score >= LIVENESS_THRESHOLD → LIVE
    # score < LIVENESS_THRESHOLD - MARGIN → SPOOF
    # giữa 2 ngưỡng → UNCERTAIN
    verdict = _map_score_to_verdict(score)
    return LivenessResult(verdict=verdict, liveness_score=score, ...)

# routers/liveness.py: 2 router
# - api_router: /v1/detect/liveness (API key) → tích hợp ngoài
# - dashboard_router: /playground/detect/liveness (JWT) → dashboard test
```

### `backend/app/routers/playground.py`

```python
# Tương tự detect.py nhưng:
# - Auth bằng JWT (không cần API key)
# - source = "playground" trong DB
# - Chỉ admin/developer mới dùng được
# - include_heatmap=True mặc định (FE muốn thấy visualization)
```

### `backend/app/routers/detections.py`

```python
# GET /detections: list detection history của tenant
# GET /detections/{request_id}: 1 detection chi tiết
# PATCH /detections/{request_id}/note: thêm audit note
# → Frontend history-page và detail-page gọi vào đây
```

### `backend/app/routers/analytics.py`

```python
# GET /analytics/overview: tổng số detection, fake_rate, avg_latency
# Chỉ tính trong khoảng thời gian (days parameter)
# → Dashboard page gọi để hiển thị KPI
```

### `backend/app/routers/platform.py` — sysadmin console

```python
# Cross-tenant endpoints (không filter tenant_id)
# GET /tenants: list ALL tenants
# POST /tenants: tạo tenant + admin đầu tiên (ACTIVE ngay)
# PATCH /tenants/{id}: suspend/activate/đổi plan
# GET /tenants/{id}/users: xem user của tenant bất kỳ
```

### Các router còn lại (cùng pattern, implement theo nhu cầu)

```
routers/users.py          ← CRUD user trong tenant
routers/users_invites.py  ← mời user qua email
routers/tenants.py        ← tenant self-service (xem info của mình)
routers/webhooks.py       ← cấu hình webhook
routers/notifications.py  ← in-app notification
routers/models.py         ← model version + A/B test
routers/audit.py          ← query AuditLog
```

### `backend/app/main.py` — VIẾT CUỐI CÙNG trong backend

```python
# main.py CHỈ làm 3 việc:
# 1. Tạo FastAPI app instance
# 2. Attach middleware (CORS, request logging)
# 3. include_router cho tất cả router

# Viết cuối vì nó import TẤT CẢ router
# Thêm router mới → thêm 1 dòng include_router ở đây
```

---

## BƯỚC 8 — EKYC PIPELINE (feature đặc thù của thesis)

**Pipeline này là "showcase" của luận văn — 3 model phối hợp thành 1 hệ thống.**

### `deepguard_liveness/liveness.py` — thuật toán blink + yaw

```python
# Input: video bytes
# Output: is_live bool + liveness_score + blink_count + max_yaw

# Thuật toán:
# 1. Extract frames từ video (dùng OpenCV)
# 2. Mỗi frame: MediaPipe FaceMesh → 468 landmark điểm
# 3. Tính EAR (Eye Aspect Ratio) từ 6 landmark quanh mắt:
#    EAR = (||p2-p6|| + ||p3-p5||) / (2 * ||p1-p4||)
#    Mắt mở: EAR ~0.3; Mắt nhắm: EAR ~0.15
#    Chớp = EAR xuống dưới ngưỡng (0.21) rồi lên lại
# 4. Tính yaw từ nose tip displacement so với trung tâm mặt
# 5. is_live = blink_count >= 1 AND max_yaw >= 10°
```

### `deepguard_liveness/face_matching.py` — ArcFace cosine

```python
# Input: ảnh CCCD + list frame từ video
# Output: is_match bool + similarity score

# Thuật toán:
# 1. InsightFace ArcFace: ảnh → 512-dim embedding vector
# 2. Cosine similarity giữa CCCD embedding và mỗi frame embedding
# 3. Dùng MEAN (không phải MAX) → ổn định hơn
# 4. is_match = mean_similarity >= 0.45
```

### `deepguard_liveness/ekyc_pipeline.py` — cascade gom tất cả

```python
# POST /v1/ekyc/verify
# Input: id_card (ảnh CCCD) + selfie_video
async def ekyc_verify(id_card: UploadFile, selfie_video: UploadFile):
    id_bytes = await id_card.read()
    vid_bytes = await selfie_video.read()

    # Lưu tạm ra file (OpenCV/MediaPipe cần đường dẫn file)
    id_path = tempfile.mktemp(suffix=".jpg")
    vid_path = tempfile.mktemp(suffix=".mp4")
    try:
        Path(id_path).write_bytes(id_bytes)
        Path(vid_path).write_bytes(vid_bytes)

        # Layer 1: Liveness (dừng sớm nếu fail)
        liveness = check_liveness_from_video(vid_path)
        if liveness.verdict != "LIVE":
            return {"overall_pass": False, "fail_reason": "liveness", ...}

        # Layer 2: Deepfake (dùng backend service)
        frames = extract_frames(vid_bytes, n=3, filename=selfie_video.filename)
        deepfake = aggregate_deepfake([await run_inference(f) for f in frames])
        if deepfake.verdict == "FAKE":
            return {"overall_pass": False, "fail_reason": "deepfake", ...}

        # Layer 3: Face match
        match = match_faces(id_bytes, frames)
        if not match["is_match"]:
            return {"overall_pass": False, "fail_reason": "face_match", ...}

        return {"overall_pass": True, ...}
    finally:
        # Cleanup file tạm (T7 đã sửa: guard None)
        if id_path:
            try: os.unlink(id_path)
            except OSError: pass
        if vid_path:
            try: os.unlink(vid_path)
            except OSError: pass
```

---

## BƯỚC 9 — FRONTEND (sau khi backend API đã ổn định)

**Tại sao frontend SAU backend?**
- Frontend `lib/api.ts` mirror CHÍNH XÁC backend API contract
- Nếu API thay đổi → sửa cả 2 file → làm song song dễ lệch

**Thứ tự build frontend:**

### 9.1 Stores TRƯỚC mọi thứ khác

**`store/navigation.ts`** — định nghĩa `Page` type:
```typescript
// Phải làm đầu tiên vì: mọi component cần biết danh sách trang
export type Page = 'login' | 'dashboard' | 'history' | 'detail' | ...
// Thêm trang mới → thêm vào type này trước
```

**`store/auth.ts`** — JWT + user state:
```typescript
// Persist vào localStorage: reload vẫn còn login
// setAuth(), setApiKey(), logout()
// Zustand persist middleware tự sync
```

### 9.2 API client — mirror backend

**`lib/api.ts`** — viết hàm theo thứ tự router backend được build:
```typescript
// Mỗi backend endpoint → 1 hàm TypeScript
// Cùng tên, cùng param, cùng return type

// auth.py → authLogin, authRegister, authMe, authChangePassword
// detect.py → detectImage, detectVideo
// api_keys.py → apiKeysList, apiKeysCreate, apiKeysRevoke
// playground.py → playgroundDetectImage, playgroundDetectLiveness
// detections.py → detectionsList, detectionsGet
// ...
```

**Hàm `req<T>()` là trái tim (viết trước mọi hàm API):**
```typescript
// 3 chế độ auth trong 1 hàm:
// bearer=undefined → lấy JWT từ localStorage
// bearer="sk-dg-..." → dùng API key
// bearer=null → public endpoint
```

### 9.3 RBAC + Constants

**`lib/rbac.ts`** — mirror backend `require_role()`:
```typescript
// PAGE_ACCESS: phải mirror CHÍNH XÁC với backend role guards
// Nếu backend cho "admin" vào /api-keys, FE cũng phải cho admin vào trang apikeys
const PAGE_ACCESS = {
    apikeys: ['admin', 'developer'],   // mirror: routers/api_keys.py require_role
    tenants: ['sysadmin'],             // mirror: routers/platform.py require_sysadmin
}
```

**`lib/dg.ts`** — constants dùng khắp:
```typescript
// Verdict labels, màu badge, risk band colors
// Viết 1 lần → dùng khắp 18 trang → đổi màu chỉ sửa 1 chỗ
```

### 9.4 Layout + Shared components

**`app/layout.tsx`** — HTML root:
```typescript
// No-FOUC script: set theme TRƯỚC khi React hydrate
// Nếu không có → user thấy flash trắng khi dùng dark mode
```

**`components/deepguard/shared/index.tsx`** — viết trước pages:
```typescript
// Icon, ScoreBar, Gauge, CodeBlock
// Mọi page dùng → viết 1 lần, import khắp
// Nếu không có file này, mỗi page tự viết → 18 bản copy
```

**`components/deepguard/sidebar.tsx`** + **`top-header.tsx`**:
```typescript
// Layout shell cho workspace pages
// sidebar: filter menu theo role (dùng canAccess từ rbac.ts)
// top-header: user menu, logout, notification bell
```

### 9.5 `app/page.tsx` — SPA router (viết khi tất cả pages đã có)

```typescript
// Map currentPage → Component (viết khi đã có đủ pages)
const pageComponents = { dashboard: DashboardPage, playground: PlaygroundPage, ... }

// Logic redirect: user? → dashboard, !user? → login
// Logic session expired: lắng nghe event "dg:session-expired" từ api.ts
// Logic force-change-password: chặn mọi trang nếu must_change_password=true
// Logic RBAC: canAccess(role, currentPage) → hiện AccessDenied nếu false
```

### 9.6 Pages — thứ tự implement

```
1. login-page.tsx      ← đầu tiên, cần để test mọi thứ khác
2. register-page.tsx   ← public, đơn giản
3. dashboard-page.tsx  ← trang sau login, hiển thị KPI
4. playground-page.tsx ← test detect → thấy kết quả ngay
5. history-page.tsx    ← list detection cũ
6. detail-page.tsx     ← 1 detection + heatmap + audit
7. apikeys-page.tsx    ← quản lý key
8. liveness-page.tsx   ← test liveness
9. team-page.tsx       ← quản lý nhân sự
10-18. Các trang còn lại theo nhu cầu
```

---

## BƯỚC 10 — DEV TOOLING VÀ DEMO APP

### `up.sh` + `down.sh`

```bash
# up.sh: bật đúng thứ tự, mỗi bước health-check
# 1. Postgres :5432 (docker start)
# 2. MinIO :9000 (docker start)
# 3. serving deepfake :8501 (setsid uvicorn, log /tmp/serving_deepfake.log)
# 4. serving liveness :8502
# 5. backend :8000
# 6. frontend :3000
# Mỗi bước: wait_up(url) → curl tối đa 90s, timeout thì báo lỗi

# down.sh: fuser -k các port + docker stop
# Không xóa data: postgres volume và minio data giữ nguyên
```

Hàm `svc` trong up.sh — tại sao dùng `setsid`:
```bash
svc(){ fuser -k "$1/tcp" 2>/dev/null; sleep 1
       setsid bash -c "$2 >> $3 2>&1" </dev/null & }
# setsid: tách process khỏi terminal → đóng terminal không kill service
# </dev/null: không đọc stdin → không block
# >> $3: append log, không overwrite
```

### `ekyc_demo/app.py` — demo tích hợp (Streamlit)

```python
# Mô phỏng "app của dev tenant" tích hợp DeepGuard API
# Người dùng: nhập API key → upload CCCD + video → xem kết quả cascade
# Chứng minh: API dễ tích hợp, chỉ cần HTTP client + API key
# Không phải trang quản trị — là customer app

# Cascade:
# 1. POST /v1/detect/liveness → is_live?
# 2. Nếu LIVE: POST /v1/detect/image (frame từ video) → is_fake?
# 3. Display kết quả + Grad-CAM
```

---

## TỔNG KẾT — Bản đồ phụ thuộc theo thứ tự

```
BƯỚC 0: Phân tích bài toán + chốt kiến trúc
    ↓
BƯỚC 1: models.py → database.py → crud.py (phase 1)
    ↓
BƯỚC 2: Train SFDCT model (track AI song song)
    ↓
BƯỚC 3: face_crop.py → infer_server.py → liveness_server.py → attack_classifier.py
    ↓
BƯỚC 4: config.py → exceptions.py → security.py → audit.py
    ↓
BƯỚC 5: dependencies.py → auth.py (LOGIN ĐƯỢC RỒI)
    ↓
BƯỚC 6: ml_inference.py → risk.py → detect.py → api_keys.py (DETECT ĐƯỢC RỒI)
    ↓
BƯỚC 7: liveness.py service → liveness.py router → playground.py → detections.py
         analytics.py → platform.py → users.py → users_invites.py → ...
         main.py (BACKEND HOÀN CHỈNH)
    ↓
BƯỚC 8: deepguard_liveness/liveness.py → face_matching.py → ekyc_pipeline.py
    ↓
BƯỚC 9: navigation.ts → auth.ts → api.ts → rbac.ts → dg.ts
         layout.tsx → shared/ → sidebar → top-header
         page.tsx → login → dashboard → playground → ... (18 trang)
    ↓
BƯỚC 10: up.sh → down.sh → ekyc_demo/app.py
```

---

## Câu hỏi hội đồng — "Tại sao làm theo thứ tự này?"

**Q: Tại sao thiết kế database trước khi viết code?**
> Mọi component phụ thuộc vào schema. Làm code trước → liên tục thêm cột → migration loạn. Làm database trước 1-2 ngày → mọi thứ sau đó viết 1 lần đúng ngay.

**Q: Tại sao serving tách ra trước khi viết backend?**
> Backend cần biết JSON format của serving để parse. Test serving độc lập bằng curl → biết contract trước. Nếu gộp vào, không biết test kiểu gì.

**Q: Tại sao auth phải làm trước các feature?**
> Mọi feature cần biết "ai đang gọi". Thêm auth sau = thêm vào từng endpoint một → dễ bỏ sót. Làm auth trước → dependencies sẵn, mỗi endpoint chỉ thêm 1 dòng `Depends(get_current_user)`.

**Q: Tại sao frontend làm sau cùng?**
> Frontend lib/api.ts mirror chính xác backend API contract. Nếu làm song song, API thay đổi → sửa cả 2 → dễ lệch. Làm backend stable trước, frontend có contract rõ ràng để implement.

**Q: Bạn có thể tạo lại project này từ đầu không?**
> Có — theo đúng 10 bước trên. Bước 0 là quan trọng nhất: không phân tích bài toán đúng, mọi bước sau đều sai hướng.

---

*File này được viết từ code thật, không từ trí nhớ. Mọi quyết định thiết kế đều có thể trace về file:dòng cụ thể trong repo.*
