import { describe, expect, it } from "vitest";
import { assertProductLimitsWithinEnvelope } from "./envelope-product-limits.js";
import { parsePerformanceEnvelope } from "./performance-envelope.js";

const envelope = parsePerformanceEnvelope({
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
});

describe("product limits vs envelope (M27)", () => {
  it("M27-GOLD-008 rejects webhook attempts above envelope", () => {
    const r = assertProductLimitsWithinEnvelope({
      envelope,
      limits: {
        buyerWebhookMaxAttempts: 8,
        buyerWebhookRetryBatchLimit: 25,
        jobIoDefaultMaxFileSizeBytes: 52_428_800,
        pollingTransportMaxAttempts: 4,
        durableWorkMaxAttempts: 8,
        durableWorkDefaultBatchLimit: 25,
      },
    });
    expect(r.ok).toBe(false);
  });

  it("M27-GOLD-008 accepts aligned runtime limits", () => {
    const r = assertProductLimitsWithinEnvelope({
      envelope: {
        ...envelope,
        shared: { ...envelope.shared, maxWebhookDeliveryAttempts: 8 },
      },
      limits: {
        buyerWebhookMaxAttempts: 8,
        buyerWebhookRetryBatchLimit: 25,
        jobIoDefaultMaxFileSizeBytes: 52_428_800,
        pollingTransportMaxAttempts: 4,
        durableWorkMaxAttempts: 8,
        durableWorkDefaultBatchLimit: 25,
      },
    });
    expect(r.ok).toBe(true);
  });
});
