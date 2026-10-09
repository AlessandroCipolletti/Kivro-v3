# Implementation status

| Area | Status | Notes |
|------|--------|-------|
| M00 monorepo bootstrap | Implemented | Done |
| M01 domain model & contracts | Implemented | Prisma schema, @kivro/domain, I/O + permission contracts |
| M02 auth & worker foundation | Implemented | @kivro/auth, API routes, worker pair/doctor/scan, OpenClaw CLI adapter |
| M03 import & publish | Implemented | Dependency graph, publish/rollback/pause, package export, MinIO slots, `pnpm verify:m03` |
| M04 sandbox & security baseline | Implemented (bounded) | `pnpm verify:m04`; full agent exec M06+ |
| M05 capability I/O & assets | Implemented | `@kivro/job-io`, contract validate/publish gate, buyer form schema, agent prepare API, upload sniff, worker I/O CLI, `pnpm verify:m05`; seller visual builder UI deferred to product milestone |
| M06 controlled Internet research | Implemented (bounded) | DNS-aware SSRF, content sanitize/hash, publish internet gate, seller `/internet/validate`, §260 fixture tests, `pnpm verify:m06`; §264 browser + §269–§273 cloud deploy PARTIAL/DEFERRED |
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
