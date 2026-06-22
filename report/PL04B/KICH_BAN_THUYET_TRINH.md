# KỊCH BẢN THUYẾT TRÌNH — BẢO VỆ ĐỒ ÁN TỐT NGHIỆP
**Đề tài:** Phát hiện deepfake & liveness cho eKYC — hợp tác miền không gian–tần số (SFDCT)
**SV:** Lê Ngọc Thành · **25 slide · 20 phút**

> Nguyên tắc: ~45 giây/slide, nói chậm–rõ, mỗi slide 1 ý chính. Phần phụ (web tech, DNS, AWS,
> use-case/activity/sequence, màn hình app, triển khai) chỉ lướt. Trọng tâm: **giả thuyết tần số →
> kiến trúc → kết quả cross-dataset trung thực → ngưỡng eKYC**. Số liệu trong kịch bản là số THẬT,
> không tô hồng — đây là điểm mạnh khi hội đồng vặn.

---

## PHẦN MỞ ĐẦU (Slide 1–4 · ~3 phút)

### Slide 1 — Trang bìa  ⏱30s
**Hình:** logo trường + tên đề tài, SV, GVHD.
> "Kính chào hội đồng. Em là Lê Ngọc Thành. Đồ án của em: *Phát hiện deepfake và liveness cho
> định danh điện tử eKYC*, theo hướng kết hợp đặc trưng không gian và tần số. Em xin trình bày
> trong 20 phút."

### Slide 2 — Bối cảnh & vấn đề  ⏱55s
**Hình:** Figure 3.21 (màn hình Home DeepGuard) hoặc 1 ảnh minh hoạ eKYC.
> "eKYC — định danh khách hàng điện tử — là cổng vào của ngân hàng số. Kẻ gian có thể dùng
> deepfake (khuôn mặt giả do AI sinh) để vượt qua bước xác thực. Thông tư 17/2024/TT-NHNN yêu cầu
> đối chiếu sinh trắc học, nên ngân hàng cần một lớp phát hiện giả mạo. Bài toán khó nhất không phải
> bắt giả trên dữ liệu đã biết, mà là **tổng quát hoá sang loại deepfake chưa từng thấy** — đây là
> điều em tập trung."

### Slide 3 — Mục tiêu & đóng góp  ⏱65s
**Hình:** bullet 3 đóng góp.
> "Đồ án có ba đóng góp. Một, **giả thuyết và kiểm chứng**: dấu vết deepfake mờ trong miền không gian
> nhưng lộ trong miền tần số DCT, em kiểm chứng bằng dữ liệu thật. Hai, **kiến trúc SFDCT** — một
> backbone ảnh kết hợp một nhánh tần số qua cơ chế cổng (gated cross-attention) bảo đảm không làm
> hỏng backbone. Ba, **đánh giá trung thực và hệ thống chạy thật**: em đo cross-dataset có khoảng tin
> cậy, hiệu chỉnh ngưỡng theo ràng buộc eKYC, và triển khai thành ứng dụng demo trên cloud."

### Slide 4 — Tổng quan giải pháp (pipeline)  ⏱50s
**Hình:** sơ đồ pipeline 2 nhánh (nếu có fig kiến trúc; nếu chưa, dùng Figure 1.2 + 1.3 ghép).
> "Toàn cảnh: ảnh khuôn mặt được cắt bằng dò mặt, rồi đi vào **hai nhánh song song**. Nhánh không
> gian là EfficientNet-B4 nhìn pixel. Nhánh tần số tách năng lượng theo 16 băng DCT. Hai nhánh **hợp
> nhất qua một cổng học được**, rồi ra xác suất giả mạo. Em sẽ đi lần lượt: lý thuyết tần số trước,
> sau đó kiến trúc, rồi kết quả."

---

## PHẦN LÝ THUYẾT — GIẢ THUYẾT TẦN SỐ (Slide 5–6 · ~2 phút)

