#!/usr/bin/env node
/** M23 — optional staging smokes/E2E when env is configured (IMPLEMENTATION-PLAN mandatory audit items). */
import { spawnSync } from "node:child_process";

const root = new URL("..", import.meta.url).pathname;

const scripts = [
  "scripts/netsons-staging-smoke.mjs",
  "scripts/aws-staging-smoke.mjs",
  "scripts/netsons-staging-e2e.mjs",
  "scripts/aws-staging-e2e.mjs",
  "scripts/verify-m22-dual-staging.mjs",
];

for (const script of scripts) {
  const res = spawnSync("node", [script], { cwd: root, stdio: "inherit" });
  if (res.status !== 0) {
    process.exit(res.status ?? 1);
  }
}

console.log("M23 staging bundle finished (skipped steps logged when env unset)");
