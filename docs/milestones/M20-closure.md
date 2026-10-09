# M20 — milestone closure (Netsons deployment profile)

`HOST-NET-001`–`031`, `spec/DEPLOYMENT-NETSONS.md`, shared conformance via Netsons composition root.

## Shipped

- **Durable PostgreSQL work** — `DurableWorkItem`, idempotent enqueue/claim, cron batch processor (HOST-NET-010)
- **Dispatch correctness** — job committed before worker signal; durable `WORKER_SIGNAL` + poll recovery (HOST-NET-011/012/017)
- **Worker reconnect** — `reconcileWorkerSessionOnReconnect` on heartbeat (HOST-NET-014)
- **Cron** — `POST /platform/cron/netsons-tick` + maintenance sweeps (payments, webhooks, scheduling, failures) (HOST-NET-015/018/019)
- **Pool & guards** — `KIVRO_DATABASE_POOL_MAX`, `assertNetsonsProductionEnvironment` (HOST-NET-007/025)
- **No BullMQ** — `check-no-bullmq-production.mjs` (HOST-NET-002/009/587)
- **Deploy** — `docs/deploy/netsons/*`, unified start script, Next standalone toggle (HOST-NET-004/005/027)
- **Staging gates** — `netsons-staging-smoke.mjs`, `netsons-staging-e2e.mjs` (HOST-NET-029/030 when env set)
- Gate: **`pnpm verify:m20`** (+ `verify:m19`)

## Operator-only (cannot automate in repo)

- Real Netsons cPanel/LiteSpeed panel configuration and TLS certificate provisioning
- Live SMTP/Google/Stripe dashboard setup on production host
- Executing staging E2E on real Netsons without credentials (script skips)

## Gate

```bash
pnpm verify:m20
```
