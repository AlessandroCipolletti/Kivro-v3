import type { WeeklyWindow } from "./weekly-schedule.js";

const LOCAL_TIME = /^([01]?\d|2[0-3]):([0-5]\d)$/;

export function isValidIanaTimezone(timezone: string): boolean {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: timezone });
    return true;
  } catch {
    return false;
  }
}

export function parseLocalTimeToMinutes(value: string): number | null {
  const match = LOCAL_TIME.exec(value.trim());
  if (!match) {
    return null;
  }
  return Number(match[1]) * 60 + Number(match[2]);
}

export type ScheduleWindowInput = {
  dayOfWeek: number;
  startLocalTime?: string;
  endLocalTime?: string;
  startMinutes?: number;
  endMinutes?: number;
};

export function normalizeWeeklyWindows(
  windows: ScheduleWindowInput[],
): { ok: true; windows: WeeklyWindow[] } | { error: string } {
  if (windows.length > 21) {
    return { error: "TOO_MANY_WINDOWS" };
  }
  const normalized: WeeklyWindow[] = [];
  for (const window of windows) {
    if (window.dayOfWeek < 0 || window.dayOfWeek > 6) {
      return { error: "INVALID_DAY_OF_WEEK" };
    }
    let start = window.startMinutes;
    let end = window.endMinutes;
    if (window.startLocalTime != null) {
      const parsed = parseLocalTimeToMinutes(window.startLocalTime);
      if (parsed == null) {
        return { error: "INVALID_START_TIME" };
      }
      start = parsed;
    }
    if (window.endLocalTime != null) {
      const parsed = parseLocalTimeToMinutes(window.endLocalTime);
      if (parsed == null) {
        return { error: "INVALID_END_TIME" };
      }
      end = parsed;
    }
    if (start == null || end == null) {
      return { error: "WINDOW_TIMES_REQUIRED" };
    }
    if (start === end) {
      return { error: "ZERO_LENGTH_WINDOW" };
    }
    normalized.push({ dayOfWeek: window.dayOfWeek, startMinutes: start, endMinutes: end });
  }
  return { ok: true, windows: normalized };
}
