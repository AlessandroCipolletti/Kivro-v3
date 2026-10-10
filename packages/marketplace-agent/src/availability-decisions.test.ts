import { describe, expect, it } from "vitest";
import {
  autonomousMayScheduleFuture,
  autonomousPlanIncludesFutureStep,
  orchestrationWaitState,
  singleCapabilityJobMayBeScheduled,
  availabilityInferredFromDescription,
  busyWaitFitsPolicy,
  defaultExecutionMode,
  estimateReadyAt,
  recommendationMayShowFutureOption,
  releaseIfNeverStarts,
  repairUnavailableStep,
} from "./availability-decisions.js";

describe("availability decisions", () => {
  it("defaults to immediate work and will not wait without approval", () => {
    expect(defaultExecutionMode()).toBe("IMMEDIATE_ONLY");
    expect(autonomousMayScheduleFuture({ userApprovedWait: false, completionFitsDeadline: true })).toBe(false);
    expect(autonomousMayScheduleFuture({ userApprovedWait: true, completionFitsDeadline: true })).toBe(true);
    expect(recommendationMayShowFutureOption()).toBe(true);
    expect(autonomousPlanIncludesFutureStep(false)).toBe(false);
    expect(singleCapabilityJobMayBeScheduled()).toBe(true);
    expect(
      orchestrationWaitState({
        stepAvailableNow: false,
        userApprovedWait: true,
        waitDeadlineAt: new Date("2026-10-12T00:00:00.000Z"),
      }),
    ).toBe("WAIT");
    expect(
      orchestrationWaitState({
        stepAvailableNow: false,
        userApprovedWait: true,
        waitDeadlineAt: null,
      }),
    ).toBe("BLOCKED");
    expect(availabilityInferredFromDescription("available now, runs instantly")).toBeNull();
  });

  it("repairs one step only inside budget and otherwise pauses", () => {
    expect(busyWaitFitsPolicy({ waitMs: 10 * 60_000, maxWaitMs: 30 * 60_000 })).toBe(true);
    expect(busyWaitFitsPolicy({ waitMs: 90 * 60_000, maxWaitMs: 30 * 60_000 })).toBe(false);
    expect(
      repairUnavailableStep({
        stepFits: false,
        alternativeFits: true,
        alternativeWithinBudget: false,
        permissionsPreserved: true,
      }),
    ).toBe("PAUSE");
    expect(
      repairUnavailableStep({
        stepFits: false,
        alternativeFits: true,
        alternativeWithinBudget: true,
        permissionsPreserved: true,
      }),
    ).toBe("REPLACE");
  });

  it("includes wait in the ready time and releases a job that never starts", () => {
    const start = new Date("2026-10-10T18:00:00.000Z");
    expect(estimateReadyAt({ startAt: start, durationMs: 20 * 60_000 }).toISOString()).toBe(
      "2026-10-10T18:20:00.000Z",
    );
    expect(releaseIfNeverStarts({ started: false, waitDeadlinePassed: true })).toBe("RELEASE");
    expect(releaseIfNeverStarts({ started: true, waitDeadlinePassed: true })).toBe("HOLD");
  });
});
