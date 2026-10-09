import { describe, expect, it } from "vitest";
import { buildOrchestrationPlanDraft, parseParallelResearchCount } from "./orchestration-planner.js";
import type { OrchestrationListingRow } from "./orchestration-planner.js";

const listings: OrchestrationListingRow[] = [
  {
    id: "cap-research",
    slug: "company-research",
    name: "Company Intelligence Pro",
    description: "Competitor and funding research",
    category: "research",
    priceTierCents: 240,
    currency: "USD",
    rating: 4.9,
    jobCount: 100,
    estimatedDuration: 60,
    sellerDisplayName: "Seller A",
    currentVersionId: "ver-research",
  },
  {
    id: "cap-compare",
    slug: "compare-report",
    name: "Strategy Compare",
    description: "Compare competitors analysis",
    category: "analysis",
    priceTierCents: 300,
    currency: "USD",
    rating: 4.8,
    jobCount: 50,
    estimatedDuration: 90,
    sellerDisplayName: "Seller B",
    currentVersionId: "ver-compare",
  },
  {
    id: "cap-pdf",
    slug: "pdf-builder",
    name: "PDF Report Builder",
    description: "Export polished PDF document",
    category: "documents",
    priceTierCents: 200,
    currency: "USD",
    rating: 4.7,
    jobCount: 40,
    estimatedDuration: 45,
    sellerDisplayName: "Seller C",
    currentVersionId: "ver-pdf",
  },
];

describe("parseParallelResearchCount", () => {
  it("reads three competitors", () => {
    expect(parseParallelResearchCount("Analyze three competitors and PDF")).toBe(3);
  });
});

describe("buildOrchestrationPlanDraft", () => {
  it("builds DAG within budget", () => {
    const draft = buildOrchestrationPlanDraft(
      listings,
      "Research three competitors and create a PDF. Max $15. Rating 4.5.",
      { maxTotalSpendCents: 1500, minRating: 4.5 },
    );
    expect("steps" in draft).toBe(true);
    if (!("steps" in draft)) {
      return;
    }
    expect(draft.steps.length).toBe(5);
    expect(draft.estimatedCostCents).toBeLessThanOrEqual(1500);
    const compare = draft.steps.find((s) => s.clientStepKey === "compare");
    expect(compare?.dependsOnStepIds).toHaveLength(3);
  });

  it("rejects over budget", () => {
    const result = buildOrchestrationPlanDraft(listings, "three competitors pdf", {
      maxTotalSpendCents: 100,
    });
    expect(result).toEqual({ error: "BUDGET_TOO_LOW" });
  });
});
