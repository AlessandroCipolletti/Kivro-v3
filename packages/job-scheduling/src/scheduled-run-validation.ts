import type { CapabilityScheduleConfig } from "./weekly-schedule.js";
import { isScheduleOpen } from "./weekly-schedule.js";
import { computeNextAvailableAt } from "./next-available.js";

/** Future reservations must target an open execution window (§409/§462). */
export function validateScheduledRunAt(
  config: CapabilityScheduleConfig,
  scheduledRunAt: Date,
  now: Date = new Date(),
): { ok: true } | { error: string; nextAvailableAt?: string } {
  if (scheduledRunAt.getTime() <= now.getTime()) {
    return { error: "INVALID_SCHEDULE_TIME" };
  }
  if (config.mode === "MANUALLY_PAUSED") {
    return { error: "CAPABILITY_PAUSED" };
  }
  if (!isScheduleOpen(config, scheduledRunAt)) {
    const next = computeNextAvailableAt(config, now);
    return {
      error: "SCHEDULED_TIME_OUTSIDE_WINDOW",
      nextAvailableAt: next?.toISOString(),
    };
  }
  return { ok: true };
}
