import type { PrismaClient } from "@kivro/database";
import { assertJobTransition, type JobStatus } from "@kivro/domain";

const BUYER_CANCELLABLE: ReadonlySet<JobStatus> = new Set([
  "SCHEDULED",
  "PAYMENT_RESERVED",
  "QUEUED",
  "DISPATCHED",
  "ACCEPTED",
]);

/** §466 — buyer may cancel before execution begins. */
export async function buyerCancelScheduledOrQueuedJob(
  prisma: PrismaClient,
  input: { jobId: string; buyerId: string; reason?: string },
): Promise<{ status: JobStatus } | { error: string }> {
  const job = await prisma.job.findUnique({ where: { id: input.jobId } });
  if (!job || job.buyerId !== input.buyerId) {
    return { error: "NOT_FOUND" };
  }
  const from = job.status;
  if (from === "CANCELLED") {
    return { status: from };
  }
  if (!BUYER_CANCELLABLE.has(from)) {
    return { error: "JOB_NOT_CANCELLABLE" };
  }
  if (from === "STARTING" || from === "RUNNING") {
    return { error: "JOB_NOT_CANCELLABLE" };
  }
  assertJobTransition(from, "CANCELLED");
  const cancelled = await prisma.$transaction(async (tx) => {
    const updated = await tx.job.updateMany({
      where: {
        id: job.id,
        buyerId: input.buyerId,
        status: { in: [...BUYER_CANCELLABLE] },
      },
      data: {
        status: "CANCELLED",
        failureCode: input.reason ?? "BUYER_CANCELLED",
      },
    });
    if (updated.count !== 1) {
      return { error: "JOB_NOT_CANCELLABLE" as const };
    }
    await tx.jobStateTransition.create({
      data: {
        jobId: job.id,
        fromStatus: from,
        toStatus: "CANCELLED",
        actor: "BUYER",
        reason: input.reason,
      },
    });
    return { status: "CANCELLED" as const };
  });
  if ("error" in cancelled) {
    return cancelled;
  }
  return cancelled;
}
