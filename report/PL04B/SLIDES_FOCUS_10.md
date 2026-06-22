# 10 slide trọng tâm — kịch bản trình bày sâu

Đây là các slide bạn dành phần lớn thời gian, hội đồng (Computer Science & AI) sẽ tập trung. Các slide khác trong `SLIDES_DEFENSE_15min.md` (nền lý thuyết, diagram, screen) chỉ lướt nhanh. Cấu trúc: mỗi chủ điểm 2 slide, riêng phương pháp (chính) 4 slide.

| Chủ điểm | Slide |
|---|---|
| 1. Tổng quan dự án | S1 Bài toán & động lực · S2 Mục tiêu & phạm vi |
| 2. Phương pháp (chính) | S3 Kiến trúc 2 nhánh · S4 Đặc trưng block-DCT · S5 Cổng hợp nhất · S6 SFDCT-HFF + liveness |
| 3. Kết quả | S7 Giao thức cross-dataset · S8 Kết quả + đọc trung thực |
| 4. Kết luận | S9 Kết luận & đóng góp · S10 Hạn chế & hướng phát triển |

Mỗi slide có: bullet trên slide (English) · hình + chỗ chỉ tay · 1 câu thông điệp · kịch bản nói (đọc gần nguyên văn, xưng "em") · câu hỏi hội đồng + cách trả lời · điều cần tránh. Số liệu và phát biểu đã đối chiếu với INTRODUCTION/CH1–CH4/CONCLUSION; bộ kiểm liêm chính đã loại các con số không có trong báo cáo. Tên file hình nằm trong `report/figures/`.

---

## Slide 1 — Problem and Motivation: The Generalisation Gap at the eKYC Face Check
> Chủ điểm 1 Tổng quan dự án (1/2). High-focus slide, target 2.5 min.

**On-slide (English):**
- eKYC opens accounts and confirms payments from one portrait photo
- Face verification is the lock on that first door to financial services
- Two distinct threats: deepfake (GAN face swap/synthesis) and presentation attack (print/replay)
- Either bypass means identity fraud and direct financial loss
- Circular 17/2024/TT-NHNN mandates biometric checks but fixes no error rate
- Core difficulty: generalisation gap; pixel detectors collapse on unseen forgeries

**Figure:** `fig_3_2_preprocess_realfake.png` — Real versus fake face (FaceForensics++ Deepfakes) with their average block-DCT 8x8 spectra and the real-minus-fake difference footprint: the forgery is hard to see in pixels but leaves a structured trace in the frequency domain.
- Chỉ tay: Hai ảnh khuôn mặt ở hàng trên, bên trái là khuôn mặt thật, bên phải là khuôn mặt giả do mô hình sinh tráo mặt, nói rằng bằng mắt thường hai ảnh trông gần như nhau, đây chính là mối đe doạ deepfake.
- Chỉ tay: Hai biểu đồ phổ DCT ở hàng dưới, một của ảnh thật một của ảnh giả, nói đây là cách nhìn ảnh theo miền tần số chứ không theo từng điểm ảnh.
- Chỉ tay: Bản đồ chênh lệch Real minus Fake ngoài cùng bên phải, chỉ vào vùng có màu nổi lên để nói dấu vết làm giả gần như vô hình trong điểm ảnh nhưng để lại một vết có cấu trúc trong miền tần số.
- Chỉ tay: Nhấn rằng đây mới chỉ là một phương pháp làm giả mà mô hình đã thấy khi huấn luyện, còn kẻ tấn công thực tế luôn dùng công cụ mới chưa từng có trong tập huấn luyện, đó là khoảng trống tổng quát hoá.

**Secondary figure (optional):** `fig_3_2_2_celeb_realfake.png` — Slide vấn đề chỉ cần một hình duy nhất để giữ trọng tâm vào động cơ. Hình dự phòng này cho cặp thật giả chất lượng cao của Celeb-DF-v2, dùng khi hội đồng hỏi sâu về độ tinh vi của bản giả ở tập kiểm thử.

**Key message (1 câu):** Bước xác thực khuôn mặt là ổ khoá của cánh cửa đầu tiên dẫn vào dịch vụ tài chính, nó bị đe doạ bởi hai dạng tấn công riêng biệt là deepfake và tấn công trình diện, và khó khăn cốt lõi không phải là phát hiện một kiểu giả đã biết mà là tổng quát hoá sang kiểu giả chưa từng thấy, vì kẻ tấn công luôn dùng công cụ mới còn mô hình thì bị đóng băng tại thời điểm huấn luyện.

**Speaker script (đọc gần như nguyên văn):**
Kính thưa hội đồng, ở slide này em xin trình bày bài toán và động cơ của đề tài, vì sao bài toán này quan trọng và vì sao nó khó.

Trước hết là bối cảnh. Định danh điện tử, gọi tắt là eKYC tức là quy trình ngân hàng xác minh khách hàng từ xa, đã trở thành một phần thường nhật của ngành tài chính ngân hàng ở Việt Nam. Một khách hàng có thể mở tài khoản, vay vốn, hoặc xác nhận một giao dịch ngay tại nhà, chỉ bằng một ảnh chân dung và vài thao tác trên điện thoại. Chính sự tiện lợi đó biến eKYC thành cánh cửa đầu tiên dẫn vào nhiều dịch vụ tài chính, và bước xác thực khuôn mặt là ổ khoá của cánh cửa ấy.

Nhưng cùng sự tiện lợi đó cũng khiến cánh cửa này hấp dẫn kẻ tấn công, và mối đe doạ đến theo hai dạng riêng biệt. Dạng thứ nhất là deepfake, tức là dùng các mô hình sinh, thường là mạng sinh đối kháng GAN, để tráo hoặc tổng hợp một khuôn mặt, nên có thể tạo ra một bản giả trông như thật một cách nhanh và rẻ. Dạng thứ hai là tấn công trình diện, còn gọi là spoof hay tấn công sự sống, tức là kẻ gian giơ một ảnh in hoặc phát lại một video trên màn hình trước camera để giả mạo một khách hàng thật. Em xin nhấn, nếu một trong hai dạng này lọt qua bước xác thực, hậu quả là gian lận danh tính và thiệt hại tài chính trực tiếp.

Em xin mời hội đồng nhìn vào hình. Hàng trên là một khuôn mặt thật bên trái và một khuôn mặt giả bên phải, lấy từ bộ dữ liệu FaceForensics. Bằng mắt thường hai ảnh trông gần như nhau, đó chính là lý do deepfake nguy hiểm. Hàng dưới là phổ tần số của hai ảnh, tức là cách nhìn ảnh theo độ sáng thay đổi nhanh hay chậm chứ không theo từng điểm ảnh. Ô ngoài cùng bên phải là bản đồ chênh lệch giữa thật và giả, ở đó ta thấy dấu vết làm giả gần như vô hình trong điểm ảnh nhưng lại để lại một vết có cấu trúc trong miền tần số. Hình này nói lên hướng đi của đề tài, nhưng ở slide này em chỉ dùng nó để minh hoạ bản chất của mối đe doạ.

Tiếp theo là bối cảnh pháp lý. Thông tư 17 năm 2024 của Ngân hàng Nhà nước Việt Nam yêu cầu các ngân hàng xác minh khách hàng bằng thông tin sinh trắc học, nhưng thông tư không ấn định một mức sai số cụ thể nào. Điều đó có nghĩa là việc chọn ngưỡng vận hành được giao cho người thiết kế hệ thống, đây là một ràng buộc quan trọng mà đề tài phải tự giải quyết.

Cuối cùng là khó khăn kỹ thuật cốt lõi, và đây là điểm em muốn hội đồng ghi nhớ nhất. Phần lớn các bộ phát hiện hiện nay học trực tiếp từ điểm ảnh. Chúng hoạt động tốt trên dữ liệu giống với phân phối mà chúng được huấn luyện, nhưng thường sụp đổ khi gặp một phương pháp làm giả hoặc một bộ dữ liệu mà chúng chưa từng thấy. Em gọi đây là khoảng trống tổng quát hoá, và nó là khó khăn trung tâm của bài toán. Lý do là trong thực tế, kẻ tấn công luôn với tới những công cụ mới nhất, trong khi bộ phát hiện thì bị đóng băng tại thời điểm huấn luyện. Vì vậy bài toán thật sự không phải là phát hiện một kiểu giả đã biết, mà là tổng quát hoá sang kiểu giả chưa từng thấy. Đó chính là động cơ dẫn tới phương pháp mà em trình bày ở các slide sau.

**Hội đồng có thể hỏi:**
- Q: Đề tài có hai mối đe doạ là deepfake và tấn công trình diện, vậy mối nào là đóng góp chính và vì sao tách làm hai? — A: Lớp phát hiện deepfake là đóng góp chính của đề tài, còn lớp phát hiện sự sống chống tấn công trình diện là một tiện ích phụ và bổ trợ trên cùng bước xác thực khuôn mặt. Em tách làm hai vì hai dạng tấn công có bản chất khác nhau, deepfake là một khuôn mặt giả được sinh ra bằng mô hình sinh, còn tấn công trình diện là một khuôn mặt thật nhưng được trình diện gián tiếp qua ảnh in hoặc màn hình.
- Q: Thông tư 17 không ấn định mức sai số, vậy điều đó tạo ra vấn đề gì cho đề tài? — A: Vì thông tư yêu cầu xác minh bằng sinh trắc học nhưng không cố định một mức sai số cụ thể, nên việc chọn ngưỡng vận hành được giao cho người thiết kế hệ thống. Em phải tự chọn một điểm vận hành cân bằng giữa tỉ lệ chặn nhầm khách hàng thật và tỉ lệ bỏ lọt khuôn mặt giả, và phải báo cáo điểm vận hành đó một cách minh bạch.
- Q: Vì sao gọi đây là khoảng trống tổng quát hoá, nó khác gì với việc mô hình chỉ cần thêm dữ liệu huấn luyện? — A: Thêm dữ liệu không xoá được khoảng trống này, vì kẻ tấn công luôn dùng công cụ mới hơn công cụ đã có trong tập huấn luyện, trong khi mô hình bị đóng băng tại thời điểm huấn luyện. Đó là lý do đề tài đo bằng giao thức cross-dataset, huấn luyện trên một bộ và kiểm thử trên một bộ hoàn toàn khác.
- Q: Đề tài làm việc ở mức ảnh đơn hay mức video? — A: Phương pháp đề xuất làm việc ở mức khung hình trên một ảnh khuôn mặt đơn đã được cắt và căn chỉnh, không khai thác thông tin thời gian giữa các khung. Lựa chọn này phù hợp với eKYC vì một phiên định danh thường bắt đầu từ một ảnh chân dung, và việc khai thác thông tin thời gian được để lại làm hướng phát triển.

**Tránh:**
- Không trình bày objectives ở slide này, các mục tiêu cụ thể là một slide riêng, slide này chỉ nói bài toán và động cơ.
- Không nói Thông tư 17 đặt ra mức sai số hay FPR cụ thể nào, thông tư yêu cầu xác minh sinh trắc học nhưng không ấn định mức sai số.
- Không tuyên bố phương pháp của đề tài giải quyết được khoảng trống tổng quát hoá, ở slide này chỉ nêu khoảng trống là khó khăn.
- Không gộp deepfake và tấn công trình diện thành một mối đe doạ, phải nói rõ chúng là hai dạng riêng biệt.
- Không bịa con số nào không có trong phần Background và Problem Statement, ví dụ tỉ lệ gian lận hay thiệt hại tính bằng tiền.

---

