import type { PrismaClient } from "@kivro/database";

export async function recomputeCapabilityRating(
  prisma: PrismaClient,
  capabilityId: string,
): Promise<void> {
  const agg = await prisma.capabilityReview.aggregate({
    where: { capabilityId },
    _avg: { stars: true },
    _count: { _all: true },
  });
  await prisma.capability.update({
    where: { id: capabilityId },
    data: {
      rating: agg._avg.stars ?? null,
      reviewCount: agg._count._all,
    },
  });
}

/** §128 — one review per completed paid job, buyer-only. */
export async function submitJobReview(
  prisma: PrismaClient,
  input: { jobId: string; buyerId: string; stars: number; body?: string },
): Promise<{ reviewId: string } | { error: string }> {
  if (input.stars < 1 || input.stars > 5) {
    return { error: "INVALID_STARS" };
  }
  const job = await prisma.job.findUnique({
    where: { id: input.jobId },
    include: {
      capabilityVersion: { include: { capability: { include: { sellerProfile: true } } } },
      review: true,
    },
  });
  if (!job || job.buyerId !== input.buyerId) {
    return { error: "NOT_FOUND" };
  }
  if (job.status !== "COMPLETED") {
    return { error: "JOB_NOT_REVIEWABLE" };
  }
  if (job.capabilityVersion.capability.sellerProfile.userId === input.buyerId) {
    return { error: "SELF_REVIEW_FORBIDDEN" };
  }
  if (job.review) {
    await prisma.capabilityReview.update({
      where: { jobId: job.id },
      data: { stars: input.stars, body: input.body?.slice(0, 2000) ?? null },
    });
    const capabilityId = job.capabilityVersion.capability.id;
    await recomputeCapabilityRating(prisma, capabilityId);
    return { reviewId: job.review.id };
  }
  const capabilityId = job.capabilityVersion.capability.id;
  const created = await prisma.capabilityReview.create({
    data: {
      jobId: job.id,
      buyerId: input.buyerId,
      capabilityId,
      capabilityVersionId: job.capabilityVersionId,
      sellerProfileId: job.capabilityVersion.capability.sellerProfileId,
      stars: input.stars,
      body: input.body?.slice(0, 2000),
    },
  });
  await recomputeCapabilityRating(prisma, capabilityId);
  return { reviewId: created.id };
}

export async function listCapabilityReviews(
  prisma: PrismaClient,
  capabilityId: string,
  limit = 20,
): Promise<
  Array<{
    id: string;
    stars: number;
    body: string | null;
    createdAt: string;
  }>
> {
  const rows = await prisma.capabilityReview.findMany({
    where: { capabilityId },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: { id: true, stars: true, body: true, createdAt: true },
  });
  return rows.map((r: { id: string; stars: number; body: string | null; createdAt: Date }) => ({
    id: r.id,
    stars: r.stars,
    body: r.body,
    createdAt: r.createdAt.toISOString(),
  }));
}
