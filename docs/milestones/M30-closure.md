# M30 closure — buyer predictability, control & trust

## Goal

Shared preflight, quote, deadlines, cancel, ETA/progress honesty, reliability, privacy disclosure, and buyer dashboard — identical on Netsons and AWS.

## Deliverables

| Area | Evidence |
|------|----------|
| Preflight + quote | `@kivro/buyer-experience` `execution-preflight.ts`, `execution-quote.ts` |
| Purchase revalidation | `validateExecutionQuoteAtPurchase` in `job-payment.ts` |
| Deadlines + expiry sweep | `buyerHardDeadlineAt`, `hard-deadline-sweep.ts`, maintenance |
| Cancel atomicity | `buyer-scheduled-cancel.ts` + test |
| Job detail enrichment | ETA, progress, legal actions, missed window in `buyer-job-detail.ts` |
| API | `/buyer/experience/*`, capability reliability + manifest privacy |
| Worker minimization | `buildMinimizedWorkerExecutionBundle` |
| Notification prefs | User fields + terminal email gate |
| Golden | `BUYERUX-GOLD-001..006`, `011..013`, `016..018` |
| v1 + agent parity | quote/preflight on `/v1`; agent `DEADLINE_INFEASIBLE` gate |
| Spotcheck | `M30-spotcheck.json` |
| Gate | **`pnpm verify:m30`** |

## Exit

```bash
pnpm verify:m30
```

Confirm `docs/audits/M30-exit-criteria.json` → `m30HarnessComplete: true`.
