# M19 — manual validation

1. `pnpm verify:m19` on clean checkout after `pnpm install`.
2. `KIVRO_CLOUD_PROFILE=netsons pnpm --filter @kivro/api run start` — `GET /health/ready` shows `cloudProfile: netsons`, `workerTransport: polling`.
3. `KIVRO_CLOUD_PROFILE=aws pnpm --filter @kivro/api run start` — same endpoint shows `aws` / `wss`.
4. `GET /worker/discovery` lists Netsons polling (DRAINING) and AWS WSS (ACTIVE) with protocol compatibility window.
5. `KIVRO_WORKER_TRANSPORT=wss` worker daemon uses native WebSocket to `/worker/wss` (or `KIVRO_WSS_DISPATCH=shim`).
6. `KIVRO_DUAL_CONTROL_PLANE=1` worker daemon heartbeats/polls both control planes (deduped job offers).
7. `pnpm --filter @kivro/cloud-netsons-app run start` / `cloud-aws-app` — thin entrypoints boot shared API.
8. Confirm business routes unchanged (single shared `apps/api`).

Validated on: ___________
