# M00 — manual validation checklist

Run these after the agent completes M00. No automated E2E in repo.

## 1. Repository layout

- [ ] `apps/web`, `apps/api`, `apps/worker` exist
- [ ] `packages/contracts`, `openclaw-adapter`, `job-protocol`, `policy-engine`, `cloud-netsons`, `cloud-aws` exist
- [ ] `spec/` contains Master Spec and IMPLEMENTATION-PLAN
- [ ] `security/`, `docs/ARCHITECTURE.md`, `docs/implementation-status.md` exist

## 2. Install and static checks

```bash
cd /path/to/Kivro-v3
pnpm install
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

- [ ] All commands exit 0

## 3. API health (§84)

```bash
node apps/api/dist/server.js &
sleep 1
curl -sf http://localhost:3001/health/live
curl -sf http://localhost:3001/health/ready
kill %1
```

- [ ] Both endpoints return JSON with HTTP 200

## 4. Worker CLI (§56–§57 bootstrap)

```bash
node apps/worker/dist/cli.js version
node apps/worker/dist/cli.js doctor
node apps/worker/dist/cli.js commands
```

- [ ] Commands run without crash; `doctor` prints JSON status

## 5. Spec traceability

- [ ] `spec/COVERAGE.md` updated for M00 requirements
- [ ] `spec/DECISIONS.md` notes manual validation (no repo E2E)

When all checked, reply to the agent: **M00 validated — create commit** (optional).
