/** Master Spec §398–§399 — recurring weekly windows in IANA timezone. */

export type ScheduleMode = "ALWAYS_AVAILABLE" | "CUSTOM_SCHEDULE" | "MANUALLY_PAUSED";

export type WeeklyWindow = {
  dayOfWeek: number;
  startMinutes: number;
  endMinutes: number;
};

export type CapabilityScheduleConfig = {
  mode: ScheduleMode;
  timezone: string;
  windows: WeeklyWindow[];
};

function localParts(date: Date, timeZone: string): { dayOfWeek: number; minutes: number } {
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone,
    weekday: "short",
    hour: "numeric",
    minute: "numeric",
    hour12: false,
  });
  const parts = fmt.formatToParts(date);
  const weekday = parts.find((p) => p.type === "weekday")?.value ?? "Sun";
  const hour = Number(parts.find((p) => p.type === "hour")?.value ?? 0);
  const minute = Number(parts.find((p) => p.type === "minute")?.value ?? 0);
  const dayMap: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };
  return { dayOfWeek: dayMap[weekday] ?? 0, minutes: hour * 60 + minute };
}

function windowContainsMinute(window: WeeklyWindow, dayOfWeek: number, minutes: number): boolean {
  if (window.startMinutes <= window.endMinutes) {
    return window.dayOfWeek === dayOfWeek && minutes >= window.startMinutes && minutes < window.endMinutes;
  }
  if (window.dayOfWeek === dayOfWeek && minutes >= window.startMinutes) {
    return true;
  }
  const nextDay = (window.dayOfWeek + 1) % 7;
  if (nextDay === dayOfWeek && minutes < window.endMinutes) {
    return true;
  }
  return false;
}

export function isScheduleOpen(config: CapabilityScheduleConfig, at: Date = new Date()): boolean {
  if (config.mode === "MANUALLY_PAUSED") {
    return false;
  }
  if (config.mode === "ALWAYS_AVAILABLE") {
    return true;
  }
  const { dayOfWeek, minutes } = localParts(at, config.timezone);
  return config.windows.some((w) => windowContainsMinute(w, dayOfWeek, minutes));
}
