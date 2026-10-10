import type { PrismaClient } from "@kivro/database";
import { planSafeDownloadBundleEntries } from "@kivro/buyer-experience";
import {
  buildResultZipBuffer,
  isResultRetentionExpired,
  reconcileJobResultIntegrity,
} from "@kivro/job-delivery";
import { getBuyerJobDetail } from "@kivro/marketplace";

/** BUYERUX-021/022 — authorized multi-file zip; failure leaves per-file downloads. */
export async function createBuyerJobBundleDownload(
  prisma: PrismaClient,
  input: { jobId: string; buyerId: string },
): Promise<
  | { buffer: Uint8Array; filename: string }
  | { error: string; httpStatus: 403 | 404 | 410 | 503 | 507 }
> {
  const detail = await getBuyerJobDetail(prisma, { jobId: input.jobId, buyerId: input.buyerId });
  if ("error" in detail) {
    return { error: detail.error, httpStatus: 404 };
  }
  const job = detail.job as {
    status: string;
    resultRetentionExpiresAt?: string | null;
    result?: {
      assets?: Array<{ id: string; filename: string; bucket?: string; objectKey?: string }>;
      downloadAllAllowed?: boolean;
    };
  };
  if (job.status !== "COMPLETED" || !job.result?.assets?.length) {
    return { error: "NO_DELIVERABLES", httpStatus: 404 };
  }
  if (isResultRetentionExpired(job.resultRetentionExpiresAt ? new Date(job.resultRetentionExpiresAt) : null)) {
    return { error: "RESULT_EXPIRED", httpStatus: 410 };
  }
  const integrity = await reconcileJobResultIntegrity(prisma, input.jobId);
  if (!integrity.healthy) {
    return { error: "RESULT_INTEGRITY", httpStatus: 410 };
  }
  const plan = planSafeDownloadBundleEntries(job.result.assets);
  if (!plan.ok) {
    return { error: plan.error, httpStatus: 507 };
  }
  const resolved = [];
  for (const entry of plan.entries) {
    let bucket = entry.bucket;
    let objectKey = entry.objectKey;
    if (!bucket || !objectKey) {
      const stored = await prisma.storedAsset.findUnique({ where: { id: entry.assetId } });
      if (!stored) {
        return { error: "STORAGE_REF_MISSING", httpStatus: 404 };
      }
      bucket = stored.bucket;
      objectKey = stored.objectKey;
    }
    resolved.push({ zipPath: entry.zipPath, bucket, objectKey });
  }
  const zip = await buildResultZipBuffer(resolved);
  if (!zip.ok) {
    const status =
      zip.error === "OBJECT_STORAGE_NOT_CONFIGURED"
        ? 503
        : zip.error === "BUNDLE_TOO_LARGE"
          ? 507
          : 503;
    return { error: zip.error, httpStatus: status };
  }
  return { buffer: zip.buffer, filename: `job-${input.jobId.slice(0, 8)}-deliverables.zip` };
}
