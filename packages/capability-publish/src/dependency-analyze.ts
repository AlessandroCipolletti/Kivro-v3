import type { DependencyGraph } from "@kivro/contracts";
import type { DiscoverySnapshot, ImportConsent } from "./import-consent.js";

const BLOCKED_PATTERNS = [/personal browser/i, /chrome profile/i, /personal session/i];

export function buildDependencyGraph(
  discovery: DiscoverySnapshot,
  consent: ImportConsent,
  rootName: string,
): DependencyGraph {
  const nodes: DependencyGraph["nodes"] = [];

  for (const skill of discovery.skills) {
    const selected = consent.selectedSkills.includes(skill);
    nodes.push({
      id: `skill:${skill}`,
      type: "SKILL",
      name: skill,
      requirement: "REQUIRED",
      sensitivity: "MEDIUM",
      discoveredFrom: ["openclaw.scan"],
      dependsOn: [],
      marketplaceSupport: "SUPPORTED",
      selected,
      health: selected ? "UNKNOWN" : "UNKNOWN",
      confidence: "CONFIRMED",
    });
  }

  for (const tool of discovery.tools) {
    const selected = consent.selectedTools.includes(tool);
    const blocked = BLOCKED_PATTERNS.some((p) => p.test(tool));
    nodes.push({
      id: `tool:${tool}`,
      type: "TOOL",
      name: tool,
      requirement: "OPTIONAL",
      sensitivity: blocked ? "BLOCKED" : "MEDIUM",
      discoveredFrom: ["openclaw.scan"],
      dependsOn: [],
      marketplaceSupport: blocked ? "UNSUPPORTED" : "SUPPORTED",
      selected: blocked ? false : selected,
      health: "UNKNOWN",
      confidence: "LIKELY",
    });
  }

  for (const cat of consent.permissionManifest.categories) {
    if (cat.state === "NOT_USED") continue;
    nodes.push({
      id: `permission:${cat.key}`,
      type: cat.key === "AI_INFERENCE" ? "INFERENCE" : "NETWORK_DESTINATION",
      name: cat.buyerLabel,
      requirement: "REQUIRED",
      sensitivity: "HIGH",
      discoveredFrom: ["seller.consent"],
      dependsOn: [],
      marketplaceSupport: "SUPPORTED",
      selected: true,
      health: "UNKNOWN",
      confidence: "CONFIRMED",
    });
  }

  return {
    graphVersion: 1,
    rootCapabilityName: rootName,
    nodes,
  };
}

export function findPublishBlockers(graph: DependencyGraph): string[] {
  const blockers: string[] = [];
  for (const node of graph.nodes) {
    if (node.sensitivity === "BLOCKED") {
      blockers.push(`BLOCKED_DEPENDENCY:${node.name}`);
    }
    if (node.marketplaceSupport === "UNSUPPORTED" && node.selected) {
      blockers.push(`UNSUPPORTED_SELECTED:${node.name}`);
    }
  }
  const requiredSkills = graph.nodes.filter((n) => n.type === "SKILL" && n.requirement === "REQUIRED");
  for (const skill of requiredSkills) {
    if (!skill.selected) {
      blockers.push(`REQUIRED_SKILL_NOT_SELECTED:${skill.name}`);
    }
  }
  return blockers;
}
