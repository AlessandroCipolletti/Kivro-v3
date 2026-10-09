# M23 compliance audit snapshot

Generated: 2026-10-09T22:54:37.182Z

## Totals

- Requirements parsed: **1923**
- TESTED: 1376 · TODO: 528 · PARTIAL: 15 · DEFERRED: 4

## M00–M22 closure check

- Sections referenced by milestones through M22: 342
- TODO rows inside that section set: **0** (must be 0)
- PARTIAL in that set: 9

## Gate inputs

- Unexplained TODO/PARTIAL/BLOCKED: **0**
- TESTED rows with missing evidence paths: **0**

## P0/P1 still open (scheduled later)

See `docs/audits/M23-P0-P1-by-section.md`.

Full machine report: `docs/audits/M23-compliance-report.json`.

## Unified readiness (M23 IMPLEMENTATION-PLAN)

- single-schema: PASS/SKIP — packages/database/prisma
- dual-composition-roots: PASS/SKIP — cloud-netsons + cloud-aws
- conformance-manifest: PASS/SKIP — backend-conformance-manifest.json
- architecture-lint: PASS/SKIP — check-architecture.mjs
- verify-m22-gate: PASS/SKIP — package.json verify:m22
- netsons-staging-e2e: PASS/SKIP — SKIP (unset: KIVRO_NETSONS_STAGING_URL, KIVRO_E2E_BUYER_EMAIL, KIVRO_E2E_SELLER_EMAIL)
- aws-staging-e2e: PASS/SKIP — SKIP (unset: KIVRO_AWS_STAGING_URL, KIVRO_E2E_BUYER_EMAIL, KIVRO_E2E_SELLER_EMAIL)
- dual-control-plane-staging: PASS/SKIP — SKIP (unset: KIVRO_M22_STAGING_URL)
