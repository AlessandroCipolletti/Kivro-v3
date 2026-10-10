import type { PrismaClient } from "@kivro/database";

/** BUYERUX-029..031 — authoritative eligible-job reliability (no buyer-private data). */
export type SellerReliabilitySnapshot = {
  windowDays: number;
  eligibleJobs: number;
  completedOnTime: number;
  missedWindow: number;
  failedTerminal: number;
  onTimeRate: number | null;
  definition: string;
};

const RELIABILITY_WINDOW_DAYS = 90;
const MIN_SAMPLE = 5;

export async function computeSellerReliabilityForCapability(
  prisma: PrismaClient,
  capabilityId: string,
): Promise<SellerReliabilitySnapshot> {
  const since = new Date(Date.now() - RELIABILITY_WINDOW_DAYS * 86_400_000);
  const jobs = await prisma.job.findMany({
    where: {
      capabilityId,
      createdAt: { gte: since },
      status: {
        in: [
          "COMPLETED",
          "EXPIRED",
          "FAILED_EXECUTION",
          "FAILED_STARTUP",
          "FAILED_POLICY",
          "TIMED_OUT",
          "CANCELLED",
        ],
      },
    },
    select: {
      status: true,
      failureCode: true,
      completedAt: true,
      buyerHardDeadlineAt: true,
      startedAt: true,
    },
    take: 500,
  });
  let completedOnTime = 0;
  let missedWindow = 0;
  let failedTerminal = 0;
  for (const job of jobs) {
    if (job.status === "COMPLETED") {
      if (
        job.buyerHardDeadlineAt &&
        job.completedAt &&
        job.completedAt.getTime() > job.buyerHardDeadlineAt.getTime()
      ) {
        missedWindow += 1;
      } else {
        completedOnTime += 1;
      }
    } else if (job.status === "EXPIRED" || job.failureCode === "SCHEDULE_WAIT_EXCEEDED") {
      missedWindow += 1;
    } else {
      failedTerminal += 1;
    }
  }
  const eligible = jobs.length;
  const onTimeRate =
    eligible >= MIN_SAMPLE ? completedOnTime / Math.max(1, completedOnTime + missedWindow + failedTerminal) : null;
  return {
    windowDays: RELIABILITY_WINDOW_DAYS,
    eligibleJobs: eligible,
    completedOnTime,
    missedWindow,
    failedTerminal,
    onTimeRate,
    definition:
      "On-time rate counts completed jobs before buyer deadline over eligible terminal outcomes in the rolling window; hidden until minimum sample.",
  };
}
