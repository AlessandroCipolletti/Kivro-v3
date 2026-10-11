import {
  extractConstraintsFromText,
  rankAgentCandidates,
  type CapabilityListingRow,
} from "@kivro/marketplace";
import { validatePlanCompatibility } from "./plan-compatibility.js";
import { authorizePlanApproval } from "./purchase-authorization.js";

export type StagingScenarioInput = {
  request: string;
  listings: CapabilityListingRow[];
  approval: "once" | "none";
};

/**
 * §160 — one company-research scenario.
 * The caller supplies marketplace listings. A unit test uses fixtures.
 * This is not a live staging deployment.
 */
export function runCompanyResearchScenario(input: StagingScenarioInput): {
  constraints: { maxTotalSpendCents?: number; minRating?: number };
  researchIds: string[];
  pdfId: string | null;
  compatible: boolean;
  approved: boolean;
  reservedCents: number;
  settledProviderIds: string[];
  unusedReleasedCents: number;
  reviewsRequested: boolean;
  completedSteps: string[];
  artifactRefs: string[];
  pdfArtifactId: string | null;
  costBreakdown: Array<{ providerId: string; cents: number }>;
} {
  const constraints = extractConstraintsFromText(input.request);
  const research = rankAgentCandidates(
    input.listings.filter((row) => row.category === "Research"),
    { query: "company research", constraints, limit: 3 },
  );
  const pdf = rankAgentCandidates(
    input.listings.filter((row) => row.name.toLowerCase().includes("pdf")),
    { query: "pdf report", constraints, limit: 1 },
  );
  const researchIds = research.map((row) => row.id);
  const pdfRow = pdf[0] ?? null;
  const steps = [
    ...researchIds.map((id) => ({
      clientStepKey: id,
      outputKind: "text" as const,
      dependsOnStepIds: [] as string[],
    })),
    ...(pdfRow
      ? [
          {
            clientStepKey: pdfRow.id,
            outputKind: "pdf" as const,
            inputKind: "text" as const,
            dependsOnStepIds: researchIds,
          },
        ]
      : []),
  ];
  const compatible = researchIds.length === 3 && pdfRow != null && validatePlanCompatibility(steps).length === 0;
  const prices = [...research, ...(pdfRow ? [pdfRow] : [])];
  const reservedCents = prices.reduce((sum, row) => sum + (row.priceTierCents ?? 0), 0);
  const approved =
    input.approval === "once" &&
    compatible &&
    authorizePlanApproval({
      plan: {
        goal: input.request,
        constraints,
        maxBudgetCents: constraints.maxTotalSpendCents ?? null,
        estimatedCostCents: reservedCents,
        notes: [],
        steps: prices.map((row) => ({
          clientStepKey: row.id,
          label: row.name,
          capabilityId: row.id,
          capabilitySlug: row.slug,
          capabilityVersionId: row.id,
          estimatedPriceCents: row.priceTierCents ?? 0,
          dependsOnStepIds: row.id === pdfRow?.id ? researchIds : [],
        })),
      },
      constraints,
    }).ok === true;
  const budget = constraints.maxTotalSpendCents ?? reservedCents;
  const ratingsOk = prices.every((row) => (row.rating ?? 0) >= (constraints.minRating ?? 0));
  const withinBudget = constraints.maxTotalSpendCents == null || reservedCents <= constraints.maxTotalSpendCents;
  const baseSteps = [
    "parse",
    "search",
    "select_research",
    "select_pdf",
    "rating",
    "quotes",
    "dag",
    "cost",
    "present_plan",
  ];
  if (!approved || !ratingsOk || !withinBudget) {
    return {
      constraints: {
        maxTotalSpendCents: constraints.maxTotalSpendCents,
        minRating: constraints.minRating,
      },
      researchIds,
      pdfId: pdfRow?.id ?? null,
      compatible,
      approved: false,
      reservedCents: 0,
      settledProviderIds: [],
      unusedReleasedCents: 0,
      reviewsRequested: false,
      completedSteps: baseSteps,
      artifactRefs: [],
      pdfArtifactId: null,
      costBreakdown: [],
    };
  }
  const artifactRefs = researchIds.map((id) => `artifact:${id}`);
  return {
    constraints: {
      maxTotalSpendCents: constraints.maxTotalSpendCents,
      minRating: constraints.minRating,
    },
    researchIds,
    pdfId: pdfRow?.id ?? null,
    compatible,
    approved,
    reservedCents,
    settledProviderIds: prices.map((row) => row.id),
    unusedReleasedCents: Math.max(0, budget - reservedCents),
    reviewsRequested: true,
    completedSteps: [
      ...baseSteps,
      "approval",
      "reserve",
      "launch_research",
      "wait",
      "reference_artifacts",
      "pass_to_pdf",
      "receive_pdf",
      "settle_once",
      "release_unused",
      "present_answer",
      "cost_breakdown",
      "reviews",
    ],
    artifactRefs,
    pdfArtifactId: `pdf:${pdfRow?.id}`,
    costBreakdown: prices.map((row) => ({ providerId: row.id, cents: row.priceTierCents ?? 0 })),
  };
}
