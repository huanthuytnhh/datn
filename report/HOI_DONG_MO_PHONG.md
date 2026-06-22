# Hội đồng mô phỏng — Luyện bảo vệ SFDCT

> Cách dùng: nhờ 3 người đóng 3 vai, hỏi theo từng mục; tự bấm giờ trả lời ≤60s/câu. Đọc lướt phần "Thông điệp lõi" trước mỗi buổi để giữ giọng nhất quán. Mỗi câu có nhãn 🔴 mức nguy hiểm (1=nhẹ, 5=đòn chốt).

## Thông điệp lõi cần lặp (bất kể ai hỏi)

1. **KHÔNG SOTA — nói thẳng ngay từ đầu.** Ở best-frame (Bảng 4.4) SFDCT-HFF 0.7695 có NHỈNH hơn SPSL 0.7650, nhưng đó là best-checkpoint chọn giữa epoch (test-peeking) nên em KHÔNG tuyên bố vượt. Trên đại lượng phòng thủ — mean-over-run (B4 0.7082, SFDCT 0.7140, HFF 0.7236) và video-level (mọi paired CI vs baseline đều chứa 0) — phương pháp KHÔNG tách khỏi baseline. Vậy trong nhiễu, single-seed: KHÔNG SOTA. Lặp lại điều này trước khi giám khảo phải tự phát hiện.
2. **Phân biệt ba lớp con số mỗi lần trích AUC:** (a) best-checkpoint = có test-peeking, lạc quan; (b) mean-over-run = con số phòng thủ được; (c) video-level paired CI = kết luận thống kê an toàn. Khi bị truy, lùi về (b) và (c), không đứng sau (a).
3. **Đóng góp = thiết kế zero-init floor** (an toàn tại KHỞI TẠO, không phải bảo chứng nghiệm cuối — Row1 0.7333 là phản ví dụ tôi tự nêu; đây là ablation mở rộng tôi từng chạy, NGOÀI Bảng 4.4 — chỉ nêu nếu có trong phụ lục bản nộp) **+ gate-α làm dụng cụ ĐO + giao thức cross-dataset trung thực + hệ thống giải thích được.** KHÔNG phải Δ AUC.
4. **Kết quả âm GIẢI THÍCH ĐƯỢC CƠ CHẾ ≠ thí nghiệm thất bại:** dữ liệu nén c23 lấy đi tần cao nơi artifact nằm → per-band energy gap co lại → α gần 0 → gain nhỏ. Chuỗi nhân quả này là kiến thức, là lý do đề tài đáng làm.
5. **Mỗi con số "đẹp" phải tự gắn caveat NGAY:** liveness 0.98 = in-dataset + nhiệm vụ phụ + không so với 0.77 cross-dataset; thứ tự frame B4<SFDCT<HFF = best-ckpt test-peeking, đảo ở video-level. Không để con số đẹp trôi một mình.
6. **Trung thực là CÁCH TRÌNH BÀY, không phải đóng góp** — luôn tách ra được phần kỹ thuật (zero-init gate, gate-meter) đứng độc lập với kết quả khi bị ép.
7. **Năng lực thực thi bằng bằng chứng:** tái lập baseline khớp leaderboard tới 0.001 (0.7497 vs 0.7487), pipeline cross-dataset hai dataset, gated cross-attention chạy thật, serving giải thích được + Grad-CAM, bootstrap 2000× trên 518 clip, deploy Docker bốn container. Chuyển từ phòng thủ sang khẳng định việc ĐÃ LÀM ĐƯỢC.
8. **Chủ động nêu mọi gap/leak trước khi bị hỏi:** threshold set trên test (chưa carve validation), single-seed, identity-level chưa kiểm chéo, 73 ảnh trùng trong LCC-FASD official (loại đi AUC còn tăng), cascade chưa nối liền, route guard ở client. Tự nói ra = giữ uy tín "đánh giá đáng tin".

---

## Thành viên 1 — Quan tâm nội dung trình bày

> **Persona:** Người đọc kỹ slide và nghe kỹ lời nói, không quan tâm code chạy thế nào mà quan tâm em CÓ HIỂU việc mình làm không và CÂU CHUYỆN có đứng vững không. Hỏi mềm mỏng nhưng truy đến cùng; sẽ bắt em tự định nghĩa "đóng góp" bằng lời của chính em, không cho núp sau thuật ngữ. Coi trọng sự nhất quán giữa keypoint - slide - câu trả lời; nếu em nói "trung thực" mà có chỗ vô tình khoe SOTA thì chỉ ra ngay. Đánh giá cao sinh viên dám báo cáo kết quả âm, nhưng cần thấy em hiểu VÌ SAO kết quả âm đó vẫn đáng làm đồ án.

> **Mở màn:** "Em trình bày rất mạch lạc và tôi đánh giá cao sự trung thực. Nhưng cho tôi bắt đầu bằng một câu đơn giản: nếu phải nói với một người ngoài ngành trong đúng MỘT câu — đồ án này đóng góp cái gì mới cho đời? Đừng dùng từ floor guarantee hay bootstrap."

### Câu 1 — Sản phẩm hay nghiên cứu? 🔴 3

**Hỏi:** Em mở đầu bằng eKYC, Thông tư 17, ngân hàng — nghe như một bài toán sản phẩm. Nhưng kết quả lại nói "đóng góp không phải con số mà là tính chặt chẽ phương pháp". Vậy đề tài này thực chất là một SẢN PHẨM eKYC, hay một NGHIÊN CỨU phương pháp? Em đang kể câu chuyện nào?

*(đang dò: em có tự ý thức được sự lệch giữa khung mở đầu là sản phẩm và khung kết luận là phương pháp không, hay chỉ ghép hai phần do người khác viết.)*

**Đáp:** Thưa thầy, đây là một nghiên cứu phương pháp được đặt trong một bối cảnh ứng dụng cụ thể là eKYC. eKYC không phải sản phẩm em giao nộp, mà là cái khung để định nghĩa thế nào là một bài kiểm tra trung thực: nó ép em phải đánh giá cross-dataset (train FF++, test Celeb-DF-v2), phải chọn điểm vận hành ở FPR thấp, và phải giải thích được. Ba ràng buộc đó đến từ eKYC, còn thứ em thực sự đóng góp là cách hợp nhất nhánh tần số một cách an toàn và một giao thức đánh giá không tự lừa mình. Hệ thống web chỉ là phương tiện để chứng minh phương pháp chạy thật được, không phải đích đến.

**Nếu truy tiếp:** Nếu thầy hỏi vậy sao không bỏ hẳn phần eKYC cho gọn: em xin giữ vì nếu bỏ bối cảnh thì việc em chọn cross-dataset và FPR 5% trở nên tùy tiện, không có lý do. Chính eKYC làm cho lựa chọn đánh giá khắt khe của em CÓ ĐỘNG CƠ, thay vì khắt khe một cách trang trí.

### Câu 2 — Đóng góp mới là gì, nói thẳng 🔴 4

**Hỏi:** Cho tôi nghe lại đúng một câu: đóng góp mới của em là gì? Không nhắc tới việc người khác chưa làm — nói thẳng cái em ĐÃ làm.

*(đang dò: em có phát biểu được đóng góp bằng lời của chính mình, ngắn gọn, không núp sau thuật ngữ, không vòng vo.)*

**Đáp:** Đóng góp của em là: gắn một nhánh tần số block-DCT vào EfficientNet-B4 qua một cổng hợp nhất khởi tạo bằng 0, sao cho tại khởi tạo việc thêm nhánh tần số được đảm bảo không làm mô hình lệch khỏi backbone gốc, và cái cổng đó tự nó trở thành một thước đo trực tiếp cho biết tần số giúp ích bao nhiêu. Cộng với một quy trình đánh giá cross-dataset có khoảng tin cậy để em không tự lừa mình bằng một con số đẹp ngẫu nhiên. Đó là ba thứ: thiết kế an toàn ở điểm khởi đầu, thước đo, và sự trung thực có bằng chứng.

**Nếu truy tiếp:** Nếu thầy bảo cái đó nghe vẫn hơi kỹ thuật: nói nôm na, em làm một cách thêm tính năng mới vào mô hình sao cho lúc bắt đầu nó KHÔNG gây sốc cho cái đang chạy, rồi đo xem tính năng mới đó thật sự đáng giá bao nhiêu — và câu trả lời trung thực là "rất ít, trên dữ liệu này". Biết được nó ít cũng là một kết quả.

### Câu 3 — Vì sao xứng đáng là đồ án nếu cải thiện gần 0? 🔴 5

**Hỏi:** Em lặp ba lần câu "không tuyên bố SOTA, đóng góp là tính chặt chẽ". Tôi e đây là cách phòng thủ để biến một kết quả yếu thành đức tính. Nếu cải thiện gần như bằng 0, vì sao đề tài này XỨNG ĐÁNG là một đồ án tốt nghiệp, chứ không phải một thí nghiệm thất bại?

*(đang dò: em phân biệt được "thất bại" với "kết quả âm có thông tin" không; em có giá trị thực để bảo vệ ngoài việc khéo léo đóng khung.)*

**Đáp:** Em phân biệt thế này. Một thí nghiệm thất bại là khi em không biết vì sao nó không chạy, hoặc kết quả không nói lên điều gì. Đồ án của em thì NGƯỢC LẠI: em biết chính xác vì sao cải thiện nhỏ — vì dữ liệu nén c23 đã lấy đi phần tần cao nơi artifact nằm, và em ĐO được điều đó qua phân bố alpha gần 0 (mean |α| ≈ 1.5×10⁻⁴ (gần 0 nhưng KHÁC 0), peak |α| = 0.0232, chỉ 44/1792 kênh > 10⁻³ (hầu hết kênh đóng)) và qua per-band energy gap co lại dưới nén. Em không chỉ nói "nó không tốt hơn", em chỉ ra cơ chế. Một kết quả âm mà giải thích được nguyên nhân, dưới một giao thức đủ chặt để tin được, là kiến thức — nó cảnh báo người sau đừng kỳ vọng block-DCT cố định thắng trên dữ liệu nén. Đó là giá trị, dù không phải giá trị trên bảng xếp hạng.

