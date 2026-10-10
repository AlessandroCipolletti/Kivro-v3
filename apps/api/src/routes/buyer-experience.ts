import {
  buildBuyerDashboardSummary,
  computeSellerReliabilityForCapability,
  createBuyerExecutionQuote,
  getBuyerNotificationPreferences,
  runBuyerExecutionPreflight,
  updateBuyerNotificationPreferences,
} from "@kivro/buyer-experience";
import { getPrismaClient } from "@kivro/database";
import { Hono } from "hono";
import { requireAuth, requireVerifiedEmail } from "../middleware/auth.js";
import type { AppEnv } from "../types.js";

export function buyerExperienceRoutes(): Hono<AppEnv> {
  const app = new Hono<AppEnv>();
  app.use("*", requireAuth, requireVerifiedEmail);

  app.post("/preflight", async (c) => {
    const user = c.get("user");
    const body = await c.req.json<{
      capabilityId?: string;
      scheduledRunAt?: string;
      hardDeliveryDeadlineAt?: string;
    }>();
    if (!body.capabilityId) {
      return c.json({ error: "CAPABILITY_ID_REQUIRED" }, 400);
    }
    const capability = await getPrismaClient().capability.findUnique({
      where: { id: body.capabilityId },
    });
    const result = await runBuyerExecutionPreflight(getPrismaClient(), {
      capabilityId: body.capabilityId,
      immediate: !body.scheduledRunAt,
      hardDeliveryDeadlineAt: body.hardDeliveryDeadlineAt
        ? new Date(body.hardDeliveryDeadlineAt)
        : undefined,
      scheduledRunAt: body.scheduledRunAt ? new Date(body.scheduledRunAt) : undefined,
      estimatedDurationMinutes: capability?.estimatedDuration ?? null,
    });
    if (!result.ok) {
      return c.json(result, 404);
    }
    return c.json({ buyerId: user.id, ...result });
  });

  app.post("/quote", async (c) => {
    const user = c.get("user");
    const body = await c.req.json<{
      capabilityId?: string;
      inputs?: Record<string, unknown>;
      assets?: Record<string, unknown>;
      scheduledRunAt?: string;
      hardDeliveryDeadlineAt?: string;
    }>();
    if (!body.capabilityId) {
      return c.json({ error: "CAPABILITY_ID_REQUIRED" }, 400);
    }
    const quote = await createBuyerExecutionQuote(getPrismaClient(), {
      buyerId: user.id,
      capabilityId: body.capabilityId,
      structuredInput: body.inputs ?? {},
      assetManifest: body.assets,
      scheduledRunAt: body.scheduledRunAt ? new Date(body.scheduledRunAt) : undefined,
      hardDeliveryDeadlineAt: body.hardDeliveryDeadlineAt
        ? new Date(body.hardDeliveryDeadlineAt)
        : undefined,
    });
    if ("error" in quote) {
      return c.json(quote, 409);
    }
    return c.json(quote);
  });

  app.get("/dashboard", async (c) => {
    const user = c.get("user");
    const summary = await buildBuyerDashboardSummary(getPrismaClient(), user.id);
    return c.json({ summary });
  });

  app.get("/notification-preferences", async (c) => {
    const user = c.get("user");
    const prefs = await getBuyerNotificationPreferences(getPrismaClient(), user.id);
    return c.json({ preferences: prefs });
  });

  app.patch("/notification-preferences", async (c) => {
    const user = c.get("user");
    const body = await c.req.json<{
      emailTerminalJobComplete?: boolean;
      emailScheduledReminder?: boolean;
    }>();
    const prefs = await updateBuyerNotificationPreferences(getPrismaClient(), user.id, body);
    return c.json({ preferences: prefs });
  });

  app.get("/capabilities/:capabilityId/reliability", async (c) => {
    const snapshot = await computeSellerReliabilityForCapability(
      getPrismaClient(),
      c.req.param("capabilityId"),
    );
    return c.json({ reliability: snapshot });
  });

  return app;
}
