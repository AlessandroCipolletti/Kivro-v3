#!/usr/bin/env node
/**
 * Local E2E entrypoint (Master Spec §573 / DEV-LOCAL-023).
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

console.log("test:e2e:local — M18 local dev gate + optional live API path");
run("node", ["scripts/verify-m18-flow.mjs"]);
run("node", ["scripts/run-with-env.mjs", "node", "scripts/run-local-e2e.mjs"]);
run("node", ["scripts/run-with-env.mjs", "node", "scripts/run-local-e2e-failures.mjs"]);
run("node", ["scripts/run-with-env.mjs", "node", "scripts/run-local-stripe-e2e.mjs"]);
run("node", ["scripts/run-with-env.mjs", "node", "scripts/run-local-openclaw-e2e.mjs"]);
