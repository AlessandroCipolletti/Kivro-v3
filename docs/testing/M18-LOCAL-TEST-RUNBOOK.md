# M18 local test runbook

Run before your manual §573 pass.

## 1. Preflight (no API)

```bash
cp .env.example .env   # if needed
pnpm test:m18:preflight
```

## 2. Start stack

```bash
pnpm dev          # API :3007 + Web :3008
pnpm worker:dev   # optional poll daemon
```

## 3. Full E2E (API must be up)

```bash
KIVRO_SANDBOX_DRY_RUN=false KIVRO_E2E_REQUIRE_API=true pnpm test:e2e:local
```

With OpenClaw installed:

```bash
KIVRO_E2E_OPENCLAW=true KIVRO_SANDBOX_DRY_RUN=false KIVRO_E2E_REQUIRE_API=true pnpm test:e2e:local
```

With Web check:

```bash
KIVRO_E2E_CHECK_WEB=true KIVRO_E2E_REQUIRE_API=true pnpm test:e2e:local
```

Stripe test mode (optional):

```bash
# STRIPE_SECRET_KEY=sk_test_... in .env
pnpm test:e2e:local   # includes run-local-stripe-e2e.mjs
```

## 4. Sign-off

Complete `docs/testing/LOCAL-DEV-E2E-CHECKLIST.md` and `docs/milestones/M18-manual-validation.md`.
