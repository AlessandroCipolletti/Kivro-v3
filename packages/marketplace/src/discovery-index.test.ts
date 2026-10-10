import { describe, expect, it } from "vitest";
import { DISCOVERY_INDEX_BACKEND, semanticDiscoveryIndexEntry } from "./discovery-index.js";

describe("semantic discovery index", () => {
  it("indexes the public contract and leaves private instructions out", () => {
    const entry = semanticDiscoveryIndexEntry({
      name: "Company Intelligence",
      description: "Public research",
      category: "Research",
      tags: ["company"],
      accepts: ["company_name"],
      outputs: ["structured_report"],
      examples: ["Acme"],
      strengths: ["proprietary company data"],
      limitations: ["does not create PDF"],
      privateInstructions: "use the seller key sk-live-secret",
      secret: "192.168.1.9",
    });
    const serialized = JSON.stringify(entry);
    expect(serialized).not.toContain("sk-live");
    expect(serialized).not.toContain("192.168");
    expect(serialized).not.toContain("seller key");
    expect(entry.accepts).toEqual(["company_name"]);
    expect(DISCOVERY_INDEX_BACKEND).toBe("postgresql");
  });

  it("drops a description that itself contains a secret", () => {
    const entry = semanticDiscoveryIndexEntry({
      name: "Research",
      description: "Call with api_key sk-live-secret",
      category: "Research",
    });
    expect(entry.description).toBe("");
  });
});
