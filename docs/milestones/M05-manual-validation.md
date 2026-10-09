# M05 — Capability I/O, files & assets

Validated via `pnpm verify:m05` and API where noted.

## Gate

```bash
pnpm db:migrate   # includes buyer asset purposes
pnpm build
pnpm verify:m05
```

## API (optional, API running)

```bash
# Validate buyer payload against published contract
curl -s -X POST http://localhost:3001/capabilities/<slug>/validate-input \
  -H 'content-type: application/json' \
  -d '{"inputs":{"instructions":"long enough text","resolution":"1080p"},"assets":{"scene":[{"assetId":"...","filename":"x.blend","sizeBytes":1000,"sniffedMimeType":"application/x-blender"}]}}'
```

Buyer upload slots: `POST /buyer/assets/upload-slot` (authenticated, verified email).

## Packages

- `@kivro/contracts` — input/output contract schema (v1 legacy + v2 fields)
- `@kivro/job-io` — buyer validation, input manifest, output result.json validation, media presets
