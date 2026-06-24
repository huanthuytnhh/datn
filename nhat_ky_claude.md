# Nhật Ký Task — DeepGuard

> Format: `#<STT> YYYY-MM-DD | <type>(<scope>): <mô tả ngắn>`
> Type: feat | fix | docs | chore | refactor | test

---

## 2026-06-24

| # | Ngày | Commit | Chi tiết |
|---|---|---|---|
| 1 | 2026-06-24 | `fix(auth): accept_invite kiểm tra tenant.status trước khi tạo user` | B1 — T1: tenant pending/suspended không được nhận invite |
| 2 | 2026-06-24 | `fix(auth): bỏ hardcoded temp password "123456" → secrets.token_hex` | B6 — T1: mật khẩu tạm phải random |
| 3 | 2026-06-24 | `fix(auth): sysadmin không thể sửa/xóa sysadmin khác` | B7 — T1: protect sysadmin peer |
| 4 | 2026-06-24 | `feat(api): enforce tenant monthly_quota → 429 Too Many Requests` | T2: quota 0=unlimited, >0=giới hạn |
| 5 | 2026-06-24 | `feat(frontend): RBAC gate apikeys/webhooks + clamp verdict history` | T4: FE chặn đúng role, normalize verdict display |
| 6 | 2026-06-24 | `fix(ekyc): os.unlink(None) guard + face-match cosine mean + video suffix` | T7: E1/E5/E6 pipeline không crash khi cleanup |
| 7 | 2026-06-24 | `feat(liveness): thêm endpoint playground detect liveness qua JWT` | F1: dashboard test liveness không cần API key |
| 8 | 2026-06-24 | `docs: tạo BAI-GIANG-5-CHUONG.md — bài giảng 5 chương toàn bộ hệ thống` | Giải thích architecture, data flow, cascade cho intern/hội đồng |
| 9 | 2026-06-24 | `docs: tạo TRINH-TU-DEVELOP.md — trình tự phát triển 10 bước từ số 0` | Build order + WHY từng bước cho người muốn recreate project |
| 10 | 2026-06-24 | `fix(docs): sửa resolution 224→256 trong TRINH-TU-DEVELOP.md` | Vibe code từ "EfficientNet = 224" — thực tế config.yaml là 256, dct_grid=8 |
| 11 | 2026-06-24 | `feat(serving): upgrade face_crop.py MTCNN primary thay Haar cascade` | Khớp DeepfakeBench training pipeline (expand_scale=1.3), Haar giữ làm fallback |
| 12 | 2026-06-24 | `fix(serving): liveness_server resize INTER_CUBIC thay PIL BILINEAR` | Khớp gen_fig_liveness_roc.py:30 — eval dùng cv2.INTER_CUBIC |
| 13 | 2026-06-24 | `chore(serving): thêm facenet-pytorch>=1.0.1 vào requirements.txt` | Dependency cho MTCNN face detector |
| 14 | 2026-06-24 | `fix(serving): cài facenet-pytorch --no-deps tránh downgrade torch 2.12→2.2` | facenet-pytorch pin torch<2.3 nhưng MTCNN code tương thích torch 2.12 thực tế |
| 15 | 2026-06-24 | `refactor(serving): face_crop đổi priority Haar→MTCNN fallback (revert MTCNN primary)` | Deepfake model không ổn định với crop MTCNN trên ảnh Fujifilm/screenshot thực tế |
