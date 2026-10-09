# M05 — Capability I/O, files & assets

## Gate

```bash
pnpm db:migrate
pnpm build
pnpm verify:m05
```

## Seller (authenticated)

- `POST /seller/contract/validate` — normalize + validate contract, returns `buyerForm` preview
- `POST /seller/import/suggest-input-contract` — §205 heuristic suggestions from discovery snapshot
- Publish rejects invalid contracts (`CONTRACT_INVALID`)

## Buyer / public

- `GET /capabilities/:slug` — includes `buyerForm` schema
- `POST /capabilities/:slug/validate-input` — server-side validation + input manifest
- `POST /capabilities/:slug/prepare-agent-input` — §208 deterministic draft mapping
- `POST /buyer/assets/upload-slot` + `confirm` — returns `sniffedMime` when storage available (§216)

## Worker CLI

```bash
node apps/worker/dist/cli.js validate-input --contract c.json --payload p.json
node apps/worker/dist/cli.js validate-output --contract c.json --result result.json
node apps/worker/dist/cli.js job-instructions --contract c.json
```

## Explicitly post-M05

- Full seller visual contract builder UI (§204) — API/schema supports it; web UI is a later product milestone.
