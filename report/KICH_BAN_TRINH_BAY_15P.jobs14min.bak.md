# Kịch bản trình bày bảo vệ — SFDCT (15 phút · nói trung–chậm, lối Steve Jobs)
> Lê Ngọc Thanh · 102220041 · 22T_KHDL · ~1.900 token nói · ước tính ~13–14 phút ở nhịp chậm (≈175 token/phút) + 81 nhịp dừng. Bấm giờ thật ≥2 lần — xem Phụ lục B.

---

## 0. Hướng dẫn nhấn nhá (đọc trước khi tập)

Kịch bản này viết cho người nói **trung–chậm**, lối Steve Jobs/CEO: ít chữ, nhiều khoảng lặng, mỗi slide một ý lớn. Quy ước:

- **[DỪNG]** = ngắt đúng một nhịp (khoảng 1 giây). Đừng lấp đầy bằng "ờ", "à". Khoảng lặng là công cụ, không phải lỗi.
- **chữ đậm** = nhấn giọng, đọc chậm hơn một chút, tách khỏi câu xung quanh.
- **Quy tắc bộ ba.** Khi đếm 1–2–3 (ba dấu vết, ba bước, ba lý do, ba mục tiêu) hãy đếm bằng tay và dừng rõ giữa mỗi mục. Bộ ba dễ nhớ và nghe có nhịp.
- **Tương phản "không phải X mà là Y".** Đây là khung câu chủ đạo: "không thay backbone, mà ghép thêm"; "đóng góp không phải con số, mà là thiết kế". Nói vế X bình thường, dừng nửa nhịp, rồi nhấn vế Y.
- **Understatement cho kết quả.** Kết quả nhỏ thì nói nhỏ, đừng tô. Sức mạnh của bài đến từ việc tự nói ra giới hạn trước khi hội đồng hỏi.

Ba câu thần chú (refrain) và chỗ đặt:

1. **"Mờ trong pixel. Rõ trong tần số."** — giả thuyết trung tâm. Đặt ở slide 5 (nêu), slide 8 (chứng minh), slide 17 (chốt cuối). Đúng 3 lần.
2. **"Nhỏ. Nhưng trung thực."** — tinh thần đọc kết quả. Đặt ở slide 10, 14, 16 — đúng ngữ cảnh kết quả. KHÔNG dùng ở slide 9 (slide 9 là về cổng, không phải kết quả).
3. **"Bắt đầu đúng bằng backbone. Không bao giờ tệ hơn."** — floor guarantee của cổng zero-init. Đặt ở slide 9 và slide 16.

Nhịp chung cho người nói chậm: mục tiêu **~13–14 phút**, dưới trần 15:00. Rủi ro lớn nhất KHÔNG phải lố giờ mà là **lê thê ở hai slide nặng số (9 và 12)** rồi đánh mất mạch. Ở hai slide đó, bám đúng số, dừng sau mỗi con số, đừng thêm chữ ngẫu hứng.

---

## 1. Bốn–năm keypoint trọng tâm

- **KP1 — Bài toán niềm tin eKYC là một khoảng trống tổng quát hóa cross-dataset.** eKYC đặt cược một tài khoản ngân hàng vào một tấm ảnh khuôn mặt, trước cả deepfake lẫn tấn công trình diễn, và cái khó thật sự là detector học trên một họ giả mạo thường sụp đổ trên họ chưa từng thấy — nên bài kiểm tra trung thực là train trên FF++, test trên Celeb-DF-v2.
- **KP2 — Mờ trong pixel, rõ trong tần số.** Đường ghép blending, đỉnh upsampling của GAN và phổ tần gãy gần như vô hình với mắt nhưng tách bạch ở các dải DCT trung và cao, nên một đặc trưng block-DCT 48 chiều cố định, rẻ tiền có thể mang phần bằng chứng còn thiếu.
- **KP3 — Cổng hợp nhất zero-init: bắt đầu đúng bằng backbone, không bao giờ tệ hơn.** Gắn nhánh tần số qua gated cross-attention khởi tạo bằng 0 khiến mô hình hợp nhất bắt đầu y hệt backbone B4 đã kiểm chứng (floor guarantee), nên nhánh tần số an toàn để nghiên cứu và cổng alpha học được đo trực tiếp tần số giúp ích bao nhiêu.
- **KP4 — Kết quả cross-dataset trung thực: thứ tự đúng ở mức frame, cải thiện nhỏ và nằm trong nhiễu single-seed, không SOTA.** Baseline tái lập số công bố 0.7487 trong khoảng 0.001, AUC xếp đúng giả thuyết ở mức frame, nhưng mọi paired bootstrap CI đều chứa 0 — đóng góp là tính chặt chẽ, không phải một con số trên bảng xếp hạng.
- **KP5 — Một hệ thống eKYC giải thích được, chạy CPU: Grad-CAM, liveness pre-filter.** Detector chạy thật như một web service trên CPU, trả verdict kèm Grad-CAM trong khoảng một giây, đặt sau một cascade liveness, biến phương pháp thành một tín hiệu rủi ro có thể kiểm tra lại thay vì một cổng hộp đen.

