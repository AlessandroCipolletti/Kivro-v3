#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const exit = JSON.parse(fs.readFileSync(path.join(root, "docs/audits/M31-exit-criteria.json"), "utf8"));

const report = {
  generatedAt: new Date().toISOString(),
  milestone: "M31",
  theme: "buyer history reuse rich results",
  exitCriteria: exit.criteria,
  m31HarnessComplete: exit.m31HarnessComplete,
};

fs.writeFileSync(path.join(root, "docs/audits/M31-fitness-report.json"), `${JSON.stringify(report, null, 2)}\n`);
fs.writeFileSync(
  path.join(root, "docs/audits/M31-fitness-report.md"),
  [
    "# M31 fitness report",
    "",
    `- Harness complete: **${exit.m31HarnessComplete}**`,
    "",
    ...exit.criteria.map((c) => `- ${c.id}: ${c.status} — ${c.detail}`),
    "",
  ].join("\n"),
);

console.log("M31 fitness report written");
