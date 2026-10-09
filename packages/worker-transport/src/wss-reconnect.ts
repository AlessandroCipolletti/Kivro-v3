import { DEFAULT_POLLING_RETRY_POLICY, type PollingRetryPolicy, computePollingBackoffMs, sleepMs } from "./retry-backoff.js";

export type WssReconnectPolicy = Pick<
  PollingRetryPolicy,
  "maxAttempts" | "baseDelayMs" | "maxDelayMs" | "jitterRatio"
>;

export const DEFAULT_WSS_RECONNECT_POLICY: WssReconnectPolicy = {
  maxAttempts: DEFAULT_POLLING_RETRY_POLICY.maxAttempts,
  baseDelayMs: DEFAULT_POLLING_RETRY_POLICY.baseDelayMs,
  maxDelayMs: DEFAULT_POLLING_RETRY_POLICY.maxDelayMs,
  jitterRatio: DEFAULT_POLLING_RETRY_POLICY.jitterRatio,
};

/** PORT-026 — reconnect/backoff schedule (replay-safe handling is application-layer). */
export async function runWithWssReconnect<T>(
  connect: () => Promise<T>,
  policy: WssReconnectPolicy = DEFAULT_WSS_RECONNECT_POLICY,
): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt < policy.maxAttempts; attempt++) {
    try {
      return await connect();
    } catch (err) {
      lastError = err;
      if (attempt < policy.maxAttempts - 1) {
        await sleepMs(
          computePollingBackoffMs(attempt, {
            ...DEFAULT_POLLING_RETRY_POLICY,
            ...policy,
          }),
        );
      }
    }
  }
  throw lastError instanceof Error ? lastError : new Error(String(lastError));
}
