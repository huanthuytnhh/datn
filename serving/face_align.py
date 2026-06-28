"""face_align.py — căn chỉnh mặt 5 điểm theo template ArcFace, port NGUYÊN VĂN
`img_align_crop` của DeepfakeBench (preprocessing/preprocess.py:121-176) để serving
khớp y hệt lúc train Celeb-DF-v2.

Train crop = similarity-transform 5 landmark (mắt T/P, mũi, 2 khoé miệng) → template
ArcFace 112, `scale=1.3` (lề quanh template), outsize 256. Đây CHÍNH là phép biến đổi
đã sinh ra dataset, nên dùng nó ở serving = khử train/serve skew tận gốc.

Khác biệt duy nhất so với train: landmark lấy từ MTCNN (facenet) thay vì dlib-81 —
cùng 5 vị trí giải phẫu, lệch vài px, không đáng kể.

`_umeyama`: bản sao thuật toán của skimage.transform.SimilarityTransform (Umeyama
1991) — để KHÔNG phải thêm phụ thuộc scikit-image vào môi trường serving.
"""
import numpy as np
import cv2


def _build_dst(outsize, scale):
    """Template ArcFace 5 điểm đặt vào khung `outsize` với lề `scale-1`.
    Sao từng dòng từ DeepfakeBench preprocess.py:128-154 (parity tuyệt đối)."""
    target_size = [112, 112]
    dst = np.array([
        [30.2946, 51.6963],
        [65.5318, 51.5014],
        [48.0252, 71.7366],
        [33.5493, 92.3655],
        [62.7299, 92.2041]], dtype=np.float32)
    if target_size[1] == 112:
        dst[:, 0] += 8.0
    dst[:, 0] = dst[:, 0] * outsize[0] / target_size[0]
    dst[:, 1] = dst[:, 1] * outsize[1] / target_size[1]
    target_size = outsize
    margin_rate = scale - 1
    x_margin = target_size[0] * margin_rate / 2.0
    y_margin = target_size[1] * margin_rate / 2.0
    dst[:, 0] += x_margin
    dst[:, 1] += y_margin
    dst[:, 0] *= target_size[0] / (target_size[0] + 2 * x_margin)
    dst[:, 1] *= target_size[1] / (target_size[1] + 2 * y_margin)
    return dst


def _umeyama(src, dst):
    """Similarity transform (scale+rotation+translation) bằng SVD — khớp skimage.
    Trả ma trận affine 3x3, hoặc None nếu suy biến."""
    src = np.asarray(src, dtype=np.float64)
    dst = np.asarray(dst, dtype=np.float64)
    num, dim = src.shape
    src_mean = src.mean(axis=0)
    dst_mean = dst.mean(axis=0)
    src_demean = src - src_mean
    dst_demean = dst - dst_mean
    A = dst_demean.T @ src_demean / num
    d = np.ones((dim,), dtype=np.float64)
    if np.linalg.det(A) < 0:
        d[dim - 1] = -1
    T = np.eye(dim + 1, dtype=np.float64)
    U, S, V = np.linalg.svd(A)
    rank = np.linalg.matrix_rank(A)
    if rank == 0:
        return None
    if rank == dim - 1:
        if np.linalg.det(U) * np.linalg.det(V) > 0:
            T[:dim, :dim] = U @ V
        else:
            s = d[dim - 1]
            d[dim - 1] = -1
            T[:dim, :dim] = U @ np.diag(d) @ V
            d[dim - 1] = s
    else:
        T[:dim, :dim] = U @ np.diag(d) @ V
    var = src_demean.var(axis=0).sum()
    if var == 0:
        return None
    scale = 1.0 / var * (S @ d)
    T[:dim, dim] = dst_mean - scale * (T[:dim, :dim] @ src_mean)
    T[:dim, :dim] *= scale
    return T


def align_face(bgr, landmarks5, outsize=256, scale=1.3, return_scale=False):
    """Trả ảnh BGR đã align `outsize×outsize`, hoặc None nếu transform suy biến.
    `landmarks5`: (5,2) thứ tự [leye, reye, nose, lmouth, rmouth].
    return_scale=True → trả (img, warp_scale): warp_scale>1 nghĩa là warp PHÓNG TO
    nguồn (upscale → bịa tần số); <1 là thu nhỏ (an toàn)."""
    dst = _build_dst((outsize, outsize), scale)
    T = _umeyama(np.asarray(landmarks5, dtype=np.float64), dst)
    if T is None:
        return (None, 0.0) if return_scale else None
    M = T[0:2, :]
    aligned = cv2.warpAffine(bgr, M, (outsize, outsize),
                             flags=cv2.INTER_LINEAR, borderValue=(0, 0, 0))
    if return_scale:
        return aligned, float(np.sqrt(abs(np.linalg.det(M[:, :2]))))
    return aligned
