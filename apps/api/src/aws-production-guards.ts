/** M21 — fail closed for AWS production secrets and dev shortcuts. */
export function assertAwsProductionEnvironment(): void {
  if (process.env.NODE_ENV !== "production") {
    return;
  }
  if (process.env.KIVRO_CLOUD_PROFILE?.trim().toLowerCase() !== "aws") {
    return;
  }
  const required = ["DATABASE_URL", "KIVRO_CRON_SECRET", "WEB_APP_URL", "KIVRO_CLOUD_URL"] as const;
  for (const key of required) {
    if (!process.env[key]?.trim()) {
      throw new Error(`AWS_PRODUCTION_ENV_MISSING:${key}`);
    }
  }
  if (process.env.KIVRO_CRON_SECRET === "dev-cron-not-for-production") {
    throw new Error("AWS_PRODUCTION_ENV_UNSAFE:KIVRO_CRON_SECRET");
  }
  const bucket = process.env.S3_BUCKET?.trim() ?? process.env.AWS_S3_BUCKET?.trim();
  if (!bucket) {
    throw new Error("AWS_PRODUCTION_ENV_MISSING:S3_BUCKET");
  }
}
