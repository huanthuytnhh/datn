# Kịch bản trình bày bảo vệ — SFDCT (15 phút)
> Sinh viên Lê Ngọc Thanh · 102220041 · 22T_KHDL · Thời lượng nói: **~13–15 phút** tùy nhịp (2.672 token nói; kế hoạch theo bảng = 14:14). Bấm giờ thử ≥2 lần để chốt — xem Phụ lục B.

---

## 1. Bốn–năm keypoint trọng tâm

- **KP1 — Bài toán niềm tin eKYC là một khoảng trống tổng quát hóa cross-dataset.** eKYC đặt cược một tài khoản ngân hàng vào một tấm ảnh khuôn mặt trước cả deepfake lẫn tấn công trình diễn, và cái khó thật sự là detector học trên một họ giả mạo thường sụp đổ trên họ chưa từng thấy — nên bài kiểm tra trung thực là train trên FF++, test trên Celeb-DF-v2.
- **KP2 — Dấu vết giả mạo mờ trong điểm ảnh nhưng rõ trong các dải tần block-DCT.** Đường ghép blending, đỉnh upsampling của GAN và phổ tần gãy gần như vô hình với mắt nhưng tách bạch ở các dải DCT trung và cao, nên một đặc trưng block-DCT 48 chiều cố định, rẻ tiền có thể mang phần bằng chứng còn thiếu.
- **KP3 — SFDCT hai nhánh với cổng hợp nhất zero-init vừa là thiết kế an toàn vừa là đồng hồ đo trung thực.** Gắn nhánh tần số qua gated cross-attention khởi tạo bằng 0 khiến mô hình hợp nhất bắt đầu y hệt backbone B4 đã kiểm chứng (floor guarantee), nên nhánh tần số an toàn để nghiên cứu và cổng alpha học được đo trực tiếp tần số giúp ích bao nhiêu.
- **KP4 — Kết quả cross-dataset trung thực: thứ tự đúng ở mức frame, cải thiện nhỏ và nằm trong nhiễu single-seed, không SOTA.** Baseline tái lập số công bố 0.7487 trong khoảng 0.001, AUC xếp đúng giả thuyết ở mức frame, nhưng mọi paired bootstrap CI đều chứa 0 — đóng góp là tính chặt chẽ, không phải một con số trên bảng xếp hạng.
- **KP5 — Một hệ thống eKYC giải thích được, chạy CPU: Grad-CAM, liveness pre-filter.** Detector chạy thật như một web service trên CPU, trả verdict kèm Grad-CAM trong khoảng một giây, đặt sau một cascade liveness, biến phương pháp thành một tín hiệu rủi ro có thể kiểm tra lại thay vì một cổng hộp đen.

---

## 2. Dòng thời gian (bảng)

| Phần | Slide | Thời lượng | Mốc tích luỹ (mm:ss) |
|---|---|---:|---:|
| Mở đầu | 1 — Title | 28s | 0:28 |
| Mở đầu | 2 — Divider Phần 1 | 7s | 0:35 |
| Mở đầu | 3 — Motivation & Objectives | 75s | 1:50 |
| Phương pháp | 4 — Divider Phần 2 | 7s | 1:57 |
| Phương pháp | 5 — Frequency Hypothesis | 62s | 2:59 |
| Phương pháp | 6 — Block-DCT Descriptor | 58s | 3:57 |
| Phương pháp | 7 — Two-Stream SFDCT | 78s | 5:15 |
| Phương pháp | 8 — Forgery Footprints (FF++) | 52s | 6:07 |
| Phương pháp | 9 — Gated Cross-Attention Fusion | 96s | 7:43 |
| Phương pháp | 10 — HFF Variant & Liveness Reuse | 66s | 8:49 |
| Kết quả | 11 — Divider Phần 3 | 7s | 8:56 |
| Kết quả | 12 — Cross-Dataset Results | 92s | 10:28 |
| Kết quả | 13 — Explainable Grad-CAM | 48s | 11:16 |
| Kết quả | 14 — An Honest Reading | 84s | 12:40 |
| Kết luận | 15 — Divider Phần 4 | 7s | 12:47 |
| Kết luận | 16 — Conclusion & Future Work | 74s | 14:01 |
| Kết luận | 17 — Thank You / Q&A | 13s | 14:14 |
| **Tổng** | **17 slide** | **854s** | **14:14** |

---

## 3. Kịch bản chi tiết theo slide

### Slide 1 — Title Slide · Graduate Thesis Defense  ⏱ ~28s  ▸ Keypoint NAV

**Lời nói:**
Kính thưa hội đồng, em là Lê Ngọc Thanh, mã số sinh viên 102220041, lớp 22T_KHDL, ngành Khoa học Máy tính và Trí tuệ Nhân tạo. Hôm nay em xin trình bày đồ án tốt nghiệp: hệ thống lai không gian–tần số block-DCT phát hiện deepfake và liveness cho eKYC, dưới sự hướng dẫn của thầy Phạm Công Thắng.

**Cue:**
- [chỉ vào tên đề tài]
- đọc rõ mã số 102220041, lớp 22T_KHDL
- nói tên thầy hướng dẫn chậm, rõ
- click sang slide divider Phần 1

---

### Slide 2 — Part 1 · Introduction (divider)  ⏱ ~7s  ▸ Keypoint NAV

**Lời nói:**
Trước hết, em xin bắt đầu với Phần 1 — đặt vấn đề: vì sao bài toán phát hiện deepfake trong eKYC lại khó.

**Cue:**
- [chỉ vào tiêu đề PART 1 — INTRODUCTION]
- nhấn từ "khó"
- click sang slide Motivation

---

### Slide 3 — Motivation & Objectives  ⏱ ~75s  ▸ Keypoint KP1

