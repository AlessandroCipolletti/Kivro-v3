# Release gates (M16)

## Required before merge to `main`

1. `pnpm typecheck`
2. `pnpm lint`
3. `pnpm test`
4. `pnpm build`
5. **`pnpm verify:m16`** — fixtures, traces, integration matrix, §91 automated evidence, API contract smoke, architecture lint, M16 acceptance tests

## CI

`.github/workflows/ci.yml` runs core checks plus `verify:m04` … `verify:m16`.

## Local E2E entrypoint

`pnpm test:e2e:local` — runs `verify:m16` (composed release gate). Full two-user paid path with Docker + OpenClaw: **M18** (`spec/IMPLEMENTATION-PLAN.md` §573).

## Fixture integrity

`node scripts/verify-fixtures-catalog.mjs` — all `tests/fixtures/catalog.json` paths exist.
