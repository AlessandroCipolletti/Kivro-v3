import type { PrismaClient } from "@kivro/database";
import { evaluateCapabilityAvailability } from "./availability-service.js";

export type MarketplaceAvailabilitySummary = {
  capabilityId: string;
  status: string;
  accepting: boolean;
  nextAvailableAt: string | null;
  reasons: string[];
};

/** §405 — search/agent payload: availability + next open time per capability. */
export async function summarizeMarketplaceAvailability(
  prisma: PrismaClient,
  capabilityIds: string[],
): Promise<MarketplaceAvailabilitySummary[]> {
  if (capabilityIds.length === 0) {
    return [];
  }
  const summaries: MarketplaceAvailabilitySummary[] = [];
  for (const capabilityId of capabilityIds) {
    const evaluation = await evaluateCapabilityAvailability(prisma, capabilityId);
    if ("error" in evaluation) {
      continue;
    }
    summaries.push({
      capabilityId,
      status: evaluation.buyerAvailability,
      accepting: evaluation.accepting,
      nextAvailableAt: evaluation.nextAvailableAt ?? null,
      reasons: evaluation.reasons,
    });
  }
  return summaries;
}
