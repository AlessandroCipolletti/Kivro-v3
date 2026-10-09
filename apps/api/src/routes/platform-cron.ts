import { getPrismaClient } from "@kivro/database";
import { runNetsonsCronTick } from "@kivro/cloud-netsons";
import { getActiveCloudComposition } from "../cloud-composition.js";
import { Hono } from "hono";

function assertCronSecret(header: string | undefined): void {
  const expected = process.env.KIVRO_CRON_SECRET?.trim();
  if (!expected) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("CRON_SECRET_NOT_CONFIGURED");
    }
    return;
  }
  if (!header || header !== expected) {
    throw new Error("CRON_UNAUTHORIZED");
  }
}

/** HOST-NET-015 — bounded Netsons cron entry (cPanel scheduled HTTP). */
export function platformCronRoutes(): Hono {
  const app = new Hono();

  app.post("/netsons-tick", async (c) => {
    try {
      assertCronSecret(c.req.header("x-kivro-cron-secret"));
    } catch (err) {
      const message = err instanceof Error ? err.message : "CRON_UNAUTHORIZED";
      const status =
        message === "CRON_UNAUTHORIZED" ? 401 : message === "CRON_SECRET_NOT_CONFIGURED" ? 503 : 401;
      return c.json({ error: message }, status);
    }
    const composition = getActiveCloudComposition();
    if (composition.profile !== "netsons") {
      return c.json({ error: "NETSONS_PROFILE_REQUIRED" }, 403);
    }
    let body: { durableWorkLimit?: number; webhookLimit?: number } = {};
    try {
      body = await c.req.json<{ durableWorkLimit?: number; webhookLimit?: number }>();
    } catch {
      body = {};
    }
    const result = await runNetsonsCronTick(getPrismaClient(), {
      durableWorkLimit: body.durableWorkLimit,
      webhookLimit: body.webhookLimit,
    });
    return c.json({ ok: true, ...result });
  });

  return app;
}
