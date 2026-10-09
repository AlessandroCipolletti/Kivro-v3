import type { SecurityWarning } from "./security-warnings.js";

/** Critical conditions that trigger PLATFORM_SECURITY pause (§393). */
const AUTO_PLATFORM_PAUSE_CODES = new Set([
  "WORKER_VERSION_BELOW_MINIMUM",
  "DEVICE_REVOKED",
  "OPENCLAW_UNSUPPORTED",
  "DOCKER_UNAVAILABLE",
  "SANDBOX_NOT_READY",
]);

export function pickPlatformSecurityPauseTrigger(
  warnings: SecurityWarning[],
): { trigger: false } | { trigger: true; code: string; title: string } {
  for (const warning of warnings) {
    if (warning.severity === "CRITICAL" && AUTO_PLATFORM_PAUSE_CODES.has(warning.code)) {
      return { trigger: true, code: warning.code, title: warning.title };
    }
  }
  return { trigger: false };
}

export function platformSecurityPauseCanClear(warnings: SecurityWarning[]): boolean {
  return !pickPlatformSecurityPauseTrigger(warnings).trigger;
}
