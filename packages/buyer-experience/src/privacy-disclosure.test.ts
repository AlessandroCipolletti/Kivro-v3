import { describe, expect, it } from "vitest";
import { buildPrivacyDisclosureFromManifest } from "./privacy-disclosure.js";

describe("sensitive input warning", () => {
  it("says files run on the seller computer and are not confidential computing", () => {
    const disclosure = buildPrivacyDisclosureFromManifest({ permissionManifest: null });
    expect(disclosure.executionModel).toContain("seller's computer");
    expect(disclosure.executionModel).toContain("not confidential computing");
  });
});
