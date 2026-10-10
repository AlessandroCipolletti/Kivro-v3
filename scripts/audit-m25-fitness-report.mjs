#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const matrix = JSON.parse(
  fs.readFileSync(path.join(root, "packages/compatibility/matrix.json"), "utf8"),
);
const release = JSON.parse(
  fs.readFileSync(path.join(root, "docs/audits/unified-release-manifest.json"), "utf8"),
);
const exitPath = path.join(root, "docs/audits/M25-exit-criteria.json");
const exitDoc = fs.existsSync(exitPath)
  ? JSON.parse(fs.readFileSync(exitPath, "utf8"))
  : { m25HarnessComplete: null };

const report = {
  generatedAt: new Date().toISOString(),
  milestone: "M25",
  compatibilityMatrixVersion: matrix.version,
  unifiedReleaseManifest: release,
  exitCriteria: exitDoc,
  harnessScripts: [
    "scripts/verify-compatibility-matrix.mjs",
    "scripts/verify-schema-rollout-discipline.mjs",
    "scripts/generate-unified-release-manifest.mjs",
    "scripts/verify-worker-release-cli.mjs",
    "scripts/sync-compatibility-matrix-fixture.mjs",
  ],
};

fs.writeFileSync(
  path.join(root, "docs/audits/M25-fitness-report.json"),
  `${JSON.stringify(report, null, 2)}\n`,
);

const md = [
  "# M25 compatibility & Worker update fitness report",
  "",
  `Generated: ${report.generatedAt}`,
  "",
  `- Matrix version: **${matrix.version}**`,
  `- API contract: \`${matrix.apiContractVersion}\``,
  `- Worker protocol: **${matrix.workerProtocolMin}–${matrix.workerProtocolMax}**`,
  `- Harness complete: **${exitDoc.m25HarnessComplete}**`,
  "",
].join("\n");

fs.writeFileSync(path.join(root, "docs/audits/M25-fitness-report.md"), md);
console.log("M25 fitness report written");
