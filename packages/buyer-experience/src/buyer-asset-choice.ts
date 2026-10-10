/** A buyer may upload a new file or reuse one they already own. */
export function buyerAssetChoice(input: {
  assetId: string | null;
  requesterId: string;
  ownerId: string | null;
}): "upload_new" | "reuse_previous" | "forbidden" {
  if (!input.assetId) {
    return "upload_new";
  }
  if (!input.ownerId || input.ownerId !== input.requesterId) {
    return "forbidden";
  }
  return "reuse_previous";
}
