import { describe, expect, it } from "vitest";
import {
  assertNoUnconsentedDiscoveryExposure,
  filterConsentAlignedDiscovery,
} from "./discovery-consent-policy.js";

const discovery = {
  snapshotVersion: 1 as const,
  skills: ["skill-a", "skill-b"],
  tools: ["tool-x"],
  nativePlugins: [],
  warnings: [],
};

const consent = {
  consentVersion: 1 as const,
  selectedSkills: ["skill-a"],
  selectedTools: [],
  permissionManifest: {
    manifestVersion: 1 as const,
    categories: [
      {
        key: "AI_INFERENCE" as const,
        buyerLabel: "AI inference",
        state: "USED" as const,
        detail: "",
      },
    ],
  },
};

describe("discovery consent policy SELLERUX-002", () => {
  it("filters discovery to selected items only", () => {
    expect(filterConsentAlignedDiscovery(discovery, consent)).toEqual({
      skills: ["skill-a"],
      tools: [],
    });
  });

  it("rejects effective payload with unconsented skill", () => {
    const result = assertNoUnconsentedDiscoveryExposure({
      discovery,
      consent,
      effectiveSkills: ["skill-b"],
      effectiveTools: [],
    });
    expect(result.ok).toBe(false);
  });
});
