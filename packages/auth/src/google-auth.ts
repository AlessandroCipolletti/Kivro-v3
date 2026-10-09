import type { PrismaClient, User } from "@kivro/database";
import * as client from "openid-client";
import { normalizeEmail } from "./crypto.js";
import { resolveGoogleOAuthRedirectUri } from "./api-base-url.js";

export interface GoogleAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

let cachedConfig: GoogleAuthConfig | undefined;

export function getGoogleConfig(): GoogleAuthConfig | null {
  if (cachedConfig) {
    return cachedConfig;
  }
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
  const redirectUri = resolveGoogleOAuthRedirectUri();
  if (!clientId || !clientSecret) {
    return null;
  }
  cachedConfig = { clientId, clientSecret, redirectUri };
  return cachedConfig;
}

export async function buildGoogleAuthorizationUrl(state: string): Promise<string> {
  const cfg = getGoogleConfig();
  if (!cfg) {
    throw new Error("Google OAuth is not configured");
  }
  const google = await client.discovery(
    new URL("https://accounts.google.com"),
    cfg.clientId,
    cfg.clientSecret,
  );
  return client.buildAuthorizationUrl(google, {
    redirect_uri: cfg.redirectUri,
    scope: "openid email profile",
    state,
  }).href;
}

export async function loginOrLinkGoogleUser(
  db: PrismaClient,
  callbackUrl: URL,
  expectedState: string,
): Promise<User> {
  const cfg = getGoogleConfig();
  if (!cfg) {
    throw new Error("Google OAuth is not configured");
  }
  const google = await client.discovery(
    new URL("https://accounts.google.com"),
    cfg.clientId,
    cfg.clientSecret,
  );
  const tokens = await client.authorizationCodeGrant(google, callbackUrl, {
    expectedState,
  });
  const claims = tokens.claims();
  if (!claims?.sub) {
    throw new Error("Missing Google subject");
  }
  const emailRaw = typeof claims.email === "string" ? claims.email : undefined;
  const emailVerified =
    claims.email_verified === true || claims.email_verified === "true";
  if (!emailRaw || !emailVerified) {
    throw new Error("Google email not verified");
  }
  const email = normalizeEmail(emailRaw);

  const linked = await db.oAuthAccount.findUnique({
    where: {
      provider_providerAccountId: { provider: "google", providerAccountId: claims.sub },
    },
    include: { user: true },
  });
  if (linked) {
    return linked.user;
  }

  const byEmail = await db.user.findUnique({ where: { email } });
  if (byEmail) {
    if (!byEmail.emailVerifiedAt) {
      await db.user.update({
        where: { id: byEmail.id },
        data: { emailVerifiedAt: new Date() },
      });
    }
    await db.oAuthAccount.create({
      data: {
        userId: byEmail.id,
        provider: "google",
        providerAccountId: claims.sub,
        email,
      },
    });
    return byEmail;
  }

  return db.user.create({
    data: {
      email,
      emailVerifiedAt: new Date(),
      oauthAccounts: {
        create: {
          provider: "google",
          providerAccountId: claims.sub,
          email,
        },
      },
    },
  });
}
