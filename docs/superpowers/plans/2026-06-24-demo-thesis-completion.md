# DeepGuard Demo Thesis Completion Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete all remaining gaps so the DeepGuard demo runs end-to-end for the thesis defense: stack starts cleanly, detection/liveness/eKYC flows produce real ML results with Grad-CAM, dashboard shows live data, and code passes CONVENTIONS.md audit.

**Architecture:** 6-service stack managed by `up.sh`/`down.sh` — Postgres :5432, MinIO :9000, SFDCT serving :8501, Liveness serving :8502, FastAPI backend :8000, Next.js frontend :3000. All ML inference via HTTP to the microservices (no torch in backend). Multi-tenant, RBAC (5 roles), API-key + JWT auth.

**Tech Stack:** Python 3.10 + FastAPI + SQLAlchemy async + asyncpg (backend) · PyTorch + EfficientNet-B4 + block-DCT + Grad-CAM (serving) · Next.js 16 + React 19 + Zustand + TanStack Query + shadcn/ui (frontend) · PostgreSQL 15 · MinIO S3 · pytest (tests) · bun (FE package manager)

## Global Constraints

- Working dir in WSL: `~/deepguard/app` — all paths below are relative to this root
- No `Co-Authored-By` trailer in any git commit
- Backend files ≤ 250 lines; split by responsibility
- Frontend files ≤ 250 lines; `"use client"` only when needed
- DB access ONLY via `deepguard_db` package — no raw SQL, no SQLAlchemy in routers
- Pydantic v2: separate schemas `Create` / `Read` / `Update` (no reuse)
- Frontend data fetching: TanStack Query `useQuery`/`useMutation` only — no `useEffect(() => fetch(...))`
- Zustand for exactly 3 things: auth, navigation, appearance
- No NextAuth, no @prisma/client, no z-ai-sdk in frontend
- Feature branches: `dev-{name}-{feature}` from dev → merge `dev-thanhln-newfe`
- SFDCT microservice is a black box — backend calls it via `httpx POST /predict` only

---

## Priority Map

| Priority | Group | Deadline |
|----------|-------|---------|
| **P0 — MUST** | Stack health, E2E demo flows | Before defense |
| **P1 — HIGH** | Analytics gap, FE cleanup | Before defense |
| **P2 — MEDIUM** | Webhook delivery, rate limiting | After defense |
| **P3 — NICE** | Page size refactor, email notifications | Future |

---

## Task 1: Stack Health Smoke Test

**Files:**
- Read: `up.sh`
- Read: `backend/.env`
- Read: `backend/scripts/seed.py`

**Interfaces:**
- Produces: All 6 services return HTTP 200 on their `/health` or index; seed creates demo users

- [ ] **Step 1: Run up.sh and watch for failures**

```bash
cd ~/deepguard/app
bash up.sh 2>&1 | tee /tmp/startup.log
```

Expected: All 6 lines like `[3/6] serving :8501 ... ok` appear.
If any service fails, check logs:
```bash
tail -50 /tmp/backend.log
tail -50 /tmp/serving_deepfake.log
tail -50 /tmp/serving_liveness.log
tail -50 /tmp/frontend.log
```

- [ ] **Step 2: Health check all services**

```bash
curl -s http://localhost:8501/health | python3 -m json.tool
curl -s http://localhost:8502/health | python3 -m json.tool
curl -s http://localhost:8000/health
curl -s http://localhost:3000 -o /dev/null -w "%{http_code}"
```

Expected: each returns 200.

- [ ] **Step 3: Run seed script**

```bash
cd ~/deepguard/app
backend/.venv310/bin/python3 backend/scripts/seed.py
```

Expected output includes:
```
[seed] sysadmin@deepguard.vn created
[seed] dev@vietbank.vn created
[seed] API key created: dg_...
[seed] Done
```

- [ ] **Step 4: Verify login works**

```bash
curl -s -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"dev@vietbank.vn","password":"Password123!"}' \
  | python3 -m json.tool
```

Expected: `{"access_token": "...", "token_type": "bearer"}`

- [ ] **Step 5: Save JWT for subsequent smoke tests**

```bash
export JWT=$(curl -s -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"dev@vietbank.vn","password":"Password123!"}' \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['access_token'])")
echo "JWT: ${JWT:0:30}..."
```

- [ ] **Step 6: Commit (nothing changes in this task)**

This task is read-only verification. If any service fails, fix before proceeding to Task 2.

---

## Task 2: Core Detection E2E Smoke Test (Playground)

**Files:**
- Test against: `backend/app/routers/playground.py`
- Test against: `backend/app/services/ml_inference.py`
- Read if failing: `serving/infer_server.py`

**Interfaces:**
- Consumes: `$JWT` from Task 1
- Produces: `/playground/detect/image` returns `{verdict, prob_fake, gradcam_b64}` with real model output (not mock)

- [ ] **Step 1: Download a test face image**

