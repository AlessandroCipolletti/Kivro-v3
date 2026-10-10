import { assessOrchestrationPlanHardDeadline } from "@kivro/buyer-experience";
import type { BuyerConstraints } from "@kivro/marketplace";
import type { OrchestrationPlanDraft } from "./orchestration-planner.js";

/** §148 — code enforces budget; LLM never moves money. */
export function authorizePlanApproval(input: {
  plan: OrchestrationPlanDraft;
  constraints: BuyerConstraints;
  stepEstimatedDurationMinutes?: number[];
}): { ok: true } | { ok: false; code: "BUDGET_EXCEEDED" | "RATING_VIOLATION" | "EMPTY_PLAN" | "DEADLINE_INFEASIBLE" } {
  if (input.plan.steps.length === 0) {
    return { ok: false, code: "EMPTY_PLAN" };
  }
  const max =
    input.constraints.maxTotalSpendCents ??
    input.plan.maxBudgetCents ??
    input.constraints.maxPerJobSpendCents;
  if (max != null && input.plan.estimatedCostCents > max) {
    return { ok: false, code: "BUDGET_EXCEEDED" };
  }
  if (input.constraints.maxPerJobSpendCents != null) {
    for (const step of input.plan.steps) {
      if (step.estimatedPriceCents > input.constraints.maxPerJobSpendCents) {
        return { ok: false, code: "BUDGET_EXCEEDED" };
      }
    }
  }
  const deadlineIso =
    input.constraints.hardDeliveryDeadlineAt ?? input.plan.constraints.hardDeliveryDeadlineAt;
  if (deadlineIso) {
    const assessment = assessOrchestrationPlanHardDeadline({
      hardDeliveryDeadlineAt: new Date(deadlineIso),
      stepEstimatedDurationMinutes:
        input.stepEstimatedDurationMinutes ??
        input.plan.steps.map(() => 0),
    });
    if (!assessment.feasible) {
      return { ok: false, code: "DEADLINE_INFEASIBLE" };
    }
  }
  return { ok: true };
}

export function planStepEstimatedMinutes(
  steps: Array<{ capabilityId: string }>,
  listings: Array<{ id: string; estimatedDuration: number | null }>,
): number[] {
  return steps.map(
    (step) => listings.find((l) => l.id === step.capabilityId)?.estimatedDuration ?? 0,
  );
}
