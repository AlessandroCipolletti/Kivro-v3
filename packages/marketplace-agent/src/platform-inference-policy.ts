/** Master Spec §§173–176, §180, §185 — inference policy. No ledger writes. */

export type ProviderId = "openai" | "anthropic" | "deterministic";

/** §167 — per-task model selection. Names come from configuration, not source. */
export type InferenceTask = "INTENT" | "RECOMMENDATION" | "ORCHESTRATION";

export const CONFIGURED_INFERENCE_TASKS = [
  "intentExtraction",
  "discoveryRerank",
  "recommendation",
  "orchestrationPlanning",
  "resultSynthesis",
] as const;

export type ConfiguredInferenceTask = (typeof CONFIGURED_INFERENCE_TASKS)[number];

const TASK_MODEL_ENV: Record<InferenceTask, string> = {
  INTENT: "KIVRO_PLATFORM_AI_MODEL_INTENT",
  RECOMMENDATION: "KIVRO_PLATFORM_AI_MODEL_RECOMMENDATION",
  ORCHESTRATION: "KIVRO_PLATFORM_AI_MODEL_ORCHESTRATION",
};

const CONFIGURED_TASK_MODEL_ENV: Record<ConfiguredInferenceTask, string> = {
  intentExtraction: "KIVRO_PLATFORM_AI_MODEL_INTENT",
  discoveryRerank: "KIVRO_PLATFORM_AI_MODEL_DISCOVERY",
  recommendation: "KIVRO_PLATFORM_AI_MODEL_RECOMMENDATION",
  orchestrationPlanning: "KIVRO_PLATFORM_AI_MODEL_ORCHESTRATION",
  resultSynthesis: "KIVRO_PLATFORM_AI_MODEL_SYNTHESIS",
};

const CONFIGURED_TASK_PROVIDER_ENV: Record<ConfiguredInferenceTask, string> = {
  intentExtraction: "KIVRO_PLATFORM_AI_PROVIDER_INTENT",
  discoveryRerank: "KIVRO_PLATFORM_AI_PROVIDER_DISCOVERY",
  recommendation: "KIVRO_PLATFORM_AI_PROVIDER_RECOMMENDATION",
  orchestrationPlanning: "KIVRO_PLATFORM_AI_PROVIDER_ORCHESTRATION",
  resultSynthesis: "KIVRO_PLATFORM_AI_PROVIDER_SYNTHESIS",
};

export function resolveTaskModel(
  task: InferenceTask,
  providerModel: string | null | undefined,
  env: Record<string, string | undefined> = process.env,
): string | null {
  const override = env[TASK_MODEL_ENV[task]]?.trim();
  if (override) {
    return override;
  }
  const base = providerModel?.trim();
  return base || null;
}

export function resolveConfiguredTaskModel(
  task: ConfiguredInferenceTask,
  providerModel: string | null | undefined,
  env: Record<string, string | undefined> = process.env,
): string | null {
  const override = env[CONFIGURED_TASK_MODEL_ENV[task]]?.trim();
  if (override) {
    return override;
  }
  const base = providerModel?.trim();
  return base || null;
}

export function taskRoutingHealth(
  env: Record<string, string | undefined> = process.env,
): Array<{ task: ConfiguredInferenceTask; healthy: boolean }> {
  const available = {
    openai: Boolean(env.KIVRO_PLATFORM_OPENAI_API_KEY?.trim()),
    anthropic: Boolean(env.KIVRO_PLATFORM_ANTHROPIC_API_KEY?.trim()),
    deterministic: true,
  };
  return CONFIGURED_INFERENCE_TASKS.map((task) => {
    const requested = env[CONFIGURED_TASK_PROVIDER_ENV[task]]?.trim() || "deterministic";
    if (requested !== "openai" && requested !== "anthropic" && requested !== "deterministic") {
      return { task, healthy: false };
    }
    const providerModel =
      requested === "openai"
        ? env.KIVRO_PLATFORM_OPENAI_MODEL
        : requested === "anthropic"
          ? env.KIVRO_PLATFORM_ANTHROPIC_MODEL
          : "local";
    return {
      task,
      healthy: available[requested] && Boolean(resolveConfiguredTaskModel(task, providerModel, env)),
    };
  });
}

