import type { PrismaClient } from "@kivro/database";
import { evaluateCapabilityAvailability } from "./availability-service.js";
import { computeNextAvailableAt } from "./next-available.js";
import { parseScheduleConfig } from "./capability-schedule.js";

export type ImmediateSubmissionBlock =
  | { ok: true }
  | {
      error: string;
      reasons: string[];
      nextAvailableAt?: string;
    };

/** §406 — block immediate jobs before payment; include nextAvailableAt when schedule-closed. */
export async function assertImmediateSubmissionBeforePayment(
  prisma: PrismaClient,
  capabilityId: string,
): Promise<ImmediateSubmissionBlock> {
  const capability = await prisma.capability.findUnique({ where: { id: capabilityId } });
  if (!capability) {
    return { error: "NOT_FOUND", reasons: [] };
  }
  const schedule = parseScheduleConfig(capability);
  const availability = await evaluateCapabilityAvailability(prisma, capabilityId);
  if ("error" in availability) {
    return { error: availability.error, reasons: [] };
  }
  if (availability.accepting) {
    return { ok: true };
  }
  const scheduleClosed =
    availability.reasons.includes("SCHEDULE_CLOSED") ||
    availability.reasons.includes("MANUALLY_PAUSED");
  const nextAt = computeNextAvailableAt(schedule);
  if (scheduleClosed) {
    return {
      error: "CAPABILITY_SCHEDULED_OFFLINE",
      reasons: availability.reasons,
      nextAvailableAt: nextAt?.toISOString(),
    };
  }
  return {
    error: "CAPABILITY_NOT_ACCEPTING",
    reasons: availability.reasons,
    nextAvailableAt: nextAt?.toISOString(),
  };
}
