"""
face_matching.py — Face Matching giữa CCCD và selfie video

Theo đề cương: ArcFace + cosine similarity

Logic:
  1. Extract face từ ảnh CCCD → embedding 1
  2. Extract face từ vài frame "tốt nhất" của video selfie → embedding 2
  3. Cosine similarity ≥ threshold → MATCH

Dùng InsightFace package — đã pretrained, không cần train.
"""

import numpy as np
import cv2
from typing import List, Optional, Dict

try:
    from insightface.app import FaceAnalysis
    INSIGHTFACE_AVAILABLE = True
except ImportError:
    INSIGHTFACE_AVAILABLE = False
    print("[WARN] insightface chưa cài. Run: pip install insightface onnxruntime")


# ─────────────────────────────────────────────────────────────────────────────
# CONSTANTS
# ─────────────────────────────────────────────────────────────────────────────

# Cosine similarity threshold cho cùng 1 người
# ArcFace literature: ~0.4 là benchmark cho 1:1 verification
# Bank/eKYC thường dùng cao hơn: 0.5-0.6 để chắc chắn
MATCH_THRESHOLD = 0.45


def cosine_similarity(emb1: np.ndarray, emb2: np.ndarray) -> float:
    """Cosine similarity giữa 2 embedding vectors."""
    return float(np.dot(emb1, emb2) / (np.linalg.norm(emb1) * np.linalg.norm(emb2)))


class FaceMatcher:
    """
    Face matching CCCD ↔ Video selfie sử dụng ArcFace embeddings.

    Usage:
        matcher = FaceMatcher()
        result = matcher.match(
            id_card_image_path="cccd.jpg",
            selfie_video_path="selfie.mp4",
        )
        if result["is_match"]:
            print(f"MATCH với similarity {result['similarity']}")
    """

    def __init__(self, match_threshold: float = MATCH_THRESHOLD):
        if not INSIGHTFACE_AVAILABLE:
            raise RuntimeError("insightface chưa được cài đặt")

        self.threshold = match_threshold

        # buffalo_l là model nhẹ và đủ chính xác cho eKYC
        # det_size=(640, 640) thường cho good accuracy
        self.app = FaceAnalysis(
            name="buffalo_l",
            providers=["CPUExecutionProvider"],  # GPU: "CUDAExecutionProvider"
        )
        self.app.prepare(ctx_id=0, det_size=(640, 640))

    def get_best_embedding(self, image: np.ndarray) -> Optional[np.ndarray]:
        """Lấy embedding của khuôn mặt lớn nhất trong ảnh."""
        faces = self.app.get(image)
        if not faces:
            return None
        # Chọn face có bbox lớn nhất (thường là main subject)
        best = max(faces, key=lambda f: (f.bbox[2]-f.bbox[0]) * (f.bbox[3]-f.bbox[1]))
        return best.normed_embedding   # đã normalize sẵn

    def get_video_embeddings(self, video_path: str,
                             max_frames: int = 5,
                             stride: int = 10) -> List[np.ndarray]:
        """
        Lấy embedding từ vài frame "đại diện" của video.
        Stride 10 = lấy mỗi 10 frames để tránh trùng (~0.3s ở 30fps).
        """
        cap = cv2.VideoCapture(video_path)
        embeddings = []
        frame_idx = 0

        while len(embeddings) < max_frames:
            ret, frame = cap.read()
            if not ret:
                break

            if frame_idx % stride == 0:
                emb = self.get_best_embedding(frame)
                if emb is not None:
                    embeddings.append(emb)

            frame_idx += 1

        cap.release()
        return embeddings

    def match(self, id_card_image_path: str, selfie_video_path: str) -> Dict:
        """
        Match danh tính CCCD với video selfie.
        """
        # 1. Load CCCD và extract embedding
        id_card = cv2.imread(id_card_image_path)
        if id_card is None:
            return {"is_match": False, "error": "CANNOT_READ_ID_CARD"}

        id_emb = self.get_best_embedding(id_card)
        if id_emb is None:
            return {
                "is_match": False,
                "error": "NO_FACE_IN_ID_CARD",
                "message": "Không phát hiện khuôn mặt trên CCCD. Chụp lại với góc thẳng.",
            }

        # 2. Extract embeddings từ video selfie
        video_embs = self.get_video_embeddings(selfie_video_path)
        if not video_embs:
            return {
                "is_match": False,
                "error": "NO_FACE_IN_VIDEO",
                "message": "Không phát hiện khuôn mặt trong video. Quay lại với ánh sáng tốt hơn.",
            }

        # 3. Tính similarity với mọi frame embedding, lấy max
        similarities = [cosine_similarity(id_emb, v_emb) for v_emb in video_embs]
        max_sim  = float(max(similarities))
        mean_sim = float(np.mean(similarities))

        is_match = mean_sim >= self.threshold

        return {
            "is_match":        is_match,
            "similarity":      round(mean_sim, 4),   # same metric used for the decision
            "mean_similarity": round(mean_sim, 4),
            "max_similarity":  round(max_sim, 4),    # kept for debugging
            "threshold":       self.threshold,
            "frames_compared": len(video_embs),
            "method":          "InsightFace ArcFace + cosine similarity",
        }
