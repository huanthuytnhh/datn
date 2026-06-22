# Kịch bản trình bày bảo vệ — SFDCT (11–12 phút · nói trung–chậm)
> Lê Ngọc Thanh · 102220041 · 22T_KHDL · ~1.850 token nói · ~11.5–12 phút ở nhịp chậm (≈170 token/phút) + dừng. Bấm giờ thật ≥2 lần — xem Phụ lục B.

---

## 0. Hướng dẫn nhấn nhá (văn tự nhiên)

Kịch bản này viết cho người nói **trung–chậm**, văn nói tự nhiên: câu liền mạch, không gồng theo khẩu hiệu, mỗi slide một ý chính rồi để con số tự nói. Quy ước:

- **[DỪNG]** = ngắt đúng một nhịp (khoảng 1 giây), dùng để hội đồng kịp ghi con số hoặc để chuyển ý. Đừng lấp đầy bằng "ờ", "à"; khoảng lặng là một phần của nhịp nói.
- **chữ đậm** = nhấn nhẹ, đọc chậm hơn một chút. Mỗi đoạn chỉ nên có một, hai chỗ nhấn — đậm quá nhiều thì mất tác dụng.
- **Nói số rồi dừng.** Sau mỗi con số quan trọng (0.7497, 0.00015, CI chứa 0…) dừng một nhịp rồi mới nói tiếp. Đừng đọc liền một chuỗi số.
- **Câu liền mạch, không liệt kê miệng.** Khi có nhiều ý, kể thành câu có chủ ngữ và động từ, đừng đọc như gạch đầu dòng. Tránh các khuôn câu lặp kiểu "không phải X mà là Y" hay "em không…" lặp đi lặp lại — nói thuận, một lần là đủ.
- **Kết quả nhỏ thì nói nhỏ.** Cải thiện nhỏ thì trình bày bình thản, không tô. Điểm mạnh của bài là tự nêu giới hạn trước khi hội đồng hỏi.

Một câu xuyên suốt: **"mờ trong pixel, rõ trong tần số"** — nêu ở slide 5, chứng minh ở slide 8, gói lại ở slide 17. Nói tự nhiên, đừng biến nó thành điệp khúc đọc thuộc.

Nhịp chung cho người nói chậm: mục tiêu **~11–11.5 phút**, thoải mái dưới 12 phút. Rủi ro lớn nhất là **lê thê ở hai slide nặng số (9 và 12)** rồi đánh mất mạch. Ở hai slide đó, bám đúng số, dừng sau mỗi con số, đừng thêm chữ ngẫu hứng.

---

## 1. Bốn–năm keypoint trọng tâm

- **KP1 — Bài toán niềm tin eKYC là một khoảng trống tổng quát hóa cross-dataset.** eKYC đặt cược một tài khoản ngân hàng vào một tấm ảnh khuôn mặt, trước cả deepfake lẫn tấn công trình diễn, và cái khó thật sự là detector học trên một họ giả mạo thường sụp đổ trên họ chưa từng thấy — nên bài kiểm tra đáng tin là train trên FF++, test trên Celeb-DF-v2.
- **KP2 — Mờ trong pixel, rõ trong tần số.** Đường ghép blending, đỉnh upsampling của GAN và phổ tần gãy gần như vô hình với mắt nhưng tách bạch ở các dải DCT trung và cao, nên một đặc trưng block-DCT 48 chiều cố định, rẻ tiền có thể mang phần bằng chứng còn thiếu.
- **KP3 — Cổng hợp nhất zero-init: bắt đầu đúng bằng backbone, không bao giờ tệ hơn.** Gắn nhánh tần số qua gated cross-attention khởi tạo bằng 0 khiến mô hình hợp nhất bắt đầu y hệt backbone B4 đã kiểm chứng (floor guarantee), nên nhánh tần số an toàn để nghiên cứu và cổng alpha học được đo trực tiếp tần số giúp ích bao nhiêu.
- **KP4 — Kết quả cross-dataset đọc đúng số đo: thứ tự đúng ở mức frame, cải thiện nhỏ và nằm trong nhiễu single-seed, không SOTA.** Baseline tái lập số công bố 0.7487 trong khoảng 0.001, AUC xếp đúng giả thuyết ở mức frame, nhưng mọi paired bootstrap CI đều chứa 0 — đóng góp là tính chặt chẽ, không phải một con số trên bảng xếp hạng.
- **KP5 — Một hệ thống eKYC giải thích được, chạy CPU: Grad-CAM, liveness pre-filter.** Detector chạy thật như một web service trên CPU, trả verdict kèm Grad-CAM trong khoảng một giây, đặt sau một cascade liveness, biến phương pháp thành một tín hiệu rủi ro có thể kiểm tra lại thay vì một cổng hộp đen.

