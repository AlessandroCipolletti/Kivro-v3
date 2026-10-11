import { describe, expect, it } from "vitest";
import { normalizeInferenceRequest } from "./inference-request.js";
import { DeterministicPlatformInference, RoutingPlatformInference } from "./platform-inference.js";
import { ANTHROPIC_MESSAGES_URL, AnthropicPlatformInference } from "./platform-inference-anthropic.js";
import { OPENAI_RESPONSES_URL, OpenAiPlatformInference } from "./platform-inference-openai.js";
import { resetInferenceBudgetForTests } from "./platform-inference-policy.js";

const request = normalizeInferenceRequest({
  task: "RECOMMENDATION",
  system: "Recommend a service.",
  messages: [{ role: "user", content: "Find company research." }],
  tools: [{ name: "search_capabilities", description: "Search the marketplace." }],
  responseSchema: { type: "object" },
  maxOutputTokens: 200,
  metadata: { userId: "buyer-1" },
});

describe("platform inference providers", () => {
  it("keeps vendor calls inside the adapters and returns a normalized response", async () => {
    const openai = new OpenAiPlatformInference({
      env: {
        KIVRO_PLATFORM_OPENAI_API_KEY: "sk-openai-test",
        KIVRO_PLATFORM_OPENAI_MODEL: "configured-model",
      },
      fetchImpl: async (url, init) => {
        expect(url).toBe(OPENAI_RESPONSES_URL);
        const body = JSON.parse(String(init?.body)) as {
          model: string;
          instructions: string;
          tools: Array<{ name: string }>;
          text: { format: { type: string } };
        };
        expect(body.model).toBe("configured-model");
        expect(body.instructions).toBe("Recommend a service.");
        expect(body.tools[0]?.name).toBe("search_capabilities");
        expect(body.text.format.type).toBe("json_object");
        return new Response(
          JSON.stringify({
            output_text: "{\"answer\":1}",
            output: [{ type: "function_call", name: "search_capabilities", arguments: "{}" }],
          }),
          { status: 200 },
        );
      },
    });
    const response = await openai.generate(request);
    expect(response.provider).toBe("openai");
    expect(response.model).toBe("configured-model");
    expect(response.structuredOutput).toEqual({ answer: 1 });
    expect(response.toolCalls?.[0]?.name).toBe("search_capabilities");
    expect(JSON.stringify(response)).not.toContain("sk-openai-test");
    expect(openai.estimateCost()).toBeNull();
    expect(await openai.healthCheck()).toEqual({ id: "openai", configured: true });
    expect(await new OpenAiPlatformInference({ env: {} }).healthCheck()).toEqual({
      id: "openai",
      configured: false,
    });
  });

  it("uses the Anthropic adapter only for Anthropic requests", async () => {
    const anthropic = new AnthropicPlatformInference({
      env: {
        KIVRO_PLATFORM_ANTHROPIC_API_KEY: "sk-anthropic-test",
        KIVRO_PLATFORM_ANTHROPIC_MODEL: "configured-anthropic",
      },
      fetchImpl: async (url) => {
        expect(url).toBe(ANTHROPIC_MESSAGES_URL);
        return new Response(JSON.stringify({ content: [{ type: "text", text: "A short recommendation." }] }), {
          status: 200,
        });
      },
    });
    const response = await anthropic.generate(request);
    expect(response.provider).toBe("anthropic");
    expect(response.text).toBe("A short recommendation.");
    expect(anthropic.estimateCost()).toBeNull();
  });

  it("lets the router choose the provider and stop at the budget", async () => {
    resetInferenceBudgetForTests();
    let calls = 0;
    const openai = {
      async parseGoal() {
        throw new Error("unused");
      },
      async generate() {
        calls += 1;
        return { provider: "openai" as const, model: "configured-model", text: "ranked" };
      },
    };
    const denied = new RoutingPlatformInference(
      { openai },
      new DeterministicPlatformInference(),
      {
        KIVRO_PLATFORM_AI_PROVIDER: "openai",
        KIVRO_PLATFORM_OPENAI_API_KEY: "sk-openai-test",
        KIVRO_PLATFORM_INFERENCE_MAX_PER_MINUTE: "1",
      },
    );
    const first = await denied.generate(request);
    expect(first.provider).toBe("openai");
    const blocked = await denied.generate(request);
    expect(blocked.provider).toBe("deterministic");
    expect(calls).toBe(1);

    resetInferenceBudgetForTests();
    const allowed = new RoutingPlatformInference(
      { openai },
      new DeterministicPlatformInference(),
      {
        KIVRO_PLATFORM_AI_PROVIDER: "openai",
        KIVRO_PLATFORM_OPENAI_API_KEY: "sk-openai-test",
      },
    );
    const response = await allowed.generate(request);
    expect(response.provider).toBe("openai");
    expect(response.text).toBe("ranked");
    expect(Object.keys(request)).not.toContain("provider");
  });

  it("retries one transient OpenAI failure", async () => {
    let calls = 0;
    const openai = new OpenAiPlatformInference({
      env: {
        KIVRO_PLATFORM_OPENAI_API_KEY: "sk-openai-test",
        KIVRO_PLATFORM_OPENAI_MODEL: "configured-model",
      },
      fetchImpl: async () => {
        calls += 1;
        if (calls === 1) {
          return new Response("busy", { status: 500 });
        }
        return new Response(JSON.stringify({ output_text: "{\"answer\":1}" }), { status: 200 });
      },
    });
    const response = await openai.generate(request);
    expect(calls).toBe(2);
    expect(response.text).toBe("{\"answer\":1}");
  });
});
