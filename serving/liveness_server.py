"""liveness_server.py — microservice B4 Liveness (passive anti-spoofing).

Cô lập torch khỏi backend chính. Backend (:8000) gọi POST /predict qua HTTP.
Trả: liveness_score = P(live) ∈ [0,1].

Chạy (từ DeepfakeBench root):
  uvicorn serving.liveness_server:app --host 0.0.0.0 --port 8502
Env: LIVENESS_CKPT, LIVENESS_VERSION
"""
import io
import os
import sys
import time

import numpy as np
import cv2
import torch
import torch.nn.functional as F
from fastapi import FastAPI, File, UploadFile
from fastapi.responses import JSONResponse
from PIL import Image

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(REPO, "liveness"))
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))   # cho `import face_crop`
from model_liveness import B4Liveness, NORM_MEAN, NORM_STD, RESOLUTION  # noqa: E402
from face_crop import crop_face_bgr  # noqa: E402

# Crop mặt về dạng LCC-FASD (mặt đầy khung) TRƯỚC khi resize — khớp train/serve.
# Tắt bằng LIVENESS_FACE_CROP=0 nếu input đã là mặt crop sẵn.
FACE_CROP = os.environ.get("LIVENESS_FACE_CROP", "1") == "1"

import torchvision.transforms as T  # noqa: E402

CKPT = os.environ.get(
    "LIVENESS_CKPT",
    os.path.join(REPO, "serving/liveness_b4/ckpt_best.pth"),
)
MODEL_VERSION = os.environ.get("LIVENESS_VERSION", "b4-liveness-auc0.9829")
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"

app = FastAPI(title="Liveness Inference Service", version="1.0")

_model: B4Liveness | None = None
_transform = T.Compose([
    # T.Resize đã bỏ: path cv2 resize bằng INTER_CUBIC trước khi tạo PIL Image
    # Path PIL fallback dùng T.Resize với BICUBIC ≈ INTER_CUBIC
    T.Resize((RESOLUTION, RESOLUTION), interpolation=T.InterpolationMode.BICUBIC),
    T.ToTensor(),
    T.Normalize(mean=NORM_MEAN, std=NORM_STD),
])


def _get_model() -> B4Liveness:
    global _model
    if _model is None:
        m = B4Liveness(num_classes=2, use_pretrained=False)
        ckpt = torch.load(CKPT, map_location=DEVICE)
        m.load_state_dict(ckpt["state_dict"])
        m.to(DEVICE)
        m.eval()
        _model = m
        print(f"[liveness] {os.path.basename(CKPT)} loaded on {DEVICE}", flush=True)
    return _model


@app.on_event("startup")
def startup():
    _get_model()


@app.get("/health")
def health():
    return {
        "ok": True,
        "device": DEVICE,
        "ckpt": os.path.basename(CKPT),
        "model_version": MODEL_VERSION,
    }


@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    start = time.perf_counter()
    image_bytes = await file.read()
    # B4: ảnh rác/rỗng → 400 ngay (không để lọt xuống inference rồi 500 → client dịch 503 che lỗi input)
    try:
        Image.open(io.BytesIO(image_bytes)).verify()
    except Exception:
        return JSONResponse(status_code=400, content={"error": "Ảnh không hợp lệ (không giải mã được)."})
    face_found = False
    try:
        if FACE_CROP:
            bgr = cv2.imdecode(np.frombuffer(image_bytes, np.uint8), cv2.IMREAD_COLOR)
            if bgr is not None:
                crop, face_found = crop_face_bgr(bgr)
                # INTER_CUBIC khớp pipeline eval (gen_fig_liveness_roc.py:30)
                crop = cv2.resize(crop, (RESOLUTION, RESOLUTION), interpolation=cv2.INTER_CUBIC)
                img = Image.fromarray(cv2.cvtColor(crop, cv2.COLOR_BGR2RGB))
            else:
                img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        else:
            img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        x = _transform(img).unsqueeze(0).to(DEVICE)   # [1,3,256,256]
        with torch.no_grad():
            logits = _get_model()(x)                   # [1,2]
            probs = F.softmax(logits, dim=1)[0]        # [P(live), P(spoof)]
        prob_live = float(probs[0].cpu())
        prob_spoof = float(probs[1].cpu())
    except Exception as exc:
        return JSONResponse(status_code=500, content={"error": str(exc)})

    # --- Heuristic attack-type classification (chỉ khi spoof) ---
    attack_info = None
    if prob_spoof > 0.5:
        try:
            from attack_classifier import classify_attack_type
            rgb_np = np.array(img)   # PIL → numpy HxWx3 RGB
            attack_info = classify_attack_type(rgb_np)
        except Exception as exc:
            attack_info = {"error": str(exc)}

    result = {
        "liveness_score": round(prob_live, 4),
        "prob_spoof": round(prob_spoof, 4),
        "face_cropped": face_found,
        "processing_time_ms": int((time.perf_counter() - start) * 1000),
        "model_version": MODEL_VERSION,
        "device": DEVICE,
    }
    if attack_info is not None:
        result["attack_analysis"] = attack_info
    return result