**Lời nói:**
eKYC xác minh danh tính chỉ từ một tấm ảnh khuôn mặt — đó là ổ khoá ở cánh cửa đầu tiên vào tài khoản ngân hàng, nên nó trở thành mục tiêu của hai loại tấn công. Thứ nhất là deepfake: dùng GAN để hoán đổi hoặc tổng hợp khuôn mặt. Thứ hai là tấn công trình diễn, presentation attack: chìa ảnh in hoặc phát lại màn hình. Về pháp lý, Thông tư 17 năm 2024 của Ngân hàng Nhà nước bắt buộc kiểm tra sinh trắc học, nhưng không quy định một ngưỡng sai số bằng số cụ thể, nên việc chọn điểm vận hành là phần kỹ thuật mà đồ án phải tự chịu trách nhiệm.

*(click + im lặng 1 giây — ngắt nhịp giữa đặt-vấn-đề và mục-tiêu)*

Cái khó khoa học thật sự không nằm ở độ chính xác trên cùng một tập, mà ở cross-dataset: một detector học trên một họ giả mạo thường sụp đổ khi gặp họ chưa từng thấy. Vì vậy bài kiểm tra trung thực là huấn luyện trên FaceForensics++ và kiểm thử trên Celeb-DF-v2. Từ đó đồ án đặt ba mục tiêu: một, hệ thống web cho phép tải lên hoặc chụp ảnh và trả verdict nhanh; hai, mục tiêu chính, là detector deepfake có nhánh tần số block-DCT hợp nhất với backbone qua gated attention, kèm bản đồ nhiệt Grad-CAM; và ba, mục tiêu phụ, là module liveness.

**Cue:**
- [chỉ vào cột Real-World Context]
- nhấn "một tấm ảnh", "hai loại tấn công"
- [chỉ vào Circular 17/2024] nói rõ KHÔNG có ngưỡng sai số bằng số
- *click + im lặng 1 giây* trước khi sang mục tiêu
- nhấn từ cross-dataset
- [chỉ sang cột Objectives] đếm 1–2–3 bằng tay
- click sang divider Phần 2

---

### Slide 4 — Part 2 · Methodology (divider)  ⏱ ~7s  ▸ Keypoint NAV

**Lời nói:**
Đã rõ vấn đề và mục tiêu, em chuyển sang Phần 2 — phương pháp đề xuất. Em sẽ đi từ giả thuyết tần số, rồi đến công cụ đọc tần số, và cuối cùng là cách hợp nhất hai nhánh.

**Cue:**
- [chỉ vào tiêu đề PART 2 — METHODOLOGY]
- giọng chuyển nhịp, ngắn gọn
- click sang slide 5

---

### Slide 5 — The Frequency Hypothesis: Three Forgery Traces  ⏱ ~62s  ▸ Keypoint KP2

**Lời nói:**
Để chống được forgery mà mình chưa từng thấy, ta phải bám vào dấu vết mang tính phổ quát, vì nếu chỉ học mẹo riêng của một bộ công cụ thì mô hình sẽ sụp đổ trên dữ liệu lạ. Giả thuyết trung tâm của đồ án là: dấu vết giả mạo mờ trong điểm ảnh nhưng rõ trong miền tần số, và em phân thành ba loại. Thứ nhất là blending boundary, tức đường ghép khi face-swap dán mặt giả lên ảnh thật; bằng mắt thường gần như không thấy, nhưng nó để lại vết ở các dải DCT tần trung. Thứ hai là upsampling artifact: mọi mạng GAN đều có lớp phóng to ảnh, và phép phóng to đó in ra những đỉnh năng lượng có chu kỳ ở các dải tần cao. Thứ ba là frequency inconsistency: một máy ảnh thật in lên ảnh một phổ tần nhất quán, còn một khuôn mặt được ghép hay tổng hợp sẽ phá vỡ tính nhất quán đó. Điểm chung của cả ba là nguyên nhân phổ quát — generator nào cũng upsample, blend nào cũng làm gãy phổ — nên đây là manh mối đáng tin để tổng quát hóa cross-dataset.

**Cue:**
- [chỉ vào ba thẻ: blending, upsampling, frequency inconsistency]
- nhấn cụm 'mờ trong điểm ảnh nhưng rõ trong miền tần số'
- [chỉ thẻ 2 — đỉnh dải cao]
- click sang slide 6

---

### Slide 6 — Block-DCT Descriptor  ⏱ ~58s  ▸ Keypoint KP2

**Lời nói:**
Câu hỏi tiếp theo là: đọc tần số bằng công cụ gì cho rẻ và diễn giải được. Câu trả lời của em là một đặc trưng block-DCT 48 chiều, cố định, không có một tham số học nào. Quy trình gồm các bước sau. Đầu tiên, em tách ảnh sang không gian màu YCbCr để phân biệt kênh độ sáng và hai kênh màu. Sau đó chia ảnh thành các khối 8 nhân 8 không chồng lấn, đúng bằng lưới mà JPEG dùng. Mỗi khối qua phép 2D-DCT cho ra 64 hệ số, em lấy log của một cộng trị tuyệt đối để nén lại, vì hệ số DC lớn hơn các hệ số khác hàng nghìn lần. Tiếp theo, em quét zigzag và gộp 64 hệ số thành 16 dải tần, mỗi dải lấy trung bình độ lớn trên ba kênh, ra 16 nhân 3 bằng 48 chiều. Vì là phép biến đổi cố định nên đặc trưng này rẻ, ổn định qua các dữ liệu khác nhau, và diễn giải được theo từng dải — dải thấp là nội dung, dải giữa và cao mới là nơi dấu vết giả mạo nằm.

