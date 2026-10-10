import { PROTOCOL_VERSION, type JobOffer } from "@kivro/contracts";
import type { Prisma, PrismaClient } from "@kivro/database";
import { assertJobTransition, type JobStatus } from "@kivro/domain";
import { isGlobalDispatchEnabled } from "@kivro/platform-policy";
import {
  assertImmediateJobSubmissionAllowed,
  assertQueuedJobDispatchAllowed,
  reserveWorkerDispatchSlot,
} from "@kivro/job-scheduling";
import { gateWorkerJobOnControlPlane, type WorkerControlPlaneContext } from "./control-plane-guard.js";

async function transition(
  prisma: PrismaClient | Prisma.TransactionClient,
  jobId: string,
  from: JobStatus,
  to: JobStatus,
  data: Record<string, unknown> = {},
): Promise<void> {
  assertJobTransition(from, to);
  await prisma.job.update({
    where: { id: jobId },
    data: { status: to, ...data },
  });
  await prisma.jobStateTransition.create({
    data: {
      jobId,
      fromStatus: from,
      toStatus: to,
      actor: "SYSTEM",
    },
  });
}

/** §11 — queue and offer a reserved job to a bound worker device. */
export async function dispatchJobToWorker(
  prisma: PrismaClient,
  input: {
    jobId: string;
    workerDeviceId: string;
    offerExpiresAt: Date;
    executionControlPlaneId: string;
  },
): Promise<{ offer: JobOffer } | { error: string }> {
  if (!isGlobalDispatchEnabled()) {
    return { error: "GLOBAL_DISPATCH_DISABLED" };
  }
  const job = await prisma.job.findUnique({
    where: { id: input.jobId },
    include: { input: true },
  });
  if (!job || job.status !== "QUEUED") {
    return { error: "JOB_NOT_DISPATCHABLE" };
  }
  if (!job.input) {
    return { error: "JOB_INPUT_MISSING" };
  }
  if (job.reservedAmountCents == null || job.reservedAmountCents <= 0) {
    return { error: "PAYMENT_NOT_SECURED" };
  }
  const windowGate = await assertQueuedJobDispatchAllowed(prisma, job.id);
  if ("error" in windowGate) {
    return windowGate;
  }
  const acceptGate = await assertImmediateJobSubmissionAllowed(prisma, job.capabilityId);
  if ("error" in acceptGate) {
    return { error: acceptGate.error };
  }
  const executionControlPlaneId =
    job.executionControlPlaneId ?? input.executionControlPlaneId;
  try {
    await prisma.$transaction(async (tx) => {
      const slot = await reserveWorkerDispatchSlot(tx, {
        workerDeviceId: input.workerDeviceId,
        capabilityId: job.capabilityId,
      });
      if ("error" in slot) {
        throw new Error(slot.error);
      }
      await transition(tx, job.id, "QUEUED", "DISPATCHED", {
        workerDeviceId: input.workerDeviceId,
        dispatchExpiresAt: input.offerExpiresAt,
        executionControlPlaneId,
      });
    });
  } catch (err) {
    if (err instanceof Error && (err.message === "CONCURRENCY_LIMIT" || err.message === "NOT_FOUND")) {
      return { error: err.message };
    }
    throw err;
  }
  const offer: JobOffer = {
    protocolVersion: PROTOCOL_VERSION,
    jobId: job.id,
    workerId: input.workerDeviceId,
    capabilityVersionId: job.capabilityVersionId,
    inputManifestId: job.input.id,
    expiresAt: input.offerExpiresAt.toISOString(),
    paymentSecured: true,
  };
  return { offer };
}

