# M18 — milestone closure (local dev & local E2E)

Master Spec §551–§573 / `DEV-LOCAL-001`–`029`.

## Shipped

- **Compose** — PostgreSQL, Redis, MinIO with health waits (`docker-compose.yml`, wait scripts)
- **Setup** — `pnpm dev:setup`, `pnpm dev:demo`, `pnpm worker:dev`, `scripts/dev-reset.mjs`
- **Seed** — deterministic buyer/seller + credits (`scripts/dev-seed.mjs`)
- **Fake payment adapter** — `packages/billing/src/fake-payment-adapter.ts` + production guard
- **Readiness** — `/health/ready`, `scripts/local-dev-doctor.mjs`
- **E2E** — `scripts/run-local-e2e.mjs` (Docker sandbox fixture + deliverables + ledger), failure HTTP smoke, §573 checklist verifier
- **Delivery** — `@kivro/job-delivery`, worker `job run-fixture`, execution bundle API
- **Docs** — `docs/DEV-LOCAL.md`, `docs/testing/LOCAL-DEV-E2E-CHECKLIST.md`
- Gate: **`pnpm verify:m18`**

## Bounded / manual

- **OpenClaw `agent exec`** — adapter tries headless exec (§7.5/§59) then Docker fallback; requires working OpenClaw CLI + marketplace config on seller machine
- **Pinned `KIVRO_SANDBOX_IMAGE` with in-image agent** — production image build out of band
- **Stripe test-mode card E2E** — `scripts/run-local-stripe-e2e.mjs` when `STRIPE_SECRET_KEY=sk_test_*` + API up; credits path remains default
- **Playwright** browser E2E — not required for M18 gate

## Gate

```bash
pnpm verify:m18
pnpm test:e2e:local   # optional live API path
```
