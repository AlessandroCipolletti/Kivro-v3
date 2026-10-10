import type { PrismaClient } from "@kivro/database";
import { deleteObject } from "@kivro/storage";

/** ASYNC-017/007 — idempotent expiry cleanup (storage best-effort, DB authoritative). */
export async function purgeExpiredJobDeliverables(
  prisma: PrismaClient,
  now: Date = new Date(),
  limit = 50,
): Promise<{ scanned: number; purgedAssets: number; errors: number }> {
  const expired = await prisma.storedAsset.findMany({
    where: {
      purpose: "JOB_DELIVERABLE",
      retentionExpiresAt: { lte: now },
    },
    take: limit,
  });
  let purgedAssets = 0;
  let errors = 0;
  for (const asset of expired) {
    try {
      await deleteObject({ bucket: asset.bucket, objectKey: asset.objectKey });
    } catch {
      errors += 1;
    }
    await prisma.storedAsset.delete({ where: { id: asset.id } });
    purgedAssets += 1;
  }
  return { scanned: expired.length, purgedAssets, errors };
}
