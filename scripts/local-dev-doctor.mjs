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

console.log(JSON.stringify({ doctor: checks }, null, 2));
if (checks.some((c) => c.status === "FAIL")) process.exit(1);
