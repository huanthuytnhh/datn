# DeepGuard — Kế hoạch chi tiết từ số không → bảo vệ (deadline 15/06)

> Hôm nay: 29/05. Còn ~17 ngày. Bạn là beginner, chưa có gì.
> Nguyên tắc xuyên suốt: **bám DeepfakeBench**, local 3060 để *debug + smoke*, Vast để *train thật*.

---

## 0. Đọc cái này trước — sự thật về phạm vi

Bạn muốn làm HẾT (B4 + DCT + ablation + test mặt Việt + deploy). Trong 17 ngày, từ số không, một mình — **đây là rất nhiều**. Nên ta chia theo mức ưu tiên, và quy tắc là: **làm xong MUST trước, SHOULD sau, NICE chỉ khi còn dư.** Nếu chậm, CẮT từ dưới lên.

| Mức | Nội dung | Vì sao |
|---|---|---|
| **MUST** (đủ để bảo vệ) | B4 baseline + B4+DCT chạy trên DeepfakeBench, có số FF++ (within) + Celeb-DF (cross), HIỂU model, viết báo cáo | Đây là xương sống. Chỉ riêng nó = một đồ án bảo vệ được |
| **SHOULD** (nâng điểm) | Ablation (B4+SE, B4+DCT-concat), áp ngưỡng FPR≤5% theo TT17 | Cho "đối chứng + phân tích" + tính ứng dụng |
| **NICE** (nếu dư thời gian) | 3-seed mean±std + t-test, bộ test mặt Việt, demo deploy AWS | Điểm cộng, KHÔNG bắt buộc |

**Quy tắc cắt khi chậm:** bỏ NICE trước (test mặt Việt → chỉ mô tả thiết kế trong báo cáo; deploy → chỉ Dockerfile + mô tả). Tuyệt đối GIỮ phần MUST.

---

## 1. Lịch theo ngày

### Phase 0 — Setup + DATA (30–31/05) ⚠️ RỦI RO LỚN NHẤT, BẮT ĐẦU NGAY
> Data là nút thắt số một. Beginner thường mất 2–4 ngày ở đây. Làm song song: vừa tải data (chạy ngầm, lâu) vừa dựng môi trường.

- [ ] **Fork** repo `SCLBD/DeepfakeBench` về GitHub của bạn (đã làm).
- [ ] Trên **3060 local**: cài môi trường theo `LOCAL_3060_SETUP.md`. Mục tiêu: `import` được, không lỗi.
- [ ] **Tải data preprocessed** (xem mục 2 bên dưới). CHỈ lấy **FF++ (c23) + Celeb-DF-v2 + JSON configs**. Đây là phần lâu — bắt đầu tải ngay hôm nay.
- [ ] Tải `efficientnet-b4` pretrained vào `./training/pretrained/`.
- **GATE 0 PASS:** môi trường chạy, data đã về (hoặc đang về), JSON config đã có.

### Phase 1 — B4 baseline SMOKE trên 3060 (01–02/06)
> Mục tiêu: CHỨNG MINH pipeline chạy thông, KHÔNG cần số đẹp.

- [ ] Chạy `make_subset.py` cắt JSON còn ~20 video FF++ + ~10 Celeb-DF.
- [ ] Sửa config sang chế độ SMOKE: `nEpochs: 1`, `frame_num: {train:4,test:4}`, `train_batchSize: 8`.
- [ ] Sửa đường dẫn data trong `train_config.yaml`/`test_config.yaml` trỏ về chỗ data local.
- [ ] Chạy `train.py` với `efficientnetb4.yaml`.
- **GATE 1 PASS:** data load được, loss giảm, in ra AUC cho CẢ FF++ lẫn Celeb-DF, checkpoint ghi ra. Ghi lại **phút/epoch** (để ước tính Vast).

### Phase 2 — Thêm module DCT + SMOKE (03–04/06)
- [ ] Thêm 4 file DCT (xem `SETUP_DCT.md`): copy `fca_layer.py` từ FcaNet, thêm `efficientnetb4_dct_detector.py`, sửa 1 dòng `__init__.py`, thêm `efficientnetb4_dct.yaml`.
- [ ] Chạy 1 batch, `print(self.backbone.features(x).shape)` → xác nhận `dct_channels` (≈1792).
- [ ] Chạy smoke B4+DCT trên cùng subset.
- **GATE 2 PASS:** không lỗi shape, log `[DCT]` hiện ra, loss giảm.
- [ ] Commit cả 4 file lên fork (để Vast clone về là có sẵn).

