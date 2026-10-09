export type PollingRetryPolicy = {
  maxAttempts: number;
  baseDelayMs: number;
  maxDelayMs: number;
  timeoutMs: number;
  jitterRatio: number;
};

export const DEFAULT_POLLING_RETRY_POLICY: PollingRetryPolicy = {
  maxAttempts: 4,
  baseDelayMs: 250,
  maxDelayMs: 8_000,
  timeoutMs: 30_000,
  jitterRatio: 0.2,
};

/** PORT-025 — bounded backoff with jitter between polling HTTP attempts. */
export function computePollingBackoffMs(
  attemptIndex: number,
  policy: PollingRetryPolicy = DEFAULT_POLLING_RETRY_POLICY,
): number {
  const exp = Math.min(
    policy.maxDelayMs,
    policy.baseDelayMs * 2 ** Math.max(0, attemptIndex),
  );
  const jitter = exp * policy.jitterRatio * (Math.random() * 2 - 1);
  return Math.max(0, Math.min(policy.maxDelayMs, Math.round(exp + jitter)));
}

export function sleepMs(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function fetchWithPollingRetry(
  input: string | URL,
  init: RequestInit | undefined,
  policy: PollingRetryPolicy = DEFAULT_POLLING_RETRY_POLICY,
): Promise<Response> {
  let lastError: unknown;
  for (let attempt = 0; attempt < policy.maxAttempts; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), policy.timeoutMs);
    try {
      const res = await fetch(input, { ...init, signal: controller.signal });
      clearTimeout(timer);
      if (res.ok || res.status < 500) {
        return res;
      }
      lastError = new Error(`HTTP_${res.status}`);
    } catch (err) {
      clearTimeout(timer);
      lastError = err;
    }
    if (attempt < policy.maxAttempts - 1) {
      await sleepMs(computePollingBackoffMs(attempt, policy));
    }
  }
  throw lastError instanceof Error ? lastError : new Error(String(lastError));
}
