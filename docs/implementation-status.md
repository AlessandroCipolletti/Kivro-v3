# Implementation status

| Area | Status | Notes |
|------|--------|-------|
| M00 monorepo bootstrap | Implemented | Done |
| M01 domain model & contracts | Implemented | Prisma schema, @kivro/domain, I/O + permission contracts |
| OpenClaw adapter (real) | Not implemented | M02 |
| Auth (email/Google) | Not implemented | M02 |
| Cloud dispatch | Not implemented | M07 |
| Payments | Not implemented | M08 |
| Marketplace UI | Partial | Placeholder only |

## Security assumptions

- Sandbox execution is stubbed until M04.
- OpenClaw adapter is stub until M02.

## Known deviations

- Automated E2E tests are not in repo; manual validation per `docs/milestones/M00-manual-validation.md` and `spec/DECISIONS.md`.
