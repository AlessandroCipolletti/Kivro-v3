import { getPrismaClient } from "@kivro/database";
import { verifiedReputation } from "@kivro/marketplace";
import {
  assertPublicSellerPayloadSafe,
  buildPublicSellerIdentity,
  publicSellerPage,
} from "@kivro/seller-experience";
import { Hono } from "hono";

/** §124 — public seller profile for marketplace. */
export function marketplaceSellerRoutes(): Hono {
  const app = new Hono();

  app.get("/marketplace/sellers/:sellerProfileId", async (c) => {
    const profile = await getPrismaClient().sellerProfile.findUnique({
      where: { id: c.req.param("sellerProfileId") },
      include: {
        capabilities: {
          where: { status: "PUBLISHED", visibility: "PUBLIC", currentVersionId: { not: null } },
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
    const completedJobs = await getPrismaClient().job.count({
      where: {
        status: "COMPLETED",
        capabilityVersion: { capability: { sellerProfileId: profile.id } },
      },
    });
    const reviews = await getPrismaClient().capabilityReview.findMany({
      where: { sellerProfileId: profile.id, job: { status: "COMPLETED" } },
      select: { stars: true },
    });
    const reputation = verifiedReputation(
      reviews.map((review) => ({ stars: review.stars, fromCompletedJob: true })),
    );
    const page = publicSellerPage({
      displayName: identity.marketplaceDisplayName,
      memberSince: profile.firstPublishedAt,
      aggregateRating: reputation.average,
      completedJobs,
      publishedCapabilityCount: profile.capabilities.length,
      verificationStatus: identity.verificationStatus,
    });
    const seller = {
      id: identity.sellerProfileId,
      ...page,
      marketplaceDisplayName: identity.marketplaceDisplayName,
      capabilityCount: page.publishedCapabilityCount,
    };
    assertPublicSellerPayloadSafe(seller as Record<string, unknown>);
    return c.json({
      seller,
      capabilities: profile.capabilities,
    });
  });

  return app;
}
