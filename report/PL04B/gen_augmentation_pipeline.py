#!/usr/bin/env python3
"""
Patch-based Training Augmentation Pipeline figure (matplotlib).

Tai tao Image 3: luoi panel 2x4 + khoi text mo ta pipeline.
Dung:
    python3 gen_augmentation_pipeline.py [duong_dan_anh_tai_lieu.png]
Neu khong truyen anh, script tu sinh mot anh tai lieu gia de van chay ra hinh mau.
Thay bang anh that cua ban -> hinh se ra y het ve cau truc.

Phu thuoc: numpy, matplotlib, Pillow (PIL).
"""
import sys
import numpy as np
from PIL import Image, ImageEnhance, ImageDraw, ImageFilter
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.patches import Rectangle

# ----- cau hinh pipeline (khop nhan trong hinh mau) -----
PATCH = 384          # kich thuoc patch trich xuat
STRIDE = 128         # buoc truot luoi
CROP = 256           # random crop dau ra
ROT_DEG = 2.79       # goc xoay vi du hien thi
JITTER = 0.5         # he so color jitter
SEED = 7
rng = np.random.default_rng(SEED)


def synth_document(h=961, w=3216):
    """Sinh anh tai lieu gia: nen giay co + net 'muc' giong chu viet tay + mat scan toi 2 ben."""
    # nen giay be vang
    base = np.zeros((h, w, 3), np.float32)
    base[..., 0], base[..., 1], base[..., 2] = 0.82, 0.74, 0.60
    base += rng.normal(0, 0.03, (h, w, 3)).astype(np.float32)
    img = Image.fromarray(np.clip(base * 255, 0, 255).astype(np.uint8))
    d = ImageDraw.Draw(img)
    # net chu viet tay gia (cac duong cong ngan mau muc nau xam)
    for r in range(12):
        y = 120 + r * 60 + rng.integers(-8, 8)
        x = 350
        while x < w - 350:
            x2 = x + rng.integers(20, 60)
            y2 = y + rng.integers(-14, 14)
            d.line([(x, y), (x2, y2)], fill=(40, 32, 28), width=2)
            x = x2 + rng.integers(2, 10)
    # mat scan toi o vien trai/phai (giong anh mau)
    arr = np.asarray(img).astype(np.float32)
    arr[:, :300] *= 0.18
    arr[:, -300:] *= 0.30
    arr[:80] *= 0.25
    arr[-80:] *= 0.25
    return Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8))


def color_jitter(im, factor=0.5):
    """Color jitter kieu torchvision: brightness/contrast/saturation + dich hue manh."""
    b = 1 + (rng.random() * 2 - 1) * factor
    c = 1 + (rng.random() * 2 - 1) * factor
    s = 1 + (rng.random() * 2 - 1) * factor
    im = ImageEnhance.Brightness(im).enhance(b)
    im = ImageEnhance.Contrast(im).enhance(c)
    im = ImageEnhance.Color(im).enhance(s)
    # dich hue
    hsv = np.asarray(im.convert("HSV")).astype(np.int16)
    hsv[..., 0] = (hsv[..., 0] + int(120 * factor)) % 256
    return Image.fromarray(hsv.astype(np.uint8), "HSV").convert("RGB")


