import { zipSync } from "fflate";
import { readObjectBytes } from "@kivro/storage";

export type ResultBundleEntry = {
  zipPath: string;
  bucket: string;
  objectKey: string;
};

const MAX_FILE_BYTES = 50 * 1024 * 1024;
const MAX_TOTAL_BYTES = 200 * 1024 * 1024;

/** BUYERUX-021/022 — in-memory zip; individual downloads remain on failure. */
export async function buildResultZipBuffer(
  entries: ResultBundleEntry[],
): Promise<{ ok: true; buffer: Uint8Array } | { ok: false; error: string }> {
  if (entries.length === 0) {
    return { ok: false, error: "NO_ENTRIES" };
  }
  const files: Record<string, Uint8Array> = {};
  let total = 0;
  for (const entry of entries) {
    if (entry.zipPath.includes("..") || entry.zipPath.startsWith("/")) {
      return { ok: false, error: "UNSAFE_PATH" };
    }
    let bytes: Uint8Array;
    try {
      bytes = await readObjectBytes({
        bucket: entry.bucket,
        objectKey: entry.objectKey,
        maxBytes: MAX_FILE_BYTES,
      });
    } catch (err) {
      if (err instanceof Error && err.message === "OBJECT_STORAGE_NOT_CONFIGURED") {
        return { ok: false, error: "OBJECT_STORAGE_NOT_CONFIGURED" };
      }
      return { ok: false, error: "READ_FAILED" };
    }
    total += bytes.length;
    if (total > MAX_TOTAL_BYTES) {
      return { ok: false, error: "BUNDLE_TOO_LARGE" };
    }
    files[entry.zipPath] = bytes;
  }
  try {
    const buffer = zipSync(files);
    return { ok: true, buffer };
  } catch {
    return { ok: false, error: "ZIP_FAILED" };
  }
}
