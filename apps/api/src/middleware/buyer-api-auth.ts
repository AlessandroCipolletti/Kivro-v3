import { checkBuyerApiRateLimit, scopesAllow, verifyBuyerApiKeyFromAuthHeader } from "@kivro/buyer-api";
import type { BuyerApiScope } from "@kivro/buyer-api";
import { getPrismaClient } from "@kivro/database";
import type { Context, Next } from "hono";
import type { AppEnv } from "../types.js";

export function requireBuyerApiKey(requiredScope: BuyerApiScope) {
  return async (c: Context<AppEnv>, next: Next): Promise<Response | void> => {
    const auth = await verifyBuyerApiKeyFromAuthHeader(
      getPrismaClient(),
      c.req.header("Authorization"),
    );
    if (!auth) {
      return c.json({ error: "INVALID_API_KEY" }, 401);
    }
    if (!scopesAllow(auth.scopes, requiredScope)) {
      return c.json({ error: "INSUFFICIENT_SCOPE" }, 403);
    }
    const rate = await checkBuyerApiRateLimit(getPrismaClient(), { apiKeyId: auth.id });
    if (!rate.allowed) {
      c.header("Retry-After", String(rate.retryAfterSeconds));
      return c.json({ error: "RATE_LIMITED" }, 429);
    }
    const user = await getPrismaClient().user.findUnique({ where: { id: auth.userId } });
    if (!user) {
      return c.json({ error: "INVALID_API_KEY" }, 401);
    }
    c.set("user", user);
    c.set("buyerApiKey", auth);
    await next();
  };
}
