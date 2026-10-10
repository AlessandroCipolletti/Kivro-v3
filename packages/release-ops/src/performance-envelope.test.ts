import { describe, expect, it } from "vitest";
import { assertMetricsWithinEnvelope, parsePerformanceEnvelope } from "./performance-envelope.js";

const fixture = {
  milestone: "M27",
  description: "test",
  shared: {
    maxConcurrentJobsPerSeller: 3,
    maxQueueDepthPerProfile: 500,
    maxApiRequestsPerSecondPerInstance: 50,
    maxUploadBytesPerJob: 52_428_800,
    maxRetryAttemptsPerWorkItem: 8,
    maxWebhookDeliveryAttempts: 5,
  },
  profiles: {
    netsons: { maxDurableWorkBatchSize: 100, maxWorkerPollIntervalSeconds: 30 },
    aws: { maxDurableWorkBatchSize: 100, maxWorkerPollIntervalSeconds: 15 },
  },
};

describe("performance envelope (M27 / HARD-019)", () => {
  it("M27-GOLD-001 accepts metrics within MVP envelope", () => {
    const envelope = parsePerformanceEnvelope(fixture);
    expect(
      assertMetricsWithinEnvelope({
        envelope,
        profile: "netsons",
        concurrentJobs: 3,
        queueDepth: 100,
        retryAttempts: 5,
      }).ok,
    ).toBe(true);
  });

  it("M27-GOLD-001 rejects queue depth above envelope", () => {
    const envelope = parsePerformanceEnvelope(fixture);
    const r = assertMetricsWithinEnvelope({
      envelope,
      profile: "aws",
      concurrentJobs: 1,
      queueDepth: 501,
      retryAttempts: 1,
    });
    expect(r.ok).toBe(false);
  });
});
