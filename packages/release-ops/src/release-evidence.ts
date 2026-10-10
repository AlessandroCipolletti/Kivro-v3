import type { UnifiedReleaseManifest } from "@kivro/compatibility";

export function expectedExactReleaseId(gitCommit: string): string {
  return `kivro@${gitCommit.slice(0, 12)}`;
}

export function manifestEvidencePaths(manifest: UnifiedReleaseManifest): string[] {
  return [
    manifest.parityReportPath,
    manifest.conformanceManifestPath,
    manifest.performanceEnvelopePath,
    manifest.operationalAlarmsPath,
  ].filter((p): p is string => Boolean(p));
}

/** Validates path list when caller supplies existence check (scripts/tests). */
export function findMissingEvidencePaths(
  paths: string[],
  exists: (relativePath: string) => boolean,
): string[] {
  return paths.filter((p) => !exists(p));
}
