import type { PrismaClient } from "@kivro/database";
import { assertJobTransition } from "@kivro/domain";

/** BUYERUX-027/028 — expire jobs that exceeded buyer hard deadline before start. */
export async function expireJobsPastHardDeadline(
  prisma: PrismaClient,
  limit = 25,
): Promise<{ expired: number; jobIds: string[] }> {
  const now = new Date();
  const jobs = await prisma.job.findMany({
    where: {
      buyerHardDeadlineAt: { lte: now },
      status: { in: ["SCHEDULED", "QUEUED", "PAYMENT_RESERVED", "DISPATCHED", "ACCEPTED"] },
    },
    take: limit,
  });
  let expired = 0;
  const jobIds: string[] = [];
  for (const job of jobs) {
    const from = job.status;
    assertJobTransition(from, "EXPIRED");
    await prisma.job.update({
      where: { id: job.id },
      data: { status: "EXPIRED", failureCode: "HARD_DEADLINE_EXCEEDED" },
    });
    await prisma.jobStateTransition.create({
      data: {
        jobId: job.id,
        fromStatus: from,
        toStatus: "EXPIRED",
        actor: "SYSTEM",
        reason: "HARD_DEADLINE_EXCEEDED",
      },
    });
    expired += 1;
    jobIds.push(job.id);
  }
  return { expired, jobIds };
}
