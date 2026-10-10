import type { DependencyGraph, PublicPermissionManifest } from "@kivro/contracts";

export type EffectivePermissionRow = {
  key: string;
  label: string;
  state: "ACTIVE" | "NOT_USED" | "BLOCKED";
  machineCategory: string;
  sensitivity: "LOW" | "MEDIUM" | "HIGH";
};

/** SELLERUX-006 — human-readable summary aligned with machine manifest. */
export function buildEffectivePermissionSummary(input: {
  permissionManifest: PublicPermissionManifest;
  dependencyGraph?: DependencyGraph | null;
}): { rows: EffectivePermissionRow[]; disclaimer: string } {
  const rows: EffectivePermissionRow[] = input.permissionManifest.categories.map((cat) => ({
    key: cat.key,
    label: cat.buyerLabel,
    state: cat.state === "NOT_USED" ? "NOT_USED" : "ACTIVE", // ACTIVE = any non-NOT_USED machine state
    machineCategory: cat.key,
    sensitivity:
      cat.key === "AI_INFERENCE" || cat.key === "PUBLIC_INTERNET" || cat.key === "BROWSER"
        ? "HIGH"
        : "MEDIUM",
  }));

  if (input.dependencyGraph) {
    for (const node of input.dependencyGraph.nodes) {
      if (node.sensitivity === "BLOCKED") {
        rows.push({
          key: node.id,
          label: node.name,
          state: "BLOCKED",
          machineCategory: node.type,
          sensitivity: "HIGH",
        });
      }
    }
  }

  return {
    rows,
    disclaimer: "This summary is derived from your permission manifest and dependency graph — not from AI inference.",
  };
}
