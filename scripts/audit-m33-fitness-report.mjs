#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
let m33HarnessComplete = false;
try {
  m33HarnessComplete = JSON.parse(
    fs.readFileSync(path.join(root, "docs/audits/M33-exit-criteria.json"), "utf8"),
  ).m33HarnessComplete;
} catch {
  m33HarnessComplete = false;
}

const report = {
  generatedAt: new Date().toISOString(),
  milestone: "M33",
  focus: "Seller operations, economics, reliability after publication",
  m33HarnessComplete,
  packages: ["@kivro/seller-experience", "@kivro/job-scheduling"],
  golden: [
    "SELLERUX-GOLD-007",
    "SELLERUX-GOLD-008",
    "SELLERUX-GOLD-009",
    "SELLERUX-GOLD-010",
    "SELLERUX-GOLD-011",
    "SELLERUX-GOLD-013",
    "SELLERUX-GOLD-014",
    "SELLERUX-GOLD-015",
  ],
};

fs.writeFileSync(path.join(root, "docs/audits/M33-fitness-report.json"), `${JSON.stringify(report, null, 2)}\n`);
fs.writeFileSync(
  path.join(root, "docs/audits/M33-fitness-report.md"),
  [
    "# M33 fitness report",
    "",
    `- Harness complete: **${m33HarnessComplete}**`,
    `- Packages: \`@kivro/seller-experience\`, \`@kivro/job-scheduling\``,
    "",
  ].join("\n"),
);

if (!m33HarnessComplete) {
  process.exit(1);
}

console.log("M33 fitness report written");