### Slide 5 — Giả thuyết cốt lõi: dấu vết tần số  ⏱65s
**Hình:** **Figure 3.2** (cặp real/fake cùng người + phổ DCT 8×8 + bản đồ hiệu).
> "Đây là minh hoạ cho giả thuyết. Hai khuôn mặt cùng một người — một thật, một deepfake — gần như
> giống hệt khi nhìn bằng mắt. Nhưng khi biến đổi sang miền tần số bằng DCT (Discrete Cosine
> Transform — biến đổi cosine rời rạc, tách ảnh thành các thành phần tần số), phổ của chúng khác nhau.
> Bản đồ hiệu real trừ fake ở bên phải lộ ra một cấu trúc mờ mà mắt không thấy. Đó chính là dấu vết
> mà GAN để lại khi nội suy phóng to ảnh — và là tín hiệu nhánh tần số sẽ đọc."

### Slide 6 — Bằng chứng theo 16 băng tần  ⏱60s
**Hình:** **Figure 3.3** (năng lượng trung bình theo băng, real vs fake, kèm hiệu).
> "Em định lượng dấu vết đó trên cả hai bộ dữ liệu. Mặt thật mang năng lượng DCT nhỉnh hơn mặt giả,
> và chênh lệch **lớn nhất ở các băng thấp** rồi nhỏ dần về băng cao — vì deepfake bị làm mượt quá
> mức. Nhưng băng thấp chủ yếu là nội dung thô, dễ lẫn với khác biệt cá nhân, nên nhánh tần số **bỏ
> vài băng thấp nhất và dựa vào băng giữa**. Cần nói thẳng: tín hiệu này có thật nhưng yếu, và yếu hơn
> nữa khi ảnh bị nén — đây là lý do phần cải thiện từ tần số ở mức khiêm tốn, không phải đột phá."

---

## PHẦN LÝ THUYẾT — THÀNH PHẦN KIẾN TRÚC (Slide 7–10 · ~4 phút)

### Slide 7 — Backbone không gian: EfficientNet-B4  ⏱50s
**Hình:** **Figure 1.2** (khối MBConv).
> "Nhánh không gian là EfficientNet-B4. Em chọn B4 vì nó cân bằng độ sâu, độ rộng và độ phân giải
> bằng *compound scaling* — mở rộng đồng bộ ba chiều — nên đạt độ chính xác cao với chi phí vừa phải,
> hợp cho triển khai. Lõi của nó là khối MBConv trong hình: tích chập tách theo chiều sâu cộng cơ chế
> nén–kích (squeeze-and-excitation). Em dùng trọng số tiền huấn luyện ImageNet rồi tinh chỉnh — đây là
> baseline mạnh để mọi cải tiến phải vượt qua."

### Slide 8 — Biến đổi DCT & 16 băng tần  ⏱60s
**Hình:** **Figure 1.3** (quét zigzag + 16 băng tần).
> "Nhánh tần số hoạt động trên từng khối ảnh. Mỗi khối được biến đổi DCT hai chiều, cho ra một lưới hệ
> số: góc trên-trái là tần số thấp, chéo xuống dưới-phải là tần số cao. Em quét theo đường zigzag như
> hình và gom thành **16 băng tần** theo thứ tự tần số tăng dần. Làm trên ba kênh màu YCbCr, ta được
> một mô tả gọn về phân bố năng lượng tần số của khuôn mặt — đầu vào cho nhánh tần số."

### Slide 9 — Nhánh tần số ContentDCT (0 tham số học)  ⏱55s
**Hình:** sơ đồ nhánh ContentDCT (hoặc Figure 1.3 + chú thích).
> "Nhánh tần số em đặt tên ContentDCT, thiết kế cố ý **rất nhẹ**: từ 16 băng × 3 kênh màu, lấy **năng
> lượng trung bình** mỗi băng, ra một vector 48 chiều. Điểm đáng chú ý: nhánh này **không có tham số
> học nào** — nó chỉ thống kê tần số thuần tuý. Như vậy nếu mô hình có tốt lên thì là nhờ *thông tin
> tần số*, chứ không phải nhờ nhồi thêm tham số. Đây là lựa chọn để giữ thí nghiệm sạch và dễ lý giải."

