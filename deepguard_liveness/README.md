# DeepGuard Liveness + Face Match Module

Tích hợp 2 components còn lại của pipeline eKYC theo đề cương:

1. **Liveness Detection** — MediaPipe FaceMesh + EAR + head pose
2. **Face Matching** — InsightFace ArcFace + cosine similarity

Cùng với **Deepfake Detection** (đã có từ session trước) → **pipeline eKYC end-to-end**.

## Cấu trúc

```
deepguard_liveness/
├── liveness.py         # MediaPipe + EAR + head pose
├── face_matching.py    # InsightFace ArcFace
├── ekyc_pipeline.py    # FastAPI endpoint tích hợp 3 layer
├── requirements.txt
└── README.md
```

## Setup

```bash
pip install -r requirements.txt
```

### Lưu ý cài đặt

- **MediaPipe**: cần Python 3.8-3.11 (chưa support 3.12+ stable)
- **InsightFace**: cần ONNX Runtime. Lần đầu run sẽ download model `buffalo_l` (~280MB)

## Sử dụng

### Standalone test Liveness

```python
from liveness import LivenessDetector

det = LivenessDetector()
result = det.check_video("selfie.mp4")

print(f"Live: {result['is_live']}")
print(f"Blinks: {result['blink_count']}")
print(f"Head yaw range: {result['head_yaw_range_deg']}°")
```

### Standalone test Face Matching

```python
from face_matching import FaceMatcher

matcher = FaceMatcher()
result = matcher.match(
    id_card_image_path="cccd.jpg",
    selfie_video_path="selfie.mp4",
)

print(f"Match: {result['is_match']}")
print(f"Similarity: {result['similarity']}")
```

### Full pipeline qua FastAPI

```bash
# Add router vào main.py
from .ekyc_pipeline import router as ekyc_router
app.include_router(ekyc_router)

# Test
curl -X POST http://localhost:8000/v1/ekyc/verify \
  -H "X-API-Key: demo-key" \
  -F "id_card=@cccd.jpg" \
  -F "selfie_video=@selfie.mp4"
```

## Logic chi tiết

### Liveness check (PASS conditions)

1. **Eye blink ≥ 1**: dùng EAR (Eye Aspect Ratio) formula của Soukupova & Cech 2016
   - EAR < 0.21 → mắt nhắm
   - State machine đếm số transitions nhắm→mở
2. **Head yaw range ≥ 10°**: chứng minh user không phải ảnh tĩnh
   - Đo qua nose tip displacement so với face center

Cả 2 phải pass.

### Deepfake check

Dùng `ModelManager` đã có sẵn (B4 + DCT) với threshold 0.6197 (eKYC calibrated, FPR≤5%).

Sample 3 frames từ video (1/4, 1/2, 3/4) → average prob_fake → so với threshold.

### Face matching

1. Extract ArcFace embedding từ CCCD (1 ảnh)
2. Extract ArcFace embeddings từ 5 frames sample của video selfie
3. Tính cosine similarity giữa CCCD emb và mỗi video emb
4. Max similarity ≥ 0.45 → MATCH

## Demo workflow

### Trước demo (chuẩn bị trước)

Quay sẵn 3 video bằng điện thoại:
1. `selfie_real.mp4` (5s): nháy mắt 2-3 lần + quay đầu trái-phải
2. `selfie_no_blink.mp4` (5s): nhìn thẳng không nháy → test FAIL liveness
3. `selfie_deepfake.mp4` (5s): hoặc 1 ảnh deepfake convert thành video tĩnh

Chụp 2 ảnh CCCD:
1. `cccd_real.jpg` (CCCD của em, hoặc 1 ảnh người trong selfie_real.mp4)
2. `cccd_wrong.jpg` (CCCD người khác → test FAIL face match)

### Trong demo (3 cases)

**Case 1 — PASS đầy đủ:**
- Upload `cccd_real.jpg` + `selfie_real.mp4`
- Liveness PASS (có blink + head motion)
- Deepfake PASS (real video)
- Face match PASS (cùng người)
- → ✅ Verdict: PASS

**Case 2 — FAIL liveness:**
- Upload `cccd_real.jpg` + `selfie_no_blink.mp4`
- Liveness FAIL (no blink)
- Deepfake PASS
- Face match PASS
- → ❌ Verdict: FAIL (lý do: liveness)

**Case 3 — FAIL face match:**
- Upload `cccd_wrong.jpg` + `selfie_real.mp4`
- Liveness PASS
- Deepfake PASS
- Face match FAIL (khác người)
- → ❌ Verdict: FAIL (lý do: identity mismatch)

3 cases này cover đủ pipeline trước hội đồng — chỉ mất 2-3 phút.

## Tips quan trọng

### Thresholds calibration

- **EAR threshold = 0.21**: chuẩn paper, có thể giảm xuống 0.19 nếu false positive nhiều
- **Min blinks = 1**: đơn giản. Production nên ≥2 trong 5s
- **Min yaw range = 10°**: thấp cho dễ pass demo. Production: 20-30°
- **Face match threshold = 0.45**: chuẩn ArcFace. Bank thường dùng 0.5-0.6

### Performance

- MediaPipe FaceMesh: ~30ms/frame trên CPU
- ArcFace embedding: ~50ms/frame trên CPU
- Video 5s @ 30fps = 150 frames, processing ~10-15s tổng

Cho production cần GPU. Cho demo thì CPU OK.

### Compliance

- KHÔNG lưu video sau khi xử lý xong (delete temp files)
- Chỉ lưu hash + metadata vào audit log
- Theo Nghị định 13/2023/NĐ-CP
