# M06 — Controlled Internet research & resource brokers

## Gate

```bash
pnpm build
pnpm verify:m06
node scripts/sync-m06-coverage.mjs   # after evidence updates
```

## Packages

- `@kivro/research-broker` — `web.search` / `web.fetch`, SSRF checks, budgets, audit trail, typed API connectors
- `@kivro/contracts` — `InternetResearchPolicy`, `ApiConnector`, optional `WorkerManifest.internet`
- `@kivro/platform-policy` — platform research ceilings (§255)

## Worker CLI

```bash
node apps/worker/dist/cli.js research-probe --file manifest.json
node apps/worker/dist/cli.js research-probe --file manifest.json --url http://127.0.0.1/
# second command must block (SSRF)
```

## API

- `GET /capabilities/:slug` includes `internetDisclosure` (§258)
- `POST /seller/internet/validate` — clamp/validate internet policy + seller summary (§257)

## Deferred (explicit)

- **Browser-based research (§264)** — search API + safe HTTP fetch only for MVP
- **Cloud research broker deployment (§269–§273)** — `PARTIAL` in coverage; local hardened broker MVP only

## Canonical fixture

- §260 competitive video ad flow: public research policy + resource broker separation covered in unit/adversarial tests
