# M23 mandatory audit matrix

Maps IMPLEMENTATION-PLAN M23 bullets to repository evidence. **Terminal** items defer to M28 or env-gated staging.

| Mandatory audit item | M23 automation | Notes |
|----------------------|----------------|-------|
| Every requirement has impl + test evidence | `compliance-audit-core.mjs` | P0 TESTED must cite tests; paths verified on disk |
| All P0/P1/P2 complete | Report `masterSpecCompletion` | Not gated green until M28 |
| Product/security/payment/sandbox satisfied | `verify:m23` → `invariants` + `acceptance-m08` + `verify:m22` | Deep adversarial scope M24/M28 |
| No duplicated shared business in adapters | `check-architecture.mjs`, `check-composition-thinness.mjs` | M24 adds fitness registry |
| Same public API contract | `verify-api-contract-mvp.mjs` | Both roots use shared `apps/api` |
| Same schema/migration history | `single-migration-history` check | One Prisma migration tree |
| Backend conformance both roots | `verify:m22` → `run-backend-conformance.mjs` | |
| Provider-specific tests pass | `verify:m20`, `verify:m21` (via `verify:m22` chain) | |
| Architecture dependency checks | `check-architecture.mjs` | |
| Full local E2E | `verify:m18` (via chain) | |
| Netsons/AWS staging E2E | `verify-m23-staging-bundle.mjs` | SKIP without URLs |
| Dual control-plane transition E2E | `verify-m22-dual-staging.mjs` + manual doc | |
| No unresolved security/payment issues | `security/tests/invariants.test.ts` | Release audit HARD-018 at M28 depth |

Gate: **`pnpm verify:m23`**.