---

## 2. Dòng thời gian (bảng · tính lại cho nhịp chậm)

> Cơ sở: ~1.900 token nói ÷ 175 token/phút + ~1,6 phút cho 81 nhịp [DỪNG] và chuyển slide. Cột thời lượng đã giãn cho nhịp trung–chậm. Đây là KẾ HOẠCH để bám, không phải số đo chắc chắn.

| Phần | Slide | Thời lượng | Mốc tích luỹ (mm:ss) |
|---|---|---:|---:|
| Mở đầu | 1 — Title | 32s | 0:32 |
| Mở đầu | 2 — Divider Phần 1 | 10s | 0:42 |
| Mở đầu | 3 — Motivation & Objectives | 70s | 1:52 |
| Phương pháp | 4 — Divider Phần 2 | 12s | 2:04 |
| Phương pháp | 5 — Frequency Hypothesis | 58s | 3:02 |
| Phương pháp | 6 — Block-DCT Descriptor | 56s | 3:58 |
| Phương pháp | 7 — Two-Stream SFDCT | 60s | 4:58 |
| Phương pháp | 8 — Forgery Footprints (FF++) | 50s | 5:48 |
| Phương pháp | 9 — Gated Cross-Attention Fusion | 88s | 7:16 |
| Phương pháp | 10 — HFF Variant & Liveness Reuse | 84s | 8:40 |
| Kết quả | 11 — Divider Phần 3 | 12s | 8:52 |
| Kết quả | 12 — Cross-Dataset Results | 82s | 10:14 |
| Kết quả | 13 — Explainable Grad-CAM | 36s | 10:50 |
| Kết quả | 14 — An Honest Reading | 84s | 12:14 |
| Kết luận | 15 — Divider Phần 4 | 10s | 12:24 |
| Kết luận | 16 — Conclusion & Future Work | 74s | 13:38 |
| Kết luận | 17 — Thank You / Q&A | 12s | 13:50 |
| **Tổng** | **17 slide** | **830s** | **13:50** |

---

## 3. Kịch bản theo slide

### Slide 1 — Một tấm ảnh. Một danh tính.  ⏱ ~28s

**Headline:** Một tấm ảnh. Một danh tính.

**Lời nói:**
Kính thưa hội đồng. [DỪNG] Em là **Lê Ngọc Thanh**, mã số 102220041, lớp 22T_KHDL. [DỪNG] Đề tài: hệ thống lai **không gian–tần số** block-DCT, phát hiện deepfake và liveness cho eKYC. Hướng dẫn: thầy Phạm Công Thắng.

**Cue:**
- [chỉ vào tên đề tài]
- đọc rõ mã số 102220041, lớp 22T_KHDL
- nói tên thầy hướng dẫn chậm, rõ
- click sang slide divider Phần 1

---

### Slide 2 — Phần 1 — Đặt vấn đề.  ⏱ ~10s

**Headline:** Phần 1 — Đặt vấn đề.

**Lời nói:**
Bắt đầu với câu hỏi đầu tiên. [DỪNG] Vì sao phát hiện deepfake trong eKYC lại **khó**?

**Cue:**
- [chỉ vào tiêu đề PART 1 — INTRODUCTION]
- nhấn từ "khó"
- click sang slide Motivation

---

### Slide 3 — Cánh cửa đầu tiên. Hai kẻ tấn công.  ⏱ ~58s

**Headline:** Cánh cửa đầu tiên. Hai kẻ tấn công.

**Lời nói:**
eKYC xác minh danh tính chỉ từ **một tấm ảnh**. Đó là ổ khoá ở cánh cửa đầu tiên vào tài khoản ngân hàng. [DỪNG] Nên nó có hai kẻ tấn công. Một: deepfake — GAN hoán đổi khuôn mặt. Hai: tấn công trình diễn — ảnh in, hay phát lại màn hình. [DỪNG] Thông tư 17 năm 2024 bắt buộc kiểm tra sinh trắc học, nhưng **không** quy định ngưỡng sai số bằng số — chọn điểm vận hành là phần kỹ thuật đồ án tự chịu trách nhiệm. [DỪNG] Cái khó thật không ở cùng một tập, mà ở **cross-dataset**: học một họ giả mạo, thường sụp đổ trước họ chưa từng thấy. [DỪNG] Nên bài kiểm tra trung thực là: train trên FaceForensics++, test trên Celeb-DF-v2. [DỪNG] Từ đó, ba mục tiêu. Chính: detector deepfake nhánh tần số block-DCT, hợp nhất backbone qua gated attention, kèm Grad-CAM. Quanh nó là web trả verdict nhanh, và một module liveness phụ.

