import { createBuyerWebhookEndpoint, listBuyerWebhookEndpoints, parseWebhookEvents } from "@kivro/buyer-webhooks";
import { getPrismaClient } from "@kivro/database";
import { Hono } from "hono";
import { requireAuth, requireVerifiedEmail } from "../middleware/auth.js";
import type { AppEnv } from "../types.js";

/** §327–§329 — buyer webhook endpoint management (session auth). */
export function buyerWebhookManageRoutes(): Hono<AppEnv> {
  const app = new Hono<AppEnv>();
  app.use("*", requireAuth, requireVerifiedEmail);

  app.get("/webhooks", async (c) => {
    const user = c.get("user");
    const endpoints = await listBuyerWebhookEndpoints(getPrismaClient(), user.id);
    return c.json({ endpoints });
  });

  app.post("/webhooks", async (c) => {
    const user = c.get("user");
    const body = await c.req.json<{ url?: string; events?: string[] }>();
    if (!body.url?.trim()) {
      return c.json({ error: "URL_REQUIRED" }, 400);
    }
    const events = parseWebhookEvents(body.events);
    const created = await createBuyerWebhookEndpoint(getPrismaClient(), {
      userId: user.id,
      url: body.url.trim(),
      events,
    });
    if ("error" in created) {
      return c.json({ error: created.error }, 400);
    }
    return c.json(
      {
        endpoint: {
          id: created.id,
          url: created.url,
          events: created.events,
        },
        secret: created.secret,
        warning: "Store the webhook secret now; it will not be shown again.",
      },
      201,
    );
  });

  app.post("/webhooks/:id/disable", async (c) => {
    const user = c.get("user");
    const row = await getPrismaClient().buyerWebhookEndpoint.findFirst({
      where: { id: c.req.param("id"), userId: user.id },
    });
    if (!row) {
      return c.json({ error: "NOT_FOUND" }, 404);
    }
    await getPrismaClient().buyerWebhookEndpoint.update({
      where: { id: row.id },
      data: { enabled: false },
    });
    return c.json({ ok: true });
  });

  return app;
}
