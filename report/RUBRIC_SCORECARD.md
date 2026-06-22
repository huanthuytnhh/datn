# RUBRIC SCORECARD — chấm bài theo phiếu chính thức DUT, lộ trình 9+

> Living doc (tài liệu sống — cập nhật điểm tự chấm mỗi khi vá xong một mục).
> Căn cứ: QĐ 209/QĐ-ĐHBK (06/03/2017), Phụ lục 05/06/07. Mốc tham chiếu: đồ án Trần Đức Trí
> (102210096, tonic-chord, điểm cao; trích từ docx gốc). Bài được chấm: `report/THESIS_REPORT_EN.md`.
> Nguyên tắc chấm: **gắt như phản biện khó tính** — cơ chế "điểm trừ" đúng phiếu 100đ.
> Cập nhật lần cuối: 2026-06-11 — **ĐỢT VÁ P0 ĐÃ THI CÔNG XONG**: 110 [[FILL]] → **0**; refs 14 → **31** (citation gắn trong Ch1/Ch2); math box §2.3.7 (Mann-Whitney AUC, bootstrap, τ constrained-opt, temperature scaling); mục HFF §2.3.6; "Engineering practice & problem-solving" trong §3.1.6 (probe NO-GO + smoke-test + fallback — theo yêu cầu KHÔNG dùng 2 chuyện md5-ckpt/ảnh-trùng-LCC); liveness "planned"→measured toàn văn; 4 sơ đồ Ch1 sinh bằng `mt14_ch1_diagrams.py`; LoF (26 hình)/LoT (56 bảng) sinh tự động; DOCX xuất lại bằng reference-doc media-free. Tự chấm sau vá: **phiếu 100đ ≈ 87–88/100 (≈8.7–8.8)**.

---

## 0. Cách điểm vận hành (đọc 1 lần để biết tối ưu cái gì)

```
ĐIỂM CUỐI = trung bình cộng các phiếu:
  1 × GVHD        (phiếu 10đ: 2 cấp thiết + 4 kết quả + 2 hình thức + 1 thái độ, +1 NCKH)
  1 × Phản biện   (phiếu 100đ → /10)
  3–5 × TV Hội đồng (phiếu 100đ → /10, y hệt phản biện)
⇒ ~83–86% điểm cuối chảy qua PHIẾU 100đ → tối ưu theo phiếu 100đ trước.
Ràng buộc: lệch giữa các giám khảo ≤1.5đ → một người chấm gắt sẽ bị "kéo về" nếu đa số chấm cao
⇒ chiến lược đúng: làm bài KHÔNG CÓ CỚ ĐỂ TRỪ với đa số, thay vì gây ấn tượng với 1 người.
```

**Bảo vệ (Điều 7):** ~3' chuẩn bị → ~15' trình bày → ~15' đọc nhận xét + Q&A → 5' hội đồng kết luận. Kết quả công bố cuối ngày.

---

## A. SCORECARD PHIẾU 100đ (trục chính — phản biện + mọi thành viên HĐ)

> Mỗi ô: hội đồng tìm gì → Trí ăn điểm bằng gì → bài mình có gì (bằng chứng file) → **điểm trừ hiện tại** → hành động vá → trần sau vá.
> "Hiện tại" = nếu nộp NGAY HÔM NAY.

### 1a. Toán & khoa học tự nhiên — 15đ | hiện **12** → trần **14**
- **HĐ tìm:** công thức, suy luận định lượng, hiểu bản chất toán của method — không phải chỉ gọi thư viện.
- **Trí có:** lý thuyết nhạc + chroma/FFT (43 đoạn nhắc công thức), mức vừa.
- **Mình có:** §1.7 công thức DCT 2D, attention/fusion math (~40 khối toán); AUC, bootstrap CI (khoảng tin cậy ước lượng bằng lấy mẫu lại), temperature scaling trong `risk.py`.
- **Trừ hiện tại (−3):** toán nằm rải, chưa có chỗ nào trình bày **trọn vẹn chuỗi suy luận định lượng**: AUC = xác suất xếp hạng đúng (Mann-Whitney), thuật toán bootstrap từng bước, chọn τ = bài toán tối ưu có ràng buộc (max TPR s.t. FPR≤5%).
- **Vá:** thêm 1 "math box" ~1.5 trang ở Ch2/Ch3: (i) công thức AUC Mann-Whitney, (ii) pseudo-code bootstrap video-level (n=2000, seed 42), (iii) τ như constrained optimization, (iv) temperature scaling. ~3–4h, KHÔNG cần GPU.

