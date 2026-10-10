import type { SchemaRolloutPhase, SchemaRolloutRegistry } from "./types.js";

const PHASE_ORDER: SchemaRolloutPhase[] = ["expand", "deploy", "contract"];

export function parseSchemaRolloutRegistry(raw: unknown): SchemaRolloutRegistry {
  if (!raw || typeof raw !== "object") {
    throw new Error("Invalid schema rollout registry");
  }
  const r = raw as SchemaRolloutRegistry;
  if (!Array.isArray(r.migrations) || r.migrations.length < 1) {
    throw new Error("Schema rollout registry requires migrations");
  }
  return r;
}

export function phaseIndex(phase: SchemaRolloutPhase): number {
  return PHASE_ORDER.indexOf(phase);
}

/** During overlapping compatible control planes, only expand-phase DDL may be pending. */
export function assertRolloutSafeDuringControlPlaneOverlap(input: {
  registry: SchemaRolloutRegistry;
  pendingMigrationFolders: string[];
}): { ok: true } | { ok: false; reason: string } {
  if (input.pendingMigrationFolders.length === 0) {
    return { ok: true };
  }
  const byFolder = new Map(input.registry.migrations.map((m) => [m.folder, m]));
  for (const folder of input.pendingMigrationFolders) {
    const entry = byFolder.get(folder);
    if (!entry) {
      return { ok: false, reason: `Unknown migration folder ${folder} (not in rollout registry)` };
    }
    if (entry.phase !== "expand") {
      return {
        ok: false,
        reason: `Migration ${folder} phase ${entry.phase} cannot run during control-plane overlap`,
      };
    }
  }
  return { ok: true };
}

export function validateRolloutRegistryCoversDisk(input: {
  registry: SchemaRolloutRegistry;
  migrationFolderNames: string[];
}): { ok: true } | { ok: false; missing: string[] } {
  const registered = new Set(input.registry.migrations.map((m) => m.folder));
  const missing = input.migrationFolderNames.filter((f) => !registered.has(f));
  if (missing.length > 0) {
    return { ok: false, missing };
  }
  return { ok: true };
}

export function nextRolloutPhase(current: SchemaRolloutPhase): SchemaRolloutPhase | null {
  const idx = phaseIndex(current);
  return idx < PHASE_ORDER.length - 1 ? PHASE_ORDER[idx + 1]! : null;
}
