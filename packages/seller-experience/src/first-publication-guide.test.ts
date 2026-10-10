import { describe, expect, it } from "vitest";
import { buildFirstPublicationGuide } from "./first-publication-guide.js";

describe("first publication guide SELLERUX-039", () => {
  it("includes listing preview and payout steps", () => {
    const guide = buildFirstPublicationGuide({
      capabilitySlug: "demo-cap",
      marketplaceSellerId: "seller-1",
      payoutReady: false,
    });
    expect(guide.steps.some((s) => s.id === "preview_listing")).toBe(true);
    expect(guide.steps.some((s) => s.id === "payout" && s.title.includes("Finish"))).toBe(true);
  });
});
