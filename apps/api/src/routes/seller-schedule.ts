import { ensureSellerProfile } from "@kivro/capability-publish";
import { getPrismaClient } from "@kivro/database";
import {
  parseScheduleConfig,
  updateCapabilitySchedule,
  setCapabilityManuallyPaused,
  clearCapabilityManualPause,
  type ScheduleMode,
  type WeeklyWindow,
} from "@kivro/job-scheduling";
import { Hono } from "hono";
import { requireAuth, requireVerifiedEmail } from "../middleware/auth.js";
import type { AppEnv } from "../types.js";

export function sellerScheduleRoutes(): Hono<AppEnv> {
  const app = new Hono<AppEnv>();
  app.use("*", requireAuth, requireVerifiedEmail);

  app.get("/capabilities/:capabilityId/schedule", async (c) => {
    const user = c.get("user");
    const profile = await ensureSellerProfile(getPrismaClient(), user.id, user.email);
    const capability = await getPrismaClient().capability.findFirst({
      where: { id: c.req.param("capabilityId"), sellerProfileId: profile.id },
    });
    if (!capability) {
      return c.json({ error: "NOT_FOUND" }, 404);
    }
    return c.json({ schedule: parseScheduleConfig(capability) });
  });

  app.put("/capabilities/:capabilityId/schedule", async (c) => {
    const user = c.get("user");
    const profile = await ensureSellerProfile(getPrismaClient(), user.id, user.email);
    let body: {
      mode?: ScheduleMode;
      timezone?: string;
      windows?: WeeklyWindow[];
    };
    try {
      body = await c.req.json();
    } catch {
      return c.json({ error: "INVALID_JSON" }, 400);
    }
    if (!body.mode || !body.timezone) {
      return c.json({ error: "MODE_AND_TIMEZONE_REQUIRED" }, 400);
    }
    const result = await updateCapabilitySchedule(getPrismaClient(), {
      capabilityId: c.req.param("capabilityId"),
      sellerProfileId: profile.id,
      mode: body.mode,
      timezone: body.timezone,
      windows: body.windows ?? [],
      actorUserId: user.id,
    });
    if ("error" in result) {
      const status = result.error === "NOT_FOUND" ? 404 : 400;
      return c.json(result, status);
    }
    return c.json({ ok: true });
  });

  app.post("/capabilities/:capabilityId/schedule/pause", async (c) => {
    const user = c.get("user");
    const profile = await ensureSellerProfile(getPrismaClient(), user.id, user.email);
    const result = await setCapabilityManuallyPaused(getPrismaClient(), {
      capabilityId: c.req.param("capabilityId"),
      sellerProfileId: profile.id,
      actorUserId: user.id,
    });
    if ("error" in result) {
      return c.json(result, result.error === "NOT_FOUND" ? 404 : 409);
    }
    return c.json({ ok: true });
  });

  app.post("/capabilities/:capabilityId/schedule/resume", async (c) => {
    const user = c.get("user");
    const profile = await ensureSellerProfile(getPrismaClient(), user.id, user.email);
    const result = await clearCapabilityManualPause(getPrismaClient(), {
      capabilityId: c.req.param("capabilityId"),
      sellerProfileId: profile.id,
      actorUserId: user.id,
    });
    if ("error" in result) {
      return c.json(result, result.error === "NOT_FOUND" ? 404 : 409);
    }
    return c.json({ ok: true });
  });

  return app;
}
