import type { JobControlSource } from "@kivro/contracts";
import type { PrismaClient } from "@kivro/database";
import { assertJobTransition, isTerminalJobStatus, type JobStatus } from "@kivro/domain";

const SELLER_CANCELLABLE: ReadonlySet<JobStatus> = new Set([
  "STARTING",
  "RUNNING",
  "PAUSE_REQUESTED",
  "PAUSED",
  "RESUME_REQUESTED",
  "SECURITY_PAUSED",
  "UPLOADING_RESULT",
  "QUEUED",
  "DISPATCHED",
  "ACCEPTED",
]);

/** §450 — seller can cancel one running (or in-flight) job. */
export async function sellerRequestJobCancel(
  prisma: PrismaClient,
  input: {
    jobId: string;
    sellerProfileId: string;
    commandId: string;
    source: JobControlSource;
    reason?: string;
  },
): Promise<{ status: JobStatus; commandId: string } | { error: string }> {
  const job = await prisma.job.findUnique({
    where: { id: input.jobId },
    include: { capabilityVersion: { include: { capability: true } } },
  });
  if (!job) {
    return { error: "JOB_NOT_FOUND" };
  }
  if (job.capabilityVersion.capability.sellerProfileId !== input.sellerProfileId) {
    return { error: "FORBIDDEN" };
  }
  const from: JobStatus = job.status;
  if (from === "CANCELLED") {
    return { status: from, commandId: job.activeControlCommandId ?? input.commandId };
  }
  if (isTerminalJobStatus(from)) {
    return { error: "JOB_NOT_CANCELLABLE" };
  }
  if (!SELLER_CANCELLABLE.has(from)) {
    return { error: "JOB_NOT_CANCELLABLE" };
  }
  assertJobTransition(from, "CANCELLED");
  await prisma.job.update({
    where: { id: job.id },
    data: {
      status: "CANCELLED",
      activeControlCommandId: input.commandId,
      failureCode: input.reason ?? "SELLER_CANCELLED",
    },
  });
  await prisma.jobStateTransition.create({
    data: {
      jobId: job.id,
      fromStatus: from,
      toStatus: "CANCELLED",
      actor: "SELLER",
      reason: input.reason,
      correlationId: input.commandId,
    },
  });
  await prisma.auditEvent.create({
    data: {
      jobId: job.id,
      type: "JOB_CANCEL_CONTROL",
      actor: "SELLER",
      correlationId: input.commandId,
      sanitizedPayload: {
        source: input.source,
        previousState: from,
        newState: "CANCELLED",
        reason: input.reason,
      },
    },
  });
  return { status: "CANCELLED", commandId: input.commandId };
}
