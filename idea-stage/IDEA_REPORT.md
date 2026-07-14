# Idea Discovery Report — SFDCT (Novelty Positioning, no-train)

> **THESIS LOCKED** — *SFDCT: Hybrid Spatial–Frequency Learning with Block-wise DCT for Deepfake
> Detection in eKYC*. Tài liệu này **KHÔNG đẻ idea mới**; nó **định vị novelty** cho 5 đóng góp đã
> chốt (ĐG1–ĐG5), dựa **hoàn toàn** vào khảo sát prior-work + cross-model adversarial review trong
> session. KHÔNG train mới.
>
> **Quy ước nguồn:** `[WEB]` = web-verified trong session khảo sát · `[KNOW]` = from-knowledge
> (cutoff 1/2026). Mọi con số AUC dưới đây là **DeepfakeBench frame-AUC, train FF++ (c23) →
> Celeb-DF-v2**, trừ khi ghi rõ khác.
>
> **Số thật của thesis (own-run, no new training):** B4 = **0.7497** · naive SFDCT = **0.7572**
> (Δ = **+0.0075**) · Row1 = **0.7333**. Baseline README DeepfakeBench: B4 = 0.7487 (khớp Δ≈0.001 →
> README là bảng so chuẩn).

---

## Executive Summary

1. **Đóng góp mạnh nhất KHÔNG phải ĐG1 (kiến trúc) mà là gói ĐG3 + ĐG5** — *đánh giá deepfake theo điểm
   vận hành eKYC neo bối cảnh quy định Việt Nam (TT17/2024)* + *bộ test deepfake gương mặt người Việt
   (test-only)*; chỗ giao **VN-face × regulation-anchored operating-point chưa có tiền lệ** `[WEB+KNOW]`.
   ĐG1 (gated cross-attention zero-init, floor ≥ B4) là **đóng góp kỹ thuật phòng thủ được nhưng
   incremental** — bán như *safety property*, KHÔNG bán như SOTA.
2. **Bằng chứng định vị:** trên leaderboard chuẩn DeepfakeBench, SFDCT (0.7572) **chèn giữa SRM (0.7552)
   và SPSL (0.7650)**, vượt B4 (0.7487) và vượt rõ F3Net (0.7352)/RECCE (0.7319) — nhưng **chưa vượt
   SPSL**, và Δ(+0.0075) **nằm trong vùng nhiễu** cross-dataset frame-AUC `[WEB cho số leaderboard;
   KNOW cho phán đoán nhiễu]`. Closest work nguy hiểm nhất cho ĐG1 là **SFCL-HCMF (arXiv 2504.17223)** —
   cùng block-DCT 8×8 YCbCr + B4 + cross-modal attention, chỉ khác **gate của họ init=0.5 (sigmoid),
   của ta init=0 (floor guarantee)**.
3. **Định vị trung thực:** SFDCT là **"defensible engineering với một safety-guarantee có giá trị triển
   khai eKYC + một regulation-aware evaluation framing + một localized VN-face test resource"** — đủ
   vững cho đồ án tốt nghiệp AI-Engineer và tier workshop/IEEE-Access; **KHÔNG đủ đứng riêng ở
   NeurIPS/CVPR main-track nếu chỉ dựa AUC**. Sức nặng nằm ở **gói 5 ĐG hợp lại**, không ở ĐG1 đơn lẻ.

---

## Literature Landscape

### A. Cụm frequency / DCT detector (nền cho ĐG1) — cùng thang DeepfakeBench khi có ghi chú

