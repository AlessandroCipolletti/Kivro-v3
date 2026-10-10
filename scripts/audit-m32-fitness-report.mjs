#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
let m32HarnessComplete = false;
try {
  m32HarnessComplete = JSON.parse(
    fs.readFileSync(path.join(root, "docs/audits/M32-exit-criteria.json"), "utf8"),
  ).m32HarnessComplete;
} catch {
  m32HarnessComplete = false;
}

const report = {
  generatedAt: new Date().toISOString(),
  milestone: "M32",
  focus: "Seller onboarding, discovery consent, safe publication",
  m32HarnessComplete,
  packages: ["@kivro/seller-experience"],
  golden: [
    "SELLERUX-GOLD-001",
    "SELLERUX-GOLD-002",
    "SELLERUX-GOLD-003",
    "SELLERUX-GOLD-004",
    "SELLERUX-GOLD-005",
    "SELLERUX-GOLD-006",
    "SELLERUX-GOLD-012",
    "SELLERUX-GOLD-016",
    "SELLERUX-GOLD-017",
    "SELLERUX-GOLD-018",
  ],
};

fs.writeFileSync(path.join(root, "docs/audits/M32-fitness-report.json"), `${JSON.stringify(report, null, 2)}\n`);
fs.writeFileSync(
  path.join(root, "docs/audits/M32-fitness-report.md"),
  [
    "# M32 fitness report",
    "",
    `- Harness complete: **${m32HarnessComplete}**`,
    `- Package: \`@kivro/seller-experience\``,
    "",
  ].join("\n"),
);

if (!m32HarnessComplete) {
  process.exit(1);
}

console.log("M32 fitness report written");