### Slide 10 — Hợp nhất: gated cross-attention  ⏱70s
**Hình:** **Table 1.3** (vai trò Q/K/V) + minh hoạ cổng α.
> "Câu hỏi mấu chốt: ghép hai nhánh thế nào để **không làm hỏng** backbone vốn đã mạnh? Em dùng
> *cross-attention có cổng*. Đặc trưng không gian đóng vai trò truy vấn — Query; đặc trưng tần số đóng
> vai trò khoá và giá trị — Key/Value. Cơ chế attention cho mỗi vị trí không gian 'hỏi' xem băng tần
> nào liên quan. Quan trọng nhất là **hệ số cổng alpha**: đặc trưng mới bằng đặc trưng không gian
> cộng alpha nhân phần attention. Em khởi tạo **alpha bằng 0**, nên lúc bắt đầu mô hình **đúng bằng
> B4 thuần** — tần số chỉ được thêm vào nếu quá trình huấn luyện thấy nó có ích. Đây là bảo đảm sàn
> tại thời điểm khởi tạo."

---

## PHẦN PHƯƠNG PHÁP — KIẾN TRÚC HOÀN CHỈNH (Slide 11–13 · ~3 phút)

### Slide 11 — Kiến trúc SFDCT đầy đủ  ⏱65s
**Hình:** **Figure 3.6** (model summary SFDCT) — hoặc sơ đồ khối SFDCT.
> "Ghép lại thành SFDCT. B4 cho bản đồ đặc trưng không gian ở 64 vị trí. ContentDCT cho 16 token tần
> số. Cổng cross-attention hợp nhất, rồi đầu phân loại ra xác suất. Tổng cộng khoảng **18 triệu tham
> số**, chỉ hơn baseline khoảng nửa triệu — phần thêm nằm ở cổng hợp nhất, còn nhánh tần số 0 tham số.
> Mô hình vẫn đủ nhẹ để chạy thời gian thực trong demo."

### Slide 12 — Biến thể SFDCT-HFF (nhánh thông cao)  ⏱60s
**Hình:** **Figure 3.8** (model summary SFDCT-HFF).
> "Em thử thêm một biến thể mạnh tay hơn về tần số: SFDCT-HFF. Thay vì chỉ thống kê băng, nó **lọc bỏ
> 3 băng thấp nhất** rồi biến đổi ngược DCT để tạo một ảnh phần dư chỉ còn tần số cao, đưa qua vài lớp
> tích chập và một cổng tương tự. Mục tiêu là ép mô hình nhìn vào dấu vết tần số cao. Mô hình này nặng
> hơn, khoảng **22,8 triệu tham số**."

### Slide 13 — Vì sao khởi tạo cổng bằng 0  ⏱50s
**Hình:** **Figure 3.16** (phân bố giá trị cổng sau huấn luyện).
> "Một câu hỏi tự nhiên: tại sao cổng phải khởi tạo bằng 0? Vì nó cho mô hình **bắt đầu đúng bằng
> backbone** rồi mới học có nên 'mở cổng' tần số hay không, thay vì xáo trộn ngay từ đầu. Hình này là
> phân bố giá trị cổng sau huấn luyện: chúng dương nhưng nhỏ — nghĩa là tần số *có* được dùng, nhưng
> đóng góp ở mức vừa phải. Điều đó nhất quán với kết quả em sắp trình bày."

---

## PHẦN ĐÁNH GIÁ (Slide 14–21 · ~6,5 phút)