**Nếu truy tiếp:** Nếu thầy vẫn thấy chưa đủ tầm đồ án: em xin bổ sung phần kỹ thuật làm được là không tầm thường — tái lập baseline khớp số công bố trong 0.001 (0.7497 vs 0.7487), dựng pipeline cross-dataset hai dataset, cơ chế gated cross-attention chạy thật, hệ thống serving CPU có Grad-CAM. Khối lượng và độ chặt của việc làm đủ tầm; cái em từ chối là phóng đại kết quả.

### Câu 4 — KP4 tự đánh sập mạch kể? 🔴 4

**Hỏi:** Em nói 5 keypoint. Tôi thấy KP1 là bài toán, KP2-3 là phương pháp, KP4-5 là kết quả và hệ thống. Nhưng KP4 lại tự phủ nhận chính nó ("cải thiện nhỏ, không SOTA"). Một bài trình bày mà điểm nhấn số 4 là "phương pháp của tôi gần như không hơn baseline" — mạch đó có tự đánh sập không? Người nghe sẽ nhớ gì?

*(đang dò: em có ý thức về tác động tâm lý của mạch kể không; em sắp xếp keypoint có chủ đích hay chỉ liệt kê.)*

**Đáp:** Em thiết kế mạch này có chủ đích, thưa thầy. KP4 không phải chỗ tự đánh sập mà là chỗ em GIÀNH LẠI niềm tin của hội đồng. Lý do: nếu em giấu việc CI chứa 0 và để hội đồng tự phát hiện, toàn bộ bài mất uy tín. Bằng cách tự nói ra trước, em chuyển trọng tâm cái hội đồng nhớ từ "con số AUC bao nhiêu" sang "sinh viên này đánh giá đáng tin". Người nghe sẽ nhớ: một, có một giả thuyết tần số rõ ràng được chứng minh bằng hình ảnh; hai, một thiết kế an toàn ở điểm khởi đầu; ba, một người trung thực không bịa. Mạch đi từ "ý tưởng đúng hướng" đến "thực thi cẩn thận" đến "đọc kết quả không tự lừa".

**Nếu truy tiếp:** Nếu thầy nói hội đồng vẫn có thể nhớ mỗi con số catch-rate 23%: em chấp nhận rủi ro đó và đó là lý do em đặt KP3 (floor tại khởi tạo) và KP5 (hệ thống giải thích được) ôm hai bên KP4 — để con số yếu không đứng một mình mà luôn nằm giữa hai đóng góp đứng vững không phụ thuộc kết quả.

### Câu 5 — Slide 12 "đúng như giả thuyết" có phải khoe trá hình? 🔴 3

**Hỏi:** Slide 12 em nói "ở mức frame B4 < SFDCT < SFDCT-HFF, đúng như giả thuyết". Câu này nghe rất giống khoe thắng. Em có thấy chỗ này dễ bị hiểu nhầm là tuyên bố SOTA trá hình không? Vì sao em vẫn để nó vào?

*(đang dò: em có tự nhận ra điểm yếu tu từ trong chính bài mình không, hay phải để hội đồng chỉ ra.)*

**Đáp:** Em nhận ra rủi ro đó, thưa thầy. Thứ tự frame là THẬT (0.7497 < 0.7572 < 0.7695) nhưng em phải kèm NGAY ba caveat mỗi khi đọc nó: một, cả ba là best-checkpoint chọn TRÊN tập test, lạc quan; hai, riêng 0.7695 (HFF-R3) là điểm NỬA-EPOCH khôi phục từ console capture, KHÔNG cùng giao thức 21-event với hai model kia nên không so trực tiếp được; ba, ở mức VIDEO thứ tự đảo — SFDCT 0.8083 còn thấp hơn baseline 0.8203, và paired CI đều chứa 0. Em cố tình không để câu "đúng giả thuyết" đứng một mình. Nếu em chỉ nói thứ tự frame mà giấu video thì đó mới là khoe SOTA trá hình. Em làm ngược lại.

**Nếu truy tiếp:** Em sẵn sàng đổi luôn từ ngữ trên slide từ "đúng như giả thuyết dự đoán" thành "phù hợp với hướng giả thuyết ở mức frame, nhưng không bền ở mức video" để triệt tiêu hẳn sắc thái thắng.

### Câu 6 — Em có thực TIN giả thuyết không? 🔴 4

**Hỏi:** Em bảo giả thuyết là "dấu vết ở miền tần số", rồi lại thừa nhận dữ liệu nén đã xóa tần cao nên cải thiện nhỏ. Vậy thật ra ngay từ đầu em có TIN vào giả thuyết của mình không? Hay em biết trước nó sẽ không ăn thua mà vẫn làm?

*(đang dò: em hiểu giả thuyết của mình ở mức nào — tin mù quáng, hay hiểu cả điều kiện biên khi nào nó đúng/sai.)*

**Đáp:** Em tin giả thuyết là ĐÚNG CÓ ĐIỀU KIỆN, và em hiểu điều kiện đó từ đầu. Dấu vết tần số tồn tại thật — em chứng minh bằng per-band energy gap trên FF++: mặt thật mang nhiều năng lượng dải trung-cao hơn mặt giả. Nhưng cường độ của dấu vết đó phụ thuộc mức nén: nén càng mạnh, tần cao mất càng nhiều, dấu vết càng mờ. Em chọn dữ liệu nén vừa c23 một cách CÓ CHỦ ĐÍCH vì đó đúng điều kiện eKYC thật, nơi ảnh đã qua nén. Nên em không kỳ vọng cải thiện lớn — và em nói thẳng điều đó trong báo cáo từ đầu, không phải biện hộ sau khi thấy kết quả. Hiểu một giả thuyết nghĩa là biết cả khi nào nó mạnh và khi nào nó yếu; em chọn đúng vùng nó yếu vì đó là vùng thực tế.

**Nếu truy tiếp:** Nếu thầy hỏi vậy sao không chọn dữ liệu ít nén cho dễ thắng: vì như thế là chọn điều kiện thuận lợi để bài đẹp hơn nhưng xa thực tế eKYC — đó mới là không trung thực. Em chọn điều kiện khó và báo cáo kết quả khiêm tốn, đó là một quyết định khoa học có ý thức.

### Câu 7 — 0.98 liveness cạnh 0.77 có lập lờ? 🔴 3

**Hỏi:** Liveness của em AUC 0.98, đẹp hơn hẳn phần deepfake 0.77. Một người nghe lướt sẽ nhớ con số 0.98 và nghĩ đồ án thành công. Em có thấy việc để 0.98 cạnh 0.77 là một sự lập lờ vô tình — khoe con số đẹp của nhiệm vụ phụ để che con số khiêm tốn của nhiệm vụ chính không?

*(đang dò: em có trung thực về vai trò phụ của liveness, hay dùng nó làm điểm sáng đánh lạc hướng.)*

**Đáp:** Em ý thức rủi ro đó và đã chủ động chặn nó, thưa thầy. Trong cả slide lẫn lời nói em luôn gọi liveness là "nhiệm vụ phụ" và nhấn rằng 0.9829 là IN-DATASET — train test cùng LCC-FASD — nên KHÔNG so sánh được với 0.77 cross-dataset của deepfake; hai con số ở hai chế độ đánh giá khác nhau, đặt cạnh nhau để so độ tốt là sai. Quan trọng hơn, em dùng liveness để CỦNG CỐ luận điểm trung thực chứ không để che: ở liveness nhánh tần số cũng KHÔNG cải thiện (0.9829 xuống 0.9776), lặp đúng kết luận bên deepfake. Nếu em muốn khoe, em đã không tự nói ra cái 0.9776 thấp hơn.

**Nếu truy tiếp:** Em còn chủ động hash toàn bộ ảnh và phát hiện bộ LCC-FASD official tự có 73 ảnh trùng (48 train∩eval + 25 dev∩eval); loại chúng ra thì AUC còn TĂNG nhẹ 0.9829→0.9858 — chứng tỏ con số không bị thổi do leak, và em có thói quen kiểm leak. Em đồng ý gắn nhãn "in-dataset, phụ, không so trực tiếp với deepfake cross-dataset" ngay cạnh con số để người nghe lướt cũng không hiểu nhầm.

### Câu 8 — SPSL đã ngang em rồi, novelty thật là gì? 🔴 5

**Hỏi:** SPSL công bố 0.7650, nằm GỌN trong khoảng cải thiện của em, SRM 0.7552. Vậy về bản chất phương pháp của em ngang một method tần số đã có từ trước. Nếu thị trường đã có đồ ngang vậy rồi, cái MỚI duy nhất em mang lại — nói thật — có phải chỉ là "em làm cẩn thận hơn" không?

*(đang dò: em có thổi phồng novelty không; em định vị mình so với prior art một cách trung thực và chính xác không.)*

