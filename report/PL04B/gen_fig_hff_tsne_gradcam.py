#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Bản SFDCT-HFF: t-SNE (3.13.2) + Grad-CAM (3.14.2). CHẠY model HFF thật (ckpt hff R3 17-30-34),
trích feature (gộp 1000 frame, verify AUC) + Grad-CAM 1 ảnh fake. KHÔNG số 'Figure' trong ảnh."""
import os, sys, pickle
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); ROOT = os.path.dirname(ROOT)
DFB = os.path.join(ROOT, "DeepfakeBench"); FIGABS = os.path.join(ROOT, "report", "figures")
os.chdir(DFB); sys.path.insert(0, "training"); sys.path.insert(0, "tools")
import cv2, numpy as np, torch
import infer
import matplotlib; matplotlib.use("Agg"); import matplotlib.pyplot as plt
from sklearn.decomposition import PCA; from sklearn.manifold import TSNE
from sklearn.metrics import roc_auc_score

CFG = "training/config/detector/efficientnetb4_hff.yaml"
CKPT = "hf_pull/runs/20260610-003615/ckpt/efficientnetb4_hff_2026-06-09-17-30-34/ckpt_best.pth"
MEAN = [0.5, 0.5, 0.5]; STD = [0.5, 0.5, 0.5]
model, _ = infer.load_model(CFG, CKPT, "cpu"); model.eval()

EV = "../report/evidence/ablation_cdfv2/pickles/hff_r3"
dd = pickle.load(open(EV + "/data_dict_test.pickle", "rb"))
mm = pickle.load(open(EV + "/metric_dict_best.pickle", "rb"))
imgs = np.asarray(dd["image"]); y = np.asarray(dd["label"], int); pred_all = np.asarray(mm["pred"], float)

def loadx(p):
    bgr = cv2.imread("datasets/" + str(p)); rgb = cv2.cvtColor(cv2.resize(bgr, (256, 256)), cv2.COLOR_BGR2RGB)
    x = (rgb.astype(np.float32) / 255. - MEAN) / STD
    return torch.from_numpy(x.transpose(2, 0, 1)).float()

# ---------- 3.13.2 t-SNE ----------
rng = np.random.RandomState(0)
idx = np.concatenate([rng.choice(np.where(y == 0)[0], 500, False), rng.choice(np.where(y == 1)[0], 500, False)])
feats, probs = [], []
with torch.no_grad():
    for i in range(0, len(idx), 32):
        b = torch.stack([loadx(imgs[j]) for j in idx[i:i+32]])
        f = model.features({"image": b})
        feats.append(f.mean(dim=(2, 3)).numpy())
        probs.append(torch.softmax(model.classifier(f), 1)[:, 1].numpy())
feats = np.concatenate(feats); probs = np.concatenate(probs); L = y[idx]
print(f"  t-SNE subsample AUC = {roc_auc_score(L, probs):.4f}  (xác nhận đúng model HFF)")
X = PCA(n_components=50, random_state=0).fit_transform(feats)
emb = TSNE(n_components=2, init="pca", perplexity=30, random_state=0).fit_transform(X)
fig, ax = plt.subplots(figsize=(6.6, 5.8))
ax.scatter(emb[L == 0, 0], emb[L == 0, 1], s=8, c="#55A868", alpha=.6, label="real")
ax.scatter(emb[L == 1, 0], emb[L == 1, 1], s=8, c="#C44E52", alpha=.6, label="fake")
ax.set(title="t-SNE of SFDCT-HFF fused features — Celeb-DF-v2 (500 real + 500 fake)", xticks=[], yticks=[])
ax.legend(markerscale=2, fontsize=10)
fig.tight_layout(); fig.savefig(os.path.join(FIGABS, "fig_3_10_2_tsne_hff.png"), dpi=160, bbox_inches="tight"); plt.close(fig)
print("OK fig_3_10_2_tsne_hff.png")

# ---------- 3.14.2 Grad-CAM (ảnh fake pred cao nhất) ----------
gi = np.where(y == 1)[0][np.argmax(pred_all[np.where(y == 1)[0]])]
x, rgb = infer.preprocess("datasets/" + str(imgs[gi]), MEAN, STD)
prob, cam = infer.gradcam(model, x, "cpu")
cam_rs = cv2.resize(cam, (256, 256))
fig, ax = plt.subplots(1, 2, figsize=(7, 3.8))
ax[0].imshow(rgb); ax[0].set_title("input (fake)", fontsize=11); ax[0].axis("off")
ax[1].imshow(rgb); ax[1].imshow(cam_rs, cmap="jet", alpha=.5); ax[1].set_title(f"Grad-CAM (p(fake)={prob:.2f})", fontsize=11); ax[1].axis("off")
fig.suptitle("SFDCT-HFF Grad-CAM on a Celeb-DF-v2 fake", fontsize=12, fontweight="bold")
fig.tight_layout(); fig.savefig(os.path.join(FIGABS, "fig_3_12_2_gradcam_hff.png"), dpi=160, bbox_inches="tight"); plt.close(fig)
print(f"OK fig_3_12_2_gradcam_hff.png  (fake idx {gi}, prob {prob:.3f})")
