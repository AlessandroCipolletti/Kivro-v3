# Netsons production deployment (M20)

Shared Kivro backend (`@kivro/api`) with **`KIVRO_CLOUD_PROFILE=netsons`**.

## Managed Node entry

```bash
pnpm --filter @kivro/api run build
pnpm --filter @kivro/cloud-netsons-app run start
```

Startup validates `DATABASE_URL` and (in production) `KIVRO_CRON_SECRET` via `loadNetsonsRuntimeConfig`.

## Topology (HOST-NET-001..008)

- **PostgreSQL** — durable source of truth (jobs, payments, `DurableWorkItem`, webhooks).
- **Redis** — optional cache/coordination only; `/health/ready` must pass with Redis down.
- **S3-compatible storage** — assets via `S3_*` env (MinIO locally).
- **Worker transport** — HTTPS polling (`/worker/poll`, `/worker/heartbeat`); discovery at `/worker/discovery`.
- **No** BullMQ, PM2, Docker on cloud host, or persistent SSH daemons.

## Cron (HOST-NET-015)

Schedule an HTTP POST every 5–15 minutes (bounded; sub-minute not required):

```http
POST /platform/cron/netsons-tick
x-kivro-cron-secret: <KIVRO_CRON_SECRET>
Content-Type: application/json

{"durableWorkLimit":25,"webhookLimit":25}
```

Processes PostgreSQL durable work, due buyer webhook retries, and scheduling sweeps.

## Required production env

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | Managed PostgreSQL |
| `KIVRO_CRON_SECRET` | Cron authentication |
| `KIVRO_CLOUD_PROFILE` | `netsons` |
| `KIVRO_CLOUD_URL` | Public API base URL |
| `WEB_APP_URL` | Next.js origin |
| `S3_*` | Object storage |
| `REDIS_URL` | Optional |

See root `.env.example`.

## Smoke / staging (HOST-NET-029/030)

With staging URL configured:

```bash
KIVRO_NETSONS_STAGING_URL=https://staging.example node scripts/netsons-staging-smoke.mjs
```

Full paid staging E2E uses the same `pnpm test:e2e:local` contract against staging credentials when provided.
