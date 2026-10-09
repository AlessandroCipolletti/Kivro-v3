import type { WorkerTransportPort } from "@kivro/cloud-core";
import { assertTransportConformance } from "./shared.js";

/** Provider-neutral golden: two transports must parse poll payloads identically. */
export function assertTransportSemanticParity(a: WorkerTransportPort, b: WorkerTransportPort): void {
  assertTransportConformance(a);
  assertTransportConformance(b);
  const sample = {
    offers: [
      { jobId: "job-gold-1", workerId: "wd-1", capabilityVersionId: "cv-1" },
    ],
  };
  const pa = a.parsePollResponse(sample);
  const pb = b.parsePollResponse(sample);
  if (JSON.stringify(pa) !== JSON.stringify(pb)) {
    throw new Error("Transport semantic drift: poll parsing differs between adapters");
  }
}

/** Compare two transports without re-running wire self-tests (drift canary). */
export function assertPollParsingParity(a: WorkerTransportPort, b: WorkerTransportPort): void {
  const sample = {
    offers: [
      { jobId: "job-gold-1", workerId: "wd-1", capabilityVersionId: "cv-1" },
    ],
  };
  const pa = a.parsePollResponse(sample);
  const pb = b.parsePollResponse(sample);
  if (JSON.stringify(pa) !== JSON.stringify(pb)) {
    throw new Error("Transport semantic drift: poll parsing differs between adapters");
  }
}

/** Drift canary — non-conformant adapter must fail (CONFORMANCE.md). */
export function createBrokenTransportDriftProbe(base: WorkerTransportPort): WorkerTransportPort {
  return {
    ...base,
    parsePollResponse() {
      return {
        offers: [{ jobId: "job-gold-1", workerId: "wd-1", capabilityVersionId: "cv-DRIFT" }],
      };
    },
  };
}
