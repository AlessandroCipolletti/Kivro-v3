#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const exitPath = path.join(root, "docs/audits/M27-exit-criteria.json");
const exitDoc = fs.existsSync(exitPath)
  ? JSON.parse(fs.readFileSync(exitPath, "utf8"))
  : { m27HarnessComplete: null };

const report = {
  generatedAt: new Date().toISOString(),
  milestone: "M27",
  performanceEnvelope: JSON.parse(
    fs.readFileSync(path.join(root, "docs/audits/M27-performance-envelope.json"), "utf8"),
  ),
  operationalAlarms: JSON.parse(
    fs.readFileSync(path.join(root, "docs/audits/M27-operational-alarms.json"), "utf8"),
  ),
  exitCriteria: exitDoc,
  harnessScripts: [
    "scripts/verify-performance-envelope-load.mjs",
    "scripts/verify-release-activation-gate.mjs",
    "scripts/generate-unified-release-manifest.mjs",
    "scripts/generate-provider-parity-report.mjs",
  ],
};

fs.writeFileSync(
  path.join(root, "docs/audits/M27-fitness-report.json"),
  `${JSON.stringify(report, null, 2)}\n`,
);

fs.writeFileSync(
  path.join(root, "docs/audits/M27-fitness-report.md"),
  [
    "# M27 performance envelope & release ops fitness report",
    "",
    `Generated: ${report.generatedAt}`,
    "",
    `- Harness complete: **${exitDoc.m27HarnessComplete}**`,
    `- Max concurrent jobs/seller: **${report.performanceEnvelope.shared.maxConcurrentJobsPerSeller}**`,
    `- Operational alarms: **${report.operationalAlarms.alarms.length}**`,
    "",
  ].join("\n"),
);

console.log("M27 fitness report written");