export type ProviderFailureClass = "retryable" | "policy" | "budget" | "invalid";

export type PlatformInferenceHealth = {
  openai: { configured: boolean; model: string | null };
  anthropic: { configured: boolean; model: string | null };
  primary: ProviderId;
  fallbackEnabled: boolean;
  maxRequestsPerMinute: number;
  tasks: Array<{ task: ConfiguredInferenceTask; healthy: boolean }>;
};

const hits = new Map<string, number[]>();

export function classifyProviderHttpStatus(status: number): ProviderFailureClass {
  if (status === 429 || status === 408 || status >= 500) {
    return "retryable";
  }
  if (status === 401 || status === 403) {
    return "policy";
  }
  return "invalid";
}

export function mayFallback(failure: ProviderFailureClass, fallbackEnabled: boolean): boolean {
  return fallbackEnabled && failure === "retryable";
}

export function consumeInferenceBudget(input: {
  userId: string;
  nowMs: number;
  maxPerMinute: number;
  windowMs?: number;
}): "allow" | "deny" {
  const windowMs = input.windowMs ?? 60_000;
  const key = input.userId.trim() || "anonymous";
  const recent = (hits.get(key) ?? []).filter((at) => input.nowMs - at < windowMs);
  if (recent.length >= input.maxPerMinute) {
    hits.set(key, recent);
    return "deny";
  }
  recent.push(input.nowMs);
  hits.set(key, recent);
  return "allow";
}

export function resetInferenceBudgetForTests(): void {
  hits.clear();
}

export function readPlatformInferenceHealth(
  env: Record<string, string | undefined> = process.env,
): PlatformInferenceHealth {
  const openaiKey = Boolean(env.KIVRO_PLATFORM_OPENAI_API_KEY?.trim());
  const anthropicKey = Boolean(env.KIVRO_PLATFORM_ANTHROPIC_API_KEY?.trim());
  return {
    openai: {
      configured: openaiKey,
      model: openaiKey ? resolveTaskModel("INTENT", env.KIVRO_PLATFORM_OPENAI_MODEL, env) : null,
    },
    anthropic: {
      configured: anthropicKey,
      model: anthropicKey ? resolveTaskModel("INTENT", env.KIVRO_PLATFORM_ANTHROPIC_MODEL, env) : null,
    },
    primary: selectPrimaryProvider(env),
    fallbackEnabled: env.KIVRO_PLATFORM_AI_FALLBACK === "true",
    maxRequestsPerMinute: Number(env.KIVRO_PLATFORM_INFERENCE_MAX_PER_MINUTE ?? 30) || 30,
    tasks: taskRoutingHealth(env),
  };
}

export function selectPrimaryProvider(env: Record<string, string | undefined>): ProviderId {
  const requested = env.KIVRO_PLATFORM_AI_PROVIDER?.trim();
  if (requested === "deterministic" || requested === "openai" || requested === "anthropic") {
    return requested;
  }
  if (env.KIVRO_PLATFORM_OPENAI_API_KEY?.trim()) {
    return "openai";
  }
  if (env.KIVRO_PLATFORM_ANTHROPIC_API_KEY?.trim()) {
    return "anthropic";
  }
  return "deterministic";
}

export function secondaryProvider(
  primary: ProviderId,
  env: Record<string, string | undefined>,
): "openai" | "anthropic" | null {
  if (primary === "openai" && env.KIVRO_PLATFORM_ANTHROPIC_API_KEY?.trim()) {
    return "anthropic";
  }
  if (primary === "anthropic" && env.KIVRO_PLATFORM_OPENAI_API_KEY?.trim()) {
    return "openai";
  }
  return null;
}

export class PlatformInferenceError extends Error {
  constructor(readonly failure: ProviderFailureClass) {
    super(failure);
    this.name = "PlatformInferenceError";
  }
}
