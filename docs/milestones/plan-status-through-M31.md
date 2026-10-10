# Implementation plan status through M31

This checkpoint reflects `spec/IMPLEMENTATION-PLAN.md` sequencing, not full Master Spec closure.

## Milestone harness (automated)

| Range | Gate | Status |
|-------|------|--------|
| M03–M31 | `verify:mNN` scripts in root `package.json` | Present |
| M29 | `docs/audits/M29-exit-criteria.json` → `m29HarnessComplete` | Required by `verify:m31` |
| M30 | `docs/audits/M30-exit-criteria.json` → `m30HarnessComplete` | Required by `verify:m31` |
| M31 | `docs/audits/M31-exit-criteria.json` → `m31HarnessComplete` | **`pnpm verify:m31`** |

Generated snapshot: `docs/audits/plan-through-M31.json` (from `scripts/audit-plan-through-m31.mjs`).

## M31 product scope (plan)

| Area | Plan item | Repo evidence |
|------|-----------|---------------|
| Reuse | Run again / Duplicate & edit | `buildJobReuseSeed`, run page, v1 `/jobs/:id/reuse` |
| Assets | No silent expired reuse | `validateBuyerSubmissionAssets` at quote + submit |
| Results | Semantic manifest + safe preview | `buildSemanticResultView`, `SemanticResultPanel` |
| Download all | Bounded zip | `planSafeDownloadBundleEntries`, `buildResultZipBuffer` |
| History | Immutable input/purchase snapshots | `buildSanitizedInputSnapshotView`, `buildPurchaseSnapshotView` |
| Retention | UX + reminders | `describeResultRetentionUx`, `processDueResultRetentionReminders` |
| Feedback | Ack + problem report | `JobResultAcknowledgement`, `JobDeliveryProblemReport` |
| Golden | BUYERUX-GOLD-007..010, 014..015 | Golden registry + conformance tests |

## Not the same as “full spec done”

- **M23 / M28** track `productMasterSpecComplete`: many catalog rows remain `TODO` until later milestones (see `docs/audits/M28-open-requirements-catalog.json`).
- **M30–M31 exit** also call for manual UX screenshots / responsive review (`docs/milestones/M30-manual-validation.md`, `M31-manual-validation.md`) — not CI-automated.
- **M32+** (seller UX, multi-Worker) are intentionally after M31.
- **CAP-0052 Favorites** (§126) is not part of M31 scope; favorites exist elsewhere in the app but are not required on the job detail action row for M31 closure.

## Command

```bash
pnpm verify:m31
```
