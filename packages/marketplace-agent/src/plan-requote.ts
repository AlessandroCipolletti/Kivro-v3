import type { OrchestrationListingRow } from "./orchestration-planner.js";
import type { PlannedStep } from "./orchestration-planner.js";

/** §142 — re-quote from current marketplace prices before approval. */
export function requotePlanSteps(
  steps: PlannedStep[],
  listings: OrchestrationListingRow[],
): { steps: PlannedStep[]; estimatedCostCents: number; priceChanged: boolean } {
  let priceChanged = false;
  let estimatedCostCents = 0;
  const updated = steps.map((step) => {
    const row = listings.find((l) => l.id === step.capabilityId);
    const current = row?.priceTierCents ?? step.estimatedPriceCents;
    if (current !== step.estimatedPriceCents) {
      priceChanged = true;
    }
    estimatedCostCents += current;
    return { ...step, estimatedPriceCents: current };
  });
  return { steps: updated, estimatedCostCents, priceChanged };
}
