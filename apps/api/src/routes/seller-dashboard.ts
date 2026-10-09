import { ensureSellerProfile } from "@kivro/capability-publish";
import { getPrismaClient } from "@kivro/database";
import { buildSellerHealthDashboard } from "../services/seller-health-dashboard.js";
import { Hono } from "hono";
import { requireAuth, requireVerifiedEmail } from "../middleware/auth.js";
import {
  activateSellerEmergencyPause,
  resumeSellerEmergencyPause,
} from "../services/seller-emergency-pause.js";
import type { AppEnv } from "../types.js";

export function sellerDashboardRoutes(): Hono<AppEnv> {
  const app = new Hono<AppEnv>();
  app.use("*", requireAuth, requireVerifiedEmail);

  app.get("/dashboard/health", async (c) => {
    const user = c.get("user");
    const profile = await ensureSellerProfile(getPrismaClient(), user.id, user.email);
    const result = await buildSellerHealthDashboard(getPrismaClient(), profile.id);
    if ("error" in result) {
      return c.json({ error: result.error }, 404);
    }
    return c.json(result.dashboard);
  });

  app.post("/emergency-pause", async (c) => {
    const user = c.get("user");
    const profile = await ensureSellerProfile(getPrismaClient(), user.id, user.email);
    const result = await activateSellerEmergencyPause(getPrismaClient(), {
      sellerProfileId: profile.id,
      actorUserId: user.id,
      source: "WEB",
    });
    if ("error" in result) {
      return c.json({ error: result.error }, 404);
    }
    return c.json({ ok: true, pausedCapabilityIds: result.pausedCapabilityIds });
  });

  app.post("/emergency-pause/resume", async (c) => {
    const user = c.get("user");
    const profile = await ensureSellerProfile(getPrismaClient(), user.id, user.email);
    const result = await resumeSellerEmergencyPause(getPrismaClient(), {
      sellerProfileId: profile.id,
      actorUserId: user.id,
    });
    if ("error" in result) {
      return c.json({ error: result.error }, 404);
    }
    return c.json({ ok: true, resumedCapabilityIds: result.resumedCapabilityIds });
  });

  return app;
}
