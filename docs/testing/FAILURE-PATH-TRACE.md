# Complete failure-path sequence (Master Spec §89)

Example: OpenClaw fails after Worker accept.

Verified artifact: `tests/fixtures/failure-path-trace.json`.

| Stage | Implementation |
|-------|----------------|
| Sanitized worker failure | `@kivro/job-failure` invariants, worker job routes |
| Idempotent cloud transition | Job state machine, dispatch reconciliation (M06/M07) |
| Financial release | `@kivro/billing` reservation release (M08 verify) |
| Buyer-safe error | Web job status + no secret leakage (M15 result-safety) |
| Audit retained | Checkpoints → audit summary (M15) |

No manual DB edits required for normal failure paths — enforced by idempotent services and sweeps (`promote-scheduled` bundle includes lost-worker sweep).
