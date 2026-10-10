import { createHash } from "node:crypto";

/** BUYERUX-037..038 — pseudonymous correlation token instead of buyer identity. */
export function buildBuyerCorrelationToken(jobId: string, buyerId: string): string {
  return createHash("sha256").update(`${jobId}:${buyerId}:kivro-buyer-correlation`).digest("hex").slice(0, 32);
}

export type MinimizedWorkerExecutionBundle = {
  jobId: string;
  buyerCorrelationToken: string;
  structuredInput: Record<string, unknown>;
  workerManifest: unknown;
  sellerProfileId: string;
};

export function buildMinimizedWorkerExecutionBundle(input: {
  jobId: string;
  buyerId: string;
  structuredInput: Record<string, unknown>;
  workerManifest: unknown;
  sellerProfileId: string;
}): MinimizedWorkerExecutionBundle {
  return {
    jobId: input.jobId,
    buyerCorrelationToken: buildBuyerCorrelationToken(input.jobId, input.buyerId),
    structuredInput: input.structuredInput,
    workerManifest: input.workerManifest,
    sellerProfileId: input.sellerProfileId,
  };
}