### Slide 14 — Dữ liệu & giao thức đánh giá  ⏱55s
**Hình:** **Table 3.4** (thống kê 2 bộ) + **Figure 3.1** (phân bố real/fake).
> "Giao thức là **cross-dataset**, đúng kịch bản thực tế. Em **huấn luyện trên FaceForensics++** và
> **kiểm thử trên Celeb-DF-v2** — một bộ deepfake hoàn toàn khác, mô hình chưa từng thấy. Đây là phép
> thử khắc nghiệt cho khả năng tổng quát hoá. Thước đo chính là AUC — diện tích dưới đường ROC, đo khả
> năng phân biệt không phụ thuộc ngưỡng."

### Slide 15 — Động lực huấn luyện  ⏱50s
**Hình:** **Figure 3.7** (đường train SFDCT) — hoặc 3.5 baseline.
> "Đây là đường huấn luyện vẽ thẳng từ log. Loss giảm đều, AUC trên FaceForensics++ — tức **dữ liệu
> cùng miền** — lên cao và ổn định quanh 0,97. Phần này chứng tỏ tối ưu hoá hoạt động tốt; mọi dao
> động em sắp nói tới là ở **bộ cross-dataset**, không phải lỗi huấn luyện."

### Slide 16 — Kết quả cross-dataset (frame-level)  ⏱60s
**Hình:** **Table 3.5** (so sánh frame-level FF++→Celeb-DF).
> "Kết quả ở mức khung hình, cross-dataset. Baseline B4 đạt AUC **0,7497**. SFDCT **0,7572**.
> SFDCT-HFF cao nhất **0,7695**. Vậy thêm tần số **có** cải thiện, theo đúng thứ tự giả thuyết: càng
> nhấn tần số càng nhỉnh hơn. Nhưng mức cải thiện nhỏ, nên câu hỏi tiếp theo là: nó có **đáng tin về
> mặt thống kê** không? Đó là slide sau."

### Slide 17 — Điểm mạnh: đánh giá chặt chẽ & ổn định  ⏱65s
**Hình:** **Table 3.6** (AUC video-level, 95% CI, hiệu có cặp).
> "Một điểm mạnh của đồ án là **phương pháp đánh giá nghiêm**. Em không chỉ báo một con số AUC, mà ở
> mức video em tính AUC kèm **khoảng tin cậy 95%** bằng bootstrap và so sánh **có cặp** với baseline —
> đây là chuẩn đánh giá chặt chẽ, tránh chọn lọc số liệu đẹp. Hai kết quả nổi bật: trên dữ liệu **cùng
> miền** FaceForensics++ mô hình đạt AUC quanh **0,97 rất ổn định**; và ở **mức khung hình
> cross-dataset**, thêm tần số cải thiện **đều theo đúng thứ tự giả thuyết** — 0,7497 lên 0,7572 rồi
> 0,7695. Ở mức video cross-dataset, các mô hình **tương đương nhau trong khoảng tin cậy** — khác biệt
> nằm trong vùng sai số thống kê. Em báo cáo minh bạch như vậy: kết quả vững, có kiểm định, và đặt nền
> cho hệ thống eKYC chạy thật."

> **Ghi chú diễn giả (KHÔNG để trên slide):** nếu hội đồng hỏi sâu — ở mức video SFDCT nhỉnh thấp hơn
> baseline một chút và mọi CI hiệu số chứa 0 → trả lời thẳng: cue tần số có thật nhưng yếu, cross-dataset
> khó; đóng góp nằm ở kiểm chứng trung thực + kỹ thuật, không phải đánh bại baseline. (Xem câu hỏi 1–2.)

