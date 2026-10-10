import type { PrismaClient } from "@kivro/database";
import { assertJobTransition, type JobStatus } from "@kivro/domain";
import {
  persistWorkerJobDeliverables,
  runCloudFinalizationBarrier,
  type WorkerDeliverablesInput,
} from "@kivro/job-delivery";
import { captureAndSettleJobPayment } from "./job-payment.js";

async function markJobResultRejected(
  prisma: PrismaClient,
  jobId: string,
  fromStatus: JobStatus,
  reason: string,
): Promise<{ status: JobStatus }> {
  assertJobTransition(fromStatus, "RESULT_REJECTED");
  await prisma.job.update({
    where: { id: jobId },
    data: { status: "RESULT_REJECTED", failureCode: reason.slice(0, 120) },
  });
  await prisma.jobStateTransition.create({
    data: {
      jobId,
      fromStatus,
      toStatus: "RESULT_REJECTED",
      actor: "SYSTEM",
      reason,
    },
  });
  return { status: "RESULT_REJECTED" };
}

export async function markJobDeliveredAndSettle(
  prisma: PrismaClient,
  input: {
    jobId: string;
    workerDeviceId: string;
    deliverables?: WorkerDeliverablesInput;
  },
): Promise<{ status: JobStatus } | { error: string }> {
  const job = await prisma.job.findUnique({ where: { id: input.jobId } });
  if (!job || job.workerDeviceId !== input.workerDeviceId) {
    return { error: "FORBIDDEN" };
  }
  let status: JobStatus = job.status;
  if (status === "COMPLETED") {
    const settle = await captureAndSettleJobPayment(prisma, job.id);
    if ("error" in settle) {
      return settle;
    }
    return { status: "COMPLETED" };
  }
  if (status === "RUNNING") {
    assertJobTransition(status, "UPLOADING_RESULT");
    await prisma.job.update({ where: { id: job.id }, data: { status: "UPLOADING_RESULT" } });
    await prisma.jobStateTransition.create({
      data: {
        jobId: job.id,
        fromStatus: status,
        toStatus: "UPLOADING_RESULT",
        actor: "WORKER",
      },
    });
    status = "UPLOADING_RESULT";
  }
  if (status !== "UPLOADING_RESULT") {
    return { error: "INVALID_STATE" };
  }
  if (!input.deliverables) {
    return { error: "DELIVERABLES_REQUIRED" };
  }
  const saved = await persistWorkerJobDeliverables(prisma, {
    jobId: job.id,
    workerDeviceId: input.workerDeviceId,
    deliverables: input.deliverables,
  });
  if ("error" in saved) {
    return saved;
  }
  const barrier = await runCloudFinalizationBarrier(prisma, {
    jobId: job.id,
    outputContractSnapshot: job.outputContractSnapshot,
    deliverables: input.deliverables,
  });
  if (!barrier.ok) {
    await markJobResultRejected(prisma, job.id, status, barrier.issues.join("; "));
    return { error: "RESULT_REJECTED" };
  }
  assertJobTransition(status, "COMPLETED");
  const completedAt = new Date();
  await prisma.job.update({
    where: { id: job.id },
    data: {
      status: "COMPLETED",
      completedAt,
      resultRetentionExpiresAt: barrier.retentionExpiresAt,
    },
  });
  await prisma.jobStateTransition.create({
    data: {
      jobId: job.id,
      fromStatus: "UPLOADING_RESULT",
      toStatus: "COMPLETED",
      actor: "WORKER",
    },
  });
  const settle = await captureAndSettleJobPayment(prisma, job.id);
  if ("error" in settle) {
    return settle;
  }
  return { status: "COMPLETED" };
}
