import type { PrismaClient } from "@kivro/database";
import { getObjectStorageConfig, objectExists } from "@kivro/storage";
import type { WorkerDeliverablesInput } from "./worker-deliverables.js";
import { computeResultRetentionExpiresAt } from "./retention.js";
import { parseJobOutputAssetManifest } from "./output-asset-manifest.js";

export type CloudFinalizationResult =
  | { ok: true; retentionExpiresAt: Date }
  | { ok: false; issues: string[] };

type OutputContractSnapshot = {
  contractVersion: number;
  fields?: Array<{ key: string; type: string; required?: boolean }>;
};

function parseOutputContract(raw: unknown): OutputContractSnapshot | null {
  if (!raw || typeof raw !== "object") {
    return null;
  }
  const o = raw as OutputContractSnapshot;
  if (typeof o.contractVersion !== "number") {
    return null;
  }
  return o;
}

/** ASYNC-006/026 — cloud barrier before buyer-visible COMPLETED. */
export function validateCloudDeliverables(input: {
  outputContractSnapshot: unknown;
  deliverables: WorkerDeliverablesInput;
}): { ok: true } | { ok: false; issues: string[] } {
  const issues: string[] = [];
  const hasStructured = input.deliverables.structuredOutput !== undefined;
  const hasManifest = input.deliverables.outputAssetManifest !== undefined;
  if (!hasStructured && !hasManifest) {
    return { ok: false, issues: ["deliverables required before completion"] };
  }
  const contract = parseOutputContract(input.outputContractSnapshot);
  if (contract && contract.contractVersion >= 2 && Array.isArray(contract.fields)) {
    for (const field of contract.fields) {
      if (!field.required) {
        continue;
      }
      if (field.type === "FILE" || field.type === "FILES") {
        const assets = parseJobOutputAssetManifest(input.deliverables.outputAssetManifest);
        if (assets.length === 0) {
          issues.push(`missing required file output for ${field.key}`);
        }
      } else if (hasStructured) {
        const out = input.deliverables.structuredOutput as Record<string, unknown>;
        if (!out || out[field.key] === undefined) {
          issues.push(`missing required structured output for ${field.key}`);
        }
      } else {
        issues.push(`missing structured output for ${field.key}`);
      }
    }
  }
  return issues.length === 0 ? { ok: true } : { ok: false, issues };
}

/** Verify manifest asset ids exist as confirmed JOB_DELIVERABLE rows. */
export async function verifyDeliverableAssetsInStorage(
  prisma: PrismaClient,
  outputAssetManifest: unknown,
): Promise<{ ok: true } | { ok: false; issues: string[] }> {
  const refs = parseJobOutputAssetManifest(outputAssetManifest);
  const issues: string[] = [];
  for (const ref of refs) {
    const stored = await prisma.storedAsset.findUnique({ where: { id: ref.id } });
    if (!stored) {
      issues.push(`missing stored asset ${ref.id}`);
      continue;
    }
    if (stored.purpose !== "JOB_DELIVERABLE") {
      issues.push(`asset ${ref.id} wrong purpose`);
    }
    if (!stored.uploadConfirmedAt) {
      issues.push(`asset ${ref.id} upload not confirmed`);
    }
    if (getObjectStorageConfig()) {
      const exists = await objectExists({ bucket: stored.bucket, objectKey: stored.objectKey });
      if (!exists) {
        issues.push(`asset ${ref.id} object missing in storage`);
      }
    }
  }
  return issues.length === 0 ? { ok: true } : { ok: false, issues };
}

export async function runCloudFinalizationBarrier(
  prisma: PrismaClient,
  input: {
    jobId: string;
    outputContractSnapshot: unknown;
    deliverables: WorkerDeliverablesInput;
    completedAt?: Date;
  },
): Promise<CloudFinalizationResult> {
  const shape = validateCloudDeliverables({
    outputContractSnapshot: input.outputContractSnapshot,
    deliverables: input.deliverables,
  });
  if (!shape.ok) {
    return shape;
  }
  if (input.deliverables.outputAssetManifest !== undefined) {
    const storage = await verifyDeliverableAssetsInStorage(
      prisma,
      input.deliverables.outputAssetManifest,
    );
    if (!storage.ok) {
      return storage;
    }
  }
  const completedAt = input.completedAt ?? new Date();
  const retentionExpiresAt = computeResultRetentionExpiresAt(completedAt);
  const refs = parseJobOutputAssetManifest(input.deliverables.outputAssetManifest);
  for (const ref of refs) {
    await prisma.storedAsset.updateMany({
      where: { id: ref.id },
      data: { retentionExpiresAt },
    });
  }
  await prisma.job.update({
    where: { id: input.jobId },
    data: { resultRetentionExpiresAt: retentionExpiresAt },
  });
  return { ok: true, retentionExpiresAt };
}
