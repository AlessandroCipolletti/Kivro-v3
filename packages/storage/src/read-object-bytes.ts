import { GetObjectCommand } from "@aws-sdk/client-s3";
import { requireObjectStorage } from "./object-storage.js";

/** Read full object body with hard byte cap (bundle generation). */
export async function readObjectBytes(input: {
  bucket: string;
  objectKey: string;
  maxBytes: number;
}): Promise<Uint8Array> {
  const { client } = requireObjectStorage();
  const res = await client.send(
    new GetObjectCommand({
      Bucket: input.bucket,
      Key: input.objectKey,
    }),
  );
  const body = res.Body;
  if (!body) {
    return new Uint8Array();
  }
  const bytes = await body.transformToByteArray();
  if (bytes.length > input.maxBytes) {
    throw new Error("OBJECT_TOO_LARGE");
  }
  return bytes;
}
