#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Áp tất cả thay đổi vào PL04_B_RuotThuyetMinh.md, mỗi chỗ kèm marker 【…】.
Tái chạy được: luôn đọc bản .src (bản pandoc gốc, không marker) rồi sinh bản có marker.
"""
import re, os, shutil

DIR = os.path.dirname(os.path.abspath(__file__))
MD  = os.path.join(DIR, "PL04_B_RuotThuyetMinh.md")
SRC = os.path.join(DIR, "PL04_B_RuotThuyetMinh.src.md")   # bản gốc pandoc, giữ sạch

# Lần đầu: tạo bản .src từ bản hiện tại (chưa có marker). Các lần sau: dùng .src.
if not os.path.exists(SRC):
    shutil.copy(MD, SRC)

with open(SRC, encoding="utf-8") as f:
    text = f.read()

log = []                                   # (mã, loại, ghi chú)
cnt = {"SỬA": 0, "ẢNH": 0, "SƠ-ĐỒ": 0, "CẦN-BẠN": 0, "DRAFT": 0}
prob = []                                  # các phép không khớp -> báo lại

def newtag(kind):
    cnt[kind] += 1
    return f"【{kind}-{cnt[kind]:02d}】"

def fix(find, repl, note, visible=False):
    global text
    if text.count(find) != 1:
        prob.append(("SỬA", note, text.count(find))); return
    t = newtag("SỬA")
    tail = (f" {t}" if visible else "") + f"<!--{t} {note}-->"
    text = text.replace(find, repl + tail, 1)
    log.append((t, "sửa", note))

def img(cap, fname, alt, note, verify=False):
    """Chèn ảnh NGAY TRÊN dòng caption (caption nằm dưới hình theo mẫu khoa)."""
    global text
    i = text.find(cap)
    if i < 0 or text.count(cap) != 1:
        prob.append(("ẢNH", note, text.count(cap))); return
    t = newtag("ẢNH")
    vmark = "  ⚠️VERIFY" if verify else ""
    block = (f"{t}{vmark}\n"
             f"![{alt}](../figures/{fname})\n"
             f"<!--{t} chèn ../figures/{fname} cho {alt}. {note}-->\n\n")
    text = text[:i] + block + text[i:]
    log.append((t, "ảnh", f"{alt} → {fname}. {note}"))

def gap(cap, note):
    """Đánh dấu hình KHÔNG có file: chèn placeholder nhìn thấy được, ngay trên caption."""
    global text
    i = text.find(cap)
    if i < 0 or text.count(cap) != 1:
        prob.append(("CẦN-BẠN", note, text.count(cap))); return
    t = newtag("CẦN-BẠN")
    block = (f"> {t} **[HÌNH CHỜ BỔ SUNG]** — {note}\n"
             f"<!--{t} {note}-->\n\n")
    text = text[:i] + block + text[i:]
    log.append((t, "cần bạn", note))

def flag_before(anchor, note):
    """Đánh dấu mục rỗng / cần bạn, chèn trước anchor."""
    global text
    if text.count(anchor) != 1:
        prob.append(("CẦN-BẠN", note, text.count(anchor))); return
    t = newtag("CẦN-BẠN")
    block = f"> {t} **[CẦN BỔ SUNG]** — {note}\n<!--{t} {note}-->\n\n"
    text = text.replace(anchor, block + anchor, 1)
    log.append((t, "cần bạn", note))

def fence(cap, note):
    """Bọc lại sơ đồ mermaid: từ từ khoá flowchart/sequenceDiagram lùi về, tới ngay trên caption."""
    global text
    i = text.find(cap)
    if i < 0 or text.count(cap) != 1:
        prob.append(("SƠ-ĐỒ", note, text.count(cap))); return
    starts = [m.start() for m in re.finditer(r'(?:flowchart |sequenceDiagram)', text[:i])]
    if not starts:
        prob.append(("SƠ-ĐỒ", note + " (ko thấy keyword)", 0)); return
    s = starts[-1]
    block = text[s:i]
    block = re.sub(r'\\([\[\]()>|{}~`*_])', r'\1', block)   # bỏ backslash escape
    block = re.sub(r'\n[ \t]*\n', '\n', block).strip()      # gộp dòng trống
    t = newtag("SƠ-ĐỒ")
    new = (f"{t}\n<!--{t} {note} — đã bọc lại mermaid, kiểm tra render-->\n"
           f"```mermaid\n{block}\n```\n\n")
    text = text[:s] + new + text[i:]
    log.append((t, "sơ đồ", note))

def draw(cap, mermaid_src, note):
    """Vẽ MỚI 1 sơ đồ mermaid (Claude soạn từ mô tả thân bài), chèn ngay trên caption."""
    global text
    i = text.find(cap)
    if i < 0 or text.count(cap) != 1:
        prob.append(("SƠ-ĐỒ", note, text.count(cap))); return
    t = newtag("SƠ-ĐỒ")
    block = (f"{t}\n<!--{t} VẼ MỚI (Claude soạn từ thân bài): {note} — kiểm tra đúng kiến trúc rồi dùng-->\n"
             f"```mermaid\n{mermaid_src.strip()}\n```\n\n")
    text = text[:i] + block + text[i:]
    log.append((t, "sơ đồ MỚI", note))

def draft_after(heading, prose, note):
    """Chèn đoạn DRAFT ngay sau tiêu đề mục rỗng (nội dung Claude soạn, bạn đọc lại rồi thêm vào Docs)."""
    global text
    if text.count(heading) != 1:
        prob.append(("DRAFT", note, text.count(heading))); return
    t = newtag("DRAFT")
    block = heading + f" {t}\n\n" + prose.strip() + f"\n<!--{t} {note} — Claude DRAFT, đọc lại rồi thêm vào Docs-->"
    text = text.replace(heading, block, 1)
    log.append((t, "draft", note))

# ---------------- 1) BỌC MERMAID (theo thứ tự tài liệu) ----------------
fence("*Figure 2.1: Overview use case diagram.*", "Figure 2.1 use-case")
fence("Figure 2.3: Activity diagram for deepfake image detection.", "Figure 2.3 activity deepfake")
fence("Figure 2.4: Activity diagram for the eKYC cascade.", "Figure 2.4 activity eKYC")
fence("*Figure 2.5: Deepfake detection sequence diagram.*", "Figure 2.5 sequence deepfake")
fence("*Figure 2.6: eKYC cascade sequence diagram.*", "Figure 2.6 sequence eKYC")
fence("*Figure 3.24: Deployment of DeepGuard on a single cloud instance", "Figure 3.24 deployment")

# ---------------- 2) ĐÁNH LẠI SỐ HÌNH CHƯƠNG 2 (trùng số) ----------------
fix("*Figure 2.2: Overall architecture of SFDCT.*",
    "*Figure 2.7: Overall architecture of SFDCT.*",
    "trùng số: Figure 2.2(model)→2.7 (2.2 đã là System architecture)")
fix("*Figure 2.3: Overall architecture of SFDCT-HFF.*",
    "*Figure 2.8: Overall architecture of SFDCT-HFF.*",
    "trùng số: Figure 2.3(model)→2.8")
fix("*Figure 2.4: Architecture of the B4-liveness baseline.*",
    "*Figure 2.9: Architecture of the B4-liveness baseline.*",
    "trùng số: Figure 2.4(model)→2.9")
fix("*Figure 2.5: Architecture of the B4+DCT-liveness proposal.*",
    "*Figure 2.10: Architecture of the B4+DCT-liveness proposal.*",
    "trùng số: Figure 2.5(model)→2.10")

# ---------------- 3) SỬA LỖI CHẮC CHẮN ----------------
fix("organised as a three-stage pipeline", "organised as a two-stage pipeline",
    'SUMMARY: "three-stage"→"two-stage" (bỏ tầng ArcFace không có thật)')
fix("liveness detection, which uses facial-behaviour cues, namely the eye-aspect ratio and head pose from MediaPipe FaceMesh, and runs first in the cascade as a cheap pre-filter. The third stage is face matching with ArcFace.",
    "liveness detection, a presentation-attack check that runs first in the cascade as a cheap pre-filter against printed photos and screen replays. It reuses the same EfficientNet-B4 backbone, comparing a spatial baseline (B4-liveness) against a spatial-plus-frequency variant (B4+DCT-liveness).",
    'SUMMARY liveness: sai phương pháp (MediaPipe/EAR/head-pose/ArcFace) → đổi đúng B4-liveness vs B4+DCT-liveness; bỏ ArcFace')
fix("Data Science and Artificial Intelligent", "Data Science and Artificial Intelligence",
    'chính tả: "Artificial Intelligent"→"Intelligence"')
fix("# ASSURRANCE", "# ASSURANCE", 'chính tả tiêu đề: "ASSURRANCE"→"ASSURANCE"', visible=True)
fix("I have tried our best", "I have tried my best",
    'đại từ: "our best"→"my best" (1 tác giả)')
fix("[**ASSURRANCE 2**](#assurrance)", "[**ASSURANCE 2**](#assurance)",
    'mục lục: "ASSURRANCE"→"ASSURANCE"')
fix("Figure 1.1: Rest API Architecture", "Figure 1.1: REST API Architecture",
    'viết hoa acronym: "Rest API"→"REST API"')
fix("organised into 4 blocks", "organised into five blocks",
    'sai số: "4 blocks" nhưng liệt kê 5 (FE/BE/Model/Monitoring/Alerting)→"five"')
fix("EEvery number comes from a single run", "Every number comes from a single run",
    'chính tả: "EEvery"→"Every"')

# ---------------- 4) CHÈN ẢNH CÓ FILE THẬT ----------------
img("Figure 1.2: The MBConv block", "fig_1_2_mbconv.png", "Figure 1.2: The MBConv block", "")
img("Figure 1.3: Zigzag scan and the 16 frequency bands", "fig_1_3_zigzag.png", "Figure 1.3: Zigzag scan and the 16 frequency bands", "")
img("Figure 1.4: Gated cross-attention fusion with the zero-initialised gate", "fig_1_4_gate_fusion.png", "Figure 1.4: Gated cross-attention fusion", "")
img("*Figure 2.2: System architecture.*", "fig_2_2_architecture.png", "Figure 2.2: System architecture", "")
# 3 ảnh fig_detail_* SAI -> thay bằng sơ đồ mermaid VẼ MỚI từ mô tả thân bài
draw("*Figure 2.7: Overall architecture of SFDCT.*", """flowchart LR
    IN[Face crop 256x256] --> SP[Spatial branch<br/>EfficientNet-B4]
    IN --> Y[RGB to YCbCr]
    Y --> D[Block-wise 8x8 DCT]
    D --> LG[log-magnitude]
    LG --> BD[16 zigzag bands<br/>mean and std]
    SP --> GF[Gated cross-attention<br/>gate alpha = 0 at init]
    BD --> GF
    GF --> HD[Classifier head]
    HD --> OUT[prob_fake + Grad-CAM]""", "kiến trúc SFDCT (B4 + nhánh block-DCT + gated cross-attention)")
draw("*Figure 2.8: Overall architecture of SFDCT-HFF.*", """flowchart LR
    IN[Face crop] --> SP[EfficientNet-B4 backbone]
    IN --> D[Block-DCT]
    D --> Z[Zero the low bands]
    Z --> IV[Inverse DCT<br/>high-pass residual image]
    IV --> MS[Multi-scale conv stream]
    MS --> RA[Residual-guided attention]
    SP --> GF[Gated fusion<br/>gate alpha = 0 at init]
    RA --> GF
    GF --> HD[Classifier head]
    HD --> OUT[prob_fake + Grad-CAM]""", "kiến trúc SFDCT-HFF (high-pass residual + multi-scale + residual-guided attention)")
draw("*Figure 2.9: Architecture of the B4-liveness baseline.*", """flowchart LR
    IN[Face crop] --> B4[EfficientNet-B4<br/>spatial features]
    B4 --> HD[Two-layer binary head]
    HD --> OUT[spoof probability<br/>live or spoof verdict]""", "kiến trúc B4-liveness baseline (B4 spatial-only + head nhị phân)")
img("*Figure 3.1: Distribution of real and fake counts for the training and test sets.*", "fig_3_1_distribution.png", "Figure 3.1: Real/fake distribution", "")
img("*Figure 3.2: A real and fake face pair after cropping, with the frequency spectrum, showing the frequency footprint of a deepfake.*", "fig_3_2_preprocess_realfake.png", "Figure 3.2: Real/fake pair + spectrum", "")
img("*Figure 3.3: Mean frequency energy by band for real and fake, with the difference; the mid and high bands carry the signal.*", "fig_3_11_frequency.png", "Figure 3.3: Mean frequency energy by band", "")
img("*Figure 3.5: Training curve of the baseline - train loss and test accuracy per epoch, plotted directly from the log.*", "fig_3_3_train_b4.png", "Figure 3.5: Training curve of baseline (B4)", "")
img("*Figure 3.7: Training curve of SFDCT, plotted directly from the log.*", "fig_3_4_train_naive.png", "Figure 3.7: Training curve of SFDCT (naive)", "")
img("*Figure 3.10: ROC curves on the test set; the marked line is the 5 percent false-positive constraint.*", "fig_3_7_roc.png", "Figure 3.10: ROC curves", "")
img("*Figure 3.11: Precision-recall curves on the test set.*", "fig_3_8_pr_curve.png", "Figure 3.11: Precision-recall", "")
img("*Figure 3.12: Confusion matrix of the base detector at the eKYC threshold.*", "fig_3_9_confusion.png", "Figure 3.12: Confusion matrix", "")
img("*Figure 3.13: Two-dimensional projection of the features, coloured by the real and fake label.*", "fig_3_10_tsne.png", "Figure 3.13: t-SNE 2D projection", "")
img("*Figure 3.14: Heat map of the detector on a test sample; the hot regions are where the decision is made.*", "fig_3_12_gradcam.png", "Figure 3.14: Grad-CAM heat map", "")
img("*Figure 3.16: Distribution of the gate values after training.*", "fig_3_13_gate_alpha.png", "Figure 3.16: Gate value distribution", "")

# ---------------- 5) HÌNH KHÔNG CÓ FILE (CẦN BẠN) ----------------
draw("Figure 1.1: REST API Architecture", """sequenceDiagram
    participant C as Client
    participant S as REST API Server
    C->>S: HTTP request - method + URL + headers + JSON body
    S->>S: Route to resource, validate, run logic
    S-->>C: HTTP response - status code + headers + JSON body""", "REST request/response (mô tả ở mục 1.4)")
draw("*Figure 2.10: Architecture of the B4+DCT-liveness proposal.*", """flowchart LR
    IN[Face crop] --> SP[EfficientNet-B4]
    IN --> FQ[Block-DCT branch<br/>16 bands]
    SP --> GF[Gated cross-attention<br/>gate alpha = 0 at init]
    FQ --> GF
    GF --> HD[Binary head]
    HD --> OUT[spoof probability + verdict]""", "kiến trúc B4+DCT-liveness (B4 + block-DCT + gated fusion)")
img("*Figure 3.4: Model summary of the baseline.*", "fig_3_4_summary_b4.png", "Figure 3.4: Model summary of EfficientNet-B4 baseline", "17.55M params — đếm param thật từ model load qua DETECTOR")
img("*Figure 3.6: Model summary of SFDCT.*", "fig_3_6_summary_sfdct.png", "Figure 3.6: Model summary of SFDCT", "18.08M params; nhánh block-DCT 0 param (biến đổi cố định), chỉ fusion thêm 0.53M")
img("*Figure 3.8: Model summary of SFDCT-HFF, full version.*", "fig_3_8_summary_hff.png", "Figure 3.8: Model summary of SFDCT-HFF (full)", "22.77M params; HFStream +5.21M")
img("*Figure 3.9: Training curve of SFDCT-HFF, plotted directly from the log.*", "fig_3_9_train_hff_r3.png", "Figure 3.9: Training curve of SFDCT-HFF (HFF-R3)", "Claude generate từ console-capture 11 điểm thật (hff_r3); peak 0.7551/epoch, best-ckpt 0.7695 ở Bảng 3.5")
img("*Figure 3.15: Example predictions on test faces, each with its predicted probability and verdict against the true label.*", "fig_3_15_predictions.png", "Figure 3.15: Example SFDCT predictions on Celeb-DF-v2 test faces", "8 ví dụ thật: 2 caught + 2 accepted + 2 flagged (FP) + 2 missed (FN), verdict@τ=0.5")
img("*Figure 3.17: Example live and spoof faces from the dataset after the same cropping as the deepfake task.*", "fig_3_17_liveness.png", "Figure 3.17: LCC-FASD live vs spoof — examples and 16-band DCT footprint", "live/spoof thật + 16-band; spoof khác về không gian nhưng ≈ live ở band-DCT → giải thích §3.1.9 (freq branch không giúp)")
gap("*Figure 3.18: Model summary of B4-liveness.*", "Figure 3.18 model summary B4-liveness — bảng text")
gap("*Figure 3.19: Training curve of B4-liveness, plotted directly from the log.*", "Figure 3.19 — ĐỀ XUẤT BỎ: metrics_liveness.json chỉ có số cuối, không có log per-epoch để dựng curve; Bảng 3.10 đã đủ")
img("*Figure 3.20: ROC curve and the live-against-spoof score distribution of B4-liveness on the evaluation split.*", "fig_3_20_roc_b4_liveness.png", "Figure 3.20: ROC + score distribution of B4-liveness", "chạy model trên 7580 ảnh eval thật, AUC 0.9829 khớp metrics, EER≈7%")
gap("*Figure 3.21: Model summary of B4+DCT-liveness.*", "Figure 3.21 model summary B4+DCT-liveness — bảng text")
gap("*Figure 3.22: Training curve of B4+DCT-liveness, plotted directly from the log.*", "Figure 3.22 — ĐỀ XUẤT BỎ: không có log per-epoch; Bảng 3.10 đã đủ")
img("*Figure 3.23: ROC curve and the score distribution of B4+DCT-liveness on the evaluation split.*", "fig_3_23_roc_b4dct_liveness.png", "Figure 3.23: ROC + score distribution of B4+DCT-liveness", "chạy model trên 7580 ảnh eval, AUC 0.9777 khớp metrics (≈ B4, freq không giúp)")
gap("*Figure 3.25: Home screen of DeepGuard.*", "Figure 3.25 home screen — ảnh chụp app; ứng viên frontend/dashboard-sample.png")
gap("*Figure 3.26: Deepfake-detection result screen, with the risk score, verdict band, heat map, frequency spectrum, and history.*", "Figure 3.26 deepfake screen — ảnh chụp app")
gap("*Figure 3.27: Liveness-detection screen.*", "Figure 3.27 liveness screen — ảnh chụp app")

# ---------------- 6) ĐỔI TÊN MỤC 1.11 TRÙNG + DRAFT 2 MỤC RỖNG ----------------
fix("5.  ## The Detection Problem and the Generalisation Challenge",
    "5.  ## The eKYC Context and the Operating Point",
    'mục 1.11 trùng tên với 1.10 → đổi thành "The eKYC Context and the Operating Point"')
fix("[1.11. The Detection Problem and the Generalisation Challenge 28](#the-detection-problem-and-the-generalisation-challenge-1)",
    "[1.11. The eKYC Context and the Operating Point 28](#the-ekyc-context-and-the-operating-point)",
    'mục lục: cập nhật tên mục 1.11')

draft_after("###  The role of eKYC against deepfakes",
"""Electronic Know Your Customer, or eKYC, is the step where a bank checks a customer's identity online instead of in person. The customer sends a portrait photo or a short video, and the system compares it with an identity document. This step is the main gate that a deepfake attack tries to pass: if a synthetic face is accepted as real, the attacker can open an account or approve a payment under someone else's name. The detector in this thesis is built for this gate. It does not replace the whole eKYC flow; it adds one layer that scores how likely a submitted face is a forgery, so a risky case can be sent to human review before it is approved.""",
"draft 1.11.1 vai trò eKYC chống deepfake")

draft_after("###  Circular 17/2024/TT-NHNN and the chosen operating point",
"""In Vietnam, Circular 17/2024/TT-NHNN requires banks to verify customers with biometric data when they open or use a payment account. The rule is qualitative: it says that biometric checking must happen, but it does not fix any error rate that a detector must meet. To turn this duty into something measurable, the thesis sets a concrete operating point. Following the international standard ISO/IEC 30107-3, the decision threshold is calibrated so that the false positive rate, the share of real customers wrongly flagged as fake, stays at or below five percent. This five percent is an engineering choice made here, not a number written in the Circular, and it is chosen so that genuine customers are rarely blocked.""",
"draft 1.11.2 Circular 17 + điểm vận hành FPR<=5%")

draft_after("###  The need for explainability",
"""A regulated setting cannot rely on a score alone. A reviewing officer needs to see why the model judged a face as suspicious, and an audit may later ask for the same evidence. For this reason the detector returns a Grad-CAM heat map together with its score. The heat map marks the regions of the face that pushed the decision, such as a blending boundary or an over-smoothed area. This makes each verdict open to human checking, which is what an eKYC deployment needs.""",
"draft 1.11.3 nhu cầu explainability (Grad-CAM)")

draft_after("###  The role of liveness in eKYC",
"""Deepfake detection asks whether a face image is synthetic. Liveness detection asks a different question: whether the face in front of the camera belongs to a real, present person, or to a copy such as a printed photo or a screen. The two checks are complementary. A deepfake detector can be fooled by a high-quality printout that carries no generative artefact, while a liveness check can be fooled by a synthetic face shown live. In the eKYC pipeline of this thesis, the liveness check runs first as a cheap pre-filter: it rejects obvious presentation attacks before the more expensive deepfake stage runs.""",
"draft 1.12.1 vai trò liveness trong eKYC")

draft_after("###  Types of presentation attack",
"""A presentation attack is any attempt to fool the camera with a fake artefact instead of a live face. Three types are common. A print attack shows a photograph of the target on paper. A replay attack shows a photo or a video of the target on a screen. A mask attack uses a physical mask of the face. Print and replay attacks are the cheapest and the most common in remote eKYC, so they are the focus of this thesis; mask attacks usually need extra sensors such as depth or infrared and are left out of scope.""",
"draft 1.12.2 loại tấn công trình diễn (print/replay/mask)")

draft_after("###  Passive and active liveness",
"""Liveness methods fall into two groups. A passive method decides from a single captured image, without asking the user to do anything; it is fast and comfortable but must read subtle cues such as the texture and the frequency traces left when a screen or a print is recaptured. An active method asks the user to perform an action, for example to blink or to turn the head, and checks that the response is natural; it is harder to spoof but slower for the user. The liveness module in this thesis is mainly passive and single-image, so that it stays light and fits in front of the deepfake stage.""",
"draft 1.12.3 passive vs active liveness")

# ---------------- 7) XÓA TEMPLATE TIẾNG VIỆT SÓT CUỐI FILE ----------------
anchor = "**Ghi chú về trình bày mỗi trang của đồ án**"
if text.count(anchor) == 1:
    i = text.find(anchor)
    t = newtag("SỬA")
    text = text[:i] + (f"<!--{t} ĐÃ XÓA khối template tiếng Việt sót lại từ đây tới hết file "
                        f"(Ghi chú trình bày, CONCLUSION/REFERENCES/APPENDIX rỗng, 'Contentkết luận'…). "
                        f"Trong Google Docs bạn cũng nên xóa khối scaffold này.-->\n")
    log.append((t, "sửa", "xóa khối template tiếng Việt sót ở cuối file (sau REFERENCES)"))
else:
    prob.append(("SỬA", "xóa template cuối file", text.count(anchor)))

# ---------------- 8) DỰNG BẢNG TRA + GHÉP ĐẦU FILE ----------------
rows = "\n".join(f"| {m} | {k} | {n} |" for (m, k, n) in log)
header = (
"<!-- ====== BẢNG TRA THAY ĐỔI CỦA CLAUDE — Ctrl+F ký tự 【 để duyệt từng chỗ ====== -->\n"
"# 📋 BẢNG TRA THAY ĐỔI (Claude)\n\n"
"> Mỗi marker 【…】 = 1 chỗ tôi đụng vào. **Ctrl+F ký tự `【`** để nhảy qua từng cái.\n"
"> `【SỬA】` lỗi chắc chắn (sửa trong Google Docs) · `【ẢNH】` tôi chèn ảnh (⚠️VERIFY = kiểm giúp đúng model) ·\n"
"> `【SƠ-ĐỒ】` bọc lại mermaid · `【CẦN-BẠN】` thiếu file/nội dung, bạn cấp hoặc export từ Docs ·\n"
"> `【DRAFT】` đoạn tôi soạn cho mục đang rỗng — đọc lại rồi thêm vào Docs.\n"
"> Ghi chú render/conversion (KHÔNG phải lỗi trong Docs của bạn): công thức toán bị pandoc làm rơi ký hiệu Σ/√;\n"
"> số thứ tự rác kiểu '2. ##' và heading rỗng là rác convert — bản Docs của bạn không sao.\n\n"
f"| Mã | Loại | Nội dung |\n|---|---|---|\n{rows}\n\n"
"---\n\n"
)
text = header + text

with open(MD, "w", encoding="utf-8") as f:
    f.write(text)

# ---------------- BÁO CÁO ----------------
print("=== ÁP XONG ===")
for k, v in cnt.items():
    print(f"  {k}: {v}")
print(f"  Tổng marker: {sum(cnt.values())}")
print(f"=== CÁC PHÉP KHÔNG KHỚP ({len(prob)}) ===")
for p in prob:
    print("  ✗", p)