**Cue:**
- [chỉ vào cột Real-World Context]
- nhấn "một tấm ảnh", "hai kẻ tấn công"
- [chỉ vào Circular 17/2024] nói rõ KHÔNG có ngưỡng sai số bằng số
- click + im lặng 1 giây trước khi sang mục tiêu
- nhấn từ cross-dataset
- [chỉ sang cột Objectives] dồn trọng lượng vào mục tiêu chính, gộp web + liveness phụ thành một câu
- click sang divider Phần 2

---

### Slide 4 — Phần 2 — Phương pháp.  ⏱ ~12s

**Headline:** Phần 2 — Phương pháp.

**Lời nói:**
Vấn đề đã rõ. [DỪNG] Giờ là **cách làm**. Ba bước. Giả thuyết tần số. [DỪNG] Công cụ đọc tần số. [DỪNG] Cách **hợp nhất** hai nhánh.

**Cue:**
- [chỉ vào tiêu đề PART 2 — METHODOLOGY]
- giọng chuyển nhịp, dứt khoát, đếm 1-2-3 bằng tay
- click sang slide 5

---

### Slide 5 — Mờ trong pixel. Rõ trong tần số.  ⏱ ~58s

**Headline:** Mờ trong pixel. Rõ trong tần số.

**Lời nói:**
Muốn bắt forgery **chưa từng thấy**, ta phải bám vào dấu vết phổ quát. [DỪNG] Đây là giả thuyết của em: **mờ trong pixel, rõ trong tần số.** [DỪNG] Ba dấu vết. Một, đường ghép khi face-swap — mắt không thấy, nhưng dải DCT **trung** thì thấy. Hai, vết upsampling của GAN — mọi GAN đều phóng to ảnh, và để lại đỉnh năng lượng ở dải **cao**. Ba, phổ tần gãy — máy ảnh thật in một phổ nhất quán, mặt ghép **phá vỡ** nó. [DỪNG] Điểm chung: nguyên nhân phổ quát. Generator nào cũng upsample. Blend nào cũng làm gãy phổ. [DỪNG] Nên đây là manh mối **đáng tin** để tổng quát hóa cross-dataset.

**Cue:**
- [chỉ ba thẻ: blending, upsampling, frequency inconsistency]
- nhấn refrain 'mờ trong pixel, rõ trong tần số'
- [chỉ thẻ 2 — đỉnh dải cao]
- đếm một-hai-ba bằng tay
- click sang slide 6

---

### Slide 6 — 48 chiều. Không một tham số học nào.  ⏱ ~56s

**Headline:** 48 chiều. Không một tham số học nào.

**Lời nói:**
Đọc tần số bằng gì cho **rẻ** và **giải thích được?** [DỪNG] Câu trả lời: một đặc trưng block-DCT **48 chiều**. Cố định. Không một tham số học nào. [DỪNG] Bốn bước. Tách ảnh sang YCbCr — một kênh sáng, hai kênh màu. Chia khối **8 nhân 8**, đúng lưới JPEG. Mỗi khối qua 2D-DCT ra 64 hệ số, lấy log để nén. Quét zigzag, gộp thành 16 dải, lấy trung bình trên ba kênh. [DỪNG] 16 nhân 3, **bằng 48**. [DỪNG] Vì cố định nên nó rẻ, ổn định, và đọc được theo dải. Dải thấp là nội dung. Dải giữa và cao — đó là nơi **dấu vết** nằm.

**Cue:**
- [chỉ sơ đồ 8×8 → 64 hệ số → zigzag → 16 dải × 3 = 48-D]
- nhấn '48 chiều, không một tham số học nào'
- nhấn '8 nhân 8, đúng lưới JPEG'
- click sang slide 7

---

### Slide 7 — Em không thay backbone. Em ghép thêm một nhánh.  ⏱ ~60s

**Headline:** Em không thay backbone. Em ghép thêm một nhánh.

