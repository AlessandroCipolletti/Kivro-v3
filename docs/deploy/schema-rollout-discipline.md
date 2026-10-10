# Schema rollout discipline (HARD-009 / HARD-010)

Kivro database evolution follows **expand → deploy/backfill → contract** across any overlapping ACTIVE/DRAINING control-plane window.

## Registry

Every folder under `packages/database/prisma/migrations/` must appear in `tests/fixtures/schema-rollout-registry.json` with a `phase`:

| Phase | Meaning |
|-------|---------|
| `expand` | Backward-compatible DDL only; safe while old and new clouds coexist |
| `deploy` | Backfill / dual-write; must set `backfillIdempotent: true` when applicable |
| `contract` | Remove deprecated columns/constraints after all planes upgraded |

## Overlap rule

While two compatible control planes overlap, **only `expand` migrations may be pending**. Deploy/contract steps run when a single schema target is authoritative.

## Verification

```bash
node scripts/verify-schema-rollout-discipline.mjs
pnpm verify:m25
```
