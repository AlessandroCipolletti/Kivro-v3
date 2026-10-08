import type { Capability, CapabilityVersion, PrismaClient } from "@kivro/database";

export async function rollbackCapabilityVersion(
  db: PrismaClient,
  sellerProfileId: string,
  capabilityId: string,
  targetVersionId: string,
): Promise<{ capability: Capability; activeVersion: CapabilityVersion }> {
  const capability = await db.capability.findFirst({
    where: { id: capabilityId, sellerProfileId },
  });
  if (!capability) {
    throw new Error("NOT_FOUND");
  }
  const target = await db.capabilityVersion.findFirst({
    where: { id: targetVersionId, capabilityId, publishedAt: { not: null } },
  });
  if (!target) {
    throw new Error("ROLLBACK_NOT_READY");
  }
  if (target.id === capability.currentVersionId) {
    return { capability, activeVersion: target };
  }
  const updated = await db.capability.update({
    where: { id: capability.id },
    data: {
      status: "PUBLISHED",
      currentVersionId: target.id,
      priceTierCents: target.priceSnapshotCents,
    },
  });
  return { capability: updated, activeVersion: target };
}
