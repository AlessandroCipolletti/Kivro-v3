import type { PrismaClient } from "@kivro/database";
import { computeSellerReliabilityForCapability } from "@kivro/buyer-experience";

/** SELLERUX-038 — seller-visible reliability contributors aligned with buyer semantics. */
export async function buildSellerReputationExplainability(
  prisma: PrismaClient,
  capabilityId: string,
): Promise<{
  capabilityId: string;
  snapshot: Awaited<ReturnType<typeof computeSellerReliabilityForCapability>>;
  sufficientSample: boolean;
  minSample: number;
}> {
  const snapshot = await computeSellerReliabilityForCapability(prisma, capabilityId);
  return {
    capabilityId,
    snapshot,
    sufficientSample: snapshot.eligibleJobs >= 5,
    minSample: 5,
  };
}
