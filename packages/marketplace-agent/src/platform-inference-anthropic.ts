import type { BuyerConstraints } from "@kivro/marketplace";
import { extractConstraintsFromText } from "@kivro/marketplace";
import { MARKETPLACE_AGENT_SYSTEM_CONTRACT } from "./discovery-document.js";
import {
  classifyProviderHttpStatus,
  PlatformInferenceError,
  resolveTaskModel,
} from "./platform-inference-policy.js";
import { usageFromAnthropicBody } from "./inference-usage.js";
import { acceptModelIntent } from "./structured-intent.js";
import {
  normalizeInferenceRequest,
  type PlatformInferenceProvider,
  type PlatformInferenceRequest,
  type PlatformInferenceResponse,
} from "./inference-request.js";

type FetchLike = (url: string, init?: RequestInit) => Promise<Response>;

/** Current Messages endpoint. Change it here when the vendor API changes. */
export const ANTHROPIC_MESSAGES_URL = "https://api.anthropic.com/v1/messages";

/** Optional Anthropic adapter. The router decides whether a failure may fall back. */
export class AnthropicPlatformInference implements PlatformInferenceProvider {
  readonly id = "anthropic" as const;

  constructor(private readonly deps?: { fetchImpl?: FetchLike; env?: Record<string, string | undefined> }) {}

  async healthCheck(): Promise<{ id: "anthropic"; configured: boolean }> {
    const env = this.deps?.env ?? process.env;
    return { id: "anthropic", configured: Boolean(env.KIVRO_PLATFORM_ANTHROPIC_API_KEY?.trim()) };
  }

  estimateCost(): null {
    return null;
  }

  async generate(request: PlatformInferenceRequest): Promise<PlatformInferenceResponse> {
    const env = this.deps?.env ?? process.env;
    const fetchImpl = this.deps?.fetchImpl ?? fetch;
    const apiKey = env.KIVRO_PLATFORM_ANTHROPIC_API_KEY?.trim();
    const model = resolveTaskModel("INTENT", env.KIVRO_PLATFORM_ANTHROPIC_MODEL, env);
    if (!apiKey || !model) {
      throw new PlatformInferenceError("invalid");
    }
    const normalized = normalizeInferenceRequest(request);
    const res = await fetchImpl(ANTHROPIC_MESSAGES_URL, {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model,
        max_tokens: normalized.maxOutputTokens ?? 400,
        temperature: 0,
        system: normalized.system,
        messages: normalized.messages,
        ...(normalized.tools
          ? {
              tools: normalized.tools.map((tool) => ({
                name: tool.name,
                description: tool.description,
                input_schema: { type: "object" },
              })),
            }
          : {}),
      }),
    });
    if (!res.ok) {
      throw new PlatformInferenceError(classifyProviderHttpStatus(res.status));
    }
    const body = (await res.json()) as { content?: Array<{ type?: string; text?: string; name?: string; input?: unknown }> };
    const text = body.content?.find((part) => part.text)?.text;
    let structuredOutput: unknown;
    if (text) {
      try {
        structuredOutput = JSON.parse(text);
      } catch {
        structuredOutput = undefined;
      }
    }
    const toolCalls = body.content
      ?.filter((part) => part.type === "tool_use" && part.name)
      .map((part) => ({ name: part.name ?? "", arguments: part.input }));
    return {
      provider: "anthropic",
      model,
      text,
      structuredOutput,
      ...(toolCalls && toolCalls.length > 0 ? { toolCalls } : {}),
    };
  }

  async parseGoal(goal: string, uiConstraints?: Partial<BuyerConstraints>) {
    const env = this.deps?.env ?? process.env;
    const apiKey = env.KIVRO_PLATFORM_ANTHROPIC_API_KEY?.trim();
    const model = resolveTaskModel("INTENT", env.KIVRO_PLATFORM_ANTHROPIC_MODEL, env);
    if (!apiKey || !model) {
      throw new PlatformInferenceError("invalid");
    }
    const started = Date.now();
    const fetchImpl = this.deps?.fetchImpl ?? fetch;
    const res = await fetchImpl(ANTHROPIC_MESSAGES_URL, {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model,
        max_tokens: 400,
        temperature: 0,
        system: `${MARKETPLACE_AGENT_SYSTEM_CONTRACT} Return only JSON: { intentLabel: string, maxTotalSpendCents?: number, minRating?: number, onlineOnly?: boolean }.`,
        messages: [{ role: "user", content: goal.slice(0, 8000) }],
      }),
    });
    if (!res.ok) {
      throw new PlatformInferenceError(classifyProviderHttpStatus(res.status));
    }
    const body = (await res.json()) as { content?: Array<{ text?: string }> };
    const raw = body.content?.find((part) => part.text)?.text;
    if (!raw) {
      throw new PlatformInferenceError("invalid");
    }
    const jsonStart = raw.indexOf("{");
    const jsonEnd = raw.lastIndexOf("}");
    if (jsonStart < 0 || jsonEnd < jsonStart) {
      throw new PlatformInferenceError("invalid");
    }
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw.slice(jsonStart, jsonEnd + 1));
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
      servedBy: "anthropic" as const,
      usage: { model, ...usageFromAnthropicBody(body), latencyMs: Date.now() - started },
    };
  }
}
