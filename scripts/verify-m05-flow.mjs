#!/usr/bin/env node
/** M05 gate: I/O contract validation + job-io tests */
import { spawnSync } from "node:child_process";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");

function run(cmd, args) {
  const res = spawnSync(cmd, args, { stdio: "inherit", cwd: root });
  if (res.status !== 0) {
    process.exit(res.status ?? 1);
  }
}

run("pnpm", [
  "exec",
  "vitest",
  "run",
  "packages/contracts/src/capability-io.test.ts",
  "packages/job-io/src/validate-buyer-input.test.ts",
  "packages/job-io/src/validate-output-manifest.test.ts",
  "packages/capability-publish/src/contract-compatibility.test.ts",
  "packages/capability-publish/src/permission-diff.test.ts",
]);

console.log("M05 verify flow passed");
