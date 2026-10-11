import { describe, expect, it } from "vitest";
import {
  platformResearchUrl,
  researchBrokerServesLocalArchitecture,
  selectResearchEgress,
  sellerOriginatedEgressIsFinalDesign,
} from "./placement.js";

describe("research broker placement", () => {
  it("runs in the local architecture and does not treat the seller IP as the final design", () => {
    expect(researchBrokerServesLocalArchitecture()).toBe(true);
    expect(sellerOriginatedEgressIsFinalDesign()).toBe(false);
    expect(selectResearchEgress({ audience: "generic_public", platformBrokerUrl: "https://broker.kivro.test" })).toBe(
      "platform",
    );
    expect(selectResearchEgress({ audience: "generic_public" })).toBe("local_hardened");
    expect(selectResearchEgress({ audience: "seller_private", platformBrokerUrl: "https://broker.kivro.test" })).toBe(
      "local_hardened",
    );
    expect(platformResearchUrl("https://broker.kivro.test", "acme competitors")).toBe(
      "https://broker.kivro.test/research/search?q=acme+competitors",
    );
  });
});
