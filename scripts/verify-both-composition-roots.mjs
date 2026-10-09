#!/usr/bin/env node
/** M19 — prove both thin composition entrypoints resolve the shared API build. */
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const root = path.resolve(import.meta.dirname, "..");

for (const app of ["apps/cloud-netsons", "apps/cloud-aws"]) {
  const pkg = path.join(root, app, "package.json");
  if (!fs.existsSync(pkg)) {
    console.error(`Missing ${app}/package.json`);
    process.exit(1);
  }
}

const res = spawnSync(
  "node",
  [
    "-e",
    `
      import { verifyBothCompositionRootsParity } from "./apps/api/dist/cloud-composition.js";
      verifyBothCompositionRootsParity();
      console.log("composition roots parity OK");
    `,
  ],
  { cwd: root, stdio: "inherit" },
);
if (res.status !== 0) {
  process.exit(res.status ?? 1);
}

console.log("Both composition entrypoints present; shared parity verified");
