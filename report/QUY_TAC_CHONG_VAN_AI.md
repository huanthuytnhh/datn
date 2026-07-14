# QUY TẮC CHỐNG VĂN PHONG AI — báo cáo DATN

> Rút từ buổi review 12/6/2026: 15 dấu hiệu AI nhận ra trong `_en_v2/01_introduction.md`.
> Áp dụng cho MỌI văn bản báo cáo (EN + VN). Dữ kiện/số liệu giữ nguyên 100% — chỉ chỉnh văn phong.
> Dùng 2 lúc: (1) ràng buộc khi draft, (2) checklist lint trước khi chốt.

## A. Hình thức (dễ bị bắt nhất)

1. **Bold**: chỉ bold thuật ngữ ở lần định nghĩa ĐẦU TIÊN. Tối đa ~1 bold/đoạn.
   Không bold cụm nhấn mạnh giữa câu ("**mid and high** frequency bands" → bỏ bold).
2. **Không khối Takeaway/Tóm lại** lặp cuối mỗi mục. Cần tóm ý → viết thành câu cuối
   tự nhiên của đoạn, không format riêng, không xuất hiện đều mọi section.
3. **Không đề mục câu hỏi tu từ song song** ("Why X?" / "Why Y?" / "Why Z?").
   Cả chương tối đa 1 câu hỏi tu từ, nếu thật sự cần.
4. **Em-dash**: tối đa 1 cặp "— … —" mỗi 2–3 đoạn. Ưu tiên tách câu riêng hoặc mệnh đề phụ.
5. **Phá rule-of-three**: không quá 1 danh sách 3-phần-tử mỗi đoạn; thỉnh thoảng dùng 2 hoặc 4.
6. **Không ngoặc kép quanh ẩn dụ của chính mình** ("washed away", "memorise") —
   hoặc dùng thẳng, hoặc bỏ ẩn dụ.

## B. Ngôn ngữ

7. **Cho phép văn không hoàn hảo có kiểm soát**: trộn mạnh độ dài câu (có câu rất ngắn);
   không đánh bóng 100% — một bài 1.500 từ không lỗi nào + tác giả non-native = tự tố cáo.
8. **Cấm từ register marketing/product**: attack surface, explosive progress, headline metric,
   no sugar-coating, core piece of infrastructure, nhãn in hoa kiểu DEEPFAKE-FIRST.
9. **Acronym phổ biến (CNN, GAN, AUC) không giải nghĩa**; thuật ngữ chuyên sâu giải nghĩa
   đúng 1 lần ở lần xuất hiện đầu.
10. **Bỏ câu nối khuôn**: "This is precisely…", "This is the basis for…",
    "underscores the pressing need" → nối bằng nội dung cụ thể.
11. Chính tả Anh-Anh hay Anh-Mỹ: chọn 1, nhưng không cần đồng nhất tuyệt đối từng hậu tố.

## C. Cấu trúc nội dung

12. **Ý trung tâm phát biểu đầy đủ đúng 1 LẦN**; chỗ khác nhắc bằng tên ngắn
    ("giả thuyết hợp tác hai miền"), không paraphrase nguyên câu lần 2, 3, 4.
13. **Danh sách dài chỉ liệt kê đầy đủ 1 lần** (vd 5 levers SPSL/SRM/FreqDebias/FcaNet/FDFL);
    lần sau viết "năm đòn bẩy tần số (§x.y)".
14. **Disclaimer liêm chính giữ NỘI DUNG, đổi HÌNH THỨC**: đưa vào chính văn như câu
    bình thường, không dồn kiểu ngoặc đơn meta "(no sugar-coating)" lặp đi lặp lại.
15. **Phá song song có chủ đích**: C1–C5/RQ1–RQ3 không cùng khuôn câu, độ dài lệch nhau
    tự nhiên; mục quan trọng viết dài, mục phụ viết cụt.

## D. Quy trình lint (trước khi chốt mỗi chương)

- Đếm: số bold / số em-dash / số khối takeaway / số đề mục dạng câu hỏi → so ngưỡng mục A.
- Tìm các cụm mục B.8, B.10 bằng search.
- Kiểm tra ý trung tâm + danh sách dài xuất hiện mấy lần (mục C).
- Đọc to 1 đoạn bất kỳ: nghe như slide thuyết trình → viết lại đoạn đó.

> Lưu ý trung thực: bộ rule này làm văn bản đọc tự nhiên hơn, KHÔNG làm thay đổi việc
> AI có tham gia soạn thảo. Việc khai báo mức độ hỗ trợ AI với GVHD/hội đồng theo quy định
> của trường là quyết định của tác giả.