**Đáp:** Em xin trả lời thẳng và không thổi phồng. Về CON SỐ, em phải phân biệt rạch ròi ba đại lượng. Ở best-frame (Bảng 4.4), SFDCT-HFF 0.7695 có NHỈNH hơn SPSL 0.7650 — nhưng đó là best-checkpoint chọn giữa epoch (test-peeking), nên em KHÔNG tuyên bố vượt; nó không phải con số đứng sau bảo vệ được. Trên đại lượng phòng thủ — mean-over-run (B4 0.7082, SFDCT 0.7140, HFF 0.7236) và video-level (mọi paired CI vs baseline đều chứa 0) — phương pháp KHÔNG tách khỏi baseline. Vậy trong nhiễu, single-seed: em KHÔNG vượt có ý nghĩa, KHÔNG SOTA. Cái mới của em KHÔNG nằm ở con số. Nó nằm ở ba chỗ cụ thể: một, cách hợp nhất bằng cổng cross-attention khởi tạo zero cho điểm khởi đầu an toàn — tính chất thiết kế mà SPSL hay SRM không có; hai, dùng chung MỘT backbone cho cả deepfake lẫn liveness, chứng minh bộ máy tái dùng được; ba, cái cổng alpha tự nó là dụng cụ đo giải thích được tần số đóng góp bao nhiêu. Em định vị mình là họ hàng gần của nhóm two-stream spatial-frequency và nói rõ điều đó, không giả vờ đứng một mình.

**Nếu truy tiếp:** Nếu thầy nói ba điểm đó vẫn là cải tiến nhỏ về kỹ thuật chứ chưa phải đột phá: em đồng ý, em không tuyên bố đột phá. Ở tầm đồ án tốt nghiệp, em cho rằng một cải tiến thiết kế có tính chất khởi tạo chứng minh được, kiểm chứng đúng mức và báo cáo trung thực là một đóng góp hợp lệ và đủ.

### Câu 9 — Bỏ chữ "trung thực" thì còn gì? 🔴 5

**Hỏi:** Toàn bài em xây quanh chữ "trung thực". Nhưng trung thực là yêu cầu TỐI THIỂU của khoa học, đâu phải đóng góp. Em có đang nâng một nghĩa vụ cơ bản thành thành tựu không? Nếu bỏ chữ "trung thực" đi, còn lại gì để bảo vệ?

*(đang dò: đòn nặng nhất — tách "trung thực" ra khỏi luận điểm xem còn lõi kỹ thuật thực chất nào không.)*

**Đáp:** Thầy nói rất đúng và em chấp nhận: trung thực là nghĩa vụ, không phải đóng góp. Em sẽ không bảo vệ "trung thực" như một thành tựu. Bỏ chữ đó đi, cái còn lại để bảo vệ là hai thứ KỸ THUẬT đứng độc lập với kết quả. Thứ nhất là thiết kế zero-init gated cross-attention: tại bước khởi tạo α=0 nên feature hợp nhất bằng ĐÚNG feature không gian (phương trình 2.5), mô hình mới khởi hành chính xác từ B4. Em nói rõ phạm vi: đây là tính chất tại KHỞI TẠO, KHÔNG đảm bảo nghiệm cuối ≥ B4 — bằng chứng là Row1 sau train xuống 0.7333 (ablation mở rộng em từng chạy, NGOÀI Bảng 4.4 — chỉ nêu nếu có trong phụ lục bản nộp của em), một phản ví dụ sống. Thứ hai là cơ chế alpha học được biến cổng thành một dụng cụ ĐO được mức đóng góp của tần số trên dữ liệu nén — mean |α| ≈ 1.5×10⁻⁴ (gần 0 nhưng KHÁC 0), peak |α| = 0.0232, chỉ 44/1792 kênh > 10⁻³ (hầu hết kênh đóng): một công cụ chẩn đoán, không phải một lời khẳng định. Hai thứ này là kỹ thuật thật. "Trung thực" chỉ là cách em TRÌNH BÀY chúng.

**Nếu truy tiếp:** Zero-init residual gating không phải em phát minh (đó là ReZero), nhưng việc áp nó như một floor có chủ đích tại điểm khởi đầu cho bài toán hợp nhất tần số, rồi dùng chính cái gate làm dụng cụ đo, là một cách dùng có giá trị phương pháp. Em không tuyên bố lý thuyết mới; em tuyên bố một cách thiết kế và đo lường sạch sẽ cho một câu hỏi cụ thể.

### Câu 10 — "Trung thực là điểm mạnh" hay giỏi biện hộ? 🔴 4

**Hỏi:** Câu chốt cuối em nói "sự trung thực đó là điểm mạnh". Nếu tôi là một nhà tuyển dụng AI nghe câu này, tôi có thể nghĩ: bạn này giỏi giải thích vì sao mình không thành công. Em phản biện lại tôi thế nào để tôi tin em là người LÀM ĐƯỢC việc, không chỉ giỏi biện hộ?

*(đang dò: em có chuyển được từ thế phòng thủ sang thế khẳng định năng lực thực thi không; bản lĩnh trước đòn đánh vào sự tự tin.)*

**Đáp:** Thưa thầy, em xin chứng minh bằng việc đã làm, không bằng lời. Em tái lập một baseline công bố khớp tới chữ số thứ ba — 0.7497 so với 0.7487 — điều này chỉ làm được nếu kiểm soát đúng từng chi tiết pipeline, đó là năng lực thực thi. Em dựng được kiến trúc hai nhánh với gated cross-attention chạy thật, một hệ thống serving trả verdict kèm Grad-CAM trong khoảng một giây trên CPU, tách thành microservice có HTTP contract. Em chạy bootstrap 2000 lần trên 518 clip để kiểm định. Đó toàn là việc LÀM ĐƯỢC. Cái em từ chối làm là phóng đại — và một kỹ sư AI biết phân biệt "cải thiện thật" với "nhiễu" chính là người ngân hàng cần, vì đặt nhầm một con số nhiễu thành SOTA trong eKYC là đặt tiền thật của khách vào rủi ro. Em không giỏi biện hộ; em giỏi biết khi nào một con số đáng tin.

**Nếu truy tiếp:** Nếu thầy vẫn ép: cho em một dataset ít nén hoặc cho em chạy multi-seed và self-blended, em đã nêu rõ đó là hướng đi và em biết chính xác phải làm gì — đó là người làm được việc nói, không phải người biện hộ nói.

> **Tránh làm họ khó chịu:** Đừng trả lời "đóng góp là gì" bằng cách liệt kê việc người khác CHƯA làm — phải nói việc em ĐÃ làm. Đừng dùng "trung thực" làm lá chắn cho MỌI câu mà không tách được phần kỹ thuật độc lập. Đừng đọc thuộc lòng nguyên văn câu chốt kịch bản — diễn đạt lại bằng lời của chính em. Đừng để con số 0.98 hay thứ tự frame trôi qua mà không tự gắn caveat. Đừng lẫn "kết quả âm có thông tin" với "thí nghiệm thất bại". Khi bị đánh vào sự tự tin, đừng phòng thủ giọng xin lỗi — chuyển sang khẳng định việc ĐÃ LÀM ĐƯỢC bằng bằng chứng.

---

## Thành viên 2 — Quan tâm hệ thống & demo

> **Persona:** Kỹ sư phần mềm/giải pháp lâu năm, không quan tâm nhiều đến AUC mà quan tâm "nó có chạy thật không, hay slide đẹp che mock". Hỏi trực diện, hay yêu cầu mở app lên xem ngay, vặn vào edge case (ảnh mờ, nhiều mặt, model service chết), latency, log/bằng chứng, và RBAC (ai gọi được API). Coi trọng sự trung thực về ranh giới thật/mock và mức độ sẵn sàng production. Dị ứng với từ "đã triển khai" khi thực ra mới chỉ demo.

> **Mở màn:** "Trước khi vào số liệu mô hình, em mở app lên cho tôi xem một lần detect thật đi — tôi muốn thấy nó chạy chứ không phải nghe kể."

### Câu 1 — Mở app detect ngay, chạy ở đâu? 🔴 2

**Hỏi:** Em mở app lên detect thử một ảnh cho hội đồng xem ngay được không? Hệ thống đang chạy ở đâu, local hay trên cloud?

*(đang dò: có app chạy thật không hay chỉ có screenshot; có dám demo live không.)*

**Đáp:** Dạ được. Hệ thống deploy trên một cloud instance duy nhất bằng Docker: frontend, backend FastAPI, model service và PostgreSQL chạy thành bốn container trên cùng một host, sau một reverse proxy HTTPS. Kiến trúc chạy được cả CPU lẫn GPU; bản đo latency CPU-only là khoảng 0.3–1 giây mỗi ảnh ra verdict kèm Grad-CAM, nên demo live mượt. Em có sẵn tài khoản seed cho từng vai để show.

**Nếu truy tiếp:** Nếu thầy muốn chắc, em mở thẳng /docs (Swagger) gọi endpoint /v1/detect/image với một ảnh thật để thấy request_id, risk_score, verdict và gradcam_b64 trả về. Em xin nói thẳng đây là bản demo end-to-end, không phải bản hardened cho ngân hàng. (Lưu ý nội bộ: bản serving record trong cấu hình là device=CUDA; nếu instance demo có GPU thì nói "GPU, và đã đo CPU-only 0.3–1s/ảnh"; nếu deploy CPU-only thì nói "CPU ~1s". Đừng để lệch giữa lời nói và /health.)

### Câu 2 — spoof_type đã code thật chưa? 🔴 4

**Hỏi:** Trong Bảng 3.8 API liveness trả về cả spoof_type là screen hay print. Cái phân loại kiểu tấn công đó đã code thật chưa, hay mới là thiết kế?

*(đang dò: bắt mock trong spec — chỗ này tôi đã kiểm tra code và biết nó chưa có.)*

**Đáp:** Em phải trung thực: service liveness hiện chỉ là phân loại nhị phân live/spoof, trả về liveness_score và prob_spoof thôi. Trường spoof_type trong bảng spec là phần thiết kế hợp đồng API, chưa có bộ phân loại kiểu tấn công đứng sau. Em không nên để nó trông như đã chạy.

