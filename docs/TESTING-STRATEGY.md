# Testing strategy (Master Spec §34)

Kivro validates behavior through layered automated tests mapped to milestones.

## Unit tests

- Schema validation — `@kivro/contracts`, `@kivro/job-io`, capability publish gates
- Job state machine — `@kivro/domain`
- Billing ledger — `@kivro/billing`
- Permission merge / publish diff — `@kivro/capability-publish`
- OpenClaw adapter parsing — `@kivro/openclaw-adapter`
- Policy validator — `@kivro/policy-engine`, `@kivro/sandbox`
- Worker pairing — `@kivro/auth`, API routes
- Abuse / denylist — `@kivro/abuse-controls`
- Failure invariants — `@kivro/job-failure`

## Integration tests

Milestone `scripts/verify-mNN-flow.mjs` gates exercise cross-package flows. Matrix: `docs/testing/INTEGRATION-TEST-MATRIX.md` (verified by `scripts/verify-integration-matrix.mjs`).

## Security tests

- `security/tests/invariants*.test.ts` — platform invariants
- `security/tests/adversarial-m04.test.ts` — sandbox boundary
- `security/tests/adversarial-m06.test.ts` — research / SSRF broker
- `security/tests/acceptance-m*.test.ts` — milestone acceptance bundles
- `security/SECURITY_INVARIANTS.md` — documented adversarial catalog (§34.3)

## Release gates (M16)

- §88 happy path — `docs/testing/HAPPY-PATH-TRACE.md`, `scripts/verify-happy-path-trace.mjs`
- §89 failure path — `docs/testing/FAILURE-PATH-TRACE.md`, `scripts/verify-failure-path-trace.mjs`
- §90 fixtures — `tests/fixtures/catalog.json`, `security/tests/e2e-fixtures-m16.test.ts`
- §91 security gate — `docs/testing/SECURITY-RELEASE-GATE.md`
- §92 product gate — `docs/testing/PRODUCT-RELEASE-GATE.md` (staging E2E; full §573 automation in M18)

## CI release gates

`.github/workflows/ci.yml` runs typecheck, lint, unit tests, build, and milestone verify scripts through **M16** (`pnpm verify:m16`).

Red-team and external review before public beta: follow `docs/security/RED-TEAM-CHECKLIST.md` (§34.4), not CI-automated.
