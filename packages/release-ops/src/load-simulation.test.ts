import { describe, expect, it } from "vitest";
import { parsePerformanceEnvelope } from "./performance-envelope.js";
import {
  runEnvelopeLoadSuite,
  runEnvelopeQueueCeilingSuite,
  simulateProfileLoad,
} from "./load-simulation.js";

const envelope = parsePerformanceEnvelope({
  milestone: "M27",
  description: "test",
  shared: {
    maxConcurrentJobsPerSeller: 3,
    maxQueueDepthPerProfile: 500,
    maxApiRequestsPerSecondPerInstance: 50,
    maxUploadBytesPerJob: 52_428_800,
    maxRetryAttemptsPerWorkItem: 8,
    maxWebhookDeliveryAttempts: 8,
  },
  profiles: {
    netsons: { maxDurableWorkBatchSize: 100, maxWorkerPollIntervalSeconds: 30 },
    aws: { maxDurableWorkBatchSize: 100, maxWorkerPollIntervalSeconds: 15 },
  },
});

describe("profile load simulation (M27 / HARD-020)", () => {
  it("M27-GOLD-004 netsons load stays within envelope", () => {
    const r = simulateProfileLoad({
      envelope,
      profile: "netsons",
      sellerCount: 1,
      jobsPerSeller: 3,
      queueDepth: 40,
    });
    expect(r.ok).toBe(true);
  });

  it("M27-GOLD-004 aws load stays within envelope", () => {
    const r = simulateProfileLoad({
      envelope,
      profile: "aws",
      sellerCount: 1,
      jobsPerSeller: 3,
      queueDepth: 40,
    });
    expect(r.ok).toBe(true);
  });

  it("runEnvelopeLoadSuite passes both profiles", () => {
    expect(runEnvelopeLoadSuite(envelope).ok).toBe(true);
  });

  it("M27-GOLD-009 queue ceiling simulation stays within envelope", () => {
    expect(runEnvelopeQueueCeilingSuite(envelope).ok).toBe(true);
  });

  it("M27-GOLD-004 rejects load above concurrent job envelope", () => {
    const r = simulateProfileLoad({
      envelope,
      profile: "netsons",
      sellerCount: 2,
      jobsPerSeller: 3,
      queueDepth: 10,
    });
    expect(r.ok).toBe(false);
  });
});
