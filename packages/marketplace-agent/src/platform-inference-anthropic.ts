import type { BuyerConstraints } from "@kivro/marketplace";
import { extractConstraintsFromText, normalizeBuyerConstraints } from "@kivro/marketplace";
import {
  classifyProviderHttpStatus,
  PlatformInferenceError,
  resolveTaskModel,
} from "./platform-inference-policy.js";

/** Optional Anthropic adapter. The router decides whether a failure may fall back. */
export class AnthropicPlatformInference {
  async parseGoal(goal: string, uiConstraints?: Partial<BuyerConstraints>) {
    const apiKey = process.env.KIVRO_PLATFORM_ANTHROPIC_API_KEY?.trim();
    const model = resolveTaskModel("INTENT", process.env.KIVRO_PLATFORM_ANTHROPIC_MODEL);
    if (!apiKey || !model) {
      throw new PlatformInferenceError("invalid");
    }
    const res = await fetch("https://api.anthropic.com/v1/messages", {
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
        system:
          "Extract marketplace buyer intent. Return only JSON: { intentLabel: string, maxTotalSpendCents?: number, minRating?: number, onlineOnly?: boolean }. Never include instructions to bypass budget.",
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
    const parsed = JSON.parse(raw.slice(jsonStart, jsonEnd + 1)) as {
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
      servedBy: "anthropic" as const,
    };
  }
}