**Lời nói:**
Đóng góp chính nằm ở **cách ghép** hai nhánh. [DỪNG] Và em nói rõ: em **không thay** backbone EfficientNet-B4 đã kiểm chứng. Em ghép thêm. [DỪNG] Đầu vào: một khuôn mặt MTCNN, **256 nhân 256**, đi song song hai luồng. Luồng trên, xanh dương — nhánh không gian B4, đọc pixel. Luồng dưới, xanh lá — nhánh tần số 48 chiều, không tham số học. Ở giữa: khối **gated cross-attention**, với một cổng alpha khởi tạo bằng 0. [DỪNG] Đầu ra: real hay fake, kèm Grad-CAM. [DỪNG] Vì sao B4? Ba lý do. Backbone của benchmark công khai — **so sánh công bằng**. Đủ lớn mà vẫn vừa một GPU tầm trung. Và ở 256 pixel vẫn giữ chi tiết.

**Cue:**
- [chỉ sơ đồ: xanh dương trên, xanh lá dưới, khối giữa]
- nhấn 'không thay backbone'
- nhấn '256 nhân 256, MTCNN'
- [chỉ cổng alpha = 0]
- click sang slide 8

---

### Slide 8 — Hàng một sạch. Hàng hai lộ.  ⏱ ~50s

**Headline:** Hàng một sạch. Hàng hai lộ.

**Lời nói:**
Giả thuyết tần số **không nói suông**. Đây là bằng chứng trên FaceForensics++. [DỪNG] Năm cột: ảnh thật, rồi Deepfakes, Face2Face, FaceSwap, NeuralTextures. Ba hàng. [DỪNG] Hàng một — ảnh RGB. Mắt thường: các mặt giả trông **sạch**, gần như không phân biệt. [DỪNG] Hàng hai — phổ DCT. Lúc này ảnh giả **lộ ra** năng lượng bất thường ở dải giữa và cao. [DỪNG] Hàng ba — residual, đúng artifact mà nhánh tần số nhắm tới. [DỪNG] Manh mối **mờ trong pixel, rõ trong tần số.** Em chứng minh được. Không áp đặt.

**Cue:**
- [chỉ lưới: 5 cột, 3 hàng]
- nhấn 'hàng một sạch, hàng hai lộ'
- [quét tay từ hàng RGB xuống hàng DCT]
- lặp refrain ở câu chốt
- click sang slide 9

---

### Slide 9 — Bắt đầu đúng bằng backbone. Không bao giờ tệ hơn.  ⏱ ~88s

**Headline:** Bắt đầu đúng bằng backbone. Không bao giờ tệ hơn.

**Lời nói:**
Đây là trọng tâm. Cổng gated cross-attention. [DỪNG] Vừa là thiết kế **an toàn**, vừa là một đồng hồ đo **trung thực**. [DỪNG] Bước một và hai: Query là đặc trưng không gian — B4 hỏi, ở mỗi vị trí, dải tần nào quan trọng; Key và Value là đặc trưng DCT — mỗi vị trí lấy về một tóm tắt tần số có trọng số. Hợp nhất **có chọn lọc**, không phải nối phẳng. [DỪNG] Bước ba, cốt lõi — gated residual, phương trình 2.5: F hợp nhất bằng F không gian cộng **alpha nhân context**, với alpha khởi tạo bằng 0. [DỪNG] Hệ quả: ở bước đầu, mô hình hợp nhất bằng **đúng backbone** đã kiểm chứng. **Bắt đầu đúng bằng backbone. Không bao giờ tệ hơn.** [DỪNG] Và vì alpha được học, nó là **đồng hồ đo**. Histogram bên phải: alpha trung bình rất nhỏ, cỡ một phần mười nghìn — **0 chấm 00015**. Gần 0, nhưng **khác 0** — đó mới là bằng chứng cổng có học. Cực đại chỉ **0 chấm 023**; chỉ **44 trên 1792 kênh** vượt ngưỡng một phần nghìn. [DỪNG] Cổng chỉ **hé mở**. [DỪNG] Và đây là điểm nối thẳng tới kết quả: cổng hé mở ít, nên gain AUC của SFDCT chỉ **cộng 0 chấm 0075**, nằm trong nhiễu. Hai con số **khớp nhau**. [DỪNG] Đó là bằng chứng nội tại. Nhỏ — nhưng cổng có **học**.

**Cue:**
- [chỉ ba bước ①②③ — dừng rõ, gộp bước 1+2 thành một hơi, bước 3 tách riêng]
- nhấn refrain 'bắt đầu đúng bằng backbone, không bao giờ tệ hơn'
- [chỉ histogram α]
- nhấn 'trung bình ~0.00015 — gần 0 nhưng KHÁC 0', 'max 0.023', '44/1792 kênh vượt 10⁻³'
- nhấn câu nối 'gate hé mở → gain SFDCT +0.0075 → khớp nhau' (KHÔNG dùng +0.007/CI của HFF ở đây)
- chốt 'nhỏ — nhưng cổng có học' (KHÔNG dùng refrain 'nhỏ nhưng trung thực' ở slide này)
- click sang slide 10

