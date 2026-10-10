import type { InferenceTask } from "./platform-inference-policy.js";

/** §187 — features are declared in configuration, not assumed from a model name. */
export function requiredFeaturesForTask(task: InferenceTask): string[] {
  if (task === "INTENT") {
    return ["structured_output"];
  }
  return ["tool_calling"];
}

export function modelMeetsTask(declaredFeatures: string[], task: InferenceTask): boolean {
  const have = new Set(declaredFeatures.map((feature) => feature.trim().toLowerCase()));
  return requiredFeaturesForTask(task).every((feature) => have.has(feature));
}

export type InferenceUsageRecord = {
  task: InferenceTask;
  provider: string;
  model: string | null;
  success: boolean;
  failureCategory?: string;
  latencyMs?: number;
  toolCallCount: number;
};

/** §182 — metadata only. Prompts stay out unless a dev flag redacts them. */
export function safeInferenceLog(
  record: InferenceUsageRecord & { prompt?: string; response?: string },
  env: Record<string, string | undefined> = process.env,
): Record<string, unknown> {
  const safe: Record<string, unknown> = {
    task: record.task,
    provider: record.provider,
    model: record.model,
    success: record.success,
    failureCategory: record.failureCategory ?? null,
    latencyMs: record.latencyMs ?? null,
    toolCallCount: record.toolCallCount,
  };
  if (env.KIVRO_PLATFORM_AI_DEBUG === "true") {
    safe.debug = true;
    safe.prompt = redactSensitive(record.prompt ?? "");
    safe.response = redactSensitive(record.response ?? "");
  }
  return safe;
}

function redactSensitive(text: string): string {
  return text
    .replace(/sk-[A-Za-z0-9_-]+/g, "[REDACTED]")
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[REDACTED]");
}

/** §181 — routing changes are auditable and never include secrets. */
export function routingChangeAudit(input: {
  task: InferenceTask;
  previousModel: string | null;
  nextModel: string | null;
}): Record<string, unknown> {
  return {
    type: "PLATFORM_INFERENCE_ROUTING_CHANGE",
    task: input.task,
    previousModel: input.previousModel,
    nextModel: input.nextModel,
  };
}
