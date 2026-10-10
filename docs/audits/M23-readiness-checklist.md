# M23 unified readiness checklist

Maps IMPLEMENTATION-PLAN M23 mandatory audit items to repo evidence.

| Check | Automated | Evidence |
|-------|-----------|----------|
| Requirements traceability | Yes | `audit-m23-unified.mjs`, `COVERAGE.md` |
| TESTED evidence paths | Yes | `compliance-audit-core.mjs` |
| M00–M22 closure (no TODO in owned sections) | Yes | M23 report `closedScopeTodoCount` |
| No duplicated shared semantics across adapters | Yes | `check-architecture.mjs`, `verify-both-composition-roots.mjs` (via `verify:m19`) |
| Same public API contract | Yes | `scripts/verify-api-contract-smoke.mjs` (via verify chain) |
| Same schema/migration history | Yes | single `packages/database/prisma/migrations` |
| Backend conformance both roots | Yes | `run-backend-conformance.mjs` (via `verify:m19`/`verify:m22`) |
| Architecture dependency checks | Yes | `check-architecture.mjs` |
| Full local E2E | Partial | `verify:m18` / `test:e2e:local` |
| Netsons staging E2E | Optional env | `scripts/netsons-staging-e2e.mjs` |
| AWS staging E2E | Optional env | `scripts/aws-staging-e2e.mjs` |
| Dual control-plane transition E2E | Optional env + manual | `verify-m22-dual-staging.mjs`, transition doc |
| All P0/P1/P2 complete | **No (M28)** | Report counts open P0/P1/P2 |

Full IMPLEMENTATION-PLAN mapping: **`M23-mandatory-audit-matrix.md`**.
