import type { PrismaClient } from "@kivro/database";
import { compileDenylistPatterns, findDenylistMatch, stringifyBuyerPayload } from "./denylist.js";
import { buyerMaxJobsPerHour, hourWindowStart } from "./limits.js";

export type AbuseGateResult =
  | { ok: true }
  | { ok: false; code: string; reasons?: string[] };

/** §30 — hard gates before payment reservation (deterministic policy, not LLM). */
export async function assertBuyerJobSubmissionAllowed(
  prisma: PrismaClient,
  input: {
    buyerId: string;
    capabilityId: string;
    structuredInput: Record<string, unknown>;
  },
): Promise<AbuseGateResult> {
  const user = await prisma.user.findUnique({ where: { id: input.buyerId } });
  if (!user || user.status !== "ACTIVE") {
    return { ok: false, code: "BUYER_SUSPENDED" };
  }

  const capability = await prisma.capability.findUnique({
    where: { id: input.capabilityId },
    select: { status: true, sellerProfileId: true },
  });
  if (!capability || capability.status !== "PUBLISHED") {
    return { ok: false, code: "CAPABILITY_NOT_AVAILABLE" };
  }

  const denyRows = await prisma.abuseDenylistPattern.findMany({
    where: { active: true },
    select: { pattern: true, active: true },
  });
  const patterns = compileDenylistPatterns(denyRows);
  const payloadText = stringifyBuyerPayload(input.structuredInput);
  const deny = findDenylistMatch(payloadText, patterns);
  if (deny.matched) {
    return { ok: false, code: "INPUT_DENIED_BY_POLICY", reasons: ["DENYLIST_MATCH"] };
  }

  const windowStart = hourWindowStart();
  const maxJobs = buyerMaxJobsPerHour();
  const bucket = await prisma.buyerSubmissionRateBucket.upsert({
    where: {
      userId_windowStart: { userId: input.buyerId, windowStart },
    },
    create: { userId: input.buyerId, windowStart, jobCount: 0 },
    update: {},
  });
  if (bucket.jobCount >= maxJobs) {
    return { ok: false, code: "JOB_FREQUENCY_LIMIT", reasons: [`MAX_${maxJobs}_PER_HOUR`] };
  }

  return { ok: true };
}

export async function recordBuyerSubmissionAttempt(
  prisma: PrismaClient,
  buyerId: string,
): Promise<void> {
  const windowStart = hourWindowStart();
  await prisma.buyerSubmissionRateBucket.upsert({
    where: { userId_windowStart: { userId: buyerId, windowStart } },
    create: { userId: buyerId, windowStart, jobCount: 1 },
    update: { jobCount: { increment: 1 } },
  });
}
