import {
  buildGoogleAuthorizationUrl,
  createSession,
  generateSecureToken,
  getGoogleConfig,
  loginOrLinkGoogleUser,
  loginWithEmail,
  registerWithEmail,
  resendEmailVerification,
  revokeSession,
  verifyEmailToken,
} from "@kivro/auth";
import { getPrismaClient } from "@kivro/database";
import { Hono } from "hono";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import { isDevAuthShortcutsEnabled, sessionCookieName } from "../env.js";
import { requireAuth } from "../middleware/auth.js";
import {
  deliverAccountConfirmedEmail,
  deliverVerificationEmail,
  isTransactionalEmailConfigured,
} from "../services/transactional-mail.js";
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

function webAppUrl(): string {
  return process.env.WEB_APP_URL?.trim() || "http://localhost:3000";
}

function exposeDevVerificationToken(): boolean {
  return isDevAuthShortcutsEnabled() && !isTransactionalEmailConfigured();
}

export function authRoutes(): Hono<AppEnv> {
  const app = new Hono<AppEnv>();

  app.post("/register", async (c) => {
    const body = await c.req.json<{ email?: string; password?: string }>();
    if (!body.email || !body.password) {
      return c.json({ error: "INVALID_INPUT" }, 400);
    }
    const result = await registerWithEmail(getPrismaClient(), {
      email: body.email,
      password: body.password,
    });
    if (!result.ok) {
      if (result.code === "EMAIL_TAKEN") {
        return c.json({ error: "INVALID_CREDENTIALS" }, 400);
      }
      return c.json({ error: result.code }, 400);
    }
    await deliverVerificationEmail({
      email: result.user.email,
      verificationToken: result.verificationToken,
      correlationId: c.req.header("x-correlation-id"),
    });
    return c.json({
      userId: result.user.id,
      emailVerified: false,
      verificationToken: exposeDevVerificationToken() ? result.verificationToken : undefined,
      message: "Check your email to verify your account before using paid or seller features.",
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
    const result = await verifyEmailToken(getPrismaClient(), body.token);
    if (!result.ok) {
      return c.json({ error: result.code }, 400);
    }
    if (!result.alreadyVerified) {
      await deliverAccountConfirmedEmail({
        email: result.user.email,
        correlationId: c.req.header("x-correlation-id"),
      });
    }
    return c.json({ ok: true, emailVerified: true, alreadyVerified: result.alreadyVerified });
  });

  app.get("/verify-email", async (c) => {
    const token = c.req.query("token");
    if (!token) {
      return c.redirect(`${webAppUrl()}/verify-email?error=missing_token`);
    }
    const result = await verifyEmailToken(getPrismaClient(), token);
    if (!result.ok) {
      return c.redirect(`${webAppUrl()}/verify-email?error=invalid_token`);
    }
    if (!result.alreadyVerified) {
      await deliverAccountConfirmedEmail({
        email: result.user.email,
        correlationId: c.req.header("x-correlation-id"),
      });
    }
    return c.redirect(`${webAppUrl()}/verify-email?verified=1`);
  });

  app.post("/resend-verification", async (c) => {
    const body = await c.req.json<{ email?: string }>();
    if (!body.email) {
      return c.json({ error: "INVALID_INPUT" }, 400);
    }
    const result = await resendEmailVerification(getPrismaClient(), body.email);
    if (result.status === "RATE_LIMITED") {
      return c.json({ error: "RATE_LIMITED" }, 429);
    }
    if (result.status === "SENT") {
      await deliverVerificationEmail({
        email: result.email,
        verificationToken: result.verificationToken,
        correlationId: c.req.header("x-correlation-id"),
      });
    }
    return c.json({
      ok: true,
      message: "If an unverified account exists for that email, we sent a new verification link.",
    });
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
