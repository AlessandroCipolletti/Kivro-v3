# M18 — milestone closure (local dev & local E2E)

Master Spec §551–§573 / `DEV-LOCAL-001`–`029`.

## Shipped

- **Compose** — PostgreSQL, Redis, MinIO with health waits (`docker-compose.yml`, wait scripts)
- **Setup** — `pnpm dev:setup`, `pnpm dev:demo`, `pnpm worker:dev`, `scripts/dev-reset.mjs`
- **Seed** — deterministic buyer/seller + credits (`scripts/dev-seed.mjs`)
- **Fake payment adapter** — `packages/billing/src/fake-payment-adapter.ts` + production guard
- **Readiness** — `/health/ready`, `scripts/local-dev-doctor.mjs`
- **E2E** — `scripts/run-local-e2e.mjs`, `pnpm test:e2e:local`, failure matrix fixture + acceptance tests
- **Docs** — `docs/DEV-LOCAL.md`, `docs/testing/LOCAL-DEV-E2E-CHECKLIST.md`
- Gate: **`pnpm verify:m18`**

## Bounded / manual

- **Full OpenClaw + real Docker sandbox** on every CI run — manual with `KIVRO_SANDBOX_DRY_RUN=false` and pinned OpenClaw (§557–§558); automated path uses synthetic worker completion without weakening sandbox invariants
- **Playwright** browser E2E — not required for M18 gate

## Gate

```bash
pnpm verify:m18
pnpm test:e2e:local   # optional live API path
```
