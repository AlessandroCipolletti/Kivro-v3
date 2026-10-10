import type { PrismaClient } from "@kivro/database";
import { buyerAssetChoice } from "./buyer-asset-choice.js";

export type JobReuseMode = "run_again" | "duplicate_edit";

export type ReuseAssetStatus = "reusable" | "expired" | "missing" | "not_owned";

export type JobReuseSeed = {
  mode: JobReuseMode;
  sourceJobId: string;
  capabilityId: string;
  capabilitySlug: string;
  historical: {
    versionNumber: number;
    priceSnapshotCents: number;
    currency: string;
  };
  current: {
    versionNumber: number;
    priceSnapshotCents: number;
    currency: string;
    versionChanged: boolean;
    priceChanged: boolean;
  };
  prefilledInputs: Record<string, unknown>;
  prefilledAssets: Record<
    string,
    Array<{ assetId: string; filename: string; sizeBytes: number; declaredMimeType?: string }>
  >;
  assetReuse: Array<{
    fieldKey: string;
    assetId: string;
    filename: string;
    status: ReuseAssetStatus;
  }>;
  requiresAssetReplacement: boolean;
  disclaimer: string;
};

const REUSE_DISCLAIMER =
  "Creates a new job at the current capability version and price. Historical job records are never modified.";

/** BUYERUX-015..017 — immutable history; new authorized run with current version/price. */
export async function buildJobReuseSeed(
  prisma: PrismaClient,
  input: { jobId: string; buyerId: string; mode: JobReuseMode },
): Promise<JobReuseSeed | { error: "NOT_FOUND" | "NOT_REUSABLE" }> {
  const job = await prisma.job.findUnique({
    where: { id: input.jobId },
    include: {
      input: true,
      capabilityVersion: { include: { capability: { include: { currentVersion: true } } } },
    },
  });
  if (!job || job.buyerId !== input.buyerId) {
    return { error: "NOT_FOUND" };
  }
  if (!["COMPLETED", "CANCELLED", "REFUNDED", "FAILED_EXECUTION", "TIMED_OUT", "EXPIRED"].includes(job.status)) {
    return { error: "NOT_REUSABLE" };
  }
  const cap = job.capabilityVersion.capability;
  if (cap.status !== "PUBLISHED" || !cap.currentVersionId) {
    return { error: "NOT_REUSABLE" };
  }
  const live = cap.currentVersion;
  if (!live) {
    return { error: "NOT_REUSABLE" };
  }

  const structuredInput = (job.input?.structuredInput ?? {}) as Record<string, unknown>;
  const assetManifest = parseAssetManifest(job.input?.assetManifest);
  const assetReuse = await classifyJobInputAssets(prisma, input.buyerId, assetManifest);
  const requiresAssetReplacement = assetReuse.some((a) => a.status !== "reusable");

  const prefilledAssets: JobReuseSeed["prefilledAssets"] = {};
  for (const [fieldKey, refs] of Object.entries(assetManifest)) {
    const enriched: JobReuseSeed["prefilledAssets"][string] = [];
    for (const ref of refs) {
      if (assetReuse.find((a) => a.assetId === ref.assetId)?.status !== "reusable") {
        continue;
      }
      const stored = await prisma.storedAsset.findUnique({ where: { id: ref.assetId } });
      if (!stored?.uploadConfirmedAt) {
        continue;
      }
      if (
        buyerAssetChoice({
          assetId: stored.id,
          requesterId: input.buyerId,
          ownerId: stored.buyerId,
        }) !== "reuse_previous"
      ) {
        continue;
      }
      enriched.push({
        assetId: ref.assetId,
        filename: ref.filename,
        sizeBytes: Number(stored.sizeBytes),
        declaredMimeType: stored.mimeType ?? undefined,
      });
    }
    if (enriched.length > 0) {
      prefilledAssets[fieldKey] = enriched;
    }
  }

  const prefilledInputs = { ...structuredInput };
  if (input.mode === "run_again" && requiresAssetReplacement) {
    for (const key of Object.keys(assetManifest)) {
      delete prefilledAssets[key];
    }
  }

  return {
    mode: input.mode,
    sourceJobId: job.id,
    capabilityId: cap.id,
    capabilitySlug: cap.slug,
    historical: {
      versionNumber: job.versionNumber,
      priceSnapshotCents: job.priceSnapshotCents,
      currency: job.currency,
    },
    current: {
      versionNumber: live.versionNumber,
      priceSnapshotCents: live.priceSnapshotCents,
      currency: live.currency,
      versionChanged: live.versionNumber !== job.versionNumber,
      priceChanged: live.priceSnapshotCents !== job.priceSnapshotCents,
    },
    prefilledInputs,
    prefilledAssets,
    assetReuse,
    requiresAssetReplacement,
    disclaimer: REUSE_DISCLAIMER,
  };
}

function parseAssetManifest(raw: unknown): Record<string, Array<{ assetId: string; filename: string }>> {
  if (!raw || typeof raw !== "object") {
    return {};
  }
  const out: Record<string, Array<{ assetId: string; filename: string }>> = {};
  for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
    if (!Array.isArray(value)) {
      continue;
    }
    out[key] = value.flatMap((item) => {
      if (!item || typeof item !== "object") {
        return [];
      }
      const o = item as Record<string, unknown>;
      const assetId = typeof o.assetId === "string" ? o.assetId : typeof o.id === "string" ? o.id : null;
      const filename =
        typeof o.filename === "string" ? o.filename : typeof o.name === "string" ? o.name : "file";
      return assetId ? [{ assetId, filename }] : [];
    });
  }
  return out;
}

async function classifyJobInputAssets(
  prisma: PrismaClient,
  buyerId: string,
  manifest: Record<string, Array<{ assetId: string; filename: string }>>,
): Promise<JobReuseSeed["assetReuse"]> {
  const rows: JobReuseSeed["assetReuse"] = [];
  const seen = new Set<string>();
  for (const [fieldKey, refs] of Object.entries(manifest)) {
    for (const ref of refs) {
      if (seen.has(ref.assetId)) {
        continue;
      }
      seen.add(ref.assetId);
      const stored = await prisma.storedAsset.findUnique({ where: { id: ref.assetId } });
      let status: ReuseAssetStatus = "missing";
      if (!stored || stored.buyerId !== buyerId) {
        status = "not_owned";
      } else if (!stored.uploadConfirmedAt) {
        status = "missing";
      } else if (stored.retentionExpiresAt && stored.retentionExpiresAt.getTime() <= Date.now()) {
        status = "expired";
      } else {
        status = "reusable";
      }
      rows.push({ fieldKey, assetId: ref.assetId, filename: ref.filename, status });
    }
  }
  return rows;
}
