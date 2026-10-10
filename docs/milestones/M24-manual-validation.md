# M24 manual validation

1. `pnpm verify:m24`
2. Confirm `docs/audits/M24-exit-criteria.json` → `"m24HarnessComplete": true`
3. Review `M24-fitness-report.md` and `M24-provider-parity-report.json`
4. `node scripts/verify-golden-registry.mjs` and `node scripts/check-golden-registry-shape.mjs`
5. Optional negative tests:
   - Forbidden import in `packages/cloud-aws/src` → duplicate semantic check fails
   - Forbidden provider import in `apps/api/src/routes/*.ts` → API boundary check fails
6. Optional: run `node scripts/verify-m24-flow.mjs` after temporarily breaking `createBrokenCompositionDriftProbe` expectation to confirm CI would catch drift