**Cue:**
- [chỉ vào sơ đồ 8×8 → 64 hệ số → zigzag → 16 dải × 3 kênh = 48-D]
- nhấn '48 chiều, không một tham số học nào'
- nhấn '8 nhân 8, đúng lưới JPEG'
- click sang slide 7

---

### Slide 7 — Two-Stream SFDCT Architecture  ⏱ ~78s  ▸ Keypoint KP3

**Lời nói:**
Đã có nhánh điểm ảnh và nhánh tần số, đóng góp chính của đồ án nằm ở cách ghép chúng — kiến trúc hai nhánh SFDCT, và em xin nhấn mạnh: em giữ nguyên backbone EfficientNet-B4 đã được kiểm chứng, không thay backbone. Đầu vào là một khuôn mặt đã căn chỉnh bằng MTCNN, kích thước 256 nhân 256, đưa song song vào hai luồng. Luồng phía trên, màu xanh dương, là nhánh không gian EfficientNet-B4, đọc điểm ảnh và cho ra bản đồ đặc trưng F s. Luồng phía dưới, màu xanh lá, là nhánh tần số block-DCT 48 chiều mà em vừa trình bày, không có tham số học. Ở giữa là khối hợp nhất gated cross-attention: đặc trưng không gian truy vấn nhánh tần số, và một cổng alpha khởi tạo bằng 0 quyết định cộng thêm bao nhiêu. Cuối cùng, đầu ra cho ra xác suất real hay fake kèm một bản đồ nhiệt Grad-CAM. Em chọn B4 có lý do: đó là backbone của benchmark công khai nên so sánh công bằng, đủ lớn để học đặc trưng tinh vi mà vẫn vừa một GPU tầm trung, và thiết kế cho 380 pixel nên ở 256 pixel vẫn giữ được chi tiết.

**Cue:**
- [chỉ vào sơ đồ kiến trúc: luồng xanh dương trên, xanh lá dưới, khối giữa]
- nhấn 'giữ nguyên backbone B4, không thay backbone'
- nhấn '256 nhân 256, MTCNN'
- [chỉ vào cổng alpha = 0 ở giữa]
- click sang slide 8

---

### Slide 8 — Forgery Footprints · FF++ in Pixels and DCT  ⏱ ~52s  ▸ Keypoint KP2

**Lời nói:**
Để hội đồng thấy giả thuyết tần số không phải nói suông, đây là dấu vết của từng kiểu giả mạo trên dữ liệu thật FaceForensics++, trình bày trên ba hàng. Năm cột là năm loại: ảnh thật, rồi Deepfakes, Face2Face, FaceSwap và NeuralTextures. Hàng một là ảnh RGB — bằng mắt thường các khuôn mặt giả trông sạch, gần như không phân biệt được. Hàng hai là phổ DCT dạng log: lúc này các ảnh giả lộ ra năng lượng có cấu trúc bất thường ở dải tần giữa và cao. Hàng ba là residual so với ảnh thật, cho thấy đúng artifact mà nhánh tần số nhắm tới. Đây chính là điều giả thuyết nói: manh mối yếu trong điểm ảnh nhưng rõ trong tần số — nên nhánh tần số là thứ em chứng minh được, không phải áp đặt.

**Cue:**
- [chỉ vào lưới: 5 cột, 3 hàng]
- nhấn 'hàng một sạch, hàng hai lộ dải giữa/cao'
- [quét tay từ hàng RGB xuống hàng DCT]
- click sang slide 9

---

### Slide 9 — Gated Cross-Attention Fusion  ⏱ ~96s  ▸ Keypoint KP3

**Lời nói:**
Đây là trọng tâm của đồ án — cơ chế hợp nhất gated cross-attention, vừa là thiết kế an toàn, vừa là một đồng hồ đo trung thực. Em mô tả ba bước.

*(dừng nhịp)* Một, truy vấn Query là đặc trưng không gian F s: bản đồ đặc trưng của B4 hỏi rằng tại mỗi vị trí, dải tần nào là quan trọng.

*(dừng nhịp)* Hai, Key và Value là đặc trưng block-DCT D: mỗi vị trí không gian lấy về một bản tóm tắt tần số 48 chiều có trọng số — tức là hợp nhất có chọn lọc theo vùng, chứ không phải nối phẳng hai vector lại với nhau.

*(dừng nhịp)* Ba, là phần cốt lõi, gated residual ở phương trình 2.5: F hợp nhất bằng F s cộng alpha nhân context, trong đó alpha khởi tạo bằng 0. Hệ quả là ở bước huấn luyện đầu tiên, mô hình hợp nhất bằng đúng backbone đã kiểm chứng — em gọi đây là floor guarantee, đảm bảo sàn: nhánh tần số không thể kéo mô hình xuống dưới baseline ngay từ lúc khởi tạo.

Và vì alpha được học, nó chính là chiếc đồng hồ đo trực tiếp nhánh tần số đóng góp bao nhiêu. Hình histogram bên phải là phân bố alpha theo từng kênh sau khi huấn luyện: alpha trung bình bằng cộng 0 chấm 000, độ lớn cực đại chỉ khoảng 0 chấm 0232 trên 1792 kênh. Nghĩa là gần như mọi kênh alpha xấp xỉ 0, cổng chỉ hé mở rất ít. Và đây là điểm em muốn nối thẳng tới phần kết quả: chính vì cổng chỉ hé mở mà cải thiện AUC chỉ khoảng cộng 0 chấm 007 và nằm trong nhiễu — hai con số này khớp nhau, đó là bằng chứng nội tại của tính trung thực. Em trình bày đúng như đo được: đóng góp là có, nhưng nhỏ và trung thực.

**Cue:**
- [chỉ vào ba bước ①②③] — dừng nhịp rõ giữa từng bước, không đọc liền một khối
- nhấn 'alpha khởi tạo bằng 0 — floor guarantee'
- [chỉ vào histogram α]
- nhấn 'trung bình +0.000, max chỉ 0.0232 trên 1792 kênh'
- nhấn câu nối 'gate hé mở → gain +0.007 → khớp nhau'
- click sang slide 10

