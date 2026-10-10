#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const exitDoc = JSON.parse(fs.readFileSync(path.join(root, "docs/audits/M29-exit-criteria.json"), "utf8"));

const report = {
  generatedAt: new Date().toISOString(),
  milestone: "M29",
  exitCriteria: exitDoc,
  harnessScripts: [
    "scripts/verify-m29-flow.mjs",
    "scripts/verify-m29-async-evidence.mjs",
    "scripts/sync-m29-coverage.mjs",
    "packages/job-delivery/src/cloud-finalization.ts",
    "apps/api/src/services/buyer-job-download.ts",
  ],
};

fs.writeFileSync(
  path.join(root, "docs/audits/M29-fitness-report.json"),
  `${JSON.stringify(report, null, 2)}\n`,
);

fs.writeFileSync(
  path.join(root, "docs/audits/M29-fitness-report.md",
  ),
  [
    "# M29 durable async delivery fitness report",
    "",
    `Generated: ${report.generatedAt}`,
    "",
    `- M29 harness: **${exitDoc.m29HarnessComplete}**`,
    "",
  ].join("\n"),
);

console.log("M29 fitness report written");
