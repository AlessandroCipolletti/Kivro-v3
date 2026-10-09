# Implementation status

| Area | Status | Notes |
|------|--------|-------|
| M00 monorepo bootstrap | Implemented | Done |
| M01 domain model & contracts | Implemented | Prisma schema, @kivro/domain, I/O + permission contracts |
| M02 auth & worker foundation | Implemented | @kivro/auth, API routes, worker pair/doctor/scan, OpenClaw CLI adapter |
| M03 import & publish | Implemented | Dependency graph, publish/rollback/pause, package export, MinIO slots, `pnpm verify:m03` |
| M04 sandbox & security baseline | Implemented (bounded) | Policy, sandbox baseline, egress proxy, resource/provider brokers, platform dispatch admin, publish security gate, §19 tests, `pnpm verify:m04`. Full OpenClaw child exec + job dispatch: **M06+** (DEC-M04-002). §278–§282 pricing: **M08** (DEC-M04-001). |
| OpenClaw adapter (real) | Partial | CLI + marketplace env + preflight/`KIVRO_SANDBOX_DRY_RUN`; live agent exec M06+ |
| Auth (email/Google) | Implemented | Sessions, verify email, Google OAuth when configured |
| Cloud dispatch | Not implemented | M07 |
| Payments | Not implemented | M08 |
| Marketplace UI | Partial | Placeholder only |

## Security assumptions

- Marketplace jobs use deny-by-default network/tool policy and controlled egress evaluation (not prompt-only).
- Docker/OpenClaw agent execution remains preflight-only until job dispatch (M06); use `KIVRO_SANDBOX_DRY_RUN=true` locally.
- Worker local store uses JSON under `KIVRO_RUNTIME_ROOT`.

## Known deviations

- Real Docker/OpenClaw integration tests on CI runners without Docker remain post-M04 hardening (§80 dedicated runner).
- Automated paid E2E not in repo; milestone docs + unit/integration gates apply.
