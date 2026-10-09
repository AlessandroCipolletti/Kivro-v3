import type { PrismaClient } from "@kivro/database";
import { setCapabilityManuallyPaused, clearCapabilityManualPause } from "@kivro/job-scheduling";
import { randomUUID } from "node:crypto";

export async function activateSellerEmergencyPause(
  prisma: PrismaClient,
  input: { sellerProfileId: string; actorUserId: string; source: "WEB" | "CLI" },
): Promise<{ ok: true; pausedCapabilityIds: string[] } | { error: string }> {
  const profile = await prisma.sellerProfile.findUnique({
    where: { id: input.sellerProfileId },
  });
  if (!profile) {
    return { error: "NOT_FOUND" };
  }

  const capabilities = await prisma.capability.findMany({
    where: { sellerProfileId: input.sellerProfileId, status: "PUBLISHED" },
    select: { id: true },
  });

  const pausedCapabilityIds: string[] = [];
  for (const cap of capabilities) {
    const result = await setCapabilityManuallyPaused(prisma, {
      capabilityId: cap.id,
      sellerProfileId: input.sellerProfileId,
      actorUserId: input.actorUserId,
    });
    if ("error" in result) {
      continue;
    }
    pausedCapabilityIds.push(cap.id);
  }

  await prisma.sellerProfile.update({
    where: { id: input.sellerProfileId },
    data: {
      marketplaceEmergencyPause: true,
      marketplaceEmergencyPausedAt: new Date(),
      marketplaceEmergencyPauseSource: input.source,
    },
  });

  const devices = await prisma.workerDevice.findMany({
    where: { sellerProfileId: input.sellerProfileId },
    select: { id: true },
  });
  for (const device of devices) {
    await prisma.workerHealthEvent.create({
      data: {
        id: randomUUID(),
        workerDeviceId: device.id,
        eventType: "EMERGENCY_PAUSE",
        severity: "WARNING",
        summary: "Seller activated emergency pause — new jobs disabled",
        payload: { source: input.source, capabilityIds: pausedCapabilityIds },
      },
    });
  }

  return { ok: true, pausedCapabilityIds };
}

export async function resumeSellerEmergencyPause(
  prisma: PrismaClient,
  input: { sellerProfileId: string; actorUserId: string },
): Promise<{ ok: true; resumedCapabilityIds: string[] } | { error: string }> {
  const profile = await prisma.sellerProfile.findUnique({
    where: { id: input.sellerProfileId },
  });
  if (!profile) {
    return { error: "NOT_FOUND" };
  }
  if (!profile.marketplaceEmergencyPause) {
    return { ok: true, resumedCapabilityIds: [] };
  }

  const capabilities = await prisma.capability.findMany({
    where: { sellerProfileId: input.sellerProfileId, status: "PUBLISHED" },
    select: { id: true },
  });

  const resumedCapabilityIds: string[] = [];
  for (const cap of capabilities) {
    const result = await clearCapabilityManualPause(prisma, {
      capabilityId: cap.id,
      sellerProfileId: input.sellerProfileId,
      actorUserId: input.actorUserId,
    });
    if ("error" in result) {
      continue;
    }
    resumedCapabilityIds.push(cap.id);
  }

  await prisma.sellerProfile.update({
    where: { id: input.sellerProfileId },
    data: {
      marketplaceEmergencyPause: false,
      marketplaceEmergencyPausedAt: null,
      marketplaceEmergencyPauseSource: null,
    },
  });

  const devices = await prisma.workerDevice.findMany({
    where: { sellerProfileId: input.sellerProfileId },
    select: { id: true },
  });
  for (const device of devices) {
    await prisma.workerHealthEvent.create({
      data: {
        id: randomUUID(),
        workerDeviceId: device.id,
        eventType: "EMERGENCY_RESUME",
        severity: "INFO",
        summary: "Seller resumed marketplace job acceptance",
        payload: { capabilityIds: resumedCapabilityIds },
      },
    });
  }

  return { ok: true, resumedCapabilityIds };
}
