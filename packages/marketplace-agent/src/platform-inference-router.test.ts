import { describe, expect, it } from "vitest";
import type { PlatformInferencePort, PlatformIntent } from "./platform-inference.js";
import { RoutingPlatformInference } from "./platform-inference.js";
import { PlatformInferenceError, resetInferenceBudgetForTests } from "./platform-inference-policy.js";

function intent(servedBy: PlatformIntent["servedBy"]): PlatformIntent {
  return {
    intentLabel: servedBy,
    constraints: {},
    servedBy,
  };
}

function failing(times: { n: number }, failure: PlatformInferenceError["failure"]): PlatformInferencePort {
  return {
    async parseGoal() {
      times.n += 1;
      throw new PlatformInferenceError(failure);
    },
  };
}

describe("routing platform inference", () => {
  it("does not fall back to another paid provider on a policy failure", async () => {
    resetInferenceBudgetForTests();
    const anthropicCalls = { n: 0 };
    const router = new RoutingPlatformInference(
      {
        openai: failing({ n: 0 }, "policy"),
        anthropic: failing(anthropicCalls, "retryable"),
      },
      { async parseGoal() { return intent("deterministic"); } },
      { KIVRO_PLATFORM_AI_PROVIDER: "openai", KIVRO_PLATFORM_AI_FALLBACK: "true", KIVRO_PLATFORM_ANTHROPIC_API_KEY: "set" },
      () => 10_000,
    );
    const result = await router.parseGoal("find research", undefined, { userId: "buyer" });
    expect(result.servedBy).toBe("deterministic");
    expect(anthropicCalls.n).toBe(0);
  });

  it("uses the secondary provider after a retryable outage when fallback is enabled", async () => {
    resetInferenceBudgetForTests();
    const router = new RoutingPlatformInference(
      {
        openai: failing({ n: 0 }, "retryable"),
        anthropic: { async parseGoal() { return intent("anthropic"); } },
      },
      { async parseGoal() { return intent("deterministic"); } },
      {
        KIVRO_PLATFORM_AI_PROVIDER: "openai",
        KIVRO_PLATFORM_AI_FALLBACK: "true",
        KIVRO_PLATFORM_ANTHROPIC_API_KEY: "set",
      },
      () => 20_000,
    );
    const result = await router.parseGoal("find research", undefined, { userId: "other-buyer" });
    expect(result.servedBy).toBe("anthropic");
  });
});
