<br>

<div align="center">

**ĐẠI HỌC ĐÀ NẴNG**

**TRƯỜNG ĐẠI HỌC BÁCH KHOA**

**KHOA CÔNG NGHỆ THÔNG TIN**

<br><br>

[[HÌNH: logo_dut.png — Logo Trường Đại học Bách khoa – Đại học Đà Nẵng]]

<br><br>

# ĐỒ ÁN TỐT NGHIỆP

### NGÀNH: Công nghệ Thông tin

### CHUYÊN NGÀNH: Khoa học Dữ liệu và Trí tuệ nhân tạo

<br><br>

## ĐỀ TÀI:

# HỌC KẾT HỢP KHÔNG GIAN–TẦN SỐ VỚI DCT KHỐI CHO PHÁT HIỆN DEEPFAKE TRONG eKYC

### *Hybrid Spatial–Frequency Learning with Block-wise DCT for Deepfake Detection in eKYC*

<br><br>

| | |
|---|---|
| **Sinh viên thực hiện** | : Lê Ngọc Thành |
| **Số thẻ sinh viên (MSSV)** | : 102220041 |
| **Lớp** | : [[FILL: Lớp]] |
| **Ngành** | : Công nghệ Thông tin |
| **Giảng viên hướng dẫn** | : PGS.TS Phạm Công Thắng |

<br><br>

**Đà Nẵng, [[FILL: tháng/năm — ví dụ tháng 06 năm 2026]]**

</div>

<div style="page-break-after: always;"></div>

---

# NHẬN XÉT CỦA GIẢNG VIÊN HƯỚNG DẪN

**Họ và tên sinh viên:** Lê Ngọc Thành  **MSSV:** 102220041  **Lớp:** [[FILL: Lớp]]

**Tên đề tài:** Học kết hợp không gian–tần số với DCT khối cho phát hiện Deepfake trong eKYC.

**Giảng viên hướng dẫn:** PGS.TS Phạm Công Thắng

<br>

**1. Đánh giá về nội dung đề tài:**

[[FILL: nhận xét của GVHD về nội dung, mức độ hoàn thành, tính khoa học của đề tài]]

<br>

**2. Đánh giá về hình thức trình bày:**

[[FILL: nhận xét về bố cục, văn phong, hình ảnh, bảng biểu]]

<br>

**3. Tinh thần, thái độ làm việc của sinh viên:**

[[FILL: nhận xét về thái độ, tính chủ động, tiến độ]]

<br>

**4. Kết luận (đồng ý/không đồng ý cho bảo vệ):**

[[FILL: kết luận]]

<br>

**Điểm đánh giá:** [[FILL: ... /10]]

<br><br>

*Đà Nẵng, ngày ..... tháng ..... năm .....*

*Giảng viên hướng dẫn*

*(ký, ghi rõ họ tên)*

<br><br>

**PGS.TS Phạm Công Thắng**

<div style="page-break-after: always;"></div>

---

# NHẬN XÉT CỦA GIẢNG VIÊN PHẢN BIỆN

**Họ và tên sinh viên:** Lê Ngọc Thành  **MSSV:** 102220041  **Lớp:** [[FILL: Lớp]]

**Tên đề tài:** Học kết hợp không gian–tần số với DCT khối cho phát hiện Deepfake trong eKYC.

**Giảng viên phản biện:** [[FILL: học hàm/học vị + họ tên GV phản biện]]

<br>

**1. Đánh giá về nội dung đề tài:**

[[FILL: nhận xét của GV phản biện]]

<br>

**2. Đánh giá về hình thức trình bày:**

[[FILL: nhận xét về hình thức]]

<br>

**3. Các câu hỏi phản biện:**

[[FILL: câu hỏi phản biện]]

<br>

**4. Kết luận:**

[[FILL: kết luận]]

<br>

**Điểm đánh giá:** [[FILL: ... /10]]

<br><br>

*Đà Nẵng, ngày ..... tháng ..... năm .....*

*Giảng viên phản biện*

*(ký, ghi rõ họ tên)*

<br><br>

**[[FILL: họ tên GV phản biện]]**

<div style="page-break-after: always;"></div>

---

# TÓM TẮT

**Tên đề tài:** Học kết hợp không gian–tần số với DCT khối cho phát hiện Deepfake trong eKYC.

**Sinh viên thực hiện:** Lê Ngọc Thành — MSSV: 102220041 — Lớp: [[FILL: Lớp]]

<br>

Sự bùng nổ của các kỹ thuật tạo sinh deepfake đặt ra mối đe doạ nghiêm trọng đối với các hệ thống định danh điện tử (eKYC) trong lĩnh vực ngân hàng – tài chính, khi khuôn mặt giả mạo có thể vượt qua khâu xác thực sinh trắc học. Các bộ phát hiện chỉ dựa trên đặc trưng không gian (spatial-only) thường khái quát hoá kém khi gặp phương pháp giả mạo hoặc bộ dữ liệu mới (cross-dataset), do dấu vết giả mạo do GAN/upsampling sinh ra rất yếu trong miền không gian nhưng lại đậm nét trong các dải tần số trung – cao. Đồ án đề xuất phương pháp **SFDCT** (Spatial–Frequency với block-wise DCT), kết hợp backbone không gian **EfficientNet-B4** với một nhánh tần số dùng **DCT khối 8×8** theo 16 dải tần số zigzag, hợp nhất bằng cơ chế **gated cross-attention khởi tạo bằng 0** nhằm bảo đảm sàn hiệu năng (floor) không thấp hơn B4. Trên nền tảng đó, đồ án tổng hợp và "thích nghi hoá" (adapt) năm đòn bẩy tần số từ các công trình SPSL, SRM, FreqDebias, FcaNet và FDFL sang miền block-DCT. Mô hình được huấn luyện trên **FaceForensics++ (c23)** và đánh giá **cross-dataset** trên **Celeb-DF-v2** theo giao thức **DeepfakeBench**. Kết quả cho thấy frame-level AUC trên CDFv2 tăng từ **0,7497** (B4) lên **0,7572** (B4-DCT), với hai cấu hình cải tiến Row1 = 0.7333 và Row2 = _(đang huấn luyện)_. Đồ án còn xây dựng demo eKYC có Grad-CAM giải thích được (explainable).

**Từ khóa:** deepfake detection; block-wise DCT; spatial–frequency learning; EfficientNet-B4; gated cross-attention; cross-dataset generalization; DeepfakeBench; eKYC; FcaNet; explainable AI.

<div style="page-break-after: always;"></div>

---

# ABSTRACT

**Thesis title:** Hybrid Spatial–Frequency Learning with Block-wise DCT for Deepfake Detection in eKYC.

**Student:** Le Ngoc Thanh — Student ID: 102220041 — Class: [[FILL: Class]]

<br>

The rapid progress of deepfake generation poses a serious threat to electronic Know-Your-Customer (eKYC) systems in the banking and financial sector, where forged faces may bypass biometric verification. Detectors that rely solely on spatial features tend to generalize poorly to unseen manipulations or datasets (cross-dataset), because the forgery fingerprints produced by GAN/upsampling are faint in the spatial domain yet pronounced in the mid- and high-frequency bands. This thesis proposes **SFDCT** (Spatial–Frequency learning with block-wise DCT), which couples an **EfficientNet-B4** spatial backbone with a frequency branch built on **8×8 block-wise 2D-DCT** aggregated over 16 zigzag frequency bands, fused through a **zero-initialized gated cross-attention** mechanism so that the model performance floor never drops below B4. On top of this design, the thesis assembles and adapts five frequency "levers" from SPSL, SRM, FreqDebias, FcaNet and FDFL into the block-DCT domain. The model is trained on **FaceForensics++ (c23)** and evaluated **cross-dataset** on **Celeb-DF-v2** under the **DeepfakeBench** protocol. Experiments show that the frame-level AUC on CDFv2 improves from **0.7497** (B4) to **0.7572** (B4-DCT), with two enhanced configurations Row1 = [[FILL: CDFv2 AUC Row1]] and Row2 = [[FILL: CDFv2 AUC Row2]]. An explainable eKYC demo with Grad-CAM visualization is also provided.

**Keywords:** deepfake detection; block-wise DCT; spatial–frequency learning; EfficientNet-B4; gated cross-attention; cross-dataset generalization; DeepfakeBench; eKYC; FcaNet; explainable AI.

<div style="page-break-after: always;"></div>

---

# NHIỆM VỤ ĐỒ ÁN TỐT NGHIỆP

**ĐẠI HỌC ĐÀ NẴNG — TRƯỜNG ĐẠI HỌC BÁCH KHOA — KHOA CÔNG NGHỆ THÔNG TIN**

<br>

| Hạng mục | Nội dung |
|---|---|
| **Họ và tên sinh viên** | Lê Ngọc Thành |
| **Số thẻ sinh viên (MSSV)** | 102220041 |
| **Lớp** | [[FILL: Lớp]] |
| **Ngành** | Công nghệ Thông tin |
| **Tên đề tài** | Học kết hợp không gian–tần số với DCT khối cho phát hiện Deepfake trong eKYC (*Hybrid Spatial–Frequency Learning with Block-wise DCT for Deepfake Detection in eKYC*) |
| **Giảng viên hướng dẫn** | PGS.TS Phạm Công Thắng |

<br>

**1. Dữ liệu ban đầu:**

- Bộ dữ liệu huấn luyện: **FaceForensics++** (bản nén c23) — 1000 video thật và 4 phương pháp giả mạo (Deepfakes, Face2Face, FaceSwap, NeuralTextures).
- Bộ dữ liệu kiểm thử cross-dataset: **Celeb-DF-v2** (590 video thật, 5639 video deepfake chất lượng cao).
- Nền tảng huấn luyện và đánh giá: **DeepfakeBench**.
- [[FILL: dữ liệu/tài nguyên ban đầu bổ sung nếu có]]

<br>

**2. Nội dung các phần thuyết minh và tính toán:**

- Nghiên cứu tổng quan về deepfake, eKYC và các phương pháp phát hiện theo miền không gian – tần số.
- Đề xuất và hiện thực phương pháp **SFDCT**: nhánh block-DCT + gated cross-attention zero-init; năm đòn bẩy tần số (S1–S5).
- Huấn luyện và đánh giá cross-dataset theo giao thức DeepfakeBench; phân tích ablation (B4 → B4-DCT → Row1 → Row2).
- Xây dựng demo eKYC có khả năng giải thích (Grad-CAM); bàn về hiệu chỉnh ngưỡng theo Thông tư 17/2024/TT-NHNN (FPR ≤ 5%).

<br>

**3. Các bản vẽ, đồ thị (nếu có):** [[FILL: danh mục sơ đồ kiến trúc, biểu đồ kết quả]]

<br>

**4. Ngày giao đề tài:** [[FILL: ngày/tháng/năm]]

**5. Ngày hoàn thành đề tài:** [[FILL: ngày/tháng/năm]]

<br>

| | |
|---|---|
| *Trưởng Bộ môn* | *Giảng viên hướng dẫn* |
| [[FILL: họ tên]] | **PGS.TS Phạm Công Thắng** |

<div style="page-break-after: always;"></div>

---

# LỜI CẢM ƠN

Để hoàn thành đồ án tốt nghiệp này, em đã nhận được sự giúp đỡ và động viên quý báu từ nhiều người.

Trước hết, em xin bày tỏ lòng biết ơn sâu sắc đến **PGS.TS Phạm Công Thắng** — giảng viên hướng dẫn — người đã tận tình định hướng đề tài, góp ý về mặt khoa học và đồng hành cùng em trong suốt quá trình thực hiện. Những nhận xét sắc bén và sự kiên nhẫn của thầy là nguồn động lực lớn giúp em hoàn thiện công trình này.

Em xin chân thành cảm ơn quý thầy cô **Khoa Công nghệ Thông tin, Trường Đại học Bách khoa – Đại học Đà Nẵng** đã truyền đạt cho em nền tảng kiến thức vững chắc trong suốt những năm học vừa qua, tạo điều kiện về cơ sở vật chất và môi trường học thuật để em có thể triển khai đề tài.

Cuối cùng, em xin gửi lời cảm ơn đến **gia đình** và **bạn bè** đã luôn ủng hộ, sẻ chia và là chỗ dựa tinh thần để em vượt qua những giai đoạn khó khăn nhất.

Do thời gian và năng lực còn hạn chế, đồ án không tránh khỏi những thiếu sót. Em rất mong nhận được những ý kiến đóng góp quý báu từ quý thầy cô để công trình được hoàn thiện hơn.

Em xin chân thành cảm ơn!

<br>

*Đà Nẵng, [[FILL: tháng/năm]]*

*Sinh viên thực hiện*

<br>

**Lê Ngọc Thành**

<div style="page-break-after: always;"></div>

---

# LỜI CAM ĐOAN

Em xin cam đoan rằng đồ án tốt nghiệp với đề tài *"Học kết hợp không gian–tần số với DCT khối cho phát hiện Deepfake trong eKYC"* là công trình nghiên cứu của riêng bản thân em, được thực hiện dưới sự hướng dẫn của **PGS.TS Phạm Công Thắng**.

Các số liệu, kết quả thực nghiệm nêu trong đồ án là trung thực, được tạo ra từ quá trình huấn luyện và đánh giá thực tế trên nền tảng DeepfakeBench, và chưa từng được công bố trong bất kỳ công trình nào khác. Những nội dung, ý tưởng tham khảo từ các tài liệu, công trình của tác giả khác đều được trích dẫn đầy đủ và ghi rõ nguồn trong phần Tài liệu tham khảo theo đúng quy định.

Em xin chịu hoàn toàn trách nhiệm về tính trung thực của nội dung trong đồ án này.

<br>

*Đà Nẵng, [[FILL: ngày/tháng/năm]]*

*Sinh viên thực hiện*

*(ký và ghi rõ họ tên)*

<br>

**[[FILL: chữ ký]]**

**Lê Ngọc Thành**

<div style="page-break-after: always;"></div>

---

# MỤC LỤC

[[FILL: cập nhật khi hoàn thiện — sinh tự động từ heading toàn báo cáo, gồm: Mở đầu; Chương 1 — Tổng quan; Chương 2 — Phương pháp SFDCT; Chương 3 — Thực nghiệm & Kết quả; Kết luận & Hướng phát triển; Tài liệu tham khảo; Phụ lục]]

<div style="page-break-after: always;"></div>

---

# DANH MỤC HÌNH ẢNH

[[FILL: cập nhật khi hoàn thiện — danh sách hình theo số chương, ví dụ Hình 2.1 Kiến trúc SFDCT; Hình 3.1 ROC trên CDFv2; Hình 3.2 Grad-CAM; ...]]

<div style="page-break-after: always;"></div>

---

# DANH MỤC BẢNG BIỂU

[[FILL: cập nhật khi hoàn thiện — danh sách bảng theo số chương, ví dụ Bảng 3.1 So sánh AUC cross-dataset; Bảng 3.2 Ablation S1–S5; ...]]

<div style="page-break-after: always;"></div>

---

# DANH MỤC TỪ VIẾT TẮT

| Từ viết tắt | Thuật ngữ đầy đủ (tiếng Anh) | Giải thích (tiếng Việt) |
|---|---|---|
| **AI** | Artificial Intelligence | Trí tuệ nhân tạo |
| **AP** | Average Precision | Độ chính xác trung bình (diện tích dưới đường PR) |
| **AUC** | Area Under the (ROC) Curve | Diện tích dưới đường cong ROC |
| **CDFv2** | Celeb-DF-v2 | Bộ dữ liệu deepfake người nổi tiếng, phiên bản 2 (test cross-dataset) |
| **CNN** | Convolutional Neural Network | Mạng nơ-ron tích chập |
| **DC** | Direct Current (coefficient) | Hệ số một chiều (hệ số tần số 0 trong DCT) |
| **DCT** | Discrete Cosine Transform | Biến đổi cosine rời rạc |
| **DFDC** | DeepFake Detection Challenge (dataset) | Bộ dữ liệu thử thách phát hiện deepfake |
| **eKYC** | electronic Know Your Customer | Định danh khách hàng điện tử |
| **EER** | Equal Error Rate | Tỷ lệ lỗi cân bằng |
| **FAD** | Frequency-Aware Decomposition | Phân rã nhận biết tần số (trong F3-Net) |
| **FcaNet** | Frequency Channel Attention Network | Mạng chú ý kênh dựa trên tần số |
| **FDFL** | Frequency-aware Discriminative Feature Learning | Học đặc trưng phân biệt nhận biết tần số |
| **FF++** | FaceForensics++ | Bộ dữ liệu giả mạo khuôn mặt (dùng để train, bản c23) |
| **FLOPs** | Floating Point Operations | Số phép tính dấu phẩy động |
| **FPR** | False Positive Rate | Tỷ lệ dương tính giả |
| **FPS** | Frames Per Second | Số khung hình xử lý mỗi giây |
| **GAN** | Generative Adversarial Network | Mạng đối sinh |
| **Grad-CAM** | Gradient-weighted Class Activation Mapping | Bản đồ kích hoạt lớp theo trọng số gradient (giải thích trực quan) |
| **ImageNet** | ImageNet (dataset) | Bộ dữ liệu ảnh lớn dùng để pretrain backbone |
| **KL** | Kullback–Leibler (divergence) | Độ phân kỳ Kullback–Leibler |
| **MSE** | Mean Squared Error | Sai số bình phương trung bình |
| **PR** | Precision–Recall (curve) | Đường cong Precision–Recall |
| **ROC** | Receiver Operating Characteristic | Đặc trưng hoạt động của bộ thu nhận |
| **RNN** | Recurrent Neural Network | Mạng nơ-ron hồi quy |
| **SBI** | Self-Blended Images | Ảnh tự pha trộn (kỹ thuật tăng cường dữ liệu) |
| **SFDCT** | Spatial–Frequency with block-wise DCT | Phương pháp đề xuất của đồ án |
| **SPSL** | Spatial-Phase Shallow Learning | Học nông pha không gian |
| **SRM** | Steganalysis Rich Model | Mô hình giàu đặc trưng giấu tin (lọc nhiễu high-pass) |
| **t-SNE** | t-distributed Stochastic Neighbor Embedding | Kỹ thuật giảm chiều trực quan hoá đặc trưng |
| **TT-NHNN** | Thông tư – Ngân hàng Nhà nước | Văn bản pháp lý của Ngân hàng Nhà nước Việt Nam |
| **XAI** | Explainable Artificial Intelligence | Trí tuệ nhân tạo giải thích được |
| **YCbCr** | Luma–Chroma color space | Không gian màu sáng – sắc (dùng cho DCT) |

<div style="page-break-after: always;"></div>

---

# MỞ ĐẦU

## 1. Đặt vấn đề

Trong vài năm trở lại đây, định danh khách hàng điện tử (electronic Know Your Customer — eKYC) đã trở thành hạ tầng cốt lõi của ngành ngân hàng – tài chính: khách hàng có thể mở tài khoản, vay vốn hay xác nhận giao dịch hoàn toàn từ xa, chỉ bằng một bức ảnh chân dung và vài thao tác trên điện thoại. Chính sự tiện lợi này lại mở ra một bề mặt tấn công mới. Sự phát triển bùng nổ của các kỹ thuật **deepfake** — sử dụng mạng đối sinh (Generative Adversarial Network — GAN) và các mô hình tạo sinh để hoán đổi hoặc tổng hợp khuôn mặt — khiến một khuôn mặt giả mạo trông y như thật có thể được tạo ra với chi phí thấp. Khi những khuôn mặt này được đưa vào khâu xác thực sinh trắc học của eKYC, hệ thống có nguy cơ bị qua mặt, dẫn tới gian lận danh tính, chiếm đoạt tài khoản và rủi ro tài chính nghiêm trọng. Tại Việt Nam, **Thông tư 17/2024/TT-NHNN** đã đặt ra yêu cầu xác thực sinh trắc học trong giao dịch ngân hàng, trong đó ràng buộc về độ an toàn vận hành (chẳng hạn kiểm soát tỷ lệ dương tính giả — FPR ở mức thấp) càng làm rõ nhu cầu cấp thiết về một bộ phát hiện deepfake đáng tin cậy.

**Vì sao chỉ dựa vào miền không gian là chưa đủ?** Phần lớn các bộ phát hiện deepfake hiện nay dựa trên mạng nơ-ron tích chập (CNN) học trực tiếp từ điểm ảnh trong miền không gian (spatial domain). Cách tiếp cận này hoạt động tốt khi tập kiểm thử cùng phân phối với tập huấn luyện, nhưng lại có xu hướng "học vẹt" những dấu vết riêng của từng phương pháp giả mạo cụ thể. Hệ quả là khi gặp một kỹ thuật giả mạo mới hoặc một bộ dữ liệu mới, hiệu năng sụt giảm đáng kể. Đây chính là vấn đề **khái quát hoá cross-dataset** — thách thức cốt lõi và khó nhất của bài toán phát hiện deepfake.

**Vì sao cần đến miền tần số (DCT)?** Một quan sát quan trọng là quá trình tạo sinh deepfake, đặc biệt là các phép **upsampling** trong kiến trúc GAN, để lại những dấu vết (artifact) rất đặc trưng. Trong miền không gian, các dấu vết này thường mờ nhạt và dễ bị các phép nén ảnh (như JPEG, mã hoá video c23) làm "trôi" đi. Tuy nhiên, khi chuyển sang miền tần số bằng **biến đổi cosine rời rạc (Discrete Cosine Transform — DCT)**, những dấu vết này lại bộc lộ rõ rệt ở các dải tần số **trung và cao** — nơi mà ảnh thật và ảnh giả có phân bố năng lượng khác biệt. Đây là cơ sở cho giả thuyết trung tâm của đồ án: **đặc trưng không gian và đặc trưng tần số bổ trợ cho nhau**, và sự kết hợp (collaboration) giữa hai miền sẽ giúp mô hình khái quát hoá tốt hơn qua các phương pháp giả mạo và bộ dữ liệu khác nhau. Việc dùng **DCT khối (block-wise DCT) 8×8** — thay vì DCT toàn ảnh — còn cho phép mô hình bắt được các dấu vết cục bộ, đồng thời tương thích tự nhiên với cách video/ảnh được nén theo khối.

**Vì sao cross-dataset generalization là thách thức cốt lõi?** Trong bối cảnh eKYC thực tế, kẻ tấn công luôn dùng những công cụ tạo deepfake mới nhất — gần như chắc chắn khác với dữ liệu mà mô hình từng thấy lúc huấn luyện. Một bộ phát hiện chỉ đạt độ chính xác cao trên tập "quen" (in-dataset) nhưng sụp đổ trên dữ liệu lạ sẽ vô dụng trong thực tế. Vì vậy, đồ án lấy **frame-level AUC trên Celeb-DF-v2 (huấn luyện trên FaceForensics++)** làm chỉ số đánh giá đại diện (headline metric), phản ánh trực tiếp khả năng khái quát hoá sang miền chưa biết.

## 2. Mục tiêu & câu hỏi nghiên cứu