**Nếu truy tiếp:** Nếu thầy hỏi vì sao vẫn để trong bảng: vì em thiết kế contract trước để sau này thay model mà không đổi caller, nhưng em nhận đây là gap và sẽ ghi rõ là PLANNED trong báo cáo, không phải feature đã chạy.

### Câu 3 — Ảnh mờ, thiếu sáng, nhiều mặt? 🔴 3

**Hỏi:** Nếu ảnh đầu vào mờ, thiếu sáng, hoặc trong khung có nhiều khuôn mặt thì hệ thống xử lý thế nào?

*(đang dò: có xử lý edge case thật không hay chỉ chạy trên ảnh đẹp.)*

**Đáp:** Backend chạy face detection trước (MTCNN), crop khuôn mặt rồi mới đưa vào model. Nếu không phát hiện được mặt thì trả lỗi rõ ràng theo exception flow trong use case, không đoán bừa. Với nhiều mặt, pipeline hiện crop khuôn mặt chính, đây là giới hạn em ghi nhận; còn ảnh mờ nặng thường rớt ở bước phát hiện mặt và bị từ chối thay vì cho điểm sai.

**Nếu truy tiếp:** Em thừa nhận chưa có ngưỡng chất lượng ảnh tường minh (blur/độ phân giải) và chưa xử lý nhiều mặt thành nhiều kết quả; đó là hạng mục cần làm trước khi production. Demo live em sẽ dùng ảnh có mặt rõ để tránh rơi vào nhánh lỗi giữa buổi.

### Câu 4 — Model phục vụ ở đâu, latency, model service chết? 🔴 3

**Hỏi:** Model phục vụ ở đâu, latency thật là bao nhiêu, và nếu model service chết thì backend phản ứng ra sao?

*(đang dò: hiểu kiến trúc serving và xử lý lỗi khi dependency down.)*

**Đáp:** Model chạy trong một container model service riêng, backend gọi qua HTTP nội bộ. Checkpoint phục vụ khoảng 70 MB, latency khoảng 0.3–1 giây mỗi ảnh trên instance CPU 2 core 8 GB. Nếu model service không gọi được, đây là một exception flow đã định nghĩa: backend trả lỗi cho client thay vì treo, đúng như đặc tả use case UC-01.

**Nếu truy tiếp:** Em chưa có retry/circuit-breaker hay health-check tự động restart ở mức orchestration; hiện chỉ là lỗi tường minh trả về. Có cache theo hash ảnh trong infer server để tránh tính lại ảnh trùng. Để production cần thêm giám sát và auto-restart container.

### Câu 5 — /detect/video là async thật hay giả? 🔴 4

**Hỏi:** Endpoint /v1/detect/video trả job_id và status queued. Đó là hàng đợi bất đồng bộ thật, hay chỉ xử lý ngay rồi gắn nhãn cho đẹp?

*(đang dò: phân biệt async queue thật vs giả-async; tôi đã đọc code router.)*

**Đáp:** Em nói thẳng: hiện endpoint video tạo một bản ghi Job trong DB, xử lý lấy mẫu frame và inference trong cùng request rồi cập nhật job thành COMPLETED, có endpoint /jobs/{job_id} để truy vấn. Nó dùng mô hình job/poll đúng như contract, nhưng chưa phải worker queue chạy nền tách biệt cho video rất dài, đó là điểm em cần làm rõ.

**Nếu truy tiếp:** Nghĩa là với video lớn thật, kiến trúc job/poll đã có chỗ để cắm worker nền, nhưng hiện luồng xử lý vẫn nội tuyến. Em không tuyên bố đã có hàng đợi phân tán; đó là việc tiếp theo. Có lưu video gốc lên S3 cho mục đích audit.

### Câu 6 — Ai gọi được API, RBAC kiểm ở đâu? 🔴 4

**Hỏi:** Ai được phép gọi API detect? Phân quyền RBAC được kiểm ở đâu, và token đăng nhập lưu thế nào?

*(đang dò: RBAC có thực thi ở server không hay chỉ ẩn nút ở frontend.)*

**Đáp:** Có hai lớp xác thực tách biệt: token đăng nhập gate dashboard, và API key gate tích hợp eKYC bên ngoài. Mỗi lần gọi detect tiêu một đơn vị quota tháng của tenant và bị ràng theo tenant. Có sáu vai (Anonymous đến Sysadmin) với phạm vi quyền khác nhau, và backend kiểm vai bằng require_role.

**Nếu truy tiếp:** Em phải thừa nhận một giới hạn đã ghi trong báo cáo: route guarding hiện làm ở phía client với token lưu trong trình duyệt, chưa có bảo vệ route phía server đầy đủ; và trang tài liệu API (Swagger) đang để công khai cho tiện demo. Cả hai chấp nhận được cho demo nhưng PHẢI đóng trước khi đưa ra production.

### Câu 7 — Audit trail và cách ly multi-tenant? 🔴 3

**Hỏi:** Với eKYC, hệ thống lưu bằng chứng và log thế nào để sau này compliance còn truy được? Dữ liệu giữa các tenant có lẫn không?

*(đang dò: có audit trail thật cho ngành ngân hàng không; cách ly multi-tenant.)*

**Đáp:** DB là PostgreSQL thiết kế quanh multi-tenant: mỗi tenant sở hữu user, API key và bản ghi riêng, mỗi bảng mang tenant_id để cách ly. Hệ thống lưu hai loại bản ghi (deepfake detection và liveness check) cùng một audit log ghi ai làm gì. Vai Compliance có hàng đợi flagged xem dữ liệu đầy đủ và đính kèm note điều tra để truy vết. Video gốc và media đầu vào lưu lên S3 cho audit.

**Nếu truy tiếp:** Cách ly hiện ở tầng ứng dụng qua tenant_id và truy vấn lọc theo tenant, chưa phải row-level security ở tầng DB. Với Viewer thì dữ liệu cá nhân được mask. Đây là mức phù hợp demo; ngân hàng thật sẽ cần siết thêm ở tầng DB và mã hóa.

### Câu 8 — Cascade liveness→deepfake đã nối thông chưa? 🔴 4

**Hỏi:** Báo cáo nói luồng eKYC chạy liveness trước rồi mới detect deepfake. Cái cascade đó đã nối thông end-to-end trong code chưa, hay hai service còn rời?

*(đang dò: cascade có thật end-to-end không, hay mới là sequence diagram.)*

**Đáp:** Sequence diagram mô tả đúng ý đồ: liveness chạy trước, chỉ frame nào được xác định là live mới chuyển sang tầng deepfake. Nhưng em trung thực rằng scorer liveness hiện được phục vụ như một microservice riêng, và việc nối nó vào sau endpoint cascade vẫn là một hạng mục tích hợp chưa hoàn tất, em đã ghi rõ điều này trong phần kết quả liveness.

**Nếu truy tiếp:** Nghĩa là từng mảnh chạy được độc lập (detect deepfake thật, liveness thật), nhưng đường ống cascade hợp nhất một lệnh gọi thì chưa khâu xong. Em không trình bày nó như đã liền mạch.

### Câu 9 — Threshold 0.9514 đặt trên tập nào, có khả chuyển? 🔴 5

**Hỏi:** Ngưỡng eKYC FPR 5% và threshold 0.9514 đó em đặt trên tập nào? Demo với khuôn mặt người Việt thì còn đúng không?

*(đang dò: ngưỡng có bị đặt trên test set lạc quan không, và tính khả chuyển.)*

**Đáp:** Em phải nói thật: 5% FPR là lựa chọn kỹ thuật của em theo chuẩn quốc tế ISO/IEC 30107-3, KHÔNG phải con số Thông tư 17/2024 bắt buộc — Thông tư chỉ yêu cầu định tính, em chọn 5% để thỏa yêu cầu định tính đó một cách định lượng. Threshold 0.9514 hiện được hiệu chỉnh trực tiếp trên điểm của test set vì em chưa tách validation riêng, nên FPR đo được đúng 0.0500 nhưng đây là cách đặt lạc quan. Tại ngưỡng đó TPR chỉ 0.2298 (~23% frame). Khi triển khai thật phải hiệu chỉnh lại trên phân phối đích là khuôn mặt người Việt.

**Nếu truy tiếp:** Em có sẵn confusion tại ngưỡng đó để chứng minh không bịa: TN 5339 / FP 281 / FN 8318 / TP 2482, ACC 0.476, F1 0.366. Vì catch-rate single-frame chỉ ~23% nên em không định vị model như cổng chặn độc lập mà là tầng chấm điểm rủi ro đầu tiên; aggregate mức video lên ~36%, vùng nghi ngờ đưa người review lên ~47–54%. Em không giấu con số catch-rate thấp này.

### Câu 10 — Mạng chậm/container rớt giữa demo, kế hoạch B? 🔴 2

**Hỏi:** Nếu giữa buổi demo live mạng chậm hoặc container model rớt, em có phương án dự phòng gì để không vỡ buổi bảo vệ không?

*(đang dò: có lường rủi ro demo live và có kế hoạch B không.)*

**Đáp:** Em có chuẩn bị: một là demo trên instance cloud đã warm-up sẵn model để tránh độ trễ lần gọi đầu; hai là có sẵn bản ghi màn hình và screenshot kết quả thật (detect ảnh, Grad-CAM, history, API keys) làm phương án dự phòng nếu mạng có vấn đề. Vì inference đo được chạy CPU 0.3–1 giây/ảnh nên không bắt buộc phụ thuộc GPU, giảm rủi ro.

**Nếu truy tiếp:** Nếu thầy muốn, em demo cả đường gọi qua Swagger /docs lẫn qua giao diện để hội đồng thấy cùng một kết quả từ hai phía. Em cũng chuẩn bị sẵn ảnh đầu vào có mặt rõ để tránh rơi vào nhánh không phát hiện được mặt.

