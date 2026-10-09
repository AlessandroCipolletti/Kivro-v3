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

export async function sweepStaleJobPaymentReservations(
  prisma: PrismaClient,
  limit = 50,
): Promise<{ scanned: number; reconciled: number }> {
  const jobs = await prisma.job.findMany({
    where: {
      reservedAmountCents: { gt: 0 },
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
    take: limit,
  });
  let reconciled = 0;
  for (const job of jobs) {
    const result = await reconcileJobPaymentAfterTerminal(prisma, job.id);
    if (result.released) {
      reconciled += 1;
    }
  }
  return { scanned: jobs.length, reconciled };
}
