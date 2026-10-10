# M25 manual validation

1. `pnpm verify:m25`
2. Confirm `docs/audits/M25-exit-criteria.json` → `"m25HarnessComplete": true`
3. Inspect `docs/audits/unified-release-manifest.json` vs `packages/compatibility/matrix.json`
4. Generate a signed Worker release in dev:
   - Use `generateWorkerReleaseSigningKeyPair()` from `@kivro/compatibility` in a REPL/test
   - `pnpm --filter @kivro/worker run build && node apps/worker/dist/cli.js update verify --manifest … --signature … --public-key …`
5. Negative: heartbeat with `protocolVersion: 99` → HTTP 426 with remediation payload
