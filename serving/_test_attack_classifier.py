"""_test_attack_classifier.py — chạy classify_attack_type trên ảnh để kiểm/tune print vs screen.

Dùng:
  serving/.venv310/bin/python serving/_test_attack_classifier.py <img1> <img2> ...
  (không tham số → dùng samples real/fake để smoke-test cấu trúc điểm)

In: attack_type · confidence · scores{print,screen} · evidence chính.
VALIDATE thật: truyền ảnh print/screen ĐÃ GÁN NHÃN của bạn rồi đối chiếu type với nhãn,
và chỉnh ngưỡng trong attack_classifier.py nếu lệch."""
import sys
import os
import glob

import cv2

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from attack_classifier import classify_attack_type

paths = sys.argv[1:]
if not paths:
    paths = sorted(glob.glob("/home/huanthuytnhh/deepguard/app/frontend/public/samples/*.jpg"))

print(f"{'image':22s} {'type':9s} {'conf':>5s}  scores                evidence")
print("-" * 100)
for p in paths:
    bgr = cv2.imread(p)
    if bgr is None:
        print(f"{os.path.basename(p):22s} (không đọc được)")
        continue
    rgb = cv2.cvtColor(bgr, cv2.COLOR_BGR2RGB)
    r = classify_attack_type(rgb)
    ev = r["evidence"]
    print(f"{os.path.basename(p):22s} {r['attack_type']:9s} {r['confidence']:>5.3f}  "
          f"{str(r['scores']):20s}  moire={ev['moire_peaks']} tex={ev['texture_variance']} "
          f"ent={ev['color_entropy']} sat={ev['saturation_mean']}")
