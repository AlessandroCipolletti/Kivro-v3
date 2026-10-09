import type { PrismaClient } from "@kivro/database";
import {
  buildSecurityWarnings,
  deriveMarketplaceControlState,
  deriveWorkerHealthLabel,
  hasBlockingSecurityWarning,
  MAX_HEALTH_EVENTS_PER_DEVICE,
  pickPlatformSecurityPauseTrigger,
  shouldRecordSecurityEvent,
  type WorkerHealthReport,
} from "@kivro/seller-health";
import { randomUUID } from "node:crypto";
import {
  activatePlatformSecurityPause,
  tryClearPlatformSecurityPause,
} from "./platform-security-pause-service.js";
import { syncCloudFromWorkerLocalPause } from "./sync-worker-local-pause.js";

async function pruneHealthEvents(prisma: PrismaClient, workerDeviceId: string): Promise<void> {
  const count = await prisma.workerHealthEvent.count({ where: { workerDeviceId } });
  if (count <= MAX_HEALTH_EVENTS_PER_DEVICE) {
    return;
  }
  const excess = count - MAX_HEALTH_EVENTS_PER_DEVICE;
  const oldest = await prisma.workerHealthEvent.findMany({
    where: { workerDeviceId },
    orderBy: { createdAt: "asc" },
    take: excess,
    select: { id: true },
  });
  if (oldest.length > 0) {
    await prisma.workerHealthEvent.deleteMany({
      where: { id: { in: oldest.map((o) => o.id) } },
    });
  }
}

export async function applyWorkerHeartbeat(
  prisma: PrismaClient,
  input: { workerDeviceId: string; report: WorkerHealthReport },
): Promise<
  | {
      ok: true;
      healthLabel: string;
      warnings: ReturnType<typeof buildSecurityWarnings>;
      blocking: boolean;
      marketplaceControl: ReturnType<typeof deriveMarketplaceControlState>;
      platformSecurityPause: boolean;
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

  const telemetryWarnings = buildSecurityWarnings({
    report: input.report,
    deviceStatus: device.status,
    sellerEmergencyPause: device.sellerProfile.marketplaceEmergencyPause,
    platformSecurityPause: false,
  });

  const trigger = pickPlatformSecurityPauseTrigger(telemetryWarnings);
  if (trigger.trigger && !device.sellerProfile.platformSecurityPause) {
    await activatePlatformSecurityPause(prisma, {
      sellerProfileId: device.sellerProfileId,
      reasonCode: trigger.code,
      summary: trigger.title,
      workerDeviceId: device.id,
    });
  } else if (device.sellerProfile.platformSecurityPause) {
    await tryClearPlatformSecurityPause(prisma, {
      sellerProfileId: device.sellerProfileId,
      warnings: telemetryWarnings,
    });
  }

  const profile = await prisma.sellerProfile.findUnique({
    where: { id: device.sellerProfileId },
  });
  if (!profile) {
    return { error: "FORBIDDEN" };
  }

  const warnings = buildSecurityWarnings({
    report: input.report,
    deviceStatus: device.status,
    sellerEmergencyPause: profile.marketplaceEmergencyPause,
    platformSecurityPause: profile.platformSecurityPause,
    platformSecurityReason: profile.platformSecurityPauseReason,
  });
  const blocking = hasBlockingSecurityWarning(warnings);
  const healthLabel = deriveWorkerHealthLabel({
    deviceStatus: device.status === "PAIRED" ? "ONLINE" : device.status,
    lastSeenAt: new Date(),
    report: input.report,
    sellerEmergencyPause: profile.marketplaceEmergencyPause,
    warnings,
  });

  const marketplaceControl = deriveMarketplaceControlState({
    cloudEmergencyPause: profile.marketplaceEmergencyPause,
    localPauseReported: input.report.globalPauseActive,
    platformSecurityPause: profile.platformSecurityPause,
  });

  await prisma.workerDevice.update({
    where: { id: device.id },
    data: {
      status: marketplaceControl.dispatchBlocked ? "OFFLINE" : "ONLINE",
      lastSeenAt: new Date(),
      lastHealthReport: input.report as object,
    },
  });

  if (input.report.globalPauseActive) {
    await syncCloudFromWorkerLocalPause(prisma, {
      sellerProfileId: device.sellerProfileId,
      workerDeviceId: device.id,
    });
    const lastLocal = await prisma.workerHealthEvent.findFirst({
      where: { workerDeviceId: device.id, eventType: "LOCAL_PAUSE" },
      orderBy: { createdAt: "desc" },
    });
    if (
      shouldRecordSecurityEvent({
        lastEventSummary: lastLocal?.summary ?? null,
        newSummary: "Worker reported local global pause",
        lastEventAt: lastLocal?.createdAt ?? null,
      })
    ) {
      await prisma.workerHealthEvent.create({
        data: {
          id: randomUUID(),
          workerDeviceId: device.id,
          eventType: "LOCAL_PAUSE",
          severity: "WARNING",
          summary: "Worker reported local global pause",
          payload: { source: "LOCAL_CLI", scope: "ALL" },
        },
      });
    }
  }

  const criticalNew = telemetryWarnings.filter((w) => w.severity === "CRITICAL");
  if (criticalNew.length > 0) {
    const summary = criticalNew.map((w) => w.title).join("; ");
    const lastSec = await prisma.workerHealthEvent.findFirst({
      where: { workerDeviceId: device.id, eventType: "SECURITY_WARNING" },
      orderBy: { createdAt: "desc" },
    });
    if (
      shouldRecordSecurityEvent({
        lastEventSummary: lastSec?.summary ?? null,
        newSummary: summary,
        lastEventAt: lastSec?.createdAt ?? null,
      })
    ) {
      await prisma.workerHealthEvent.create({
        data: {
          id: randomUUID(),
          workerDeviceId: device.id,
          eventType: "SECURITY_WARNING",
          severity: "CRITICAL",
          summary,
          payload: { warnings: criticalNew },
        },
      });
    }
  }

  await pruneHealthEvents(prisma, device.id);

  return {
    ok: true,
    healthLabel,
    warnings,
    blocking,
    marketplaceControl,
    platformSecurityPause: profile.platformSecurityPause,
  };
}
