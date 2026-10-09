import { describe, expect, it } from "vitest";
import { assertJobTransition } from "@kivro/domain";
import { evaluateAcceptingNewJobs } from "@kivro/job-scheduling";

describe("M09 acceptance", () => {
  it("scheduled job lifecycle transitions", () => {
    assertJobTransition("PAYMENT_RESERVED", "SCHEDULED");
    assertJobTransition("SCHEDULED", "QUEUED");
  });

  it("global dispatch kill switch blocks acceptance", () => {
    const result = evaluateAcceptingNewJobs({
      capabilityPublished: true,
      schedule: { mode: "ALWAYS_AVAILABLE", timezone: "UTC", windows: [] },
      workerDeviceStatus: "ONLINE",
      hasActiveJobOnWorker: false,
      globalDispatchEnabled: false,
    });
    expect(result.accepting).toBe(false);
    expect(result.reasons).toContain("GLOBAL_DISPATCH_DISABLED");
  });
});
