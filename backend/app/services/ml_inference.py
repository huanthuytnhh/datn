"""
ML inference service — port chính xác từ detect_from_notebook.md

Pipeline:
  1. bytes → PIL Image → numpy RGB
  2. MTCNN detect face → crop + FACE_PAD_RATIO=0.25
  3. EfficientNet-B4 forward → prob_cnn
  4. TTA: average với flip ngang
  5. freq_fake_score() = (Laplacian std + FFT mid-freq) / 2
  6. prob_fake = (1 - FREQ_WEIGHT) * prob_cnn + FREQ_WEIGHT * freq_score
  7. verdict: FAKE / REAL / UNCERTAIN (zone threshold±0.10)

Khi MOCK_ML=true hoặc MODEL_PATH chưa set → mock deterministic.
Khi MODEL_PATH set → load DeepFakeModel, chạy real inference.
"""

from __future__ import annotations

import collections
import hashlib
import io
import math
import random
import re
import time
from dataclasses import dataclass
from functools import partial, lru_cache
from typing import Optional

import numpy as np
from PIL import Image

from app.config import get_settings

settings = get_settings()

# ─────────────────────────────────────────────────────────────────────────────
# Constants (từ notebook)
# ─────────────────────────────────────────────────────────────────────────────
IMG_SIZE       = 224
FAKE_THRESHOLD = 0.35
FACE_PAD_RATIO = 0.25
USE_TTA        = True
USE_FREQ       = True
FREQ_WEIGHT    = 0.25
UNCERTAIN_MARGIN = 0.10   # UNCERTAIN nếu |prob_fake - threshold| < margin


# ─────────────────────────────────────────────────────────────────────────────
# Result dataclass
# ─────────────────────────────────────────────────────────────────────────────
@dataclass
class InferenceResult:
    verdict: str            # REAL | FAKE | UNCERTAIN
    confidence: float       # 0-100
    prob_fake: float        # 0-1
    prob_cnn: float         # 0-1
    spatial_score: float    # Laplacian std (normalized 0-1)
    frequency_score: float  # FFT mid-freq score (normalized 0-1)
    threshold_used: float
    face_detected: bool
    processing_time_ms: int
    model_version: str
    image_width: Optional[int]
    image_height: Optional[int]
    image_hash: str
    image_thumb: Optional[str] = None  # base64 JPEG data URL of input
    heatmap: Optional[str] = None      # base64 Grad-CAM overlay (data URL) — từ microservice SFDCT


# ─────────────────────────────────────────────────────────────────────────────
# EfficientNet-B4 Architecture (port từ notebook, không thay đổi)
# ─────────────────────────────────────────────────────────────────────────────
GlobalParams = collections.namedtuple("GlobalParams", [
    "batch_norm_momentum", "batch_norm_epsilon", "dropout_rate", "num_classes",
    "width_coefficient", "depth_coefficient", "depth_divisor", "min_depth",
    "drop_connect_rate", "image_size"
])
BlockArgs = collections.namedtuple("BlockArgs", [
    "kernel_size", "num_repeat", "input_filters", "output_filters",
    "expand_ratio", "id_skip", "stride", "se_ratio"
])
GlobalParams.__new__.__defaults__ = (None,) * len(GlobalParams._fields)
BlockArgs.__new__.__defaults__    = (None,) * len(BlockArgs._fields)

efficientnet_params = {"efficientnet-b4": (1.4, 1.8, 380, 0.4)}
blocks_args_str = [
    "r1_k3_s11_e1_i32_o16_se0.25",  "r2_k3_s22_e6_i16_o24_se0.25",
    "r2_k5_s22_e6_i24_o40_se0.25",  "r3_k3_s22_e6_i40_o80_se0.25",
    "r3_k5_s11_e6_i80_o112_se0.25", "r4_k5_s22_e6_i112_o192_se0.25",
    "r1_k3_s11_e6_i192_o320_se0.25",
]
url_map_advprop = {
    "efficientnet-b4": "https://github.com/lukemelas/EfficientNet-PyTorch/releases/download/1.0/adv-efficientnet-b4-44fb3a87.pth",
}


