# M24 closure — architecture fitness & golden conformance

## Preconditions (met)

- M19 unified backend + conformance harness
- M23 audit gate (`pnpm verify:m23`)

## Deliverables

| Deliverable | Evidence |
|-------------|----------|
| Dependency fitness | `check-architecture.mjs`, `check-composition-thinness.mjs` (in verify flow) |
| Duplicate semantic ownership guard | `check-duplicate-semantic-ownership.mjs` |
| Golden scenario registry v2 | `tests/fixtures/backend-conformance-golden.json` + `verify-golden-registry.mjs` |
| Drift canary | `createBrokenCompositionDriftProbe`, `createBrokenTransportDriftProbe` tests |
| Generated parity evidence | `docs/audits/M24-provider-parity-report.json` |
| Both-provider golden suite | `conformance-golden-m19`, `conformance-golden-m24`, `conformance-dual-control-plane-m22` |
| Intentional divergence rejection | M24-GOLD-001/002 + `architecture-uni-023-m19` |

## Forbidden shortcuts (absent)

- Manual-only parity checks — parity report generated in CI
- Provider-specific golden expectations for shared semantics — registry is neutral
- Disabled architecture checks — run first in `verify:m24`

## Exit criteria

```bash
pnpm verify:m24
```

A deliberately divergent adapter **cannot** pass CI (proven by drift canary tests).

## Deferred to later milestones

- HARD-005/006 full fault-injection matrix → **M26**
- ASYNC-GOLD paid exactly-once E2E depth → **M29+**
