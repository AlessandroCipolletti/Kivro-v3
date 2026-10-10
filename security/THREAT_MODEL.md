# Threat model (bootstrap)

Primary assets: seller machine, buyer data, ledger, capability manifests.

## Evidence chain (M28 terminal audit)

- Requirement catalog: `spec/SECURITY-EVIDENCE.md` (controls ↔ tests).
- Release gate automation: `scripts/verify-release-gate-evidence.mjs`, `scripts/audit-m23-security-release.mjs`.
- Adversarial / fault tests: `security/tests/adversarial-m04.test.ts`, `security/tests/adversarial-m06.test.ts`, `security/tests/fault-injection-*.test.ts`.
- Master Spec §91 release gate checklist (security bundle before activation).
