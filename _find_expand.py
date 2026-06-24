"""Test trực tiếp model (không qua HTTP) để tránh JPEG re-encode lệch kết quả."""
import sys, os, cv2, numpy as np, torch
sys.path.insert(0, '/home/huanthuytnhh/deepguard/app/tools')
sys.path.insert(0, '/home/huanthuytnhh/deepguard/app/training')
sys.path.insert(0, '/home/huanthuytnhh/deepguard/app/serving')
import infer as infer_mod
import face_crop as fc

REPO = '/home/huanthuytnhh/deepguard/app'
CFG  = f'{REPO}/serving/naive_sfdct/config.yaml'
CKPT = f'{REPO}/serving/naive_sfdct/ckpt_best.pth'
IMG  = f'{REPO}/frontend/public/samples/real_01.jpg'

model, cfg = infer_mod.load_model(CFG, CKPT, 'cpu')
res  = int(cfg.get('resolution', 256))
mean = cfg.get('mean', [0.5,0.5,0.5])
std  = cfg.get('std',  [0.5,0.5,0.5])

def run(bgr):
    rgb = cv2.cvtColor(cv2.resize(bgr, (res,res), interpolation=cv2.INTER_LINEAR), cv2.COLOR_BGR2RGB)
    x = ((rgb.astype(np.float32)/255.0 - mean) / std).transpose(2,0,1)
    x = torch.from_numpy(x).float().unsqueeze(0)
    with torch.inference_mode():
        feat = model.features({'image': x})
        prob = float(torch.softmax(model.classifier(feat), dim=1)[0,1])
    return prob

bgr_orig = cv2.imread(IMG)
print(f"\nimg={bgr_orig.shape[1]}x{bgr_orig.shape[0]}")

# Haar box
xml = cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
clf = cv2.CascadeClassifier(xml)
faces = clf.detectMultiScale(cv2.cvtColor(bgr_orig, cv2.COLOR_BGR2GRAY), 1.1, 5, minSize=(40,40))
print(f"Haar boxes: {[list(f) for f in faces]}")

print(f"\n{'expand':>8}  {'crop':>10}  {'prob_fake':>10}  {'score':>7}")
print('='*45)

for expand in [0.5, 0.7, 0.8, 0.9, 1.0, 1.1, 1.2, 1.3, 1.5, 2.0]:
    c, found = fc.crop_face_bgr(bgr_orig, expand=expand)
    pf = run(c)
    sz = f"{c.shape[1]}x{c.shape[0]}" if found else "no-face"
    print(f"{expand:>8.2f}  {sz:>10}  {pf:>10.4f}  {int(pf*100):>6}/100")

# Full image (no crop)
pf = run(bgr_orig)
print(f"{'no-crop':>8}  {'256x256':>10}  {pf:>10.4f}  {int(pf*100):>6}/100")
print('='*45)
