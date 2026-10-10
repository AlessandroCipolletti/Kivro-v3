#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const exitDoc = JSON.parse(fs.readFileSync(path.join(root, "docs/audits/M30-exit-criteria.json"), "utf8"));

const report = {
  generatedAt: new Date().toISOString(),
  milestone: "M30",
  exitCriteria: exitDoc,
  harnessScripts: [
    "scripts/verify-m30-flow.mjs",
    "scripts/verify-m30-evidence.mjs",
    "scripts/sync-m30-coverage.mjs",
    "scripts/audit-m30-spotcheck.mjs",
    "packages/buyer-experience/src/execution-quote.ts",
    "apps/api/src/routes/buyer-experience.ts",
  ],
};

fs.writeFileSync(
  path.join(root, "docs/audits/M30-fitness-report.json"),
  `${JSON.stringify(report, null, 2)}\n`,
);

fs.writeFileSync(
  path.join(root, "docs/audits/M30-fitness-report.md"),
  [
    "# M30 buyer predictability fitness report",
    "",
    `Generated: ${report.generatedAt}`,
    "",
    `- M30 harness: **${exitDoc.m30HarnessComplete}**`,
    "",
  ].join("\n"),
);

console.log("M30 fitness report written");