---

### Slide 10 — SFDCT-HFF Variant & Liveness Reuse  ⏱ ~66s  ▸ Keypoint KP3

**Lời nói:**
Cùng một backbone B4 và cùng cổng zero-init, em làm hai thí nghiệm có kiểm soát. Thứ nhất là biến thể SFDCT-HFF: em chỉ đổi carrier tần số, thay vì thống kê theo dải thì dùng một ảnh residual cao tần — em ép các dải DCT thấp về 0 rồi DCT ngược, và một khối Conv-BN-ReLU đa tỉ lệ đọc ảnh residual đó. Vì mọi thứ khác giữ nguyên, chênh lệch đo được quy đúng về cách biểu diễn tần số, và biến thể này đạt AUC 0 chấm 7695 — cao nhất trong họ. Em xin gắn caveat ngay: con số này lấy ở checkpoint tốt nhất trong các lần đánh giá hai lần mỗi epoch, rơi vào giữa epoch 1, và khoảng tin cậy bắt cặp với baseline là cộng 0 chấm 007 với khoảng từ trừ 0 chấm 022 đến cộng 0 chấm 037, vẫn chứa 0 — em áp cùng chính sách chọn cho mọi mô hình nên so sánh vẫn công bằng, nhưng đây không phải cải thiện có ý nghĩa thống kê.

Thứ hai, em tái dùng đúng thiết kế cho liveness. Cascade là thiết kế hệ thống ở Chương 3 — liveness chạy trước verdict deepfake — còn phần nối liveness vào endpoint hiện vẫn là một hạng mục tích hợp. Và em nói thẳng kết quả đo được: B4 đạt AUC 0 chấm 9829, B4 cộng block-DCT đạt 0 chấm 9776 — nhánh tần số KHÔNG cải thiện, đúng như bên deepfake, em báo cáo trung thực. Như vậy thiết kế backbone cộng cổng zero-init tái dùng được sang liveness và floor guarantee giữ nguyên, nhưng tần số giúp ích thì chưa — đây là một kết quả âm và em coi việc báo cáo thẳng là điểm mạnh.

**Cue:**
- [chỉ vào hình 1: kiến trúc HFF — carrier residual]
- nhấn 'HFF AUC 0.7695' rồi gắn ngay caveat 'mid-epoch best-checkpoint, paired CI [-0.022, +0.037] chứa 0'
- [chỉ vào hình 2: sơ đồ cascade liveness]
- nói rõ 'cascade là thiết kế Ch3, nối endpoint vẫn là integration item'
- nhấn 'B4 0.9829 > B4+DCT 0.9776 — tần số KHÔNG cải thiện, kết quả âm trung thực'
- click sang slide 11

---

### Slide 11 — Part 3 · Experiments & Results (divider)  ⏱ ~7s  ▸ Keypoint NAV

**Lời nói:**
Phương pháp đã trọn vẹn, em sang Phần 3 — thực nghiệm và kết quả. Và đây là phần em xin trình bày thật trung thực, không tô hồng.

**Cue:**
- [chỉ vào tiêu đề PART 3]
- giọng bình tĩnh, mở đầu phần quan trọng
- click sang slide kết quả

---

### Slide 12 — Cross-Dataset Results · Train FF++, Test Celeb-DF-v2  ⏱ ~92s  ▸ Keypoint KP4

**Lời nói:**
Toàn bộ thí nghiệm huấn luyện trên FaceForensics++ và kiểm thử trên Celeb-DF-v2 — một bộ dữ liệu mô hình chưa từng thấy lúc train, đúng tinh thần cross-dataset. Trước khi nói tới cải thiện, em phải chứng minh pipeline đáng tin: baseline EfficientNet-B4 của em đạt AUC mức frame 0 chấm 7497, khớp trong khoảng 0 chấm 001 với số công bố 0 chấm 7487. Khớp được con số gốc nghĩa là khung đánh giá của em đặt đúng, nên mọi so sánh sau đó mới có giá trị.

Nhìn đường ROC bên trái: ở mức frame, thứ tự là B4 nhỏ hơn SFDCT, nhỏ hơn SFDCT-HFF — đúng như giả thuyết tần số dự đoán. Nhưng em xin nói rõ cả mặt còn lại: ở mức video, sau bootstrap, thứ tự bị đảo — SFDCT video AUC chỉ 0 chấm 8083, còn thấp hơn baseline 0 chấm 8203. Chính việc thứ tự không giữ ở mức video là một lý do nữa khiến em không tuyên bố cải thiện. Đường AUC theo epoch bên phải cho đỉnh SFDCT-HFF 0 chấm 7695 ở checkpoint giữa epoch 1, cao nhất họ ở mức frame.

Tại điểm vận hành eKYC, với FPR bằng 5%, catch rate chỉ khoảng 23%. Em không né con số đó — và xin nói thêm bối cảnh: đây là sàn ở mức một khung hình; gộp theo video nâng lên khoảng một phần ba, và đẩy vùng không chắc sang người duyệt đạt khoảng một nửa cho biến thể mạnh nhất. Em cũng lưu ý: 5% là lựa chọn kỹ thuật của em theo một chuẩn quốc tế, KHÔNG phải ngưỡng do Thông tư 17 quy định. Nó nói rõ mô hình là một lớp sàng lọc rủi ro, không phải cổng chặn tuyệt đối.