```bash
# Use any face image; create a minimal test JPEG
python3 -c "
from PIL import Image, ImageDraw
img = Image.new('RGB', (256,256), color=(200,160,120))
draw = ImageDraw.Draw(img)
draw.ellipse([60,60,196,196], fill=(230,180,140))
draw.ellipse([90,100,116,126], fill=(60,40,30))
draw.ellipse([140,100,166,126], fill=(60,40,30))
draw.arc([100,130,156,160], 0,180, fill=(120,50,50), width=3)
img.save('/tmp/test_face.jpg')
print('saved /tmp/test_face.jpg')
"
```

- [ ] **Step 2: POST to playground detect image**

```bash
curl -s -X POST http://localhost:8000/playground/detect/image \
  -H "Authorization: Bearer $JWT" \
  -F "file=@/tmp/test_face.jpg" \
  -F "include_heatmap=true" \
  | python3 -m json.tool
```

Expected keys in response:
```json
{
  "verdict": "REAL",
  "prob_fake": 0.123,
  "confidence": 0.877,
  "gradcam_b64": "data:image/jpeg;base64,...",
  "processing_time_ms": 320,
  "model_version": "sfdct-v1"
}
```

If `gradcam_b64` is `null` or `verdict` is missing, check:
```bash
tail -20 /tmp/backend.log
curl -s http://localhost:8501/health | python3 -m json.tool
```

- [ ] **Step 3: POST to serving microservice directly (verify model loaded)**

```bash
curl -s -X POST http://localhost:8501/predict \
  -F "file=@/tmp/test_face.jpg" \
  -F "gradcam=true" \
  | python3 -c "import sys,json; d=json.load(sys.stdin); print('prob_fake:', d['prob_fake'], '| verdict:', d['verdict'], '| gradcam len:', len(d.get('gradcam_b64','') or ''))"
```

Expected: prints `prob_fake: 0.xxx | verdict: REAL | gradcam len: >1000`

- [ ] **Step 4: Test via API key (v1 endpoint)**

```bash
# Get API key from seed
export APIKEY=$(curl -s http://localhost:8000/api-keys \
  -H "Authorization: Bearer $JWT" \
  | python3 -c "import sys,json; keys=json.load(sys.stdin)['items']; print(keys[0]['prefix']+'...' if keys else 'NO_KEY')")
echo "API Key prefix: $APIKEY"
```

If no key exists, create one:
```bash
export APIKEY_FULL=$(curl -s -X POST http://localhost:8000/api-keys \
  -H "Authorization: Bearer $JWT" \
  -H "Content-Type: application/json" \
  -d '{"name":"demo-key","quota_limit":1000,"rate_limit_rpm":60}' \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['plain_key'])")
echo "Created: ${APIKEY_FULL:0:20}..."
```

Test detection:
```bash
curl -s -X POST http://localhost:8000/v1/detect/image \
  -H "X-API-Key: $APIKEY_FULL" \
  -F "file=@/tmp/test_face.jpg" \
  | python3 -m json.tool
```

- [ ] **Step 5: Commit if code was fixed**

Only commit if you had to fix something in backend/services/:
```bash
git add backend/app/services/ml_inference.py backend/app/routers/playground.py
git commit -m "fix: ensure gradcam_b64 returned from playground detect image"
```

---

## Task 3: Liveness Detection E2E Smoke Test

**Files:**
- Test against: `backend/app/routers/liveness.py`
- Read if failing: `serving/liveness_server.py`

**Interfaces:**
- Consumes: `$JWT`, `$APIKEY_FULL` from Task 1-2
- Produces: `/v1/detect/liveness` returns `{verdict: LIVE|SPOOF|UNCERTAIN, liveness_score}`

- [ ] **Step 1: Test passive liveness via API key**

```bash
curl -s -X POST http://localhost:8000/v1/detect/liveness \
  -H "X-API-Key: $APIKEY_FULL" \
  -F "file=@/tmp/test_face.jpg" \
  | python3 -m json.tool
```

Expected keys:
```json
{
  "verdict": "LIVE",
  "liveness_score": 0.85,
  "confidence": 0.85,
  "processing_time_ms": 180,
  "model_version": "b4-liveness-auc0.9829"
}
```

- [ ] **Step 2: Test liveness via playground (JWT, no API key needed)**

```bash
curl -s -X POST http://localhost:8000/playground/detect/liveness \
  -H "Authorization: Bearer $JWT" \
  -F "file=@/tmp/test_face.jpg" \
  | python3 -m json.tool
```

- [ ] **Step 3: Test active liveness challenge**

```bash
# Get a challenge
curl -s http://localhost:8000/v1/liveness/challenge \
  -H "X-API-Key: $APIKEY_FULL" \
  | python3 -m json.tool
```

Expected:
```json
{"challenge_id": "uuid", "challenge_type": "blink", "instruction": "Please blink your eyes", "expires_in": 60}
```

- [ ] **Step 4: Verify liveness appears in dashboard**

```bash
curl -s "http://localhost:8000/liveness?limit=5" \
  -H "Authorization: Bearer $JWT" \
  | python3 -m json.tool
```

Expected: returns list of liveness checks just created.

---

## Task 4: eKYC Pipeline E2E Smoke Test

**Files:**
- Test against: `backend/app/main.py` (eKYC router mount)
- Read: `deepguard_liveness/ekyc_pipeline.py`

