# Integration test matrix (Master Spec §34.2)

Each row must have a milestone verify script (checked by `scripts/verify-integration-matrix.mjs`).

| Flow | Gate |
|------|------|
| Worker pairing + OpenClaw detect/scan | `pnpm verify:m03` |
| Safe sandbox execution | `pnpm verify:m04` |
| Input/output assets | `pnpm verify:m05` |
| Remote dispatch | `pnpm verify:m06` |
| Offline / timeout handling | `pnpm verify:m07` |
| Credits reserve/capture | `pnpm verify:m08` |
| Scheduling | `pnpm verify:m09` |
| Buyer vertical slice UI/API | `pnpm verify:m10` |

Security adversarial catalog: §34.3 — `security/tests/adversarial-m04.test.ts`, `security/SECURITY_INVARIANTS.md`.

Red-team phase §34.4 — operational checklist only (`docs/security/RED-TEAM-CHECKLIST.md`).
