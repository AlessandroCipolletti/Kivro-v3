# MVP API contract (Master Spec §41)

Public HTTP surface implemented in `apps/api`. Worker protocol routes are separate (`/worker/*`).

## Marketplace (buyer)

| Method | Path | Implementation |
|--------|------|----------------|
| GET | `/marketplace/capabilities` | `marketplace.ts` |
| GET | `/capabilities/:slug` | `capabilities.ts` |
| GET | `/capabilities/:slug/availability` | `capability-availability.ts` |
| POST | `/buyer/jobs` | `buyer-jobs-submit.ts` |
| GET | `/buyer/jobs` | `buyer-jobs-list.ts` |
| GET | `/buyer/jobs/:id` | `buyer-jobs-list.ts` |
| POST | `/buyer/jobs/:id/cancel` | `buyer-jobs-list.ts` |
| POST | `/buyer/credits/checkout` | `buyer-billing.ts` |

## Seller

| Method | Path | Implementation |
|--------|------|----------------|
| GET | `/seller/capabilities` | `seller-capabilities.ts` |
| POST | `/seller/capabilities` | `seller-capabilities.ts` |
| POST | `/seller/capabilities/:id/publish` | `seller-capabilities.ts` |
| POST | `/seller/capabilities/:id/pause` | `seller-capabilities.ts` (via pause helpers) |

## Worker devices

| Method | Path | Implementation |
|--------|------|----------------|
| POST | `/worker-devices/pair` | `worker-devices.ts` |
| POST | `/worker-devices/:id/revoke` | `worker-devices.ts`, platform admin |

## Programmatic buyer (v1)

| Method | Path | Notes |
|--------|------|-------|
| GET | `/v1/openapi.json` | OpenAPI stub |
| POST | `/v1/jobs` | Bearer API key |

Future MCP-style `search_capabilities` / `run_capability` remain **post-MVP** (§42); v1 + web cover human-driven flows.
