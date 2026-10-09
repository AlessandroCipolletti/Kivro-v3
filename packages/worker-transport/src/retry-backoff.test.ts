import { describe, expect, it } from "vitest";
import { computePollingBackoffMs, DEFAULT_POLLING_RETRY_POLICY } from "./retry-backoff.js";

describe("polling retry backoff", () => {
  it("stays within bounded delay (PORT-025)", () => {
    for (let i = 0; i < 10; i++) {
      const ms = computePollingBackoffMs(3, DEFAULT_POLLING_RETRY_POLICY);
      expect(ms).toBeGreaterThanOrEqual(0);
      expect(ms).toBeLessThanOrEqual(DEFAULT_POLLING_RETRY_POLICY.maxDelayMs);
    }
  });
});
