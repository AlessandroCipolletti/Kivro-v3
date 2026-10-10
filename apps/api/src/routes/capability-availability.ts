import { getPrismaClient } from "@kivro/database";
import { evaluateCapabilityAvailability } from "@kivro/job-scheduling";
import { buildBuyerMaintenanceCopy, buildMaintenanceState } from "@kivro/seller-experience";
import { Hono } from "hono";

export function capabilityAvailabilityRoutes(): Hono {
  const app = new Hono();

  app.get("/capabilities/:slug/availability", async (c) => {
    const slug = c.req.param("slug");
    const capability = await getPrismaClient().capability.findFirst({
      where: { slug, status: "PUBLISHED", currentVersionId: { not: null } },
      select: {
        id: true,
        sellerProfile: {
          select: {
            maintenanceMode: true,
            maintenanceMessage: true,
            maintenanceExpectedReturnAt: true,
          },
        },
      },
    });
    if (!capability) {
      return c.json({ error: "NOT_FOUND" }, 404);
    }
    const availability = await evaluateCapabilityAvailability(getPrismaClient(), capability.id);
    if ("error" in availability) {
      return c.json(availability, 404);
    }
    const maintenance = buildMaintenanceState({
      maintenanceMode: capability.sellerProfile.maintenanceMode,
      maintenanceMessage: capability.sellerProfile.maintenanceMessage,
      maintenanceExpectedReturnAt: capability.sellerProfile.maintenanceExpectedReturnAt,
    });
    const buyerMessage = availability.reasons.includes("SELLER_MAINTENANCE")
      ? buildBuyerMaintenanceCopy(maintenance)
      : null;
    return c.json({
      capabilityId: capability.id,
      accepting: availability.accepting,
      status: availability.buyerAvailability,
      scheduleStatus: availability.buyerAvailability,
      reasons: availability.reasons,
      nextAvailableAt: availability.nextAvailableAt ?? null,
      buyerMessage,
      maintenanceExpectedReturnAt: maintenance.active ? maintenance.expectedReturnAt : null,
    });
  });

  return app;
}
