# M24 closure — architecture fitness & golden conformance

## Preconditions (met)

- M19 unified backend + conformance harness
- M23 audit gate (`pnpm verify:m23`)

## Deliverables

| Deliverable | Evidence |
|-------------|----------|
| Dependency fitness | `check-architecture.mjs`, `check-composition-thinness.mjs`, `check-no-bullmq-production.mjs` |
| Duplicate semantic ownership | `check-duplicate-semantic-ownership.mjs` |
| API composition boundary | `check-api-provider-import-boundary.mjs` |
| Golden registry v2 (15 scenarios) | `backend-conformance-golden.json`, `verify-golden-registry.mjs`, `check-golden-registry-shape.mjs` |
| Compatibility matrix (HARD-007 seed) | `compatibility-matrix.json` + `verify-compatibility-matrix.mjs` |
| Drift canary | `createBrokenCompositionDriftProbe`, `createBrokenTransportDriftProbe` |
| Parity + fitness reports | `M24-provider-parity-report.{json,md}`, `M24-fitness-report.{json,md}` |
| Exit criteria artifact | `M24-exit-criteria.json`, `acceptance-m24-exit.test.ts` (after vitest) |
| Divergence rejection suite | `conformance-divergence-rejection-m24.test.ts` |
| Both-provider suite | golden m19/m24, both-roots m19, dual-CP m22, `run-backend-conformance.mjs` |
| Payment golden seed (HARD-004) | `M24-GOLD-005` → `m08-payment-db.test.ts` / `verify-m08` |
| Divergence rejection | M24-GOLD-001/002, `architecture-uni-023-m19` |

## Exit criteria

```bash
pnpm verify:m24
```

Deliberately divergent adapters **cannot** pass CI.

## Deferred (by plan, not M24 blockers)

| Item | Milestone |
|------|-----------|
| HARD-005/006 full fault-injection matrix | M26 |
| HARD-004 full paid success/fail golden E2E | M29+ |
| Expanded compatibility / Worker update policy | M25 |
