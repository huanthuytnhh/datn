"""face_crop.py — crop khuôn mặt vuông + lề, khớp phân phối LCC-FASD (mặt đầy khung).

Dùng chung cho liveness_server (:8502) và script test. LCC-FASD phát hành mặt ĐÃ crop vuông
(mặt chiếm ~70-90% khung). Khi serving nhận frame webcam đầy đủ (mặt nhỏ + nền + vai), phải crop
về cùng dạng; nếu không phân phối lệch train/serve -> AUC 0.98 trên benchmark KHÔNG giữ được lúc demo.

Detector ưu tiên OFFLINE (mạng công ty chặn tải model):
  1) dlib HOG frontal detector   2) OpenCV Haar cascade   3) fallback: trả nguyên ảnh.
Hệ số mở rộng mặc định 1.3x = khớp extract_face_MTCNN của DeepfakeBench (expand_scale=1.3).
"""
import os
import cv2

_EXPAND = float(os.environ.get("LIVENESS_CROP_EXPAND", "1.3"))
_dlib_detector = None
_dlib_tried = False
_haar = None


def _get_dlib():
    global _dlib_detector, _dlib_tried
    if _dlib_detector is None and not _dlib_tried:
        _dlib_tried = True
        try:
            import dlib
            _dlib_detector = dlib.get_frontal_face_detector()
        except Exception:
            _dlib_detector = None
    return _dlib_detector


def _get_haar():
    global _haar
    if _haar is None:
        path = os.path.join(cv2.data.haarcascades, "haarcascade_frontalface_default.xml")
        _haar = cv2.CascadeClassifier(path)
    return _haar


def _detect_boxes(bgr):
    """Trả list (x, y, w, h). dlib trước, Haar dự phòng."""
    gray = cv2.cvtColor(bgr, cv2.COLOR_BGR2GRAY)
    det = _get_dlib()
    if det is not None:
        try:
            rects = det(gray, 1)
            if rects:
                return [(r.left(), r.top(), r.width(), r.height()) for r in rects]
        except Exception:
            pass
    haar = _get_haar()
    faces = haar.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5, minSize=(40, 40))
    return [tuple(int(v) for v in f) for f in faces] if len(faces) else []


def crop_face_bgr(bgr, expand=None):
    """Trả (cropped_bgr, found:bool). Crop VUÔNG quanh mặt lớn nhất, mở rộng `expand`x.
    Không thấy mặt -> trả nguyên ảnh + found=False (giữ hành vi cũ, không vỡ pipeline)."""
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
