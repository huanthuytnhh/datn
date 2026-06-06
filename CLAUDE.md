# Project — Deepfake & Liveness Detection for eKYC (graduation thesis)

AI-Engineer graduation thesis (Le Ngoc Thanh). Goal: a robust **deepfake / face-forgery +
liveness** detector for **eKYC**, trained and evaluated under **DeepfakeBench**, with a focus
on **spatial–frequency (DCT)** methods and fair, generalizable evaluation.

## Research focus

- Core hypothesis: GAN/upsampling forgery artifacts are weak in the spatial domain but loud
  in **mid/high 2D-DCT frequency bands**; spatial+frequency **collaboration** generalizes
  better across manipulations and datasets (FF++ → Celeb-DF/DFDC).
- Method line: `efficientnetb4_dct` (FcaNet multi-spectral attention, residual-gated) ·
  `f3net` (FAD band decomposition) · `ecsf` (lightweight SFCL-HCMF distillation).
- Open problems to push on: cross-dataset generalization, robustness to compression,
  Vietnamese-face + spoof scenarios, eKYC threshold calibration (Thông tư 17/2024/TT-NHNN, FPR≤5%).

## Repo map (key paths)

- `DeepfakeBench/` — training/eval framework (`training/detectors/`, `training/config/`).
- `efficientnetb4_dct_detector.py`, `efficientnetb4_dct.yaml` — B4 + DCT-residual attention.
- `p1/` — SFCL-HCMF re-implementation (`dct.py`, `sida.py`, `local_branch.py`, `fusion.py`, `model.py`).
- `p5/` — `ecsf_core.py`, `ecsf_detector.py` (thesis's lightweight ECSF-Fast detector).
- `.claude/skills/paper-to-toy-notebook/` — local skill + 4 worked example notebooks
  (FcaNet, F3-Net, SFCL, DeepfakeBench) that teach these papers by building CPU toys.
- Runbooks: `LOCAL_3060_SETUP.md`, `VAST_SETUP.md`, `SETUP_DCT.md`, `PLAN_DEEPGUARD.md`.

## Compute / Remote Server

> ARIS reads this section to decide where to run experiments. Fill the placeholders with the
> current GPU instance before launching `/experiment-bridge`.

- **Local**: RTX 3050 (4 GB) / 3060 — smoke tests only (shape → dry-run → overfit-1-batch).
  ALWAYS run a tiny local smoke test before any full/paid run (see `smoke-test-before-train` rule).
- **Remote (full training)**: vast.ai GPU instance — see `VAST_SETUP.md`.
  - SSH: `ssh -p <PORT> root@<VAST_IP>` (key-based)  ← **set per instance**
  - Conda env: `<ENV>` (Python 3.x + PyTorch + CUDA)  ← from VAST_SETUP.md
  - Activate: `eval "$(/opt/conda/bin/conda shell.bash hook)" && conda activate <ENV>`
  - Code dir on server: `<.../DeepfakeBench>`
  - Background jobs: `tmux new -d -s exp0 'bash -c "..."'` (or `screen -dmS exp0 ...`).
- Datasets: FaceForensics++ (c23), Celeb-DF-v2, DFDC (cross-dataset). See `dataset_json/`.

## Vast.ai (for `/experiment-bridge` → `/run-experiment` auto-deploy)
- gpu: vast                  # rent on-demand GPU from vast.ai (per the ARIS vast-gpu guide)
- auto_destroy: false        # keep the instance up to inspect results before tearing down
- max_budget: 5.00           # warn if an experiment's estimated cost exceeds this
- one-command runner on the box: `./start.sh setup && ./start.sh data && ./start.sh smoke && ./start.sh train`
  (repo `huanthuytnhh/DeepfakeBench`; results auto-push: figures→git, `.pth`→HF `huanthuytnhh/deepfake`).
- Prereq (once, local): `pip install vastai && vastai set api-key <KEY>`; SSH pubkey at cloud.vast.ai/manage-keys.
- If a manual instance is ALREADY running (current session), prefer `gpu: remote` pointing at it instead of
  renting a second box: SSH `ssh -i ~/.ssh/id_ed25519_vast -p <PORT> root@<HOST>`, code at `/workspace/DeepfakeBench`.

## Reviewer (ARIS cross-model review)

- Default: **manual-review** (human-in-the-loop, zero API cost) — works out of the box.
- Optional cross-model reviewers (set keys in `.env`, register MCP): Codex/GPT (recommended),
  Gemini, or MiniMax. See `~/aris_repo/docs/` (`CODEX_*`, `*_REVIEW_GUIDE`, `LLM_API_MIX_MATCH_GUIDE`).

## Working rules

- Smoke-test before any full/paid training run; split runbooks into smoke + full steps.
- Match papers **qualitatively** in toys; reproduce real numbers only on the real pipeline.
- Commit only when asked.

## App (frontend/backend) — MUST follow `CONVENTIONS.md`

The DeepGuard app (`backend/` FastAPI, `frontend/` Next.js, SFDCT serving) follows **`CONVENTIONS.md`**
(architecture flow, auth/RBAC, Pydantic Create/Read/Update, deepguard_db-only DB access, TanStack Query +
Zustand-for-3-things, MTCNN→SFDCT inference, file ≤250 lines). Stack detail in `TECH_STACK.md`.
Branch per feature `dev-{tên}-{feature}` from dev → merge `dev-thanhln-newfe`; **NO `Co-Authored-By` trailer**.
<!-- ARIS:BEGIN -->
## ARIS Skill Scope
ARIS skills installed in this project: 79 entries.
Manifest: `.aris/installed-skills.txt` (lists every skill ARIS installed and its upstream target).
For ARIS workflows, prefer the project-local skills under `.claude/skills/` over global skills.
Do not modify or delete files inside any skill that is a symlink (symlinks point into `/home/huanthuytnhh/aris_repo`).
Update with: `bash /home/huanthuytnhh/aris_repo/tools/install_aris.sh`  (re-runnable; reconciles new/removed skills).
<!-- ARIS:END -->
