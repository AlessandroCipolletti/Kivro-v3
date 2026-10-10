import type { DeploymentProfile, PerformanceEnvelope } from "./performance-envelope.js";
import { assertMetricsWithinEnvelope } from "./performance-envelope.js";

/** HARD-020 — profile load/resilience checks within the selected envelope (synthetic). */

export type LoadSimulationResult = {
  profile: DeploymentProfile;
  simulatedConcurrentJobs: number;
  simulatedQueueDepth: number;
  withinEnvelope: boolean;
};

export function simulateProfileLoad(input: {
  envelope: PerformanceEnvelope;
  profile: DeploymentProfile;
  sellerCount: number;
  jobsPerSeller: number;
  queueDepth: number;
}): LoadSimulationResult & ({ ok: true } | { ok: false; reason: string }) {
  const concurrentJobs = input.sellerCount * input.jobsPerSeller;
  const check = assertMetricsWithinEnvelope({
    envelope: input.envelope,
    profile: input.profile,
    concurrentJobs,
    queueDepth: input.queueDepth,
    retryAttempts: input.envelope.shared.maxRetryAttemptsPerWorkItem,
  });
  const base = {
    profile: input.profile,
    simulatedConcurrentJobs: concurrentJobs,
    simulatedQueueDepth: input.queueDepth,
    withinEnvelope: check.ok,
  };
  if (!check.ok) {
    return { ...base, ok: false, reason: check.reason };
  }
  return { ...base, ok: true };
}

export function runEnvelopeLoadSuite(envelope: PerformanceEnvelope): {
  ok: true;
  results: LoadSimulationResult[];
} | {
  ok: false;
  reason: string;
  results: LoadSimulationResult[];
} {
  const profiles: DeploymentProfile[] = ["netsons", "aws"];
  const results: LoadSimulationResult[] = [];
  for (const profile of profiles) {
    const r = simulateProfileLoad({
      envelope,
      profile,
      sellerCount: 1,
      jobsPerSeller: envelope.shared.maxConcurrentJobsPerSeller,
      queueDepth: Math.min(50, envelope.shared.maxQueueDepthPerProfile),
    });
    results.push(r);
    if (!r.ok) {
      return { ok: false, reason: r.reason, results };
    }
  }
  return { ok: true, results };
}

/** Stress at envelope ceiling (queue depth at max) for both profiles. */
export function runEnvelopeQueueCeilingSuite(envelope: PerformanceEnvelope): {
  ok: true;
} | {
  ok: false;
  reason: string;
} {
  for (const profile of ["netsons", "aws"] as const) {
    const r = simulateProfileLoad({
      envelope,
      profile,
      sellerCount: 1,
      jobsPerSeller: envelope.shared.maxConcurrentJobsPerSeller,
      queueDepth: envelope.shared.maxQueueDepthPerProfile,
    });
    if (!r.ok) {
      return { ok: false, reason: r.reason };
    }
  }
  return { ok: true };
}
