#!/usr/bin/env node
/** HOST-NET-002/009/587 — production apps must not depend on BullMQ consumers. */
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const scanRoots = ["apps/api", "apps/cloud-netsons", "packages/cloud-netsons"];

let failed = false;
for (const rel of scanRoots) {
  const pkgPath = path.join(root, rel, "package.json");
  if (!fs.existsSync(pkgPath)) continue;
  const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
  for (const section of ["dependencies", "optionalDependencies"]) {
    const deps = pkg[section] ?? {};
    for (const name of Object.keys(deps)) {
      if (name === "bullmq" || name.startsWith("@bullmq/")) {
        console.error(`${rel}/package.json must not list ${name} in ${section}`);
        failed = true;
      }
    }
  }
}

if (failed) process.exit(1);
console.log("No BullMQ production dependency in Netsons/API packages");
