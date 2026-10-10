# Backup, restore & isolated recovery (M26 / HARD-014–015)

## Targets

See `docs/audits/M26-rpo-rto.json` for declared PostgreSQL and object-storage RPO/RTO.

## Automated backups (both profiles)

| Store | Netsons | AWS |
|-------|---------|-----|
| PostgreSQL | Provider-managed backups + WAL | RDS snapshots / PITR |
| Object assets | S3-compatible versioning | S3 versioning + lifecycle |
| Redis | **Non-authoritative** — no restore required for job/payment truth | ElastiCache optional cache |

## Isolated restore test (required evidence)

1. Restore PostgreSQL into an **isolated** database (not production).
2. Run `pnpm verify:m26` (includes restore invariant harness).
3. Run payment reconcile smoke: `node scripts/verify-isolated-restore-evidence.mjs`.
4. Record pass/fail in release checklist.

## Post-restore invariants

- No duplicate ledger idempotency keys.
- No terminal jobs with open `reservedAmountCents`.
- Job execution control-plane ownership unchanged for in-flight rows.

## Redis loss

Cache loss must not destroy authoritative state. Workers and API rehydrate from PostgreSQL; see `scripts/check-redis-non-authoritative.mjs`.
