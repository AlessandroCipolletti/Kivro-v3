#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const root = path.resolve(import.meta.dirname, "..");
const compatibility = await import(path.join(root, "packages/compatibility/dist/index.js"));
const matrix = JSON.parse(
  fs.readFileSync(path.join(root, "packages/compatibility/matrix.json"), "utf8"),
);
const registry = compatibility.parseSchemaRolloutRegistry(
  JSON.parse(fs.readFileSync(path.join(root, matrix.database.rolloutRegistryPath), "utf8")),
);

let gitCommit = null;
try {
  gitCommit = execSync("git rev-parse HEAD", { cwd: root, encoding: "utf8" }).trim();
} catch {
  gitCommit = null;
}

const manifest = compatibility.buildUnifiedReleaseManifest({
  gitCommit,
  schemaRolloutPhase: registry.activeRolloutPhase,
});

const outJson = path.join(root, "docs/audits/unified-release-manifest.json");
fs.writeFileSync(outJson, `${JSON.stringify(manifest, null, 2)}\n`);

const validation = compatibility.validateUnifiedReleaseManifest(manifest);
if (!validation.ok) {
  console.error("Release manifest validation failed:", validation.issues.join("; "));
  process.exit(1);
}

console.log(`Unified release manifest written → ${path.relative(root, outJson)}`);
