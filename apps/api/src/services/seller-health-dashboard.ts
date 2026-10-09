import type { PrismaClient } from "@kivro/database";
import { parseScheduleConfig } from "@kivro/job-scheduling";
import {
  buildSecurityWarnings,
  computeJobMetrics,
  deriveWorkerHealthLabel,
  parseWorkerHealthReport,
} from "@kivro/seller-health";

export async function buildSellerHealthDashboard(
  prisma: PrismaClient,
  sellerProfileId: string,
): Promise<{ error: string } | { dashboard: Record<string, unknown> }> {
  const profile = await prisma.sellerProfile.findUnique({
    where: { id: sellerProfileId },
    include: {
      workerDevices: true,
      capabilities: {
        where: { status: { in: ["PUBLISHED", "PAUSED"] } },
        include: {
          currentVersion: {
            include: {
              bindings: { include: { workerDevice: true } },
            },
          },
        },
      },
    },
  });
  if (!profile) {
    return { error: "NOT_FOUND" };
  }

  const deviceSummaries = profile.workerDevices.map((device) => {
    const report = parseWorkerHealthReport(device.lastHealthReport);
    const warnings = buildSecurityWarnings({
      report,
      deviceStatus: device.status,
      sellerEmergencyPause: profile.marketplaceEmergencyPause,
    });
    const label = deriveWorkerHealthLabel({
      deviceStatus: device.status,
      lastSeenAt: device.lastSeenAt,
      report,
      sellerEmergencyPause: profile.marketplaceEmergencyPause,
      warnings,
    });
    return {
      id: device.id,
      name: device.name,
      platform: device.platform,
      workerVersion: device.workerVersion,
      openClawVersion: device.openClawVersion,
      status: device.status,
      lastSeenAt: device.lastSeenAt?.toISOString() ?? null,
      healthLabel: label,
      lastHeartbeatAt: report?.reportedAt ?? null,
      report,
      warnings,
    };
  });

  const capabilityHealth = profile.capabilities.map((cap) => {
    const binding = cap.currentVersion?.bindings[0];
    const device = binding?.workerDevice;
    const schedule = parseScheduleConfig(cap);
    return {
      id: cap.id,
      slug: cap.slug,
      name: cap.name,
      status: cap.status,
      scheduleMode: schedule.mode,
      workerDeviceId: device?.id ?? null,
      workerOnline: device?.status === "ONLINE",
    };
  });

  const jobs = await prisma.job.findMany({
    where: {
      capabilityVersion: { capability: { sellerProfileId } },
    },
    select: {
      status: true,
      createdAt: true,
      completedAt: true,
      startedAt: true,
    },
    orderBy: { createdAt: "desc" },
    take: 500,
  });

  const metrics = computeJobMetrics(jobs);

  const events = await prisma.workerHealthEvent.findMany({
    where: { workerDevice: { sellerProfileId } },
    orderBy: { createdAt: "desc" },
    take: 40,
    select: {
      id: true,
      eventType: true,
      severity: true,
      summary: true,
      createdAt: true,
      workerDeviceId: true,
    },
  });

  return {
    dashboard: {
      sellerProfileId: profile.id,
      displayName: profile.displayName,
      emergencyPause: {
        active: profile.marketplaceEmergencyPause,
        pausedAt: profile.marketplaceEmergencyPausedAt?.toISOString() ?? null,
        source: profile.marketplaceEmergencyPauseSource,
      },
      workers: deviceSummaries,
      capabilities: capabilityHealth,
      jobMetrics: metrics,
      healthTimeline: events.map((e) => ({
        ...e,
        createdAt: e.createdAt.toISOString(),
      })),
    },
  };
}