---

## 2. Dòng thời gian (bảng · nhịp chậm, tổng ~11:15)

> Cơ sở: ~1.850 token nói ÷ 170 token/phút + ~1,1 phút cho các nhịp [DỪNG] và chuyển slide. Cột thời lượng đã giãn cho nhịp trung–chậm. Đây là KẾ HOẠCH để bám, không phải số đo chắc chắn.

| Phần | Slide | Thời lượng | Mốc tích luỹ (mm:ss) |
|---|---|---:|---:|
| Mở đầu | 1 — Title | 30s | 0:30 |
| Mở đầu | 2 — Divider Phần 1 | 11s | 0:41 |
| Mở đầu | 3 — Motivation & Objectives | 62s | 1:43 |
| Phương pháp | 4 — Divider Phần 2 | 12s | 1:55 |
| Phương pháp | 5 — Frequency Hypothesis | 56s | 2:51 |
| Phương pháp | 6 — Block-DCT Descriptor | 54s | 3:45 |
| Phương pháp | 7 — Two-Stream SFDCT | 56s | 4:41 |
| Phương pháp | 8 — Forgery Footprints (FF++) | 48s | 5:29 |
| Phương pháp | 9 — Gated Cross-Attention Fusion | 66s | 6:35 |
| Phương pháp | 10 — HFF Variant & Liveness Reuse | 80s | 7:55 |
| Kết quả | 11 — Divider Phần 3 | 14s | 8:09 |
| Kết quả | 12 — Cross-Dataset Results | 78s | 9:27 |
| Kết quả | 13 — Explainable Grad-CAM | 38s | 10:05 |
| Kết quả | 14 — An Honest Reading | 76s | 11:21 |
| Kết luận | 15 — Divider Phần 4 | 11s | 11:32 |
| Kết luận | 16 — Conclusion & Future Work | 56s | 12:28 |
| Kết luận | 17 — Thank You / Q&A | 12s | 12:40 |
| **Tổng** | **17 slide** | **760s** | **~11:15 lời nói + dừng → 12:40 trần** |

> Tổng thời lượng nói thuần ~11:15; con số 12:40 là mốc trần khi cộng mọi nhịp dừng dài. Bám nhịp chậm vẫn an toàn dưới 12 phút mục tiêu nếu giữ các nhịp [DỪNG] đúng một giây.

---

## 3. Kịch bản theo slide

### Slide 1 — Hệ thống lai không gian–tần số cho eKYC  ⏱ ~30s

**Headline:** Hệ thống lai không gian–tần số cho eKYC.

**Lời nói:**
Kính thưa hội đồng. [DỪNG] Em là **Lê Ngọc Thanh**, mã số 102220041, lớp 22T_KHDL. Đề tài của em là một hệ thống **lai không gian–tần số** dựa trên block-DCT, dùng để phát hiện deepfake và kiểm tra liveness cho eKYC, dưới sự hướng dẫn của thầy Phạm Công Thắng.

**Cue:**
- đọc rõ tên, mã số 102220041, lớp 22T_KHDL
- nhấn cụm "lai không gian–tần số"
- nói tên thầy hướng dẫn chậm, rõ
- click sang divider Phần 1

---

### Slide 2 — Phần 1 — Đặt vấn đề.  ⏱ ~11s

**Headline:** Phần 1 — Đặt vấn đề.

**Lời nói:**
Em xin bắt đầu bằng câu hỏi nền tảng: vì sao phát hiện deepfake trong eKYC lại **khó** đến vậy?

**Cue:**
- chỉ vào tiêu đề PART 1 — INTRODUCTION
- nhấn từ "khó"
- click sang slide Motivation

---

### Slide 3 — Cánh cửa đầu tiên và hai mối đe doạ  ⏱ ~62s

**Headline:** Cánh cửa đầu tiên và hai mối đe doạ.

**Lời nói:**
eKYC xác minh danh tính của một người chỉ từ **một tấm ảnh** khuôn mặt, nên nó chính là ổ khoá ở cánh cửa đầu tiên dẫn vào tài khoản ngân hàng. Vì thế nó phải đối mặt với hai mối đe doạ cùng lúc: deepfake do GAN hoán đổi khuôn mặt, và tấn công trình diễn như ảnh in hay phát lại trên màn hình. [DỪNG] Thông tư 17 năm 2024 yêu cầu kiểm tra sinh trắc học nhưng không quy định ngưỡng sai số bằng số, nên việc chọn điểm vận hành là phần kỹ thuật mà đồ án tự chịu trách nhiệm. [DỪNG] Cái khó thật sự không nằm ở chỗ kiểm tra trên cùng một tập dữ liệu, mà ở **cross-dataset**: một detector học trên một họ giả mạo thường sụp đổ khi gặp họ chưa từng thấy. Đó là lý do bài kiểm tra đáng tin của em là huấn luyện trên FaceForensics++ rồi đánh giá trên Celeb-DF-v2. [DỪNG] Từ đó em đặt ba mục tiêu: mục tiêu chính là một detector deepfake có nhánh tần số block-DCT, hợp nhất với backbone qua gated attention và kèm Grad-CAM; quanh nó là một dịch vụ web trả verdict nhanh, cùng một module liveness đóng vai trò phụ.

