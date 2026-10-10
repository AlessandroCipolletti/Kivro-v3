# M30 manual validation

1. Run `pnpm verify:m30`.
2. On capability run page: request quote, set optional delivery deadline, purchase with `executionQuoteId`.
3. Cancel a scheduled job before start; confirm status `CANCELLED`.
4. Open job detail: timing estimate shows unknown/low confidence copy (no fake SLA).
5. Dashboard `/buyer/experience/dashboard` reflects queued/running counts.
6. Capability detail shows manifest-based privacy disclosure and reliability snapshot.
7. Settings → Notifications: toggle scheduled reminders and save.
8. Job list rows include `needsAttention` / `legalActions` when applicable.
