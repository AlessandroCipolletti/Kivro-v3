/** HOST-NET-003/025 — Netsons managed Node runtime env contract. */
export type NetsonsRuntimeConfig = {
  cloudProfile: "netsons";
  databaseUrl: string;
  cronSecret: string;
  redisUrl?: string;
  s3Endpoint?: string;
  webAppUrl: string;
  cloudUrl: string;
};

export function loadNetsonsRuntimeConfig(
  env: NodeJS.ProcessEnv = process.env,
): NetsonsRuntimeConfig {
  const databaseUrl = env.DATABASE_URL?.trim();
  const cronSecret = env.KIVRO_CRON_SECRET?.trim();
  const webAppUrl = env.WEB_APP_URL?.trim() ?? "http://localhost:3008";
  const cloudUrl = env.KIVRO_CLOUD_URL?.trim() ?? env.API_URL?.trim() ?? "http://localhost:3007";
  if (!databaseUrl) {
    throw new Error("NETSONS_CONFIG: DATABASE_URL required");
  }
  if (!cronSecret && env.NODE_ENV === "production") {
    throw new Error("NETSONS_CONFIG: KIVRO_CRON_SECRET required in production");
  }
  return {
    cloudProfile: "netsons",
    databaseUrl,
    cronSecret: cronSecret ?? "dev-cron-not-for-production",
    redisUrl: env.REDIS_URL?.trim(),
    s3Endpoint: env.S3_ENDPOINT?.trim(),
    webAppUrl,
    cloudUrl,
  };
}
