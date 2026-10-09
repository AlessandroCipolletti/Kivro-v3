import { describe, expect, it } from "vitest";
import { evaluateAcceptingNewJobs } from "./accepting-jobs.js";

const openSchedule = {
  mode: "ALWAYS_AVAILABLE" as const,
  timezone: "UTC",
  windows: [],
};

describe("accepting jobs §402", () => {
  it("accepts when worker online and idle", () => {
    const result = evaluateAcceptingNewJobs({
      capabilityPublished: true,
      schedule: openSchedule,
      workerDeviceStatus: "ONLINE",
      hasActiveJobOnWorker: false,
      globalDispatchEnabled: true,
    });
    expect(result.accepting).toBe(true);
    expect(result.buyerAvailability).toBe("ONLINE");
  });

  it("rejects when worker busy", () => {
    const result = evaluateAcceptingNewJobs({
      capabilityPublished: true,
      schedule: openSchedule,
      workerDeviceStatus: "ONLINE",
      hasActiveJobOnWorker: true,
      globalDispatchEnabled: true,
    });
    expect(result.accepting).toBe(false);
    expect(result.buyerAvailability).toBe("BUSY");
    expect(result.reasons).toContain("WORKER_BUSY");
  });

  it("maps schedule closed to SCHEDULED_OFFLINE", () => {
    const result = evaluateAcceptingNewJobs({
      capabilityPublished: true,
      schedule: {
        mode: "CUSTOM_SCHEDULE",
        timezone: "UTC",
        windows: [{ dayOfWeek: 0, startMinutes: 0, endMinutes: 1 }],
      },
      workerDeviceStatus: "ONLINE",
      hasActiveJobOnWorker: false,
      globalDispatchEnabled: true,
      now: new Date("2026-03-09T12:00:00.000Z"),
    });
    expect(result.accepting).toBe(false);
    expect(result.buyerAvailability).toBe("SCHEDULED_OFFLINE");
  });
});
