import { describe, expect, it } from "vitest";
import {
  classifyProviderHttpStatus,
  consumeInferenceBudget,
  mayFallback,
  readPlatformInferenceHealth,
  resetInferenceBudgetForTests,
  resolveTaskModel,
  resolveConfiguredTaskModel,
  selectPrimaryProvider,
  taskRoutingHealth,
} from "./platform-inference-policy.js";

describe("platform inference policy", () => {
  it("falls back only on retryable provider failures when enabled", () => {
    expect(classifyProviderHttpStatus(429)).toBe("retryable");
    expect(classifyProviderHttpStatus(500)).toBe("retryable");
    expect(classifyProviderHttpStatus(403)).toBe("policy");
    expect(mayFallback("retryable", true)).toBe(true);
    expect(mayFallback("policy", true)).toBe(false);
    expect(mayFallback("budget", true)).toBe(false);
    expect(mayFallback("retryable", false)).toBe(false);
  });

  it("denies extra inference calls without a ledger effect", () => {
    resetInferenceBudgetForTests();
    expect(consumeInferenceBudget({ userId: "buyer-1", nowMs: 1_000, maxPerMinute: 2 })).toBe("allow");
    expect(consumeInferenceBudget({ userId: "buyer-1", nowMs: 1_100, maxPerMinute: 2 })).toBe("allow");
    expect(consumeInferenceBudget({ userId: "buyer-1", nowMs: 1_200, maxPerMinute: 2 })).toBe("deny");
    expect(consumeInferenceBudget({ userId: "buyer-2", nowMs: 1_200, maxPerMinute: 2 })).toBe("allow");
  });

  it("routes each configured task to its own model", () => {
    expect(
      resolveConfiguredTaskModel("discoveryRerank", "provider-default", {
        KIVRO_PLATFORM_AI_MODEL_DISCOVERY: "rerank-model",
      }),
    ).toBe("rerank-model");
    expect(
      resolveConfiguredTaskModel("resultSynthesis", "provider-default", {
        KIVRO_PLATFORM_AI_MODEL_SYNTHESIS: "synthesis-model",
      }),
    ).toBe("synthesis-model");
  });

  it("marks a task unhealthy when its provider is not configured", () => {
    const health = taskRoutingHealth({
      KIVRO_PLATFORM_OPENAI_API_KEY: "sk-openai",
      KIVRO_PLATFORM_OPENAI_MODEL: "configured-model",
      KIVRO_PLATFORM_AI_PROVIDER_ORCHESTRATION: "anthropic",
      KIVRO_PLATFORM_AI_MODEL_ORCHESTRATION: "strong-model",
    });
    expect(health.find((task) => task.task === "intentExtraction")?.healthy).toBe(true);
    expect(health.find((task) => task.task === "orchestrationPlanning")?.healthy).toBe(false);
  });

  it("reports configuration without secrets", () => {
    const health = readPlatformInferenceHealth({
      KIVRO_PLATFORM_OPENAI_API_KEY: "sk-secret",
      KIVRO_PLATFORM_OPENAI_MODEL: "gpt-4o-mini",
      KIVRO_PLATFORM_AI_FALLBACK: "true",
    });
    expect(health.openai.configured).toBe(true);
    expect(health.primary).toBe("openai");
    expect(JSON.stringify(health)).not.toContain("sk-secret");
  });

  it("routes a task to its configured model without a source-code default", () => {
    expect(
      resolveTaskModel("RECOMMENDATION", "provider-default", {
        KIVRO_PLATFORM_AI_MODEL_RECOMMENDATION: "task-model",
      }),
    ).toBe("task-model");
    expect(resolveTaskModel("ORCHESTRATION", "provider-default", {})).toBe("provider-default");
    expect(resolveTaskModel("INTENT", "  ", {})).toBeNull();
  });

  it("runs with only one provider configured and does not put secrets in health", () => {
    expect(selectPrimaryProvider({ KIVRO_PLATFORM_OPENAI_API_KEY: "sk-openai" })).toBe("openai");
    expect(selectPrimaryProvider({ KIVRO_PLATFORM_ANTHROPIC_API_KEY: "sk-anthropic" })).toBe("anthropic");
    const health = readPlatformInferenceHealth({ KIVRO_PLATFORM_ANTHROPIC_API_KEY: "sk-anthropic" });
    expect(health.anthropic.configured).toBe(true);
    expect(health.openai.configured).toBe(false);
    expect(JSON.stringify(health)).not.toContain("sk-anthropic");
  });
});
