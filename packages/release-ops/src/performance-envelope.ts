/** HARD-019 — documented MVP resource/performance envelopes. */

export type DeploymentProfile = "netsons" | "aws";

export type PerformanceEnvelope = {
  milestone: string;
  description: string;
  shared: {
    maxConcurrentJobsPerSeller: number;
    maxQueueDepthPerProfile: number;
    maxApiRequestsPerSecondPerInstance: number;
    maxUploadBytesPerJob: number;
    maxRetryAttemptsPerWorkItem: number;
    maxWebhookDeliveryAttempts: number;
  };
  profiles: Record<
    DeploymentProfile,
    {
      maxDurableWorkBatchSize: number;
      maxWorkerPollIntervalSeconds: number;
    }
  >;
};

export function parsePerformanceEnvelope(raw: unknown): PerformanceEnvelope {
  if (!raw || typeof raw !== "object") {
    throw new Error("PERFORMANCE_ENVELOPE_INVALID");
  }
  const doc = raw as PerformanceEnvelope;
  for (const key of ["shared", "profiles"] as const) {
    if (!(key in doc)) {
      throw new Error(`PERFORMANCE_ENVELOPE_MISSING_${key.toUpperCase()}`);
    }
  }
  return doc;
}

export function assertMetricsWithinEnvelope(input: {
  envelope: PerformanceEnvelope;
  profile: DeploymentProfile;
  concurrentJobs: number;
  queueDepth: number;
  retryAttempts: number;
  uploadBytes?: number;
}): { ok: true } | { ok: false; reason: string } {
  const { envelope, profile } = input;
  if (input.concurrentJobs > envelope.shared.maxConcurrentJobsPerSeller) {
    return {
      ok: false,
      reason: `concurrentJobs ${input.concurrentJobs} exceeds maxConcurrentJobsPerSeller`,
    };
  }
  if (input.queueDepth > envelope.shared.maxQueueDepthPerProfile) {
    return {
      ok: false,
      reason: `queueDepth ${input.queueDepth} exceeds maxQueueDepthPerProfile`,
    };
  }
  if (input.retryAttempts > envelope.shared.maxRetryAttemptsPerWorkItem) {
    return {
      ok: false,
      reason: `retryAttempts ${input.retryAttempts} exceeds maxRetryAttemptsPerWorkItem`,
    };
  }
  if (
    input.uploadBytes != null &&
    input.uploadBytes > envelope.shared.maxUploadBytesPerJob
  ) {
    return {
      ok: false,
      reason: `uploadBytes ${input.uploadBytes} exceeds maxUploadBytesPerJob`,
    };
  }
  const profileLimits = envelope.profiles[profile];
  if (!profileLimits) {
    return { ok: false, reason: `unknown profile ${profile}` };
  }
  return { ok: true };
}
