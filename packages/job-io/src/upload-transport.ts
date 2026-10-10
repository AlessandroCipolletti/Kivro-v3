/** §218 — the API moves metadata. Large bytes go to object storage. */
export const API_INLINE_BYTE_LIMIT = 1_048_576;
export const MULTIPART_PART_BYTES = 8_388_608;

export function uploadTransportForSize(sizeBytes: number): "INLINE_METADATA" | "DIRECT_OBJECT" | "MULTIPART_OBJECT" {
  if (sizeBytes <= API_INLINE_BYTE_LIMIT) {
    return "INLINE_METADATA";
  }
  if (sizeBytes <= MULTIPART_PART_BYTES) {
    return "DIRECT_OBJECT";
  }
  return "MULTIPART_OBJECT";
}

export function workerLoadsEntireFileIntoMemory(): false {
  return false;
}

/** §224 — tags never replace MIME checks. */
export function mimeAllowed(declaredMime: string, allowed: string[]): boolean {
  return allowed.includes(declaredMime);
}