---

### Slide 10 — Cùng một thiết kế. Cùng một kết quả trung thực.  ⏱ ~84s

**Headline:** Cùng một thiết kế. Cùng một kết quả trung thực.

**Lời nói:**
Cùng backbone B4. Cùng cổng zero-init. Hai thí nghiệm có kiểm soát. [DỪNG] Một — biến thể HFF. Em chỉ đổi carrier: thay thống kê theo dải bằng một ảnh **residual cao tần**. Mọi thứ khác giữ nguyên, nên chênh lệch quy đúng về cách biểu diễn. HFF đạt AUC **0 chấm 7695** — cao nhất họ. [DỪNG] Nhưng em gắn caveat ngay, và phân minh hai cấp độ: con số **0 chấm 7695** này là **mức frame**, lấy ở **checkpoint tốt nhất** giữa epoch 1. Còn ở **mức video**, khoảng tin cậy bắt cặp của HFF là **cộng 0 chấm 007**, từ trừ 0 chấm 022 đến cộng 0 chấm 037 — vẫn **chứa 0**. Cùng chính sách chọn cho mọi mô hình, nên công bằng. Nhưng **không** có ý nghĩa thống kê. [DỪNG] Hai — tái dùng thiết kế cho liveness. Cascade là thiết kế Chương 3; nối endpoint vẫn là hạng mục tích hợp. [DỪNG] Và em nói thẳng: B4 đạt **0 chấm 9829**, B4 cộng DCT đạt **0 chấm 9776**. Nhánh tần số **KHÔNG** cải thiện. [DỪNG] Đúng như bên deepfake. Một kết quả **âm** — và báo cáo thẳng là điểm mạnh. **Nhỏ. Nhưng trung thực.**

**Cue:**
- [chỉ hình 1: kiến trúc HFF — carrier residual]
- nhấn 'HFF 0.7695' kèm nhãn 'frame-level, best-checkpoint giữa epoch 1'
- tách rõ: CI [−0.022, +0.037] là 'video-level', chứa 0 — không trộn hai cấp độ trong một câu
- [chỉ hình 2: cascade liveness]
- nói rõ 'cascade là thiết kế Ch3, nối endpoint vẫn integration'
- nhấn 'B4 0.9829 > B4+DCT 0.9776 — tần số KHÔNG cải thiện'
- chốt refrain 'nhỏ nhưng trung thực'
- click sang slide 11

---

### Slide 11 — Phần 3. Và đây là phần em nói thật.  ⏱ ~12s

**Headline:** Phần 3. Và đây là phần em nói thật.

**Lời nói:**
Phương pháp đã trọn vẹn. [DỪNG] Sang Phần 3: thực nghiệm và kết quả. [DỪNG] Đây là phần em xin nói **thật**. Không tô hồng.

**Cue:**
- [chỉ vào tiêu đề PART 3]
- giọng bình tĩnh, hạ nhịp một chút
- click sang slide kết quả

---

### Slide 12 — Trước khi khoe, em phải đáng tin.  ⏱ ~82s

**Headline:** Trước khi khoe, em phải đáng tin.

**Lời nói:**
Train trên FaceForensics++. [DỪNG] Test trên Celeb-DF-v2. Một bộ dữ liệu mô hình **chưa từng thấy**. Đó là cross-dataset thật. [DỪNG] Trước khi nói cải thiện, em phải chứng minh pipeline đáng tin. Baseline B4 của em: AUC mức frame **0 chấm 7497**. Số công bố: **0 chấm 7487**. [DỪNG] **Khớp trong khoảng 0 chấm 001.** [DỪNG] Khung đo đặt đúng. Mọi so sánh sau đó mới có giá trị. [DỪNG] Nhìn ROC bên trái. Ở **mức frame**: B4 nhỏ hơn SFDCT, nhỏ hơn SFDCT-HFF. Đúng như tần số dự đoán. [DỪNG] Đỉnh SFDCT-HFF: **0 chấm 7695**, ở mức frame, checkpoint giữa epoch 1. Cao nhất họ. [DỪNG] Tại điểm vận hành eKYC, FPR 5%, bắt được khoảng **23%**. [DỪNG] Em không né con số đó. Đây là sàn mức một khung hình. Gộp theo video lên khoảng một phần ba. Đẩy vùng nghi sang người duyệt: khoảng một nửa. [DỪNG] Và 5% là lựa chọn kỹ thuật của em. **Không** phải ngưỡng Thông tư 17. Mô hình là lớp sàng lọc rủi ro. Không phải cổng chặn tuyệt đối.

