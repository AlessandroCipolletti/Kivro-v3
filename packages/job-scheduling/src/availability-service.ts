import type { Prisma, PrismaClient } from "@kivro/database";

type SchedulingDb = PrismaClient | Prisma.TransactionClient;
import { isGlobalDispatchEnabled } from "@kivro/platform-policy";
import {
  buildSecurityWarnings,
  hasBlockingSecurityWarning,
  parseWorkerHealthReport,
} from "@kivro/seller-health";
import { evaluateAcceptingNewJobs } from "./accepting-jobs.js";
import { summarizeAssignedWorkerPool, type AssignedWorkerCandidate } from "./worker-routing.js";
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
  const schedule = parseScheduleConfig(capability);
  const bindings = capability.currentVersion.bindings;
  const deviceIds = bindings.map((binding) => binding.workerDeviceId);
  const activeJobs = deviceIds.length
    ? await prisma.job.findMany({
        where: {
          workerDeviceId: { in: deviceIds },
          status: { in: [...ACTIVE_JOB_STATUSES] },
        },
        select: { workerDeviceId: true },
      })
    : [];
  const activeByDevice = new Map<string, number>();
  for (const job of activeJobs) {
    if (!job.workerDeviceId) {
      continue;
    }
    activeByDevice.set(job.workerDeviceId, (activeByDevice.get(job.workerDeviceId) ?? 0) + 1);
  }
  const maxConcurrent =
    capability.maxConcurrentJobs ?? capability.sellerProfile.maxConcurrentJobs ?? 1;
  const candidates: AssignedWorkerCandidate[] = bindings.map((binding) => {
    const device = binding.workerDevice;
    const warnings = buildSecurityWarnings({
      report: parseWorkerHealthReport(device.lastHealthReport),
      deviceStatus: device.status,
      sellerEmergencyPause: capability.sellerProfile.marketplaceEmergencyPause,
      platformSecurityPause: capability.sellerProfile.platformSecurityPause,
      platformSecurityReason: capability.sellerProfile.platformSecurityPauseReason,
    });
    return {
      workerDeviceId: device.id,
      deviceStatus: device.status,
      bindingStatus: binding.status,
      activeJobCount: activeByDevice.get(device.id) ?? 0,
      securityBlocksDispatch: hasBlockingSecurityWarning(warnings),
    };
  });
  const pool = summarizeAssignedWorkerPool({ candidates, maxConcurrentJobs: maxConcurrent });
  const evaluation = evaluateAcceptingNewJobs({
    capabilityPublished: capability.status === "PUBLISHED",
    schedule,
    workerDeviceStatus: pool.workerDeviceStatus,
    hasActiveJobOnWorker: pool.hasActiveJob,
    activeJobCountOnWorker: pool.activeJobCount,
    maxConcurrentJobs: maxConcurrent,
    globalDispatchEnabled: isGlobalDispatchEnabled(),
    sellerEmergencyPause: capability.sellerProfile.marketplaceEmergencyPause,
    platformSecurityPause: capability.sellerProfile.platformSecurityPause,
    securityBlocksDispatch: pool.securityBlocksDispatch,
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
