import type { PrismaClient } from "@kivro/database";
import { assertJobTransition } from "@kivro/domain";
import { expireQueuedJobsWhileAcceptanceBlocked } from "./queue-pause-expiry.js";
import { releaseQueuedJobsAfterClosedWindow } from "./window-overflow.js";
import { promoteDueScheduledJobs } from "./scheduled-jobs.js";

export async function expireOverdueScheduledJobs(
  prisma: PrismaClient,
  limit = 25,
): Promise<{ expired: number; scanned: number }> {
  const now = new Date();
  const jobs = await prisma.job.findMany({
    where: {
      status: "SCHEDULED",
      scheduleWaitDeadlineAt: { lte: now },
    },
    take: limit,
  });
  let expired = 0;
  for (const job of jobs) {
    assertJobTransition("SCHEDULED", "EXPIRED");
    await prisma.job.update({
      where: { id: job.id },
      data: { status: "EXPIRED", failureCode: "SCHEDULE_WAIT_EXCEEDED" },
    });
    await prisma.jobStateTransition.create({
      data: {
        jobId: job.id,
        fromStatus: "SCHEDULED",
        toStatus: "EXPIRED",
        actor: "SYSTEM",
        reason: "SCHEDULE_WAIT_EXCEEDED",
      },
    });
    expired += 1;
  }
  return { expired, scanned: jobs.length };
}

export async function runSchedulingSweeps(
  prisma: PrismaClient,
): Promise<{
  promoted: number;
  promotedScanned: number;
  expired: number;
  expiredScanned: number;
  queueCancelled: number;
  queueCancelledJobIds: string[];
  windowReleased: number;
}> {
  const promoted = await promoteDueScheduledJobs(prisma);
  const expired = await expireOverdueScheduledJobs(prisma);
  const queueExpiry = await expireQueuedJobsWhileAcceptanceBlocked(prisma);
  const windowRelease = await releaseQueuedJobsAfterClosedWindow(prisma);
  return {
    promoted: promoted.promoted,
    promotedScanned: promoted.scanned,
    expired: expired.expired,
    expiredScanned: expired.scanned,
    queueCancelled: queueExpiry.cancelledJobIds.length,
    queueCancelledJobIds: queueExpiry.cancelledJobIds,
    windowReleased: windowRelease.releasedJobIds.length,
  };
}
