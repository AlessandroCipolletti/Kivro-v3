import type { CapabilityScheduleConfig } from "./weekly-schedule.js";
import { isScheduleOpen } from "./weekly-schedule.js";

const SEARCH_HORIZON_MS = 8 * 24 * 60 * 60 * 1000;
const STEP_MS = 5 * 60 * 1000;

/** §405 — authoritative next open time from recurring weekly windows (not invented). */
export function computeNextAvailableAt(
  config: CapabilityScheduleConfig,
  from: Date = new Date(),
): Date | null {
  if (config.mode === "ALWAYS_AVAILABLE") {
    return from;
  }
  if (config.mode === "MANUALLY_PAUSED") {
    return null;
  }
  if (config.windows.length === 0) {
    return null;
  }
  if (isScheduleOpen(config, from)) {
    return from;
  }
  const deadline = from.getTime() + SEARCH_HORIZON_MS;
  for (let t = from.getTime() + STEP_MS; t <= deadline; t += STEP_MS) {
    const probe = new Date(t);
    if (isScheduleOpen(config, probe)) {
      return probe;
    }
  }
  return null;
}
