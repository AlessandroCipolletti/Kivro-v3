/** BUYERUX-011/012 — honest ETA ranges; never fabricate certainty. */
export type BuyerTimingEstimate = {
  confidence: "unknown" | "low" | "medium";
  startEarliestAt: string | null;
  startLatestAt: string | null;
  completeEarliestAt: string | null;
  completeLatestAt: string | null;
  disclaimer: string;
};

export function estimateBuyerJobTiming(input: {
  status: string;
  scheduledRunAt?: Date | null;
  scheduleWaitDeadlineAt?: Date | null;
  startedAt?: Date | null;
  estimatedDurationMinutes?: number | null;
  sampleCompletedCount?: number;
  now?: Date;
}): BuyerTimingEstimate {
  const now = input.now ?? new Date();
  const disclaimer =
    "Estimates are not guaranteed. Timing depends on seller availability and job complexity.";
  const estMinutes = input.estimatedDurationMinutes;
  const hasHistory = (input.sampleCompletedCount ?? 0) >= 5 && estMinutes != null && estMinutes > 0;

  if (input.startedAt) {
    if (!hasHistory) {
      return {
        confidence: "unknown",
        startEarliestAt: input.startedAt.toISOString(),
        startLatestAt: input.startedAt.toISOString(),
        completeEarliestAt: null,
        completeLatestAt: null,
        disclaimer,
      };
    }
    const end = new Date(input.startedAt.getTime() + estMinutes! * 60_000);
    const slack = estMinutes! * 0.25 * 60_000;
    return {
      confidence: "low",
      startEarliestAt: input.startedAt.toISOString(),
      startLatestAt: input.startedAt.toISOString(),
      completeEarliestAt: end.toISOString(),
      completeLatestAt: new Date(end.getTime() + slack).toISOString(),
      disclaimer,
    };
  }

  if (input.status === "SCHEDULED" && input.scheduledRunAt) {
    const start = input.scheduledRunAt.getTime() > now.getTime() ? input.scheduledRunAt : now;
    if (!hasHistory) {
      return {
        confidence: "unknown",
        startEarliestAt: start.toISOString(),
        startLatestAt: input.scheduleWaitDeadlineAt?.toISOString() ?? null,
        completeEarliestAt: null,
        completeLatestAt: null,
        disclaimer,
      };
    }
    const complete = new Date(start.getTime() + estMinutes! * 60_000);
    return {
      confidence: "low",
      startEarliestAt: start.toISOString(),
      startLatestAt: input.scheduleWaitDeadlineAt?.toISOString() ?? null,
      completeEarliestAt: complete.toISOString(),
      completeLatestAt: new Date(complete.getTime() + estMinutes! * 0.3 * 60_000).toISOString(),
      disclaimer,
    };
  }

  return {
    confidence: "unknown",
    startEarliestAt: null,
    startLatestAt: null,
    completeEarliestAt: null,
    completeLatestAt: null,
    disclaimer,
  };
}
