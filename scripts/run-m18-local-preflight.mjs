#!/usr/bin/env node
/**
 * Run before local §573 test — infra + worker sandbox self-test (no API required).
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");

function run(cmd, args) {
  const res = spawnSync(cmd, args, { cwd: root, stdio: "inherit", env: process.env });
  if (res.status !== 0) process.exit(res.status ?? 1);
}

if (!fs.existsSync(path.join(root, ".env"))) {
  console.error("Copy .env.example → .env first.");
  process.exit(1);
}

run("node", ["scripts/local-dev-doctor.mjs"]);
run("node", ["scripts/verify-dev-clone-contract.mjs"]);
run("node", ["scripts/run-with-env.mjs", "node", "scripts/dev-setup.mjs"]);
run("pnpm", ["--filter", "@kivro/worker", "run", "build"]);
run("node", ["scripts/run-with-env.mjs", "node", "apps/worker/dist/cli.js", "sandbox-self-test"]);

console.log("");
console.log("Preflight OK. Next:");
console.log("  Terminal A: pnpm dev");
console.log("  Terminal B: pnpm worker:dev  (optional — E2E can use job run-fixture)");
console.log("  Terminal C: KIVRO_E2E_REQUIRE_API=true pnpm test:e2e:local");
