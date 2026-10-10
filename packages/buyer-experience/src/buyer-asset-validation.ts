import type { PrismaClient } from "@kivro/database";

export type SubmissionAssetRef = {
  assetId: string;
  filename: string;
  sizeBytes?: number;
  declaredMimeType?: string;
};

/** BUYERUX-017 — reject expired/missing/unowned input assets at purchase (never silent reuse). */
export async function validateBuyerSubmissionAssets(
  prisma: PrismaClient,
  input: {
    buyerId: string;
    assets?: Record<string, unknown> | null;
  },
): Promise<
  | { ok: true; normalized: Record<string, SubmissionAssetRef[]> }
  | { ok: false; error: "INPUT_ASSET_INVALID" | "INPUT_ASSET_EXPIRED"; fieldKey?: string; assetId?: string }
> {
  const normalized: Record<string, SubmissionAssetRef[]> = {};
  if (!input.assets || typeof input.assets !== "object") {
    return { ok: true, normalized };
  }
  for (const [fieldKey, value] of Object.entries(input.assets)) {
    if (!Array.isArray(value)) {
      continue;
    }
    const refs: SubmissionAssetRef[] = [];
    for (const item of value) {
      if (!item || typeof item !== "object") {
        return { ok: false, error: "INPUT_ASSET_INVALID", fieldKey };
      }
      const o = item as Record<string, unknown>;
      const assetId = typeof o.assetId === "string" ? o.assetId : typeof o.id === "string" ? o.id : null;
      const filename =
        typeof o.filename === "string" ? o.filename : typeof o.name === "string" ? o.name : "file";
      if (!assetId) {
        return { ok: false, error: "INPUT_ASSET_INVALID", fieldKey };
      }
      const stored = await prisma.storedAsset.findUnique({ where: { id: assetId } });
      if (!stored || stored.buyerId !== input.buyerId || !stored.uploadConfirmedAt) {
        return { ok: false, error: "INPUT_ASSET_INVALID", fieldKey, assetId };
      }
      if (stored.retentionExpiresAt && stored.retentionExpiresAt.getTime() <= Date.now()) {
        return { ok: false, error: "INPUT_ASSET_EXPIRED", fieldKey, assetId };
      }
      const sizeBytes =
        typeof o.sizeBytes === "number" && Number.isFinite(o.sizeBytes)
          ? o.sizeBytes
          : Number(stored.sizeBytes);
      refs.push({
        assetId,
        filename,
        sizeBytes,
        declaredMimeType:
          typeof o.declaredMimeType === "string"
            ? o.declaredMimeType
            : stored.mimeType ?? undefined,
      });
    }
    if (refs.length > 0) {
      normalized[fieldKey] = refs;
    }
  }
  return { ok: true, normalized };
}
