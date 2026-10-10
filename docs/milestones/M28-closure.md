# M28 closure — final lossless compliance & security audit

## Two levels (DEC-M28-001)

| Level | Meaning |
|-------|---------|
| **M28 harness DONE** | Terminal audit machinery executed; M00–M27 closure traceability; M24–M27 harness evidence; no COVERAGE trust gaps in sampled P0 TESTED rows |
| **Product Master Spec complete** | All P0/P1/P2 requirements TESTED (zero catalog TODO) + staging paid E2E — **still open** until M29+ product milestones |

## Preconditions (met)

- **`pnpm verify:m27`** (performance envelope, release ops, M26 DR, full regression chain)

## Deliverables

| Deliverable | Evidence |
|-------------|----------|
| Terminal compliance audit | `audit-m28-unified.mjs`, `M28-compliance-report.json` |
| Requirement families | `audit-m28-requirement-families.mjs` (ARCH-UNI, PORT, HOST-NET, HARD) |
| Expanded P0 sampling | `audit-m28-master-spec-sampling.mjs` |
| Mandatory terminal matrix | `M28-mandatory-audit-matrix.md`, `m28-mandatory-runs.mjs` |
| Exit criteria | `M28-exit-criteria.json` |
| Open requirements catalog | `M28-open-requirements-catalog.json` |
| Threat-control evidence chain | `verify-m28-threat-control-evidence.mjs` |
| Portability family P0 gate | extended `audit-m28-requirement-families.mjs` |
| Dual control-plane evidence | `verify-m28-dual-control-plane-evidence.mjs` |
| Readiness checklist (generated) | `audit-m28-readiness-checklist.mjs` |
| Gate | **`pnpm verify:m28`** |

## Exit criteria (milestone harness)

```bash
pnpm verify:m28
```

Confirm `m28HarnessComplete: true`. `productMasterSpecComplete` remains false until the requirement catalog has zero open P0/P1/P2 rows.

## Deferred (post-M28 product work)

- M29+ ASYNC/BUYERUX/SELLERUX requirements still scheduled open in COVERAGE
- Env-gated Netsons/AWS staging paid E2E
