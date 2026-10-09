export function buyerMaxJobsPerHour(): number {
  const raw = process.env.KIVRO_BUYER_MAX_JOBS_PER_HOUR;
  const n = raw ? Number.parseInt(raw, 10) : 40;
  return Number.isFinite(n) && n > 0 ? n : 40;
}

export function hourWindowStart(now = new Date()): Date {
  const d = new Date(now);
  d.setUTCMinutes(0, 0, 0);
  return d;
}
