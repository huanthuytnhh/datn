"""quality.py — chấm chất lượng ảnh đầu vào (flag-only) cho eKYC deepfake.

Bắt ảnh quá kém TRƯỚC khi tin kết quả model: mặt nhỏ (phải upscale → bịa/xoá
tần số), mờ (out-of-focus), tối, cháy sáng, không có mặt. KHÔNG chặn — chỉ trả
cờ + lý do để cascade/FE quyết (vd: low_quality → đẩy REVIEW / yêu cầu chụp lại).

Ngưỡng đều chỉnh được qua env; mặc định hợp ảnh mặt 256px, NÊN calibrate lại
trên dữ liệu eKYC thật của bạn.
"""
import os

import cv2
import numpy as np

# var(Laplacian) < BLUR_MIN -> mờ. CỰC phụ thuộc độ phân giải nguồn: frame video Celeb
# (soft, c23) ~14-84; selfie nét ~ hàng trăm→nghìn. Default 10 = chỉ bắt mờ CỰC nặng
# (gần mất hết chi tiết) để KHÔNG báo nhầm ảnh-soft-bình-thường. PHẢI calibrate theo
# camera eKYC thật (vd 80-150 cho selfie HD).
BLUR_MIN = float(os.environ.get("SFDCT_BLUR_MIN", "10"))
DARK_MAX = float(os.environ.get("SFDCT_DARK_MAX", "40"))        # mean luma < -> tối
BRIGHT_MIN = float(os.environ.get("SFDCT_BRIGHT_MIN", "225"))   # mean luma > -> cháy sáng
UPSCALE_TOL = float(os.environ.get("SFDCT_UPSCALE_TOL", "1.15"))  # resample_ratio > -> mặt nhỏ


def assess(crop_bgr, face_px=0, resample_ratio=0.0, face_found=True):
    """Chấm chất lượng trên ảnh model THỰC SỰ thấy (crop đã resize về model res).
    Trả dict cờ + lý do; low_quality = có bất kỳ cờ nào."""
    gray = cv2.cvtColor(crop_bgr, cv2.COLOR_BGR2GRAY)
    blur_var = float(cv2.Laplacian(gray, cv2.CV_64F).var())
    brightness = float(gray.mean())

    upscaled = bool(face_found and resample_ratio > UPSCALE_TOL)
    blurry = bool(blur_var < BLUR_MIN)
    too_dark = bool(brightness < DARK_MAX)
    too_bright = bool(brightness > BRIGHT_MIN)

    reasons = []
    if not face_found:
        reasons.append("no_face")
    if upscaled:
        reasons.append("low_resolution")
    if blurry:
        reasons.append("blurry")
    if too_dark:
        reasons.append("too_dark")
    if too_bright:
        reasons.append("too_bright")

    return {
        "face_px": int(face_px),
        "resample_ratio": round(float(resample_ratio), 3),
        "blur_var": round(blur_var, 1),
        "brightness": round(brightness, 1),
        "upscaled": upscaled,
        "blurry": blurry,
        "too_dark": too_dark,
        "too_bright": too_bright,
        "low_quality": bool(reasons),
        "reasons": reasons,
    }
