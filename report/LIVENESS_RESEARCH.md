# Liveness / Face Anti-Spoofing — hướng dễ & rẻ cho đồ án (research tổng hợp)

> Bối cảnh: phần deepfake (SFDCT = EfficientNet-B4 + nhánh block-DCT 8×8 + gated cross-attention) đã xong. Mục tiêu phụ: thêm module liveness/FAS theo hướng **rẻ – phổ biến – tái dùng tối đa SFDCT**, chạy được trên 1× RTX 3060 / vài GPU-giờ, dataset nhỏ tải thẳng, không cần xin license học thuật nặng. Tài liệu này xếp hạng các lựa chọn đúng theo tiêu chí đó.

## 1. TL;DR — Top 3 cách dễ-phổ biến-nhẹ nhất

| Hạng | Hướng | Vì sao chọn (1 dòng) |
|---|---|---|
| **#1** | **Deep CNN binary** (B4 → softmax live/spoof) làm **baseline "B4"** | Dễ nhất, phổ biến nhất (baseline mặc định mọi paper deep-FAS), tái dùng **nguyên xi** backbone B4; chỉ đổi head 2 lớp. |
| **#2** | **Frequency/DCT branch** (B4 + block-DCT) làm **đề xuất "B4+DCT"** | Tái dùng **trực tiếp** nhánh block-DCT 8×8 + gated cross-attention của SFDCT; có cơ sở vật lý vững (moiré/recapture nổi rõ ở miền tần số) → kể đúng câu chuyện "tần số giúp cả liveness". |
| **#3 (tùy chọn)** | **Domain Generalization** (SSDG/SSAN) lắp lên B4+DCT | Chỉ đổi loss/sampling, **không đổi kiến trúc, không thêm backbone**; cách rẻ nhất tăng cross-dataset thay vì nhảy sang CLIP/ViT (quá nặng cho 3060). |

> Bộ đôi **#1 + #2** cho ngay cặp **baseline B4 vs đề xuất B4+DCT** trên cùng dataset nhỏ → đúng tiêu chí *dễ – phổ biến – ít tài nguyên* và tái dùng tối đa code SFDCT.

## 2. Bức tranh tổng thể: các nhóm phương pháp FAS

