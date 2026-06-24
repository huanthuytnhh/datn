"""face_crop.py — crop khuôn mặt vuông + lề cho SFDCT (:8501) và liveness (:8502).

Detector priority: MTCNN (facenet-pytorch) → OpenCV Haar cascade → trả nguyên ảnh.
MTCNN là primary (xử lý mặt nghiêng, mắt nhắm, nhiều góc tốt hơn).
Haar là fallback khi MTCNN không khả dụng.

Hệ số mở rộng 1.3x = khớp extract_face_MTCNN của DeepfakeBench (expand_scale=1.3).
"""
import os
import cv2

_EXPAND = float(os.environ.get("LIVENESS_CROP_EXPAND", "1.3"))

_mtcnn = None
_mtcnn_tried = False
_haar = None


def _get_mtcnn():
    global _mtcnn, _mtcnn_tried
    if _mtcnn is None and not _mtcnn_tried:
        _mtcnn_tried = True
        try:
            from facenet_pytorch import MTCNN
            # keep_all=True: detect tất cả mặt, ta chọn lớn nhất sau
            # min_face_size=40: bỏ qua mặt quá nhỏ (< 40px), nhất quán với Haar minSize
            # post_process=False: trả box tọa độ gốc, không scale
            _mtcnn = MTCNN(keep_all=True, device="cpu", min_face_size=40, post_process=False)
        except Exception:
            pass
    return _mtcnn


def _get_haar():
    global _haar
    if _haar is None:
        path = os.path.join(cv2.data.haarcascades, "haarcascade_frontalface_default.xml")
        _haar = cv2.CascadeClassifier(path)
    return _haar


def _detect_boxes(bgr):
    """Trả list (x, y, w, h). MTCNN trước, Haar dự phòng."""
    # --- MTCNN (primary) ---
    mtcnn = _get_mtcnn()
    if mtcnn is not None:
        try:
            from PIL import Image
            rgb = cv2.cvtColor(bgr, cv2.COLOR_BGR2RGB)
            boxes, probs = mtcnn.detect(Image.fromarray(rgb))
            if boxes is not None and len(boxes):
                result = []
                for box, prob in zip(boxes, probs if probs is not None else [1.0] * len(boxes)):
                    if (prob or 0) < 0.9:
                        continue
                    x1, y1, x2, y2 = box
                    w, h = int(x2 - x1), int(y2 - y1)
                    if w > 0 and h > 0:
                        result.append((int(x1), int(y1), w, h))
                if result:
                    return result
        except Exception:
            pass

    # --- Haar cascade (fallback) ---
    haar = _get_haar()
    gray = cv2.cvtColor(bgr, cv2.COLOR_BGR2GRAY)
    faces = haar.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5, minSize=(40, 40))
    return [tuple(int(v) for v in f) for f in faces] if len(faces) else []


def crop_face_bgr(bgr, expand=None):
    """Trả (cropped_bgr, found:bool). Crop VUÔNG quanh mặt lớn nhất, mở rộng expand×.
    Không thấy mặt → trả nguyên ảnh + found=False (không crash pipeline)."""
    if expand is None:
        expand = _EXPAND
    h, w = bgr.shape[:2]
    boxes = _detect_boxes(bgr)
    if not boxes:
        return bgr, False
    x, y, bw, bh = max(boxes, key=lambda b: b[2] * b[3])   # mặt lớn nhất
    cx, cy = x + bw / 2.0, y + bh / 2.0
    half = max(bw, bh) * expand / 2.0
    x0 = max(0, int(round(cx - half)))
    y0 = max(0, int(round(cy - half)))
    x1 = min(w, int(round(cx + half)))
    y1 = min(h, int(round(cy + half)))
    if x1 <= x0 or y1 <= y0:
        return bgr, False
    return bgr[y0:y1, x0:x1], True
