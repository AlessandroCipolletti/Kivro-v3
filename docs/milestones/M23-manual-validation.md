# M23 manual validation

1. `pnpm verify:m23`
2. Review `docs/audits/M23-compliance-report.md`, `M23-mandatory-audit-matrix.md`, `M23-P0-P1-by-section.md`
3. Confirm `masterSpecCompletion` P0/P1 TODO counts match expected schedule (M24–M34)
4. Optional staging: `node scripts/verify-m23-staging-bundle.mjs` with Netsons/AWS/M22 URLs and E2E identities
5. Dual-host transition soak — `docs/deploy/dual-control-plane-transition.md`

Terminal lossless audit: **M28**.
