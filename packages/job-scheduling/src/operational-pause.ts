import type { PrismaClient } from "@kivro/database";
import { parseScheduleConfig, updateCapabilitySchedule } from "./capability-schedule.js";

/** §412 — manual operational pause while capability stays published. */
export async function setCapabilityManuallyPaused(
  prisma: PrismaClient,
  input: { capabilityId: string; sellerProfileId: string; actorUserId?: string },
): Promise<{ ok: true } | { error: string }> {
  const capability = await prisma.capability.findFirst({
    where: {
      id: input.capabilityId,
      sellerProfileId: input.sellerProfileId,
      status: "PUBLISHED",
    },
  });
  if (!capability) {
    return { error: "NOT_FOUND" };
  }
  const current = parseScheduleConfig(capability);
  return updateCapabilitySchedule(prisma, {
    capabilityId: capability.id,
    sellerProfileId: input.sellerProfileId,
    mode: "MANUALLY_PAUSED",
    timezone: current.timezone,
    windows: current.windows,
    actorUserId: input.actorUserId,
  });
}

export async function clearCapabilityManualPause(
  prisma: PrismaClient,
  input: { capabilityId: string; sellerProfileId: string; actorUserId?: string },
): Promise<{ ok: true } | { error: string }> {
  const capability = await prisma.capability.findFirst({
    where: {
      id: input.capabilityId,
      sellerProfileId: input.sellerProfileId,
      status: "PUBLISHED",
    },
  });
  if (!capability) {
    return { error: "NOT_FOUND" };
  }
  const lastChange = await prisma.capabilityScheduleChange.findFirst({
    where: { capabilityId: capability.id },
    orderBy: { createdAt: "desc" },
  });
  let restoreMode: "ALWAYS_AVAILABLE" | "CUSTOM_SCHEDULE" = "ALWAYS_AVAILABLE";
  let restoreWindows = parseScheduleConfig(capability).windows;
  if (lastChange?.previousSchedule && typeof lastChange.previousSchedule === "object") {
    const prev = lastChange.previousSchedule as {
      mode?: string;
      windows?: typeof restoreWindows;
    };
    if (prev.mode === "CUSTOM_SCHEDULE" || prev.mode === "ALWAYS_AVAILABLE") {
      restoreMode = prev.mode;
    }
    if (Array.isArray(prev.windows)) {
      restoreWindows = prev.windows;
    }
  } else if (capability.scheduleMode === "MANUALLY_PAUSED") {
    restoreMode = "ALWAYS_AVAILABLE";
  } else {
    restoreMode =
      capability.scheduleMode === "CUSTOM_SCHEDULE" ? "CUSTOM_SCHEDULE" : "ALWAYS_AVAILABLE";
  }
  return updateCapabilitySchedule(prisma, {
    capabilityId: capability.id,
    sellerProfileId: input.sellerProfileId,
    mode: restoreMode,
    timezone: capability.scheduleTimezone,
    windows: restoreWindows,
    actorUserId: input.actorUserId,
  });
}
