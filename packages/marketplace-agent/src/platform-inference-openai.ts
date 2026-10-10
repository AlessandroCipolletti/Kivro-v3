import type { BuyerConstraints } from "@kivro/marketplace";
import { extractConstraintsFromText } from "@kivro/marketplace";
import { MARKETPLACE_AGENT_SYSTEM_CONTRACT } from "./discovery-document.js";
import {
  classifyProviderHttpStatus,
  PlatformInferenceError,
  resolveTaskModel,
} from "./platform-inference-policy.js";
import { usageFromOpenAiBody } from "./inference-usage.js";
import { acceptModelIntent } from "./structured-intent.js";
import {
  normalizeInferenceRequest,
  type PlatformInferenceProvider,
  type PlatformInferenceRequest,
  type PlatformInferenceResponse,
} from "./inference-request.js";

type FetchLike = (url: string, init?: RequestInit) => Promise<Response>;

/** Current Chat Completions endpoint. Change it here when the vendor API changes. */
export const OPENAI_CHAT_COMPLETIONS_URL = "https://api.openai.com/v1/chat/completions";

/** Optional OpenAI adapter. The router decides fallback. */
export class OpenAiPlatformInference implements PlatformInferenceProvider {
  readonly id = "openai" as const;

  constructor(private readonly deps?: { fetchImpl?: FetchLike; env?: Record<string, string | undefined> }) {}

  async healthCheck(): Promise<{ id: "openai"; configured: boolean }> {
    const env = this.deps?.env ?? process.env;
    return { id: "openai", configured: Boolean(env.KIVRO_PLATFORM_OPENAI_API_KEY?.trim()) };
  }

  estimateCost(): null {
    return null;
  }

  async generate(request: PlatformInferenceRequest): Promise<PlatformInferenceResponse> {
    const env = this.deps?.env ?? process.env;
    const fetchImpl = this.deps?.fetchImpl ?? fetch;
    const apiKey = env.KIVRO_PLATFORM_OPENAI_API_KEY?.trim();
    const model = resolveTaskModel("INTENT", env.KIVRO_PLATFORM_OPENAI_MODEL, env);
    if (!apiKey || !model) {
      throw new PlatformInferenceError("invalid");
    }
    const normalized = normalizeInferenceRequest(request);
    const res = await fetchImpl(OPENAI_CHAT_COMPLETIONS_URL, {
      method: "POST",
      headers: {
        authorization: `Bearer ${apiKey}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model,
        temperature: 0,
        max_tokens: normalized.maxOutputTokens,
        messages: [{ role: "system", content: normalized.system }, ...normalized.messages],
        ...(normalized.tools
          ? {
              tools: normalized.tools.map((tool) => ({
                type: "function",
                function: { name: tool.name, description: tool.description },
              })),
            }
          : {}),
        ...(normalized.responseSchema ? { response_format: { type: "json_object" } } : {}),
      }),
    });
    if (!res.ok) {
      throw new PlatformInferenceError(classifyProviderHttpStatus(res.status));
    }
    const body = (await res.json()) as {
      choices?: Array<{ message?: { content?: string; tool_calls?: Array<{ function?: { name?: string; arguments?: string } }> } }>;
    };
    const message = body.choices?.[0]?.message;
    const text = message?.content;
    let structuredOutput: unknown;
    if (text) {
      try {
        structuredOutput = JSON.parse(text);
      } catch {
        structuredOutput = undefined;
      }
    }
    const toolCalls = message?.tool_calls
      ?.map((call) => ({
        name: call.function?.name ?? "",
        arguments: call.function?.arguments ?? "",
      }))
      .filter((call) => call.name);
    return {
      provider: "openai",
      model,
      text,
      structuredOutput,
      ...(toolCalls && toolCalls.length > 0 ? { toolCalls } : {}),
    };
  }

  async parseGoal(goal: string, uiConstraints?: Partial<BuyerConstraints>) {
    const apiKey = (this.deps?.env ?? process.env).KIVRO_PLATFORM_OPENAI_API_KEY?.trim();
    const model = resolveTaskModel(
      "INTENT",
      (this.deps?.env ?? process.env).KIVRO_PLATFORM_OPENAI_MODEL,
      this.deps?.env ?? process.env,
    );
    if (!apiKey || !model) {
      throw new PlatformInferenceError("invalid");
    }
    const started = Date.now();
    const fetchImpl = this.deps?.fetchImpl ?? fetch;
    const res = await fetchImpl(OPENAI_CHAT_COMPLETIONS_URL, {
      method: "POST",
      headers: {
        authorization: `Bearer ${apiKey}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model,
        temperature: 0,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: `${MARKETPLACE_AGENT_SYSTEM_CONTRACT} Extract intent. Return JSON only: { intentLabel: string, maxTotalSpendCents?: number, minRating?: number, onlineOnly?: boolean }.`,
          },
          { role: "user", content: goal.slice(0, 8000) },
        ],
      }),
    });
    if (!res.ok) {
      throw new PlatformInferenceError(classifyProviderHttpStatus(res.status));
    }
    const body = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const raw = body.choices?.[0]?.message?.content;
    if (!raw) {
      throw new PlatformInferenceError("invalid");
    }
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      throw new PlatformInferenceError("invalid");
    }
    const fromText = extractConstraintsFromText(goal);
    const accepted = acceptModelIntent(parsed, { ...fromText, ...uiConstraints });
    if (!accepted) {
      throw new PlatformInferenceError("invalid");
    }
    return {
      intentLabel: accepted.intentLabel,
      constraints: accepted.constraints,
      servedBy: "openai" as const,
      usage: { model, ...usageFromOpenAiBody(body), latencyMs: Date.now() - started },
    };
  }
}