### Câu 11 — Chỗ nào CHẠY THẬT, chỗ nào mock/PLANNED? 🔴 5

**Hỏi:** Trong toàn bộ hệ thống, chỗ nào là CHẠY THẬT và chỗ nào còn là mock hoặc PLANNED? Em liệt kê thẳng cho hội đồng.

*(đang dò: sự trung thực tổng thể về ranh giới thật/mock — câu chốt.)*

**Đáp:** CHẠY THẬT: detect ảnh deepfake (ckpt ~70 MB, Grad-CAM, ~0.3–1s), detect video (job/poll, xử lý nội tuyến), liveness nhị phân live/spoof, RBAC sáu vai (require_role), multi-tenant DB + audit log, API key + quota, deploy Docker bốn container sau HTTPS. PLANNED/gap em nói thẳng: spoof_type kiểu tấn công (mới là API contract, chưa có model đứng sau), cascade liveness-trước-deepfake nối liền một lệnh (từng mảnh chạy độc lập, đường ống hợp nhất chưa khâu xong), worker queue nền cho video dài, route guard phía server đầy đủ (hiện guard ở client + Swagger để công khai cho demo), threshold hiệu chỉnh trên người Việt, và đánh giá liveness cross-dataset.

**Nếu truy tiếp:** Em chủ trương báo cáo trung thực: đóng góp chính của luận văn là tính chặt chẽ phương pháp và một hệ thống giải thích được chạy ~0.3–1s/ảnh, chứ không phải con số AUC hay một sản phẩm production hoàn chỉnh. Đây là bản demo end-to-end, không phải bản hardened. Em ghi rõ mọi gap thay vì che.

> **Tránh làm họ khó chịu:** Đừng trình bày feature mới là thiết kế (spoof_type, cascade nối liền, async queue) như thể đã chạy thật — sẽ bị bắt ngay khi đối chiếu code. Đừng dùng từ "đã triển khai production" cho một bản chỉ demo trên một instance Docker đơn. Đừng né câu "mở app lên xem ngay". Đừng nói cứng RBAC chặt chẽ trong khi route guard ở client và Swagger để công khai. Đừng để ngưỡng 5% FPR trông như Thông tư 17 bắt buộc — đó là sai sự thật. Đừng giấu catch-rate single-frame ~23%. Đừng để lệch giữa lời nói (CPU/GPU) và những gì /health hiển thị.

---

## Thành viên 3 — Phản biện method / dữ liệu / train

> **Persona:** Giảng viên/nghiên cứu viên có nền ML và xử lý tín hiệu vững, đọc kỹ từng công thức và từng con số trong bảng. Hỏi chậm, truy sâu; chỉ quan tâm phương pháp có đứng vững về mặt khoa học không, kết luận có được dữ liệu chống lưng không. Coi trọng tính trung thực thống kê hơn con số to; CHO ĐIỂM CAO nếu sinh viên dám nói thẳng "cải thiện nằm trong nhiễu, không SOTA" thay vì phóng đại. Ghét nhất là khoe AUC như thành tựu khi CI đã chứa 0.

> **Mở màn:** "Trước khi vào method, tôi muốn em xác nhận một điều: bảng 4.4 cho thấy mọi khoảng tin cậy video-level đều chứa số 0. Vậy đóng góp khoa học thực sự của luận văn này là gì — vì rõ ràng không phải con số AUC?"

### Câu 1 — Luồng dữ liệu nhánh tần số, 48-D ghép vào cross-attention thế nào? 🔴 3

**Hỏi:** Em mô tả lại giúp tôi luồng dữ liệu của nhánh tần số: từ crop 256px đi qua YCbCr, block-DCT 8×8, log-magnitude, zigzag 16 band, ra 48 chiều. Vậy 48 chiều đó được đưa vào cross-attention như key/value với spatial feature map của B4 thế nào — chiều không khớp thì chiếu ra sao?

*(đang dò: sinh viên có thực sự hiểu pipeline mình build hay chỉ chép, đặc biệt chỗ 48-D ghép với feature map B4 1792 kênh.)*

**Đáp:** Spatial stream B4 cho feature map F_s với 1792 kênh ở tầng cuối. Nhánh tần số cho descriptor 48-D (16 band × 3 kênh YCbCr). Trong cross-attention, F_s đóng vai query Q = W_q F_s, còn descriptor 48-D được chiếu tuyến tính W_k và W_v thành key và value trong cùng không gian d_k, nên việc lệch chiều 48 vs 1792 được hai ma trận chiếu W_k, W_v xử lý. context = softmax(QKᵀ/√d_k) V, rồi cộng lại qua gate: F_fused = F_s + α · context, α khởi tạo 0.

**Nếu truy tiếp:** Nói thật: 48-D là descriptor toàn cục/theo vùng nén lại rất nhỏ, nên cross-attention ở đây gần với việc mỗi vị trí không gian truy vấn một bộ nhớ tần số rất cô đọng. Đây vừa là điểm gọn nhẹ (chạy CPU ~1s) vừa là giới hạn: 48-D có thể quá nghèo để mang đủ thông tin tần số phân biệt, và đó là một phần lý do gain nhỏ.

### Câu 2 — Vì sao block-DCT 48-D thủ công, không FAD/nhánh học được? 🔴 4

**Hỏi:** Vì sao chọn block-DCT 48-D thủ công mà không dùng FAD của F3Net hay nhánh tần số học được? FAD học bộ lọc tần số end-to-end, còn em cố định 16 band trung bình. Cố định như vậy chẳng phải vứt thông tin sao?

*(đang dò: có nắm landscape phương pháp tần số không, và có lý do thiết kế chứ không phải chọn bừa.)*

**Đáp:** Đúng là FAD/F3Net học bộ lọc tần số, còn block-DCT của em là descriptor cố định, có mất mát thông tin do trung bình trong band. Em chọn block-DCT vì ba lý do: nó căn đúng lưới lượng tử JPEG 8×8 nơi vết nén và vết blending lộ rõ nhất; nó diễn giải được (từng band ánh xạ rõ vào vùng tần số, phục vụ yêu cầu explainable cho eKYC); và nó cực nhẹ, chạy được CPU ~1s phục vụ serving. Em không tuyên bố block-DCT tốt hơn FAD về AUC — ở best-frame SFDCT-HFF 0.7695 có nhỉnh hơn SPSL 0.7650 nhưng đó là best-checkpoint giữa epoch (test-peeking) nên em không tuyên bố vượt, còn trên mean-over-run (HFF 0.7236) và video-level (paired CI chứa 0) thì phương pháp không tách khỏi baseline. Đóng góp của em là tính chặt chẽ và khả năng triển khai, không phải vượt FAD.

**Nếu truy tiếp:** Thừa nhận thẳng: nếu mục tiêu là tối đa AUC cross-dataset thì một nhánh tần số học được nhiều khả năng tốt hơn, và đó là hướng tương lai. Em đã pre-screen bằng linear-probe trên biểu diễn block-DCT và thấy nó gần mức ngẫu nhiên cross-dataset — nghĩa là block-DCT KHÔNG TUYẾN TÍNH tách được, đủ để em không kỳ vọng nó là đòn bẩy AUC lớn; nhưng qua cross-attention phi tuyến nó vẫn đóng góp một chút (gate dương). Hai điều đó nhất quán: tín hiệu yếu, không tuyến tính, đóng góp khiêm tốn.

### Câu 3 — Block-DCT nhạy với sai số căn chỉnh, có đo không? 🔴 3

**Hỏi:** Tiền xử lý: em nói căn chỉnh nghiêm ngặt vì block-DCT chia lưới 8×8 cố định. Nhưng MTCNN căn theo 5 landmark, sai số vài pixel là bình thường. Lệch nửa block thì thống kê per-band hỏng. Em có đo độ nhạy của descriptor với sai số căn chỉnh không?

*(đang dò: có nhận ra điểm yếu vật lý của block-DCT phụ thuộc căn chỉnh và có kiểm chứng định lượng không.)*

**Đáp:** Em chưa chạy thí nghiệm độ nhạy định lượng với jitter căn chỉnh — đây là một thiếu sót em ghi nhận. Em xử lý gián tiếp bằng cách cache crop một lần theo đúng protocol DeepfakeBench để mọi config dùng chung crop, nên so sánh giữa các model là công bằng (cùng nhiễu căn chỉnh). Nhưng đúng là về tuyệt đối, sai số căn chỉnh là nguồn nhiễu cho per-band statistics, và nó là một trong các lý do plausible khiến nhánh tần số chỉ đóng góp nhỏ.

**Nếu truy tiếp:** Nói rõ hướng kiểm chứng: thí nghiệm cần làm là thêm jitter dịch ±1–3px trước block-DCT rồi đo dao động của 48-D và của AUC. Em chưa làm vì ngân sách GPU một seed đã tốn ~5h/run, nhưng em không giấu rằng kết luận sẽ vững hơn nếu có nó.

### Câu 4 — JPEG aug xóa chính tín hiệu nhánh tần số đọc? 🔴 4

**Hỏi:** Augmentation của em có JPEG compression quality 40–100 lúc train. Nhánh tần số đọc chính vết tần số cao. JPEG chính là bộ lọc thông thấp phá vết tần số cao. Em vừa dạy nhánh tần số đọc band cao, vừa xóa band cao bằng augmentation — có mâu thuẫn không?

*(đang dò: hiểu tương tác giữa augmentation và tín hiệu mà method dựa vào — chỗ tinh tế dễ lộ hiểu hời hợt.)*

**Đáp:** Đây là sự đánh đổi có chủ đích chứ không phải sơ suất. JPEG aug làm mô hình bền hơn với nén ở triển khai thực (eKYC nhận ảnh nén), nhưng đúng là nó làm mờ chính tín hiệu band cao mà nhánh tần số khai thác. Em đã nêu thẳng trong báo cáo: khoảng cách năng lượng band cao giữa real và fake nhỏ hơn trên dữ liệu nén, và đó là lý do trung thực vì sao cải thiện tần số dự kiến khiêm tốn. Nó cũng nhất quán với gate mở rất ít.

