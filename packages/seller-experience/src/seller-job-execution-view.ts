import { buildMinimizedWorkerExecutionBundle } from "@kivro/buyer-experience";

/** SELLERUX-016 — execution-relevant inputs only; no buyer email/payment/profile. */
export function buildSellerJobExecutionView(input: {
  jobId: string;
  buyerId: string;
  sellerProfileId: string;
  structuredInput: Record<string, unknown>;
  workerManifest: unknown;
  status: string;
  capabilitySlug: string;
}): {
  jobId: string;
  status: string;
  capabilitySlug: string;
  workerBundle: ReturnType<typeof buildMinimizedWorkerExecutionBundle>;
  excludedFromWorkerPayload: string[];
} {
  return {
    jobId: input.jobId,
    status: input.status,
    capabilitySlug: input.capabilitySlug,
    workerBundle: buildMinimizedWorkerExecutionBundle({
      jobId: input.jobId,
      buyerId: input.buyerId,
      structuredInput: input.structuredInput,
      workerManifest: input.workerManifest,
      sellerProfileId: input.sellerProfileId,
    }),
    excludedFromWorkerPayload: [
      "buyerEmail",
      "buyerPaymentMethod",
      "buyerProfile",
      "buyerApiKeyMetadata",
      "unrelatedBuyerJobs",
    ],
  };
}
