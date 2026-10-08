# Implementation status

| Area | Status | Notes |
|------|--------|-------|
| M00 monorepo bootstrap | Implemented | Done |
| M01 domain model & contracts | Implemented | Prisma schema, @kivro/domain, I/O + permission contracts |
| M02 auth & worker foundation | Implemented | @kivro/auth, API routes, worker pair/doctor/scan, OpenClaw CLI adapter |
| OpenClaw adapter (real) | Partial | CLI detection/discovery; execute/sandbox deferred M04 |
| Auth (email/Google) | Implemented | Sessions, verify email, Google OAuth when configured |
| Cloud dispatch | Not implemented | M07 |
| Payments | Not implemented | M08 |
| Marketplace UI | Partial | Placeholder only |

## Security assumptions

- Sandbox execution is stubbed until M04.
- Worker local store uses JSON under `KIVRO_RUNTIME_ROOT` (no native SQLite; Node 26–compatible).
- Job execution via OpenClaw remains stub until M04.

## Known deviations

- Automated E2E tests are not in repo; manual validation per `docs/milestones/M00-manual-validation.md` and `spec/DECISIONS.md`.