**Nếu truy tiếp:** Một ablation hợp lý là train không có JPEG aug để xem nhánh tần số có đóng góp lớn hơn không, đánh đổi với độ bền nén. Em chưa chạy do giới hạn seed/GPU, nhưng em không khẳng định gain sẽ lớn — pre-screen cho thấy biểu diễn block-DCT yếu cross-dataset bất kể.

### Câu 5 — best 0.7572 vs mean 0.7140: chọn trên test set? 🔴 5

**Hỏi:** Cột mean-over-run của em thấp hẳn so với best: baseline best 0.7497 nhưng mean chỉ 0.7082; SFDCT 0.7572 vs 0.7140. Vậy 0.7572 là best-checkpoint chọn TRÊN tập test. Đó chẳng phải là chọn lựa trên test set, tức rò rỉ và lạc quan hóa sao?

*(đang dò: có hiểu và dám thừa nhận test-set selection bias không — đòn nặng về tính hợp lệ.)*

**Đáp:** Em thừa nhận hoàn toàn: con số best-frame được chọn từ checkpoint mà framework lưu dựa trên đánh giá test hai lần mỗi epoch, nên nó lạc quan và có yếu tố chọn trên test. Chính vì vậy em báo cáo CẢ HAI cột — best và mean-over-run (SFDCT 0.7140 ± 0.0253) — để người đọc thấy khoảng cách đó và không bị đánh lừa. HFF-R3 0.7695 thậm chí đạt ở một lần đánh giá NỬA-EPOCH khôi phục từ console capture, em ghi rõ điều này trong caption Figure 4.6. Em không che. Kết luận an toàn duy nhất rút ra là ở mức video-level với bootstrap, nơi mọi CI chứa 0.

**Nếu truy tiếp:** Cách làm đúng là tách validation split riêng để chọn checkpoint, rồi báo cáo test một lần. Em chưa làm và ghi nhận là hạn chế (threshold τ cũng đang set trực tiếp trên test do chưa carve validation). Nếu thầy muốn con số phòng thủ được, hãy dùng mean-over-run hoặc video-level CI, không dùng best-frame.

### Câu 6 — Rò rỉ identity giữa FF++ và Celeb-DF? 🔴 3

**Hỏi:** Em chắc chắn không có rò rỉ giữa train FF++ và test Celeb-DF-v2 chứ? Hai dataset khác nguồn thì có vẻ an toàn, nhưng cùng nhân vật người nổi tiếng có thể trùng identity. Em kiểm soát rò rỉ ở mức nào — frame, video, hay identity?

*(đang dò: có hiểu các tầng rò rỉ frame/video/identity và protocol thật sự chặn ở đâu.)*

**Đáp:** Em không nói "chắc chắn không leak", em nói chính xác chặn được tới đâu. Rò rỉ frame-trong-video được chặn bằng split theo video của protocol DeepfakeBench: 32 frame của một video không bị rải sang cả train và test trong cùng dataset. Rò rỉ nguồn thì train hoàn toàn trên FF++, test hoàn toàn trên Celeb-DF-v2, đúng cross-dataset chuẩn. Còn identity-level trùng giữa hai dataset em CHƯA đo trực tiếp — đó là hạn chế. Lập luận gián tiếp: nếu leak nặng thì AUC đã cao bất thường, nhưng nó chỉ 0.76. Và ở liveness em ĐÃ chủ động hash toàn bộ và tìm thấy 73 ảnh trùng (48 train∩eval + 25 dev∩eval) trong bộ official — chứng tỏ em có thói quen kiểm leak, không chủ quan.

**Nếu truy tiếp:** Phần liveness em có assert no train-test overlap theo folder official của LCC-FASD, và khi loại 73 ảnh leak đó ra thì AUC còn TĂNG 0.9829→0.9858, nghĩa là leak không thổi số. Tinh thần kiểm leak đó em áp cho cả deepfake; identity-level chéo FF++↔CDFv2 là việc em ghi rõ cần làm thêm.

### Câu 7 — Gate alpha gần đóng, nhánh tần số có đóng góp gì? 🔴 5

**Hỏi:** Gate alpha của em: mean +0.000, max trị tuyệt đối chỉ 0.0232 trên 1792 kênh. Nói thẳng, gate gần như đóng hoàn toàn. Vậy nhánh tần số có thực sự đóng góp gì, hay AUC nhích lên chỉ là dao động ngẫu nhiên của một seed?

*(đang dò: đòn chốt — dám diễn giải đúng cái gate gần-đóng thay vì bịa ra ý nghĩa.)*

**Đáp:** Em xin nói chính xác con số: mean |α| ≈ 1.5×10⁻⁴ (gần 0 nhưng KHÁC 0), peak |α| = 0.0232, chỉ 44/1792 kênh > 10⁻³ (hầu hết kênh đóng). Mean gần 0 đúng như thầy nói, nhưng nó KHÔNG đúng bằng 0 và một số ít kênh có |α| lên tới 0.0232 — nghĩa là gate MỞ MỘT CHÚT có chủ đích ở vài kênh, không phải đóng cứng hoàn toàn — và nó khớp với việc mean-over-run của HFF (0.7236) chỉ nhỉnh hơn baseline (0.7082) một biên độ nhỏ. Em KHÔNG tuyên bố nhánh tần số đóng góp lớn. Em tuyên bố ba điều khớp nhau cùng chỉ một hướng: vài kênh gate mở nhẹ, t-SNE sạch hơn chút, catch-rate nhỉnh hơn ở FPR thấp — tín hiệu tần số CÓ thật nhưng KHIÊM TỐN. Vì α chính là thước đo đóng góp theo thiết kế zero-init, một α gần 0 với đỉnh chỉ 0.0232 là bằng chứng trung thực rằng branch chỉ giúp ít, không phải bằng chứng nó vô dụng hoàn toàn.

**Nếu truy tiếp:** Phân biệt rạch ròi: gate dương nhỏ KHÁC với AUC tăng có ý nghĩa thống kê. Cái sau em đã bác bằng bootstrap video-level (CI chứa 0). Nên kết luận cuối: branch học được dùng một chút tín hiệu, nhưng chút đó không đủ để tách khỏi nhiễu một-seed ở mức video. Em không vượt qua lằn ranh đó.

### Câu 8 — Bootstrap đo nhiễu test-sampling, không đo nhiễu seed — đánh tráo? 🔴 5

**Hỏi:** Một seed thì em kết luận được gì về khoa học? Bootstrap 2000 lần của em chỉ resample 518 video của MỘT lần train — nó đo nhiễu lấy mẫu test, không đo nhiễu khởi tạo/seed. Hai nguồn nhiễu khác nhau. Em đang đánh tráo không?

*(đang dò: phân biệt được bootstrap test-sampling variance vs multi-seed training variance — chỗ này sai là sập về thống kê.)*

**Đáp:** Thầy nói đúng và em không đánh tráo: đây là hai nguồn bất định khác nhau. Bootstrap 518 video chỉ định lượng bất định do LẤY MẪU TẬP TEST với một mô hình đã train cố định. Nó KHÔNG bắt được bất định do seed/khởi tạo/thứ tự batch khi train. Vì vậy CI chứa 0 của em là điều kiện cần nhưng theo MỘT chiều an toàn — nó cho thấy ngay cả khi BỎ QUA nhiễu train thì gain đã không tách khỏi 0. Multi-seed sẽ chỉ làm khoảng bất định RỘNG THÊM, không hẹp lại, nên kết luận "không có ý nghĩa thống kê" chỉ càng vững. Em ghi rõ single-seed là hạn chế cốt lõi.

**Nếu truy tiếp:** Nói thẳng giới hạn: em KHÔNG được phép kết luận chiều ngược lại — không thể nói "HFF tốt hơn" chỉ vì central diff +0.007, vì đó đã nằm trong nhiễu test-sampling rồi, chưa cộng nhiễu seed. Để khẳng định bất kỳ thứ tự nào có ý nghĩa, cần ≥3–5 seed mỗi config; đó là việc tương lai do mỗi run tốn ~5h GPU thuê.

### Câu 9 — Vì sao không multi-seed, vì sao không SBI? 🔴 5

**Hỏi:** Vậy vì sao em không chạy multi-seed, và vì sao không dùng SBI (self-blended images) — phương pháp được biết là nâng generalization cross-dataset đáng kể? Nếu mục tiêu là tổng quát hóa thì SBI hợp lý hơn nhiều block-DCT.

*(đang dò: có biết SOTA-direction SBI và trung thực về lý do không theo, hay né tránh.)*

**Đáp:** Hai câu hỏi. Multi-seed: thuần túy ngân sách — mỗi full run ~5.1–5.4h GPU thuê, nhân nhiều seed nhân nhiều config vượt ngân sách luận văn; em chọn báo cáo trung thực một seed kèm bootstrap thay vì giả vờ có nhiều seed. SBI: em biết SBI là hướng mạnh cho generalization và trong kế hoạch ban đầu em từng định kết hợp nhánh block-DCT với train kiểu SBI. Nhưng pre-screen linear-probe cho thấy biểu diễn block-DCT gần mức ngẫu nhiên cross-dataset, nên em không kỳ vọng block-DCT là đòn bẩy AUC, và em định vị lại đóng góp về tính chặt chẽ + hệ thống giải thích được thay vì chạy theo SOTA bằng SBI.

