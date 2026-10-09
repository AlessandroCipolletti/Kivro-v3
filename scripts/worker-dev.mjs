#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");

spawnSync("pnpm", ["--filter", "@kivro/worker", "run", "build"], {
  cwd: root,
  stdio: "inherit",
  env: {
    ...process.env,
    KIVRO_EXECUTION_MODE: process.env.KIVRO_EXECUTION_MODE ?? "sandbox-fixture",
  },
});

const autoPair = spawnSync("node", ["scripts/run-with-env.mjs", "node", "scripts/dev-worker-auto-pair.mjs"], {
  cwd: root,
  stdio: "inherit",
  env: process.env,
});
if (autoPair.status !== 0) {
  process.exit(autoPair.status ?? 1);
}

const res = spawnSync("node", ["apps/worker/dist/cli.js", "start"], {
  cwd: root,
  stdio: "inherit",
  env: process.env,
});
process.exit(res.status ?? 1);
