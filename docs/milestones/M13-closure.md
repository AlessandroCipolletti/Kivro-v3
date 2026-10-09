# M13 — milestone closure (bounded)

Buyer REST API v1, programmatic API keys, idempotency, rate limits, and signed outbound webhooks ship in this milestone.

## Shipped

- `@kivro/buyer-api` — scoped keys (scrypt hash), verify/revoke, per-key rate limit, idempotency records
- `@kivro/buyer-webhooks` — SSRF-safe URL validation, encrypted secrets, HMAC delivery + retries
- Session routes — `GET/POST /buyer/api-keys`, `GET/POST /buyer/webhooks`, disable webhook
- v1 routes — `GET /v1/capabilities`, `GET /v1/capabilities/:id`, `POST .../jobs`, `GET /v1/jobs`, `GET /v1/jobs/:id`
- Job completion → `job.completed` webhook via `emitBuyerJobWebhook`
- Prisma migration `20260327180000_m13_buyer_api`

## Deferred / later milestones

- Buyer **web UI** for keys/webhooks (§349 → **M14**)
- v1 **asset upload intents** (`assets:create` scope stub; use session buyer asset flow until dedicated v1 endpoints)
- **`job.started` / `job.failed`** webhook events (only `job.completed` wired)
- Full staging E2E with external webhook receiver in CI
- P2 polish rows (e.g. extended webhook management UI)

## Gate

```bash
pnpm db:setup
pnpm verify:m13
```
