#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
const milestones = [];
for (let m = 3; m <= 34; m += 1) {
  const key = `verify:m${String(m).padStart(2, "0")}`;
  milestones.push({ id: `M${String(m).padStart(2, "0")}`, verify: key, present: Boolean(pkg.scripts[key]) });
}
const missingVerify = milestones.filter((m) => !m.present);
const exitFiles = ["M32", "M33", "M34"].map((m) => {
  const file = path.join(root, `docs/audits/${m}-exit-criteria.json`);
  let harness = false;
  if (fs.existsSync(file)) {
    harness = Boolean(JSON.parse(fs.readFileSync(file, "utf8"))[`m${m.slice(1)}HarnessComplete`]);
  }
  return { m, harness };
});
fs.writeFileSync(
  path.join(root, "docs/audits/plan-through-M34.json"),
  `${JSON.stringify({ generatedAt: new Date().toISOString(), planThrough: "M34", missingVerify: missingVerify.map((m) => m.verify), exitFiles }, null, 2)}\n`,
);
if (missingVerify.length || exitFiles.some((row) => !row.harness)) {
  console.error("Plan through M34 FAIL");
  process.exit(1);
}
console.log("Plan through M34 checkpoint OK");
