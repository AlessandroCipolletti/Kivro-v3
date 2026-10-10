import { describe, expect, it } from "vitest";
import { rankAgentCandidates } from "./agent-ranking.js";

describe("contract filter before ranking", () => {
  it("does not rank a text-only capability for a file request", () => {
    const ranked = rankAgentCandidates(
      [
        {
          id: "text",
          slug: "prompt-writer",
          name: "Blender prompt",
          description: "Blender scene advice",
          category: "Media",
          priceTierCents: 100,
          currency: "USD",
          rating: 5,
          jobCount: 20,
          estimatedDuration: 60,
          sellerDisplayName: "Ada",
          acceptsFileInput: false,
          availabilityStatus: "ONLINE",
          accepting: true,
        },
        {
          id: "file",
          slug: "scene-render",
          name: "Scene render",
          description: "Renders an uploaded scene",
          category: "Media",
          priceTierCents: 200,
          currency: "USD",
          rating: 4,
          jobCount: 2,
          estimatedDuration: 60,
          sellerDisplayName: "Bea",
          acceptsFileInput: true,
          availabilityStatus: "ONLINE",
          accepting: true,
        },
      ],
      { query: "Blender", constraints: { needsFileInput: true, timingMode: "IMMEDIATE" } },
    );
    expect(ranked.map((row) => row.slug)).toEqual(["scene-render"]);
  });

  it("matches a description even when the category differs", () => {
    const ranked = rankAgentCandidates(
      [
        {
          id: "match",
          slug: "notes",
          name: "Notes",
          description: "funding research for private companies",
          category: "Other",
          priceTierCents: 100,
          currency: "USD",
          rating: 4,
          jobCount: 1,
          estimatedDuration: 30,
          sellerDisplayName: "Ada",
          availabilityStatus: "ONLINE",
          accepting: true,
        },
      ],
      { query: "funding", constraints: { timingMode: "IMMEDIATE" } },
    );
    expect(ranked[0]?.whySelected.join(" ")).toContain("Description");
  });
});