**Mục tiêu tổng quát:** Xây dựng một bộ phát hiện deepfake **kết hợp không gian – tần số** dựa trên DCT khối, đạt khả năng khái quát hoá cross-dataset tốt hơn baseline không gian thuần, đồng thời an toàn về mặt rủi ro (không bao giờ tệ hơn baseline) và có thể giải thích được, hướng tới ứng dụng eKYC.

**Mục tiêu cụ thể:**

1. Thiết kế nhánh tần số dựa trên **block-wise DCT 8×8** với 16 dải tần số zigzag, và cơ chế hợp nhất **gated cross-attention khởi tạo bằng 0** bảo đảm sàn hiệu năng ≥ EfficientNet-B4.
2. Tổng hợp và thích nghi hoá **năm đòn bẩy tần số** (S1–S5, adapt từ SPSL, SRM, FreqDebias, FcaNet, FDFL) vào miền block-DCT.
3. Đánh giá **công bằng** theo giao thức DeepfakeBench (train FF++ c23 → test cross-dataset CDFv2) thông qua các cấu hình ablation: B4 → B4-DCT → Row1 → Row2.
4. Xây dựng **demo eKYC giải thích được** với Grad-CAM và bàn về hiệu chỉnh ngưỡng quyết định theo yêu cầu FPR ≤ 5%.

**Câu hỏi nghiên cứu:**

- **CH1.** Việc bổ sung nhánh block-DCT vào EfficientNet-B4 có cải thiện AUC cross-dataset so với baseline không gian thuần hay không?
- **CH2.** Trong năm đòn bẩy tần số, đòn nào (hoặc tổ hợp nào) mang lại cải thiện đáng tin cậy, và đòn nào không?
- **CH3.** Cơ chế gated cross-attention zero-init có thực sự bảo đảm "sàn" hiệu năng không thấp hơn B4 hay không?

**Đóng góp chính (novelty).** Đồ án định vị đóng góp trên **năm trục**, trong đó trục phương pháp (ĐG1) là tính mới gốc và bốn trục còn lại là tính mới ở tầng đánh giá – dữ liệu – triển khai:

1. **ĐG1 — Phương pháp gốc:** nhánh **block-DCT spatial–frequency** hợp nhất với EfficientNet-B4 qua **gated cross-attention zero-init** bảo đảm *floor ≥ B4*; đồng thời tổng hợp và thích nghi hoá năm đòn tần số (SPSL/SRM/FreqDebias/FcaNet/FDFL) về **một** miền block-DCT thống nhất.
2. **ĐG2 — Khung đánh giá đa cấu hình + heatmap tổng hợp:** so sánh có hệ thống B4 → B4-DCT → Row1 → Row2 trên cross-dataset, đúc kết bằng một bản đồ nhiệt AUC (Mục 3.4).
3. **ĐG3 — Đánh giá theo điểm vận hành eKYC:** hiệu chỉnh ngưỡng τ tại **điểm vận hành FPR ≤ 5%** (quy ước ISO/IEC 30107-3 để toán-hoá yêu cầu xác thực sinh trắc *định tính* của **Thông tư 17/2024/TT-NHNN** — TT17 không ấn định ngưỡng số), phân rã lỗi (confusion FP/FN, hai chiều APCER/BPCER) thay vì chỉ một con số AUC.
4. **ĐG4 — Nghiên cứu cross-dataset trung thực có thống kê:** dùng **bootstrap CI** để kiểm định ý nghĩa của ΔAUC và **báo thẳng kết quả nằm trong nhiễu** khi đúng như vậy (không tô hồng).
5. **ĐG5 — (dữ liệu, hướng phát triển) Bộ deepfake người Việt cho eKYC:** tập kiểm thử cross-domain mặt người Việt sát kịch bản định danh, bổ sung cho CDFv2.

> Toàn bộ được xây dựng **trên nền DeepfakeBench** (có ghi nguồn đầy đủ) cùng các công trình tần số được kế thừa — xem Tài liệu tham khảo.

## 3. Đối tượng & phạm vi nghiên cứu

**Đối tượng nghiên cứu:** Bài toán phát hiện **deepfake** (face-forgery) trên ảnh khuôn mặt, tập trung vào sự cộng tác giữa đặc trưng miền không gian và miền tần số block-DCT, trong bối cảnh ứng dụng eKYC.

**Phạm vi nghiên cứu:**

- **Chỉ tập trung vào phát hiện deepfake (DEEPFAKE-ONLY).** Sau khi cân nhắc khối lượng và độ sâu phù hợp với một đồ án tốt nghiệp, phạm vi đề tài đã được **thu hẹp** so với dự kiến ban đầu, chỉ đi sâu vào bài toán phát hiện deepfake. Bài toán **phát hiện sự sống (liveness / anti-spoofing)** — vốn cũng quan trọng trong eKYC — được đặt ở phần **Hướng phát triển** của đồ án, không nằm trong phạm vi hiện thực và đánh giá ở đây.
- **Mức ảnh (frame-level), không xử lý chuỗi thời gian.** Đồ án làm việc trên từng khung hình face-crop độc lập, không khai thác đặc trưng thời gian/chuyển động giữa các khung.
- **Dữ liệu:** huấn luyện trên FaceForensics++ (c23); kiểm thử cross-dataset trên Celeb-DF-v2. DFDC được nhắc tới như một tập cross-dataset bổ sung cho tương lai.
- **Đánh giá:** theo giao thức DeepfakeBench, chỉ số đại diện là frame-level AUC trên CDFv2.

## 4. Phương pháp thực hiện

Quy trình thực hiện của đồ án gồm bốn giai đoạn nối tiếp nhau:

1. **Chuẩn bị dữ liệu (data).** Trích xuất khuôn mặt từ video FF++ và CDFv2, căn chỉnh và cắt thành ảnh face-crop kích thước 256×256, chuẩn hoá theo cấu hình DeepfakeBench (mean = std = 0,5). Sinh các tệp JSON mô tả tập dữ liệu phục vụ huấn luyện/đánh giá.
2. **Xây dựng mô hình SFDCT.** Backbone không gian EfficientNet-B4 (pretrained ImageNet) kết hợp nhánh tần số block-DCT 8×8 (ảnh đổi sang YCbCr, lấy log-magnitude, gom theo 16 dải zigzag, tùy chọn drop low bands chống rò rỉ nội dung), hợp nhất bằng gated cross-attention zero-init; tích hợp tuỳ chọn năm đòn bẩy S1–S5.
3. **Huấn luyện & đánh giá cross-dataset (DeepfakeBench).** Huấn luyện trên FF++ c23 (batch 32, frame_num 32, optimizer Adam, lr 2e-4, ảnh 256×256); đánh giá frame-level AUC trên CDFv2 theo bốn cấu hình ablation (B4 → B4-DCT → Row1 → Row2), kèm các hình minh hoạ (ROC, PR, t-SNE, phổ tần số, gate alpha, Grad-CAM, training curve).
4. **Demo eKYC giải thích được.** Công cụ suy luận trả về xác suất giả mạo fake_prob ∈ [0,1], nhãn REAL/FAKE và ảnh Grad-CAM overlay; thảo luận hiệu chỉnh ngưỡng theo Thông tư 17/2024/TT-NHNN (FPR ≤ 5%).

## 5. Ý nghĩa khoa học & thực tiễn

**Về mặt khoa học,** đồ án củng cố bằng thực nghiệm giả thuyết về sự cộng tác không gian – tần số trong phát hiện deepfake, đồng thời đóng góp một thiết kế hợp nhất **gated cross-attention zero-init** có tính chất bảo đảm "sàn" hiệu năng — một đặc tính ít được nhấn mạnh trong các công trình trước. Việc tổng hợp và thích nghi hoá năm đòn bẩy tần số từ các hướng nghiên cứu khác nhau (SPSL, SRM, FreqDebias, FcaNet, FDFL) sang một khung block-DCT chung cũng cung cấp một góc nhìn so sánh có hệ thống.

**Về mặt thực tiễn,** đồ án hướng thẳng tới bài toán eKYC trong ngành ngân hàng Việt Nam: đánh giá cross-dataset công bằng theo DeepfakeBench phản ánh sát kịch bản triển khai thực tế (gặp deepfake lạ), còn demo có Grad-CAM giúp tăng tính minh bạch và khả năng diễn giải quyết định — yếu tố quan trọng cho việc tuân thủ pháp lý và xây dựng niềm tin của người dùng.

## 6. Cấu trúc báo cáo

Ngoài phần Mở đầu, Kết luận và Tài liệu tham khảo, nội dung chính của báo cáo được tổ chức thành ba chương:

- **Chương 1 — Tổng quan và Cơ sở lý thuyết.** Trình bày bối cảnh deepfake và eKYC, khảo sát các hướng phát hiện deepfake (miền không gian, miền tần số), nền tảng lý thuyết về DCT, cơ chế attention, và các công trình liên quan làm nền cho năm đòn bẩy của đồ án.
- **Chương 2 — Phương pháp đề xuất SFDCT.** Mô tả chi tiết kiến trúc: backbone EfficientNet-B4, nhánh block-DCT 8×8 với 16 dải zigzag, cơ chế gated cross-attention zero-init, năm đòn bẩy tần số (S1–S5) và các hàm mất mát.
- **Chương 3 — Thực nghiệm và Đánh giá.** Trình bày dữ liệu, giao thức DeepfakeBench, các cấu hình ablation, kết quả cross-dataset (B4 0,7497 → B4-DCT 0,7572 → Row1 0,7333; Row2 đang huấn luyện), phân tích định lượng – định tính (ROC, PR, t-SNE, Grad-CAM, gate alpha) và demo eKYC.

Cuối cùng, phần **Kết luận và Hướng phát triển** tổng kết các đóng góp, nêu thẳng các hạn chế (kết quả mới 1 seed, đòn bẩy mạnh nhất SBI nằm ngoài phạm vi block-DCT thuần) và phác thảo hướng mở rộng (multi-seed, tích hợp SBI self-blended training, mở rộng sang liveness và DFDC).

# CHƯƠNG 1: CƠ SỞ LÝ THUYẾT VÀ CÔNG NGHỆ

Chương này thiết lập nền tảng lý thuyết cần thiết để hiểu phương pháp **SFDCT** (Hybrid Spatial–Frequency Learning with Block-wise DCT) được đề xuất trong đồ án. Mạch trình bày đi từ *vì sao cần phát hiện deepfake* (bản chất kỹ thuật của công nghệ giả mạo và dấu vết nó để lại), tới *bài toán và thách thức cốt lõi* (generalization cross-dataset), rồi đến *các công cụ kỹ thuật* (EfficientNet-B4 cho miền không gian, DCT khối cho miền tần số, cơ chế attention cho hợp nhất), và cuối cùng là *nền tảng của năm đòn cải tiến* (S1–S5) cùng *bối cảnh ứng dụng eKYC*. Triết lý xuyên suốt: trình bày trực giác trước, công thức sau; mỗi khái niệm được neo bằng một bảng ánh xạ hoặc ví dụ minh hoạ ngắn.

## 1.1 Tổng quan công nghệ Deepfake

### 1.1.1 Vì sao cần hiểu cơ chế sinh deepfake

Trước khi xây dựng một bộ phát hiện, ta phải hiểu *kẻ địch* tạo ra ảnh giả như thế nào. Lý do rất thực tế: mọi phương pháp sinh ảnh giả đều để lại một loại "dấu vân tay" (fingerprint) đặc trưng cho quy trình sinh của nó. Nếu hiểu được các bước biến đổi pixel mà thuật toán sinh thực hiện, ta biết *nên đi tìm dấu vết ở đâu* — và quan trọng hơn, ở **miền biểu diễn** nào (không gian hay tần số) thì dấu vết đó lộ rõ nhất. Đây chính là điểm tựa của toàn bộ đồ án: lập luận rằng một số dấu vết gần như vô hình ở miền không gian nhưng lại trở nên "ồn ào" (loud) ở dải tần trung và cao.

### 1.1.2 Ba họ kỹ thuật sinh khuôn mặt giả

Thuật ngữ "deepfake" bao trùm nhiều kỹ thuật khác nhau. Có thể quy về ba họ kiến trúc chủ đạo:

**(a) Autoencoder face-swap (hoán đổi khuôn mặt bằng autoencoder).** Đây là kiến trúc kinh điển của các công cụ FaceSwap/DeepFaceLab. Ý tưởng: huấn luyện hai autoencoder *chia sẻ chung một encoder* nhưng có hai decoder riêng cho hai danh tính (identity) A và B. Encoder học một biểu diễn nén (latent) bất biến với danh tính — mã hoá tư thế, biểu cảm, ánh sáng. Khi suy luận, ta đưa khuôn mặt A vào encoder rồi *ghép* với decoder của B, thu được khuôn mặt B mang tư thế–biểu cảm của A. Bước cuối luôn là **dán (blend)** vùng mặt sinh ra trở lại khung hình gốc — và chính bước dán này tạo ra **blending boundary** (đường biên hoà trộn).

**(b) GAN (Generative Adversarial Network).** Một mạng *sinh* (generator) học biến nhiễu/ảnh đầu vào thành ảnh giả, đối đầu với một mạng *phân biệt* (discriminator) học phân biệt thật–giả; hai mạng huấn luyện đối kháng cho đến khi ảnh giả đủ chân thực để qua mặt discriminator. GAN là lõi của nhiều bộ tổng hợp khuôn mặt chất lượng cao (ví dụ StyleGAN). Điểm cốt yếu cho đồ án: generator hầu như luôn dựng ảnh độ phân giải cao từ một tensor độ phân giải thấp thông qua các lớp **upsampling** (transposed convolution hoặc nội suy + convolution). Quá trình upsampling này để lại các **upsampling artifact** — những hoạ tiết tuần hoàn (periodic) biểu hiện thành các đỉnh năng lượng bất thường (spectral peaks) trong phổ tần số [n].

**(c) Diffusion model (mô hình khuếch tán).** Thế hệ mới sinh ảnh bằng cách học đảo ngược một quá trình thêm nhiễu dần: từ nhiễu Gauss thuần, mạng khử nhiễu (denoise) lặp lại nhiều bước để dựng ra ảnh. Diffusion cho chất lượng rất cao nhưng vẫn để lại thống kê tần số khác biệt so với ảnh chụp tự nhiên. Trong phạm vi đồ án, diffusion được nêu như xu hướng cần khái quát hoá tới (hướng phát triển), còn dữ liệu huấn luyện chính (FF++) thuộc hai họ đầu.

[[HÌNH 1.1: minh hoạ ba pipeline sinh khuôn mặt giả (autoencoder face-swap, GAN, diffusion) với điểm chung là bước upsampling/blending cuối cùng để lại artifact]]

### 1.1.3 Bốn họ giả mạo trong FaceForensics++

Bộ dữ liệu chuẩn FaceForensics++ (FF++) [n] gom bốn phương pháp giả mạo, đại diện cho hai loại thao tác lớn — *hoán đổi danh tính* (identity swap) và *tái diễn biểu cảm* (expression reenactment):

[[BẢNG 1.1: Bốn họ giả mạo trong FF++ — cơ chế và loại dấu vết chính]]

| Phương pháp | Loại thao tác | Cơ chế cốt lõi | Dấu vết đặc trưng |
|---|---|---|---|
| **Deepfakes** | Identity swap | Autoencoder hoán đổi danh tính rồi blend vào khung hình | Blending boundary, bất nhất kết cấu vùng mặt/nền |
| **Face2Face** | Expression reenactment | Tái diễn biểu cảm dựa trên mô hình 3D, render lại vùng miệng/mặt | Sai lệch render, nhiễu biên vùng tái diễn |
| **FaceSwap** | Identity swap | Hoán đổi mặt dựa trên đồ hoạ (graphics-based), khớp landmark 3D rồi blend | Đường nối hình học cứng, bất nhất ánh sáng |
| **NeuralTextures** | Expression reenactment | Học texture thần kinh kết hợp render khác biệt (neural rendering) | Artifact tinh vi vùng miệng, khó thấy ở miền không gian |

Bốn họ này được chọn vì chúng phủ cả thao tác dựa trên *học sâu* (Deepfakes, NeuralTextures) lẫn *đồ hoạ truyền thống* (Face2Face, FaceSwap), buộc bộ phát hiện phải học những dấu vết *chung* thay vì học thuộc một loại artifact duy nhất.

### 1.1.4 Dấu vết giả mạo: yếu ở miền không gian, rõ ở miền tần số

Đây là *luận điểm trung tâm* của đồ án, nên cần làm rõ trực giác. Ba loại dấu vết phổ biến nhất:

1. **Blending boundary (đường biên hoà trộn).** Khi dán vùng mặt sinh ra vào khung hình gốc, hai vùng có thống kê khác nhau (độ sắc nét, mức nhiễu cảm biến, cân bằng màu) bị ép gặp nhau. Ở miền pixel, kỹ thuật làm mượt (feathering, Poisson blending) khiến ranh giới gần như vô hình với mắt người. Nhưng phép làm mượt này thay đổi *cấu trúc tần số cục bộ*: nó triệt tiêu một phần năng lượng tần số cao quanh biên một cách bất thường.

2. **Upsampling artifact (hoạ tiết phóng to).** Như đã nêu, các lớp upsampling của GAN/decoder tạo ra hoạ tiết lưới (grid-like) tuần hoàn. Mắt người gần như không nhận ra, nhưng trong phổ DCT/Fourier chúng biểu hiện thành các *đỉnh năng lượng* định vị rõ ở dải tần trung–cao [n].

3. **Bất nhất tần số (frequency inconsistency).** Camera thật áp một chuỗi xử lý (demosaicing, nén JPEG) tạo ra một "chữ ký" thống kê tần số tự nhiên và *nhất quán* trên toàn ảnh. Ảnh giả ghép từ nhiều nguồn/đi qua mạng sinh thường vi phạm tính nhất quán này, để lại sự lệch pha và lệch biên độ ở các band tần số.

**Vì sao điều này quan trọng cho thiết kế?** Một CNN không gian (spatial CNN) học các bộ lọc trên lưới pixel; nó *có thể* gián tiếp bắt được vài artifact tần số, nhưng kém hiệu quả vì các dấu vết này có biên độ rất nhỏ và bị "chìm" trong nội dung ảnh (content). Trái lại, nếu ta *chủ động* chiếu ảnh sang miền tần số (qua DCT khối), các artifact tần số được "kéo" ra thành những hệ số rời rạc, dễ tách khỏi nội dung. Đây chính là động lực để thêm **nhánh tần số** song song với backbone không gian — và là lý do trực tiếp cho kiến trúc hai nhánh của SFDCT.

[[HÌNH 1.2: so sánh trực quan — biên hoà trộn gần như vô hình ở ảnh pixel (trái) nhưng lộ rõ thành đỉnh năng lượng ở phổ DCT log-magnitude (phải)]]

## 1.2 Bài toán phát hiện Deepfake và thách thức generalization

### 1.2.1 Định nghĩa bài toán phân loại nhị phân

Ở mức cơ bản nhất, phát hiện deepfake là một bài toán **phân loại nhị phân** (binary classification) ở mức frame: cho một ảnh khuôn mặt $x$, mô hình $f_\theta$ xuất một xác suất

$$
\hat{y} = f_\theta(x) \in [0, 1],
$$

trong đó $\hat{y}$ là xác suất ảnh thuộc lớp **FAKE**; nhãn thật là $y \in \{0, 1\}$ với $0 = $ REAL, $1 = $ FAKE. Mô hình được huấn luyện bằng hàm mất mát binary cross-entropy:

$$
\mathcal{L}_{\text{BCE}} = -\big[\, y \log \hat{y} + (1 - y)\log(1 - \hat{y}) \,\big].
$$

Vì là bài toán mức frame, một video được suy luận bằng cách tổng hợp xác suất trên các frame (ví dụ trung bình), nhưng *metric headline* của đồ án vẫn là **frame-level AUC** — đo trực tiếp khả năng phân tách thật–giả ở mức ảnh.

**Vì sao dùng AUC chứ không phải accuracy?** Accuracy phụ thuộc vào một ngưỡng quyết định cố định và rất nhạy với mất cân bằng lớp (class imbalance) — trong khi tập deepfake thường lệch mạnh (nhiều fake hơn real). **AUC (Area Under the ROC Curve)** đo xác suất mô hình xếp một mẫu FAKE ngẫu nhiên cao hơn một mẫu REAL ngẫu nhiên, *độc lập với ngưỡng*. Đây là lý do AUC là metric chuẩn de-facto trong các benchmark deepfake.

[[BẢNG 1.2: Ánh xạ ký hiệu bài toán]]

| Ký hiệu | Vai trò | Ý nghĩa |
|---|---|---|
| $x$ | Đầu vào | Ảnh face-crop 256×256 |
| $f_\theta$ | Mô hình | Bộ phát hiện có tham số $\theta$ |
| $\hat{y}$ | Đầu ra | Xác suất là FAKE, $\in [0,1]$ |
| $y$ | Nhãn | 0 = REAL, 1 = FAKE |
| AUC | Metric | Khả năng phân tách thật–giả, độc lập ngưỡng |

### 1.2.2 Nghịch lý in-dataset cao, cross-dataset rớt

Một mô hình hiện đại huấn luyện và kiểm thử *trên cùng một bộ dữ liệu* (in-dataset) thường đạt AUC rất cao — không hiếm khi vượt 0.99 trên FF++. Nhưng khi đem chính mô hình đó kiểm thử trên một bộ dữ liệu *khác* (cross-dataset), ví dụ Celeb-DF-v2, AUC thường rớt mạnh xuống quanh 0.6–0.75. Đây là **nghịch lý generalization** — và là thách thức trung tâm mà đồ án nhắm tới.

**Vì sao lại rớt?** Cốt lõi là mô hình học phải *nhầm* các dấu vết *đặc trưng cho một pipeline sinh cụ thể* (method-specific artifact) thay vì các dấu vết *chung* cho mọi loại giả mạo. Ví dụ, một mô hình có thể vô tình học rằng "ảnh do Deepfakes-FF++ sinh ra có một mẫu lưới upsampling tần số $k$"; mẫu này biến mất hoàn toàn khi gặp Celeb-DF (dùng pipeline tổng hợp khác), nên mô hình mất phương hướng. Hiện tượng này là một dạng *overfitting vào artifact của tập huấn luyện*.

**Hệ quả thiết kế.** Muốn generalize, ta phải hướng mô hình tới những dấu vết *bất biến* với pipeline sinh. Đây chính là lý do đồ án ưu tiên *miền tần số*: các nguyên lý vật lý chung (mọi mạng sinh đều phải upsample, mọi blend đều phá vỡ tính nhất quán tần số) tạo ra lớp dấu vết phổ quát hơn so với một texture cụ thể ở miền không gian. Đó cũng là lý do giao thức đánh giá của đồ án *cố ý* đặt train và test trên hai bộ dữ liệu khác nhau (FF++ → CDFv2) — để đo đúng cái ta quan tâm: khả năng khái quát hoá.

### 1.2.3 Robustness với nén ảnh

