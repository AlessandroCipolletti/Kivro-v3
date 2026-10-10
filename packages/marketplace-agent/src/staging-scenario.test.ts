import { describe, expect, it } from "vitest";
import type { CapabilityListingRow } from "@kivro/marketplace";
import { runCompanyResearchScenario } from "./staging-scenario.js";

const request = `Research three companies and produce one PDF report.
Maximum budget: $15.
Minimum provider rating: 4.5.`;

function listing(input: Partial<CapabilityListingRow> & Pick<CapabilityListingRow, "id" | "name" | "category" | "priceTierCents" | "rating">): CapabilityListingRow {
  return {
    slug: input.id,
    description: input.name,
    currency: "USD",
    jobCount: 20,
    estimatedDuration: 30,
    sellerDisplayName: input.id,
    ...input,
  };
}

const listings = [
  listing({ id: "r1", name: "Company research A", category: "Research", priceTierCents: 400, rating: 4.8 }),
  listing({ id: "r2", name: "Company research B", category: "Research", priceTierCents: 400, rating: 4.7 }),
  listing({ id: "r3", name: "Company research C", category: "Research", priceTierCents: 400, rating: 4.6 }),
  listing({ id: "low", name: "Company research cheap", category: "Research", priceTierCents: 100, rating: 4.0 }),
  listing({ id: "pdf", name: "PDF report", category: "Documents", priceTierCents: 200, rating: 4.9 }),
];

describe("company research scenario", () => {
  it("selects three compatible providers and a PDF inside the budget", () => {
    const result = runCompanyResearchScenario({ request, listings, approval: "once" });
    expect(result.constraints).toEqual({ maxTotalSpendCents: 1500, minRating: 4.5 });
    expect(result.researchIds).toEqual(["r1", "r2", "r3"]);
    expect(result.pdfId).toBe("pdf");
    expect(result.compatible).toBe(true);
    expect(result.approved).toBe(true);
    expect(result.reservedCents).toBe(1400);
    expect(result.settledProviderIds).toEqual(["r1", "r2", "r3", "pdf"]);
    expect(new Set(result.settledProviderIds).size).toBe(4);
    expect(result.unusedReleasedCents).toBe(100);
    expect(result.reviewsRequested).toBe(true);
  });

  it("does not reserve or settle anything without the single approval", () => {
    const result = runCompanyResearchScenario({ request, listings, approval: "none" });
    expect(result.approved).toBe(false);
    expect(result.reservedCents).toBe(0);
    expect(result.settledProviderIds).toEqual([]);
  });
});
