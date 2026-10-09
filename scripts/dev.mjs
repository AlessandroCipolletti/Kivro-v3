#!/usr/bin/env node
/**
 * Local dev: infra setup, build API, run API (PORT from .env, default 3001) + web (:3000).
 */
import { spawn, spawnSync } from "node:child_process";
import crypto from "node:crypto";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");

if (!process.env.SESSION_SECRET?.trim()) {
  process.env.SESSION_SECRET = crypto.randomBytes(32).toString("hex");
  console.log("SESSION_SECRET was empty — using ephemeral secret for this dev session.");
}

console.log("Running dev:setup…");
const setup = spawnSync("node", ["scripts/dev-setup.mjs"], {
  cwd: root,
  stdio: "inherit",
  env: process.env,
});
if (setup.status !== 0) {
  process.exit(setup.status ?? 1);
}

console.log("Building API and workspace dependencies…");
const build = spawnSync("pnpm", ["--filter", "@kivro/api...", "run", "build"], {
  cwd: root,
  stdio: "inherit",
  env: process.env,
});
if (build.status !== 0) {
  process.exit(build.status ?? 1);
}

const children = [];
let shuttingDown = false;

function start(label, cmd, args) {
  const child = spawn(cmd, args, {
    cwd: root,
    stdio: "inherit",
    env: process.env,
  });
  child.on("exit", (code, signal) => {
    if (signal) {
      console.log(`[${label}] stopped (${signal})`);
    } else if (code !== 0 && code != null) {
      console.error(`[${label}] exited with code ${code}`);
    }
    shutdown(code ?? 1);
  });
  children.push({ label, child });
  return child;
}

function shutdown(exitCode = 0) {
  if (shuttingDown) {
    return;
  }
  shuttingDown = true;
  for (const { child } of children) {
    if (!child.killed) {
      child.kill("SIGTERM");
    }
  }
  setTimeout(() => process.exit(exitCode), 300);
}

process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));

console.log("");
const apiPort = process.env.PORT?.trim() || "3001";
console.log("Kivro dev");
console.log("  Web  → http://localhost:3000");
console.log(`  API  → http://localhost:${apiPort}`);
console.log("  MinIO console → http://localhost:9001 (kivro / kivrodevsecret)");
console.log("Press Ctrl+C to stop.");
console.log("");

start("api", "pnpm", ["--filter", "@kivro/api", "run", "dev"]);
start("web", "pnpm", ["--filter", "@kivro/web", "run", "dev"]);
