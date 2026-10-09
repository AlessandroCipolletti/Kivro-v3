# M22 closure — dual control-plane continuity

## Preconditions (met)

- M19 transport + discovery (`pnpm verify:m19`)
- M21 AWS profile (`pnpm verify:m21`)

## Deliverables (repo)

| Area | Evidence |
|------|----------|
| Execution ownership | `Job.executionControlPlaneId` + immutable re-dispatch |
| Policy | `@kivro/cloud-core/control-plane-policy` (ACTIVE, RETIRED, dedupe) |
| Dispatch / worker API | CP-scoped poll, accept/running/reject guards, transport headers |
| Discovery | RETIRED planes omitted from worker-visible discovery |
| Worker daemon | Dual poll tags CP; `x-kivro-control-plane-id` on HTTP job ops |
| Ops | `GET /platform/admin/control-planes`, `docs/deploy/dual-control-plane-transition.md` |
| Tests | M22-GOLD-001..007, discovery/API tests, PORT-028 reconnect guard, optional `verify-m22-dual-staging.mjs` |
| Gate | **`pnpm verify:m22`** |

## Exit criteria

```bash
pnpm verify:m22
```

## Operational (staging)

Dual-host paid E2E with env flip — see manual validation. Not required for CI green.

## Later milestones

- **M23** — full-spec compliance audit
- **ASYNC-GOLD-010** full DB/E2E (M29+) — M22 proves routing/policy substrate
