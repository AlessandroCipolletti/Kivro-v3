import { getPrismaClient } from "@kivro/database";
import { evaluateCapabilityAvailability } from "@kivro/job-scheduling";
import {
  buildJobScheduleQuote,
  buyerPurchaseAction,
  buyerPurchaseActionLabel,
  marketplaceCardCopy,
} from "@kivro/marketplace";
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
    const timeZone = c.req.query("timeZone") ?? "UTC";
    const purchaseAction = buyerPurchaseAction({
      accepting: availability.accepting,
      availabilityStatus: availability.buyerAvailability,
      nextAvailableAt: availability.nextAvailableAt ?? null,
    });
    const version = visible.currentVersion;
    return c.json({
      capabilityId: capability.id,
      accepting: availability.accepting,
      status: availability.buyerAvailability,
      scheduleStatus: availability.buyerAvailability,
      reasons: availability.reasons,
      nextAvailableAt: availability.nextAvailableAt ?? null,
      purchaseAction,
      purchaseLabel: buyerPurchaseActionLabel(purchaseAction),
      cardLabel: marketplaceCardCopy({
        status: availability.buyerAvailability,
        nextAvailableAt: availability.nextAvailableAt ?? null,
        timeZone,
      }),
      scheduleQuote: version
        ? buildJobScheduleQuote({
            capabilityId: capability.id,
            capabilityVersionId: version.id,
            amountMinor: version.priceSnapshotCents,
            accepting: availability.accepting,
            nextEligibleAt: availability.nextAvailableAt ?? null,
            estimatedDurationSeconds: visible.estimatedDuration,
            timeZone,
          })
        : null,
      buyerMessage,
      maintenanceExpectedReturnAt: maintenance.active ? maintenance.expectedReturnAt : null,
    });
  });

  return app;
}