### 1b. Kiến thức cơ sở & chuyên ngành — 25đ (Ô LỚN NHẤT) | hiện **18** → trần **23**
- **HĐ tìm:** nắm vững domain (deepfake, frequency, generalization), giải đủ nhiệm vụ đề ra, thí nghiệm có phương pháp.
- **Trí có:** Ch1 lý thuyết đủ rộng, Ch3 đánh giá 104 hình/bảng, music-aware evaluation + dataset nhạc Việt.
- **Mình có:** protocol DeepfakeBench 4 giao thức (Bảng 3.5b), ablation 7 model, video-CI, liveness đo thật + 4 lớp kiểm chứng, evidence bundle tái lập 1 lệnh — phần "phương pháp" **mạnh hơn Trí**.
- **Trừ hiện tại (−7):** ① **110 [[FILL]]** → đọc như bản nháp, "giải CHƯA đủ nhiệm vụ"; ② cột FF++ in-dataset trống (chờ eval vast); ③ §2.4 liveness còn ghi "(planned)" trong khi §3.1.8 đã đo — mâu thuẫn nội bộ; ④ VietFace mới là kế hoạch.
- **Vá:** diệt FILL (tách 2 loại: viết-được-ngay vs chờ-số-FF++); chạy FF++ eval trên vast; sửa "(planned)"→measured; VietFace đo thật nếu kịp. Đây là **khoản đầu tư điểm lớn nhất toàn đồ án**.

### 1c. Phần mềm mô phỏng, tính toán — 10đ | hiện **9** → trần **9–10**
- **Mình có:** DeepfakeBench + PyTorch + vast.ai + serving :8501 + app FastAPI/Next.js + HF model hub + scripts `mt01–mt13` tái lập — vượt yêu cầu. Giữ nguyên, chỉ cần demo chạy mượt hôm bảo vệ.

### 1d. Đọc tài liệu tiếng nước ngoài — 10đ | hiện **7** → trần **9**
- **Trí có:** báo cáo viết tiếng Anh + refs ngoại văn.
- **Mình có:** báo cáo TIẾNG ANH 38k từ (tự nó là bằng chứng 1d) — NHƯNG **chỉ 14 tài liệu tham khảo** → mỏng bất thường với đồ án AI (chuẩn 25–40).
- **Trừ hiện tại (−3):** phản biện lật mục References thấy 14 mục sẽ nghi đọc ít; nhiều claim trong Ch1 chưa gắn citation.
- **Vá (~3h, không GPU):** nâng lên ~30 refs có trích dẫn đúng chỗ: DeepfakeBench, FF++, Celeb-DF, DFDC, SPSL, SRM, F3Net, FcaNet, FDFL, FreqDebias, SBI, KoDF, EfficientNet, MTCNN, LCC-FASD, ISO/IEC 30107-3, TT17/2024/TT-NHNN, Grad-CAM, t-SNE, temperature scaling (Guo 2017), bootstrap (Efron)…

### 1e. Làm việc nhóm & giải quyết vấn đề — 10đ | hiện **7** → trần **9**
- **Đồ án solo** → ăn điểm bằng nửa "problem-solving". Nguyên liệu ĐÃ CÓ nhưng chưa kể thành chuyện trong report: ① linear-probe NO-GO ($0, tránh đốt tiền GPU vô ích); ② phát hiện checkpoint B4 upload trùng byte (audit md5); ③ phát hiện 48+25 ảnh trùng trong chính bộ LCC-FASD gốc + chứng minh không thổi phồng kết quả.
- **Vá (~2–3h):** thêm tiểu mục "Engineering & problem-solving log" (3 case trên, mỗi case 1 đoạn: vấn đề→cách điều tra→quyết định) + 1 đoạn quy trình làm việc với GVHD theo tuần. Ba câu chuyện này là **vàng Q&A** ngày bảo vệ.