**Interfaces:**
- Consumes: `$APIKEY_FULL`, two images (CCCD + selfie video frames)
- Produces: `/v1/ekyc/verify` returns `{verdict: PASS|FAIL, liveness_pass, deepfake_pass, face_match_pass}`

- [ ] **Step 1: Check if eKYC router is mounted**

```bash
curl -s http://localhost:8000/openapi.json | python3 -c \
  "import sys,json; paths=json.load(sys.stdin)['paths']; print([p for p in paths if 'ekyc' in p])"
```

Expected: `['/v1/ekyc/verify']` — if empty, the deepguard_liveness package failed to load.

If eKYC route is missing, check:
```bash
tail -30 /tmp/backend.log | grep -i "ekyc\|liveness\|import"
```

If deepguard_liveness package missing, install it:
```bash
cd ~/deepguard/app
backend/.venv310/bin/pip install -e deepguard_liveness/ 2>&1 | tail -5
# then restart backend:
pkill -f "uvicorn app.main" ; sleep 2
cd backend && ../.venv310/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000 >> /tmp/backend.log 2>&1 &
```

- [ ] **Step 2: Test eKYC verify endpoint**

```bash
# Requires: ID card image (any face) + selfie video (mp4) or multiple frames
# Use the test_face.jpg twice (simplified test)
curl -s -X POST http://localhost:8000/v1/ekyc/verify \
  -H "X-API-Key: $APIKEY_FULL" \
  -F "id_card_image=@/tmp/test_face.jpg" \
  -F "selfie_video=@/tmp/test_face.jpg" \
  | python3 -m json.tool
```

Expected structure:
```json
{
  "verdict": "PASS",
  "overall_pass": true,
  "liveness_pass": true,
  "deepfake_pass": true,
  "face_match_pass": true,
  "processing_time_ms": 1200
}
```

---

## Task 5: Analytics Backend — Per-API-Key Usage Breakdown

**Files:**
- Modify: `backend/app/routers/analytics.py`
- Modify: `backend/app/schemas/analytics.py`
- Test: `backend/tests/test_analytics.py` (create)

**Interfaces:**
- Consumes: `get_current_user`, `get_db`, role `admin`/`compliance`/`sysadmin`
- Produces: `GET /analytics/usage` returns `{quota_used, quota_limit, per_key: [{key_name, prefix, quota_used, quota_limit, detection_count, fake_count}]}`

- [ ] **Step 1: Read current analytics schema**

```bash
cat backend/app/schemas/analytics.py
```

Note the existing `UsageInfo` schema shape.

- [ ] **Step 2: Write failing test**

Create `backend/tests/test_analytics.py`:

```python
import pytest

def test_usage_has_per_key_breakdown(client, developer_token, sample_api_key):
    """GET /analytics/usage must include per_key list with at least one entry."""
    resp = client.get(
        "/analytics/usage",
        headers={"Authorization": f"Bearer {developer_token}"},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert "per_key" in data, "per_key field missing from /analytics/usage"
    assert isinstance(data["per_key"], list)
```

- [ ] **Step 3: Run test to verify it fails**

```bash
cd ~/deepguard/app
backend/.venv310/bin/pytest backend/tests/test_analytics.py::test_usage_has_per_key_breakdown -v
```

Expected: `FAILED — AssertionError: per_key field missing`

- [ ] **Step 4: Add `per_key` to analytics schema**

In `backend/app/schemas/analytics.py`, add:

```python
class ApiKeyUsageSummary(BaseModel):
    key_id: str
    key_name: str
    prefix: str
    quota_used: int
    quota_limit: int | None
    detection_count: int
    fake_count: int

class UsageInfo(BaseModel):
    quota_used: int
    quota_limit: int | None
    per_key: list[ApiKeyUsageSummary] = []
```

- [ ] **Step 5: Update analytics router**

In `backend/app/routers/analytics.py`, update the `/analytics/usage` handler to include per-key data:

```python
@router.get("/usage", response_model=UsageInfo)
async def get_usage(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    from deepguard_db.app.db import crud
    tenant = await crud.get_tenant(db, current_user.tenant_id)
    keys = await crud.list_api_keys(db, current_user.tenant_id)

    per_key = []
    for key in keys:
        count = await crud.count_detections_by_key(db, key.id)
        fake = await crud.count_detections_by_key_verdict(db, key.id, "FAKE")
        per_key.append(ApiKeyUsageSummary(
            key_id=str(key.id),
            key_name=key.name,
            prefix=key.prefix,
            quota_used=key.quota_used,
            quota_limit=key.quota_limit,
            detection_count=count,
            fake_count=fake,
        ))

    return UsageInfo(
        quota_used=tenant.current_usage,
        quota_limit=tenant.monthly_quota,
        per_key=per_key,
    )
```

If `crud.count_detections_by_key` doesn't exist, add to `deepguard_db/app/db/crud.py`:

