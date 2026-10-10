#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
let m34HarnessComplete = false;
try {
  m34HarnessComplete = JSON.parse(
    fs.readFileSync(path.join(root, "docs/audits/M34-exit-criteria.json"), "utf8"),
  ).m34HarnessComplete;
} catch {
  m34HarnessComplete = false;
}
const report = {
  generatedAt: new Date().toISOString(),
  milestone: "M34",
  focus: "Multi-Worker ownership, assignment, and routing",
  m34HarnessComplete,
  packages: ["@kivro/job-scheduling", "@kivro/job-dispatch"],
  golden: ["SELLERUX-GOLD-019"],
};
fs.writeFileSync(path.join(root, "docs/audits/M34-fitness-report.json"), `${JSON.stringify(report, null, 2)}\n`);
fs.writeFileSync(
  path.join(root, "docs/audits/M34-fitness-report.md"),
  `# M34 fitness report\n\n- Harness complete: **${m34HarnessComplete}**\n`,
);
if (!m34HarnessComplete) process.exit(1);
console.log("M34 fitness report written");
