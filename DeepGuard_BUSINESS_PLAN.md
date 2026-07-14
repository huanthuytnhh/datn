# DeepGuard — Kế hoạch Kinh doanh (tối ưu) · Deepfake Risk cho eKYC

> Viết cho người **mới về business**. Nguyên tắc: bám **thực trạng thật** của hệ thống + **năng lực thật** của mô hình, không tô hồng. Tài liệu này tối ưu lại bản nháp của bạn.

## 0. SỰ THẬT phải chốt trước (quyết định mọi thứ)
Mô hình hiện tại: cross-dataset **AUC ≈ 0.757**, ở điểm vận hành eKYC (FPR≤5%) **chỉ bắt ~23% deepfake** (bỏ sót ~77%). 
→ **KHÔNG được bán là "chặn deepfake / DeepGuard chặn gian lận"** — ngân hàng test sẽ thấy ngay và mất niềm tin (rủi ro pháp lý + uy tín).
→ **Định vị đúng:** bán **một TÍN HIỆU RỦI RO (risk score) bổ sung** vào pipeline eKYC của khách + **bằng chứng tuân thủ** + **dữ liệu/đánh giá bản địa Việt Nam**. Bạn là **một lớp sàng lọc**, không phải người ra quyết định cuối.

---

## 1. Bạn bán gì? (định vị lại — KHÔNG bán model)
Không bán "mô hình AI / F3Net/FcaNet". Bán **3 thứ khách trả tiền:**
1. **Deepfake-risk signal** cho eKYC: API trả `risk_score ∈ [0,1]` + `band {low/medium/high}` + Grad-CAM (giải thích) → khách **gộp vào decision engine** của họ, đưa ca high-risk sang **review tay**.
2. **Tuân thủ & audit**: log bất biến, giải thích được (Grad-CAM), báo cáo theo **TT17/2024 + Nghị định 13/2023** (sinh trắc = dữ liệu nhạy cảm) — thứ ngân hàng BẮT BUỘC có.
3. **Lợi thế bản địa**: dữ liệu **mặt người Việt** + đánh giá **calibrate theo FPR budget của từng khách** — thứ benchmark Tây (FF++/CDFv2) không phủ.

> Một câu bán hàng: *"DeepGuard thêm một tín hiệu phát hiện deepfake bản địa hoá cho người Việt + liveness vào luồng eKYC của bạn, hiệu chỉnh theo ngưỡng FPR bạn chọn, kèm log/giải thích phục vụ tuân thủ TT17."*

## 2. Khách hàng & "beachhead" (chọn 1 để khởi đầu)
| Nhóm | Tốc độ bán | Ngân sách | Khuyến nghị |
|---|---|---|---|
| **eKYC provider** (VNPT eKYC, FPT.AI, VNG, Trusting Social…) | Nhanh nhất (đã tích hợp AI, hiểu API) | Trung bình | ✅ **Beachhead** — họ cần thêm tín hiệu, bán B2B2B |
| **Fintech nhỏ** (ví, cho vay, chứng khoán) | Nhanh | Nhỏ | ✅ Khách thử nghiệm đầu tiên (pilot) |
| Ngân hàng lớn (MB/TP/VCB) | **Rất chậm** (6–18 tháng, bảo mật cao) | Lớn | ⏳ Sau khi có case study + logo |
→ **Mục tiêu 90 ngày: 1 design-partner** (eKYC provider hoặc fintech) dùng thử **miễn phí** để lấy **case study + dữ liệu thật**.

## 3. Sự khác biệt (vì sao chọn bạn, không phải tự build)
- **Bộ dữ liệu deepfake mặt người Việt** (đang xây — đồ án) → khách Tây/đối thủ không có.
- **Liveness + deepfake kết hợp** (cascade) → bắt cả tấn công trình diễn lẫn deepfake.
- **Calibrate ngưỡng theo từng tenant** (mỗi khách 1 FPR budget) → khớp khẩu vị rủi ro của họ.
- **Giải thích được (Grad-CAM) + log audit** → phục vụ thanh tra NHNN.
- **Honest metrics** (báo TPR@FPR trên dữ liệu Việt) → tạo niềm tin, khác hẳn bên thổi phồng "99.9%".

