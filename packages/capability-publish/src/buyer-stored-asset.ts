import type { PrismaClient, StoredAsset } from "@kivro/database";
import { sniffMime } from "@kivro/job-io";
import { createPresignedUpload, readObjectPrefix, verifyUploadedObject } from "@kivro/storage";

const DEFAULT_MAX_BYTES = 104_857_600;

export async function createBuyerUploadSlot(
  db: PrismaClient,
  input: {
    buyerId: string;
    contentHash: string;
    mimeType?: string;
    maxBytes?: number;
  },
): Promise<{ asset: StoredAsset; uploadUrl: string; expiresInSeconds: number }> {
  const maxBytes = input.maxBytes ?? DEFAULT_MAX_BYTES;
  const slot = await createPresignedUpload({
    namespace: "buyers",
    ownerId: input.buyerId,
    purpose: "BUYER_JOB_INPUT",
    contentHash: input.contentHash,
    mimeType: input.mimeType,
    maxBytes,
  });
  const asset = await db.storedAsset.create({
    data: {
      buyerId: input.buyerId,
      purpose: "BUYER_JOB_INPUT",
      bucket: slot.bucket,
      objectKey: slot.objectKey,
      contentHash: input.contentHash,
      sizeBytes: 0n,
      mimeType: input.mimeType,
    },
  });
  return { asset, uploadUrl: slot.uploadUrl, expiresInSeconds: slot.expiresInSeconds };
}

export async function confirmBuyerStoredAssetUpload(
  db: PrismaClient,
  buyerId: string,
  assetId: string,
): Promise<{ asset: StoredAsset; sniffedMime?: string }> {
  const asset = await db.storedAsset.findFirst({
    where: { id: assetId, buyerId, purpose: "BUYER_JOB_INPUT" },
  });
  if (!asset) {
    throw new Error("NOT_FOUND");
  }
  if (asset.uploadConfirmedAt) {
    return { asset };
  }
  const verified = await verifyUploadedObject({
    bucket: asset.bucket,
    objectKey: asset.objectKey,
    expectedHash: asset.contentHash,
    maxBytes: DEFAULT_MAX_BYTES,
  });
  let sniffedMime: string | undefined;
  try {
    const prefix = await readObjectPrefix({
      bucket: asset.bucket,
      objectKey: asset.objectKey,
    });
    sniffedMime = sniffMime(prefix);
  } catch {
    sniffedMime = undefined;
  }
  const updated = await db.storedAsset.update({
    where: { id: asset.id },
    data: {
      sizeBytes: verified.sizeBytes,
      uploadConfirmedAt: new Date(),
      ...(sniffedMime ? { mimeType: sniffedMime } : {}),
    },
  });
  return { asset: updated, sniffedMime };
}
