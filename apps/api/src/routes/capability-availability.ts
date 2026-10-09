import { getPrismaClient } from "@kivro/database";
import { evaluateCapabilityAvailability } from "@kivro/job-scheduling";
import { Hono } from "hono";

export function capabilityAvailabilityRoutes(): Hono {
  const app = new Hono();

  app.get("/capabilities/:slug/availability", async (c) => {
    const slug = c.req.param("slug");
    const capability = await getPrismaClient().capability.findFirst({
      where: { slug, status: "PUBLISHED", currentVersionId: { not: null } },
      select: { id: true },
    });
    if (!capability) {
      return c.json({ error: "NOT_FOUND" }, 404);
    }
    const availability = await evaluateCapabilityAvailability(getPrismaClient(), capability.id);
    if ("error" in availability) {
      return c.json(availability, 404);
    }
    return c.json({
      capabilityId: capability.id,
      accepting: availability.accepting,
      status: availability.buyerAvailability,
      scheduleStatus: availability.buyerAvailability,
      reasons: availability.reasons,
      nextAvailableAt: availability.nextAvailableAt ?? null,
    });
  });

  return app;
}
