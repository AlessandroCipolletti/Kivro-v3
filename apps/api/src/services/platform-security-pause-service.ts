import type { PrismaClient } from "@kivro/database";
import { setCapabilityManuallyPaused } from "@kivro/job-scheduling";
import type { SecurityWarning } from "@kivro/seller-health";
import { platformSecurityPauseCanClear } from "@kivro/seller-health";
import { randomUUID } from "node:crypto";

export async function activatePlatformSecurityPause(
  prisma: PrismaClient,
  input: { sellerProfileId: string; reasonCode: string; summary: string; workerDeviceId?: string },
): Promise<{ activated: boolean }> {
  const profile = await prisma.sellerProfile.findUnique({
    where: { id: input.sellerProfileId },
  });
  if (!profile || profile.platformSecurityPause) {
    return { activated: false };
  }

  const capabilities = await prisma.capability.findMany({
    where: { sellerProfileId: input.sellerProfileId, status: "PUBLISHED" },
    select: { id: true },
  });
  for (const cap of capabilities) {
    await setCapabilityManuallyPaused(prisma, {
      capabilityId: cap.id,
      sellerProfileId: input.sellerProfileId,
    });
  }

  await prisma.sellerProfile.update({
    where: { id: input.sellerProfileId },
    data: {
      platformSecurityPause: true,
      platformSecurityPauseReason: input.reasonCode,
      platformSecurityPausedAt: new Date(),
    },
  });

  const devices = input.workerDeviceId
    ? [{ id: input.workerDeviceId }]
    : await prisma.workerDevice.findMany({
        where: { sellerProfileId: input.sellerProfileId },
        select: { id: true },
      });
  for (const device of devices) {
    await prisma.workerHealthEvent.create({
      data: {
        id: randomUUID(),
        workerDeviceId: device.id,
        eventType: "PLATFORM_SECURITY_PAUSE",
        severity: "CRITICAL",
        summary: input.summary,
        payload: {
          scope: "ALL",
          source: "PLATFORM_SECURITY",
          reasonCode: input.reasonCode,
        },
      },
    });
  }

  return { activated: true };
}

export async function tryClearPlatformSecurityPause(
  prisma: PrismaClient,
  input: { sellerProfileId: string; warnings: SecurityWarning[] },
): Promise<{ cleared: boolean }> {
  const profile = await prisma.sellerProfile.findUnique({
    where: { id: input.sellerProfileId },
  });
  if (!profile?.platformSecurityPause) {
    return { cleared: false };
  }
  if (!platformSecurityPauseCanClear(input.warnings)) {
    return { cleared: false };
  }

  await prisma.sellerProfile.update({
    where: { id: input.sellerProfileId },
    data: {
      platformSecurityPause: false,
      platformSecurityPauseReason: null,
      platformSecurityPausedAt: null,
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
        eventType: "PLATFORM_SECURITY_CLEARED",
        severity: "INFO",
        summary: "Platform security pause cleared after health recovery",
        payload: { source: "PLATFORM_SECURITY" },
      },
    });
  }

  return { cleared: true };
}