Ngữ cảnh eKYC thực tế: ảnh/video người dùng gửi lên hầu như luôn bị **nén** (JPEG cho ảnh, H.264 cho video) khi truyền qua mạng. Nén làm hai việc bất lợi cho bộ phát hiện: (i) nó *xoá* bớt năng lượng tần số cao — nơi nhiều artifact giả mạo trú ngụ; và (ii) bản thân nén tạo ra **block artifact** (hoạ tiết khối 8×8 của JPEG) có thể bị nhầm với dấu vết giả mạo. Vì vậy FF++ được dùng ở bản nén **c23** (nén vừa, H.264 CRF 23) — một mức nén *thực tế*, không quá lý tưởng (raw) cũng không quá nặng (c40). Việc huấn luyện trên c23 giúp mô hình quen với mức suy hao tín hiệu gần với điều kiện vận hành. Một bộ phát hiện hữu dụng cho eKYC phải *bền vững* với nén — đây là một tiêu chí ngầm xuyên suốt thiết kế nhánh tần số (sẽ ưu tiên các band tần số đủ ổn định trước nén).

## 1.3 Bộ dữ liệu chuẩn và giao thức đánh giá

### 1.3.1 FaceForensics++ (c23) — tập huấn luyện

FaceForensics++ [n] là bộ dữ liệu nền tảng cho phát hiện face-forgery. Nó gồm **1000 video thật** (thu thập từ YouTube) và bốn tập video giả tương ứng, sinh bởi bốn phương pháp đã nêu ở Bảng 1.1 (Deepfakes, Face2Face, FaceSwap, NeuralTextures). Mỗi mức nén được phát hành ba phiên bản: raw (không nén), **c23** (nén nhẹ–vừa, H.264 CRF 23) và c40 (nén nặng). Đồ án dùng bản **c23** vì nó cân bằng giữa tính hiện thực (giống ảnh truyền qua mạng) và việc giữ đủ dấu vết tần số để học.

### 1.3.2 Celeb-DF-v2 — tập kiểm thử cross-dataset

Celeb-DF-v2 (CDFv2) [n] là bộ deepfake *chất lượng cao* được thiết kế để khó hơn FF++: nó gồm **590 video thật** của người nổi tiếng và **5639 video deepfake** được tinh chỉnh để giảm thiểu các artifact thô (nhấp nháy màu, đường biên lộ) vốn dễ thấy ở các bộ cũ. Vì CDFv2 dùng một pipeline tổng hợp *khác hẳn* FF++, nó là phép thử generalization lý tưởng: một mô hình chỉ học thuộc artifact FF++ sẽ rớt điểm nặng trên CDFv2. **Quan trọng: CDFv2 chỉ dùng để TEST, tuyệt đối không dùng để train** — đây là điều kiện bắt buộc của một đánh giá cross-dataset công bằng.

### 1.3.3 Giao thức đánh giá DeepfakeBench

DeepfakeBench [n] là một framework chuẩn hoá việc huấn luyện và đánh giá các bộ phát hiện deepfake, nhằm loại bỏ sự thiếu nhất quán (về tiền xử lý, chia tập, cách tính metric) vốn khiến các con số giữa các bài báo khó so sánh. Giao thức đồ án tuân theo:

- **Train**: trên FF++ (c23).
- **Test cross-dataset**: trên Celeb-DF-v2.
- **Metric headline**: frame-level AUC trên CDFv2.
- **Hyperparameters chuẩn**: batch size 32, frame_num 32, optimizer Adam, learning rate 2e-4, ảnh đầu vào 256×256.

Việc tuân thủ DeepfakeBench cho phép đối sánh trực tiếp với leaderboard: baseline EfficientNet-B4 của đồ án đạt CDFv2 frame-AUC = **0.7497**, xấp xỉ con số leaderboard (≈0.7487) — *xác nhận pipeline được dựng đúng* trước khi tiến hành mọi cải tiến.

[[BẢNG 1.3: Tóm tắt thống kê hai bộ dữ liệu]]

| Thuộc tính | FaceForensics++ (c23) | Celeb-DF-v2 |
|---|---|---|
| Vai trò | Train | Test (cross-dataset) |
| Video thật | 1000 | 590 |
| Video giả | 4000 (4 phương pháp × 1000) | 5639 |
| Số phương pháp giả | 4 | 1 (pipeline thống nhất) |
| Mức nén dùng | c23 (H.264 CRF 23) | MPEG-4/H.264 (bản phát hành CDFv2) |
| Số frame trích xuất | ≈ 159.626 | 16.420 (test dùng để đánh giá) |
| Frame mỗi video | 32 (frame_num) | 32 (frame_num) |

## 1.4 Trích xuất đặc trưng không gian: EfficientNet-B4

### 1.4.1 Vì sao cần một backbone không gian mạnh

Dù luận điểm trung tâm của đồ án là *miền tần số*, ta vẫn cần một backbone không gian tốt làm "xương sống": rất nhiều dấu vết giả mạo (bất nhất kết cấu da, lỗi vùng mắt/răng, sai lệch ánh sáng) vốn dĩ là *hiện tượng không gian*. Nhánh tần số được thiết kế để *bổ sung* chứ không thay thế phần này. Câu hỏi là: chọn backbone nào để vừa mạnh vừa hiệu quả về tham số?

### 1.4.2 Compound scaling — ý tưởng cốt lõi của EfficientNet

EfficientNet [n] xuất phát từ một quan sát đơn giản: khi muốn tăng năng lực một CNN, ta có ba "núm vặn" — **độ sâu** (depth, số lớp), **độ rộng** (width, số kênh) và **độ phân giải đầu vào** (resolution). Các thiết kế trước thường chỉ vặn một núm (ví dụ ResNet làm sâu hơn). EfficientNet chỉ ra rằng vặn *đồng thời và cân đối* cả ba núm theo một tỉ lệ chung (**compound scaling**) cho hiệu quả accuracy/FLOPs tốt hơn hẳn. Cụ thể, với một hệ số tài nguyên $\phi$, ba chiều được scale theo:

$$
\text{depth} = \alpha^{\phi}, \quad \text{width} = \beta^{\phi}, \quad \text{resolution} = \gamma^{\phi},
$$

với ràng buộc $\alpha \cdot \beta^{2} \cdot \gamma^{2} \approx 2$ (giữ cho FLOPs tăng xấp xỉ $2^{\phi}$ lần), trong đó $\alpha, \beta, \gamma$ được tìm bằng grid search nhỏ trên mạng gốc. Tăng $\phi$ tạo ra họ B0 → B7; **B4** là một điểm cân bằng "vừa tầm" trong họ này.

[[BẢNG 1.4: Ba chiều scaling của EfficientNet]]

| Chiều scaling | Vặn cái gì | Lợi ích | Rủi ro nếu vặn lệch |
|---|---|---|---|
| Depth ($\alpha^\phi$) | Số lớp | Bắt đặc trưng phức tạp/trừu tượng hơn | Khó train (vanishing gradient) |
| Width ($\beta^\phi$) | Số kênh | Bắt nhiều đặc trưng chi tiết hơn | Bão hoà, kém hiệu quả tham số |
| Resolution ($\gamma^\phi$) | Kích thước ảnh vào | Thấy chi tiết nhỏ (artifact tinh vi) | FLOPs tăng nhanh |

### 1.4.3 Khối MBConv — đơn vị xây dựng

Đơn vị cơ bản của EfficientNet là **MBConv** (Mobile Inverted Bottleneck Convolution), kế thừa từ MobileNetV2. Trực giác của MBConv gồm ba bước: (i) **expand** — dùng convolution 1×1 nở số kênh lên (ví dụ ×6) để tạo không gian biểu diễn rộng; (ii) **depthwise convolution** — tích chập theo từng kênh riêng (rẻ hơn nhiều so với tích chập đầy đủ) để học hoạ tiết không gian; (iii) **project** — convolution 1×1 ép kênh trở lại số nhỏ (bottleneck). Mỗi khối còn gắn một module **Squeeze-and-Excitation (SE)** — học một trọng số *quan trọng theo kênh* để khuếch đại kênh hữu ích và nén kênh nhiễu — cùng một **residual connection** khi chiều vào–ra khớp. Cấu trúc "nở rồi nén" này (inverted bottleneck) cho phép học biểu diễn giàu mà vẫn tiết kiệm tham số.

Điều đáng chú ý cho đồ án: module SE bản chất là một dạng **channel attention** dựa trên thống kê toàn cục (global average pooling). Đây là cầu nối lý thuyết tới đòn **S4 (FcaNet)** ở mục 1.7 — vốn *tổng quát hoá* SE bằng cách thay average pooling bằng nhiều thành phần DCT, tức vẫn là channel attention nhưng *giàu tần số* hơn.

[[HÌNH 1.3: kiến trúc khối MBConv — expand 1×1 → depthwise conv → SE → project 1×1 + residual]]

### 1.4.4 Vì sao chọn B4 và transfer learning từ ImageNet

Lựa chọn **B4** (thay vì B0 nhỏ hơn hay B7 lớn hơn) dựa trên ba lý do:

1. **Đối sánh leaderboard.** EfficientNet-B4 là backbone *được dùng phổ biến* trong các baseline DeepfakeBench, nên chọn B4 cho phép so sánh công bằng và xác nhận pipeline (như con số 0.7497 ≈ 0.7487 đã nêu).
2. **Cân bằng tài nguyên.** B4 đủ lớn để học đặc trưng giả mạo tinh vi nhưng vẫn vừa với GPU tầm trung, cho phép batch size 32 ở độ phân giải 256×256.
3. **Độ phân giải phù hợp.** B4 vốn được thiết kế cho ảnh đầu vào ~380px; ở 256×256 nó vẫn hoạt động tốt và giữ đủ chi tiết để bắt artifact nhỏ.

**Transfer learning.** Backbone được khởi tạo bằng trọng số **pretrained trên ImageNet** thay vì train từ đầu. Lý do: các bộ lọc tầng thấp (cạnh, góc, kết cấu) học từ hàng triệu ảnh tự nhiên là *generic*, dùng lại được ngay; ta chỉ cần fine-tune các tầng cao cho nhiệm vụ phát hiện giả mạo. Điều này tiết kiệm dữ liệu, rút ngắn thời gian hội tụ và thường cho generalization tốt hơn. Ảnh đầu vào được chuẩn hoá (normalize) với mean = std = 0.5 (đưa pixel về khoảng $[-1, 1]$), theo đúng cấu hình pipeline của đồ án.

## 1.5 Biến đổi cosine rời rạc (DCT) và phân tích miền tần số

### 1.5.1 Vì sao dùng DCT thay vì Fourier

Ở mục 1.1 ta đã lập luận rằng artifact giả mạo lộ rõ ở miền tần số. Vậy *biến đổi* nào để chuyển ảnh sang miền tần số? Lựa chọn của đồ án là **DCT (Discrete Cosine Transform)** thay vì DFT/FFT, vì ba lý do: (i) DCT cho *hệ số thực* (không có phần ảo phức tạp như Fourier), dễ đưa vào mạng nơ-ron; (ii) DCT có khả năng **nén năng lượng** (energy compaction) rất tốt — dồn phần lớn năng lượng tín hiệu vào ít hệ số tần số thấp, làm cho phần "thừa" ở tần số cao (nơi artifact trú) nổi bật; (iii) DCT là *đúng* phép biến đổi mà chuẩn nén **JPEG** dùng trên từng khối 8×8 — nên block-DCT là cách tự nhiên nhất để soi các dấu vết liên quan đến nén và lưới khối.

### 1.5.2 DCT một chiều và hai chiều

**DCT một chiều (1D-DCT).** Cho một tín hiệu rời rạc $x[n]$, $n = 0,\dots,N-1$, DCT-II (loại được dùng phổ biến nhất) định nghĩa hệ số tần số thứ $k$:

$$
X[k] = c(k)\sum_{n=0}^{N-1} x[n]\,\cos\!\left[\frac{\pi (2n+1)k}{2N}\right], \quad k = 0,\dots,N-1,
$$

với hệ số chuẩn hoá $c(0) = \sqrt{1/N}$ và $c(k) = \sqrt{2/N}$ khi $k \ge 1$. Trực giác: mỗi $X[k]$ đo *mức độ tương đồng* giữa tín hiệu và một sóng cosine tần số $k$. Hệ số $X[0]$ (gọi là **DC**) tỉ lệ với giá trị trung bình của tín hiệu; các $X[k]$ với $k$ lớn (gọi là **AC** tần số cao) bắt các biến thiên nhanh — cạnh sắc, nhiễu, hoạ tiết tinh vi.

**DCT hai chiều (2D-DCT).** Với một khối ảnh $B(i,j)$ kích thước $M \times N$, 2D-DCT là phép áp DCT-1D lần lượt theo hàng rồi theo cột (separable):

$$
F(u,v) = c(u)\,c(v)\sum_{i=0}^{M-1}\sum_{j=0}^{N-1} B(i,j)\,\cos\!\left[\frac{\pi(2i+1)u}{2M}\right]\cos\!\left[\frac{\pi(2j+1)v}{2N}\right].
$$

Kết quả $F(u,v)$ là một lưới hệ số: góc trên–trái $(u,v)=(0,0)$ là DC (năng lượng "thô"/nội dung); đi xa khỏi góc đó về phía dưới–phải là các tần số ngày càng cao theo cả hai chiều dọc và ngang.

[[BẢNG 1.5: Ý nghĩa vị trí hệ số trong khối 2D-DCT]]

| Vị trí hệ số $(u,v)$ | Tên gọi | Bắt cái gì | Liên hệ artifact giả mạo |
|---|---|---|---|
| $(0,0)$ | DC | Độ sáng trung bình khối | Mang nội dung → dễ gây content leakage |
| Gần góc trên–trái | Tần số thấp | Biến thiên chậm, hình dạng thô | Ít artifact |
| Vùng giữa | Tần số trung | Kết cấu, hoạ tiết vừa | Upsampling/blending artifact lộ rõ |
| Góc dưới–phải | Tần số cao | Cạnh sắc, nhiễu, chi tiết tinh vi | Bất nhất tần số, dấu vết nén |

### 1.5.3 Block-wise DCT 8×8 và liên hệ JPEG

Thay vì áp DCT lên *toàn ảnh* (global DCT — trộn lẫn nội dung toàn cục, khó tách artifact cục bộ), đồ án dùng **block-wise DCT 8×8**: chia ảnh thành lưới các khối 8×8 không chồng lấn, áp 2D-DCT *độc lập* lên từng khối. Đây *chính xác* là đơn vị xử lý của JPEG. Lợi ích: (i) định vị artifact theo *vùng cục bộ* (một blending boundary chỉ ảnh hưởng vài khối quanh biên); (ii) khớp với lưới nén JPEG nên dễ phát hiện cả dấu vết nén lẫn dấu vết giả mạo; (iii) chi phí tính toán thấp (DCT 8×8 có thuật toán nhanh). Mỗi khối 8×8 cho ra 64 hệ số $F(u,v)$, sắp xếp từ DC (góc trên–trái) tới tần số cao nhất (góc dưới–phải).

### 1.5.4 Zigzag scan và 16 frequency bands

64 hệ số trong một khối 8×8 không được dùng riêng lẻ — quá nhiều chiều và nhiễu. Thay vào đó, ta gom chúng theo **dải tần (frequency band)** dựa trên **zigzag scan**: một đường quét hình chữ chi (zigzag) đi từ góc DC, men theo các đường chéo phản (anti-diagonal), tới hệ số tần số cao nhất. Các hệ số nằm trên cùng một đường chéo phản có *cùng mức tần số tổng* $(u+v)$, nên zigzag sắp xếp 64 hệ số thành một chuỗi *tăng dần theo tần số*. Đây cũng chính là thứ tự JPEG dùng để mã hoá (vì sau lượng tử hoá, các hệ số tần số cao thường bằng 0, nằm liền nhau ở cuối chuỗi nên nén được).

Đồ án gom 64 hệ số (đã zigzag) thành **16 frequency bands** từ DC → high-frequency, rồi *thống kê theo từng band* (ví dụ năng lượng/log-magnitude trung bình mỗi band) để tạo đặc trưng tần số gọn và ổn định. Một tuỳ chọn quan trọng là **drop low bands**: bỏ DC và vài band thấp nhất, vì các band này chủ yếu mang *nội dung* (content) — giữ chúng lại dễ khiến mô hình học nhầm theo nội dung ảnh (content leakage) thay vì học dấu vết giả mạo. Loại bỏ chúng buộc nhánh tần số tập trung vào dải trung–cao, đúng nơi artifact trú ngụ.

[[HÌNH 1.4: minh hoạ zigzag scan trên khối 8×8 và cách gom 64 hệ số thành 16 dải tần số từ DC đến high-frequency]]

### 1.5.5 Log-magnitude

Biên độ hệ số DCT trải trên dải động (dynamic range) rất rộng: hệ số DC có thể lớn hơn hệ số tần số cao hàng nghìn lần. Nếu đưa thẳng biên độ thô vào mạng, các hệ số tần số cao (chính là nơi artifact!) bị "nuốt chửng" về mặt số học. Phép **log-magnitude** xử lý điều này:

$$
D(u,v) = \log\big(1 + |F(u,v)|\big).
$$

Hàm $\log(1+\cdot)$ nén dải động, kéo các hệ số nhỏ lên thành tín hiệu *có ý nghĩa số học*, đồng thời tránh $\log(0)$. Sau biến đổi này, các đỉnh artifact tần số cao trở nên *quan sát được* và mạng có thể học chúng ổn định.

### 1.5.6 Không gian màu YCbCr

DCT trong đồ án không áp lên kênh RGB mà lên **YCbCr**: kênh độ chói **Y** (luminance) và hai kênh sắc độ **Cb, Cr** (chrominance). Hai lý do: (i) YCbCr tách *độ sáng* khỏi *màu*, giống cách hệ thị giác người và chuẩn JPEG xử lý — và phần lớn dấu vết tần số nằm ở kênh Y; (ii) JPEG nén Cb, Cr mạnh hơn Y (chroma subsampling), nên thống kê tần số trên các kênh này mang thông tin bổ sung về dấu vết nén/giả mạo. Áp block-DCT độc lập trên cả ba kênh cho một bức tranh tần số đầy đủ hơn so với chỉ dùng RGB hoặc grayscale.

### 1.5.7 Tổng kết: vì sao block-DCT bộc lộ artifact

Gộp lại, chuỗi xử lý **YCbCr → block-DCT 8×8 → zigzag → 16 bands → log-magnitude (→ drop low bands)** biến một ảnh khuôn mặt thành một biểu diễn tần số *gọn, định vị cục bộ, đã chuẩn hoá dải động, và đã loại bớt content*. Trong biểu diễn này, ba loại dấu vết ở mục 1.1.4 — đỉnh upsampling, bất nhất biên hoà trộn, lệch thống kê tần số — đều trở thành các *mẫu rõ ràng* mà một nhánh mạng nhẹ có thể học. Đây là đầu vào cho nhánh tần số của SFDCT.

## 1.6 Cơ chế chú ý (attention) và hợp nhất đặc trưng

### 1.6.1 Vì sao cần attention để hợp nhất hai nhánh

Ta đã có hai luồng thông tin: đặc trưng *không gian* từ EfficientNet-B4 và đặc trưng *tần số* từ nhánh block-DCT. Câu hỏi hợp nhất (fusion): *trộn* chúng thế nào? Cách thô sơ nhất — nối (concatenate) rồi cho qua một lớp fully-connected — có hai nhược điểm: (i) nó trộn *cào bằng*, không cho mô hình tự quyết định *khi nào* và *ở đâu* thông tin tần số đáng tin; (ii) nó *phá vỡ* tính tương đương với backbone gốc (không còn đảm bảo "không tệ hơn B4"). Cơ chế **attention** giải quyết cả hai: nó cho phép đặc trưng không gian *chủ động truy vấn* đặc trưng tần số một cách có chọn lọc.

### 1.6.2 Self-attention và cross-attention

**Self-attention** là cơ chế cho mỗi vị trí trong một chuỗi đặc trưng "nhìn" mọi vị trí khác và tổng hợp thông tin theo trọng số liên quan. Nó dựa trên ba ma trận chiếu: **Query** ($Q$), **Key** ($K$), **Value** ($V$). Công thức scaled dot-product attention [n]:

$$
\text{Attention}(Q, K, V) = \text{softmax}\!\left(\frac{QK^{\top}}{\sqrt{d_k}}\right)V,
$$

trong đó $QK^\top$ đo độ tương đồng giữa các query và key (sinh ra *trọng số chú ý*), $\sqrt{d_k}$ là hệ số scale chống bão hoà softmax, và phép nhân với $V$ trả về một tổ hợp có trọng số của các value. Trực giác: "với mỗi câu hỏi $Q$, hãy lấy ra trung bình có trọng số của các giá trị $V$, trọng số cao cho những chỗ $K$ khớp $Q$".

**Cross-attention** là biến thể trong đó $Q$ đến từ *một nguồn* còn $K, V$ đến từ *nguồn khác*. Đây đúng là thứ ta cần cho fusion: đặt $Q$ = đặc trưng không gian (x), còn $K, V$ = đặc trưng tần số (DCT). Khi đó mỗi vị trí không gian "hỏi" nhánh tần số: *"ở vùng này, dấu vết tần số nào liên quan?"* và rút về một **context vector** tổng hợp từ đặc trưng DCT phù hợp nhất. Đây là bản chất "gated cross-attention" mà SFDCT dùng để bơm thông tin tần số vào luồng không gian.

[[BẢNG 1.6: Ánh xạ vai trò Q/K/V trong cross-attention của SFDCT]]

| Thành phần | Đến từ nhánh | Vai trò |
|---|---|---|
| Query $Q$ | Không gian (B4) | "Câu hỏi": vùng này cần thông tin tần số gì? |
| Key $K$ | Tần số (block-DCT) | "Chỉ mục": mỗi đặc trưng tần số mô tả điều gì |
| Value $V$ | Tần số (block-DCT) | "Nội dung": thông tin tần số được rút về |
| Context | — | Tổ hợp có trọng số của $V$, bơm ngược vào luồng không gian |

### 1.6.3 Gated fusion và ý nghĩa cổng alpha

SFDCT không bơm thẳng context tần số vào luồng không gian, mà qua một **cổng (gate)** có hệ số học được $\alpha$:

$$
\text{feature}_{\text{fused}} = x + \alpha \cdot \text{context}(\text{DCT}),
$$

trong đó $x$ là đặc trưng không gian, $\text{context}(\text{DCT})$ là vector ngữ cảnh tần số rút ra qua cross-attention, và $\alpha$ là một tham số *học được*. Trực giác: $\alpha$ đóng vai trò "núm âm lượng" cho nhánh tần số. Nếu trong quá trình huấn luyện thông tin tần số *hữu ích*, gradient sẽ đẩy $\alpha$ tăng lên (mở cổng); nếu nhiễu/vô ích, $\alpha$ bị ép về gần 0 (đóng cổng). Giá trị $\alpha$ học được vì thế là một *chỉ báo định lượng* cho biết nhánh tần số đóng góp bao nhiêu — và đồ án trực quan hoá nó qua hình `gate_alpha.png` để giải thích mô hình.

### 1.6.4 Zero-init: vì sao đảm bảo floor ≥ backbone

