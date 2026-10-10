# M27 manual validation

1. Run `pnpm verify:m27` on a clean tree with Docker/PostgreSQL available (inherits `verify:m26`).
2. Confirm `docs/audits/M27-exit-criteria.json` has `m27HarnessComplete: true`.
3. Inspect `docs/audits/unified-release-manifest.json` for `exactReleaseId` matching current `git rev-parse HEAD` prefix.
4. Temporarily set `parityAsserted: false` in `M24-provider-parity-report.json` and confirm `verify-release-activation-gate.mjs` fails (revert before commit).
5. Review `docs/audits/M27-operational-alarms.json` with ops for monitoring tool mapping.