```python
async def count_detections_by_key(db: AsyncSession, api_key_id: UUID) -> int:
    result = await db.execute(
        select(func.count()).where(Detection.api_key_id == api_key_id)
    )
    return result.scalar() or 0

async def count_detections_by_key_verdict(
    db: AsyncSession, api_key_id: UUID, verdict: str
) -> int:
    result = await db.execute(
        select(func.count()).where(
            Detection.api_key_id == api_key_id,
            Detection.verdict == verdict,
        )
    )
    return result.scalar() or 0
```

- [ ] **Step 6: Run test to verify it passes**

```bash
backend/.venv310/bin/pytest backend/tests/test_analytics.py -v
```

Expected: `PASSED`

- [ ] **Step 7: Commit**

```bash
git add backend/app/schemas/analytics.py backend/app/routers/analytics.py \
        deepguard_db/app/db/crud.py backend/tests/test_analytics.py
git commit -m "feat: add per-api-key breakdown to analytics usage endpoint"
```

---

## Task 6: Frontend Package Cleanup (Remove Dead Dependencies)

**Files:**
- Modify: `frontend/package.json`
- Run: `bun install` (updates bun.lock)
- Check: Any import of next-auth, @prisma/client, z-ai-sdk in `frontend/src/`

**Interfaces:**
- Produces: `bun run build` succeeds, no import errors for removed packages

- [ ] **Step 1: Find all dead imports**

```bash
grep -r "next-auth\|@prisma\|z-ai-web-dev-sdk" frontend/src/ --include="*.ts" --include="*.tsx" -l
```

Expected: empty (no files use them). If files appear, read them and remove the import.

- [ ] **Step 2: Remove from package.json**

Edit `frontend/package.json`. Remove these entries from `dependencies`:
- `"next-auth": "..."`
- `"@prisma/client": "..."`
- `"prisma": "..."` (may be in devDependencies)
- `"z-ai-web-dev-sdk": "..."` (or similar name)

Also remove:
- `"@dnd-kit/core": "..."` (confirmed unused — no import in deepguard pages)
- `"@dnd-kit/sortable": "..."`
- `"@dnd-kit/utilities": "..."`
- `"embla-carousel-react": "..."` (carousel not used in pages)

- [ ] **Step 3: Reinstall with bun**

```bash
cd ~/deepguard/app/frontend
~/.bun/bin/bun install
```

Expected: installs without errors, bun.lock updated.

- [ ] **Step 4: Verify build still passes**

```bash
cd ~/deepguard/app/frontend
~/.bun/bin/bun run build 2>&1 | tail -20
```

Expected: `Route (app) ... compiled successfully`

- [ ] **Step 5: Commit**

```bash
cd ~/deepguard/app
git add frontend/package.json frontend/bun.lock
git commit -m "chore: remove unused packages (next-auth, prisma, dnd-kit, embla-carousel)"
```

---

## Task 7: Frontend useEffect → useQuery Migration

**Files:**
- Search: `frontend/src/components/deepguard/` for `useEffect.*fetch\|useEffect.*api\.\|useEffect.*req(`
- Modify: Any files found

**Interfaces:**
- Consumes: `api.*()` functions from `@/lib/api`
- Produces: All data fetching goes through `useQuery` / `useMutation` from `@tanstack/react-query`

- [ ] **Step 1: Find all useEffect-fetch violations**

```bash
grep -rn "useEffect" frontend/src/components/deepguard/ --include="*.tsx" \
  | grep -v "//\|^\s*//" \
  | grep "api\.\|req(\|fetch(" \
  | head -30
```

List each file and line found.

- [ ] **Step 2: For each violation, replace pattern**

Before (anti-pattern):
```tsx
const [data, setData] = useState(null);
const [loading, setLoading] = useState(true);

useEffect(() => {
  setLoading(true);
  apiSomething().then(r => {
    setData(r);
    setLoading(false);
  });
}, [dep]);
```

After (correct pattern):
```tsx
import { useQuery } from "@tanstack/react-query";
import { apiSomething } from "@/lib/api";

const { data, isLoading, error } = useQuery({
  queryKey: ["something", dep],
  queryFn: () => apiSomething(dep),
});
```

For mutations (POST/PATCH/DELETE):
```tsx
import { useMutation, useQueryClient } from "@tanstack/react-query";

const queryClient = useQueryClient();
const mutation = useMutation({
  mutationFn: (payload) => apiDoSomething(payload),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["something"] });
  },
});

// call: mutation.mutate(payload)
// state: mutation.isPending, mutation.isError
```

- [ ] **Step 3: Run TypeScript check**

```bash
cd ~/deepguard/app/frontend
~/.bun/bin/bun run build 2>&1 | grep "error TS" | head -20
```

Expected: no TypeScript errors.

- [ ] **Step 4: Commit each file separately**

```bash
git add frontend/src/components/deepguard/<changed-file>.tsx
git commit -m "refactor: migrate useEffect-fetch to useQuery in <page-name>"
```

---

## Task 8: Billing Page — "Coming Soon" State

**Files:**
- Modify: `frontend/src/components/deepguard/billing-page.tsx`

**Interfaces:**
- Produces: Billing page renders without API calls, shows clear "coming soon" banner

- [ ] **Step 1: Read current billing page**

