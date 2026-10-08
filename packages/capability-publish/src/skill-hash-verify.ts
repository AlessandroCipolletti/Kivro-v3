import type { WorkerManifest } from "@kivro/contracts";
import { hashOpenClawSkill } from "@kivro/openclaw-adapter";

export function verifyWorkerManifestSkillHashes(
  manifest: WorkerManifest,
): { ok: true } | { ok: false; mismatches: Array<{ skill: string; expected: string; actual: string }> } {
  const mismatches: Array<{ skill: string; expected: string; actual: string }> = [];
  for (const skill of manifest.skills) {
    const actual = hashOpenClawSkill(skill.name);
    if (actual !== skill.contentHash) {
      mismatches.push({ skill: skill.name, expected: skill.contentHash, actual });
    }
  }
  if (mismatches.length > 0) {
    return { ok: false, mismatches };
  }
  return { ok: true };
}
