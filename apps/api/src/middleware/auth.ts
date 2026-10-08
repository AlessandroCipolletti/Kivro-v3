import { resolveSessionUser } from "@kivro/auth";
import { getPrismaClient } from "@kivro/database";
import type { Context, Next } from "hono";
import type { AppEnv } from "../types.js";
import { getCookie } from "hono/cookie";
import { sessionCookieName } from "../env.js";

export async function requireAuth(
  c: Context<AppEnv>,
  next: Next,
): Promise<Response | void> {
  const token = getCookie(c, sessionCookieName());
  const user = await resolveSessionUser(getPrismaClient(), token);
  if (!user || user.status !== "ACTIVE") {
    return c.json({ error: "UNAUTHENTICATED" }, 401);
  }
  c.set("user", user);
  await next();
}

export async function requireVerifiedEmail(
  c: Context<AppEnv>,
  next: Next,
): Promise<Response | void> {
  const user = c.get("user");
  if (!user?.emailVerifiedAt) {
    return c.json({ error: "EMAIL_VERIFICATION_REQUIRED" }, 403);
  }
  await next();
}
