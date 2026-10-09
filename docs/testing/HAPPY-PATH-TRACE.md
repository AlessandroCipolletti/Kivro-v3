# Complete happy-path sequence (Master Spec §88)

Machine-verified map: `tests/fixtures/happy-path-trace.json` (`node scripts/verify-happy-path-trace.mjs`).

| Phase | Steps | Primary evidence |
|-------|-------|------------------|
| Seller setup | Worker pair, OpenClaw discovery, consent, publish | M02–M05 verify scripts, `seller-capabilities.ts`, `openclaw-adapter` |
| Buyer purchase | Account, credits, structured submit | M08/M10, `buyer-jobs-submit.ts`, `job-io` |
| Cloud orchestration | Reserve, dispatch, deliver, settle | M06/M08, `job-dispatch`, `billing` |
| Worker execution | Accept, sandbox, outputs | M04/M05, `worker-jobs.ts`, `sandbox` |
| Buyer completion | Results, downloads, audit | M10/M15, web job detail, `job-audit-summary` |

Full staging run with real OpenClaw + Stripe test mode: `docs/testing/PRODUCT-RELEASE-GATE.md` (§92). Automated local command: `pnpm test:e2e:local` (composed gates today; full §573 path in M18).
