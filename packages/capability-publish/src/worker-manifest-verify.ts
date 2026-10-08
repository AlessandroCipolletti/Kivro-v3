import { hashWorkerManifest, parseWorkerManifest, type WorkerManifest } from "@kivro/contracts";

const PLACEHOLDER_VERSION = "00000000-0000-0000-0000-000000000000";

export function verifyWorkerManifestPayload(payload: unknown): {
  manifest: WorkerManifest;
  hash: string;
} {
  const manifest = parseWorkerManifest(payload);
  return { manifest, hash: hashWorkerManifest(manifest) };
}

/** Bind immutable manifest to the published version and worker device (§54). */
export function finalizeWorkerManifest(
  template: WorkerManifest,
  ids: { capabilityVersionId: string; workerDeviceId: string },
): { manifest: WorkerManifest; hash: string } {
  const manifest: WorkerManifest = {
    ...template,
    capabilityVersionId: ids.capabilityVersionId,
    workerId: ids.workerDeviceId,
  };
  return { manifest, hash: hashWorkerManifest(manifest) };
}

export function isPlaceholderVersionId(id: string): boolean {
  return id === PLACEHOLDER_VERSION;
}
