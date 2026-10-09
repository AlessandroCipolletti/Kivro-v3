import type { JobCheckpointRecord } from "@kivro/contracts";
import type { PrismaClient } from "@kivro/database";
import type { Prisma } from "@kivro/database";

export async function recordJobCheckpoint(
  prisma: PrismaClient,
  input: {
    workerDeviceId: string;
    checkpoint: JobCheckpointRecord;
  },
): Promise<{ ok: true } | { error: string }> {
  const job = await prisma.job.findUnique({ where: { id: input.checkpoint.jobId } });
  if (!job || job.workerDeviceId !== input.workerDeviceId) {
    return { error: "FORBIDDEN" };
  }
  await prisma.jobCheckpoint.create({
    data: {
      jobId: input.checkpoint.jobId,
      attemptNumber: input.checkpoint.attemptNumber,
      stageLabel: input.checkpoint.stageLabel,
      checkpointKey: input.checkpoint.checkpointKey,
      recordedAt: new Date(input.checkpoint.recordedAt),
      payload: (input.checkpoint.payload ?? undefined) as Prisma.InputJsonValue | undefined,
    },
  });
  return { ok: true };
}

export async function listJobCheckpoints(
  prisma: PrismaClient,
  jobId: string,
  sellerProfileId: string,
): Promise<{ checkpoints: unknown[] } | { error: string }> {
  const job = await prisma.job.findUnique({
    where: { id: jobId },
    include: { capabilityVersion: { include: { capability: true } } },
  });
  if (!job || job.capabilityVersion.capability.sellerProfileId !== sellerProfileId) {
    return { error: "FORBIDDEN" };
  }
  const checkpoints = await prisma.jobCheckpoint.findMany({
    where: { jobId },
    orderBy: { recordedAt: "asc" },
  });
  return { checkpoints };
}
