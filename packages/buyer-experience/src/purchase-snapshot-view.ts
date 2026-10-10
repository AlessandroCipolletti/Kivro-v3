/** BUYERUX-024 — explain immutable purchase from job row snapshots (not live capability). */
export function buildPurchaseSnapshotView(job: {
  capabilityId: string;
  versionNumber: number;
  priceSnapshotCents: number;
  currency: string;
  platformFeeSnapshotCents: number | null;
  sellerNetSnapshotCents: number | null;
  permissionManifestSnapshot: unknown;
  inputContractSnapshot: unknown;
  outputContractSnapshot: unknown;
  scheduledRunAt: Date | null;
  buyerHardDeadlineAt: Date | null;
}): {
  capabilityId: string;
  versionNumber: number;
  priceSnapshotCents: number;
  currency: string;
  platformFeeSnapshotCents: number | null;
  sellerNetSnapshotCents: number | null;
  scheduledRunAt: string | null;
  buyerHardDeadlineAt: string | null;
  inputContract: unknown;
  outputContract: unknown;
  immutableNote: string;
} {
  return {
    capabilityId: job.capabilityId,
    versionNumber: job.versionNumber,
    priceSnapshotCents: job.priceSnapshotCents,
    currency: job.currency,
    platformFeeSnapshotCents: job.platformFeeSnapshotCents,
    sellerNetSnapshotCents: job.sellerNetSnapshotCents,
    scheduledRunAt: job.scheduledRunAt?.toISOString() ?? null,
    buyerHardDeadlineAt: job.buyerHardDeadlineAt?.toISOString() ?? null,
    inputContract: job.inputContractSnapshot,
    outputContract: job.outputContractSnapshot,
    immutableNote:
      "This purchase snapshot is frozen for this job. Seller catalog changes do not alter what you bought.",
  };
}
