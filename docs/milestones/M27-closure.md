# M27 closure — performance envelope & unified release operations

## Preconditions (met)

- M26 fault injection & DR readiness (`pnpm verify:m26`)
- M25 unified release manifest + compatibility (`pnpm verify:m25`)
- Both Netsons and AWS composition roots (`pnpm verify:m19`)

## Deliverables

| Deliverable | Evidence |
|-------------|----------|
| MVP performance envelope | `docs/audits/M27-performance-envelope.json`, `docs/deploy/performance-envelope.md` |
| Profile load simulation | `@kivro/release-ops`, `verify-performance-envelope-load.mjs` |
| Exact-release activation gates | `evaluateReleaseActivation`, `verify-release-activation-gate.mjs` |
| Unified manifest extensions | `exactReleaseId`, envelope + alarm paths in manifest |
| Provider parity evidence | `generate-provider-parity-report.mjs` (M24, required at activation) |
| Operational alarms | `docs/audits/M27-operational-alarms.json` |
| Bounded runtime vs envelope | `check-bounded-runtime-vs-envelope.mjs`, `DURABLE_WORK_*` in cloud-core |
| Manifest evidence paths | `verify-unified-release-evidence.mjs` |
| Product limits vs envelope | `check-envelope-product-limits.mjs` |
| Activation requires M25+M26 harness | `evaluateReleaseActivation` |
| Queue ceiling load simulation | `runEnvelopeQueueCeilingSuite` |
| Gate | **`pnpm verify:m27`** |

## Exit criteria

```bash
pnpm verify:m27
```

Release is identifiable (`exactReleaseId`), reproducible (`gitCommit`), bounded (envelope), and activation-safe on either provider.

## Deferred

- Real staging load tests (k6/Locust) above synthetic envelope suite — ops sign-off per profile
- Production dashboard wiring for HARD-028 alarm IDs