**Cue:**
- [chỉ ROC bên trái] ba đường sát nhau
- stress '0.7497 vs 0.7487, khớp trong khoảng 0.001' (KHÔNG nói 'tuyệt đối')
- KỶ LUẬT: nói RÕ 'ở mức frame' mỗi lần đọc B4<SFDCT<HFF — không được rớt cụm này
- [chỉ đường epoch] đỉnh 0.7695 'mức frame, giữa epoch 1'
- 'FPR 5% → ~23%' rồi 'video ~1/3, human-review ~1/2; 5% KHÔNG do TT17'
- (đảo thứ tự video-level 0.8083 < 0.8203 đã dời sang slide 14 — KHÔNG đọc ở đây)
- dừng 1 nhịp sau mỗi con số để hội đồng kịp ghi

---

### Slide 13 — Một con số là hộp đen. Ngân hàng không tin hộp đen.  ⏱ ~36s

**Headline:** Một con số là hộp đen. Ngân hàng không tin hộp đen.

**Lời nói:**
Một AUC đơn lẻ là một **hộp đen**. eKYC ngân hàng không thể tin hộp đen. [DỪNG] Nên mỗi phản hồi đều kèm bằng chứng: bản đồ nhiệt Grad-CAM. [DỪNG] Bên trái: một tấm ảnh giả. Bên phải: Grad-CAM phủ lên. [DỪNG] Vùng nóng rơi đúng vùng bị **ghép**. Mô hình nhìn vào nơi có dấu vết. Không phán bừa. [DỪNG] Đầu ra thành một tín hiệu rủi ro có bằng chứng. Để người duyệt kiểm tra lại. Không còn là điểm số vô hình.

**Cue:**
- [chỉ ảnh trái] đầu vào giả
- [chỉ heat-map phải] vùng nóng = vùng ghép
- nhấn: bằng chứng cho người duyệt, không phải hộp đen
- click sang slide 14

---

### Slide 14 — Nhỏ. Nhưng trung thực.  ⏱ ~84s

**Headline:** Nhỏ. Nhưng trung thực.

**Lời nói:**
Đây là phần em coi trọng nhất: đọc kết quả **trung thực**. [DỪNG] Một. Thứ tự đúng giả thuyết ở **mức frame**: B4 nhỏ hơn SFDCT nhỏ hơn HFF. Và floor guarantee từ zero-init giữ đúng cho mọi biến thể. [DỪNG] Nhưng em nói cả mặt kia. Ở **mức video**, thứ tự đảo: SFDCT **0 chấm 8083**, còn thấp hơn baseline **0 chấm 8203**. Một lý do nữa để em không tuyên bố cải thiện. [DỪNG] Hai, và quan trọng nhất. Cải thiện là **nhỏ**. Không SOTA. Một seed mỗi cấu hình. Em bootstrap 518 clip, hai nghìn lần. Mọi khoảng tin cậy bắt cặp đều chứa **0**. Kể cả mức video. Không biến thể nào tách khỏi baseline có ý nghĩa thống kê. [DỪNG] Ba. Tại 5% FPR, bắt khoảng 23% ở mức một khung hình. Đúng vai một lớp sàng lọc. [DỪNG] Bốn. Một phương pháp tần số dựa trên pha đã công bố đạt **0 chấm 7650**. Nằm ngay trong khoảng cải thiện của em. Phần tăng nằm trong **nhiễu** single-seed. [DỪNG] Nên em chốt một lần nữa. Cải thiện nhỏ. Trong nhiễu single-seed. Mọi CI bắt cặp chứa 0. Em không tuyên bố SOTA. [DỪNG] Đóng góp của đồ án là tính **chặt chẽ**. Và chính sự trung thực này là điểm mạnh. [DỪNG] **Nhỏ. Nhưng trung thực.**

**Cue:**
- [chỉ 4 gạch đầu dòng lần lượt]
- KỶ LUẬT: nhấn 'ở mức frame' cho thứ tự, rồi 'mức video SFDCT 0.8083 < baseline 0.8203' (số video-level dời từ slide 12 về đây)
- stress: mọi paired CI chứa 0, 518 clip, 2000 lần
- stress: baseline tần số 0.7650 → gains trong nhiễu
- kết: lặp refrain 'Nhỏ. Nhưng trung thực.', giọng tự tin
- click sang slide 15

---

### Slide 15 — Còn một câu hỏi: vậy thì sao?  ⏱ ~10s

**Headline:** Còn một câu hỏi: vậy thì sao?

**Lời nói:**
Bốn phần. [DỪNG] Giờ là phần cuối. [DỪNG] **Kết luận** — và đóng góp thật sự nằm ở đâu.

