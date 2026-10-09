# Release gates (M16)

## Required before merge to `main`

1. `pnpm typecheck`
2. `pnpm lint`
3. `pnpm test`
4. `pnpm build`
5. Milestone verify through current phase: **`pnpm verify:m16`** (includes M04–M15 subset)

## CI

`.github/workflows/ci.yml` runs core checks plus `verify:m04` … `verify:m16`.

## Local full path (M18)

`pnpm test:e2e:local` — composed smoke; expands to paid two-user E2E when M18 lands.

## Fixture integrity

`node scripts/verify-fixtures-catalog.mjs` — all `tests/fixtures/catalog.json` paths exist.
