import { getPrismaClient } from "@kivro/database";
import { Hono } from "hono";

/** §124 — public seller profile for marketplace. */
export function marketplaceSellerRoutes(): Hono {
  const app = new Hono();

  app.get("/marketplace/sellers/:sellerProfileId", async (c) => {
    const profile = await getPrismaClient().sellerProfile.findUnique({
      where: { id: c.req.param("sellerProfileId") },
      include: {
        capabilities: {
          where: { status: "PUBLISHED", currentVersionId: { not: null } },
          select: {
            id: true,
            slug: true,
            name: true,
            description: true,
            priceTierCents: true,
            currency: true,
            rating: true,
            reviewCount: true,
            jobCount: true,
            marketplaceCategory: true,
          },
        },
      },
    });
    if (!profile) {
      return c.json({ error: "NOT_FOUND" }, 404);
    }
    return c.json({
      seller: {
        id: profile.id,
        displayName: profile.displayName,
        verificationStatus: profile.verificationStatus,
        capabilityCount: profile.capabilities.length,
      },
      capabilities: profile.capabilities,
    });
  });

  return app;
}
