#!/usr/bin/env node
/**
 * Local reset workflows (§568 / DEV-LOCAL-021).
 * Usage: node scripts/dev-reset.mjs [stop|restart|storage|full]
 */
import { spawnSync } from "node:child_process";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const mode = process.argv[2] ?? "stop";

function run(cmd, args) {
  spawnSync(cmd, args, { cwd: root, stdio: "inherit", env: process.env });
}

switch (mode) {
  case "stop":
    run("docker", ["compose", "down"]);
    break;
  case "restart":
    run("docker", ["compose", "down"]);
    run("node", ["scripts/run-with-env.mjs", "node", "scripts/dev-setup.mjs"]);
    break;
  case "storage":
    run("docker", ["compose", "stop", "minio"]);
    run("docker", ["compose", "rm", "-f", "minio"]);
    run("docker", ["compose", "up", "-d", "minio"]);
    run("node", ["scripts/wait-for-minio.mjs"]);
    run("node", ["scripts/run-with-env.mjs", "node", "scripts/init-minio-bucket.mjs"]);
    break;
  case "full":
    run("docker", ["compose", "down", "-v"]);
    run("node", ["scripts/run-with-env.mjs", "node", "scripts/dev-setup.mjs"]);
    run("node", ["scripts/run-with-env.mjs", "node", "scripts/dev-seed.mjs"]);
    break;
  default:
    console.error("Usage: dev-reset.mjs [stop|restart|storage|full]");
    process.exit(1);
}

console.log(JSON.stringify({ reset: mode, ok: true }));
