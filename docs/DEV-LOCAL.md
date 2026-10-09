# Local development (M18)

Reproducible Kivro on a supported Mac: Docker for Postgres, Redis, and MinIO; host-native Worker; cloud API via `pnpm dev`.

## Prerequisites

- Node 20+, pnpm 9, Docker Desktop
- Copy `.env.example` → `.env` and keep dev-only flags out of production
- Optional full OpenClaw path: set `KIVRO_SANDBOX_DRY_RUN=false`, install pinned OpenClaw, run `pnpm worker:dev` with `KIVRO_EXECUTION_MODE=openclaw`

## Commands

| Command | Purpose |
|---------|---------|
| `pnpm dev:setup` | Compose up, wait for health, migrate, MinIO bucket |
| `pnpm dev` | API (+ web per `scripts/dev.mjs`) |
| `pnpm worker:dev` | Build Worker and run poll daemon (`KIVRO_EXECUTION_MODE=synthetic` default) |
| `pnpm dev:demo` | Setup + seed buyer/seller fixtures |
| `pnpm test:e2e:local` | `verify:m18` + optional live HTTP E2E when API is up |
| `pnpm verify:m18` | M18 gate (acceptance + COVERAGE sync + `verify:m17`) |
| `node scripts/local-dev-doctor.mjs` | Bootstrap checks |
| `node scripts/dev-reset.mjs stop\|restart\|storage\|full` | §568 reset workflows |

## Identities

After `pnpm dev:demo` / `scripts/dev-seed.mjs`:

- Buyer: `buyer@kivro.local`
- Seller: `seller@kivro.local`
- Password: printed by seed script (`KivroDevPass123!`)

Credits are granted when `KIVRO_DEV_PAYMENT_SHORTCUTS=true`.

## Health

- `GET /health/live` — process up
- `GET /health/ready` — DB, MinIO, Redis (when `REDIS_URL` set)

## Security

Development shortcuts and the fake payment adapter are blocked in production via `apps/api/src/startup-guards.ts`. Never enable `KIVRO_FAKE_PAYMENT_ADAPTER` or `KIVRO_DEV_*_SHORTCUTS` in production.

## E2E

1. `pnpm dev:demo`
2. Terminal A: `pnpm dev`
3. Terminal B (optional): `pnpm worker:dev` for poll-driven synthetic completion
4. `pnpm test:e2e:local` or `KIVRO_E2E_REQUIRE_API=true node scripts/run-with-env.mjs node scripts/run-local-e2e.mjs`

See `docs/testing/LOCAL-DEV-E2E-CHECKLIST.md` for §573 checklist.
