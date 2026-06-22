"""
liveness.py — Active Liveness Detection với MediaPipe FaceMesh

Theo đề cương:
- EAR (Eye Aspect Ratio) — Soukupova & Cech 2016 — detect eye blinking
- Head pose estimation — yaw range cho head motion

Logic: video selfie 3-5s → extract frames → check 2 conditions:
  (1) Has at least 1 eye blink (chống print attack - ảnh in không nháy mắt)
  (2) Head yaw range > 10° (chống replay attack đơn giản - video tĩnh)
"""

import cv2
import numpy as np
from typing import Optional, Dict, List

try:
    import mediapipe as mp
    MEDIAPIPE_AVAILABLE = True
except ImportError:
    MEDIAPIPE_AVAILABLE = False
    print("[WARN] mediapipe chưa cài. Run: pip install mediapipe")


# ─────────────────────────────────────────────────────────────────────────────
# CONSTANTS
# ─────────────────────────────────────────────────────────────────────────────

# Eye landmarks indices trong MediaPipe FaceMesh (468 landmarks)
# Reference: https://github.com/google/mediapipe/blob/master/mediapipe/modules/face_geometry/data/canonical_face_model_uv_visualization.png
LEFT_EYE_IDX  = [33, 160, 158, 133, 153, 144]
RIGHT_EYE_IDX = [362, 385, 387, 263, 373, 380]

# Threshold theo paper Soukupova & Cech 2016
# EAR < 0.21 → mắt nhắm. Default 0.21 là chuẩn industry.
EAR_THRESHOLD = 0.21

# Tối thiểu để qua liveness check
MIN_BLINKS         = 1      # ít nhất 1 blink
MIN_HEAD_YAW_RANGE = 10.0   # ít nhất 10° yaw range (degrees)


# ─────────────────────────────────────────────────────────────────────────────
# EAR formula (Soukupova & Cech 2016, "Real-Time Eye Blink Detection")
# ─────────────────────────────────────────────────────────────────────────────
def compute_ear(eye_points: np.ndarray) -> float:
    """
    Eye Aspect Ratio.

    eye_points: 6 landmarks (x, y) theo thứ tự:
      p1: outer corner
      p2, p3: upper eyelid
      p4: inner corner
      p5, p6: lower eyelid

    EAR = (|p2-p6| + |p3-p5|) / (2 * |p1-p4|)

    Mắt mở: EAR ~ 0.25-0.35
    Mắt nhắm: EAR < 0.20
    """
    # Vertical distances
    A = np.linalg.norm(eye_points[1] - eye_points[5])
    B = np.linalg.norm(eye_points[2] - eye_points[4])
    # Horizontal distance
    C = np.linalg.norm(eye_points[0] - eye_points[3])
    return (A + B) / (2.0 * C) if C > 0 else 0.0


# ─────────────────────────────────────────────────────────────────────────────
# Head pose estimation (đơn giản — dùng nose tip displacement)
# ─────────────────────────────────────────────────────────────────────────────
def estimate_yaw_simple(landmarks, frame_width: int) -> float:
    """
    Estimate yaw đơn giản: nose tip x-position so với face center.

    Production nên dùng solvePnP với 3D model, nhưng cho liveness check
    cần motion thì cách này đủ.

    Returns: yaw degrees, range [-45, +45]
    """
    nose_tip_x = landmarks[1].x         # landmark 1 = nose tip
    left_cheek_x = landmarks[234].x     # landmark 234 = left cheek
    right_cheek_x = landmarks[454].x    # landmark 454 = right cheek

    face_center_x = (left_cheek_x + right_cheek_x) / 2.0
    face_width = right_cheek_x - left_cheek_x

    if face_width <= 0:
        return 0.0

    # Normalized offset: -1 (max left) → +1 (max right)
    offset = (nose_tip_x - face_center_x) / (face_width / 2.0)
    yaw_degrees = max(-45.0, min(45.0, offset * 45.0))
    return float(yaw_degrees)


