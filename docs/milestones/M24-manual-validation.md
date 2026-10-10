# M24 manual validation

1. `pnpm verify:m24`
2. Inspect `docs/audits/M24-provider-parity-report.json`
3. Confirm golden registry: `node scripts/verify-golden-registry.mjs`
4. Optional: introduce a temporary forbidden import in `packages/cloud-aws/src` and confirm `check-duplicate-semantic-ownership.mjs` fails
