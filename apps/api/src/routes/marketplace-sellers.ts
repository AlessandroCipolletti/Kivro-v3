import { getPrismaClient } from "@kivro/database";
import { buildPublicSellerIdentity, assertPublicSellerPayloadSafe } from "@kivro/seller-experience";
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
    const identity = buildPublicSellerIdentity(profile);
    const seller = {
      id: identity.sellerProfileId,
      displayName: identity.marketplaceDisplayName,
      marketplaceDisplayName: identity.marketplaceDisplayName,
      verificationStatus: identity.verificationStatus,
      capabilityCount: profile.capabilities.length,
    };
    assertPublicSellerPayloadSafe(seller as Record<string, unknown>);
    return c.json({
      seller,
      capabilities: profile.capabilities,
    });
  });

  return app;
}