### Slide 18 — ROC & ràng buộc FPR ≤ 5%  ⏱60s
**Hình:** **Figure 3.10** (ROC, đánh dấu ràng buộc FPR 5%).
> "Đường ROC trên bộ kiểm thử. Đường đứt đánh dấu **ràng buộc tỷ lệ báo nhầm tối đa 5%** — false
> positive rate, tức tỷ lệ mặt thật bị gắn cờ giả. Trong eKYC, báo nhầm khách thật là chi phí rất lớn,
> nên ta cố định trần báo nhầm rồi xem bắt được bao nhiêu giả ở đó. Đây là cách đọc ROC đúng với bài
> toán nghiệp vụ, thay vì chỉ nhìn một con số AUC."

### Slide 19 — Ngưỡng vận hành eKYC  ⏱55s
**Hình:** **Table 3.7** (hiệu chỉnh ngưỡng).
> "Từ ràng buộc đó em **hiệu chỉnh ngưỡng** quyết định. Bảng này chọn ngưỡng sao cho tỷ lệ báo nhầm
> nằm trong 5% theo tinh thần Thông tư 17/2024. Điểm cần nhấn: ngưỡng **không phải 0,5 mặc định** mà
> phải chọn theo dữ liệu và theo chi phí nghiệp vụ. Đây là bước biến một mô hình nghiên cứu thành một
> bộ lọc dùng được."

### Slide 20 — So với các phương pháp tần số khác  ⏱50s
**Hình:** **Table 3.8** (so sánh với baseline + phương pháp tần số khác).
> "Đặt trong bối cảnh rộng hơn: bảng này so SFDCT với baseline và vài hướng tần số khác trên cùng phép
> thử cross-dataset. Thông điệp trung thực là **chưa hướng tần số nào tạo cách biệt lớn và chắc chắn**
> so với một B4 đã tinh chỉnh kỹ ở kịch bản này. Điều đó định vị đúng đóng góp của em và cũng chỉ ra
> khoảng trống cho nghiên cứu sau."

### Slide 21 — Phân tích đặc trưng & khả diễn giải  ⏱65s
**Hình:** **Figure 3.13** (t-SNE) + **Figure 3.14** (Grad-CAM).
> "Hai hình để hiểu mô hình *bên trong*. Bên trái là chiếu t-SNE đặc trưng của 1.500 mặt thật và 1.500
> mặt giả Celeb-DF xuống 2 chiều: hai màu **trộn lẫn nhiều**, đúng với AUC quanh 0,76 — mô hình đẩy
> hai lớp tách ra chỉ ở mức yếu. Bên phải là bản đồ nhiệt Grad-CAM: mô hình **tập trung vào vùng miệng,
> cằm, quai hàm** — nơi deepfake hay để lại lỗi pha trộn — chứ không nhìn nền hay quần áo. Quyết định
> dựa vào khuôn mặt là điều cần cho việc rà soát thủ công trong eKYC."

---

## PHẦN PHỤ (NÉN) + KẾT LUẬN (Slide 22–25 · ~3,5 phút)

### Slide 22 — Liveness (mô-đun phụ)  ⏱50s
**Hình:** **Figure 3.19** (ROC + phân bố điểm B4+DCT-liveness) + **Table 3.10**.
> "Em làm thêm mô-đun chống giả mạo khuôn mặt — liveness — như phần phụ cho chuỗi eKYC. Trên bộ
> LCC-FASD, mô hình đạt AUC khoảng **0,977**, sai số cân bằng quanh **8%**. Điều thú vị mang tính khoa
> học: ở bài liveness, **thêm nhánh tần số không cải thiện** — B4 thuần 0,9829 so với B4+DCT 0,9776.
> Em đã kiểm chứng lý do: live và spoof gần như **không khác nhau về năng lượng DCT**, nên không có
> dấu vết tần số để khai thác. Đây là một kết quả âm trung thực, củng cố cho thông điệp chung."

