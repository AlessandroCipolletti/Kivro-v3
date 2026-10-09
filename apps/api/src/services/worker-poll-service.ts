import type { PrismaClient } from "@kivro/database";
import { jobVisibleOnControlPlane } from "@kivro/cloud-core";
import { deriveMarketplaceControlState, parseWorkerHealthReport } from "@kivro/seller-health";

export async function executeWorkerPoll(
  prisma: PrismaClient,
  workerDeviceId: string,
  input: { controlPlaneId: string; fallbackControlPlaneId: string },
) {
  const device = await prisma.workerDevice.findUnique({
    where: { id: workerDeviceId },
    include: {
      sellerProfile: {
        select: { marketplaceEmergencyPause: true, platformSecurityPause: true },
      },
    },
  });
  if (!device || device.status === "REVOKED") {
    return { error: "FORBIDDEN" as const };
  }
  const report = parseWorkerHealthReport(device.lastHealthReport);
  const marketplaceControl = deriveMarketplaceControlState({
    cloudEmergencyPause: device.sellerProfile.marketplaceEmergencyPause,
    localPauseReported: report?.globalPauseActive === true,
    platformSecurityPause: device.sellerProfile.platformSecurityPause,
  });
  await prisma.workerDevice.update({
    where: { id: device.id },
    data: {
      status: marketplaceControl.dispatchBlocked ? "OFFLINE" : "ONLINE",
      lastSeenAt: new Date(),
    },
  });
  const rawOffers = marketplaceControl.dispatchBlocked
    ? []
    : await prisma.job.findMany({
        where: { workerDeviceId, status: "DISPATCHED" },
        take: 20,
      });
  const offers = rawOffers
    .filter((job) =>
      jobVisibleOnControlPlane({
        jobExecutionControlPlaneId: job.executionControlPlaneId,
        requestControlPlaneId: input.controlPlaneId,
        fallbackControlPlaneId: input.fallbackControlPlaneId,
      }),
    )
    .slice(0, 5);
  const rawControlJobs = await prisma.job.findMany({
    where: {
      workerDeviceId,
      status: { in: ["PAUSE_REQUESTED", "RESUME_REQUESTED"] },
    },
    take: 20,
  });
  const controlJobs = rawControlJobs.filter((job) =>
    jobVisibleOnControlPlane({
      jobExecutionControlPlaneId: job.executionControlPlaneId,
      requestControlPlaneId: input.controlPlaneId,
      fallbackControlPlaneId: input.fallbackControlPlaneId,
    }),
  );
  const commands: unknown[] = [];
  if (marketplaceControl.requiresLocalPauseSync) {
    commands.push({
      type: "GLOBAL_MARKETPLACE_PAUSE",
      protocolVersion: 1,
      source: "WEB",
      cloudEmergencyPause: marketplaceControl.cloudEmergencyPause,
      requestedAt: new Date().toISOString(),
    });
  }
  for (const job of controlJobs) {
    if (job.status === "PAUSE_REQUESTED" && job.activeControlCommandId) {
      commands.push({
        type: "JOB_PAUSE_REQUEST",
        protocolVersion: 1,
        jobId: job.id,
        commandId: job.activeControlCommandId,
        requestedAt: job.pauseRequestedAt?.toISOString() ?? new Date().toISOString(),
        source: "WEB",
      });
    }
    if (job.status === "RESUME_REQUESTED" && job.activeControlCommandId) {
      commands.push({
        type: "JOB_RESUME_REQUEST",
        protocolVersion: 1,
        jobId: job.id,
        commandId: job.activeControlCommandId,
        requestedAt: new Date().toISOString(),
        source: "WEB",
      });
    }
  }
  return {
    type: "WORKER_POLL" as const,
    protocolVersion: 1 as const,
    offers: offers.map((job) => ({
      protocolVersion: 1,
      jobId: job.id,
      workerId: workerDeviceId,
      capabilityVersionId: job.capabilityVersionId,
      inputManifestId: job.id,
      expiresAt: job.dispatchExpiresAt?.toISOString() ?? new Date(Date.now() + 60_000).toISOString(),
      paymentSecured: true as const,
    })),
    commands,
    marketplaceControl,
  };
}
