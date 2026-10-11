/** M21 — AWS deployment runtime env contract. */
export type AwsRuntimeConfig = {
  cloudProfile: "aws";
  databaseUrl: string;
  region: string;
  cronSecret: string;
  sqsDurableWorkQueueUrl?: string;
  s3Bucket?: string;
  redisUrl?: string;
  webAppUrl: string;
  cloudUrl: string;
};

export function loadAwsRuntimeConfig(env: NodeJS.ProcessEnv = process.env): AwsRuntimeConfig {
  const databaseUrl = env.DATABASE_URL?.trim();
  const cronSecret = env.KIVRO_CRON_SECRET?.trim();
  const webAppUrl = env.WEB_APP_URL?.trim() ?? "http://localhost:3008";
  const cloudUrl = env.KIVRO_CLOUD_URL?.trim() ?? env.API_URL?.trim() ?? "http://localhost:3007";
  if (!databaseUrl) {
    throw new Error("AWS_CONFIG: DATABASE_URL required");
  }
  if (!cronSecret && env.NODE_ENV === "production") {
    throw new Error("AWS_CONFIG: KIVRO_CRON_SECRET required in production");
  }
  return {
    cloudProfile: "aws",
    databaseUrl,
    region: env.AWS_REGION?.trim() ?? "us-east-1",
    cronSecret: cronSecret ?? "dev-cron-not-for-production",
    sqsDurableWorkQueueUrl: env.AWS_SQS_DURABLE_WORK_QUEUE_URL?.trim(),
    s3Bucket: env.S3_BUCKET?.trim() ?? env.AWS_S3_BUCKET?.trim(),
    redisUrl: env.REDIS_URL?.trim(),
    webAppUrl,
    cloudUrl,
  };
}
