import {
  BUYER_API_SCOPES,
  createBuyerApiKey,
  listBuyerApiKeyAudit,
  parseScopes,
  revokeBuyerApiKey,
  type BuyerApiScope,
} from "@kivro/buyer-api";
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
    const body = await c.req.json<{ name?: string; scopes?: string[]; expiresAt?: string }>();
    if (!body.name?.trim()) {
      return c.json({ error: "NAME_REQUIRED" }, 400);
    }
    let scopes: BuyerApiScope[] | undefined;
    if (body.scopes) {
      scopes = parseScopes(body.scopes);
    }
    let expiresAt: Date | undefined;
    if (body.expiresAt) {
      expiresAt = new Date(body.expiresAt);
      if (Number.isNaN(expiresAt.getTime())) {
        return c.json({ error: "INVALID_EXPIRES_AT" }, 400);
      }
    }
    let created;
    try {
      created = await createBuyerApiKey(getPrismaClient(), {
        userId: user.id,
        name: body.name,
        scopes,
        expiresAt,
      });
    } catch (err) {
      if (err instanceof Error && err.message === "INVALID_SCOPES") {
        return c.json({ error: "INVALID_SCOPES", allowed: [...BUYER_API_SCOPES] }, 400);
      }
      throw err;
    }
    return c.json(
      {
        ...created,
        warning: "Store the secret now; it will not be shown again.",
      },
      201,
    );
  });

  app.get("/api-keys/:id/audit", async (c) => {
    const user = c.get("user");
    const result = await listBuyerApiKeyAudit(getPrismaClient(), {
      userId: user.id,
      keyId: c.req.param("id"),
    });
    if ("error" in result) {
      return c.json(result, 404);
    }
    return c.json(result);
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