## Slide 2 — Objectives and Scope: An Honestly Evaluated Two-Layer Protection System
> Chủ điểm 1 Tổng quan dự án (2/2). High-focus slide, target 2.5 min.

**On-slide (English):**
- Goal: protect face verification against deepfake and presentation attacks
- Obj 1: simple web platform to upload or capture a face, fast result
- Obj 2: deepfake detector fusing a block-DCT frequency branch with a CNN backbone via a gated attention, returning a heat map
- Obj 3: secondary liveness utility (live person vs printed photo or screen replay)
- Obj 4: cloud deployment on AWS EC2
- Scope: frame-level aligned faces, no temporal info; liveness is secondary; evaluated cross-dataset FF++ to Celeb-DF-v2

**Figure:** none — text box. Bố cục hai phần. Bên trái là bốn ô mục tiêu xếp dọc gồm nền tảng web, phát hiện deepfake, liveness, AWS EC2, trong đó ô deepfake tô đậm nhất để báo là đóng góp chính. Bên phải là một bảng gọn rút từ Bảng 0.1 với hai cột Trong phạm vi và Ngoài phạm vi, làm nổi hai ranh giới quan trọng nhất là mức khung hình trên khuôn mặt căn chỉnh không có thông tin thời gian, và liveness là lớp phụ. Dòng cuối ghi giao thức đánh giá DeepfakeBench, huấn luyện FaceForensics++ rồi kiểm thử Celeb-DF-v2.

**Secondary figure (optional):** `fig_3_1_distribution.png` — Chỉ dùng khi hội đồng hỏi cụ thể về phép đo cross-dataset. Biểu đồ phân bố số khung thật và giả của tập huấn luyện và tập kiểm thử cho thấy hai tập tách biệt, minh họa rằng đánh giá là trên dữ liệu chưa từng thấy.

**Key message (1 câu):** Mục tiêu của khóa luận là một hệ thống bảo vệ bước xác thực khuôn mặt phủ cả hai lớp deepfake và liveness, với đóng góp chính là nhánh tần số block-DCT hợp nhất bằng cổng chú ý, và điểm cốt lõi là hệ thống được đánh giá trung thực theo giao thức cross-dataset, huấn luyện trên FaceForensics++ rồi kiểm thử trên Celeb-DF-v2 chưa từng thấy.

**Speaker script (đọc gần như nguyên văn):**
Kính thưa hội đồng, sau khi đã nêu bài toán ở slide trước, em xin trình bày mục tiêu và phạm vi của khóa luận.

Mục đích bao trùm là xây một hệ thống bảo vệ bước xác thực khuôn mặt, phủ cả hai mối đe dọa là deepfake, tức khuôn mặt do mô hình sinh ra để giả mạo, và tấn công trình diễn, tức ảnh in hoặc phát lại trên màn hình. Điểm em muốn hội đồng ghi nhớ nhất là hệ thống được đánh giá một cách trung thực, nghĩa là kiểm thử trên dữ liệu khác hẳn dữ liệu huấn luyện, chứ không chỉ trên dữ liệu giống tập đã học.

Từ mục đích đó, em đặt ra bốn mục tiêu cụ thể. Mục tiêu thứ nhất là một nền tảng web có chức năng, đơn giản và trực quan, để người dùng tải lên hoặc chụp một ảnh khuôn mặt và nhận kết quả phân tích nhanh. Mục tiêu thứ hai, và đây là đóng góp chính, là phát hiện deepfake bằng cách kết hợp một nhánh tần số dựng trên phép biến đổi cosine rời rạc, tức cách mô tả ảnh theo việc độ sáng thay đổi nhanh hay chậm, áp dụng trên các khối ảnh nhỏ, với một xương sống tích chập tiêu chuẩn, tức mạng nơ-ron quen thuộc đọc điểm ảnh, và hai nhánh được hợp nhất qua một cơ chế chú ý có cổng, tức một cổng học được điều tiết lượng thông tin tần số cộng thêm vào. Đầu ra kèm một bản đồ nhiệt, tức ảnh tô màu cho biết vùng nào trên khuôn mặt dẫn tới quyết định. Em xin nói rõ là kết quả định lượng được báo cáo ở Chương 4. Mục tiêu thứ ba là một tiện ích liveness phụ trợ, kiểm tra xem khuôn mặt trước máy ảnh là người sống thật hay là ảnh in hoặc phát lại. Mục tiêu thứ tư là triển khai trên đám mây, đưa các dịch vụ phía sau lên máy chủ AWS EC2 để hệ thống luôn sẵn sàng.

Về phạm vi, em chủ ý giới hạn để các khẳng định luôn đứng vững được, và em xin nhấn hai ranh giới quan trọng nhất. Ranh giới thứ nhất, bộ phát hiện deepfake làm việc ở mức khung hình trên một khuôn mặt đã căn chỉnh, không dùng thông tin thời gian giữa các khung. Ranh giới thứ hai, mô-đun liveness là một lớp phụ trợ chứ không phải đóng góp chính. Cuối cùng, việc đánh giá tuân theo giao thức DeepfakeBench, huấn luyện trên FaceForensics++ và kiểm thử chéo trên Celeb-DF-v2. Đây chính là phép đo khả năng tổng quát hoá thật.

**Hội đồng có thể hỏi:**
- Q: Tại sao liveness lại là lớp phụ chứ không phải một đóng góp ngang hàng với deepfake? — A: Vì đóng góp kỹ thuật mới của khóa luận nằm ở nhánh tần số block-DCT và cách hợp nhất bằng cổng chú ý cho bài toán deepfake. Liveness được đưa vào như một tiện ích bổ sung để lọc các trường hợp tấn công trình diễn phổ biến, nên báo cáo định vị nó là một nghiên cứu phụ trợ chứ không phải một nghiên cứu cấp chứng chỉ PAD độc lập.
- Q: Vì sao chỉ làm ở mức khung hình trên ảnh đơn mà không dùng thông tin thời gian của video? — A: Trong eKYC, đầu vào thực tế thường là một ảnh chân dung được cắt và căn chỉnh trong phiên định danh, nên bài toán ở mức khung hình phản ánh đúng tình huống triển khai. Báo cáo ghi rõ trong Bảng 0.1 rằng hợp nhất theo thời gian nằm ngoài phạm vi, và việc khai thác thông tin thời gian được để lại làm hướng phát triển.
- Q: Đánh giá cross-dataset cụ thể là gì và tại sao chọn cách đó? — A: Cross-dataset nghĩa là huấn luyện toàn bộ trên FaceForensics++ rồi chỉ kiểm thử trên Celeb-DF-v2, một bộ chưa bao giờ xuất hiện trong huấn luyện. Chia train test trên cùng một bộ chỉ đo điểm trong phân phối, dễ bị thổi phồng. Cross-dataset ép mô hình đối mặt kiểu deepfake và khuôn mặt mới, đúng với tình huống eKYC.
- Q: Bốn mục tiêu này có phải đều đã hoàn thành trong khóa luận không? — A: Bốn mục tiêu đều được hiện thực và trình bày trong báo cáo, với kết quả định lượng cho phần deepfake và liveness ở Chương 4. Em xin nói thẳng rằng phần lợi của nhánh tần số là nhỏ và nằm trong dao động giữa các lần chạy ở một hạt giống, nên em không tuyên bố vượt trội. Đóng góp nằm ở việc kết hợp đúng giả thuyết và đánh giá trung thực.

**Tránh:**
- Không nói nhánh tần số chắc chắn làm tăng độ chính xác hay đạt kết quả tốt nhất hiện có.
- Không nâng liveness lên ngang hàng đóng góp chính, phải giữ đúng định vị là lớp phụ trợ theo Bảng 0.1.
- Không nêu bất kỳ con số AUC, ngưỡng, hay tỉ lệ bắt được nào ở slide này, con số thuộc về các slide kết quả.
- Không gọi đây là biến đổi Fourier, đúng tên là biến đổi cosine rời rạc DCT trên các khối ảnh nhỏ.
- Không hứa hệ thống chặn được mọi tấn công, phạm vi đã loại trừ mặt nạ 3D vật lý, deepfake âm thanh, và tấn công tiêm thẳng.

---

## Slide 3 — Method Overview: The Frequency Hypothesis and the Two-Stream SFDCT Architecture
> Chủ điểm 2 Phương pháp (1/4). High-focus slide, target 3 min.

**On-slide (English):**
- Forgery traces are faint in pixels, loud in mid and high DCT bands
- Three recurring traces: blending boundary, upsampling artifact, frequency inconsistency
- Spatial stream: EfficientNet-B4 reads the aligned crop into feature map F_s
- Frequency stream: 8x8 block-DCT on YCbCr, 16 zigzag bands x 3 channels = 48-dim descriptor
- No learnable frequency parameters: the descriptor is fixed, cheap, and stable
- Gated cross-attention merges the two streams into the real-or-fake head

**Figure:** `fig_arch_sfdct.png` — SFDCT pipeline: the aligned 256x256 crop feeds a spatial EfficientNet-B4 stream (F_s) and a parallel block-DCT frequency stream (48-dim), merged by a gated cross-attention fusion into a real-or-fake head.
- Chỉ tay: Bắt đầu từ ô RGB face 256x256 bên trái, một ảnh khuôn mặt đã căn chỉnh được đưa vào hai nhánh cùng lúc.
- Chỉ tay: Nhánh trên EfficientNet-B4, nói đây là nhánh không gian đọc điểm ảnh, cho ra bản đồ đặc trưng không gian F_s.
- Chỉ tay: Nhánh dưới ContentDCT màu cam, chỉ vào dòng chữ YCbCr, 8x8 block-DCT, log, 16 zigzag bands để nói đây là nhánh tần số.
- Chỉ tay: Dải băng 16 zigzag bands x 3 kênh Y, Cb, Cr, nhấn con số 48 chiều và cụm chữ no learnable freq params.
- Chỉ tay: Khối Gated cross-attention ở giữa phải, chỉ mũi tên từ cả hai nhánh đổ vào đây để nói hai luồng hợp nhất ở điểm này.
- Chỉ tay: Khối Classifier real / fake ngoài cùng bên phải, nói đầu ra là một xác suất giả.

**Secondary figure (optional):** `fig_3_11_frequency.png` — Bằng chứng trực quan cho giả thuyết lõi. Biểu đồ năng lượng DCT trung bình theo từng băng tần cho thấy ảnh thật mang nhiều năng lượng băng trung và cao hơn ảnh giả. Dùng khi cần chứng minh bằng số liệu rằng dấu vết nằm trong miền tần số.

**Key message (1 câu):** Dấu vết làm giả khuôn mặt mờ nhạt trong điểm ảnh nhưng nổi rõ trong các băng tần số DCT trung và cao, nên SFDCT đọc đồng thời cả hai góc nhìn, một nhánh không gian và một nhánh tần số không có tham số học, rồi hợp nhất chúng bằng một cổng học được.

**Speaker script (đọc gần như nguyên văn):**
Kính thưa hội đồng, đây là slide trọng tâm của phương pháp, em xin trình bày kỹ ở hai phần, vì sao và làm gì.

