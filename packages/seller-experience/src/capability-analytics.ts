import type { PrismaClient } from "@kivro/database";

/** SELLERUX-021 — funnel/reliability without buyer-private fields. */
export async function buildCapabilityAnalytics(
  prisma: PrismaClient,
  sellerProfileId: string,
  capabilityId: string,
): Promise<
  | { error: "NOT_FOUND" }
  | {
      capabilityId: string;
      jobsCreated: number;
      jobsCompleted: number;
      jobsFailed: number;
      completionRate: number | null;
      revenueCents: number;
      avgRuntimeMinutes: number | null;
    }
> {
  const cap = await prisma.capability.findFirst({
    where: { id: capabilityId, sellerProfileId },
    select: { id: true },
  });
  if (!cap) {
    return { error: "NOT_FOUND" };
  }
  const since = new Date(Date.now() - 90 * 86_400_000);
  const jobs = await prisma.job.findMany({
    where: { capabilityId, createdAt: { gte: since } },
    select: {
      status: true,
      startedAt: true,
      completedAt: true,
      sellerNetSnapshotCents: true,
    },
    take: 1000,
  });
  let completed = 0;
  let failed = 0;
  let revenueCents = 0;
  const runtimes: number[] = [];
  for (const job of jobs) {
    if (job.status === "COMPLETED") {
      completed += 1;
      revenueCents += job.sellerNetSnapshotCents ?? 0;
      if (job.startedAt && job.completedAt) {
        runtimes.push((job.completedAt.getTime() - job.startedAt.getTime()) / 60_000);
      }
    } else if (
      ["FAILED_EXECUTION", "FAILED_STARTUP", "FAILED_POLICY", "TIMED_OUT"].includes(job.status)
    ) {
      failed += 1;
    }
  }
  const avgRuntimeMinutes =
    runtimes.length > 0 ? runtimes.reduce((a, b) => a + b, 0) / runtimes.length : null;
  const terminal = completed + failed;
  return {
    capabilityId,
    jobsCreated: jobs.length,
    jobsCompleted: completed,
    jobsFailed: failed,
    completionRate: terminal > 0 ? completed / terminal : null,
    revenueCents,
    avgRuntimeMinutes,
  };
}
