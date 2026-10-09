# M19 — manual validation

1. `pnpm verify:m19` on clean checkout after `pnpm install`.
2. `KIVRO_CLOUD_PROFILE=netsons pnpm --filter @kivro/api run start` — `GET /health/ready` shows `cloudProfile: netsons`, `workerTransport: polling`.
3. `KIVRO_CLOUD_PROFILE=aws pnpm --filter @kivro/api run start` — same endpoint shows `aws` / `wss`.
4. Confirm business routes unchanged (single shared `apps/api`).

Validated on: ___________
