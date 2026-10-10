import { describe, expect, it } from "vitest";
import { defaultPublicWebResearchPolicy, networkPrimitiveForPurpose, parseInternetResearchPolicy } from "./research-policy.js";

describe("InternetResearchPolicy", () => {
  it("parses public research policy", () => {
    const policy = parseInternetResearchPolicy(defaultPublicWebResearchPolicy());
    expect(policy.mode).toBe("PUBLIC_WEB_RESEARCH");
    expect(policy.search?.enabled).toBe(true);
    expect(networkPrimitiveForPurpose("public_web_research")).toBe("PUBLIC_WEB_RESEARCH");
    expect(networkPrimitiveForPurpose("none")).toBe("NO_NETWORK");
    expect(networkPrimitiveForPurpose("arbitrary_seller_network")).toBeNull();
  });
});
