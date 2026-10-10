# M29 manual validation

1. Run `pnpm verify:m29`.
2. With local stack: purchase a job, close browser, reopen My Jobs after completion — result retrievable (ASYNC-GOLD-001).
3. Optional overnight path: schedule a job for a future window, restart API, confirm job still queued and runs once (ASYNC-GOLD-002/003).
4. After completion, stop Worker — buyer can still download presigned assets (ASYNC-GOLD-004).
5. Confirm `GET /v1/jobs/:id` and `GET /v1/jobs/{id}/assets/{ref}/download` match session download semantics (ASYNC-GOLD-006).
6. Set `KIVRO_JOB_RESULT_RETENTION_DAYS` low in dev only; run maintenance/cron tick and confirm expired deliverables are purged (ASYNC-GOLD-007).
7. Inspect `M29-exit-criteria.json` for `m29HarnessComplete: true` (includes `dual-profile-maintenance`).
