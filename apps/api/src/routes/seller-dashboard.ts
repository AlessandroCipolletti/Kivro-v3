import { ensureSellerProfile } from "@kivro/capability-publish";
import { getPrismaClient } from "@kivro/database";
import { buildSellerHealthDashboard } from "../services/seller-health-dashboard.js";
import { Hono } from "hono";
import { requireAuth, requireVerifiedEmail } from "../middleware/auth.js";
import {
  activateSellerEmergencyPause,
  resumeSellerEmergencyPause,
} from "../services/seller-emergency-pause.js";
import { assertSellerMarketplaceResumeAllowed } from "../services/seller-resume-readiness.js";
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

  app.get("/health-events", async (c) => {
    const user = c.get("user");
    const profile = await ensureSellerProfile(getPrismaClient(), user.id, user.email);
    const limit = Math.min(Number(c.req.query("limit") ?? 50), 100);
    const events = await getPrismaClient().workerHealthEvent.findMany({
      where: { workerDevice: { sellerProfileId: profile.id } },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
    return c.json({
      events: events.map((e) => ({
        id: e.id,
        eventType: e.eventType,
        severity: e.severity,
        summary: e.summary,
        payload: e.payload,
        workerDeviceId: e.workerDeviceId,
        createdAt: e.createdAt.toISOString(),
      })),
    });
  });

  app.post("/emergency-pause/resume", async (c) => {
    const user = c.get("user");
    const profile = await ensureSellerProfile(getPrismaClient(), user.id, user.email);
    const readiness = await assertSellerMarketplaceResumeAllowed(getPrismaClient(), profile.id);
    if ("error" in readiness) {
      if (readiness.error === "PLATFORM_SECURITY_PAUSE") {
        return c.json(
          {
            error: readiness.error,
            reason: readiness.reason,
            message: "Platform security pause cannot be cleared with resume until the issue is fixed.",
          },
          409,
        );
      }
      return c.json({ error: readiness.error, warnings: readiness.warnings }, 409);
    }
    const result = await resumeSellerEmergencyPause(getPrismaClient(), {
      sellerProfileId: profile.id,
      actorUserId: user.id,
    });
    if ("error" in result) {
      const status = result.error === "PLATFORM_SECURITY_PAUSE" ? 409 : 404;
      return c.json({ error: result.error }, status);
    }
    return c.json({ ok: true, resumedCapabilityIds: result.resumedCapabilityIds });
  });

  return app;
}
