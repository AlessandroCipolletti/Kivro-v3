export type InferenceUsageTask = "INTENT" | "RECOMMENDATION" | "ORCHESTRATION";

export type PlatformInferenceUsage = {
  task: InferenceUsageTask;
  provider: string;
  model: string | null;
  inputTokens: number | null;
  outputTokens: number | null;
  cachedInputTokens: number | null;
  estimatedCostCents: number | null;
  latencyMs: number | null;
};

function wholeTokens(value: unknown): number | null {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
    return null;
  }
  return Math.floor(value);
}

/** §175 — usage is measured separately from seller job cost, and the prompt is never stored. */
export function buildInferenceUsageRecord(input: {
  task: InferenceUsageTask;
  provider: string;
  model?: string | null;
  inputTokens?: number | null;
  outputTokens?: number | null;
  cachedInputTokens?: number | null;
  latencyMs?: number | null;
  prompt?: string;
  goal?: string;
}): PlatformInferenceUsage {
  const inputTokens = wholeTokens(input.inputTokens);
  const outputTokens = wholeTokens(input.outputTokens);
  return {
    task: input.task,
    provider: input.provider,
    model: input.model?.trim() || null,
    inputTokens,
    outputTokens,
    cachedInputTokens: wholeTokens(input.cachedInputTokens),
    estimatedCostCents: null,
    latencyMs: wholeTokens(input.latencyMs),
  };
}

export function usageFromOpenAiBody(body: unknown): {
  inputTokens: number | null;
  outputTokens: number | null;
  cachedInputTokens: number | null;
} {
  const usage = (body as { usage?: Record<string, unknown> } | null)?.usage;
  return {
    inputTokens: wholeTokens(usage?.prompt_tokens),
    outputTokens: wholeTokens(usage?.completion_tokens),
    cachedInputTokens: wholeTokens(
      (usage?.prompt_tokens_details as { cached_tokens?: unknown } | undefined)?.cached_tokens,
    ),
  };
}

export function usageFromAnthropicBody(body: unknown): {
  inputTokens: number | null;
  outputTokens: number | null;
  cachedInputTokens: number | null;
} {
  const usage = (body as { usage?: Record<string, unknown> } | null)?.usage;
  return {
    inputTokens: wholeTokens(usage?.input_tokens),
    outputTokens: wholeTokens(usage?.output_tokens),
    cachedInputTokens: wholeTokens(usage?.cache_read_input_tokens),
  };
}

export function aggregateInferenceUsage(rows: PlatformInferenceUsage[]): {
  calls: number;
  pricedCalls: number;
  unpricedCalls: number;
  estimatedCostCents: number;
} {
  const priced = rows.filter((row) => row.estimatedCostCents != null);
  return {
    calls: rows.length,
    pricedCalls: priced.length,
    unpricedCalls: rows.length - priced.length,
    estimatedCostCents: priced.reduce((sum, row) => sum + (row.estimatedCostCents ?? 0), 0),
  };
}
