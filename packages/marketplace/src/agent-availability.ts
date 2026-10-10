import type { CapabilityListingRow } from "./capability-listing.js";

export type AgentAvailabilityDocument = {
  capabilityId: string;
  priceMinor: number | null;
  availability: {
    status: string;
    acceptingImmediateJobs: boolean;
    estimatedQueueWaitSeconds: number;
    nextEligibleAt: string | null;
  };
};

const DEFAULT_MAX_QUEUE_WAIT_SECONDS = 5 * 60;

/** §503 — structured timing. Descriptive text is not an input. */
export function toAgentAvailability(
  row: Pick<CapabilityListingRow, "id" | "priceTierCents" | "availabilityStatus" | "accepting" | "nextAvailableAt"> & {
    estimatedQueueWaitSeconds?: number | null;
  },
): AgentAvailabilityDocument {
  return {
    capabilityId: row.id,
    priceMinor: row.priceTierCents,
    availability: {
      status: row.availabilityStatus ?? "UNKNOWN_AVAILABILITY",
      acceptingImmediateJobs: row.availabilityStatus === "ONLINE" && row.accepting === true,
      estimatedQueueWaitSeconds: Math.max(0, row.estimatedQueueWaitSeconds ?? 0),
      nextEligibleAt: row.nextAvailableAt ?? null,
    },
  };
}

/** §496–§497 — a short queue can count as immediate. An hours-long wait cannot. */
export function queueWaitFitsImmediatePolicy(
  estimatedQueueWaitSeconds: number | null | undefined,
  maxQueueWaitSeconds = DEFAULT_MAX_QUEUE_WAIT_SECONDS,
): boolean {
  if (estimatedQueueWaitSeconds == null) {
    return false;
  }
  return estimatedQueueWaitSeconds >= 0 && estimatedQueueWaitSeconds <= maxQueueWaitSeconds;
}

/** §507 — autonomous execution prefers a slightly lower rating that can run now. */
export function preferImmediateCandidate<T extends { rating?: number | null; availabilityStatus?: string | null; accepting?: boolean }>(
  rows: T[],
): T | null {
  const now = rows.filter((row) => row.availabilityStatus === "ONLINE" && row.accepting === true);
  if (now.length === 0) {
    return null;
  }
  return [...now].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))[0] ?? null;
}

/** §508 — no silent schedule when nothing can run now. */
export function noImmediateServiceMessage(best: {
  name: string;
  nextAvailableAt: string | null;
  priceCents: number | null;
} | null): string {
  if (!best) {
    return "I couldn't find a suitable service that can run now.";
  }
  const price = best.priceCents == null ? "an unpublished price" : `$${(best.priceCents / 100).toFixed(2)}`;
  const when = best.nextAvailableAt ? `becomes available at ${best.nextAvailableAt}` : "has no published next window";
  return `I couldn't find a suitable service that can run now. The best matching option ${when} and costs ${price}.`;
}
