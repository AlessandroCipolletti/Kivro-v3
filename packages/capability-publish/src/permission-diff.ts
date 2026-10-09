import type { WorkerManifest } from "@kivro/contracts";
import { normalizeNetworkAllowList } from "@kivro/policy-engine";

export interface PermissionDiffLine {
  kind: "tool" | "network" | "resource";
  value: string;
  change: "added" | "removed" | "unchanged";
}

/** §77 — seller-visible permission diff before publish/update. */
export function diffWorkerManifestPermissions(
  previous: WorkerManifest | null,
  next: WorkerManifest,
): PermissionDiffLine[] {
  if (!previous) {
    return linesFromManifest(next).map((value) => ({
      kind: value.kind,
      value: value.label,
      change: "added" as const,
    }));
  }
  const prev = linesFromManifest(previous);
  const nxt = linesFromManifest(next);
  const prevSet = new Set(prev.map((l) => `${l.kind}:${l.label}`));
  const nextSet = new Set(nxt.map((l) => `${l.kind}:${l.label}`));
  const out: PermissionDiffLine[] = [];
  for (const line of nxt) {
    const key = `${line.kind}:${line.label}`;
    out.push({
      kind: line.kind,
      value: line.label,
      change: prevSet.has(key) ? "unchanged" : "added",
    });
  }
  for (const line of prev) {
    const key = `${line.kind}:${line.label}`;
    if (!nextSet.has(key)) {
      out.push({ kind: line.kind, value: line.label, change: "removed" });
    }
  }
  return out;
}

export function hasPermissionExpansion(diff: PermissionDiffLine[]): boolean {
  return diff.some((line) => line.change === "added");
}

function linesFromManifest(manifest: WorkerManifest): Array<{ kind: PermissionDiffLine["kind"]; label: string }> {
  const tools = manifest.tools.allow.map((t) => ({ kind: "tool" as const, label: t }));
  const network = normalizeNetworkAllowList(manifest.network.allow).map((n) => ({
    kind: "network" as const,
    label: n.purpose ? `${n.host} (${n.purpose})` : n.host,
  }));
  const resources = manifest.resources.map((r) => ({
    kind: "resource" as const,
    label: `${r.id}:${r.permissions.join(",")}`,
  }));
  return [...tools, ...network, ...resources];
}
