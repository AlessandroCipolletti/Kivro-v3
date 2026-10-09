# Netsons rootless deployment guide (HOST-NET-027)

Authoritative product behavior remains `spec/MASTER-SPEC.md`; infrastructure for this profile is `spec/DEPLOYMENT-NETSONS.md` and §§581–607.

## 1. Prerequisites

- Netsons Pro Business with managed **Node.js**, **PostgreSQL**, **Redis**, **cron**, **TLS**
- External **S3-compatible** bucket (not local disk for buyer/seller assets)
- Stripe (live or test per environment), Google OAuth client, SMTP or transactional email provider

## 2. Build release (same artifact as AWS profile)

```bash
pnpm install --frozen-lockfile
pnpm --filter @kivro/database exec prisma migrate deploy
pnpm -r run build
KIVRO_NETSONS_STANDALONE=1 pnpm --filter @kivro/web run build
```

## 3. Managed Node entry

| Mode | Command |
|------|---------|
| API only (default) | `pnpm --filter @kivro/cloud-netsons-app run start` |
| API + web one process | `node scripts/netsons-unified-start.mjs` |

Set `KIVRO_CLOUD_PROFILE=netsons`, `DATABASE_URL`, `KIVRO_CRON_SECRET`, `WEB_APP_URL`, `KIVRO_CLOUD_URL`, `S3_*`, `REDIS_URL` (optional), auth/payment secrets per `.env.example`.

## 4. PostgreSQL (HOST-NET-006/007/010)

- Single migration history in `packages/database/prisma/migrations`
- Connection pool: `KIVRO_DATABASE_POOL_MAX` (default **5** on Netsons profile)
- Durable async work: `DurableWorkItem` + existing job/webhook/payment tables

## 5. Redis (HOST-NET-008)

Optional. `/health/ready` reports Redis status but **must remain ready** when Redis is down if PostgreSQL and object storage are healthy.

## 6. Worker transport (HOST-NET-013 note)

Netsons baseline is **HTTPS polling** via shared Worker Protocol (`DEPLOYMENT-NETSONS.md` overrides generic WSS-primary wording). Discovery: `GET /worker/discovery`.

## 7. Cron (HOST-NET-015/016/593)

Schedule **every 5–15 minutes** (one-minute is acceptable; sub-minute not required):

```http
POST /platform/cron/netsons-tick
x-kivro-cron-secret: <secret>
```

Idempotent bounded batches: durable work, webhooks, scheduling, payment/job maintenance.

## 8. Secrets (HOST-NET-025)

Configure only in hosting panel env — never commit. Production boot fails closed if dev shortcuts or default cron secret are enabled.

## 9. Email (HOST-NET-026)

Use `@kivro/email` with Netsons SMTP or external provider (`SMTP_*` / provider API keys in env).

## 10. Verification gates

| Gate | When |
|------|------|
| `pnpm verify:m20` | Every merge |
| `KIVRO_NETSONS_STAGING_URL=… node scripts/netsons-staging-smoke.mjs` | Before promote |
| Staging E2E env + `node scripts/netsons-staging-e2e.mjs` | Before production ACTIVE (HOST-NET-030) |

## 11. Backup

Document PostgreSQL backup/export procedure with hosting provider; object storage lifecycle separately.

## 12. Profile precedence (HOST-NET-031)

Where generic docs mention BullMQ daemons, VPS Docker, or self-hosted DB/Redis, **this profile overrides** without relaxing security, payment, or buyer/seller semantics.