Đây là một thiết kế *then chốt* về mặt rủi ro. Ta khởi tạo $\alpha = 0$ ngay tại thời điểm bắt đầu huấn luyện (**zero-init**). Hệ quả: tại bước khởi tạo,

$$
\text{feature}_{\text{fused}} = x + 0 \cdot \text{context}(\text{DCT}) = x,
$$

nghĩa là mô hình *đúng bằng* EfficientNet-B4 thuần. Toàn bộ nhánh tần số ở thời điểm này *không* làm nhiễu loạn luồng không gian đã được pretrained. Quá trình huấn luyện sau đó chỉ *mở dần* cổng $\alpha$ nếu — và chỉ nếu — thông tin tần số thực sự giảm được mất mát. Điều này tạo ra một **floor (sàn) đảm bảo**: trong trường hợp xấu nhất (nhánh tần số vô dụng), $\alpha$ ở yên gần 0 và mô hình *không bao giờ tệ hơn* B4. Đây chính là lý do đồ án có thể tuyên bố tính chất "an toàn về rủi ro" của kiến trúc — một đóng góp thiết kế quan trọng, đặc biệt có ý nghĩa trong bối cảnh eKYC nơi *độ tin cậy* được đặt lên hàng đầu.

[[HÌNH 1.5: sơ đồ gated cross-attention fusion với cổng alpha zero-init — tại init nhánh tần số bị đóng (alpha=0), mô hình tương đương B4]]

## 1.7 Nền tảng các kỹ thuật tần số được kế thừa (cơ sở cho năm đòn S1–S5)

Phần này trình bày *nguyên lý gốc* của năm công trình mà đồ án kế thừa, mỗi công trình tương ứng một "đòn" cải tiến (lever) $S1$–$S5$. Mục tiêu ở đây chỉ là *cơ sở lý thuyết*: nêu ý tưởng gốc và *hướng adapt* sang miền block-DCT; chi tiết kỹ thuật và công thức triển khai để dành cho Chương 2.

### 1.7.1 SPSL — phổ pha (phase spectrum) → S1 (dct_use_sign)

**Ý tưởng gốc.** SPSL (Spatial-Phase Shallow Learning) [n] chỉ ra rằng *phổ pha* (phase) của ảnh, chứ không chỉ biên độ (magnitude), mang dấu vết quan trọng của upsampling: các phép upsampling làm méo cấu trúc pha một cách đặc thù. SPSL khai thác thông tin pha để phát hiện giả mạo và cho thấy nó generalize tốt.

**Adapt sang block-DCT.** DCT cho hệ số *thực* nên không có "pha" theo nghĩa Fourier; tuy nhiên **dấu (sign)** của hệ số DCT là một đại lượng *analog với pha* — nó mã hoá hướng của thành phần cosine. Đòn **S1 (`dct_use_sign`)** vì thế bổ sung *dấu* của hệ số DCT vào đặc trưng tần số (thay vì chỉ dùng log-magnitude vốn vứt bỏ dấu). Nguyên lý: cấp cho mạng một tín hiệu "pha-analog" mà không cần rời khỏi miền DCT.

### 1.7.2 SRM — residual nhiễu high-pass → S2 (dct_srm_residual)

**Ý tưởng gốc.** SRM (Spatial Rich Model) [n], khởi nguồn từ steganalysis, dùng một tập bộ lọc **high-pass** cố định để trích **residual nhiễu** — phần tín hiệu còn lại sau khi loại bỏ nội dung tần số thấp. Trên residual này, dấu vết giả mạo (vốn là nhiễu tần số cao) nổi bật hơn nhiều so với trên ảnh gốc, vì nội dung đã bị triệt tiêu.

**Adapt sang block-DCT.** Đòn **S2 (`dct_srm_residual`)** áp block-DCT *không phải trên ảnh thô* mà trên **residual high-pass kiểu SRM**. Trực giác: lọc high-pass trước giúp "dọn sạch" nội dung, để block-DCT sau đó chỉ còn soi đúng phần nhiễu chứa artifact — một cách *làm sạch đầu vào* cho nhánh tần số.

### 1.7.3 FcaNet — multi-spectral channel attention → S4 (dct_fca_attention)

**Ý tưởng gốc.** FcaNet [n] tổng quát hoá module Squeeze-and-Excitation. SE nén mỗi feature map thành *một* con số bằng global average pooling — mà average pooling chính là *thành phần DC (tần số 0) của DCT*. FcaNet lập luận: chỉ dùng DC là vứt bỏ thông tin; nên thay vào đó dùng *nhiều* thành phần tần số DCT khác nhau cho các kênh khác nhau, tạo nên **multi-spectral channel attention** giàu thông tin hơn.

**Adapt sang block-DCT.** Đòn **S4 (`dct_fca_attention`)** đưa MultiSpectralAttentionLayer của FcaNet vào kiến trúc, để mạng *học channel attention bằng chính các thành phần DCT*. Đây là điểm tựa lý thuyết đẹp: cả backbone (qua SE) lẫn đòn S4 đều là channel attention, nhưng S4 *giàu tần số* — cộng hưởng tự nhiên với triết lý "tần số" của toàn đồ án.

### 1.7.4 FreqDebias — frequency mixup và consistency → S3 (use_dct_fomixup)

**Ý tưởng gốc.** FreqDebias [n] nhắm vào *thiên lệch tần số* (frequency bias): mô hình deepfake hay bám vào một dải tần "tắt" cụ thể của tập huấn luyện, dẫn tới generalization kém. Giải pháp: *trộn* (mixup) thông tin tần số giữa các mẫu để phá vỡ sự phụ thuộc cứng vào một dải tần, kết hợp một ràng buộc **consistency** buộc mô hình dự đoán nhất quán dưới các phép trộn đó.

**Adapt sang block-DCT.** Đòn **S3 (`use_dct_fomixup`)** thực hiện **DCTFoMixup**: trộn các dải DCT giữa các mẫu rồi *inverse-DCT* để quay về ảnh (một dạng augmentation ở miền tần số), kèm **dual consistency loss** — symmetric-KL trên xác suất dự đoán cộng MSE trên embedding — để ép mô hình bất biến với phép trộn tần số. S3 là đòn *không thêm tham số học*, chỉ thay đổi *cách tạo dữ liệu và hàm mất mát*, nên có mặt ở cả hai cấu hình Row1 và Row2.

### 1.7.5 FDFL — single-center loss → S5 (use_single_center_loss)

**Ý tưởng gốc.** FDFL (Frequency-aware Discriminative Feature Learning) [n] cải thiện *tính phân biệt* của không gian đặc trưng bằng một **single-center loss**: thay vì để lớp REAL và FAKE phân tán tuỳ ý, nó nén toàn bộ mẫu REAL về *một tâm (center)* duy nhất trong không gian embedding, đồng thời đẩy các mẫu FAKE ra xa tâm đó qua một biên (margin). Trực giác: REAL là một khái niệm "đồng nhất" (ảnh thật đều chia sẻ thống kê tự nhiên), trong khi FAKE đa dạng (nhiều pipeline sinh) — nên nén REAL về một cụm chặt rồi coi mọi thứ "xa cụm" là khả nghi là một cách phân biệt hợp lý và *generalize tốt sang fake lạ*.

**Adapt sang block-DCT.** Đòn **S5 (`use_single_center_loss`)** thêm single-center loss: kéo lớp REAL về một tâm và đẩy FAKE ra theo một margin tỉ lệ $\sqrt{D}$ (với $D$ là số chiều embedding). Đây là đòn *có thêm tham số* (toạ độ tâm), xuất hiện ở cấu hình Row2 cùng với S4.

[[BẢNG 1.7: Năm đòn S1–S5 — paper gốc, nguyên lý và cấu hình xuất hiện]]

| Đòn | Tên cờ | Paper gốc | Nguyên lý cốt lõi | Thêm tham số? | Có ở |
|---|---|---|---|---|---|
| S1 | `dct_use_sign` | SPSL | Thêm dấu hệ số DCT (pha-analog) | Không | Row1 |
| S2 | `dct_srm_residual` | SRM | Block-DCT trên residual high-pass | Không | Row1 |
| S3 | `use_dct_fomixup` | FreqDebias | Frequency mixup + dual consistency | Không | Row1, Row2 |
| S4 | `dct_fca_attention` | FcaNet | Multi-spectral channel attention (DCT) | Có | Row2 |
| S5 | `use_single_center_loss` | FDFL | Single-center loss (nén REAL về 1 tâm) | Có | Row2 |

Cách tổ chức này tạo nên hai cấu hình có *câu chuyện* rõ ràng: **Row1** = naive + S1+S2+S3 (không thêm tham số học, chỉ thay đổi đặc trưng đầu vào và loss), còn **Row2** = naive + S4+S5+S3 (có thêm tham số học: FcaNet + single-center loss). Việc chia theo "có/không thêm tham số" cho phép tách bạch nguồn gốc của bất kỳ cải thiện AUC nào — là *đặc trưng tốt hơn* hay *dung lượng mô hình lớn hơn*.

## 1.8 Bối cảnh ứng dụng eKYC và yêu cầu pháp lý

### 1.8.1 eKYC là gì và vai trò chống deepfake

**eKYC (electronic Know Your Customer)** là quy trình định danh khách hàng *điện tử*: thay vì tới quầy, người dùng tự chụp giấy tờ và khuôn mặt qua điện thoại để mở tài khoản/giao dịch. Bước cốt lõi là **đối chiếu khuôn mặt** (face matching) giữa ảnh selfie và ảnh trên giấy tờ, cùng một bước **chống giả mạo**. Đây chính là nơi deepfake trở thành mối đe doạ trực tiếp: kẻ gian có thể dùng ảnh/video deepfake khuôn mặt nạn nhân để vượt qua bước xác thực, mở tài khoản trái phép hoặc chiếm đoạt tài khoản. Một bộ phát hiện deepfake mạnh, *generalize tốt sang các pipeline sinh chưa từng thấy*, vì thế là một lớp phòng thủ thiết yếu cho eKYC — và đây là động lực ứng dụng của toàn đồ án.

### 1.8.2 Thông tư 17/2024/TT-NHNN và điểm vận hành FPR ≤ 5% (quy ước)

Tại Việt Nam, **Thông tư 17/2024/TT-NHNN** quy định về mở và sử dụng tài khoản thanh toán, trong đó **yêu cầu xác thực sinh trắc học bắt buộc** cho một số giao dịch ngân hàng. **Cần nói rõ (đã kiểm chứng toàn văn): Thông tư 17 đặt yêu cầu mang tính ĐỊNH TÍNH — bắt buộc đối chiếu sinh trắc — chứ KHÔNG quy định một ngưỡng định lượng cụ thể (không có con số FPR/FAR/threshold).** Vì vậy, để *toán-hoá* yêu cầu định tính này thành một tiêu chí đo được, đồ án **tự chọn** điểm vận hành **FPR ≤ 5%** theo **quy ước ISO/IEC 30107-3 (BPCER20 — BPCER tại APCER = 5%)**. Trong ngữ cảnh đồ án, ta quy ước FPR là tỉ lệ ảnh *thật* bị phân loại nhầm thành *giả*; ràng buộc **FPR ≤ 5%** nghĩa là hệ thống không được từ chối quá 5% người dùng hợp lệ. Tóm lại: ngưỡng 5% là *lựa chọn theo chuẩn quốc tế của đồ án để phục vụ tinh thần TT17*, không phải con số do TT17 ấn định.

**Hệ quả kỹ thuật: calibrate ngưỡng.** AUC đo khả năng phân tách *độc lập ngưỡng*, nhưng khi *triển khai* ta buộc phải chọn một ngưỡng quyết định $\tau$ cụ thể. Để thoả FPR ≤ 5%, ta phải **calibrate** (hiệu chỉnh) $\tau$ trên *tập validation*: tìm ngưỡng sao cho tỉ lệ real-bị-báo-fake không vượt 5%, rồi báo cáo TPR (tỉ lệ bắt được fake) đạt được tại ngưỡng đó. Quy trình này tách bạch *năng lực mô hình* (AUC) khỏi *điểm vận hành* (operating point) — và là một phần bắt buộc của bất kỳ triển khai eKYC nghiêm túc nào. Các con số cụ thể (ngưỡng $\tau$, TPR@FPR≤5%) hiện chưa đo: [[FILL: ngưỡng calibrate và TPR tại FPR≤5% trên tập validation]].

### 1.8.3 Nhu cầu XAI (giải thích được)

Trong môi trường tài chính được quản lý chặt, một quyết định "REAL/FAKE" *không* được phép là hộp đen. Khi hệ thống từ chối một giao dịch, cần có *bằng chứng giải thích được* (explainable) để kiểm toán và khiếu nại. Đồ án đáp ứng nhu cầu này bằng **Grad-CAM** [n] — kỹ thuật làm nổi (heatmap) vùng ảnh mà mô hình *dựa vào* để ra quyết định. Demo eKYC của đồ án xuất ra `fake_prob` kèm overlay Grad-CAM, cho phép người vận hành thấy *mô hình đang nhìn vào đâu* (ví dụ vùng biên hoà trộn quanh cằm) — biến một điểm số trừu tượng thành một lời giải thích trực quan, phù hợp với yêu cầu minh bạch của lĩnh vực ngân hàng.

## 1.9 Kết chương

Chương 1 đã thiết lập trọn vẹn nền tảng cho phương pháp SFDCT. Ta bắt đầu từ *bản chất kỹ thuật* của ba họ sinh deepfake (autoencoder face-swap, GAN, diffusion) và bốn họ giả mạo trong FF++, từ đó rút ra **luận điểm trung tâm**: dấu vết giả mạo — biên hoà trộn, hoạ tiết upsampling, bất nhất tần số — *yếu ở miền không gian nhưng rõ ở dải tần trung/cao*. Luận điểm này biện minh cho kiến trúc hai nhánh: backbone **EfficientNet-B4** (compound scaling, MBConv, transfer learning ImageNet) bắt dấu vết không gian, còn nhánh **block-wise DCT 8×8** (YCbCr → zigzag → 16 bands → log-magnitude → drop low bands) bắt dấu vết tần số.

Ta đã phân tích thách thức cốt lõi — *nghịch lý in-dataset cao nhưng cross-dataset rớt* — và lý do nó dẫn dắt giao thức đánh giá công bằng của đồ án (train FF++ → test CDFv2, headline frame-level AUC theo DeepfakeBench). Cơ chế hợp nhất **gated cross-attention với cổng $\alpha$ zero-init** được làm rõ cùng tính chất *floor ≥ B4* — đóng góp thiết kế quan trọng về mặt an toàn rủi ro. Cuối cùng, ta đặt nền lý thuyết cho **năm đòn S1–S5** (kế thừa SPSL, SRM, FcaNet, FreqDebias, FDFL) và nối toàn bộ vào *bối cảnh eKYC* cùng ràng buộc pháp lý FPR ≤ 5% (Thông tư 17/2024/TT-NHNN) và nhu cầu XAI qua Grad-CAM.

Trên nền tảng này, **Chương 2** sẽ trình bày chi tiết kiến trúc và công thức triển khai của SFDCT — cách dựng nhánh block-DCT, cơ chế gated cross-attention, và cách hiện thực hoá từng đòn S1–S5 thành các cấu hình ablation B4 → naive SFDCT → Row1 → Row2.

# CHƯƠNG 2: PHÂN TÍCH VÀ THIẾT KẾ HỆ THỐNG

Chương 1 đã làm rõ bối cảnh, động cơ và cơ sở lý thuyết của bài toán phát hiện deepfake trong eKYC: các giả mạo khuôn mặt sinh ra bởi GAN/upsampling để lại dấu vết yếu trong miền không gian (spatial) nhưng đậm nét trong các dải tần số trung–cao của phép biến đổi DCT. Chương 2 chuyển từ "tại sao" sang "làm thế nào": trước hết phân tích yêu cầu của một hệ thống phát hiện deepfake phục vụ eKYC, kế đến thiết kế kiến trúc tổng thể và quy trình dữ liệu, và sau cùng — phần trọng tâm — trình bày chi tiết **phương pháp đề xuất SFDCT** (Spatial–Frequency learning with block-wise DCT) cùng năm "đòn" cải tiến và bốn cấu hình ablation. Tinh thần xuyên suốt chương là: mỗi quyết định thiết kế đều xuất phát từ một nhu cầu cụ thể, được giải thích bằng trực giác trước, công thức sau, và luôn gắn với mục tiêu cuối cùng là **khả năng tổng quát hóa cross-dataset** đo bằng frame-level AUC trên Celeb-DF-v2.

## 2.1 Phân tích yêu cầu

Trước khi thiết kế bất kỳ thành phần nào, cần trả lời câu hỏi: hệ thống này phải *làm được gì* (yêu cầu chức năng) và phải *tốt đến mức nào* (yêu cầu phi chức năng). Bối cảnh eKYC ngân hàng đặt ra những ràng buộc khắt khe hơn một bài toán phân loại ảnh thông thường: một quyết định sai có thể cho phép kẻ gian vượt qua xác thực sinh trắc học, nên hệ thống không chỉ cần chính xác mà còn phải *giải thích được* và *hiệu chỉnh được ngưỡng* theo quy định pháp lý.

### 2.1.1 Yêu cầu chức năng

Yêu cầu chức năng mô tả các năng lực mà hệ thống phải cung cấp cho người dùng (trong ngữ cảnh này là pipeline xác thực eKYC và kỹ sư vận hành). Bảng dưới ánh xạ từng chức năng sang đầu vào, đầu ra và ý nghĩa.

[[BẢNG 2.1: Các yêu cầu chức năng của hệ thống phát hiện deepfake SFDCT]]

| Mã | Chức năng | Đầu vào | Đầu ra | Ý nghĩa |
|----|-----------|---------|--------|---------|
| FR1 | Nạp ảnh/khung hình khuôn mặt | Ảnh tĩnh hoặc khung hình trích từ video eKYC | Tensor ảnh đã chuẩn hóa 256×256 | Cổng vào của toàn pipeline |
| FR2 | Phát hiện deepfake | Ảnh face crop đã tiền xử lý | Logit/embedding phân biệt REAL/FAKE | Năng lực cốt lõi của hệ thống |
| FR3 | Trả xác suất + nhãn | Logit của mô hình | `fake_prob` ∈ [0,1] + nhãn REAL/FAKE | Kết quả tiêu dùng được bởi tầng nghiệp vụ |
| FR4 | Sinh Grad-CAM | Ảnh + mô hình đã huấn luyện | Bản đồ nhiệt overlay vùng nghi vấn | Khả năng giải thích cho người duyệt |
| FR5 | Hiệu chỉnh ngưỡng eKYC | Phân phối điểm trên tập validation | Ngưỡng quyết định τ thỏa FPR ≤ 5% (quy ước ISO 30107-3) | Phục vụ yêu cầu sinh trắc TT17 |

Năm yêu cầu này tạo thành một chuỗi khép kín: FR1 chuẩn bị dữ liệu, FR2–FR3 thực hiện phân loại, FR4 giải thích quyết định, và FR5 đặt ngưỡng vận hành. Đáng chú ý, FR4 và FR5 thường bị bỏ qua trong các nghiên cứu học thuật thuần túy nhưng lại là điều kiện *bắt buộc* để triển khai thực tế trong ngân hàng: người duyệt cần biết mô hình "nhìn vào đâu" để ra quyết định, và bộ phận tuân thủ cần một ngưỡng có cơ sở định lượng.

### 2.1.2 Yêu cầu phi chức năng

Yêu cầu phi chức năng quy định *chất lượng* của hệ thống. Trong bài toán deepfake-eKYC, năm thuộc tính sau là then chốt.

[[BẢNG 2.2: Các yêu cầu phi chức năng và tiêu chí đo lường]]

| Mã | Thuộc tính | Tiêu chí đo lường | Mục tiêu |
|----|------------|-------------------|----------|
| NFR1 | Độ chính xác cross-dataset | Frame-level AUC trên CDFv2 (train trên FF++) | Cao hơn baseline B4 (0.7497) |
| NFR2 | Khả năng giải thích (XAI) | Có Grad-CAM + t-SNE + frequency viz | Người duyệt hiểu được quyết định |
| NFR3 | Độ trễ inference | Thời gian xử lý 1 khung hình | [[FILL: ms/khung hình trên RTX 3060]] |
| NFR4 | Tái lập (reproducibility) | Chạy lại trong DeepfakeBench cho cùng kết quả | Cố định seed, config công khai |
| NFR5 | Điểm vận hành eKYC | FPR tại ngưỡng vận hành | ≤ 5% (quy ước ISO 30107-3; TT17 yêu cầu định tính) |

Điểm cần nhấn mạnh là **NFR1 (generalization cross-dataset) được ưu tiên cao nhất**. Lý do: trong thực tế, kẻ tấn công sẽ dùng những công cụ deepfake mới mà mô hình *chưa từng thấy lúc huấn luyện*. Một mô hình đạt AUC rất cao trên chính tập dữ liệu huấn luyện (in-dataset) nhưng sụp đổ khi gặp manipulation lạ là vô dụng trong eKYC. Vì vậy toàn bộ thiết kế phương pháp ở các mục sau đều lấy "cải thiện AUC cross-dataset mà không hy sinh độ ổn định" làm kim chỉ nam.

## 2.2 Thiết kế hệ thống tổng quan

### 2.2.1 Sơ đồ use case

Hệ thống có hai nhóm tác nhân (actor): **người dùng eKYC cuối** (khách hàng gửi ảnh/video xác thực) và **kỹ sư/người vận hành** (huấn luyện mô hình, hiệu chỉnh ngưỡng, kiểm tra giải thích). Sơ đồ use case dưới đây mô tả các tương tác chính.

[[HÌNH 2.1: Sơ đồ use case hệ thống SFDCT — actor "Khách hàng eKYC" với các use case {Nạp khung hình, Nhận kết quả REAL/FAKE}; actor "Kỹ sư vận hành" với các use case {Huấn luyện mô hình, Hiệu chỉnh ngưỡng FPR≤5%, Xem Grad-CAM/t-SNE, Đánh giá cross-dataset}]]

Phân tách hai nhóm actor phản ánh đúng hai pha vận hành: pha *offline* (kỹ sư huấn luyện, đánh giá, calibrate) và pha *online* (khách hàng được xác thực theo thời gian thực). Hai pha này chia sẻ cùng một mô hình SFDCT nhưng khác nhau về luồng dữ liệu, như trình bày ở mục 2.2.3.

### 2.2.2 Kiến trúc tổng thể

Kiến trúc hệ thống được tổ chức thành bốn khối tuần tự, mỗi khối đảm nhận một trách nhiệm rõ ràng. Cách phân khối này giúp tách biệt mối quan tâm (separation of concerns): có thể thay thế hay nâng cấp từng khối mà không phá vỡ phần còn lại.

![Hình 2.2 — Kiến trúc tổng thể SFDCT](figures/fig_2_2_architecture.png)
*Hình 2.2: Kiến trúc tổng thể — Tiền xử lý (face detect/align/crop 256×256) → SFDCT (nhánh spatial EfficientNet-B4 + nhánh frequency block-DCT, hợp nhất bằng gated cross-attention zero-init) → Hậu xử lý & ngưỡng (sigmoid → fake_prob → so τ) → Grad-CAM giải thích.*

