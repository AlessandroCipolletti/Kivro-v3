import { describe, expect, it } from "vitest";
import {
  ImportConsentSchema,
  validateImportConsent,
  type DiscoverySnapshot,
} from "./import-consent.js";

const discovery: DiscoverySnapshot = {
  snapshotVersion: 1,
  skills: ["company-research"],
  tools: ["web-search"],
  warnings: [],
};

describe("validateImportConsent", () => {
  it("rejects skills not present in discovery", () => {
    const consent = ImportConsentSchema.parse({
      consentVersion: 1,
      selectedSkills: ["unknown-skill"],
      selectedTools: [],
      permissionManifest: {
        manifestVersion: 1,
        categories: [
          {
            key: "AI_INFERENCE",
            state: "USED",
            buyerLabel: "AI",
          },
        ],
      },
    });
    expect(validateImportConsent(discovery, consent)).toEqual({
      ok: false,
      code: "SKILL_NOT_IN_DISCOVERY",
    });
  });

  it("accepts explicit consent aligned with discovery", () => {
    const consent = ImportConsentSchema.parse({
      consentVersion: 1,
      selectedSkills: ["company-research"],
      selectedTools: [],
      permissionManifest: {
        manifestVersion: 1,
        categories: [
          {
            key: "PUBLIC_INTERNET",
            state: "USED",
            buyerLabel: "Web",
          },
        ],
      },
    });
    expect(validateImportConsent(discovery, consent)).toEqual({ ok: true });
  });
});
