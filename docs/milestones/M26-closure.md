# M26 closure — fault injection, recovery & disaster readiness

## Preconditions (met)

- M25 compatibility & Worker update (`pnpm verify:m25`)
- Durable job/payment flows (M08+) on both profiles

## Deliverables

| Deliverable | Evidence |
|-------------|----------|
| Fault-injection harness | `@kivro/resilience`, `fault-injection-matrix.json`, `verify-fault-injection-matrix.mjs` |
| Convergence assertions | HARD-006 helpers + M26 vitest suite |
| Duplicate completion idempotency | `markJobDeliveredAndSettle` COMPLETED path |
| Backup / restore runbook | `docs/deploy/backup-restore-runbook.md` |
| Declared RPO/RTO | `docs/audits/M26-rpo-rto.json` |
| Isolated restore evidence | `verify-isolated-restore-evidence.mjs` |
| Redis non-authoritative | `check-redis-non-authoritative.mjs`, `redis-policy.ts` |
| Reconciliation alerts manifest | `M26-reconciliation-alerts.json` |
| Ledger / Stripe dedupe tests | `ledger-idempotency.test.ts`, `stripe-webhook-idempotency.test.ts` |
| Worker reconnect on restart | `worker-reconcile.test.ts` (expired dispatch recovery) |
| Cache loss recovery plan | `cache-loss-recovery.ts` |
| Transport ack ambiguity | `fault-injection-transport-ack-m26.test.ts` (M26-FAULT-011) |
| Stripe claim-before-process | `handleStripeWebhookEvent` createMany + rollback |
| Backup profile evidence | `verify-backup-automation-evidence.mjs` |
| Gate | **`pnpm verify:m26`** |

## Exit criteria

```bash
pnpm verify:m26
```

Failures converge to correct authoritative state; restore evidence exists beyond backup config alone.

## Deferred

- Live provider restore drill in staging (ops sign-off per profile)
- Full ASYNC-GOLD fault matrix expansion (M29+)