Trước hết là vì sao. Mỗi cách làm giả khuôn mặt để lại một loại dấu vết riêng. Báo cáo của em quy về ba loại lặp đi lặp lại. Thứ nhất là đường ghép, tức ranh giới nơi vùng mặt bị tráo được dán vào khung hình gốc. Thứ hai là dấu vết phóng mẫu, tức hoa văn tuần hoàn do các tầng phóng to ảnh của mạng sinh đối kháng để lại. Thứ ba là mâu thuẫn tần số, tức một ảnh ghép từ nhiều nguồn làm gãy chữ ký tần số thống nhất mà một máy ảnh thật in lên ảnh. Điểm chung của cả ba là chúng rất mờ nhạt trong miền điểm ảnh, nhưng lại nổi rõ trong miền tần số, tức cách mô tả ảnh theo việc độ sáng thay đổi nhanh hay chậm. Cụ thể là chúng biểu hiện thành thừa hoặc thiếu năng lượng ở các băng tần số trung và cao của phép biến đổi cosine rời rạc hai chiều. Một mô hình chỉ nhìn điểm ảnh rất khó chạm tới bằng chứng này. Vì vậy, ý tưởng tự nhiên là đọc ảnh theo hai cách cùng lúc, một góc nhìn không gian và một góc nhìn tần số.

Nếu hội đồng cho phép, em chỉ qua biểu đồ phụ. Đây là năng lượng DCT trung bình theo từng băng tần, đường xanh là ảnh thật, đường đỏ là ảnh giả. Ta thấy ảnh thật mang nhiều năng lượng ở các băng tần trung và cao hơn ảnh giả, và hai đường tách nhau đúng ở những băng này. Đây là bằng chứng số liệu cho giả thuyết rằng dấu vết làm giả nằm trong miền tần số.

Tiếp theo là làm gì. Em chỉ vào sơ đồ kiến trúc. Bắt đầu từ ô bên trái, một ảnh khuôn mặt đã căn chỉnh kích thước 256 nhân 256 được đưa vào hai nhánh song song. Nhánh trên là nhánh không gian, dùng xương sống EfficientNet-B4 đã huấn luyện sẵn trên ImageNet, đọc bản cắt và cho ra bản đồ đặc trưng không gian, ký hiệu F dưới s. Nhánh dưới là nhánh tần số. Nó lấy đúng bản cắt đó, đổi sang không gian màu YCbCr để tách độ sáng khỏi màu, rồi áp dụng phép biến đổi cosine rời rạc theo từng khối 8 nhân 8, đúng bằng lưới nén JPEG, để giữ dấu vết làm giả nằm tại chỗ. Sáu mươi tư hệ số của mỗi khối được sắp theo đường zigzag từ tần số thấp đến cao, gom thành 16 băng, mỗi băng lấy độ lớn trung bình. Nhân với ba kênh YCbCr, ta được một mô tả 48 chiều. Em xin nhấn một điểm, nhánh tần số này không có tham số học nào. Toàn bộ là phép biến đổi cố định, nên nó rẻ về tính toán và ổn định, không bị học vẹt theo một bộ dữ liệu.

Cuối cùng, hai nhánh gặp nhau ở khối hợp nhất bằng cơ chế chú ý chéo có cổng. Đặc trưng không gian giữ vai trò chính, còn bối cảnh tần số được cộng thêm vào qua một cổng học được. Kết quả đi vào đầu phân loại hai lớp, cho ra một xác suất giả và một phán quyết thật hay giả.

**Hội đồng có thể hỏi:**
- Q: Tại sao chọn DCT theo khối 8x8 chứ không phải biến đổi toàn ảnh hay biến đổi Fourier? — A: Biến đổi toàn ảnh sẽ trộn nội dung toàn cục với dấu vết cục bộ, làm dấu vết bị hòa loãng. Chia thành các khối 8x8 không chồng lấn giữ cho mỗi dấu vết làm giả nằm tại chỗ, và lưới 8x8 trùng đúng với lưới lượng tử hóa JPEG, nơi dấu vết nén và dấu vết ghép biểu hiện rõ nhất.
- Q: Nhánh tần số không có tham số học thì lợi và hại gì? — A: Lợi là rẻ về tính toán, ổn định, và không học vẹt theo một bộ dữ liệu, vì mô tả là phép biến đổi cố định. Mặt khác, nó kém linh hoạt hơn một nhánh học được, và báo cáo trình bày trung thực rằng phần lợi đo được là nhỏ. Việc cho phép học bộ lọc tần số được nêu như hướng tương lai.
- Q: Vì sao đổi sang YCbCr trước khi làm DCT? — A: Phần lớn dấu vết tần số nằm ở kênh độ sáng Y, trong khi hai kênh màu Cb và Cr mang thống kê nén bổ sung. Tách độ sáng khỏi màu cho phép nhánh tần số tập trung vào nơi có dấu vết.
- Q: Đặt hai nhánh song song thay vì nối tiếp có ý nghĩa gì? — A: Đặt song song giữ cho đặc trưng không gian là tín hiệu chính, còn nhánh tần số chỉ cộng thêm vào qua cổng dư, nên mô hình tại lúc khởi đầu đúng bằng xương sống và không thể tệ hơn nền.

**Tránh:**
- Không nói nhánh tần số làm tăng AUC một cách chắc chắn hay đáng kể, phần lợi là nhỏ, nằm trong dao động giữa các lần chạy.
- Không gọi đây là phương pháp tốt nhất hay vượt SOTA, trên cùng giao thức bản tham chiếu tần số dựa trên pha đã công bố đạt 0.7650, cao hơn SFDCT thô 0.7572.
- Không nói nhánh tần số có học hay tự thích nghi, phải nhấn rõ là không có tham số học.
- Không trộn lẫn cổng hợp nhất khởi tạo bằng không vào slide này, ở đây chỉ cần nói hai nhánh được hợp nhất bằng chú ý chéo có cổng.
- Không phát biểu con số chiều hay băng tần sai, phải đúng: 8x8 khối, 16 băng zigzag, 3 kênh YCbCr, 48 chiều.

---

## Slide 4 — From 8x8 Block-DCT to a 48-Dim Descriptor
> Chủ điểm 2 Phương pháp (2/4). High-focus slide, target 3 min.

**On-slide (English):**
- YCbCr crop split into non-overlapping 8x8 blocks, per-block 2D-DCT
- 8x8 grid keeps a forgery trace local, aligned with the JPEG quantisation grid
- Log-magnitude rescale (Eq. 2.1) so DC does not swamp small artefact values
- Zigzag-order 64 coefficients, group into 16 bands (Eq. 2.2: floor(rank/4))
- Per-band mean over 3 YCbCr channels (Eq. 2.3): 16 x 3 = 48-dim, zero learnable parameters
- Low bands 0-3 = content, mid 4-9 = blending, high 10-15 = compression edges

**Figure:** `fig_1_3_zigzag_detailed.png` — Figure 2.5: From an 8x8 DCT block to the descriptor. The zigzag scan orders the 64 coefficients by frequency, four consecutive ranks form each of the 16 bands by Equation 2.2, and the per-band means of Equation 2.3 across three YCbCr channels give the 48-dimensional feature.
- Chỉ tay: Khối 8x8 bên trái, một ô vuông của ảnh sau khi đã chia lưới không chồng lấn.
- Chỉ tay: Đường zigzag quét chéo từ góc trên bên trái xuống góc dưới bên phải, sắp 64 hệ số theo thứ tự tần số tăng dần.
- Chỉ tay: Vạch chia 64 hệ số thành 16 nhóm, mỗi nhóm gom 4 hạng liên tiếp theo công thức floor(rank chia 4).
- Chỉ tay: Ba dải màu của ba kênh Y, Cb, Cr chồng lên nhau.
- Chỉ tay: Vector kết quả 48 chiều ở cuối, tức 16 dải nhân 3 kênh.
- Chỉ tay: Vùng dải thấp 0 đến 3 mang nội dung, dải giữa 4 đến 9 mang dấu vết ghép mặt, dải cao 10 đến 15 mang nhiễu nén.

**Secondary figure (optional):** `fig_2_dct_feature_design.png` — Hình dự phòng cho thấy bố cục 48 chiều tô màu theo vùng và bộ lọc bỏ dải thấp tùy chọn, dùng để giải thích SFDCT cơ bản (giữ cả 16 dải) so với SFDCT-HFF (triệt tiêu dải thấp nhất). Chỉ chuyển sang khi hội đồng hỏi về drop-low-band (Bảng 2.10).

**Key message (1 câu):** Nhánh tần số biến mỗi khuôn mặt thành một mô tả 48 chiều cố định, không tham số học, nên nó rẻ, ổn định và dễ diễn giải, đó chính là lý do nhánh này bền vững khi chuyển sang dữ liệu khác.

**Speaker script (đọc gần như nguyên văn):**
Đây là slide em dành nhiều thời gian nhất, vì nó là phần lõi kỹ thuật của nhánh tần số, tức nhánh đọc ảnh theo cách độ sáng thay đổi nhanh hay chậm chứ không đọc từng điểm ảnh.

Đầu vào là ảnh khuôn mặt đã cắt và căn chỉnh, được chuyển sang không gian màu YCbCr, tức tách độ sáng Y ra khỏi hai kênh màu Cb và Cr, vì nén và dấu vết giả mạo tác động lên hai phần này khác nhau, và phần lớn dấu vết tần số nằm ở kênh độ sáng. Ảnh được chia thành các khối 8 nhân 8 không chồng lấn, rồi áp dụng phép biến đổi cosine rời rạc hai chiều, gọi tắt là DCT, lên từng khối một cách độc lập. Em chọn chia khối 8 nhân 8 thay vì biến đổi cả ảnh, vì biến đổi cả ảnh sẽ trộn lẫn nội dung toàn cục với dấu vết cục bộ, còn lưới khối giữ cho một vết giả mạo nằm gọn tại chỗ và trùng đúng với lưới lượng tử hóa của JPEG, nơi dấu vết nén và dấu vết ghép mặt lộ rõ nhất.

Bước tiếp theo là chuẩn hóa. Theo công thức 2.1, mỗi hệ số được lấy log của 1 cộng với độ lớn của nó. Lý do là hệ số DC, tức thành phần trung bình của khối, có thể lớn gấp hàng nghìn lần một hệ số tần số cao, nên nếu để nguyên giá trị thô thì các giá trị nhỏ, đúng là nơi dấu vết giả mạo cư trú, sẽ bị nhấn chìm về mặt số học. Phép log nén lại khoảng động đó, và việc cộng thêm 1 tránh lấy log của 0.

Mời hội đồng nhìn vào hình. 64 hệ số của một khối được sắp theo đường zigzag quét chéo, từ tần số thấp ở góc trên bên trái đến tần số cao ở góc dưới bên phải. Theo công thức 2.2, mỗi hệ số được gán vào một dải bằng phần nguyên của hạng chia cho 4, nghĩa là cứ 4 hạng liên tiếp gộp thành một dải, cho ra 16 dải. Với mỗi dải, công thức 2.3 lấy trung bình độ lớn của các hệ số trong dải. Làm như vậy trên cả 3 kênh YCbCr thì 16 dải nhân 3 kênh cho ra một vector mô tả 48 chiều. Em muốn nhấn mạnh một điểm, toàn bộ nhánh tần số này không có một tham số học nào, mọi bước đều cố định.

Về ý nghĩa từng dải, theo Bảng 2.9, dải thấp từ 0 đến 3 mang nội dung thô và danh tính. Dải giữa từ 4 đến 9 mang dấu vết upsampling và dấu vết ghép mặt. Dải cao từ 10 đến 15 mang nhiễu nén và biên cạnh. Thành phần DC đã được loại bỏ, và có thể bỏ thêm các dải thấp nhất để nhánh tập trung vào những dải chứa dấu vết giả mạo. Phiên bản SFDCT cơ bản giữ cả 16 dải, còn biến thể SFDCT-HFF triệt tiêu các dải thấp nhất để dựng phần dư cao tần.