**Nếu truy tiếp:** Thừa nhận thẳng: nếu hội đồng muốn một luận văn TỐI ĐA HÓA AUC cross-dataset thì SBI + một nhánh tần số học được là lựa chọn đúng hơn block-DCT cố định + zero-gate. Em đã chọn con đường trung thực-âm-tính: báo cáo rõ block-DCT không phải lời giải AUC, và đặt giá trị vào method rigor (zero-init floor tại khởi tạo), đánh giá cross-dataset thật thà, và serving CPU ~1s. Em không phóng đại.

### Câu 10 — Liveness 0.98 in-dataset, B4+DCT thấp hơn, 314 ảnh genuine — khoe con số rỗng? 🔴 3

**Hỏi:** Liveness AUC 0.9829 nghe rất cao so với deepfake 0.76. Nhưng đó là in-dataset LCC-FASD, và B4+DCT (0.9776) còn THẤP hơn B4. BPCER 10.83% dựa trên chỉ 314 ảnh genuine. Em có đang khoe một con số không có ý nghĩa không?

*(đang dò: có phân biệt in-dataset vs cross-dataset và dám hạ thấp con số đẹp của chính mình không.)*

**Đáp:** Em không khoe nó như thành tựu chính. Em ghi rõ: liveness là module phụ, 0.9829 là in-dataset (train và test cùng LCC-FASD), nên không so được với 0.76 cross-dataset của deepfake — hai chế độ đánh giá khác nhau hoàn toàn. Quan trọng hơn, nó LẶP LẠI đúng phát hiện chính: nhánh tần số KHÔNG cải thiện (0.9776 < 0.9829, chênh Δ−0.0053, nằm trong nhiễu khi chỉ 314 ảnh genuine chống lưng BPCER). Em báo cáo đây như một negative trung thực, không giấu, và nói rõ cross-dataset liveness là việc tương lai.

**Nếu truy tiếp:** Thừa nhận: 314 ảnh genuine là quá ít để BPCER 10.83% có khoảng tin cậy hẹp; lẽ ra nên kèm CI cho BPCER. Con số cao chủ yếu vì in-dataset, dễ phồng. Em còn chủ động hash bộ official và phát hiện 73 ảnh trùng train/dev∩eval; loại đi thì AUC còn TĂNG 0.9858, chứng minh leak không thổi số. Em định vị liveness là pre-filter rẻ trong cascade, không phải đóng góp khoa học độc lập.

### Câu 11 — Khác gì gắn một nhánh vô hại? Đóng góp KHÔNG-TẦM-THƯỜNG? 🔴 4

**Hỏi:** Cuối cùng, nếu mọi cải thiện đều nằm trong nhiễu và gate gần đóng, thì luận văn này khác gì việc chỉ train lại EfficientNet-B4 rồi gắn thêm một nhánh vô hại? Đóng góp KHÔNG-TẦM-THƯỜNG của em là gì?

*(đang dò: câu tổng kết — buộc sinh viên phát biểu đóng góp thật mà không phóng đại; sập nếu bịa SOTA, đậu nếu phát biểu đúng tầm.)*

**Đáp:** Đóng góp không nằm ở con số AUC, và em phát biểu đúng như vậy. Ở best-frame (Bảng 4.4) SFDCT-HFF 0.7695 có nhỉnh hơn SPSL 0.7650, nhưng đó là best-checkpoint giữa epoch (test-peeking) nên em không tuyên bố vượt; còn trên mean-over-run (B4 0.7082, SFDCT 0.7140, HFF 0.7236) và video-level (mọi paired CI vs baseline đều chứa 0) thì phương pháp KHÔNG tách khỏi baseline — em không vượt có ý nghĩa, không SOTA. Cái khác với "gắn nhánh vô hại" là ba điều cụ thể. Một, thiết kế zero-init gate cho điểm KHỞI ĐẦU an toàn — model bắt đầu đúng bằng B4 nên không có cú sốc âm khi thêm nhánh; em nói rõ đây là tính chất tại khởi tạo, KHÔNG bảo chứng nghiệm cuối, bằng chứng Row1 sau train xuống 0.7333 (ablation mở rộng em từng chạy, NGOÀI Bảng 4.4 — chỉ nêu nếu có trong phụ lục bản nộp của em). Hai, đánh giá cross-dataset TRUNG THỰC: tái lập đúng baseline công bố (0.7497 vs 0.7487, lệch 0.001) làm control, báo cáo best VÀ mean, bootstrap video-level cho thấy gain trong nhiễu — một negative result lượng hóa đàng hoàng có giá trị khoa học hơn một con số phồng. Ba, hệ thống giải thích được chạy CPU ~1s/ảnh, triển khai thật trong cascade eKYC với threshold buộc theo FPR≤5%.

**Nếu truy tiếp:** Nói thẳng giới hạn để không phóng đại: nếu thước đo duy nhất là AUC cross-dataset thì luận văn này KHÔNG vượt baseline có ý nghĩa và KHÔNG SOTA — em xác nhận điều đó. Giá trị nằm ở việc làm đúng quy trình khoa học và rút ra kết luận âm tính đáng tin, cộng một hệ thống chạy được. Em thà bảo vệ một negative trung thực còn hơn một positive không tái lập được.

> **Tránh làm họ khó chịu:** Đừng khoe AUC (0.7695, 0.98) như thành tựu khi CI đã chứa 0 — đây là điều làm TV3 khó chịu nhất. Đừng nói "nhánh tần số cải thiện đáng kể" khi gate max chỉ 0.023 và gain trong nhiễu. Đừng lẫn bootstrap (nhiễu test) với multi-seed (nhiễu train). Đừng so liveness 0.98 in-dataset với deepfake 0.76 cross-dataset như cùng thang. Đừng né "vì sao block-DCT chứ không FAD/SBI" bằng lời chung chung. Đừng lấp liếm best-checkpoint chọn trên test và threshold set trực tiếp trên test. Đừng tuyên bố HFF tốt hơn vì central diff +0.007. Đừng nói "chắc chắn không leak" — em ĐÃ gặp leak ở liveness. Đừng để "mean ≈ 0" đứng một mình (nghe như gate đóng cứng) — luôn kèm "mean |α| ≈ 1.5×10⁻⁴, KHÁC 0; 44/1792 kênh mở tới peak |α| 0.0232" để cho thấy gate mở một chút có chủ đích chứ không vô dụng.

---

## Killer questions (khó nhất, xuyên suốt)

### KQ1 — Bỏ chữ "trung thực", còn lại đóng góp kỹ thuật gì?
*(Ai hỏi: TV1, TV3 đồng tình — đòn nặng nhất, tách "trung thực" khỏi luận điểm)*

Thầy đúng, em không bảo vệ "trung thực" như thành tựu. Bỏ nó đi, còn lại HAI thứ kỹ thuật đứng độc lập với mọi con số. Thứ nhất, thiết kế zero-init gated cross-attention cho hợp nhất tần số: tại khởi tạo α=0 nên fused feature ĐÚNG bằng spatial feature (phương trình 2.5), model mới khởi hành chính xác từ B4 — tính chất kiểm chứng được bằng phương trình, đúng bất kể seed. Em nói rõ phạm vi: nó đảm bảo KHỞI ĐẦU an toàn, KHÔNG đảm bảo nghiệm cuối ≥ B4 (bằng chứng Row1 sau train xuống 0.7333 — ablation mở rộng em từng chạy, NGOÀI Bảng 4.4, chỉ nêu nếu có trong phụ lục bản nộp). Thứ hai, chính α học được trở thành DỤNG CỤ ĐO định lượng mức đóng góp tần số trên dữ liệu nén — mean |α| ≈ 1.5×10⁻⁴ (gần 0 nhưng KHÁC 0), peak |α| = 0.0232, chỉ 44/1792 kênh > 10⁻³ (hầu hết kênh đóng): một chẩn đoán, không phải lời khẳng định. Hai thứ này là đóng góp về cách thiết kế và đo lường, không phải về AUC. Em không phát minh zero-init residual gating (đó là ReZero); em đóng góp cách ÁP nó như floor có chủ đích cho bài toán hợp nhất tần số rồi dùng chính gate làm thước đo — một cách dùng sạch sẽ cho một câu hỏi cụ thể, đủ tầm đồ án.

### KQ2 — Một seed kết luận được gì? Bootstrap có đánh tráo nhiễu không?
*(Ai hỏi: TV3 — câu chốt về tính hợp lệ thống kê)*

Em không đánh tráo và xin tách rạch ròi hai nguồn bất định. Bootstrap resample 518 video với MỘT mô hình đã train cố định chỉ định lượng bất định do LẤY MẪU TẬP TEST; nó KHÔNG bắt bất định do seed/khởi tạo/thứ tự batch. Vì vậy kết luận em rút ra chỉ theo MỘT chiều an toàn: ngay cả khi BỎ QUA nhiễu train, gain đã không tách khỏi 0 (mọi CI chứa 0). Cộng nhiễu seed vào chỉ làm khoảng RỘNG THÊM, nên "không có ý nghĩa thống kê" chỉ càng vững. Điều em TUYỆT ĐỐI không được phép là tuyên bố chiều ngược lại — không thể nói "HFF tốt hơn" vì central diff +0.007, vì nó đã nằm trong nhiễu test-sampling rồi, chưa cộng nhiễu seed. Single-seed là hạn chế cốt lõi em ghi rõ; để khẳng định bất kỳ thứ hạng nào có ý nghĩa cần ≥3–5 seed/config, mỗi run ~5h GPU thuê, vượt ngân sách đồ án. Em báo cáo một seed + bootstrap trung thực thay vì giả vờ có nhiều seed.

### KQ3 — Khác gì gắn nhánh vô hại? SPSL đã ngang rồi thì cái MỚI là gì?
*(Ai hỏi: TV3 + TV1 — gộp hai mũi: vô hại + không novelty)*

