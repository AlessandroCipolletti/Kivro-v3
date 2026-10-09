# Security release gate (Master Spec §91)

Automated evidence map: `tests/fixtures/security-release-gate.json`.

Run in CI via `pnpm verify:m16` → `scripts/verify-release-gate-evidence.mjs`.

## Automated in repo (must stay green)

- Sandbox / filesystem / Docker socket — `adversarial-m04`
- SSRF / metadata / research broker — `adversarial-m06`, `fixture-ad-m06`
- Tool allow-list / browser deny — `acceptance-m15` + `policy-engine`
- Path traversal / output safety — `adversarial-m04`, `result-safety`
- Payment idempotency — `m08-payment-db`, `verify:m08`
- Native plugin gate — `native-plugin-gate.test.ts`

## Manual before public seller onboarding

See checkboxes in `docs/security/RED-TEAM-CHECKLIST.md` plus §91 items marked `manualOnly` in the JSON fixture.

External pen test: required before public beta unless explicitly accepted as private-alpha risk (document in `docs/PRODUCT-VALIDATION.md`).
