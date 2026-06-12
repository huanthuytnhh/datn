"""push_to_cloudwatch.py — tail backend/app.log và đẩy lên CloudWatch Logs (Phase 2 runbook).

Chạy bằng systemd unit `deepguard-logfwd` (xem AWS_DEPLOY_RUNBOOK.md §B4).
Viết lại từ mẫu HarmonySeeker-ai/log_forwarder/push_to_cloudwatch.py:
  - BỎ xử lý sequenceToken (AWS bỏ yêu cầu này từ 2023)
  - chịu được log rotation (file bị thay/cắt -> đọc lại từ đầu)
Env (backend/.env): CW_LOG_GROUP, CW_LOG_STREAM (trống -> ec2-<ngày>), CW_REGION,
AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY (boto3 tự đọc).
"""
import json
import logging
import os
import time
from datetime import datetime, timezone
from pathlib import Path

import boto3
from dotenv import load_dotenv

_BACKEND = Path(__file__).resolve().parent.parent
load_dotenv(_BACKEND / ".env")

LOG_GROUP = os.getenv("CW_LOG_GROUP", "/deepguard/backend")
LOG_STREAM = os.getenv("CW_LOG_STREAM") or f"ec2-{datetime.now(timezone.utc):%Y-%m-%d}"
REGION = os.getenv("CW_REGION", os.getenv("S3_REGION", "ap-southeast-1"))
LOG_FILE = Path(os.getenv("LOG_FILE_PATH", _BACKEND / "app.log"))
STATE_FILE = Path(__file__).resolve().parent / ".logfwd_state.json"
POLL_SECONDS = 5
MAX_BATCH = 500  # put_log_events tối đa 10k events/1MB — 500 là dư an toàn

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
log = logging.getLogger("logfwd")


def _load_pos() -> int:
    try:
        return json.loads(STATE_FILE.read_text())["pos"]
    except Exception:
        return 0


def _save_pos(pos: int) -> None:
    STATE_FILE.write_text(json.dumps({"pos": pos}))


def _ensure_group_stream(client) -> None:
    for fn, kwargs in (
        (client.create_log_group, {"logGroupName": LOG_GROUP}),
        (client.create_log_stream, {"logGroupName": LOG_GROUP, "logStreamName": LOG_STREAM}),
    ):
        try:
            fn(**kwargs)
        except client.exceptions.ResourceAlreadyExistsException:
            pass


def _read_new_lines(pos: int) -> tuple[list, int]:
    if not LOG_FILE.exists():
        return [], pos
    size = LOG_FILE.stat().st_size
    if size < pos:  # file bị rotate/cắt -> đọc lại từ đầu
        pos = 0
    with open(LOG_FILE, "r", encoding="utf-8", errors="replace") as f:
        f.seek(pos)
        lines = [ln.rstrip("\n") for ln in f.readlines() if ln.strip()]
        return lines, f.tell()


def main() -> None:
    client = boto3.client("logs", region_name=REGION)
    _ensure_group_stream(client)
    log.info("forwarding %s -> %s/%s", LOG_FILE, LOG_GROUP, LOG_STREAM)
    pos = _load_pos()
    while True:
        lines, new_pos = _read_new_lines(pos)
        for i in range(0, len(lines), MAX_BATCH):
            now_ms = int(time.time() * 1000)
            events = [{"timestamp": now_ms, "message": m} for m in lines[i:i + MAX_BATCH]]
            try:
                client.put_log_events(
                    logGroupName=LOG_GROUP, logStreamName=LOG_STREAM, logEvents=events
                )
            except Exception as exc:
                log.warning("put_log_events failed (giữ vị trí cũ, thử lại sau): %s", exc)
                new_pos = pos
                break
        if new_pos != pos:
            pos = new_pos
            _save_pos(pos)
        time.sleep(POLL_SECONDS)


if __name__ == "__main__":
    main()
