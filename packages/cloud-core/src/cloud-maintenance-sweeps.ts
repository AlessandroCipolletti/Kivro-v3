import type { PrismaClient } from "@kivro/database";
import {
  reconcileJobPaymentAfterTerminal,
  sweepPendingSellerTransfers,
  sweepStaleJobPaymentReservations,
  sweepUnstartedScheduledJobs,
} from "@kivro/billing";
import { runJobFailureOperationsSweeps } from "@kivro/job-failure";
import { sweepExpiredJobPauses } from "@kivro/job-control";
import {
  expireJobsPastHardDeadline,
  processDueResultRetentionReminders,
  processDueScheduledJobReminders,
} from "@kivro/buyer-experience";
import {
  processPendingJobTerminalEmailNotifications,
  purgeExpiredJobDeliverables,
  sampleCompletedJobIntegrity,
} from "@kivro/job-delivery";

/** Shared bounded maintenance (Netsons cron + AWS event tick). */
export async function runCloudMaintenanceSweeps(
  prisma: PrismaClient,
  limits: { paymentReservationSweep: number },
): Promise<{
  staleReservations: Awaited<ReturnType<typeof sweepStaleJobPaymentReservations>>;
  unstartedScheduled: Awaited<ReturnType<typeof sweepUnstartedScheduledJobs>>;
  pendingTransfers: Awaited<ReturnType<typeof sweepPendingSellerTransfers>>;
  pauseTimeouts: Awaited<ReturnType<typeof sweepExpiredJobPauses>>;
  failureOps: Awaited<ReturnType<typeof runJobFailureOperationsSweeps>>;
  paymentsReleased: number;
  asyncDelivery: {
    terminalEmail: Awaited<ReturnType<typeof processPendingJobTerminalEmailNotifications>>;
    retentionCleanup: Awaited<ReturnType<typeof purgeExpiredJobDeliverables>>;
    integritySample: Awaited<ReturnType<typeof sampleCompletedJobIntegrity>>;
    scheduledReminders: Awaited<ReturnType<typeof processDueScheduledJobReminders>>;
    retentionReminders: Awaited<ReturnType<typeof processDueResultRetentionReminders>>;
  };
}> {
  const staleReservations = await sweepStaleJobPaymentReservations(prisma);
  const unstartedScheduled = await sweepUnstartedScheduledJobs(prisma, limits.paymentReservationSweep);
  const pendingTransfers = await sweepPendingSellerTransfers(prisma);
  const pauseTimeouts = await sweepExpiredJobPauses(prisma);
  const failureOps = await runJobFailureOperationsSweeps(prisma);

  const hardDeadlineExpiry = await expireJobsPastHardDeadline(prisma);

  const terminalJobIds = new Set<string>();
  for (const jobId of failureOps.lostWorker.jobIds) {
    terminalJobIds.add(jobId);
  }
  for (const jobId of hardDeadlineExpiry.jobIds) {
    terminalJobIds.add(jobId);
  }

  const expiredJobs = await prisma.job.findMany({
    where: { status: "EXPIRED", reservedAmountCents: { gt: 0 } },
    take: limits.paymentReservationSweep,
    select: { id: true },
  });
  for (const job of expiredJobs) {
    terminalJobIds.add(job.id);
  }

  let paymentsReleased = 0;
  for (const jobId of terminalJobIds) {
    const reconciled = await reconcileJobPaymentAfterTerminal(prisma, jobId);
    if (reconciled.released) {
      paymentsReleased += 1;
    }
  }

  const scheduledReminders = await processDueScheduledJobReminders(prisma);
  const retentionReminders = await processDueResultRetentionReminders(prisma);
  const terminalEmail = await processPendingJobTerminalEmailNotifications(prisma);
  const retentionCleanup = await purgeExpiredJobDeliverables(prisma);
  const integritySample = await sampleCompletedJobIntegrity(prisma, 5);

  return {
    staleReservations,
    unstartedScheduled,
    pendingTransfers,
    pauseTimeouts,
    failureOps,
    paymentsReleased,
    asyncDelivery: {
      terminalEmail,
      retentionCleanup,
      integritySample,
      scheduledReminders,
      retentionReminders,
    },
  };
}