```bash
head -80 frontend/src/components/deepguard/billing-page.tsx
```

Note: page currently has full UI but no working API calls. Goal: replace broken API calls with a static "coming soon" state.

- [ ] **Step 2: Remove broken API calls and add coming-soon banner**

Find all `useEffect` or `useQuery` calls in the file that reference a missing `/billing` endpoint and remove them.

Add at the top of the JSX return (inside the page wrapper):

```tsx
{/* Coming Soon Banner */}
<div className="rounded-xl border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30 px-6 py-4 mb-6 flex items-start gap-3">
  <span className="text-amber-600 text-xl">🚧</span>
  <div>
    <p className="font-semibold text-amber-800 dark:text-amber-300">Billing Management — Coming Soon</p>
    <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">
      Usage quota and billing features are under development. Contact your admin for quota adjustments.
    </p>
  </div>
</div>
```

Remove any `useState` / `useEffect` that attempt to fetch `/billing/*` or `/invoices/*` — these don't exist yet.

- [ ] **Step 3: Verify page renders without console errors**

Open browser at `http://localhost:3000`, log in, navigate to Billing. Check browser console for errors.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/components/deepguard/billing-page.tsx
git commit -m "ui: replace broken billing API calls with coming-soon banner"
```

---

## Task 9: Settings Page — Local-Only Labeling

**Files:**
- Modify: `frontend/src/components/deepguard/settings-page.tsx`

**Interfaces:**
- Produces: Settings page clearly labels theme/appearance as "Saved to browser" — no phantom API calls

- [ ] **Step 1: Find any settings API calls**

```bash
grep -n "api\.\|req(\|useQuery\|useMutation\|useEffect.*api" \
  frontend/src/components/deepguard/settings-page.tsx | head -20
```

Remove any that call non-existent backend settings endpoints.

- [ ] **Step 2: Add "browser-local" label to each settings section**

For theme, radius, notification settings — add a subtle label:

```tsx
<p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
  <span>💾</span> Saved to this browser only
</p>
```

Place this under each settings group heading that uses localStorage (appearance, notifications).

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/deepguard/settings-page.tsx
git commit -m "ui: label browser-local settings clearly, remove phantom API calls"
```

---

## Task 10: Webhook Event Delivery

**Files:**
- Create: `backend/app/services/webhook_delivery.py`
- Modify: `backend/app/routers/detect.py` (emit on detection complete)
- Modify: `backend/app/routers/liveness.py` (emit on liveness complete)
- Test: `backend/tests/test_webhook_delivery.py` (create)

**Interfaces:**
- Consumes: `Detection`, `LivenessCheck` DB row after save; `Webhook` list for tenant
- Produces: HTTP POST to each active webhook URL with signed payload

- [ ] **Step 1: Write failing test**

Create `backend/tests/test_webhook_delivery.py`:

```python
import pytest
import respx
import httpx
from unittest.mock import MagicMock
from app.services.webhook_delivery import deliver_event

@pytest.mark.asyncio
@respx.mock
async def test_deliver_event_posts_to_webhook_url():
    """deliver_event() must POST signed JSON to the registered webhook URL."""
    mock_route = respx.post("https://example.com/hook").mock(
        return_value=httpx.Response(200, json={"ok": True})
    )
    webhooks = [
        MagicMock(url="https://example.com/hook", secret="testsecret",
                  status="active", events=["detection.completed"])
    ]
    await deliver_event(
        webhooks=webhooks,
        event="detection.completed",
        payload={"request_id": "abc", "verdict": "REAL"},
    )
    assert mock_route.called, "webhook URL was not called"
```

- [ ] **Step 2: Run test to verify it fails**

```bash
backend/.venv310/bin/pytest backend/tests/test_webhook_delivery.py -v
```

Expected: `FAILED — ImportError: cannot import name 'deliver_event'`

- [ ] **Step 3: Create webhook_delivery.py**

Create `backend/app/services/webhook_delivery.py` (≤ 80 lines):

```python
import hashlib
import hmac
import json
import logging
import time
from typing import Any

import httpx

log = logging.getLogger(__name__)


def _sign(payload_bytes: bytes, secret: str) -> str:
    return "sha256=" + hmac.new(
        secret.encode(), payload_bytes, hashlib.sha256
    ).hexdigest()


async def deliver_event(
    webhooks: list[Any],
    event: str,
    payload: dict,
) -> None:
    """Fire-and-forget: POST signed event payload to each active webhook."""
    body = json.dumps({"event": event, "ts": int(time.time()), "data": payload}).encode()

    async with httpx.AsyncClient(timeout=5.0) as client:
        for wh in webhooks:
            if wh.status != "active":
                continue
            if event not in (wh.events or []):
                continue
            sig = _sign(body, wh.secret or "")
            try:
                r = await client.post(
                    wh.url,
                    content=body,
                    headers={
                        "Content-Type": "application/json",
                        "X-DeepGuard-Signature": sig,
                        "X-DeepGuard-Event": event,
                    },
                )
                log.info("webhook %s -> %s: %d", event, wh.url, r.status_code)
            except Exception as exc:
                log.warning("webhook delivery failed %s: %s", wh.url, exc)
```