export async function acceptJobOffer(
  prisma: PrismaClient,
  input: {
    jobId: string;
    workerDeviceId: string;
    controlPlane?: WorkerControlPlaneContext;
  },
): Promise<{ status: JobStatus } | { error: string }> {
  const job = await prisma.job.findUnique({ where: { id: input.jobId } });
  if (!job || job.workerDeviceId !== input.workerDeviceId) {
    return { error: "FORBIDDEN" };
  }
  const cpBlock = gateWorkerJobOnControlPlane(job, input.controlPlane);
  if (cpBlock) {
    return { error: cpBlock.error };
  }
  if (job.status === "ACCEPTED") {
    return { status: "ACCEPTED" };
  }
  if (job.status !== "DISPATCHED") {
    return { error: "INVALID_STATE" };
  }
  await transition(prisma, job.id, "DISPATCHED", "ACCEPTED");
  return { status: "ACCEPTED" };
}

export async function markJobRunning(
  prisma: PrismaClient,
  input: {
    jobId: string;
    workerDeviceId: string;
    attemptNumber?: number;
    controlPlane?: WorkerControlPlaneContext;
  },
): Promise<{ status: JobStatus } | { error: string }> {
  const job = await prisma.job.findUnique({ where: { id: input.jobId } });
  if (!job || job.workerDeviceId !== input.workerDeviceId) {
    return { error: "FORBIDDEN" };
  }
  const cpBlock = gateWorkerJobOnControlPlane(job, input.controlPlane);
  if (cpBlock) {
    return { error: cpBlock.error };
  }
  const from: JobStatus = job.status;
  if (from === "RUNNING") {
    return { status: from };
  }
  if (from === "ACCEPTED") {
    await transition(prisma, job.id, "ACCEPTED", "STARTING");
    await prisma.jobAttempt.create({
      data: {
        jobId: job.id,
        attemptNumber: input.attemptNumber ?? 1,
        status: "STARTING",
        startedAt: new Date(),
      },
    });
    await transition(prisma, job.id, "STARTING", "RUNNING", { startedAt: new Date() });
    return { status: "RUNNING" };
  }
  if (from === "RESUME_REQUESTED") {
    await transition(prisma, job.id, "RESUME_REQUESTED", "RUNNING");
    return { status: "RUNNING" };
  }
  return { error: "INVALID_STATE" };
}

/** §9 recovery — worker offline returns job to queue when safe. */
export async function rejectJobOffer(
  prisma: PrismaClient,
  input: {
    jobId: string;
    workerDeviceId: string;
    reason?: string;
    controlPlane?: WorkerControlPlaneContext;
  },
): Promise<{ status: JobStatus } | { error: string }> {
  const job = await prisma.job.findUnique({ where: { id: input.jobId } });
  if (!job || job.workerDeviceId !== input.workerDeviceId) {
    return { error: "FORBIDDEN" };
  }
  const cpBlock = gateWorkerJobOnControlPlane(job, input.controlPlane);
  if (cpBlock) {
    return { error: cpBlock.error };
  }
  if (job.status === "REJECTED") {
    return { status: "REJECTED" };
  }
  if (job.status !== "DISPATCHED") {
    return { error: "INVALID_STATE" };
  }
  await transition(prisma, job.id, "DISPATCHED", "REJECTED", {
    failureCode: input.reason ?? "WORKER_REJECTED",
    workerDeviceId: null,
  });
  return { status: "REJECTED" };
}

export async function recoverWorkerOfflineJob(
  prisma: PrismaClient,
  jobId: string,
): Promise<{ status: JobStatus } | { error: string }> {
  const job = await prisma.job.findUnique({ where: { id: jobId } });
  if (!job) {
    return { error: "JOB_NOT_FOUND" };
  }
  const from: JobStatus = job.status;
  if (from === "QUEUED") {
    return { status: from };
  }
  if (from !== "DISPATCHED" && from !== "WORKER_OFFLINE") {
    return { error: "NOT_RECOVERABLE" };
  }
  if (from === "DISPATCHED") {
    await transition(prisma, job.id, "DISPATCHED", "WORKER_OFFLINE");
  }
  await transition(prisma, job.id, "WORKER_OFFLINE", "QUEUED", { workerDeviceId: null });
  return { status: "QUEUED" };
}
