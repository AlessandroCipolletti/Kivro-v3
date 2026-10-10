# M28 compliance audit snapshot

Generated: 2026-10-10T08:50:25.469Z

## Totals

- Requirements parsed: **1951**
- TESTED: 1479 · TODO: 453 · PARTIAL: 15 · DEFERRED: 4

## M00–M27 closure check

- Sections referenced by milestones through M27: 342
- TODO rows inside that section set: **0** (must be 0)
- PARTIAL in that set: 9

## Gate inputs

- Unexplained TODO/PARTIAL/BLOCKED: **0**
- TESTED rows with missing evidence paths: **0**
- P0 TESTED without test evidence: **0**

## P0/P1 still open (scheduled later)

See `docs/audits/M28-P0-P1-by-section.md`.

Full machine report: `docs/audits/M28-compliance-report.json`.

## M28 terminal readiness

- verify-m28-gate: PASS — package.json verify:m28
- verify-m27-chain: PASS — M27 regression gate present
- master-spec-authoritative: PASS — spec/MASTER-SPEC.md
- coverage-catalog: PASS — spec/COVERAGE.md

## Mandatory terminal runs

- single-migration-history: PASS — packages/database/prisma/migrations
- shared-api-contract-source: PASS — packages/contracts single public contract package
- architecture-deps: PASS — scripts/check-architecture.mjs
- composition-thinness: PASS — scripts/check-composition-thinness.mjs
- no-bullmq-production: PASS — scripts/check-no-bullmq-production.mjs
- api-contract-mvp: PASS — scripts/verify-api-contract-mvp.mjs
- security-release-gate-files: PASS — scripts/verify-release-gate-evidence.mjs
- both-composition-roots: PASS — verify-both-composition-roots.mjs
- golden-registry: PASS — scripts/verify-golden-registry.mjs
- fault-injection-matrix: PASS — scripts/verify-fault-injection-matrix.mjs
- unified-release-evidence: PASS — scripts/verify-unified-release-evidence.mjs
- release-activation-gate: PASS — scripts/verify-release-activation-gate.mjs
- backend-conformance: PASS — scripts/run-backend-conformance.mjs
- redis-non-authoritative: PASS — scripts/check-redis-non-authoritative.mjs
- isolated-restore-evidence: PASS — scripts/verify-isolated-restore-evidence.mjs
- threat-control-evidence: PASS — scripts/verify-m28-threat-control-evidence.mjs
- dual-control-plane-evidence: PASS — scripts/verify-m28-dual-control-plane-evidence.mjs
- m24-exit: PASS — docs/audits/M24-exit-criteria.json → m24HarnessComplete=true
- m25-exit: PASS — docs/audits/M25-exit-criteria.json → m25HarnessComplete=true
- m26-exit: PASS — docs/audits/M26-exit-criteria.json → m26HarnessComplete=true
- m27-exit: PASS — docs/audits/M27-exit-criteria.json → m27HarnessComplete=true
- threat-model-doc: PASS — HARD-017 threat→control matrix source
- section-milestone-index: PASS — spec/compliance/section-milestone-index.json
