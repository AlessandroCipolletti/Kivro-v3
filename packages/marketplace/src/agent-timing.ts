import type { CapabilityListingRow } from "./capability-listing.js";

/** §488–§516 — deterministic timing. The model cannot override this filter. */
export type AgentTimingMode = "IMMEDIATE" | "DEADLINE" | "EARLIEST_AVAILABLE_ALLOWED";

export type AgentTimingSnapshot = {
  availabilityStatus: string | null;
  accepting: boolean;
  nextAvailableAt: string | null;
  estimatedDurationSeconds: number | null;
};

type TimingRow = Pick<
  CapabilityListingRow,
  "availabilityStatus" | "accepting" | "nextAvailableAt" | "estimatedDuration"
> & { estimatedQueueWaitSeconds?: number | null };

export function agentTimingSnapshot(row: TimingRow): AgentTimingSnapshot {
  return {
    availabilityStatus: row.availabilityStatus ?? null,
    accepting: row.accepting === true,
    nextAvailableAt: row.nextAvailableAt ?? null,
    estimatedDurationSeconds: row.estimatedDuration ?? null,
  };
}

/**
 * IMMEDIATE: only a capability that is online and accepting now.
 * DEADLINE: immediate runs, or a future window whose start plus estimated
 * duration finishes at or before the buyer's deadline.
 */
export function capabilityFitsAgentTiming(
  row: TimingRow,
  mode: AgentTimingMode,
  nowMs: number,
  deadlineMs?: number,
): boolean {
  const runnableNow = row.availabilityStatus === "ONLINE" && row.accepting === true;
  const shortQueue =
    row.availabilityStatus === "BUSY" &&
    row.accepting === true &&
    row.estimatedQueueWaitSeconds != null &&
    row.estimatedQueueWaitSeconds <= 5 * 60;
  if (mode === "IMMEDIATE") {
    return runnableNow || shortQueue;
  }
  if (mode === "EARLIEST_AVAILABLE_ALLOWED") {
    return runnableNow || shortQueue || Boolean(row.nextAvailableAt);
  }
  if (runnableNow) {
    return true;
  }
  if (deadlineMs == null || deadlineMs < nowMs || !row.nextAvailableAt) {
    return false;
  }
  const start = Date.parse(row.nextAvailableAt);
  if (!Number.isFinite(start) || start < nowMs) {
    return false;
  }
  const durationMs = Math.max(0, row.estimatedDuration ?? 0) * 1000;
  return start + durationMs <= deadlineMs;
}
