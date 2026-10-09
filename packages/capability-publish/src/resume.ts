import type { Capability, PrismaClient } from "@kivro/database";

/** Restore listing after seller pause (status PAUSED → PUBLISHED). Schedule unchanged. */
export async function resumeCapability(
  db: PrismaClient,
  sellerProfileId: string,
  capabilityId: string,
): Promise<Capability> {
  const capability = await db.capability.findFirst({
    where: { id: capabilityId, sellerProfileId, status: "PAUSED" },
  });
  if (!capability) {
    throw new Error("NOT_FOUND");
  }
  return db.capability.update({
    where: { id: capability.id },
    data: { status: "PUBLISHED" },
  });
}
