import { getPrismaClient } from "@kivro/database";
import { summarizeMarketplaceAvailability } from "@kivro/job-scheduling";
import { formatPrice, formatAvailabilityLabel } from "@kivro/marketplace";
import { Hono } from "hono";
import { requireAuth, requireVerifiedEmail } from "../middleware/auth.js";
import type { AppEnv } from "../types.js";

export function buyerFavoritesRoutes(): Hono<AppEnv> {
  const app = new Hono<AppEnv>();
  app.use("*", requireAuth, requireVerifiedEmail);

  app.get("/favorites", async (c) => {
    const user = c.get("user");
    const favorites = await getPrismaClient().favorite.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      include: {
        capability: {
          include: { sellerProfile: { select: { displayName: true } } },
        },
      },
    });
    const availability = await summarizeMarketplaceAvailability(
      getPrismaClient(),
      favorites.map((f) => f.capabilityId),
    );
    const byId = new Map(availability.map((a) => [a.capabilityId, a]));
    return c.json({
      favorites: favorites.map((f) => {
        const cap = f.capability;
        const avail = byId.get(cap.id);
        const cents = cap.priceTierCents;
        return {
          id: f.id,
          capabilityId: cap.id,
          slug: cap.slug,
          name: cap.name,
          sellerDisplayName: cap.sellerProfile.displayName,
          priceLabel: formatPrice(cents, cap.currency),
          availability: formatAvailabilityLabel(avail?.status),
          accepting: avail?.accepting ?? false,
          nextAvailableAt: avail?.nextAvailableAt ?? null,
          favoritedAt: f.createdAt.toISOString(),
        };
      }),
    });
  });

  app.post("/favorites", async (c) => {
    const user = c.get("user");
    const body = await c.req.json<{ capabilityId?: string }>();
    if (!body.capabilityId) {
      return c.json({ error: "CAPABILITY_ID_REQUIRED" }, 400);
    }
    const capability = await getPrismaClient().capability.findFirst({
      where: { id: body.capabilityId, status: "PUBLISHED" },
    });
    if (!capability) {
      return c.json({ error: "NOT_FOUND" }, 404);
    }
    const favorite = await getPrismaClient().favorite.upsert({
      where: {
        userId_capabilityId: { userId: user.id, capabilityId: capability.id },
      },
      create: { userId: user.id, capabilityId: capability.id },
      update: {},
    });
    return c.json({ favoriteId: favorite.id }, 201);
  });

  app.delete("/favorites/:capabilityId", async (c) => {
    const user = c.get("user");
    await getPrismaClient().favorite.deleteMany({
      where: { userId: user.id, capabilityId: c.req.param("capabilityId") },
    });
    return c.json({ ok: true });
  });

  return app;
}
