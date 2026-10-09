#!/usr/bin/env node
/** ARCH-UNI-002/016 — provider packages must stay thin composition roots. */
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const profiles = [
  { pkg: "packages/cloud-netsons/src", app: "apps/cloud-netsons" },
  { pkg: "packages/cloud-aws/src", app: "apps/cloud-aws" },
];

const allowedPkgFiles = new Set(["composition.ts", "index.ts"]);
const maxCompositionLines = 80;

let failed = false;

for (const { pkg, app } of profiles) {
  const srcDir = path.join(root, pkg);
  for (const name of fs.readdirSync(srcDir)) {
    if (!name.endsWith(".ts")) continue;
    if (name.endsWith(".test.ts")) continue;
    if (!allowedPkgFiles.has(name)) {
      console.error(`${pkg}/${name} — provider src must only contain composition.ts + index.ts`);
      failed = true;
    }
  }
  const composition = path.join(srcDir, "composition.ts");
  const lines = fs.readFileSync(composition, "utf8").split("\n").length;
  if (lines > maxCompositionLines) {
    console.error(`${composition} exceeds ${maxCompositionLines} lines (${lines})`);
    failed = true;
  }
  if (!fs.existsSync(path.join(root, app, "package.json"))) {
    console.error(`Missing thin app entry ${app}`);
    failed = true;
  }
}

if (failed) process.exit(1);
console.log("Composition thinness check passed");