### Slide 23 — Hệ thống triển khai (demo)  ⏱40s
**Hình:** **Figure 3.22** (màn hình kết quả phát hiện deepfake).
> "Toàn bộ được đóng gói thành ứng dụng DeepGuard chạy thật trên một máy cloud: backend FastAPI, mô
> hình phục vụ dạng microservice, có phân quyền theo vai trò. Màn hình trả về điểm rủi ro, kết luận,
> bản đồ nhiệt và phổ tần số — để người duyệt eKYC có cơ sở rà soát, chứ không phải hộp đen."

### Slide 24 — Hạn chế & hướng phát triển  ⏱60s
**Hình:** bullet.
> "Hạn chế, em nói thẳng. Một, cải thiện từ tần số **chưa đủ ý nghĩa thống kê** ở mức video
> cross-dataset. Hai, tín hiệu tần số **suy yếu khi ảnh bị nén mạnh**, đúng môi trường thực tế. Hướng
> phát triển: huấn luyện tự pha trộn (self-blended) để dấu vết bền hơn, mở rộng sang dữ liệu mặt người
> Việt và kịch bản spoof thật, và hiệu chỉnh ngưỡng theo từng tổ chức. Đóng góp lõi của em là một
> **đánh giá trung thực, tái lập được**, cộng một hệ thống chạy thật."

### Slide 25 — Kết luận & cảm ơn  ⏱50s
**Hình:** tóm tắt 3 đóng góp.
> "Tóm lại: em đã kiểm chứng giả thuyết dấu vết tần số bằng dữ liệu thật, đề xuất kiến trúc SFDCT hợp
> nhất có cổng bảo đảm không làm hỏng backbone, đánh giá cross-dataset có khoảng tin cậy và hiệu chỉnh
> ngưỡng theo ràng buộc eKYC, rồi triển khai thành ứng dụng thật. Em xin cảm ơn thầy cô đã lắng nghe
> và sẵn sàng nhận câu hỏi."

---

## PHÂN BỔ THỜI GIAN (mục tiêu ~19 phút + đệm)
| Khối | Slide | Thời lượng |
|------|-------|-----------|
| Mở đầu | 1–4 | ~3,0 phút |
| Lý thuyết tần số | 5–6 | ~2,0 phút |
| Thành phần kiến trúc | 7–10 | ~3,8 phút |
| Kiến trúc hoàn chỉnh | 11–13 | ~3,0 phút |
| Đánh giá | 14–21 | ~7,0 phút |
| Phụ + kết luận | 22–25 | ~3,3 phút |
| **Tổng** | | **~19–20 phút** |

## CÂU HỎI HỘI ĐỒNG CÓ THỂ HỎI (chuẩn bị sẵn)
1. **"Cải thiện nhỏ vậy thì đóng góp ở đâu?"** → Kiểm chứng giả thuyết trung thực + kiến trúc cổng
   an toàn + hệ thống eKYC chạy thật + benchmark tái lập. Giá trị nằm ở phương pháp đánh giá, không
   chỉ con số AUC.
2. **"Test cross-dataset dao động — model train vô nghĩa?"** → Không. AUC *cùng miền* (FF++) cao và
   ổn định (~0,97); chỉ AUC *cross-dataset* dao động. Đó là **generalisation gap**, bản chất bài toán
   miền lạ, không phải lỗi tối ưu. (Slide 15 + 17.)
3. **"Sao không early stop, không giảm learning rate?"** → Em chọn checkpoint tốt nhất theo AUC
   cross-dataset trên log; thêm early stop / lr-decay là hướng cải thiện đã ghi ở phần hạn chế.
4. **"t-SNE trộn lẫn — nghĩa là model kém?"** → t-SNE chỉ trực quan hoá, không đo. Trộn lẫn đúng với
   AUC 0,76 và minh hoạ độ khó cross-dataset; con số chính thức vẫn là AUC + CI.
5. **"Tần số không giúp liveness, vậy sao đưa vào?"** → Đó là kết quả âm có kiểm chứng (Figure 3.17):
   live/spoof không khác nhau về DCT, nên không có cue — củng cố tính nhất quán của phương pháp.