Tóm lại, mô tả này rẻ về tính toán, ổn định vì lấy trung bình theo dải thay vì giữ 64 hệ số thô, và dễ diễn giải vì mỗi chiều ứng với một dải tần số có ý nghĩa rõ ràng. Chính ba tính chất đó giải thích vì sao nhánh tần số bền khi em chuyển từ tập huấn luyện sang một tập dữ liệu khác hẳn.

**Hội đồng có thể hỏi:**
- Q: Tại sao chia khối 8x8 mà không biến đổi DCT trên toàn ảnh? — A: Biến đổi toàn ảnh trộn nội dung toàn cục với dấu vết cục bộ, làm loãng vết giả mạo. Lưới khối 8x8 giữ vết giả mạo nằm gọn tại chỗ và trùng đúng với lưới lượng tử hóa JPEG. Việc căn chỉnh khuôn mặt chặt trước khi chia khối cũng quan trọng, vì nếu không cùng một vùng mặt sẽ rơi vào các khối khác nhau và thống kê theo dải sẽ bị hỏng.
- Q: Vì sao lấy trung bình theo dải mà không đưa thẳng 64 hệ số vào mạng? — A: Lấy trung bình theo dải giữ cho chữ ký tần số ổn định và giảm nhiễu, đồng thời nén 64 hệ số thành 16 dải nên mô tả gọn và rẻ. Quan trọng hơn, cách gộp này không thêm tham số học nào ở nhánh tần số. Em cũng xin nói thẳng là cải thiện đo được nhỏ, nằm trong khoảng dao động giữa các lần chạy, một seed.
- Q: Phép log trong công thức 2.1 để làm gì, và vì sao dùng YCbCr thay vì RGB? — A: Hệ số DC có thể lớn gấp hàng nghìn lần một hệ số tần số cao, nên giá trị thô sẽ nhấn chìm các giá trị nhỏ là nơi dấu vết giả mạo nằm. Phép log của 1 cộng độ lớn nén khoảng động lại. Dùng YCbCr vì phần lớn dấu vết tần số nằm ở kênh độ sáng Y.
- Q: Khác biệt giữa SFDCT cơ bản và biến thể bỏ dải thấp là gì? — A: Theo Bảng 2.10, SFDCT cơ bản loại thành phần DC và giữ cả 16 dải. Biến thể SFDCT-HFF triệt tiêu các dải thấp nhất để chỉ giữ dải giữa và dải cao, rồi biến đổi ngược thành ảnh dư cao tần. Đây là tùy chọn, không phải bắt buộc.

**Tránh:**
- Không nói nhánh tần số học ra bộ lọc hay có trọng số học, nó hoàn toàn cố định, 0 tham số học.
- Không tuyên bố mô tả 48 chiều giúp vượt mức state of the art, cải thiện là nhỏ, trong khoảng dao động một seed.
- Không nói nhầm là bỏ luôn DC và toàn bộ dải thấp ở bản cơ bản, bản cơ bản chỉ bỏ DC và giữ cả 16 dải.
- Không nêu con số chiều hay số dải nào không có trong Bảng 2.9, chỉ dùng 8x8, 64 hệ số, 16 dải, 3 kênh, 48 chiều.
- Không gọi đây là biến đổi Fourier, đây là biến đổi cosine rời rạc DCT.

---

## Slide 5 — Gated Cross-Attention Fusion: Space Queries Frequency, a Zero-Start Gate Meters the Contribution
> Chủ điểm 2 Phương pháp (3/4). High-focus slide, target 3 min.

**On-slide (English):**
- Spatial F_s forms the query; block-DCT descriptor D forms key and value
- Each spatial position retrieves a weighted frequency summary (Eq. 2.4), not a flat concat
- Context enters via a gated residual: F_fused = F_s + alpha . context (Eq. 2.5)
- Scalar gate alpha initialised to 0: at step 1 fusion equals the backbone exactly
- Gate opens only where frequency context lowers the training loss
- Learned alpha is a direct meter: stays near 0 (std 0.0013, max|alpha| 0.0232), so gain is small

**Figure:** `fig_3_13_gate_alpha.png` — Figure 4.13: Distribution of the learned fusion gate alpha after training. Across 1792 channels the gate stays selective and modest (mean +0.0000, std 0.0013, max|alpha| 0.0232): most channels remain near zero and only a small fraction open, which agrees with the measured gain being small.
- Chỉ tay: Chỉ vào bảng số góc trên bên phải, đọc to bốn con số đo được, channels bằng 1792, mean bằng cộng 0.0000, std bằng 0.0013, và max trị tuyệt đối của alpha bằng 0.0232.
- Chỉ tay: Chỉ vào đường nét đứt thẳng đứng tại alpha bằng 0, nói đây là vị trí khởi tạo của cổng, mọi kênh đều bắt đầu đúng tại đây.
- Chỉ tay: Chỉ vào cột cao nhất ngay sát đường alpha bằng 0, nói phần lớn các kênh sau huấn luyện vẫn nằm gần không, nghĩa là cổng đa phần vẫn đóng.
- Chỉ tay: Chỉ vào các cột thưa thớt và thấp ở hai phía trong panel phải theo thang log, nói chỉ một số ít kênh mở ra một chút, và kênh mở mạnh nhất cũng chỉ tới 0.0232.

**Secondary figure (optional):** `fig_1_4_gate_fusion.png` — Sơ đồ cơ chế hợp nhất, dùng khi giải thích Công thức 2.4 và 2.5 hoặc khi hội đồng hỏi luồng dữ liệu. Nó cho thấy đặc trưng không gian làm truy vấn Q, mô tả tần số block-DCT làm khoá K và giá trị V, khối chú ý chéo cho ra context, rồi context được cộng lại qua cổng alpha khởi tạo bằng 0.

**Key message (1 câu):** Hai nhánh được hợp nhất bằng chú ý chéo có cổng, trong đó đặc trưng không gian truy vấn xem dấu vết tần số nào đáng dùng tại từng vị trí, còn cổng alpha khởi tạo bằng 0 vừa là một lựa chọn thiết kế hợp nhất an toàn vừa là một đồng hồ đo trực tiếp mức đóng góp của nhánh tần số, và đồng hồ đó cho thấy cổng mở có chọn lọc và mở nhỏ.

**Speaker script (đọc gần như nguyên văn):**
Kính thưa hội đồng, slide này trả lời câu hỏi hai nhánh được ghép lại với nhau như thế nào, đây là phần cơ chế của phương pháp chứ không phải một tuyên bố về hiệu năng.

Em xin trình bày cách hợp nhất trước. Em không nối hai nhánh bằng cách dán phẳng đặc trưng không gian và đặc trưng tần số cạnh nhau. Thay vào đó em dùng chú ý chéo có cổng, tức cơ chế cho mỗi vị trí trên ảnh tự hỏi xem dấu vết tần số nào là liên quan tại vùng của nó. Cụ thể, đặc trưng không gian F dưới s đóng vai trò truy vấn, ký hiệu Q, còn mô tả tần số block-DCT đóng vai trò khoá và giá trị, ký hiệu K và V. Theo Công thức 2.4, mỗi vị trí không gian tính trọng số chú ý bằng softmax của Q nhân K chuyển vị chia cho căn của số chiều khoá, rồi lấy V theo trọng số đó để thu về một bản tóm tắt tần số có trọng số, gọi là context. Như vậy việc hợp nhất là chọn lọc theo không gian, mỗi vùng mặt rút ra đúng phần tần số phù hợp với nó, chứ không phải gộp đều một cách thô.

Tiếp theo là phần cốt lõi của slide, cách context đi vào dòng không gian. Theo Công thức 2.5, đặc trưng hợp nhất bằng F dưới s cộng alpha nhân context, trong đó alpha là một cổng vô hướng được khởi tạo bằng 0. Đây là chi tiết mang tính chịu lực. Tại bước đầu tiên alpha bằng 0, nên đặc trưng hợp nhất đúng bằng F dưới s, nghĩa là mô hình lúc đó đúng bằng xương sống EfficientNet-B4, không hơn không kém. Cổng chỉ mở ra ở những nơi mà bối cảnh tần số thực sự làm giảm hàm mất mát khi huấn luyện. Nếu tần số nhiễu hoặc vô dụng tại một kênh thì gradient kéo alpha về lại gần 0. Em xin nhấn rằng em trình bày khởi tạo bằng 0 như một lựa chọn thiết kế để hợp nhất an toàn, chứ không phải để tuyên bố nó làm mô hình tốt hơn.

Điểm thứ hai cũng quan trọng không kém. Vì cổng bắt đầu từ 0 và chỉ mở khi có lợi, giá trị alpha học được trở thành một đồng hồ đo trực tiếp xem nhánh tần số đóng góp bao nhiêu. Em mời hội đồng nhìn vào hình. Sau huấn luyện, trên 1792 kênh, trung bình của alpha là cộng 0.0000, độ lệch chuẩn là 0.0013, và giá trị tuyệt đối lớn nhất của alpha chỉ là 0.0232. Phần lớn các kênh vẫn nằm gần 0, chỉ một phần nhỏ mở ra đáng kể. Nói cách khác, cổng mở có chọn lọc và mở nhỏ. Điều này nhất quán với một sự thật mà em báo cáo thẳng thắn, là mức cải thiện đo được nhỏ và nằm trong dao động giữa các lần chạy ở một hạt giống ngẫu nhiên duy nhất. Em không xem đây là điểm yếu phải che giấu mà xem việc cổng tự đo và tự nói lên mức đóng góp nhỏ là một biểu hiện của tính trung thực.

Tóm lại, hai nhánh hợp nhất bằng chú ý chéo có cổng, không gian truy vấn tần số theo từng vùng qua Công thức 2.4, và một cổng khởi tạo bằng 0 trong Công thức 2.5 vừa giúp hợp nhất an toàn vừa làm đồng hồ đo mức đóng góp.

**Hội đồng có thể hỏi:**
- Q: Vì sao đặc trưng không gian làm truy vấn còn tần số làm khoá và giá trị, mà không làm ngược lại? — A: Đặt không gian làm truy vấn để dòng không gian giữ vai trò tín hiệu chính và chủ động đi hỏi xem tại vùng của nó có dấu vết tần số nào đáng dùng, rồi rút về một bản tóm tắt tần số có trọng số. Kết quả tần số được cộng thêm vào không gian qua cổng dư, nên không gian không bị tần số thay thế, mà chỉ được bổ sung ở nơi có ích.
- Q: Khởi tạo cổng bằng 0 có khác gì việc khởi tạo trọng số nhỏ ngẫu nhiên? — A: Khác ở chỗ tại bước đầu đặc trưng hợp nhất đúng bằng đặc trưng không gian, nên mô hình khởi đầu đúng bằng xương sống, và nhánh tần số chỉ được cộng thêm khi nó thực sự làm giảm hàm mất mát. Ngoài ra, vì cổng bắt đầu từ 0 nên giá trị alpha học được đọc được thẳng như một đồng hồ đo mức đóng góp.
- Q: Nếu cổng đa số vẫn gần 0 sau huấn luyện thì nhánh tần số có thật sự đóng góp gì không? — A: Có, nhưng đóng góp nhỏ và có chọn lọc. Trên 1792 kênh, giá trị tuyệt đối lớn nhất chỉ 0.0232. Việc một phần nhỏ kênh mở ra là bằng chứng trực tiếp rằng mô hình đã học để dùng nhánh tần số ở những nơi nó giảm được mất mát. Em báo cáo trung thực rằng mức cải thiện tổng thể là nhỏ.
- Q: Giá trị alpha nhỏ như vậy có chứng minh được ý nghĩa thống kê của cải thiện không? — A: Không, và em không khẳng định điều đó. Phân bố alpha là một phép đo định tính cho thấy cổng mở có chọn lọc và mở nhỏ. Để khẳng định ý nghĩa thống kê cần nhiều hạt giống, mà ở một hạt giống duy nhất mọi khoảng tin cậy ghép cặp đều chứa số không.