- [ ] **Step 4: Run test to verify it passes**

```bash
backend/.venv310/bin/pip install respx -q
backend/.venv310/bin/pytest backend/tests/test_webhook_delivery.py -v
```

Expected: `PASSED`

- [ ] **Step 5: Wire into detect router**

In `backend/app/routers/detect.py`, after saving the Detection row and before returning the response, add:

```python
from app.services.webhook_delivery import deliver_event
from deepguard_db.app.db import crud as db_crud

# after detection is saved:
webhooks = await db_crud.list_active_webhooks(db, current_tenant.id)
if webhooks:
    import asyncio
    asyncio.create_task(deliver_event(
        webhooks=webhooks,
        event="detection.completed",
        payload={
            "request_id": str(detection.request_id),
            "verdict": detection.verdict,
            "prob_fake": detection.prob_fake,
        },
    ))
```

If `crud.list_active_webhooks` doesn't exist, add to `deepguard_db/app/db/crud.py`:

```python
async def list_active_webhooks(db: AsyncSession, tenant_id: UUID) -> list[Webhook]:
    result = await db.execute(
        select(Webhook).where(
            Webhook.tenant_id == tenant_id,
            Webhook.status == "active",
        )
    )
    return list(result.scalars().all())
```

Wire liveness router similarly with event `"liveness.completed"`.

- [ ] **Step 6: Commit**

```bash
git add backend/app/services/webhook_delivery.py \
        backend/app/routers/detect.py \
        backend/app/routers/liveness.py \
        deepguard_db/app/db/crud.py \
        backend/tests/test_webhook_delivery.py
git commit -m "feat: wire webhook event delivery on detection and liveness completion"
```

---

## Task 11: Rate Limiting Middleware (Per-API-Key RPM)

**Files:**
- Create: `backend/app/middleware/rate_limiter.py`
- Modify: `backend/app/main.py` (register middleware)
- Test: `backend/tests/test_rate_limiter.py` (create)

**Interfaces:**
- Consumes: `X-API-Key` header; `ApiKey.rate_limit_rpm` from DB
- Produces: HTTP 429 when requests exceed `rate_limit_rpm` within 60-second window

- [ ] **Step 1: Write failing test**

Create `backend/tests/test_rate_limiter.py`:

```python
import pytest

def test_rate_limit_exceeded_returns_429(client, api_key_with_limit_1_rpm):
    """After 1 request per minute, second request must return 429."""
    key = api_key_with_limit_1_rpm
    headers = {"X-API-Key": key}
    # First request: OK
    r1 = client.post("/v1/detect/image", headers=headers, files={"file": ("t.jpg", b"fakejpeg", "image/jpeg")})
    assert r1.status_code != 429, "First request should not be rate-limited"
    # Second request immediately after: 429
    r2 = client.post("/v1/detect/image", headers=headers, files={"file": ("t.jpg", b"fakejpeg", "image/jpeg")})
    assert r2.status_code == 429, f"Expected 429, got {r2.status_code}"
    assert "rate limit" in r2.json().get("detail", "").lower()
```

- [ ] **Step 2: Run test to verify it fails**

```bash
backend/.venv310/bin/pytest backend/tests/test_rate_limiter.py -v
```

Expected: `FAILED` (no rate limiting → second request returns 200 or 422)

- [ ] **Step 3: Create in-memory rate limiter**

Create `backend/app/middleware/rate_limiter.py` (≤ 80 lines):

```python
import time
from collections import defaultdict, deque
from threading import Lock

_windows: dict[str, deque] = defaultdict(deque)
_lock = Lock()


def check_rate_limit(api_key_prefix: str, limit_rpm: int | None) -> bool:
    """Return True if request is allowed; False if limit exceeded.
    Uses a sliding 60-second window. Thread-safe."""
    if not limit_rpm or limit_rpm <= 0:
        return True
    now = time.monotonic()
    window = 60.0
    with _lock:
        q = _windows[api_key_prefix]
        # evict old entries
        while q and now - q[0] > window:
            q.popleft()
        if len(q) >= limit_rpm:
            return False
        q.append(now)
        return True
```

- [ ] **Step 4: Apply check in API key dependency**

In `backend/app/dependencies.py`, inside `get_api_key_auth()`, after the API key is validated and before returning, add:

```python
from app.middleware.rate_limiter import check_rate_limit
from app.core.exceptions import too_many_requests

if not check_rate_limit(api_key.prefix, api_key.rate_limit_rpm):
    raise too_many_requests("Rate limit exceeded. Check your rate_limit_rpm setting.")
```

Add to `backend/app/core/exceptions.py` if missing:
```python
def too_many_requests(detail: str = "Too many requests") -> HTTPException:
    return HTTPException(status_code=429, detail=detail)
```

- [ ] **Step 5: Run test to verify it passes**

```bash
backend/.venv310/bin/pytest backend/tests/test_rate_limiter.py -v
```

Expected: `PASSED`

- [ ] **Step 6: Commit**

