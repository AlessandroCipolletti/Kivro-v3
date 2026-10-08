import { createHash } from "node:crypto";
import type { PublicPermissionManifest } from "@kivro/contracts";

export function hashPermissionManifest(manifest: PublicPermissionManifest): string {
  const canonical = JSON.stringify(manifest);
  return `sha256:${createHash("sha256").update(canonical).digest("hex")}`;
}
