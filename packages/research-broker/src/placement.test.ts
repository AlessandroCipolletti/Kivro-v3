import { describe, expect, it } from "vitest";
import {
  researchBrokerServesLocalArchitecture,
  sellerOriginatedEgressIsFinalDesign,
} from "./placement.js";

describe("research broker placement", () => {
  it("runs in the local architecture and does not treat the seller IP as the final design", () => {
    expect(researchBrokerServesLocalArchitecture()).toBe(true);
    expect(sellerOriginatedEgressIsFinalDesign()).toBe(false);
  });
});
