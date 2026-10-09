# AWS production deployment (M21)

Shared Kivro backend (`@kivro/api`) with **`KIVRO_CLOUD_PROFILE=aws`**.

## Managed Node entry

```bash
pnpm --filter @kivro/api run build
pnpm --filter @kivro/cloud-aws-app run start
```

Startup validates `DATABASE_URL` and (in production) `KIVRO_CRON_SECRET` and `S3_BUCKET` via `loadAwsRuntimeConfig` / `assertAwsProductionEnvironment`.

## Topology

- **PostgreSQL (RDS/Aurora-compatible)** — durable source of truth (`DurableWorkItem`, jobs, payments).
- **Optional SQS** — fan-out mirror when `AWS_SQS_DURABLE_WORK_QUEUE_URL` is set; correctness remains in PostgreSQL.
- **S3** — native object storage (`S3_BUCKET` + IAM role, or `KIVRO_S3_NATIVE=true`).
- **Worker transport** — secure WebSocket (`/worker/wss`); discovery at `/worker/discovery`.
- **No** duplicated domain logic in the AWS adapter package.

## EventBridge / Lambda cron

Schedule an HTTP POST every 1–5 minutes:

```http
POST /platform/cron/aws-tick
x-kivro-cron-secret: <KIVRO_CRON_SECRET>
Content-Type: application/json

{"durableWorkLimit":25,"webhookLimit":25,"sqsLimit":10}
```

## Required production env

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | RDS/Aurora PostgreSQL |
| `KIVRO_CRON_SECRET` | Cron authentication |
| `KIVRO_CLOUD_PROFILE` | `aws` |
| `KIVRO_CLOUD_URL` | Public API base URL |
| `WEB_APP_URL` | Web origin |
| `S3_BUCKET` or `AWS_S3_BUCKET` | Object storage |
| `AWS_REGION` | Region for S3/SQS |
| `AWS_SQS_DURABLE_WORK_QUEUE_URL` | Optional SQS fan-out |

See **`DEPLOYMENT-GUIDE.md`**, **`Dockerfile`** (ECS/Fargate), and root `.env.example`.

Preflight before promote:

```bash
KIVRO_CLOUD_PROFILE=aws node scripts/aws-deploy-preflight.mjs
```

## Smoke / staging

```bash
KIVRO_AWS_STAGING_URL=https://staging.example node scripts/aws-staging-smoke.mjs
```

Full paid staging E2E when buyer/seller staging credentials are configured:

```bash
KIVRO_AWS_STAGING_URL=... KIVRO_E2E_BUYER_EMAIL=... KIVRO_E2E_SELLER_EMAIL=... node scripts/aws-staging-e2e.mjs
```
