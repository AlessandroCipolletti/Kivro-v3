import { describe, expect, it } from "vitest";
import { suggestInputContractFromDiscovery } from "./suggest-input-contract.js";

describe("suggestInputContractFromDiscovery", () => {
  it("suggests blender inputs when skills match", () => {
    const result = suggestInputContractFromDiscovery({
      snapshotVersion: 1,
      skills: ["blender-render"],
      tools: [],
      nativePlugins: [],
      warnings: [],
    });
    expect(result.suggested.fields.some((f) => f.key === "scene")).toBe(true);
    expect(result.rationale.length).toBeGreaterThan(0);
  });
});