**Tránh:**
- Không mở đầu bằng tiêu đề bảo đảm sàn hay floor guarantee, và không nói cổng khởi tạo bằng 0 làm mô hình tốt hơn. Phải trình bày nó như lựa chọn hợp nhất an toàn và như đồng hồ đo đóng góp.
- Không nói nhánh tần số làm tăng AUC một cách chắc chắn hay đáng kể.
- Không gọi đây là hợp nhất bằng dán phẳng đặc trưng, phải nói rõ là chú ý chéo, không gian làm truy vấn, tần số làm khoá và giá trị.
- Không phát biểu sai con số đo được của cổng, chỉ dùng channels 1792, mean +0.0000, std 0.0013, max trị tuyệt đối alpha 0.0232.
- Không nhầm Công thức 2.4 với 2.5.

---

## Slide 6 — SFDCT-HFF: The Strongest Variant, and Its Reuse for Liveness
> Chủ điểm 2 Phương pháp (4/4). High-focus slide, target 3 min.

**On-slide (English):**
- Same B4 backbone, same zero-init gate; only frequency representation changes
- Zero the lowest DCT bands, inverse-transform to a high-pass residual image
- Multi-scale conv stream reads the residual; residual-guided attention steers the spatial branch
- Differs from SFDCT only in carrier, so any gap is attributable to representation
- Liveness reuses the same design: B4 baseline vs B4+block-DCT, no new frequency design
- Liveness runs first as a pre-filter; a spoof or uncertain verdict stops the request

**Figure:** `fig_arch_sfdct_hff.png` — Figure 2.8: The SFDCT-HFF variant. The lowest DCT bands are zeroed and inverse-transformed into a high-pass residual image; a multi-scale Conv-BN-ReLU stream extracts its features; a residual-guided attention map steers the spatial stream; the result enters the identical zero-initialised gate.
- Chỉ tay: Ô RGB face 256x256 bên trái, một bản cắt khuôn mặt đã căn chỉnh được đưa vào hai nhánh song song, giống hệt SFDCT gốc.
- Chỉ tay: Nhánh trên EfficientNet-B4, nói đây vẫn là đúng xương sống không gian cũ.
- Chỉ tay: Khối Block-DCT high-pass màu tím, nhấn dòng keep mid/high bands, inverse DCT, residual, đây là điểm khác duy nhất so với SFDCT, làm ảnh phần dư tần số cao thay cho thống kê theo băng.
- Chỉ tay: Ô HF residual image, ảnh phần dư mà ở đó dấu vết tần số cao trội lên.
- Chỉ tay: Khối HF-Stream 5 lớp Conv-BN-ReLU, một dòng tích chập đa tỉ lệ đọc ảnh phần dư này.
- Chỉ tay: Khối RSAttention, bản đồ chú ý này chỉ cho nhánh không gian biết vùng nào bằng chứng tần số cao mạnh nhất.
- Chỉ tay: Khối HFF gate ngoài cùng bên phải, nhấn đây là đúng cổng khởi tạo bằng không như SFDCT.

**Secondary figure (optional):** `fig_2_4_activity_ekyc.png` — Cho thấy phần liveness tái dùng trong ngữ cảnh chuỗi eKYC, kiểm tra liveness chạy trước, một phán quyết giả mạo thì từ chối còn một phán quyết không chắc chắn thì yêu cầu người dùng thử lại, cả hai đều dừng yêu cầu trước khi tốn bất kỳ tính toán deepfake nào. Hình minh hoạ vai trò bộ lọc chặn trước mà không cần trích con số AUC hay ACER.

**Key message (1 câu):** Biến thể mạnh nhất, SFDCT-HFF, chỉ thay cách mang thông tin tần số từ thống kê theo băng sang ảnh phần dư cao tần, giữ nguyên xương sống và cổng khởi tạo bằng không, nên mọi khác biệt đo được là do cách biểu diễn tần số chứ không do thứ gì khác, và đúng thiết kế này được tái dùng cho liveness như một bộ lọc chặn trước.

**Speaker script (đọc gần như nguyên văn):**
Kính thưa hội đồng, slide này em trình bày biến thể mạnh nhất của phương pháp, và cách em tái dùng đúng thiết kế đó cho phần liveness, tức kiểm tra sự sống của khuôn mặt. Em xin nói rõ ngay từ đầu, slide này chỉ bàn về kiến trúc, các con số AUC và ACER thuộc về phần kết quả ở các slide sau.

Trước hết là biến thể mạnh nhất, em gọi là SFDCT-HFF. Điểm cốt lõi là nó giữ nguyên hai thứ so với SFDCT gốc, giữ nguyên xương sống EfficientNet-B4 và giữ nguyên cổng hợp nhất khởi tạo bằng không, tức cổng bắt đầu ở trạng thái đóng. Cái duy nhất thay đổi là cách mang thông tin tần số. SFDCT gốc mô tả tần số bằng thống kê theo từng băng, còn HFF mô tả tần số bằng một ảnh phần dư cao tần, tức một ảnh chỉ còn lại các chi tiết thay đổi nhanh.

Em chỉ vào sơ đồ. Bản cắt khuôn mặt đi vào hai nhánh song song. Nhánh trên vẫn là EfficientNet-B4 cũ, cho ra bản đồ đặc trưng không gian. Nhánh dưới là điểm khác. Ở khối Block-DCT high-pass màu tím, em làm như sau. Em đưa ảnh về miền tần số bằng phép biến đổi cosine rời rạc, rồi em xóa các băng tần số thấp nhất, là phần mang nội dung khuôn mặt. Sau đó em biến đổi ngược trở lại miền ảnh. Kết quả là một ảnh phần dư, ở đó các dấu vết tần số cao trội hẳn lên. Một dòng tích chập đa tỉ lệ, là khối HF-Stream năm lớp, đọc ảnh phần dư này. Tiếp theo, khối RSAttention sinh ra một bản đồ chú ý có dẫn hướng bởi phần dư, tức nó chỉ cho nhánh không gian biết vùng nào trên khuôn mặt có bằng chứng tần số cao mạnh nhất. Cuối cùng, kết quả đi vào đúng cổng khởi tạo bằng không như cũ.

Em xin nhấn một điểm về tính nghiêm túc của thí nghiệm. Vì HFF chỉ khác SFDCT ở cách mang thông tin tần số, còn xương sống, hàm mất mát và cổng đều giữ nguyên, nên bất kỳ khác biệt nào đo được đều quy về cách biểu diễn tần số, chứ không lẫn với một xương sống khác hay một cổng khác. Đây là một phép so sánh có kiểm soát.

Phần thứ hai là tái dùng cho liveness. Liveness là module phụ. Em không thiết kế tần số mới nào cho nó. Đầu liveness so sánh đúng hai cấu hình như bên deepfake, một nền chỉ có không gian là EfficientNet-B4, và một đề xuất là B4 cộng nhánh block-DCT trên cùng xương sống đó. Vì cổng bắt đầu đóng, đề xuất khởi đầu bằng đúng nền. Cơ sở vật lý là, tấn công phát lại qua màn hình và tấn công in ấn để lại các vết tái thu và vết chấm in rất mờ trong điểm ảnh nhưng nhìn thấy được trong miền tần số. Về vai trò, liveness chạy đầu tiên như một bộ lọc chặn trước, một phán quyết giả mạo hay không chắc chắn đều dừng yêu cầu trước khi tốn bất kỳ tính toán deepfake nào. Em xin dừng ở kiến trúc, con số cụ thể em trình bày ở phần kết quả.

**Hội đồng có thể hỏi:**
- Q: SFDCT-HFF khác SFDCT gốc ở chỗ nào, và vì sao khác biệt đo được lại quy được về đúng cách biểu diễn tần số? — A: Hai biến thể giữ nguyên xương sống, cổng khởi tạo bằng không và hàm mất mát. Khác biệt duy nhất là cách mang thông tin tần số, SFDCT gốc dùng thống kê theo băng, còn HFF xóa các băng thấp nhất, biến đổi ngược thành ảnh phần dư cao tần. Vì chỉ có một biến thay đổi, đây là phép so sánh có kiểm soát.
- Q: Vì sao liveness lại tái dùng đúng nhánh deepfake mà không thiết kế riêng, và đặt nó chạy trước có lợi gì? — A: Liveness là module phụ, nên em cố ý không thêm thiết kế tần số mới. Đầu liveness dùng đúng bản cắt MTCNN, đúng xương sống B4, đúng nhánh block-DCT và đúng cổng hợp nhất của deepfake, chỉ đổi đích phân loại sang sống hay giả mạo. Đặt liveness chạy trước giúp một phán quyết giả mạo dừng yêu cầu trước khi tốn tính toán deepfake, vừa tiết kiệm vừa tăng an toàn.
- Q: Cơ sở vật lý nào cho thấy tần số giúp được phần liveness, và nó có giúp đều cho mọi loại tấn công không? — A: Tấn công phát lại để lại các đỉnh tái thu, còn tấn công in để lại hoa văn chấm, cả hai mờ trong điểm ảnh nhưng nhìn thấy được trong miền tần số. Em trình bày trung thực một điểm dè dặt, các đỉnh tái thu mạnh nhất với tấn công phát lại, nên nhánh tần số có thể giúp phát lại nhiều hơn in.
- Q: Vì sao xóa các băng tần số thấp nhất rồi mới biến đổi ngược, có mất thông tin không? — A: Các băng thấp nhất chủ yếu mang nội dung khuôn mặt chứ không mang dấu vết làm giả, nên xóa chúng làm ảnh phần dư nổi bật phần cao tần. Việc này không làm mất tín hiệu phân biệt vì nhánh không gian B4 vẫn đọc toàn bộ nội dung điểm ảnh song song.

**Tránh:**
- Không nói SFDCT-HFF chắc chắn tốt hơn hay tăng AUC đáng kể, lợi ích là nhỏ, và con số thuộc slide kết quả.
- Không nêu bất kỳ con số AUC hay ACER liveness nào trên slide này, đây là slide kiến trúc.
- Không gọi đây là phương pháp tốt nhất hay vượt SOTA.
- Không nói nhánh tần số của liveness là thiết kế mới, phải nhấn rõ nó tái dùng nguyên xi block-DCT của deepfake.
- Không khẳng định nhánh tần số giúp đều cho mọi loại tấn công, phải nêu dè dặt rằng tái thu giúp phát lại nhiều hơn in.

---

## Slide 7 — Cross-Dataset Protocol: The Real Test of Generalisation
> Chủ điểm 3 Kết quả (1/2). High-focus slide, target 3 min.

**On-slide (English):**
- Train: FaceForensics++ (1000 real, 4 forgery methods) only
- Test: Celeb-DF-v2 (590 real, 5639 fake) never seen in training
- 32 frames/video, sampled evenly along each video, fixed for every config
- Metric: frame-level AUC (threshold-free, ratio-independent), DeepfakeBench
- Both datasets skew toward fake (train roughly 1 real to 4 fake)
- Control: baseline B4 reaches 0.7497 vs published 0.7487

