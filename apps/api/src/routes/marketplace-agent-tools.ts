import { getPrismaClient } from "@kivro/database";
import { summarizeMarketplaceAvailability } from "@kivro/job-scheduling";
import { toolGetCapability, toolSearchCapabilities, sanitizeMarketplaceTextForAgent } from "@kivro/marketplace-agent";
import type { CapabilityListingRow } from "@kivro/marketplace";
import { Hono } from "hono";
import { requireAuth, requireVerifiedEmail } from "../middleware/auth.js";
import { findVisibleCapability, publicMarketplaceWhere } from "../services/capability-visibility.js";
import type { AppEnv } from "../types.js";

/** §149 — strict-schema agent tools over marketplace services. */
export function marketplaceAgentToolRoutes(): Hono<AppEnv> {
  const app = new Hono<AppEnv>();
  app.use("*", requireAuth, requireVerifiedEmail);

  app.post("/marketplace/agent/tools/search_capabilities", async (c) => {
    const body = await c.req.json<{
      query?: string;
      category?: string;
      maxPriceCents?: number;
      minRating?: number;
      onlineOnly?: boolean;
      limit?: number;
    }>();
    const listings = await loadListings();
    const q = sanitizeMarketplaceTextForAgent(body.query ?? "");
    const results = toolSearchCapabilities(listings, {
      q,
      category: body.category,
      maxPriceCents: body.maxPriceCents,
      minRating: body.minRating,
      onlineOnly: body.onlineOnly,
      limit: body.limit ?? 10,
    });
    return c.json({ capabilities: results });
  });

  app.get("/marketplace/agent/tools/get_capability/:slug", async (c) => {
    const listings = await loadListings();
    const cap = toolGetCapability(listings, c.req.param("slug"));
    if (!cap) {
      return c.json({ error: "NOT_FOUND" }, 404);
    }
    return c.json({
      capability: {
        ...cap,
        description: sanitizeMarketplaceTextForAgent(cap.description),
      },
    });
  });

  app.get("/marketplace/agent/tools/get_reviews_summary/:slug", async (c) => {
    const row = await findVisibleCapability(
      getPrismaClient(),
      { slug: c.req.param("slug") },
      c.get("user").id,
    );
    if (!row) {
      return c.json({ error: "NOT_FOUND" }, 404);
    }
    return c.json({ slug: row.slug, name: row.name, rating: row.rating, reviewCount: row.reviewCount });
  });

  app.get("/marketplace/agent/tools/get_availability/:slug", async (c) => {
    const row = await findVisibleCapability(
      getPrismaClient(),
      { slug: c.req.param("slug") },
      c.get("user").id,
    );
    if (!row) {
      return c.json({ error: "NOT_FOUND" }, 404);
    }
    const [avail] = await summarizeMarketplaceAvailability(getPrismaClient(), [row.id]);
    return c.json({ availability: avail ?? null });
  });

  app.get("/marketplace/agent/tools/get_price_quote/:slug", async (c) => {
    const row = await findVisibleCapability(
      getPrismaClient(),
      { slug: c.req.param("slug") },
      c.get("user").id,
    );
    if (!row?.currentVersion) {
      return c.json({ error: "NOT_FOUND" }, 404);
    }
    return c.json({
      slug: row.slug,
      priceCents: row.currentVersion.priceSnapshotCents,
      currency: row.currentVersion.currency,
    });
  });

  return app;
}

async function loadListings(): Promise<CapabilityListingRow[]> {
  const rows = await getPrismaClient().capability.findMany({
    where: publicMarketplaceWhere,
    include: {
      sellerProfile: { select: { id: true, displayName: true } },
      currentVersion: { select: { priceSnapshotCents: true } },
    },
  });
  const availability = await summarizeMarketplaceAvailability(
    getPrismaClient(),
    rows.map((r) => r.id),
  );
  const availById = new Map(availability.map((a) => [a.capabilityId, a]));
  return rows.map((row) => {
    const avail = availById.get(row.id);
    return {
      id: row.id,
      slug: row.slug,
      name: row.name,
      description: row.description,
      category: row.marketplaceCategory,
      priceTierCents: row.priceTierCents ?? row.currentVersion?.priceSnapshotCents ?? null,
      currency: row.currency,
      rating: row.rating,
      jobCount: row.jobCount,
      estimatedDuration: row.estimatedDuration,
      sellerDisplayName: row.sellerProfile.displayName,
      sellerProfileId: row.sellerProfile.id,
      availabilityStatus: avail?.status,
      accepting: avail?.accepting,
      nextAvailableAt: avail?.nextAvailableAt ?? null,
    };
  });
}
