export type ScheduledDemandJob = {
  scheduledRunAt: Date | null;
  reservedAmountCents: number | null;
  sellerNetSnapshotCents: number | null;
  estimatedDurationMinutes: number | null;
};

export type ScheduledDemandWindow = {
  startsAt: string;
  jobCount: number;
  workloadMinutes: number;
  reservedBuyerValueCents: number;
  estimatedSellerEarningsCents: number;
};

/** §484 — reserved buyer value stays separate from settled revenue. */
export function summarizeScheduledDemand(jobs: ScheduledDemandJob[]): {
  windows: ScheduledDemandWindow[];
  jobCount: number;
  reservedBuyerValueCents: number;
  estimatedSellerEarningsCents: number;
  settledRevenueCents: 0;
  note: string;
} {
  const grouped = new Map<string, ScheduledDemandWindow>();
  for (const job of jobs) {
    if (!job.scheduledRunAt || Number.isNaN(job.scheduledRunAt.getTime())) {
      continue;
    }
    const hour = new Date(job.scheduledRunAt);
    hour.setUTCMinutes(0, 0, 0);
    const key = hour.toISOString();
    const window = grouped.get(key) ?? {
      startsAt: key,
      jobCount: 0,
      workloadMinutes: 0,
      reservedBuyerValueCents: 0,
      estimatedSellerEarningsCents: 0,
    };
    window.jobCount += 1;
    window.workloadMinutes += Math.max(0, job.estimatedDurationMinutes ?? 0);
    window.reservedBuyerValueCents += Math.max(0, job.reservedAmountCents ?? 0);
    window.estimatedSellerEarningsCents += Math.max(0, job.sellerNetSnapshotCents ?? 0);
    grouped.set(key, window);
  }
  const windows = [...grouped.values()].sort((a, b) => a.startsAt.localeCompare(b.startsAt));
  return {
    windows,
    jobCount: windows.reduce((sum, window) => sum + window.jobCount, 0),
    reservedBuyerValueCents: windows.reduce((sum, window) => sum + window.reservedBuyerValueCents, 0),
    estimatedSellerEarningsCents: windows.reduce(
      (sum, window) => sum + window.estimatedSellerEarningsCents,
      0,
    ),
    settledRevenueCents: 0,
    note: "Reserved buyer value is not settled revenue.",
  };
}

/** §485 — pause remains allowed, and the seller sees the waiting jobs first. */
export function scheduledPauseWarning(waitingJobCount: number): string | null {
  if (!Number.isFinite(waitingJobCount) || waitingJobCount <= 0) {
    return null;
  }
  const count = Math.floor(waitingJobCount);
  return `You have ${count} scheduled job${count === 1 ? "" : "s"} waiting for your next availability window. Pausing will prevent them from starting. Buyers may be refunded if the maximum waiting time is exceeded.`;
}
