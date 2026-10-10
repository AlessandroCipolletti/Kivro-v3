# M23 closure — unified compliance audit

## Two levels (DEC-M23-001 / DEC-M23-002)

| Level | Meaning | Status when |
|-------|---------|-------------|
| **M23 harness (milestone DONE)** | Audit machinery + automatable mandatory checks | `pnpm verify:m23` + `M23-exit-criteria.json` → `m23HarnessComplete: true` |
| **Plan literal (full Master Spec)** | All P0/P1/P2 + staging E2E + zero open product scope | **M28** terminal gate (`productMasterSpecComplete`) |

IMPLEMENTATION-PLAN M28 explicitly **supersedes** earlier “final audit” wording for lossless proof.

## Preconditions (met)

- M17 traceability baseline
- M18–M22 gates through **`pnpm verify:m22`**

## Deliverables (repo)

| Area | Evidence |
|------|----------|
| Audit core | `compliance-audit-core.mjs`, `audit-m23-unified.mjs` |
| Mandatory runs | `m23-mandatory-runs.mjs` |
| Security release (HARD-018) | `audit-m23-security-release.mjs` + §91 gate fixture |
| Sampling audit | `audit-m23-master-spec-sampling.mjs` |
| Exit criteria | `docs/audits/M23-exit-criteria.{json,md}` |
| Matrix | `M23-mandatory-audit-matrix.md` |
| Staging bundle | `verify-m23-staging-bundle.mjs` (optional env) |
| Tests | `conformance-unified-audit-m23` (M23-GOLD-001..003) |
| Gate | **`pnpm verify:m23`** |

## Exit criteria (milestone DONE)

```bash
pnpm verify:m23
```

Confirm `docs/audits/M23-exit-criteria.json`:

```json
"m23HarnessComplete": true
```

## Not required for M23 milestone closure

- All P0/P1/P2 implemented (528+ open rows scheduled M24–M34)
- Netsons/AWS paid staging E2E without env
- Dual-host transition soak (documented manual path)

## Manual

`M23-manual-validation.md`, `dual-control-plane-transition.md`
