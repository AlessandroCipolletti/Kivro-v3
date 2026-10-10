# M31 closure — buyer history, reuse & rich results

## Scope

`BUYERUX-015..024`, `BUYERUX-032..034` with shared Core semantics (both deployment profiles).

## Deliverables

| Area | Evidence |
|------|----------|
| Reuse | `buildJobReuseSeed`, `validateBuyerSubmissionAssets`, run page prefill + assets in quote/submit |
| v1 parity | reuse, download-all, acknowledge, problem-report on `/v1/jobs/*` |
| Semantic results | `buildSemanticResultView`, `SemanticResultPanel` |
| Download all | `planSafeDownloadBundleEntries`, `buildResultZipBuffer`, session API |
| Snapshots | `buildSanitizedInputSnapshotView`, `buildPurchaseSnapshotView` on job detail |
| Retention UX | `describeResultRetentionUx`, retention email preference + sweep |
| Feedback | `JobResultAcknowledgement`, `JobDeliveryProblemReport`, UI forms |
| Golden | `BUYERUX-GOLD-007..010`, `014..015` |
| Gate | **`pnpm verify:m31`** |

```bash
pnpm verify:m31
```

## Manual validation

See [M31-manual-validation.md](./M31-manual-validation.md).
