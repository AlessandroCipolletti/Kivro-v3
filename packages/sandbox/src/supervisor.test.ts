import { describe, expect, it } from "vitest";
import { JobProcessSupervisor } from "./supervisor.js";
describe("JobProcessSupervisor pause §431", () => {
  it("tracks pause and blocks provider calls", () => {
    const supervisor = new JobProcessSupervisor({
      startupTimeoutMs: 30_000,
      executionTimeoutMs: 120_000,
      uploadTimeoutMs: 60_000,
      absoluteDeadlineMs: 180_000,
    });
    supervisor.registerStart("job-1", "attempt-1", 1000);
    supervisor.requestPause("job-1", "attempt-1");
    expect(supervisor.blocksNewProviderCalls("job-1", "attempt-1")).toBe(true);
    supervisor.confirmPaused("job-1", "attempt-1");
    expect(supervisor.getAttempt("job-1", "attempt-1")?.state).toBe("paused");
    supervisor.resume("job-1", "attempt-1");
    expect(supervisor.blocksNewProviderCalls("job-1", "attempt-1")).toBe(false);
  });
});
