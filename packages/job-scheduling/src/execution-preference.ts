/** §481 — explicit execution preference. Immediate failure happens before any charge. */
export type ExecutionPreferenceMode = "IMMEDIATE_ONLY" | "EARLIEST_AVAILABLE";

export function resolveExecutionPreference(input: {
  mode: ExecutionPreferenceMode;
  accepting: boolean;
  nextAvailableAt?: string | null;
}):
  | { ok: true; scheduledRunAt?: string }
  | { ok: false; error: "NOT_IMMEDIATELY_AVAILABLE" | "NO_FUTURE_WINDOW" } {
  if (input.mode === "IMMEDIATE_ONLY") {
    if (!input.accepting) {
      return { ok: false, error: "NOT_IMMEDIATELY_AVAILABLE" };
    }
    return { ok: true };
  }
  if (input.accepting) {
    return { ok: true };
  }
  if (!input.nextAvailableAt) {
    return { ok: false, error: "NO_FUTURE_WINDOW" };
  }
  return { ok: true, scheduledRunAt: input.nextAvailableAt };
}

/** §394 — a paused or closed window does not start a queued job. */
export function queuedJobMayStart(input: { paused: boolean; windowOpen: boolean }): boolean {
  return !input.paused && input.windowOpen;
}

/** §422 — buyers cannot change seller schedule, pause, or concurrency. */
const SCHEDULE_CONTROL_KEYS = [
  "scheduleMode",
  "scheduleWindows",
  "scheduleTimezone",
  "maxConcurrentJobs",
  "marketplaceEmergencyPause",
];

export function buyerInputAttemptsScheduleControl(input: Record<string, unknown>): boolean {
  return SCHEDULE_CONTROL_KEYS.some((key) => key in input);
}

/** §455 — scheduled delivery is measured from the execution window, not the reservation. */
export function deliveryMeasurementStart(input: { reservedAt: Date; scheduledRunAt?: Date | null }): Date {
  return input.scheduledRunAt ?? input.reservedAt;
}

/** §483 — in-app status only. No per-minute countdown. */
export function scheduledJobNotification(event: "RESERVED" | "WINDOW_OPEN" | "STARTED" | "MINUTE_TICK"): "IN_APP" | "NONE" {
  if (event === "MINUTE_TICK") {
    return "NONE";
  }
  return "IN_APP";
}