**Figure:** `fig_3_1_distribution.png` — Distribution of real and fake frame counts for the training set (FaceForensics++) and the test set (Celeb-DF-v2), showing the fake-leaning skew that motivates AUC as the main metric.
- Chỉ tay: Cột train so với cột test, train hoàn toàn là FaceForensics++, test hoàn toàn là Celeb-DF-v2, không có bộ nào dùng chung.
- Chỉ tay: Phần real (thật) thấp hơn phần fake (giả) ở cả hai bên, cho thấy dữ liệu lệch về lớp giả.
- Chỉ tay: Tỉ lệ khoảng một thật trên bốn giả ở tập huấn luyện, lý do chọn AUC thay vì độ chính xác thô.
- Chỉ tay: Mỗi video lấy 32 khung hình cách đều theo chiều dài, con số này giữ cố định cho mọi cấu hình để so sánh công bằng.

**Secondary figure (optional):** `fig_3_2_2_celeb_realfake.png` — Cho thấy một cặp thật và giả của Celeb-DF-v2 kèm phổ tần số, làm rõ rằng bản giả ở tập kiểm thử có chất lượng cao và tinh vi, nên phép thử cross-dataset thực sự khó.

**Key message (1 câu):** Mô hình huấn luyện hoàn toàn trên FaceForensics++ và chỉ kiểm thử trên Celeb-DF-v2 chưa từng thấy, nên con số AUC là phép đo khả năng tổng quát hoá thật cho eKYC, và việc baseline tái lập đúng 0.7497 so với 0.7487 chứng minh khung đo được dựng đúng để mọi cải tiến sau này đáng tin.

**Speaker script (đọc gần như nguyên văn):**
Kính thưa hội đồng, đây là slide nền tảng cho toàn bộ phần kết quả, vì nó định nghĩa phép đo mà mọi con số sau này dựa vào.

Giao thức đánh giá ở đây là cross-dataset, nghĩa là huấn luyện trên một bộ dữ liệu và kiểm thử trên một bộ hoàn toàn khác. Mô hình được huấn luyện toàn bộ trên FaceForensics++, gồm 1000 video thật và bốn phương pháp làm giả sinh ra từ chúng. Mô hình chỉ được kiểm thử trên Celeb-DF-v2, gồm 590 video thật và 5639 video deepfake chất lượng cao, và bộ này không bao giờ xuất hiện trong huấn luyện. Đây là cách chuẩn để đo khả năng tổng quát hoá, vì nếu một mô hình chỉ học thuộc dấu vết của tập huấn luyện thì nó sẽ thất bại trên các bản giả tinh vi mà nó chưa từng thấy.

Lựa chọn này phản ánh đúng tình huống eKYC thực tế. Trong định danh điện tử, kẻ tấn công luôn dùng kiểu deepfake và khuôn mặt mới mà mô hình chưa gặp, nên con số thu được là một thước đo tổng quát hoá. Mỗi video được lấy 32 khung hình cách đều theo chiều dài, một con số giữ cố định cho mọi cấu hình để so sánh công bằng. Tất cả khung hình đều qua cùng một pipeline cắt và căn chỉnh khuôn mặt.

Về chỉ số chính, em dùng AUC ở mức khung hình, tức là diện tích dưới đường ROC. AUC là xác suất một mẫu giả được mô hình chấm điểm cao hơn một mẫu thật lấy ngẫu nhiên. Em chọn AUC vì hai lý do. Thứ nhất, nó độc lập ngưỡng, và không phụ thuộc vào tỉ lệ giữa hai lớp. Như biểu đồ phân bố cho thấy, cả hai bộ dữ liệu đều lệch về lớp giả, tập huấn luyện ở mức khoảng một thật trên bốn giả còn tập kiểm thử lệch mạnh hơn. Với dữ liệu lệch như vậy, độ chính xác thô sẽ gây hiểu nhầm, nên AUC là chỉ số trung thực hơn. Thứ hai, AUC là chỉ số chuẩn của giao thức DeepfakeBench công khai, nên con số của em so sánh trực tiếp được với các phương pháp đã công bố.

Cuối cùng là điểm em muốn hội đồng ghi nhớ nhất. Trước khi tin vào bất kỳ cải tiến nào, em đặt một mỏ neo kiểm soát tính đúng đắn. Mô hình nền EfficientNet-B4 thuần không gian đạt AUC mức khung là 0.7497, gần như trùng khít với giá trị chuẩn đã công bố cho cùng backbone là 0.7487, chênh khoảng 0.001. Sự trùng khớp này xác nhận khung đo của em được dựng đúng. Nhờ đó, mọi thay đổi điểm số về sau có thể quy cho thiết kế của mô hình, chứ không phải do cấu hình sai.

**Hội đồng có thể hỏi:**
- Q: Vì sao dùng cross-dataset thay vì chia train/test trên cùng một bộ dữ liệu cho dễ? — A: Chia trên cùng một bộ chỉ đo điểm trong phân phối, dễ bị thổi phồng do mô hình học thuộc dấu vết riêng của bộ đó. Cross-dataset ép mô hình đối mặt kiểu deepfake và khuôn mặt mới, đúng tình huống eKYC khi kẻ tấn công luôn dùng công cụ mới.
- Q: Tại sao chọn AUC mà không phải độ chính xác hay F1? — A: Cả hai bộ đều lệch mạnh về lớp giả. Với dữ liệu lệch, độ chính xác thô gây hiểu nhầm vì có thể cao chỉ nhờ đoán theo lớp đa số. AUC độc lập ngưỡng và không phụ thuộc tỉ lệ lớp, lại là chỉ số chuẩn của DeepfakeBench.
- Q: Mỏ neo 0.7497 so với 0.7487 thực sự kiểm soát được điều gì? — A: Nó kiểm soát tính đúng đắn của khung đo. Khi pipeline của em tái lập lại đúng 0.7497 trên cùng giao thức, điều đó cho thấy bước tải dữ liệu, tiền xử lý, lấy khung và đánh giá đều đặt đúng. Nó không chứng minh mô hình tốt, chỉ chứng minh khung đo đáng tin.
- Q: Chỉ lấy 32 khung mỗi video có làm mất thông tin không? — A: Phương pháp của em là mô hình ở mức khung hình, không mô hình hoá thời gian, nên chỉ cần một tập đại diện phủ tư thế, biểu cảm và ánh sáng là đủ. Con số này giữ cố định cho mọi cấu hình nên so sánh giữa các mô hình vẫn công bằng.

**Tránh:**
- Không nói baseline 0.7497 chứng minh mô hình tốt, nó chỉ chứng minh khung đo dựng đúng.
- Không gọi đây là kết quả state-of-the-art, slide này chỉ định nghĩa giao thức.
- Không bịa tổng số khung hình, báo cáo không nêu con số tổng khung cho hai tập, chỉ nói 32 khung mỗi video.
- Không bịa thêm con số ngoài báo cáo, chỉ dùng 1000 thật, 590 thật, 5639 giả, 32 khung, 0.7497 và 0.7487.
- Không khẳng định có AUC trong phân phối khoảng 0.95 đến 0.97, báo cáo không chứa con số đó.

---

## Slide 8 — Cross-Dataset Results and an Honest Reading
> Chủ điểm 3 Kết quả (2/2). High-focus slide, target 3 min.

**On-slide (English):**
- Baseline B4 0.7497 matches published 0.7487: pipeline is correct
- Frame AUC: B4 0.7497 < SFDCT 0.7572 < SFDCT-HFF full 0.7695
- Order follows hypothesis; floor property holds at frame level for every variant
- Mean-over-run sits well below best: best-on-test is optimistic
- Video bootstrap (518 clips): every paired CI contains zero
- A published phase-based frequency method scores 0.7650, above naive SFDCT, so no state-of-the-art claim

**Figure:** `fig_3_7_roc.png` — ROC curves on the FF++ to Celeb-DF-v2 cross-dataset test, with the 5% false-positive line marked; baseline B4 versus the SFDCT family.
- Chỉ tay: Đường ROC của ba mô hình gần như chồng lên nhau, cho thấy khoảng cách giữa chúng rất nhỏ.
- Chỉ tay: Đường thẳng đứng đánh dấu mức 5 phần trăm báo động giả, tức ngưỡng eKYC mà thông tư yêu cầu.
- Chỉ tay: Vùng dưới mỗi đường cong chính là AUC, đường HFF nằm hơi cao hơn baseline một chút.
- Chỉ tay: Khu vực phía bên trái sát trục tung, nơi tỉ lệ báo động giả thấp, là vùng quan trọng nhất cho eKYC.

**Secondary figure (optional):** `fig_3_8_pr_curve.png` — Precision-recall trên tập mất cân bằng cho thấy vì sao điểm số quanh 0.76 nghĩa là phần lớn deepfake bị bỏ sót, củng cố thông điệp trung thực rằng mô hình là lớp sàng lọc chứ không phải cổng chặn tuyệt đối.

**Key message (1 câu):** Thứ tự kết quả đúng như giả thuyết là nhánh tần số có ích, nhưng tại một hạt giống ngẫu nhiên duy nhất, mọi khoảng tin cậy ghép cặp đều chứa số không, nên đây là một cải thiện nhỏ trung thực chứ không phải tuyên bố vượt trội.

**Speaker script (đọc gần như nguyên văn):**
Đây là slide kết quả chính, em xin trình bày kỹ vì nó quyết định toàn bộ luận điểm của khóa luận. Trước hết là độ tin cậy của quy trình. Mô hình nền EfficientNet-B4 chỉ dùng miền không gian đạt AUC mức khung hình là 0.7497. AUC, tức xác suất một mẫu giả bị chấm điểm cao hơn một mẫu thật, ở mức công bố chuẩn cho cùng kiến trúc này là 0.7487. Hai con số lệch nhau khoảng 0.001, nghĩa là đường ống huấn luyện và đánh giá của em được dựng đúng, và 0.7497 chính là mức sàn miền không gian mà các biến thể tần số phải vượt qua.

Tiếp theo là phần xác nhận giả thuyết. SFDCT, tức mô hình gắn thêm nhánh tần số block-DCT lên trên mô hình nền, đạt 0.7572. Biến thể cải tiến SFDCT-HFF bản đầy đủ, thay biểu diễn tần số bằng ảnh thông cao, đạt 0.7695, cao nhất trong họ và cao hơn cả mô hình nền lẫn mô hình cơ sở. Như vậy thứ tự 0.7497 nhỏ hơn 0.7572 nhỏ hơn 0.7695 đúng theo giả thuyết rằng thông tin tần số có ích. Quan trọng là tính chất sàn được giữ ở mức khung hình, do cổng hợp nhất khởi tạo bằng không nên gắn thêm nhánh không kéo tụt hiệu năng xuống dưới baseline.

Bây giờ là phần đọc kết quả một cách trung thực, vì đây là điểm em muốn nhấn mạnh như một thế mạnh về liêm chính khoa học. Thứ nhất, cột trung bình theo cả lần chạy nằm thấp hơn hẳn cột tốt nhất ở mọi mô hình. Điều đó nhắc rằng việc chọn điểm kiểm tra tốt nhất ngay trên tập kiểm thử là lạc quan, nên em báo cáo cả hai cột. Thứ hai, ở mức video, em chạy bootstrap, tức lấy mẫu lại có hoàn lại để ước lượng khoảng tin cậy, trên 518 video kiểm thử, lặp lại hai nghìn lần, để có khoảng tin cậy 95 phần trăm. Kết quả là mọi khoảng chênh lệch ghép cặp so với baseline đều chứa số không. Nghĩa là không biến thể nào tách khỏi baseline một cách có ý nghĩa thống kê tại một hạt giống ngẫu nhiên duy nhất, và bản thông cao đầy đủ chỉ là biến thể duy nhất có chênh lệch trung tâm dương, cộng 0.007. Thứ ba, một phương pháp tần số dựa trên pha đã công bố đạt 0.7650, vẫn cao hơn SFDCT nguyên bản, nên em không đưa ra bất kỳ tuyên bố vượt trội nào.

