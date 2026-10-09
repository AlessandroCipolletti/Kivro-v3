# M13 — manual validation checklist

## Prerequisites

```bash
pnpm db:setup   # includes m13_buyer_api migration
pnpm dev
```

Buyer account with **verified email** and credits (M08 dev shortcuts or Stripe test).

## 1. Create API key (session)

```bash
# After cookie session from web sign-in:
curl -s -b cookies.txt http://localhost:3001/buyer/api-keys
curl -s -b cookies.txt -X POST http://localhost:3001/buyer/api-keys \
  -H 'content-type: application/json' \
  -d '{"name":"local-test"}'
```

Store the returned `secret` once.

## 2. v1 capabilities + job

```bash
export KEY='kivro_live_...'   # from create response
curl -s -H "Authorization: Bearer $KEY" http://localhost:3001/v1/capabilities
curl -s -H "Authorization: Bearer $KEY" \
  -H 'Idempotency-Key: test-job-1' \
  -H 'content-type: application/json' \
  -X POST "http://localhost:3001/v1/capabilities/<CAP_ID>/jobs" \
  -d '{"inputs":{}}'
```

Repeat the POST with the same idempotency key → identical `201` body (includes `price`, `capabilityVersion`). Change body with same key → `409 IDEMPOTENCY_KEY_REUSE`.

402 responses use `INSUFFICIENT_FUNDS` (not `INSUFFICIENT_CREDITS`).

## 2b. v1 assets

```bash
curl -s -H "Authorization: Bearer $KEY" -H 'content-type: application/json' \
  -X POST http://localhost:3001/v1/assets/upload-intents \
  -d '{"contentHash":"sha256:abc123"}'
```

## 2c. OpenAPI

```bash
curl -s http://localhost:3001/v1/openapi.json | head
```

## 3. Webhook endpoint

```bash
curl -s -b cookies.txt -X POST http://localhost:3001/buyer/webhooks \
  -H 'content-type: application/json' \
  -d '{"url":"https://webhook.site/<uuid>","events":["job.completed"]}'
```

Complete a job via normal Worker flow → receiver should get signed `job.completed` payload (`Marketplace-Signature` header).

## 4. Revoke key

```bash
curl -s -b cookies.txt -X POST "http://localhost:3001/buyer/api-keys/<ID>/revoke"
curl -s -H "Authorization: Bearer $KEY" http://localhost:3001/v1/jobs
```

Expect `401 INVALID_API_KEY`.
