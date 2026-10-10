# M26 manual validation

1. `pnpm verify:m26`
2. Confirm `docs/audits/M26-exit-criteria.json` → `"m26HarnessComplete": true`
3. Review `docs/deploy/backup-restore-runbook.md` and `M26-rpo-rto.json`
4. Optional DB: run `security/tests/m08-payment-db.test.ts` with `DATABASE_URL` set
5. Optional staging: isolated PostgreSQL restore + reconcile cron smoke
6. Review fault matrix has 10 scenarios: `packages/resilience/fault-injection-matrix.json`
