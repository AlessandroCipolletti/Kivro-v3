import { getPrismaClient } from "@kivro/database";
import { capabilityReviewDistribution, listCapabilityReviews } from "@kivro/marketplace";
import { Hono } from "hono";

export function capabilityReviewRoutes(): Hono {
  const app = new Hono();

  app.get("/capabilities/:slug/reviews", async (c) => {
    const slug = c.req.param("slug");
    const capability = await getPrismaClient().capability.findFirst({
      where: { slug, status: "PUBLISHED" },
      select: { id: true, rating: true, reviewCount: true },
    });
    if (!capability) {
      return c.json({ error: "NOT_FOUND" }, 404);
    }
    const prisma = getPrismaClient();
    const reviews = await listCapabilityReviews(prisma, capability.id);
    const distribution = await capabilityReviewDistribution(prisma, capability.id);
    return c.json({
      rating: capability.rating,
      reviewCount: capability.reviewCount,
      distribution,
      reviews,
    });
  });

  return app;
}
