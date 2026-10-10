import type { DiscoverySnapshot, ImportConsent } from "@kivro/capability-publish";

/** SELLERUX-002 — rejected discovery candidates must not enter effective publish payload. */
export function filterConsentAlignedDiscovery(
  discovery: DiscoverySnapshot,
  consent: ImportConsent,
): { skills: string[]; tools: string[] } {
  return {
    skills: discovery.skills.filter((s) => consent.selectedSkills.includes(s)),
    tools: discovery.tools.filter((t) => consent.selectedTools.includes(t)),
  };
}

export function assertNoUnconsentedDiscoveryExposure(input: {
  discovery: DiscoverySnapshot;
  consent: ImportConsent;
  effectiveSkills: string[];
  effectiveTools: string[];
}): { ok: true } | { ok: false; code: string } {
  for (const skill of input.effectiveSkills) {
    if (!input.consent.selectedSkills.includes(skill)) {
      return { ok: false, code: "UNCONSENTED_SKILL_EXPOSED" };
    }
  }
  for (const tool of input.effectiveTools) {
    if (!input.consent.selectedTools.includes(tool)) {
      return { ok: false, code: "UNCONSENTED_TOOL_EXPOSED" };
    }
  }
  const aligned = filterConsentAlignedDiscovery(input.discovery, input.consent);
  if (aligned.skills.length !== input.effectiveSkills.length) {
    return { ok: false, code: "DISCOVERY_LEAK" };
  }
  return { ok: true };
}
