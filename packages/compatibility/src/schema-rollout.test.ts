import { describe, expect, it } from "vitest";
import { assertRolloutSafeDuringControlPlaneOverlap, parseSchemaRolloutRegistry } from "./schema-rollout.js";

const registry = parseSchemaRolloutRegistry({
  description: "test",
  activeRolloutPhase: "contract",
  migrations: [
    { folder: "20260410140000_m22_execution_control_plane", phase: "expand" },
    { folder: "20260327010000_m02_auth", phase: "contract" },
  ],
});

describe("schema rollout (HARD-009)", () => {
  it("allows expand-only pending migrations during overlap", () => {
    const ok = assertRolloutSafeDuringControlPlaneOverlap({
      registry,
      pendingMigrationFolders: ["20260410140000_m22_execution_control_plane"],
    });
    expect(ok.ok).toBe(true);
  });

  it("rejects contract-phase pending during overlap", () => {
    const bad = assertRolloutSafeDuringControlPlaneOverlap({
      registry,
      pendingMigrationFolders: ["20260327010000_m02_auth"],
    });
    expect(bad.ok).toBe(false);
  });
});
