import { describe, expect, it } from "vitest";
import { buildSellerSecurityDisclosure } from "./seller-security-disclosure.js";

describe("seller security disclosure SELLERUX-033", () => {
  it("lists only selected skills/tools", () => {
    const d = buildSellerSecurityDisclosure({
      permissionManifest: {
        manifestVersion: 1,
        categories: [
          {
            key: "AI_INFERENCE",
            buyerLabel: "AI inference",
            state: "USED",
            detail: "",
          },
        ],
      },
      selectedSkills: ["demo-skill"],
      selectedTools: [],
    });
    expect(d.localResourcesDisclosed.some((l) => l.includes("demo-skill"))).toBe(true);
    expect(d.notAccessibleToBuyers.some((l) => l.includes("Unselected"))).toBe(true);
  });
});