**Cue:**
- [chỉ vào cột Real-World Context]
- nhấn "một tấm ảnh" và "hai mối đe doạ"
- [chỉ vào Circular 17/2024] nói gọn một câu: không có ngưỡng sai số bằng số
- click + im lặng 1 giây trước khi sang mục tiêu
- nhấn từ "cross-dataset"
- [chỉ sang cột Objectives] dồn trọng lượng vào mục tiêu chính, gộp web + liveness phụ vào một câu
- click sang divider Phần 2

---

### Slide 4 — Phần 2 — Phương pháp.  ⏱ ~12s

**Headline:** Phần 2 — Phương pháp.

**Lời nói:**
Vấn đề đã rõ, giờ em xin trình bày **cách làm**. [DỪNG] Có ba bước nối tiếp nhau: trước hết là giả thuyết về miền tần số, sau đó là công cụ để đọc tần số, và cuối cùng là cách em hợp nhất hai nhánh lại với nhau.

**Cue:**
- [chỉ vào tiêu đề PART 2 — METHODOLOGY]
- giọng chuyển nhịp, dứt khoát; đếm 1-2-3 nhẹ bằng tay
- click sang slide 5

---

### Slide 5 — Vì sao dấu vết giả mạo rõ hơn ở miền tần số  ⏱ ~56s

**Headline:** Vì sao dấu vết giả mạo rõ hơn ở miền tần số.

**Lời nói:**
Muốn bắt được forgery chưa từng thấy, em phải bám vào những dấu vết mang tính phổ quát, và đó chính là giả thuyết trung tâm của em: nhiều dấu vết **mờ trong pixel nhưng rõ trong tần số**. [DỪNG] Em dựa vào ba dấu vết như vậy. Thứ nhất là đường ghép khi face-swap, gần như vô hình với mắt người nhưng lại hiện rõ ở dải DCT trung. Thứ hai là vết upsampling của GAN, vì mọi mô hình sinh đều phóng to ảnh nên đều để lại đỉnh năng lượng ở dải cao. Thứ ba là sự gãy phổ tần, bởi máy ảnh thật in ra một phổ nhất quán còn mặt ghép thì phá vỡ nó. [DỪNG] Điểm chung là nguyên nhân của chúng đều phổ quát, nên đây là manh mối **đáng tin** để tổng quát hóa cross-dataset.

**Cue:**
- [chỉ ba thẻ: blending, upsampling, frequency inconsistency]
- nói tự nhiên cụm "mờ trong pixel nhưng rõ trong tần số" một lần
- [chỉ thẻ 2 — đỉnh dải cao]
- click sang slide 6

---

### Slide 6 — Đặc trưng block-DCT 48 chiều, cố định và không có tham số học  ⏱ ~54s

**Headline:** Đặc trưng block-DCT 48 chiều, cố định và không có tham số học.

**Lời nói:**
Vậy đọc tần số bằng gì cho vừa rẻ vừa giải thích được? Câu trả lời của em là một đặc trưng block-DCT **48 chiều**, hoàn toàn cố định và không có một tham số học nào. [DỪNG] Em làm qua bốn bước. Đầu tiên em tách ảnh sang không gian YCbCr gồm một kênh sáng và hai kênh màu, rồi chia thành các khối **8 nhân 8** đúng theo lưới JPEG. Mỗi khối được đưa qua 2D-DCT cho ra 64 hệ số, em lấy log để nén biên độ. Sau đó em quét zigzag, gộp lại thành 16 dải và lấy trung bình trên cả ba kênh, nên 16 nhân 3 cho ra **48 chiều**. [DỪNG] Vì cố định nên nó rẻ, ổn định và đọc được theo từng dải: dải thấp mang nội dung ảnh, còn dải giữa và dải cao mới là nơi dấu vết giả mạo nằm.

**Cue:**
- [chỉ sơ đồ 8×8 → 64 hệ số → zigzag → 16 dải × 3 = 48-D]
- nhấn "48 chiều, không một tham số học nào"
- nhấn "8 nhân 8, đúng lưới JPEG"
- click sang slide 7

---

### Slide 7 — Kiến trúc hai nhánh SFDCT: giữ B4, ghép thêm nhánh tần số  ⏱ ~56s

