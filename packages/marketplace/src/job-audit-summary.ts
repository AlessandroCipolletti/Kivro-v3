/** §29 — seller/buyer-visible job audit summary without secrets or raw buyer payloads. */

export type JobAuditSummary = {
  jobLabel: string;
  runtimeSeconds: number | null;
  soldForCents: number;
  currency: string;
  sellerNetCents: number | null;
  platformFeeCents: number | null;
  estimatedProviderCostCents: number | null;
  lines: string[];
};

export function buildJobAuditSummary(input: {
  jobId: string;
  startedAt: Date | null;
  completedAt: Date | null;
  priceSnapshotCents: number;
  currency: string;
  sellerNetSnapshotCents: number | null;
  platformFeeSnapshotCents: number | null;
  providerCostEstimateCents?: number | null;
  timeline: Array<{ at: string; label: string; detail?: string }>;
}): JobAuditSummary {
  const shortId = input.jobId.slice(0, 8);
  const runtimeSeconds =
    input.startedAt && input.completedAt
      ? Math.max(0, Math.round((input.completedAt.getTime() - input.startedAt.getTime()) / 1000))
      : null;
  const lines: string[] = [`Job #${shortId}`];
  for (const entry of input.timeline) {
    const time = entry.at.slice(11, 19);
    lines.push(`${time} ${entry.label}${entry.detail ? ` — ${entry.detail}` : ""}`);
  }
  if (runtimeSeconds != null) {
    lines.push(`Runtime: ${runtimeSeconds}s`);
  }
  const provider = input.providerCostEstimateCents ?? null;
  if (provider != null) {
    lines.push(`Estimated provider cost: $${(provider / 100).toFixed(2)}`);
  }
  lines.push(`Sold for: $${(input.priceSnapshotCents / 100).toFixed(2)}`);
  if (input.sellerNetSnapshotCents != null) {
    lines.push(`Seller earning: $${(input.sellerNetSnapshotCents / 100).toFixed(2)}`);
  }
  return {
    jobLabel: `#${shortId}`,
    runtimeSeconds,
    soldForCents: input.priceSnapshotCents,
    currency: input.currency,
    sellerNetCents: input.sellerNetSnapshotCents,
    platformFeeCents: input.platformFeeSnapshotCents,
    estimatedProviderCostCents: provider,
    lines,
  };
}
