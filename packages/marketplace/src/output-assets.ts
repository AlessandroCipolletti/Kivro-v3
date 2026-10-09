export type JobOutputAssetRef = {
  id: string;
  filename: string;
  bucket?: string;
  objectKey?: string;
  mimeType?: string;
  sizeBytes?: number;
};

/** Parse job result manifest into buyer-visible asset refs (no secrets). */
export function parseJobOutputAssetManifest(raw: unknown): JobOutputAssetRef[] {
  if (!raw) {
    return [];
  }
  if (Array.isArray(raw)) {
    return raw.flatMap((item, index) => refFromEntry(item, index)).filter(Boolean) as JobOutputAssetRef[];
  }
  if (typeof raw === "object") {
    const o = raw as Record<string, unknown>;
    if (Array.isArray(o.assets)) {
      return parseJobOutputAssetManifest(o.assets);
    }
    if (Array.isArray(o.files)) {
      return parseJobOutputAssetManifest(o.files);
    }
  }
  return [];
}

function refFromEntry(item: unknown, index: number): JobOutputAssetRef | null {
  if (!item || typeof item !== "object") {
    return null;
  }
  const o = item as Record<string, unknown>;
  const filename =
    typeof o.filename === "string"
      ? o.filename
      : typeof o.name === "string"
        ? o.name
        : `deliverable-${index + 1}`;
  const id =
    typeof o.assetId === "string"
      ? o.assetId
      : typeof o.id === "string"
        ? o.id
        : `asset-${index}`;
  return {
    id,
    filename,
    bucket: typeof o.bucket === "string" ? o.bucket : undefined,
    objectKey: typeof o.objectKey === "string" ? o.objectKey : undefined,
    mimeType: typeof o.mimeType === "string" ? o.mimeType : undefined,
    sizeBytes: typeof o.sizeBytes === "number" ? o.sizeBytes : undefined,
  };
}