**Cue:**
- [chỉ vào ROC bên trái] nhấn mạnh ba đường sát nhau
- stress 0.7497 vs 0.7487, dùng đúng từ 'khớp trong khoảng 0.001' (KHÔNG nói 'tuyệt đối')
- nói rõ 'ở mức frame' mỗi lần đọc thứ tự B4<SFDCT<HFF
- [chỉ video-level] 'SFDCT video 0.8083 < baseline 0.8203 → đảo thứ tự'
- [chỉ vào đường epoch] đỉnh 0.7695 ở checkpoint giữa epoch 1
- nhấn 'FPR 5% → catch ~23%' rồi gắn ngay 'video ~1/3, human-review ~1/2; 5% KHÔNG do TT17 quy định'
- *dừng 1 nhịp sau mỗi con số quan trọng để hội đồng kịp ghi*

---

### Slide 13 — Explainable Output · Grad-CAM Heat-map  ⏱ ~48s  ▸ Keypoint KP5

**Lời nói:**
Một con số AUC đơn lẻ là một hộp đen, mà eKYC ngân hàng thì không thể tin hộp đen. Nên mỗi phản hồi của hệ thống đều kèm bằng chứng trực quan: bản đồ nhiệt Grad-CAM. Bên trái là ảnh đầu vào giả, bên phải là Grad-CAM phủ lên cùng khuôn mặt. Vùng nóng tập trung đúng vào vùng bị ghép, vùng giả mạo — tức mô hình thật sự nhìn vào nơi có dấu vết, chứ không phán bừa. Nhờ vậy, đầu ra trở thành một tín hiệu rủi ro có bằng chứng để người duyệt eKYC kiểm tra lại, thay vì một điểm số vô hình.

**Cue:**
- [chỉ vào ảnh trái] đầu vào giả
- [chỉ vào heat-map phải] vùng nóng = vùng ghép
- nhấn: bằng chứng cho người duyệt, không phải hộp đen
- click sang slide 14

---

### Slide 14 — Results · An Honest Reading  ⏱ ~84s  ▸ Keypoint KP4

**Lời nói:**
Và đây là phần em coi trọng nhất — đọc kết quả một cách trung thực. Thứ nhất, thứ tự đúng giả thuyết ở mức frame: B4 nhỏ hơn SFDCT nhỏ hơn SFDCT-HFF, và floor guarantee từ zero-init giữ đúng cho mọi biến thể. Thứ hai, và quan trọng nhất, cải thiện là nhỏ và không phải SOTA: chỉ một seed cho mỗi cấu hình, em bootstrap 518 clip hai nghìn lần, và mọi khoảng tin cậy bootstrap CI bắt cặp với baseline đều chứa số 0 — kể cả ở mức video, nơi SFDCT còn thấp hơn baseline. Nghĩa là không biến thể nào tách khỏi baseline một cách có ý nghĩa thống kê. Thứ ba, tại 5% FPR mô hình bắt được khoảng 23% deepfake ở mức một khung hình — đúng vai một lớp sàng lọc trong cascade. Thứ tư, một phương pháp tần số dựa trên pha đã công bố đạt 0 chấm 7650, nằm ngay trong khoảng cải thiện của em — khẳng định lại rằng phần tăng nằm trong nhiễu single-seed.

Vì thế, em xin chốt một lần nữa câu trung thực của đồ án: cải thiện nhỏ, nằm trong nhiễu single-seed, mọi khoảng tin cậy bắt cặp đều chứa 0, em không tuyên bố SOTA — đóng góp của đồ án là tính chặt chẽ phương pháp. Và em coi chính sự trung thực này là điểm mạnh.

**Cue:**
- [chỉ vào 4 gạch đầu dòng lần lượt]
- nhấn lại 'ở mức frame' cho thứ tự, rồi 'mức video SFDCT < baseline'
- stress: mọi paired CI chứa 0, 518 clip, 2000 lần
- stress: baseline tần số 0.7650 → gains trong nhiễu
- kết: lặp câu chốt trung thực (lần 2/3), giọng tự tin
- click sang slide 15

---

### Slide 15 — Part 4 · Conclusion & Future Work (divider)  ⏱ ~7s  ▸ Keypoint NAV

**Lời nói:**
Từ những kết quả vừa trình bày, em chuyển sang Phần 4 — kết luận và hướng phát triển.

**Cue:**
- [chỉ vào tiêu đề PART 4]
- giọng chuyển nhịp, chậm lại
- click sang slide 16 ngay sau câu này

---

### Slide 16 — Conclusion & Future Work  ⏱ ~74s  ▸ Keypoint KP5

**Lời nói:**
Tóm lại, đóng góp của đồ án không nằm ở con số AUC mà ở tính chặt chẽ phương pháp, gồm ba điểm. Thứ nhất, zero-init floor guarantee: cổng khởi tạo bằng 0 nên mô hình hợp nhất bắt đầu y hệt backbone đã kiểm chứng, nhánh tần số không thể làm tệ đi tại bước đầu. Thứ hai, đánh giá cross-dataset trung thực với bootstrap CI: mọi khoảng tin cậy đều chứa 0, nên em không tuyên bố SOTA. Thứ ba, một hệ thống eKYC giải thích được, chạy CPU, khoảng một giây mỗi ảnh kèm Grad-CAM.

Về giới hạn, em nói thẳng: mỗi cấu hình chỉ một seed, cải thiện nhỏ và nằm trong nhiễu; ngưỡng vận hành hiện còn hiệu chỉnh trên chính tập test — đây là điểm em sẽ sửa bằng một tập validation riêng và hiệu chỉnh lại trên phân phối người Việt trước khi production; FPR 5% là lựa chọn kỹ thuật của em, không phải ngưỡng do Thông tư 17 quy định; và độ bền với nén chưa kiểm thử. Hướng tiếp theo là chạy multi-seed, gắn điểm liveness vào cascade, và huấn luyện self-blended cùng nhánh tần số. Em xin nhắc lại một lần cuối: đóng góp là tính chặt chẽ phương pháp chứ không phải một con số trên bảng xếp hạng — và em coi sự trung thực đó là điểm mạnh.

