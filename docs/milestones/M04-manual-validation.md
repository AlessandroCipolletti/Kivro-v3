# M04 — Sandbox, permissions & security baseline

M04 is validated via automated tests and `pnpm verify:m04`, not browser UI.

## Prerequisites

- `pnpm install && pnpm build`
- Optional: Docker socket for worker `doctor` docker check

## Terminal gate

```bash
pnpm verify:m04
```

## What `verify:m04` covers

- Structured network allow lists (host + ports + purpose)
- Policy engine SSRF/metadata/private blocks and tool allow-list
- Controlled egress proxy (§16.2 / §72)
- Marketplace sandbox baseline + Docker spec generation
- Resource and provider broker authorization
- §19 invariant catalog tests
- Publish security preflight (via package tests)
- Worker `policy-check` and marketplace config generation

## Worker commands

```bash
node apps/worker/dist/cli.js policy-check --file path/to/manifest.json
node apps/worker/dist/cli.js sandbox-spec --file path/to/manifest.json
node apps/worker/dist/cli.js doctor
```

## Platform admin (local)

Set `KIVRO_ADMIN_TOKEN` in `.env`, then:

```bash
curl -s -H "x-kivro-admin-token: $KIVRO_ADMIN_TOKEN" http://localhost:3001/platform/admin/dispatch
```

## Out of M04 scope (by decision)

- **§278–§282** USD tiers / earnings → M08 (`DEC-M04-001`)
- **Full job execution / dispatch** → M06+ (`DEC-M04-002`)
