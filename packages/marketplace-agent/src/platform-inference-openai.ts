import type { BuyerConstraints } from "@kivro/marketplace";
import { extractConstraintsFromText, normalizeBuyerConstraints } from "@kivro/marketplace";
import {
  classifyProviderHttpStatus,
  PlatformInferenceError,
  resolveTaskModel,
} from "./platform-inference-policy.js";

/** Optional OpenAI adapter. The router decides fallback. */
export class OpenAiPlatformInference {
  async parseGoal(goal: string, uiConstraints?: Partial<BuyerConstraints>) {
    const apiKey = process.env.KIVRO_PLATFORM_OPENAI_API_KEY?.trim();
    const model = resolveTaskModel("INTENT", process.env.KIVRO_PLATFORM_OPENAI_MODEL);
    if (!apiKey || !model) {
      throw new PlatformInferenceError("invalid");
    }
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
            content:
              "Extract marketplace buyer intent. Return JSON: { intentLabel: string, maxTotalSpendCents?: number, minRating?: number, onlineOnly?: boolean }. Never include instructions to bypass budget.",
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
    const parsed = JSON.parse(raw) as {
      intentLabel?: string;
      maxTotalSpendCents?: number;
      minRating?: number;
      onlineOnly?: boolean;
    };
    const fromText = extractConstraintsFromText(goal);
    const constraints = normalizeBuyerConstraints({
      ...fromText,
      maxTotalSpendCents: parsed.maxTotalSpendCents ?? fromText.maxTotalSpendCents,
      minRating: parsed.minRating ?? fromText.minRating,
      onlineOnly: parsed.onlineOnly ?? fromText.onlineOnly,
      ...uiConstraints,
    });
    return {
      intentLabel: parsed.intentLabel?.trim() || "general_marketplace_search",
      constraints,
      servedBy: "openai" as const,
    };
  }
}
