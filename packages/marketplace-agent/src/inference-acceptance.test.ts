import { describe, expect, it } from "vitest";
import { rankAgentCandidates } from "@kivro/marketplace";
import { authorizePlanApproval } from "./purchase-authorization.js";
import { acceptModelIntent } from "./structured-intent.js";
import { buildInferenceUsageRecord } from "./inference-usage.js";
import { inferenceFailureMayCreatePurchase, inferenceOwnership } from "./inference-ownership.js";
import {
  consumeInferenceBudget,
  readPlatformInferenceHealth,
  resetInferenceBudgetForTests,
  selectPrimaryProvider,
  resolveConfiguredTaskModel,
} from "./platform-inference-policy.js";
import { platformAiKeyVisibleTo } from "./platform-secrets.js";
import { dispatchMarketplaceTool } from "./tool-executor.js";

describe("platform inference acceptance", () => {
  it("keeps providers, tools, usage, and the classic marketplace independent", () => {
    expect(selectPrimaryProvider({ KIVRO_PLATFORM_OPENAI_API_KEY: "sk-openai" })).toBe("openai");
    expect(selectPrimaryProvider({ KIVRO_PLATFORM_ANTHROPIC_API_KEY: "sk-anthropic" })).toBe("anthropic");
    const both = readPlatformInferenceHealth({
      KIVRO_PLATFORM_OPENAI_API_KEY: "sk-openai",
      KIVRO_PLATFORM_ANTHROPIC_API_KEY: "sk-anthropic",
      KIVRO_PLATFORM_OPENAI_MODEL: "configured",
      KIVRO_PLATFORM_ANTHROPIC_MODEL: "configured",
    });
    expect(both.openai.configured).toBe(true);
    expect(both.anthropic.configured).toBe(true);
    expect(platformAiKeyVisibleTo("browser")).toBe(false);
    expect(platformAiKeyVisibleTo("worker")).toBe(false);
    expect(dispatchMarketplaceTool("shell", {}, {})).toEqual({ ok: false, error: "UNKNOWN_TOOL" });
    expect(acceptModelIntent({ purchase: true }, {})).toBeNull();
    const usage = buildInferenceUsageRecord({
      task: "INTENT",
      provider: "openai",
      model: "configured",
      inputTokens: 10,
      outputTokens: 4,
      prompt: "secret prompt",
    });
    expect(usage.inputTokens).toBe(10);
    expect(JSON.stringify(usage)).not.toContain("secret prompt");
    expect(
      resolveConfiguredTaskModel("recommendation", null, {
        KIVRO_PLATFORM_AI_MODEL_RECOMMENDATION: "configured-recommendation",
      }),
    ).toBe("configured-recommendation");
    resetInferenceBudgetForTests();
    expect(consumeInferenceBudget({ userId: "buyer", nowMs: 1, maxPerMinute: 1 })).toBe("allow");
    expect(consumeInferenceBudget({ userId: "buyer", nowMs: 2, maxPerMinute: 1 })).toBe("deny");
    expect(inferenceFailureMayCreatePurchase()).toBe(false);
    expect(inferenceOwnership("PLATFORM").paidBy).toBe("marketplace");
    expect(inferenceOwnership("SELLER").paidBy).toBe("seller");
    expect(inferenceOwnership("BUYER").buyerNeedsOwnProvider).toBe(false);
    const ranked = rankAgentCandidates(
      [
        {
          id: "cap",
          slug: "research",
          name: "Research",
          description: "Company research",
          category: "Research",
          priceTierCents: 100,
          currency: "USD",
          rating: null,
          jobCount: 0,
          estimatedDuration: null,
          sellerDisplayName: "Seller",
          availabilityStatus: "ONLINE",
          accepting: true,
        },
      ],
      { query: "company", constraints: {} },
    );
    expect(ranked[0]?.slug).toBe("research");
    expect(
      authorizePlanApproval({
        plan: {
          goal: "research",
          constraints: { maxTotalSpendCents: 100 },
          maxBudgetCents: 100,
          estimatedCostCents: 500,
          steps: [
            {
              clientStepKey: "one",
              label: "Research",
              capabilityId: "cap",
              capabilitySlug: "research",
              capabilityVersionId: "ver",
              estimatedPriceCents: 500,
              dependsOnStepIds: [],
            },
          ],
          notes: [],
        },
        constraints: { maxTotalSpendCents: 100 },
      }).ok,
    ).toBe(false);
  });
});
