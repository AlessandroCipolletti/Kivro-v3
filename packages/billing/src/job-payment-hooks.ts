import type { PrismaClient } from "@kivro/database";
import { assertJobTransition, type JobStatus } from "@kivro/domain";
import { releaseJobPayment } from "./job-payment.js";

const REFUND_ELIGIBLE_TERMINALS: ReadonlySet<JobStatus> = new Set([
  "REJECTED",
  "EXPIRED",
  "CANCELLED",
  "FAILED_STARTUP",
  "FAILED_POLICY",
  "FAILED_EXECUTION",
  "TIMED_OUT",
  "RESULT_REJECTED",
]);

/** Release reserved credits and move to REFUNDED when the state machine allows (§24.4). */
export async function reconcileJobPaymentAfterTerminal(
  prisma: PrismaClient,
  jobId: string,
): Promise<{ released: boolean; refunded: boolean }> {
  const job = await prisma.job.findUnique({ where: { id: jobId } });
  if (!job) {
    return { released: false, refunded: false };
  }
  const release = await releaseJobPayment(prisma, jobId);
  const released = !("error" in release) && release.released;
  if (!released || job.status === "REFUNDED" || job.status === "COMPLETED") {
    return { released, refunded: false };
  }
  if (!REFUND_ELIGIBLE_TERMINALS.has(job.status)) {
    return { released, refunded: false };
  }
  try {
    assertJobTransition(job.status, "REFUNDED");
  } catch {
    return { released, refunded: false };
  }
  await prisma.job.update({ where: { id: jobId }, data: { status: "REFUNDED" } });
  await prisma.jobStateTransition.create({
    data: {
      jobId,
      fromStatus: job.status,
      toStatus: "REFUNDED",
      actor: "SYSTEM",
      reason: "PAYMENT_RELEASED",
    },
  });
  return { released, refunded: true };
}

/** §486 — a scheduled reservation that never starts is released, not settled. */
export function shouldReleaseUnstartedReservation(input: {
  status: string;
  scheduleWaitDeadlineAt?: Date | null;
  now: Date;
}): boolean {
  return (
    input.status === "SCHEDULED" &&
    input.scheduleWaitDeadlineAt != null &&
    input.scheduleWaitDeadlineAt.getTime() <= input.now.getTime()
  );
}

export async function sweepUnstartedScheduledJobs(
  prisma: PrismaClient,
  limit = 25,
): Promise<{ scanned: number; released: number }> {
  const now = new Date();
  const jobs = await prisma.job.findMany({
    where: { status: "SCHEDULED", scheduleWaitDeadlineAt: { lte: now } },
    take: limit,
  });
  let released = 0;
  for (const job of jobs) {
    if (!shouldReleaseUnstartedReservation({ status: job.status, scheduleWaitDeadlineAt: job.scheduleWaitDeadlineAt, now })) {
      continue;
    }
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
    const payment = await reconcileJobPaymentAfterTerminal(prisma, job.id);
    if (payment.released) {
      released += 1;
    }
  }
  return { scanned: jobs.length, released };
}

export async function sweepStaleJobPaymentReservations(
  prisma: PrismaClient,
  limit = 50,
): Promise<{ scanned: number; reconciled: number }> {
  const staleCutoff = new Date(Date.now() - 15 * 60_000);
  const jobs = await prisma.job.findMany({
    where: {
      reservedAmountCents: { gt: 0 },
      OR: [
        {
          status: {
            in: [
              "CANCELLED",
              "REJECTED",
              "EXPIRED",
              "FAILED_STARTUP",
              "FAILED_POLICY",
              "FAILED_EXECUTION",
              "TIMED_OUT",
              "RESULT_REJECTED",
              "WORKER_OFFLINE",
            ],
          },
        },
        {
          status: "PAYMENT_RESERVED",
          updatedAt: { lt: staleCutoff },
        },
      ],
    },
    take: limit,
  });
  let reconciled = 0;
  for (const job of jobs) {
    if (job.status === "PAYMENT_RESERVED") {
      assertJobTransition("PAYMENT_RESERVED", "CANCELLED");
      await prisma.job.update({
        where: { id: job.id },
        data: { status: "CANCELLED", failureCode: "STALE_PAYMENT_RESERVATION" },
      });
      await prisma.jobStateTransition.create({
        data: {
          jobId: job.id,
          fromStatus: "PAYMENT_RESERVED",
          toStatus: "CANCELLED",
          actor: "SYSTEM",
          reason: "STALE_PAYMENT_RESERVATION",
        },
      });
    }
    const result = await reconcileJobPaymentAfterTerminal(prisma, job.id);
    if (result.released) {
      reconciled += 1;
    }
  }
  return { scanned: jobs.length, reconciled };
}
