#!/usr/bin/env node
/** Re-route open rows still marked scheduled:M23 that belong to later product milestones (M24+). */
import fs from "node:fs";
import path from "node:path";
import { parseCoverage } from "./lib/parse-coverage.mjs";

const root = path.resolve(import.meta.dirname, "..");
const coveragePath = path.join(root, "spec/COVERAGE.md");
let text = fs.readFileSync(coveragePath, "utf8");
const index = JSON.parse(
  fs.readFileSync(path.join(root, "spec/compliance/section-milestone-index.json"), "utf8"),
);

function targetMilestone(row) {
  for (const rule of index.idPrefixRules) {
    if (row.id.startsWith(rule.prefix)) return rule.milestone;
  }
  if (row.section && index.postMvpSections.includes(row.section)) return "post-MVP";
  if (row.section && index.sectionToMilestone[String(row.section)]) {
    return index.sectionToMilestone[String(row.section)];
  }
  return "M28";
}

let updated = 0;
for (const row of parseCoverage(text)) {
  if (row.status !== "TODO" && row.status !== "PARTIAL" && row.status !== "BLOCKED") continue;
  if (!/scheduled:M23 per IMPLEMENTATION-PLAN/i.test(row.notes)) continue;
  if (row.id.startsWith("HARD-")) continue;
  const target = targetMilestone(row);
  if (target === "M23") continue;
  const note = `scheduled:${target} per IMPLEMENTATION-PLAN; M23 audit accounted`;
  const next = row.line.replace(
    /scheduled:M23 per IMPLEMENTATION-PLAN; M17 audit accounted/,
    note,
  );
  if (next !== row.line) {
    text = text.replace(row.line, next);
    updated += 1;
  }
}

if (updated > 0) {
  fs.writeFileSync(coveragePath, text);
}
console.log(`M23 schedule notes realigned: ${updated} row(s)`);