# ─────────────────────────────────────────────────────────────────────────────
# MAIN: Liveness check từ video
# ─────────────────────────────────────────────────────────────────────────────
class LivenessDetector:
    """
    Active Liveness Detection từ video selfie ngắn (3-5 giây).

    Usage:
        det = LivenessDetector()
        result = det.check_video("selfie.mp4")
        if result["is_live"]:
            print("PASS liveness")
    """

    def __init__(self,
                 ear_threshold: float = EAR_THRESHOLD,
                 min_blinks: int = MIN_BLINKS,
                 min_yaw_range: float = MIN_HEAD_YAW_RANGE):

        if not MEDIAPIPE_AVAILABLE:
            raise RuntimeError("mediapipe chưa được cài đặt")

        self.ear_threshold  = ear_threshold
        self.min_blinks     = min_blinks
        self.min_yaw_range  = min_yaw_range

        self._mp = mp.solutions.face_mesh

    def _extract_eye_points(self, landmarks, frame_w: int, frame_h: int, idx_list: List[int]) -> np.ndarray:
        return np.array([
            [landmarks[i].x * frame_w, landmarks[i].y * frame_h]
            for i in idx_list
        ], dtype=np.float32)

    def check_video(self, video_path: str, max_frames: int = 150) -> Dict:
        """
        Process video và return liveness result.

        max_frames: tối đa frames xử lý (5s * 30fps = 150)
        """
        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            return {"error": "Cannot open video", "is_live": False}

        face_mesh = self._mp.FaceMesh(
            max_num_faces=1,
            refine_landmarks=True,
            min_detection_confidence=0.5,
            min_tracking_confidence=0.5,
        )

        ear_history: List[float] = []
        yaw_history: List[float] = []
        blink_count = 0
        in_blink = False
        frames_with_face = 0
        frame_idx = 0

        while frame_idx < max_frames:
            ret, frame = cap.read()
            if not ret:
                break
            frame_idx += 1

            rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            results = face_mesh.process(rgb)

            if not results.multi_face_landmarks:
                continue

            frames_with_face += 1
            landmarks = results.multi_face_landmarks[0].landmark
            h, w = frame.shape[:2]

            # 1. Compute EAR (average của 2 mắt)
            left_eye  = self._extract_eye_points(landmarks, w, h, LEFT_EYE_IDX)
            right_eye = self._extract_eye_points(landmarks, w, h, RIGHT_EYE_IDX)
            ear = (compute_ear(left_eye) + compute_ear(right_eye)) / 2.0
            ear_history.append(ear)

            # 2. State machine cho blink detection
            if ear < self.ear_threshold and not in_blink:
                in_blink = True   # bắt đầu nhắm mắt
            elif ear >= self.ear_threshold and in_blink:
                blink_count += 1  # vừa mở mắt → đếm 1 blink
                in_blink = False

            # 3. Head pose
            yaw = estimate_yaw_simple(landmarks, w)
            yaw_history.append(yaw)

        cap.release()
        face_mesh.close()

        # ── DECISION ─────────────────────────────────────────────────────────
        if frames_with_face < 10:
            return {
                "is_live": False,
                "error": "INSUFFICIENT_FACE_FRAMES",
                "message": "Quá ít frame có khuôn mặt. Quay lại với ánh sáng tốt hơn.",
                "frames_processed": frame_idx,
                "frames_with_face": frames_with_face,
            }

        yaw_range = (max(yaw_history) - min(yaw_history)) if yaw_history else 0.0
        ear_min   = min(ear_history) if ear_history else 0.0
        ear_max   = max(ear_history) if ear_history else 0.0

        check_blink = blink_count >= self.min_blinks
        check_head_motion = yaw_range >= self.min_yaw_range

        is_live = check_blink and check_head_motion

        return {
            "is_live": is_live,
            "blink_count": blink_count,
            "head_yaw_range_deg": round(yaw_range, 2),
            "ear_min": round(ear_min, 4),
            "ear_max": round(ear_max, 4),
            "frames_processed": frame_idx,
            "frames_with_face": frames_with_face,
            "checks": {
                "blink":       {"passed": check_blink,       "required": f"≥{self.min_blinks} blink",       "actual": blink_count},
                "head_motion": {"passed": check_head_motion, "required": f"≥{self.min_yaw_range}° yaw",    "actual": round(yaw_range, 1)},
            },
            "method": "MediaPipe FaceMesh + EAR (Soukupova & Cech 2016) + head pose",
        }