**Headline:** Kiến trúc hai nhánh SFDCT: giữ B4, ghép thêm nhánh tần số.

**Lời nói:**
Đóng góp chính của em không nằm ở backbone, mà ở **cách kết hợp** hai nhánh. Em giữ nguyên EfficientNet-B4 đã được kiểm chứng và gắn thêm một nhánh tần số chạy song song. [DỪNG] Đầu vào là một khuôn mặt cắt bằng MTCNN ở kích thước **256 nhân 256**, đi qua hai luồng cùng lúc: luồng không gian B4 đọc trực tiếp điểm ảnh, còn luồng tần số dùng đặc trưng 48 chiều không có tham số học. Ở giữa là khối **gated cross-attention** với một cổng alpha được khởi tạo bằng 0, và đầu ra là phán đoán thật hay giả kèm theo Grad-CAM. [DỪNG] Em chọn B4 vì nó là backbone của benchmark công khai nên cho phép **so sánh công bằng**, đồng thời vẫn vừa một GPU tầm trung và giữ được chi tiết ở mức 256 điểm ảnh.

**Cue:**
- [chỉ sơ đồ: luồng không gian B4 phía trên, luồng tần số phía dưới, khối giữa]
- nhấn "giữ nguyên B4, ghép thêm nhánh tần số"
- nhấn "256 nhân 256, MTCNN" và "cổng alpha khởi tạo bằng 0"
- click sang slide 8

---

### Slide 8 — Bằng chứng trên FaceForensics++: artifact lộ ra ở phổ DCT  ⏱ ~48s

**Headline:** Bằng chứng trên FaceForensics++: artifact lộ ra ở phổ DCT.

**Lời nói:**
Giả thuyết tần số không chỉ là lập luận, em có bằng chứng trên FaceForensics++. [DỪNG] Hình này có năm cột: ảnh thật, rồi đến Deepfakes, Face2Face, FaceSwap và NeuralTextures, xếp theo ba hàng. Ở hàng đầu là ảnh RGB, nơi các mặt giả trông khá sạch và bằng mắt thường gần như không phân biệt được. Sang hàng thứ hai là phổ DCT, lúc này ảnh giả mới lộ ra năng lượng bất thường ở dải giữa và dải cao. Hàng cuối là ảnh residual, làm rõ đúng loại artifact mà nhánh tần số nhắm tới. [DỪNG] Như vậy manh mối **mờ trong pixel, rõ trong tần số** là điều em đo được chứ không áp đặt.

**Cue:**
- [chỉ lưới: 5 cột, 3 hàng]
- quét tay từ hàng RGB xuống hàng DCT
- câu chốt: đo được, không áp đặt
- click sang slide 9

---

### Slide 9 — Cổng hợp nhất zero-init: vừa an toàn, vừa là một thước đo  ⏱ ~66s

**Headline:** Cổng hợp nhất zero-init: vừa an toàn, vừa là một thước đo.

**Lời nói:**
Đây là trọng tâm phương pháp: cổng gated cross-attention, vừa là một thiết kế **an toàn** vừa là một thước đo cho biết tần số giúp ích bao nhiêu. [DỪNG] Em cho đặc trưng không gian đóng vai Query để B4 hỏi rằng ở mỗi vị trí thì dải tần nào quan trọng, còn đặc trưng DCT đóng vai Key và Value để trả về một tóm tắt tần số có trọng số, nên việc hợp nhất là có chọn lọc chứ không phải nối phẳng. Cốt lõi nằm ở phương trình 2.5 dạng gated residual: đặc trưng hợp nhất bằng đặc trưng không gian cộng **alpha nhân context**, với alpha khởi tạo bằng 0. [DỪNG] Hệ quả là ở bước đầu mô hình hợp nhất chạy đúng bằng backbone đã kiểm chứng, nên nó bắt đầu đúng bằng backbone và không bao giờ tệ hơn. Vì alpha được học nên nó trở thành một thước đo trực tiếp: nhìn histogram bên phải, alpha trung bình rất nhỏ, cỡ **0,00015**, gần 0 nhưng **khác 0**, còn cực đại cũng chỉ **0,0232** — đủ để thấy cổng có học. [DỪNG] Cổng chỉ hé mở, nên gain AUC của SFDCT chỉ **cộng 0,0075**, vẫn nằm trong nhiễu, và hai con số này khớp nhau. Bằng chứng nội tại là nhỏ, nhưng cổng thật sự có học.

**Cue:**
- [chỉ ba bước: gộp Query/Key-Value thành một hơi, gated residual tách riêng]
- nhấn "bắt đầu đúng bằng backbone, không bao giờ tệ hơn"
- [chỉ histogram α] nhấn "mean ~0,00015 gần 0 nhưng KHÁC 0" và "max 0,0232" trong một nhịp
- [chỉ histogram α] chỉ vùng "44/1792 kênh vượt một phần nghìn" thay vì đọc thành tiếng
- nối "gate hé mở → gain SFDCT +0,0075 → khớp nhau" (KHÔNG dùng +0.007/CI của HFF ở đây)
- click sang slide 10

