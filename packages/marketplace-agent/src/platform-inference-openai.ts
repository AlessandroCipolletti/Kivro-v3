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

/**
 * Responses API, checked against
 * https://developers.openai.com/api/docs/guides/migrate-to-responses on 2026-10-10.
 * Chat Completions stays supported; Responses is the current tool-use endpoint.
 */
export const OPENAI_RESPONSES_URL = "https://api.openai.com/v1/responses";

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
    const res = await postOpenAi(fetchImpl, apiKey, {
      model,
      instructions: normalized.system,
      input: normalized.messages,
      max_output_tokens: normalized.maxOutputTokens,
      store: false,
      ...(normalized.tools
        ? {
            tools: normalized.tools.map((tool) => ({
              type: "function",
              name: tool.name,
              description: tool.description,
              parameters: { type: "object", properties: {} },
            })),
          }
        : {}),
      ...(normalized.responseSchema ? { text: { format: { type: "json_object" } } } : {}),
    });
    if (!res.ok) {
      throw new PlatformInferenceError(classifyProviderHttpStatus(res.status));
    }
    const body = (await res.json()) as {
      output_text?: string;
      output?: Array<{
        type?: string;
        name?: string;
        arguments?: string;
        content?: Array<{ text?: string }>;
      }>;
    };
    const text =
      body.output_text ??
      body.output?.flatMap((item) => item.content ?? []).map((part) => part.text).find((part) => part);
    let structuredOutput: unknown;
    if (text) {
      try {
        structuredOutput = JSON.parse(text);
      } catch {
        structuredOutput = undefined;
      }
    }
    const toolCalls = body.output
      ?.filter((item) => item.type === "function_call" && item.name)
      .map((item) => ({ name: item.name ?? "", arguments: item.arguments ?? "" }));
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
    const res = await postOpenAi(fetchImpl, apiKey, {
      model,
      instructions: `${MARKETPLACE_AGENT_SYSTEM_CONTRACT} Extract intent. Return JSON only: { intentLabel: string, maxTotalSpendCents?: number, minRating?: number, onlineOnly?: boolean }.`,
      input: goal.slice(0, 8000),
      max_output_tokens: 400,
      store: false,
      text: { format: { type: "json_object" } },
    });
    if (!res.ok) {
      throw new PlatformInferenceError(classifyProviderHttpStatus(res.status));
    }
    const body = (await res.json()) as {
      output_text?: string;
      choices?: Array<{ message?: { content?: string } }>;
    };
    const raw = body.output_text ?? body.choices?.[0]?.message?.content;
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

async function postOpenAi(
  fetchImpl: FetchLike,
  apiKey: string,
  body: Record<string, unknown>,
): Promise<Response> {
  let response: Response | null = null;
  for (let attempt = 0; attempt < 2; attempt += 1) {
    response = await fetchImpl(OPENAI_RESPONSES_URL, {
      method: "POST",
      signal: AbortSignal.timeout(20_000),
      headers: {
        authorization: `Bearer ${apiKey}`,
        "content-type": "application/json",
      },
      body: JSON.stringify(body),
    });
    if (response.ok || (response.status !== 429 && response.status < 500)) {
      return response;
    }
  }
  return response!;
}
