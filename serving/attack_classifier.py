"""attack_classifier.py — Heuristic attack-type classifier (không cần train lại).

Khi model liveness dự đoán "spoof", module này phân tích ảnh bằng các đặc trưng
tần số + màu sắc + texture để suy đoán loại tấn công:

  - print:  in ảnh giấy/bìa → moiré pattern (tần số cao lặp), màu nhạt/bạc, texture phẳng
  - screen: chiếu lại trên màn hình → color banding, phản chiếu, viền sáng màn hình
  - unknown: không đủ tín hiệu → trả unknown

LƯU Ý: Đây là heuristic (rule-based), KHÔNG chính xác bằng model multi-class.
Mục đích: cung cấp thêm thông tin tham khảo cho người dùng, không dùng để ra quyết định cuối.
"""

import cv2
import numpy as np


def classify_attack_type(rgb_image: np.ndarray) -> dict:
    """Phân tích ảnh RGB (numpy HxWx3, uint8) và trả loại tấn công + confidence.

    Returns:
        {
            "attack_type": "print" | "screen" | "unknown",
            "confidence": float (0-1),
            "scores": {"print": float, "screen": float},
            "evidence": {tên_đặc_trưng: giá_trị, ...}
        }
    """
    h, w = rgb_image.shape[:2]

    # --- 1) Phân tích tần số (FFT) → phát hiện moiré (print) ---
    gray = cv2.cvtColor(rgb_image, cv2.COLOR_RGB2GRAY)
    f = np.fft.fft2(gray.astype(np.float32))
    fshift = np.fft.fftshift(f)
    magnitude = np.log1p(np.abs(fshift))

    cy, cx = h // 2, w // 2
    r_low = min(h, w) // 8
    r_high = min(h, w) // 3

    y, x = np.ogrid[:h, :w]
    dist = np.sqrt((x - cx) ** 2 + (y - cy) ** 2)

    low_energy = magnitude[dist < r_low].mean()
    high_energy = magnitude[dist >= r_high].mean()

    # Moiré: tần số cao bất thường → print
    freq_ratio = high_energy / (low_energy + 1e-6)

    # Tìm peak đột biến trong phổ tần cao (dấu hiệu moiré lặp)
    high_mask = dist >= r_high
    high_spectrum = magnitude * high_mask
    peak_threshold = high_energy + 2 * magnitude[high_mask].std()
    moire_peaks = int(np.sum(high_spectrum > peak_threshold))

    # --- 2) Phân tích màu sắc → phát hiện replay (màn hình) ---
    hsv = cv2.cvtColor(rgb_image, cv2.COLOR_RGB2HSV)
    saturation = hsv[:, :, 1].astype(np.float32)
    value = hsv[:, :, 2].astype(np.float32)

    sat_mean = saturation.mean()
    sat_std = saturation.std()
    val_mean = value.mean()

    # Color banding: histogram value có các peak rõ rệt (do bit-depth màn hình)
    val_hist = cv2.calcHist([hsv[:, :, 2]], [0], None, [256], [0, 256]).flatten()
    val_hist_norm = val_hist / val_hist.sum()
    color_entropy = -np.sum(val_hist_norm[val_hist_norm > 0] * np.log2(val_hist_norm[val_hist_norm > 0]))

    # --- 3) Phân tích texture (Laplacian) → bề mặt phẳng = giấy in ---
    laplacian = cv2.Laplacian(gray, cv2.CV_64F)
    texture_var = laplacian.var()

    # --- Thu thập evidence ---
    evidence = {
        "freq_ratio_high_low": round(float(freq_ratio), 4),
        "moire_peaks": moire_peaks,
        "saturation_mean": round(float(sat_mean), 2),
        "saturation_std": round(float(sat_std), 2),
        "brightness_mean": round(float(val_mean), 2),
        "color_entropy": round(float(color_entropy), 3),
        "texture_variance": round(float(texture_var), 2),
    }

    # --- Scoring (re-tuned trên mẫu print/screen THẬT — best-effort) ---
    # Quy tắc: moiré CỰC CAO = lưới điểm ảnh MÀN HÌNH, bằng chứng screen áp đảo (đè texture);
    # còn lại dùng texture_variance: tấm IN chụp thực tế nhiều vân giấy/nền -> texture cao,
    # ảnh phát lại màn hình mịn hơn -> texture thấp. (Bản cũ đảo chiều -> print<->screen lộn.)
    scores = {"print": 0.0, "screen": 0.0}
    if moire_peaks >= 1100:
        scores["screen"] += 0.6     # moiré cao = lưới điểm ảnh màn hình
    elif texture_var >= 300:
        scores["print"] += 0.5      # moiré thấp + có vân = giấy in
    else:
        scores["screen"] += 0.4     # moiré thấp + mịn = màn hình sạch

    # --- Quyết định ---
    best_type = max(scores, key=scores.get)
    best_score = scores[best_type]

    if best_score < 0.25:
        best_type = "unknown"
        confidence = 0.0
    else:
        total = sum(scores.values()) + 1e-6
        confidence = best_score / total

    return {
        "attack_type": best_type,
        "confidence": round(float(confidence), 3),
        "scores": {k: round(v, 3) for k, v in scores.items()},
        "evidence": evidence,
    }