---

### Slide 10 — Cùng thiết kế cho HFF và liveness: kết quả nhỏ, báo cáo đúng số đo  ⏱ ~80s

**Headline:** Cùng thiết kế cho HFF và liveness: kết quả nhỏ, báo cáo đúng số đo.

**Lời nói:**
Em giữ cùng backbone B4 và cùng cổng zero-init cho hai thí nghiệm có kiểm soát. [DỪNG] Thí nghiệm thứ nhất là biến thể HFF, trong đó em chỉ đổi carrier, thay thống kê theo dải bằng một ảnh residual cao tần và giữ nguyên mọi thứ còn lại, nên chênh lệch quy đúng về cách biểu diễn. HFF đạt AUC **0,7695**, cao nhất trong họ, nhưng con số này là ở **mức frame** và lấy tại **checkpoint tốt nhất** giữa epoch 1. Còn ở **mức video**, khoảng tin cậy bắt cặp của HFF là **cộng 0,007**, trải từ **trừ 0,022 đến cộng 0,037**, tức vẫn chứa 0, nên dù chính sách chọn là công bằng cho mọi mô hình thì kết quả vẫn không có ý nghĩa thống kê. [DỪNG] Thí nghiệm thứ hai là tái dùng thiết kế cho liveness; cascade là phần thiết kế của Chương 3, còn việc nối endpoint vẫn thuộc hạng mục tích hợp. Ở đây em báo cáo đúng con số đo được: B4 đạt **0,9829** còn B4 cộng DCT đạt **0,9776**, tức nhánh tần số không cải thiện. Kết quả này lặp lại đúng phía deepfake, và em báo cáo thẳng kết quả âm này vì nó nói đúng điều dữ liệu cho thấy.

**Cue:**
- [chỉ hình 1: kiến trúc HFF — carrier residual]
- nhấn "HFF 0,7695" kèm nhãn "frame-level, best-checkpoint giữa epoch 1"
- tách rõ: CI [−0,022, +0,037] là "video-level", chứa 0 — không trộn hai cấp độ trong một câu
- [chỉ hình 2: cascade liveness] nói rõ "cascade là thiết kế Ch3, nối endpoint vẫn integration"
- nhấn "B4 0,9829 > B4+DCT 0,9776 — tần số KHÔNG cải thiện"
- click sang slide 11

---

### Slide 11 — Phần 3 — Thực nghiệm và kết quả  ⏱ ~14s

**Headline:** Phần 3 — Thực nghiệm và kết quả.

**Lời nói:**
Phần phương pháp đã trọn vẹn, nên em xin chuyển sang Phần 3, nói về thực nghiệm và kết quả. [DỪNG] Ở phần này em báo cáo đúng những con số đo được, không tô vẽ thêm gì.

**Cue:**
- [chỉ vào tiêu đề PART 3]
- giọng bình tĩnh, hạ nhịp một chút
- click sang slide kết quả

---

### Slide 12 — Trước khi nói cải thiện, pipeline phải đáng tin  ⏱ ~78s

**Headline:** Trước khi nói cải thiện, pipeline phải đáng tin.

**Lời nói:**
Toàn bộ mô hình được huấn luyện trên FaceForensics++ rồi đem kiểm tra trên Celeb-DF-v2, một bộ dữ liệu mà mô hình chưa từng nhìn thấy, nên đây là một phép thử cross-dataset đúng nghĩa. [DỪNG] Trước khi nói về bất kỳ cải thiện nào, em phải chứng minh khung đo của mình đáng tin đã. Baseline B4 của em đạt AUC ở mức frame là **0.7497**, trong khi số công bố là **0.7487**, tức là khớp trong khoảng 0.001. Khi khung đo đã đặt đúng thì những so sánh phía sau mới có giá trị. [DỪNG] Nhìn sang đường ROC bên trái, ở **mức frame** ta thấy B4 thấp hơn SFDCT, và SFDCT lại thấp hơn SFDCT-HFF, đúng theo thứ tự mà giả thuyết tần số dự đoán. Đỉnh là SFDCT-HFF với **0.7695**, vẫn ở mức frame và lấy tại checkpoint tốt nhất giữa epoch 1. [DỪNG] Tại điểm vận hành eKYC với FPR 5 phần trăm, mô hình bắt được khoảng **23 phần trăm**. Em đọc thẳng con số đó: đây là sàn ở mức một khung hình; khi gộp theo video thì độ phủ lên khoảng một phần ba, còn nếu đẩy vùng nghi ngờ sang người duyệt thì lên khoảng một nửa. Em cũng nói rõ mức 5 phần trăm là lựa chọn kỹ thuật của em chứ không phải ngưỡng do Thông tư 17 quy định, vì mô hình ở đây đóng vai một lớp sàng lọc rủi ro chứ không phải cổng chặn tuyệt đối.

