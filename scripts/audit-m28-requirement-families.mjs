#!/usr/bin/env node
/** M28 — ARCH-UNI / PORT / HOST-NET / HARD family rollup (do not trust COVERAGE prose alone). */
import fs from "node:fs";
import path from "node:path";
import { loadCoverageFromRepo } from "./lib/parse-coverage.mjs";
import {
  M28_FAMILIES,
  PORTABILITY_FAMILY_IDS,
  familyOfRequirementId,
  hasExplicitScheduleNote,
} from "./lib/m28-family-rules.mjs";

const root = path.resolve(import.meta.dirname, "..");
const rows = loadCoverageFromRepo(root);

const HARD_M24_M27 = [
  "HARD-005",
  "HARD-006",
  "HARD-007",
  "HARD-008",
  "HARD-009",
  "HARD-010",
  "HARD-011",
  "HARD-012",
  "HARD-013",
  "HARD-014",
  "HARD-015",
  "HARD-016",
  "HARD-017",
  "HARD-018",
  "HARD-019",
  "HARD-020",
  "HARD-021",
  "HARD-022",
  "HARD-023",
  "HARD-024",
  "HARD-025",
  "HARD-026",
  "HARD-027",
  "HARD-028",
];

const rollup = {};
for (const f of M28_FAMILIES) {
  rollup[f.id] = { TESTED: 0, TODO: 0, PARTIAL: 0, other: 0, p0Open: 0 };
}

const hardMilestoneGaps = [];
const portabilityP0Gaps = [];
const familyOpenUnexplained = [];

for (const row of rows) {
  const fam = familyOfRequirementId(row.id);
  if (!fam) continue;
  const bucket = rollup[fam];
  if (row.status === "TESTED") bucket.TESTED += 1;
  else if (row.status === "TODO") bucket.TODO += 1;
  else if (row.status === "PARTIAL") bucket.PARTIAL += 1;
  else bucket.other += 1;
  if (row.priority === "P0" && ["TODO", "PARTIAL", "BLOCKED"].includes(row.status)) {
    bucket.p0Open += 1;
  }
  if (HARD_M24_M27.includes(row.id) && row.status !== "TESTED") {
    hardMilestoneGaps.push({ id: row.id, status: row.status, notes: row.notes });
  }
  if (
    PORTABILITY_FAMILY_IDS.includes(fam) &&
    row.priority === "P0" &&
    row.status !== "TESTED"
  ) {
    portabilityP0Gaps.push({ id: row.id, status: row.status, family: fam });
  }
  if (
    ["TODO", "PARTIAL", "BLOCKED"].includes(row.status) &&
    (row.priority === "P0" || row.priority === "P1") &&
    !hasExplicitScheduleNote(row.notes)
  ) {
    familyOpenUnexplained.push({ id: row.id, priority: row.priority, family: fam });
  }
}

const report = {
  generatedAt: new Date().toISOString(),
  families: rollup,
  hardM24M27NonTested: hardMilestoneGaps,
  portabilityP0NonTested: portabilityP0Gaps,
  familyOpenUnexplained,
  pass:
    hardMilestoneGaps.length === 0 &&
    portabilityP0Gaps.length === 0 &&
    familyOpenUnexplained.length === 0,
};

fs.writeFileSync(
  path.join(root, "docs/audits/M28-requirement-families.json"),
  `${JSON.stringify(report, null, 2)}\n`,
);

if (!report.pass) {
  if (hardMilestoneGaps.length > 0) {
    console.error("M28 requirement families FAIL — HARD M24–M27 rows not TESTED:");
    for (const g of hardMilestoneGaps.slice(0, 10)) console.error(`  ${g.id}`);
  }
  if (portabilityP0Gaps.length > 0) {
    console.error("M28 portability FAIL — ARCH-UNI/PORT/HOST-NET P0 not TESTED:");
    for (const g of portabilityP0Gaps.slice(0, 10)) console.error(`  ${g.id}`);
  }
  if (familyOpenUnexplained.length > 0) {
    console.error("M28 family FAIL — unexplained open P0/P1 in families:");
    for (const g of familyOpenUnexplained.slice(0, 10)) console.error(`  ${g.id}`);
  }
  process.exit(1);
}

console.log(
  "M28 requirement families OK (HARD M24–M27 TESTED; portability P0 closed; family opens scheduled)",
);
