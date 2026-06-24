"""Thử các expand factor khác nhau trên real_01.jpg để tìm giá trị gốc → prob_fake ~0.40."""
import sys, cv2, numpy as np, requests as req
sys.path.insert(0, '/home/huanthuytnhh/deepguard/app/serving')

import face_crop as fc

IMG = '/home/huanthuytnhh/deepguard/app/frontend/public/samples/real_01.jpg'
bgr = cv2.imread(IMG)

def test_expand(expand):
    orig = fc._EXPAND
    # Monkey-patch expand
    crop, found = fc.crop_face_bgr(bgr, expand=expand)
    sz = f"{crop.shape[1]}x{crop.shape[0]}"
    img_b = cv2.imencode('.jpg', crop)[1].tobytes()
    r = req.post('http://localhost:8501/predict?gradcam=false',
                 files={'file': ('i.jpg', img_b)}, timeout=15)
    pf = r.json().get('prob_fake', '?')
    score = int(pf * 100) if isinstance(pf, float) else '?'
    print(f"  expand={expand:.2f}  crop={sz}  prob_fake={pf:.4f}  score={score}/100  found={found}")

print("\nTest expand factor → target prob_fake ~0.40 (40/100):")
print(f"{'='*65}")

# Nếu không crop gì cả (expand rất nhỏ → tight crop)
for e in [0.0, 0.5, 0.8, 1.0, 1.1, 1.2, 1.3, 1.5, 2.0]:
    test_expand(e)

# Test không crop (toàn ảnh)
img_b = cv2.imencode('.jpg', bgr)[1].tobytes()
r = req.post('http://localhost:8501/predict?gradcam=false',
             files={'file': ('i.jpg', img_b)}, timeout=15)
pf = r.json().get('prob_fake', '?')
print(f"  expand=NONE (full img)  prob_fake={pf:.4f}  score={int(pf*100)}/100")
print(f"{'='*65}\n")
