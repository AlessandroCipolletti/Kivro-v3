#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const exitDoc = JSON.parse(fs.readFileSync(path.join(root, "docs/audits/M28-exit-criteria.json"), "utf8"));
const compliance = JSON.parse(fs.readFileSync(path.join(root, "docs/audits/M28-compliance-report.json"), "utf8"));

const report = {
  generatedAt: new Date().toISOString(),
  milestone: "M28",
  exitCriteria: exitDoc,
  complianceSummary: compliance.summary,
  masterSpecCompletion: compliance.masterSpecCompletion,
  harnessScripts: [
    "scripts/audit-m28-unified.mjs",
    "scripts/audit-m28-requirement-families.mjs",
    "scripts/audit-m28-master-spec-sampling.mjs",
    "scripts/audit-m28-open-requirements-catalog.mjs",
    "scripts/audit-m28-readiness-checklist.mjs",
    "scripts/verify-m28-dual-control-plane-evidence.mjs",
    "scripts/verify-m28-threat-control-evidence.mjs",
    "scripts/lib/m28-mandatory-runs.mjs",
  ],
};

fs.writeFileSync(
  path.join(root, "docs/audits/M28-fitness-report.json"),
  `${JSON.stringify(report, null, 2)}\n`,
);

fs.writeFileSync(
  path.join(root, "docs/audits/M28-fitness-report.md"),
  [
    "# M28 terminal audit fitness report",
    "",
    `Generated: ${report.generatedAt}`,
    "",
    `- M28 harness: **${exitDoc.m28HarnessComplete}**`,
    `- Product Master Spec complete: **${exitDoc.productMasterSpecComplete}**`,
    `- TESTED requirements: **${compliance.summary?.TESTED ?? "?"}**`,
    "",
  ].join("\n"),
);

console.log("M28 fitness report written");
