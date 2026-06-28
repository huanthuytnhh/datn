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
import threading
from collections import OrderedDict

import numpy as np
import torch
import cv2
from fastapi import FastAPI, UploadFile, File, Query, HTTPException
from fastapi.responses import JSONResponse

torch.set_num_threads(os.cpu_count() or 2)

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(REPO, "tools"))        # tools/infer.py
sys.path.insert(0, os.path.join(REPO, "training"))     # detectors/...
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))  # cho `import face_crop`
import infer as infer_mod                              # tools/infer.py
from face_crop import crop_face_bgr, align_or_crop_face  # crop/align mặt -> parity train/serve
from quality import assess as assess_quality            # chấm chất lượng ảnh (flag-only)

THR = float(os.environ.get("SFDCT_THRESHOLD", "0.5"))
FACE_CROP = os.environ.get("SFDCT_FACE_CROP", "1") == "1"
# Crop mặt. Default = square (SFDCT_ALIGN=0): validate trên video thật cho thấy
# square > align (warp của align nhoè chính artifact giả -> bỏ sót fake). Align code
# vẫn giữ, bật lại bằng SFDCT_ALIGN=1 nếu sau này dùng landmark dlib-81.
ALIGN = os.environ.get("SFDCT_ALIGN", "0") == "1"
ALIGN_SCALE = float(os.environ.get("SFDCT_ALIGN_SCALE", "1.3"))       # scale lúc train (chỉ dùng khi ALIGN=1)
FALLBACK_EXPAND = float(os.environ.get("SFDCT_CROP_EXPAND", "1.30"))  # expand crop vuông (validate: tốt nhất)
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
_lock = threading.Lock()  # bảo vệ load model + ghi cache khỏi race nhiều request

# Cache kết quả theo (sha256 ảnh, gradcam, model) — demo xoay quanh vài preset nên hit rate cao
_CACHE_MAX = 64
_cache: "OrderedDict[tuple, dict]" = OrderedDict()


def _resolve(name):
    if name is None:
        return DEFAULT_MODEL
    if name not in MODELS:
        raise HTTPException(status_code=400, detail=f"Unknown model: {name}")
    return name


def _get_model(name):
    name = _resolve(name)
    if name not in _loaded:
        with _lock:
            if name not in _loaded:   # double-checked: tránh load 2 lần khi 2 request đua
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
    with _lock:
        hit = _cache.get(key)
        if hit is not None:
            _cache.move_to_end(key)
            hit = dict(hit)
    if hit is not None:
        total_time_ms = int((time.perf_counter() - start) * 1000)
        hit["processing_time_ms"] = total_time_ms
        hit["cached"] = True
        if "timing_details_ms" in hit:
            hit["timing_details_ms"] = dict(hit["timing_details_ms"])
            hit["timing_details_ms"]["total_serving_ms"] = total_time_ms
        print(f"[DEBUG TIMING DEEPFAKE] model={name} CACHED total={total_time_ms}ms", flush=True)
        return hit

    t_decode_start = time.perf_counter()
    bgr = cv2.imdecode(np.frombuffer(raw, np.uint8), cv2.IMREAD_COLOR)
    t_decode = time.perf_counter() - t_decode_start

    if bgr is None:
        return JSONResponse({"error": "cannot decode image"}, status_code=400)

    t_crop_start = time.perf_counter()
    face_found = False
    crop_method = "none"
    face_px, ratio = 0, 0.0
    if FACE_CROP:
        if ALIGN:
            bgr, face_found, crop_method, face_px, ratio = align_or_crop_face(
                bgr, outsize=256, align_scale=ALIGN_SCALE, expand=FALLBACK_EXPAND)
        else:
            bgr, face_found = crop_face_bgr(bgr, expand=FALLBACK_EXPAND)
            crop_method = "square" if face_found else "none"
            if face_found:
                src = max(bgr.shape[0], bgr.shape[1])
                face_px = int(round(src / FALLBACK_EXPAND))
                ratio = 256.0 / src
    t_crop = time.perf_counter() - t_crop_start

    t_model_start = time.perf_counter()
    mdl, cfg = _get_model(name)
    mean = cfg.get("mean", [0.5, 0.5, 0.5]); std = cfg.get("std", [0.5, 0.5, 0.5])
    res = int(cfg.get("resolution", 256))
    t_model = time.perf_counter() - t_model_start

    t_quality_start = time.perf_counter()
    crop_resized = cv2.resize(bgr, (res, res), interpolation=cv2.INTER_LINEAR)
    rgb = cv2.cvtColor(crop_resized, cv2.COLOR_BGR2RGB)
    # Guard chất lượng (flag-only): mặt nhỏ/mờ/tối/cháy sáng/không mặt -> cờ low_quality.
    quality = assess_quality(crop_resized, face_px, ratio, face_found) if FACE_CROP else None
    t_quality = time.perf_counter() - t_quality_start

    t_infer_start = time.perf_counter()
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
    t_infer = time.perf_counter() - t_infer_start

    verdict = "FAKE" if prob >= THR else "REAL"
    t_total = time.perf_counter() - start

    timing_details = {
        "decode_ms": int(t_decode * 1000),
        "crop_ms": int(t_crop * 1000),
        "quality_ms": int(t_quality * 1000),
        "model_load_ms": int(t_model * 1000),
        "inference_gradcam_ms": int(t_infer * 1000),
        "total_serving_ms": int(t_total * 1000),
    }

    print(f"[DEBUG TIMING DEEPFAKE] model={name} "
          f"decode={timing_details['decode_ms']}ms "
          f"crop={timing_details['crop_ms']}ms "
          f"quality={timing_details['quality_ms']}ms "
          f"model_load={timing_details['model_load_ms']}ms "
          f"inference={timing_details['inference_gradcam_ms']}ms "
          f"total={timing_details['total_serving_ms']}ms", flush=True)

    resp = {
        "prob_fake": round(float(prob), 4),
        "verdict": verdict,
        "threshold": THR,
        "face_cropped": face_found,
        "crop_method": crop_method,
        "quality": quality,
        "gradcam": cam_b64,
        "model": name,
        "model_version": MODELS[name]["version"],
        "device": DEVICE,
        "processing_time_ms": timing_details["total_serving_ms"],
        "timing_details_ms": timing_details,
    }
    with _lock:
        _cache[key] = resp
        if len(_cache) > _CACHE_MAX:
            _cache.popitem(last=False)
    return resp
