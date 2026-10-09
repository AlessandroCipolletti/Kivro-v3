import {
  filterCapabilityListings,
  sortCapabilityListings,
  type CapabilityListingRow,
  type MarketplaceSort,
} from "@kivro/marketplace";
import { getPrismaClient } from "@kivro/database";
import { summarizeMarketplaceAvailability } from "@kivro/job-scheduling";
import { Hono } from "hono";

function parseSort(raw: string | undefined): MarketplaceSort {
  const allowed: MarketplaceSort[] = [
    "relevance",
    "rating",
    "most_used",
    "price_asc",
    "price_desc",
    "fastest",
  ];
  return allowed.includes(raw as MarketplaceSort) ? (raw as MarketplaceSort) : "relevance";
}

export function marketplaceRoutes(): Hono {
  const app = new Hono();

  app.get("/marketplace/capabilities", async (c) => {
    const q = c.req.query("q");
    const category = c.req.query("category");
    const sort = parseSort(c.req.query("sort"));
    const onlineOnly = c.req.query("onlineOnly") === "true";
    const minRating = c.req.query("minRating");
    const minPriceCents = c.req.query("minPriceCents");
    const maxPriceCents = c.req.query("maxPriceCents");

    const rows = await getPrismaClient().capability.findMany({
      where: { status: "PUBLISHED", currentVersionId: { not: null } },
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

    const listings: CapabilityListingRow[] = rows.map((row) => {
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

    const filtered = filterCapabilityListings(listings, {
      q,
      category,
      onlineOnly,
      minRating: minRating ? Number(minRating) : undefined,
      minPriceCents: minPriceCents ? Number(minPriceCents) : undefined,
      maxPriceCents: maxPriceCents ? Number(maxPriceCents) : undefined,
      sort,
    });
    const sorted = sortCapabilityListings(filtered, sort, q);

    const categories = [...new Set(listings.map((r) => r.category))].sort();

    return c.json({
      capabilities: sorted,
      meta: { total: sorted.length, categories },
    });
  });

  app.get("/marketplace/categories", async (c) => {
    const rows = await getPrismaClient().capability.findMany({
      where: { status: "PUBLISHED" },
      select: { marketplaceCategory: true },
      distinct: ["marketplaceCategory"],
    });
    return c.json({
      categories: rows.map((r) => r.marketplaceCategory).sort(),
    });
  });

  return app;
}
