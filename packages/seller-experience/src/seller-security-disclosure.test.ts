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
      selectedSkills: ["company-research"],
      selectedTools: [],
      readOnlyCredentials: ["Company DB"],
    });
    expect(d.localResourcesDisclosed.some((l) => l.includes("company-research"))).toBe(true);
    expect(d.notAccessibleToBuyers.some((l) => l.includes("Unselected"))).toBe(true);
    expect(d.can).toContain('use skill "company-research"');
    expect(d.can).toContain("query Company DB through a read-only credential");
    expect(d.cannot.join(" ")).toContain("personal OpenClaw");
    expect(d.cannot.join(" ")).toContain("~/Documents");
  });
});
