#!/usr/bin/env node
/**
 * Idempotent local infra: Postgres + MinIO, migrations, dev bucket.
 * Used by `pnpm dev:setup` and `pnpm dev`.
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");

function run(cmd, args, opts = {}) {
  const res = spawnSync(cmd, args, {
    cwd: root,
    stdio: "inherit",
    env: process.env,
    ...opts,
  });
  if (res.status !== 0) {
    process.exit(res.status ?? 1);
  }
}

function runOptional(cmd, args) {
  const res = spawnSync(cmd, args, { cwd: root, stdio: "inherit", env: process.env });
  return res.status === 0;
}

const envPath = path.join(root, ".env");
if (!fs.existsSync(envPath)) {
  console.error("Missing .env — copy .env.example to .env first.");
  process.exit(1);
}

console.log("Starting Docker services (postgres, redis, minio)…");
run("docker", ["compose", "up", "-d", "postgres", "redis", "minio"]);

console.log("Waiting for PostgreSQL…");
run("node", ["scripts/wait-for-postgres.mjs"]);

console.log("Waiting for Redis…");
run("node", ["scripts/wait-for-redis.mjs"]);

console.log("Waiting for MinIO…");
run("node", ["scripts/wait-for-minio.mjs"]);

console.log("Applying migrations…");
run("pnpm", ["db:migrate"]);

console.log("Ensuring MinIO bucket…");
run("node", ["scripts/run-with-env.mjs", "node", "scripts/init-minio-bucket.mjs"]);

if (process.env.KIVRO_DEV_SEED_ON_SETUP === "true") {
  console.log("Running dev seed…");
  run("node", ["scripts/run-with-env.mjs", "node", "scripts/dev-seed.mjs"]);
}

console.log("dev:setup complete.");
