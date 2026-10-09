# M21 closure — AWS deployment profile

## Preconditions (met)

- M19 unified backend + dual transport conformance (`pnpm verify:m19`).
- M20 Netsons durable PostgreSQL work pattern (`pnpm verify:m20`).

## Deliverables (repo — complete)

| Area | Evidence |
|------|----------|
| Composition root | `@kivro/cloud-aws`, `apps/cloud-aws/start.mjs` |
| Durable async | Shared PG port + optional SQS mirror, `POST /platform/cron/aws-tick` |
| Worker transport | WSS baseline + shared reconcile on heartbeat |
| Object storage | Native S3 + `probeObjectStorageHealth` |
| RDS pool | Default `connection_limit=10` when `KIVRO_CLOUD_PROFILE=aws` |
| Production guards | `assertAwsProductionEnvironment`, `aws-deploy-preflight.mjs` |
| Deploy packaging | `docs/deploy/aws/*`, `Dockerfile`, EventBridge example |
| Observability | Structured logs on boot; `/platform/admin/metrics/cloud` includes profile |
| Gate | **`pnpm verify:m21`** (conformance both roots, API contract MVP, profile tests) |

## Exit criteria (automated)

```bash
pnpm verify:m21
```

## Operational acceptance (not provable without your AWS staging)

Per `spec/DEPLOYMENT-AWS.md` and IMPLEMENTATION-PLAN M21 acceptance — run when infra exists:

- `KIVRO_AWS_STAGING_URL=… node scripts/aws-staging-smoke.mjs`
- Staging paid E2E: `node scripts/aws-staging-e2e.mjs` (needs `DATABASE_URL`, buyer/seller E2E emails)
- Stripe webhook, Google OAuth, upload/download on staging (manual checklist in DEPLOYMENT-GUIDE §13)

These are **required before AWS ACTIVE**, but **outside CI** until staging URLs/credentials are configured.

## Explicitly later milestones (not M21 gaps)

- **M22** — dual ACTIVE/DRAINING cutover E2E (`PORT-001..030` continuity scenario)
- **M29** — full `ASYNC-GOLD-001..010` matrix on both profiles
- **M26–M27** — fault injection, restore runbooks, load envelope, release manifest

## Forbidden shortcuts absent

- No duplicated job/payment/domain logic in `cloud-aws`.
- Shared PostgreSQL durable work (not Netsons-only).
- Conformance + parity verified in `verify:m21`.
