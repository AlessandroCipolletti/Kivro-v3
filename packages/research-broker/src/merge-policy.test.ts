import { describe, expect, it } from "vitest";
import { defaultPublicWebResearchPolicy } from "@kivro/contracts";
import { clampInternetResearchPolicy, validateInternetResearchPolicy } from "./merge-policy.js";

describe("internet policy merge", () => {
  it("clamps seller limits to platform ceilings", () => {
    const policy = defaultPublicWebResearchPolicy();
    policy.search!.maxQueriesPerJob = 9999;
    const clamped = clampInternetResearchPolicy(policy);
    expect(clamped.search!.maxQueriesPerJob).toBeLessThan(9999);
  });

  it("rejects declared api without domain list", () => {
    const result = validateInternetResearchPolicy({
      mode: "DECLARED_API_ACCESS",
      domainPolicy: "ONLY_DECLARED_DOMAINS",
    });
    expect(result.ok).toBe(false);
  });
});