class BlockDecoder:
    @staticmethod
    def _decode_block_string(block_string):
        ops, options = block_string.split("_"), {}
        for op in ops:
            splits = re.split(r"(\d.*)", op)
            if len(splits) >= 2:
                options[splits[0]] = splits[1]
        assert "s" in options and len(options["s"]) in (1, 2)
        return BlockArgs(
            kernel_size=int(options["k"]),   num_repeat=int(options["r"]),
            input_filters=int(options["i"]), output_filters=int(options["o"]),
            expand_ratio=int(options["e"]),  id_skip=("noskip" not in block_string),
            se_ratio=float(options["se"]) if "se" in options else None,
            stride=[int(options["s"][0])],
        )

    @staticmethod
    def decode(string_list):
        return [BlockDecoder._decode_block_string(s) for s in string_list]


def _build_efficientnet():
    import torch
    import torch.nn as nn
    import torch.nn.functional as F
    from torch.utils import model_zoo

    class SwishImplementation(torch.autograd.Function):
        @staticmethod
        def forward(ctx, i):
            ctx.save_for_backward(i)
            return i * torch.sigmoid(i)
        @staticmethod
        def backward(ctx, grad_output):
            i = ctx.saved_tensors[0]
            s = torch.sigmoid(i)
            return grad_output * (s * (1 + i * (1 - s)))

    class MemoryEfficientSwish(nn.Module):
        def forward(self, x):
            return SwishImplementation.apply(x)

    class Swish(nn.Module):
        def forward(self, x):
            return x * torch.sigmoid(x)

    def round_filters(filters, gp):
        if not gp.width_coefficient:
            return filters
        filters *= gp.width_coefficient
        min_depth = gp.min_depth or gp.depth_divisor
        nf = max(min_depth, int(filters + gp.depth_divisor / 2) // gp.depth_divisor * gp.depth_divisor)
        if nf < 0.9 * filters:
            nf += gp.depth_divisor
        return int(nf)

    def round_repeats(repeats, gp):
        if not gp.depth_coefficient:
            return repeats
        return int(math.ceil(gp.depth_coefficient * repeats))

    def drop_connect(inputs, p, training):
        if not training:
            return inputs
        keep_prob = 1 - p
        rand = keep_prob + torch.rand(
            [inputs.shape[0], 1, 1, 1], dtype=inputs.dtype, device=inputs.device
        )
        return inputs / keep_prob * rand.floor()

    class Conv2dStaticSamePadding(nn.Conv2d):
        def __init__(self, in_channels, out_channels, kernel_size, image_size=None, **kwargs):
            super().__init__(in_channels, out_channels, kernel_size, **kwargs)
            self.stride = self.stride if len(self.stride) == 2 else [self.stride[0]] * 2
            assert image_size is not None
            ih = iw = image_size if isinstance(image_size, int) else image_size[0]
            kh, kw = self.weight.size()[-2:]
            sh, sw = self.stride
            pad_h = max((math.ceil(ih / sh) - 1) * sh + (kh - 1) * self.dilation[0] + 1 - ih, 0)
            pad_w = max((math.ceil(iw / sw) - 1) * sw + (kw - 1) * self.dilation[1] + 1 - iw, 0)
            self.static_padding = (
                nn.ZeroPad2d((pad_w // 2, pad_w - pad_w // 2, pad_h // 2, pad_h - pad_h // 2))
                if (pad_h > 0 or pad_w > 0) else nn.Identity()
            )

        def forward(self, x):
            return F.conv2d(
                self.static_padding(x), self.weight, self.bias,
                self.stride, self.padding, self.dilation, self.groups
            )

    class MBConvBlock(nn.Module):
        def __init__(self, block_args, global_params):
            super().__init__()
            self._block_args = block_args
            bn_mom = 1 - global_params.batch_norm_momentum
            bn_eps = global_params.batch_norm_epsilon
            self.has_se  = block_args.se_ratio is not None and 0 < block_args.se_ratio <= 1
            self.id_skip = block_args.id_skip
            Conv2d = partial(Conv2dStaticSamePadding, image_size=global_params.image_size)
            inp = block_args.input_filters
            oup = inp * block_args.expand_ratio
            if block_args.expand_ratio != 1:
                self._expand_conv = Conv2d(inp, oup, 1, bias=False)
                self._bn0 = nn.BatchNorm2d(oup, momentum=bn_mom, eps=bn_eps)
            k, s = block_args.kernel_size, block_args.stride
            self._depthwise_conv = Conv2d(oup, oup, k, stride=s, groups=oup, bias=False)
            self._bn1 = nn.BatchNorm2d(oup, momentum=bn_mom, eps=bn_eps)
            if self.has_se:
                nsc = max(1, int(inp * block_args.se_ratio))
                self._se_reduce = Conv2d(oup, nsc, 1)
                self._se_expand = Conv2d(nsc, oup, 1)
            final_oup = block_args.output_filters
            self._project_conv = Conv2d(oup, final_oup, 1, bias=False)
            self._bn2   = nn.BatchNorm2d(final_oup, momentum=bn_mom, eps=bn_eps)
            self._swish = MemoryEfficientSwish()

        def forward(self, inputs, drop_connect_rate=None):
            x = inputs
            if self._block_args.expand_ratio != 1:
                x = self._swish(self._bn0(self._expand_conv(inputs)))
            x = self._swish(self._bn1(self._depthwise_conv(x)))
            if self.has_se:
                xs = self._se_expand(self._swish(
                    self._se_reduce(F.adaptive_avg_pool2d(x, 1))
                ))
                x = torch.sigmoid(xs) * x
            x = self._bn2(self._project_conv(x))
            if (self.id_skip and self._block_args.stride == [1]
                    and self._block_args.input_filters == self._block_args.output_filters):
                if drop_connect_rate:
                    x = drop_connect(x, drop_connect_rate, self.training)
                x = x + inputs
            return x

        def set_swish(self, memory_efficient=True):
            self._swish = MemoryEfficientSwish() if memory_efficient else Swish()

    class EfficientNet(nn.Module):
        def __init__(self, model_name="efficientnet-b4", pretrained=False):
            super().__init__()
            blocks_args = BlockDecoder.decode(blocks_args_str)
            w, d, s, p  = efficientnet_params[model_name]
            gp = GlobalParams(
                batch_norm_momentum=0.99, batch_norm_epsilon=1e-3,
                dropout_rate=p, drop_connect_rate=0.2, num_classes=2,
                width_coefficient=w, depth_coefficient=d, depth_divisor=8,
                min_depth=None, image_size=s
            )
            self._global_params = gp
            Conv2d = partial(Conv2dStaticSamePadding, image_size=gp.image_size)
            bn_mom, bn_eps = 1 - gp.batch_norm_momentum, gp.batch_norm_epsilon
            out_ch = round_filters(32, gp)
            self._conv_stem = Conv2d(3, out_ch, 3, stride=2, bias=False)
            self._bn0       = nn.BatchNorm2d(out_ch, momentum=bn_mom, eps=bn_eps)
            self._blocks = nn.ModuleList()
            for ba in blocks_args:
                ba = ba._replace(
                    input_filters=round_filters(ba.input_filters, gp),
                    output_filters=round_filters(ba.output_filters, gp),
                    num_repeat=round_repeats(ba.num_repeat, gp)
                )
                self._blocks.append(MBConvBlock(ba, gp))
                if ba.num_repeat > 1:
                    ba = ba._replace(input_filters=ba.output_filters, stride=[1])
                    for _ in range(ba.num_repeat - 1):
                        self._blocks.append(MBConvBlock(ba, gp))
                in_ch = ba.output_filters
            out_ch = round_filters(1280, gp)
            self._conv_head   = Conv2d(in_ch, out_ch, 1, bias=False)
            self._bn1         = nn.BatchNorm2d(out_ch, momentum=bn_mom, eps=bn_eps)
            self._avg_pooling = nn.AdaptiveAvgPool2d(1)
            self._dropout     = nn.Dropout(gp.dropout_rate)
            self._fc          = nn.Linear(out_ch, gp.num_classes)
            self._swish       = MemoryEfficientSwish()
            if pretrained:
                self._load_pretrained(model_name)

        def _load_pretrained(self, model_name):
            try:
                state_dict = model_zoo.load_url(url_map_advprop[model_name])
                state_dict.pop("_fc.weight", None)
                state_dict.pop("_fc.bias",   None)
                missing, unexpected = self.load_state_dict(state_dict, strict=False)
                print(f"Pretrained loaded | missing: {len(missing)} | unexpected: {len(unexpected)}")
            except Exception as e:
                print(f"[WARN] Cannot load pretrained: {e}")

        def forward(self, x):
            x = self._swish(self._bn0(self._conv_stem(x)))
            for idx, block in enumerate(self._blocks):
                dc = self._global_params.drop_connect_rate
                if dc:
                    dc *= idx / len(self._blocks)
                x = block(x, drop_connect_rate=dc)
            x = self._swish(self._bn1(self._conv_head(x)))
            x = self._avg_pooling(x).flatten(1)
            x = self._dropout(x)
            return self._fc(x)

    class DeepFakeModel(nn.Module):
        def __init__(self):
            super().__init__()
            self.model = EfficientNet("efficientnet-b4", pretrained=False)

        def forward(self, x):
            return self.model(x)

    return DeepFakeModel, MemoryEfficientSwish


# ─────────────────────────────────────────────────────────────────────────────
# Model Manager — singleton, lazy load
# ─────────────────────────────────────────────────────────────────────────────
_model_cache: dict = {}


def _get_model_and_transforms(model_path: str, device):
    """Load model + transforms lần đầu, cache lại."""
    import torch
    import albumentations as A
    from albumentations.pytorch import ToTensorV2

    cache_key = (model_path, str(device))
    if cache_key in _model_cache:
        return _model_cache[cache_key]

    DeepFakeModel, _ = _build_efficientnet()
    model = DeepFakeModel().to(device)
    state = torch.load(model_path, map_location=device)
    model.load_state_dict(state)
    model.eval()
    print(f"[DeepGuard] Model loaded from {model_path}")

    val_transform = A.Compose([
        A.Resize(IMG_SIZE, IMG_SIZE),
        A.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
        ToTensorV2(),
    ])
    flip_transform = A.Compose([
        A.Resize(IMG_SIZE, IMG_SIZE),
        A.HorizontalFlip(p=1.0),
        A.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
        ToTensorV2(),
    ])

    result = (model, val_transform, flip_transform, device)
    _model_cache[cache_key] = result
    return result


def _get_detector():
    """Lazy-load MTCNN detector."""
    if "detector" not in _model_cache:
        import torch
        from mtcnn import MTCNN
        dev_str = "GPU:0" if torch.cuda.is_available() else "CPU:0"
        _model_cache["detector"] = MTCNN(device=dev_str)
    return _model_cache["detector"]


# ─────────────────────────────────────────────────────────────────────────────
# freq_fake_score — port chính xác từ notebook
# ─────────────────────────────────────────────────────────────────────────────
def freq_fake_score(face_rgb: np.ndarray) -> tuple[float, float]:
    """
    Returns (spatial_score, frequency_score) mỗi cái 0-1.
    spatial_score  = Laplacian std normalized
    frequency_score = FFT mid-freq energy normalized
    """
    import cv2
    gray = cv2.cvtColor(face_rgb, cv2.COLOR_RGB2GRAY).astype(np.float32)
    gray = cv2.resize(gray, (128, 128))

    lap     = cv2.Laplacian(gray, cv2.CV_32F)
    lap_std = float(np.std(lap))

    fft    = np.fft.fft2(gray)
    mag    = np.log1p(np.abs(np.fft.fftshift(fft)))
    h, w   = mag.shape
    cx, cy = h // 2, w // 2
    low_e  = float(np.mean(mag[cx-16:cx+16, cy-16:cy+16]))
    mid_e  = float(np.mean(mag[cx-48:cx+48, cy-48:cy+48])) - low_e

    spatial_score   = float(np.clip((lap_std - 20) / 60, 0, 1))
    frequency_score = float(np.clip((mid_e - 1.5) / 2.0, 0, 1))
    return spatial_score, frequency_score


# ─────────────────────────────────────────────────────────────────────────────
# _crop_face — MTCNN + padding 25%
# ─────────────────────────────────────────────────────────────────────────────
def _crop_face(img_rgb: np.ndarray, detector) -> Optional[np.ndarray]:
    """Returns cropped face (RGB numpy) hoặc None nếu không detect được."""
    results = detector.detect_faces(img_rgb)
    if not results:
        return None
    best   = max(results, key=lambda r: r["confidence"])
    x, y, w, h = best["box"]
    pad_x = int(w * FACE_PAD_RATIO)
    pad_y = int(h * FACE_PAD_RATIO)
    H, W  = img_rgb.shape[:2]
    x1 = max(0, x - pad_x);   y1 = max(0, y - pad_y)
    x2 = min(W, x + w + pad_x); y2 = min(H, y + h + pad_y)
    face = img_rgb[y1:y2, x1:x2]
    return face if face.size > 0 else None


# ─────────────────────────────────────────────────────────────────────────────
# _predict_face — EfficientNet forward + TTA + freq
# ─────────────────────────────────────────────────────────────────────────────
def _predict_face(face_rgb: np.ndarray, model, val_transform, flip_transform, device) -> dict:
    """
    Returns {prob_fake, prob_cnn, spatial_score, frequency_score}.
    Đúng pipeline của predict_frame() trong notebook.
    """
    import torch
    import torch.nn.functional as F

    t_orig   = val_transform(image=face_rgb)["image"].unsqueeze(0).to(device)
    with torch.no_grad():
        prob_cnn = F.softmax(model(t_orig).float(), dim=1)[0, 1].item()

        if USE_TTA:
            t_flip   = flip_transform(image=face_rgb)["image"].unsqueeze(0).to(device)
            prob_cnn = (prob_cnn + F.softmax(model(t_flip).float(), dim=1)[0, 1].item()) / 2.0

    spatial_score, frequency_score = (0.0, 0.0)
    if USE_FREQ:
        spatial_score, frequency_score = freq_fake_score(face_rgb)
        freq_combined = (spatial_score + frequency_score) / 2.0
        prob_fake = (1 - FREQ_WEIGHT) * prob_cnn + FREQ_WEIGHT * freq_combined
    else:
        prob_fake = prob_cnn

    return {
        "prob_fake": prob_fake,
        "prob_cnn":  prob_cnn,
        "spatial_score":   spatial_score,
        "frequency_score": frequency_score,
    }


# ─────────────────────────────────────────────────────────────────────────────
# _verdict_from_prob — UNCERTAIN zone từ spec
# ─────────────────────────────────────────────────────────────────────────────
def _verdict_from_prob(prob_fake: float, threshold: float = FAKE_THRESHOLD) -> tuple[str, float]:
    """Returns (verdict, confidence 0-100)."""
    if prob_fake >= threshold + UNCERTAIN_MARGIN:
        verdict    = "FAKE"
        confidence = min(round((prob_fake - threshold) / (1 - threshold) * 100, 2), 99.9)
    elif prob_fake <= threshold - UNCERTAIN_MARGIN:
        verdict    = "REAL"
        confidence = min(round((threshold - prob_fake) / threshold * 100, 2), 99.9)
    else:
        verdict    = "UNCERTAIN"
        confidence = round(50.0 + abs(prob_fake - threshold) / UNCERTAIN_MARGIN * 10, 2)
    return verdict, confidence


# ─────────────────────────────────────────────────────────────────────────────
# Real inference — image bytes
# ─────────────────────────────────────────────────────────────────────────────
def _real_inference(image_bytes: bytes) -> InferenceResult:
    import torch
    import cv2

    start = time.perf_counter()
    image_hash = hashlib.sha256(image_bytes).hexdigest()

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model, val_tf, flip_tf, device = _get_model_and_transforms(settings.MODEL_PATH, device)
    detector = _get_detector()

    pil_img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    width, height = pil_img.size
    img_rgb = np.array(pil_img)

    face = _crop_face(img_rgb, detector)
    face_detected = face is not None

    if not face_detected:
        # Không detect được face — chạy toàn ảnh
        face = img_rgb

    preds = _predict_face(face, model, val_tf, flip_tf, device)
    verdict, confidence = _verdict_from_prob(preds["prob_fake"], settings.MODEL_THRESHOLD)

    elapsed_ms = int((time.perf_counter() - start) * 1000)
    return InferenceResult(
        verdict=verdict,
        confidence=confidence,
        prob_fake=round(preds["prob_fake"], 4),
        prob_cnn=round(preds["prob_cnn"], 4),
        spatial_score=round(preds["spatial_score"], 4),
        frequency_score=round(preds["frequency_score"], 4),
        threshold_used=settings.MODEL_THRESHOLD,
        face_detected=face_detected,
        processing_time_ms=elapsed_ms,
        model_version=settings.MODEL_VERSION,
        image_width=width,
        image_height=height,
        image_hash=image_hash,
        image_thumb=_encode_image_thumb(image_bytes),
    )


# ─────────────────────────────────────────────────────────────────────────────
# Frame thumbnail helpers (server-side, uses OpenCV — works for any codec)
# ─────────────────────────────────────────────────────────────────────────────
def _encode_image_thumb(image_bytes: bytes, max_dim: int = 320, quality: int = 80) -> Optional[str]:
    """PIL-based thumbnail encoder for input image bytes — works without cv2."""
    import base64
    try:
        img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        img.thumbnail((max_dim, max_dim), Image.Resampling.LANCZOS)
        buf = io.BytesIO()
        img.save(buf, format="JPEG", quality=quality, optimize=True)
        return "data:image/jpeg;base64," + base64.b64encode(buf.getvalue()).decode("ascii")
    except Exception:
        return None


def _encode_thumb_bgr(frame_bgr: np.ndarray, max_dim: int = 240, quality: int = 75) -> str:
    """Resize a BGR frame and encode as base64 JPEG data URL."""
    import cv2
    import base64
    h, w = frame_bgr.shape[:2]
    scale = min(max_dim / max(w, 1), max_dim / max(h, 1), 1.0)
    if scale < 1.0:
        frame_bgr = cv2.resize(frame_bgr, (int(w * scale), int(h * scale)), interpolation=cv2.INTER_AREA)
    ok, buf = cv2.imencode(".jpg", frame_bgr, [int(cv2.IMWRITE_JPEG_QUALITY), quality])
    if not ok:
        return ""
    return "data:image/jpeg;base64," + base64.b64encode(buf.tobytes()).decode("ascii")


def _extract_thumbs_for_ids(video_bytes: bytes, wanted_ids: list[int], max_dim: int = 240) -> dict[int, str]:
    """Open video once, walk frames, encode only the requested frame IDs."""
    import cv2
    import tempfile
    import os
    wanted = set(wanted_ids)
    if not wanted:
        return {}
    with tempfile.NamedTemporaryFile(suffix=".mp4", delete=False) as f:
        f.write(video_bytes)
        tmp_path = f.name
    thumbs: dict[int, str] = {}
    try:
        cap = cv2.VideoCapture(tmp_path)
        if not cap.isOpened():
            return {}
        fid = 0
        max_id = max(wanted)
        while fid <= max_id:
            ret, frame = cap.read()
            if not ret:
                break
            if fid in wanted:
                thumbs[fid] = _encode_thumb_bgr(frame, max_dim)
            fid += 1
        cap.release()
    finally:
        os.unlink(tmp_path)
    return thumbs


# ─────────────────────────────────────────────────────────────────────────────
# Real inference — video bytes (infer_video port)
# ─────────────────────────────────────────────────────────────────────────────
def _real_inference_video(video_bytes: bytes, sample_rate: int = 3) -> dict:
    """
    Port infer_video() từ notebook.
    Returns dict với frame-level results + final verdict.
    """
    import torch
    import cv2
    import tempfile
    import os

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model, val_tf, flip_tf, device = _get_model_and_transforms(settings.MODEL_PATH, device)
    detector = _get_detector()

    # Ghi bytes ra temp file vì cv2.VideoCapture cần path
    with tempfile.NamedTemporaryFile(suffix=".mp4", delete=False) as f:
        f.write(video_bytes)
        tmp_path = f.name

    try:
        cap = cv2.VideoCapture(tmp_path)
        if not cap.isOpened():
            raise ValueError("Cannot open video file")

        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        frame_results, frame_id = [], 0

        while True:
            ret, frame = cap.read()
            if not ret:
                break
            if frame_id % sample_rate == 0:
                img_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                face = _crop_face(img_rgb, detector)
                if face is not None:
                    preds = _predict_face(face, model, val_tf, flip_tf, device)
                    frame_results.append({
                        "frame_id": frame_id,
                        "prob_fake": preds["prob_fake"],
                        "prob_cnn":  preds["prob_cnn"],
                        "thumb":     _encode_thumb_bgr(frame),
                    })
            frame_id += 1
        cap.release()
    finally:
        os.unlink(tmp_path)

    if not frame_results:
        return {
            "verdict": "UNCERTAIN",
            "confidence": 50.0,
            "prob_fake": 0.5,
            "frames_analyzed": 0,
            "frames_fake": 0,
            "frame_results": [],
        }

    fake_probs = [d["prob_fake"] for d in frame_results]
    avg_prob   = float(np.mean(fake_probs))
    verdict, confidence = _verdict_from_prob(avg_prob, settings.MODEL_THRESHOLD)
    n_fake = sum(1 for p in fake_probs if p >= settings.MODEL_THRESHOLD)

    return {
        "verdict":        verdict,
        "confidence":     confidence,
        "prob_fake":      round(avg_prob, 4),
        "frames_analyzed": len(frame_results),
        "frames_fake":    n_fake,
        "frame_results":  frame_results,
    }


# ─────────────────────────────────────────────────────────────────────────────
# Mock inference (deterministic, dùng hash)
# ─────────────────────────────────────────────────────────────────────────────
def _mock_inference(image_bytes: bytes) -> InferenceResult:
    image_hash = hashlib.sha256(image_bytes).hexdigest()
    seed = int(image_hash[:8], 16)
    rng  = random.Random(seed)

    prob_cnn        = rng.uniform(0.05, 0.95)
    spatial_score   = rng.uniform(0.0, 1.0)
    frequency_score = rng.uniform(0.0, 1.0)
    freq_combined   = (spatial_score + frequency_score) / 2.0
    prob_fake       = prob_cnn * (1 - FREQ_WEIGHT) + freq_combined * FREQ_WEIGHT

    verdict, confidence = _verdict_from_prob(prob_fake, settings.MODEL_THRESHOLD)

    thumb = _encode_image_thumb(image_bytes)
    # Try to read real dimensions from the input
    try:
        with Image.open(io.BytesIO(image_bytes)) as im:
            w, h = im.size
    except Exception:
        w = rng.choice([640, 720, 1280])
        h = rng.choice([480, 540, 720])

    return InferenceResult(
        verdict=verdict,
        confidence=confidence,
        prob_fake=round(prob_fake, 4),
        prob_cnn=round(prob_cnn, 4),
        spatial_score=round(spatial_score, 4),
        frequency_score=round(frequency_score, 4),
        threshold_used=settings.MODEL_THRESHOLD,
        face_detected=True,
        processing_time_ms=rng.randint(50, 250),
        model_version=settings.MODEL_VERSION,
        image_width=w,
        image_height=h,
        image_hash=image_hash,
        image_thumb=thumb,
    )


def _mock_inference_video(video_bytes: bytes, sample_rate: int = 3) -> dict:
    image_hash = hashlib.sha256(video_bytes).hexdigest()
    seed = int(image_hash[:8], 16)
    rng  = random.Random(seed)

    # Try to read actual frame count so we can extract real thumbnails
    try:
        import cv2
        import tempfile
        import os
        with tempfile.NamedTemporaryFile(suffix=".mp4", delete=False) as f:
            f.write(video_bytes)
            tmp_path = f.name
        try:
            cap = cv2.VideoCapture(tmp_path)
            total = int(cap.get(cv2.CAP_PROP_FRAME_COUNT)) if cap.isOpened() else 0
            cap.release()
        finally:
            os.unlink(tmp_path)
    except Exception:
        total = 0

    if total > 0:
        frame_ids = list(range(0, total, max(sample_rate, 1)))[:30]
        thumbs    = _extract_thumbs_for_ids(video_bytes, frame_ids)
    else:
        n = rng.randint(10, 30)
        frame_ids = [i * sample_rate for i in range(n)]
        thumbs    = {}

    fake_probs = [rng.uniform(0.05, 0.95) for _ in frame_ids]
    avg_prob   = float(np.mean(fake_probs))
    verdict, confidence = _verdict_from_prob(avg_prob, settings.MODEL_THRESHOLD)
    n_fake = sum(1 for p in fake_probs if p >= settings.MODEL_THRESHOLD)
    return {
        "verdict":        verdict,
        "confidence":     confidence,
        "prob_fake":      round(avg_prob, 4),
        "frames_analyzed": len(frame_ids),
        "frames_fake":    n_fake,
        "frame_results":  [
            {"frame_id": fid, "prob_fake": round(p, 4), "thumb": thumbs.get(fid, "")}
            for fid, p in zip(frame_ids, fake_probs)
        ],
    }


# ─────────────────────────────────────────────────────────────────────────────
# Public entry points
# ─────────────────────────────────────────────────────────────────────────────
def _sfdct_inference(image_bytes: bytes) -> InferenceResult:
    """Gọi microservice SFDCT (DeepfakeBench) qua HTTP -> map sang InferenceResult (kèm Grad-CAM).
    Service down -> fallback mock để không chặn API."""
    import httpx
    start = time.perf_counter()
    image_hash = hashlib.sha256(image_bytes).hexdigest()
    try:
        width, height = Image.open(io.BytesIO(image_bytes)).convert("RGB").size
    except Exception:
        width = height = None
    try:
        r = httpx.post(settings.SFDCT_INFER_URL.rstrip("/") + "/predict",
                       files={"file": ("upload.jpg", image_bytes, "image/jpeg")}, timeout=60.0)
        r.raise_for_status()
        j = r.json()
    except Exception:
        return _mock_inference(image_bytes)
    prob_fake = float(j.get("prob_fake", 0.0))
    verdict, confidence = _verdict_from_prob(prob_fake, settings.MODEL_THRESHOLD)
    try:
        thumb = _encode_image_thumb(image_bytes)
    except Exception:
        thumb = None
    return InferenceResult(
        verdict=verdict, confidence=confidence,
        prob_fake=round(prob_fake, 4), prob_cnn=round(prob_fake, 4),
        spatial_score=0.0, frequency_score=0.0,
        threshold_used=settings.MODEL_THRESHOLD, face_detected=True,
        processing_time_ms=int((time.perf_counter() - start) * 1000),
        model_version=j.get("model_version", settings.MODEL_VERSION),
        image_width=width, image_height=height, image_hash=image_hash,
        image_thumb=thumb, heatmap=j.get("gradcam"),
    )


async def run_inference(image_bytes: bytes) -> InferenceResult:
    if settings.SFDCT_INFER_URL:                     # ưu tiên microservice SFDCT (model thật của thesis)
        return _sfdct_inference(image_bytes)
    if settings.MOCK_ML or not settings.MODEL_PATH:
        return _mock_inference(image_bytes)
    return _real_inference(image_bytes)


async def run_video_inference(video_bytes: bytes, sample_rate: int = 3) -> dict:
    if settings.MOCK_ML or not settings.MODEL_PATH:
        return _mock_inference_video(video_bytes, sample_rate)
    return _real_inference_video(video_bytes, sample_rate)
