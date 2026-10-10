import type { PrismaClient } from "@kivro/database";
import { evaluateCapabilityAvailability } from "@kivro/job-scheduling";
import {
  buildSecurityWarnings,
  computeJobMetrics,
  describeCapabilityHealth,
  deriveWorkerHealthLabel,
  LATEST_SUPPORTED_WORKER_VERSION,
  MIN_SECURITY_WORKER_VERSION,
  parseWorkerHealthReport,
  sellerOperationalAnswers,
} from "@kivro/seller-health";
import { buildCloudCredentialRefs } from "@kivro/seller-experience";

const ACTIVE_JOB_STATUSES = [
  "DISPATCHED",
  "ACCEPTED",
  "STARTING",
  "RUNNING",
  "PAUSE_REQUESTED",
  "PAUSED",
  "RESUME_REQUESTED",
  "SECURITY_PAUSED",
  "UPLOADING_RESULT",
] as const;

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
      platformSecurityPause: profile.platformSecurityPause,
      platformSecurityReason: profile.platformSecurityPauseReason,
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
      dockerOk: report?.dockerOk ?? null,
      sandboxOk: report?.sandboxOk ?? null,
      warnings,
      credentialRefs: buildCloudCredentialRefs({
        refs: (report?.credentialRefs ?? []).map((r) => ({
          refId: r.refId,
          provider: r.provider,
          lastVerifiedAt: r.lastVerifiedAt,
        })),
      }),
    };
  });

  const capabilityHealth = [];
  for (const cap of profile.capabilities) {
    const availability = await evaluateCapabilityAvailability(prisma, cap.id);
    if ("error" in availability) {
      continue;
    }
    const described = describeCapabilityHealth({
      buyerAvailability: availability.buyerAvailability,
      accepting: availability.accepting,
      reasons: availability.reasons,
    });
    capabilityHealth.push({
      id: cap.id,
      slug: cap.slug,
      name: cap.name,
      status: cap.status,
      healthLabel: described.healthLabel,
      detail: described.detail,
      accepting: availability.accepting,
      buyerAvailability: availability.buyerAvailability,
      reasons: availability.reasons,
      nextAvailableAt: availability.nextAvailableAt ?? null,
      globalPauseBlocksResume:
        profile.marketplaceEmergencyPause || profile.platformSecurityPause,
    });
  }

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
  const runningJobsCount = await prisma.job.count({
    where: {
      capabilityVersion: { capability: { sellerProfileId } },
      status: { in: [...ACTIVE_JOB_STATUSES] },
    },
  });

  const events = await prisma.workerHealthEvent.findMany({
    where: { workerDevice: { sellerProfileId } },
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      id: true,
      eventType: true,
      severity: true,
      summary: true,
      payload: true,
      createdAt: true,
      workerDeviceId: true,
    },
  });

  const primary = deviceSummaries[0];
  const operationalControl = sellerOperationalAnswers({
    workerHealthy: primary?.status === "ONLINE",
    workerVersion: primary?.workerVersion ?? null,
    openClawCompatible: Boolean(primary?.openClawVersion),
    isolationWorking: primary != null && primary.sandboxOk !== false && primary.dockerOk !== false,
    executingNow: runningJobsCount,
    queued: jobs.filter((job) => job.status === "QUEUED" || job.status === "SCHEDULED").length,
    recentFailureCount: jobs.filter((job) => job.status.startsWith("FAILED")).length,
    securityWarnings: deviceSummaries.flatMap((device) => device.warnings.map((warning) => warning.code)),
    cloudReachable: true,
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
      platformSecurityPause: {
        active: profile.platformSecurityPause,
        reason: profile.platformSecurityPauseReason,
        pausedAt: profile.platformSecurityPausedAt?.toISOString() ?? null,
      },
      workerVersionPolicy: {
        minimumSecurityVersion: MIN_SECURITY_WORKER_VERSION,
        latestSupportedVersion: LATEST_SUPPORTED_WORKER_VERSION,
      },
      runningJobsCount,
      workers: deviceSummaries,
      capabilities: capabilityHealth,
      jobMetrics: metrics,
      operationalControl,
      healthTimeline: events.map((e) => ({
        ...e,
        createdAt: e.createdAt.toISOString(),
      })),
    },
  };
}
