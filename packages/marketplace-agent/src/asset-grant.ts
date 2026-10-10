/** §226 — one READ grant, one asset, one target job. No file copy. */
export type CrossJobAssetGrant = {
  assetId: string;
  sourceJobId: string;
  targetJobId: string;
  permission: "READ";
  expiresAt: string;
};

export function issueCrossJobAssetGrant(input: {
  assetId: string;
  sourceJobId: string;
  targetJobId: string;
  now: Date;
  ttlMs?: number;
}): CrossJobAssetGrant {
  const ttlMs = input.ttlMs ?? 24 * 60 * 60 * 1000;
  return {
    assetId: input.assetId,
    sourceJobId: input.sourceJobId,
    targetJobId: input.targetJobId,
    permission: "READ",
    expiresAt: new Date(input.now.getTime() + ttlMs).toISOString(),
  };
}

export function grantAllowsRead(
  grant: CrossJobAssetGrant,
  request: { assetId: string; targetJobId: string; now: Date },
): boolean {
  if (grant.permission !== "READ") {
    return false;
  }
  if (grant.assetId !== request.assetId || grant.targetJobId !== request.targetJobId) {
    return false;
  }
  return Date.parse(grant.expiresAt) > request.now.getTime();
}