> Khung phân loại theo **Yu et al., "Deep Learning for Face Anti-Spoofing: A Survey", IEEE TPAMI 2023** ([arXiv:2106.14948](https://arxiv.org/pdf/2106.14948)). Thang: Thấp / TB / Cao.

| Nhóm | Ý tưởng 1 dòng | Độ dễ | Phổ biến | Tài nguyên | Hợp tái dùng B4+DCT? |
|---|---|---|---|---|---|
| **1. Handcrafted texture** (LBP/color HSV-YCbCr/HOG/BSIF) | Vân bề mặt thủ công + SVM | Thấp | TB | Thấp | Một phần (chỉ baseline cổ điển, không dùng B4) |
| **2. Frequency/spectral** (FFT/DCT, moiré) | Bắt đỉnh moiré/artifact recapture ở miền tần số | Thấp–TB | TB | Thấp | **Rất hợp** — trùng đúng giả thuyết DCT của SFDCT |
| **3. Motion/liveness cues** (blink, optical flow, challenge) | Phát hiện chuyển động sinh học/đáp lệnh | TB | TB–Cao | TB | Không (cần temporal, không single-frame) |
| **4. Deep CNN binary** (ResNet/MobileNet/**EffNet**) | Backbone → softmax live/spoof | Thấp | **Cao (nhất)** | Thấp–TB | **Rất hợp** — tái dùng nguyên backbone B4 |
| **5. Auxiliary supervision** (depth, CDCN, DC-CDN) | Hồi quy depth/reflection map thay nhãn nhị phân | TB–Cao | Cao | TB | Hợp (CDC bolt-on) nhưng vướng tạo depth GT |
| **6. rPPG/pulse** | Đo nhịp tim từ xa qua dao động màu da | Cao | Thấp–TB | Cao | Không (cần video, ngách 3D-mask) |
| **7. Transformer/CLIP/VLM** (FLIP) | ViT/CLIP + language guidance, cross-domain | Cao | Cao (hot 2023–25) | Cao | Không (đổi backbone, GPU lớn) |
| **8. Domain generalization** (SSDG/SSAN/IADG) | Loss/sampling chống domain-shift, lắp lên backbone bất kỳ | TB–Cao | Cao | TB | Hợp như add-on, cần ≥3 dataset nguồn |

**Đọc nhanh:** với ràng buộc 1 GPU + dataset nhỏ + tái dùng SFDCT, chỉ có **nhóm 4 (baseline)** và **nhóm 2 (đề xuất)** là lựa chọn cốt lõi; **nhóm 8** là add-on tùy chọn. Né **nhóm 6, 7** và mọi thứ multi-modal/diffusion (overkill — xem mục 5).

## 3. Dataset nên dùng (rẻ, tải thẳng, không license)

> Quy ước: **tải thẳng** = không cần email xin phép/EULA; **xin phép** = phải ký Dataset Release Agreement và thường chỉ nhận email học thuật (không gmail).

### 3.1. TOP pick — RGB ảnh tĩnh, nhẹ, tải thẳng (ƯU TIÊN)

| Tên | Quy mô | Dung lượng | Tấn công | License | Link |
|---|---|---|---|---|---|
| **CelebA-Spoof (crop, HuggingFace)** `nguyenkhoa/celeba-spoof-for-face-antispoofing-test` | **67,170 ảnh** mặt crop, nhãn live/spoof | **4.95 GB** (Parquet, đã kiểm chứng) | photo/poster/A4/PC/pad/phone/mask… | **Tải thẳng HF**, không EULA | [huggingface.co/datasets/nguyenkhoa/...](https://huggingface.co/datasets/nguyenkhoa/celeba-spoof-for-face-antispoofing-test) |
| **LCC-FASD** | ~18,000 ảnh (1,942 real / 16,885 fake) | nhỏ (~vài trăm MB–1 GB, [chưa kiểm chứng số GB]) | print + replay | **Tải thẳng Kaggle** | [kaggle.com/.../lcc-fasd](https://www.kaggle.com/datasets/faber24/lcc-fasd) |
| **CelebA-Spoof (gốc đầy đủ)** | 625,537 ảnh / 10,177 subject, 10 loại spoof | lớn (~chục GB, [con số "~80GB" chưa kiểm chứng]) | photo/poster/A4/mask/PC/pad/phone/3D | **Tải thẳng GDrive/Baidu**, non-commercial research | [github.com/ZhangYuanhan-AI/CelebA-Spoof](https://github.com/ZhangYuanhan-AI/CelebA-Spoof) ([arXiv:2007.12342](https://arxiv.org/abs/2007.12342)) |
| **ROSE-Youtu** | 25 subject, 4,225 video, có paper-mask | **5.45 GB** (đã kiểm chứng) | print, replay, paper mask | Academic, **đăng ký tài khoản ROSE Lab NTU** (free, ranh giới tải-thẳng/xin-phép) | [rose1.ntu.edu.sg/...](https://rose1.ntu.edu.sg/dataset/faceLivenessDetection) |
| **NUAA Imposter (mirror Kaggle)** | ~12,614 ảnh xám | nhỏ | print | Mirror tải thẳng Kaggle | Kaggle `aleksandrpikul222/nuaaaa` (gốc parnec.nuaa.edu.cn hay sập) |

### 3.2. TOP pick & cấu hình khuyến nghị

1. **CelebA-Spoof (crop HF, 4.95 GB)** → **bộ chính** để train. Tải thẳng `datasets.load_dataset(...)`, ảnh RGB crop sẵn → khớp 100% input pipeline B4+DCT, chạy gọn trên 3060. License gốc *non-commercial research* (hợp ĐATN).
2. **LCC-FASD (~18k ảnh)** → **bộ cross-test**: train CelebA-Spoof → test LCC-FASD, chứng minh tần số (DCT) generalize — đúng mô-típ cross-dataset của phần deepfake.
3. **ROSE-Youtu** hoặc **subset ~30–50k ảnh từ CelebA-Spoof gốc** → bộ thứ ba (nếu muốn thêm). Nếu né tuyệt đối việc đăng ký, dùng subset CelebA-Spoof gốc.

### 3.3. ⚠️ Cảnh báo bộ KẸT LICENSE (tránh để khỏi chờ duyệt)

**OULU-NPU, SiW, SiW-M, CASIA-FASD, MSU-MFSD, Idiap Replay-Attack, CASIA-SURF(+CeFA), WMCA** — đều cần **ký DRA/EULA + email học thuật**. Thêm:
- **CASIA-SURF / CeFA / WMCA** là **multi-modal (RGB+Depth+IR)** → không hợp eKYC chỉ-RGB và rất nặng.
- **Idiap Replay-Attack bản Zenodo raw = 2.9 TB** (đã kiểm chứng) — tránh.
- Các bộ "AxonData/TrainingDataPro" trên HF/Kaggle: phần preview free quá nhỏ, **full là commercial paywall** — chỉ là mẫu chào hàng, không đủ train.

> Nếu cần con số "chuẩn cộng đồng" để so trong báo cáo (vd trên OULU-NPU), **trích dẫn kết quả published** thay vì tự tải.

## 4. Vì sao TẦN SỐ hợp với liveness — bằng chứng paper, nối với block-DCT của SFDCT

**Luận điểm:** artifact của **replay (màn hình)** và **print** hiện rõ ở **miền tần số** — đặc biệt **moiré pattern** từ recapture màn hình thành **đỉnh/spur trong FFT/DCT** mà miền không gian khó thấy. Đây là analog của luận điểm deepfake (artifact GAN/upsampling ở mid/high-band) → nhánh block-DCT 8×8 của SFDCT có **cơ sở vật lý** để giúp cả FAS.

**Bằng chứng cốt lõi (moiré/recapture → replay):**
- **Patel, Han & Jain — "Live Face Video vs. Spoof Face Video: Use of Moiré Patterns to Detect Replay Video Attacks", ICB 2015.** Lưới pixel màn hình chồng lưới sensor → moiré hiện thành spur low-freq + peak high-freq; live không có. *Hạn chế quan trọng:* moiré gần như **chỉ ở replay**, hiếm ở print (print có halftone/printing-noise khác). [IEEE Xplore 7139082](https://ieeexplore.ieee.org/document/7139082/), [tech report MSU](http://biometrics.cse.msu.edu/Publications/Face/PatelHanJain_SpoofDetection_MSUTechRepMSU-CSE-15-15.pdf).
- **Garcia & de Queiroz — "Face-Spoofing 2D-Detection Based on Moiré-Pattern Analysis", IEEE TIFS ~2015.** Peak detection trong miền tần số. (HTER/ACER cụ thể [chưa kiểm chứng].)

**Bằng chứng Fourier/phổ live-vs-spoof (cổ điển):**
- **Li, Wang, Tan & Jain — "Live Face Detection Based on the Analysis of Fourier Spectra", SPIE 2004** — bề mặt 2D (in/màn hình) vs 3D (mặt thật) cho phân bố tần số khác; ảnh giả mất chi tiết high-freq.
- **Jourabloo et al. — "Face De-Spoofing: Anti-Spoofing via Noise Modeling", ECCV 2018** ([arXiv:1807.09968](https://arxiv.org/pdf/1807.09968)) — **low-freq ~ color distortion/replay; high-freq rõ hơn ở print** → band tần số khác nhau ↔ loại tấn công khác nhau.

**Dual-stream spatial+frequency (GẦN SFDCT nhất về kiến trúc):**
- **Lu et al. — "Bandpass Filter Based Dual-Stream Network for Face Anti-Spoofing", CVPRW 2023** ([CVF PDF](https://openaccess.thecvf.com/content/CVPR2023W/FAS/papers/Lu_Bandpass_Filter_Based_Dual-Stream_Network_for_Face_Anti-Spoofing_CVPRW_2023_paper.pdf)) — 1 nhánh spatial + 1 nhánh frequency (bandpass FFT/IFFT). **Precedent rất gần "spatial+frequency dual-stream FAS".** (HTER/ACER [chưa kiểm chứng].)
- **Fang et al. — "Learnable Multi-level Frequency Decomposition and Hierarchical Attention for Generalized Face PAD", WACV 2022** ([arXiv:2109.07950](https://arxiv.org/abs/2109.07950)) — stream RGB + stream với **4 bộ lọc tần số học được**; tốt lên ở cross-dataset → bằng chứng "nhánh tần số học-được giúp generalization".
- **Roy et al. — "Bi-FPNFAS: ... Leveraging Fourier Spectra", Sensors 2021, 21(8):2799** ([PMC8071535](https://pmc.ncbi.nlm.nih.gov/articles/PMC8071535/)) — **EfficientNet/EfficientDet (BiFPN) + phổ Fourier**, báo cáo **ACER ~2.92% trên OULU-NPU Protocol-IV**. Tham chiếu gần nhất với "EfficientNet + tần số cho FAS".

**DCT block trực tiếp:**
- **Zhang W. & Xiang S. — "Face anti-spoofing detection based on DWT-LBP-DCT features", Signal Processing: Image Communication, vol.89, 2020** ([ScienceDirect](https://www.sciencedirect.com/science/article/abs/pii/S0923596520301533)) — phân rã **block 8×8 + DCT**, thử trên Replay-Attack & CASIA-FASD. Nhưng **hand-crafted + SVM** (không deep, không attention) → SFDCT mới hơn rõ về kiến trúc.
- **Yu et al. — CDCN, CVPR 2020** ([arXiv:2003.04092](https://arxiv.org/abs/2003.04092)) — central-diff conv khuếch đại high-freq edge; tác giả nêu rõ **"high-freq edge có lợi bắt moiré; low-freq nhạy color distortion"**; đạt **ACER 0.2% (OULU P1)**, **HTER 6.5% (CASIA→Replay)** — bằng chứng deep mạnh rằng tín hiệu high-freq = manh mối spoof.

**Novelty / prior art cần cite:** gần nhất là **Bi-FPNFAS (EffNet+Fourier)** và **Bandpass-Dual-Stream (CVPRW'23)**. Điểm khác của SFDCT: **block-wise DCT 8×8** (không phải FFT toàn ảnh) + **gated cross-attention fusion** + **chia sẻ backbone B4 deepfake↔liveness**. Chưa thấy paper kết hợp đúng combo này dùng chung cho cả deepfake và liveness — chỗ đặt đóng góp, nhưng **nên chạy novelty-check trước khi tuyên bố "first"** ([một phần chưa kiểm chứng]).

## 5. Khuyến nghị CHO ĐỒ ÁN NÀY — lineup baseline vs đề xuất

**Lineup chính (bắt buộc):**
- **Baseline = B4** (EfficientNet-B4 spatial-only → head 2 lớp live/spoof, fine-tune từ ImageNet/từ checkpoint deepfake).
- **Đề xuất = B4 + block-DCT** (tái dùng **nguyên** nhánh block-DCT 8×8 + gated cross-attention của SFDCT).
- So trên cùng dataset (**CelebA-Spoof crop**) + cross-test (**LCC-FASD**), cùng metric → chứng minh nhánh tần số giúp cả liveness.

**Khung code tham chiếu nhẹ (đã kiểm chứng có repo + pretrained):**

| Repo | Backbone | Dataset | Kết quả tham chiếu |
|---|---|---|---|
| [kprokofi/light-weight-face-anti-spoofing](https://github.com/kprokofi/light-weight-face-anti-spoofing) | MobileNetV2/V3 | CelebA-Spoof, LCC-FASD, CeFA | MN3_large/CelebA-Spoof: **AUC 0.998, EER 2.26%, 3.02M params, 0.15 GFLOPs** |
| [hairymax/Face-AntiSpoofing](https://github.com/hairymax/Face-AntiSpoofing) | MiniFASNet + nhánh Fourier | CelebA-Spoof | acc 92.92%, AUC-ROC 0.987 |
| [minivision-ai/Silent-Face-Anti-Spoofing](https://github.com/minivision-ai/Silent-Face-Anti-Spoofing) | MiniFASNetV1/V2 + nhánh FFT (MultiFTNet), 0.41–0.44M params | data riêng | rất nhẹ, chạy cả CPU/edge |

> Cách dùng: **không** dùng nguyên repo; **viết wrapper** thay backbone bằng SFDCT (B4 / B4+DCT), train binary trên CelebA-Spoof. Lưu ý `hairymax` và `Silent-Face` đã có sẵn nhánh Fourier/FFT phụ → tham khảo cách họ ghép frequency-branch.

**Hướng hiện đại nhẹ (TÙY CHỌN, chỉ khi còn ngân sách):**
1. **Domain Generalization single-modal — SSDG (baseline) / SSAN / IADG (mốc mạnh).** Lắp **loss/sampling** lên B4+DCT, **không đổi kiến trúc**. Cho phép báo cáo cross-dataset leave-one-out đúng tinh thần DeepfakeBench. Cần ≥3 dataset nguồn (chi phí dữ liệu). Code: [SSDG](https://github.com/taylover-pei/SSDG-CVPR2020) (CVPR'20, [arXiv:2004.14043](https://arxiv.org/abs/2004.14043)), [SSAN](https://github.com/wangzhuo2019/SSAN) (CVPR'22, [arXiv:2203.05340](https://arxiv.org/abs/2203.05340)), [IADG](https://github.com/qianyuzqy/IADG) (CVPR'23, [arXiv:2304.05640](https://arxiv.org/abs/2304.05640)).
2. **Adapter-ViT (S-Adapter/ViTAF)** hoặc **FLIP** — chỉ làm "điểm so sánh transformer hiện đại", **không bắt buộc**. FLIP cần RTX 3060 12GB batch nhỏ; RTX 3050 4GB thì **không chạy được**.

**⛔ OVERKILL — né hẳn:** mọi thứ **multi-modal (RGB+Depth+IR)** (FM-ViT/FM-CLIP, CASIA-SURF/WMCA) và **diffusion-generation** (DiffFAS) — vượt ngân sách 1 GPU/vài GPU-giờ, đòi dữ liệu đa-modal/license.

## 6. Metric & protocol tối thiểu

Quy ước nhãn: **spoof/attack = positive** (ISO/IEC 30107-3).

| Metric | Công thức | Dùng khi |
|---|---|---|
| **APCER** | FP/(TN+FP), lấy **worst-case max trên các PAI** | spoof bị nhận nhầm thành thật (nguy hiểm) |
| **BPCER** | FN/(TP+FN) | người thật bị từ chối |
| **ACER** | (APCER+BPCER)/2 | hiệu năng tổng thể intra-dataset @1 threshold |
| **HTER** | (FAR+FRR)/2 | **cross-dataset** (≡ ACER khi positive=spoof) |
| **EER** | lỗi tại threshold FAR=FRR | cân bằng tốt = thấp |
| **AUC** | diện tích dưới ROC, **threshold-independent** | so baseline vs đề xuất trực tiếp |

**Bộ tối thiểu cho đồ án (đủ để bảo vệ):**
1. **AUC** — chỉ số chính, threshold-independent (giống cách đang report cho deepfake).
2. **ACER (= ½(APCER+BPCER)) @ threshold EER trên dev set** — báo cáo kèm APCER & BPCER tách riêng.
3. **HTER (cross-dataset, threshold@EER cố định từ dev)** — chứng minh generalization.

**Quy ước báo cáo (quan trọng):** threshold **KHÔNG** chọn trên test set — chọn τ tại **EER trên dev/validation**, rồi **cố định** để tính HTER/ACER trên test. AUC/EER báo cáo độc lập threshold.

**Protocol:**
- **Intra-dataset:** train + test trên cùng bộ (CelebA-Spoof). Báo cáo AUC/ACER/EER.
- **Cross-dataset:** train CelebA-Spoof → test LCC-FASD (báo cáo HTER) — đủ cho phạm vi đồ án rẻ.
- (Nếu mở rộng, tham khảo chuẩn cộng đồng) **OULU-NPU P1–P4** (illumination / PAI / camera / kết hợp — APCER/BPCER/ACER) và **leave-one-out 4 domain OCIM** (OULU/CASIA/Replay/MSU → train 3 test 1) — nhưng các bộ này **kẹt license**, chỉ nên **trích dẫn protocol**, không bắt buộc thực nghiệm.
- Cho eKYC: thêm **BPCER @ APCER≤5%** để gắn ngưỡng FPR≤5% (Thông tư 17/2024/TT-NHNN).

> Lưu ý: tên **"MICC"** trong protocol cross-dataset **không tra được** [chưa kiểm chứng] — nhiều khả năng nhầm với **MSU-MFSD** hoặc tổ hợp 4-domain **OCIM**.

## 7. Hạn chế trung thực

- **Print attack ít hợp DCT/moiré:** moiré gần như chỉ xuất hiện ở **replay (màn hình)**; print (giấy) cho artifact halftone/printing-noise khác → nhánh tần số có thể **giúp replay nhiều hơn print** (Patel 2015, Jourabloo 2018). Nên báo cáo tách theo loại attack nếu dataset cho phép.
- **Nhạy nén ảnh:** tín hiệu moiré/tần số dễ bị nén JPEG làm mờ (Garcia & Queiroz nêu rõ). CelebA-Spoof có ảnh nén → cần kiểm robustness.
- **1 dataset là nông:** chỉ train/test CelebA-Spoof dễ overfit dấu hiệu phụ (background, màu da). Cần ít nhất 1 cross-test (LCC-FASD) để claim generalization.
- **Số HTER/ACER của một số prior art [chưa kiểm chứng]:** Bandpass-Dual-Stream (CVPRW'23), DWT-LBP-DCT (2020), Garcia&Queiroz, Fang WACV'22 — chưa trích xuất chính xác từ abstract/PDF; **mở full-text trước khi đưa số vào báo cáo**. Số đã xác nhận: CDCN ACER 0.2%/HTER 6.5%, Bi-FPNFAS ACER ~2.92% (OULU P-IV), kprokofi MN3 AUC 0.998/EER 2.26%.
- **Dung lượng dataset [chưa kiểm chứng]:** số GB của NUAA, LCC-FASD, CelebA-Spoof gốc ("~80GB") không tra được số cứng. Đã xác nhận: CelebA-Spoof-crop HF 4.95 GB, ROSE-Youtu 5.45 GB, Replay-Attack Zenodo raw 2.9 TB.
- **Novelty chưa chốt:** prior art gần (Bi-FPNFAS, Bandpass-Dual-Stream) tồn tại → **không tuyên bố "first" trước khi chạy novelty-check**.

## 8. Tài liệu tham khảo

**Survey & khung:**
- Yu et al., "Deep Learning for Face Anti-Spoofing: A Survey", IEEE TPAMI 2023 — [arXiv:2106.14948](https://arxiv.org/pdf/2106.14948)

**Tần số/DCT/moiré (củng cố nhánh DCT):**
- Patel, Han & Jain, "Live Face Video vs. Spoof Face Video: Moiré Patterns...", ICB 2015 — [IEEE 7139082](https://ieeexplore.ieee.org/document/7139082/)
- Li, Wang, Tan & Jain, "Live Face Detection Based on the Analysis of Fourier Spectra", SPIE 2004
- Jourabloo et al., "Face De-Spoofing: Anti-Spoofing via Noise Modeling", ECCV 2018 — [arXiv:1807.09968](https://arxiv.org/pdf/1807.09968)
- Lu et al., "Bandpass Filter Based Dual-Stream Network for FAS", CVPRW 2023 — [CVF PDF](https://openaccess.thecvf.com/content/CVPR2023W/FAS/papers/Lu_Bandpass_Filter_Based_Dual-Stream_Network_for_Face_Anti-Spoofing_CVPRW_2023_paper.pdf)
- Fang et al., "Learnable Multi-level Frequency Decomposition... for Generalized Face PAD", WACV 2022 — [arXiv:2109.07950](https://arxiv.org/abs/2109.07950)
- Roy et al., "Bi-FPNFAS: ...Leveraging Fourier Spectra", Sensors 2021 — [PMC8071535](https://pmc.ncbi.nlm.nih.gov/articles/PMC8071535/)
- Zhang W. & Xiang S., "Face anti-spoofing detection based on DWT-LBP-DCT features", Signal Processing: Image Comm. 2020 — [ScienceDirect](https://www.sciencedirect.com/science/article/abs/pii/S0923596520301533)
- Yu et al., "Searching Central Difference Convolutional Networks for FAS" (CDCN), CVPR 2020 — [arXiv:2003.04092](https://arxiv.org/abs/2003.04092) · [code](https://github.com/ZitongYu/CDCN)

**Datasets (tải thẳng):**
- CelebA-Spoof — [github.com/ZhangYuanhan-AI/CelebA-Spoof](https://github.com/ZhangYuanhan-AI/CelebA-Spoof) · [arXiv:2007.12342](https://arxiv.org/abs/2007.12342) · bản crop HF: [huggingface.co/datasets/nguyenkhoa/...](https://huggingface.co/datasets/nguyenkhoa/celeba-spoof-for-face-antispoofing-test)
- LCC-FASD — [kaggle.com/datasets/faber24/lcc-fasd](https://www.kaggle.com/datasets/faber24/lcc-fasd)
- ROSE-Youtu — [rose1.ntu.edu.sg/dataset/faceLivenessDetection](https://rose1.ntu.edu.sg/dataset/faceLivenessDetection)

**Repo code nhẹ (khung tham chiếu):**
- [kprokofi/light-weight-face-anti-spoofing](https://github.com/kprokofi/light-weight-face-anti-spoofing)
- [hairymax/Face-AntiSpoofing](https://github.com/hairymax/Face-AntiSpoofing)
- [minivision-ai/Silent-Face-Anti-Spoofing](https://github.com/minivision-ai/Silent-Face-Anti-Spoofing)

**Domain Generalization (add-on tùy chọn):**
- Jia et al., SSDG, CVPR 2020 — [arXiv:2004.14043](https://arxiv.org/abs/2004.14043) · [code](https://github.com/taylover-pei/SSDG-CVPR2020)
- Wang et al., SSAN, CVPR 2022 — [arXiv:2203.05340](https://arxiv.org/abs/2203.05340) · [code](https://github.com/wangzhuo2019/SSAN)
- Zhou et al., IADG, CVPR 2023 — [arXiv:2304.05640](https://arxiv.org/abs/2304.05640) · [code](https://github.com/qianyuzqy/IADG)

**Transformer/CLIP (overkill — chỉ tham khảo):**
- Srivatsan et al., FLIP, ICCV 2023 — [arXiv:2309.16649](https://arxiv.org/abs/2309.16649) · [code](https://github.com/koushiksrivats/FLIP)
- Huang et al., ViTAF, ECCV 2022 — [arXiv:2203.12175](https://arxiv.org/abs/2203.12175)
- Cai et al., S-Adapter, TIFS 2024 — [arXiv:2309.04038](https://arxiv.org/abs/2309.04038)

**Standard metric:**
- ISO/IEC 30107-3 (APCER/BPCER/ACER); Bhattacharjee et al., "Deep Pixel-wise Binary Supervision" — [arXiv:1907.04047](https://arxiv.org/pdf/1907.04047)

**[chưa kiểm chứng] (nghi ngờ / chưa tra được con số):** Garcia & de Queiroz "Moiré-Pattern Analysis" TIFS ~2015 (HTER/ACER); con số HTER/ACER của Bandpass-Dual-Stream, DWT-LBP-DCT, Fang WACV'22; protocol "MICC"; dung lượng GB của NUAA/LCC-FASD/CelebA-Spoof gốc; repo công khai của DiffFAS, S-Adapter, MFAE/TIFS'24.

## Bước tiếp theo đề xuất

- **Tải bộ chính + viết DataLoader:** lấy **CelebA-Spoof crop (HF, 4.95 GB)** qua `datasets.load_dataset(...)` + **LCC-FASD (Kaggle)** cho cross-test; viết loader trả ảnh RGB crop khớp đúng input của pipeline SFDCT hiện có.
- **Tái dùng SFDCT làm 2 nhánh thí nghiệm:** thêm head binary live/spoof; chạy **B4 (baseline, spatial-only)** vs **B4+block-DCT (đề xuất, bật nguyên nhánh DCT 8×8 + gated cross-attention)** — tối đa hóa reuse code deepfake, chỉ đổi head + nhãn.
- **Smoke-test trước khi train thật** (theo rule): shape → dry-run → overfit-1-batch trên RTX 3050/3060, rồi train full trên 3060 (vài GPU-giờ); report **AUC + ACER (APCER/BPCER) + HTER**, threshold@EER cố định từ dev.
- **Chạy `/novelty-check`** đối chiếu **Bi-FPNFAS** và **Bandpass-Dual-Stream (CVPRW'23)** trước khi viết related work, để đặt đúng đóng góp ("block-DCT 8×8 + gated fusion + backbone dùng chung deepfake↔liveness") thay vì tuyên bố "first".
