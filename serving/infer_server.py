"""infer_server.py — microservice phục vụ model deepfake (đa-model: SFDCT / B4 / HFF).

Cô lập torch/DeepfakeBench khỏi backend chính. Backend (FastAPI :8000) gọi POST /predict qua HTTP.
Tái dùng tools/infer.py (load_model + gradcam). Trả: prob_fake + verdict + Grad-CAM (base64 data URL).

Chọn model: POST /predict?model=sfdct|b4|hff  (mặc định sfdct). Model load LAZY + cache theo tên.

Chạy (từ repo root):
  uvicorn serving.infer_server:app --host 0.0.0.0 --port 8501
Env tuỳ chọn: SFDCT_CONFIG, SFDCT_CKPT (override entry 'sfdct'); SFDCT_DEFAULT_MODEL; SFDCT_THRESHOLD.
"""
import os
import sys
import time
import base64
import hashlib
from collections import OrderedDict

import numpy as np
import torch
import cv2
from fastapi import FastAPI, UploadFile, File, Query
from fastapi.responses import JSONResponse

torch.set_num_threads(os.cpu_count() or 2)

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(REPO, "tools"))        # tools/infer.py
sys.path.insert(0, os.path.join(REPO, "training"))     # detectors/...
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))  # cho `import face_crop`
import infer as infer_mod                              # tools/infer.py
from face_crop import crop_face_bgr                    # crop mặt -> khớp train/serve

THR = float(os.environ.get("SFDCT_THRESHOLD", "0.5"))
FACE_CROP = os.environ.get("SFDCT_FACE_CROP", "1") == "1"
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"

# Registry đa-model. Mỗi entry: config (đúng kiến trúc ckpt) + checkpoint + nhãn version.
# 'sfdct' giữ env-override để tương thích cấu hình cũ.
def _p(*parts):
    return os.path.join(REPO, *parts)

MODELS = {
    "sfdct": {
        "cfg": os.environ.get("SFDCT_CONFIG", _p("serving/naive_sfdct/config.yaml")),
        "ckpt": os.environ.get("SFDCT_CKPT", _p("serving/naive_sfdct/ckpt_best.pth")),
        "version": os.environ.get("SFDCT_VERSION", "SFDCT · B4+block-DCT (cdfv2 0.7572)"),
    },
    "b4": {
        "cfg": _p("serving/b4/config.yaml"),
        "ckpt": _p("serving/b4/ckpt_best.pth"),
        "version": "B4 · spatial baseline",
    },
    "hff": {
        "cfg": _p("serving/hff/config.yaml"),
        "ckpt": _p("serving/hff/ckpt_best.pth"),
        "version": "SFDCT-HFF · high-pass residual (R3, cdfv2 0.7695)",
    },
}
DEFAULT_MODEL = os.environ.get("SFDCT_DEFAULT_MODEL", "sfdct")

app = FastAPI(title="Deepfake Inference Service (multi-model)", version="2.0")

_loaded: dict = {}   # name -> (model, cfg)  (lazy-load cache)

# Cache kết quả theo (sha256 ảnh, gradcam, model) — demo xoay quanh vài preset nên hit rate cao
_CACHE_MAX = 64
_cache: "OrderedDict[tuple, dict]" = OrderedDict()


def _resolve(name):
    return name if name in MODELS else DEFAULT_MODEL


def _get_model(name):
    name = _resolve(name)
    if name not in _loaded:
        spec = MODELS[name]
        _loaded[name] = infer_mod.load_model(spec["cfg"], spec["ckpt"], DEVICE)
    return _loaded[name]


def _prob_only(model, x):
    with torch.inference_mode():
        feat = model.features({"image": x.to(DEVICE)})
        prob = torch.softmax(model.classifier(feat), dim=1)[0, 1]
    return float(prob)


@app.on_event("startup")
def _warmup():
    """Load model mặc định + 1 forward giả — request đầu không phải gánh. Model khác load lazy."""
    model, cfg = _get_model(DEFAULT_MODEL)
    res = int(cfg.get("resolution", 256))
    _prob_only(model, torch.zeros(1, 3, res, res))


@app.get("/health")
def health():
    return {"ok": True, "device": DEVICE, "default_model": DEFAULT_MODEL,
            "models": {k: v["version"] for k, v in MODELS.items()},
            "loaded": list(_loaded.keys())}


@app.post("/predict")
async def predict(file: UploadFile = File(...), gradcam: bool = Query(default=True),
                  model: str = Query(default=None)):
    start = time.perf_counter()
    raw = await file.read()
    name = _resolve(model)

    key = (hashlib.sha256(raw).hexdigest(), gradcam, name)
    if key in _cache:
        _cache.move_to_end(key)
        resp = dict(_cache[key])
        resp["processing_time_ms"] = int((time.perf_counter() - start) * 1000)
        resp["cached"] = True
        return resp

    bgr = cv2.imdecode(np.frombuffer(raw, np.uint8), cv2.IMREAD_COLOR)
    if bgr is None:
        return JSONResponse({"error": "cannot decode image"}, status_code=400)
    face_found = False
    if FACE_CROP:
        bgr, face_found = crop_face_bgr(bgr)
    mdl, cfg = _get_model(name)
    mean = cfg.get("mean", [0.5, 0.5, 0.5]); std = cfg.get("std", [0.5, 0.5, 0.5])
    res = int(cfg.get("resolution", 256))
    rgb = cv2.cvtColor(cv2.resize(bgr, (res, res), interpolation=cv2.INTER_LINEAR), cv2.COLOR_BGR2RGB)
    x = ((rgb.astype(np.float32) / 255.0 - np.array(mean)) / np.array(std)).transpose(2, 0, 1)
    x = torch.from_numpy(x).float().unsqueeze(0)

    cam_b64 = None
    if gradcam:
        prob, cam = infer_mod.gradcam(mdl, x, DEVICE)
        cam = cv2.resize(cam, (res, res), interpolation=cv2.INTER_LINEAR)
        heat = cv2.cvtColor(cv2.applyColorMap((cam * 255).astype(np.uint8), cv2.COLORMAP_JET), cv2.COLOR_BGR2RGB)
        overlay = (0.55 * rgb + 0.45 * heat).clip(0, 255).astype(np.uint8)
        ok, buf = cv2.imencode(".jpg", cv2.cvtColor(overlay, cv2.COLOR_RGB2BGR))
        cam_b64 = "data:image/jpeg;base64," + base64.b64encode(buf.tobytes()).decode()
    else:
        prob = _prob_only(mdl, x)
    verdict = "FAKE" if prob >= THR else "REAL"

    resp = {
        "prob_fake": round(float(prob), 4),
        "verdict": verdict,
        "threshold": THR,
        "face_cropped": face_found,
        "gradcam": cam_b64,
        "model": name,
        "model_version": MODELS[name]["version"],
        "device": DEVICE,
        "processing_time_ms": int((time.perf_counter() - start) * 1000),
    }
    _cache[key] = resp
    if len(_cache) > _CACHE_MAX:
        _cache.popitem(last=False)
    return resp
