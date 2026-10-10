#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const exitPath = path.join(root, "docs/audits/M26-exit-criteria.json");
const exitDoc = fs.existsSync(exitPath)
  ? JSON.parse(fs.readFileSync(exitPath, "utf8"))
  : { m26HarnessComplete: null };

const report = {
  generatedAt: new Date().toISOString(),
  milestone: "M26",
  rpoRto: JSON.parse(fs.readFileSync(path.join(root, "docs/audits/M26-rpo-rto.json"), "utf8")),
  reconciliationAlerts: JSON.parse(
    fs.readFileSync(path.join(root, "docs/audits/M26-reconciliation-alerts.json"), "utf8"),
  ),
  exitCriteria: exitDoc,
  harnessScripts: [
    "scripts/verify-fault-injection-matrix.mjs",
    "scripts/check-redis-non-authoritative.mjs",
    "scripts/verify-isolated-restore-evidence.mjs",
  ],
};

fs.writeFileSync(
  path.join(root, "docs/audits/M26-fitness-report.json"),
  `${JSON.stringify(report, null, 2)}\n`,
);

fs.writeFileSync(
  path.join(root, "docs/audits/M26-fitness-report.md"),
  [
    "# M26 fault injection & DR fitness report",
    "",
    `Generated: ${report.generatedAt}`,
    "",
    `- Harness complete: **${exitDoc.m26HarnessComplete}**`,
    `- PostgreSQL RPO (min): **${report.rpoRto.postgresql.rpoMinutes}**`,
    "",
  ].join("\n"),
);

console.log("M26 fitness report written");
