#!/usr/bin/env node
/** `pnpm dev:demo` — infra + seed + print identities (§561). */
import { spawnSync } from "node:child_process";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");

function run(cmd, args) {
  const res = spawnSync(cmd, args, { stdio: "inherit", cwd: root, env: process.env });
  if (res.status !== 0) process.exit(res.status ?? 1);
}

run("node", ["scripts/run-with-env.mjs", "node", "scripts/dev-setup.mjs"]);
run("pnpm", ["--filter", "@kivro/database", "run", "build"]);
run("pnpm", ["--filter", "@kivro/auth", "run", "build"]);
run("pnpm", ["--filter", "@kivro/billing", "run", "build"]);
run("node", ["scripts/run-with-env.mjs", "node", "scripts/dev-seed.mjs"]);
console.log("Demo ready — use buyer@kivro.local / seller@kivro.local (password in dev-seed output).");