**Cue:**
- [chỉ vào cột CONTRIBUTIONS] nhấn 'zero-init floor guarantee'
- stress 'mọi khoảng tin cậy đều chứa 0' và 'một giây'
- [chỉ vào cột LIMITATIONS khi nói 'một seed' và 'ngưỡng hiệu chỉnh trên test']
- nói rõ 'FPR 5% KHÔNG do TT17 quy định'
- kết: câu chốt trung thực (lần 3/3), giọng tự tin
- click sang slide 17

---

### Slide 17 — Thank You / Q&A  ⏱ ~13s  ▸ Keypoint NAV

**Lời nói:**
Em xin cảm ơn hội đồng đã lắng nghe phần trình bày, và rất mong nhận được các câu hỏi cùng góp ý của quý thầy cô. Em xin sẵn sàng trả lời.

**Cue:**
- [chỉ vào slide THANK YOU / Q&A]
- cúi nhẹ, dừng lại trao quyền cho hội đồng
- không click thêm

---

## 4. Phụ lục A — Câu hỏi hội đồng & cách trả lời

**Q1. Cải thiện AUC chỉ từ 0.7497 lên 0.7695, khoảng 0.02, và mọi khoảng tin cậy bắt cặp đều chứa 0. Vậy đóng góp thật sự của đồ án là gì, hay đây chỉ là một kết quả không có ý nghĩa thống kê?**
Em xin trả lời thẳng: mức tăng AUC là nhỏ và nằm trong nhiễu của một hạt giống duy nhất, em không tuyên bố SOTA. Đóng góp của em là phương pháp luận, không phải con số trên bảng xếp hạng. Thứ nhất là cơ chế hợp nhất cổng zero-init cho một đảm bảo sàn: tại bước khởi tạo, mô hình hợp nhất bằng đúng backbone đã kiểm chứng nên không thể tệ hơn. Thứ hai là một giao thức cross-dataset trung thực với bootstrap 2000 lần trên 518 video, và em báo cáo cả các cấu hình không thắng baseline. Thứ ba là một hệ thống eKYC giải thích được, chạy CPU, có Grad-CAM. Một kết quả âm thu được dưới giao thức chặt chẽ vẫn là một đóng góp khoa học hợp lệ.

**Q2. Em chỉ chạy một seed cho mỗi cấu hình. Không có nhiều seed thì làm sao biết chênh lệch không phải ngẫu nhiên? Vì sao em không chạy thêm?**
Em đồng ý đây là hạn chế và em nêu thẳng trong báo cáo. Lý do thực tế là mỗi lần chạy đầy đủ tốn nhiều giờ GPU thuê: baseline khoảng 5.1 giờ, SFDCT khoảng 5.4 giờ, trong ngân sách hữu hạn của đồ án. Quan trọng hơn, em KHÔNG khẳng định quá từ một seed: em báo cáo mọi khoảng tin cậy bắt cặp đều chứa 0 và từ chối gọi bất kỳ chênh lệch nào là có ý nghĩa. Những phát biểu em bảo vệ được là các tính chất thiết kế không phụ thuộc seed — floor guarantee và giao thức công bằng. Multi-seed là việc đầu tiên trong hướng phát triển.

**Q3. Nhìn hình gate alpha, đa số kênh vẫn gần 0 và giá trị tuyệt đối lớn nhất chỉ 0.0232 trên 1792 kênh. Nếu nhánh tần số đóng góp ít đến vậy, tại sao không bỏ nó đi và chỉ dùng baseline B4?**
Câu hỏi rất đúng trọng tâm. Em trả lời ở hai mức. Về khoa học, chính cái alpha nhỏ này là kết quả: nó là một đồng hồ đo trực tiếp cho thấy trên dữ liệu nén c23, dấu vết tần số còn lại rất ít, vì nén đã lấy đi phần tần cao nơi artifact nằm. Em chứng minh điều đó bằng đo đạc chứ không suy đoán. Về thiết kế, vì cổng khởi tạo 0 nên thêm nhánh tần số không có rủi ro: nó không thể kéo mô hình xuống dưới baseline. Một phần nhỏ kênh có mở ra, nghĩa là mô hình thật sự dùng nhánh tần số ở nơi nó giảm được mất mát. Nếu chỉ dùng B4 thì em mất luôn khả năng đo và mất con đường mở rộng sang dữ liệu ít nén hoặc train self-blended, nơi tín hiệu tần số mạnh hơn.

**Q4. Giả thuyết của em là dấu vết giả mạo nằm ở miền tần số. Nhưng cả FF++ c23 lẫn Celeb-DF-v2 đều đã nén, mà nén thì xóa tần cao. Vậy giả thuyết có tự mâu thuẫn không?**
Đây đúng là điểm trung thực cốt lõi của đồ án và em dự đoán sự khiêm tốn này từ đầu chứ không phát hiện sau. Hình per-band energy gap cho thấy khuôn mặt thật mang nhiều năng lượng dải trung và cao hơn ảnh giả, nhưng khoảng cách đó co lại dưới nén vì nén lấy đi tần cao. Em giữ dữ liệu ở mức nén vừa phải một cách có chủ đích, đúng điều kiện eKYC thực tế nơi một phần chi tiết tần cao đã mất. Vì thế em nói thẳng cải thiện kỳ vọng là nhỏ. Nếu chuyển sang dữ liệu ít nén hoặc dùng huấn luyện self-blended để tạo lại dấu vết, tín hiệu tần số sẽ rõ hơn — đó là hướng tiếp theo.

