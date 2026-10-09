/** Public API origin for OAuth redirects (aligned with common monorepo env names). */
export function resolvePublicApiBaseUrl(): string {
  const candidates = [
    process.env.API_URL,
    process.env.NEXT_PUBLIC_API_URL,
    process.env.NEXT_PUBLIC_KIVRO_API_URL,
    process.env.KIVRO_CLOUD_URL,
    process.env.WEBHOOK_BASE_URL,
  ];
  for (const raw of candidates) {
    const trimmed = raw?.trim();
    if (trimmed) {
      return trimmed.replace(/\/$/, "");
    }
  }
  const port = process.env.PORT?.trim() || "3001";
  return `http://localhost:${port}`;
}

export function resolveGoogleOAuthRedirectUri(): string {
  const explicit = process.env.GOOGLE_OAUTH_REDIRECT_URI?.trim();
  if (explicit) {
    return explicit;
  }
  return `${resolvePublicApiBaseUrl()}/api/users/auth/google/callback`;
}
