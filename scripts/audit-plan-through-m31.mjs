#!/usr/bin/env node
/**
 * Plan checkpoint: IMPLEMENTATION-PLAN milestones with verify gates (M03–M31).
 * Full Master Spec completion is tracked separately (M28 open catalog / M23).
 */
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));

const milestones = [];
for (let m = 3; m <= 31; m += 1) {
  const key = `verify:m${String(m).padStart(2, "0")}`;
  milestones.push({ id: `M${String(m).padStart(2, "0")}`, verify: key, present: Boolean(pkg.scripts[key]) });
}

const missingVerify = milestones.filter((m) => !m.present);
const exitFiles = ["M29", "M30", "M31"].map((m) => ({
  m,
  path: path.join(root, `docs/audits/${m}-exit-criteria.json`),
  ok: false,
  harness: false,
}));

for (const row of exitFiles) {
  if (!fs.existsSync(row.path)) {
    continue;
  }
  row.ok = true;
  const doc = JSON.parse(fs.readFileSync(row.path, "utf8"));
  row.harness = Boolean(doc[`m${row.m.slice(1).toLowerCase()}HarnessComplete`]);
}

const report = {
  generatedAt: new Date().toISOString(),
  planThrough: "M31",
  verifyScripts: milestones,
  missingVerifyScripts: missingVerify.map((m) => m.verify),
  experienceHarness: exitFiles,
  productMasterSpecComplete: (() => {
    try {
      return JSON.parse(fs.readFileSync(path.join(root, "docs/audits/M23-exit-criteria.json"), "utf8"))
        .productMasterSpecComplete;
    } catch {
      return null;
    }
  })(),
  note: "M00–M02 and M17 use chained gates inside later verify flows; terminal P0/P1/P2 catalog closure is M28+.",
};

fs.writeFileSync(
  path.join(root, "docs/audits/plan-through-M31.json"),
  `${JSON.stringify(report, null, 2)}\n`,
);

if (missingVerify.length > 0) {
  console.error("Plan through M31 FAIL — missing verify scripts:", missingVerify.map((m) => m.verify).join(", "));
  process.exit(1);
}

for (const row of exitFiles) {
  if (!row.ok || !row.harness) {
    console.error(`Plan through M31 FAIL — ${row.m} exit harness incomplete`);
    process.exit(1);
  }
}

console.log("Plan through M31 checkpoint OK (verify M03–M31 + M29–M31 exit harness)");