## 4. MVP — bạn ĐÃ CÓ gì vs CẦN gì (đừng làm quá)
**Đã có (DeepGuard hiện tại):** multi-tenant, API key, dashboard, `/v1/detect/*`, RBAC, billing-page (mock), SFDCT serving + Grad-CAM. → **~70% MVP rồi.**
**Cần đóng để bán được (ưu tiên):**
1. **Đổi output sang risk-score + band + ngưỡng per-tenant** (không phải REAL/FAKE cứng) — khớp định vị §1.
2. **Metering + billing thật** (đếm request/tenant, quota, hoá đơn) — hiện là mock.
3. **Sandbox API key + tài liệu API + 1 trang "Accuracy & SLA" trung thực** (TPR@FPR, latency p95, uptime) → để khách tự thử.
4. **2 bug bảo mật** (đã fix: api-key hết hạn, mask PII) + **DPA/Privacy** (xử lý dữ liệu sinh trắc).
5. **Latency + cost/request đo thật** (khách hỏi đầu tiên).
**KHÔNG làm bây giờ:** Kubernetes, microservice, ONNX/GPU tối ưu, scale — *chỉ 1 VPS/cloud mạnh là đủ cho pilot.*

## 5. Định giá (3 mô hình + sandbox)
- **Sandbox (free):** 500–1.000 request/tháng, data giả → khách thử + tích hợp.
- **Theo request (metered):** ví dụ 200–500đ/request (eKYC là giao dịch giá trị cao → chịu được).
- **Theo gói (SaaS):** Starter ~2–5tr/tháng · Business ~10–30tr · Enterprise = hợp đồng.
- **Hợp đồng năm (bank):** cam kết tối thiểu + bậc giảm giá.
> **Neo theo GIÁ TRỊ, không theo cost:** 1 vụ gian lận mở tài khoản giả = thiệt hại hàng chục–trăm triệu → tín hiệu giảm rủi ro đáng giá hơn nhiều "0.001 USD/request". Nhưng giai đoạn đầu **định giá khiêm tốn + bán như add-on** (vì model chưa mạnh).

## 6. ⭐ Data flywheel = MOAT thật (quan trọng nhất)
Model chưa mạnh → **đừng cạnh tranh bằng kiến trúc**. Cạnh tranh bằng **vòng dữ liệu**:
```
Khách dùng → bạn thu (có consent) ảnh/video Việt thật + nhãn khó → cải thiện model →
độ chính xác trên mặt Việt tăng → khách khó rời → khách mới đến → lặp lại
```
→ Mỗi hợp đồng pilot phải kèm điều khoản **được dùng dữ liệu (ẩn danh, có consent) để cải thiện model**. Đây là tài sản đối thủ không sao chép được.

## 7. Pháp lý & rủi ro (phải xử trước khi bán)
- **Trách nhiệm pháp lý:** vì model bỏ sót 77% fake → **hợp đồng/SLA phải ghi rõ "tín hiệu hỗ trợ, không thay quyết định cuối"** + giới hạn trách nhiệm. Tuyệt đối không cam kết "chặn 100%".
- **Dữ liệu sinh trắc (ND13/2023 + TT17):** bạn là **bên xử lý dữ liệu** → cần **DPA** với khách, lưu trữ/xoá có chính sách, option **on-prem** cho ngân hàng (không cho data ra ngoài).
- **Cạnh tranh:** eKYC provider có thể tự build → bạn thắng bằng **chuyên sâu deepfake + dữ liệu Việt + tốc độ**.

## 8. Chỉ số phải theo dõi (khách/nhà đầu tư hỏi)
Detection rate **@FPR cố định** (trên dữ liệu Việt) · FPR/false-positive · **latency p95** · **cost/request** · uptime/SLA · #design-partner · #request/tháng · tỉ lệ chuyển free→paid. *(KHÔNG ai hỏi "F3Net hay FcaNet".)*

## 9. Lộ trình ưu tiên (sửa lại thứ tự — bám sự thật model)
1. **Đóng MVP bán được** (risk-score output + metering + sandbox + 1 trang accuracy/SLA trung thực) — *vài tuần, không GPU.*
2. **Bộ dữ liệu Việt + cải thiện độ chính xác trên mặt Việt** (đồ án G2) — *moat + điều khách cần.*
3. **1 design-partner dùng thử miễn phí** → case study + dữ liệu thật.
4. **Doanh thu pilot đầu tiên** (fintech nhỏ, gói nhỏ).
5. Mở rộng eKYC provider → ngân hàng.
6. **Chỉ khi có tải thật** → ONNX/GPU/scale.

