# M15 — milestone closure (full perimeter)

Observability, deterministic abuse, failure ops, privacy/legal, testing strategy, and result safety for Master Spec §29–§38 and §84–§95 evidence.

## Shipped

- **§29** — `buildJobAuditSummary`, checkpoint → sanitized `AuditEvent`, buyer job audit block in UI
- **§30** — `@kivro/abuse-controls` (denylist, hourly job frequency, reports, auto-pause, user suspend); admin triage routes; report UI
- **§31** — `result-safety` (text/URL/filename); safe download filenames
- **§33** — native plugin gate on discovery/consent
- **§35** — cloud + worker fleet metrics (`/platform/admin/metrics/*`)
- **§36** — lost-worker sweep in cron bundle (`promote-scheduled`) + dedicated admin sweep
- **§37** — privacy disclosure + `externalProcessors`; legal pages; terms acceptance gate on paid submit
- **§34/§38** — `docs/TESTING-STRATEGY.md`, `docs/security/RED-TEAM-CHECKLIST.md`, `docs/legal/ALPHA-NOTICE.md`
- Migration `m15_abuse_ops`; gate `pnpm verify:m15`

## Explicitly post-MVP (Master Spec)

- ML **anomaly detection** (§30 “later”)
- **External red-team / pen test execution** (§34.4 — checklist only)
- **Verified Hosted** privacy tier (§37 future)

## Gate

```bash
pnpm db:setup
pnpm verify:m15
```
