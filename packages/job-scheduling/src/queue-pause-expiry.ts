import type { PrismaClient } from "@kivro/database";
import { assertJobTransition } from "@kivro/domain";
import { assertImmediateJobSubmissionAllowed } from "./availability-service.js";
import { queueMaxWaitWhilePausedMs } from "./wait-policy.js";

const PAUSE_BLOCK_REASONS = new Set([
  "EMERGENCY_PAUSE",
  "PLATFORM_SECURITY_PAUSE",
  "SECURITY_NOT_READY",
  "MANUALLY_PAUSED",
]);

/** §389 — cancel/refund-eligible QUEUED jobs held too long while not accepting. */
export async function expireQueuedJobsWhileAcceptanceBlocked(
  prisma: PrismaClient,
  limit = 25,
): Promise<{ cancelledJobIds: string[]; scanned: number }> {
  const now = new Date();
  const maxWaitMs = queueMaxWaitWhilePausedMs();
  const jobs = await prisma.job.findMany({
    where: { status: "QUEUED" },
    orderBy: { updatedAt: "asc" },
    take: limit,
  });

  const cancelledJobIds: string[] = [];
  for (const job of jobs) {
    const gate = await assertImmediateJobSubmissionAllowed(prisma, job.capabilityId);
    if ("ok" in gate) {
      continue;
    }
    const blockedByPause = gate.reasons.some((r) => PAUSE_BLOCK_REASONS.has(r));
    if (!blockedByPause) {
      continue;
    }
    const queuedTransition = await prisma.jobStateTransition.findFirst({
      where: { jobId: job.id, toStatus: "QUEUED" },
      orderBy: { createdAt: "desc" },
    });
    const queuedSince = queuedTransition?.createdAt ?? job.updatedAt;
    if (now.getTime() - queuedSince.getTime() < maxWaitMs) {
      continue;
    }
    assertJobTransition("QUEUED", "CANCELLED");
    await prisma.job.update({
      where: { id: job.id },
      data: {
        status: "CANCELLED",
        failureCode: "PAUSE_QUEUE_WAIT_EXCEEDED",
      },
    });
    await prisma.jobStateTransition.create({
      data: {
        jobId: job.id,
        fromStatus: "QUEUED",
        toStatus: "CANCELLED",
        actor: "SYSTEM",
        reason: "PAUSE_QUEUE_WAIT_EXCEEDED",
      },
    });
    cancelledJobIds.push(job.id);
  }

  return { cancelledJobIds, scanned: jobs.length };
}
