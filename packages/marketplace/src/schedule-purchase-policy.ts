/** §452–§453, §489 — buyer actions. A future job is never labeled as if it starts now. */
export type BuyerPurchaseAction = "RUN_NOW" | "SCHEDULE_EARLIEST" | "JOIN_QUEUE" | "UNAVAILABLE";

export function buyerPurchaseAction(input: {
  accepting: boolean;
  availabilityStatus?: string | null;
  nextAvailableAt?: string | null;
}): BuyerPurchaseAction {
  const status = input.availabilityStatus;
  if (status === "PAUSED" || status === "SECURITY_BLOCKED" || status === "OFFLINE") {
    return "UNAVAILABLE";
  }
  if (input.accepting && status !== "BUSY") {
    return "RUN_NOW";
  }
  if (status === "BUSY" && input.accepting) {
    return "JOIN_QUEUE";
  }
  if (status === "SCHEDULED_OFFLINE" && input.nextAvailableAt) {
    return "SCHEDULE_EARLIEST";
  }
  return "UNAVAILABLE";
}

export function buyerPurchaseActionLabel(action: BuyerPurchaseAction): string {
  switch (action) {
    case "RUN_NOW":
      return "Run now";
    case "SCHEDULE_EARLIEST":
      return "Schedule for earliest availability";
    case "JOIN_QUEUE":
      return "Join queue";
    case "UNAVAILABLE":
      return "Unavailable";
  }
}

export const SCHEDULED_RESERVATION_COPY =
  "You are reserving this job now. It will become eligible to execute at the earliest seller availability shown below.";

/** §420 — buyers see the next window, not the seller's weekly timetable. */
export function publicScheduleSummary(input: {
  availabilityStatus?: string | null;
  nextAvailableAt?: string | null;
  scheduleWindows?: unknown;
  publishServiceHours?: boolean;
}): { status: string | null; nextAvailableAt: string | null; serviceHours?: unknown } {
  const summary = {
    status: input.availabilityStatus ?? null,
    nextAvailableAt: input.nextAvailableAt ?? null,
  };
  if (!input.publishServiceHours) {
    return summary;
  }
  return { ...summary, serviceHours: input.scheduleWindows ?? null };
}

/** Human search keeps schedule-closed capabilities visible. */
export function humanSearchKeepsScheduledListing(availabilityStatus: string | null | undefined): boolean {
  return availabilityStatus !== "PRIVATE";
}
