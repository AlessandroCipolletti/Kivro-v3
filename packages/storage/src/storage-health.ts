import { HeadBucketCommand } from "@aws-sdk/client-s3";
import { getObjectStorageConfig } from "./config.js";
import { createObjectStorageClient } from "./object-storage.js";

/** `null` = storage not configured (readiness may still pass). */
export async function probeObjectStorageHealth(
  env: NodeJS.ProcessEnv = process.env,
): Promise<boolean | null> {
  const config = getObjectStorageConfig(env);
  if (!config) {
    return null;
  }
  if (config.useNativeAws) {
    try {
      const client = createObjectStorageClient(config);
      await client.send(new HeadBucketCommand({ Bucket: config.bucket }));
      return true;
    } catch {
      return false;
    }
  }
  if (config.endpoint) {
    try {
      const res = await fetch(`${config.endpoint.replace(/\/$/, "")}/minio/health/live`);
      return res.ok;
    } catch {
      return false;
    }
  }
  return null;
}
