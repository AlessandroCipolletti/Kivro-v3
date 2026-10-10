# M29 closure — durable asynchronous buyer delivery

## Goal

Purchase → wait → execute → persist → notify → later-retrieve once in shared Core, with identical Netsons/AWS semantics.

## Deliverables

| Area | Evidence |
|------|----------|
| Cloud finalization barrier | `packages/job-delivery/src/cloud-finalization.ts`, `packages/billing/src/job-completion.ts` |
| Retention + cleanup | `packages/job-delivery/src/retention*.ts`, `cloud-core` maintenance sweeps |
| Terminal notifications | `JobTerminalNotification`, `terminal-notifications.ts` (email queue; completion not blocked) |
| Buyer retrieval | `buyer-job-download.ts`, session + v1 API download routes |
| Integrity reconciliation | `reconcile-result-integrity.ts` |
| Golden scenarios | `ASYNC-GOLD-001..010` in `backend-conformance-golden.json` |
| Async evidence script | `verify-m29-async-evidence.mjs` |
| Storage head check at barrier | `objectExists` in cloud finalization when configured |
| Completion barrier tests | `job-completion-barrier-m29.test.ts` |
| ASYNC COVERAGE spotcheck | `M29-async-spotcheck.json` |
| Integrity sample sweep | `sampleCompletedJobIntegrity` in maintenance |
| Session + v1 list retention fields | buyer jobs list + v1 `/jobs` |
| Decisions | DEC-M29-001 (barrier), DEC-M29-002 (integrity sample + dual-profile maintenance) |
| Gate | **`pnpm verify:m29`** |

## Exit

```bash
pnpm verify:m29
```

Confirm `docs/audits/M29-exit-criteria.json` → `m29HarnessComplete: true`.

## Forbidden shortcuts (verified by design)

- No `COMPLETED` without deliverables + cloud barrier
- Webhook/email failure does not roll back completion
- Presigned downloads only (no permanent public URLs)
- Provider adapters only for storage/transport mechanics
