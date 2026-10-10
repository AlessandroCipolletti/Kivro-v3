import { buildMinimizedWorkerExecutionBundle } from "@kivro/buyer-experience";

const PRIVATE_INPUT_KEY = /email|payment|stripe|phone|address|profile|credential|secret|token/i;

/** Drop identity and secret fields before the seller or Worker sees structured input. */
export function stripNonExecutionInput(
  structuredInput: Record<string, unknown>,
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(structuredInput)) {
    if (PRIVATE_INPUT_KEY.test(key)) {
      continue;
    }
    out[key] = value;
  }
  return out;
}

/** SELLERUX-016 — execution-relevant inputs only; no buyer email/payment/profile. */
export function buildSellerJobExecutionView(input: {
  jobId: string;
  buyerId: string;
  sellerProfileId: string;
  structuredInput: Record<string, unknown>;
  workerManifest: unknown;
  status: string;
  capabilitySlug: string;
  buyerPaidCents: number;
  platformFeeCents: number;
  sellerNetCents: number;
}): {
  jobId: string;
  status: string;
  capabilitySlug: string;
  earnings: {
    buyerPaidCents: number;
    platformFeeCents: number;
    sellerNetCents: number;
    source: "job_price_snapshot";
  };
  workerBundle: ReturnType<typeof buildMinimizedWorkerExecutionBundle>;
  excludedFromWorkerPayload: string[];
} {
  return {
    jobId: input.jobId,
    status: input.status,
    capabilitySlug: input.capabilitySlug,
    earnings: {
      buyerPaidCents: input.buyerPaidCents,
      platformFeeCents: input.platformFeeCents,
      sellerNetCents: input.sellerNetCents,
      source: "job_price_snapshot",
    },
    workerBundle: buildMinimizedWorkerExecutionBundle({
      jobId: input.jobId,
      buyerId: input.buyerId,
      structuredInput: stripNonExecutionInput(input.structuredInput),
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
