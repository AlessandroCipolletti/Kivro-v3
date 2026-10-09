# M13 — milestone closure (bounded)

Buyer REST API v1, programmatic API keys, idempotency, rate limits, asset intents, and signed outbound webhooks.

## Shipped

- `@kivro/buyer-api` — scoped keys, audit trail, per-key rate buckets, idempotency
- `@kivro/buyer-webhooks` — SSRF-safe URLs, encrypted secrets, HMAC delivery, deferred retry sweep
- Session routes — API keys (scopes/expiry/audit), webhooks (deliveries, rotate secret, disable)
- v1 — capabilities, jobs (create/list/detail/cancel), asset upload-intents/finalize/get, `GET /v1/openapi.json`
- Webhooks — `job.started`, `job.completed`, `job.failed`, `job.cancelled` (status-driven emitter)
- Admin — `POST /platform/admin/webhooks/retry-failed`
- Migrations — `m13_buyer_api`, `m13_hardening`

## Deferred (outside M13 / M14)

- Buyer **web UI** for keys/webhooks (§349 → **M14** only)
- Full staging E2E with live webhook receiver in CI
- Orchestration webhook events (future spec)

## Gate

```bash
pnpm db:setup
pnpm verify:m13
```
