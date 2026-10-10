import { describe, expect, it } from "vitest";
import {
  assertRolloutSafeDuringControlPlaneOverlap,
  parseSchemaRolloutRegistry,
  validateBackfillIdempotencyDeclarations,
} from "./schema-rollout.js";

const registry = parseSchemaRolloutRegistry({
  description: "test",
  activeRolloutPhase: "contract",
  migrations: [
    { folder: "20260410150000_m29_async_retention", phase: "expand" },
    { folder: "20260327010000_m02_auth", phase: "contract" },
  ],
});

describe("schema rollout (HARD-009)", () => {
  it("allows expand-only pending migrations during overlap", () => {
    const ok = assertRolloutSafeDuringControlPlaneOverlap({
      registry,
      pendingMigrationFolders: ["20260410150000_m29_async_retention"],
    });
    expect(ok.ok).toBe(true);
  });

  it("HARD-010 requires backfillIdempotent on deploy migrations", () => {
    const ok = validateBackfillIdempotencyDeclarations(registry);
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
