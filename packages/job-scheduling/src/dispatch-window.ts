import type { PrismaClient } from "@kivro/database";
import { parseScheduleConfig } from "./capability-schedule.js";
import { isScheduleOpen } from "./weekly-schedule.js";

/** §408 — queued jobs may start only inside an allowed execution window. */
export async function isCapabilityExecutionWindowOpen(
  prisma: PrismaClient,
  capabilityId: string,
  at: Date = new Date(),
): Promise<boolean> {
  const capability = await prisma.capability.findUnique({ where: { id: capabilityId } });
  if (!capability || capability.status !== "PUBLISHED") {
    return false;
  }
  const schedule = parseScheduleConfig(capability);
  return isScheduleOpen(schedule, at);
}

export async function assertQueuedJobDispatchAllowed(
  prisma: PrismaClient,
  jobId: string,
): Promise<{ ok: true } | { error: string }> {
  const job = await prisma.job.findUnique({ where: { id: jobId } });
  if (!job) {
    return { error: "JOB_NOT_FOUND" };
  }
  const open = await isCapabilityExecutionWindowOpen(prisma, job.capabilityId);
  if (!open) {
    return { error: "EXECUTION_WINDOW_CLOSED" };
  }
  return { ok: true };
}
