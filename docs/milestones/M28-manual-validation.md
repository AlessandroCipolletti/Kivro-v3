# M28 manual validation

1. Run `pnpm verify:m28` (includes full `verify:m27` regression).
2. Open `docs/audits/M28-exit-criteria.json` — expect `m28HarnessComplete: true`.
3. Review `docs/audits/M28-compliance-report.json` for P0/P1/P2 TODO counts (product completion flag).
4. Spot-check `docs/audits/M28-requirement-families.json` HARD rollup.
5. Confirm `docs/audits/M28-readiness-checklist.md` shows automated readiness PASS.
6. Confirm `docs/audits/M23-exit-criteria.json` → `terminal-lossless-audit` = `EXECUTED_M28`.
7. Optional: configure staging env vars and run `scripts/verify-m23-staging-bundle.mjs`.
