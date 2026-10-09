#!/usr/bin/env node
/**
 * Local E2E entrypoint (Master Spec §573 / DEV-LOCAL-023).
 * M16: release-gate composition. Full two-user paid path ships in M18.
 */
import { spawnSync } from "node:child_process";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");

function run(cmd, args) {
  const res = spawnSync(cmd, args, { stdio: "inherit", cwd: root });
  if (res.status !== 0) {
    process.exit(res.status ?? 1);
  }
}

console.log("test:e2e:local — M16 release gate smoke (see docs/MVP-SUCCESS-CHECKLIST.md)");
run("node", ["scripts/verify-m16-flow.mjs"]);
