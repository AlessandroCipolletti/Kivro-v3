import { describe, expect, it } from "vitest";
import { rankAgentCandidates } from "@kivro/marketplace";
import { grantAllowsRead, issueCrossJobAssetGrant } from "./asset-grant.js";
import { toPublicDiscoveryDocument, PLATFORM_AGENT_INSPECTS_BUYER_FILES, boundCandidatesForModel, MARKETPLACE_AGENT_SYSTEM_CONTRACT } from "./discovery-document.js";
import { modelMeetsTask, routingChangeAudit, safeInferenceLog } from "./inference-safety.js";
import { acceptModelIntent } from "./structured-intent.js";
import { dispatchMarketplaceTool } from "./tool-executor.js";

describe("agent safety", () => {
  it("rejects unknown tools and purchase-shaped model JSON", () => {
    expect(dispatchMarketplaceTool("shell", {}, { search_capabilities: () => ({}) }).error).toBe(
      "UNKNOWN_TOOL",
    );
    expect(acceptModelIntent({ intentLabel: "x", purchase: true }, {})).toBeNull();
    expect(acceptModelIntent({ intentLabel: "x", reasoning: "hidden chain" }, {})).toBeNull();
    const clamped = acceptModelIntent(
      { intentLabel: "research", maxTotalSpendCents: 50_000, minRating: 1 },
      { maxTotalSpendCents: 1500, minRating: 4.5 },
    );
    expect(clamped?.constraints.maxTotalSpendCents).toBe(1500);
    expect(clamped?.constraints.minRating).toBe(4.5);
  });

  it("publishes discovery metadata without private fields and bounds the catalog", () => {
    const doc = toPublicDiscoveryDocument({
      id: "cap-1",
      slug: "research",
      name: "Research",
      description: "Public description",
      category: "Research",
      priceTierCents: 240,
      currency: "USD",
      rating: 4.9,
      jobCount: 3,
      estimatedDuration: 60,
      sellerDisplayName: "Ada",
      sellerPrompt: "secret instructions",
      credential: "sk-live-secret",
    });
    expect(JSON.stringify(doc)).not.toContain("secret");
    expect(JSON.stringify(doc)).not.toContain("sk-live");
    expect(boundCandidatesForModel([1, 2, 3, 4, 5, 6, 7, 8, 9])).toHaveLength(8);
    expect(PLATFORM_AGENT_INSPECTS_BUYER_FILES).toBe(false);
    expect(MARKETPLACE_AGENT_SYSTEM_CONTRACT).toContain("Never invent");
  });

  it("logs inference metadata without the prompt unless debug redaction is on", () => {
    const quiet = safeInferenceLog(
      { task: "INTENT", provider: "openai", model: "configured", success: true, toolCallCount: 0, prompt: "email me at a@b.co" },
      {},
    );
    expect(quiet.prompt).toBeUndefined();
    const debug = safeInferenceLog(
      { task: "INTENT", provider: "openai", model: "configured", success: false, toolCallCount: 1, prompt: "key sk-abcdef" },
      { KIVRO_PLATFORM_AI_DEBUG: "true" },
    );
    expect(String(debug.prompt)).toContain("[REDACTED]");
    expect(String(debug.prompt)).not.toContain("sk-abcdef");
    expect(JSON.stringify(routingChangeAudit({ task: "ORCHESTRATION", previousModel: "a", nextModel: "b" }))).not.toContain(
      "apiKey",
    );
    expect(modelMeetsTask(["structured_output"], "INTENT")).toBe(true);
    expect(modelMeetsTask(["structured_output"], "ORCHESTRATION")).toBe(false);
  });

  it("scopes a cross-job grant to one asset and one target job", () => {
    const now = new Date("2026-10-10T12:00:00.000Z");
    const grant = issueCrossJobAssetGrant({
      assetId: "asset-a",
      sourceJobId: "job-a",
      targetJobId: "job-b",
      now,
    });
    expect(grant.permission).toBe("READ");
    expect(grantAllowsRead(grant, { assetId: "asset-a", targetJobId: "job-b", now })).toBe(true);
    expect(grantAllowsRead(grant, { assetId: "asset-other", targetJobId: "job-b", now })).toBe(false);
    expect(grantAllowsRead(grant, { assetId: "asset-a", targetJobId: "job-c", now })).toBe(false);
  });

  it("does not recommend a capability outside the real catalog, budget, or rating", () => {
    const rows = rankAgentCandidates(
      [
        {
          id: "real",
          slug: "company-research",
          name: "Company Intelligence",
          description: "funding research",
          category: "Research",
          priceTierCents: 400,
          currency: "USD",
          rating: 4.8,
          jobCount: 10,
          estimatedDuration: 60,
          sellerDisplayName: "Ada",
          availabilityStatus: "ONLINE",
          accepting: true,
        },
        {
          id: "dear",
          slug: "expensive",
          name: "Company Intelligence Premium",
          description: "funding research",
          category: "Research",
          priceTierCents: 5000,
          currency: "USD",
          rating: 5,
          jobCount: 10,
          estimatedDuration: 60,
          sellerDisplayName: "Bea",
          availabilityStatus: "ONLINE",
          accepting: true,
        },
      ],
      { query: "funding", constraints: { maxPerJobSpendCents: 1500, minRating: 4.5, timingMode: "IMMEDIATE" } },
    );
    expect(rows.map((row) => row.slug)).toEqual(["company-research"]);
  });
});
