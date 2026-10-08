export function isDevAuthShortcutsEnabled(): boolean {
  return (
    process.env.NODE_ENV === "development" &&
    process.env.KIVRO_DEV_AUTH_SHORTCUTS === "true"
  );
}

export function sessionCookieName(): string {
  return process.env.SESSION_COOKIE_NAME ?? "kivro_session";
}