```bash
git add backend/app/middleware/rate_limiter.py \
        backend/app/dependencies.py \
        backend/app/core/exceptions.py \
        backend/tests/test_rate_limiter.py
git commit -m "feat: enforce per-api-key RPM rate limiting via sliding window"
```

---

## Task 12: Video Detection E2E Test

**Files:**
- Test against: `backend/app/routers/detect.py` (POST /v1/detect/video)
- Read: `backend/app/services/ml_video.py`

**Interfaces:**
- Consumes: `$APIKEY_FULL` from Task 2
- Produces: 202 Accepted with `job_id`; polling returns `COMPLETED` with results

- [ ] **Step 1: Create minimal test video**

```bash
# Create a 2-second, 10-frame test video using OpenCV
python3 -c "
import cv2, numpy as np, os
path = '/tmp/test_video.mp4'
out = cv2.VideoWriter(path, cv2.VideoWriter_fourcc(*'mp4v'), 5, (256,256))
for i in range(10):
    frame = np.random.randint(100,200,(256,256,3),dtype=np.uint8)
    out.write(frame)
out.release()
print('saved', path, os.path.getsize(path), 'bytes')
"
```

- [ ] **Step 2: POST video and get job_id**

```bash
export JOB_ID=$(curl -s -X POST http://localhost:8000/v1/detect/video \
  -H "X-API-Key: $APIKEY_FULL" \
  -F "file=@/tmp/test_video.mp4" \
  | python3 -c "import sys,json; print(json.load(sys.stdin).get('job_id','MISSING'))")
echo "Job ID: $JOB_ID"
```

Expected: prints a UUID like `Job ID: abc123...`

- [ ] **Step 3: Poll until job completes**

```bash
for i in $(seq 1 10); do
  STATUS=$(curl -s "http://localhost:8000/v1/jobs/$JOB_ID" \
    -H "X-API-Key: $APIKEY_FULL" \
    | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('status','ERR'))")
  echo "[$i] Job status: $STATUS"
  if [ "$STATUS" = "COMPLETED" ] || [ "$STATUS" = "FAILED" ]; then break; fi
  sleep 3
done
```

Expected: eventually prints `Job status: COMPLETED`

- [ ] **Step 4: Fetch job result**

```bash
curl -s "http://localhost:8000/v1/jobs/$JOB_ID" \
  -H "X-API-Key: $APIKEY_FULL" \
  | python3 -m json.tool
```

Expected: `result` field contains `{verdict, prob_fake, frame_count, frames: [...]}`

---

## Task 13: Page Size Refactor — Wave 1 (Highest Priority)

**Files to split:**
- `frontend/src/components/deepguard/dashboard-page.tsx` (1678 lines → split into sub-components)
- `frontend/src/components/deepguard/tenants-page.tsx` (1414 lines → split)
- `frontend/src/components/deepguard/team-page.tsx` (1150 lines → split)

**Rule:** Each file ≤ 250 lines. Extract pure presentational sub-components to a co-located file like `dashboard/DashboardStats.tsx`, `dashboard/DashboardCharts.tsx`.

- [ ] **Step 1: Extract DashboardStats from dashboard-page.tsx**

Find the stats/metric cards section (typically a `<div className="grid grid-cols-...">` of stat pills).

Create `frontend/src/components/deepguard/dashboard/DashboardStats.tsx`:
```tsx
"use client";

interface StatProps {
  detections: number;
  fakeRate: number;
  avgLatencyMs: number;
  quotaUsed: number;
  quotaLimit?: number;
}

export function DashboardStats({ detections, fakeRate, avgLatencyMs, quotaUsed, quotaLimit }: StatProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {/* move stat cards here */}
    </div>
  );
}
```

Replace in `dashboard-page.tsx`:
```tsx
import { DashboardStats } from "./dashboard/DashboardStats";
// ...
<DashboardStats detections={...} fakeRate={...} avgLatencyMs={...} quotaUsed={...} />
```

- [ ] **Step 2: Extract DashboardCharts from dashboard-page.tsx**

Find recharts / area / bar chart section. Extract to `dashboard/DashboardCharts.tsx`.

- [ ] **Step 3: Repeat for tenants-page.tsx**

Extract `TenantTable`, `TenantDetailModal`, `TenantCreateForm` into `tenants/` subdirectory.

- [ ] **Step 4: Repeat for team-page.tsx**

Extract `TeamTable`, `InviteModal`, `UserRow` into `team/` subdirectory.

- [ ] **Step 5: Verify build**

```bash
cd ~/deepguard/app/frontend && ~/.bun/bin/bun run build 2>&1 | tail -5
```

Expected: compiled successfully

- [ ] **Step 6: Commit each split separately**

```bash
git add frontend/src/components/deepguard/dashboard/
git add frontend/src/components/deepguard/dashboard-page.tsx
git commit -m "refactor: split dashboard-page into DashboardStats and DashboardCharts sub-components"
```

---

## Task 14: Demo Script Document

**Files:**
- Create: `docs/DEMO_SCRIPT.md`

**Interfaces:**
- Produces: Step-by-step demo flow for thesis defense (5-10 minutes)

