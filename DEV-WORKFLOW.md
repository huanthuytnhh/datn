# Quy trình dev DeepGuard — MỘT copy duy nhất trong WSL

> Quyết định: chỉ làm việc trên **WSL `~/deepguard/app`** (Linux = giống AWS).
> Bản Windows `…\thanhln\datn` đã **ngừng dùng** — đừng sửa code ở đó nữa.

## Vì sao
- venv Linux + Docker (Postgres/MinIO) + model chỉ chạy trong WSL.
- WSL home (ext4) nhanh hơn `/mnt/c` rất nhiều cho node_modules/venv/git.
- Linux trùng môi trường AWS → deploy không bất ngờ.
- Sửa file WSL từ tool Windows hay làm hỏng line-ending (CRLF). Ở hẳn trong WSL là hết.

## Hằng ngày
```bash
# Mở terminal WSL (Ubuntu-24.04)
cd ~/deepguard/app
./up.sh                 # bật cả stack (đợi ~60-90s) -> http://localhost:3000
code .                  # mở VS Code Remote-WSL (sửa code native, không CRLF)
# ... code/test ...
./down.sh               # tắt cả stack + Docker
```
Xem log khi chạy: `tail -f /tmp/backend.log /tmp/serving_*.log /tmp/frontend.log`

## Sửa code bằng gì
- **VS Code Remote–WSL**: trong WSL gõ `code .` (lần đầu VS Code tự cài WSL server).
  Hoặc trong VS Code: lệnh "WSL: Connect to WSL" rồi mở `~/deepguard/app`.
- **Claude Code**: nên chạy **từ terminal WSL** tại `~/deepguard/app`
  (`claude`), để AI thao tác đường dẫn Linux gốc — không còn lỗi UNC/CRLF.

## Git
- Toàn bộ commit/push/redeploy làm trong WSL: `cd ~/deepguard/app && git ...`
- `.gitattributes` đã ép `eol=lf` → mọi commit về sau luôn LF dù sửa bằng tool nào.
- Đổi đồng loạt LF cho file cũ (khi muốn commit sạch):
  `git add --renormalize . && git status`

## Bản Windows `datn`
- Đã copy docs sang WSL. Có thể **lưu trữ làm backup** rồi xoá sau khi chắc WSL ổn:
  đừng vừa sửa Windows vừa sửa WSL → đó chính là nguồn gây phân kỳ.
