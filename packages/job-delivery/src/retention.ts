/** M29 — shared result retention semantics (both deployment profiles). */

const DEFAULT_RETENTION_DAYS = 90;

export function jobResultRetentionDays(env: NodeJS.ProcessEnv = process.env): number {
  const raw = env.KIVRO_JOB_RESULT_RETENTION_DAYS;
  const n = raw ? Number.parseInt(raw, 10) : DEFAULT_RETENTION_DAYS;
  return Number.isFinite(n) && n > 0 ? n : DEFAULT_RETENTION_DAYS;
}

export function computeResultRetentionExpiresAt(
  completedAt: Date,
  env: NodeJS.ProcessEnv = process.env,
): Date {
  const days = jobResultRetentionDays(env);
  return new Date(completedAt.getTime() + days * 86_400_000);
}

export function isResultRetentionExpired(
  expiresAt: Date | null | undefined,
  now: Date = new Date(),
): boolean {
  return Boolean(expiresAt && expiresAt.getTime() <= now.getTime());
}