### Phase 3 — TRAIN THẬT trên Vast (05–08/06) 🔑 PHẦN QUYẾT ĐỊNH
> Theo `VAST_SETUP.md`. Trả config về FULL: `nEpochs` theo paper, `frame_num:32`, `batch:32`, `lr:0.0002`. KHÓA CỨNG batch+lr+epoch cho mọi cấu hình.

- [ ] **05/06:** thuê Vast, SSH vào, chạy script setup, tải data trên Vast (nhanh), clone fork.
- [ ] **06/06:** chạy **B4 baseline** (MUST). Lưu checkpoint + log + results.
- [ ] **07/06:** chạy **B4 + DCT-residual** (MUST). So với baseline trên cột Celeb-DF.
- [ ] **08/06:** nếu kịp — chạy **B4+SE** và **B4+DCT-concat** (SHOULD, ×1 seed). Nếu còn nữa — chạy lại B4 & B4+DCT với 2 seed khác (NICE, để có mean±std).
- **GATE 3 PASS:** có bảng số thật: B4 vs B4+DCT trên FF++(within) + Celeb-DF(cross). **Đây là lúc đồ án "đủ để bảo vệ".**
- ⚠️ TẮT instance Vast ngay khi xong mỗi ngày để khỏi tốn tiền idle.

### Phase 4 — Phân tích + ứng dụng (09–10/06)
- [ ] **TT17 (SHOULD):** lấy điểm dự đoán trên tập eval, tính ngưỡng cho **FPR ≤ 5%**, báo cáo TPR/FPR tại ngưỡng đó. → đóng góp domain.
- [ ] **Phân tích (SHOULD):** Grad-CAM + t-SNE so B4 vs B4+DCT. Viết phần "tại sao DCT giúp/không giúp".
- [ ] **NICE nếu kịp:** bộ test mặt Việt nhỏ (tự quay, có đồng ý) + demo deploy. Nếu KHÔNG kịp → chỉ mô tả thiết kế trong báo cáo + Dockerfile.

### Phase 5 — Báo cáo + Bảo vệ (11–15/06) 📝 ĐỪNG TRAIN NỮA
> Quy tắc: KHÔNG để việc train tràn sang đây. Từ 11/06 chỉ viết + luyện.

- [ ] **11–12/06:** viết/hoàn thiện báo cáo. Nối 4 trụ: kết quả+ablation, metric chuẩn (sửa "cross-dataset" → "in-distribution" cho đúng!), hệ thống (eKYC/Docker/AWS), định vị so SFCL (lấy cảm hứng, không tương đương — xem mục 4).
- [ ] **13/06:** slide (25 chính + backup). Vẽ kiến trúc + bảng kết quả.
- [ ] **14/06:** dry-run bảo vệ với GVHD. Luyện Q&A (đặc biệt: "DCT có ích không", "sao không bằng SFCL", "data lấy đâu").
- [ ] **15/06:** nộp + bảo vệ.

---

## 2. Cách lấy DATA (nút thắt — làm đúng kẻo mất ngày)

DeepfakeBench cung cấp **data đã preprocessed** (mặt crop 32 frame/video + landmark + mask) trên **Google Drive + Baidu**, link trong mục "Download" của README repo. Quan trọng: nếu dùng data preprocessed của họ thì **bỏ qua bước preprocessing**, nhưng VẪN cần file **JSON config** (tải sẵn trên Drive của họ, đặt vào `./preprocessing/dataset_json/`).

Chỉ lấy 3 thứ:
1. **FaceForensics++ (c23)** — gói RGB preprocessed
2. **Celeb-DF-v2** — gói RGB preprocessed
3. **dataset_json** — các file `FaceForensics++.json`, `Celeb-DF-v2.json`

