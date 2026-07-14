# Cấu trúc Response các API DeepGuard (sau khi gỡ field thừa)

> Auth: endpoint **external** dùng API key (`Authorization: Bearer <key>`); endpoint **dashboard** dùng JWT.
> Đã gỡ khỏi response: `spatial_score`, `frequency_score` (null ở path SFDCT, chỉ là heuristic — gây hiểu nhầm)
> và `prob_cnn` (trùng `prob_fake`). Khách eKYC dùng chính `risk_score` + `decision_hint`.

---

## EXTERNAL (API key) — cái khách hàng tích hợp dùng

### 1) `POST /detect/image` → `DetectionResponse`  *(chính)*
```jsonc
{
  "request_id": "uuid",
  // ── Tín hiệu rủi ro — KHÁCH DÙNG KHỐI NÀY ──
  "risk_score": 0.83,            // P(deepfake) đã calibrate ∈[0,1] (=prob_fake khi T=1)
  "risk_band": "high",           // low | medium | high  (cắt 0.30 / 0.70)
  "decision_hint": "reject",     // pass | review | reject  (GỢI Ý, không phải quyết định cuối)
  "thresholds": { "low": 0.3, "high": 0.7 },
  // ── Giải thích trực quan (hiện UI) ──
  "heatmap": "data:image/png;base64,…",    // Grad-CAM (model thật)
  "frequency": "data:image/png;base64,…",  // phổ log|2D-DCT| (tính từ ảnh, KHÔNG phải score model)
  // ── Chi tiết / tương thích ngược ──
  "verdict": "FAKE",             // FAKE | REAL | UNCERTAIN  (ngưỡng 0.35 ± margin 0.10)
  "confidence": 73.8,            // 0–100, độ xa prob_fake tới ngưỡng (KHÔNG phải xác suất)
  "prob_fake": 0.83,             // ★ output thô của model (softmax lớp fake)
  "threshold_used": 0.35,        // ngưỡng phân loại nhị phân
  "face_detected": true,
  "processing_time_ms": 940,
  "model_version": "naive_sfdct",
  "image_width": 256, "image_height": 256,
  "created_at": "2026-06-20T09:12:33Z"
}
```

### 2) `POST /detect/video` → `VideoDetectionResponse`  *(HTTP 202, xử lý theo lô khung)*
```jsonc
{
  "job_id": "uuid",
  "verdict": "FAKE",
  "confidence": 71.0,
  "prob_fake": 0.78,             // điểm gộp trung bình các khung
  "frames_analyzed": 32,
  "frames_fake": 19,             // số khung vượt ngưỡng
  "frame_results": [ { "frame_id": 0, "prob_fake": 0.81, "thumb": "data:image/jpeg;base64,…" }, … ],
  "model_version": "naive_sfdct",
  "processing_time_ms": 8400,
  "created_at": "…"
}
```

### 3) `GET /jobs/{job_id}` → trạng thái job video (dict)
```jsonc
{
  "job_id": "uuid",
  "status": "completed",         // pending | running | completed | failed
  "progress_percent": 100,
  "result": { … },               // payload VideoDetectionResponse khi xong
  "error_message": null,
  "created_at": "…", "completed_at": "…"
}
```

### 4) `GET /results/{request_id}` → `DetectionResponse`
Giống (1), lấy lại kết quả ảnh đã chạy (heatmap/frequency có thể null vì tính lại từ DB).

### 5) `POST /detect/liveness` → `LivenessResponse`  *(bộ lọc cascade, chạy trước)*
```jsonc
{
  "check_id": "uuid",
  "verdict": "SPOOF",            // LIVE | SPOOF | UNCERTAIN
  "liveness_score": 0.31,        // 0–1 (xác suất là người thật)
  "confidence": 78.0,            // 0–100
  "spoof_type": "screen",        // print | screen | mask_3d | deepfake | unknown | null
  "threshold_used": 0.5,
  "mode": "passive",             // passive | active
  "challenge_type": null,        // chỉ active mode
  "challenge_passed": null,
  "frame_count": 1,
  "processing_time_ms": 120,
  "model_version": "b4_liveness",
  "image_width": 256, "image_height": 256,
  "created_at": "…"
}
```

### 6) `GET /liveness/challenge` → `LivenessChallengeResponse`  *(active liveness)*
```jsonc
{
  "challenge_id": "opaque-id",
  "challenge_type": "blink",     // blink | turn_left | turn_right | smile | nod
  "instructions": "Hãy chớp mắt",
  "expires_at": "…"
}
```

### 7) `POST /detect/liveness/active` → `LivenessResponse`
Giống (5) nhưng `mode: "active"`, có `challenge_type` + `challenge_passed`.

---

## DASHBOARD (JWT) — list & detail trong web

### 8) `GET /detections` → `Paginated[DetectionListItem]`
```jsonc
{
  "items": [ {
    "request_id": "uuid", "verdict": "FAKE", "confidence": 73.8, "prob_fake": 0.83,
    "processing_time_ms": 940, "model_version": "naive_sfdct",
    "image_hash": "sha256…", "created_at": "…", "source": "api"   // api | playground
  }, … ],
  "total": 128, "page": 1, "page_size": 20
}
```

### 9) `GET /detections/{request_id}` → `DetectionDetail`
Như `DetectionResponse` nhưng thêm forensic/audit: `image_hash`, `image_thumb`, `heatmap_url` (S3 presigned 1h),
`user_agent`, `ip_address`, `audit_notes[]`, `api_key_prefix/name`, `tenant_name`. **Không còn** `spatial_score`/`frequency_score`/`prob_cnn`.

### 10) `GET /liveness` → `Paginated[LivenessListItem]`
`check_id, verdict, liveness_score, confidence, spoof_type, mode, processing_time_ms, model_version, created_at`.

### 11) `GET /liveness/{check_id}` → `LivenessDetail`
Như `LivenessResponse` + `image_thumb, image_hash, ip_address, user_agent, api_key_*, tenant_name`.

---

## Ghi chú trung thực (đối chiếu code, dùng khi bảo vệ)
- **Một con số gốc duy nhất** từ model deepfake là `prob_fake` (softmax). `risk_score` = bản calibrate (T=1 nên đang bằng nó); mọi field còn lại là dẫn xuất hoặc metadata.
- **Đã gỡ** `prob_cnn` (=prob_fake), `spatial_score`/`frequency_score` (null ở path SFDCT; bản cũ chỉ là Laplacian-std + FFT-mid-band, không phải nhánh tần số của model).
- `confidence` là **độ xa tới ngưỡng** co về 0–100, không phải xác suất.
- `frequency` (base64) là **hình phổ DCT tính từ ảnh** để minh hoạ, độc lập với điểm số model.
- `model_version` phản ánh checkpoint serving đang load (mặc định `naive_sfdct`; trỏ `SFDCT_CKPT` sang HFF nếu muốn).
