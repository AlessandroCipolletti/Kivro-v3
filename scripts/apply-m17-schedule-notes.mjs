#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { parseCoverage } from "./lib/parse-coverage.mjs";

const root = path.resolve(import.meta.dirname, "..");
const indexPath = path.join(root, "spec/compliance/section-milestone-index.json");
if (!fs.existsSync(indexPath)) {
  console.error("Run node scripts/generate-section-milestone-index.mjs first");
  process.exit(1);
}
const index = JSON.parse(fs.readFileSync(indexPath, "utf8"));

const coveragePath = path.join(root, "spec/COVERAGE.md");
let text = fs.readFileSync(coveragePath, "utf8");
const rows = parseCoverage(text);

function targetMilestone(row) {
  for (const rule of index.idPrefixRules) {
    if (row.id.startsWith(rule.prefix)) return rule.milestone;
  }
  if (row.section && index.postMvpSections.includes(row.section)) return "post-MVP";
  if (row.section && index.sectionToMilestone[String(row.section)]) {
    const m = index.sectionToMilestone[String(row.section)];
    return m === "M17" ? "M23" : m;
  }
  return "M23";
}

function isUnexplained(row) {
  if (!["TODO", "PARTIAL", "BLOCKED"].includes(row.status)) return false;
  const n = row.notes.trim();
  if (!n || n === "---") return true;
  if (/^§\d+$/.test(n)) return true;
  if (/scheduled:|post-MVP|M\d{2}|IMPLEMENTATION-PLAN|bounded|deferred|M17/i.test(n)) return false;
  return true;
}

let textBulk = text.replace(
  /scheduled:M17 per IMPLEMENTATION-PLAN; M17 audit accounted/g,
  "scheduled:M23 per IMPLEMENTATION-PLAN; M17 audit accounted",
);
let updated = textBulk !== text ? 1 : 0;
text = textBulk;

for (const row of parseCoverage(text)) {
  if (!isUnexplained(row)) continue;
  const target = targetMilestone(row);
  const note =
    target === "post-MVP"
      ? "post-MVP (Master Spec); M17 audit accounted"
      : `scheduled:${target} per IMPLEMENTATION-PLAN; M17 audit accounted`;

  if (row.line.includes("`" + row.id + "`")) {
    const replaced = row.line.replace(
      /(`(?:TODO|PARTIAL|BLOCKED)`\s+[^\s]+\s+[^\s]+\s+)(---|\S+(?:\s+\S+)*?)$/,
      `$1${note}`,
    );
    if (replaced !== row.line) {
      text = text.replace(row.line, replaced);
      updated += 1;
    }
  } else if (/^\s+[A-Z][A-Z0-9-]+-\d+/.test(row.line)) {
    let replaced = row.line;
    if (/^\s*§\d+$/.test(row.notes.trim()) || row.notes.trim().startsWith("§")) {
      replaced = row.line.replace(/(§\d+)\s*$/, `$1 ${note}`);
    } else {
      replaced = row.line.replace(/\s+---\s*$/, ` ${note}`);
    }
    if (replaced !== row.line) {
      text = text.replace(row.line, replaced);
      updated += 1;
    }
  }
}

if (updated > 0) {
  fs.writeFileSync(coveragePath, text);
}
console.log(`Schedule notes applied: ${updated} row(s) updated`);
