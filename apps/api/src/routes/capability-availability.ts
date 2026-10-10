import { getPrismaClient } from "@kivro/database";
import { evaluateCapabilityAvailability } from "@kivro/job-scheduling";
import { buildBuyerMaintenanceCopy, buildMaintenanceState } from "@kivro/seller-experience";
import { resolveSessionUser } from "@kivro/auth";
import { getCookie } from "hono/cookie";
import { Hono } from "hono";
import { sessionCookieName } from "../env.js";
import { findVisibleCapability } from "../services/capability-visibility.js";

export function capabilityAvailabilityRoutes(): Hono {
  const app = new Hono();

  app.get("/capabilities/:slug/availability", async (c) => {
    const slug = c.req.param("slug");
    const viewer = await resolveSessionUser(getPrismaClient(), getCookie(c, sessionCookieName()));
    const visible = await findVisibleCapability(
      getPrismaClient(),
      { slug },
      viewer?.status === "ACTIVE" ? viewer.id : null,
    );
    if (!visible) {
      return c.json({ error: "NOT_FOUND" }, 404);
    }
    const capability = {
      id: visible.id,
      sellerProfile: visible.sellerProfile,
    };
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