Em phát biểu đúng tầm, không phóng đại. Về AUC: ở best-frame (Bảng 4.4) SFDCT-HFF 0.7695 có nhỉnh hơn SPSL 0.7650, nhưng đó là best-checkpoint giữa epoch (test-peeking) nên em KHÔNG tuyên bố vượt; trên mean-over-run (B4 0.7082, SFDCT 0.7140, HFF 0.7236) và video-level (mọi paired CI vs baseline đều chứa 0) thì phương pháp KHÔNG tách khỏi baseline — em KHÔNG vượt có ý nghĩa, KHÔNG SOTA. Cái khác với "gắn nhánh vô hại" là BA điểm cụ thể, không phải "cẩn thận hơn" chung chung. Một, cách hợp nhất zero-init biến việc thử nhánh tần số từ canh bạc (có thể kéo model xuống) thành thí nghiệm khởi đầu an toàn có kiểm soát — SPSL/SRM không có tính chất khởi tạo này. Hai, dùng CHUNG một backbone cho cả deepfake lẫn liveness, và cả hai miền đều cho cùng kết luận âm (block-DCT không thêm tín hiệu generalizable) — một phát hiện nhất quán hai bài toán, không phải một số lẻ. Ba, gate α là dụng cụ đo giải thích được. Em định vị mình là họ hàng gần của nhóm two-stream spatial-frequency và nói thẳng. Quan trọng: em CHỨNG MINH được vì sao gain nhỏ — dữ liệu nén c23 đã lấy đi tần cao nơi artifact nằm, đo được qua per-band energy gap co lại và α gần 0. Một kết quả âm GIẢI THÍCH ĐƯỢC cơ chế, dưới giao thức đủ chặt, là kiến thức cảnh báo người sau; khác hẳn một thí nghiệm thất bại không biết vì sao.

### KQ4 — best 0.7572 vs mean 0.7140: con số nào PHÒNG THỦ ĐƯỢC?
*(Ai hỏi: TV3 — đòn test-set selection bias)*

Em thừa nhận hoàn toàn: best-checkpoint được framework lưu dựa trên đánh giá test hai lần mỗi epoch, nên có test-peeking và lạc quan. Chính vì vậy em báo cáo CẢ HAI cột — best VÀ mean±std (0.7140 ± 0.0253) — để hội đồng thấy khoảng cách và không bị đánh lừa; HFF-R3 0.7695 thậm chí là điểm nửa-epoch, em ghi rõ trong caption. Con số PHÒNG THỦ ĐƯỢC không phải best-frame mà là: (1) video-level paired bootstrap với CI chứa 0, và (2) mean-over-run, nơi thứ hạng SFDCT>B4>Row1 vẫn giữ qua cả bốn giao thức nhưng biên độ nhỏ hơn std. Cách làm đúng lẽ ra là carve validation split riêng để chọn checkpoint rồi report test một lần — em CHƯA làm, ghi nhận là hạn chế (threshold τ cũng đang set trực tiếp trên test vì lý do này). Nếu thầy muốn con số em đứng sau bảo vệ, hãy dùng mean-over-run hoặc video-level CI, đừng dùng best-frame.

### KQ5 — Sản phẩm hay nghiên cứu? Ngưỡng 5% FPR có phải Thông tư 17 bắt buộc?
*(Ai hỏi: TV1 khung sản phẩm vs phương pháp + TV2 nguồn ngưỡng 5%)*

Đây là nghiên cứu phương pháp đặt trong bối cảnh eKYC, không phải sản phẩm giao nộp. eKYC là cái khung ÉP em chọn một bài kiểm tra trung thực: cross-dataset (train FF++, test CDFv2), điểm vận hành FPR thấp, và giải thích được — ba ràng buộc đó CÓ ĐỘNG CƠ nhờ eKYC, không khắt khe trang trí. Về ngưỡng: em phải nói thật, 5% FPR KHÔNG phải con số Thông tư 17/2024 bắt buộc — Thông tư chỉ yêu cầu ĐỊNH TÍNH. 5% là lựa chọn kỹ thuật của em theo chuẩn quốc tế ISO/IEC 30107-3 để THỎA yêu cầu định tính đó một cách định lượng. Em không bao giờ nói Thông tư ép 5%. Tại ngưỡng 0.9514, TPR chỉ 0.2298 (~23% frame), nên em định vị model là tầng chấm điểm rủi ro đầu tiên trong cascade, không phải cổng chặn độc lập — aggregate video lên ~36%, vùng review-band lên ~47–54%. Em không giấu catch-rate thấp này; nó chính là lý do cần cascade liveness + human review.

### KQ6 — Để 0.98 liveness cạnh 0.77 deepfake có lập lờ? 0.98 đáng tin với 314 ảnh genuine?
*(Ai hỏi: TV1 lập lờ + TV3 314 ảnh + in-dataset)*

Em chặn lập lờ này chủ động. 0.9829 là IN-DATASET (train+test cùng LCC-FASD official split), KHÔNG so được với 0.77 CROSS-DATASET của deepfake — hai chế độ đánh giá khác nhau hoàn toàn, đặt cạnh để so độ tốt là sai và em gắn nhãn rõ. Quan trọng hơn, em dùng liveness để CỦNG CỐ luận điểm âm chứ không che: nhánh tần số ở liveness cũng KHÔNG cải thiện (B4 0.9829 → B4+DCT 0.9776, Δ−0.0053 trong nhiễu) — lặp đúng kết luận deepfake. Nếu muốn khoe em đã không tự nói ra 0.9776 thấp hơn. Về độ tin: 314 ảnh genuine là ÍT, BPCER 10.83% nên kèm CI (em chưa làm, ghi nhận). Em còn chủ động hash toàn bộ và phát hiện bộ official tự có 73 ảnh trùng train/dev∩eval — loại đi thì AUC còn TĂNG 0.9858, chứng minh leak không thổi số. Em định vị liveness là pre-filter rẻ trong cascade, không phải đóng góp khoa học độc lập.

### KQ7 — Mở app detect ngay; liệt kê chỗ CHẠY THẬT vs mock/PLANNED
*(Ai hỏi: TV2 — yêu cầu demo live + ranh giới thật/mock)*

Dạ được, em demo live. Hệ thống deploy Docker: frontend, FastAPI backend, model service, PostgreSQL — sau reverse proxy HTTPS. Em mở cả giao diện lẫn /docs Swagger gọi /v1/detect/image để hội đồng thấy request_id, risk_score, verdict, gradcam_b64 từ hai phía. CHẠY THẬT: detect ảnh deepfake (ckpt ~70MB, Grad-CAM, ~0.3–1s), detect video (job/poll, xử lý nội tuyến), liveness nhị phân live/spoof, RBAC sáu vai (require_role), multi-tenant DB + audit log, API key + quota. PLANNED/gap em nói thẳng: spoof_type phân loại kiểu tấn công (mới là API contract, chưa có model đứng sau), cascade liveness-trước-deepfake nối liền một lệnh (từng mảnh chạy độc lập, đường ống hợp nhất chưa khâu xong), worker queue nền cho video dài, route guard phía server đầy đủ (hiện guard ở client + Swagger để công khai cho demo), threshold hiệu chỉnh trên người Việt, đánh giá liveness cross-dataset. Em chủ trương ghi rõ mọi gap, không trình bày thiết kế như đã chạy. Đây là bản demo end-to-end, KHÔNG phải bản hardened production.

---

## Phao khi bí

Dùng khi không có số liệu, hoặc bị truy vào chỗ chưa làm. Giữ giọng bình tĩnh, không xin lỗi quá mức, chuyển ngay sang cái em CHẮC.

- **Chưa chạy thí nghiệm đó:** "Thưa thầy, em chưa chạy thí nghiệm đó nên em không có số liệu để khẳng định. Em biết chính xác phải làm gì: [nêu thiết kế cụ thể, ví dụ thêm jitter ±1–3px trước block-DCT rồi đo dao động 48-D và AUC]. Em chưa làm vì mỗi full run ~5h GPU thuê vượt ngân sách đồ án — em ghi nó là hạn chế/future work, không suy đoán kết quả."

- **Không chắc, không đoán:** "Câu này em không chắc, nên em xin không đoán. Cái em CHẮC là [con số/sự thật đã đo]. Phần thầy hỏi nằm ngoài thứ em đã kiểm chứng, em sẽ ghi nhận để bổ sung."

- **Lệch con số giữa các bảng:** "Em xin đính chính chính mình: con số em vừa nói chưa chắc khớp bản gốc. Giá trị em đứng sau bảo vệ là [con số trong bảng đã verify]; nếu có lệch là do làm tròn giữa bản tóm tắt và bản tính đầy đủ, gốc là [X]." (Ví dụ paired Δ(SFDCT−B4) video-level = −0.012 [−0.044, +0.022], CI chứa 0; nếu bảng ghi −0.011 là do làm tròn, gốc −0.0120.)

- **Bị bắt một điểm yếu thật:** "Thầy nói đúng, đây là điểm yếu của em. Em không biện hộ. Cách làm đúng lẽ ra là [carve validation / multi-seed / kiểm identity-level chéo]; em chưa làm và ghi rõ là hạn chế. Kết luận em rút ra chỉ giới hạn ở chiều an toàn mà dữ liệu hiện có cho phép."

- **Bị ép kết luận mạnh hơn dữ liệu cho phép:** "Em không được phép kết luận điều đó từ dữ liệu một-seed. Cái em kết luận được chỉ là [chiều âm / CI chứa 0]; chiều ngược lại cần thêm bằng chứng em chưa có."

- **Bị nhập nhằng thật/mock:** "Em xin tách bạch: phần này em ĐO được [nêu], phần kia mới là THIẾT KẾ/PLANNED [nêu]. Em không trình bày cái chưa chạy như đã chạy."
