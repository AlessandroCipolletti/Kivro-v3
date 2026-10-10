import { getPrismaClient } from "@kivro/database";
import { capabilityReviewDistribution, listCapabilityReviews } from "@kivro/marketplace";
import { resolveSessionUser } from "@kivro/auth";
import { getCookie } from "hono/cookie";
import { Hono } from "hono";
import { sessionCookieName } from "../env.js";
import { findVisibleCapability } from "../services/capability-visibility.js";

export function capabilityReviewRoutes(): Hono {
  const app = new Hono();

  app.get("/capabilities/:slug/reviews", async (c) => {
    const slug = c.req.param("slug");
    const viewer = await resolveSessionUser(getPrismaClient(), getCookie(c, sessionCookieName()));
    const capability = await findVisibleCapability(
      getPrismaClient(),
      { slug },
      viewer?.status === "ACTIVE" ? viewer.id : null,
    );
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
