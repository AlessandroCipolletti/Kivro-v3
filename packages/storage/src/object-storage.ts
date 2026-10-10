import {
  DeleteObjectCommand,
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
  if (config.useNativeAws) {
    return new S3Client({
      region: config.region,
      ...(config.accessKey && config.secretKey
        ? {
            credentials: {
              accessKeyId: config.accessKey,
              secretAccessKey: config.secretKey,
            },
          }
        : {}),
    });
  }
  return new S3Client({
    region: config.region,
    endpoint: config.endpoint,
    forcePathStyle: config.forcePathStyle,
    credentials: {
      accessKeyId: config.accessKey!,
      secretAccessKey: config.secretKey!,
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

export async function createPresignedDownload(input: {
  bucket: string;
  objectKey: string;
  filename?: string;
  expiresInSeconds?: number;
}): Promise<{ downloadUrl: string; expiresInSeconds: number }> {
  const { client } = requireObjectStorage();
  const expiresInSeconds = input.expiresInSeconds ?? 900;
  const command = new GetObjectCommand({
    Bucket: input.bucket,
    Key: input.objectKey,
    ResponseContentDisposition: input.filename
      ? `attachment; filename="${input.filename.replace(/"/g, "")}"`
      : undefined,
  });
  const downloadUrl = await getSignedUrl(client, command, { expiresIn: expiresInSeconds });
  return { downloadUrl, expiresInSeconds };
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
export async function putObjectBytes(input: {
  bucket: string;
  objectKey: string;
  body: Uint8Array;
  contentHash: string;
  mimeType?: string;
  metadata?: Record<string, string>;
}): Promise<void> {
  const { client } = requireObjectStorage();
  await client.send(
    new PutObjectCommand({
      Bucket: input.bucket,
      Key: input.objectKey,
      Body: input.body,
      ContentType: input.mimeType,
      Metadata: {
        "content-hash": input.contentHash,
        ...(input.metadata ?? {}),
      },
    }),
  );
}

export async function objectExists(input: { bucket: string; objectKey: string }): Promise<boolean> {
  const { client } = requireObjectStorage();
  try {
    await client.send(new HeadObjectCommand({ Bucket: input.bucket, Key: input.objectKey }));
    return true;
  } catch {
    return false;
  }
}

export async function deleteObject(input: { bucket: string; objectKey: string }): Promise<void> {
  const { client } = requireObjectStorage();
  await client.send(new DeleteObjectCommand({ Bucket: input.bucket, Key: input.objectKey }));
}

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
