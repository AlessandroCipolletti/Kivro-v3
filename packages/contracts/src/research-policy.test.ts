import { describe, expect, it } from "vitest";
import { defaultPublicWebResearchPolicy, parseInternetResearchPolicy } from "./research-policy.js";

describe("InternetResearchPolicy", () => {
  it("parses public research policy", () => {
    const policy = parseInternetResearchPolicy(defaultPublicWebResearchPolicy());
    expect(policy.mode).toBe("PUBLIC_WEB_RESEARCH");
    expect(policy.search?.enabled).toBe(true);
  });
});
