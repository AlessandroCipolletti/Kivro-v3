import type { PrismaClient } from "@kivro/database";

const WINDOW_MS = 60_000;
export const MAX_REQUESTS_PER_WINDOW = 120;

function windowStart(now = Date.now()): Date {
  const bucket = Math.floor(now / WINDOW_MS) * WINDOW_MS;
  return new Date(bucket);
}

/** §326 — per-key sliding window counter in PostgreSQL. */
export async function checkBuyerApiRateLimit(
  prisma: PrismaClient,
  input: { apiKeyId: string },
): Promise<
  | { allowed: true; limit: number; remaining: number; resetAt: Date }
  | { allowed: false; retryAfterSeconds: number; limit: number; remaining: 0; resetAt: Date }
> {
  const start = windowStart();
  const resetAt = new Date(start.getTime() + WINDOW_MS);
  const row = await prisma.buyerApiRateBucket.upsert({
    where: {
      apiKeyId_windowStart: { apiKeyId: input.apiKeyId, windowStart: start },
    },
    create: { apiKeyId: input.apiKeyId, windowStart: start, count: 1 },
    update: { count: { increment: 1 } },
  });
  const remaining = Math.max(0, MAX_REQUESTS_PER_WINDOW - row.count);
  if (row.count > MAX_REQUESTS_PER_WINDOW) {
    const retryAfterSeconds = Math.ceil((resetAt.getTime() - Date.now()) / 1000);
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, retryAfterSeconds),
      limit: MAX_REQUESTS_PER_WINDOW,
      remaining: 0,
      resetAt,
    };
  }
  return { allowed: true, limit: MAX_REQUESTS_PER_WINDOW, remaining, resetAt };
}
