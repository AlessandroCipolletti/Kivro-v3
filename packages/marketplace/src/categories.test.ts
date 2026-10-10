import { describe, expect, it } from "vitest";
import { rankAgentCandidates } from "./agent-ranking.js";
import { fewCapabilityTags, isMarketplaceCategory, MAX_CAPABILITY_TAGS } from "./categories.js";
import { semanticDiscoveryIndexEntry } from "./discovery-index.js";
import type { CapabilityListingRow } from "./capability-listing.js";

function row(partial: Partial<CapabilityListingRow> & Pick<CapabilityListingRow, "slug" | "name" | "description" | "category">): CapabilityListingRow {
  return {
    id: partial.slug,
    priceTierCents: 100,
    currency: "USD",
    rating: null,
    jobCount: 0,
    estimatedDuration: null,
    sellerDisplayName: "Seller",
    availabilityStatus: "ONLINE",
    accepting: true,
    ...partial,
  };
}

describe("marketplace categories", () => {
  it("keeps one primary category and only a few tags", () => {
    expect(isMarketplaceCategory("Research")).toBe(true);
    expect(isMarketplaceCategory("Research, Documents")).toBe(false);
    const entry = semanticDiscoveryIndexEntry({
      name: "Research",
      description: "Public",
      category: "Research",
      tags: ["a", "b", "c", "d", "e", "f", "g"],
    });
    expect(entry.category).toBe("Research");
    expect(entry.tags).toHaveLength(MAX_CAPABILITY_TAGS);
    expect(fewCapabilityTags([" company ", "company", "funding"])).toEqual(["company", "funding"]);
  });

  it("ranks a description match ahead of a category that does not match the request", () => {
    const ranked = rankAgentCandidates(
      [
        row({
          slug: "other",
          name: "Office notes",
          description: "Internal memos",
          category: "Research",
        }),
        row({
          slug: "docs",
          name: "Contract reader",
          description: "Reads a funding contract",
          category: "Documents",
        }),
      ],
      { query: "funding contract", constraints: {} },
    );
    expect(ranked[0]?.slug).toBe("docs");
  });
});
