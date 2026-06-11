# serving/ — ML inference servers (SFDCT deepfake :8501 + liveness :8502)

Bản mirror từ `DeepfakeBench/serving/` (bản chính, commit `80157c5` nhánh
`dev-thanhln-blockdct-hff` của repo `huanthuytnhh/DeepfakeBench`).

## Lưu ý quan trọng khi chạy

- `infer_server.py` **phải chạy bên trong DeepfakeBench** vì nó nạp
  `<repo>/tools/infer.py` và `<repo>/training/detectors/` theo đường dẫn tương đối
  (`REPO = cha của serving/`). Bản mirror này không chạy độc lập.
- Deploy đúng cách (xem `AWS_DEPLOY_RUNBOOK.md` §4–§5): clone repo DeepfakeBench,
  rồi chạy từ DeepfakeBench root:
  ```bash
  uvicorn serving.infer_server:app --host 0.0.0.0 --port 8501
  uvicorn serving.liveness_server:app --host 0.0.0.0 --port 8502
  ```
- Checkpoint KHÔNG nằm trong git — tải từ HF `huanthuytnhh/deepfake` (public):
  - SFDCT: `runs/20260605-230747/ckpt/efficientnetb4_sfdct/ckpt_best.pth` (sha256 `1c5f04fa…`)
  - Liveness: `runs/liveness-20260606-100514/b4/ckpt_best_liveness.pth` (sha256 `6ed8c9ee…`)
  đặt vào `serving/naive_sfdct/ckpt_best.pth` và `serving/liveness_b4/ckpt_best.pth`.

Backend gọi 2 server này qua env `SFDCT_INFER_URL` / `LIVENESS_INFER_URL`
(xem `backend/app/config.py`).
