#!/usr/bin/env node
/** M27 — exact-release activation gate (HARD-022/027). */
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const root = path.resolve(import.meta.dirname, "..");
const releaseOps = await import(path.join(root, "packages/release-ops/dist/index.js"));

function readJson(rel) {
  return JSON.parse(fs.readFileSync(path.join(root, rel), "utf8"));
}

const manifest = readJson("docs/audits/unified-release-manifest.json");

const missingPaths = releaseOps.findMissingEvidencePaths(
  releaseOps.manifestEvidencePaths(manifest),
  (rel) => fs.existsSync(path.join(root, rel)),
);
if (missingPaths.length > 0) {
  console.error("Release activation blocked — missing evidence:", missingPaths.join(", "));
  process.exit(1);
}
const parityReport = readJson(manifest.parityReportPath);
const conformanceManifest = readJson(manifest.conformanceManifestPath);
const m25Exit = readJson("docs/audits/M25-exit-criteria.json");
const m26Exit = readJson("docs/audits/M26-exit-criteria.json");

const envelope = releaseOps.parsePerformanceEnvelope(
  readJson(manifest.performanceEnvelopePath),
);
const alarms = releaseOps.parseOperationalAlarmsManifest(
  readJson(manifest.operationalAlarmsPath),
);
const envelopeOk = releaseOps.runEnvelopeLoadSuite(envelope).ok;
const alarmsOk = releaseOps.assertRequiredOperationalAlarms(alarms).ok;

let currentGitCommit = null;
try {
  currentGitCommit = execSync("git rev-parse HEAD", { cwd: root, encoding: "utf8" }).trim();
} catch {
  currentGitCommit = null;
}

const strict =
  process.env.KIVRO_RELEASE_ACTIVATION_STRICT === "1" ||
  process.env.CI === "true";

const result = releaseOps.evaluateReleaseActivation({
  manifest,
  parityReport,
  conformanceManifest,
  m25HarnessComplete: m25Exit.m25HarnessComplete === true,
  m26HarnessComplete: m26Exit.m26HarnessComplete === true,
  performanceEnvelopeValid: envelopeOk && alarmsOk,
  requireExactGitCommit: strict,
  currentGitCommit,
});

if (!result.ok) {
  console.error("Release activation gate FAIL:");
  for (const reason of result.reasons) {
    console.error(`  - ${reason}`);
  }
  process.exit(1);
}

console.log(`Release activation gate OK — exactReleaseId=${result.exactReleaseId}`);
