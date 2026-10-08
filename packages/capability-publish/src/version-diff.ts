import type { CapabilityVersion } from "@kivro/database";

export interface VersionDiffSummary {
  fromVersion: string;
  toVersion: string;
  priceChanged: boolean;
  manifestHashChanged: boolean;
  skillCountDelta: number;
}

/** §311 — high-level diff for seller review (no UI). */
export function summarizeVersionDiff(
  from: CapabilityVersion,
  to: CapabilityVersion,
): VersionDiffSummary {
  const fromSkills = extractSkillCount(from);
  const toSkills = extractSkillCount(to);
  return {
    fromVersion: from.versionLabel,
    toVersion: to.versionLabel,
    priceChanged: from.priceSnapshotCents !== to.priceSnapshotCents,
    manifestHashChanged: from.workerManifestHash !== to.workerManifestHash,
    skillCountDelta: toSkills - fromSkills,
  };
}

function extractSkillCount(version: CapabilityVersion): number {
  const summary = version.permissionSummary as { selectedSkills?: string[] } | null;
  return summary?.selectedSkills?.length ?? 0;
}
