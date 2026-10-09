# AWS deployment guide (M21)

Authoritative product behavior: `spec/MASTER-SPEC.md`. AWS mechanics: `spec/DEPLOYMENT-AWS.md` and unified-backend sections.

## 1. Prerequisites

- **RDS/Aurora PostgreSQL** (single migration history in `packages/database/prisma/migrations`)
- **S3** bucket + IAM role for the API task (prefer no long-lived access keys)
- **Optional SQS** queue for durable-work fan-out (`AWS_SQS_DURABLE_WORK_QUEUE_URL`); PostgreSQL remains authoritative
- **TLS** termination (ALB/API Gateway) with stable `KIVRO_CLOUD_URL`
- Stripe, Google OAuth, transactional email (same shared config as Netsons)

## 2. Build release (same artifact as Netsons)

```bash
pnpm install --frozen-lockfile
pnpm --filter @kivro/database exec prisma migrate deploy
pnpm -r run build
pnpm --filter @kivro/web run build
```

## 3. Managed Node entry

| Mode | Command |
|------|---------|
| API only | `pnpm --filter @kivro/cloud-aws-app run start` |
| API + web | `node scripts/aws-unified-start.mjs` |

Set `KIVRO_CLOUD_PROFILE=aws`, `DATABASE_URL`, `KIVRO_CRON_SECRET`, `WEB_APP_URL`, `KIVRO_CLOUD_URL`, `S3_BUCKET`, `AWS_REGION`, auth/payment secrets per `.env.example`.

## 4. PostgreSQL (RDS)

- Pool default: **`connection_limit=10`** when `KIVRO_CLOUD_PROFILE=aws` (override with `KIVRO_DATABASE_POOL_MAX`)
- Durable work: shared `DurableWorkItem` table + `POST /platform/cron/aws-tick`

## 5. Durable async (PostgreSQL + optional SQS)

- Enqueue/commit always lands in PostgreSQL first (`@kivro/cloud-core` port)
- Optional SQS mirror on enqueue; tick handler drains a bounded SQS batch for hygiene (not source of truth)
- Job dispatch signals Workers via durable `WORKER_SIGNAL` rows + WSS wake-up path

## 6. Worker transport

Baseline **secure WebSocket** (`/worker/wss`). Discovery: `GET /worker/discovery`. Reconnect/reconciliation uses shared `reconcileWorkerSessionOnReconnect` on heartbeat (profile-neutral).

## 7. EventBridge / scheduled HTTP cron

Every **1–5 minutes** (bounded batches):

```http
POST /platform/cron/aws-tick
x-kivro-cron-secret: <secret>
Content-Type: application/json

{"durableWorkLimit":25,"webhookLimit":25,"sqsLimit":10}
```

## 8. Object storage

Production: `S3_BUCKET` + task IAM role (`KIVRO_S3_NATIVE=true` or omit `S3_ENDPOINT`). `/health/ready` uses `HeadBucket` when native AWS mode is configured.

Local dev with MinIO: keep `S3_ENDPOINT` + keys even if `KIVRO_CLOUD_PROFILE=aws`.

## 9. Redis

Optional non-durable optimization. `/health/ready` reports Redis but **must stay ready** when Redis is down if PostgreSQL and object storage are healthy.

## 10. Secrets & production guards

`assertAwsProductionEnvironment` fails closed on missing `DATABASE_URL`, `KIVRO_CRON_SECRET`, `WEB_APP_URL`, `KIVRO_CLOUD_URL`, `S3_BUCKET`, or default dev cron secret.

## 11. Observability

Use CloudWatch (or equivalent) for Node stdout, ALB 5xx, RDS connections, SQS age-of-oldest-message when queue is enabled. Correlate via `x-correlation-id` from `@kivro/observability`.

## 12. Verification gates

| Gate | When |
|------|------|
| `pnpm verify:m21` | Every merge (conformance both roots + AWS profile tests) |
| `KIVRO_AWS_STAGING_URL=… node scripts/aws-staging-smoke.mjs` | Before promote |
| Staging E2E env + `node scripts/aws-staging-e2e.mjs` | Before production ACTIVE |

## 13. Deployment acceptance (ACTIVE)

Complete `spec/DEPLOYMENT-AWS.md`: API contract suite, backend conformance, WSS reconnect tests, Stripe webhook, Google OAuth, upload/download, full staging E2E, restart/idempotency scenarios.
