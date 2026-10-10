import type { PrismaClient } from "@kivro/database";
import { assertJobTransition } from "@kivro/domain";
import { parseScheduleConfig } from "./capability-schedule.js";
import { isCapabilityExecutionWindowOpen } from "./dispatch-window.js";
import { computeNextAvailableAt } from "./next-available.js";
import { fairQueueOrder } from "./scheduled-fairness.js";
import { computeScheduleWaitDeadline } from "./wait-policy.js";

export type WindowOverflowDecision = "CONTINUE" | "HOLD_FOR_NEXT_WINDOW" | "RELEASE";

/**
 * §473 — a closed window does not stop work already running.
 * Queued work rolls forward only while the next window is still inside the buyer's wait.
 */
export function windowOverflowDecision(input: {
  jobStatus: "RUNNING" | "QUEUED" | "SCHEDULED";
  windowOpen: boolean;
  nextWindowAt?: Date | null;
  waitDeadlineAt?: Date | null;
  now: Date;
}): WindowOverflowDecision {
  if (input.jobStatus === "RUNNING") {
    return "CONTINUE";
  }
  if (input.windowOpen) {
    return "CONTINUE";
  }
  const next = input.nextWindowAt;
  const deadline = input.waitDeadlineAt;
  if (
    next &&
    !Number.isNaN(next.getTime()) &&
    next.getTime() > input.now.getTime() &&
    (!deadline || next.getTime() <= deadline.getTime())
  ) {
    return "HOLD_FOR_NEXT_WINDOW";
  }
  return "RELEASE";
}

/** Release queued work whose next window is past the buyer's wait. Running work is untouched. */
export async function releaseQueuedJobsAfterClosedWindow(
  prisma: PrismaClient,
  limit = 25,
): Promise<{ releasedJobIds: string[]; scanned: number }> {
  const now = new Date();
  const jobs = await prisma.job.findMany({
    where: { status: "QUEUED" },
    orderBy: { createdAt: "asc" },
    take: limit,
  });
  const ordered = fairQueueOrder(jobs);
  const releasedJobIds: string[] = [];
  for (const job of ordered) {
    const windowOpen = await isCapabilityExecutionWindowOpen(prisma, job.capabilityId, now);
    const capability = await prisma.capability.findUnique({ where: { id: job.capabilityId } });
    const nextWindowAt = capability
      ? computeNextAvailableAt(parseScheduleConfig(capability), now)
      : null;
    const decision = windowOverflowDecision({
      jobStatus: "QUEUED",
      windowOpen,
      nextWindowAt,
      waitDeadlineAt: job.scheduleWaitDeadlineAt ?? computeScheduleWaitDeadline(job.createdAt),
      now,
    });
    if (decision !== "RELEASE") {
      continue;
    }
    assertJobTransition("QUEUED", "EXPIRED");
    await prisma.job.update({
      where: { id: job.id },
      data: { status: "EXPIRED", failureCode: "WINDOW_WAIT_EXCEEDED" },
    });
    await prisma.jobStateTransition.create({
      data: {
        jobId: job.id,
        fromStatus: "QUEUED",
        toStatus: "EXPIRED",
        actor: "SYSTEM",
        reason: "WINDOW_WAIT_EXCEEDED",
      },
    });
    releasedJobIds.push(job.id);
  }
  return { releasedJobIds, scanned: jobs.length };
}
