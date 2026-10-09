import { getPrismaClient } from "@kivro/database";
import { runAssistedDiscovery, type CapabilityListingRow } from "@kivro/marketplace";
import { summarizeMarketplaceAvailability } from "@kivro/job-scheduling";
import { Hono } from "hono";
import { requireAuth, requireVerifiedEmail } from "../middleware/auth.js";
import type { AppEnv } from "../types.js";

/** §129–§135 — assisted discovery (Mode A: recommend only). */
export function marketplaceAgentRoutes(): Hono<AppEnv> {
  const app = new Hono<AppEnv>();
  app.use("*", requireAuth, requireVerifiedEmail);

  app.post("/marketplace/agent/discover", async (c) => {
    const body = await c.req.json<{
      goal?: string;
      constraints?: Record<string, unknown>;
      limit?: number;
    }>();
    if (!body.goal?.trim()) {
      return c.json({ error: "GOAL_REQUIRED" }, 400);
    }
    const listings = await loadListings();
    const result = runAssistedDiscovery(listings, {
      goal: body.goal,
      constraints: body.constraints as never,
      limit: body.limit,
    });
    return c.json({
      ...result,
      approvalMode: "RECOMMEND_ONLY",
      note: "Select a capability to run; each job requires explicit purchase.",
    });
  });

  return app;
}

async function loadListings(): Promise<CapabilityListingRow[]> {
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
