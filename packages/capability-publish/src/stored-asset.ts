import type { PrismaClient, StoredAsset, StoredAssetPurpose } from "@kivro/database";
import { createPresignedUpload, verifyUploadedObject } from "@kivro/storage";

const DEFAULT_MAX_BYTES = 50 * 1024 * 1024;

export async function createUploadSlot(
  db: PrismaClient,
  input: {
    sellerProfileId: string;
    purpose: StoredAssetPurpose;
    contentHash: string;
    mimeType?: string;
    maxBytes?: number;
  },
): Promise<{ asset: StoredAsset; uploadUrl: string; expiresInSeconds: number }> {
  const maxBytes = input.maxBytes ?? DEFAULT_MAX_BYTES;
  const slot = await createPresignedUpload({
    namespace: "sellers",
    ownerId: input.sellerProfileId,
    purpose: input.purpose,
    contentHash: input.contentHash,
    mimeType: input.mimeType,
    maxBytes,
  });
  const asset = await db.storedAsset.create({
    data: {
      sellerProfileId: input.sellerProfileId,
      purpose: input.purpose,
      bucket: slot.bucket,
      objectKey: slot.objectKey,
      contentHash: input.contentHash,
      sizeBytes: 0n,
      mimeType: input.mimeType,
    },
  });
  return { asset, uploadUrl: slot.uploadUrl, expiresInSeconds: slot.expiresInSeconds };
}

export async function confirmStoredAssetUpload(
  db: PrismaClient,
  sellerProfileId: string,
  assetId: string,
): Promise<StoredAsset> {
  const asset = await db.storedAsset.findFirst({
    where: { id: assetId, sellerProfileId },
  });
  if (!asset) {
    throw new Error("NOT_FOUND");
  }
  if (asset.uploadConfirmedAt) {
    return asset;
  }
  const verified = await verifyUploadedObject({
    bucket: asset.bucket,
    objectKey: asset.objectKey,
    expectedHash: asset.contentHash,
    maxBytes: DEFAULT_MAX_BYTES,
  });
  return db.storedAsset.update({
    where: { id: asset.id },
    data: {
      sizeBytes: verified.sizeBytes,
      uploadConfirmedAt: new Date(),
    },
  });
}
