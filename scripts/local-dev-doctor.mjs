#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const checks = [];

function pass(name, detail) {
  checks.push({ name, status: "PASS", detail });
}
function fail(name, detail) {
  checks.push({ name, status: "FAIL", detail });
}
function warn(name, detail) {
  checks.push({ name, status: "WARN", detail });
}

if (!fs.existsSync(path.join(root, ".env"))) {
  fail("env_file", "Copy .env.example → .env");
} else {
  pass("env_file", ".env present");
}

if (spawnSync("docker", ["info"], { stdio: "ignore" }).status === 0) {
  pass("docker", "daemon running");
} else {
  fail("docker", "Docker required for Postgres, Redis, MinIO");
}

if (spawnSync("node", ["--version"], { stdio: "ignore" }).status === 0) {
  pass("node", process.version);
}

const dryRun = process.env.KIVRO_SANDBOX_DRY_RUN !== "false";
if (dryRun) {
  warn("sandbox", "KIVRO_SANDBOX_DRY_RUN not false — §573 real sandbox E2E needs false + Docker");
} else {
  pass("sandbox", "real sandbox mode enabled");
}

const openclawBin = process.env.OPENCLAW_BIN ?? "openclaw";
if (spawnSync(openclawBin, ["--version"], { stdio: "ignore" }).status === 0) {
  pass("openclaw", `${openclawBin} detected`);
} else {
  warn("openclaw", "OpenClaw not on PATH — sandbox-fixture E2E still works with Docker");
}

if (process.env.REDIS_URL) {
  pass("redis_config", process.env.REDIS_URL);
} else {
  warn("redis_config", "REDIS_URL unset — /health/ready skips Redis");
}

const workerDist = path.join(root, "apps/worker/dist/cli.js");
if (fs.existsSync(workerDist)) {
  const selfTest = spawnSync("node", [workerDist, "sandbox-self-test"], {
    cwd: root,
    stdio: "pipe",
    encoding: "utf8",
    env: process.env,
  });
  if (selfTest.status === 0) {
    pass("sandbox_self_test", "worker sandbox-self-test");
  } else {
    warn("sandbox_self_test", "run pnpm --filter @kivro/worker build && sandbox-self-test");
  }
}

console.log(JSON.stringify({ doctor: checks }, null, 2));
if (checks.some((c) => c.status === "FAIL")) process.exit(1);
