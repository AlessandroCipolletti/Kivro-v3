import { describe, expect, it } from "vitest";
import { resolveBuyerSchedulingPhase } from "./buyer-job-scheduling-view.js";

describe("buyer scheduling phase §464", () => {
  it("future scheduled job", () => {
    const phase = resolveBuyerSchedulingPhase({
      status: "SCHEDULED",
      scheduledRunAt: new Date(Date.now() + 60_000),
    });
    expect(phase).toBe("SCHEDULED_FUTURE");
  });

  it("waiting for availability after run-at passed", () => {
    const phase = resolveBuyerSchedulingPhase({
      status: "SCHEDULED",
      scheduledRunAt: new Date(Date.now() - 60_000),
    });
    expect(phase).toBe("WAITING_FOR_AVAILABILITY");
  });

  it("queued is immediate queue wait", () => {
    expect(
      resolveBuyerSchedulingPhase({ status: "QUEUED", scheduledRunAt: null }),
    ).toBe("IMMEDIATE_QUEUE");
  });
});
