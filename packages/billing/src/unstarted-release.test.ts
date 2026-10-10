import { describe, expect, it } from "vitest";
import { shouldReleaseUnstartedReservation } from "./job-payment-hooks.js";

describe("unstarted reservation", () => {
  it("releases a scheduled job after the wait deadline and keeps one that started", () => {
    const now = new Date("2026-10-13T00:00:00.000Z");
    expect(
      shouldReleaseUnstartedReservation({
        status: "SCHEDULED",
        scheduleWaitDeadlineAt: new Date("2026-10-12T00:00:00.000Z"),
        now,
      }),
    ).toBe(true);
    expect(
      shouldReleaseUnstartedReservation({
        status: "RUNNING",
        scheduleWaitDeadlineAt: new Date("2026-10-12T00:00:00.000Z"),
        now,
      }),
    ).toBe(false);
  });
});
