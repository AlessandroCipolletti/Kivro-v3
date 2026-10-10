import type { CapabilityListingRow } from "@kivro/marketplace";

export type OrchestrationListingRow = CapabilityListingRow & { currentVersionId: string };
import {
  extractConstraintsFromText,
  normalizeBuyerConstraints,
  type BuyerConstraints,
} from "@kivro/marketplace";
import { pickOrchestrationCapability } from "./capability-match.js";
import { validatePlanCompatibility, type IoKind, type PlanIoStep } from "./plan-compatibility.js";

export type PlannedStep = {
  clientStepKey: string;
  label: string;
  capabilityId: string;
  capabilitySlug: string;
  capabilityVersionId: string;
  estimatedPriceCents: number;
  dependsOnStepIds: string[];
  inputMappingJson?: Record<string, unknown>;
};

export type OrchestrationPlanDraft = {
  goal: string;
  constraints: BuyerConstraints;
  maxBudgetCents: number | null;
  estimatedCostCents: number;
  steps: PlannedStep[];
  notes: string[];
};

export function parseParallelResearchCount(goal: string): number {
  const lower = goal.toLowerCase();
  const wordMap: Record<string, number> = {
    two: 2,
    three: 3,
    four: 4,
    five: 5,
  };
  const wordMatch = lower.match(/\b(two|three|four|five)\s+competitors?\b/);
  if (wordMatch) {
    return wordMap[wordMatch[1]!] ?? 3;
  }
  const numMatch = lower.match(/\b(\d+)\s+competitors?\b/);
  if (numMatch) {
    return Math.min(5, Math.max(1, Number.parseInt(numMatch[1]!, 10)));
  }
  if (/\bcompetitors?\b/.test(lower)) {
    return 3;
  }
  return 0;
}

function stepIo(step: PlannedStep): PlanIoStep {
  let outputKind: IoKind = "text";
  let inputKind: IoKind | undefined;
  if (step.clientStepKey.startsWith("research")) {
    outputKind = "json";
  } else if (step.clientStepKey === "compare") {
    outputKind = "markdown";
    inputKind = "text";
  } else if (step.clientStepKey === "pdf") {
    outputKind = "pdf";
    inputKind = "markdown";
  }
  return {
    clientStepKey: step.clientStepKey,
    outputKind,
    inputKind,
    dependsOnStepIds: step.dependsOnStepIds,
  };
}

function priceCents(row: CapabilityListingRow): number {
  return row.priceTierCents ?? 0;
}

/** §136–§138 deterministic multi-step plan from marketplace listings only. */
export function buildOrchestrationPlanDraft(
  listings: OrchestrationListingRow[],
  goal: string,
  uiConstraints?: Partial<BuyerConstraints>,
): OrchestrationPlanDraft | { error: "NO_MATCHING_CAPABILITIES" | "BUDGET_TOO_LOW" } {
  const constraints = normalizeBuyerConstraints({
    ...extractConstraintsFromText(goal),
    ...uiConstraints,
  });
  const researchCount = parseParallelResearchCount(goal);
  const notes: string[] = [];
  const steps: PlannedStep[] = [];

  if (researchCount === 0) {
    return { error: "NO_MATCHING_CAPABILITIES" };
  }

  const researchCap = pickOrchestrationCapability(listings, "research", constraints, goal);
  if (!researchCap?.id) {
    return { error: "NO_MATCHING_CAPABILITIES" };
  }
  const researchVersionId = researchCap.currentVersionId;

  const researchStepIds: string[] = [];
  for (let i = 0; i < researchCount; i++) {
    const key = `research-${i + 1}`;
    researchStepIds.push(key);
    steps.push({
      clientStepKey: key,
      label: `Research competitor ${i + 1}`,
      capabilityId: researchCap.id,
      capabilitySlug: researchCap.slug,
      capabilityVersionId: researchVersionId,
      estimatedPriceCents: priceCents(researchCap),
      dependsOnStepIds: [],
      inputMappingJson: { agentGoalFragment: goal, slotIndex: i },
    });
  }

  let compareCap = pickOrchestrationCapability(listings, "compare", constraints, goal);
  if (!compareCap) {
    compareCap = researchCap;
    notes.push("No dedicated compare capability; reusing research provider for synthesis step.");
  }
  const compareVersionId = compareCap.currentVersionId;
  steps.push({
    clientStepKey: "compare",
    label: "Compare and synthesize",
    capabilityId: compareCap.id,
    capabilitySlug: compareCap.slug,
    capabilityVersionId: compareVersionId,
    estimatedPriceCents: priceCents(compareCap),
    dependsOnStepIds: [...researchStepIds],
    inputMappingJson: {
      sourceSteps: researchStepIds.map((id) => ({ sourceStepId: id, sourceOutput: "report" })),
    },
  });

  const pdfCap = pickOrchestrationCapability(listings, "pdf", constraints, goal);
  if (pdfCap) {
    if (pdfCap.currentVersionId) {
      steps.push({
        clientStepKey: "pdf",
        label: "Build PDF report",
        capabilityId: pdfCap.id,
        capabilitySlug: pdfCap.slug,
        capabilityVersionId: pdfCap.currentVersionId,
        estimatedPriceCents: priceCents(pdfCap),
        dependsOnStepIds: ["compare"],
        inputMappingJson: {
          sourceSteps: [{ sourceStepId: "compare", sourceOutput: "analysis" }],
        },
      });
    }
  } else {
    notes.push("No PDF capability on marketplace; plan ends after compare step.");
  }

  const incompatible = new Set(
    validatePlanCompatibility(steps.map(stepIo)).map((issue) => issue.split(":")[0] ?? ""),
  );
  const compatibleSteps = steps.filter((step) => !incompatible.has(step.clientStepKey));
  if (compatibleSteps.length !== steps.length) {
    notes.push("Dropped steps whose outputs cannot feed the next input without an unsupported conversion.");
  }

  const estimatedCostCents = compatibleSteps.reduce((sum, step) => sum + step.estimatedPriceCents, 0);
  const maxBudgetCents =
    constraints.maxTotalSpendCents ?? constraints.maxPerJobSpendCents ?? null;

  if (maxBudgetCents != null && estimatedCostCents > maxBudgetCents) {
    return { error: "BUDGET_TOO_LOW" };
  }

  for (const step of compatibleSteps) {
    const cap = listings.find((l) => l.id === step.capabilityId);
    if (constraints.maxPerJobSpendCents != null && step.estimatedPriceCents > constraints.maxPerJobSpendCents) {
      return { error: "BUDGET_TOO_LOW" };
    }
    if (constraints.minRating != null && cap?.rating != null && cap.rating < constraints.minRating) {
      return { error: "NO_MATCHING_CAPABILITIES" };
    }
  }

  return {
    goal: goal.trim(),
    constraints,
    maxBudgetCents,
    estimatedCostCents,
    steps: compatibleSteps,
    notes,
  };
}
