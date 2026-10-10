import { describe, expect, it } from "vitest";
import {
  buyerInputAttemptsScheduleControl,
  deliveryMeasurementStart,
  queuedJobMayStart,
  resolveExecutionPreference,
  scheduledJobNotification,
} from "./execution-preference.js";

describe("execution preference", () => {
  it("fails immediate mode without a schedule and queues the authoritative window", () => {
    expect(
      resolveExecutionPreference({ mode: "IMMEDIATE_ONLY", accepting: false, nextAvailableAt: "2026-10-11T18:00:00.000Z" }),
    ).toEqual({ ok: false, error: "NOT_IMMEDIATELY_AVAILABLE" });
    expect(
      resolveExecutionPreference({
        mode: "EARLIEST_AVAILABLE",
        accepting: false,
        nextAvailableAt: "2026-10-11T18:00:00.000Z",
      }),
    ).toEqual({ ok: true, scheduledRunAt: "2026-10-11T18:00:00.000Z" });
  });

  it("blocks queued starts while paused and ignores buyer schedule edits", () => {
    expect(queuedJobMayStart({ paused: true, windowOpen: true })).toBe(false);
    expect(buyerInputAttemptsScheduleControl({ scheduleMode: "ALWAYS_AVAILABLE", question: "hello" })).toBe(true);
    expect(buyerInputAttemptsScheduleControl({ question: "enable the report" })).toBe(false);
  });

  it("measures scheduled delivery from the run time and skips countdown spam", () => {
    const reservedAt = new Date("2026-10-10T12:00:00.000Z");
    const scheduledRunAt = new Date("2026-10-11T18:00:00.000Z");
    expect(deliveryMeasurementStart({ reservedAt, scheduledRunAt })).toEqual(scheduledRunAt);
    expect(scheduledJobNotification("RESERVED")).toBe("IN_APP");
    expect(scheduledJobNotification("MINUTE_TICK")).toBe("NONE");
  });
});