**Cue:**
- [chỉ ROC bên trái] ba đường sát nhau
- stress "0.7497 vs 0.7487, khớp trong khoảng 0.001" (KHÔNG nói "tuyệt đối")
- KỶ LUẬT: nói RÕ "ở mức frame" khi đọc B4<SFDCT<HFF — không rớt cụm này
- [chỉ đường epoch] đỉnh 0.7695 "mức frame, giữa epoch 1"
- "FPR 5% → ~23%" rồi "video ~1/3, human-review ~1/2; 5% KHÔNG do TT17"
- (số video-level 0.8083 < 0.8203 để dành slide 14 — KHÔNG đọc ở đây)
- dừng 1 nhịp sau mỗi con số

---

### Slide 13 — Mỗi phán quyết đi kèm bằng chứng Grad-CAM  ⏱ ~38s

**Headline:** Mỗi phán quyết đi kèm bằng chứng Grad-CAM.

**Lời nói:**
Một con số AUC đứng một mình giống như một hộp đen, mà eKYC ngân hàng thì không thể tin vào hộp đen được. [DỪNG] Vì vậy mỗi phán quyết của mô hình đều đi kèm một bản đồ nhiệt Grad-CAM: bên trái là tấm ảnh giả đưa vào, còn bên phải là vùng mà mô hình thực sự chú ý. Vùng nóng rơi đúng vào nơi khuôn mặt bị **ghép**, cho thấy mô hình nhìn vào chỗ có dấu vết chứ không phán bừa. Nhờ vậy đầu ra trở thành một tín hiệu rủi ro có bằng chứng để người duyệt kiểm tra lại, thay vì một điểm số vô hình.

**Cue:**
- [chỉ ảnh trái] đầu vào giả
- [chỉ heat-map phải] vùng nóng = vùng ghép
- nhấn: bằng chứng cho người duyệt, không phải hộp đen
- click sang slide 14

---

### Slide 14 — Đọc kết quả đúng như nó cho thấy  ⏱ ~76s

**Headline:** Đọc kết quả đúng như nó cho thấy.

**Lời nói:**
Đây là phần em coi trọng nhất, là đọc kết quả đúng như nó cho thấy. [DỪNG] Trước hết, ở **mức frame** thứ tự khớp với giả thuyết, B4 thấp hơn SFDCT và SFDCT thấp hơn HFF, đồng thời đảm bảo sàn từ cổng zero-init vẫn giữ đúng cho mọi biến thể. Nhưng em không giấu phần kém: ở **mức video** thứ tự đảo lại, SFDCT chỉ đạt **0.8083**, còn thấp hơn baseline **0.8203**, và đó là một lý do nữa khiến em không tuyên bố vượt. Điều quan trọng nhất là mức cải thiện rất **nhỏ** và không phải SOTA. Mỗi cấu hình em chỉ chạy một seed, nên em bootstrap 518 clip, lặp hai nghìn lần, và mọi khoảng tin cậy bắt cặp đều chứa số 0, kể cả ở mức video, nghĩa là không biến thể nào tách khỏi baseline một cách có ý nghĩa thống kê. [DỪNG] Để đặt vào bối cảnh, một phương pháp tần số dựa trên pha đã công bố đạt **0.7650**, nằm ngay trong khoảng cải thiện của em. Nói gọn lại, phần tăng thêm của em nằm trong **nhiễu** của một seed, nên em không đặt nó ngang các phương pháp đã công bố. Đóng góp thật sự của đồ án nằm ở tính **chặt chẽ** của cách đánh giá, và chính việc dám báo cáo đúng những con số này là điểm em tự tin nhất.

**Cue:**
- [chỉ 4 gạch đầu dòng lần lượt]
- KỶ LUẬT: nhấn "ở mức frame" cho thứ tự, rồi "mức video SFDCT 0.8083 < baseline 0.8203" (số video-level dời từ slide 12 về đây)
- stress: mọi paired CI chứa 0, 518 clip, 2000 lần
- stress: baseline tần số 0.7650 → gains trong nhiễu
- kết: giọng tự tin, không khoa trương
- click sang slide 15

---

### Slide 15 — Vậy tất cả những điều đó dẫn tới đâu  ⏱ ~11s

**Headline:** Vậy tất cả những điều đó dẫn tới đâu.

**Lời nói:**
Vậy là đã đi hết ba phần, và bây giờ em xin chốt lại phần cuối: kết luận, cùng với chỗ mà đóng góp thật sự của đồ án nằm ở đó.