### 1f. Giá trị KH-CN, ứng dụng thực tiễn — 10đ | hiện **8** → trần **9**
- **Mình có:** app eKYC multi-tenant chạy thật (RBAC 5 role, playground, risk-band pass/review/reject), định vị TT17 (định tính, không bịa "quy định 5%"), VN dataset pilot, negative-result trung thực.
- **Trừ (−2):** cascade liveness→deepfake chưa nối xong (G3); VietFace chưa có số.
- **Vá:** nối cascade (code đã có chỗ chờ ở `ekyc_pipeline.py`), VietFace nếu kịp.

### 2a. Bố cục, lập luận, lời văn — 15đ | hiện **11** → trần **14**
- **Mình có:** cấu trúc đã restructure khớp đúng khung Trí (frontmatter → Intro 5 mục → Ch1 → Ch2 → Ch3 → Conclusion); SKELETON.md giữ nhất quán số liệu.
- **Trừ hiện tại (−4):** FILL cắt mạch đọc; vài chỗ "(planned)" đá nhau với phần đã đo; Ch1 còn mục dài dòng kiểu liệt kê (1.1 JavaScript… 1.5 DNS) — hợp khung Trí nhưng cần nén để dồn đất cho phần AI.
- **Vá:** diệt FILL + pass nhất quán + nén Ch1 mục web-stack (mỗi mục ≤ ⅔ trang).

### 2b. Chính tả, in ấn, định dạng — 5đ | hiện **3** → trần **4.5–5**
- **Trừ hiện tại (−2):** marker [[FILL]] lộ ra bản in = lỗi trình bày nặng; cần pass cuối: đánh số hình/bảng liên tục, mục lục có số trang, font/lề đúng Điều 4 khi xuất docx (đã có reference-doc media-free của Trí).
- **Vá:** chỉ làm SAU khi nội dung đóng băng (1 buổi).

### 📊 Tổng phiếu 100đ
| | 1a | 1b | 1c | 1d | 1e | 1f | 2a | 2b | **Tổng** | **/10** |
|---|---|---|---|---|---|---|---|---|---|---|
| Tối đa | 15 | 25 | 10 | 10 | 10 | 10 | 15 | 5 | 100 | 10 |
| **Hôm nay** | 12 | 18 | 9 | 7 | 7 | 8 | 11 | 3 | **75** | **7.5** |
| **Sau vá P0 (chỉ viết, không GPU)** | 14 | 21 | 9 | 9 | 8.5 | 8 | 13.5 | 4.5 | **87.5** | **8.75** |
| **Sau vá P0+P1 (FF++, cascade, VietFace)** | 14 | 23 | 9.5 | 9 | 9 | 9 | 14 | 4.5 | **92** | **9.2** |

---

## B. PHIẾU GVHD 10đ (1 phiếu, ~14–17% trọng số)

| Tiêu chí | Max | Hiện | Trần | Ghi chú |
|---|---|---|---|---|
| Cấp thiết, sáng tạo, ứng dụng | 2 | 1.5 | 2 | Deepfake-eKYC nóng + TT17 + app thật; sáng tạo = SFDCT floor-design + đánh giá trung thực |
| Kết quả giải quyết nhiệm vụ | 4 | 3.0 | 3.5–4 | Phụ thuộc diệt FILL + FF++ + cascade — nhiệm vụ ghi trong Assignment phải khớp 100% với phần "đã làm" |
| Hình thức, cấu trúc, bố cục | 2 | 1.5 | 2 | Sau pass 2b |
| Tinh thần, thái độ | 1 | 1 | 1 | Gặp GVHD đều, có tracker minh chứng tiến độ |
| **NCKH (+1 cộng thêm)** | +1 | 0 | **+1** | **Draft IEEE_CONF SFDCT ĐÃ CÓ (LaTeX, Overleaf-ready)** → nộp hội nghị SV/cấp khoa trước bảo vệ. Hỏi GVHD venue phù hợp NGAY — deadline nộp thường sớm hơn lịch bảo vệ |
| **Tổng** | 10 | **7.0** | **9.5–10** | |