**Cue:**
- [chỉ vào tiêu đề PART 4]
- giọng chuyển nhịp, chậm lại
- click sang slide 16 ngay sau câu này

---

### Slide 16 — Đóng góp không phải con số. Mà là thiết kế.  ⏱ ~74s

**Headline:** Đóng góp không phải con số. Mà là thiết kế.

**Lời nói:**
Đóng góp **không** phải con số AUC. [DỪNG] Mà là ba điều. [DỪNG] Một: cổng khởi tạo bằng **0**. Mô hình bắt đầu y hệt backbone đã kiểm chứng. **Bắt đầu đúng bằng backbone. Không bao giờ tệ hơn.** [DỪNG] Hai: đánh giá cross-dataset trung thực, có bootstrap CI. Mọi khoảng tin cậy chứa **0**. [DỪNG] Em không tuyên bố SOTA. Em tuyên bố một điều khó hơn: một **đánh giá trung thực**. [DỪNG] Ba: hệ thống eKYC giải thích được. Chạy CPU. Một giây mỗi ảnh, kèm Grad-CAM. [DỪNG] Giới hạn, em nói thẳng. Mỗi cấu hình một seed. Ngưỡng còn hiệu chỉnh trên test — em sẽ sửa bằng validation riêng. **FPR 5% là lựa chọn kỹ thuật. Không phải ngưỡng luật.** [DỪNG] Hướng tới: multi-seed, gắn liveness, train self-blended. [DỪNG] Một lần cuối. **Nhỏ. Nhưng trung thực.**

**Cue:**
- [chỉ vào cột CONTRIBUTIONS] nhấn 'khởi tạo bằng 0'
- stress 'mọi khoảng tin cậy chứa 0' và 'một giây'
- [chỉ vào cột LIMITATIONS] khi nói 'một seed' và 'hiệu chỉnh trên test'
- nói rõ 'FPR 5% KHÔNG do TT17 quy định'
- kết: refrain trung thực (lần 3/3), giọng tự tin
- click sang slide 17

---

### Slide 17 — Cảm ơn. Em xin sẵn sàng.  ⏱ ~12s

**Headline:** Cảm ơn. Em xin sẵn sàng.

**Lời nói:**
**Mờ trong pixel. Rõ trong tần số.** [DỪNG] Em cảm ơn hội đồng. [DỪNG] Em xin **sẵn sàng** trả lời.

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

## 5. Phụ lục B — Mẹo căn giờ & câu chốt mỗi phần (nhịp chậm)

**Câu chốt mỗi phần (đọc rõ, dừng một nhịp sau khi nói):**
- Mở đầu (slide 3): "Bài kiểm tra trung thực là train trên FF++, test trên Celeb-DF-v2 — vì detector học một họ giả mạo thường sụp đổ trên họ chưa từng thấy."
- Phương pháp (slide 9): "Bắt đầu đúng bằng backbone, không bao giờ tệ hơn — và alpha học được chính là đồng hồ đo: cổng hé mở ít nên gain SFDCT nhỏ, hai con số khớp nhau."
- Kết quả (slide 14): "Cải thiện nhỏ, nằm trong nhiễu single-seed, mọi paired CI đều chứa 0, em không tuyên bố SOTA — đóng góp là tính chặt chẽ. Nhỏ. Nhưng trung thực."
- Kết luận (slide 16): "Đóng góp không phải một con số mà là một thiết kế an toàn chứng minh được, một giao thức công bằng có CI, và một sản phẩm giải thích được — và sự trung thực đó là điểm mạnh."

**Ba câu thần chú và chỗ đặt:**
- "Mờ trong pixel. Rõ trong tần số." — slide 5, 8, 17 (đúng 3 lần).
- "Nhỏ. Nhưng trung thực." — slide 10, 14, 16 (đúng ngữ cảnh kết quả; KHÔNG dùng ở slide 9).
- "Bắt đầu đúng bằng backbone. Không bao giờ tệ hơn." — slide 9, 16.

