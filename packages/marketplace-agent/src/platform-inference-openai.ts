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

/** Optional OpenAI adapter. The router decides fallback. */
export class OpenAiPlatformInference {
  async parseGoal(goal: string, uiConstraints?: Partial<BuyerConstraints>) {
    const apiKey = process.env.KIVRO_PLATFORM_OPENAI_API_KEY?.trim();
    const model = resolveTaskModel("INTENT", process.env.KIVRO_PLATFORM_OPENAI_MODEL);
    if (!apiKey || !model) {
      throw new PlatformInferenceError("invalid");
    }
    const started = Date.now();
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
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
