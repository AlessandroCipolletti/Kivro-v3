/** Master Spec §434 — capability/runtime pause support levels. */

export const PAUSE_SUPPORT_LEVELS = ["FULL_RESUME", "RESTART_STEP", "NOT_SUPPORTED"] as const;

export type PauseSupportLevel = (typeof PAUSE_SUPPORT_LEVELS)[number];

export function parsePauseSupportLevel(value: unknown): PauseSupportLevel {
  if (typeof value === "string" && (PAUSE_SUPPORT_LEVELS as readonly string[]).includes(value)) {
    return value as PauseSupportLevel;
  }
  return "RESTART_STEP";
}

export function pauseAllowedForSupport(level: PauseSupportLevel): boolean {
  return level !== "NOT_SUPPORTED";
}