**Số liệu phải nói ĐÚNG (học thuộc, không đọc sai):**
- Baseline B4 frame AUC **0.7497** vs công bố **0.7487** → dùng cụm "khớp trong khoảng 0.001" (KHÔNG nói "khớp tuyệt đối").
- Thứ tự frame: B4 **0.7497** < SFDCT **0.7572** < SFDCT-HFF **0.7695** — luôn kèm hai chữ "ở mức frame".
- Mức video (đảo thứ tự): SFDCT **0.8083** < baseline **0.8203** — nói ở slide 14, phải tự nêu, đừng để hội đồng phát hiện.
- HFF **0.7695** = best checkpoint giữa epoch 1, **mức frame**; paired CI **+0.007 [−0.022, +0.037]** là **mức video**, chứa 0. KHÔNG trộn hai cấp độ trong một câu.
- Gate (của SFDCT): mean |alpha| **~0.00015** (1,5×10⁻⁴) — gần 0 nhưng **KHÁC 0**; max |alpha| **~0.023**; **44/1792 kênh** vượt 10⁻³. Gain SFDCT đi với histogram này là **+0.0075** (0.7497→0.7572) — KHÔNG dùng +0.007/CI của HFF cho slide 9.
- Operating point: FPR **5%** (0.0500) → catch rate **~23%** (0.2298) ở mức frame; video ~1/3; human-review ~1/2. Ngưỡng **0.9514**.
- Bootstrap: **518 clip**, **2000 lần**.
- Liveness: B4 **0.9829** > B4+DCT **0.9776** (tần số KHÔNG cải thiện); 314 ảnh thật ở eval.
- Baseline tần số đối chiếu: phase-based **0.7650**; SRM **0.7552**.
- Runtime: model **~70 MB**, **~1 s/ảnh** trên CPU 2 nhân 8 GB.
- Thông tư **17/2024/TT-NHNN**: bắt buộc sinh trắc học, KHÔNG quy định ngưỡng sai số bằng số.

**Ranh giới trung thực mong manh nhất (đọc kỹ trước khi lên):**
- Ở slide 12 và 14, TUYỆT ĐỐI không rớt cụm **"ở mức frame"** khi đọc nhanh thứ tự B4<SFDCT<HFF. Nếu rớt, nó biến thành tuyên bố cải thiện toàn cục — sai, vì mức video đảo ngược và mọi paired CI chứa 0.
- Số **0.7695** luôn gắn nhãn "frame-level, best-checkpoint giữa epoch 1". CI **[−0.022, +0.037]** luôn gắn nhãn "video-level". Một câu, hai cấp độ phân minh.
- Ở slide 9, dùng gain **+0.0075 của SFDCT** (đi với histogram 1792 kênh). KHÔNG kéo con số +0.007 và CI của HFF về slide 9 — đó là mô hình khác, video-level, để cho slide 10.

**Mẹo nếu LỐ giờ (chạm >14:30):**
- Rút gọn slide 10 phần liveness về một câu: "Tái dùng thiết kế cho liveness, B4 0.9829 > B4+DCT 0.9776 — tần số không cải thiện, kết quả âm trung thực."
- Bỏ ba lý do chọn B4 ở slide 7 → một câu: "B4 là backbone benchmark công khai nên so sánh công bằng."
- Rút câu mở slide 8 ("Giả thuyết tần số không nói suông") thẳng vào mô tả lưới.
- Tuyệt đối KHÔNG cắt slide 9 và slide 14 — đây là hai slide đóng góp và trung thực, là tuyến phòng thủ.

**Mẹo nếu THIẾU giờ (chạy <12:00 khi tập):**
- KHÔNG thêm slide. Đọc CHẬM lại slide 9 và slide 12 (hai slide nặng số), thêm 1–2 nhịp [DỪNG] sau mỗi con số quan trọng (0.7497 vs 0.7487; mean alpha 0.00015; max 0.023; CI chứa 0).
- Tách rõ ba bước ở slide 9 bằng nhịp dừng — không đọc thành một khối liền.
- Thêm một câu bối cảnh ở slide 13: "Trong duyệt eKYC, người vận hành cần biết VÌ SAO hệ thống nghi, không chỉ một điểm số — Grad-CAM cho họ chính cái đó."

**Mẹo nhịp chung (người nói trung–chậm):**
- Bài có **~1.900 token nói**. Ở nhịp chậm ~175 token/phút cộng 81 nhịp [DỪNG] và chuyển slide, thực tế rơi vào **~13–14 phút**, dưới trần 15:00. Bảng dòng thời gian (830s) là KẾ HOẠCH để bám, không phải số đo chắc chắn — **bắt buộc bấm giờ thật ≥2 lần** rồi tinh chỉnh.
- Hai slide nặng nhất là 9 và 12. Rủi ro KHÔNG phải lố giờ mà là lê thê và rơi mạch ở đây — bám đúng số, dừng sau mỗi con số, đừng thêm chữ ngẫu hứng.
- Chèn "click + im lặng 1 giây" ở hai chỗ chuyển nội dung dày: slide 3 (giữa đặt-vấn-đề và mục tiêu) và slide 9 (trước bước ba — gated residual).
- Khoảng lặng là công cụ Steve Jobs dùng nhiều nhất. Khi đọc một con số trung thực (mọi CI chứa 0, B4 > B4+DCT), dừng một nhịp và nhìn hội đồng — sự tự tin nằm ở chỗ dám im lặng.