**Cue:**
- chỉ vào tiêu đề PART 4
- giọng chuyển nhịp, chậm lại
- click sang slide 16 ngay sau câu này

---

### Slide 16 — Đóng góp nằm ở thiết kế, không nằm ở con số AUC  ⏱ ~56s

**Headline:** Đóng góp nằm ở thiết kế, không nằm ở con số AUC.

**Lời nói:**
Đóng góp của đồ án không nằm ở con số AUC, mà nằm ở ba điều. Thứ nhất là **cách thiết kế cổng**: vì alpha khởi tạo bằng 0, mô hình lúc bắt đầu chạy đúng như backbone đã được kiểm chứng, nên nhánh tần số chỉ làm nó tốt hơn chứ không thể kéo nó tệ đi. [DỪNG] Thứ hai là cách em đánh giá: toàn bộ đo trên cross-dataset với bootstrap CI, và vì mọi khoảng tin cậy đều chứa **0** nên em không tuyên bố vượt các phương pháp khác, mà chỉ báo cáo đúng con số đo được. [DỪNG] Thứ ba là một hệ thống eKYC giải thích được, chạy trên CPU khoảng một giây mỗi ảnh kèm bản đồ Grad-CAM. Về giới hạn, em nói thẳng là mỗi cấu hình mới chạy một seed và ngưỡng còn hiệu chỉnh trên tập test, nên hướng sắp tới là chạy nhiều seed, gắn module liveness và huấn luyện theo kiểu self-blended.

**Cue:**
- chỉ vào cột CONTRIBUTIONS, nhấn "alpha khởi tạo bằng 0"
- stress "mọi khoảng tin cậy chứa 0" và "một giây mỗi ảnh"
- chỉ vào cột LIMITATIONS khi nói "một seed" và "hiệu chỉnh trên test"
- (KHÔNG nhắc lại "FPR 5% không do TT17" lần thứ ba — đã nói ở slide 3 và 12)
- click sang slide 17

---

### Slide 17 — Cảm ơn hội đồng, em xin sẵn sàng trả lời  ⏱ ~12s

**Headline:** Cảm ơn hội đồng, em xin sẵn sàng trả lời.

**Lời nói:**
Như một câu gói lại cả đồ án: dấu vết giả mạo mờ trong pixel nhưng rõ trong tần số. [DỪNG] Em xin cảm ơn hội đồng và sẵn sàng trả lời các câu hỏi.

**Cue:**
- chỉ vào slide THANK YOU / Q&A
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

## 5. Phụ lục B — Mẹo căn giờ & câu chốt mỗi phần (nhịp chậm, ~11:15)

**Câu chốt mỗi phần (đọc rõ, dừng một nhịp sau khi nói):**
- Mở đầu (slide 3): "Bài kiểm tra đáng tin là train trên FF++, test trên Celeb-DF-v2 — vì detector học một họ giả mạo thường sụp đổ trên họ chưa từng thấy."
- Phương pháp (slide 9): "Bắt đầu đúng bằng backbone, không bao giờ tệ hơn — và alpha học được chính là thước đo: cổng hé mở ít nên gain SFDCT nhỏ, hai con số khớp nhau."
- Kết quả (slide 14): "Cải thiện nhỏ, nằm trong nhiễu single-seed, mọi paired CI đều chứa 0, em không tuyên bố SOTA — đóng góp là tính chặt chẽ của cách đánh giá."
- Kết luận (slide 16): "Đóng góp không phải một con số mà là một thiết kế an toàn chứng minh được, một giao thức công bằng có CI, và một sản phẩm giải thích được."

**Câu xuyên suốt và chỗ đặt:**
- "Mờ trong pixel, rõ trong tần số." — slide 5 (nêu), slide 8 (chứng minh), slide 17 (gói lại). Nói tự nhiên, đừng đọc thuộc thành điệp khúc.

