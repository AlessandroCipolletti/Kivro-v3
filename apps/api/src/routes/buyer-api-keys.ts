import { createBuyerApiKey, revokeBuyerApiKey } from "@kivro/buyer-api";
import { getPrismaClient } from "@kivro/database";
import { Hono } from "hono";
import { requireAuth, requireVerifiedEmail } from "../middleware/auth.js";
import type { AppEnv } from "../types.js";

/** §319–§321 — session-authenticated API key management. */
export function buyerApiKeyRoutes(): Hono<AppEnv> {
  const app = new Hono<AppEnv>();
  app.use("*", requireAuth, requireVerifiedEmail);

  app.get("/api-keys", async (c) => {
    const user = c.get("user");
    const keys = await getPrismaClient().buyerApiKey.findMany({
      where: { userId: user.id, revokedAt: null },
      orderBy: { createdAt: "desc" },
    });
    return c.json({
      keys: keys.map((k) => ({
        id: k.id,
        name: k.name,
        prefix: k.prefix,
        scopes: k.scopes,
        createdAt: k.createdAt.toISOString(),
        lastUsedAt: k.lastUsedAt?.toISOString() ?? null,
        expiresAt: k.expiresAt?.toISOString() ?? null,
      })),
    });
  });

  app.post("/api-keys", async (c) => {
    const user = c.get("user");
    const body = await c.req.json<{ name?: string }>();
    if (!body.name?.trim()) {
      return c.json({ error: "NAME_REQUIRED" }, 400);
    }
    const created = await createBuyerApiKey(getPrismaClient(), {
      userId: user.id,
      name: body.name,
    });
    return c.json(
      {
        ...created,
        warning: "Store the secret now; it will not be shown again.",
      },
      201,
    );
  });

  app.post("/api-keys/:id/revoke", async (c) => {
    const user = c.get("user");
    const result = await revokeBuyerApiKey(getPrismaClient(), {
      userId: user.id,
      keyId: c.req.param("id"),
    });
    if ("error" in result) {
      return c.json(result, 404);
    }
    return c.json({ ok: true });
  });

  return app;
}
