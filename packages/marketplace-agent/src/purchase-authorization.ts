import type { BuyerConstraints } from "@kivro/marketplace";
import type { OrchestrationPlanDraft } from "./orchestration-planner.js";

/** §148 — code enforces budget; LLM never moves money. */
export function authorizePlanApproval(input: {
  plan: OrchestrationPlanDraft;
  constraints: BuyerConstraints;
}): { ok: true } | { ok: false; code: "BUDGET_EXCEEDED" | "RATING_VIOLATION" | "EMPTY_PLAN" } {
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
  return { ok: true };
}
