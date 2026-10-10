import { describe, expect, it } from "vitest";
import {
  aggregateInferenceUsage,
  buildInferenceUsageRecord,
  usageFromOpenAiBody,
} from "./inference-usage.js";

describe("platform inference usage", () => {
  it("records provider usage and drops the prompt", () => {
    const record = buildInferenceUsageRecord({
      task: "INTENT",
      provider: "openai",
      model: "gpt-test",
      inputTokens: 12.9,
      outputTokens: 4,
      latencyMs: 80,
      prompt: "secret buyer goal",
      goal: "also secret",
    });
    expect(record.inputTokens).toBe(12);
    expect(record.estimatedCostCents).toBeNull();
    expect(JSON.stringify(record)).not.toContain("secret");
  });

  it("reads OpenAI token counts without inventing a price", () => {
    const usage = usageFromOpenAiBody({
      usage: { prompt_tokens: 20, completion_tokens: 5, prompt_tokens_details: { cached_tokens: 2 } },
    });
    const record = buildInferenceUsageRecord({ task: "INTENT", provider: "openai", ...usage });
    expect(record.cachedInputTokens).toBe(2);
    expect(aggregateInferenceUsage([record]).unpricedCalls).toBe(1);
  });
});