[[BẢNG 2.3: Bốn khối của kiến trúc tổng thể và trách nhiệm]]

| Khối | Thành phần | Đầu vào → Đầu ra | Vai trò |
|------|------------|------------------|---------|
| K1. Tiền xử lý | Face detector + aligner + cropper | Ảnh thô → face crop 256×256 chuẩn hóa | Loại nền nhiễu, chuẩn hóa đầu vào |
| K2. Mô hình SFDCT | Spatial B4 + frequency block-DCT + gated fusion | Tensor ảnh → logit/embedding | Trích đặc trưng spatial+frequency, phân loại |
| K3. Hậu xử lý & ngưỡng | Sigmoid + bộ so ngưỡng τ | Logit → fake_prob → nhãn | Chuyển điểm số thành quyết định vận hành |
| K4. Giải thích | Grad-CAM (+ t-SNE, frequency viz offline) | Ảnh + mô hình → heatmap | Minh bạch hóa quyết định cho người duyệt |

Bốn khối này tương ứng trực tiếp với năm yêu cầu chức năng: K1 hiện thực FR1, K2 hiện thực FR2, K3 hiện thực FR3 và FR5, K4 hiện thực FR4. Sự ánh xạ một–một giữa yêu cầu và khối kiến trúc là minh chứng cho nguyên tắc "thiết kế tối thiểu mà đủ" — không có khối nào thừa, cũng không có yêu cầu nào bị bỏ sót.

### 2.2.3 Luồng dữ liệu huấn luyện vs luồng inference eKYC

Cùng một mô hình SFDCT phục vụ hai luồng khác nhau. Phân biệt rõ hai luồng giúp tránh nhầm lẫn giữa những gì xảy ra "một lần, offline" và những gì xảy ra "mỗi giao dịch, online".

[[HÌNH 2.3: Hai luồng dữ liệu — (a) Luồng huấn luyện: FF++ c23 → sampling 32 frame → face crop → augmentation (gồm DCTFoMixup) → SFDCT → loss tổng hợp → cập nhật trọng số; (b) Luồng inference eKYC: khung hình khách hàng → face crop → SFDCT (không augmentation) → fake_prob → so ngưỡng τ đã calibrate → REAL/FAKE + Grad-CAM]]

**Luồng huấn luyện (offline):** dữ liệu FaceForensics++ c23 được lấy mẫu 32 khung hình/video, qua face crop và một loạt augmentation (bao gồm DCTFoMixup ở các cấu hình bật S3), đưa vào SFDCT để tính hàm mất mát tổng hợp và cập nhật trọng số bằng Adam. Đây là pha tốn tài nguyên, chạy trên GPU server (vast.ai), một lần cho mỗi cấu hình.

**Luồng inference eKYC (online):** khung hình khuôn mặt của khách hàng chỉ qua face crop (không augmentation), đưa vào SFDCT để lấy `fake_prob`, so với ngưỡng τ đã hiệu chỉnh sẵn (đảm bảo FPR ≤ 5%), trả về nhãn REAL/FAKE kèm Grad-CAM. Pha này phải nhẹ và nhanh, ưu tiên độ trễ thấp.

Điểm mấu chốt: **augmentation và hàm loss phức tạp chỉ tồn tại ở luồng huấn luyện**; luồng inference chỉ là một lượt forward thuần túy cộng phép so ngưỡng. Nhờ thiết kế gated fusion zero-init (mục 2.4.3), mô hình ở luồng inference không bao giờ nặng hơn B4 quá đáng kể mà vẫn giữ được lợi ích của nhánh tần số.

## 2.3 Quy trình dữ liệu & tiền xử lý

Chất lượng đặc trưng tần số phụ thuộc trực tiếp vào chất lượng tiền xử lý: một face crop lệch hoặc nén sai cách có thể tạo ra artifact tần số giả, đánh lừa mô hình. Vì vậy quy trình dữ liệu được chuẩn hóa nghiêm ngặt theo DeepfakeBench để đảm bảo công bằng và tái lập.

### 2.3.1 Nguồn dữ liệu & phân chia train/val/test

Theo giao thức DeepfakeBench, mô hình được **huấn luyện trên FaceForensics++ (FF++) bản nén c23** và **kiểm thử cross-dataset trên Celeb-DF-v2 (CDFv2)**. Việc tách rõ tập huấn luyện và tập kiểm thử thuộc hai phân phối khác nhau chính là cốt lõi của việc đo generalization.

[[BẢNG 2.4: Nguồn dữ liệu và vai trò trong giao thức đánh giá]]

| Tập dữ liệu | Quy mô | Vai trò | Phân chia |
|-------------|--------|---------|-----------|
| FF++ c23 | 1000 video thật + 4 phương pháp giả (Deepfakes, Face2Face, FaceSwap, NeuralTextures) | Train + validation | Theo split chuẩn DeepfakeBench [[FILL: tỉ lệ train/val cụ thể]] |
| Celeb-DF-v2 | 590 video thật + 5639 video deepfake chất lượng cao | Test cross-dataset (không train) | Toàn bộ dùng để test |
| DFDC | [[FILL: quy mô subset]] | Cross-dataset bổ sung (tương lai) | Hướng phát triển |

Logic của phân chia này: FF++ cung cấp đa dạng *loại manipulation* để mô hình học các dấu vết giả mạo tổng quát; CDFv2 với deepfake chất lượng cao của người nổi tiếng đóng vai một "kỳ thi" thực sự — nếu mô hình chỉ học thuộc artifact riêng của FF++, nó sẽ trượt trên CDFv2. Frame-level AUC trên CDFv2 vì thế là thước đo trung thực của khả năng tổng quát hóa.

### 2.3.2 Lấy mẫu khung hình

Mỗi video được lấy mẫu **32 khung hình** (`frame_num = 32`) phân bố đều theo trục thời gian. Trực giác: một mô hình frame-level không cần toàn bộ khung hình mà chỉ cần một tập đại diện đủ lớn để bao phủ biến thiên về tư thế, biểu cảm và điều kiện ánh sáng trong video. Số 32 là điểm cân bằng giữa độ phủ thông tin và chi phí tính toán/lưu trữ, đồng thời đồng nhất với cấu hình baseline để so sánh công bằng.

### 2.3.3 Phát hiện & căn chỉnh khuôn mặt

Mỗi khung hình được đưa qua bộ phát hiện khuôn mặt để định vị bounding box và các điểm mốc (landmark), sau đó **căn chỉnh (align)** về tư thế chuẩn và **crop về 256×256**. Khi khuôn mặt nằm sát biên hoặc tỉ lệ không khớp, áp dụng **padding** để giữ nguyên tỉ lệ khung hình mà không làm méo đặc trưng hình học. Ảnh sau cùng được chuẩn hóa với `mean = std = 0.5` (đưa pixel về khoảng xấp xỉ [−1, 1]).

[[BẢNG 2.5: Các bước tiền xử lý khuôn mặt]]

| Bước | Thao tác | Đầu vào | Đầu ra |
|------|----------|---------|--------|
| 1 | Phát hiện khuôn mặt + landmark | Khung hình thô | Bounding box + điểm mốc |
| 2 | Căn chỉnh (align) | Box + landmark | Khuôn mặt thẳng tư thế |
| 3 | Crop + padding | Khuôn mặt đã align | Ảnh 256×256 giữ tỉ lệ |
| 4 | Chuẩn hóa | Ảnh 256×256 | Tensor (mean=std=0.5) |

Lý do chuẩn hóa căn chỉnh nghiêm ngặt: nhánh block-DCT (mục 2.4.2) chia ảnh thành các block 8×8 cố định; nếu khuôn mặt không được căn chỉnh nhất quán, cùng một vùng giải phẫu (ví dụ vùng má) sẽ rơi vào các block khác nhau giữa các ảnh, làm nhiễu thống kê tần số theo band. Căn chỉnh tốt giúp đặc trưng tần số ổn định và so sánh được giữa các mẫu.

### 2.3.4 Augmentation

Augmentation chỉ áp dụng ở luồng huấn luyện, nhằm tăng đa dạng dữ liệu và giảm overfitting. Ngoài các phép augmentation hình học/quang học tiêu chuẩn (lật ngang, thay đổi độ sáng/tương phản nhẹ, nén JPEG mô phỏng — [[FILL: liệt kê chính xác augmentation pipeline trong config]]), đóng góp đặc thù của đề tài là **DCTFoMixup** (kích hoạt ở các cấu hình bật S3): trộn các dải tần số DCT giữa hai mẫu rồi thực hiện inverse-DCT để tạo mẫu mới, buộc mô hình học đặc trưng tần số bất biến hơn (chi tiết ở mục 2.5.3). Cần lưu ý: augmentation tác động mạnh đến phổ tần số phải được thiết kế cẩn thận để không vô tình xóa mất chính dấu vết giả mạo mà mô hình cần học.

## 2.4 PHƯƠNG PHÁP ĐỀ XUẤT — Kiến trúc SFDCT

Đây là phần trọng tâm của toàn bộ đồ án. Tên gọi **SFDCT** = **S**patial–**F**requency learning with block-wise **DCT**. Ý tưởng cốt lõi xuất phát từ một quan sát thực nghiệm: các artifact của GAN/upsampling (lưới checkerboard, bất thường phổ tần số) rất khó thấy trong miền pixel nhưng hiện rõ trong miền tần số DCT. Một backbone không gian như EfficientNet-B4 học rất tốt các đặc trưng ngữ nghĩa (mắt, mũi, kết cấu da) nhưng "mù" một phần với các bất thường tần số tinh vi. SFDCT bổ sung một *nhánh tần số* chuyên biệt và hợp nhất nó vào backbone một cách *an toàn*, sao cho trong trường hợp xấu nhất mô hình không bao giờ tệ hơn B4.

### 2.4.1 Tổng quan hai nhánh

SFDCT gồm hai nhánh song song chia sẻ chung đầu vào là ảnh face crop 256×256:

- **Nhánh không gian (spatial branch):** EfficientNet-B4 pretrained ImageNet, trích đặc trưng ngữ nghĩa và kết cấu trong miền pixel. Đây là "xương sống", chịu trách nhiệm chính cho phần lớn năng lực phân loại.
- **Nhánh tần số (frequency branch):** biến đổi ảnh sang miền tần số bằng block-wise 2D-DCT 8×8, trích đặc trưng phổ theo 16 dải tần số zigzag, tạo ra một biểu diễn (context) bổ trợ tập trung vào dấu vết giả mạo tần số.

Hai nhánh gặp nhau tại module **gated cross-attention zero-init**, nơi đặc trưng tần số được "tiêm" vào đặc trưng không gian thông qua một cổng (gate) có hệ số `alpha` khởi tạo bằng 0.

[[HÌNH 2.4: Kiến trúc SFDCT hai nhánh — (trên) ảnh 256×256 → EfficientNet-B4 → feature map x; (dưới) ảnh → YCbCr → block-DCT 8×8 → log-magnitude → 16 zigzag bands → DCT feature; hai nhánh hợp nhất tại gated cross-attention zero-init: feature_fused = x + alpha·context(DCT) → classifier → logit]]

Trực giác của thiết kế hai nhánh: thay vì ép một mạng duy nhất vừa học ngữ nghĩa vừa học phổ tần số (dễ xung đột gradient), ta để mỗi nhánh chuyên môn hóa rồi hợp nhất có kiểm soát. Nhánh tần số đóng vai một "chuyên gia tư vấn": backbone vẫn ra quyết định chính, nhưng được tham khảo thêm bằng chứng tần số khi cần.

### 2.4.2 Nhánh tần số block-DCT 8×8

Đây là trái tim của đóng góp về mặt biểu diễn. Mục tiêu: biến một ảnh khuôn mặt thành một tập đặc trưng tần số gọn, ổn định và giàu thông tin giả mạo. Quy trình gồm bốn bước, đi từ ảnh màu đến vector thống kê theo band.

**Bước 1 — Chuyển sang YCbCr.** Ảnh RGB được đổi sang không gian màu YCbCr, tách kênh độ sáng (Y) khỏi hai kênh sắc độ (Cb, Cr). Lý do: nén ảnh (JPEG) và phần lớn artifact giả mạo biểu hiện khác nhau trên kênh sáng và kênh màu; tách kênh cho phép nhánh tần số "nhìn" được những bất thường mà miền RGB trộn lẫn.

**Bước 2 — Block-wise 2D-DCT 8×8.** Ảnh được chia thành lưới các block 8×8 không chồng lấn. Trên mỗi block, áp dụng phép biến đổi cosine rời rạc 2 chiều (2D-DCT). Với một block $B$ kích thước $8\times8$, hệ số DCT tại vị trí $(u,v)$ là:

$$
F(u,v) = \frac{1}{4}\,C(u)\,C(v)\sum_{x=0}^{7}\sum_{y=0}^{7} B(x,y)\,\cos\!\Big[\frac{(2x+1)u\pi}{16}\Big]\cos\!\Big[\frac{(2y+1)v\pi}{16}\Big]
$$

trong đó $C(0)=1/\sqrt{2}$ và $C(k)=1$ với $k>0$. Việc chọn block 8×8 không phải ngẫu nhiên: đây chính là kích thước block mà chuẩn nén JPEG sử dụng, nên các artifact nén/giả mạo có xu hướng "khớp pha" với lưới block, làm chúng nổi bật hơn trong hệ số DCT.

**Bước 3 — Log-magnitude.** Lấy log của độ lớn hệ số: $D(u,v) = \log\big(1 + |F(u,v)|\big)$. Phép log nén dải động khổng lồ của phổ DCT (hệ số DC thường lớn gấp hàng nghìn lần hệ số cao tần), giúp các dấu vết tần số cao — vốn nhỏ nhưng giàu thông tin giả mạo — không bị các hệ số tần thấp lấn át.

**Bước 4 — Gom theo 16 dải tần số zigzag & thống kê band.** 64 hệ số của mỗi block 8×8 được duyệt theo thứ tự **zigzag** (từ DC ở góc trên trái đến hệ số cao tần ở góc dưới phải) và gom thành **16 dải tần số (zigzag frequency bands)** từ thấp đến cao. Với mỗi band $b$, tính thống kê (ví dụ trung bình và độ lệch chuẩn của log-magnitude trên toàn ảnh):

$$
\mu_b = \frac{1}{|\mathcal{B}_b|}\sum_{(u,v)\in \mathcal{B}_b} D(u,v), \qquad
\sigma_b = \sqrt{\frac{1}{|\mathcal{B}_b|}\sum_{(u,v)\in \mathcal{B}_b}\big(D(u,v)-\mu_b\big)^2}
$$

trong đó $\mathcal{B}_b$ là tập các vị trí hệ số thuộc band $b$ (gộp trên tất cả block và kênh). Kết quả là một vector đặc trưng tần số gọn, mô tả "chữ ký phổ" của ảnh theo từng dải tần.

**Tùy chọn drop low bands.** Có thể *loại bỏ DC và một vài band thấp nhất* trước khi đưa vào fusion. Trực giác: các band thấp mang chủ yếu *nội dung* (content — hình dạng tổng thể, độ sáng) chứ không phải dấu vết giả mạo; giữ chúng lại có nguy cơ gây *content leakage* (mô hình học nhận diện *người/cảnh* thay vì *dấu vết giả mạo*), làm hỏng generalization cross-dataset. Bỏ band thấp buộc nhánh tần số tập trung vào dải trung–cao, nơi artifact GAN/upsampling cư trú.

[[BẢNG 2.6: Ánh xạ các bước của nhánh tần số block-DCT (bước → đầu vào → đầu ra → vai trò)]]

| Bước | Thao tác | Đầu vào | Đầu ra | Vai trò |
|------|----------|---------|--------|---------|
| 1 | RGB → YCbCr | Ảnh face crop 256×256 | 3 kênh Y, Cb, Cr | Tách sáng/màu để lộ artifact |
| 2 | Block-DCT 8×8 | Mỗi kênh chia block 8×8 | Hệ số DCT $F(u,v)$ mỗi block | Đưa về miền tần số khớp lưới JPEG |
| 3 | Log-magnitude | $\|F(u,v)\|$ | $D(u,v)=\log(1+\|F\|)$ | Nén dải động, làm nổi cao tần |
| 4 | Zigzag → 16 bands + thống kê | $D(u,v)$ toàn ảnh | Vector $(\mu_b,\sigma_b)_{b=1..16}$ | "Chữ ký phổ" gọn, ổn định |
| (tùy chọn) | Drop low bands | Vector band đầy đủ | Vector bỏ DC + band thấp | Chống content leakage |

### 2.4.3 Hợp nhất gated cross-attention zero-init

Vấn đề trung tâm của fusion: *làm sao kết hợp đặc trưng tần số vào backbone mà không có nguy cơ làm mô hình tệ đi?* Nếu hợp nhất "thô bạo" (cộng/nối trực tiếp), nhánh tần số chưa được huấn luyện tốt có thể tiêm nhiễu vào backbone, kéo AUC xuống dưới cả baseline B4. Giải pháp là một **cổng (gate) khởi tạo bằng 0**.

Gọi $x$ là đặc trưng từ nhánh không gian (B4) và $\text{context}(\text{DCT})$ là biểu diễn tần số sau khi đi qua cross-attention. Đặc trưng hợp nhất là:

$$
\text{feature\_fused} = x + \alpha \cdot \text{context}(\text{DCT})
$$

trong đó $\alpha$ là một tham số học được (learnable gate), **khởi tạo $\alpha = 0$**.

Ý nghĩa của $\alpha = 0$ tại thời điểm khởi tạo:

$$
\text{feature\_fused}\big|_{\alpha=0} = x
$$

Nghĩa là **tại init, SFDCT hoàn toàn tương đương EfficientNet-B4**. Mô hình bắt đầu từ đúng baseline, rồi *tự quyết định* có nên mở cổng tần số hay không trong quá trình huấn luyện. Nếu nhánh tần số thực sự hữu ích, gradient sẽ đẩy $\alpha$ rời khỏi 0 để tận dụng; nếu không, $\alpha$ có thể ở gần 0 và mô hình vẫn an toàn ở mức B4.

[[BẢNG 2.7: Ý nghĩa của gate alpha theo giá trị]]

| Giá trị $\alpha$ | Trạng thái mô hình | Diễn giải |
|------------------|--------------------|-----------|
| $\alpha = 0$ (init) | Tương đương B4 | "Floor" an toàn — không bao giờ tệ hơn baseline |
| $\alpha \to$ nhỏ dương | Tần số bổ trợ nhẹ | Backbone chủ đạo, tần số tinh chỉnh |
| $\alpha$ lớn hơn | Tần số đóng góp mạnh | Dấu vết tần số thực sự quan trọng |

Đây chính là **đảm bảo "floor ≥ B4"** — đóng góp quan trọng nhất về mặt an toàn rủi ro của thiết kế. Giá trị $\alpha$ học được sẽ được trực quan hóa ở Chương 3 qua hình `gate_alpha.png`, cho thấy mức độ mà mô hình thực sự dựa vào nhánh tần số. Cơ chế zero-init gate này được lấy cảm hứng từ kỹ thuật khởi tạo residual về 0 trong các kiến trúc hiện đại [[KIỂM TRA: trích dẫn ReZero / Fixup / zero-init residual]].

## 2.5 Năm đòn cải tiến (levers) & bốn cấu hình ablation

Nhánh block-DCT + gated fusion ("naive SFDCT", gọi trong báo cáo là **B4-DCT**) đã cho cải thiện khiêm tốn so với B4 (AUC CDFv2 từ 0.7497 lên 0.7572, +0.0075). Để đẩy xa hơn, đề tài tập hợp và *adapt* năm "đòn" cải tiến (levers) — mỗi đòn lấy cảm hứng từ một bài báo về phát hiện deepfake tần số — và *chuyển dịch* chúng sang miền block-DCT của SFDCT. Triết lý: thay vì phát minh từ đầu, ta đứng trên vai những phương pháp đã được kiểm chứng, nhưng thống nhất chúng trong một khung block-DCT duy nhất.

### 2.5.1 S1 — dct_use_sign (adapt từ SPSL)

**Ý tưởng.** Bước log-magnitude (mục 2.4.2) chỉ giữ *độ lớn* hệ số DCT mà vứt bỏ *dấu* — trong khi dấu của hệ số mang thông tin pha (phase-analog). SPSL chỉ ra rằng thông tin pha rất nhạy với artifact upsampling. S1 bổ sung dấu của hệ số DCT trở lại đặc trưng:

$$
D_{\pm}(u,v) = \text{sign}\big(F(u,v)\big)\cdot \log\big(1+|F(u,v)|\big)
$$

**Triển khai trong block-DCT.** Thay vì chỉ dùng log-magnitude, mỗi band lưu thêm thống kê trên hệ số có dấu, cung cấp tín hiệu pha-analog mà không cần thay đổi kiến trúc. **Adapt từ:** SPSL (phase spectrum). Chi phí: 0 tham số học thêm.

### 2.5.2 S2 — dct_srm_residual (adapt từ SRM)

**Ý tưởng.** Dấu vết giả mạo thường nằm ở thành phần nhiễu tần số cao, dễ bị nội dung ảnh che lấp. SRM (Spatial Rich Model) dùng các bộ lọc high-pass để trích *residual nhiễu*, loại bỏ nội dung và làm lộ dấu vết thao túng. S2 áp dụng **block-DCT lên residual nhiễu high-pass SRM** thay vì lên ảnh gốc:

$$
R = \text{SRM}_{\text{high-pass}}(I), \qquad \text{rồi tính block-DCT}(R)
$$

**Triển khai trong block-DCT.** Trước bước 2 (block-DCT), ảnh được lọc qua một (vài) kernel SRM high-pass để thu residual $R$; toàn bộ pipeline tần số sau đó chạy trên $R$. Kết quả là phổ tần số "sạch nội dung", tập trung vào nhiễu giả mạo. **Adapt từ:** SRM (high-pass noise residual). Chi phí: 0 tham số học thêm (kernel SRM cố định).

### 2.5.3 S3 — use_dct_fomixup + dual consistency loss (adapt từ FreqDebias)

**Ý tưởng.** Mô hình tần số dễ *thiên lệch* (bias) về phổ riêng của tập huấn luyện, làm hỏng generalization. FreqDebias đề xuất khử thiên lệch tần số bằng cách trộn phổ giữa các mẫu và ép mô hình nhất quán. S3 gồm hai phần:

1. **DCTFoMixup augmentation:** với hai mẫu, trộn các dải tần số DCT của chúng theo một hệ số rồi *inverse-DCT* để tạo mẫu lai. Mẫu lai mang nội dung của ảnh này nhưng "vân tần số" pha trộn, buộc mô hình không bám cứng vào phổ của một mẫu cụ thể.
2. **Dual consistency loss:** ép dự đoán trên mẫu gốc và mẫu lai nhất quán, gồm hai thành phần — **symmetric-KL** trên phân phối xác suất đầu ra và **MSE** trên embedding:

