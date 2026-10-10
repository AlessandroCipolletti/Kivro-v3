#!/usr/bin/env node
/** M27 / HARD-021 — manifest validation + on-disk evidence paths. */
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const compatibility = await import(path.join(root, "packages/compatibility/dist/index.js"));
const releaseOps = await import(path.join(root, "packages/release-ops/dist/index.js"));

const manifestPath = path.join(root, "docs/audits/unified-release-manifest.json");
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));

const validation = compatibility.validateUnifiedReleaseManifest(manifest);
if (!validation.ok) {
  console.error("Unified release manifest invalid:", validation.issues.join("; "));
  process.exit(1);
}

const missing = releaseOps.findMissingEvidencePaths(
  releaseOps.manifestEvidencePaths(manifest),
  (rel) => fs.existsSync(path.join(root, rel)),
);
if (missing.length > 0) {
  console.error("Manifest references missing evidence files:", missing.join(", "));
  process.exit(1);
}

if (manifest.gitCommit && manifest.exactReleaseId) {
  const expected = releaseOps.expectedExactReleaseId(manifest.gitCommit);
  if (manifest.exactReleaseId !== expected) {
    console.error(`exactReleaseId mismatch: expected ${expected}, got ${manifest.exactReleaseId}`);
    process.exit(1);
  }
}

console.log("Unified release evidence OK (manifest + referenced artifacts)");
