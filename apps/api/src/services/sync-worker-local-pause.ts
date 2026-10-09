import type { PrismaClient } from "@kivro/database";
import { setCapabilityManuallyPaused } from "@kivro/job-scheduling";
import { randomUUID } from "node:crypto";

/** §387 — Worker-reported local pause marks published capabilities paused on cloud. */
export async function syncCloudFromWorkerLocalPause(
  prisma: PrismaClient,
  input: { sellerProfileId: string; workerDeviceId: string },
): Promise<{ syncedCapabilityIds: string[] }> {
  const profile = await prisma.sellerProfile.findUnique({
    where: { id: input.sellerProfileId },
  });
  if (!profile || profile.marketplaceEmergencyPause) {
    return { syncedCapabilityIds: [] };
  }

  const capabilities = await prisma.capability.findMany({
    where: { sellerProfileId: input.sellerProfileId, status: "PUBLISHED" },
    select: { id: true, scheduleMode: true },
  });

  const syncedCapabilityIds: string[] = [];
  for (const cap of capabilities) {
    if (cap.scheduleMode === "MANUALLY_PAUSED") {
      continue;
    }
    const result = await setCapabilityManuallyPaused(prisma, {
      capabilityId: cap.id,
      sellerProfileId: input.sellerProfileId,
    });
    if ("error" in result) {
      continue;
    }
    syncedCapabilityIds.push(cap.id);
  }

  if (syncedCapabilityIds.length > 0) {
    await prisma.workerHealthEvent.create({
      data: {
        id: randomUUID(),
        workerDeviceId: input.workerDeviceId,
        eventType: "LOCAL_PAUSE_CLOUD_SYNC",
        severity: "WARNING",
        summary: "Cloud synced capability pause from Worker local pause",
        payload: { capabilityIds: syncedCapabilityIds, source: "LOCAL_CLI" },
      },
    });
  }

  return { syncedCapabilityIds };
}
