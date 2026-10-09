import type { Prisma, PrismaClient } from "@kivro/database";
import type { CapabilityScheduleConfig, ScheduleMode, WeeklyWindow } from "./weekly-schedule.js";
import {
  isValidIanaTimezone,
  normalizeWeeklyWindows,
  type ScheduleWindowInput,
} from "./schedule-validation.js";
import { recheckScheduledJobsAfterScheduleChange } from "./schedule-change-impact.js";

export function parseScheduleConfig(raw: {
  scheduleMode: string | null;
  scheduleTimezone: string | null;
  scheduleWindows: unknown;
}): CapabilityScheduleConfig {
  const mode = (raw.scheduleMode ?? "ALWAYS_AVAILABLE") as ScheduleMode;
  const timezone = raw.scheduleTimezone ?? "UTC";
  const windows = Array.isArray(raw.scheduleWindows)
    ? (raw.scheduleWindows as WeeklyWindow[])
    : [];
  return { mode, timezone, windows };
}

export async function updateCapabilitySchedule(
  prisma: PrismaClient,
  input: {
    capabilityId: string;
    sellerProfileId: string;
    mode: ScheduleMode;
    timezone: string;
    windows: WeeklyWindow[] | ScheduleWindowInput[];
    actorUserId?: string;
  },
): Promise<{ ok: true } | { error: string }> {
  const capability = await prisma.capability.findFirst({
    where: { id: input.capabilityId, sellerProfileId: input.sellerProfileId },
  });
  if (!capability) {
    return { error: "NOT_FOUND" };
  }
  if (!isValidIanaTimezone(input.timezone)) {
    return { error: "INVALID_TIMEZONE" };
  }
  const normalized =
    input.mode === "CUSTOM_SCHEDULE"
      ? normalizeWeeklyWindows(input.windows)
      : ({ ok: true as const, windows: [] as WeeklyWindow[] } as const);
  if (!("ok" in normalized)) {
    return { error: normalized.error };
  }
  if (input.mode === "CUSTOM_SCHEDULE" && normalized.windows.length === 0) {
    return { error: "WINDOWS_REQUIRED" };
  }
  const previous = parseScheduleConfig(capability);
  await prisma.capability.update({
    where: { id: capability.id },
    data: {
      scheduleMode: input.mode,
      scheduleTimezone: input.timezone,
      scheduleWindows: JSON.parse(JSON.stringify(normalized.windows)) as Prisma.InputJsonValue,
    },
  });
  const newScheduleConfig: CapabilityScheduleConfig = {
    mode: input.mode,
    timezone: input.timezone,
    windows: normalized.windows,
  };
  await prisma.capabilityScheduleChange.create({
    data: {
      capabilityId: capability.id,
      sellerProfileId: input.sellerProfileId,
      previousSchedule: JSON.parse(JSON.stringify(previous)) as Prisma.InputJsonValue,
      newSchedule: JSON.parse(
        JSON.stringify({
          mode: input.mode,
          timezone: input.timezone,
          windows: normalized.windows,
        }),
      ) as Prisma.InputJsonValue,
      changedByUserId: input.actorUserId,
    },
  });
  await recheckScheduledJobsAfterScheduleChange(prisma, capability.id, newScheduleConfig);
  return { ok: true };
}
