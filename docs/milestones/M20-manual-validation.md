# M20 — manual validation (Netsons profile)

1. `pnpm verify:m20` on clean checkout after `pnpm install`.
2. Apply migration `20260410120000_m20_durable_work`; confirm `DurableWorkItem` exists.
3. `KIVRO_CLOUD_PROFILE=netsons pnpm --filter @kivro/api run start` — `/health/ready` shows `netsons` / `polling`; ready with Redis stopped if Postgres + S3 OK.
4. `POST /platform/cron/netsons-tick` with `x-kivro-cron-secret` returns maintenance + durable work summary.
5. Pair worker; dispatch job; verify row in `DurableWorkItem` kind `WORKER_SIGNAL` and worker poll returns offer after DB commit.
6. Worker heartbeat response includes `reconciliation` block.
7. Optional staging: set `KIVRO_NETSONS_STAGING_URL` + `KIVRO_CRON_SECRET`, run `node scripts/netsons-staging-smoke.mjs`.
8. Optional staging E2E: configure buyer/seller staging env vars, run `node scripts/netsons-staging-e2e.mjs`.

Validated on: ___________
