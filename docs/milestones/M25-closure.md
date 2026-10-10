# M25 closure — compatibility, schema evolution & Worker update

## Preconditions (met)

- M24 architecture fitness gate (`pnpm verify:m24`)
- Worker Protocol versioning (`@kivro/contracts`)
- Prisma migration history (`@kivro/database`)

## Deliverables

| Deliverable | Evidence |
|-------------|----------|
| Authoritative compatibility matrix | `packages/compatibility/matrix.json`, `@kivro/compatibility` |
| Release compatibility metadata | `docs/audits/unified-release-manifest.json` |
| expand → deploy → contract registry | `tests/fixtures/schema-rollout-registry.json`, `verify-schema-rollout-discipline.mjs` |
| Signed Worker release verification | `worker-release-signing.ts`, `kivro-worker update verify` |
| Minimum / revoked Worker policy | `worker-policy.ts` + `seller-health` warnings |
| Staged update / rollback | `staged-worker-update.ts` |
| Cloud fail-closed handshake | `evaluateCloudWorkerHandshake`, API poll/heartbeat gates |
| Backend transition without binary | `backend-transition.ts`, M25 dual-CP restart test |
| Revoked Worker policy (env) | `KIVRO_REVOKED_WORKER_VERSIONS` + handshake |
| OpenClaw adapter range | `openclaw-range.ts` + heartbeat gate |
| HARD-010 deploy backfill guard | `validateBackfillIdempotencyDeclarations` |
| Worker protocol header | `x-kivro-protocol-version` on cloud client |
| CLI smoke | `verify-worker-release-cli.mjs` |
| Staged update CLI + store | `kivro-worker update begin|health-check|rollback|status`, `worker-store` |
| Fitness report | `M25-fitness-report.json` |
| Schema rollout ops doc | `docs/deploy/schema-rollout-discipline.md` |
| Strict protocol header (opt) | `KIVRO_REQUIRE_WORKER_PROTOCOL_HEADER` |
| Gate | **`pnpm verify:m25`** |

## Exit criteria

```bash
pnpm verify:m25
```

Declared compatibility windows are executable; provider transition does not require Worker binary update when protocol/transports already match.

## Deferred

- Full production Worker CDN/update channel — operational wiring in M27 release ops
- Expanded OpenClaw pin matrix in CI — continues with adapter milestones