Tóm lại, thứ tự đúng giả thuyết, tính chất sàn được giữ ở mức khung hình, nhưng các mức tăng nằm trong nhiễu chạy lại, chỉ một hạt giống, và không phải trạng thái tốt nhất hiện có.

**Hội đồng có thể hỏi:**
- Q: Tại sao mức tăng cross-dataset lại nhỏ như vậy, có đáng để gọi là đóng góp không? — A: Đánh giá chéo tập dữ liệu vốn rất khó vì kiểu giả mạo và phân phối khuôn mặt khác hẳn, nên điểm số quanh 0.76 đã phản ánh giới hạn này. Đóng góp không nằm ở con số kỷ lục mà ở ba điểm: thứ tự kết quả khớp giả thuyết, tính chất sàn được bảo đảm theo thiết kế, và cách đánh giá trung thực có khoảng tin cậy bootstrap.
- Q: Con số 0.7695 có đáng tin không khi đường cong theo epoch chỉ đạt đỉnh 0.7551? — A: 0.7695 là điểm kiểm tra tốt nhất được khung huấn luyện lưu lại trong các lần đánh giá hai lần mỗi epoch, và em đã xác minh trực tiếp từ tệp checkpoint. Giá trị này rơi vào giữa hai mốc epoch nên không trùng với điểm nào vẽ trên đường cong. Còn 0.7551 là đỉnh của các điểm cuối epoch khôi phục được từ log.
- Q: Nếu mọi khoảng tin cậy đều chứa số không thì làm sao biện minh việc dùng biến thể tần số? — A: Đúng là tại một hạt giống ngẫu nhiên không có khác biệt có ý nghĩa thống kê, em đã nêu rõ điều đó. Lý do vẫn dùng biến thể tần số là tính chất sàn ở mức khung hình, vì cổng hợp nhất khởi tạo bằng không, gắn nhánh tần số không bao giờ làm tệ hơn baseline lúc khởi tạo. Để khẳng định ý nghĩa thống kê cần nhiều hạt giống hơn.
- Q: Với điểm số quanh 0.76 thì mô hình dùng được trong eKYC thực tế không? — A: Ở ngưỡng giữ tỉ lệ báo động giả tại 5 phần trăm, mô hình chỉ bắt được khoảng 23 phần trăm deepfake. Vì thế em không định vị nó là cổng chặn tự động mà là một lớp sàng lọc rủi ro có giải thích, đầu ra chỉ là một tín hiệu đưa vào quyết định có thể xem xét lại.

**Tránh:**
- Không nói SFDCT-HFF vượt trội hay đạt SOTA, vì một phương pháp tần số dựa trên pha đã công bố đạt 0.7650 vẫn cao hơn SFDCT nguyên bản.
- Không gọi phương pháp tần số dựa trên pha bằng tên viết tắt cụ thể, báo cáo chỉ trích dẫn nó ẩn danh.
- Không tuyên bố mức tăng là có ý nghĩa thống kê, phải nói rõ chỉ một hạt giống duy nhất.
- Không trộn lẫn con số tốt nhất 0.7695 với đỉnh đường cong 0.7551.
- Không nói tính chất sàn đúng ở mọi mức tổng hợp, phải nói rõ nó là bảo đảm ở mức khung hình, vì ở mức video vài biến thể nằm dưới baseline.

---

## Slide 9 — Conclusion and Contributions: An Honest, Floor-Safe eKYC Deepfake Detector
> Chủ điểm 4 Kết luận (1/2). High-focus slide, target 3 min.

**On-slide (English):**
- Goal met: cross-dataset deepfake detector for banking eKYC, plus liveness groundwork
- Baseline B4 reproduces published number: frame AUC 0.7497 vs 0.7487
- SFDCT adds DCT branch (0.7572); SFDCT-HFF is best (0.7695)
- Zero-init gate gives a floor: model starts equal to the baseline
- Honest reading: gains sit inside single-seed noise, not state of the art
- Liveness AUC 0.98, ACER 6.85% on LCC-FASD; runs end to end on CPU

**Figure:** `screenshot_demo_image_detect.png` — End-to-end DeepGuard service: a single aligned face returns a fake probability, a real-or-fake verdict, latency, a Grad-CAM heat map and the DCT frequency spectrum, served on CPU.
- Chỉ tay: Chỉ vào vòng tròn xác suất giả 89 phần trăm bên phải, nói đây là đầu ra chính, một xác suất ảnh là giả.
- Chỉ tay: Chỉ vào dòng phán quyết và điểm Prob-Fake cùng CNN-Score, nói hệ thống trả về một phán quyết thật hay giả chứ không chỉ một con số thô.
- Chỉ tay: Chỉ vào bản đồ nhiệt Grad-CAM phủ lên khuôn mặt, nói đây là phần giải thích, cho cán bộ duyệt thấy mô hình nhìn vào vùng nào.
- Chỉ tay: Chỉ vào ô phổ tần số nhiều màu góc dưới phải, nói đây là biểu diễn miền tần số mà nhánh block-DCT đọc.
- Chỉ tay: Chỉ vào ô latency, nói toàn bộ chạy trên bộ xử lý không cần card đồ họa, khoảng một giây mỗi ảnh.

**Secondary figure (optional):** `fig_3_7_roc.png` — Nếu hội đồng muốn thấy lại bằng chứng định lượng, đường ROC cross-dataset của ba mô hình gần như chồng lên nhau trực quan hóa đúng thông điệp trung thực rằng khoảng cách giữa các biến thể là rất nhỏ.

**Key message (1 câu):** Khóa luận đã giao đúng mục tiêu, một mô hình phát hiện deepfake cho eKYC ngân hàng đo bằng giao thức cross-dataset, với baseline tái lập đúng số đã công bố, một cổng hợp nhất khởi tạo bằng không cho bảo đảm sàn, và một kết quả được đọc trung thực là cải thiện nhỏ nằm trong nhiễu một hạt giống chứ không phải tuyên bố vượt trội.

**Speaker script (đọc gần như nguyên văn):**
Kính thưa hội đồng, đây là slide kết luận, em xin tóm lại khóa luận đã làm được gì và các con số thực sự nói lên điều gì.

Trước hết là mục tiêu. Khóa luận đặt ra xây một mô hình phát hiện deepfake, tức ảnh khuôn mặt được tạo hoặc tráo bằng trí tuệ nhân tạo, phục vụ bước định danh điện tử eKYC khi mở tài khoản và duyệt giao dịch trong ngân hàng, kèm phần nền móng cho một lớp liveness. Mục tiêu đó đã đạt. Điểm em muốn hội đồng ghi nhớ là con số có ý nghĩa là con số cross-dataset, tức huấn luyện trên một bộ dữ liệu và kiểm thử trên một bộ hoàn toàn khác, vì trong thực tế kẻ tấn công không bao giờ dùng lại đúng các bản giả có trong tập huấn luyện.

Về phương pháp, mô hình đề xuất tên SFDCT ghép một nhánh tần số block-DCT, tức nhánh đọc ảnh theo cách độ sáng thay đổi nhanh hay chậm theo từng khối, vào một xương sống tích chập, thông qua một cổng khởi tạo ở trạng thái đóng. Nhờ cổng đóng lúc đầu, mô hình khởi điểm giống hệt mô hình nền, và nhánh tần số chỉ giành được ảnh hưởng khi nó làm giảm hàm mất mát. Điều này cho một bảo đảm sàn, nghĩa là gắn thêm nhánh không kéo hiệu năng xuống dưới nền, một tính chất hữu ích trong ngân hàng, khác với một mô hình liên quan có cổng mở sẵn một nửa.

Về kết quả, dưới giao thức chuẩn, mô hình nền đạt AUC mức khung hình là 0.7497 trên Celeb-DF-v2. Con số 0.7497 gần như trùng với giá trị đã công bố cho cùng xương sống là 0.7487, nên đường ống của em được dựng đúng và mọi cải tiến không phải đo trên một nền yếu. Nhánh tần số nâng điểm lên 0.7572, và biến thể thông cao SFDCT-HFF lên 0.7695, cao nhất trong họ và là biến thể duy nhất có chênh lệch ghép cặp dương ở mức video. Hướng kết quả khớp với giả thuyết hai miền, nhưng em xin nói thẳng, các mức tăng nằm trong dải nhiễu của một hạt giống ngẫu nhiên duy nhất, nên đây không phải tuyên bố vượt trội.

Về phần liveness bổ trợ, mô-đun đạt AUC khoảng 0.98 với ACER, tức sai số trung bình giữa bỏ sót giả mạo và từ chối nhầm người thật, là 6.85 phần trăm trên bộ LCC-FASD, và ở đây nhánh tần số không cho cải thiện đo được.

Cuối cùng, em chỉ vào ảnh chụp hệ thống. Toàn bộ chạy từ đầu đến cuối trên bộ xử lý không cần card đồ họa, khoảng một giây mỗi ảnh, trả về một xác suất giả, một phán quyết, và một bản đồ nhiệt Grad-CAM giải thích mô hình nhìn vào đâu. Đóng góp của em nằm ở ba điểm, cổng khởi tạo bằng không cho bảo đảm sàn, cách đánh giá trung thực có kiểm soát baseline và khoảng tin cậy, và một hệ thống có giải thích chạy được trên CPU.

**Hội đồng có thể hỏi:**
- Q: Nếu mọi mức tăng đều nằm trong nhiễu một hạt giống, vậy đâu là đóng góp thực sự? — A: Đóng góp không nằm ở con số kỷ lục mà ở ba điểm có thể kiểm chứng. Thứ nhất, cổng hợp nhất khởi tạo bằng không cho một bảo đảm sàn. Thứ hai, cách đánh giá trung thực, baseline tái lập đúng số công bố, có khoảng tin cậy bootstrap và em báo cáo cả việc các khoảng đều chứa số không. Thứ ba, một hệ thống có giải thích chạy đầu cuối trên CPU.
- Q: Với AUC quanh 0.76, mô hình có dùng được trong eKYC thực tế không? — A: Em định vị nó là một lớp sàng lọc rủi ro có giải thích, không phải cổng chặn tự động. Ở ngưỡng giữ tỉ lệ báo động giả tối đa 5 phần trăm, mô hình vẫn bỏ sót phần lớn deepfake, nên đầu ra chỉ là một tín hiệu đưa vào quyết định có thể xem xét lại, kèm bản đồ nhiệt Grad-CAM phục vụ cán bộ duyệt.
- Q: Liveness đạt AUC 0.98 cao hơn hẳn deepfake 0.77, vậy chỉ cần liveness là đủ phải không? — A: Hai bài toán đo trên hai thiết lập khác nhau và chống hai loại tấn công khác nhau. Liveness 0.98 đo trong một bộ dữ liệu duy nhất là LCC-FASD, chưa kiểm tra chéo bộ. Quan trọng hơn, liveness chống tấn công trình diễn như ảnh in và phát lại, còn deepfake chống khuôn mặt tổng hợp đưa thẳng vào luồng. Hai lớp bổ sung cho nhau, không thay thế nhau.
- Q: Tại sao cổng khởi tạo đóng lại tốt hơn một mô hình có cổng mở sẵn một nửa? — A: Cổng khởi tạo bằng không làm mô hình lúc đầu đúng bằng xương sống đã được kiểm chứng, cho một bảo đảm sàn. Một cổng mở sẵn một nửa ép tín hiệu tần số vào ngay từ đầu, nên nếu nhánh đó nhiễu thì có thể kéo hiệu năng xuống dưới nền. Trong ngân hàng, việc không bao giờ tệ hơn baseline lúc khởi tạo là một tính chất an toàn đáng giá.