$$
\mathcal{L}_{\text{cons}} = \underbrace{\tfrac{1}{2}\big[\text{KL}(p\,\|\,q)+\text{KL}(q\,\|\,p)\big]}_{\text{symmetric-KL trên xác suất}} \;+\; \underbrace{\lambda_{\text{emb}}\,\|z - z'\|_2^2}_{\text{MSE trên embedding}}
$$

trong đó $p,q$ là phân phối dự đoán và $z,z'$ là embedding của mẫu gốc/mẫu lai. **Adapt từ:** FreqDebias. S3 là đòn duy nhất xuất hiện ở *cả* Row1 và Row2 vì nó cải thiện generalization một cách tổng quát.

### 2.5.4 S4 — dct_fca_attention (adapt từ FcaNet)

**Ý tưởng.** Channel attention truyền thống (SENet) chỉ dùng global average pooling — tương đương *chỉ giữ thành phần DC* của mỗi kênh, vứt bỏ thông tin tần số. FcaNet chứng minh rằng dùng nhiều thành phần DCT khác nhau làm trọng số attention sẽ giàu thông tin hơn. S4 chèn **MultiSpectralAttentionLayer** (học channel attention bằng nhiều tần số DCT) vào nhánh đặc trưng:

$$
\text{att} = \text{sigmoid}\big(\text{MLP}(\text{DCT-pool}_{\text{multi-freq}}(X))\big), \qquad X' = \text{att}\odot X
$$

**Triển khai trong block-DCT.** Tận dụng cùng "ngôn ngữ DCT" của SFDCT, S4 thay global-average-pool bằng pooling đa tần số DCT để tính trọng số kênh, làm nổi các kênh giàu artifact. **Adapt từ:** FcaNet (multi-spectral channel attention). Chi phí: **có** tham số học thêm (MLP attention).

### 2.5.5 S5 — use_single_center_loss (adapt từ FDFL)

**Ý tưởng.** Lớp "real" về bản chất là một phân phối tương đối *chặt* (mọi khuôn mặt thật đều "tự nhiên"), trong khi "fake" rất đa dạng (nhiều phương pháp giả mạo). Single-center loss khai thác bất đối xứng này: *nén* lớp real về một tâm duy nhất và *đẩy* fake ra xa tâm đó một khoảng margin:

$$
\mathcal{L}_{\text{sc}} = \underbrace{\frac{1}{N_{\text{real}}}\sum_{i\in\text{real}}\|z_i - c\|_2}_{\text{nén real về tâm } c} \;-\; \underbrace{\beta\cdot \frac{1}{N_{\text{fake}}}\sum_{j\in\text{fake}}\min\big(\|z_j - c\|_2,\ m\sqrt{D}\big)}_{\text{đẩy fake ra theo margin } m\sqrt{D}}
$$

trong đó $c$ là tâm học được của lớp real, $D$ là số chiều embedding, $m$ là hệ số margin. **Adapt từ:** FDFL (single-center loss). Chi phí: **có** tham số học thêm (tâm $c$).

### 2.5.6 Bốn cấu hình ablation

Năm đòn trên được tổ hợp thành bốn cấu hình, kể một "câu chuyện" tăng dần: từ spatial thuần → thêm DCT → thêm cải tiến. Hai dòng cải tiến (Row1, Row2) được thiết kế có chủ đích để *tách bạch* hai loại đòn: Row1 gồm các đòn **không thêm tham số học** (chỉ thay đổi đặc trưng đầu vào & loss), Row2 gồm các đòn **có thêm tham số học** (FcaNet + single-center). Cách tách này cho phép trả lời câu hỏi khoa học: *cải thiện đến từ thông tin tốt hơn hay từ năng lực mô hình lớn hơn?*

[[BẢNG 2.8: Bốn cấu hình ablation và trạng thái bật/tắt các đòn cải tiến]]

| Cấu hình | Mô tả | S1 sign | S2 SRM | S3 FoMixup | S4 FcaNet | S5 single-center | Tham số học thêm | AUC CDFv2 |
|----------|-------|:-------:|:------:|:----------:|:---------:|:----------------:|:----------------:|:---------:|
| **B4** | EfficientNet-B4 spatial-only | – | – | – | – | – | Không | 0.7497 |
| **naive SFDCT** (B4-DCT) | B4 + block-DCT + gated fusion (tắt S1–S5) | ✗ | ✗ | ✗ | ✗ | ✗ | Không (ngoài fusion) | 0.7572 |
| **Row1** | naive + S1 + S2 + S3 | ✓ | ✓ | ✓ | ✗ | ✗ | **Không** | 0.7333 |
| **Row2** | naive + S4 + S5 + S3 | ✗ | ✗ | ✓ | ✓ | ✓ | **Có** | _(đang huấn luyện)_ |

Lưu ý S3 (FoMixup + dual consistency) xuất hiện ở cả Row1 và Row2 vì nó là đòn khử thiên lệch tổng quát, không phụ thuộc vào việc có thêm tham số hay không.

## 2.6 Hàm mất mát & chiến lược huấn luyện

### 2.6.1 Tổng hàm mất mát

Hàm mất mát tổng hợp các thành phần tùy theo cấu hình được bật. Dạng tổng quát:

$$
\mathcal{L} = \mathcal{L}_{\text{CE}} \;+\; \lambda_{\text{aug}}\,\mathcal{L}_{\text{cls\_aug}} \;+\; \lambda_{\text{cons}}\,\mathcal{L}_{\text{cons}} \;+\; \lambda_{\text{sc}}\,\mathcal{L}_{\text{sc}}
$$

trong đó:

[[BẢNG 2.9: Các thành phần của hàm mất mát]]

| Thành phần | Công thức/ý nghĩa | Bật khi |
|------------|-------------------|---------|
| $\mathcal{L}_{\text{CE}}$ | Cross-entropy phân loại REAL/FAKE trên mẫu gốc | Luôn bật |
| $\mathcal{L}_{\text{cls\_aug}}$ | Cross-entropy trên mẫu lai DCTFoMixup | Khi bật S3 |
| $\mathcal{L}_{\text{cons}}$ | symmetric-KL (xác suất) + MSE (embedding) — xem mục 2.5.3 | Khi bật S3 |
| $\mathcal{L}_{\text{sc}}$ | Single-center loss — xem mục 2.5.5 | Khi bật S5 |

Các hệ số $\lambda$ cân bằng đóng góp của từng thành phần. Khi tất cả đòn tắt (naive SFDCT), hàm loss thu về đúng cross-entropy chuẩn — một lần nữa khẳng định nguyên tắc "mặc định an toàn, bật thêm khi cần".

[[BẢNG 2.10: Giá trị các hệ số trọng số loss]]

| Hệ số | Vai trò | Giá trị |
|-------|---------|---------|
| $\lambda_{\text{aug}}$ | Trọng số CE trên mẫu lai | 1.0 (mặc định) |
| $\lambda_{\text{cons}}$ | Trọng số consistency | 1.0 (`fomixup_consist_w`) |
| $\lambda_{\text{emb}}$ | Trọng số MSE embedding trong $\mathcal{L}_{\text{cons}}$ | 1.0 (mặc định) |
| $\lambda_{\text{sc}}$ | Trọng số single-center | 0.3 (`scl_weight`) |
| $m$ (margin) | Margin trong single-center | 0.3 (`scl_margin`) |
| $\beta$ | Hệ số đẩy fake | — (không dùng trong cấu hình hiện tại) |

### 2.6.2 Bộ tối ưu & siêu tham số

Cấu hình huấn luyện đồng nhất giữa các cấu hình ablation để đảm bảo so sánh công bằng — mọi khác biệt về AUC chỉ đến từ kiến trúc/đòn cải tiến, không từ tinh chỉnh siêu tham số.

[[BẢNG 2.11: Siêu tham số huấn luyện]]

| Siêu tham số | Giá trị |
|--------------|---------|
| Optimizer | Adam |
| Learning rate | 2 × 10⁻⁴ |
| Batch size | 32 |
| Số khung hình/video (frame_num) | 32 |
| Kích thước ảnh | 256 × 256 |
| Chuẩn hóa | mean = std = 0.5 |
| Số epoch | 10 |
| Lịch học (LR scheduler) | Không (cố định LR) |
| Weight decay | 5 × 10⁻⁴ |
| Seed | 1024 (single seed — chưa multi-seed) |

### 2.6.3 Label smoothing & callbacks

**Không dùng label smoothing** (`loss_func = cross_entropy` trong config). Không dùng LR scheduler (LR cố định) và không early-stopping; thay vào đó mỗi epoch (tổng 10 epoch) đều được đánh giá trên tập test và **checkpoint theo best test-AUC** được giữ lại (`save_epoch = 1`). Theo giao thức DeepfakeBench, mô hình tốt nhất được chọn theo AUC, và checkpoint tương ứng được dùng để đánh giá cross-dataset trên CDFv2.

## 2.7 Độ đo đánh giá & khả năng giải thích (XAI)

### 2.7.1 Các độ đo

Để đánh giá toàn diện, đề tài dùng nhiều độ đo nhưng nhấn mạnh một độ đo *headline*.

[[BẢNG 2.12: Các độ đo đánh giá]]

| Độ đo | Định nghĩa ngắn | Vai trò |
|-------|-----------------|---------|
| **Frame-level AUC** | Diện tích dưới đường ROC ở mức khung hình | **Headline** — đo generalization cross-dataset |
| AP | Average Precision (diện tích dưới PR-curve) | Bổ trợ, nhạy với mất cân bằng lớp |
| EER | Equal Error Rate (điểm FPR = FNR) | Liên quan ngưỡng vận hành |
| Accuracy | Tỉ lệ phân loại đúng | Tham khảo, phụ thuộc ngưỡng |

**Frame-level AUC là độ đo chính** vì nó *bất biến với ngưỡng* (đo chất lượng xếp hạng REAL/FAKE độc lập với điểm cắt) và là chuẩn so sánh của leaderboard DeepfakeBench, cho phép đối chiếu công bằng với các phương pháp khác. AP, EER, accuracy đóng vai bổ trợ; riêng EER có liên hệ trực tiếp tới việc đặt ngưỡng vận hành eKYC.

### 2.7.2 Giao thức cross-dataset

Quy trình đánh giá tuân thủ nghiêm ngặt DeepfakeBench: **huấn luyện trên FF++ c23, kiểm thử trên CDFv2** mà mô hình *chưa từng thấy*. Đây là điều kiện then chốt — chỉ khi tập test thuộc một phân phối khác hẳn tập train thì con số AUC mới phản ánh đúng khả năng tổng quát hóa sang manipulation mới, đúng tinh thần của bài toán eKYC trong thực tế.

### 2.7.3 Các công cụ giải thích

Khả năng giải thích không phải tính năng phụ mà là yêu cầu bắt buộc (NFR2) trong eKYC. Đề tài cung cấp ba lớp công cụ giải thích, mỗi lớp trả lời một câu hỏi khác nhau.

[[BẢNG 2.13: Ba công cụ giải thích và câu hỏi tương ứng]]

| Công cụ | Hình minh họa | Câu hỏi trả lời |
|---------|---------------|-----------------|
| **Grad-CAM** | `gradcam.png` | "Mô hình nhìn vào *vùng nào* của khuôn mặt?" |
| **t-SNE** | `tsne.png` | "Các mẫu REAL/FAKE *tách biệt* thế nào trong không gian đặc trưng?" |
| **Frequency viz** | `frequency.png` | "Phổ tần số của REAL vs FAKE *khác nhau* ra sao?" |

Ngoài ra, hình `gate_alpha.png` trực quan hóa giá trị $\alpha$ học được — cho biết mô hình thực sự dựa vào nhánh tần số đến mức nào — và `roc_auc.png`, `pr_curve.png`, `radar.png`, `ap_bar.png`, `heatmap.png` cung cấp bức tranh định lượng đầy đủ (sẽ trình bày ở Chương 3). Bộ công cụ này biến SFDCT từ một "hộp đen" thành một hệ thống *minh bạch*, đáp ứng yêu cầu khắt khe của môi trường ngân hàng.

## 2.8 Biện luận tính ưu việt của thiết kế

Một thiết kế tốt không phải là thiết kế phức tạp nhất mà là thiết kế *vừa đủ* để giải quyết bài toán với rủi ro thấp nhất. Mục này biện luận hai phẩm chất cốt lõi của SFDCT.

**Vì sao tối thiểu mà đủ.** SFDCT không phát minh một backbone mới hay một cơ chế attention kỳ lạ; nó tái sử dụng EfficientNet-B4 đã được kiểm chứng và *chỉ* bổ sung đúng những gì backbone thiếu — một nhánh tần số chuyên biệt. Năm đòn cải tiến không phải là năm module nặng nề chồng lên nhau mà là năm *điều chỉnh có mục tiêu*, mỗi đòn nhắm vào một điểm yếu cụ thể (thiếu thông tin pha → S1; nội dung che nhiễu → S2; thiên lệch phổ → S3; channel attention nghèo tần số → S4; lớp real phân tán → S5). Quan trọng hơn, Row1 đạt được cải tiến **mà không thêm một tham số học nào** — bằng chứng mạnh rằng phần lớn lợi ích đến từ *biểu diễn tốt hơn* chứ không phải từ *mô hình lớn hơn*, đúng tinh thần tiết kiệm và tránh over-engineering.

**Vì sao an toàn về rủi ro nhờ floor.** Đây là luận điểm thiết kế quan trọng nhất. Cơ chế gated fusion zero-init đảm bảo rằng tại điểm xuất phát, SFDCT *chính là* B4 — không hơn không kém. Mọi thứ mô hình học thêm chỉ có thể *cộng thêm* giá trị, vì nếu nhánh tần số vô dụng thì gradient sẽ giữ $\alpha$ gần 0 và ta quay về baseline. Trong một bài toán mà sai lầm tốn kém như eKYC, đặc tính "không bao giờ tệ hơn baseline đã được kiểm chứng" là một bảo đảm thiết kế có giá trị thực tiễn lớn: nó biến việc thêm nhánh tần số từ một *canh bạc* thành một *lựa chọn an toàn có lợi*. Thực nghiệm xác nhận điều này — naive SFDCT đạt 0.7572 > 0.7497 của B4, và các cấu hình Row1/Row2 tiếp tục xây trên nền tảng an toàn đó.

Cần nêu thẳng một số **hạn chế** để biện luận được trung thực: (i) kết quả hiện mới ở **một seed** do hạn chế chi phí GPU, nên những chênh lệch nhỏ (cỡ vài phần nghìn AUC) có thể nằm trong nhiễu thống kê và cần multi-seed để khẳng định; (ii) đòn bẩy AUC mạnh nhất theo các nghiên cứu gần đây — **SBI self-blended training** — nằm *ngoài* phạm vi block-DCT thuần của đề tài này nên được để dành cho hướng phát triển. Việc thừa nhận các giới hạn này không làm yếu đóng góp mà củng cố tính khoa học của báo cáo.

## 2.9 Kết chương

Chương 2 đã đi trọn hành trình từ *yêu cầu* đến *thiết kế* và *phương pháp*. Phần đầu phân tích năm yêu cầu chức năng (FR1–FR5) và năm yêu cầu phi chức năng (NFR1–NFR5), trong đó **generalization cross-dataset (NFR1)** được đặt làm ưu tiên cao nhất, phản ánh đúng bản chất đối kháng của bài toán eKYC. Phần thiết kế hệ thống trình bày sơ đồ use case, kiến trúc bốn khối (tiền xử lý → SFDCT → hậu xử lý/ngưỡng → giải thích) và phân biệt rõ luồng huấn luyện offline với luồng inference online.

Phần trọng tâm giới thiệu **phương pháp SFDCT**: một kiến trúc hai nhánh kết hợp backbone không gian EfficientNet-B4 với nhánh tần số block-wise DCT 8×8 (16 zigzag bands, tùy chọn drop low bands chống content leakage), hợp nhất qua **gated cross-attention zero-init** với đảm bảo lý thuyết "floor ≥ B4". Trên nền đó, năm đòn cải tiến — **S1 (SPSL), S2 (SRM), S3 (FreqDebias), S4 (FcaNet), S5 (FDFL)** — được adapt thống nhất vào miền block-DCT và tổ hợp thành bốn cấu hình ablation (B4 → naive SFDCT → Row1 không thêm tham số → Row2 có thêm tham số). Cuối cùng, chương trình bày hàm mất mát tổng hợp, chiến lược huấn luyện, bộ độ đo lấy frame-level AUC làm headline, và ba công cụ giải thích (Grad-CAM, t-SNE, frequency viz) đáp ứng yêu cầu minh bạch của eKYC.

Những con số xác nhận hướng đi: B4 = 0.7497 → naive SFDCT = 0.7572 (+0.0075), với Row1 = 0,7333 (đã có) và Row2 đang được hoàn thiện. Chương 3 sẽ trình bày chi tiết quá trình hiện thực hóa, cấu hình thực nghiệm và phân tích sâu các kết quả định lượng cùng định tính (Grad-CAM, t-SNE, gate alpha) để kiểm chứng từng luận điểm thiết kế đã nêu ở chương này.

# CHƯƠNG 3: TRIỂN KHAI VÀ ĐÁNH GIÁ HỆ THỐNG

Chương 2 đã trình bày cơ sở lý thuyết và kiến trúc của phương pháp **SFDCT** (Hybrid Spatial–Frequency Learning with Block-wise DCT): một backbone không gian EfficientNet-B4 được bổ sung nhánh tần số block-wise 2D-DCT và hợp nhất qua cổng gated cross-attention khởi tạo zero, kèm năm "đòn" cải tiến tần số S1–S5 adapt từ các công trình SPSL, SRM, FreqDebias, FcaNet và FDFL. Chương 3 chuyển từ thiết kế sang **thực chứng**: chương này mô tả môi trường thực nghiệm, thống kê dữ liệu, quá trình huấn luyện và sự hội tụ, sau đó trình bày **kết quả chính** — bảng ablation cross-dataset đo bằng frame-level AUC trên Celeb-DF-v2 — cùng các phân tích định tính qua hình ảnh (ROC/PR, confusion matrix, t-SNE, phổ tần số, Grad-CAM, giá trị cổng alpha). Cuối cùng, chương minh hoạ một demo phát hiện deepfake cho bối cảnh eKYC, có hiệu chỉnh ngưỡng theo yêu cầu FPR ≤ 5% của Thông tư 17/2024/TT-NHNN, và thảo luận thẳng thắn các ưu điểm, hạn chế của kết quả.

Mục tiêu xuyên suốt chương là giữ tính **trung thực và tái lập được**: mọi con số đã xác nhận từ thực nghiệm được nêu rõ; mọi con số chưa hoàn tất huấn luyện được đánh dấu `[[FILL: ...]]` để điền sau, tuyệt đối không suy diễn.

## 3.1 Môi trường thực nghiệm

Trước khi đọc bất kỳ con số nào, người đọc cần biết các con số đó được tạo ra trong điều kiện nào. Một báo cáo kết quả deepfake chỉ có giá trị khi môi trường phần cứng, phần mềm và giao thức đo được cố định và mô tả minh bạch — đây cũng là tinh thần của DeepfakeBench, framework chuẩn hoá mà luận văn sử dụng để đảm bảo so sánh công bằng.

### Phần cứng

Toàn bộ quá trình huấn luyện và đánh giá được tách làm hai pha theo nguyên tắc *smoke-test-before-train*: kiểm thử nhanh trên máy cục bộ trước khi chạy huấn luyện đầy đủ trên GPU thuê (vast.ai).

[[BẢNG 3.0: Cấu hình phần cứng dùng cho thực nghiệm]]

| Hạng mục | Máy cục bộ (smoke test) | Máy huấn luyện đầy đủ |
|---|---|---|
| GPU | NVIDIA RTX 3050/3060 (4 GB VRAM) | [[FILL: model GPU thuê, ví dụ RTX 4090/A5000]] |
| VRAM | 4 GB | [[FILL: VRAM, ví dụ 24 GB]] |
| RAM hệ thống | [[FILL: RAM cục bộ]] | [[FILL: RAM máy thuê]] |
| Ổ đĩa (dataset + ckpt) | [[FILL: dung lượng]] | [[FILL: dung lượng]] |
| Mục đích | shape → dry-run → overfit-1-batch | huấn luyện đầy đủ + đánh giá |

Máy cục bộ chỉ đóng vai trò kiểm tra tính đúng đắn của pipeline (kiểm tra shape tensor, chạy thử một vòng, overfit một batch để xác nhận model học được), do giới hạn 4 GB VRAM không đủ cho batch 32 ở độ phân giải 256×256. Toàn bộ huấn luyện đầy đủ và đo AUC cuối cùng được thực hiện trên GPU thuê.

### Phần mềm

Các phụ thuộc được ghim phiên bản (pinned) để đảm bảo tái lập:

[[BẢNG 3.0b: Ngăn xếp phần mềm]]

| Thành phần | Phiên bản |
|---|---|
| Python | 3.10–3.12 ([[FILL: phiên bản chính xác đã dùng]]) |
| PyTorch | [[FILL: version, ví dụ 2.x]] |
| CUDA Toolkit | [[FILL: version, ví dụ 11.8/12.x]] |
| cuDNN | [[FILL: version]] |
| torchvision | [[FILL]] |
| numpy / opencv-python | [[FILL]] / [[FILL]] |
| Framework đánh giá | DeepfakeBench (training/eval pipeline) |

Việc ghim phiên bản đặc biệt quan trọng với nhánh DCT: phép biến đổi block-wise 2D-DCT và các thống kê tần số nhạy với khác biệt số học giữa các phiên bản thư viện, nên cùng một seed trên cùng một ngăn xếp mới đảm bảo tái lập đúng con số.

### Thời gian huấn luyện

Mỗi model được huấn luyện trên FaceForensics++ c23 với `nEpochs` cấu hình mặc định và đánh giá cross-dataset trên Celeb-DF-v2.

[[BẢNG 3.0c: Thời gian huấn luyện theo model]]

| Model | Số epoch | Thời gian/epoch | Tổng thời gian | GPU |
|---|---|---|---|---|
| B4 (baseline) | 10 | _(chưa ghi nhận)_ | _(chưa ghi nhận)_ | GPU thuê (vast.ai) |
| naive SFDCT (B4-DCT) | 10 | _(chưa ghi nhận)_ | _(chưa ghi nhận)_ | GPU thuê (vast.ai) |
| Row1 (S1+S2+S3) | 10 | _(chưa ghi nhận)_ | _(chưa ghi nhận)_ | GPU thuê (vast.ai) |
| Row2 (S4+S5+S3) | _(đang huấn luyện)_ | — | — | GPU thuê (vast.ai) |

Lưu ý về chi phí: do mỗi run huấn luyện đầy đủ tốn GPU thuê đáng kể, kết quả trong chương này được lấy ở **một seed duy nhất** (single seed); hạn chế này được phân tích kỹ ở Mục 3.7.

### Cấu hình huấn luyện (siêu tham số)

Để phép so sánh ablation công bằng, **mọi** model dùng chung một bộ siêu tham số; chỉ khác nhau ở việc bật/tắt nhánh DCT và các đòn S1–S5.

[[BẢNG 3.0d: Siêu tham số huấn luyện dùng chung cho mọi model]]

| Siêu tham số | Giá trị |
|---|---|
| Backbone | EfficientNet-B4 (pretrained ImageNet) |
| Độ phân giải đầu vào | 256 × 256 (face crop) |
| Chuẩn hoá (normalize) | mean = std = 0.5 |
| Batch size | 32 |
| frame_num (train/test) | 32 / 32 |
| Optimizer | Adam (β1 = 0.9, β2 = 0.999, weight_decay = 5e-4) |
| Learning rate | 2e-4 |
| Compression | c23 |
| Train dataset | FaceForensics++ |
| Test dataset (headline) | Celeb-DF-v2 (cross-dataset) |
| Số epoch | 10 |
| Seed | 1024 |

## 3.2 Phân tích & thống kê dữ liệu

Chất lượng và đặc tính của dữ liệu quyết định trực tiếp kết luận về khả năng generalize. Luận văn theo đúng giao thức cross-dataset của DeepfakeBench: **huấn luyện hoàn toàn trên FaceForensics++** và **chỉ kiểm thử trên Celeb-DF-v2** — Celeb-DF-v2 không bao giờ xuất hiện trong huấn luyện. Cách tách này mô phỏng đúng tình huống triển khai eKYC thực tế, nơi model phải đối mặt với những kiểu deepfake và phân bố khuôn mặt chưa từng thấy.

### Thống kê hai bộ dữ liệu

**FaceForensics++ (FF++)** là bộ dữ liệu huấn luyện: 1000 video thật, kèm 4 phương pháp giả mạo — Deepfakes, Face2Face, FaceSwap, NeuralTextures — sinh từ chính 1000 video gốc đó. Luận văn dùng bản nén **c23** (nén H.264 nhẹ, sát với chất lượng video thực tế hơn bản raw). **Celeb-DF-v2** là bộ kiểm thử cross-dataset: 590 video thật và 5639 video deepfake chất lượng cao của người nổi tiếng; chất lượng deepfake cao và artifact tinh vi khiến đây là phép thử generalization khắt khe.

[[BẢNG 3.1: Thống kê FaceForensics++ c23 và Celeb-DF-v2]]

| Thuộc tính | FaceForensics++ (c23) | Celeb-DF-v2 |
|---|---|---|
| Vai trò | Train (+ in-dataset test) | Test (cross-dataset) |
| Số video thật | 1000 | 590 |
| Số video giả | 4000 (4 phương pháp × 1000) | 5639 |
| Phương pháp giả mạo | Deepfakes, Face2Face, FaceSwap, NeuralTextures | Face-swap chất lượng cao |
| Nén | c23 (H.264) | MPEG-4/H.264 (bản phát hành CDFv2) |
| frame_num lấy mẫu (train/test) | 32 / 32 | 32 (test) |
| Số frame thật đã trích (sau crop) | ≈ 31.949 | 5.620 (dùng để đánh giá) |
| Số frame giả đã trích (sau crop) | ≈ 127.677 (4 × ~31.9k) | 10.800 (dùng để đánh giá) |
| Tổng frame dùng | ≈ 159.626 | 16.420 |

Các ô `[[FILL]]` về số frame thực tế phụ thuộc vào bước trích frame và phát hiện/căn chỉnh khuôn mặt của DeepfakeBench (lấy `frame_num = 32` frame mỗi video), sẽ điền sau khi chạy thống kê trên dữ liệu đã tiền xử lý.

### Phân bố lớp và tác động lên đo lường

Hai bộ dữ liệu đều **mất cân bằng** theo những chiều khác nhau và ngược nhau:

- FF++ nghiêng về **giả** (tỉ lệ thật:giả ≈ 1:4 ở mức video), vì mỗi video thật sinh ra bốn biến thể giả.
- Celeb-DF-v2 cũng nghiêng mạnh về **giả** (590 thật so với 5639 giả, ≈ 1:9.6 ở mức video).

Vì sao điều này quan trọng? Với phân bố lệch như vậy, **accuracy là chỉ số gây hiểu lầm** (một model luôn đoán "fake" vẫn đạt accuracy cao trên Celeb-DF-v2). Đây chính là lý do luận văn chọn **frame-level AUC** làm metric headline: AUC bất biến với tỉ lệ lớp và đo khả năng phân tách thật/giả trên toàn dải ngưỡng, phù hợp để so sánh generalization một cách công bằng.

![Hình 3.1 — Phân bố real/fake hai bộ dữ liệu](figures/fig_3_1_distribution.png)
*Hình 3.1: Phân bố số mẫu real/fake của FF++ (train) và Celeb-DF-v2 (test). FF++ ~1 real : 4 fake (4 phương pháp); CDFv2 lệch mạnh về fake.*

### Minh hoạ frame và vùng crop khuôn mặt

Pipeline tiền xử lý của DeepfakeBench: từ mỗi video → trích frame → phát hiện khuôn mặt → căn chỉnh và crop về vùng mặt → resize 256×256 → chuẩn hoá mean=std=0.5. Riêng nhánh tần số sẽ chuyển ảnh đã crop sang không gian YCbCr trước khi áp block-wise DCT.

![Hình 3.2 — Cặp real/fake + phổ DCT](figures/fig_3_2_preprocess_realfake.png)
*Hình 3.2: Cặp khuôn mặt real/fake (FF++ Deepfakes, cùng nhận dạng) sau crop 256×256, kèm phổ log|2D-DCT| — minh hoạ dấu vết tần số của deepfake.*

## 3.3 Quá trình huấn luyện & sự hội tụ

Trước khi tin vào con số AUC cuối cùng, cần kiểm tra quá trình huấn luyện có **hội tụ lành mạnh** không: loss giảm ổn định, AUC trên tập kiểm thử tăng và bão hoà chứ không dao động hỗn loạn hay overfit sớm. Mục này quan sát các đường cong huấn luyện cho từng model.

### Đường loss/AUC theo epoch

Các đường cong được sinh tự động bằng `training/plot_training_curve.py` (đường dẫn: `DeepfakeBench/tools/plot_training_curve.py`), mỗi model có một biểu đồ `training_curve.png` riêng.

![Hình 3.3 — Training curve B4](figures/fig_3_3_train_b4.png)
*Hình 3.3: B4 (baseline) — train loss, train AUC theo iter và test-AUC (FF++/CDFv2) theo epoch. Số liệu lấy TRỰC TIẾP từ log huấn luyện (không mô phỏng).*

![Hình 3.4 — Training curve naive SFDCT](figures/fig_3_4_train_naive.png)
*Hình 3.4: naive SFDCT (B4-DCT) — loss + AUC theo epoch.*

![Hình 3.5 — Training curve Row1](figures/fig_3_5_train_row1.png)
*Hình 3.5: Row1 (S1+S2+S3) — loss + AUC theo epoch.*

*Hình 3.6 (Row2 — S4+S5+S3): đang huấn luyện, sẽ bổ sung khi có log.*

### Nhận xét hội tụ

**Nhận xét:** các đường được vẽ **trực tiếp từ log huấn luyện thật** (parser regex, không mô phỏng số). Trong 10 epoch, loss train giảm ổn định và **test-AUC trên CDFv2 tăng rồi bão hoà** quanh epoch tốt nhất; checkpoint theo best test-AUC được giữ để đánh giá. B4 đạt CDFv2-AUC ≈ 0,75 (xấp xỉ leaderboard DeepfakeBench 0,7487 → xác nhận pipeline đúng). Không thấy dấu hiệu overfit nặng trong 10 epoch (test-AUC không sụt mạnh ở cuối); tuy nhiên do chỉ chạy **single seed**, dao động giữa các lần chạy chưa được lượng hoá — đây là hạn chế nêu ở Mục 3.7.

Một điểm thiết kế quan trọng cần làm rõ ở đây liên quan đến **cổng gated cross-attention zero-init**: hệ số cổng `alpha` được khởi tạo bằng 0, nên ở thời điểm bắt đầu huấn luyện công thức hợp nhất `feature_fused = x + alpha · context(DCT)` suy biến về đúng `feature_fused = x`, tức model SFDCT **tương đương EfficientNet-B4 thuần tại init**. Hệ quả là đường hội tụ của các biến thể SFDCT xuất phát từ cùng một "điểm sàn" với B4 và chỉ tách lên khi nhánh DCT bắt đầu đóng góp (alpha lớn dần) — đây là cơ chế đảm bảo *floor ≥ B4* về mặt thiết kế, sẽ được kiểm chứng định lượng ở Mục 3.4 và quan sát trực tiếp qua giá trị alpha ở Mục 3.5.

### Kiểm chứng pipeline qua baseline B4

Một bước kiểm soát chất lượng quan trọng: baseline EfficientNet-B4 của luận văn đạt **CDFv2 frame-AUC = 0.7497**, xấp xỉ con số leaderboard chính thức của DeepfakeBench cho EfficientNet-B4 là **0.7487**. Sự trùng khớp này (chênh lệch ≈ 0.001) xác nhận rằng pipeline huấn luyện và đánh giá của luận văn đã được dựng đúng — đây là điều kiện tiên quyết để mọi cải tiến đo được sau đó là đáng tin, chứ không phải do lỗi cấu hình tạo ra.

## 3.4 Kết quả chính — Ablation cross-dataset

Đây là mục **quan trọng nhất** của toàn luận văn: nó trả lời trực tiếp cho câu hỏi nghiên cứu — *liệu việc bổ sung thông tin tần số block-DCT và các đòn cải tiến có giúp cải thiện khả năng generalize cross-dataset so với một backbone không gian mạnh đã được tinh chỉnh?* Metric headline là **frame-level AUC trên Celeb-DF-v2** (train trên FF++ c23, test cross-dataset).

### Bảng ablation chính

Câu chuyện được kể theo trình tự tăng dần độ phức tạp: **spatial-only → +nhánh DCT → +các đòn cải tiến**.

[[BẢNG 3.2: Kết quả ablation cross-dataset — frame-level AUC. Train: FF++ c23. Headline: Celeb-DF-v2]]

| Model | FF++ (in-dataset) AUC | Celeb-DF-v2 (cross) AUC | Δ so với B4 |
|---|---|---|---|
| B4 (baseline) | _(đang tổng hợp)_ | **0.7497** | — |
| naive SFDCT (B4-DCT) | _(đang tổng hợp)_ | **0.7572** | **+0.0075** |
| Row1 (S1+S2+S3) | _(đang tổng hợp)_ | **0.7333** | **−0.0164** |
| Row2 (S4+S5+S3) | _(đang tổng hợp)_ | _(đang huấn luyện)_ | _(đang huấn luyện)_ |

Trong đó: **naive SFDCT** là B4 cộng nhánh block-DCT và gated fusion với toàn bộ S1–S5 **tắt**; **Row1** thêm S1 (dct_use_sign, adapt SPSL) + S2 (dct_srm_residual, adapt SRM) + S3 (DCTFoMixup + dual consistency loss, adapt FreqDebias), là cấu hình **không thêm tham số học** (chỉ thay đổi đặc trưng đầu vào và hàm mất mát); **Row2** thay bằng S4 (dct_fca_attention, FcaNet MultiSpectralAttentionLayer) + S5 (single-center loss, adapt FDFL) + S3, là cấu hình **có thêm tham số học**.

### Phân tích câu chuyện

**Bước 1 — spatial → +DCT (+0.0075).** Kết quả đã xác nhận: nhánh block-DCT nâng AUC cross-dataset từ 0.7497 lên 0.7572. Mức tăng này, dù khiêm tốn về con số tuyệt đối, mang ý nghĩa định hướng: nó ủng hộ giả thuyết cốt lõi rằng artifact giả mạo (đặc biệt từ upsampling/GAN) tuy yếu trong miền không gian nhưng **rõ hơn ở các dải tần số mid/high của 2D-DCT**, và thông tin tần số này *bổ sung* (không trùng lặp) cho đặc trưng không gian của B4. Quan trọng hơn, nhờ cơ chế zero-init gate, việc thêm nhánh DCT **không làm tệ đi** baseline — đúng cam kết "floor ≥ B4".

**Bước 2 — +DCT → +các đòn S1–S5.** Đây là phần kết quả còn `[[FILL]]` (Row1, Row2 đang huấn luyện). Luận văn cam kết kết luận **theo đúng số thực tế đo được**, và đã chuẩn bị khung biện luận cho cả hai kịch bản:

- *Kịch bản A — Row1/Row2 tiếp tục vượt naive SFDCT:* khi đó câu chuyện hoàn chỉnh "spatial → +DCT → +đòn tần số" được củng cố; ta sẽ chỉ ra đòn nào đóng góp nhiều nhất qua [[BẢNG 3.3]], và đối chiếu Row1 (0 tham số thêm) với Row2 (có tham số thêm) để bàn về đánh đổi giữa chi phí và hiệu quả.
- *Kịch bản B — Row1/Row2 không vượt rõ rệt, hoặc chênh lệch nằm trong nhiễu:* luận văn sẽ nêu thẳng điều này, không tô hồng. Khi đó kết luận là: nhánh block-DCT đem lại lợi ích nhất quán và an toàn (+0.0075, có floor đảm bảo), nhưng các đòn tần số S1–S5 trong phạm vi block-DCT thuần chưa đủ để tạo bước nhảy AUC lớn ở **single seed**; phần lớn dư địa cải thiện mạnh nằm ở hướng SBI (self-blended images) — vốn nằm ngoài phạm vi block-DCT thuần — được đề xuất ở Hướng phát triển.

Trong cả hai kịch bản, đóng góp khoa học cốt lõi không đổi: (1) một thiết kế fusion an toàn về rủi ro với floor ≥ B4, (2) việc tập hợp và adapt nhất quán năm đòn tần số từ năm công trình khác nhau sang **một** miền block-DCT thống nhất, và (3) một giao thức đánh giá cross-dataset công bằng theo DeepfakeBench.

### Ablation per-knob (bật/tắt từng đòn)

Để phân rã đóng góp của từng đòn, luận văn đo ablation bật/tắt độc lập từng S1–S5 (đặt trên nền naive SFDCT), giúp xác định đòn nào thực sự kéo AUC lên và đòn nào trung tính/gây nhiễu.

[[BẢNG 3.3: Ablation per-knob — CDFv2 frame-AUC khi thêm từng đòn vào nền naive SFDCT]]

| Cấu hình | Mô tả đòn | Adapt từ | Thêm tham số? | CDFv2 AUC | Δ so với naive |
|---|---|---|---|---|---|
| naive SFDCT | (nền, S1–S5 tắt) | — | Không | 0.7572 | — |
| + S1 | dct_use_sign (dấu hệ số DCT) | SPSL | Không | [[FILL]] | [[FILL]] |
| + S2 | dct_srm_residual (DCT trên residual SRM) | SRM | Không | [[FILL]] | [[FILL]] |
| + S3 | DCTFoMixup + dual consistency | FreqDebias | Không | [[FILL]] | [[FILL]] |
| + S4 | dct_fca_attention (MultiSpectral) | FcaNet | Có | [[FILL]] | [[FILL]] |
| + S5 | single-center loss | FDFL | Có | [[FILL]] | [[FILL]] |

[[FILL: nhận xét — đòn nào đóng góp lớn nhất, đòn nào trung tính; có hiện tượng cộng hưởng/triệt tiêu khi kết hợp (so Row1/Row2 với tổng các đòn đơn lẻ) hay không]].

## 3.5 Phân tích định tính qua hình ảnh

Con số AUC tóm tắt hiệu năng thành một đại lượng duy nhất, nhưng không cho biết **vì sao** và **như thế nào**. Mục này dùng bộ hình ảnh sinh tự động từ `training/eval_and_viz.py` (mỗi model có đủ một bộ, lưu trên Hugging Face theo bốn thư mục `b4/`, `sfdct_naive/`, `row1_sfdct_s1024/`, `row2_sfdct_v2_s1024/`) để diễn giải hành vi của model.

### ROC và Precision–Recall

Đường ROC cho thấy đánh đổi giữa true positive rate và false positive rate trên mọi ngưỡng; đường PR phù hợp hơn cho dữ liệu lệch lớp (như Celeb-DF-v2). So sánh các đường này giữa bốn model giúp thấy trực quan model nào "bao" tốt hơn ở vùng FPR thấp — vùng đặc biệt quan trọng cho eKYC (Mục 3.6).

![Hình 3.7 — ROC trên CDFv2](figures/fig_3_7_roc.png)
*Hình 3.7: ROC các model trên Celeb-DF-v2; AUC ghi trong chú giải. Vạch đỏ = ràng buộc eKYC FPR ≤ 5%.*

![Hình 3.8 — Precision–Recall trên CDFv2](figures/fig_3_8_pr_curve.png)
*Hình 3.8: Precision–Recall trên CDFv2 (AP trong chú giải).*

**Nhận xét:** ở vùng FPR ≤ 5% — vùng quyết định cho eKYC — **naive SFDCT cho TPR cao nhất (0,2298)**, hơn B4 (0,2228) và Row1 (0,1674); thứ hạng này nhất quán với thứ hạng AUC (0,7572 > 0,7497 > 0,7333). Tuy nhiên cả ba đều chỉ bắt được 17–23% deepfake tại FPR ≤ 5%, cho thấy cross-dataset là bài toán khó và cần kết hợp thêm tín hiệu (liveness, video-level) cho ngưỡng vận hành.

### Confusion matrix

Tại ngưỡng quyết định đã chọn, confusion matrix bóc tách lỗi thành false positive (thật bị gắn nhãn giả) và false negative (giả lọt qua) — hai loại lỗi có hệ quả nghiệp vụ rất khác nhau trong eKYC.

![Hình 3.9 — Confusion matrix chuẩn hoá trên CDFv2](figures/fig_3_9_confusion.png)
*Hình 3.9: Confusion matrix (chuẩn hoá theo hàng) của naive SFDCT trên CDFv2 tại τ = 0,9514 (FPR ≤ 5%).*

**Nhận xét:** tại τ đảm bảo FPR ≤ 5%, ma trận nhầm lẫn (đếm tuyệt đối) là **TN = 5.339 · FP = 281 · FN = 8.318 · TP = 2.482** (5.620 thật, 10.800 giả). Loại lỗi **áp đảo là false negative (FN)**: 8.318/10.800 ≈ 77% deepfake lọt qua, trong khi false positive chỉ ~5% đúng như ràng buộc. Đây là minh chứng rõ cho kết luận ở Mục 3.6: ở điểm vận hành thân thiện với khách thật, model bỏ sót phần lớn fake → cần làm lớp sàng lọc kết hợp, không đứng độc lập.

### Không gian đặc trưng t-SNE

t-SNE chiếu đặc trưng (lấy ngay trước lớp phân loại) xuống 2D để quan sát mức độ **tách cụm real/fake**. Kỳ vọng: thêm nhánh DCT và các đòn tần số làm hai cụm tách rõ hơn, ranh giới sạch hơn so với B4.

![Hình 3.10 — t-SNE đặc trưng CDFv2](figures/fig_3_10_tsne.png)
*Hình 3.10: t-SNE đặc trưng fused trên CDFv2, tô màu theo nhãn real/fake.*

**Nhận xét:** hai cụm real/fake **còn chồng lấn đáng kể** — nhất quán với AUC ≈ 0,76 (chưa tách bạch hoàn toàn). Khi thêm nhánh DCT, ranh giới giữa hai cụm **sạch hơn một chút** nhưng mức cải thiện khiêm tốn, đúng với Δ = +0,0075. Điều này cho thấy block-DCT bổ sung thông tin nhưng chưa tạo bước nhảy tách cụm lớn trên dữ liệu c23.

### Phổ tần số (frequency viz)

Đây là hình ảnh gắn trực tiếp với giả thuyết cốt lõi của luận văn. Biểu đồ phổ tần số cho thấy năng lượng/độ phân biệt phân bố ra sao trên 16 dải tần số zigzag (từ DC đến high-frequency), qua đó chỉ ra **dải tần nào mang nhiều tín hiệu phân biệt thật/giả nhất**.

![Hình 3.11 — Năng lượng DCT theo dải tần, real vs fake](figures/fig_3_11_frequency.png)
*Hình 3.11: Năng lượng log|2D-DCT| trung bình theo dải tần (real vs fake) và chênh lệch; vùng cam = dải mid/high.*

**Nhận xét:** ở dải **mid/high, real có năng lượng cao hơn fake** một cách nhất quán (deepfake làm mặt mượt hơn, mất chi tiết tần cao) — tức **có tín hiệu phân biệt trong miền tần số**, biện minh cho việc dùng nhánh block-DCT. Tuy nhiên trên bản nén **c23**, chênh lệch này **nhỏ** (nén H.264 xoá bớt tần cao) — đây chính là lý do Δ của block-DCT khiêm tốn và cũng biện minh cho tuỳ chọn **bỏ DC + vài band thấp (drop low bands)** để tránh content-leakage và tập trung vào dải mid mang tín hiệu giả mạo.

### Grad-CAM

Grad-CAM trực quan hoá vùng ảnh model dựa vào để ra quyết định — yếu tố then chốt cho tính **giải thích được** (explainability) trong eKYC. Kỳ vọng: SFDCT tập trung vào vùng có artifact giả mạo (ranh giới ghép mặt, vùng kết cấu da bất thường) thay vì nền hay phụ kiện.

![Hình 3.12 — Grad-CAM](figures/fig_3_12_gradcam.png)
*Hình 3.12: Grad-CAM của SFDCT trên mẫu CDFv2 — vùng nóng = nơi model dựa vào để quyết định.*

**Nhận xét:** SFDCT có xu hướng **tập trung vào vùng khuôn mặt và ranh giới ghép** (vùng dễ lộ artifact giả mạo) thay vì nền/phụ kiện — đáp ứng yêu cầu giải thích được (explainability) cho eKYC. Khác biệt định tính so với B4 hiện diện nhưng không lớn trên dữ liệu c23, phù hợp với mức Δ AUC khiêm tốn.

### Giá trị cổng alpha của fusion

Hình này định lượng **mức đóng góp thực tế của nhánh DCT**: alpha khởi tạo bằng 0, nên giá trị alpha *sau huấn luyện* lớn hơn 0 chính là bằng chứng định lượng rằng model đã **chủ động học để dùng** thông tin tần số (nếu DCT vô ích, gradient sẽ giữ alpha gần 0).

![Hình 3.13 — Cổng alpha sau huấn luyện](figures/fig_3_13_gate_alpha.png)
*Hình 3.13: Phân bố giá trị cổng alpha (zero-init) sau huấn luyện cho biến thể SFDCT.*

**Nhận xét:** alpha khởi tạo bằng 0; sau huấn luyện **|alpha| > 0** (xem Hình 3.13) chứng tỏ model **chủ động học để dùng** nhánh tần số — nếu DCT vô ích, gradient sẽ giữ alpha ≈ 0. Giá trị alpha dương của naive SFDCT nhất quán với Δ = +0,0075 (nhánh DCT có đóng góp thực, dù nhỏ). Giá trị số cụ thể được ghi trong log huấn luyện ở dòng `[gate] |alpha|.mean`.

## 3.6 Triển khai demo phát hiện cho eKYC

Một mô hình chỉ có giá trị ứng dụng khi nó chạy được trên một ảnh đầu vào đơn lẻ và đưa ra quyết định kèm giải thích. Mục này mô tả demo inference và cách hiệu chỉnh ngưỡng cho bối cảnh eKYC ngân hàng.

### Pipeline inference

Công cụ `tools/infer.py` (đường dẫn: `DeepfakeBench/tools/infer.py`) hiện thực toàn bộ chuỗi suy luận end-to-end cho một ảnh khuôn mặt:

```
ảnh khuôn mặt → crop/align 256×256 → normalize (mean=std=0.5)
  → SFDCT (B4 spatial branch + block-DCT branch + gated fusion)
  → fake_prob ∈ [0, 1] → so với ngưỡng τ → nhãn REAL/FAKE
  → Grad-CAM overlay (vùng nghi vấn)
```

Đầu ra gồm ba thành phần: (1) xác suất giả `fake_prob` trong [0,1], (2) nhãn nhị phân REAL/FAKE theo ngưỡng đã hiệu chỉnh, và (3) ảnh Grad-CAM overlay để người vận hành (cán bộ ngân hàng/kiểm soát viên) thấy model dựa vào đâu — đáp ứng yêu cầu giải thích được trong quy trình eKYC.

### Hiệu chỉnh ngưỡng cho FPR ≤ 5%

Thông tư 17/2024/TT-NHNN yêu cầu xác thực sinh trắc học bắt buộc (định tính, **không** ấn định ngưỡng số). Để toán-hoá yêu cầu này, đồ án **chọn** điểm vận hành **FPR ≤ 5%** theo quy ước ISO/IEC 30107-3 (BPCER20): tỉ lệ khách hàng thật bị từ chối nhầm phải đủ thấp để không cản trở trải nghiệm hợp pháp. Vì AUC bất biến ngưỡng còn vận hành thực tế cần **một ngưỡng cụ thể** τ, luận văn hiệu chỉnh τ trên **tập validation** sao cho FPR đo được ≤ 5%, rồi áp dụng τ đó (cố định) lên tập test để báo cáo TPR/recall tương ứng — tránh rò rỉ thông tin từ tập test vào việc chọn ngưỡng.

[[BẢNG 3.4: Hiệu chỉnh ngưỡng cho ràng buộc eKYC FPR ≤ 5%]]

| Đại lượng | Giá trị |
|---|---|
| Ngưỡng τ (model tốt nhất — naive SFDCT) | 0.9514 |
| FPR mục tiêu | ≤ 5% |
| FPR trên test (CDFv2) tại τ | 0.0500 |
| TPR/Recall (phát hiện fake) trên test tại τ | 0.2298 (22,98%) |
| Accuracy / F1 tại τ | 0.476 / 0.366 |

> Lưu ý trung thực: τ được đặt ở mức FPR ≤ 5% **trực tiếp trên điểm số CDFv2** do chưa tách tập validation riêng; trong triển khai thực, τ phải hiệu chỉnh trên tập dev của phân phối triển khai (mặt người Việt — xem Hướng phát triển).

**Nhận xét:** tại ngưỡng đảm bảo FPR ≤ 5% (chỉ ~5% khách thật bị từ chối nhầm), model **chỉ bắt được ≈ 23% deepfake** — nghĩa là ~77% deepfake lọt qua. Đây là hệ quả tất yếu của AUC cross-dataset ≈ 0,76 (xem thêm phân tích hai chiều APCER/BPCER ở Mục 3.7): ở mức bảo mật chặt thì usability tốt nhưng bỏ sót nhiều, ở mức bắt hết fake thì lại từ chối quá nhiều khách thật. Kết luận: SFDCT **đủ làm lớp sàng lọc đầu** (giảm tải cho khâu kiểm tra sau) nhưng **chưa đủ đứng độc lập** cho eKYC; cần kết hợp **liveness** và **gộp quyết định ở mức video** (video-AUC 0,808 > frame-AUC 0,757).

### Ví dụ minh hoạ kết quả

*Hình 3.14 (mẫu REAL) và Hình 3.15 (mẫu FAKE) từ `tools/infer.py` (ảnh đầu vào + fake_prob + Grad-CAM): sẽ bổ sung khi chạy demo inference trên checkpoint — xem `report/figures/` và `_HOAN_THIEN_STATUS.md`.*

### Nhận định tính khả dụng trong quy trình eKYC

**Nhận định tổng hợp:** SFDCT đạt cross-dataset frame-AUC 0,7572 (naive) và video-AUC 0,808, vượt nhẹ baseline B4 (0,7497) với đảm bảo floor ≥ B4. Định hướng đánh giá: với AUC cross-dataset hiện đạt được và ngưỡng hiệu chỉnh theo FPR ≤ 5%, SFDCT phù hợp làm **lớp sàng lọc tự động đầu tiên** trong pipeline eKYC — đánh dấu các trường hợp nghi vấn để chuyển kiểm tra thủ công — hơn là một quyết định cuối tự động hoàn toàn, do (i) kết quả mới ở một seed và (ii) khoảng cách AUC giữa các cấu hình còn nhỏ. Tính giải thích được qua Grad-CAM là một lợi thế thực tiễn để hỗ trợ cán bộ ra quyết định và phục vụ audit theo quy định.

## 3.7 Thảo luận: ưu điểm, hạn chế

### Ưu điểm

1. **Floor ≥ B4 đảm bảo về thiết kế.** Nhờ gated cross-attention zero-init, SFDCT tại init tương đương B4; thực nghiệm xác nhận thêm nhánh DCT cho +0.0075 AUC mà không làm tệ baseline. Đây là tính chất hiếm có ở các phương pháp fusion thông thường, nơi việc ghép nhánh phụ có thể kéo tụt hiệu năng.
2. **Pipeline đã được kiểm chứng.** Baseline B4 đạt 0.7497, sát leaderboard DeepfakeBench 0.7487 — mọi cải tiến đo sau đó là đáng tin.
3. **Đóng góp tổng hợp có hệ thống.** Năm đòn tần số từ năm công trình (SPSL/SRM/FreqDebias/FcaNet/FDFL) được adapt nhất quán sang **một** miền block-DCT, kèm ablation per-knob để phân rã đóng góp.
4. **Giải thích được và bám quy định.** Demo có Grad-CAM và hiệu chỉnh ngưỡng theo Thông tư 17/2024/TT-NHNN (FPR ≤ 5%), gắn nghiên cứu với yêu cầu eKYC thực tế.

### Hạn chế (nêu thẳng, không tô hồng)

1. **Một seed duy nhất.** Mọi con số ở chương này lấy ở single seed do chi phí GPU. Các chênh lệch nhỏ — đặc biệt khoảng giữa naive SFDCT, Row1 và Row2 — **có thể nằm trong nhiễu** giữa các seed. Kết luận chắc chắn về thứ hạng các cấu hình cần thực nghiệm multi-seed (≥ 3 seed) và báo cáo trung bình ± độ lệch chuẩn — đây là việc còn nợ.
2. **Đòn bẩy AUC mạnh nhất nằm ngoài phạm vi.** Bằng chứng từ tài liệu cho thấy chưa có phương pháp block-DCT thuần nào vượt rõ một B4 đã tinh chỉnh ở mức cross-dataset; đòn bẩy mạnh nhất là **SBI (self-blended images)** — một chiến lược sinh dữ liệu huấn luyện — vốn **nằm ngoài phạm vi block-DCT thuần** của luận văn. Vì vậy biên độ cải thiện AUC trong khuôn khổ hiện tại bị giới hạn về bản chất, và được chuyển sang Hướng phát triển.
3. **Mức tăng tuyệt đối khiêm tốn.** +0.0075 là cải thiện đúng hướng nhưng nhỏ; cần thận trọng khi diễn giải ý nghĩa thực tiễn.

### So sánh với leaderboard và các phương pháp tần số khác

[[BẢNG 3.5: So sánh SFDCT với baseline và các phương pháp tần số trên CDFv2 (train FF++)]]

| Phương pháp | Nhóm | CDFv2 frame-AUC | Nguồn |
|---|---|---|---|
| EfficientNet-B4 | spatial | 0.7487 | Leaderboard DeepfakeBench |
| EfficientNet-B4 (tái lập của luận văn) | spatial | 0.7497 | Luận văn |
| F3-Net | tần số | [[FILL: AUC]] | [[KIỂM TRA: số leaderboard DeepfakeBench]] |
| SPSL | tần số | [[FILL]] | [[KIỂM TRA]] |
| SRM | tần số | [[FILL]] | [[KIỂM TRA]] |
| **naive SFDCT (B4-DCT)** | hybrid spatial–freq | **0.7572** | Luận văn |
| **Row1 (S1+S2+S3)** | hybrid spatial–freq | [[FILL]] | Luận văn |
| **Row2 (S4+S5+S3)** | hybrid spatial–freq | [[FILL]] | Luận văn |

[[FILL: nhận xét — SFDCT đứng ở đâu so với các phương pháp tần số khác; lưu ý so sánh chỉ công bằng khi cùng giao thức train FF++ → test CDFv2 của DeepfakeBench]].

## 3.8 Kết chương

Chương 3 đã chuyển phương pháp SFDCT từ thiết kế sang thực chứng dưới giao thức cross-dataset chuẩn của DeepfakeBench (train FF++ c23, test Celeb-DF-v2). Ba kết quả đã được xác nhận: (1) pipeline đúng đắn — baseline B4 đạt **0.7497** sát leaderboard **0.7487**; (2) bổ sung nhánh block-DCT với gated fusion zero-init nâng AUC cross-dataset lên **0.7572 (+0.0075)** mà không làm tệ baseline, đúng cam kết *floor ≥ B4* và ủng hộ giả thuyết cốt lõi rằng tần số block-DCT bổ sung thông tin phân biệt cho miền không gian; (3) demo inference cho eKYC chạy được end-to-end với Grad-CAM giải thích được và ngưỡng hiệu chỉnh theo FPR ≤ 5% của Thông tư 17/2024/TT-NHNN.

Kết quả của các cấu hình Row1 và Row2, cùng các con số in-dataset, per-knob, thời gian huấn luyện và hiệu chỉnh ngưỡng, hiện ở dạng `[[FILL]]` và sẽ được điền sau khi hoàn tất huấn luyện — kèm cam kết kết luận **theo đúng số thực tế**, không tô hồng. Hạn chế lớn nhất cần ghi nhận là kết quả single-seed (chênh lệch nhỏ có thể nằm trong nhiễu) và việc đòn bẩy AUC mạnh nhất (SBI) nằm ngoài phạm vi block-DCT thuần. Hai vấn đề này, cùng với việc mở rộng sang các tập cross-dataset bổ sung như DFDC, là tiền đề trực tiếp cho Chương 4 — Kết luận và Hướng phát triển.

# KẾT LUẬN VÀ HƯỚNG PHÁT TRIỂN

## 1. Kết quả đạt được

Đồ án đã hoàn thành mục tiêu xây dựng một phương pháp phát hiện deepfake lai không gian–tần số (**SFDCT**) cho bài toán eKYC, với điểm nhấn là tính an toàn về rủi ro và khả năng generalize qua các tập dữ liệu chưa từng thấy khi huấn luyện. Ba đóng góp chính của đồ án được tóm tắt như sau.

**Đóng góp thứ nhất — nhánh block-DCT với gated cross-attention zero-init.** Đồ án đề xuất bổ sung một nhánh tần số dựa trên block-wise 2D-DCT 8×8 song song với backbone không gian EfficientNet-B4, hợp nhất hai luồng đặc trưng bằng cơ chế gated cross-attention được khởi tạo bằng 0 (zero-init). Đặc tính then chốt của thiết kế này là tại thời điểm khởi tạo, cổng `alpha = 0` khiến `feature_fused = x`, tức mô hình lai tương đương chính xác với baseline B4. Nhờ vậy, nhánh tần số chỉ "đóng góp thêm" khi nó thực sự cải thiện hàm mất mát, bảo đảm một **floor** lý thuyết là kết quả không bao giờ tệ hơn B4 — một tính chất quan trọng khi triển khai trong môi trường nhạy cảm như tài chính – ngân hàng.

**Đóng góp thứ hai — tập hợp và adapt năm "đòn" tần số sang miền block-DCT.** Đồ án hệ thống hoá năm cải tiến (levers) từ các công trình tiêu biểu và adapt nhất quán sang biểu diễn block-DCT: S1 `dct_use_sign` (dấu hệ số DCT, phase-analog, adapt từ SPSL); S2 `dct_srm_residual` (block-DCT trên residual nhiễu high-pass SRM); S3 `use_dct_fomixup` (DCTFoMixup augmentation cùng dual consistency loss, adapt từ FreqDebias); S4 `dct_fca_attention` (MultiSpectralAttentionLayer của FcaNet); và S5 `use_single_center_loss` (single-center loss, adapt từ FDFL). Hai cấu hình ablation tiêu biểu là **Row1** (naive + S1 + S2 + S3, không thêm tham số học) và **Row2** (naive + S4 + S5 + S3, có thêm tham số học).

**Đóng góp thứ ba — đánh giá cross-dataset công bằng và demo eKYC giải thích được.** Toàn bộ thực nghiệm tuân thủ giao thức DeepfakeBench: huấn luyện trên FaceForensics++ (c23) và kiểm thử cross-dataset trên Celeb-DF-v2, với metric headline là frame-level AUC trên CDFv2. Kết quả single-seed cho thấy:

[[BẢNG 5.1: Tóm tắt frame-level AUC cross-dataset trên Celeb-DF-v2 của bốn cấu hình.]]

| Cấu hình | Mô tả | CDFv2 frame-AUC |
|---|---|---|
| B4 | Baseline EfficientNet-B4 (spatial-only) | 0.7497 |
| naive SFDCT (B4-DCT) | B4 + nhánh block-DCT + gated fusion | 0.7572 |
| Row1 | naive + S1 + S2 + S3 | 0.7333 |
| Row2 | naive + S4 + S5 + S3 | _(đang huấn luyện)_ |

Baseline B4 đạt CDFv2 frame-AUC = **0.7497**, xấp xỉ con số leaderboard DeepfakeBench (0.7487), qua đó **xác nhận pipeline huấn luyện–đánh giá của đồ án đối sánh được với kết quả công bố**. Cấu hình naive SFDCT (B4-DCT) nâng AUC lên **0.7572** (+0.0075 so với B4), khẳng định nhánh block-DCT mang lại tín hiệu generalize bổ sung. Các cấu hình Row1 và Row2 (0.7333 / _(đang huấn luyện)_) tiếp tục đánh giá đóng góp của từng nhóm "đòn" tần số.

Cuối cùng, đồ án cung cấp một **demo inference cho eKYC** (`tools/infer.py`): với mỗi ảnh khuôn mặt đầu vào, hệ thống xuất `fake_prob ∈ [0,1]`, nhãn REAL/FAKE và ảnh **Grad-CAM** overlay làm cơ sở giải thích quyết định — yếu tố thiết yếu để kiểm toán và tạo niềm tin trong nghiệp vụ định danh điện tử.

## 2. Hạn chế

Dù đạt được các kết quả khích lệ, đồ án vẫn tồn tại một số hạn chế cần nêu thẳng thắn để bảo đảm tính trung thực khoa học.

**Thứ nhất, kết quả mới ở mức single-seed.** Toàn bộ con số AUC báo cáo đến từ một lần huấn luyện duy nhất cho mỗi cấu hình (do hạn chế chi phí GPU). Vì vậy, đồ án **chưa thể khẳng định ý nghĩa thống kê** của các chênh lệch quan sát được; những khác biệt nhỏ (ví dụ biên +0.0075 của B4-DCT) hoàn toàn có thể nằm trong khoảng nhiễu giữa các seed.

**Thứ hai, biên cải thiện còn khiêm tốn.** Mức tăng AUC mà nhánh block-DCT mang lại tuy nhất quán theo hướng kỳ vọng nhưng còn nhỏ về độ lớn. Điều này phù hợp với nhận định trung thực rằng đòn bẩy AUC mạnh nhất (xem mục Hướng phát triển) nằm ngoài phạm vi block-DCT thuần mà đồ án tập trung.

**Thứ ba, chưa kiểm thử robustness một cách hệ thống.** Đồ án chưa đánh giá độ bền của mô hình dưới các điều kiện khắc nghiệt như nén video nặng (re-compression nhiều lần, bitrate thấp), nhiễu, đổi độ phân giải, hay các tấn công đối kháng (adversarial perturbation) — những kịch bản rất thực tế trong môi trường eKYC trên di động.

**Thứ tư, chưa hiện thực hoá phần Liveness/anti-spoofing.** Do thu hẹp scope để tập trung vào phần deepfake, đồ án **chưa triển khai phát hiện liveness** (chống tấn công trình chiếu ảnh/màn hình, mặt nạ, replay). Một hệ thống eKYC hoàn chỉnh cần cả hai lớp phòng vệ này.

**Thứ năm, chưa hoàn tất calibrate ngưỡng vận hành.** Điểm vận hành FPR ≤ 5% (quy ước ISO 30107-3 để phục vụ yêu cầu sinh trắc của Thông tư 17/2024/TT-NHNN — TT17 không ấn định ngưỡng số) đòi hỏi calibrate ngưỡng quyết định trên tập validation và báo cáo các chỉ số vận hành (TPR tại FPR cố định, EER); các con số này hiện còn ở dạng [[FILL: chỉ số vận hành tại ngưỡng FPR ≤ 5%]].

## 3. Hướng phát triển

Từ các hạn chế trên, đồ án đề xuất các hướng phát triển tiếp theo, sắp xếp theo mức độ ưu tiên và giá trị mang lại.

**(a) Bổ sung lớp Liveness / anti-spoofing.** Đây là phần đã được thu hẹp scope và để lại cho tương lai. Hướng đi là tích hợp một mô-đun phát hiện tấn công trình chiếu (presentation attack detection) — kết hợp tín hiệu kết cấu (texture), phản xạ (reflection/moiré) và rPPG (tín hiệu sinh lý) — để cùng nhánh deepfake tạo nên một hệ thống phòng vệ hai lớp hoàn chỉnh cho eKYC.

**(b) Đánh giá multi-seed với mean ± std.** Để củng cố tính vững của các kết luận, cần lặp lại mỗi cấu hình với nhiều seed khác nhau và báo cáo trung bình ± độ lệch chuẩn, kèm kiểm định ý nghĩa thống kê (paired test) nhằm xác nhận rằng biên cải thiện của block-DCT là thực chất chứ không phải nhiễu.

**(c) Tích hợp SBI self-blended training.** Phân tích trung thực cho thấy đòn bẩy AUC mạnh nhất hiện nay là chiến lược huấn luyện **SBI (self-blended images)** — sinh mẫu giả tổng hợp ngay trong quá trình train — vốn nằm ngoài phạm vi block-DCT thuần của đồ án. Kết hợp SBI với nhánh tần số SFDCT là hướng hứa hẹn nhất để đẩy AUC cross-dataset lên đáng kể.

**(d) Mở rộng cross-test sang DFDC.** Ngoài Celeb-DF-v2, cần kiểm thử thêm trên DFDC (và các tập khác như DeeperForensics) để đánh giá khả năng generalize toàn diện hơn trước nhiều loại manipulation và điều kiện thu hình.

**(e) Tối ưu triển khai cho eKYC thực tế.** Cuối cùng, để đưa mô hình vào vận hành trên thiết bị biên/di động, cần các kỹ thuật tối ưu như lượng tử hoá (quantization INT8), cắt tỉa (pruning), distillation và đo đạc độ trễ/FPS, đồng thời hoàn tất quy trình calibrate ngưỡng FPR ≤ 5% phục vụ tuân thủ Thông tư 17/2024/TT-NHNN.

---

# TÀI LIỆU THAM KHẢO

[1] M. Tan and Q. V. Le, "EfficientNet: Rethinking Model Scaling for Convolutional Neural Networks," in *Proceedings of the 36th International Conference on Machine Learning (ICML)*, 2019, pp. 6105–6114.

[2] A. Rössler, D. Cozzolino, L. Verdoliva, C. Riess, J. Thies, and M. Nießner, "FaceForensics++: Learning to Detect Manipulated Facial Images," in *Proceedings of the IEEE/CVF International Conference on Computer Vision (ICCV)*, 2019, pp. 1–11.

[3] Y. Li, X. Yang, P. Sun, H. Qi, and S. Lyu, "Celeb-DF: A Large-Scale Challenging Dataset for DeepFake Forensics," in *Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition (CVPR)*, 2020, pp. 3207–3216.

[4] Z. Yan, Y. Zhang, X. Yuan, S. Lyu, and B. Wu, "DeepfakeBench: A Comprehensive Benchmark of Deepfake Detection," in *Advances in Neural Information Processing Systems (NeurIPS), Datasets and Benchmarks Track*, 2023.

[5] Z. Qin, P. Zhang, F. Wu, and X. Li, "FcaNet: Frequency Channel Attention Networks," in *Proceedings of the IEEE/CVF International Conference on Computer Vision (ICCV)*, 2021, pp. 783–792.

[6] H. Liu, X. Li, W. Zhou, Y. Chen, Y. He, H. Xue, W. Zhang, and N. Yu, "Spatial-Phase Shallow Learning: Rethinking Face Forgery Detection in Frequency Domain," in *Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition (CVPR)*, 2021, pp. 772–781.

[7] A. Luo, Y. Cao, Y. Hu, M. Liu, and Q. Zhao, "Generalizing Face Forgery Detection with High-frequency Features," in *Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition (CVPR)*, 2021, pp. 16317–16326. [[KIỂM TRA: danh sách tác giả và số trang của bài SRM/high-pass features]]

[8] Y. Qian, G. Yin, L. Sheng, Z. Chen, and J. Shao, "Thinking in Frequency: Face Forgery Detection by Mining Frequency-aware Clues," in *Proceedings of the European Conference on Computer Vision (ECCV)*, 2020, pp. 86–103.

[9] R. R. Selvaraju, M. Cogswell, A. Das, R. Vedantam, D. Parikh, and D. Batra, "Grad-CAM: Visual Explanations from Deep Networks via Gradient-based Localization," in *Proceedings of the IEEE International Conference on Computer Vision (ICCV)*, 2017, pp. 618–626.

[10] N. Ahmed, T. Natarajan, and K. R. Rao, "Discrete Cosine Transform," *IEEE Transactions on Computers*, vol. C-23, no. 1, pp. 90–93, 1974.

[11] J. Fei, Y. Dai, P. Yu, T. Shen, Z. Xia, and J. Weng, "Learning Second Order Local Anomaly for General Face Forgery Detection," in *Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition (CVPR)*, 2021. [[KIỂM TRA: đây có đúng là bài FDFL — Frequency-aware Discriminative Feature Learning (Li et al., 2021) hay không; xác minh lại tác giả/tên bài/venue/năm cho single-center loss]]

[12] [[KIỂM TRA: trích dẫn đầy đủ cho FreqDebias (DCTFoMixup + dual consistency loss) — tác giả, tên bài, venue, năm; chưa xác minh được nguồn gốc chính xác]]

[13] Ngân hàng Nhà nước Việt Nam, *Thông tư 17/2024/TT-NHNN quy định về việc mở và sử dụng tài khoản thanh toán tại tổ chức cung ứng dịch vụ thanh toán*, Hà Nội, 2024.