> ⚠️ Folder Drive ID có thể đổi → LẤY LINK MỚI NHẤT từ README repo, đừng tin link cũ. Folder Drive lớn nên dùng `gdown --folder <id>` hoặc `rclone` (gdown hay lỗi với folder to).

**Pháp lý (đừng bỏ qua):** FF++ và Celeb-DF yêu cầu điền form xin quyền với tác giả gốc (`ondyari/FaceForensics`, repo Celeb-DF). Bản DeepfakeBench chỉ là mirror tiện lợi. Với đồ án, nên điền form cho đúng quy trình và ghi nguồn trung thực.

**Chiến lược tải cho 2 máy:**
- **Vast:** tải trực tiếp trên Vast (băng thông datacenter mạnh, vài chục phút). Đây là nơi để full data.
- **3060 local:** KHÔNG cần full. Chỉ cần một subset nhỏ để debug. Cách dễ nhất: sau khi tải full trên Vast, dùng `make_subset.py` tạo bản nhỏ rồi `scp` về 3060; HOẶC tải một phần nhỏ trực tiếp.

---

## 3. Phân vai 2 máy (đừng nhầm)

| | RTX 3060 (local) | Vast (thuê) |
|---|---|---|
| Dùng để | Debug code, smoke 1 epoch subset nhỏ | Train thật, full data, nhiều epoch |
| Data | Subset tí xíu (~20–30 video) | Full FF++ c23 + Celeb-DF v2 |
| Mục tiêu | Pipeline chạy thông, không lỗi | Ra SỐ để báo cáo |
| VRAM | ~12GB → batch 8 cho smoke | 24GB (4090) → batch 32 |

Nguyên tắc: **mọi lỗi sửa trên 3060 (free). Chỉ lên Vast khi code đã sạch.** Đừng debug trên Vast (đốt tiền).

---

## 4. Định vị đóng góp (học thuộc để trả lời hội đồng)

KHÔNG nói "tương đương SFCL". Nói:

> *"Đồ án lấy cảm hứng từ hướng spatial-frequency (SFCL, FcaNet, Luo), nhưng đơn giản hóa kiến trúc cho phù hợp phạm vi đồ án và tài nguyên. Đóng góp tập trung ở 3 điểm các công trình trên KHÔNG có: (1) đánh giá công bằng dưới protocol thống nhất DeepfakeBench; (2) ứng dụng eKYC với hiệu chỉnh ngưỡng theo Thông tư 17/2024/TT-NHNN (FPR≤5%); (3) kiểm thử trên dữ liệu khuôn mặt Việt + kịch bản spoof."*

Ba câu Q&A phải thuộc:
- *"DCT có thực sự giúp không?"* → "Em kiểm chứng giả thuyết này; literature (SPSL/SRM) cho thấy tần số giúp cross-dataset. Kết quả của em là [X], và em phân tích trung thực tại sao."
- *"Sao không làm đủ 3 nhánh như SFCL?"* → "Trong giới hạn đồ án, em chọn kiến trúc gọn để hiểu sâu + ablation kỹ; đa nhánh là future work."
- *"Data lấy đâu?"* → "DeepfakeBench (mirror), gốc từ FF++/Celeb-DF có form xin quyền; tập mặt Việt tự thu thập có đồng ý, tuân thủ Nghị định 13."

> ⚠️ SỬA LỖI INTEGRITY: protocol của bạn là **in-distribution** (train mix FF++/Celeb-DF, test Celeb-DF), KHÔNG phải cross-dataset thật. Mọi chỗ ghi "cross-dataset" trong báo cáo phải sửa thành "in-distribution" trước khi bảo vệ. Đừng overclaim generalization.

---

## 5. Checklist "đủ để bảo vệ" (tối thiểu)
- [ ] B4 baseline: có số FF++ + Celeb-DF (số của CHÍNH bạn)
- [ ] B4 + DCT: có số, so với baseline cùng điều kiện
- [ ] Hiểu model: vẽ được kiến trúc, giải thích DCT/residual/tại-sao
- [ ] Báo cáo: 4 trụ + định vị SFCL + sửa "in-distribution"
- [ ] Slide + 1 lần dry-run với GVHD

Làm xong checklist này = bạn bảo vệ được. Mọi thứ khác là điểm cộng.