| Method (năm/venue) | Miền tần số | CDFv2 frame-AUC (FF++) | Cùng thang DFB? | Nguồn |
|---|---|---|---|---|
| **SPSL** (CVPR'21) | Phase spectrum (FFT), shallow net | **0.7650** (DFB chuẩn) / 0.7688 (tác giả) | ✅ DFB | `[WEB]` |
| **SRM** (Luo, CVPR'21) | SRM high-pass noise residual | **0.7552** (DFB chuẩn) | ✅ DFB | `[WEB]` |
| **UCF** | uncommon features | **0.7527** (DFB chuẩn) | ✅ DFB | `[WEB]` |
| **F3-Net** (ECCV'20) | DCT toàn ảnh, 3 dải học được + LFS | **0.7352** (DFB chuẩn) / 0.6517 (tác giả) | ✅ DFB | `[WEB]` |
| **Two-stream HF (Luo)** (CVPR'21) | Multi-scale SRM noise + DCMA | 0.794 (protocol riêng DLIB/256²) | ❌ khác protocol | `[WEB]` |
| **FcaNet** (ICCV'21) | Multi-spectral 2D-DCT channel attn | — (không phải deepfake detector) | — | `[WEB]` |
| **FDFL** (CVPR'21) | Adaptive freq feat + Single-Center Loss | ~0.65–0.67 (CDFv2) | ❌ from-knowledge | idea `[WEB]`; số `[KNOW]` |
| **FreqDebias** (CVPR'25) | FFT amplitude, Fo-Mixup + dual CR | 0.836 (ResNet-34, tác giả) | ❌ khác backbone/miền | `[WEB]` |

> **Cảnh báo thang đo (BẮT BUỘC khi viết):** Chỉ các số "DFB chuẩn" (SPSL 0.7650, SRM 0.7552, UCF 0.7527,
> F3Net 0.7352) **so thẳng** với B4=0.7497 / SFDCT=0.7572. Số "tác giả" (F3Net 0.6517, SPSL 0.7688,
> Luo 0.794, FreqDebias 0.836) dùng protocol/backbone khác → **KHÔNG đặt cạnh 0.7572**. Đặc biệt
> **đừng dùng NeurIPS-paper Table 3** (B4 0.7909, SPSL 0.8150 …) — đó là bảng KHÁC; B4 own-run khớp
> README chứ không khớp paper, dùng paper sẽ khiến SFDCT trông như đáy bảng (sai lệch). `[WEB]`

### B. Cụm fusion spatial–frequency + zero-init gate (nền cho ĐG1)

| Method | Năm | Nhánh tần số | Fusion | Có gate? | Zero-init? |
|---|---|---|---|---|---|
| F3-Net | ECCV'20 | FAD + LFS | two-stream cross-attention | Không | Không |
| SPSL | CVPR'21 | phase (DFT) | concat input | Không | Không |
| M2TR | ICMR'22 | multi-band freq filters | cross-modality transformer block | Không | Không |
| TSFF-Net | PLOS'24 | freq branch + EfficientNet | cross-attention fusion | Không | Không |
| **SFCL-HCMF** | arXiv 04/2025 | **block-DCT 8×8 YCbCr zigzag** + B4 | FAAE + HCMA | **CÓ `σ(γ_S)`** | **KHÔNG** (sigmoid(0)=0.5) |
| ReZero | 2020 | (DL chung) | `x+α·F(x)` scalar gate | — | **α=0** (identity init) |
| LayerScale/CaiT | ICCV'21 | (ViT chung) | `x+diag(λ)·F(x)` per-channel | — | λ≈ε nhỏ |
| **Flamingo** | 2022 | (VLM chung) | gated cross-attn `x+tanh(α)·CrossAttn` | — | **α=0**, init ≡ backbone |
| **SFDCT (thesis, ĐG1)** | 2026 | **block-DCT 8×8, 16 zigzag, YCbCr, log-mag, drop-low** + B4 | **gated cross-attention** | **CÓ scalar gate** | **α=0 (floor ≥ B4)** |

> **Kết luận cụm B `[WEB]`:** *Chưa work deepfake nào dùng zero-init gate để toán-học đảm bảo
> `model(init) ≡ backbone` (floor ≥ B4).* SFCL-HCMF gần nhất về **domain** nhưng init≈0.5×freq (không
> floor). Flamingo gần nhất về **cơ chế** (α=0 gated cross-attn) nhưng domain VLM. ĐG1 = "Flamingo-style
> zero-init gated cross-attention cho modality block-DCT vào B4, áp cho deepfake" — combo này trống.

### C. Cụm cross-dataset / eKYC / regulation / VN-data (nền cho ĐG2–ĐG5)

| Chủ đề | Tiền lệ | Closest prior | Delta của thesis |
|---|---|---|---|
| Protocol FF++→CDFv2 frame-AUC | Chuẩn `[WEB]` | DeepfakeBench (NeurIPS'23) | Thesis *theo* chuẩn (điểm cộng fairness) |
| Heatmap cross-dataset + bảng matrix | **Đã có** `[WEB]` | DeepfakeBench Fig.2 + Table 3 | Không novel — đây là dùng công cụ benchmark |
| Progressive ablation ladder | Chuẩn `[WEB]` | MD-CSDNetwork (RGB→+freq→+fusion) | Không novel — thực hành mặc định |
| TPR@FPR cho deepfake | **Đã có** `[WEB]` | GenD (2508.06248) TPR@FPR=5%/1% | Novel chỉ khi *neo quy định*, không phải metric |
| Low-FPR "AUC che lỗi" insight | **Đã có** `[WEB]` | TalkingHeadBench (TPR@FPR=0.1%) | ĐG3 mất phần insight-novelty này |
| APCER/BPCER/ACER | **Đã có** (PAD/ISO-30107-3) `[WEB]` | iBeta L1/L2, BPCER20@APCER5% | Novel = lần đầu áp lên *forgery* (không PAD) |
| Bootstrap CI trên Δ cross-dataset | **Hiếm** `[WEB/KNOW]` | Bouthillier 2021 (tinh thần) | Rigor/hygiene, không phải method |
| eKYC-framed deepfake | **Đã có** `[WEB]` | eKYC-DF, KoDF-eKYC, VN two-stream | Differentiate ở VN-face + TT17, không ở "eKYC" |
| Ethnicity-specific deepfake set | **Đã có** `[WEB]` | KoDF (Hàn), HAV-DF (Hindi), InDeepFake (Ấn) | Pattern đã có; novel = instance VN |
| VN-face **visual** deepfake set | **KHÔNG có tiền lệ** `[WEB]` | — (VN-Celeb chỉ real, SEA-Spoof là audio) | **Trống — novelty mạnh nhất** |
| TT17/2024 quy định ngưỡng số | **KHÔNG** — toàn văn không có FPR/FAR/threshold `[WEB]` | — | ⚠️ phải sửa cách phát biểu (xem ĐG3) |

### D. Leaderboard CDFv2 (FF++→Celeb-DF-v2, frame-AUC, README DeepfakeBench) — định vị SFDCT 0.7572

| Hạng | Detector | CDFv2 frame-AUC | Ghi chú |
|---|---|---|---|
| 1 | **SPSL** | **0.7650** | tốt nhất nhóm cổ điển |
| 2 | SRM | 0.7552 | frequency residual |
| 3 | UCF | 0.7527 | uncommon features |
| — | **SFDCT (thesis)** | **0.7572** | **chèn giữa SRM và SPSL** |
| 4 | EfficientNet-B4 | 0.7487 | ← baseline thesis |
| 5 | CORE | 0.7428 | |
| 6 | Xception | 0.7365 | |
| 7 | F3Net | 0.7352 | frequency (FAD) |
| 8 | RECCE | 0.7319 | reconstruction |

> **Trần generalization hiện đại `[WEB]`:** LSDA (CVPR'24) CDFv2 = **0.911**; nhóm SBI/self-blended
> 2024–25 ~0.85–0.93. Đây là **tier khác** — khoảng cách tới SFDCT là *hướng mở* (SBI/FSBI route),
> KHÔNG dùng để so trực tiếp. **KHÔNG claim SOTA.**

---

## Novelty Verdict per Contribution

| ĐG | Mức novelty | Closest work | Điểm khác biệt thật (defensible) | Reviewer sẽ tấn công | Cách phòng thủ |
|---|---|---|---|---|---|
| **ĐG1** block-DCT + gated cross-attn zero-init (floor≥B4) + hợp nhất 5 đòn vào 1 miền block-DCT | **INCREMENTAL** (new combination/application, không phải new mechanism) | **SFCL-HCMF** (domain) · **Flamingo/ReZero** (cơ chế) · F3-Net/M2TR/TSFF (fusion) | **(a)[MẠNH]** floor-guarantee toán học `model(init)≡B4` ⇒ không tệ hơn baseline đã calibrate (SFCL-HCMF init≈0.5×freq, KHÔNG floor). **(b)[TB]** hợp nhất 5 đòn 1 miền. **(c)[YẾU]** zero-init cho deepfake "lần đầu" | "+0.0075 trong noise" · "SFCL-HCMF đã làm gần hết, chỉ đổi gate" · "zero-init là trick cũ (ReZero/Flamingo)" · "kitchen-sink 5 đòn không ablation" · "chưa vượt SPSL 0.7650" · "guarantee chỉ tồn tại ở init, không ở nghiệm cuối" | **Bán safety property, KHÔNG bán AUC.** Bootstrap CI + ≥3 seed; ablation tách 5 đòn; 1 đoạn riêng phân biệt `σ(γ_S)`init=0.5 vs α=0 (trích eq.13 SFCL-HCMF); đóng khung "first floor-preserving spatial-freq fusion for face forgery" |
| **ĐG2** khung đa cấu hình (B4→B4-DCT→Row1→Row2) + heatmap cross-dataset | **ĐÃ CÓ / engineering thuần** | **DeepfakeBench Fig.2 (heatmap) + Table 3 (matrix)** · MD-CSDNetwork (ladder) | Rất mỏng: ladder gắn floor-guarantee (B4-DCT≈B4 ở init = *kiểm chứng invariant kiến trúc*, không chỉ "thêm component") | "Không phải contribution, là methodology chuẩn" · "Benchmark của chính bạn đã làm" · "Row1=0.7333 < B4 ⇒ ladder không monotonic" · "4 dòng ≠ framework" | **Gỡ khỏi danh sách 5 ĐG, hạ thành Experimental Protocol** (PA-A khuyến nghị); hoặc merge vào ĐG1 như "khung kiểm chứng floor-guarantee" (PA-B). Cite DeepfakeBench *ngay tại hình*. **Phải show & giải thích Row1<B4** (thiếu gate/band-drop → tụt = chứng minh giá trị thiết kế cuối) |
| **ĐG3** điểm vận hành eKYC (TT17, FPR≤5%) + decompose lỗi (APCER/BPCER/ACER) | **INCREMENTAL** (evaluation framing, không metric mới) | **GenD** (TPR@FPR cho deepfake) · TalkingHeadBench (low-FPR insight) · ISO-30107-3/iBeta (taxonomy) | **(1)** lần đầu áp ISO-30107-3 error taxonomy lên *forgery* (không PAD) tại operating-point. **(2)** lần đầu neo operating-point vào bối cảnh quy định eKYC VN (TT17) | **⚠️[CHÍ MẠNG] "TT17 KHÔNG quy định FPR≤5%"** — toàn văn không có ngưỡng số `[WEB]` · "TPR@FPR đã có (GenD)" · "APCER/BPCER là PAD, lạm dụng thuật ngữ" · "AUC-0.75 @FPR5% cho TPR rất thấp ⇒ tự chứng minh không đạt eKYC" · "frame-level ≠ session+liveness" | **SỬA NGAY:** "TT17 yêu cầu định tính, KHÔNG có ngưỡng số; ta *chọn* FPR≤5% theo quy ước ISO-30107-3 (BPCER20) để *toán-hoá* yêu cầu". Cite GenD/TalkingHeadBench *trước* rồi differentiate. Định nghĩa lại taxonomy cho forgery (APCER≡fake-as-real…). Đóng khung **honest diagnostic** (phơi bày AUC-0.75 chưa đạt eKYC) |
| **ĐG4** cross-dataset trung thực có bootstrap CI (báo Δ-trong-nhiễu) | **INCREMENTAL** (methodological hygiene, không phải method) | DeepfakeBench (point AUC, no CI) · Bouthillier 2021 · Efron 1979 | Dùng CI để **tự phủ định** claim của chính mình (Δ trong nhiễu ⇒ không claim SOTA) — intellectual honesty hiếm; cộng hưởng eKYC deployment risk | "Bootstrap là textbook, không phải contribution" · "Bootstrap trên frame i.i.d. ⇒ CI SAI (quá hẹp)" · "CI không tính training/seed variance" · "1 cặp + 1 CI ≠ framework" | **ĐỪNG đánh số ngang ĐG1/ĐG5; gộp vào ĐG2 như rigor-layer.** **BẮT BUỘC bootstrap cấp-VIDEO** (resample video, B=1000–2000, percentile 95%); khai báo CI chỉ phản ánh test-sampling variance (không seed). Báo CI cho cả B4/SFDCT/SPSL/SRM cùng test |
| **ĐG5** bộ deepfake người Việt cho eKYC (test-only, frame-level) | **INCREMENTAL nhưng hợp lệ** (đóng góp dữ liệu địa phương; artifact MỚI, công thức trí tuệ đã có) | **KoDF** (động cơ) · **eKYC-DF** (domain) · HAV-DF/InDeepFake (meta-pattern) · VN-Celeb (nguồn real) | Giao của 4 thuộc tính: **VN-face × eKYC operating-point × test-only/frame-level × cross-dataset honesty** = "first VN-face deepfake *evaluation* set neo TT17 operating-point" | "KoDF/eKYC-DF đổi quốc kỳ" · "N nhỏ ⇒ anecdotal, CI rộng vô nghĩa" · "không split/baseline ⇒ chưa benchmark-hoá" · "frame-level mâu thuẫn eKYC (video+liveness)" · "ethics/consent landmine (TT17 chính là luật bảo vệ sinh trắc)" | Cite KoDF/HAV-DF/InDeepFake/eKYC-DF **chủ động**; chỉ claim "first VN-face **for eKYC operating-point**" (KHÔNG "first ethnicity/eKYC"). Bán **insight + utility** (số drop trên VN-face, APCER/BPCER@FPR5%). Công bố **datasheet + ≥3 baseline + CI + cảnh báo N-nhỏ**; đoạn **Ethics/Consent/License**; nói rõ liveness/temporal ngoài phạm vi |

---

## Định vị tổng thể & điểm khác biệt

### So với prior work (3 closest đáng sợ nhất)

- **SFCL-HCMF (arXiv 2504.17223, 04/2025)** — *mối đe dọa novelty lớn nhất cho ĐG1*. Cùng block-DCT
  8×8 YCbCr zigzag + EfficientNet-B4 + cross-modal attention fusion (FAAE + HCMA) **có gating** `σ(γ_S)`
  cho face forgery; **chính là cơ sở của `p1/` SFCL-HCMF re-impl trong repo**. Khác biệt sống còn duy
  nhất: gate của họ Sigmoid(0)=0.5 → **không** floor; ĐG1 α=0 → **có** floor. Họ báo FF++→CDFv2 = 74.68%,
  →DFDC = 73.71% (train mới full + global SIDA branch) — **KHÔNG so trực tiếp với 0.7497** vì khác setup
  (cảnh báo cho ĐG4). `[WEB]`
- **GenD (arXiv 2508.06248)** — *mối đe dọa cho ĐG3*. Đã báo TPR@FPR=5%/1% cho deepfake cross-dataset
  (đúng metric, đúng bài toán forgery). ĐG3 chỉ còn delta = *decompose APCER/BPCER/ACER + neo TT17*. `[WEB]`
- **KoDF / eKYC-DF** — *mối đe dọa cho ĐG5*. KoDF (Hàn, 175k clips) có đúng động cơ "Asian
  underrepresented"; eKYC-DF (228k fake, đa sắc tộc, có head-motion liveness) có đúng domain eKYC. ĐG5
  chỉ trống ở giao **VN × TT17-operating-point**. `[WEB]`

### So với đồ án tham khảo của Trí (baseline trong repo)

Đồ án tham khảo (thủ khoa Trí) là điểm neo nội bộ trong `report/`. Định vị khác biệt của SFDCT so với
một đồ án deepfake-baseline điển hình nằm ở **3 trục mà baseline thuần không có**: (i) **floor-preserving
fusion guarantee** (ĐG1, an toàn triển khai) thay vì bolt-on branch không bảo đảm; (ii) **regulation-aware
operating-point eval** (ĐG3, TT17 + ISO-taxonomy) thay vì chỉ báo AUC; (iii) **VN-face test resource**
(ĐG5) thay vì chỉ FF++/CDFv2 chuẩn. `[KNOW — định vị nội bộ, không có số đối chiếu trong session khảo sát]`

### Bức tranh một dòng

SFDCT **không thắng AUC** (SPSL 0.7650 > SFDCT 0.7572; LSDA 0.911 là tier khác) và Δ-trên-B4 nằm trong
nhiễu. Giá trị học thuật **dồn vào gói ĐG3+ĐG5** (regulation-anchored + VN-face — chỗ trống thật) với
**ĐG1 đóng vai cơ chế an toàn phục vụ chúng**, ĐG2/ĐG4 là **rigor/protocol layer**, không phải đóng góp
độc lập.

---

## Hạn chế novelty cần thừa nhận trung thực

1. **Δ = +0.0075 nằm trong vùng nhiễu** cross-dataset frame-AUC — *không* được claim cải thiện AUC nếu
   thiếu bootstrap CI + multi-seed. Đây là đòn chí mạng phổ biến nhất. `[KNOW]`
2. **SFDCT chưa vượt SPSL (0.7650)** trên cùng leaderboard chuẩn hoá — một method tần số CVPR'21 cũ hơn
   vẫn tốt hơn → không claim "block-DCT fusion tốt nhất". `[WEB]`
3. **Row1 = 0.7333 < B4** — ladder ĐG2 **không monotonic**; phải show & giải thích (cấu hình thiếu
   gate/band-drop), không được giấu. `[given]`
4. **ĐG1 = new combination, không phải new mechanism** — zero-init gate là trick đã biết (ReZero 2020,
   Flamingo 2022); floor-guarantee là *tautology của zero-init*, chỉ tồn tại ở init, không ở nghiệm cuối. `[WEB]`
5. **⚠️ TT17/2024 KHÔNG quy định FPR≤5%** — toàn văn không có ngưỡng số nào; con số 5% là *ta tự chọn*
   theo ISO-30107-3/iBeta. Nếu viết "TT17 quy định 5%" → **lỗi factual có thể làm sụp ĐG3**. `[WEB]`
6. **APCER/BPCER/ACER là thuật ngữ PAD** (presentation attack); áp lên forgery phải **định nghĩa lại
   taxonomy**, nếu không là lạm dụng thuật ngữ. `[WEB]`
7. **Bootstrap phải cấp-VIDEO**, không cấp-frame (frame cùng video không độc lập → CI cấp-frame quá hẹp,
   SAI). CI chỉ phản ánh test-sampling variance, KHÔNG phản ánh seed/training variance (vì không train
   mới). `[KNOW]`
8. **ĐG5 N nhỏ + ethics**: test-only quy mô nhỏ → "anecdotal/CI rộng"; tạo deepfake gương mặt người Việt
   thật cần consent/license — đặc biệt vì TT17 là luật **bảo vệ** sinh trắc (mâu thuẫn nếu thiếu Ethics
   statement). `[WEB+KNOW]`
9. **Frame-level vs eKYC thật**: eKYC quyết định ở video/session-level + liveness; báo frame-AUC rồi
   nói "cho eKYC" là khoảng cách metric–claim → đóng khung **lower-bound diagnostic**, không phải chứng
   nhận triển khai. `[WEB]`

---

## Khuyến nghị framing cho luận văn + paper

**Nguyên tắc vàng:** *ĐỪNG bán AUC. BÁN safety-property (ĐG1) + regulation-aware framing (ĐG3) +
localized resource (ĐG5).* Trung thực kiểm chế **làm mạnh** luận văn trước reviewer, không làm yếu.

**Tái cấu trúc 5 ĐG → 3 đóng góp + 2 trụ phương pháp luận (khuyến nghị):**
- **Đóng góp 1 (kiến trúc/an toàn) = ĐG1** — "floor-preserving spatial–frequency fusion".
- **Đóng góp 2 (đánh giá) = ĐG3** — "regulation-aware eKYC operating-point + ISO-taxonomy error decompose on forgery".
- **Đóng góp 3 (tài nguyên) = ĐG5** — "first VN-face deepfake test-only set for eKYC operating-point".
- **Trụ phương pháp luận** (KHÔNG đánh số ngang hàng): **ĐG2** (experimental protocol/ablation theo
  DeepfakeBench) + **ĐG4** (bootstrap CI cấp-video, honest Δ-trong-nhiễu).

**Câu "đóng góp" nên viết (dùng nguyên văn được):**

> **ĐG1:** *"Chúng tôi KHÔNG claim SOTA cross-dataset AUC. Đóng góp là một cơ chế hợp nhất
> spatial–frequency **floor-preserving**: bằng gated cross-attention zero-init (α=0), model tại khởi
> tạo **đồng nhất toán học** với backbone B4 đã tinh chỉnh, đảm bảo **không bao giờ tệ hơn baseline đã
> calibrate** — thuộc tính có giá trị triển khai trực tiếp cho eKYC, nơi ngưỡng vận hành đã được hiệu
> chuẩn trên baseline và không được phép thoái lui. Khác với SFCL-HCMF (gate `σ(γ_S)`, init≈0.5×freq,
> không floor), gate của chúng tôi α=0 cho floor toán học ≥ B4."*

> **ĐG3:** *"Thông tư 17/2024/TT-NHNN yêu cầu xác thực sinh trắc bắt buộc nhưng **không quy định ngưỡng
> định lượng** (đã kiểm chứng toàn văn). Chúng tôi **chọn** operating point FPR≤5% theo quy ước
> ISO/IEC 30107-3 (BPCER20 @ APCER 5%) để **toán-hoá** yêu cầu định tính của TT17. Khác với GenD (báo
> TPR@FPR thuần) và TalkingHeadBench (low-FPR chung), chúng tôi (a) **phân rã** lỗi thành APCER/BPCER/ACER
> + confusion tại điểm vận hành, (b) **neo** điểm vận hành vào bối cảnh quy định eKYC VN, và (c) báo cáo
> đây như **honest diagnostic** — phơi bày khoảng cách giữa AUC tốt-trung-bình (~0.75) và yêu cầu vận hành
> thật, định hướng future work (SBI/FSBI route)."*

> **ĐG5:** *"Theo khảo sát của chúng tôi, đây là bộ deepfake gương mặt người Việt **đầu tiên dành riêng
> cho đánh giá (test-only) tại điểm vận hành eKYC theo bối cảnh TT17/2024**. Chúng tôi KHÔNG xem việc
> tạo dataset theo sắc tộc là mới về nguyên lý — KoDF (Hàn), HAV-DF (Hindi), InDeepFake (Ấn), eKYC-DF
> (đa sắc tộc) đã thiết lập mẫu này; đóng góp là **hiện thực hoá cho ngữ cảnh eKYC Việt Nam** và dùng
> nó như **điểm cross-dataset thứ ba** để báo generalization gap trung thực, kèm datasheet + baseline +
> bootstrap CI + tuyên bố ethics/consent."*

**Câu chữ BẮT BUỘC TRÁNH:**
- ❌ "Thông tư 17/2024 quy định FPR≤5%" (sai factual — sụp ĐG3).
- ❌ "Khung đánh giá đa cấu hình / heatmap là novelty" (DeepfakeBench Fig.2 đã có).
- ❌ "Bộ deepfake người Việt đầu tiên (nói chung)" (KoDF/eKYC-DF hạ ngay).
- ❌ "SFDCT đạt SOTA / vượt SRM/UCF" (Δ trong nhiễu; SPSL vẫn cao hơn).
- ❌ Đặt số NeurIPS-paper Table 3 cạnh 0.7572; giấu Row1<B4; bootstrap cấp-frame.

**5 việc BẮT BUỘC làm trước khi nộp (theo ưu tiên):**
1. **Bootstrap CI cấp-VIDEO** (B=1000–2000, 95% percentile) cho B4/SFDCT (+ SPSL/SRM nếu được); báo
   thẳng Δ=+0.0075 và CI, nói rõ nếu CI cắt 0.
2. **Ablation tách 5 đòn** (B4 → +block-DCT branch → cộng dồn từng đòn); nếu đòn nào dead-weight → bỏ.
3. **Sửa câu TT17** (định tính, không ngưỡng số) ở mọi nơi xuất hiện.
4. **Đoạn riêng phân biệt SFCL-HCMF** (trích eq.13, `σ(γ_S)` init=0.5 vs α=0 floor).
5. **Datasheet + Ethics + baselines cho ĐG5** (identity count, generators, license, consent, indicative-only).

---

## Next step → `/paper-writing` (no train)

Tài liệu này khoá phần **định vị novelty**. Bước kế: chạy `/paper-writing` (hoặc `paper-write`) để dệt
3 đóng góp + 2 trụ phương pháp luận vào chương Related Work / Method / Experiments / Discussion, **giữ
nguyên các số own-run** (B4=0.7497, SFDCT=0.7572, Row1=0.7333) và **mọi cảnh báo trung thực** ở trên,
**KHÔNG train mới**. Bắt buộc kèm bootstrap-CI cấp-video + ablation 5-đòn trước khi viết phần claim.
