import { describe, expect, it } from "vitest";
import { contractDiscoverabilityCard } from "./contract-card.js";

describe("contract discoverability card", () => {
  it("shows blend and image inputs separately from png output", () => {
    const card = contractDiscoverabilityCard({
      inputSchema: {
        fields: [
          {
            type: "FILE",
            constraints: { file: { allowedExtensions: ["blend"] } },
          },
          {
            type: "FILES",
            constraints: { file: { allowedMimeTypes: ["image/png"] } },
          },
        ],
      },
      outputSchema: {
        fields: [
          { type: "FILE", constraints: { file: { allowedExtensions: ["blend"] } } },
          { type: "FILES", constraints: { file: { allowedExtensions: ["png"] } } },
        ],
      },
    });
    expect(card).toEqual({ input: ".blend + Images", output: ".blend + Images" });
  });

  it("returns nothing when the contract has no fields", () => {
    expect(contractDiscoverabilityCard({ inputSchema: null, outputSchema: {} })).toBeNull();
  });
});
