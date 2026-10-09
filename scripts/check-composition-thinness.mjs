#!/usr/bin/env node
/** ARCH-UNI-002/016 — provider packages must stay thin composition roots. */
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const profiles = [
  { pkg: "packages/cloud-netsons/src", app: "apps/cloud-netsons" },
  { pkg: "packages/cloud-aws/src", app: "apps/cloud-aws" },
];

const allowedPkgByDir = {
  "packages/cloud-netsons/src": new Set([
    "composition.ts",
    "index.ts",
    "durable-work-db-port.ts",
    "netsons-cron-tick.ts",
    "netsons-runtime-config.ts",
    "netsons-bounds.ts",
    "netsons-maintenance-sweeps.ts",
    "worker-dispatch-signal.ts",
  ]),
  "packages/cloud-aws/src": new Set([
    "composition.ts",
    "index.ts",
    "durable-work-port.ts",
    "sqs-durable-work.ts",
    "aws-event-tick.ts",
    "aws-runtime-config.ts",
    "aws-bounds.ts",
    "aws-maintenance-sweeps.ts",
    "worker-dispatch-signal.ts",
  ]),
};
const maxCompositionLines = 80;

let failed = false;

for (const { pkg, app } of profiles) {
  const srcDir = path.join(root, pkg);
  const allowedPkgFiles = allowedPkgByDir[pkg] ?? new Set(["composition.ts", "index.ts"]);
  for (const name of fs.readdirSync(srcDir)) {
    if (!name.endsWith(".ts")) continue;
    if (name.endsWith(".test.ts")) continue;
    if (!allowedPkgFiles.has(name)) {
      console.error(`${pkg}/${name} — unexpected provider src file (update check-composition-thinness allowlist)`);
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
