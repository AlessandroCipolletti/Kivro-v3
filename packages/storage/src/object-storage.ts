import {
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "node:crypto";
import type { ObjectStorageConfig } from "./config.js";
import { getObjectStorageConfig } from "./config.js";

export function createObjectStorageClient(config: ObjectStorageConfig): S3Client {
  return new S3Client({
    region: config.region,
    endpoint: config.endpoint,
    forcePathStyle: config.forcePathStyle,
    credentials: {
      accessKeyId: config.accessKey,
      secretAccessKey: config.secretKey,
    },
  });
}

export function requireObjectStorage(): { client: S3Client; config: ObjectStorageConfig } {
  const config = getObjectStorageConfig();
  if (!config) {
    throw new Error("OBJECT_STORAGE_NOT_CONFIGURED");
  }
  return { client: createObjectStorageClient(config), config };
}

export async function createPresignedUpload(input: {
  namespace: "sellers" | "buyers";
  ownerId: string;
  purpose: string;
  contentHash: string;
  mimeType?: string;
  maxBytes: number;
}): Promise<{ bucket: string; objectKey: string; uploadUrl: string; expiresInSeconds: number }> {
  const { client, config } = requireObjectStorage();
  const objectKey = `${input.namespace}/${input.ownerId}/${input.purpose}/${randomUUID()}`;
  const command = new PutObjectCommand({
    Bucket: config.bucket,
    Key: objectKey,
    ContentType: input.mimeType,
    Metadata: {
      "content-hash": input.contentHash,
      purpose: input.purpose,
    },
  });
  const expiresInSeconds = 900;
  const uploadUrl = await getSignedUrl(client, command, { expiresIn: expiresInSeconds });
  return { bucket: config.bucket, objectKey, uploadUrl, expiresInSeconds };
}

export async function verifyUploadedObject(input: {
  bucket: string;
  objectKey: string;
  expectedHash: string;
  maxBytes: number;
}): Promise<{ sizeBytes: bigint; contentHash: string }> {
  const { client } = requireObjectStorage();
  const head = await client.send(
    new HeadObjectCommand({ Bucket: input.bucket, Key: input.objectKey }),
  );
  const sizeBytes = BigInt(head.ContentLength ?? 0);
  if (sizeBytes <= 0n || sizeBytes > BigInt(input.maxBytes)) {
    throw new Error("UPLOAD_SIZE_INVALID");
  }
  const metaHash = head.Metadata?.["content-hash"];
  if (metaHash !== input.expectedHash) {
    throw new Error("UPLOAD_HASH_MISMATCH");
  }
  return { sizeBytes, contentHash: input.expectedHash };
}

/** §216 — read leading bytes for content sniffing (bounded). */
export async function readObjectPrefix(input: {
  bucket: string;
  objectKey: string;
  maxBytes?: number;
}): Promise<Uint8Array> {
  const { client } = requireObjectStorage();
  const maxBytes = input.maxBytes ?? 512;
  const res = await client.send(
    new GetObjectCommand({
      Bucket: input.bucket,
      Key: input.objectKey,
      Range: `bytes=0-${maxBytes - 1}`,
    }),
  );
  const body = res.Body;
  if (!body) {
    return new Uint8Array();
  }
  const bytes = await body.transformToByteArray();
  return bytes.slice(0, maxBytes);
}