⚠️ Mẹo ăn chắc ô 4đ: mục "GRADUATION THESIS ASSIGNMENT" trong report phải liệt kê nhiệm vụ ĐÚNG NHỮNG GÌ ĐÃ XONG (promise nhỏ, deliver đủ) — hội đồng chấm "giải đủ nhiệm vụ ĐƯỢC GIAO", không chấm tham vọng.

---

## C. TUÂN THỦ ĐIỀU 4 (hình thức sản phẩm)

| Mục | Quy định | Trạng thái |
|---|---|---|
| Phần chính ≤70 trang | Có ngoại lệ khi Trưởng BM + GVHD duyệt | ⚠️ Bài mình ~38k từ ≈ 95–115 trang. **Trí 143 trang vẫn điểm cao** → khoa nới lỏng, NHƯNG phải **hỏi xác nhận GVHD**; chuẩn bị sẵn phương án đẩy bảng phụ/16-config/code listing xuống Phụ lục (không tính trang) |
| Font TNR 13, dãn 1.3, lề 3/2/2.5/2.5, header-footer | Bắt buộc | ⬜ Làm ở pass xuất docx cuối (reference-doc đã có) |
| Cấu trúc bìa→nhận xét HD/PB→Tóm tắt→Nhiệm vụ→Lời nói đầu→Cam đoan→Mục lục→DS bảng/hình→Viết tắt→Mở đầu→Chương→Kết luận→TLTK→Phụ lục | Bắt buộc | ✅ Frontmatter EN đã có đủ các mục (Supervisor/Reviewer remarks, Abstract, Assignment, Acknowledgements, Declaration, ToC, LoF, LoT, Abbreviations) |
| Đĩa CD/DVD: `Lop_MSSV_Ten/` gồm THUYETMINH (docx+pdf), PHULUC, DOC (code), RESOURCE, Readme.docx | Bắt buộc khi nộp | ⬜ 1 buổi, làm tuần nộp |
| Nộp 02 bộ thứ Sáu tuần 15 | Lịch BM | ⬜ Hỏi GVHD lịch đợt này |

---

## D. NGÀY BẢO VỆ (15' trình bày + 15' Q&A)

- **Slide 15'** (~12–14 slide): bài toán eKYC → gap generalization → SFDCT design (floor≥B4) → protocol 4-giao-thức + CI → bảng ablation + forest plot (grid4) → operating point τ/TPR + review-band → liveness + cascade → demo app → đóng góp & hạn chế trung thực.
- **Demo dự phòng:** video quay sẵn màn hình (mạng/GPU chết vẫn demo được) + app live local.
- **Q&A bank ~20 câu** (đã có sẵn lời giải trong evidence): vì sao không có tập val (trainer.py:375 + Bảng 3.5b); vì sao Δ trong nhiễu vẫn có giá trị; TPR@5% thấp sao dùng được (video-level + review band); vì sao tin số liveness (4 lớp kiểm chứng); VietFace đóng góp gì (KoDF precedent); 3 chuyện problem-solving (1e).
- **Ăn ràng buộc ≤1.5đ:** trả lời chắc 2–3 câu xương nhất khiến cả hội đồng không có cớ trừ sâu.

---

## E. BACKLOG — xếp theo điểm-tăng ÷ giờ-công

