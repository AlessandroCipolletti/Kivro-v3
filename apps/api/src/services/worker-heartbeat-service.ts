import type { PrismaClient } from "@kivro/database";
import {
  buildSecurityWarnings,
  deriveWorkerHealthLabel,
  hasBlockingSecurityWarning,
  type WorkerHealthReport,
} from "@kivro/seller-health";
import { randomUUID } from "node:crypto";

export async function applyWorkerHeartbeat(
  prisma: PrismaClient,
  input: { workerDeviceId: string; report: WorkerHealthReport },
): Promise<
  | {
      ok: true;
      healthLabel: string;
      warnings: ReturnType<typeof buildSecurityWarnings>;
      blocking: boolean;
    }
  | { error: string }
> {
  const device = await prisma.workerDevice.findUnique({
    where: { id: input.workerDeviceId },
    include: { sellerProfile: true },
  });
  if (!device || device.status === "REVOKED") {
    return { error: "FORBIDDEN" };
  }

  const warnings = buildSecurityWarnings({
    report: input.report,
    deviceStatus: device.status,
    sellerEmergencyPause: device.sellerProfile.marketplaceEmergencyPause,
  });
  const blocking = hasBlockingSecurityWarning(warnings);
  const healthLabel = deriveWorkerHealthLabel({
    deviceStatus: device.status === "PAIRED" ? "ONLINE" : device.status,
    lastSeenAt: new Date(),
    report: input.report,
    sellerEmergencyPause: device.sellerProfile.marketplaceEmergencyPause,
    warnings,
  });

  await prisma.workerDevice.update({
    where: { id: device.id },
    data: {
      status: "ONLINE",
      lastSeenAt: new Date(),
      lastHealthReport: input.report as object,
    },
  });

  const criticalNew = warnings.filter((w) => w.severity === "CRITICAL");
  if (criticalNew.length > 0) {
    await prisma.workerHealthEvent.create({
      data: {
        id: randomUUID(),
        workerDeviceId: device.id,
        eventType: "SECURITY_WARNING",
        severity: "CRITICAL",
        summary: criticalNew.map((w) => w.title).join("; "),
        payload: { warnings: criticalNew },
      },
    });
  }

  if (input.report.globalPauseActive && !device.sellerProfile.marketplaceEmergencyPause) {
    await prisma.workerHealthEvent.create({
      data: {
        id: randomUUID(),
        workerDeviceId: device.id,
        eventType: "LOCAL_PAUSE",
        severity: "WARNING",
        summary: "Worker reported local global pause",
        payload: {},
      },
    });
  }

  return { ok: true, healthLabel, warnings, blocking };
}
