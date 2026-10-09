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

Milestone `scripts/verify-mNN-flow.mjs` gates exercise cross-package flows (publish, dispatch, billing, buyer API, observability).

## Security tests

- `security/tests/invariants*.test.ts` — platform invariants
- `security/tests/adversarial-m04.test.ts` — sandbox boundary
- `security/tests/acceptance-m*.test.ts` — milestone acceptance bundles
- `security/SECURITY_INVARIANTS.md` — documented adversarial catalog (§34.3)

## CI release gates

`.github/workflows/ci.yml` runs typecheck, lint, unit tests, build, and milestone verify scripts through M15.

Red-team and external review before public beta: follow `docs/security/RED-TEAM-CHECKLIST.md` (§34.4), not CI-automated.
