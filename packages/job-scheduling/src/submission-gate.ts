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

/** §502 — an unavailable capability is refused before any funds move. */
export function purchaseBlockedBeforeFunds(input: {
  accepting: boolean;
  buyerAvailability: string;
}): { ok: true } | { ok: false; error: "CAPABILITY_SCHEDULED_OFFLINE" | "CAPABILITY_NOT_ACCEPTING" } {
  if (input.accepting) {
    return { ok: true };
  }
  if (input.buyerAvailability === "SCHEDULED_OFFLINE") {
    return { ok: false, error: "CAPABILITY_SCHEDULED_OFFLINE" };
  }
  return { ok: false, error: "CAPABILITY_NOT_ACCEPTING" };
}

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
  const decision = purchaseBlockedBeforeFunds({
    accepting: availability.accepting,
    buyerAvailability: availability.buyerAvailability,
  });
  if (decision.ok) {
    return { ok: true };
  }
  const nextAt = computeNextAvailableAt(schedule);
  return {
    error: decision.error,
    reasons: availability.reasons,
    nextAvailableAt: nextAt?.toISOString(),
  };
}
