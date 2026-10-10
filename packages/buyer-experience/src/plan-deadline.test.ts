import { describe, expect, it } from "vitest";
import { assessOrchestrationPlanHardDeadline } from "./plan-deadline.js";

describe("assessOrchestrationPlanHardDeadline", () => {
  it("rejects plan exceeding deadline", () => {
    const result = assessOrchestrationPlanHardDeadline({
      hardDeliveryDeadlineAt: new Date(Date.now() + 60_000),
      stepEstimatedDurationMinutes: [30, 30],
    });
    expect(result.feasible).toBe(false);
  });
});
