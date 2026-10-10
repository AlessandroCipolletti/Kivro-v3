export type ScheduledTimingRecord = {
  createdAt: string;
  scheduledForEarliestAt: string | null;
  nextEligibleAt: string | null;
  eligibleAt: string | null;
  queuedAt: string | null;
  startedAt: string | null;
  deliveredAt: string | null;
};

/** §456 — the first promised window stays in the record when eligibility moves. */
export function scheduledJobTimingRecord(input: {
  createdAt: Date;
  scheduledForEarliestAt: Date | null;
  nextEligibleAt: Date | null;
  startedAt: Date | null;
  completedAt: Date | null;
  transitions: Array<{ toStatus: string; createdAt: Date }>;
}): ScheduledTimingRecord {
  const queued = input.transitions.find((row) => row.toStatus === "QUEUED");
  const eligible = input.transitions.find((row) => row.toStatus === "QUEUED" || row.toStatus === "DISPATCHED");
  return {
    createdAt: input.createdAt.toISOString(),
    scheduledForEarliestAt: input.scheduledForEarliestAt?.toISOString() ?? null,
    nextEligibleAt: input.nextEligibleAt?.toISOString() ?? null,
    eligibleAt: eligible?.createdAt.toISOString() ?? null,
    queuedAt: queued?.createdAt.toISOString() ?? null,
    startedAt: input.startedAt?.toISOString() ?? null,
    deliveredAt: input.completedAt?.toISOString() ?? null,
  };
}

export function applyEligibleTimeChange(
  record: Pick<ScheduledTimingRecord, "scheduledForEarliestAt" | "nextEligibleAt">,
  nextEligibleAt: string,
): Pick<ScheduledTimingRecord, "scheduledForEarliestAt" | "nextEligibleAt"> {
  return {
    scheduledForEarliestAt: record.scheduledForEarliestAt,
    nextEligibleAt,
  };
}

const MATERIAL_SHIFT_MS = 15 * 60_000;

export function scheduleChangeIsMaterial(previous: Date, next: Date): boolean {
  return Math.abs(next.getTime() - previous.getTime()) > MATERIAL_SHIFT_MS;
}

/** §483 — in-app updates for real schedule events, never a minute countdown. */
export function buyerScheduleNotice(
  event: "SCHEDULED" | "MATERIAL_CHANGE" | "STARTED" | "COMPLETED" | "EXPIRED" | "MINUTE_TICK",
): { channel: "IN_APP"; message: string } | null {
  switch (event) {
    case "MINUTE_TICK":
      return null;
    case "SCHEDULED":
      return { channel: "IN_APP", message: "Your job is reserved for the earliest eligible window." };
    case "MATERIAL_CHANGE":
      return { channel: "IN_APP", message: "The earliest eligible time for your job changed." };
    case "STARTED":
      return { channel: "IN_APP", message: "Your job has started." };
    case "COMPLETED":
      return { channel: "IN_APP", message: "Your job is complete." };
    case "EXPIRED":
      return { channel: "IN_APP", message: "Your reserved job expired and the reserved funds can be released." };
  }
}