**Tránh:**
- Không gọi SFDCT-HFF là vượt trội hay đạt SOTA, một phương pháp tần số dựa trên pha đã công bố đạt 0.7650 vẫn cao hơn SFDCT nguyên bản và mọi khoảng tin cậy ghép cặp đều chứa số không.
- Không nói các mức tăng có ý nghĩa thống kê, phải nhấn chỉ một hạt giống ngẫu nhiên duy nhất.
- Không nói bảo đảm sàn đúng ở mọi mức tổng hợp, nó là bảo đảm ở mức khung hình, ở mức video vài biến thể nằm dưới baseline.
- Không trình bày AUC liveness 0.98 như thể so sánh trực tiếp được với deepfake, liveness chỉ đo trong một bộ dữ liệu duy nhất.
- Không nói mô hình là cổng chặn tự động cho eKYC, ở ngưỡng 5 phần trăm nó vẫn bỏ sót phần lớn deepfake.
- Không bịa con số ngoài báo cáo, chỉ dùng 0.7497, 0.7487, 0.7572, 0.7695, AUC liveness khoảng 0.98, ACER 6.85 phần trăm, khoảng một giây mỗi ảnh trên CPU.
- Không trình bày tính trung thực như một điểm yếu cần xin lỗi, đặt nó như một thế mạnh về liêm chính khoa học.

---

## Slide 10 — Limitations and Development Directions
> Chủ điểm 4 Kết luận (2/2). High-focus slide, target 2.5 min.

**On-slide (English):**
- Single run per configuration: no significance, every video-level interval contains zero
- Gains are modest and not state of the art
- Train and serving crops differ; robustness (re-compression, noise, resolution, adversarial) untested
- Liveness measured on one dataset; cascade still uses an interim challenge check
- No Vietnamese-face number yet (test-only probe, collection in progress); database design incomplete
- Next: multi-seed paired tests, fuse the trained liveness score, add self-blended training

**Figure:** none — text box (hai cột song song).
- Cột trái LIMITATIONS, 6 giới hạn đã đo: (1) một lần chạy mỗi cấu hình, mọi khoảng tin cậy ghép cặp ở mức video đều chứa số không; (2) cải thiện nhỏ và không phải state of the art; (3) train và serving cắt mặt khác nhau, độ bền vững chưa kiểm; (4) liveness chỉ đo trên một bộ, cascade vẫn dùng bước thách thức tạm thời; (5) chưa có con số trên mặt người Việt, tập kiểm thử đang thu thập; (6) thiết kế cơ sở dữ liệu chưa hoàn tất.
- Cột phải DEVELOPMENT DIRECTIONS, 5 hướng, mỗi hướng nối mũi tên sang đúng giới hạn nó khắc phục: (1) ghép tầng liveness đã đo vào hệ thống, hợp nhất điểm liveness học được với điểm rủi ro deepfake; (2) chạy nhiều hạt giống có kiểm định ghép cặp; (3) xây tập kiểm thử mặt người Việt và mở rộng đánh giá chéo tập gồm cả bản giả khuếch tán; (4) tích hợp trộn ảnh tự thân kết hợp nhánh tần số; (5) làm cứng hệ thống, thống nhất cắt mặt, đánh giá độ bền vững, hoàn tất cơ sở dữ liệu, lượng tử hóa tỉa nhánh chưng cất cho thiết bị biên.

**Secondary figure (optional):** `fig_2_4_activity_ekyc.png` — sơ đồ luồng cascade eKYC, dùng khi nói về hướng phát triển đầu tiên là ghép tầng liveness đã đo vào đây, cho hội đồng thấy đúng chỗ mà bộ chấm điểm đã huấn luyện sẽ thay bước thách thức tạm thời hiện tại.

**Key message (1 câu):** Em trình bày các giới hạn của khóa luận một cách thẳng thắn, mọi con số chỉ đến từ một lần chạy nên chưa có ý nghĩa thống kê và mọi khoảng tin cậy ở mức video đều chứa số không, từ đó các hướng phát triển bám đúng vào việc khắc phục từng giới hạn, trọng tâm là chạy nhiều hạt giống có kiểm định ghép cặp, ghép tầng liveness đã đo vào hệ thống, và đưa chiến lược huấn luyện trộn ảnh tự thân vào nhánh tần số.

**Speaker script (đọc gần như nguyên văn):**
Kính thưa hội đồng, ở slide này em xin trình bày các giới hạn của khóa luận và các hướng phát triển, và em xem việc nói thẳng những giới hạn này là một thế mạnh về liêm chính khoa học chứ không phải điểm yếu cần che giấu.

Trước hết là các giới hạn. Điểm đầu tiên và quan trọng nhất, mọi con số trong báo cáo chỉ đến từ một lần chạy cho mỗi cấu hình, tức một hạt giống ngẫu nhiên duy nhất, nên em không tuyên bố bất kỳ ý nghĩa thống kê nào. Ở mức video, mọi khoảng tin cậy ghép cặp so với mô hình nền đều chứa số không. Thứ hai, mức cải thiện là nhỏ và không phải trạng thái tốt nhất hiện có. Thứ ba, khâu huấn luyện và khâu phục vụ không cắt mặt giống hệt nhau, điều này có thể làm lệch điểm vận hành thực tế, tức ngưỡng cắt khi chạy thật, nên cần được sửa trước khi đưa vào sản xuất. Thứ tư, em chưa kiểm tra độ bền vững một cách hệ thống, bao gồm nén lại, nhiễu, thay đổi độ phân giải, và nhiễu đối kháng, tức nhiễu được cố ý tạo ra để đánh lừa mô hình.

Tiếp theo, về phần liveness, em chỉ đo trên một bộ dữ liệu duy nhất, hành vi của nó khi chuyển sang bộ dữ liệu khác thì chưa được kiểm tra, và tầng ghép hiện vẫn dùng một bước thách thức tạm thời chứ chưa phải bộ chấm điểm đã huấn luyện. Ngoài ra, hiện chưa có đánh giá nào trên khuôn mặt người Việt, bộ này được đặc tả là một tập chỉ dùng để kiểm thử, đang trong quá trình thu thập, và em không báo cáo bất kỳ con số nào trước khi nó được đo. Cuối cùng, thiết kế cơ sở dữ liệu của ứng dụng cũng chưa hoàn tất.

Từ chính các giới hạn này, em rút ra các hướng phát triển, mỗi hướng khắc phục đúng một giới hạn vừa nêu. Thứ nhất, đưa tầng liveness đã đo vào hệ thống ghép tầng, hợp nhất điểm số học được của nó với điểm rủi ro deepfake, và kiểm thử trên một tập thiên về tấn công phát lại. Thứ hai, chạy mỗi cấu hình qua nhiều hạt giống với một kiểm định ghép cặp, để xác định dứt khoát xem phần lợi của tần số có thật hay không. Thứ ba, xây dựng tập khuôn mặt người Việt chỉ dùng để kiểm thử, và mở rộng đánh giá chéo tập sang các bộ phủ nhiều kiểu làm giả và nhiều điều kiện thu hình hơn, bao gồm cả các bản giả dựa trên mô hình khuếch tán. Thứ tư, tích hợp chiến lược huấn luyện trộn ảnh tự thân, là kỹ thuật chéo tập mạnh nhất hiện có, kết hợp với nhánh tần số. Cuối cùng, làm cứng hệ thống bằng cách thống nhất cách cắt mặt giữa huấn luyện và phục vụ, đánh giá độ bền vững, hoàn tất thiết kế cơ sở dữ liệu, và áp dụng lượng tử hóa, tỉa nhánh, và chưng cất để chạy trên thiết bị biên và di động. Em xin hết phần này.

**Hội đồng có thể hỏi:**
- Q: Vì sao chỉ chạy một hạt giống nếu biết rằng điều đó khiến kết quả chưa có ý nghĩa thống kê? — A: Em ghi nhận đây là một giới hạn thẳng thắn. Mỗi cấu hình huấn luyện chéo tập tốn chi phí trên GPU thuê, nên trong phạm vi khóa luận em ưu tiên dựng đúng khung đo và kiểm soát tính đúng đắn bằng mỏ neo mô hình nền. Hướng phát triển đầu tiên về mặt khoa học chính là chạy mỗi cấu hình qua nhiều hạt giống với một kiểm định ghép cặp.
- Q: Việc train và serving không cắt mặt giống hệt nhau ảnh hưởng cụ thể như thế nào? — A: Nhánh tần số dựa trên thống kê theo dải của các khối tám nhân tám, nên nếu cùng một vùng mặt rơi vào các khối khác nhau do cách cắt lệch, thống kê theo dải sẽ thay đổi, và điều đó có thể làm lệch điểm vận hành thực tế. Em trình bày đây là một việc cần sửa trước khi đưa vào sản xuất, nằm trong nhóm làm cứng hệ thống.
- Q: Vì sao không có con số nào trên khuôn mặt người Việt, trong khi đề tài hướng tới eKYC ở Việt Nam? — A: Bộ khuôn mặt người Việt được em đặc tả là một tập chỉ dùng để kiểm thử, hiện đang trong quá trình thu thập. Em chủ trương không báo cáo bất kỳ con số nào trước khi nó thực sự được đo, vì một con số trên dữ liệu chưa hoàn chỉnh sẽ gây hiểu nhầm. Đây là một hướng phát triển rõ ràng.
- Q: Chiến lược trộn ảnh tự thân là gì, và vì sao kỳ vọng nó cải thiện kết quả chéo tập? — A: Đây là cách tạo mẫu giả huấn luyện bằng việc tự trộn hai biến thể của cùng một ảnh thật, nhờ đó mô hình học được ranh giới ghép tổng quát thay vì học thuộc dấu vết của một bộ làm giả cụ thể. Báo cáo của em xác định đây là kỹ thuật chéo tập mạnh nhất hiện có, và hướng phát triển là tích hợp nó kết hợp với nhánh tần số. Em chưa khẳng định mức cải thiện cụ thể vì chưa đo.

**Tránh:**
- Không nói các mức tăng là có ý nghĩa thống kê hay đã được xác nhận, phải nhấn rõ chỉ một hạt giống.
- Không tuyên bố phương pháp đạt hay sắp đạt trạng thái tốt nhất hiện có.
- Không phát biểu bất kỳ con số nào trên khuôn mặt người Việt, bộ này chỉ là tập kiểm thử đang thu thập.
- Không trình bày các hướng phát triển như đã hoàn thành hay đã có kết quả.
- Không nói tầng liveness hiện đã dùng bộ chấm điểm đã huấn luyện, hiện cascade vẫn dùng bước thách thức tạm thời.
- Không hứa rằng lượng tử hóa, tỉa nhánh, chưng cất sẽ giữ nguyên độ chính xác.

---

### Phân bổ thời gian 10 slide trọng tâm (~28 phút nếu trình bày hết)
- Chủ điểm 1 (S1–S2): ~5 phút
- Chủ điểm 2 phương pháp (S3–S6): ~12 phút
- Chủ điểm 3 kết quả (S7–S8): ~6 phút
- Chủ điểm 4 kết luận (S9–S10): ~5.5 phút

Nếu buổi bảo vệ chỉ ~15-20 phút, ưu tiên đọc kỹ S3 (kiến trúc), S5 (cổng hợp nhất), S8 (kết quả + trung thực), và S9 (kết luận), các slide còn lại trong nhóm trình bày gọn hơn. Các slide ngoài nhóm (nền lý thuyết, diagram hệ thống, screen, liveness chi tiết) chỉ lướt.
