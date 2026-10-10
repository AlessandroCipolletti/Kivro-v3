# M28 mandatory terminal audit matrix

Direct evidence runs (not COVERAGE prose alone). Implemented in `scripts/lib/m28-mandatory-runs.mjs` (extends M23 checks).

| ID | Script / check |
|----|----------------|
| architecture-deps | `scripts/check-architecture.mjs` |
| composition-thinness | `scripts/check-composition-thinness.mjs` |
| single-migration-history | `packages/database/prisma/migrations` |
| shared-api-contract-source | `packages/contracts` |
| security-release-gate-files | `scripts/verify-release-gate-evidence.mjs` |
| both-composition-roots | `scripts/verify-both-composition-roots.mjs` |
| golden-registry | `scripts/verify-golden-registry.mjs` |
| fault-injection-matrix | `scripts/verify-fault-injection-matrix.mjs` |
| unified-release-evidence | `scripts/verify-unified-release-evidence.mjs` |
| release-activation-gate | `scripts/verify-release-activation-gate.mjs` |
| backend-conformance | `scripts/run-backend-conformance.mjs` |
| redis-non-authoritative | `scripts/check-redis-non-authoritative.mjs` |
| isolated-restore-evidence | `scripts/verify-isolated-restore-evidence.mjs` |
| threat-control-evidence | `scripts/verify-m28-threat-control-evidence.mjs` |
| dual-control-plane-evidence | `scripts/verify-m28-dual-control-plane-evidence.mjs` |
| m24–m27 exit criteria | `M24`…`M27-exit-criteria.json` harness flags |
| threat-model-doc | `security/THREAT_MODEL.md` |
| section-milestone-index | `spec/compliance/section-milestone-index.json` |

Supporting M28-only audits (verify flow):

- `audit-m28-open-requirements-catalog.mjs` — scheduled P0/P1/P2 open catalog
- `audit-m28-requirement-families.mjs` — ARCH-UNI / PORT / HOST-NET / HARD
- `audit-m28-master-spec-sampling.mjs` — 60× P0 TESTED path sampling
- `audit-m28-readiness-checklist.mjs` — regenerates this repo’s readiness markdown
- `audit-m28-refresh-m23-terminal.mjs` — M23 `terminal-lossless-audit` → `EXECUTED_M28`
