# §573 — Local development Definition of Done

Checklist for **DEV-LOCAL-029**. Automated evidence: `pnpm verify:m18`, `pnpm test:e2e:local`, `scripts/run-local-e2e.mjs`.

## Infrastructure

- [ ] `pnpm dev:setup` completes without manual Postgres/Redis/MinIO install
- [ ] `GET /health/ready` reports database and object storage (and Redis when configured)
- [ ] MinIO bucket exists after setup

## Identities & payment

- [ ] Distinct buyer and seller accounts (`dev-seed.mjs`)
- [ ] Paid job uses production ledger path (`submitPaidJob` + settlement)
- [ ] Fake adapter and dev shortcuts disabled in production (`startup-guards.ts`)

## Happy path (automated when API running)

- [ ] Seller pairs Worker, publishes fixture capability
- [ ] Buyer discovers capability on marketplace
- [ ] Buyer submits prepaid job → dispatch → accept → run → complete
- [ ] Job reaches `COMPLETED` and payment settles once

## Worker & sandbox

- [ ] Worker runs host-native (`pnpm worker:dev`)
- [ ] Default E2E uses API/worker **synthetic** complete path (sandbox architecture unchanged)
- [ ] Manual: `KIVRO_SANDBOX_DRY_RUN=false` + real OpenClaw for full §557 acceptance

## Failure matrix (DEV-LOCAL-024)

See `tests/fixtures/local-e2e-failure-matrix.json` and `security/tests/acceptance-m18-local-failures.test.ts`.

## Manual sign-off

Record results in `docs/milestones/M18-manual-validation.md`.
