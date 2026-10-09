export interface ObjectStorageConfig {
  endpoint?: string;
  bucket: string;
  accessKey?: string;
  secretKey?: string;
  region: string;
  forcePathStyle: boolean;
  /** When true, use default AWS credential chain (ECS/Lambda IAM). */
  useNativeAws: boolean;
}

function readEnv(env: NodeJS.ProcessEnv, key: string): string | undefined {
  const v = env[key];
  return v?.trim() ? v.trim() : undefined;
}

/** MinIO/local: S3_ENDPOINT + keys. AWS profile: bucket + region (+ optional keys). */
export function getObjectStorageConfig(env: NodeJS.ProcessEnv = process.env): ObjectStorageConfig | null {
  const bucket = readEnv(env, "S3_BUCKET") ?? readEnv(env, "AWS_S3_BUCKET");
  if (!bucket) {
    return null;
  }
  const region = readEnv(env, "S3_REGION") ?? readEnv(env, "AWS_REGION") ?? "us-east-1";
  const endpoint = readEnv(env, "S3_ENDPOINT");
  const accessKey = readEnv(env, "S3_ACCESS_KEY");
  const secretKey = readEnv(env, "S3_SECRET_KEY");
  const profile = readEnv(env, "KIVRO_CLOUD_PROFILE")?.toLowerCase();
  const nativeAws =
    readEnv(env, "KIVRO_S3_NATIVE") === "true" ||
    (profile === "aws" && !endpoint) ||
    (!endpoint && !accessKey && !secretKey);

  if (nativeAws) {
    return {
      bucket,
      region,
      forcePathStyle: false,
      useNativeAws: true,
      ...(accessKey && secretKey ? { accessKey, secretKey } : {}),
    };
  }

  if (!endpoint || !accessKey || !secretKey) {
    return null;
  }
  return {
    endpoint,
    bucket,
    accessKey,
    secretKey,
    region,
    forcePathStyle: readEnv(env, "S3_FORCE_PATH_STYLE") !== "false",
    useNativeAws: false,
  };
}
