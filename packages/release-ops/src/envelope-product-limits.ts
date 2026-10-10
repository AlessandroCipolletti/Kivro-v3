import type { PerformanceEnvelope } from "./performance-envelope.js";

/** M27 — shared product/runtime caps must align with documented envelope. */

export type ProductRuntimeLimits = {
  buyerWebhookMaxAttempts: number;
  buyerWebhookRetryBatchLimit: number;
  jobIoDefaultMaxFileSizeBytes: number;
  pollingTransportMaxAttempts: number;
  durableWorkMaxAttempts: number;
  durableWorkDefaultBatchLimit: number;
};

export function assertProductLimitsWithinEnvelope(input: {
  envelope: PerformanceEnvelope;
  limits: ProductRuntimeLimits;
}): { ok: true } | { ok: false; reason: string } {
  const { envelope, limits } = input;
  if (limits.buyerWebhookMaxAttempts > envelope.shared.maxWebhookDeliveryAttempts) {
    return {
      ok: false,
      reason: "buyer webhook max attempts exceeds envelope maxWebhookDeliveryAttempts",
    };
  }
  if (limits.jobIoDefaultMaxFileSizeBytes > envelope.shared.maxUploadBytesPerJob) {
    return {
      ok: false,
      reason: "job-io default max file size exceeds envelope maxUploadBytesPerJob",
    };
  }
  if (limits.pollingTransportMaxAttempts > envelope.shared.maxWebhookDeliveryAttempts) {
    return {
      ok: false,
      reason: "polling transport max attempts exceeds envelope transport retry budget",
    };
  }
  if (limits.durableWorkMaxAttempts > envelope.shared.maxRetryAttemptsPerWorkItem) {
    return {
      ok: false,
      reason: "durable work max attempts exceeds envelope maxRetryAttemptsPerWorkItem",
    };
  }
  for (const profile of ["netsons", "aws"] as const) {
    const batchCap = envelope.profiles[profile]?.maxDurableWorkBatchSize;
    if (batchCap == null) {
      return { ok: false, reason: `envelope missing profile ${profile}` };
    }
    if (limits.durableWorkDefaultBatchLimit > batchCap) {
      return {
        ok: false,
        reason: `durable work batch limit exceeds ${profile} maxDurableWorkBatchSize`,
      };
    }
    if (limits.buyerWebhookRetryBatchLimit > batchCap) {
      return {
        ok: false,
        reason: `webhook retry batch exceeds ${profile} maxDurableWorkBatchSize`,
      };
    }
  }
  return { ok: true };
}
