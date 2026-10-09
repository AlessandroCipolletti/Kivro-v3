import {
  buildGoogleAuthorizationUrl,
  createSession,
  generateSecureToken,
  getGoogleConfig,
  loginOrLinkGoogleUser,
  loginWithEmail,
  registerWithEmail,
  revokeSession,
  verifyEmailToken,
} from "@kivro/auth";
import { getPrismaClient } from "@kivro/database";
import { Hono } from "hono";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import { isDevAuthShortcutsEnabled, sessionCookieName } from "../env.js";
import { requireAuth } from "../middleware/auth.js";
import type { AppEnv } from "../types.js";

function setSessionCookie(c: Parameters<typeof setCookie>[0], token: string, expiresAt: Date): void {
  setCookie(c, sessionCookieName(), token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Lax",
    path: "/",
    expires: expiresAt,
  });
}

export function authRoutes(): Hono<AppEnv> {
  const app = new Hono<AppEnv>();

  app.post("/register", async (c) => {
    const body = await c.req.json<{ email?: string; password?: string }>();
    if (!body.email || !body.password) {
      return c.json({ error: "INVALID_INPUT" }, 400);
    }
    const result = await registerWithEmail(
      getPrismaClient(),
      { email: body.email, password: body.password },
      { exposeDevVerificationToken: isDevAuthShortcutsEnabled() },
    );
    if (!result.ok) {
      if (result.code === "EMAIL_TAKEN") {
        return c.json({ error: "INVALID_CREDENTIALS" }, 400);
      }
      return c.json({ error: result.code }, 400);
    }
    return c.json({
      userId: result.user.id,
      emailVerified: false,
      verificationToken: result.verificationToken,
      message: "Check your email to verify your account.",
    });
  });

  app.post("/login", async (c) => {
    const body = await c.req.json<{ email?: string; password?: string }>();
    if (!body.email || !body.password) {
      return c.json({ error: "INVALID_INPUT" }, 400);
    }
    const result = await loginWithEmail(getPrismaClient(), {
      email: body.email,
      password: body.password,
    });
    if (!result.ok) {
      return c.json({ error: "INVALID_CREDENTIALS" }, 401);
    }
    const session = await createSession(getPrismaClient(), result.user.id);
    setSessionCookie(c, session.token, session.expiresAt);
    return c.json({
      userId: result.user.id,
      emailVerified: result.user.emailVerifiedAt !== null,
    });
  });

  app.post("/logout", async (c) => {
    const token = getCookie(c, sessionCookieName());
    if (token) {
      await revokeSession(getPrismaClient(), token);
    }
    deleteCookie(c, sessionCookieName(), { path: "/" });
    return c.json({ ok: true });
  });

  app.get("/me", requireAuth, (c) => {
    const user = c.get("user");
    return c.json({
      id: user.id,
      email: user.email,
      emailVerified: user.emailVerifiedAt !== null,
      marketplaceTermsAcceptedAt: user.marketplaceTermsAcceptedAt,
    });
  });

  app.post("/verify-email", async (c) => {
    const body = await c.req.json<{ token?: string }>();
    if (!body.token) {
      return c.json({ error: "INVALID_INPUT" }, 400);
    }
    const ok = await verifyEmailToken(getPrismaClient(), body.token);
    if (!ok) {
      return c.json({ error: "INVALID_OR_EXPIRED_TOKEN" }, 400);
    }
    return c.json({ ok: true });
  });

  return app;
}

/** Google OAuth — path aligned with shared Google Cloud redirect URI (e.g. /api/users/auth/google/callback). */
export function googleOAuthRoutes(): Hono<AppEnv> {
  const app = new Hono<AppEnv>();

  app.get("/google", async (c) => {
    if (!getGoogleConfig()) {
      return c.json({ error: "GOOGLE_OAUTH_NOT_CONFIGURED" }, 503);
    }
    const state = generateSecureToken(16);
    setCookie(c, "oauth_state", state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Lax",
      path: "/",
      maxAge: 600,
    });
    const url = await buildGoogleAuthorizationUrl(state);
    if (process.env.NODE_ENV === "development") {
      const cfg = getGoogleConfig();
      console.info("[google-oauth] redirect_uri sent to Google:", cfg?.redirectUri);
    }
    return c.redirect(url);
  });

  app.get("/google/callback", async (c) => {
    const expectedState = getCookie(c, "oauth_state");
    const state = c.req.query("state");
    if (!expectedState || !state || expectedState !== state) {
      return c.json({ error: "OAUTH_STATE_MISMATCH" }, 400);
    }
    deleteCookie(c, "oauth_state", { path: "/" });
    try {
      const user = await loginOrLinkGoogleUser(
        getPrismaClient(),
        new URL(c.req.url),
        expectedState,
      );
      const session = await createSession(getPrismaClient(), user.id);
      setSessionCookie(c, session.token, session.expiresAt);
      return c.redirect(process.env.WEB_APP_URL ?? "http://localhost:3000");
    } catch {
      return c.json({ error: "GOOGLE_AUTH_FAILED" }, 400);
    }
  });

  return app;
}
