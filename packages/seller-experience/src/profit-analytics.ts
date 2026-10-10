import type { PrismaClient } from "@kivro/database";

/** SELLERUX-019 — gross, fees, provider cost, net (estimated provider separate). */
export async function buildSellerProfitAnalytics(
  prisma: PrismaClient,
  sellerProfileId: string,
  windowDays = 90,
): Promise<{
  grossSalesCents: number;
  platformFeesCents: number;
  estimatedProviderCostCents: number;
  sellerNetCents: number;
  completedJobs: number;
}> {
  const since = new Date(Date.now() - windowDays * 86_400_000);
  const jobs = await prisma.job.findMany({
    where: {
      status: "COMPLETED",
      completedAt: { gte: since },
      capabilityVersion: { capability: { sellerProfileId } },
    },
    select: {
      priceSnapshotCents: true,
      platformFeeSnapshotCents: true,
      sellerNetSnapshotCents: true,
      estimatedProviderCostCents: true,
    },
    take: 2000,
  });
  let grossSalesCents = 0;
  let platformFeesCents = 0;
  let sellerNetCents = 0;
  let estimatedProviderCostCents = 0;
  for (const job of jobs) {
    grossSalesCents += job.priceSnapshotCents;
    platformFeesCents += job.platformFeeSnapshotCents ?? 0;
    sellerNetCents += job.sellerNetSnapshotCents ?? 0;
    estimatedProviderCostCents += job.estimatedProviderCostCents ?? 0;
  }
  return {
    grossSalesCents,
    platformFeesCents,
    estimatedProviderCostCents,
    sellerNetCents,
    completedJobs: jobs.length,
  };
}
