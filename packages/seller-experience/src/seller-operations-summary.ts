import type { PrismaClient } from "@kivro/database";

/** SELLERUX-015 — actionable operations dashboard slice. */
export async function buildSellerOperationsSummary(
  prisma: PrismaClient,
  sellerProfileId: string,
): Promise<{
  runningJobs: number;
  queuedJobs: number;
  capabilitiesPublished: number;
  capabilitiesPaused: number;
  recentFailures: number;
}> {
  const [runningJobs, queuedJobs, caps, recentFailures] = await Promise.all([
    prisma.job.count({
      where: {
        status: { in: ["RUNNING", "STARTING", "UPLOADING_RESULT", "PAUSE_REQUESTED", "PAUSED"] },
        capabilityVersion: { capability: { sellerProfileId } },
      },
    }),
    prisma.job.count({
      where: {
        status: { in: ["QUEUED", "DISPATCHED", "ACCEPTED"] },
        capabilityVersion: { capability: { sellerProfileId } },
      },
    }),
    prisma.capability.groupBy({
      by: ["status"],
      where: { sellerProfileId },
      _count: true,
    }),
    prisma.job.count({
      where: {
        status: { in: ["FAILED_EXECUTION", "FAILED_STARTUP", "TIMED_OUT"] },
        createdAt: { gte: new Date(Date.now() - 7 * 86_400_000) },
        capabilityVersion: { capability: { sellerProfileId } },
      },
    }),
  ]);
  const published = caps.find((c) => c.status === "PUBLISHED")?._count ?? 0;
  const paused = caps.find((c) => c.status === "PAUSED")?._count ?? 0;
  return {
    runningJobs,
    queuedJobs,
    capabilitiesPublished: published,
    capabilitiesPaused: paused,
    recentFailures,
  };
}