**Số liệu phải nói ĐÚNG (học thuộc, không đọc sai):**
- Baseline B4 frame AUC **0.7497** vs công bố **0.7487** → dùng cụm "khớp trong khoảng 0.001" (KHÔNG nói "khớp tuyệt đối").
- Thứ tự frame: B4 **0.7497** < SFDCT **0.7572** < SFDCT-HFF **0.7695** — luôn kèm hai chữ "ở mức frame".
- Mức video (đảo thứ tự): SFDCT **0.8083** < baseline **0.8203** — nói ở slide 14, phải tự nêu, đừng để hội đồng phát hiện.
- HFF **0.7695** = best checkpoint giữa epoch 1, **mức frame**; paired CI **+0.007 [−0.022, +0.037]** là **mức video**, chứa 0. KHÔNG trộn hai cấp độ trong một câu.
- Gate (của SFDCT): mean |alpha| **~0.00015** (1,5×10⁻⁴) — gần 0 nhưng **KHÁC 0**; max |alpha| **~0.0232**; **44/1792 kênh** vượt 10⁻³ (chỉ vào histogram, không bắt buộc đọc thành tiếng). Gain SFDCT đi với histogram này là **+0.0075** (0.7497→0.7572) — KHÔNG dùng +0.007/CI của HFF cho slide 9.
- Operating point: FPR **5%** (0.0500) → catch rate **~23%** (0.2298) ở mức frame; video ~1/3; human-review ~1/2. Ngưỡng **0.9514**.
- Bootstrap: **518 clip**, **2000 lần**.
- Liveness: B4 **0.9829** > B4+DCT **0.9776** (tần số KHÔNG cải thiện); 314 ảnh thật ở eval.
- Baseline tần số đối chiếu: phase-based **0.7650**; SRM **0.7552**.
- Runtime: model **~70 MB**, **~1 s/ảnh** trên CPU 2 nhân 8 GB.
- Thông tư **17/2024/TT-NHNN**: bắt buộc sinh trắc học, KHÔNG quy định ngưỡng sai số bằng số.

**Ranh giới về cách đọc số dễ trượt nhất (đọc kỹ trước khi lên):**
- Ở slide 12 và 14, TUYỆT ĐỐI không rớt cụm **"ở mức frame"** khi đọc nhanh thứ tự B4<SFDCT<HFF. Nếu rớt, nó biến thành tuyên bố cải thiện toàn cục — sai, vì mức video đảo ngược và mọi paired CI chứa 0.
- Số **0.7695** luôn gắn nhãn "frame-level, best-checkpoint giữa epoch 1". CI **[−0.022, +0.037]** luôn gắn nhãn "video-level". Một câu, hai cấp độ phân minh.
- Ở slide 9, dùng gain **+0.0075 của SFDCT** (đi với histogram 1792 kênh). KHÔNG kéo con số +0.007 và CI của HFF về slide 9 — đó là mô hình khác, video-level, để cho slide 10.

**Mẹo nếu LỐ giờ (chạm >12:30):**
- Rút gọn slide 10 phần liveness về một câu: "Tái dùng thiết kế cho liveness, B4 0.9829 > B4+DCT 0.9776 — tần số không cải thiện, một kết quả âm em báo cáo đúng."
- Bỏ lý do chọn B4 ở slide 7 → một câu: "B4 là backbone benchmark công khai nên so sánh công bằng."
- Rút câu mở slide 8 thẳng vào mô tả lưới.
- Tuyệt đối KHÔNG cắt slide 9 và slide 14 — đây là hai slide đóng góp và đọc kết quả đúng số đo, là tuyến phòng thủ.

**Mẹo nếu THIẾU giờ (chạy <10:30 khi tập):**
- KHÔNG thêm slide. Đọc CHẬM lại slide 9 và slide 12 (hai slide nặng số), thêm 1–2 nhịp [DỪNG] sau mỗi con số quan trọng (0.7497 vs 0.7487; mean alpha 0.00015; max 0.0232; CI chứa 0).
- Tách rõ các bước ở slide 9 bằng nhịp dừng — không đọc thành một khối liền.
- Thêm một câu bối cảnh ở slide 13: "Trong duyệt eKYC, người vận hành cần biết VÌ SAO hệ thống nghi, không chỉ một điểm số — Grad-CAM cho họ chính cái đó."

**Mẹo nhịp chung (người nói trung–chậm):**
- Bài có **~1.850 token nói**. Ở nhịp chậm ~170 token/phút cộng các nhịp [DỪNG] và chuyển slide, thực tế rơi vào **~11.5–12 phút**, sát trần 12 phút mục tiêu. Bảng dòng thời gian (~11:15 lời nói) là KẾ HOẠCH để bám, không phải số đo chắc chắn — **bắt buộc bấm giờ thật ≥2 lần** rồi tinh chỉnh; nếu chạm 12 phút thì cắt theo mục "Mẹo nếu LỐ giờ".
- Hai slide nặng nhất là 9 và 12. Rủi ro KHÔNG phải lố giờ mà là lê thê và rơi mạch ở đây — bám đúng số, dừng sau mỗi con số, đừng thêm chữ ngẫu hứng.
- Chèn "click + im lặng 1 giây" ở hai chỗ chuyển nội dung dày: slide 3 (giữa đặt-vấn-đề và mục tiêu) và slide 9 (trước phần gated residual).
- Khoảng lặng là công cụ mạnh nhất. Khi đọc một con số nhạy (mọi CI chứa 0, B4 > B4+DCT), dừng một nhịp và nhìn hội đồng — sự tự tin nằm ở chỗ dám im lặng.
