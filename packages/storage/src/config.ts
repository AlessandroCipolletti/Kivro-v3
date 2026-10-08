export interface ObjectStorageConfig {
  endpoint: string;
  bucket: string;
  accessKey: string;
  secretKey: string;
  region: string;
  forcePathStyle: boolean;
}

function envValue(key: string): string | undefined {
  const v = process.env[key];
  return v?.trim() ? v.trim() : undefined;
}

export function getObjectStorageConfig(): ObjectStorageConfig | null {
  const endpoint = envValue("S3_ENDPOINT");
  const bucket = envValue("S3_BUCKET");
  const accessKey = envValue("S3_ACCESS_KEY");
  const secretKey = envValue("S3_SECRET_KEY");
  if (!endpoint || !bucket || !accessKey || !secretKey) {
    return null;
  }
  return {
    endpoint,
    bucket,
    accessKey,
    secretKey,
    region: process.env.S3_REGION ?? "us-east-1",
    forcePathStyle: process.env.S3_FORCE_PATH_STYLE !== "false",
  };
}