| # | Việc | Ô điểm | Ước giờ | Tăng (quy /10 điểm cuối) | Khi nào |
|---|---|---|---|---|---|
| 1 | ✅ **Diệt 110 FILL** — XONG (110 → 0; số đo điền từ mt10/mt11/log, phần chưa đo viết lại thành future-work sạch) | 1b,2a,2b | — | ★★★★★ (~+0.6) | XONG 11/06 |
| 2 | ✅ **Refs 14→31** + citation gắn trong Ch1/Ch2 — XONG | 1d,1b | — | ★★★★ (~+0.2) | XONG 11/06 |
| 3 | ✅ **Pass nhất quán** "(planned)"→measured toàn văn — XONG | 2a,1b | — | ★★★ | XONG 11/06 |
| 4 | ✅ **Math box** §2.3.7 (Mann-Whitney/bootstrap/τ/temperature) + mục HFF §2.3.6 — XONG | 1a | — | ★★★ (~+0.15) | XONG 11/06 |
| 5 | ✅ **Problem-solving** trong §3.1.6 (probe NO-GO, smoke-test, fallback; loại 2 chuyện md5/LCC theo yêu cầu) — XONG | 1e | — | ★★★ (~+0.15) | XONG 11/06 |
| 6 | **Hỏi GVHD:** trần trang (Trí 143?), venue NCKH cho paper, lịch nộp tuần 15 | C,B | 0.5h | ★★★★ (chặn rủi ro) | NGAY |
| 7 | **FF++ re-eval 7 ckpt trên vast** (~$1) → điền FILL cột FF++ + 16-config | 1b | 0.5 ngày chờ máy | ★★★★ (~+0.25) | Khi thuê vast |
| 8 | **Nối cascade liveness** (G3) + demo chạy | 1f,1c | 0.5–1 ngày | ★★★ | Tuần này/sau |
| 9 | **VietFace**: quay 30 video → pipeline → cụm metric (AUC, Δ gap, τ-transfer, CI) | 1b,1f | 2–3 tuần lịch | ★★★★ | Song song |
| 10 | **Nộp paper IEEE_CONF** (sửa draft theo số mới) | B(+1đ GVHD) | 1–2 ngày | ★★★ (+1đ một phiếu) | Sau #7 |
| 11 | Pass 2b cuối: đánh số hình/bảng, docx Điều 4, CD/DVD | 2b,C | 1 buổi | ★★ | Tuần nộp |
| 12 | Slide + demo video + Q&A bank + mock defense | D | 2–3 ngày | ★★★★ (giữ đều mọi phiếu) | 2 tuần cuối |

### Số học 9+ (kiểm tra được)
```
Hôm nay:      phiếu 100đ ≈ 7.5  | GVHD ≈ 7.0  → điểm cuối ≈ 7.4–7.5
Sau P0 (#1–6): phiếu 100đ ≈ 8.75 | GVHD ≈ 8.5  → ≈ 8.7   ← chỉ cần VIẾT, không GPU
Sau P1 (#7–9): phiếu 100đ ≈ 9.2  | GVHD ≈ 9.0  → ≈ 9.1–9.2
 + #10 NCKH:   GVHD 9.5–10                       → ≈ 9.2–9.3  ✅ mục tiêu 9+
Bảo vệ tốt giữ điểm; bảo vệ tệ có thể −0.5 đều các phiếu → KHÔNG bỏ #12.
```

---

## Decision log
- **Trục chính = phiếu 100đ** (chiếm ~85% trung bình cộng) — thay vì phiếu GVHD như bản nháp đầu.
- **Chấm gắt cơ chế điểm-trừ** đúng phiếu thật; "hôm nay" = trạng thái nộp ngay, tránh ảo tưởng.
- **Trí làm mốc tham chiếu cấu trúc**, không sao nội dung; lỗi fork-không-credit của Trí → mình phản đề bằng mục credit DeepfakeBench rõ ràng (đã có).
- **70 trang:** phát hiện Trí ~143 trang phần chính → rủi ro hạ cấp từ "phải cắt gấp" xuống "xác nhận với GVHD + chuẩn bị phương án phụ lục".
- **+1đ NCKH** đưa vào backlog chính thức vì draft paper đã tồn tại — chi phí biên thấp.
