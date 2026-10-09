/** HOST-NET-025 — fail closed for Netsons production secrets and dev shortcuts. */
export function assertNetsonsProductionEnvironment(): void {
  if (process.env.NODE_ENV !== "production") {
    return;
  }
  if (process.env.KIVRO_CLOUD_PROFILE?.trim().toLowerCase() !== "netsons") {
    return;
  }
  const required = ["DATABASE_URL", "KIVRO_CRON_SECRET", "WEB_APP_URL", "KIVRO_CLOUD_URL"] as const;
  for (const key of required) {
    if (!process.env[key]?.trim()) {
      throw new Error(`NETSONS_PRODUCTION_ENV_MISSING:${key}`);
    }
  }
  if (process.env.KIVRO_CRON_SECRET === "dev-cron-not-for-production") {
    throw new Error("NETSONS_PRODUCTION_ENV_UNSAFE:KIVRO_CRON_SECRET");
  }
}
