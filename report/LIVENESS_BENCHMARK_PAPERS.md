# Paper liveness trên NUAA & LCC-FASD — bảng so sánh & độ khớp với SFDCT

## 1. TL;DR

NUAA (print-attack 2D, 2010) và LCC-FASD (replay in-the-wild, 2019) là hai bộ FAS nhỏ, nhưng **rất khác nhau về độ khó**: NUAA đã **bão hoà** (nhiều method intra-dataset chạm 98–100% Accuracy, có CNN đạt đúng 100%), còn LCC-FASD **khó hơn nhiều** (CNN nhẹ tốt nhất mới đạt ACER ~16%, AUC ~0.92 ở chế độ cross-domain). Hệ quả cho đồ án: số cao trên NUAA là **kỳ vọng đúng nhưng không phải đóng góp**; muốn chứng minh nhánh block-DCT có giá trị thật thì phải báo cáo trên LCC-FASD (hoặc cross-test) bằng **ACER/HTER/EER** và so trực tiếp với baseline B4, chứ không khoe accuracy NUAA.

## 2. Bảng paper trên NUAA

Metric chủ đạo: **Accuracy (%)** theo protocol train/test cố định của Tan et al.; một số dùng EER.

| Paper | Phương pháp | Metric (loại + giá trị) | Verify | Link |
|---|---|---|---|---|
| Tan, Li, Liu, Jiang, 2010, **ECCV** (paper gốc dataset) | DoG + Sparse Low-Rank Bilinear / Sparse Logistic Regression (handcrafted) | Acc ~**94.5%** (DoG-SL); biến thể thấp hơn | ✅ verified | [Springer](https://link.springer.com/chapter/10.1007/978-3-642-15567-3_37) · [trang dataset](https://parnec.nuaa.edu.cn/_upload/tpl/02/db/731/template731/pages/xtan/NUAAImposterDB_download.html) |
| Koshy & Mahmood, 2019, **Entropy** ("Optimizing Deep CNN Architectures for Face Liveness Detection") | Inception-v4 + nonlinear (anisotropic) diffusion | Acc = **100%** (NUAA) | ✅ verified | [MDPI](https://www.mdpi.com/1099-4300/21/4/423) · [PMC7514912](https://pmc.ncbi.nlm.nih.gov/articles/PMC7514912/) |
| (bảng so sánh trong Koshy & Mahmood 2019) | ELBP / MLBP / LSP / "prior CNN" | Acc = **95.1% / 98% / 98.5% / 99%** | ✅ verified (bảng) | nt |
| Khairnar, Gite, Pradhan, Thepade, Alamri, 2025, **CMES** ("Optimizing CNN Architectures for Face Liveness Detection") | DenseNet201 / MobileNetV2 / VGG16 / ResNet50 (intra NUAA) | Acc = **98.5% / 97.8% / 96.2% / 83.5%** | ✅ verified | [techscience.com](https://www.techscience.com/CMES/v143n3/62801/html) |
| Yang, Lei, Liao, Li, 2013, **ICB** | Component-Dependent Descriptor (LBP+HOG theo vùng) | Báo cáo "best" trên NUAA; **số chính xác chưa đọc được từ PDF** | ⚠️ [chưa kiểm chứng số] | [PDF CBSR](http://www.cbsr.ia.ac.cn/users/zlei/papers/ICB2013/YANG-ICB13.pdf) · [IEEE](https://ieeexplore.ieee.org/document/6612955/) |
| Hashemifard & Akbari, 2021, **arXiv** ("A Compact Deep Learning Model for Face Spoofing Detection") | CNN nén, fuse wide+deep + frequency/temporal; **cross-dataset → NUAA** | EER ~**22–27%** (train SiW/ROSE → test NUAA) | ⚠️ paper ✅, **số EER chưa xác nhận từ bản full** | [arXiv 2101.04756](https://arxiv.org/abs/2101.04756) |
| Yang, Lei, Li, 2014, **arXiv** ("Learn CNN for Face Anti-Spoofing") | CNN học feature (AlexNet-style) | Bảng chính là CASIA/Replay; **không có số NUAA cụ thể** | ⚠️ paper ✅, không có metric NUAA | [arXiv 1408.5601](https://arxiv.org/abs/1408.5601) |
| Shinde/Khairnar et al., 2025, **ETASR** ("Enhancing Face Liveness Detection: Novel Deep CNN Architectures") | Deep CNN mới (NUAA + 3D-MAD) | Báo 99.87% cho 1 setting; **số riêng NUAA không rõ trong abstract** | ⚠️ [chưa kiểm chứng số NUAA] | [ETASR 12431](https://etasr.com/index.php/ETASR/article/view/12431) |
| (ICICEL 2022, MobileNet+SVM) | MobileNetV2 + SVM | Acc ~**99.72%** | ⚠️ [chưa kiểm chứng] — PDF không tải được, tác giả/venue chưa xác nhận | [icicel.org PDF](http://www.icicel.org/ell/contents/2022/7/el-16-07-11.pdf) |

> Mốc an toàn để dùng làm tham chiếu: **Tan 2010 ~94.5%** (sàn handcrafted), bảng **Koshy & Mahmood 2019** (95–100%), và **CMES 2025** (CNN transfer-learning 97–98.5%, ResNet50 tụt còn 83.5%).

## 3. Bảng nguồn trên LCC-FASD

Ít paper peer-reviewed báo cáo trực tiếp; nguồn đáng tin & tái lập nhất là **repo kprokofi** (gắn với OpenVINO Training Extensions). Metric chủ đạo: ISO **APCER/BPCER/ACER + AUC/EER**.

| Nguồn | Model | Metric (LCC-FASD) | Verify | Link |
|---|---|---|---|---|
| Timoshenko, Simonchik, Shutov, Zhelezneva, Grishkin, 2019, **CSIT/IEEE** (paper gốc dataset) | — (giới thiệu dataset: 1.942 real + 16.885 fake) | — (không phải bảng benchmark để trích) | ✅ verified | [IEEE 8895208](https://ieeexplore.ieee.org/abstract/document/8895208/) · [PDF csit.am](https://csit.am/2019/proceedings/PRIP/PRIP3.pdf) |
| Repo **kprokofi/light-weight-face-anti-spoofing** (K. Prokofiev; README, không phải paper) | **MobileNetV3-large** | AUC **0.921** · EER **16.13%** · APCER 17.26% · BPCER 15.4% · **ACER 16.33%** | ✅ verified (số khớp đúng) | [README](https://github.com/kprokofi/light-weight-face-anti-spoofing/blob/master/README.md) |
| (cùng repo) | MN3_large_0.75 / small / small_0.75 | ACER **20.26% / 19.69% / 21.04%**; AUC ~0.879–0.892; EER ~18.7–21.1% | ✅ verified | nt |
| (cùng repo) | AENET (baseline từ CelebA-Spoof) | AUC 0.868 · EER 20.91% · **ACER 22.61%** | ✅ verified | nt |
| Repo **dtruong46me/face-anti-spoofing** (đồ án môn IT4343E Computer Vision, HUST) | **FeatherNet** | APCER 0.1994 · NPCER 0.1284 · **ACER 0.1639** (tốt nhất) | ✅ verified | [repo](https://github.com/dtruong46me/face-anti-spoofing) |
| (cùng repo) | MobileNetV3 / ResNeXT50 | ACER **0.1917 / 0.2127** | ✅ verified | nt |
| Các con số "99% / AUC 0.99x / MobileNetV2+LBP 93.59% / FaceNet+DenseNet201 99% / EER 12.23%" | — | — | ❌ không xác minh được nguồn/protocol → **loại bỏ** | (search snippet, không trích) |

> **Mốc đối chứng chính cho nhánh lightweight của bạn:** kprokofi MN3_large (**ACER 16.33%, AUC 0.921**) và dtruong46me FeatherNet (**ACER 0.164**). Đây là dải realistic cho CNN nhẹ single-frame RGB trên LCC-FASD.

## 4. Baseline CNN đơn giản đạt khoảng nào (để biết số của mình hợp lý không)

- **NUAA (intra, dễ):** CNN transfer-learning bình thường đạt **97–99% Acc** là chuyện thường (CMES 2025: MobileNetV2 97.8%, DenseNet201 98.5%, VGG16 96.2%). Handcrafted mạnh đã ~95–98.5%, có CNN chạm **100%** (Koshy & Mahmood). EER intra thường rất thấp (vài %).
- **Tín hiệu overfit:** trên data nhỏ, backbone lớn ít regularization tụt mạnh — **ResNet50 chỉ 83.5% NUAA / 75.45% Replay** (CMES 2025). B4 (~19M params) nằm giữa ResNet50 và MobileNet → **rủi ro overfit có thật**, cần augmentation mạnh + early stopping.
- **LCC-FASD (khó, cross-domain):** ngay cả MobileNetV3 tuned tốt chỉ đạt **AUC 0.88–0.92, EER 16–19%, ACER ~16–21%** (kprokofi). Đây là vùng realistic cho thiết lập "train nhỏ, generalize".
- **EfficientNet là backbone chính danh cho FAS:** trong **CelebA-Spoof Challenge 2020** (Y. Zhang et al., [arXiv:2102.12642](https://arxiv.org/abs/2102.12642)) nhiều giải pháp top dùng EfficientNet → B4 của bạn là lựa chọn hợp lý. (Chi tiết "b7 / ACER 1–2%" để định tính, chưa xác nhận từ abstract.)

## 5. "Khớp với bạn" — kỳ vọng B4 vs B4+block-DCT & cách định khung đóng góp

**Trên NUAA (intra):**
- Kỳ vọng **Acc ~97–99%** cho cả B4 baseline và B4+block-DCT. Thấp hơn ~95% là dấu hiệu pipeline/augmentation/overfit có vấn đề.
- **Khoảng cách B4 vs B4+DCT sẽ rất nhỏ (gần nhiễu)** vì trần đã bão hoà → **đừng claim accuracy NUAA là đóng góp**. Dùng NUAA làm **sanity-check / smoke-test** cho module liveness.

**Trên LCC-FASD (khó / cross-device):**
- Intra cùng split: định tính **Acc ~88–95% / EER ~6–12%** ([chưa kiểm chứng] — không có số intra B4 chuẩn để trích; suy luận từ độ khó).
- Cross-domain (train nơi khác → test LCC-FASD): realistic **AUC ~0.88–0.92, EER ~15–19%, ACER ~16–21%**, bám mốc kprokofi. **Đây là nơi block-DCT có cơ hội tạo khác biệt thật.**

**Cách định khung đóng góp cho đúng:**
1. Báo cáo bằng **ISO metric: APCER / BPCER / ACER (+ AUC, EER)** trên LCC-FASD, **so trực tiếp B4 baseline vs B4+block-DCT** cùng split/seed.
2. Claim trọng tâm: *"nhánh block-DCT cải thiện trên replay/cross-test"* (giảm ACER/HTER so baseline B4), **không** claim "accuracy cao trên NUAA".
3. Nếu có thể, thêm **cross-test** (vd train NUAA → test LCC-FASD hoặc ngược lại) và báo **HTER/EER** — đúng chỗ generalization mà các paper tần số/DCT thường thắng (artifact moiré/in/replay lộ rõ ở miền tần số, đúng giả thuyết SFDCT).

## 6. Cảnh báo trung thực

- **NUAA bão hoà:** nhiều method đã 98–100% intra; CNN đạt đúng 100% (Koshy & Mahmood). Dư địa cải thiện ≈ 0 → số cao **không phải đóng góp khoa học**. NUAA chỉ 1 loại attack (print 2D), ảnh xám, ít subject, protocol cố định → dễ overfit/bão hoà.
- **LCC-FASD ít paper formal:** chủ yếu là repo (kprokofi, dtruong46me) + vài bài tạp chí tầm trung. Hệ sinh thái quanh nó là model nhẹ (MobileNetV2/V3, FeatherNet) — đúng hướng low-resource, nhưng nghĩa là **thiếu mốc peer-reviewed mạnh**; dùng repo kprokofi làm mốc chính và ghi rõ đó là README.
- **1 bộ nhỏ = bằng chứng yếu:** kết quả trên một dataset nhỏ không đủ để kết luận generalization. Nên báo nhiều dataset/cross-test.
- **Cảnh báo leakage:** nếu B4 ra ~99% trên LCC-FASD intra với split ngẫu nhiên theo ảnh, **rất có thể leak identity/video** (cùng người ở train & test) — lỗi phổ biến tạo số đẹp giả. Phải báo cáo protocol split rõ ràng (theo subject/video).
- **Số đã loại / cần thận trọng:** mọi con số "99%/AUC 0.99x trên LCC-FASD" từ snippet đã **bị loại** (không xác minh được). EER cross-dataset NUAA của Hashemifard & Akbari (22–27%) và số NUAA của Yang ICB2013 / ETASR 2025 / ICICEL 2022 vẫn là **[chưa kiểm chứng]** ở mức con số (paper có thật, số chưa đọc trực tiếp từ bản full).

## 7. Tài liệu tham khảo

**✅ Verified:**
- Tan, X., Li, Y., Liu, J., Jiang, L. (2010). *Face Liveness Detection from a Single Image with Sparse Low Rank Bilinear Discriminative Model.* ECCV 2010, LNCS 6316:504–517. [Springer](https://link.springer.com/chapter/10.1007/978-3-642-15567-3_37) · [trang dataset NUAA](https://parnec.nuaa.edu.cn/_upload/tpl/02/db/731/template731/pages/xtan/NUAAImposterDB_download.html)
- Koshy, R., Mahmood, A. (2019). *Optimizing Deep CNN Architectures for Face Liveness Detection.* Entropy 21(4):423. [MDPI](https://www.mdpi.com/1099-4300/21/4/423) · [PMC7514912](https://pmc.ncbi.nlm.nih.gov/articles/PMC7514912/)
- Khairnar, S., Gite, S., Pradhan, B., Thepade, S.D., Alamri, A. (2025). *Optimizing CNN Architectures for Face Liveness Detection: Performance, Efficiency, and Generalization across Datasets.* CMES, Vol.143 No.3. [techscience.com](https://www.techscience.com/CMES/v143n3/62801/html)
- Timoshenko, D., Simonchik, K., Shutov, V., Zhelezneva, P., Grishkin, V. (2019). *Large Crowdcollected Facial Anti-Spoofing Dataset.* CSIT 2019, IEEE, pp.123–126, DOI 10.1109/CSITechnol.2019.8895208. [IEEE](https://ieeexplore.ieee.org/abstract/document/8895208/) · [PDF](https://csit.am/2019/proceedings/PRIP/PRIP3.pdf)
- Prokofiev, K. — repo *kprokofi/light-weight-face-anti-spoofing* (MobileNetV3 trên LCC-FASD; OpenVINO Training Extensions). [README](https://github.com/kprokofi/light-weight-face-anti-spoofing/blob/master/README.md)
- *dtruong46me/face-anti-spoofing* — đồ án IT4343E Computer Vision, HUST (FeatherNet/MobileNetV3/ResNeXT50 trên LCC-FASD). [repo](https://github.com/dtruong46me/face-anti-spoofing)
- Yang, J., Lei, Z., Li, S.Z. (2014). *Learn Convolutional Neural Network for Face Anti-Spoofing.* arXiv:1408.5601. [arXiv](https://arxiv.org/abs/1408.5601)
- Zhang, Y. et al. (2021). *CelebA-Spoof Challenge 2020 on Face Anti-Spoofing: Methods and Results.* arXiv:2102.12642. [arXiv](https://arxiv.org/abs/2102.12642)

**⚠️ [Chưa kiểm chứng] — paper có thật nhưng con số trên NUAA/LCC-FASD chưa xác nhận trực tiếp từ bản full:**
- Hashemifard, S., Akbari, M. (2021). *A Compact Deep Learning Model for Face Spoofing Detection* (cross-dataset NUAA; EER ~22–27% chưa xác nhận). [arXiv:2101.04756](https://arxiv.org/abs/2101.04756)
- Yang, J., Lei, Z., Liao, S., Li, S.Z. (2013). *Face Liveness Detection with Component Dependent Descriptor.* ICB 2013. [PDF CBSR](http://www.cbsr.ia.ac.cn/users/zlei/papers/ICB2013/YANG-ICB13.pdf) · [IEEE](https://ieeexplore.ieee.org/document/6612955/)
- ETASR (2025). *Enhancing Face Liveness Detection: Novel Deep CNN Architectures for Anti-Spoofing* (NUAA+3D-MAD; số riêng NUAA chưa rõ). [ETASR 12431](https://etasr.com/index.php/ETASR/article/view/12431)
- ICICEL (2022). MobileNet+SVM trên NUAA (~99.72%; PDF không tải được, tác giả/venue chưa xác nhận). [icicel.org PDF](http://www.icicel.org/ell/contents/2022/7/el-16-07-11.pdf)

---

**Ghi chú verify chính (cho người gọi):** Tan 2010 (ECCV), Timoshenko 2019 (CSIT/IEEE), Koshy & Mahmood 2019 (Entropy), Khairnar et al. 2025 (CMES), Yang/Lei/Li 2014 (arXiv 1408.5601), CelebA-Spoof Challenge 2020 (arXiv 2102.12642), và cả hai repo (kprokofi, dtruong46me) đã **xác nhận tồn tại và số khớp đúng**. Số ⚠️ giữ flag vì chỉ đọc được abstract/snippet. Mọi con số "99% trên LCC-FASD" từ search snippet đã **bị loại bỏ**.
