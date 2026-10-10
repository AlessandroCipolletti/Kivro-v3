import { describe, expect, it } from "vitest";
import { availabilityAfterDependencyFailure } from "./dependency-isolation.js";

describe("dependency isolation", () => {
  it("changes only the capability that declared the failed dependency", () => {
    const result = availabilityAfterDependencyFailure({
      failedDependencyId: "company-db",
      capabilities: [
        { id: "research", dependencyIds: ["company-db"] },
        { id: "summary", dependencyIds: ["llm"] },
      ],
    });
    expect(result).toEqual([
      { id: "research", availability: "DEPENDENCY_FAILED" },
      { id: "summary", availability: "ONLINE" },
    ]);
  });
});
