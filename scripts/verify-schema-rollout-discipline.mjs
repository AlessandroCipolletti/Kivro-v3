#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const compatibility = await import(path.join(root, "packages/compatibility/dist/index.js"));
const matrix = JSON.parse(
  fs.readFileSync(path.join(root, "packages/compatibility/matrix.json"), "utf8"),
);
const registry = compatibility.parseSchemaRolloutRegistry(
  JSON.parse(fs.readFileSync(path.join(root, matrix.database.rolloutRegistryPath), "utf8")),
);

/** Simulated pending set during dual ACTIVE/DRAINING — only expand allowed (HARD-009). */
const expandOnly = registry.migrations.filter((m) => m.phase === "expand").map((m) => m.folder);
const overlapCheck = compatibility.assertRolloutSafeDuringControlPlaneOverlap({
  registry,
  pendingMigrationFolders: expandOnly,
});
if (!overlapCheck.ok) {
  console.error(overlapCheck.reason);
  process.exit(1);
}

const contractPending = registry.migrations
  .filter((m) => m.phase === "contract")
  .slice(0, 1)
  .map((m) => m.folder);
const mustFail = compatibility.assertRolloutSafeDuringControlPlaneOverlap({
  registry,
  pendingMigrationFolders: contractPending,
});
if (mustFail.ok) {
  console.error("Expected contract-phase migration to fail overlap guard");
  process.exit(1);
}

const backfill = compatibility.validateBackfillIdempotencyDeclarations(registry);
if (!backfill.ok) {
  console.error("HARD-010 backfill idempotency violations:", backfill.violations.join("; "));
  process.exit(1);
}

console.log("Schema rollout discipline OK (expand/deploy/contract + overlap guard + HARD-010)");
