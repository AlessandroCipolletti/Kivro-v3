import { describe, expect, it } from "vitest";
import { assertRuntimeWithinEnvelope } from "./bounded-runtime.js";
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

describe("bounded runtime vs envelope (M27)", () => {
  it("M27-GOLD-006 accepts cloud-core defaults within envelope", () => {
    expect(
      assertRuntimeWithinEnvelope({
        envelope,
        durableWorkMaxAttempts: 8,
        durableWorkDefaultBatchLimit: 25,
      }).ok,
    ).toBe(true);
  });

  it("rejects retry budget above envelope", () => {
    const r = assertRuntimeWithinEnvelope({
      envelope,
      durableWorkMaxAttempts: 9,
      durableWorkDefaultBatchLimit: 25,
    });
    expect(r.ok).toBe(false);
  });
});
