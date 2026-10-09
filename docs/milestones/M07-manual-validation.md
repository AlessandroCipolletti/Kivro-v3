# M07 — Job execution, dispatch, recovery & per-job control

## Preconditions

- M06 research broker verified (`pnpm verify:m06`).
- Database migrated (`pnpm db:migrate`).
- API running on `http://localhost:3001`.

## Seller running jobs API (§436)

1. Authenticate as seller (verified email).
2. Open `GET /seller/jobs/control-ui` in the browser (same origin as API, session cookie).
3. `GET /seller/jobs/running` returns active jobs with pause support metadata and latest checkpoint stage.

## Per-job cancel (§450)

1. From control UI or `POST /seller/jobs/:jobId/cancel` while job is running/paused.
2. Job transitions to `CANCELLED` with audit event.

## Checkpoints (§435)

1. Worker posts `POST /worker/jobs/:jobId/checkpoints` with checkpoint JSON.
2. Seller `GET /seller/jobs/:jobId/checkpoints` lists durable steps.

## Per-job pause (§426–§428)

1. Seed or create a job in `RUNNING` assigned to seller's worker (dev fixtures).
2. `POST /seller/jobs/:jobId/pause` → status `PAUSE_REQUESTED`.
3. Worker `POST /worker/jobs/:jobId/pause-ack` with header `x-worker-device-id` → `PAUSED`.
4. Confirm UI-oriented fields: seller detail shows pause requested vs paused via `status`.

## Worker local pause (§430)

1. `kivro-worker job pause <job-id>` while cloud offline.
2. Local state file under runtime root shows `PAUSED` and `cloudSyncPending: true`.

## Buyer visibility (§437)

1. Buyer session: `GET /buyer/jobs/:jobId/status` shows sanitized paused copy (no seller internals).

## Dispatch & recovery (§9–§11)

1. Job in `QUEUED`: `POST /worker/jobs/:jobId/dispatch` with worker header → offer returned, job `DISPATCHED`.
2. `POST /worker/jobs/accept` → `ACCEPTED`; `POST /worker/jobs/:jobId/running` → `RUNNING`.
3. `POST /worker/jobs/:jobId/recover-offline` from `DISPATCHED` → re-queued.

## Automated gate

```bash
pnpm verify:m07
```
