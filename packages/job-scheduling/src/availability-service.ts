import type { Prisma, PrismaClient } from "@kivro/database";

type SchedulingDb = PrismaClient | Prisma.TransactionClient;
import { isGlobalDispatchEnabled } from "@kivro/platform-policy";
import {
  buildSecurityWarnings,
  hasBlockingSecurityWarning,
  parseWorkerHealthReport,
} from "@kivro/seller-health";
import { evaluateAcceptingNewJobs } from "./accepting-jobs.js";
import { parseScheduleConfig } from "./capability-schedule.js";
import { computeNextAvailableAt } from "./next-available.js";

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

export async function evaluateCapabilityAvailability(
  prisma: SchedulingDb,
  capabilityId: string,
): Promise<
  | {
      accepting: boolean;
      buyerAvailability: string;
      reasons: string[];
      nextAvailableAt?: string;
    }
  | { error: string }
> {
  const capability = await prisma.capability.findUnique({
    where: { id: capabilityId },
    include: {
      sellerProfile: { select: { marketplaceEmergencyPause: true } },
      currentVersion: {
        include: {
          bindings: { include: { workerDevice: true } },
        },
      },
    },
  });
  if (!capability?.currentVersion) {
    return { error: "NOT_FOUND" };
  }
  const binding = capability.currentVersion.bindings[0];
  const device = binding?.workerDevice;
  const schedule = parseScheduleConfig(capability);
  let hasActiveJob = false;
  if (device) {
    const active = await prisma.job.count({
      where: {
        workerDeviceId: device.id,
        status: { in: [...ACTIVE_JOB_STATUSES] },
      },
    });
    hasActiveJob = active > 0;
  }
  const healthReport = device ? parseWorkerHealthReport(device.lastHealthReport) : null;
  const securityWarnings = buildSecurityWarnings({
    report: healthReport,
    deviceStatus: device?.status ?? "OFFLINE",
    sellerEmergencyPause: capability.sellerProfile.marketplaceEmergencyPause,
  });
  const evaluation = evaluateAcceptingNewJobs({
    capabilityPublished: capability.status === "PUBLISHED",
    schedule,
    workerDeviceStatus: device?.status ?? "OFFLINE",
    hasActiveJobOnWorker: hasActiveJob,
    globalDispatchEnabled: isGlobalDispatchEnabled(),
    sellerEmergencyPause: capability.sellerProfile.marketplaceEmergencyPause,
    securityBlocksDispatch: hasBlockingSecurityWarning(securityWarnings),
  });
  const nextAvailableAt = computeNextAvailableAt(schedule);
  return {
    accepting: evaluation.accepting,
    buyerAvailability: evaluation.buyerAvailability,
    reasons: evaluation.reasons,
    nextAvailableAt: nextAvailableAt?.toISOString(),
  };
}

export async function assertImmediateJobSubmissionAllowed(
  prisma: SchedulingDb,
  capabilityId: string,
): Promise<{ ok: true } | { error: string; reasons: string[] }> {
  const result = await evaluateCapabilityAvailability(prisma, capabilityId);
  if ("error" in result) {
    return { error: result.error, reasons: [] };
  }
  if (!result.accepting) {
    const scheduleClosed =
      result.reasons.includes("SCHEDULE_CLOSED") ||
      result.reasons.includes("MANUALLY_PAUSED");
    return {
      error: scheduleClosed ? "CAPABILITY_SCHEDULED_OFFLINE" : "CAPABILITY_NOT_ACCEPTING",
      reasons: result.reasons,
    };
  }
  return { ok: true };
}
