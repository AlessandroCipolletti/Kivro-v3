import { consumePairingCode, createWorkerPairingCode } from "@kivro/auth";
import { getPrismaClient } from "@kivro/database";
import { Hono } from "hono";
import { requireAuth, requireVerifiedEmail } from "../middleware/auth.js";
import type { AppEnv } from "../types.js";

export function workerDeviceRoutes(): Hono<AppEnv> {
  const app = new Hono<AppEnv>();

  app.post("/pairing-codes", requireAuth, requireVerifiedEmail, async (c) => {
    const user = c.get("user");
    const result = await createWorkerPairingCode(getPrismaClient(), user);
    if ("error" in result) {
      return c.json({ error: result.error }, 403);
    }
    return c.json({ code: result.code, expiresAt: result.expiresAt.toISOString() });
  });

  app.post("/pair", async (c) => {
    const body = await c.req.json<{
      code?: string;
      publicKey?: string;
      name?: string;
      platform?: string;
      workerVersion?: string;
      openClawVersion?: string;
    }>();
    if (!body.code || !body.publicKey || !body.name || !body.platform || !body.workerVersion) {
      return c.json({ error: "INVALID_INPUT" }, 400);
    }
    const device = await consumePairingCode(getPrismaClient(), {
      code: body.code,
      publicKey: body.publicKey,
      name: body.name,
      platform: body.platform,
      workerVersion: body.workerVersion,
      openClawVersion: body.openClawVersion,
    });
    if (!device) {
      return c.json({ error: "INVALID_OR_EXPIRED_CODE" }, 400);
    }
    return c.json({
      workerDeviceId: device.id,
      status: device.status,
    });
  });

  return app;
}