## 10. Đồ án ↔ Business bổ trợ nhau
Phần đồ án bạn đang làm CHÍNH LÀ vũ khí bán hàng: **dữ liệu mặt Việt (G2)** + **đánh giá theo điểm vận hành eKYC/TT17 (G1/G3)** + **honest metrics + calibration** + **demo có Grad-CAM** = đúng những gì khách/nhà đầu tư hỏi (§8). → Làm tốt đồ án = có sẵn "đạn" cho pilot.

---

## 11. ✅ QUYẾT ĐỊNH ĐÃ CHỐT + bước cụ thể (thesis + hơi hướng startup)
- **Beachhead = eKYC provider** (B2B2B): bán "tín hiệu deepfake bản địa" để họ gắn vào sản phẩm eKYC bán lại cho bank/fintech.
- **Output = risk-score + band** (per-tenant threshold) — bỏ nhãn REAL/FAKE cứng.
- **Mức = đồ án + hơi hướng startup** → làm **lean, đủ pitch + demo**, KHÔNG over-build (không k8s/ONNX/scale).

### 11.1 Hợp đồng API risk-score (chuẩn để pitch eKYC provider)
```
POST /v1/detect/image      (header: X-API-Key)   body: ảnh khuôn mặt
200 →
{
  "request_id": "uuid",
  "risk_score": 0.83,                 // P(deepfake) ĐÃ calibrate (temperature/Platt — §8#3)
  "risk_band": "high",                // low | medium | high theo ngưỡng per-tenant
  "decision_hint": "review",          // pass | review | reject — GỢI Ý (khách giữ quyết định cuối)
  "thresholds": {"low": 0.30, "high": 0.70},   // per-tenant, calibrate theo FPR budget của khách
  "explanation": {"gradcam_b64": "...", "note": "artifact dải tần mid/high"},
  "liveness": {"score": 0.12, "band": "low"},   // khi bật cascade (G3)
  "model_version": "sfdct-naive-cdfv2-0.7572",
  "latency_ms": 120
}
```
- **Per-tenant config:** mỗi tenant có `fpr_budget` (vd ≤5%) → hệ tự tính `thresholds`. Sandbox key (data giả) vs Prod key.
- **An toàn pháp lý:** `decision_hint` chỉ là gợi ý; tài liệu + SLA ghi rõ "khách ra quyết định cuối".

### 11.2 Backlog MVP gọn (cho eKYC provider, ưu tiên cao→thấp)
1. **Đổi response → risk-score + band + decision_hint + thresholds** (sửa schema + service; dùng prob calibrate từ §8#3). *(no-GPU)*
2. **Calibrate prob khi serve** (nạp temperature/Platt từ `mt_calibrate.py`) → risk_score đáng tin.
3. **Metering + usage dashboard per-tenant** (đếm request, quota) — biến billing mock thành thật.
4. **Sandbox key + trang API docs + 1-page "Accuracy & SLA" trung thực** (TPR@FPR trên data Việt, latency p95).
5. **Cascade liveness (tuỳ chọn bật/tenant)** — tăng catch (G3).
*(Không làm: k8s, ONNX, microservice — 1 VPS đủ pilot.)*

### 11.3 Pitch 1 trang (khung — điền số sau khi có data Việt)
- **Vấn đề:** deepfake qua mặt eKYC → gian lận mở tài khoản; benchmark Tây không phủ mặt người Việt.
- **Giải pháp:** DeepGuard — tín hiệu deepfake-risk **bản địa hoá VN** + liveness, calibrate theo FPR budget, kèm Grad-CAM + log tuân thủ TT17/ND13.
- **Vì sao chúng tôi:** bộ dữ liệu mặt Việt + đánh giá trung thực theo điểm vận hành eKYC + giải thích được.
- **Số (điền sau G2):** TPR@FPR≤5% trên mặt Việt = __ ; latency p95 = __ ms ; chi phí/req = __.
- **Tích hợp:** 1 REST call, có sandbox key, on-prem option.
- **Đề nghị:** pilot miễn phí 1–2 tháng, đổi lấy dữ liệu (ẩn danh, có consent) + case study.

### 11.4 Còn cần bạn quyết
- **On-prem hay cloud-only** cho design-partner đầu tiên? (eKYC provider lớn thường đòi on-prem.)
