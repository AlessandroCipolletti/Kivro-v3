import type { PrismaClient } from "@kivro/database";

const WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 120;

/** §326 — lightweight per-key rate limit using recent idempotency/writes as proxy. */
export async function checkBuyerApiRateLimit(
  prisma: PrismaClient,
  input: { apiKeyId: string },
): Promise<{ allowed: true } | { allowed: false; retryAfterSeconds: number }> {
  const since = new Date(Date.now() - WINDOW_MS);
  const count = await prisma.apiIdempotencyRecord.count({
    where: { apiKeyId: input.apiKeyId, createdAt: { gte: since } },
  });
  if (count >= MAX_REQUESTS_PER_WINDOW) {
    return { allowed: false, retryAfterSeconds: 60 };
  }
  return { allowed: true };
}
