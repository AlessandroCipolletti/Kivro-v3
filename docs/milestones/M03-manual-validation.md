# M03 — validation (agent terminal)

M03 is validated via API/CLI and `pnpm verify:m03`, not browser UI.

## Prerequisites

```bash
pnpm db:setup
pnpm storage:setup   # optional for upload-slot tests
pnpm build
```

Start API (terminal 1):

```bash
NODE_ENV=development KIVRO_DEV_AUTH_SHORTCUTS=true node scripts/run-with-env.mjs node apps/api/dist/main.js
```

Ensure `.env` matches `.env.example` (Postgres 5433, MinIO, dev auth shortcuts).

## Automated gate

```bash
pnpm typecheck && pnpm lint && pnpm test && pnpm build
pnpm verify:m03
```

## What `verify:m03` covers

- Email auth + worker pairing
- Import consent + dependency graph analysis
- Publish with worker manifest hash verification, inference dependency, consent records
- Public marketplace `GET /capabilities/:slug`

## Optional API checks

- `POST /seller/capabilities/:id/pause`
- `POST /seller/capabilities/:id/rollback` with `{ "targetVersionId": "..." }`
- `GET /seller/capabilities/:id/package` (§114 package export)
- `GET /seller/capabilities/:id/version-diff?fromVersionId=&toVersionId=`
- Worker: `kivro-worker verify-manifest --file manifest.json`
