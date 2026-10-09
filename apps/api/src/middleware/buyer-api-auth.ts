import { checkBuyerApiRateLimit, scopesAllow, verifyBuyerApiKeyFromAuthHeader } from "@kivro/buyer-api";
import type { BuyerApiScope } from "@kivro/buyer-api";
import { getPrismaClient } from "@kivro/database";
import type { Context, Next } from "hono";
import type { AppEnv } from "../types.js";

function applyRateLimitHeaders(
  c: Context<AppEnv>,
  input: { limit: number; remaining: number; resetAt: Date },
): void {
  c.header("X-RateLimit-Limit", String(input.limit));
  c.header("X-RateLimit-Remaining", String(input.remaining));
  c.header("X-RateLimit-Reset", String(Math.floor(input.resetAt.getTime() / 1000)));
}

export function requireBuyerApiKey(requiredScope: BuyerApiScope) {
  return async (c: Context<AppEnv>, next: Next): Promise<Response | void> => {
    const auth = await verifyBuyerApiKeyFromAuthHeader(
      getPrismaClient(),
      c.req.header("Authorization"),
    );
    if (!auth) {
      return c.json({ error: "INVALID_API_KEY", message: "Bearer API key is invalid or revoked." }, 401);
    }
    if (!scopesAllow(auth.scopes, requiredScope)) {
      return c.json({ error: "INSUFFICIENT_SCOPE", message: `Scope ${requiredScope} required.` }, 403);
    }
    const rate = await checkBuyerApiRateLimit(getPrismaClient(), { apiKeyId: auth.id });
    applyRateLimitHeaders(c, {
      limit: rate.limit,
      remaining: rate.remaining,
      resetAt: rate.resetAt,
    });
    if (!rate.allowed) {
      c.header("Retry-After", String(rate.retryAfterSeconds));
      return c.json(
        {
          error: "RATE_LIMITED",
          message: "Too many requests for this API key.",
          retryAfterSeconds: rate.retryAfterSeconds,
        },
        429,
      );
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
