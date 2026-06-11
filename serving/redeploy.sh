#!/usr/bin/env bash
# serving/redeploy.sh — re-deploy 2 inference server (SFDCT :8501 + liveness :8502)
#
# Cách dùng (chạy từ repo root hoặc bất kỳ đâu):
#   serving/redeploy.sh code                              # git pull + pip (nếu requirements đổi) + restart cả 2
#   serving/redeploy.sh model sfdct    <NGUỒN> [VERSION]  # thay ckpt SFDCT rồi restart
#   serving/redeploy.sh model liveness <NGUỒN> [VERSION]  # thay ckpt liveness rồi restart
#   serving/redeploy.sh rollback sfdct|liveness           # hoán đổi ckpt ↔ .bak (chạy 2 lần = trở lại)
#   serving/redeploy.sh restart [sfdct|liveness]          # chỉ restart (mặc định cả 2)
#
# <NGUỒN> = file .pth local  HOẶC  path trong HF repo huanthuytnhh/deepfake
#           (vd: runs/20260605-230747/ckpt/efficientnetb4_sfdct/ckpt_best.pth)
# [VERSION] = nhãn model_version mới cho /health — ghi vào serving/serving.env
#             (systemd cần dòng EnvironmentFile= để nhận, xem serving/README.md).
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO="$(dirname "$SCRIPT_DIR")"
HF_REPO="${HF_REPO:-huanthuytnhh/deepfake}"
ENV_FILE="$SCRIPT_DIR/serving.env"

PY="python3"
[ -x "$REPO/.venv-serve/bin/python" ] && PY="$REPO/.venv-serve/bin/python"

usage() { sed -n '2,15p' "${BASH_SOURCE[0]}" | sed 's/^# \{0,1\}//'; exit 1; }

ckpt_path() {
  case "$1" in
    sfdct)    echo "$SCRIPT_DIR/naive_sfdct/ckpt_best.pth" ;;
    liveness) echo "$SCRIPT_DIR/liveness_b4/ckpt_best.pth" ;;
    *) echo "lỗi: đích phải là sfdct|liveness (nhận: '$1')" >&2; exit 1 ;;
  esac
}

restart_one() {
  local unit="deepguard-$1"
  if command -v systemctl >/dev/null && systemctl list-unit-files "$unit.service" 2>/dev/null | grep -q "^$unit"; then
    sudo systemctl restart "$unit" && echo "✓ restarted $unit"
  else
    local mod="infer_server"; [ "$1" = liveness ] && mod="liveness_server"
    local port=8501; [ "$1" = liveness ] && port=8502
    echo "⚠ không thấy systemd unit $unit — restart thủ công (từ repo root):"
    echo "    uvicorn serving.$mod:app --host 0.0.0.0 --port $port"
  fi
}

set_version() {
  local key; case "$1" in sfdct) key=SFDCT_VERSION ;; liveness) key=LIVENESS_VERSION ;; esac
  touch "$ENV_FILE"
  if grep -q "^$key=" "$ENV_FILE"; then
    sed -i "s|^$key=.*|$key=$2|" "$ENV_FILE"
  else
    echo "$key=$2" >> "$ENV_FILE"
  fi
  echo "✓ $key=$2 → $ENV_FILE (server nhận sau restart nếu systemd có EnvironmentFile=)"
}

do_code() {
  cd "$REPO"
  local before after
  before="$(git rev-parse HEAD)"
  if git rev-parse --abbrev-ref --symbolic-full-name '@{u}' >/dev/null 2>&1; then
    git pull --ff-only
  else
    git pull --ff-only origin "$(git rev-parse --abbrev-ref HEAD)"   # branch chưa set upstream
  fi
  after="$(git rev-parse HEAD)"
  if [ "$before" = "$after" ]; then
    echo "= không có commit mới"
  else
    git --no-pager log --oneline "$before..$after"
    if ! git diff --quiet "$before" "$after" -- serving/requirements.txt; then
      echo "→ serving/requirements.txt thay đổi → cài lại deps"
      "$PY" -m pip install -r serving/requirements.txt
    fi
  fi
  restart_one sfdct
  restart_one liveness
}

do_model() {
  local which="$1" src="$2" version="${3:-}"
  local dst tmp
  dst="$(ckpt_path "$which")"
  tmp="$dst.new"
  if [ -f "$src" ]; then
    cp "$src" "$tmp"
    echo "✓ nguồn local: $src"
  else
    echo "→ tải từ HF $HF_REPO: $src"
    "$PY" - "$HF_REPO" "$src" "$tmp" <<'EOF'
import shutil, sys
from huggingface_hub import hf_hub_download
shutil.copy(hf_hub_download(sys.argv[1], sys.argv[2]), sys.argv[3])
EOF
  fi
  # sanity: ckpt phải load được bằng torch TRƯỚC khi swap
  "$PY" - "$tmp" <<'EOF'
import sys, torch
try:
    sd = torch.load(sys.argv[1], map_location="cpu", weights_only=True)
except Exception:
    sd = torch.load(sys.argv[1], map_location="cpu", weights_only=False)
sd = sd.get("state_dict", sd) if isinstance(sd, dict) else {}
assert len(sd) > 10, f"checkpoint bất thường ({len(sd)} keys)"
print(f"✓ checkpoint hợp lệ: {len(sd)} keys")
EOF
  if [ -f "$dst" ]; then
    cp -p "$dst" "$dst.bak"
    echo "✓ backup ckpt cũ: $dst.bak"
  fi
  mv "$tmp" "$dst"
  sha256sum "$dst"
  [ -n "$version" ] && set_version "$which" "$version"
  restart_one "$which"
}

do_rollback() {
  local dst tmp
  dst="$(ckpt_path "$1")"
  [ -f "$dst.bak" ] || { echo "lỗi: không có $dst.bak để rollback" >&2; exit 1; }
  tmp="$dst.swap"
  mv "$dst" "$tmp"; mv "$dst.bak" "$dst"; mv "$tmp" "$dst.bak"
  echo "✓ đã hoán đổi ckpt ↔ .bak (chạy lại lệnh này để quay về)"
  sha256sum "$dst"
  restart_one "$1"
}

cmd="${1:-}"
case "$cmd" in
  code)     do_code ;;
  model)    [ $# -ge 3 ] || usage; do_model "$2" "$3" "${4:-}" ;;
  rollback) [ $# -ge 2 ] || usage; do_rollback "$2" ;;
  restart)  if [ $# -ge 2 ]; then restart_one "$2"; else restart_one sfdct; restart_one liveness; fi ;;
  *) usage ;;
esac