**Q5. Em chọn FPR 5% và đạt đúng 0.0500, nhưng catch rate chỉ 0.2298 — chỉ bắt được 23% deepfake. Một cổng eKYC bỏ lọt 77% giả mạo thì có dùng được không?**
Em không né con số đó. 23% là sàn ở mức một khung hình tại điểm vận hành bảo thủ, và mô hình được định vị là lớp sàng lọc đầu tiên trong một cascade nhiều tầng, không phải cổng chặn đứng một mình. Độ phủ cộng dồn: gộp điểm theo video nâng lên khoảng một phần ba, đẩy vùng không chắc sang người duyệt đạt khoảng một nửa cho biến thể mạnh nhất, và phía trước còn một bộ lọc liveness loại bỏ tấn công trình diễn. Ngoài ra 5% FPR là lựa chọn kỹ thuật của em theo chuẩn quốc tế, không phải ngưỡng do Thông tư 17 quy định; trong eKYC, từ chối nhầm khách thật có chi phí trực tiếp nên em ưu tiên giữ FPR thấp.

**Q6. Ngưỡng 0.9514 của em được hiệu chỉnh trên chính tập test Celeb-DF-v2. Đó là rò rỉ dữ liệu. Con số 5% FPR có còn đáng tin không?**
Em thừa nhận đây là điểm hạn chế về phương pháp và em nêu rõ trong báo cáo. Lý do là em chưa tách một tập validation riêng để chọn ngưỡng. Hệ quả là FPR 5% đo trên test là lạc quan, và ngưỡng PHẢI được hiệu chỉnh lại trên phân phối triển khai thật — cụ thể là khuôn mặt người Việt — trước khi lên production. Em ghi đây là bước kế tiếp ngay lập tức chứ không lờ đi. Tương tự, em báo cáo cả cột mean-over-run bên cạnh best-checkpoint để hội đồng thấy mức lạc quan được định lượng chứ không giấu.

**Q7. Module liveness của em đạt AUC 0.98 nghe rất tốt, nhưng nhánh tần số lại làm AUC giảm từ 0.9829 xuống 0.9776. Vậy liveness có thật sự đáng tin, và nó củng cố hay làm yếu luận điểm tần số?**
Em trả lời cả hai vế trung thực. AUC ~0.98 là có thật và đã được kiểm tra kỹ: loader dùng đúng folder chính thức, khẳng định không trùng train-test, và tái lập đến bốn chữ số dưới script một lệnh. Nhưng nhánh tần số KHÔNG cải thiện liveness — giảm khoảng 0.005, nằm trong nhiễu vì chỉ có 314 ảnh thật ở tập đánh giá. Điều này lặp lại đúng kết luận bên deepfake, nên nó củng cố tính nhất quán và trung thực của đồ án chứ không làm yếu. Liveness là phép thử tái dùng rẻ bộ máy SFDCT ở miền thứ hai; báo cáo một kết quả âm một cách trung thực là điểm mạnh. Hạn chế: train và test cùng một dataset LCC-FASD, cross-dataset liveness là việc tương lai, và phần nối scorer vào cascade vẫn là hạng mục tích hợp.

**Q8. Có phương pháp tần số đã công bố như SPSL đạt 0.7650, ngay trong khoảng cải thiện của em, và SRM đạt 0.7552. Vậy điểm thật sự MỚI trong SFDCT là gì, hay em chỉ làm lại thứ người ta đã làm?**
Em không tuyên bố vượt các phương pháp đó: chúng là số công bố dưới harness khác, và HFF của em đạt 0.7695 nằm trong nhiễu single-seed nên em chỉ coi là ngang bằng cộng với tính chặt chẽ. Điểm em định vị là mới một cách khiêm tốn và có điều kiện kiểm chứng: hợp nhất bằng block-wise DCT, cổng cross-attention khởi tạo zero cho floor guarantee, và một backbone dùng chung cho cả deepfake lẫn liveness. Em không phát biểu novelty nếu chưa kiểm chứng đúng mức; họ hàng gần nhất là nhóm two-stream spatial-frequency và em nêu rõ điều đó. Đóng góp em tự tin nhất là cặp giao thức trung thực cộng thiết kế an toàn, không phải một con số.

**Q9. Em quảng cáo hệ thống chạy CPU khoảng một giây mỗi ảnh. Với một ngân hàng có hàng nghìn yêu cầu eKYC mỗi phút, một giây trên CPU có khả thi không, và tại sao không dùng GPU?**
Em chọn CPU có chủ đích cho bản trình diễn: mô hình phục vụ khoảng 70 MB, ra verdict kèm heat-map trong khoảng một giây mỗi ảnh trên một instance 2 nhân, 8 GB RAM, đủ nhanh cho màn hình duyệt tương tác và giữ chi phí thấp vì chi phối là bộ nhớ chứ không phải tính toán. Em không tuyên bố đây là cấu hình production cho tải ngân hàng. Khi cần thông lượng cao, kiến trúc đã tách model thành microservice riêng sau một contract HTTP cố định, nên có thể scale ngang nhiều bản sao hoặc gắn GPU mà không đổi caller. Em cũng nêu thẳng các hạn chế triển khai demo: route guard phía client, token trong trình duyệt, API docs để công khai — tất cả phải đóng trước khi production.

**Q10 (dự phòng). Vì sao chọn EfficientNet-B4 mà không phải một backbone mới hơn như ViT hay ConvNeXt?**
Em chọn B4 vì ba lý do gắn với tính công bằng của thí nghiệm. Một, B4 là backbone của benchmark DeepfakeBench công khai, nên baseline của em so sánh trực tiếp với số 0.7487 đã công bố — và em đã tái lập trong 0.001. Hai, đóng góp của đồ án là cơ chế hợp nhất, không phải backbone; giữ backbone cố định để cô lập đúng biến mà em muốn đo. Ba, B4 vừa một GPU tầm trung và đủ chi tiết ở 256 pixel. Thay backbone mạnh hơn sẽ trộn lẫn hai nguồn cải thiện và làm mất khả năng quy chênh lệch về riêng nhánh tần số. Đổi backbone là một hướng mở rộng độc lập cho tương lai.

