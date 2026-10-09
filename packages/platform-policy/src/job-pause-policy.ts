/** Master Spec §438 — configurable max pause duration for paid jobs. */

const DEFAULT_MAX_PAUSE_MS = 4 * 60 * 60 * 1000;

export function maxPauseDurationMs(): number {
  const raw = process.env.KIVRO_MAX_PAUSE_DURATION_MS;
  if (!raw) {
    return DEFAULT_MAX_PAUSE_MS;
  }
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return DEFAULT_MAX_PAUSE_MS;
  }
  return parsed;
}

export function computePauseDeadline(requestedAtMs: number): Date {
  return new Date(requestedAtMs + maxPauseDurationMs());
}

export function isPauseDurationExceeded(pauseRequestedAt: Date, nowMs = Date.now()): boolean {
  return nowMs - pauseRequestedAt.getTime() > maxPauseDurationMs();
}
