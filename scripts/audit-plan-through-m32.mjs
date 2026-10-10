#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));

const milestones = [];
for (let m = 3; m <= 32; m += 1) {
  const key = `verify:m${String(m).padStart(2, "0")}`;
  milestones.push({ id: `M${String(m).padStart(2, "0")}`, verify: key, present: Boolean(pkg.scripts[key]) });
}

const missingVerify = milestones.filter((m) => !m.present);
const exitFiles = ["M30", "M31", "M32"].map((m) => ({
  m,
  path: path.join(root, `docs/audits/${m}-exit-criteria.json`),
  ok: false,
  harness: false,
}));

for (const row of exitFiles) {
  if (!fs.existsSync(row.path)) continue;
  row.ok = true;
  const doc = JSON.parse(fs.readFileSync(row.path, "utf8"));
  row.harness = Boolean(doc[`m${row.m.slice(1).toLowerCase()}HarnessComplete`]);
}

const report = {
  generatedAt: new Date().toISOString(),
  planThrough: "M32",
  verifyScripts: milestones,
  missingVerifyScripts: missingVerify.map((m) => m.verify),
  experienceHarness: exitFiles,
};

fs.writeFileSync(path.join(root, "docs/audits/plan-through-M32.json"), `${JSON.stringify(report, null, 2)}\n`);

if (missingVerify.length > 0) {
  console.error("Plan through M32 FAIL — missing verify scripts:", missingVerify.map((m) => m.verify).join(", "));
  process.exit(1);
}

for (const row of exitFiles) {
  if (!row.ok || !row.harness) {
    console.error(`Plan through M32 FAIL — ${row.m} exit harness incomplete`);
    process.exit(1);
  }
}

console.log("Plan through M32 checkpoint OK");
