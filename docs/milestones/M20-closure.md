# M20 — milestone closure (Netsons deployment profile)

`HOST-NET-001`–`031`, `spec/DEPLOYMENT-NETSONS.md`, shared `ARCH-UNI-*` / `PORT-*` exercised via Netsons root.

## Shipped

- **PostgreSQL durable work** — `DurableWorkItem` migration; `createNetsonsDurableWorkPort`, `processNetsonsDurableWorkBatch` (HOST-NET-010/015)
- **Netsons cron tick** — `POST /platform/cron/netsons-tick` (`KIVRO_CRON_SECRET`) runs durable work, webhook retries, scheduling sweeps
- **Runtime config** — `loadNetsonsRuntimeConfig`; `@kivro/cloud-netsons-app` startup validation
- **API composition** — Netsons profile wires DB-backed `DurableWorkPort` (AWS remains M21 queue stub)
- **Deploy docs** — `docs/deploy/netsons/README.md`
- **Staging smoke** — `scripts/netsons-staging-smoke.mjs` (skip unless `KIVRO_NETSONS_STAGING_URL`)
- Gate: **`pnpm verify:m20`** (includes `verify:m19`)

## Bounded

- **HOST-NET-029/030** — full staging paid E2E on real Netsons host (manual / when staging URL + credentials provided)
- **HOST-NET-005/013** — Next.js + WSS on same managed app documented; local dev uses split processes
- LiteSpeed/cPanel-specific packaging files (hosting panel config is operator-specific)

## Gate

```bash
pnpm verify:m20
```
