import type { CapabilityVersion } from "@kivro/database";
import type { WorkerManifest } from "@kivro/contracts";
import {
  diffWorkerManifestPermissions,
  hasPermissionExpansion,
  summarizeVersionDiff,
} from "@kivro/capability-publish";

/** SELLERUX-022 — permission expansion check for draft manifests before publish. */
export function detectPermissionExpansion(
  liveManifest: WorkerManifest | null,
  draftManifest: WorkerManifest,
): boolean {
  return hasPermissionExpansion(diffWorkerManifestPermissions(liveManifest, draftManifest));
}

/** Draft worker manifest vs LIVE (no persisted draft version required). */
export function buildDraftManifestDiff(
  liveManifest: WorkerManifest | null,
  draftManifest: WorkerManifest,
): {
  permissionExpansion: boolean;
  permissionLines: ReturnType<typeof diffWorkerManifestPermissions>;
  prominentWarnings: string[];
} {
  const permissionLines = diffWorkerManifestPermissions(liveManifest, draftManifest);
  const permissionExpansion = hasPermissionExpansion(permissionLines);
  const prominentWarnings: string[] = [];
  if (permissionExpansion) {
    prominentWarnings.push("This draft expands permissions compared to the live version.");
  }
  return { permissionExpansion, permissionLines, prominentWarnings };
}

/** SELLERUX-022 — LIVE vs draft semantic diff including permission expansion. */
export function buildSemanticVersionDiff(
  live: CapabilityVersion | null,
  draft: CapabilityVersion,
): {
  summary: ReturnType<typeof summarizeVersionDiff>;
  permissionLines: ReturnType<typeof diffWorkerManifestPermissions>;
  permissionExpansion: boolean;
  prominentWarnings: string[];
} {
  const liveManifest = live ? (live.workerManifest as WorkerManifest | null) : null;
  const draftManifest = draft.workerManifest as WorkerManifest | null;
  const permissionLines =
    draftManifest != null
      ? diffWorkerManifestPermissions(liveManifest, draftManifest)
      : [];
  const permissionExpansion = hasPermissionExpansion(permissionLines);
  const summary = live
    ? summarizeVersionDiff(live, draft)
    : {
        fromVersion: "none",
        toVersion: draft.versionLabel,
        priceChanged: false,
        manifestHashChanged: true,
        skillCountDelta: 0,
      };
  const prominentWarnings: string[] = [];
  if (permissionExpansion) {
    prominentWarnings.push("This draft expands permissions compared to the live version.");
  }
  if (summary.priceChanged) {
    prominentWarnings.push("Price tier changed — new jobs will use the draft price after publish.");
  }
  return { summary, permissionLines, permissionExpansion, prominentWarnings };
}
