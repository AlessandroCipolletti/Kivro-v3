import type { Capability, PrismaClient } from "@kivro/database";

export async function pauseCapability(
  db: PrismaClient,
  sellerProfileId: string,
  capabilityId: string,
): Promise<Capability> {
  const capability = await db.capability.findFirst({
    where: { id: capabilityId, sellerProfileId, status: "PUBLISHED" },
  });
  if (!capability) {
    throw new Error("NOT_FOUND");
  }
  return db.capability.update({
    where: { id: capability.id },
    data: { status: "PAUSED" },
  });
}
