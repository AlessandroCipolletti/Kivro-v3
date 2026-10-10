import { capabilityFitsAgentTiming, type AgentTimingMode } from "@kivro/marketplace";

type TimedRow = {
  priceTierCents: number | null;
  availabilityStatus?: string;
  accepting?: boolean;
  nextAvailableAt?: string | null;
  estimatedDuration?: number | null;
};

function asTiming(row: TimedRow) {
  return {
    availabilityStatus: row.availabilityStatus,
    accepting: row.accepting,
    nextAvailableAt: row.nextAvailableAt,
    estimatedDuration: row.estimatedDuration ?? null,
  };
}

/** §498 — drop the unavailable candidate and keep evaluating. */
export function continueImmediateSearch<T extends TimedRow>(rows: T[], nowMs: number): { candidates: T[]; exhausted: boolean } {
  const candidates = rows.filter((row) =>
    capabilityFitsAgentTiming(asTiming(row), "IMMEDIATE", nowMs),
  );
  return { candidates, exhausted: candidates.length === 0 };
}

/** §510 — immediacy cannot raise price, drop a permission, or skip I/O compatibility. */
export function maySwapForImmediacy(input: {
  alternativePriceCents: number;
  budgetCents: number;
  permissionsPreserved: boolean;
  ioCompatible: boolean;
}): boolean {
  return (
    input.alternativePriceCents <= input.budgetCents &&
    input.permissionsPreserved &&
    input.ioCompatible
  );
}

/** §499 — every step must fit the same timing mode. */
export function planStepsFitTiming(
  steps: TimedRow[],
  mode: AgentTimingMode,
  nowMs: number,
  deadlineMs?: number,
): boolean {
  return steps.every((step) => capabilityFitsAgentTiming(asTiming(step), mode, nowMs, deadlineMs));
}
