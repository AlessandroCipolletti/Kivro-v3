/** §470 — bounded wait after scheduled eligibility (hours, env override). */
export function scheduledMaxWaitMs(): number {
  const raw = process.env.KIVRO_SCHEDULED_MAX_WAIT_HOURS;
  const hours = raw ? Number(raw) : 72;
  if (!Number.isFinite(hours) || hours <= 0) {
    return 72 * 60 * 60 * 1000;
  }
  return hours * 60 * 60 * 1000;
}

export function computeScheduleWaitDeadline(from: Date): Date {
  return new Date(from.getTime() + scheduledMaxWaitMs());
}

/** §472 MVP — cap reservations per capability per local schedule day bucket. */
export function maxScheduledReservationsPerWindow(): number {
  const raw = process.env.KIVRO_MAX_SCHEDULED_PER_WINDOW;
  const n = raw ? Number(raw) : 10;
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 10;
}
