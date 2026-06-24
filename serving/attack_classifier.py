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
    # Resize về kích thước cố định TRƯỚC khi FFT → ngưỡng moiré_peaks tuyệt đối
    # nhất quán bất kể độ phân giải ảnh đầu vào.
    rgb_image = cv2.resize(rgb_image, (256, 256), interpolation=cv2.INTER_AREA)
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

    # --- Scoring ĐỘC LẬP: print & screen chấm riêng từ nhiều dấu hiệu, rồi chuẩn hoá.
    # (Fix B5: bản cũ chỉ 1 nhánh if/elif/else có điểm → total=best → confidence luôn ≈1.0,
    #  vô nghĩa. Nay mỗi loại cộng điểm độc lập → label VÀ confidence đều phản ánh bằng chứng.)
    # Ngưỡng heuristic best-effort — nên tune lại trên tập print/screen THẬT (xem test harness).
    print_s = 0.0
    screen_s = 0.0

    # 1) Moiré (lưới điểm ảnh màn hình) → screen
    if moire_peaks >= 1100:
        screen_s += 0.45
    elif moire_peaks >= 600:
        screen_s += 0.25

    # 2) Texture: vân giấy in nhiều → print; bề mặt phát lại mịn → screen
    if texture_var >= 300:
        print_s += 0.40
    elif texture_var < 120:
        screen_s += 0.30

    # 3) Color banding: entropy thấp = ít mức màu (bit-depth màn hình) → screen;
    #    phổ màu giàu = ảnh in/chụp thực → print
    if color_entropy < 6.5:
        screen_s += 0.20
    elif color_entropy >= 7.3:
        print_s += 0.20

    # 4) Bão hoà thấp/bạc màu = đặc trưng giấy in → print
    if sat_mean < 60:
        print_s += 0.20

    # 5) Tần số cao bất thường → nghiêng artifact in/moiré → print
    if freq_ratio > 0.6:
        print_s += 0.10

    scores = {"print": round(print_s, 3), "screen": round(screen_s, 3)}

    # --- Quyết định + confidence CÓ NGHĨA (tỉ lệ winner/tổng, không còn luôn =1) ---
    total = print_s + screen_s
    best_type = max(scores, key=scores.get)
    best_score = scores[best_type]
    # Quá ít bằng chứng, hoặc 2 loại sát nhau → không đủ chắc để gán nhãn
    if total < 0.25 or abs(print_s - screen_s) < 0.12:
        best_type = "unknown"
    confidence = round(best_score / (total + 1e-6), 3) if total > 0 else 0.0

    return {
        "attack_type": best_type,
        "confidence": confidence,
        "scores": scores,
        "evidence": evidence,
    }
