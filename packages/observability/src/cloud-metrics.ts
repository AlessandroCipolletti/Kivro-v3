import type { PrismaClient } from "@kivro/database";

/** §35 — aggregate cloud metrics without centralizing sensitive job content. */
export async function collectCloudMetricsSnapshot(prisma: PrismaClient): Promise<{
  generatedAt: string;
  workersOnline: number;
  jobsCreated24h: number;
  jobsCompleted24h: number;
  jobsFailed24h: number;
  abuseReportsOpen: number;
  creditVolume24hCents: number;
  refundRate24h: number;
}> {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const [workersOnline, created, completed, failed, abuseOpen, creditAgg, refunded] =
    await Promise.all([
      prisma.workerDevice.count({ where: { status: "ONLINE" } }),
      prisma.job.count({ where: { createdAt: { gte: since } } }),
      prisma.job.count({ where: { status: "COMPLETED", updatedAt: { gte: since } } }),
      prisma.job.count({
        where: {
          status: {
            in: [
              "FAILED_EXECUTION",
              "FAILED_STARTUP",
              "FAILED_POLICY",
              "TIMED_OUT",
              "RESULT_REJECTED",
            ],
          },
          updatedAt: { gte: since },
        },
      }),
      prisma.abuseReport.count({ where: { status: "OPEN" } }),
      prisma.ledgerEntry.aggregate({
        where: { createdAt: { gte: since }, type: "CREDIT_PURCHASE" },
        _sum: { amountCents: true },
      }),
      prisma.job.count({ where: { status: "REFUNDED", updatedAt: { gte: since } } }),
    ]);
  const creditVolume24hCents = creditAgg._sum.amountCents ?? 0;
  const refundRate24h =
    created > 0 ? Math.round((refunded / created) * 1000) / 1000 : 0;
  return {
    generatedAt: new Date().toISOString(),
    workersOnline,
    jobsCreated24h: created,
    jobsCompleted24h: completed,
    jobsFailed24h: failed,
    abuseReportsOpen: abuseOpen,
    creditVolume24hCents,
    refundRate24h,
  };
}
