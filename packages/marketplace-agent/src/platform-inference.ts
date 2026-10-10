import type { BuyerConstraints } from "@kivro/marketplace";
import { extractConstraintsFromText } from "@kivro/marketplace";
import { OpenAiPlatformInference } from "./platform-inference-openai.js";
import { AnthropicPlatformInference } from "./platform-inference-anthropic.js";
import { normalizeInferenceRequest, type PlatformInferenceRequest, type PlatformInferenceResponse } from "./inference-request.js";
import {
  consumeInferenceBudget,
  mayFallback,
  PlatformInferenceError,
  readPlatformInferenceHealth,
  secondaryProvider,
  type ProviderId,
} from "./platform-inference-policy.js";

/** §146 — platform-owned inference. Paid providers never settle buyer jobs. */
export type PlatformIntent = {
  intentLabel: string;
  constraints: BuyerConstraints;
  servedBy: ProviderId;
  budgetLimited?: boolean;
  usage?: {
    model: string | null;
    inputTokens: number | null;
    outputTokens: number | null;
    cachedInputTokens: number | null;
    latencyMs: number | null;
  };
};

export type InferenceCallOptions = { userId?: string };

export interface PlatformInferencePort {
  parseGoal(
    goal: string,
    uiConstraints?: Partial<BuyerConstraints>,
    options?: InferenceCallOptions,
  ): Promise<PlatformIntent>;
  generate(request: PlatformInferenceRequest): Promise<PlatformInferenceResponse>;
}

export class DeterministicPlatformInference implements PlatformInferencePort {
  async parseGoal(goal: string, uiConstraints?: Partial<BuyerConstraints>): Promise<PlatformIntent> {
    const fromText = extractConstraintsFromText(goal);
    const constraints = { ...fromText, ...uiConstraints };
    return { intentLabel: inferIntentLabel(goal), constraints, servedBy: "deterministic" };
  }

  async generate(request: PlatformInferenceRequest): Promise<PlatformInferenceResponse> {
    const normalized = normalizeInferenceRequest(request);
    return {
      provider: "deterministic",
      model: "local",
      text: normalized.messages.map((message) => message.content).join("\n"),
    };
  }
}

function inferIntentLabel(goal: string): string {
  const lower = goal.toLowerCase();
  if (/\bcompetitor|\bresearch|\banaly/.test(lower)) {
    return "research_and_report";
  }
  if (/\bpdf|\breport/.test(lower)) {
    return "document_generation";
  }
  return "general_marketplace_search";
}

export class RoutingPlatformInference implements PlatformInferencePort {
  constructor(
    private readonly providers: Partial<Record<"openai" | "anthropic", PlatformInferencePort>>,
    private readonly deterministic: PlatformInferencePort,
    private readonly env: Record<string, string | undefined> = process.env,
    private readonly now: () => number = Date.now,
  ) {}

  async parseGoal(
    goal: string,
    uiConstraints?: Partial<BuyerConstraints>,
    options?: InferenceCallOptions,
  ): Promise<PlatformIntent> {
    const health = readPlatformInferenceHealth(this.env);
    const budget = consumeInferenceBudget({
      userId: options?.userId ?? "anonymous",
      nowMs: this.now(),
      maxPerMinute: health.maxRequestsPerMinute,
    });
    if (budget === "deny") {
      const limited = await this.deterministic.parseGoal(goal, uiConstraints, options);
      return { ...limited, servedBy: "deterministic", budgetLimited: true };
    }
    const primaryId = health.primary;
    if (primaryId === "deterministic") {
      return this.deterministic.parseGoal(goal, uiConstraints, options);
    }
    const primary = await this.attempt(primaryId, goal, uiConstraints, options);
    if (primary.intent) {
      return primary.intent;
    }
    const secondary = secondaryProvider(primaryId, this.env);
    if (secondary && primary.failure && mayFallback(primary.failure, health.fallbackEnabled)) {
      const next = await this.attempt(secondary, goal, uiConstraints, options);
      if (next.intent) {
        return next.intent;
      }
    }
    return this.deterministic.parseGoal(goal, uiConstraints, options);
  }

  async generate(request: PlatformInferenceRequest): Promise<PlatformInferenceResponse> {
    const normalized = normalizeInferenceRequest(request);
    const health = readPlatformInferenceHealth(this.env);
    const budget = consumeInferenceBudget({
      userId: normalized.metadata.userId ?? "anonymous",
      nowMs: this.now(),
      maxPerMinute: health.maxRequestsPerMinute,
    });
    if (budget === "deny" || health.primary === "deterministic") {
      return this.deterministic.generate(normalized);
    }
    const primary = this.providers[health.primary];
    if (!primary) {
      return this.deterministic.generate(normalized);
    }
    try {
      return await primary.generate(normalized);
    } catch (error) {
      const failure = error instanceof PlatformInferenceError ? error.failure : "invalid";
      const secondary = secondaryProvider(health.primary, this.env);
      if (secondary && mayFallback(failure, health.fallbackEnabled)) {
        const next = this.providers[secondary];
        if (next) {
          return next.generate(normalized);
        }
      }
      return this.deterministic.generate(normalized);
    }
  }

  private async attempt(
    id: "openai" | "anthropic",
    goal: string,
    uiConstraints?: Partial<BuyerConstraints>,
    options?: InferenceCallOptions,
  ): Promise<{ intent?: PlatformIntent; failure?: PlatformInferenceError["failure"] }> {
    const provider = this.providers[id];
    if (!provider) {
      return { failure: "invalid" };
    }
    try {
      return { intent: await provider.parseGoal(goal, uiConstraints, options) };
    } catch (error) {
      const failure = error instanceof PlatformInferenceError ? error.failure : "invalid";
      if (failure !== "retryable") {
        return { failure };
      }
      try {
        return { intent: await provider.parseGoal(goal, uiConstraints, options) };
      } catch (retryError) {
        return {
          failure: retryError instanceof PlatformInferenceError ? retryError.failure : "invalid",
        };
      }
    }
  }
}

let cached: PlatformInferencePort | undefined;

export function getPlatformInference(): PlatformInferencePort {
  if (!cached) {
    cached = new RoutingPlatformInference(
      {
        openai: new OpenAiPlatformInference(),
        anthropic: new AnthropicPlatformInference(),
      },
      new DeterministicPlatformInference(),
    );
  }
  return cached;
}

export function resetPlatformInferenceCache(): void {
  cached = undefined;
}
