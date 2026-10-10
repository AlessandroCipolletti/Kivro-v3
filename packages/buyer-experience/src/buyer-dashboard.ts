import type { PrismaClient } from "@kivro/database";
import type { JobStatus } from "@kivro/domain";

/** BUYERUX-041/042 — authoritative dashboard buckets from shared job state. */
export type BuyerDashboardSummary = {
  scheduled: number;
  queued: number;
  running: number;
  needsAttention: number;
  completedRecent: number;
};

const RUNNING: JobStatus[] = [
  "DISPATCHED",
  "ACCEPTED",
  "STARTING",
  "RUNNING",
  "PAUSE_REQUESTED",
  "PAUSED",
  "RESUME_REQUESTED",
  "SECURITY_PAUSED",
  "UPLOADING_RESULT",
];

export async function buildBuyerDashboardSummary(
  prisma: PrismaClient,
  buyerId: string,
): Promise<BuyerDashboardSummary> {
  const jobs = await prisma.job.findMany({
    where: { buyerId },
    select: { status: true, createdAt: true, failureCode: true },
    orderBy: { createdAt: "desc" },
    take: 200,
  });
  let scheduled = 0;
  let queued = 0;
  let running = 0;
  let needsAttention = 0;
  let completedRecent = 0;
  const weekAgo = Date.now() - 7 * 86_400_000;
  for (const job of jobs) {
    if (job.status === "SCHEDULED") {
      scheduled += 1;
    } else if (job.status === "QUEUED" || job.status === "PAYMENT_RESERVED") {
      queued += 1;
    } else if (RUNNING.includes(job.status)) {
      running += 1;
    } else if (
      job.status === "EXPIRED" ||
      job.status === "WORKER_OFFLINE" ||
      job.failureCode === "SCHEDULE_WAIT_EXCEEDED"
    ) {
      needsAttention += 1;
    } else if (job.status === "COMPLETED" && job.createdAt.getTime() >= weekAgo) {
      completedRecent += 1;
    }
  }
  return { scheduled, queued, running, needsAttention, completedRecent };
}