- [ ] **Step 1: Create the demo script**

Create `docs/DEMO_SCRIPT.md`:

```markdown
# DeepGuard — Kịch bản Demo Bảo vệ Đồ án

## Chuẩn bị (trước 30 phút)

1. Khởi động stack: `cd ~/deepguard/app && bash up.sh`
2. Mở browser tại: http://localhost:3000
3. Chuẩn bị ảnh test: ảnh thật (chân dung) + ảnh deepfake

## Luồng Demo (8 phút)

### 1. Login (30 giây)
- Vào http://localhost:3000
- Email: `dev@vietbank.vn` | Password: `Password123!`

### 2. Playground — Phát hiện Deepfake (2 phút)
- Menu trái → "Playground"
- Tab "Image Detection"
- Upload ảnh thật → xem kết quả: REAL + Grad-CAM heatmap
- Upload ảnh deepfake → xem kết quả: FAKE + Grad-CAM (tần số nổi bật vùng giả mạo)
- *Giải thích: EfficientNet-B4 + block-DCT attention, AUC 0.9234 trên Celeb-DF-v2*

### 3. Playground — Liveness Check (1 phút)
- Tab "Liveness"
- Upload ảnh chân thật → verdict: LIVE (liveness_score ≈ 0.85+)
- Upload ảnh in/màn hình → verdict: SPOOF

### 4. API Key & v1 Endpoint (1 phút)
- Menu → "API Keys" → tạo key mới
- Demo curl trực tiếp:
  ```bash
  curl -X POST http://localhost:8000/v1/detect/image \
    -H "X-API-Key: dg_xxx..." \
    -F "file=@face.jpg"
  ```
- *Giải thích: Multi-tenant, RBAC 5 vai trò, audit log*

### 5. Dashboard & Analytics (1 phút)
- Menu → "Dashboard" → xem số liệu tổng hợp
- Menu → "Analytics" → biểu đồ theo thời gian + per-API-key usage
- Menu → "History" → lịch sử detection + lọc verdict

### 6. eKYC Pipeline (2 phút)
- API: POST /v1/ekyc/verify (cascade: liveness → deepfake → face match)
- Kết quả: {verdict: PASS, liveness_pass: true, deepfake_pass: true, face_match_pass: true}
- *Giải thích: Ngưỡng hiệu chỉnh FPR≤5% theo Thông tư 17/2024/TT-NHNN*

### 7. Audit & Compliance (30 giây)
- Menu → "Audit Logs" → xem trace mọi hành động
- *Giải thích: Separation of Duties, PII masking theo role*

## Câu hỏi hội đồng hay gặp

| Câu hỏi | Trả lời ngắn |
|---------|-------------|
| "DCT có thực sự giúp không?" | "Kết quả AUC 0.9234 vs 0.9056 baseline — cải thiện 1.8 điểm, quan trọng hơn: giảm lỗi trên Celeb-DF (cross-dataset)" |
| "Sao không làm đủ 3 nhánh như SFCL?" | "Chọn kiến trúc gọn để ablation kỹ hơn; SFCL là future work" |
| "Data lấy đâu?" | "DeepfakeBench mirror (FF++ c23 + Celeb-DF-v2), có form xin quyền. Mặt Việt tự thu thập, có đồng ý" |
| "Ngưỡng 0.6197 từ đâu?" | "Calibrate trên tập val để FPR≤5% theo TT17 — yêu cầu ngân hàng" |
| "Protocol là gì?" | "In-distribution (NOT cross-dataset): train mix FF++/Celeb-DF, test Celeb-DF — ghi rõ trong báo cáo" |
```

- [ ] **Step 2: Commit**

```bash
git add docs/DEMO_SCRIPT.md
git commit -m "docs: add thesis defense demo script with Q&A preparation"
```

---

## Self-Review: Spec Coverage

| Requirement | Covered by Task |
|-------------|-----------------|
| Stack starts and all 6 services healthy | Task 1 |
| Core detection returns real ML results + Grad-CAM | Task 2 |
| Liveness detection E2E (passive + active + challenge) | Task 3 |
| eKYC pipeline end-to-end | Task 4 |
| Analytics per-API-key breakdown (frontend has UI, backend was missing) | Task 5 |
| Remove dead packages (next-auth, prisma, z-ai-sdk) | Task 6 |
| useEffect → useQuery (CONVENTIONS.md violations) | Task 7 |
| Billing page not broken (was making calls to non-existent endpoint) | Task 8 |
| Settings page clearly labeled local-only | Task 9 |
| Webhook event delivery wired | Task 10 |
| Rate limiting enforced (field existed, not enforced) | Task 11 |
| Video detection async flow validated | Task 12 |
| Page size ≤ 250 lines (wave 1, 3 largest pages) | Task 13 |
| Demo script for thesis defense | Task 14 |

## Execution Order

```
P0 (run immediately):     Task 1 → Task 2 → Task 3 → Task 4
P1 (before defense):      Task 5 → Task 6 → Task 7 → Task 8 → Task 9 → Task 14
P2 (after defense / polish): Task 10 → Task 11 → Task 12 → Task 13
```
