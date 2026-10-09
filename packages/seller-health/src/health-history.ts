/** Master Spec §381 — bounded sanitized health event retention. */

export const MAX_HEALTH_EVENTS_PER_DEVICE = 150;

export function shouldRecordSecurityEvent(input: {
  lastEventSummary: string | null;
  newSummary: string;
  withinMs?: number;
  now?: Date;
  lastEventAt?: Date | null;
}): boolean {
  if (input.lastEventSummary !== input.newSummary) {
    return true;
  }
  if (!input.lastEventAt) {
    return true;
  }
  const now = input.now ?? new Date();
  const windowMs = input.withinMs ?? 5 * 60 * 1000;
  return now.getTime() - input.lastEventAt.getTime() > windowMs;
}
