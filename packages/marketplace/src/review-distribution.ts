import type { PrismaClient } from "@kivro/database";

export async function capabilityReviewDistribution(
  prisma: PrismaClient,
  capabilityId: string,
): Promise<Record<"1" | "2" | "3" | "4" | "5", number>> {
  const rows = await prisma.capabilityReview.groupBy({
    by: ["stars"],
    where: { capabilityId },
    _count: { _all: true },
  });
  const dist = { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 };
  for (const row of rows) {
    const key = String(row.stars) as keyof typeof dist;
    if (key in dist) {
      dist[key] = row._count._all;
    }
  }
  return dist;
}
