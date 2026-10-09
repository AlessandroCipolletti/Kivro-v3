import type { Prisma, PrismaClient } from "@kivro/database";
import type { JobStatus } from "@kivro/domain";
import { createHash } from "node:crypto";
import fs from "node:fs";
import { getObjectStorageConfig, putObjectBytes } from "@kivro/storage";

export type WorkerDeliverablesInput = {
  structuredOutput?: unknown;
  outputAssetManifest?: unknown;
};

function toJson(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

/** Upsert buyer-visible job result before terminal completion (§212 / §573). */
export async function persistWorkerJobDeliverables(
  prisma: PrismaClient,
  input: {
    jobId: string;
    workerDeviceId: string;
    deliverables: WorkerDeliverablesInput;
  },
): Promise<{ ok: true } | { error: string }> {
  const job = await prisma.job.findUnique({
    where: { id: input.jobId },
    include: { capabilityVersion: { include: { capability: true } } },
  });
  if (!job || job.workerDeviceId !== input.workerDeviceId) {
    return { error: "FORBIDDEN" };
  }
  const allowed: JobStatus[] = ["RUNNING", "UPLOADING_RESULT"];
  if (!allowed.includes(job.status)) {
    return { error: "INVALID_STATE" };
  }
  await prisma.jobResult.upsert({
    where: { jobId: job.id },
    create: {
      jobId: job.id,
      structuredOutput: input.deliverables.structuredOutput
        ? toJson(input.deliverables.structuredOutput)
        : undefined,
      outputAssetManifest: input.deliverables.outputAssetManifest
        ? toJson(input.deliverables.outputAssetManifest)
        : undefined,
    },
    update: {
      structuredOutput: input.deliverables.structuredOutput
        ? toJson(input.deliverables.structuredOutput)
        : undefined,
      outputAssetManifest: input.deliverables.outputAssetManifest
        ? toJson(input.deliverables.outputAssetManifest)
        : undefined,
    },
  });
  return { ok: true };
}

/** Upload a local file as JOB_DELIVERABLE and return manifest entry. */
export async function uploadJobDeliverableFile(
  prisma: PrismaClient,
  input: {
    jobId: string;
    sellerProfileId: string;
    localPath: string;
    filename: string;
    mimeType?: string;
  },
): Promise<{ assetId: string; bucket: string; objectKey: string; filename: string; sizeBytes: number }> {
  const config = getObjectStorageConfig();
  if (!config) {
    throw new Error("OBJECT_STORAGE_NOT_CONFIGURED");
  }
  const body = fs.readFileSync(input.localPath);
  const contentHash = createHash("sha256").update(body).digest("hex");
  const objectKey = `sellers/${input.sellerProfileId}/job-deliverable/${input.jobId}/${input.filename}`;
  await putObjectBytes({
    bucket: config.bucket,
    objectKey,
    body,
    contentHash,
    mimeType: input.mimeType ?? "application/octet-stream",
    metadata: { purpose: "JOB_DELIVERABLE" },
  });
  const asset = await prisma.storedAsset.create({
    data: {
      sellerProfileId: input.sellerProfileId,
      purpose: "JOB_DELIVERABLE",
      bucket: config.bucket,
      objectKey,
      contentHash,
      sizeBytes: BigInt(body.length),
      mimeType: input.mimeType,
      uploadConfirmedAt: new Date(),
    },
  });
  return {
    assetId: asset.id,
    bucket: config.bucket,
    objectKey,
    filename: input.filename,
    sizeBytes: body.length,
  };
}
