import { describe, expect, it } from "vitest";
import { authorizePlanApproval } from "./purchase-authorization.js";
import type { OrchestrationPlanDraft } from "./orchestration-planner.js";

describe("authorizePlanApproval (BUYERUX-006)", () => {
  const basePlan: OrchestrationPlanDraft = {
    goal: "test",
    constraints: {},
    maxBudgetCents: 5000,
    estimatedCostCents: 1000,
    steps: [
      {
        clientStepKey: "a",
        label: "Step",
        capabilityId: "c1",
        capabilitySlug: "s",
        capabilityVersionId: "v1",
        estimatedPriceCents: 1000,
        dependsOnStepIds: [],
      },
    ],
    notes: [],
  };

  it("rejects plan that cannot meet hard deadline", () => {
    const deadline = new Date(Date.now() + 30 * 60_000).toISOString();
    const authz = authorizePlanApproval({
      plan: basePlan,
      constraints: { hardDeliveryDeadlineAt: deadline },
      stepEstimatedDurationMinutes: [120],
    });
    expect(authz.ok).toBe(false);
    if (!authz.ok) {
      expect(authz.code).toBe("DEADLINE_INFEASIBLE");
    }
  });
});
