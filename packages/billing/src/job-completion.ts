import type { PrismaClient } from "@kivro/database";
import { assertJobTransition, type JobStatus } from "@kivro/domain";
import { captureAndSettleJobPayment } from "./job-payment.js";

export async function markJobDeliveredAndSettle(
  prisma: PrismaClient,
  input: { jobId: string; workerDeviceId: string },
): Promise<{ status: JobStatus } | { error: string }> {
  const job = await prisma.job.findUnique({ where: { id: input.jobId } });
  if (!job || job.workerDeviceId !== input.workerDeviceId) {
    return { error: "FORBIDDEN" };
  }
  let status: JobStatus = job.status;
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
  assertJobTransition(status, "COMPLETED");
  await prisma.job.update({
    where: { id: job.id },
    data: { status: "COMPLETED", completedAt: new Date() },
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
