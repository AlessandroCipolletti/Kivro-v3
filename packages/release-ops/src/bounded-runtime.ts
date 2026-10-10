import type { PerformanceEnvelope } from "./performance-envelope.js";

/** M27 — shared runtime knobs must not exceed documented MVP envelope (unbounded retries forbidden). */

export function assertRuntimeWithinEnvelope(input: {
  envelope: PerformanceEnvelope;
  durableWorkMaxAttempts: number;
  durableWorkDefaultBatchLimit: number;
}): { ok: true } | { ok: false; reason: string } {
  const { envelope } = input;
  if (input.durableWorkMaxAttempts > envelope.shared.maxRetryAttemptsPerWorkItem) {
    return {
      ok: false,
      reason: `durableWorkMaxAttempts ${input.durableWorkMaxAttempts} exceeds envelope maxRetryAttemptsPerWorkItem`,
    };
  }
  for (const profile of ["netsons", "aws"] as const) {
    const batchCap = envelope.profiles[profile]?.maxDurableWorkBatchSize;
    if (batchCap == null) {
      return { ok: false, reason: `envelope missing profile ${profile}` };
    }
    if (input.durableWorkDefaultBatchLimit > batchCap) {
      return {
        ok: false,
        reason: `durableWorkDefaultBatchLimit ${input.durableWorkDefaultBatchLimit} exceeds ${profile} maxDurableWorkBatchSize`,
      };
    }
  }
  return { ok: true };
}
