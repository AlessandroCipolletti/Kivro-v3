import { afterEach, describe, expect, it } from "vitest";
import { resolveGoogleOAuthRedirectUri, resolvePublicApiBaseUrl } from "./api-base-url.js";

const envKeys = [
  "API_URL",
  "NEXT_PUBLIC_API_URL",
  "NEXT_PUBLIC_KIVRO_API_URL",
  "KIVRO_CLOUD_URL",
  "WEBHOOK_BASE_URL",
  "GOOGLE_OAUTH_REDIRECT_URI",
  "PORT",
] as const;

function clearEnv() {
  for (const k of envKeys) {
    delete process.env[k];
  }
}

afterEach(() => {
  clearEnv();
});

describe("resolvePublicApiBaseUrl", () => {
  it("prefers API_URL", () => {
    process.env.API_URL = "http://localhost:3006/";
    expect(resolvePublicApiBaseUrl()).toBe("http://localhost:3006");
  });

  it("falls back to PORT", () => {
    process.env.PORT = "3006";
    expect(resolvePublicApiBaseUrl()).toBe("http://localhost:3006");
  });
});

describe("resolveGoogleOAuthRedirectUri", () => {
  it("uses explicit GOOGLE_OAUTH_REDIRECT_URI", () => {
    process.env.GOOGLE_OAUTH_REDIRECT_URI =
      "http://localhost:3006/api/users/auth/google/callback";
    expect(resolveGoogleOAuthRedirectUri()).toBe(
      "http://localhost:3006/api/users/auth/google/callback",
    );
  });

  it("builds from API_URL", () => {
    process.env.API_URL = "http://localhost:3006";
    expect(resolveGoogleOAuthRedirectUri()).toBe(
      "http://localhost:3006/api/users/auth/google/callback",
    );
  });
});