---

## 5. Phụ lục B — Mẹo căn giờ & câu chốt mỗi phần

**Câu chốt mỗi phần (đọc rõ, dừng một nhịp sau khi nói):**
- Mở đầu (slide 3): "Bài kiểm tra trung thực là train trên FF++, test trên Celeb-DF-v2 — vì detector học một họ giả mạo thường sụp đổ trên họ chưa từng thấy."
- Phương pháp (slide 9): "Cổng zero-init cho floor guarantee, và alpha học được chính là đồng hồ đo trung thực — cổng hé mở ít nên gain nhỏ, hai con số khớp nhau."
- Kết quả (slide 14): "Cải thiện nhỏ, nằm trong nhiễu single-seed, mọi paired CI đều chứa 0, em không tuyên bố SOTA — đóng góp là tính chặt chẽ phương pháp."
- Kết luận (slide 16): "Đóng góp không phải một con số mà là một thiết kế an toàn chứng minh được, một giao thức công bằng có CI, và một sản phẩm giải thích được — và sự trung thực đó là điểm mạnh."

**Tuyến phòng thủ chính (lặp 3 lần ở slide 9, 14, 16):** "Cải thiện nhỏ, nằm trong nhiễu single-seed, mọi khoảng tin cậy bắt cặp đều chứa 0, em không tuyên bố SOTA — đóng góp là tính chặt chẽ phương pháp."

**Số liệu phải nói ĐÚNG (học thuộc, không đọc sai):**
- Baseline B4 frame AUC **0.7497** vs công bố **0.7487** → dùng cụm "khớp trong khoảng 0.001" (KHÔNG nói "khớp tuyệt đối").
- Thứ tự frame: B4 **0.7497** < SFDCT **0.7572** < SFDCT-HFF **0.7695** — luôn kèm hai chữ "ở mức frame".
- Mức video (đảo thứ tự): SFDCT **0.8083** < baseline **0.8203** — phải tự nêu, đừng để hội đồng phát hiện.
- HFF **0.7695** = best checkpoint giữa epoch 1; paired CI **+0.007 [−0.022, +0.037]** chứa 0.
- Gate: mean alpha **+0.000**, max |alpha| **~0.0232** trên **1792 kênh**.
- Operating point: FPR **5%** (0.0500) → catch rate **~23%** (0.2298) ở mức frame; video ~1/3; human-review ~1/2. Ngưỡng **0.9514**.
- Bootstrap: **518 clip**, **2000 lần**.
- Liveness: B4 **0.9829** > B4+DCT **0.9776** (tần số KHÔNG cải thiện); 314 ảnh thật ở eval.
- Baseline tần số đối chiếu: phase-based **0.7650**; SRM **0.7552**.
- Runtime: model **~70 MB**, **~1 s/ảnh** trên CPU 2 nhân 8 GB.
- Thông tư **17/2024/TT-NHNN**: bắt buộc sinh trắc học, KHÔNG quy định ngưỡng sai số bằng số.

**Mẹo nếu LỐ giờ (chạm >14:45):**
- Rút gọn slide 10 phần liveness về một câu: "Tái dùng thiết kế cho liveness, B4 0.9829 > B4+DCT 0.9776 — tần số không cải thiện, kết quả âm trung thực."
- Bỏ câu lý do chọn B4 ở cuối slide 7 (3 lý do → 1 câu "B4 là backbone benchmark công khai nên so sánh công bằng").
- Rút câu mở của slide 8 ("Để hội đồng thấy giả thuyết… không nói suông") thẳng vào mô tả lưới.
- Tuyệt đối KHÔNG cắt slide 9 và slide 14 — đây là hai slide đóng góp và trung thực, là tuyến phòng thủ.

**Mẹo nếu THIẾU giờ (chạy <12:00 khi tập):**
- KHÔNG thêm slide. Thay vào đó đọc CHẬM lại slide 9 và slide 12 (hai slide nặng số), thêm 1–2 nhịp dừng sau mỗi con số quan trọng (0.7497 vs 0.7487; max alpha 0.0232; paired CI chứa 0) để hội đồng kịp ghi.
- Tách rõ ba bước ①②③ ở slide 9 bằng nhịp dừng — không đọc thành một khối liền 75–90 giây.
- Thêm một câu bối cảnh ở slide 13: "Trong duyệt eKYC, người vận hành cần biết VÌ SAO hệ thống nghi, không chỉ một điểm số — Grad-CAM cho họ chính cái đó."

**Mẹo nhịp chung:**
- Bài có **2.672 token nói**. Quy đổi theo nhịp: ~230 token/phút (nói nhanh) ≈ 11:40; ~200 token/phút (nhịp bảo vệ rõ ràng) ≈ 13:20; ~180 token/phút (chậm, nhấn số, chỉ tay) ≈ 14:50 sát trần. Cộng chuyển slide + chỉ hình + các nhịp dừng có chủ đích thì thực tế rơi vào **~13–15 phút**. Bảng dòng thời gian (854s) là KẾ HOẠCH để bám, không phải số đo chắc chắn — **bắt buộc bấm giờ thật ≥2 lần** rồi tinh chỉnh.
- Rủi ro lớn nhất là nói NHANH quá thành 10–11 phút và phí slot — chủ động chậm lại, dừng sau mỗi con số.
- Chèn "click + im lặng 1 giây" ở hai chỗ chuyển nội dung dày: slide 3 (giữa đặt-vấn-đề và 3 mục tiêu) và giữa ba bước của slide 9.
