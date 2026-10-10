import type { PrismaClient } from "@kivro/database";
import { getBuyerJobDetail } from "@kivro/marketplace";
import { sanitizeDownloadFilename } from "@kivro/job-io";
import { isResultRetentionExpired, reconcileJobResultIntegrity } from "@kivro/job-delivery";
import { createPresignedDownload } from "@kivro/storage";

/** ASYNC-009/013/029 — authorized presigned download (session + v1 API). */
export async function createBuyerJobAssetDownload(
  prisma: PrismaClient,
  input: { jobId: string; buyerId: string; assetRef: string },
): Promise<
  | { downloadUrl: string; expiresInSeconds: number }
  | { error: string; httpStatus: 403 | 404 | 410 | 503 }
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
  const asset = job.result.assets.find((a) => a.id === input.assetRef);
  if (!asset) {
    return { error: "NOT_FOUND", httpStatus: 404 };
  }
  let bucket = asset.bucket;
  let objectKey = asset.objectKey;
  if (!bucket || !objectKey) {
    const stored = await prisma.storedAsset.findUnique({ where: { id: input.assetRef } });
    if (!stored) {
      return { error: "STORAGE_REF_MISSING", httpStatus: 404 };
    }
    bucket = stored.bucket;
    objectKey = stored.objectKey;
  }
  try {
    return await createPresignedDownload({
      bucket,
      objectKey,
      filename: sanitizeDownloadFilename(asset.filename),
    });
  } catch (err) {
    if (err instanceof Error && err.message === "OBJECT_STORAGE_NOT_CONFIGURED") {
      return { error: "OBJECT_STORAGE_NOT_CONFIGURED", httpStatus: 503 };
    }
    throw err;
  }
}