def main():
    # ---- 1. anh full-resolution ----
    if len(sys.argv) > 1:
        doc = Image.open(sys.argv[1]).convert("RGB")
    else:
        doc = synth_document()
    W, H = doc.size

    # ---- 2. chon patch 384x384 (vung co noi dung) ----
    px, py = 60, 150
    selected = doc.crop((px, py, px + PATCH, py + PATCH))

    # ---- 3. random rotation ----
    rotated = selected.rotate(ROT_DEG, resample=Image.BICUBIC, expand=False, fillcolor=(20, 18, 16))

    # ---- 4. random crop 256 ----
    off = (PATCH - CROP) // 2
    cropped = rotated.crop((off, off, off + CROP, off + CROP))

    # ---- 5. color jitter ----
    jittered = color_jitter(cropped, JITTER)

    # ---- 6. to tensor (hien thi giong jitter, chi doi nhan) ----
    to_tensor = jittered

    # ---- 7. validation/test: crop trung tam, KHONG augmentation ----
    voff = (PATCH - CROP) // 2
    val = selected.crop((voff, voff, voff + CROP, voff + CROP))

    # ====== ve figure 2x4 ======
    fig = plt.figure(figsize=(15.5, 8.4))
    fig.suptitle("Patch-based Training Augmentation Pipeline",
                 fontsize=19, fontweight="bold", y=0.985)
    gs = fig.add_gridspec(2, 4, hspace=0.22, wspace=0.04,
                          left=0.015, right=0.995, top=0.89, bottom=0.03)

    def panel(r, c, im, title, sub=""):
        ax = fig.add_subplot(gs[r, c])
        ax.imshow(im)
        ax.set_title(f"{title}\n{sub}" if sub else title, fontsize=12.5, fontweight="bold")
        ax.axis("off")
        return ax

    # (0,0) full-res document + luoi patch + o chon
    ax0 = fig.add_subplot(gs[0, 0])
    ax0.imshow(doc, aspect="equal")
    ax0.set_title(f"Full-resolution Document\nShape: H={H}, W={W}, C=3", fontsize=12.5, fontweight="bold")
    for x in range(0, W, STRIDE):
        ax0.axvline(x, color="red", lw=0.3, alpha=0.6)
    for y in range(0, H, STRIDE):
        ax0.axhline(y, color="red", lw=0.3, alpha=0.6)
    ax0.add_patch(Rectangle((px, py), PATCH, PATCH, ec="blue", fc="none", lw=2))
    ax0.add_patch(Rectangle((W - 500, 120), PATCH, PATCH, ec="red", fc="none", lw=2))
    ax0.set_xlim(0, W); ax0.set_ylim(H, 0)
    ax0.axis("off")

    panel(0, 1, selected, "Selected Patch", f"{PATCH} × {PATCH}")
    panel(0, 2, rotated, "Random Rotation", f"angle = {ROT_DEG}°")
    panel(0, 3, cropped, "Random Crop", f"{CROP} × {CROP}")
    panel(1, 0, jittered, "Color Jitter", f"brightness/contrast/saturation/hue = {JITTER}")
    panel(1, 1, to_tensor, "To Tensor", f"Shape: (3, {CROP}, {CROP})")
    panel(1, 2, val, "Validation/Test Pipeline", "No Random Augmentation")

    # (1,3) khoi text mo ta
    n_cols = (W - PATCH) // STRIDE + 1
    n_rows = (H - PATCH) // STRIDE + 1
    total = n_cols * n_rows
    txt = (
        "Patch Extraction:\n"
        f"Full image shape: H={H}, W={W}, C=3\n"
        f"Patch size: {PATCH} × {PATCH}\n"
        f"Stride: {STRIDE} pixels\n"
        f"Patch grid: {n_rows} rows × {n_cols} columns\n"
        f"Total patches: {total}\n\n"
        "Training Augmentation:\n"
        "1. Random rotation [-10°, 10°]\n"
        f"2. Random crop to {CROP} × {CROP}\n"
        f"3. Color jitter factor = {JITTER}\n"
        "4. Convert to tensor\n\n"
        "Output tensor shape:\n"
        f"({3}, {CROP}, {CROP}) = (C, H, W)"
    )
    axt = fig.add_subplot(gs[1, 3])
    axt.axis("off")
    axt.text(0.0, 0.98, txt, va="top", ha="left", fontsize=11.5, family="DejaVu Sans")

    out = "fig_augmentation_pipeline.png"
    fig.savefig(out, dpi=150, bbox_inches="tight", facecolor="white")
    print("saved ->", out)


if __name__ == "__main__":
    main()
