import { describe, expect, it } from "vitest";
import { estimatePlanCompletionMinutes } from "./plan-completion.js";

describe("plan completion", () => {
  it("adds schedule wait and overlaps parallel steps", () => {
    const runtimeOnly = 20 + 30;
    const estimate = estimatePlanCompletionMinutes([
      { durationMinutes: 20, parallelGroup: "a" },
      { durationMinutes: 30, waitUntilEligibleMinutes: 120, parallelGroup: "a" },
      { durationMinutes: 10 },
    ]);
    expect(estimate.minMinutes).toBeGreaterThan(runtimeOnly);
    expect(estimate.minMinutes).toBe(160);
    expect(estimate.maxMinutes).toBeGreaterThan(estimate.minMinutes);
  });
});
