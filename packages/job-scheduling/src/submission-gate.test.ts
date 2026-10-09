import { describe, expect, it } from "vitest";
import { evaluateAcceptingNewJobs } from "./accepting-jobs.js";

describe("submission gate semantics §406", () => {
  it("maps schedule closed to scheduled offline class", () => {
    const evaluation = evaluateAcceptingNewJobs({
      capabilityPublished: true,
      schedule: {
        mode: "CUSTOM_SCHEDULE",
        timezone: "UTC",
        windows: [{ dayOfWeek: 0, startMinutes: 0, endMinutes: 60 }],
      },
      workerDeviceStatus: "ONLINE",
      hasActiveJobOnWorker: false,
      globalDispatchEnabled: true,
      now: new Date("2026-03-09T12:00:00.000Z"),
    });
    expect(evaluation.accepting).toBe(false);
    expect(evaluation.reasons).toContain("SCHEDULE_CLOSED");
    expect(evaluation.buyerAvailability).toBe("SCHEDULED_OFFLINE");
  });
});
