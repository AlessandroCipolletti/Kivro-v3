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
      sellerProfile: {
        select: {
          marketplaceEmergencyPause: true,
          platformSecurityPause: true,
          platformSecurityPauseReason: true,
          maintenanceMode: true,
          maxConcurrentJobs: true,
        },
      },
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
  let activeJobCount = 0;
  if (device) {
    activeJobCount = await prisma.job.count({
      where: {
        workerDeviceId: device.id,
        status: { in: [...ACTIVE_JOB_STATUSES] },
      },
    });
  }
  const maxConcurrent =
    capability.maxConcurrentJobs ?? capability.sellerProfile.maxConcurrentJobs ?? 1;
  const healthReport = device ? parseWorkerHealthReport(device.lastHealthReport) : null;
  const securityWarnings = buildSecurityWarnings({
    report: healthReport,
    deviceStatus: device?.status ?? "OFFLINE",
    sellerEmergencyPause: capability.sellerProfile.marketplaceEmergencyPause,
    platformSecurityPause: capability.sellerProfile.platformSecurityPause,
    platformSecurityReason: capability.sellerProfile.platformSecurityPauseReason,
  });
  const evaluation = evaluateAcceptingNewJobs({
    capabilityPublished: capability.status === "PUBLISHED",
    schedule,
    workerDeviceStatus: device?.status ?? "OFFLINE",
    hasActiveJobOnWorker: activeJobCount > 0,
    activeJobCountOnWorker: activeJobCount,
    maxConcurrentJobs: maxConcurrent,
    globalDispatchEnabled: isGlobalDispatchEnabled(),
    sellerEmergencyPause: capability.sellerProfile.marketplaceEmergencyPause,
    platformSecurityPause: capability.sellerProfile.platformSecurityPause,
    securityBlocksDispatch: hasBlockingSecurityWarning(securityWarnings),
    sellerMaintenanceMode: capability.sellerProfile.maintenanceMode,
  });
  const nextAvailableAt = computeNextAvailableAt(schedule);
  return {
    accepting: evaluation.accepting,
    buyerAvailability: evaluation.buyerAvailability,
    reasons: evaluation.reasons,
    nextAvailableAt: nextAvailableAt?.toISOString(),
  };
}

/** SELLERUX-014 — lock the Worker row, then count active jobs, before dispatch. */
export async function reserveWorkerDispatchSlot(
  tx: Prisma.TransactionClient,
  input: { workerDeviceId: string; capabilityId: string },
): Promise<{ ok: true } | { error: "CONCURRENCY_LIMIT" | "NOT_FOUND" }> {
  await tx.$queryRaw`SELECT id FROM "WorkerDevice" WHERE id = ${input.workerDeviceId} FOR UPDATE`;
  const capability = await tx.capability.findUnique({
    where: { id: input.capabilityId },
    select: {
      maxConcurrentJobs: true,
      sellerProfile: { select: { maxConcurrentJobs: true } },
    },
  });
  if (!capability) {
    return { error: "NOT_FOUND" };
  }
  const max = Math.max(
    1,
    capability.maxConcurrentJobs ?? capability.sellerProfile.maxConcurrentJobs ?? 1,
  );
  const active = await tx.job.count({
    where: {
      workerDeviceId: input.workerDeviceId,
      status: { in: [...ACTIVE_JOB_STATUSES] },
    },
  });
  if (active >= max) {
    return { error: "CONCURRENCY_LIMIT" };
  }
  return { ok: true };
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
